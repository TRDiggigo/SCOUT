import type { ErrorListQueryState } from '../types';

interface ErrorFilterBarProps {
  value: ErrorListQueryState;
  onChange: (value: ErrorListQueryState) => void;
}

export function ErrorFilterBar({ value, onChange }: ErrorFilterBarProps): JSX.Element {
  return (
    <section>
      <label>
        Severity
        <select aria-label='Error severity filter' value={value.severity} onChange={(event) => onChange({ ...value, severity: event.target.value, page: 1 })}>
          <option value=''>All</option>
          <option value='low'>low</option>
          <option value='medium'>medium</option>
          <option value='high'>high</option>
          <option value='critical'>critical</option>
        </select>
      </label>

      <label>
        Stage
        <select aria-label='Error stage filter' value={value.stage} onChange={(event) => onChange({ ...value, stage: event.target.value, page: 1 })}>
          <option value=''>All</option>
          <option value='A1'>A1</option>
          <option value='A2'>A2</option>
          <option value='A3'>A3</option>
          <option value='A4'>A4</option>
          <option value='A5'>A5</option>
          <option value='A6'>A6</option>
          <option value='config'>config</option>
          <option value='system'>system</option>
        </select>
      </label>

      <label>
        Resolution status
        <select
          aria-label='Error resolution filter'
          value={value.resolutionStatus}
          onChange={(event) => onChange({ ...value, resolutionStatus: event.target.value, page: 1 })}
        >
          <option value=''>All</option>
          <option value='open'>open</option>
          <option value='investigating'>investigating</option>
          <option value='fixed'>fixed</option>
          <option value='dismissed'>dismissed</option>
        </select>
      </label>

      <label>
        Sort by
        <select aria-label='Error sort by' value={value.sortBy} onChange={(event) => onChange({ ...value, sortBy: event.target.value as ErrorListQueryState['sortBy'] })}>
          <option value='firstSeenAt'>firstSeenAt</option>
          <option value='severity'>severity</option>
          <option value='stage'>stage</option>
          <option value='resolutionStatus'>resolutionStatus</option>
        </select>
      </label>

      <label>
        Sort order
        <select aria-label='Error sort order' value={value.sortOrder} onChange={(event) => onChange({ ...value, sortOrder: event.target.value as ErrorListQueryState['sortOrder'] })}>
          <option value='asc'>asc</option>
          <option value='desc'>desc</option>
        </select>
      </label>
    </section>
  );
}
