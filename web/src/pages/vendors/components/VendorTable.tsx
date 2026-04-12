import { Link } from 'react-router-dom';

import type { VendorListItemDto } from '../types';

interface VendorTableProps {
  items: VendorListItemDto[];
}

export function VendorTable({ items }: VendorTableProps): JSX.Element {
  return (
    <table>
      <thead>
        <tr>
          <th>vendorId</th>
          <th>vendorName</th>
          <th>country</th>
          <th>regionScope</th>
          <th>category</th>
          <th>trackingStatus</th>
          <th>marketMaturityScore</th>
          <th>integrationScore</th>
          <th>governanceScore</th>
          <th>overallScore</th>
          <th>confidence</th>
          <th>freshnessStatus</th>
          <th>asOfDate</th>
          <th>sourceRunId</th>
          <th>deltaStatus</th>
          <th>openEscalation</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.vendorId}>
            <td>{item.vendorId}</td>
            <td>
              <Link to={`/app/vendors/${item.vendorId}`}>{item.vendorName}</Link>
            </td>
            <td>{item.country}</td>
            <td>{item.regionScope}</td>
            <td>{item.category}</td>
            <td>{item.trackingStatus}</td>
            <td>{item.marketMaturityScore}</td>
            <td>{item.integrationScore}</td>
            <td>{item.governanceScore}</td>
            <td>{item.overallScore}</td>
            <td>{item.confidence}</td>
            <td>{item.freshnessStatus}</td>
            <td>{item.asOfDate}</td>
            <td>{item.sourceRunId}</td>
            <td>{item.deltaStatus}</td>
            <td>{String(item.openEscalation)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
