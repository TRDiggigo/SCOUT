import type { FastifyInstance } from 'fastify';

import { VendorService, type VendorListQueryDto } from '../services/vendor.service.js';

interface VendorListRequestQuery {
  category?: VendorListQueryDto['category'];
  trackingStatus?: VendorListQueryDto['trackingStatus'];
  freshnessStatus?: VendorListQueryDto['freshnessStatus'];
  openEscalation?: string;
  sortBy?: VendorListQueryDto['sortBy'];
  sortOrder?: VendorListQueryDto['sortOrder'];
  page?: string;
  pageSize?: string;
}

function parseBoolean(input: string | undefined): boolean | undefined {
  if (input === undefined) return undefined;
  if (input === 'true') return true;
  if (input === 'false') return false;
  return undefined;
}

export async function registerVendorRoutes(app: FastifyInstance): Promise<void> {
  const vendorService = new VendorService();

  app.get<{ Querystring: VendorListRequestQuery }>('/vendors', async (request) => {
    const query = request.query;

    return vendorService.listVendors({
      category: query.category,
      trackingStatus: query.trackingStatus,
      freshnessStatus: query.freshnessStatus,
      openEscalation: parseBoolean(query.openEscalation),
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      page: query.page ? Number(query.page) : undefined,
      pageSize: query.pageSize ? Number(query.pageSize) : undefined,
    });
  });
}
