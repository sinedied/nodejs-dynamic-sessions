import { HttpRequest, HttpResponseInit, InvocationContext, app } from '@azure/functions';
import { SessionsNode } from '../sessions';

async function postFiles(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const { sessionId } = request.params;

  context.log(`Uploading file in session ${sessionId}`);

  try {
    const parsedForm = await request.formData();

    if (!parsedForm.has('file')) {
      return {
        status: 400,
        jsonBody: { error: '"file" field not found in form data.' },
      };
    }

    const file = parsedForm.get('file') as File;
    const filename = file.name;

    const session = new SessionsNode({ sessionId });
    const result = await session.uploadFile(filename, file);

    return { jsonBody: result };
  } catch (_error: unknown) {
    const error = _error as Error;
    context.error(`Error when processing files-post request: ${error.message}`);

    return {
      status: 500,
      jsonBody: { error: 'Service temporarily unavailable. Please try again later.' },
    };
  }
}

app.http('files-post', {
  route: 'sessions/{sessionId}/files',
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: postFiles,
});
