import type { FastifyInstance } from 'fastify';

import { DeltaService, type DeltaListQueryDto } from '../services/delta.service.js';
import { ApiError } from '../util/response.js';

interface DeltaListRequestQuery {
  deltaType?: DeltaListQueryDto['deltaType'];
  impactedDimension?: DeltaListQueryDto['impactedDimension'];
  severity?: DeltaListQueryDto['severity'];
  reviewStatus?: DeltaListQueryDto['reviewStatus'];
  sortBy?: DeltaListQueryDto['sortBy'];
  sortOrder?: DeltaListQueryDto['sortOrder'];
  page?: string;
  pageSize?: string;
}

interface DeltaDetailRequestParams {
  deltaId: string;
}

export async function registerDeltaRoutes(app: FastifyInstance): Promise<void> {
  const deltaService = new DeltaService();

  app.get<{ Querystring: DeltaListRequestQuery }>('/deltas', async (request) => {
    const query = request.query;

    return deltaService.listDeltas({
      deltaType: query.deltaType,
      impactedDimension: query.impactedDimension,
      severity: query.severity,
      reviewStatus: query.reviewStatus,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      page: query.page ? Number(query.page) : undefined,
      pageSize: query.pageSize ? Number(query.pageSize) : undefined,
    });
  });

  app.get<{ Params: DeltaDetailRequestParams }>('/deltas/:deltaId', async (request) => {
    const detail = await deltaService.getDeltaById(request.params.deltaId);

    if (!detail) {
      throw new ApiError({
        code: 'not_found',
        message: 'Delta detail not found.',
        statusCode: 404,
      });
    }

    return detail;
  });
}
