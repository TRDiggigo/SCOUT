import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';

import { AuthProvider } from '../src/auth/AuthProvider';
import type { AuthContextValue } from '../src/auth/types';
import { appRoutes } from '../src/app/router';

describe('frontend role guard', () => {
  it('redirects viewer away from admin page', async () => {
    const router = createMemoryRouter(appRoutes, {
      initialEntries: ['/admin/users'],
    });

    const authValue: AuthContextValue = {
      isAuthenticated: true,
      user: {
        userId: 'viewer-user',
        roles: ['ROLE_VIEWER'],
      },
    };

    render(
      <AuthProvider value={authValue}>
        <RouterProvider router={router} />
      </AuthProvider>,
    );

    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
  });
});
