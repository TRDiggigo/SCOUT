import type { EvidenceDetailDto, EvidenceListQueryState, EvidenceListResponseDto } from './types';

function toSearchParams(query: EvidenceListQueryState): URLSearchParams {
  const params = new URLSearchParams();

  if (query.vendor) params.set('vendor', query.vendor);
  if (query.claimType) params.set('claimType', query.claimType);

  return params;
}

export async function fetchEvidenceList(query: EvidenceListQueryState): Promise<EvidenceListResponseDto> {
  const response = await fetch(`/api/v1/evidence?${toSearchParams(query).toString()}`);

  if (!response.ok) throw new Error('Evidence list request failed.');

  return (await response.json()) as EvidenceListResponseDto;
}

export async function fetchEvidenceDetail(evidenceId: string): Promise<EvidenceDetailDto> {
  const response = await fetch(`/api/v1/evidence/${evidenceId}`);

  if (response.status === 404) throw new Error('not_found');
  if (!response.ok) throw new Error('Evidence detail request failed.');

  return (await response.json()) as EvidenceDetailDto;
}
