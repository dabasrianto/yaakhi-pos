import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface HeaderProps {
  currentPage: string;
}

const Header: React.FC<HeaderProps> = ({ currentPage }) => {
  const { user, logout, trialStatus, trialDaysLeft } = useAuth();
  const { settings, isDarkMode, toggleTheme } = useSettings();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Check if app is already installed
    const checkIfInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches || 
          (window.navigator as any).standalone === true) {
        setIsInstalled(true);
      }
    };

    checkIfInstalled();

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      setIsInstalling(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleDirectInstall = async () => {
    if (!deferredPrompt) {
      // Fallback: Show manual install instructions
      const userAgent = navigator.userAgent.toLowerCase();
      let instructions = '';
      
      if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
        instructions = '📱 iOS: Tap Share button → Add to Home Screen';
      } else if (userAgent.includes('android')) {
        instructions = '📱 Android: Tap menu (⋮) → Add to Home Screen atau Install App';
      } else {
        instructions = '💻 Desktop: Look for install icon in address bar atau bookmark this page';
      }
      
      alert(`Install POS Keren:\n\n${instructions}\n\nSetelah diinstall, aplikasi akan berjalan seperti native app!`);
      return;
    }

    setIsInstalling(true);
    
    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
        // App will be installed, handleAppInstalled will be called
      } else {
        console.log('User dismissed the install prompt');
        setIsInstalling(false);
      }
      
      setDeferredPrompt(null);
      setIsInstallable(false);
    } catch (error) {
      console.error('Error during installation:', error);
      setIsInstalling(false);
      alert('Terjadi kesalahan saat menginstall aplikasi. Silakan coba lagi.');
    }
  };

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
        {!isInstalled && (
          <button
            onClick={handleDirectInstall}
            disabled={isInstalling}
            className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm bg-white/10 hover:bg-white/20 disabled:bg-white/5 text-white rounded-lg transition-colors"
            title={isInstalling ? "Installing..." : "Install POS Keren App"}
          >
            {isInstalling ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="hidden lg:inline">Installing...</span>
              </>
            ) : (
              <>
                <i className="fas fa-download text-sm"></i>
                <span className="hidden lg:inline">Install App</span>
              </>
            )}
          </button>
        )}
        
        {isInstalled && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm bg-green-500/20 text-white rounded-lg">
            <i className="fas fa-check text-sm"></i>
            <span className="hidden lg:inline">App Installed</span>
          </div>
        )}
        
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