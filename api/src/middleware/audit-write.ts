import { ApiError } from '../util/response.js';
import { type AuditEventRecordDto, type AuditWriteRequestDto } from '../repositories/audit.repository.js';
import { AuditService } from '../services/audit.service.js';

export interface AuditWriteHelper {
  writeRequiredAuditEvent(request: AuditWriteRequestDto): Promise<AuditEventRecordDto>;
}

export function createAuditWriteHelper(auditService: AuditService): AuditWriteHelper {
  return {
    async writeRequiredAuditEvent(request: AuditWriteRequestDto): Promise<AuditEventRecordDto> {
      try {
        return await auditService.writeAuditEvent(request);
      } catch (error) {
        throw new ApiError({
          code: 'internal_error',
          message: 'Required audit write failed.',
          statusCode: 500,
          details: {
            cause: error instanceof Error ? error.message : 'unknown',
          },
        });
      }
    },
  };
}

export async function executeMutationWithRequiredAudit<TMutationResult>(params: {
  performMutation: () => Promise<TMutationResult>;
  buildAuditWriteRequest: (result: TMutationResult) => AuditWriteRequestDto;
  auditWriteHelper: AuditWriteHelper;
}): Promise<TMutationResult> {
  const result = await params.performMutation();
  const auditRequest = params.buildAuditWriteRequest(result);

  await params.auditWriteHelper.writeRequiredAuditEvent(auditRequest);

  return result;
}
