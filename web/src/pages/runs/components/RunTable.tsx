import type { RunSummaryDto } from '../types';

interface RunTableProps {
  items: RunSummaryDto[];
}

export function RunTable({ items }: RunTableProps): JSX.Element {
  return (
    <table>
      <thead>
        <tr>
          <th>runId</th><th>runDate</th><th>startedAt</th><th>finishedAt</th><th>status</th><th>mode</th><th>vendorScope</th>
          <th>totalVendors</th><th>successVendors</th><th>failedVendors</th><th>staleVendors</th><th>budgetUsedUsd</th>
          <th>budgetLimitUsd</th><th>concurrencyLimit</th><th>initiatedBy</th><th>manifestRef</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.runId}>
            <td>{item.runId}</td><td>{item.runDate}</td><td>{item.startedAt}</td><td>{item.finishedAt ?? '-'}</td><td>{item.status}</td><td>{item.mode}</td><td>{item.vendorScope}</td>
            <td>{item.totalVendors}</td><td>{item.successVendors}</td><td>{item.failedVendors}</td><td>{item.staleVendors}</td><td>{item.budgetUsedUsd}</td>
            <td>{item.budgetLimitUsd}</td><td>{item.concurrencyLimit}</td><td>{item.initiatedBy}</td><td>{item.manifestRef}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
