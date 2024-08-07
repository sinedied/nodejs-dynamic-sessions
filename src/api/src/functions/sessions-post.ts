import { HttpRequest, HttpResponseInit, InvocationContext, app } from '@azure/functions';
import { SessionsNode } from '../sessions';

export interface SessionsRequest {
  code: string;
}

async function postSessions(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const { sessionId } = await request.params;
  const { code } = (await request.json()) as SessionsRequest;

  context.log(`Running code in session ${sessionId ?? '[new]'}`);

  try {
    const session = new SessionsNode({ sessionId });
    const output = await session.runCode(code);

    return {
      jsonBody: { sessionId: session.sessionId, ...output },
    };
  } catch (_error: unknown) {
    const error = _error as Error;
    context.error(`Error when processing files-get request: ${error.message}`);

    return {
      status: 500,
      jsonBody: { error: 'Service temporarily unavailable. Please try again later.' },
    };
  }
}

app.http('sessions-post', {
  route: 'sessions/{sessionId?}',
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: postSessions,
});
