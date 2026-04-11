import { useQuery } from '@tanstack/react-query';

import { fetchErrorList } from './api';
import type { ErrorListQueryState, ErrorListResponseDto } from './types';

export function useErrorListQuery(query: ErrorListQueryState) {
  return useQuery<ErrorListResponseDto>({
    queryKey: ['errors', query],
    queryFn: () => fetchErrorList(query),
  });
}
