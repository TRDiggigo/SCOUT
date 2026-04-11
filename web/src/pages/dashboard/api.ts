import type { DashboardResponseDto } from './types';

export async function fetchDashboardSummary(): Promise<DashboardResponseDto> {
  const response = await fetch('/api/v1/dashboard');

  if (!response.ok) {
    throw new Error('Dashboard request failed.');
  }

  return (await response.json()) as DashboardResponseDto;
}
