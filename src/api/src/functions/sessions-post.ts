import process from 'node:process';
import fs from 'node:fs/promises';
import { join } from 'node:path';
import { HttpRequest, HttpResponseInit, InvocationContext, app } from '@azure/functions';
import 'dotenv/config';
import { getCredentials } from '../security.js';

async function postSessions(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const storageUrl = process.env.AZURE_STORAGE_URL;
  const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;
  const { fileName } = request.params;

  return {
    jsonBody: {
      message: 'Hello from the API',
    }
  }
}

app.http('sessions-post', {
  route: 'sessions',
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: postSessions,
});
