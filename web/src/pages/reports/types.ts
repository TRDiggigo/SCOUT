export type ReportStatus = 'draft' | 'published' | 'archived';

export interface ReportListItemDto {
  reportId: string;
  vendorId: string;
  vendorName: string;
  summary: string;
  status: ReportStatus;
  version: string;
  reportingPeriod: string;
  sourceRun: string;
}

export interface ReportDetailDto extends ReportListItemDto {
  keyMovements: string[];
  governanceAlerts: string[];
  linkedReferences: string[];
}

export interface ReportListResponseDto {
  items: ReportListItemDto[];
  total: number;
}
