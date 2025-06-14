import { supabase } from './supabase';
import { User } from '@supabase/supabase-js';

export interface AuthUser extends User {
  user_metadata?: {
    name?: string;
    phone?: string;
  };
}

export const authService = {
  async signUp(email: string, password: string, name: string, phone: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          phone,
        },
      },
    });

    if (error) throw error;
    return data;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    const { data: { user } } = await supabase.auth.getUser();
    return user as AuthUser;
  },

  async updateProfile(updates: { name?: string; phone?: string }) {
    const { data, error } = await supabase.auth.updateUser({
      data: updates,
    });

    if (error) throw error;
    return data;
  },

  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user as AuthUser || null);
    });
  }
};