import { describe, expect, it } from 'vitest';

import { ErrorService } from '../src/services/error.service.js';

describe('ErrorService filtering/sorting', () => {
  it('filters by severity and stage', async () => {
    const service = new ErrorService();

    const response = await service.listErrors({ severity: 'high', stage: 'A2' });

    expect(response.total).toBe(1);
    expect(response.items[0]?.errorId).toBe('err-001');
  });

  it('sorts by firstSeenAt desc by default', async () => {
    const service = new ErrorService();

    const response = await service.listErrors({});

    expect(response.items[0]?.firstSeenAt >= (response.items[1]?.firstSeenAt ?? '')).toBe(true);
  });
});
