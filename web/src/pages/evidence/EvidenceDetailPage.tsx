import { useParams } from 'react-router-dom';

import { PageHeader } from '../../components/PageHeader';
import { useEvidenceDetailQuery } from './queries';

export function EvidenceDetailPage(): JSX.Element {
  const { evidenceId = '' } = useParams();
  const evidenceDetailQuery = useEvidenceDetailQuery(evidenceId);

  if (evidenceDetailQuery.isLoading) return <p>Loading evidence detail...</p>;
  if (evidenceDetailQuery.isError || !evidenceDetailQuery.data) return <p>Evidence detail could not be loaded.</p>;

  const detail = evidenceDetailQuery.data;

  return (
    <main>
      <PageHeader title={`Evidence ${detail.evidenceId}`} subtitle='Evidence detail view.' />
      <p><strong>Raw excerpt:</strong> {detail.rawExcerpt}</p>
      <p>
        <strong>Source URL:</strong>{' '}
        <a href={detail.sourceUrl} target='_blank' rel='noreferrer'>
          {detail.sourceUrl}
        </a>
      </p>
      <p><strong>Source type:</strong> {detail.sourceType}</p>
      <p><strong>Claim type:</strong> {detail.claimType}</p>
      <p><strong>Extraction confidence:</strong> {detail.extractionConfidence}</p>
      <p><strong>Run ID:</strong> {detail.runId}</p>
    </main>
  );
}
