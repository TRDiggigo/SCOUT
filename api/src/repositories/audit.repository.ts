import { randomUUID } from 'node:crypto';

export interface AuditWriteRequestDto {
  actionType: string;
  targetType: string;
  targetId: string;
  actorId: string;
  actorType: string;
  reason: string | null;
  beforeState: Record<string, unknown> | null;
  afterState: Record<string, unknown> | null;
  relatedRunId: string | null;
  relatedReportId: string | null;
}

export interface AuditEventRecordDto {
  auditEventId: string;
  eventTime: string;
  actionType: string;
  targetType: string;
  targetId: string;
  actorId: string;
  actorType: string;
  reason: string | null;
  beforeState: Record<string, unknown> | null;
  afterState: Record<string, unknown> | null;
  relatedRunId: string | null;
  relatedReportId: string | null;
}

export interface AuditRepository {
  writeAuditEvent(request: AuditWriteRequestDto): Promise<AuditEventRecordDto>;
  listAuditEvents(): Promise<AuditEventRecordDto[]>;
}

interface InMemoryAuditRepositoryOptions {
  simulateWriteFailure?: boolean;
}

/**
 * WP-04.1: explicit in-memory stub persistence until stable audit storage contracts are integrated.
 */
export class InMemoryAuditRepository implements AuditRepository {
  private readonly events: AuditEventRecordDto[] = [];
  private readonly simulateWriteFailure: boolean;

  public constructor(options: InMemoryAuditRepositoryOptions = {}) {
    this.simulateWriteFailure = options.simulateWriteFailure ?? false;
  }

  public async writeAuditEvent(request: AuditWriteRequestDto): Promise<AuditEventRecordDto> {
    if (this.simulateWriteFailure) {
      throw new Error('Audit repository write failed.');
    }

    const event: AuditEventRecordDto = {
      auditEventId: randomUUID(),
      eventTime: new Date().toISOString(),
      actionType: request.actionType,
      targetType: request.targetType,
      targetId: request.targetId,
      actorId: request.actorId,
      actorType: request.actorType,
      reason: request.reason,
      beforeState: request.beforeState,
      afterState: request.afterState,
      relatedRunId: request.relatedRunId,
      relatedReportId: request.relatedReportId,
    };

    this.events.push(event);
    return event;
  }

  public async listAuditEvents(): Promise<AuditEventRecordDto[]> {
    return [...this.events];
  }
}
