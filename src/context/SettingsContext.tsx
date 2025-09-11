import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { useFirebase } from './FirebaseContext';
import { useAuth } from './AuthContext';

interface StoreSettings {
  storeName: string;
  storeAddress: string;
  storePhone: string;
  storeEmail: string;
  logoUrl: string;
  currency: string;
  taxRate: number;
  receiptFooter: string;
  theme: string;
  language: string;
  autoBackup: boolean;
  lowStockAlert: number;
  themeColor: string;
  printerSettings: {
    paperSize: string;
    copies: number;
    autoPrint: boolean;
  };
}

interface SettingsContextType {
  settings: StoreSettings;
  loading: boolean;
}

const defaultSettings: StoreSettings = {
  storeName: 'POS Keren',
  storeAddress: '',
  storePhone: '',
  storeEmail: '',
  logoUrl: '',
  currency: 'IDR',
  taxRate: 11,
  receiptFooter: 'Terima kasih atas kunjungan Anda!',
  theme: 'light',
  language: 'id',
  autoBackup: true,
  lowStockAlert: 5,
  themeColor: '#6366f1',
  printerSettings: {
    paperSize: '80mm',
    copies: 1,
    autoPrint: false
  }
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const { db, app } = useFirebase();
  const { user } = useAuth();

  const appId = app.options.projectId || '';

  useEffect(() => {
    if (!user) {
      setSettings(defaultSettings);
      setLoading(false);
      return;
    }

    const settingsRef = doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'store');
    
    const unsubscribe = onSnapshot(settingsRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data() as StoreSettings;
        setSettings(prev => ({ ...prev, ...data }));
      } else {
        setSettings(defaultSettings);
      }
      setLoading(false);
    }, (error) => {
      console.error('Error listening to settings:', error);
      setSettings(defaultSettings);
      setLoading(false);
    });

    return unsubscribe;
  }, [user, db, appId]);

  const value = {
    settings,
    loading
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};