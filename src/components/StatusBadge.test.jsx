import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatusBadge from './StatusBadge';

describe('StatusBadge', () => {
  it('renders Active status', () => {
    render(<StatusBadge status="Active" />);
    const badge = screen.getByText('Active');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('bg-green-100');
    expect(badge.className).toContain('text-green-800');
  });

  it('renders Inactive status', () => {
    render(<StatusBadge status="Inactive" />);
    const badge = screen.getByText('Inactive');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('bg-amber-100');
  });

  it('renders DC status', () => {
    render(<StatusBadge status="DC" />);
    const badge = screen.getByText('DC');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('bg-red-100');
  });

  it('falls back to Inactive for unknown status', () => {
    render(<StatusBadge status="Unknown" />);
    const badge = screen.getByText('Inactive');
    expect(badge).toBeInTheDocument();
  });
});
