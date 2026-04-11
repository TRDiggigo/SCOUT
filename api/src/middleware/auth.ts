import type { FastifyReply, FastifyRequest } from 'fastify';

import { verifyEntraJwtPlaceholder, type AuthUserContext } from '../auth/entra-jwt.js';
import { mapClaimsToInternalRoles } from '../auth/role-mapper.js';
import { ApiError } from '../util/response.js';

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthUserContext;
  }
}

export interface AuthMiddlewareOptions {
  mode: 'mock' | 'entra-placeholder';
}

function getBearerToken(authorizationHeader: string | undefined): string | null {
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    return null;
  }

  return token;
}

function buildMockUser(request: FastifyRequest): AuthUserContext {
  const userIdHeader = request.headers['x-mock-user-id'];
  const rolesHeader = request.headers['x-mock-roles'];

  const userId = typeof userIdHeader === 'string' ? userIdHeader : 'mock-user';
  const roleList = typeof rolesHeader === 'string' ? rolesHeader.split(',').map((item) => item.trim()) : [];

  return {
    userId,
    roles: mapClaimsToInternalRoles({ roles: roleList }),
    authProvider: 'mock',
  };
}

export function authenticateRequest(options: AuthMiddlewareOptions) {
  return async function authPreHandler(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
    const token = getBearerToken(request.headers.authorization);
    if (!token) {
      throw new ApiError({
        code: 'auth_error',
        message: 'Missing bearer token.',
        statusCode: 401,
      });
    }

    if (options.mode === 'mock') {
      request.user = buildMockUser(request);
      return;
    }

    try {
      request.user = verifyEntraJwtPlaceholder(token);
    } catch {
      throw new ApiError({
        code: 'auth_error',
        message: 'Token verification failed.',
        statusCode: 401,
      });
    }
  };
}
