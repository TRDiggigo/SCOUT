import { NavLink } from 'react-router-dom';

interface SideNavSection {
  title: string;
  links: Array<{ label: string; to: string }>;
}

const navigationSections: SideNavSection[] = [
  {
    title: 'Analyst Workspace',
    links: [
      { label: 'Dashboard', to: '/app/dashboard' },
      { label: 'Vendors', to: '/app/vendors' },
      { label: 'Deltas', to: '/app/deltas' },
      { label: 'Evidence', to: '/app/evidence' },
      { label: 'Reports', to: '/app/reports' },
    ],
  },
  {
    title: 'Admin / Operations',
    links: [
      { label: 'Runs', to: '/admin/runs' },
      { label: 'Errors', to: '/admin/errors' },
      { label: 'Config', to: '/admin/config' },
      { label: 'Audit', to: '/admin/audit' },
      { label: 'Users', to: '/admin/users' },
      { label: 'Roles', to: '/admin/roles' },
      { label: 'SharePoint', to: '/admin/sharepoint' },
    ],
  },
];

export function SideNav(): JSX.Element {
  return (
    <aside>
      {navigationSections.map((section) => (
        <section key={section.title}>
          <h2>{section.title}</h2>
          <ul>
            {section.links.map((link) => (
              <li key={link.to}>
                <NavLink to={link.to}>{link.label}</NavLink>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </aside>
  );
}
