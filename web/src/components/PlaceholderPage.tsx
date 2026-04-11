import { PageHeader } from './PageHeader';

interface PlaceholderPageProps {
  title: string;
  area: 'app' | 'admin';
}

export function PlaceholderPage({ title, area }: PlaceholderPageProps): JSX.Element {
  return (
    <main>
      <PageHeader
        title={title}
        subtitle={
          area === 'app'
            ? 'Analyst Workspace Placeholder (WP-01.2)'
            : 'Admin / Operations Placeholder (WP-01.2)'
        }
      />
      <p>Noch keine Fachlogik oder API-Anbindung aktiv.</p>
    </main>
  );
}
