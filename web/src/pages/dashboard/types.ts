export interface DashboardRunHeadlineDto {
  runId: string;
  runDate: string;
  status: 'planned' | 'running' | 'success' | 'partial_success' | 'failed';
}

export interface DashboardResponseDto {
  latestRun: DashboardRunHeadlineDto | null;
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
