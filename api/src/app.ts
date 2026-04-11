import Fastify, { type FastifyInstance } from 'fastify';

import { type InternalRole } from './auth/role-mapper.js';
import { registerErrorHandler } from './middleware/error-handler.js';
import { authenticateRequest } from './middleware/auth.js';
import { requireRoles } from './middleware/role-guard.js';

const API_PREFIX = '/api/v1';
const CORRELATION_HEADER = 'x-correlation-id';

const authMode = process.env.AUTH_MODE === 'entra-placeholder' ? 'entra-placeholder' : 'mock';

declare module 'fastify' {
  interface FastifyRequest {
    correlationId: string;
  }
}

export function buildApp(): FastifyInstance {
  const app = Fastify({ logger: false });

  app.decorateRequest('correlationId', '');
  app.decorateRequest('user', null);

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

      versionedRoutes.get(
        '/auth/me',
        {
          preHandler: [authenticateRequest({ mode: authMode })],
        },
        async (request) => ({
          userId: request.user?.userId,
          roles: request.user?.roles ?? [],
          authProvider: request.user?.authProvider,
        }),
      );

      versionedRoutes.get(
        '/auth/admin-probe',
        {
          preHandler: [authenticateRequest({ mode: authMode }), requireRoles('ROLE_ADMIN')],
        },
        async () => ({
          status: 'authorized',
          requiredRole: 'ROLE_ADMIN' satisfies InternalRole,
        }),
      );
    },
    { prefix: API_PREFIX },
  );

  return app;
}

export const app = buildApp();
