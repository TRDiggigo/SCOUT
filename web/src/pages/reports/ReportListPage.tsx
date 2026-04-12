import { Link } from 'react-router-dom';

import { PageHeader } from '../../components/PageHeader';
import { useReportListQuery } from './queries';

export function ReportListPage(): JSX.Element {
  const reportListQuery = useReportListQuery();

  return (
    <main>
      <PageHeader title='Reports' subtitle='Analyst reports and governance digest.' />

      {reportListQuery.isLoading && <p>Loading report list...</p>}
      {reportListQuery.isError && <p>Report list could not be loaded.</p>}

      {reportListQuery.data && (
        <table>
          <thead>
            <tr>
              <th>Report ID</th>
              <th>Vendor</th>
              <th>Summary</th>
              <th>Status</th>
              <th>Version</th>
              <th>Reporting period</th>
              <th>Source run</th>
            </tr>
          </thead>
          <tbody>
            {reportListQuery.data.items.map((item) => (
              <tr key={item.reportId}>
                <td>
                  <Link to={`/app/reports/${item.reportId}`}>{item.reportId}</Link>
                </td>
                <td>{item.vendorName}</td>
                <td>{item.summary}</td>
                <td>{item.status}</td>
                <td>{item.version}</td>
                <td>{item.reportingPeriod}</td>
                <td>{item.sourceRun}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
