import { useQuery } from '@tanstack/react-query';

import { fetchDeltaDetail, fetchDeltaList } from './api';
import type { DeltaDetailDto, DeltaListQueryState, DeltaListResponseDto } from './types';

export function useDeltaListQuery(query: DeltaListQueryState) {
  return useQuery<DeltaListResponseDto>({
    queryKey: ['deltas', query],
    queryFn: () => fetchDeltaList(query),
  });
}

export function useDeltaDetailQuery(deltaId: string) {
  return useQuery<DeltaDetailDto>({
    queryKey: ['delta', deltaId],
    queryFn: () => fetchDeltaDetail(deltaId),
  });
}
