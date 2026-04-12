import type { FastifyInstance } from 'fastify';

import { DashboardService } from '../services/dashboard.service.js';

export async function registerDashboardRoutes(app: FastifyInstance): Promise<void> {
  const dashboardService = new DashboardService();

  app.get('/dashboard', async () => {
    return dashboardService.getDashboardSummary();
  });
}
