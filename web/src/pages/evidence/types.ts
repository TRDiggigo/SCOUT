export type EvidenceClaimType = 'security' | 'governance' | 'compliance' | 'integration' | 'pricing';

export interface EvidenceListItemDto {
  evidenceId: string;
  vendorId: string;
  vendorName: string;
  claimType: EvidenceClaimType;
  sourceType: 'vendor_docs' | 'regulatory_filing' | 'news' | 'analyst_note';
  sourceUrl: string;
  rawExcerpt: string;
  extractionConfidence: number;
  runId: string;
}

export interface EvidenceDetailDto extends EvidenceListItemDto {
  capturedAt: string;
  language: string;
}

export interface EvidenceListResponseDto {
  items: EvidenceListItemDto[];
  total: number;
}

export interface EvidenceListQueryState {
  vendor: string;
  claimType: '' | EvidenceClaimType;
}
