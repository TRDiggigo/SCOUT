export interface StartRunAdapterRequestDto {
  runDate?: string;
  vendors?: string[];
  dryRun: boolean;
  initiatedBy: string;
}

export interface RetryFailedAdapterRequestDto {
  runId: string;
  initiatedBy: string;
}

export interface PipelineRunAdapterResultDto {
  orchestrationRef: string;
  acceptedAt: string;
}

export interface PipelineAdapter {
  startRun(request: StartRunAdapterRequestDto): Promise<PipelineRunAdapterResultDto>;
  retryFailed(request: RetryFailedAdapterRequestDto): Promise<PipelineRunAdapterResultDto>;
}

/**
 * WP-04.4: explicit adapter stub until stable pipeline trigger contracts are finalized.
 * This adapter must remain orchestration-only and must not duplicate CLI/pipeline internals.
 */
export class StubPipelineAdapter implements PipelineAdapter {
  public async startRun(request: StartRunAdapterRequestDto): Promise<PipelineRunAdapterResultDto> {
    const runDate = request.runDate ?? new Date().toISOString().slice(0, 10);

    return {
      orchestrationRef: `stub-start-${runDate}-${request.initiatedBy}`,
      acceptedAt: new Date().toISOString(),
    };
  }

  public async retryFailed(request: RetryFailedAdapterRequestDto): Promise<PipelineRunAdapterResultDto> {
    return {
      orchestrationRef: `stub-retry-${request.runId}-${request.initiatedBy}`,
      acceptedAt: new Date().toISOString(),
    };
  }
}
