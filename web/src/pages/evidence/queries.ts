import { useQuery } from '@tanstack/react-query';

import { fetchEvidenceDetail, fetchEvidenceList } from './api';
import type { EvidenceDetailDto, EvidenceListQueryState, EvidenceListResponseDto } from './types';

export function useEvidenceListQuery(query: EvidenceListQueryState) {
  return useQuery<EvidenceListResponseDto>({
    queryKey: ['evidence', query],
    queryFn: () => fetchEvidenceList(query),
  });
}

export function useEvidenceDetailQuery(evidenceId: string) {
  return useQuery<EvidenceDetailDto>({
    queryKey: ['evidence', evidenceId],
    queryFn: () => fetchEvidenceDetail(evidenceId),
  });
}
