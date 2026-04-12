import { useState } from 'react';

import { PageHeader } from '../../components/PageHeader';
import { DeltaFilterBar } from './components/DeltaFilterBar';
import { DeltaPagination } from './components/DeltaPagination';
import { DeltaTable } from './components/DeltaTable';
import { useDeltaListQuery } from './queries';
import type { DeltaListQueryState } from './types';

const initialQueryState: DeltaListQueryState = {
  deltaType: '',
  impactedDimension: '',
  severity: '',
  reviewStatus: '',
  sortBy: 'deltaDate',
  sortOrder: 'desc',
  page: 1,
  pageSize: 10,
};

export function DeltaListPage(): JSX.Element {
  const [queryState, setQueryState] = useState<DeltaListQueryState>(initialQueryState);
  const deltaListQuery = useDeltaListQuery(queryState);

  return (
    <main>
      <PageHeader title='Deltas' subtitle='Snapshot change overview.' />
      <DeltaFilterBar value={queryState} onChange={setQueryState} />

      {deltaListQuery.isLoading && <p>Loading delta list...</p>}
      {deltaListQuery.isError && <p>Delta list could not be loaded.</p>}

      {!deltaListQuery.isLoading && !deltaListQuery.isError && deltaListQuery.data?.items.length === 0 && (
        <p>No deltas found for the current filter.</p>
      )}

      {!deltaListQuery.isLoading && !deltaListQuery.isError && deltaListQuery.data && deltaListQuery.data.items.length > 0 && (
        <>
          <DeltaTable items={deltaListQuery.data.items} />
          <DeltaPagination
            page={deltaListQuery.data.page}
            pageSize={deltaListQuery.data.pageSize}
            total={deltaListQuery.data.total}
            onPageChange={(page) => setQueryState({ ...queryState, page })}
          />
        </>
      )}
    </main>
  );
}
