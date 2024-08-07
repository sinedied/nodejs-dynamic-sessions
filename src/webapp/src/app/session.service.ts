import { Injectable, signal } from '@angular/core';

const api = 'http://localhost:7071/api';

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

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  sessionId = signal<string>('');
  files = signal<RemoteFile[]>([]);

  async createNewSession(): Promise<string> {
    const sessionId = uuidv4();
    await this.fetchJson(`${api}/sessions/${sessionId}`, {
      method: 'POST',
      body: JSON.stringify({ code: 'true' }),
    });
    this.sessionId.set(sessionId);
    return sessionId;
  }

  async runCode(code: string): Promise<RunOutput> {
    return this.fetchJson(`${api}/sessions/${this.sessionId()}`, {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  async npmInstall(packageName: string): Promise<RunOutput> {
    return this.fetchJson(`${api}/sessions/${this.sessionId()}`, {
      method: 'POST',
      body: JSON.stringify({ code: `require("child_process").execSync("npm install --no-save ${packageName}").toString()` }),
    });
  }

  async uploadFile(name: string, data: Blob): Promise<RemoteFile> {
    const formData = new FormData();
    formData.append('file', data, name);
    const file = await this.fetchJson(`${api}/sessions/${this.sessionId()}/files`, {
      method: 'POST',
      body: formData,
    });
    this.files.set([...this.files(), file]);
    return file;
  }

  async downloadFile(name: string): Promise<string> {
    const result = await fetch(`${api}/sessions/${this.sessionId()}/files/${name}`);
    if (!result.ok) {
      throw new Error(`Failed to call API: ${result.statusText}`);
    }
    return result.text();
  }

  async listFiles(): Promise<RemoteFile[]> {
    const files = await this.fetchJson(`${api}/sessions/${this.sessionId()}/files`);
    this.files.set(files);
    return files;
  }

  private async fetchJson(url: string, options?: RequestInit) {
    const result = await fetch(url, options);
    if (!result.ok) {
      throw new Error(`Failed to call API: ${result.statusText}`);
    }
    return result.json();
  }
}

function uuidv4() {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
    (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
  );
}
