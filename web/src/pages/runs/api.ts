import type { RunListQueryState, RunListResponseDto } from './types';

function toSearchParams(query: RunListQueryState): URLSearchParams {
  const params = new URLSearchParams();

  if (query.status) params.set('status', query.status);
  if (query.mode) params.set('mode', query.mode);
  if (query.runDate) params.set('runDate', query.runDate);

  params.set('sortBy', query.sortBy);
  params.set('sortOrder', query.sortOrder);
  params.set('page', String(query.page));
  params.set('pageSize', String(query.pageSize));

  return params;
}

export async function fetchRunList(query: RunListQueryState): Promise<RunListResponseDto> {
  const response = await fetch(`/api/v1/runs?${toSearchParams(query).toString()}`, {
    headers: {
      authorization: 'Bearer mock-token',
      'x-mock-roles': 'ROLE_OPERATOR',
    },
  });

  if (!response.ok) {
    throw new Error('Run list request failed.');
  }

  return (await response.json()) as RunListResponseDto;
}
