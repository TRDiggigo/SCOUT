import type { VendorListQueryState, VendorListResponseDto } from './types';

function toSearchParams(query: VendorListQueryState): URLSearchParams {
  const params = new URLSearchParams();

  if (query.category) params.set('category', query.category);
  if (query.trackingStatus) params.set('trackingStatus', query.trackingStatus);
  if (query.freshnessStatus) params.set('freshnessStatus', query.freshnessStatus);
  if (query.openEscalation) params.set('openEscalation', query.openEscalation);

  params.set('sortBy', query.sortBy);
  params.set('sortOrder', query.sortOrder);
  params.set('page', String(query.page));
  params.set('pageSize', String(query.pageSize));

  return params;
}

export async function fetchVendorList(query: VendorListQueryState): Promise<VendorListResponseDto> {
  const searchParams = toSearchParams(query);
  const response = await fetch(`/api/v1/vendors?${searchParams.toString()}`);

  if (!response.ok) {
    throw new Error('Vendor list request failed.');
  }

  return (await response.json()) as VendorListResponseDto;
}
