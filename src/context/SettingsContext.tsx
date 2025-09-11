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
  isDarkMode: boolean;
  toggleTheme: () => void;
  currentLanguage: string;
  translations: any;
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

// Translations
const translations = {
  id: {
    dashboard: 'Dashboard',
    pos: 'Kasir',
    inventory: 'Inventori',
    customers: 'Pelanggan',
    reports: 'Laporan',
    settings: 'Pengaturan',
    welcome: 'Selamat Datang di Dashboard',
    todayRevenue: 'Revenue Hari Ini',
    todayProfit: 'Keuntungan Hari Ini',
    todayTransactions: 'Transaksi Hari Ini',
    stockValue: 'Nilai Stok',
    addProduct: 'Tambah Produk',
    addCustomer: 'Tambah Pelanggan',
    cart: 'Keranjang',
    checkout: 'Bayar',
    total: 'Total',
    subtotal: 'Subtotal',
    discount: 'Diskon',
    tax: 'Pajak',
    cash: 'Tunai',
    bankTransfer: 'Transfer Bank',
    eWallet: 'E-Wallet',
    balance: 'Saldo',
    save: 'Simpan',
    cancel: 'Batal',
    delete: 'Hapus',
    edit: 'Edit',
    search: 'Cari',
    filter: 'Filter',
    export: 'Ekspor',
    print: 'Print',
    logout: 'Logout'
  },
  en: {
    dashboard: 'Dashboard',
    pos: 'POS',
    inventory: 'Inventory',
    customers: 'Customers',
    reports: 'Reports',
    settings: 'Settings',
    welcome: 'Welcome to Dashboard',
    todayRevenue: 'Today\'s Revenue',
    todayProfit: 'Today\'s Profit',
    todayTransactions: 'Today\'s Transactions',
    stockValue: 'Stock Value',
    addProduct: 'Add Product',
    addCustomer: 'Add Customer',
    cart: 'Cart',
    checkout: 'Checkout',
    total: 'Total',
    subtotal: 'Subtotal',
    discount: 'Discount',
    tax: 'Tax',
    cash: 'Cash',
    bankTransfer: 'Bank Transfer',
    eWallet: 'E-Wallet',
    balance: 'Balance',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    search: 'Search',
    filter: 'Filter',
    export: 'Export',
    print: 'Print',
    logout: 'Logout'
  }
};
const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { db, app } = useFirebase();
  const { user } = useAuth();

  const appId = app.options.projectId || '';

  // Apply theme to document
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
        // Auto theme based on system preference
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

    // Listen for system theme changes if auto mode
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

  const toggleTheme = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    setSettings(prev => ({ ...prev, theme: newTheme }));
  };
  const value = {
    settings,
    loading,
    isDarkMode,
    toggleTheme,
    currentLanguage: settings.language,
    translations: translations[settings.language as keyof typeof translations] || translations.id
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