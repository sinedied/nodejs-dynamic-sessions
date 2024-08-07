import { HttpRequest, HttpResponseInit, InvocationContext, app } from '@azure/functions';
import { SessionsNode } from '../sessions';

async function getFiles(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const { sessionId } = request.params;

  context.log(`Listing files in session ${sessionId}`);

  try {
    const session = new SessionsNode({ sessionId });
    const result = await session.listFiles();

    return { jsonBody: result };
  } catch (_error: unknown) {
    const error = _error as Error;
    context.error(`Error when processing files-get request: ${error.message}`);

    return {
      status: 500,
      jsonBody: { error: 'Service temporarily unavailable. Please try again later.' },
    };
  }
}

app.http('files-get', {
  route: 'sessions/{sessionId}/files',
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: getFiles,
});
