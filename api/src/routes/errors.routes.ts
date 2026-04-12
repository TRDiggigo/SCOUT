import type { FastifyInstance } from 'fastify';

import { authenticateRequest } from '../middleware/auth.js';
import { requireRoles } from '../middleware/role-guard.js';
import { ErrorService, type ErrorListQueryDto } from '../services/error.service.js';

interface ErrorListRequestQuery {
  severity?: ErrorListQueryDto['severity'];
  stage?: ErrorListQueryDto['stage'];
  resolutionStatus?: ErrorListQueryDto['resolutionStatus'];
  sortBy?: ErrorListQueryDto['sortBy'];
  sortOrder?: ErrorListQueryDto['sortOrder'];
  page?: string;
  pageSize?: string;
}

export async function registerErrorRoutes(app: FastifyInstance): Promise<void> {
  const errorService = new ErrorService();
  const authMode = process.env.AUTH_MODE === 'entra-placeholder' ? 'entra-placeholder' : 'mock';

  app.get<{ Querystring: ErrorListRequestQuery }>(
    '/errors',
    {
      preHandler: [
        authenticateRequest({ mode: authMode }),
        requireRoles('ROLE_OPERATOR', 'ROLE_ADMIN', 'ROLE_GOVERNANCE_OWNER'),
      ],
    },
    async (request) => {
      const query = request.query;

      return errorService.listErrors({
        severity: query.severity,
        stage: query.stage,
        resolutionStatus: query.resolutionStatus,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
        page: query.page ? Number(query.page) : undefined,
        pageSize: query.pageSize ? Number(query.pageSize) : undefined,
      });
    },
  );
}
