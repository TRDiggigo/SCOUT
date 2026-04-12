import { useParams } from 'react-router-dom';

import { PageHeader } from '../../components/PageHeader';
import { useDeltaDetailQuery } from './queries';

export function DeltaDetailPage(): JSX.Element {
  const params = useParams<{ deltaId: string }>();
  const deltaId = params.deltaId ?? '';

  const deltaDetailQuery = useDeltaDetailQuery(deltaId);

  if (!deltaId) return <p>Delta id is missing.</p>;
  if (deltaDetailQuery.isLoading) return <p>Loading delta detail...</p>;
  if (deltaDetailQuery.isError) return <p>Delta detail could not be loaded.</p>;
  if (!deltaDetailQuery.data) return <p>Delta detail is empty.</p>;

  const detail = deltaDetailQuery.data;

  return (
    <main>
      <PageHeader title={`Delta Detail: ${detail.deltaId}`} subtitle='Change explanation and provenance context.' />
      <section>
        <h2>Summary</h2>
        <p>deltaId: {detail.deltaId}</p>
        <p>deltaSummary: {detail.deltaSummary}</p>
        <p>rationale: {detail.rationale}</p>
      </section>
      <section>
        <h2>Evidence / Reasoning</h2>
        <p>evidenceRefs: {detail.evidenceRefs.join(', ')}</p>
        <p>changeReasoning: {detail.changeReasoning}</p>
        <p>escalationTriggered: {String(detail.escalationTriggered)}</p>
        <p>escalationRef: {detail.escalationRef ?? '-'}</p>
      </section>
      <section>
        <h2>State Diff</h2>
        <pre>{JSON.stringify(detail.oldStructuredState, null, 2)}</pre>
        <pre>{JSON.stringify(detail.newStructuredState, null, 2)}</pre>
      </section>
    </main>
  );
}
