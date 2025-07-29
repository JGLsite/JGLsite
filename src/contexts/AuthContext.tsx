import React, { createContext, useContext, useState, useEffect } from 'react';
import { User as AuthUser } from '@supabase/supabase-js';
import { supabase, signIn, signOut, getUserProfile } from '../lib/supabase';
import { Database } from '../types/database';

type UserProfile = Database['public']['Tables']['user_profiles']['Row'] & {
  gym?: Database['public']['Tables']['gyms']['Row'];
};

interface AuthContextType {
  user: UserProfile | null;
  authUser: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Demo user profiles
const demoUsers: { [key: string]: UserProfile } = {
  'admin@demo.com': {
    id: 'demo-admin-id',
    email: 'admin@demo.com',
    first_name: 'League',
    last_name: 'Administrator',
    role: 'admin',
    gym_id: null,
    phone: null,
    date_of_birth: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  'coach@demo.com': {
    id: 'demo-coach-id',
    email: 'coach@demo.com',
    first_name: 'Sarah',
    last_name: 'Johnson',
    role: 'coach',
    gym_id: 'demo-gym-id',
    phone: null,
    date_of_birth: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  'gymnast@demo.com': {
    id: 'demo-gymnast-id',
    email: 'gymnast@demo.com',
    first_name: 'Emma',
    last_name: 'Davis',
    role: 'gymnast',
    gym_id: 'demo-gym-id',
    phone: null,
    date_of_birth: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for demo mode first
    const demoUser = localStorage.getItem('demoUser');
    if (demoUser) {
      try {
        const parsedUser = JSON.parse(demoUser);
        console.log('Found demo user in localStorage:', parsedUser);
        setUser(parsedUser);
        setIsLoading(false);
        return;
      } catch (err) {
        console.log('Error parsing demo user, removing:', err);
        localStorage.removeItem('demoUser');
      }
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setAuthUser(session.user);
        loadUserProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
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

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await getUserProfile(userId);
      if (error) {
        console.error('Error loading user profile:', error);
        setError('Failed to load user profile');
      } else if (data) {
        setUser(data);
      }
    } catch (err) {
      console.error('Error loading user profile:', err);
      setError('Failed to load user profile');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    console.log('Login attempt:', email, password);
    setIsLoading(true);
    setError(null);

    // ALWAYS check for demo credentials first
    if (password === 'demo123' && demoUsers[email]) {
      console.log('Using demo mode for:', email);
      const demoUser = demoUsers[email];
      setUser(demoUser);
      localStorage.setItem('demoUser', JSON.stringify(demoUser));
      setIsLoading(false);
      return;
    }

    // If not demo credentials, try Supabase auth
    try {
      console.log('Attempting Supabase login...');
      const { data, error } = await signIn(email, password);
      if (error) {
        console.error('Supabase login error:', error);
        
        // If it's an email confirmation error and password is demo123, try demo mode
        if (error.message.includes('Email not confirmed') && password === 'demo123') {
          console.log('Email not confirmed, checking for demo fallback...');
          const demoUser = demoUsers[email];
          if (demoUser) {
            console.log('Using demo fallback for:', email);
            setUser(demoUser);
            localStorage.setItem('demoUser', JSON.stringify(demoUser));
            setIsLoading(false);
            return;
          }
        }
        
        throw new Error(error.message);
      }
      console.log('Supabase login successful');
      // User profile will be loaded via the auth state change listener
    } catch (err) {
      console.error('Login failed:', err);
      setError(err instanceof Error ? err.message : 'Login failed');
      setIsLoading(false);
    }
  };

  const logout = async () => {
    console.log('Logging out...');
    setError(null);
    
    // Clear demo user
    localStorage.removeItem('demoUser');
    
    // Sign out from Supabase
    const { error } = await signOut();
    if (error) {
      console.error('Logout error:', error);
      setError(error.message);
    }
    
    // Reset state
    setUser(null);
    setAuthUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, authUser, login, logout, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
};