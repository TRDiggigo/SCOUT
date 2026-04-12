import type { DeltaDetailDto, DeltaListQueryState, DeltaListResponseDto } from './types';

function toSearchParams(query: DeltaListQueryState): URLSearchParams {
  const params = new URLSearchParams();

  if (query.deltaType) params.set('deltaType', query.deltaType);
  if (query.impactedDimension) params.set('impactedDimension', query.impactedDimension);
  if (query.severity) params.set('severity', query.severity);
  if (query.reviewStatus) params.set('reviewStatus', query.reviewStatus);

  params.set('sortBy', query.sortBy);
  params.set('sortOrder', query.sortOrder);
  params.set('page', String(query.page));
  params.set('pageSize', String(query.pageSize));

  return params;
}

export async function fetchDeltaList(query: DeltaListQueryState): Promise<DeltaListResponseDto> {
  const response = await fetch(`/api/v1/deltas?${toSearchParams(query).toString()}`);

  if (!response.ok) {
    throw new Error('Delta list request failed.');
  }

  return (await response.json()) as DeltaListResponseDto;
}

export async function fetchDeltaDetail(deltaId: string): Promise<DeltaDetailDto> {
  const response = await fetch(`/api/v1/deltas/${deltaId}`);

  if (response.status === 404) throw new Error('not_found');
  if (!response.ok) throw new Error('Delta detail request failed.');

  return (await response.json()) as DeltaDetailDto;
}
