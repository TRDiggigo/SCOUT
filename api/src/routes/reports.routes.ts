import type { FastifyInstance } from 'fastify';

import { ReportService } from '../services/report.service.js';
import { ApiError } from '../util/response.js';

interface ReportDetailRequestParams {
  reportId: string;
}

export async function registerReportRoutes(app: FastifyInstance): Promise<void> {
  const reportService = new ReportService();

  app.get('/reports', async () => reportService.listReports());

  app.get<{ Params: ReportDetailRequestParams }>('/reports/:reportId', async (request) => {
    const detail = await reportService.getReportById(request.params.reportId);

    if (!detail) {
      throw new ApiError({
        code: 'not_found',
        message: 'Report detail not found.',
        statusCode: 404,
      });
    }

    return detail;
  });
}
