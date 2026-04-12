import { describe, expect, it } from 'vitest';

import { executeMutationWithRequiredAudit, createAuditWriteHelper } from '../src/middleware/audit-write.js';
import { InMemoryAuditRepository } from '../src/repositories/audit.repository.js';
import { AuditService } from '../src/services/audit.service.js';

describe('audit write success behavior', () => {
  it('writes audit record for mutation through helper', async () => {
    const repository = new InMemoryAuditRepository();
    const service = new AuditService(repository);
    const helper = createAuditWriteHelper(service);

    const result = await executeMutationWithRequiredAudit({
      performMutation: async () => ({ reportId: 'report-2026-04-11-daily', status: 'approved' }),
      buildAuditWriteRequest: (mutationResult) => ({
        actionType: 'report_approved',
        targetType: 'report',
        targetId: mutationResult.reportId,
        actorId: 'user-123',
        actorType: 'human',
        reason: 'Governance review complete.',
        beforeState: { status: 'in_review' },
        afterState: { status: mutationResult.status },
        relatedRunId: 'run-2026-04-11-001',
        relatedReportId: mutationResult.reportId,
      }),
      auditWriteHelper: helper,
    });

    expect(result).toMatchObject({ reportId: 'report-2026-04-11-daily', status: 'approved' });

    const events = await repository.listAuditEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      actionType: 'report_approved',
      targetType: 'report',
      targetId: 'report-2026-04-11-daily',
      actorId: 'user-123',
      relatedRunId: 'run-2026-04-11-001',
    });
  });
});
