import { useState } from 'react';
import { Link } from 'react-router-dom';

import { PageHeader } from '../../components/PageHeader';
import { useEvidenceListQuery } from './queries';
import type { EvidenceListQueryState } from './types';

const initialState: EvidenceListQueryState = {
  vendor: '',
  claimType: '',
};

export function EvidenceListPage(): JSX.Element {
  const [queryState, setQueryState] = useState<EvidenceListQueryState>(initialState);
  const evidenceListQuery = useEvidenceListQuery(queryState);

  return (
    <main>
      <PageHeader title='Evidence' subtitle='Captured excerpts and source links.' />

      <label htmlFor='evidence-vendor-filter'>Vendor filter</label>
      <input
        id='evidence-vendor-filter'
        aria-label='Evidence vendor filter'
        value={queryState.vendor}
        onChange={(event) => setQueryState({ ...queryState, vendor: event.target.value })}
      />

      <label htmlFor='evidence-claim-type-filter'>Claim type filter</label>
      <select
        id='evidence-claim-type-filter'
        aria-label='Evidence claim type filter'
        value={queryState.claimType}
        onChange={(event) => setQueryState({ ...queryState, claimType: event.target.value as EvidenceListQueryState['claimType'] })}
      >
        <option value=''>All</option>
        <option value='security'>Security</option>
        <option value='governance'>Governance</option>
        <option value='compliance'>Compliance</option>
        <option value='integration'>Integration</option>
        <option value='pricing'>Pricing</option>
      </select>

      {evidenceListQuery.isLoading && <p>Loading evidence list...</p>}
      {evidenceListQuery.isError && <p>Evidence list could not be loaded.</p>}

      {evidenceListQuery.data && (
        <table>
          <thead>
            <tr>
              <th>Evidence ID</th>
              <th>Vendor</th>
              <th>Raw excerpt</th>
              <th>Source URL</th>
              <th>Source type</th>
              <th>Claim type</th>
              <th>Extraction confidence</th>
              <th>Run ID</th>
            </tr>
          </thead>
          <tbody>
            {evidenceListQuery.data.items.map((item) => (
              <tr key={item.evidenceId}>
                <td>
                  <Link to={`/app/evidence/${item.evidenceId}`}>{item.evidenceId}</Link>
                </td>
                <td>{item.vendorName}</td>
                <td>{item.rawExcerpt}</td>
                <td>
                  <a href={item.sourceUrl} target='_blank' rel='noreferrer'>
                    {item.sourceUrl}
                  </a>
                </td>
                <td>{item.sourceType}</td>
                <td>{item.claimType}</td>
                <td>{item.extractionConfidence}</td>
                <td>{item.runId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
