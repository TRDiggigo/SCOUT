import { useQuery } from '@tanstack/react-query';

import { fetchVendorDetail, fetchVendorList } from './api';
import type { VendorDetailDto, VendorListQueryState, VendorListResponseDto } from './types';

export function useVendorListQuery(query: VendorListQueryState) {
  return useQuery<VendorListResponseDto>({
    queryKey: ['vendors', query],
    queryFn: () => fetchVendorList(query),
  });
}

export function useVendorDetailQuery(vendorId: string) {
  return useQuery<VendorDetailDto>({
    queryKey: ['vendor', vendorId],
    queryFn: () => fetchVendorDetail(vendorId),
  });
}
