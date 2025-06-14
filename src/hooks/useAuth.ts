import { useState, useEffect } from 'react';
import { authService, AuthUser } from '../lib/auth';
import { useCart } from './useCart';

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { loadFromDatabase, syncWithDatabase } = useCart();

  useEffect(() => {
    // Get initial user
    authService.getCurrentUser().then(user => {
      setUser(user);
      setLoading(false);
      
      // Load cart from database if user is logged in
      if (user) {
        loadFromDatabase(user.id);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = authService.onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
      
      // Handle cart sync on auth state change
      if (user) {
        // User logged in - load their cart from database
        loadFromDatabase(user.id);
      } else {
        // User logged out - cart will persist in localStorage via Zustand
      }
    });

    return () => subscription.unsubscribe();
  }, [loadFromDatabase]);

  const signUp = async (email: string, password: string, name: string, phone: string) => {
    const result = await authService.signUp(email, password, name, phone);
    return result;
  };

  const signIn = async (email: string, password: string) => {
    const result = await authService.signIn(email, password);
    
    // Sync local cart with database after successful login
    if (result.user) {
      await syncWithDatabase(result.user.id);
    }
    
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