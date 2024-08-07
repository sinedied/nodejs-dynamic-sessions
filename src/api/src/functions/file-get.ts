import { HttpRequest, HttpResponseInit, InvocationContext, app } from '@azure/functions';
import { SessionsNode } from '../sessions';

async function getFile(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const { sessionId, filename } = request.params;

  context.log(`Getting file "${filename}" in session ${sessionId}`);

  try {
    const session = new SessionsNode({ sessionId });
    const result = await session.downloadFile(filename);

    return { jsonBody: result };
  } catch (_error: unknown) {
    const error = _error as Error;
    context.error(`Error when processing file-get request: ${error.message}`);

    return {
      status: 500,
      jsonBody: { error: 'Service temporarily unavailable. Please try again later.' },
    };
  }
}

app.http('file-get', {
  route: 'sessions/{sessionId}/files/{filename}',
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: getFile,
});
