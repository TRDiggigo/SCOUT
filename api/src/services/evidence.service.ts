export type EvidenceSourceType = 'vendor_docs' | 'regulatory_filing' | 'news' | 'analyst_note';
export type EvidenceClaimType = 'security' | 'governance' | 'compliance' | 'integration' | 'pricing';

export interface EvidenceListItemDto {
  evidenceId: string;
  vendorId: string;
  vendorName: string;
  claimType: EvidenceClaimType;
  sourceType: EvidenceSourceType;
  sourceUrl: string;
  rawExcerpt: string;
  extractionConfidence: number;
  runId: string;
}

export interface EvidenceDetailDto extends EvidenceListItemDto {
  capturedAt: string;
  language: string;
}

export interface EvidenceListQueryDto {
  vendor?: string;
  claimType?: EvidenceClaimType;
}

export interface EvidenceListResponseDto {
  items: EvidenceListItemDto[];
  total: number;
}

const STUB_EVIDENCE: EvidenceDetailDto[] = [
  {
    evidenceId: 'evidence-001',
    vendorId: 'vendor-001',
    vendorName: 'Alpha AI',
    claimType: 'security',
    sourceType: 'vendor_docs',
    sourceUrl: 'https://alpha.example.com/trust/security',
    rawExcerpt: 'Audit logs are retained for 365 days and support immutable exports.',
    extractionConfidence: 92,
    runId: 'run-2026-04-11-001',
    capturedAt: '2026-04-11T08:15:00.000Z',
    language: 'en',
  },
  {
    evidenceId: 'evidence-002',
    vendorId: 'vendor-002',
    vendorName: 'Beta Stack',
    claimType: 'pricing',
    sourceType: 'news',
    sourceUrl: 'https://news.example.com/beta-stack-pricing-update',
    rawExcerpt: 'Beta Stack introduced a revised enterprise pricing tier for EU subsidiaries.',
    extractionConfidence: 78,
    runId: 'run-2026-04-11-001',
    capturedAt: '2026-04-11T09:40:00.000Z',
    language: 'en',
  },
  {
    evidenceId: 'evidence-003',
    vendorId: 'vendor-001',
    vendorName: 'Alpha AI',
    claimType: 'compliance',
    sourceType: 'regulatory_filing',
    sourceUrl: 'https://filings.example.eu/alpha-ai-annual-compliance',
    rawExcerpt: 'The annual filing confirms an updated ISO 27001 scope covering AI operations.',
    extractionConfidence: 88,
    runId: 'run-2026-04-11-001',
    capturedAt: '2026-04-11T10:05:00.000Z',
    language: 'en',
  },
];

export class EvidenceService {
  public async listEvidence(query: EvidenceListQueryDto): Promise<EvidenceListResponseDto> {
    let items = [...STUB_EVIDENCE];

    if (query.vendor) {
      const normalizedVendor = query.vendor.toLowerCase();
      items = items.filter((item) => item.vendorId === query.vendor || item.vendorName.toLowerCase().includes(normalizedVendor));
    }

    if (query.claimType) {
      items = items.filter((item) => item.claimType === query.claimType);
    }

    return {
      items: items.map(({ capturedAt: _capturedAt, language: _language, ...listItem }) => listItem),
      total: items.length,
    };
  }

  public async getEvidenceById(evidenceId: string): Promise<EvidenceDetailDto | null> {
    return STUB_EVIDENCE.find((item) => item.evidenceId === evidenceId) ?? null;
  }
}
