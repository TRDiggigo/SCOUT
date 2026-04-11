import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';

import { appRoutes } from '../src/app/router';

describe('web smoke rendering', () => {
  it('renders the app shell and dashboard placeholder', async () => {
    const router = createMemoryRouter(appRoutes, {
      initialEntries: ['/app/dashboard'],
    });

    render(
      <QueryClientProvider client={new QueryClient()}>
        <RouterProvider router={router} />
      </QueryClientProvider>,
    );

    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByText('Analyst Workspace')).toBeInTheDocument();
  });
});
