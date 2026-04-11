import type { FastifyReply, FastifyRequest } from 'fastify';

import type { InternalRole } from '../auth/role-mapper.js';
import { ApiError } from '../util/response.js';

export function requireRoles(...allowedRoles: InternalRole[]) {
  return async function roleGuardPreHandler(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
    const user = request.user;

    if (!user) {
      throw new ApiError({
        code: 'auth_error',
        message: 'Authentication is required.',
        statusCode: 401,
      });
    }

    const hasAccess = user.roles.some((role) => allowedRoles.includes(role));
    if (!hasAccess) {
      throw new ApiError({
        code: 'forbidden_error',
        message: 'Insufficient role permissions.',
        statusCode: 403,
      });
    }
  };
}
