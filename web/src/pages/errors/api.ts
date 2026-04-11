import type { ErrorListQueryState, ErrorListResponseDto } from './types';

function toSearchParams(query: ErrorListQueryState): URLSearchParams {
  const params = new URLSearchParams();

  if (query.severity) params.set('severity', query.severity);
  if (query.stage) params.set('stage', query.stage);
  if (query.resolutionStatus) params.set('resolutionStatus', query.resolutionStatus);

  params.set('sortBy', query.sortBy);
  params.set('sortOrder', query.sortOrder);
  params.set('page', String(query.page));
  params.set('pageSize', String(query.pageSize));

  return params;
}

export async function fetchErrorList(query: ErrorListQueryState): Promise<ErrorListResponseDto> {
  const response = await fetch(`/api/v1/errors?${toSearchParams(query).toString()}`, {
    headers: {
      authorization: 'Bearer mock-token',
      'x-mock-roles': 'ROLE_OPERATOR',
    },
  });

  if (!response.ok) {
    throw new Error('Error list request failed.');
  }

  return (await response.json()) as ErrorListResponseDto;
}
