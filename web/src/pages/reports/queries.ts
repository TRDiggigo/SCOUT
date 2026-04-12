import { useQuery } from '@tanstack/react-query';

import { fetchReportDetail, fetchReportList } from './api';
import type { ReportDetailDto, ReportListResponseDto } from './types';

export function useReportListQuery() {
  return useQuery<ReportListResponseDto>({
    queryKey: ['reports'],
    queryFn: fetchReportList,
  });
}

export function useReportDetailQuery(reportId: string) {
  return useQuery<ReportDetailDto>({
    queryKey: ['report', reportId],
    queryFn: () => fetchReportDetail(reportId),
  });
}
