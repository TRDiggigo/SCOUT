import { useState } from 'react';

import { PageHeader } from '../../components/PageHeader';

import { useVendorListQuery } from './queries';
import type { VendorListQueryState } from './types';
import { VendorFilterBar } from './components/VendorFilterBar';
import { VendorTable } from './components/VendorTable';
import { VendorPagination } from './components/VendorPagination';

const initialQueryState: VendorListQueryState = {
  category: '',
  trackingStatus: '',
  freshnessStatus: '',
  openEscalation: '',
  sortBy: 'vendorName',
  sortOrder: 'asc',
  page: 1,
  pageSize: 10,
};

export function VendorListPage(): JSX.Element {
  const [queryState, setQueryState] = useState<VendorListQueryState>(initialQueryState);
  const vendorListQuery = useVendorListQuery(queryState);

  return (
    <main>
      <PageHeader title='Vendors' subtitle='Sortable and filterable vendor overview.' />
      <VendorFilterBar value={queryState} onChange={setQueryState} />

      {vendorListQuery.isLoading && <p>Loading vendor list...</p>}
      {vendorListQuery.isError && <p>Vendor list could not be loaded.</p>}

      {!vendorListQuery.isLoading && !vendorListQuery.isError && vendorListQuery.data && vendorListQuery.data.items.length === 0 && (
        <p>No vendors found for the current filter.</p>
      )}

      {!vendorListQuery.isLoading && !vendorListQuery.isError && vendorListQuery.data && vendorListQuery.data.items.length > 0 && (
        <>
          <VendorTable items={vendorListQuery.data.items} />
          <VendorPagination
            page={vendorListQuery.data.page}
            pageSize={vendorListQuery.data.pageSize}
            total={vendorListQuery.data.total}
            onPageChange={(nextPage) => setQueryState({ ...queryState, page: nextPage })}
          />
        </>
      )}
    </main>
  );
}
