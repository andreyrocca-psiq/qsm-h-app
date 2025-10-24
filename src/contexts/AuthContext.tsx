'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { Profile } from '@/lib/supabase';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, role: 'patient' | 'doctor', phone?: string) => Promise<{ user: User | null }>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await loadProfile(user.id);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: 'patient' | 'doctor',
    phone?: string
  ) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role,
            phone,
          },
        },
      });

      if (error) throw error;

      // Redirect based on role
      if (role === 'patient') {
        router.push('/patient/dashboard');
      } else {
        router.push('/doctor/dashboard');
      }

      return { user: data.user };
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao criar conta');
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Load profile to determine redirect
      const { data: profileData } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      // Redirect based on role
      if (profileData?.role === 'patient') {
        router.push('/patient/dashboard');
      } else {
        router.push('/doctor/dashboard');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao fazer login');
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/');
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao fazer logout');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signUp,
        signIn,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
