import { Link } from 'react-router-dom';

import type { DeltaListItemDto } from '../types';

interface DeltaTableProps {
  items: DeltaListItemDto[];
}

export function DeltaTable({ items }: DeltaTableProps): JSX.Element {
  return (
    <table>
      <thead>
        <tr>
          <th>deltaId</th><th>vendorId</th><th>vendorName</th><th>deltaDate</th><th>deltaType</th><th>impactedDimension</th><th>oldValue</th>
          <th>newValue</th><th>severity</th><th>confidence</th><th>sourceRunId</th><th>detectedBy</th><th>reviewStatus</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.deltaId}>
            <td><Link to={`/app/deltas/${item.deltaId}`}>{item.deltaId}</Link></td>
            <td>{item.vendorId}</td><td>{item.vendorName}</td><td>{item.deltaDate}</td><td>{item.deltaType}</td><td>{item.impactedDimension}</td><td>{item.oldValue ?? '-'}</td>
            <td>{item.newValue ?? '-'}</td><td>{item.severity}</td><td>{item.confidence}</td><td>{item.sourceRunId}</td><td>{item.detectedBy}</td><td>{item.reviewStatus}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
