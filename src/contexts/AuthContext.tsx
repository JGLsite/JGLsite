import React, { createContext, useContext, useState, useEffect } from 'react';
import { User as AuthUser } from '@supabase/supabase-js';
import {
  supabase,
  signIn,
  signOut,
  signUp as supabaseSignUp,
  getUserProfile,
  isSupabaseConfigured
} from '../lib/supabase';
import { log, error as logError, warn } from '../lib/logger';
import { Database } from '../types/database';

type UserProfile = Database['public']['Tables']['user_profiles']['Row'] & {
  gym?: Database['public']['Tables']['gyms']['Row'];
};

interface AuthContextType {
  user: UserProfile | null;
  authUser: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

if (import.meta.env.DEV) {
  log('[auth] Supabase configured:', isSupabaseConfigured);
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    
    if (import.meta.env.DEV) {
      log('[auth] AuthProvider initializing');
    }

    const initializeAuth = async () => {
      try {
        if (import.meta.env.DEV) {
          log('[auth] Checking existing session');
        }
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (import.meta.env.DEV) {
          log('[auth] getSession result', session, error);
        }
        
        if (!mounted) return;
        
        if (error) {
          logError('[auth] Session error:', error);
          setError(error.message);
          setIsLoading(false);
          return;
        }
        
        if (session?.user) {
          setAuthUser(session.user);
          await loadUserProfile(session.user.id);
        } else {
          setIsLoading(false);
        }
      } catch (err) {
        logError('[auth] Initialize auth error:', err);
        if (mounted) {
          setError('Failed to initialize authentication');
          setIsLoading(false);
        }
      }
    };
    
    // Add timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (mounted && isLoading) {
        warn('[auth] Auth initialization timeout');
        setIsLoading(false);
      }
    }, 10000); // 10 second timeout
    
    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (import.meta.env.DEV) {
          log('[auth] onAuthStateChange', event, session);
        }
        
        if (!mounted) return;
        
        if (session?.user) {
          setAuthUser(session.user);
          await loadUserProfile(session.user.id);
        } else {
          setAuthUser(null);
          setUser(null);
          setIsLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      clearTimeout(timeout);
      if (import.meta.env.DEV) {
        log('[auth] auth subscription cleanup');
      }
      subscription.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (userId: string) => {
    if (import.meta.env.DEV) {
      log('[auth] loadUserProfile', userId);
    }
    try {
      const { data, error } = await getUserProfile(userId);
      log('[auth] getUserProfile result:', { data, error });
      if (error) {
        if (error.code === 'NO_PROFILE') {
          warn('[auth] No user profile found - user may need to complete profile setup');
        } else {
          logError('Error loading user profile:', error);
        }
      }
      
      if (error) {
        logError('[auth] Error loading user profile:', error);
        log('[auth] Continuing authentication without profile data');
      } else if (data) {
        log('[auth] Setting user profile:', data);
        setUser(data);
      } else {
        // No profile exists, create one automatically
        log('[auth] No user profile found, creating one...');
        try {
          const { data: authUser } = await supabase.auth.getUser();
          if (authUser.user) {
            const newProfile = {
              id: authUser.user.id,
              email: authUser.user.email || '',
              first_name: authUser.user.user_metadata?.first_name || 'User',
              last_name: authUser.user.user_metadata?.last_name || '',
              role: 'gymnast' as const,
            };
            
            const { data: createdProfile, error: createError } = await supabase
              .from('user_profiles')
              .insert(newProfile)
              .select(`
                *,
                gym:gyms(*)
              `)
              .single();
            
            if (createError) {
              logError('[auth] Error creating user profile:', createError);
            } else if (createdProfile) {
              log('[auth] Created and set new user profile:', createdProfile);
              setUser(createdProfile);
            }
          }
        } catch (createErr) {
          logError('[auth] Exception creating user profile:', createErr);
        }
      }
    } catch (err: unknown) {
      logError('[auth] Error loading user profile:', err);
      log('[auth] No user profile found, continuing without profile data');
    } finally {
      if (import.meta.env.DEV) {
        log('[auth] loadUserProfile complete');
      }
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    log('[auth] Login attempt for:', email);
    setIsLoading(true);
    setError(null);

    try {
      log('[auth] Attempting Supabase signIn...');
      const { error } = await signIn(email, password);
      log('[auth] signIn response:', { error });
      
      if (error) {
        logError('[auth] Supabase login error:', error);
        throw new Error(error.message);
      }
      log('[auth] Supabase login successful, waiting for auth state change...');
      // User profile will be loaded via the auth state change listener
    } catch (err) {
      logError('[auth] Login failed:', err);
      setError(err instanceof Error ? err.message : 'Login failed');
      setIsLoading(false);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabaseSignUp(email, password, {
        id: crypto.randomUUID(),
        email,
        first_name: firstName,
        last_name: lastName,
        role: 'gymnast',
      });

      if (error) {
        throw new Error(error.message);
      }

      // User profile will be loaded via the auth state change listener
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed');
      setIsLoading(false);
    }
  };

  const logout = async () => {
    log('Logging out...');
    setError(null);
    
    // Sign out from Supabase
    const { error } = await signOut();
    if (error) {
      logError('Logout error:', error);
      setError(error.message);
    }
    
    // Reset state
    setUser(null);
    setAuthUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, authUser, login, signUp, logout, isLoading, error }}
    >
      {children}
    </AuthContext.Provider>
  );
};