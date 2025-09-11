import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useFirebase } from './FirebaseContext';

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
  const { auth, db, app } = useFirebase();

  const appId = app.options.projectId || '';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user ? 'User logged in' : 'User logged out');
      setLoading(true);
      
      if (user) {
        try {
          await handleUserSession(user);
        } catch (error) {
          console.error('Error handling user session:', error);
          setLoading(false);
        }
      } else {
        setUser(null);
        setTrialStatus('trial');
        setTrialDaysLeft(7);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [auth, db, appId]);

  const handleUserSession = async (user: User) => {
    console.log('Handling user session for:', user.email);
    
    try {
      const userDocRef = doc(db, 'artifacts', appId, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        console.log('Creating new user document');
        await setDoc(userDocRef, {
          email: user.email,
          displayName: user.displayName,
          createdAt: serverTimestamp(),
          subscriptionStatus: 'trial',
        });
      }

      const userData = (await getDoc(userDocRef)).data();
      const creationTime = user.metadata.creationTime ? new Date(user.metadata.creationTime) : new Date();
      const now = new Date();
      const trialDays = 7;
      const daysSinceCreation = (now.getTime() - creationTime.getTime()) / (1000 * 60 * 60 * 24);
      const trialExpired = daysSinceCreation > trialDays;
      
      console.log('User data:', userData);
      console.log('Days since creation:', daysSinceCreation);
      console.log('Trial expired:', trialExpired);
      
      if (userData?.subscriptionStatus === 'active') {
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
      console.log('User session handled successfully');
      
    } catch (error) {
      console.error('Error handling user session:', error);
      // Don't set user if there's an error, but still stop loading
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    user,
    loading,
    trialStatus,
    trialDaysLeft,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};