import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';

import { appRoutes } from '../src/app/router';

describe('router main paths', () => {
  it.each([
    ['/app/dashboard', 'Dashboard'],
    ['/app/vendors', 'Vendors'],
    ['/app/deltas', 'Deltas'],
    ['/app/evidence', 'Evidence'],
    ['/app/reports', 'Reports'],
    ['/admin/runs', 'Runs'],
    ['/admin/errors', 'Errors'],
    ['/admin/config', 'Configuration'],
    ['/admin/audit', 'Audit'],
    ['/admin/users', 'Users'],
    ['/admin/roles', 'Roles'],
    ['/admin/sharepoint', 'SharePoint'],
  ])('renders %s', async (path, heading) => {
    const router = createMemoryRouter(appRoutes, {
      initialEntries: [path],
    });

    render(
      <QueryClientProvider client={new QueryClient()}>
        <RouterProvider router={router} />
      </QueryClientProvider>,
    );

    expect(await screen.findByRole('heading', { name: heading })).toBeInTheDocument();
  });
});
