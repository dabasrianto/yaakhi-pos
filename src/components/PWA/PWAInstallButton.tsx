import React, { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// Extend Window interface to include our custom properties
declare global {
  interface Window {
    deferredPrompt?: BeforeInstallPromptEvent;
  }
}

const PWAInstallButton: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');

  useEffect(() => {
    console.log('PWAInstallButton: Component mounted');
    
    // Check if app is already installed
    const checkIfInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches || 
          (window.navigator as any).standalone === true) {
        console.log('PWAInstallButton: App is already installed');
        setIsInstalled(true);
        return true;
      }
      return false;
    };

    const installed = checkIfInstalled();
    
    // Set debug info
    const userAgent = navigator.userAgent;
    const isHttps = location.protocol === 'https:';
    const hasServiceWorker = 'serviceWorker' in navigator;
    
    setDebugInfo(`
      HTTPS: ${isHttps}
      SW Support: ${hasServiceWorker}
      User Agent: ${userAgent.substring(0, 50)}...
      Installed: ${installed}
    `);
    
    console.log('PWA Debug Info:', {
      isHttps,
      hasServiceWorker,
      userAgent: userAgent.substring(0, 100),
      installed,
      standalone: window.matchMedia('(display-mode: standalone)').matches
    });

    // Listen for custom PWA events
    const handlePWAInstallable = (e: CustomEvent) => {
      console.log('PWAInstallButton: PWA installable event received', e.detail);
      e.preventDefault();
      setDeferredPrompt(e.detail);
      setIsInstallable(true);
    };

    const handlePWAInstalled = () => {
      console.log('PWAInstallButton: PWA installed event received');
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      setIsInstalling(false);
    };

    // Also listen for direct beforeinstallprompt (fallback)
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('PWAInstallButton: Direct beforeinstallprompt event');
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener('pwa-installable', handlePWAInstallable as EventListener);
    window.addEventListener('pwa-installed', handlePWAInstalled);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handlePWAInstalled);
    
    // Check if deferredPrompt is already available
    if (window.deferredPrompt) {
      console.log('PWAInstallButton: Found existing deferredPrompt');
      setDeferredPrompt(window.deferredPrompt);
      setIsInstallable(true);
    }

    return () => {
      window.removeEventListener('pwa-installable', handlePWAInstallable as EventListener);
      window.removeEventListener('pwa-installed', handlePWAInstalled);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handlePWAInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    console.log('PWAInstallButton: Install button clicked', { deferredPrompt: !!deferredPrompt });
    
    if (!deferredPrompt) {
      console.log('PWAInstallButton: No deferredPrompt available, showing manual instructions');
      const userAgent = navigator.userAgent.toLowerCase();
      let instructions = '';
      
      if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
        instructions = '📱 iOS Safari:\n1. Tap Share button (⬆️) di bawah\n2. Scroll dan tap "Add to Home Screen"\n3. Tap "Add" untuk konfirmasi\n\n✨ App akan muncul di home screen seperti app native!';
      } else if (userAgent.includes('android')) {
        instructions = '📱 Android Chrome:\n1. Tap menu (⋮) di pojok kanan atas\n2. Tap "Add to Home Screen" atau "Install App"\n3. Tap "Add" untuk konfirmasi\n\n✨ App akan terinstall seperti app native!';
      } else if (userAgent.includes('chrome')) {
        instructions = '💻 Desktop Chrome:\n1. Cari icon install (⬇️) di address bar\n2. Klik dan pilih "Install"\n3. Atau gunakan menu → More Tools → Create Shortcut\n\n✨ App akan terinstall di desktop!';
      } else {
        instructions = '💻 Browser lain:\n1. Cari opsi install di menu browser\n2. Atau bookmark halaman ini untuk akses cepat\n3. Beberapa browser menampilkan icon install di address bar\n\n✨ Coba refresh halaman jika tidak muncul!';
      }
      
      alert(`🚀 Install POS Keren sebagai Native App:\n\n${instructions}\n\n🎯 Keuntungan:\n• Bekerja offline\n• Loading lebih cepat\n• Pengalaman seperti app native\n• Shortcut di desktop/mobile\n\n${debugInfo}`);
      return;
    }

    console.log('PWAInstallButton: Triggering install prompt');
    setIsInstalling(true);
    
    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      console.log('PWAInstallButton: User choice:', choiceResult.outcome);
      
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
        setIsInstalling(false);
      }
      
      setDeferredPrompt(null);
      window.deferredPrompt = undefined;
      setIsInstallable(false);
    } catch (error) {
      console.error('Error during installation:', error);
      setIsInstalling(false);
      alert('Terjadi kesalahan saat menginstall aplikasi. Silakan coba lagi atau gunakan cara manual.');
    }
  };

  // Don't show button if already installed
  if (isInstalled) {
    return (
      <div className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm bg-green-500/20 text-white rounded-lg">
        <i className="fas fa-check text-sm"></i>
        <span className="hidden lg:inline">App Installed</span>
      </div>
    );
  }

  return (
    <button
      onClick={handleInstallClick}
      disabled={isInstalling}
      className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm bg-white/10 hover:bg-white/20 disabled:bg-white/5 text-white rounded-lg transition-colors"
      title={isInstalling ? "Installing POS Keren..." : "Install POS Keren App"}
    >
      {isInstalling ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span className="hidden lg:inline">Installing...</span>
        </>
      ) : (
        <>
          <i className="fas fa-download text-sm"></i>
          <span className="hidden lg:inline">{isInstallable ? 'Install App' : 'Get App'}</span>
        </>
      )}
    </button>
  );
};

export default PWAInstallButton;