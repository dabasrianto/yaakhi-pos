import React, { useState, useEffect } from 'react';
import LandingPage from './components/Auth/LandingPage';
import Dashboard from './components/Dashboard/Dashboard';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import AppLoader from './components/Common/AppLoader';
import GlobalSearch from './components/Common/GlobalSearch';
import KeyboardShortcutsHelp from './components/Common/KeyboardShortcutsHelp';
import WelcomeModal from './components/Common/WelcomeModal';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { SettingsProvider } from './context/SettingsContext';
import PWAUpdateNotification from './components/PWA/PWAUpdateNotification';
import OfflineIndicator from './components/PWA/OfflineIndicator';
import { useAuth } from './context/AuthContext';
import { useSettings } from './context/SettingsContext';
import POSPage from './components/POS/POSPage';
import InventoryPage from './components/Inventory/InventoryPage';
import CustomerPage from './components/Customers/CustomerPage';
import ReportsPage from './components/Reports/ReportsPage';
import SettingsPage from './components/Settings/SettingsPage';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const { settings } = useSettings();
  const [currentPage, setCurrentPage] = useState('dashboard-page');
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (user) {
      const hasSeenWelcome = localStorage.getItem(`welcome_shown_${user.id}`);
      if (!hasSeenWelcome) {
        setTimeout(() => setShowWelcome(true), 500);
      }
    }
  }, [user]);

  const handleWelcomeComplete = () => {
    if (user) {
      localStorage.setItem(`welcome_shown_${user.id}`, 'true');
    }
  };

  useKeyboardShortcuts(
    [
      {
        key: 'k',
        ctrl: true,
        handler: () => setShowGlobalSearch(true),
        description: 'Open global search',
      },
      {
        key: '?',
        handler: () => setShowShortcutsHelp(true),
        description: 'Show keyboard shortcuts',
      },
      {
        key: 'd',
        ctrl: true,
        handler: () => setCurrentPage('dashboard-page'),
        description: 'Go to Dashboard',
      },
      { key: 'p', ctrl: true, handler: () => setCurrentPage('pos-page'), description: 'Go to POS' },
      {
        key: 'i',
        ctrl: true,
        handler: () => setCurrentPage('inventory-page'),
        description: 'Go to Inventory',
      },
      {
        key: 'r',
        ctrl: true,
        handler: () => setCurrentPage('reports-page'),
        description: 'Go to Reports',
      },
      {
        key: 'u',
        ctrl: true,
        handler: () => setCurrentPage('customer-page'),
        description: 'Go to Customers',
      },
      {
        key: ',',
        ctrl: true,
        handler: () => setCurrentPage('settings-page'),
        description: 'Go to Settings',
      },
    ],
    user !== null
  );

  if (loading) {
    return <AppLoader />;
  }

  if (!user) {
    return <LandingPage />;
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard-page':
        return <Dashboard onPageChange={setCurrentPage} />;
      case 'pos-page':
        return <POSPage />;
      case 'inventory-page':
        return <InventoryPage />;
      case 'customer-page':
        return <CustomerPage />;
      case 'reports-page':
        return <ReportsPage />;
      case 'settings-page':
        return <SettingsPage />;
      default:
        return <Dashboard onPageChange={setCurrentPage} />;
    }
  };

  return (
    <DataProvider>
      <OfflineIndicator />
      <GlobalSearch
        isOpen={showGlobalSearch}
        onClose={() => setShowGlobalSearch(false)}
        onNavigate={setCurrentPage}
      />
      <KeyboardShortcutsHelp
        isOpen={showShortcutsHelp}
        onClose={() => setShowShortcutsHelp(false)}
      />
      <WelcomeModal
        isOpen={showWelcome}
        onClose={() => setShowWelcome(false)}
        onComplete={handleWelcomeComplete}
      />
      <div className="w-full h-screen flex flex-col lg:flex-row bg-slate-50 dark:bg-gray-900 text-slate-800 dark:text-gray-100 relative transition-colors duration-300">
        <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />

        <div className="flex-1 flex flex-col lg:ml-16 min-w-0">
          <Header currentPage={currentPage} />

          <main className="flex-grow overflow-y-auto p-2 lg:p-4 relative">
            {renderCurrentPage()}
          </main>
        </div>
        <PWAUpdateNotification />

        <button
          onClick={() => setShowGlobalSearch(true)}
          className="fixed bottom-6 right-6 p-4 rounded-full shadow-lg transition-all hover:scale-110 z-40"
          style={{
            backgroundColor: settings.themeColor || '#6366f1',
            color: 'white',
          }}
          title="Search (Ctrl+K)"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>

        <button
          onClick={() => setShowShortcutsHelp(true)}
          className="fixed bottom-6 right-24 p-3 bg-gray-800 dark:bg-gray-700 text-white rounded-full shadow-lg transition-all hover:scale-110 z-40"
          title="Keyboard Shortcuts (?)"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </button>
      </div>
    </DataProvider>
  );
};

function App() {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-dark-bg transition-colors duration-300">
      <AuthProvider>
        <SettingsProvider>
          <AppContent />
        </SettingsProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
