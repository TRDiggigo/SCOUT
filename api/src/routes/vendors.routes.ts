import type { FastifyInstance } from 'fastify';

import { VendorService, type VendorListQueryDto } from '../services/vendor.service.js';
import { ApiError } from '../util/response.js';

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

interface VendorDetailRequestParams {
  vendorId: string;
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

  app.get<{ Params: VendorDetailRequestParams }>('/vendors/:vendorId', async (request) => {
    const detail = await vendorService.getVendorById(request.params.vendorId);

    if (!detail) {
      throw new ApiError({
        code: 'not_found',
        message: 'Vendor detail not found.',
        statusCode: 404,
      });
    }

    return detail;
  });
}
