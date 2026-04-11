import { createBrowserRouter, Navigate, type RouteObject } from 'react-router-dom';

import { AppShell } from './AppShell';
import { DashboardPage } from '../pages/app/DashboardPage';
import { VendorListPage } from '../pages/app/VendorListPage';
import { DeltaListPage } from '../pages/app/DeltaListPage';
import { EvidenceListPage } from '../pages/app/EvidenceListPage';
import { ReportListPage } from '../pages/app/ReportListPage';
import { RunListPage } from '../pages/admin/RunListPage';
import { ErrorListPage } from '../pages/admin/ErrorListPage';
import { ConfigPage } from '../pages/admin/ConfigPage';
import { AuditListPage } from '../pages/admin/AuditListPage';
import { UserAdminPage } from '../pages/admin/UserAdminPage';
import { RoleAdminPage } from '../pages/admin/RoleAdminPage';
import { SharePointAdminPage } from '../pages/admin/SharePointAdminPage';
import { RoleGuard } from './guards/RoleGuard';

export const appRoutes: RouteObject[] = [
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to='/app/dashboard' replace /> },
      {
        path: 'app/dashboard',
        element: (
          <RoleGuard allowedRoles={['ROLE_VIEWER', 'ROLE_ANALYST', 'ROLE_LEAD_ANALYST', 'ROLE_OPERATOR', 'ROLE_ADMIN', 'ROLE_GOVERNANCE_OWNER']}>
            <DashboardPage />
          </RoleGuard>
        ),
      },
      {
        path: 'app/vendors',
        element: (
          <RoleGuard allowedRoles={['ROLE_VIEWER', 'ROLE_ANALYST', 'ROLE_LEAD_ANALYST', 'ROLE_OPERATOR', 'ROLE_ADMIN', 'ROLE_GOVERNANCE_OWNER']}>
            <VendorListPage />
          </RoleGuard>
        ),
      },
      {
        path: 'app/deltas',
        element: (
          <RoleGuard allowedRoles={['ROLE_VIEWER', 'ROLE_ANALYST', 'ROLE_LEAD_ANALYST', 'ROLE_OPERATOR', 'ROLE_ADMIN', 'ROLE_GOVERNANCE_OWNER']}>
            <DeltaListPage />
          </RoleGuard>
        ),
      },
      {
        path: 'app/evidence',
        element: (
          <RoleGuard allowedRoles={['ROLE_VIEWER', 'ROLE_ANALYST', 'ROLE_LEAD_ANALYST', 'ROLE_OPERATOR', 'ROLE_ADMIN', 'ROLE_GOVERNANCE_OWNER']}>
            <EvidenceListPage />
          </RoleGuard>
        ),
      },
      {
        path: 'app/reports',
        element: (
          <RoleGuard allowedRoles={['ROLE_VIEWER', 'ROLE_ANALYST', 'ROLE_LEAD_ANALYST', 'ROLE_OPERATOR', 'ROLE_ADMIN', 'ROLE_GOVERNANCE_OWNER']}>
            <ReportListPage />
          </RoleGuard>
        ),
      },
      {
        path: 'admin/runs',
        element: (
          <RoleGuard allowedRoles={['ROLE_OPERATOR', 'ROLE_ADMIN', 'ROLE_GOVERNANCE_OWNER']}>
            <RunListPage />
          </RoleGuard>
        ),
      },
      {
        path: 'admin/errors',
        element: (
          <RoleGuard allowedRoles={['ROLE_OPERATOR', 'ROLE_ADMIN', 'ROLE_GOVERNANCE_OWNER']}>
            <ErrorListPage />
          </RoleGuard>
        ),
      },
      {
        path: 'admin/config',
        element: (
          <RoleGuard allowedRoles={['ROLE_OPERATOR', 'ROLE_ADMIN', 'ROLE_GOVERNANCE_OWNER']}>
            <ConfigPage />
          </RoleGuard>
        ),
      },
      {
        path: 'admin/audit',
        element: (
          <RoleGuard allowedRoles={['ROLE_ADMIN', 'ROLE_GOVERNANCE_OWNER']}>
            <AuditListPage />
          </RoleGuard>
        ),
      },
      {
        path: 'admin/users',
        element: (
          <RoleGuard allowedRoles={['ROLE_ADMIN']}>
            <UserAdminPage />
          </RoleGuard>
        ),
      },
      {
        path: 'admin/roles',
        element: (
          <RoleGuard allowedRoles={['ROLE_ADMIN']}>
            <RoleAdminPage />
          </RoleGuard>
        ),
      },
      {
        path: 'admin/sharepoint',
        element: (
          <RoleGuard allowedRoles={['ROLE_ADMIN']}>
            <SharePointAdminPage />
          </RoleGuard>
        ),
      },
    ],
  },
];

export const router = createBrowserRouter(appRoutes);
