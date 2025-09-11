import React, { useState } from 'react';
import { useSettings } from '../../context/SettingsContext';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { settings, isDarkMode, translations } = useSettings();
  
  // Close sidebar when clicking on navigation item on mobile
  const handleNavClick = (pageId: string) => {
    onPageChange(pageId);
    if (window.innerWidth < 1024) {
      setIsExpanded(false);
    }
  };

  const navItems = [
    { 
      id: 'dashboard-page', 
      icon: 'lni lni-dashboard', 
      label: translations.dashboard,
      tooltip: settings.language === 'en' ? 'View business summary and today\'s statistics' : 'Lihat ringkasan bisnis dan statistik hari ini'
    },
    { 
      id: 'pos-page', 
      icon: 'lni lni-calculator', 
      label: translations.pos,
      tooltip: settings.language === 'en' ? 'Point of Sale system for sales transactions' : 'Sistem Point of Sale untuk transaksi penjualan'
    },
    { 
      id: 'inventory-page', 
      icon: 'lni lni-package', 
      label: translations.inventory,
      tooltip: settings.language === 'en' ? 'Manage product stock and inventory reports' : 'Kelola stok produk dan laporan inventori'
    },
    { 
      id: 'customer-page', 
      icon: 'lni lni-users', 
      label: translations.customers,
      tooltip: settings.language === 'en' ? 'Customer data management and transaction history' : 'Manajemen data pelanggan dan riwayat transaksi'
    },
    { 
      id: 'reports-page', 
      icon: 'lni lni-bar-chart', 
      label: translations.reports,
      tooltip: settings.language === 'en' ? 'Sales analysis and financial reports' : 'Analisis penjualan dan laporan keuangan'
    },
    { 
      id: 'settings-page', 
      icon: 'lni lni-cog', 
      label: translations.settings,
      tooltip: settings.language === 'en' ? 'Application configuration and system settings' : 'Konfigurasi aplikasi dan pengaturan sistem'
    }
  ];

  return (
    <>
      {/* Overlay for mobile when sidebar is expanded */}
      {isExpanded && window.innerWidth < 1024 && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-[60] lg:hidden"
          onClick={() => setIsExpanded(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full ${isDarkMode ? 'bg-dark-surface' : 'bg-white'} shadow-lg z-[70] transition-all duration-300 ease-in-out lg:relative lg:z-auto
        ${isExpanded ? 'w-64' : 'w-16'}
        flex flex-col lg:translate-x-0
        ${!isExpanded && window.innerWidth < 1024 ? '-translate-x-full' : 'translate-x-0'}
      `}>
        {/* Sidebar Header */}
        <div className={`flex items-center justify-between p-4 border-b ${isDarkMode ? 'border-gray-600' : 'border-slate-200'}`}>
          <div className={`flex items-center gap-3 transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
            {settings.logoUrl ? (
              <img 
                src={settings.logoUrl} 
                alt="Logo" 
                className="w-8 h-8 rounded-lg object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={`w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 ${settings.logoUrl ? 'hidden' : ''}`}>
              <i className="lni lni-store text-lg"></i>
            </div>
            {isExpanded && <span className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{settings.storeName}</span>}
          </div>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-slate-100'} transition-colors`}
            title={isExpanded ? (settings.language === 'en' ? 'Close Menu' : 'Tutup Menu') : (settings.language === 'en' ? 'Open Menu' : 'Buka Menu')}
          >
            <i className={`lni ${isExpanded ? 'lni-chevron-left' : 'lni-menu'} ${isDarkMode ? 'text-gray-300' : 'text-slate-600'}`}></i>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              title={!isExpanded ? item.tooltip : ''}
              className={`
                w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200
                ${currentPage === item.id 
                  ? `text-white border-r-2` 
                  : `${isDarkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'}`
                }
              `}
              style={currentPage === item.id ? { 
                backgroundColor: settings.themeColor || '#6366f1',
                borderRightColor: settings.themeColor || '#6366f1'
              } : {}}
            >
              <i className={`${item.icon} text-xl flex-shrink-0`}></i>
              <span className={`
                transition-all duration-300 whitespace-nowrap
                ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}
              `}>
                {item.label}
              </span>
            </button>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className={`p-4 border-t ${isDarkMode ? 'border-gray-600' : 'border-slate-200'}`}>
          <div className={`
            text-xs ${isDarkMode ? 'text-gray-400' : 'text-slate-500'} transition-opacity duration-300
            ${isExpanded ? 'opacity-100' : 'opacity-0'}
          `}>
            {isExpanded && (
              <div>
                <p className="font-semibold">POS & Inventory</p>
                <p>Version 2.0.0</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Toggle Button (visible when sidebar is collapsed on mobile) */}
      <button
        onClick={() => setIsExpanded(true)}
        className={`
          fixed top-4 left-4 z-[50] p-3 text-white rounded-lg shadow-lg
          lg:hidden transition-all duration-300
          ${isExpanded ? 'opacity-0 pointer-events-none' : 'opacity-100'}
        `}
        style={{ backgroundColor: settings.themeColor || '#6366f1' }}
        title={settings.language === 'en' ? 'Open Navigation Menu' : 'Buka Menu Navigasi'}
      >
        <i className="lni lni-menu"></i>
      </button>
    </>
  );
};

export default Sidebar;