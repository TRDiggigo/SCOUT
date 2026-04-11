import { useParams } from 'react-router-dom';

import { PageHeader } from '../../components/PageHeader';

import { useVendorDetailQuery } from './queries';

export function VendorDetailPage(): JSX.Element {
  const params = useParams<{ vendorId: string }>();
  const vendorId = params.vendorId ?? '';

  const vendorDetailQuery = useVendorDetailQuery(vendorId);

  if (!vendorId) {
    return <p>Vendor id is missing.</p>;
  }

  if (vendorDetailQuery.isLoading) {
    return <p>Loading vendor detail...</p>;
  }

  if (vendorDetailQuery.isError) {
    return <p>Vendor detail could not be loaded.</p>;
  }

  if (!vendorDetailQuery.data) {
    return <p>Vendor detail is empty.</p>;
  }

  const detail = vendorDetailQuery.data;

  return (
    <main>
      <PageHeader title={`Vendor Detail: ${detail.vendorName}`} subtitle='Master data, scoring, governance and provenance.' />

      <section>
        <h2>Master Data</h2>
        <p>vendorId: {detail.vendorId}</p>
        <p>vendorName: {detail.vendorName}</p>
        <p>legalEntityName: {detail.legalEntityName}</p>
        <p>websiteUrl: {detail.websiteUrl}</p>
        <p>headquartersCountry: {detail.headquartersCountry}</p>
        <p>euPresence: {String(detail.euPresence)}</p>
        <p>category: {detail.category}</p>
        <p>shortDescription: {detail.shortDescription}</p>
        <p>trackingStatus: {detail.trackingStatus}</p>
        <p>reviewQueueReason: {detail.reviewQueueReason ?? 'none'}</p>
      </section>

      <section>
        <h2>Scoring</h2>
        <p>marketMaturityScore: {detail.marketMaturityScore}</p>
        <p>integrationScore: {detail.integrationScore}</p>
        <p>governanceScore: {detail.governanceScore}</p>
        <p>overallScore: {detail.overallScore}</p>
        <p>confidence: {detail.confidence}</p>
        <p>confidenceReason: {detail.confidenceReason}</p>
        <p>scoringRubricVersion: {detail.scoringRubricVersion}</p>
        <p>secondOpinionModel: {detail.secondOpinionModel}</p>
        <p>scoreDivergencePct: {detail.scoreDivergencePct}</p>
      </section>

      <section>
        <h2>Freshness / Provenance</h2>
        <p>asOfDate: {detail.asOfDate}</p>
        <p>sourceRunId: {detail.sourceRunId}</p>
        <p>freshnessStatus: {detail.freshnessStatus}</p>
        <p>latestRunId: {detail.latestRunId}</p>
        <p>latestManifestRef: {detail.latestManifestRef}</p>
        <p>snapshotPath: {detail.snapshotPath}</p>
      </section>

      <section>
        <h2>Governance</h2>
        <p>euHostingClaim: {String(detail.euHostingClaim)}</p>
        <p>dataResidencyEu: {detail.dataResidencyEu}</p>
        <p>identityIntegration: {detail.identityIntegration}</p>
        <p>ssoSupport: {String(detail.ssoSupport)}</p>
        <p>auditLoggingClaim: {String(detail.auditLoggingClaim)}</p>
        <p>complianceClaims: {detail.complianceClaims.join(', ')}</p>
        <p>securityDisclosures: {detail.securityDisclosures}</p>
        <p>humanReviewRequired: {String(detail.humanReviewRequired)}</p>
      </section>

      <section>
        <h2>Relations / Summary</h2>
        <p>sourceCount: {detail.sourceCount}</p>
        <p>latestEvidenceCount: {detail.latestEvidenceCount}</p>
        <p>primarySources: {detail.primarySources.join(', ')}</p>
        <p>sourceQualityFlag: {detail.sourceQualityFlag}</p>
      </section>
    </main>
  );
}
