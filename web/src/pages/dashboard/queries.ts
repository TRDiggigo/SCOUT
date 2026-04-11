import { useQuery } from '@tanstack/react-query';

import { fetchDashboardSummary } from './api';
import type { DashboardResponseDto } from './types';

export function useDashboardQuery() {
  return useQuery<DashboardResponseDto>({
    queryKey: ['dashboard'],
    queryFn: fetchDashboardSummary,
  });
}
