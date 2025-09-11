import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import PWAInstallButton from '../PWA/PWAInstallButton';

interface HeaderProps {
  currentPage: string;
}

const Header: React.FC<HeaderProps> = ({ currentPage }) => {
  const { user, logout, trialStatus, trialDaysLeft } = useAuth();
  const { settings, isDarkMode, toggleTheme } = useSettings();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getPageTitle = (pageId: string) => {
    const titles: { [key: string]: string } = {
      'dashboard-page': 'Dashboard',
      'pos-page': 'Kasir',
      'inventory-page': 'Inventori',
      'customer-page': 'Pelanggan',
      'reports-page': 'Laporan',
      'settings-page': 'Pengaturan'
    };
    return titles[pageId] || 'Dashboard';
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).replace(/\./g, ':');
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTrialStatusDisplay = () => {
    if (trialStatus === 'active') {
      return (
        <div className="text-right bg-green-400 text-green-900 px-2 lg:px-3 py-1 rounded-full text-xs font-semibold">
          Akun Aktif
        </div>
      );
    } else {
      return (
        <div className="text-right bg-amber-400 text-amber-900 px-2 lg:px-3 py-1 rounded-full text-xs font-semibold">
          <span className="hidden sm:inline">
            Sisa Trial: 
          </span>
          {trialDaysLeft} hari
        </div>
      );
    }
  };

  return (
    <header 
      className={`text-white shadow-md p-3 lg:p-4 flex-shrink-0 flex items-center justify-between ${
        isDarkMode ? 'shadow-gray-900/20' : ''
      }`}
      style={{ backgroundColor: settings.themeColor || '#6366f1' }}
    >
      <div className="flex items-center min-w-0">
        <h1 className="text-lg lg:text-xl font-bold truncate">{getPageTitle(currentPage)}</h1>
      </div>
      <div className="flex items-center gap-2 lg:gap-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'} text-sm`}></i>
        </button>
        
        {/* Download App Button */}
        <button
          onClick={() => {
            // Trigger install prompt if available
            const installEvent = (window as any).deferredPrompt;
            if (installEvent) {
              installEvent.prompt();
              installEvent.userChoice.then((choiceResult: any) => {
                if (choiceResult.outcome === 'accepted') {
                  console.log('User accepted the install prompt');
                }
                (window as any).deferredPrompt = null;
              });
            } else {
              // Show manual install instructions
              alert('Untuk menginstall aplikasi:\n\n📱 Android/Desktop: Klik ikon install di address bar browser\n🍎 iOS: Safari → Share → Add to Home Screen');
            }
          }}
          className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
          title="Download & Install App"
        >
          <i className="fas fa-download text-sm"></i>
          <span className="hidden lg:inline">Download App</span>
        </button>
        
        {getTrialStatusDisplay()}
        <div className="text-right hidden sm:block">
          <div className="font-semibold text-sm lg:text-lg">{formatTime(currentTime)}</div>
          <div className="text-xs opacity-80 hidden lg:block">{formatDate(currentTime)}</div>
        </div>
        <div className="border-l border-white/30 pl-2 lg:pl-4">
          <p className="text-xs lg:text-sm font-semibold truncate max-w-[100px] lg:max-w-[150px]">
            {user?.displayName || user?.email}
          </p>
          <button
            onClick={logout}
            className="text-xs opacity-80 hover:opacity-100 hover:underline hidden lg:block"
          >
            <i className="lni lni-exit mr-1"></i>Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;