import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import DashboardPage from '../pages/DashboardPage';
import FramesPage from '../pages/FramesPage';
import AnalyticsPage from '../pages/AnalyticsPage';

// Mock recharts ResponsiveContainer to avoid resize observer issues in jsdom
vi.mock('recharts', async () => {
  const OriginalModule = await vi.importActual<any>('recharts');
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: any) => (
      <div style={{ width: '100%', height: 300 }}>{children}</div>
    )
  };
});

describe('App Smoke Tests', () => {
  it('renders DashboardPage without throwing', () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );
    // Based on DashboardPage layout
    expect(screen.getByRole('heading', { name: /Dashboard/i })).toBeInTheDocument();
  });

  it('renders FramesPage without throwing', () => {
    render(
      <MemoryRouter>
        <FramesPage />
      </MemoryRouter>
    );
    // Based on FramesPage layout
    expect(screen.getByRole('heading', { name: /Frames History/i })).toBeInTheDocument();
  });

  it('renders AnalyticsPage without throwing', () => {
    render(
      <MemoryRouter>
        <AnalyticsPage />
      </MemoryRouter>
    );
    // Based on AnalyticsPage layout
    expect(screen.getByRole('heading', { name: /Analytics/i })).toBeInTheDocument();
  });
});
