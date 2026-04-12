import { describe, expect, it } from 'vitest';

import { ApiError } from '../src/util/response.js';
import { executeMutationWithRequiredAudit, createAuditWriteHelper } from '../src/middleware/audit-write.js';
import { InMemoryAuditRepository } from '../src/repositories/audit.repository.js';
import { AuditService } from '../src/services/audit.service.js';

describe('audit write failure behavior', () => {
  it('fails mutation flow when required audit write fails', async () => {
    const repository = new InMemoryAuditRepository({ simulateWriteFailure: true });
    const service = new AuditService(repository);
    const helper = createAuditWriteHelper(service);

    await expect(
      executeMutationWithRequiredAudit({
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
      }),
    ).rejects.toBeInstanceOf(ApiError);

    await expect(
      executeMutationWithRequiredAudit({
        performMutation: async () => ({ reportId: 'report-2026-04-11-daily', status: 'approved' }),
        buildAuditWriteRequest: () => ({
          actionType: 'report_approved',
          targetType: 'report',
          targetId: 'report-2026-04-11-daily',
          actorId: 'user-123',
          actorType: 'human',
          reason: 'Governance review complete.',
          beforeState: { status: 'in_review' },
          afterState: { status: 'approved' },
          relatedRunId: 'run-2026-04-11-001',
          relatedReportId: 'report-2026-04-11-daily',
        }),
        auditWriteHelper: helper,
      }),
    ).rejects.toMatchObject({ code: 'internal_error' });
  });
});
