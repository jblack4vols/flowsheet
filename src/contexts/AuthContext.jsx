import { createContext, useContext, useState, useEffect } from 'react';
import { supabase, fetchProfile, insertAuditEntry } from '../lib/supabase';

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);       // Supabase auth user
  const [profile, setProfile] = useState(null);  // Our profiles table row
  const [loading, setLoading] = useState(true);
  const [selectedClinic, setSelectedClinic] = useState('All Clinics');

  useEffect(() => {
    // Check active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          await loadProfile(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          setSelectedClinic('All Clinics');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  async function loadProfile(userId) {
    try {
      const p = await fetchProfile(userId);
      setProfile(p);
      setSelectedClinic(p.clinic || 'All Clinics');
    } catch (err) {
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  }

  async function signInWithMicrosoft() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'azure',
      options: {
        scopes: 'email profile openid',
        redirectTo: window.location.origin,
      },
    });
    if (error) throw error;
  }

  async function signOut() {
    if (user && profile) {
      await addAuditEntry('LOGOUT', 'User logged out');
    }
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  async function addAuditEntry(action, details) {
    if (!user) return;
    await insertAuditEntry(user.id, profile?.email || user.email, action, details);
  }

  const value = {
    user,
    profile,
    loading,
    selectedClinic,
    setSelectedClinic,
    signInWithMicrosoft,
    signOut,
    addAuditEntry,
    isAdmin: profile?.role === 'Admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
