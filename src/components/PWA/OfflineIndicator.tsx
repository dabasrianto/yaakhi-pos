import React, { useState, useEffect } from 'react';

const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineMessage(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineMessage(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showOfflineMessage) {
    return null;
  }

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isOnline ? 'bg-green-500' : 'bg-red-500'
    }`}>
      <div className="flex items-center justify-center gap-2 px-4 py-2 text-white text-sm">
        <i className={`fas ${isOnline ? 'fa-wifi' : 'fa-wifi-slash'} text-sm`}></i>
        <span>
          {isOnline 
            ? 'Koneksi internet tersambung kembali' 
            : 'Tidak ada koneksi internet - Mode offline aktif'
          }
        </span>
        {isOnline && (
          <button
            onClick={() => setShowOfflineMessage(false)}
            className="ml-2 text-white hover:text-gray-200"
          >
            <i className="fas fa-times text-xs"></i>
          </button>
        )}
      </div>
    </div>
  );
};

export default OfflineIndicator;