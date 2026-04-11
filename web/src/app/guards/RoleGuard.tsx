import type { PropsWithChildren } from 'react';
import { Navigate } from 'react-router-dom';

import { useAuth } from '../../auth/AuthProvider';
import type { InternalRole } from '../../auth/roles';

interface RoleGuardProps extends PropsWithChildren {
  allowedRoles: InternalRole[];
  fallbackPath?: string;
}

export function RoleGuard({ allowedRoles, fallbackPath = '/app/dashboard', children }: RoleGuardProps): JSX.Element {
  const auth = useAuth();

  if (!auth.isAuthenticated || !auth.user) {
    return <Navigate to={fallbackPath} replace />;
  }

  const hasAllowedRole = auth.user.roles.some((role) => allowedRoles.includes(role));
  if (!hasAllowedRole) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
}
