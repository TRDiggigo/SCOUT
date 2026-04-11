import type { FastifyInstance } from 'fastify';

import { RunService, type RunListQueryDto } from '../services/run.service.js';
import { authenticateRequest } from '../middleware/auth.js';
import { requireRoles } from '../middleware/role-guard.js';

interface RunListRequestQuery {
  status?: RunListQueryDto['status'];
  mode?: RunListQueryDto['mode'];
  runDate?: string;
  sortBy?: RunListQueryDto['sortBy'];
  sortOrder?: RunListQueryDto['sortOrder'];
  page?: string;
  pageSize?: string;
}

export async function registerRunRoutes(app: FastifyInstance): Promise<void> {
  const runService = new RunService();
  const authMode = process.env.AUTH_MODE === 'entra-placeholder' ? 'entra-placeholder' : 'mock';

  app.get<{ Querystring: RunListRequestQuery }>(
    '/runs',
    {
      preHandler: [
        authenticateRequest({ mode: authMode }),
        requireRoles('ROLE_OPERATOR', 'ROLE_ADMIN', 'ROLE_GOVERNANCE_OWNER'),
      ],
    },
    async (request) => {
      const query = request.query;

      return runService.listRuns({
        status: query.status,
        mode: query.mode,
        runDate: query.runDate,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
        page: query.page ? Number(query.page) : undefined,
        pageSize: query.pageSize ? Number(query.pageSize) : undefined,
      });
    },
  );
}
