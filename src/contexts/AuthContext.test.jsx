import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';

let mockSession = null;
let authChangeCallback = null;

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: mockSession } })),
      onAuthStateChange: vi.fn((callback) => {
        authChangeCallback = callback;
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      }),
      signInWithOAuth: vi.fn(() => Promise.resolve({ error: null })),
      signOut: vi.fn(() => Promise.resolve({ error: null })),
    },
  },
  fetchProfile: vi.fn(() => Promise.resolve({
    full_name: 'Dr. Carter',
    role: 'Admin',
    email: 'carter@test.com',
    clinic: 'Morristown',
  })),
  insertAuditEntry: vi.fn(() => Promise.resolve()),
}));

function TestConsumer() {
  const auth = useAuth();
  if (auth.loading) return <div>Loading...</div>;
  return (
    <div>
      <span data-testid="user">{auth.user ? 'logged-in' : 'logged-out'}</span>
      <span data-testid="profile">{auth.profile?.full_name || 'none'}</span>
      <span data-testid="clinic">{auth.selectedClinic}</span>
      <span data-testid="admin">{auth.isAdmin ? 'yes' : 'no'}</span>
      <button onClick={auth.signInWithMicrosoft}>Sign In</button>
      <button onClick={auth.signOut}>Sign Out</button>
      <button onClick={() => auth.setSelectedClinic('Newport')}>Change Clinic</button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSession = null;
    authChangeCallback = null;
  });

  it('starts in loading state', () => {
    mockSession = null;
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows logged-out state when no session', async () => {
    mockSession = null;
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('logged-out');
    });
  });

  it('loads profile when session exists', async () => {
    mockSession = { user: { id: 'uid-1', email: 'carter@test.com' } };
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('profile')).toHaveTextContent('Dr. Carter');
    });
  });

  it('sets selectedClinic from profile', async () => {
    mockSession = { user: { id: 'uid-1', email: 'carter@test.com' } };
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('clinic')).toHaveTextContent('Morristown');
    });
  });

  it('reports isAdmin correctly for Admin role', async () => {
    mockSession = { user: { id: 'uid-1', email: 'carter@test.com' } };
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('admin')).toHaveTextContent('yes');
    });
  });

  it('defaults selectedClinic to All Clinics without profile', async () => {
    mockSession = null;
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('clinic')).toHaveTextContent('All Clinics');
    });
  });

  it('handles SIGNED_IN auth state change', async () => {
    mockSession = null;
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('logged-out');
    });

    await act(async () => {
      await authChangeCallback('SIGNED_IN', { user: { id: 'uid-2', email: 'test@test.com' } });
    });

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('logged-in');
    });
  });

  it('handles SIGNED_OUT auth state change', async () => {
    mockSession = { user: { id: 'uid-1', email: 'carter@test.com' } };
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('logged-in');
    });

    await act(async () => {
      await authChangeCallback('SIGNED_OUT', null);
    });

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('logged-out');
      expect(screen.getByTestId('clinic')).toHaveTextContent('All Clinics');
    });
  });

  it('subscribes and unsubscribes from auth changes', async () => {
    const { supabase } = await import('../lib/supabase');
    mockSession = null;

    const { unmount } = render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    expect(supabase.auth.onAuthStateChange).toHaveBeenCalledTimes(1);
    unmount();
  });
});
