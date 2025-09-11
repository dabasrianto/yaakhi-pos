import React, { createContext, useContext } from 'react';
import { Firestore } from 'firebase/firestore';
import { Auth } from 'firebase/auth';
import { FirebaseApp } from 'firebase/app';

interface FirebaseContextType {
  db: Firestore;
  auth: Auth;
  app: FirebaseApp;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const FirebaseProvider: React.FC<{
  value: FirebaseContextType;
  children: React.ReactNode;
}> = ({ value, children }) => (
  <FirebaseContext.Provider value={value}>
    {children}
  </FirebaseContext.Provider>
);

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};