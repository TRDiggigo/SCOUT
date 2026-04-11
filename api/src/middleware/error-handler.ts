import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

import { ApiError, buildErrorResponse } from '../util/response.js';
import { logger } from '../util/logger.js';

export function registerErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler((error: Error, request: FastifyRequest, reply: FastifyReply) => {
    const correlationId = request.correlationId;

    if (error instanceof ApiError) {
      reply.code(error.statusCode).send(
        buildErrorResponse({
          code: error.code,
          message: error.message,
          details: error.details,
          correlationId,
        }),
      );
      return;
    }

    if ('validation' in error) {
      reply.code(400).send(
        buildErrorResponse({
          code: 'validation_error',
          message: 'Request validation failed.',
          details: (error as { validation?: unknown }).validation,
          correlationId,
        }),
      );
      return;
    }

    logger.error('Unhandled API error', {
      correlationId,
      errorMessage: error.message,
      errorName: error.name,
    });

    reply.code(500).send(
      buildErrorResponse({
        code: 'internal_error',
        message: 'An unexpected error occurred.',
        correlationId,
      }),
    );
  });
}
