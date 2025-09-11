import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import LandingPage from './components/Auth/LandingPage';
import LoginPage from './components/Auth/LoginPage';
import Dashboard from './components/Dashboard/Dashboard';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import AppLoader from './components/Common/AppLoader';
import SubscriptionModal from './components/Modals/SubscriptionModal';
import { FirebaseProvider } from './context/FirebaseContext';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { SettingsProvider } from './context/SettingsContext';
import PWAUpdateNotification from './components/PWA/PWAUpdateNotification';
import OfflineIndicator from './components/PWA/OfflineIndicator';
import { useAuth } from './context/AuthContext';
import POSPage from './components/POS/POSPage';
import InventoryPage from './components/Inventory/InventoryPage';
import CustomerPage from './components/Customers/CustomerPage';
import ReportsPage from './components/Reports/ReportsPage';
import SettingsPage from './components/Settings/SettingsPage';

// Firebase Configuration (mempertahankan konfigurasi yang ada)
const firebaseConfig = {
  apiKey: "AIzaSyCY1NumwcZGXa4x1IRR07BRyPJ64r_Ebtw",
  authDomain: "gemini-posv2.firebaseapp.com",
  projectId: "gemini-posv2",
  storageBucket: "gemini-posv2.appspot.com",
  messagingSenderId: "324278081465",
  appId: "1:324278081465:web:0dab2755ad3f586ecdc868",
  measurementId: "G-7HC2TYELJW"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const AppContent: React.FC = () => {
  const { user, loading, trialStatus } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard-page');
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  useEffect(() => {
    if (trialStatus === 'expired') {
      setShowSubscriptionModal(true);
    } else {
      setShowSubscriptionModal(false);
    }
  }, [trialStatus]);

  // Show loading while auth is being determined
  if (loading) {
    return <AppLoader />;
  }

  // Show landing page if no user
  if (!user) {
    return <LandingPage />;
  }

  // Show subscription modal if trial expired
  if (trialStatus === 'expired') {
    return (
      <SubscriptionModal 
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
      />
    );
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
      <div className="w-full h-screen flex flex-col lg:flex-row bg-slate-50 text-slate-800 relative">
        <Sidebar 
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
        
        <div className="flex-1 flex flex-col lg:ml-16 min-w-0">
          <Header currentPage={currentPage} />
          
          <main className="flex-grow overflow-y-auto p-2 lg:p-4 relative">
            {renderCurrentPage()}
          </main>
        </div>
        <PWAUpdateNotification />
      </div>
    </DataProvider>
  );
};

function App() {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-dark-bg transition-colors duration-300">
      <FirebaseProvider value={{ db, auth, app }}>
        <AuthProvider>
          <SettingsProvider>
            <AppContent />
          </SettingsProvider>
        </AuthProvider>
      </FirebaseProvider>
    </div>
  );
}

export default App;