import React from 'react';
import { X, Keyboard } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({ isOpen, onClose }) => {
  const { settings } = useSettings();

  if (!isOpen) return null;

  const shortcuts = [
    {
      category: 'Navigasi Umum',
      items: [
        { keys: ['Ctrl', 'K'], description: 'Buka pencarian global' },
        { keys: ['Ctrl', 'D'], description: 'Pergi ke Dashboard' },
        { keys: ['Ctrl', 'P'], description: 'Pergi ke POS' },
        { keys: ['Ctrl', 'I'], description: 'Pergi ke Inventory' },
        { keys: ['Ctrl', 'R'], description: 'Pergi ke Reports' },
        { keys: ['Ctrl', 'U'], description: 'Pergi ke Customers' },
        { keys: ['?'], description: 'Tampilkan daftar shortcut ini' }
      ]
    },
    {
      category: 'POS & Transaksi',
      items: [
        { keys: ['Ctrl', 'N'], description: 'Transaksi baru' },
        { keys: ['Ctrl', 'S'], description: 'Simpan transaksi' },
        { keys: ['Ctrl', 'Enter'], description: 'Proses pembayaran' },
        { keys: ['Escape'], description: 'Batalkan transaksi' },
        { keys: ['F1'], description: 'Fokus ke pencarian produk' },
        { keys: ['F2'], description: 'Tambah diskon' },
        { keys: ['F3'], description: 'Tambah customer' }
      ]
    },
    {
      category: 'Inventory',
      items: [
        { keys: ['Ctrl', 'A'], description: 'Tambah produk baru' },
        { keys: ['Ctrl', 'E'], description: 'Edit produk terpilih' },
        { keys: ['Ctrl', 'F'], description: 'Fokus ke pencarian' }
      ]
    },
    {
      category: 'Lainnya',
      items: [
        { keys: ['Ctrl', ','], description: 'Buka Settings' },
        { keys: ['Alt', 'T'], description: 'Toggle dark mode' }
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>

      <div className="relative w-full max-w-3xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-h-[90vh] overflow-hidden">
        <div
          className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700"
          style={{ borderBottomColor: `${settings.themeColor || '#6366f1'}20` }}
        >
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-lg"
              style={{
                backgroundColor: `${settings.themeColor || '#6366f1'}20`,
                color: settings.themeColor || '#6366f1'
              }}
            >
              <Keyboard className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Keyboard Shortcuts
              </h2>
              <p className="text-sm text-gray-500">
                Gunakan shortcut untuk bekerja lebih cepat
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {shortcuts.map((section, index) => (
              <div key={index} className="space-y-3">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm uppercase tracking-wide">
                  {section.category}
                </h3>
                <div className="space-y-2">
                  {section.items.map((shortcut, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-750 rounded-lg"
                    >
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {shortcut.description}
                      </span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, keyIdx) => (
                          <React.Fragment key={keyIdx}>
                            <kbd
                              className="px-2 py-1 text-xs font-semibold rounded border shadow-sm"
                              style={{
                                backgroundColor: 'white',
                                borderColor: settings.themeColor || '#6366f1',
                                color: settings.themeColor || '#6366f1'
                              }}
                            >
                              {key}
                            </kbd>
                            {keyIdx < shortcut.keys.length - 1 && (
                              <span className="text-gray-400 text-xs">+</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
          <p className="text-xs text-gray-500 text-center">
            Tekan <kbd className="px-2 py-1 bg-white dark:bg-gray-800 rounded border text-xs">?</kbd> kapan saja untuk membuka panduan ini
          </p>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsHelp;
