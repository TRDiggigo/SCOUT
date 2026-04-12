import type { VendorListQueryState } from '../types';

interface VendorFilterBarProps {
  value: VendorListQueryState;
  onChange: (value: VendorListQueryState) => void;
}

export function VendorFilterBar({ value, onChange }: VendorFilterBarProps): JSX.Element {
  return (
    <section>
      <label>
        Category
        <select
          aria-label='Category filter'
          value={value.category}
          onChange={(event) => onChange({ ...value, category: event.target.value, page: 1 })}
        >
          <option value=''>All</option>
          <option value='platform'>platform</option>
          <option value='framework'>framework</option>
          <option value='orchestration'>orchestration</option>
          <option value='vertical_solution'>vertical_solution</option>
          <option value='other'>other</option>
        </select>
      </label>

      <label>
        Tracking status
        <select
          aria-label='Tracking status filter'
          value={value.trackingStatus}
          onChange={(event) => onChange({ ...value, trackingStatus: event.target.value, page: 1 })}
        >
          <option value=''>All</option>
          <option value='active'>active</option>
          <option value='inactive'>inactive</option>
          <option value='review_queue'>review_queue</option>
          <option value='blocked'>blocked</option>
        </select>
      </label>

      <label>
        Freshness status
        <select
          aria-label='Freshness status filter'
          value={value.freshnessStatus}
          onChange={(event) => onChange({ ...value, freshnessStatus: event.target.value, page: 1 })}
        >
          <option value=''>All</option>
          <option value='fresh'>fresh</option>
          <option value='stale'>stale</option>
          <option value='failed'>failed</option>
          <option value='unknown'>unknown</option>
        </select>
      </label>

      <label>
        Open escalation
        <select
          aria-label='Open escalation filter'
          value={value.openEscalation}
          onChange={(event) => onChange({ ...value, openEscalation: event.target.value, page: 1 })}
        >
          <option value=''>All</option>
          <option value='true'>true</option>
          <option value='false'>false</option>
        </select>
      </label>

      <label>
        Sort by
        <select
          aria-label='Sort by'
          value={value.sortBy}
          onChange={(event) => onChange({ ...value, sortBy: event.target.value as VendorListQueryState['sortBy'] })}
        >
          <option value='vendorName'>vendorName</option>
          <option value='overallScore'>overallScore</option>
          <option value='confidence'>confidence</option>
          <option value='freshnessStatus'>freshnessStatus</option>
          <option value='asOfDate'>asOfDate</option>
        </select>
      </label>

      <label>
        Sort order
        <select
          aria-label='Sort order'
          value={value.sortOrder}
          onChange={(event) => onChange({ ...value, sortOrder: event.target.value as VendorListQueryState['sortOrder'] })}
        >
          <option value='asc'>asc</option>
          <option value='desc'>desc</option>
        </select>
      </label>
    </section>
  );
}
