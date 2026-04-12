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

const STUB_REPORTS: ReportDetailDto[] = [
  {
    reportId: 'report-001',
    vendorId: 'vendor-001',
    vendorName: 'Alpha AI',
    summary: 'Quarterly governance posture improved with broader control evidence.',
    keyMovements: [
      'Governance score increased from 76 to 80.',
      'Two integration claims were revalidated with public documentation.',
    ],
    governanceAlerts: ['No critical governance alerts for this period.'],
    linkedReferences: ['evidence-001', 'evidence-003'],
    status: 'published',
    version: 'v1.2',
    reportingPeriod: '2026-Q1',
    sourceRun: 'run-2026-04-11-001',
  },
  {
    reportId: 'report-002',
    vendorId: 'vendor-002',
    vendorName: 'Beta Stack',
    summary: 'Commercial model changed; governance confidence remains moderate.',
    keyMovements: ['Pricing model changed for enterprise contracts.', 'Freshness status changed from fresh to stale.'],
    governanceAlerts: ['Manual review requested for legal basis of data residency claim.'],
    linkedReferences: ['evidence-002'],
    status: 'draft',
    version: 'v0.9',
    reportingPeriod: '2026-Q1',
    sourceRun: 'run-2026-04-11-001',
  },
];

export class ReportService {
  public async listReports(): Promise<ReportListResponseDto> {
    return {
      items: STUB_REPORTS.map(({ keyMovements: _keyMovements, governanceAlerts: _governanceAlerts, linkedReferences: _linkedReferences, ...listItem }) => listItem),
      total: STUB_REPORTS.length,
    };
  }

  public async getReportById(reportId: string): Promise<ReportDetailDto | null> {
    return STUB_REPORTS.find((report) => report.reportId === reportId) ?? null;
  }
}
