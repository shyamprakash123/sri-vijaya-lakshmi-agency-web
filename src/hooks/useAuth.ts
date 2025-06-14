import { useState, useEffect } from 'react';
import { authService, AuthUser } from '../lib/auth';

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial user
    authService.getCurrentUser().then(user => {
      setUser(user);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = authService.onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string, phone: string) => {
    const result = await authService.signUp(email, password, name, phone);
    return result;
  };

  const signIn = async (email: string, password: string) => {
    const result = await authService.signIn(email, password);
    return result;
  };

  const signOut = async () => {
    await authService.signOut();
  };

  const updateProfile = async (updates: { name?: string; phone?: string }) => {
    const result = await authService.updateProfile(updates);
    if (result.user) {
      setUser(result.user as AuthUser);
    }
    return result;
  };

  return {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    isAuthenticated: !!user
  };
};