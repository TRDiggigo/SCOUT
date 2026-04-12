import { useQuery } from '@tanstack/react-query';

import { fetchRunList } from './api';
import type { RunListQueryState, RunListResponseDto } from './types';

export function useRunListQuery(query: RunListQueryState) {
  return useQuery<RunListResponseDto>({
    queryKey: ['runs', query],
    queryFn: () => fetchRunList(query),
  });
}
