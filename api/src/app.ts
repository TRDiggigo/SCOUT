import Fastify, { type FastifyInstance } from 'fastify';

import { registerErrorHandler } from './middleware/error-handler.js';

const API_PREFIX = '/api/v1';
const CORRELATION_HEADER = 'x-correlation-id';

declare module 'fastify' {
  interface FastifyRequest {
    correlationId: string;
  }
}

export function buildApp(): FastifyInstance {
  const app = Fastify({ logger: false });

  app.decorateRequest('correlationId', '');

  app.addHook('onRequest', (request, reply, done) => {
    const correlationId =
      typeof request.headers[CORRELATION_HEADER] === 'string'
        ? request.headers[CORRELATION_HEADER]
        : request.id;

    request.correlationId = correlationId;
    reply.header(CORRELATION_HEADER, correlationId);
    done();
  });

  registerErrorHandler(app);

  app.register(
    async (versionedRoutes) => {
      versionedRoutes.get('/health', async () => ({
        status: 'ok',
      }));
    },
    { prefix: API_PREFIX },
  );

  return app;
}

export const app = buildApp();
