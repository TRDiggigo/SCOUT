import type { DeltaListQueryState } from '../types';

interface DeltaFilterBarProps {
  value: DeltaListQueryState;
  onChange: (value: DeltaListQueryState) => void;
}

export function DeltaFilterBar({ value, onChange }: DeltaFilterBarProps): JSX.Element {
  return (
    <section>
      <label>
        Delta type
        <select aria-label='Delta type filter' value={value.deltaType} onChange={(event) => onChange({ ...value, deltaType: event.target.value, page: 1 })}>
          <option value=''>All</option>
          <option value='score_change'>score_change</option>
          <option value='confidence_drop'>confidence_drop</option>
          <option value='stale_to_failed'>stale_to_failed</option>
        </select>
      </label>

      <label>
        Impacted dimension
        <select
          aria-label='Impacted dimension filter'
          value={value.impactedDimension}
          onChange={(event) => onChange({ ...value, impactedDimension: event.target.value, page: 1 })}
        >
          <option value=''>All</option>
          <option value='maturity'>maturity</option>
          <option value='integration'>integration</option>
          <option value='governance'>governance</option>
          <option value='confidence'>confidence</option>
          <option value='source'>source</option>
          <option value='freshness'>freshness</option>
        </select>
      </label>

      <label>
        Severity
        <select aria-label='Delta severity filter' value={value.severity} onChange={(event) => onChange({ ...value, severity: event.target.value, page: 1 })}>
          <option value=''>All</option>
          <option value='low'>low</option>
          <option value='medium'>medium</option>
          <option value='high'>high</option>
          <option value='critical'>critical</option>
        </select>
      </label>

      <label>
        Review status
        <select aria-label='Delta review status filter' value={value.reviewStatus} onChange={(event) => onChange({ ...value, reviewStatus: event.target.value, page: 1 })}>
          <option value=''>All</option>
          <option value='open'>open</option>
          <option value='in_review'>in_review</option>
          <option value='accepted'>accepted</option>
          <option value='dismissed'>dismissed</option>
          <option value='escalated'>escalated</option>
        </select>
      </label>

      <label>
        Sort by
        <select aria-label='Delta sort by' value={value.sortBy} onChange={(event) => onChange({ ...value, sortBy: event.target.value as DeltaListQueryState['sortBy'] })}>
          <option value='deltaDate'>deltaDate</option>
          <option value='severity'>severity</option>
          <option value='confidence'>confidence</option>
        </select>
      </label>

      <label>
        Sort order
        <select aria-label='Delta sort order' value={value.sortOrder} onChange={(event) => onChange({ ...value, sortOrder: event.target.value as DeltaListQueryState['sortOrder'] })}>
          <option value='asc'>asc</option>
          <option value='desc'>desc</option>
        </select>
      </label>
    </section>
  );
}
