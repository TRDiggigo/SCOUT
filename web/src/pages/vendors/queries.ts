import { useQuery } from '@tanstack/react-query';

import { fetchVendorList } from './api';
import type { VendorListQueryState, VendorListResponseDto } from './types';

export function useVendorListQuery(query: VendorListQueryState) {
  return useQuery<VendorListResponseDto>({
    queryKey: ['vendors', query],
    queryFn: () => fetchVendorList(query),
  });
}
