import type { RunListQueryState } from '../types';

interface RunFilterBarProps {
  value: RunListQueryState;
  onChange: (value: RunListQueryState) => void;
}

export function RunFilterBar({ value, onChange }: RunFilterBarProps): JSX.Element {
  return (
    <section>
      <label>
        Status
        <select aria-label='Run status filter' value={value.status} onChange={(event) => onChange({ ...value, status: event.target.value, page: 1 })}>
          <option value=''>All</option>
          <option value='planned'>planned</option>
          <option value='running'>running</option>
          <option value='success'>success</option>
          <option value='partial_success'>partial_success</option>
          <option value='failed'>failed</option>
        </select>
      </label>

      <label>
        Mode
        <select aria-label='Run mode filter' value={value.mode} onChange={(event) => onChange({ ...value, mode: event.target.value, page: 1 })}>
          <option value=''>All</option>
          <option value='scheduled'>scheduled</option>
          <option value='manual'>manual</option>
          <option value='dry_run'>dry_run</option>
          <option value='retry_failed'>retry_failed</option>
          <option value='digest'>digest</option>
        </select>
      </label>

      <label>
        Run date
        <input
          aria-label='Run date filter'
          type='date'
          value={value.runDate}
          onChange={(event) => onChange({ ...value, runDate: event.target.value, page: 1 })}
        />
      </label>

      <label>
        Sort by
        <select aria-label='Run sort by' value={value.sortBy} onChange={(event) => onChange({ ...value, sortBy: event.target.value as RunListQueryState['sortBy'] })}>
          <option value='runDate'>runDate</option>
          <option value='startedAt'>startedAt</option>
          <option value='status'>status</option>
          <option value='failedVendors'>failedVendors</option>
          <option value='budgetUsedUsd'>budgetUsedUsd</option>
        </select>
      </label>

      <label>
        Sort order
        <select aria-label='Run sort order' value={value.sortOrder} onChange={(event) => onChange({ ...value, sortOrder: event.target.value as RunListQueryState['sortOrder'] })}>
          <option value='asc'>asc</option>
          <option value='desc'>desc</option>
        </select>
      </label>
    </section>
  );
}
