import { connectLambda } from '@netlify/blobs';
import serverless from 'serverless-http';
import { app } from '../../server/app.ts';

const expressHandler = serverless(app, {
  binary: ['image/*', 'application/octet-stream'],
});

export const handler = async (
  event: Parameters<typeof connectLambda>[0],
  context: unknown
) => {
  process.env.USE_NETLIFY_BLOBS = '1';
  connectLambda(event);
  return expressHandler(event as never, context as never);
};
