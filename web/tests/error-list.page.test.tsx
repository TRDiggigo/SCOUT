import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AuthProvider } from '../src/auth/AuthProvider';
import { ErrorListPage } from '../src/pages/errors';

function renderErrorListPage(): void {
  render(
    <AuthProvider>
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter>
          <ErrorListPage />
        </MemoryRouter>
      </QueryClientProvider>
    </AuthProvider>,
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('ErrorListPage', () => {
  it('renders error rows and filter interaction', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        items: [
          {
            errorId: 'err-001',
            runId: 'run-2026-04-11-001',
            vendorId: 'vendor-003',
            stage: 'A2',
            errorType: 'extraction_error',
            severity: 'high',
            message: 'Extraction schema mismatch.',
            firstSeenAt: '2026-04-11T06:05:00Z',
            retryStatus: 'queued',
            resolutionStatus: 'open',
            assignedTo: 'operator-1',
          },
        ],
        page: 1,
        pageSize: 10,
        total: 1,
      }),
    });

    vi.stubGlobal('fetch', fetchMock);

    renderErrorListPage();

    expect(await screen.findByText('err-001')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Error severity filter'), { target: { value: 'high' } });

    await screen.findByText('err-001');
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('severity=high'),
      expect.objectContaining({ headers: expect.any(Object) }),
    );
  });
});
