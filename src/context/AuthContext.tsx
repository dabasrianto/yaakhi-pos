import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  trialStatus: 'trial' | 'active' | 'expired';
  trialDaysLeft: number;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [trialStatus, setTrialStatus] = useState<'trial' | 'active' | 'expired'>('trial');
  const [trialDaysLeft, setTrialDaysLeft] = useState(7);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        handleUserSession(session.user);
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        handleUserSession(session.user);
      } else {
        setUser(null);
        setTrialStatus('trial');
        setTrialDaysLeft(7);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleUserSession = async (user: User) => {
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (!profile) {
        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert({
            id: user.id,
            email: user.email,
            display_name: user.user_metadata?.display_name || '',
            subscription_status: 'trial',
            trial_start_date: new Date().toISOString(),
          });

        if (insertError) throw insertError;
      }

      const profileData = profile || {
        subscription_status: 'trial',
        trial_start_date: new Date().toISOString(),
      };

      const trialStartDate = new Date(profileData.trial_start_date || user.created_at);
      const now = new Date();
      const trialDays = 7;
      const daysSinceCreation = (now.getTime() - trialStartDate.getTime()) / (1000 * 60 * 60 * 24);
      const trialExpired = daysSinceCreation > trialDays;

      if (profileData.subscription_status === 'active') {
        setTrialStatus('active');
        setTrialDaysLeft(0);
      } else if (trialExpired) {
        setTrialStatus('expired');
        setTrialDaysLeft(0);
      } else {
        setTrialStatus('trial');
        setTrialDaysLeft(Math.ceil(trialDays - daysSinceCreation));
      }

      setUser(user);
    } catch (error) {
      console.error('Error handling user session:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    user,
    loading,
    trialStatus,
    trialDaysLeft,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
