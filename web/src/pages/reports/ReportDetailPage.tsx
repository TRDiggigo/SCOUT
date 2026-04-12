import { useParams } from 'react-router-dom';

import { PageHeader } from '../../components/PageHeader';
import { useReportDetailQuery } from './queries';

export function ReportDetailPage(): JSX.Element {
  const { reportId = '' } = useParams();
  const reportDetailQuery = useReportDetailQuery(reportId);

  if (reportDetailQuery.isLoading) return <p>Loading report detail...</p>;
  if (reportDetailQuery.isError || !reportDetailQuery.data) return <p>Report detail could not be loaded.</p>;

  const report = reportDetailQuery.data;

  return (
    <main>
      <PageHeader title={`Report ${report.reportId}`} subtitle='Detailed report view.' />
      <p><strong>Summary:</strong> {report.summary}</p>
      <h2>Key movements</h2>
      <ul>{report.keyMovements.map((movement) => <li key={movement}>{movement}</li>)}</ul>
      <h2>Governance alerts</h2>
      <ul>{report.governanceAlerts.map((alert) => <li key={alert}>{alert}</li>)}</ul>
      <h2>Linked references</h2>
      <ul>{report.linkedReferences.map((reference) => <li key={reference}>{reference}</li>)}</ul>
      <p><strong>Status:</strong> {report.status}</p>
      <p><strong>Version:</strong> {report.version}</p>
      <p><strong>Reporting period:</strong> {report.reportingPeriod}</p>
      <p><strong>Source run:</strong> {report.sourceRun}</p>
    </main>
  );
}
