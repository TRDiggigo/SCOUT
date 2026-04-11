export interface RunHeadlineDto {
  runId: string;
  runDate: string;
  status: 'planned' | 'running' | 'success' | 'partial_success' | 'failed';
}

export interface DashboardResponseDto {
  latestRun: RunHeadlineDto | null;
  activeVendorCount: number;
  staleVendorCount: number;
  failedVendorCount: number;
  escalationCountOpen: number;
  avgMarketMaturity: number;
  avgIntegration: number;
  avgGovernance: number;
  budgetUsedUsd: number;
  budgetLimitUsd: number;
}

/**
 * WP-02.1: typed stub response until read-model/pipeline contracts are integrated.
 */
export class DashboardService {
  public async getDashboardSummary(): Promise<DashboardResponseDto> {
    return {
      latestRun: {
        runId: 'run-2026-04-11-001',
        runDate: '2026-04-11',
        status: 'success',
      },
      activeVendorCount: 42,
      staleVendorCount: 3,
      failedVendorCount: 1,
      escalationCountOpen: 2,
      avgMarketMaturity: 74,
      avgIntegration: 69,
      avgGovernance: 77,
      budgetUsedUsd: 123.45,
      budgetLimitUsd: 500,
    };
  }
}
