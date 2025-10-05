import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Package, Users, ShoppingCart, TrendingUp } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useSettings } from '../../context/SettingsContext';
import { formatCurrency } from '../../utils/formatters';

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: string) => void;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose, onNavigate }) => {
  const { products, customers, sales } = useData();
  const { settings } = useSettings();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const searchResults = React.useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    const results: any[] = [];

    products
      .filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        (p.brand && p.brand.toLowerCase().includes(query))
      )
      .slice(0, 5)
      .forEach(product => {
        results.push({
          type: 'product',
          id: product.id,
          title: product.name,
          subtitle: `${product.category} - Stok: ${product.stock}`,
          price: product.price,
          action: () => {
            onNavigate('inventory-page');
            onClose();
          }
        });
      });

    customers
      .filter(c =>
        c.name.toLowerCase().includes(query) ||
        (c.phone && c.phone.includes(query)) ||
        (c.email && c.email.toLowerCase().includes(query))
      )
      .slice(0, 5)
      .forEach(customer => {
        results.push({
          type: 'customer',
          id: customer.id,
          title: customer.name,
          subtitle: customer.phone || customer.email || '',
          action: () => {
            onNavigate('customer-page');
            onClose();
          }
        });
      });

    sales
      .filter(s =>
        s.id.toLowerCase().includes(query) ||
        (s.customer && s.customer.name.toLowerCase().includes(query))
      )
      .slice(0, 5)
      .forEach(sale => {
        results.push({
          type: 'transaction',
          id: sale.id,
          title: `Transaksi #${sale.id.substring(0, 8)}`,
          subtitle: sale.customer ? sale.customer.name : 'Tamu',
          price: sale.finalTotal,
          action: () => {
            onNavigate('reports-page');
            onClose();
          }
        });
      });

    return results;
  }, [searchQuery, products, customers, sales]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, searchResults.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && searchResults[selectedIndex]) {
        e.preventDefault();
        searchResults[selectedIndex].action();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, searchResults, selectedIndex, onClose]);

  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'product':
        return <Package className="w-5 h-5" />;
      case 'customer':
        return <Users className="w-5 h-5" />;
      case 'transaction':
        return <ShoppingCart className="w-5 h-5" />;
      default:
        return <Search className="w-5 h-5" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'product':
        return 'Produk';
      case 'customer':
        return 'Pelanggan';
      case 'transaction':
        return 'Transaksi';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>

      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl">
        <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari produk, pelanggan, atau transaksi... (Ctrl+K)"
            className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400"
          />
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {searchQuery.trim() === '' ? (
            <div className="p-8 text-center text-gray-500">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Mulai mengetik untuk mencari...</p>
              <div className="mt-4 text-sm space-y-1">
                <p className="font-medium">Tips Pencarian:</p>
                <p>• Ketik nama produk atau kategori</p>
                <p>• Cari pelanggan dengan nama atau telepon</p>
                <p>• Temukan transaksi dengan ID atau nama pelanggan</p>
              </div>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Tidak ada hasil untuk "{searchQuery}"</p>
            </div>
          ) : (
            <div className="py-2">
              {searchResults.map((result, index) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={result.action}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full flex items-center gap-4 px-4 py-3 transition-colors ${
                    index === selectedIndex
                      ? 'bg-gray-100 dark:bg-gray-700'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-750'
                  }`}
                >
                  <div
                    className="p-2 rounded-lg"
                    style={{
                      backgroundColor: `${settings.themeColor || '#6366f1'}20`,
                      color: settings.themeColor || '#6366f1'
                    }}
                  >
                    {getIcon(result.type)}
                  </div>

                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {result.title}
                      </span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${settings.themeColor || '#6366f1'}20`,
                          color: settings.themeColor || '#6366f1'
                        }}
                      >
                        {getTypeLabel(result.type)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {result.subtitle}
                    </p>
                  </div>

                  {result.price !== undefined && (
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(result.price, settings.currency)}
                      </p>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 rounded-b-xl">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <span><kbd className="px-2 py-1 bg-white dark:bg-gray-800 rounded border">↑↓</kbd> Navigate</span>
              <span><kbd className="px-2 py-1 bg-white dark:bg-gray-800 rounded border">Enter</kbd> Select</span>
              <span><kbd className="px-2 py-1 bg-white dark:bg-gray-800 rounded border">Esc</kbd> Close</span>
            </div>
            <span>{searchResults.length} hasil ditemukan</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalSearch;
