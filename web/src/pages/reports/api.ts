import type { ReportDetailDto, ReportListResponseDto } from './types';

export async function fetchReportList(): Promise<ReportListResponseDto> {
  const response = await fetch('/api/v1/reports');

  if (!response.ok) throw new Error('Report list request failed.');

  return (await response.json()) as ReportListResponseDto;
}

export async function fetchReportDetail(reportId: string): Promise<ReportDetailDto> {
  const response = await fetch(`/api/v1/reports/${reportId}`);

  if (response.status === 404) throw new Error('not_found');
  if (!response.ok) throw new Error('Report detail request failed.');

  return (await response.json()) as ReportDetailDto;
}
