import { describe, expect, it } from 'vitest';

import { VendorService } from '../src/services/vendor.service.js';

describe('VendorService filtering and sorting', () => {
  it('filters by category and escalation and sorts by score desc', async () => {
    const service = new VendorService();

    const response = await service.listVendors({
      category: 'framework',
      openEscalation: true,
      sortBy: 'overallScore',
      sortOrder: 'desc',
    });

    expect(response.total).toBe(1);
    expect(response.items[0]?.vendorName).toBe('Beta Stack');
  });

  it('supports pagination shape', async () => {
    const service = new VendorService();

    const pageOne = await service.listVendors({ page: 1, pageSize: 2, sortBy: 'vendorName', sortOrder: 'asc' });
    const pageTwo = await service.listVendors({ page: 2, pageSize: 2, sortBy: 'vendorName', sortOrder: 'asc' });

    expect(pageOne.items).toHaveLength(2);
    expect(pageTwo.items).toHaveLength(2);
    expect(pageOne.items[0]?.vendorId).not.toBe(pageTwo.items[0]?.vendorId);
  });
});
