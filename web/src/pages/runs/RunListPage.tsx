import { useState } from 'react';

import { PageHeader } from '../../components/PageHeader';
import { RunFilterBar } from './components/RunFilterBar';
import { RunPagination } from './components/RunPagination';
import { RunTable } from './components/RunTable';
import { useRunListQuery } from './queries';
import type { RunListQueryState } from './types';

const initialQueryState: RunListQueryState = {
  status: '',
  mode: '',
  runDate: '',
  sortBy: 'runDate',
  sortOrder: 'desc',
  page: 1,
  pageSize: 10,
};

export function RunListPage(): JSX.Element {
  const [queryState, setQueryState] = useState<RunListQueryState>(initialQueryState);
  const runListQuery = useRunListQuery(queryState);

  return (
    <main>
      <PageHeader title='Runs' subtitle='Operational run overview.' />
      <RunFilterBar value={queryState} onChange={setQueryState} />

      {runListQuery.isLoading && <p>Loading run list...</p>}
      {runListQuery.isError && <p>Run list could not be loaded.</p>}

      {!runListQuery.isLoading && !runListQuery.isError && runListQuery.data?.items.length === 0 && (
        <p>No runs found for the current filter.</p>
      )}

      {!runListQuery.isLoading && !runListQuery.isError && runListQuery.data && runListQuery.data.items.length > 0 && (
        <>
          <RunTable items={runListQuery.data.items} />
          <RunPagination
            page={runListQuery.data.page}
            pageSize={runListQuery.data.pageSize}
            total={runListQuery.data.total}
            onPageChange={(page) => setQueryState({ ...queryState, page })}
          />
        </>
      )}
    </main>
  );
}
