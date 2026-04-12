import { useState } from 'react';

import { PageHeader } from '../../components/PageHeader';

import { ErrorFilterBar } from './components/ErrorFilterBar';
import { ErrorPagination } from './components/ErrorPagination';
import { ErrorTable } from './components/ErrorTable';
import { useErrorListQuery } from './queries';
import type { ErrorListQueryState } from './types';

const initialQueryState: ErrorListQueryState = {
  severity: '',
  stage: '',
  resolutionStatus: '',
  sortBy: 'firstSeenAt',
  sortOrder: 'desc',
  page: 1,
  pageSize: 10,
};

export function ErrorListPage(): JSX.Element {
  const [queryState, setQueryState] = useState<ErrorListQueryState>(initialQueryState);
  const errorListQuery = useErrorListQuery(queryState);

  return (
    <main>
      <PageHeader title='Errors' subtitle='Operational error overview.' />
      <ErrorFilterBar value={queryState} onChange={setQueryState} />

      {errorListQuery.isLoading && <p>Loading error list...</p>}
      {errorListQuery.isError && <p>Error list could not be loaded.</p>}

      {!errorListQuery.isLoading && !errorListQuery.isError && errorListQuery.data?.items.length === 0 && (
        <p>No errors found for the current filter.</p>
      )}

      {!errorListQuery.isLoading && !errorListQuery.isError && errorListQuery.data && errorListQuery.data.items.length > 0 && (
        <>
          <ErrorTable items={errorListQuery.data.items} />
          <ErrorPagination
            page={errorListQuery.data.page}
            pageSize={errorListQuery.data.pageSize}
            total={errorListQuery.data.total}
            onPageChange={(page) => setQueryState({ ...queryState, page })}
          />
        </>
      )}
    </main>
  );
}
