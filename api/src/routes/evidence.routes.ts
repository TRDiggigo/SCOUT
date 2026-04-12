import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

import { EvidenceService, type EvidenceListQueryDto } from '../services/evidence.service.js';
import { ApiError } from '../util/response.js';

const evidenceListQuerySchema = z.object({
  vendor: z.string().min(1).optional(),
  claimType: z.enum(['security', 'governance', 'compliance', 'integration', 'pricing']).optional(),
});

interface EvidenceListRequestQuery {
  vendor?: EvidenceListQueryDto['vendor'];
  claimType?: EvidenceListQueryDto['claimType'];
}

interface EvidenceDetailRequestParams {
  evidenceId: string;
}

export async function registerEvidenceRoutes(app: FastifyInstance): Promise<void> {
  const evidenceService = new EvidenceService();

  app.get<{ Querystring: EvidenceListRequestQuery }>('/evidence', async (request) => {
    const parsedQuery = evidenceListQuerySchema.safeParse(request.query);

    if (!parsedQuery.success) {
      throw new ApiError({
        code: 'validation_error',
        message: parsedQuery.error.issues[0]?.message ?? 'Invalid evidence list query.',
        statusCode: 400,
      });
    }

    return evidenceService.listEvidence(parsedQuery.data);
  });

  app.get<{ Params: EvidenceDetailRequestParams }>('/evidence/:evidenceId', async (request) => {
    const detail = await evidenceService.getEvidenceById(request.params.evidenceId);

    if (!detail) {
      throw new ApiError({
        code: 'not_found',
        message: 'Evidence detail not found.',
        statusCode: 404,
      });
    }

    return detail;
  });
}
