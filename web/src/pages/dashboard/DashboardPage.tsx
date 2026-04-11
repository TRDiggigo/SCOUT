import { PageHeader } from '../../components/PageHeader';

import { useDashboardQuery } from './queries';
import type { DashboardResponseDto } from './types';

function isEmptyDashboard(data: DashboardResponseDto): boolean {
  return (
    data.latestRun === null &&
    data.activeVendorCount === 0 &&
    data.staleVendorCount === 0 &&
    data.failedVendorCount === 0 &&
    data.escalationCountOpen === 0
  );
}

export function DashboardPage(): JSX.Element {
  const dashboardQuery = useDashboardQuery();

  if (dashboardQuery.isLoading) {
    return <p>Loading dashboard...</p>;
  }

  if (dashboardQuery.isError) {
    return <p>Dashboard could not be loaded.</p>;
  }

  if (!dashboardQuery.data || isEmptyDashboard(dashboardQuery.data)) {
    return <p>No dashboard data available yet.</p>;
  }

  const data = dashboardQuery.data;

  return (
    <main>
      <PageHeader title='Dashboard' subtitle='Operational and analytical overview.' />

      <ul>
        <li>Latest run: {data.latestRun ? `${data.latestRun.runId} (${data.latestRun.status})` : 'none'}</li>
        <li>Active vendor count: {data.activeVendorCount}</li>
        <li>Stale vendor count: {data.staleVendorCount}</li>
        <li>Failed vendor count: {data.failedVendorCount}</li>
        <li>Open escalation count: {data.escalationCountOpen}</li>
        <li>Average market maturity: {data.avgMarketMaturity}</li>
        <li>Average integration: {data.avgIntegration}</li>
        <li>Average governance: {data.avgGovernance}</li>
        <li>Budget used (USD): {data.budgetUsedUsd}</li>
        <li>Budget limit (USD): {data.budgetLimitUsd}</li>
      </ul>
    </main>
  );
}
