import { Outlet } from 'react-router-dom';

import { SideNav } from '../components/SideNav';

export function AppShell(): JSX.Element {
  return (
    <div>
      <SideNav />
      <Outlet />
    </div>
  );
}
