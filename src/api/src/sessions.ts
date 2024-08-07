import { DefaultAzureCredential, getBearerTokenProvider } from '@azure/identity';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

export interface SessionsNodeParams {
  poolManagementEndpoint: string;
  sessionId?: string;
  azureADTokenProvider?: () => Promise<string>;
}

export interface RemoteFile {
  $id: string;
  filename: string;
  size: number;
  last_modified_time: string;
}

export interface RunOutput {
  result: string;
  stdout: string;
  stderr: string;
}

const azureDynamicSessionsScope = 'https://acasessions.io/.default';
let credentials: DefaultAzureCredential | undefined;

dotenv.config();

export function getCredentials(): DefaultAzureCredential {
  // Use the current user identity to authenticate.
  // No secrets needed, it uses `az login` or `azd auth login` locally,
  // and managed identity when deployed on Azure.
  credentials ||= new DefaultAzureCredential();
  return credentials;
}

export function getAzureTokenProvider() {
  return getBearerTokenProvider(getCredentials(), azureDynamicSessionsScope);
}

export class SessionsNode {
  sessionId: string;
  private poolManagementEndpoint: string;
  private azureADTokenProvider: () => Promise<string>;

  constructor(params?: Partial<SessionsNodeParams>) {
    this.poolManagementEndpoint = params?.poolManagementEndpoint ?? process.env.POOL_MANAGEMENT_ENDPOINT ?? '';

    if (!this.poolManagementEndpoint) {
      throw new Error('poolManagementEndpoint must be defined.');
    }

    this.sessionId = params?.sessionId ?? uuidv4();
    this.azureADTokenProvider = params?.azureADTokenProvider ?? getAzureTokenProvider();
  }

  private buildUrl(path: string): string {
    let url = `${this.poolManagementEndpoint.replace(/\/?$/, '/')}${path}`;
    url += url.includes('?') ? '&' : '?';
    url += `identifier=${encodeURIComponent(this.sessionId)}`;
    url += `&api-version=2024-02-02-preview`;
    return url;
  }

  async runCode(code: string): Promise<RunOutput> {
    const token = await this.azureADTokenProvider();
    const apiUrl = this.buildUrl('code/execute');
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
    const body = JSON.stringify({
      properties: {
        codeInputType: 'inline',
        executionType: 'synchronous',
        code,
      },
    });

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body,
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status} (${await response.text()})`);
    }

    const { properties } = (await response.json()) as any;
    return {
      result: properties.result,
      stdout: properties.stdout,
      stderr: properties.stderr,
    };
  }

  async uploadFile(name: string, data: Blob): Promise<RemoteFile> {
    const token = await this.azureADTokenProvider();
    const apiUrl = this.buildUrl('files/upload');
    const headers = { Authorization: `Bearer ${token}` };
    const formData = new FormData();
    formData.append('file', data, name);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status} (${await response.text()})`);
    }

    const json = (await response.json()) as any;
    return json.value[0].properties as RemoteFile;
  }

  async downloadFile(name: string): Promise<Blob> {
    const token = await this.azureADTokenProvider();
    const apiUrl = this.buildUrl(`files/content/${name}`);
    const headers = { Authorization: `Bearer ${token}` };

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status} (${await response.text()})`);
    }

    return await response.blob();
  }

  async listFiles(): Promise<RemoteFile[]> {
    const token = await this.azureADTokenProvider();
    const apiUrl = this.buildUrl('files');
    const headers = { Authorization: `Bearer ${token}` };

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status} (${await response.text()})`);
    }

    const json = (await response.json()) as any;
    const list = json.value.map((x: { properties: RemoteFile }) => x.properties);
    return list as RemoteFile[];
  }
}
