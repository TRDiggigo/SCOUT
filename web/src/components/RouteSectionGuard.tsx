import type { PropsWithChildren } from 'react';

interface RouteSectionGuardProps extends PropsWithChildren {
  section: 'app' | 'admin';
}

export function RouteSectionGuard({ section, children }: RouteSectionGuardProps): JSX.Element {
  // WP-01.2: nur strukturelle Vorbereitung; echte RBAC folgt in WP-01.3.
  return <div data-route-section={section}>{children}</div>;
}
