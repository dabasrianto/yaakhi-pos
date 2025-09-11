import React, { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const PWAInstallButton: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

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

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Show platform-specific instructions
      const userAgent = navigator.userAgent.toLowerCase();
      let instructions = '';
      
      if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
        instructions = '📱 iOS Safari:\n1. Tap Share button (⬆️)\n2. Scroll down and tap "Add to Home Screen"\n3. Tap "Add" to confirm';
      } else if (userAgent.includes('android')) {
        instructions = '📱 Android Chrome:\n1. Tap menu (⋮) in top right\n2. Tap "Add to Home Screen" or "Install App"\n3. Tap "Add" to confirm';
      } else if (userAgent.includes('chrome')) {
        instructions = '💻 Desktop Chrome:\n1. Look for install icon (⬇️) in address bar\n2. Click it and select "Install"\n3. Or use menu → More Tools → Create Shortcut';
      } else {
        instructions = '💻 Desktop:\n1. Look for install option in browser menu\n2. Or bookmark this page for quick access\n3. Some browsers show install icon in address bar';
      }
      
      alert(`Install POS Keren as Native App:\n\n${instructions}\n\n✨ Benefits:\n• Works offline\n• Faster loading\n• Native app experience\n• Desktop/mobile shortcuts`);
      return;
    }

    setIsInstalling(true);
    
    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
        setIsInstalling(false);
      }
      
      setDeferredPrompt(null);
      setIsInstallable(false);
    } catch (error) {
      console.error('Error during installation:', error);
      setIsInstalling(false);
    }
  };

  // Don't show button if already installed
  if (isInstalled) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-sm bg-green-100 text-green-700 rounded-lg">
        <i className="fas fa-check text-sm"></i>
        <span className="hidden lg:inline">App Installed</span>
      </div>
    );
  }

  return (
    <button
      onClick={handleInstallClick}
      disabled={isInstalling}
      className="flex items-center gap-2 px-3 py-2 text-sm bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-300 text-white rounded-lg transition-colors"
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
          <span className="hidden lg:inline">Install App</span>
        </>
      )}
    </button>
  );
};

export default PWAInstallButton;