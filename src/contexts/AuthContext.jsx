// src/contexts/AuthContext.jsx
// ─────────────────────────────────────────────────────────────────────
//  Supabase Auth — replaces Firebase onAuthStateChanged / signInWithPopup
//
//  Firebase → Supabase mapping:
//    onAuthStateChanged     → supabase.auth.onAuthStateChange
//    signInWithPopup        → supabase.auth.signInWithOAuth (Google)
//    signInWithEmailAndPassword → supabase.auth.signInWithPassword
//    signOut                → supabase.auth.signOut
//    auth.currentUser       → supabase.auth.getUser()
// ─────────────────────────────────────────────────────────────────────
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, ADMIN_EMAIL } from '../supabase';

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get the initial session immediately (avoids flash of unauthenticated state)
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    // Subscribe to future auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── Auth actions ──────────────────────────────────────────────────

  /**
   * Sign in with Google OAuth.
   * Redirects back to the current origin after login.
   * (Same UX as Firebase signInWithPopup but uses a redirect flow)
   */
  const loginWithGoogle = () =>
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });

  const logout = () => supabase.auth.signOut();

  // Derived: is the logged-in user the admin?
  const isAdmin = user?.email === ADMIN_EMAIL;

  return (
    <Ctx.Provider value={{ user, loading, isAdmin, loginWithGoogle, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
