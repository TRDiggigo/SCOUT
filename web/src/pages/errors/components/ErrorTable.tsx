import { Link } from 'react-router-dom';

import type { ErrorListItemDto } from '../types';

interface ErrorTableProps {
  items: ErrorListItemDto[];
}

export function ErrorTable({ items }: ErrorTableProps): JSX.Element {
  return (
    <table>
      <thead>
        <tr>
          <th>errorId</th><th>runId</th><th>vendorId</th><th>stage</th><th>errorType</th><th>severity</th><th>message</th><th>firstSeenAt</th>
          <th>retryStatus</th><th>resolutionStatus</th><th>assignedTo</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.errorId}>
            <td>{item.errorId}</td>
            <td><Link to={`/admin/runs/${item.runId}`}>{item.runId}</Link></td>
            <td>{item.vendorId ?? '-'}</td>
            <td>{item.stage}</td>
            <td>{item.errorType}</td>
            <td>{item.severity}</td>
            <td>{item.message}</td>
            <td>{item.firstSeenAt}</td>
            <td>{item.retryStatus}</td>
            <td>{item.resolutionStatus}</td>
            <td>{item.assignedTo ?? '-'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
