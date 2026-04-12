import { type AuditEventRecordDto, type AuditRepository, type AuditWriteRequestDto, InMemoryAuditRepository } from '../repositories/audit.repository.js';

/**
 * WP-04.1: service layer wrapper for audit writes; repositories stay persistence-focused.
 */
export class AuditService {
  private readonly repository: AuditRepository;

  public constructor(repository: AuditRepository = new InMemoryAuditRepository()) {
    this.repository = repository;
  }

  public async writeAuditEvent(request: AuditWriteRequestDto): Promise<AuditEventRecordDto> {
    return this.repository.writeAuditEvent(request);
  }

  public async listAuditEvents(): Promise<AuditEventRecordDto[]> {
    return this.repository.listAuditEvents();
  }
}
