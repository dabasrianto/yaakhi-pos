import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

interface StoreSettings {
  storeName: string;
  storeAddress: string;
  storePhone: string;
  storeEmail: string;
  currency: string;
  taxRate: number;
  receiptFooter: string;
  theme: string;
  autoBackup: boolean;
  lowStockAlert: number;
  themeColor: string;
  language: string;
  printerSettings: {
    paperSize: string;
    copies: number;
    autoPrint: boolean;
  };
}

interface Translations {
  welcome: string;
  todayRevenue: string;
  todayProfit: string;
  todayTransactions: string;
  stockValue: string;
  inventory: string;
  customers: string;
}

const indonesianTranslations: Translations = {
  welcome: 'Selamat Datang',
  todayRevenue: 'Pemasukan Hari Ini',
  todayProfit: 'Keuntungan Hari Ini',
  todayTransactions: 'Transaksi Hari Ini',
  stockValue: 'Nilai Stok',
  inventory: 'Inventori',
  customers: 'Pelanggan',
};

interface SettingsContextType {
  settings: StoreSettings;
  loading: boolean;
  isDarkMode: boolean;
  toggleTheme: () => void;
  translations: Translations;
}

const defaultSettings: StoreSettings = {
  storeName: 'POS Keren',
  storeAddress: '',
  storePhone: '',
  storeEmail: '',
  currency: 'IDR',
  taxRate: 11,
  receiptFooter: 'Terima kasih atas kunjungan Anda!',
  theme: 'light',
  autoBackup: true,
  lowStockAlert: 5,
  themeColor: '#6366f1',
  language: 'id',
  printerSettings: {
    paperSize: '80mm',
    copies: 1,
    autoPrint: false,
  },
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const applyTheme = () => {
      const root = document.documentElement;

      if (settings.theme === 'dark') {
        root.classList.add('dark');
        setIsDarkMode(true);
      } else if (settings.theme === 'light') {
        root.classList.remove('dark');
        setIsDarkMode(false);
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
          root.classList.add('dark');
          setIsDarkMode(true);
        } else {
          root.classList.remove('dark');
          setIsDarkMode(false);
        }
      }
    };

    applyTheme();

    if (settings.theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', applyTheme);
      return () => mediaQuery.removeEventListener('change', applyTheme);
    }
  }, [settings.theme]);

  useEffect(() => {
    if (!user) {
      setSettings(defaultSettings);
      setLoading(false);
      return;
    }

    const settingsKey = `settings_${user.id}`;
    const savedSettings = localStorage.getItem(settingsKey);

    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings((prev) => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Error parsing settings:', error);
        setSettings(defaultSettings);
      }
    } else {
      setSettings(defaultSettings);
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (user && settings !== defaultSettings) {
      const settingsKey = `settings_${user.id}`;
      localStorage.setItem(settingsKey, JSON.stringify(settings));
    }
  }, [settings, user]);

  const toggleTheme = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    setSettings((prev) => ({ ...prev, theme: newTheme }));
  };

  const value = {
    settings,
    loading,
    isDarkMode,
    toggleTheme,
    translations: indonesianTranslations,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
