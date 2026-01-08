import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatters';

interface StoreSettings {
  storeName: string;
  storeAddress: string;
  storePhone: string;
  storeEmail: string;
  logoUrl: string;
  currency: string;
  taxRate: number;
  receiptFooter: string;
  theme: string;
  language: string;
  autoBackup: boolean;
  lowStockAlert: number;
  themeColor: string;
  printerSettings: {
    paperSize: string;
    copies: number;
    autoPrint: boolean;
  };
}

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<StoreSettings>({
    storeName: 'POS Keren',
    storeAddress: '',
    storePhone: '',
    storeEmail: '',
    logoUrl: '',
    currency: 'IDR',
    taxRate: 11,
    receiptFooter: 'Terima kasih atas kunjungan Anda!',
    theme: 'light',
    language: 'id',
    autoBackup: true,
    lowStockAlert: 5,
    themeColor: '#6366f1',
    printerSettings: {
      paperSize: '80mm',
      copies: 1,
      autoPrint: false,
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('store');
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, [user]);

  const loadSettings = () => {
    if (!user) return;

    try {
      const settingsKey = `settings_${user.id}`;
      const savedSettings = localStorage.getItem(settingsKey);

      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings((prev) => ({ ...prev, ...parsed }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = () => {
    if (!user) return;

    setSaving(true);
    try {
      const settingsKey = `settings_${user.id}`;
      localStorage.setItem(settingsKey, JSON.stringify(settings));

      setSaveMessage('Pengaturan berhasil disimpan!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveMessage('Gagal menyimpan pengaturan');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setSettings((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof StoreSettings] as any),
          [child]: value,
        },
      }));
    } else {
      setSettings((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const resetToDefaults = () => {
    if (
      window.confirm(
        'Yakin ingin mengembalikan ke pengaturan default? Semua perubahan akan hilang.'
      )
    ) {
      setSettings({
        storeName: 'POS Keren',
        storeAddress: '',
        storePhone: '',
        storeEmail: '',
        logoUrl: '',
        currency: 'IDR',
        taxRate: 11,
        receiptFooter: 'Terima kasih atas kunjungan Anda!',
        theme: 'light',
        language: 'id',
        autoBackup: true,
        lowStockAlert: 5,
        themeColor: '#6366f1',
        printerSettings: {
          paperSize: '80mm',
          copies: 1,
          autoPrint: false,
        },
      });
    }
  };

  const handleResetData = async (
    type: 'products' | 'customers' | 'sales' | 'settings' | 'all'
  ) => {
    if (!user) return;

    let confirmMessage = '';
    switch (type) {
      case 'products':
        confirmMessage = 'Yakin ingin menghapus SEMUA PRODUK? Data ini tidak dapat dikembalikan!';
        break;
      case 'customers':
        confirmMessage = 'Yakin ingin menghapus SEMUA PELANGGAN? Data ini tidak dapat dikembalikan!';
        break;
      case 'sales':
        confirmMessage =
          'Yakin ingin menghapus SEMUA DATA PENJUALAN? Data ini tidak dapat dikembalikan!';
        break;
      case 'settings':
        confirmMessage =
          'Yakin ingin reset SEMUA PENGATURAN ke default? Pengaturan custom akan hilang!';
        break;
      case 'all':
        confirmMessage =
          'PERINGATAN! Ini akan menghapus SEMUA DATA (produk, pelanggan, penjualan, pengaturan). Data tidak dapat dikembalikan! Ketik "HAPUS SEMUA" untuk konfirmasi.';
        break;
    }

    if (type === 'all') {
      const userInput = prompt(confirmMessage);
      if (userInput !== 'HAPUS SEMUA') {
        alert('Reset dibatalkan. Input tidak sesuai.');
        return;
      }
    } else {
      if (!window.confirm(confirmMessage)) {
        return;
      }
    }

    setSaving(true);
    try {
      if (type === 'products' || type === 'all') {
        await supabase.from('products').delete().eq('user_id', user.id);
      }

      if (type === 'customers' || type === 'all') {
        await supabase.from('customers').delete().eq('user_id', user.id);
      }

      if (type === 'sales' || type === 'all') {
        await supabase.from('sales').delete().eq('user_id', user.id);
      }

      if (type === 'settings' || type === 'all') {
        const settingsKey = `settings_${user.id}`;
        localStorage.removeItem(settingsKey);

        setSettings({
          storeName: 'POS Keren',
          storeAddress: '',
          storePhone: '',
          storeEmail: '',
          logoUrl: '',
          currency: 'IDR',
          taxRate: 11,
          receiptFooter: 'Terima kasih atas kunjungan Anda!',
          theme: 'light',
          language: 'id',
          autoBackup: true,
          lowStockAlert: 5,
          themeColor: '#6366f1',
          printerSettings: {
            paperSize: '80mm',
            copies: 1,
            autoPrint: false,
          },
        });
      }

      let successMessage = '';
      switch (type) {
        case 'products':
          successMessage = 'Semua produk berhasil dihapus!';
          break;
        case 'customers':
          successMessage = 'Semua pelanggan berhasil dihapus!';
          break;
        case 'sales':
          successMessage = 'Semua data penjualan berhasil dihapus!';
          break;
        case 'settings':
          successMessage = 'Pengaturan berhasil direset ke default!';
          break;
        case 'all':
          successMessage = 'SEMUA DATA berhasil dihapus! Aplikasi akan refresh...';
          break;
      }

      setSaveMessage(successMessage);
      setTimeout(() => setSaveMessage(''), 3000);

      if (type === 'all') {
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      console.error('Error resetting data:', error);
      setSaveMessage('Gagal melakukan reset data');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Pengaturan Aplikasi</h1>
            <p className="text-slate-600 mt-1">Kelola pengaturan toko dan aplikasi Anda</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={resetToDefaults}
              className="px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <i className="fas fa-undo mr-2"></i>Reset Default
            </button>
            <button
              onClick={saveSettings}
              disabled={saving}
              className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-300 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Menyimpan...
                </>
              ) : (
                <>
                  <i className="fas fa-save"></i>
                  Simpan Pengaturan
                </>
              )}
            </button>
          </div>
        </div>

        {saveMessage && (
          <div
            className={`mt-4 p-3 rounded-lg ${
              saveMessage.includes('berhasil')
                ? 'bg-green-100 text-green-800 border border-green-200'
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}
          >
            <i
              className={`fas ${saveMessage.includes('berhasil') ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-2`}
            ></i>
            {saveMessage}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="border-b border-slate-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'store', label: 'Info Toko', icon: 'fas fa-store' },
              { id: 'display', label: 'Tampilan', icon: 'fas fa-palette' },
              { id: 'receipt', label: 'Struk & Print', icon: 'fas fa-receipt' },
              { id: 'system', label: 'Sistem', icon: 'fas fa-cog' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <i className={tab.icon}></i>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'store' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Informasi Toko</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Nama Toko
                    </label>
                    <input
                      type="text"
                      value={settings.storeName}
                      onChange={(e) => handleInputChange('storeName', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Nama toko Anda"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      No. Telepon
                    </label>
                    <input
                      type="tel"
                      value={settings.storePhone}
                      onChange={(e) => handleInputChange('storePhone', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="08123456789"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Alamat Toko
                    </label>
                    <textarea
                      value={settings.storeAddress}
                      onChange={(e) => handleInputChange('storeAddress', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Alamat lengkap toko"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Email Toko
                    </label>
                    <input
                      type="email"
                      value={settings.storeEmail}
                      onChange={(e) => handleInputChange('storeEmail', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="email@toko.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      URL Logo
                    </label>
                    <input
                      type="url"
                      value={settings.logoUrl}
                      onChange={(e) => handleInputChange('logoUrl', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="https://example.com/logo.png"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Gunakan URL gambar online atau upload ke layanan seperti Imgur
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'display' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">
                  Pengaturan Tampilan
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Tema</label>
                    <select
                      value={settings.theme}
                      onChange={(e) => handleInputChange('theme', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="light">Terang</option>
                      <option value="dark">Gelap</option>
                      <option value="auto">Otomatis</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Rate Pajak Default (%)
                    </label>
                    <input
                      type="number"
                      value={settings.taxRate}
                      onChange={(e) =>
                        handleInputChange('taxRate', parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Warna Tema Aplikasi
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="color"
                        value={settings.themeColor}
                        onChange={(e) => handleInputChange('themeColor', e.target.value)}
                        className="w-16 h-12 border border-slate-300 rounded-lg cursor-pointer"
                        title="Pilih warna tema"
                      />
                      <div className="flex-1">
                        <input
                          type="text"
                          value={settings.themeColor}
                          onChange={(e) => handleInputChange('themeColor', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                          placeholder="#6366f1"
                          pattern="^#[0-9A-Fa-f]{6}$"
                        />
                        <p className="text-xs text-slate-500 mt-1">
                          Warna akan diterapkan pada header, tombol, dan elemen UI utama
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {[
                          { name: 'Indigo', color: '#6366f1' },
                          { name: 'Blue', color: '#3b82f6' },
                          { name: 'Green', color: '#10b981' },
                          { name: 'Purple', color: '#8b5cf6' },
                          { name: 'Pink', color: '#ec4899' },
                          { name: 'Red', color: '#ef4444' },
                        ].map((preset) => (
                          <button
                            key={preset.name}
                            onClick={() => handleInputChange('themeColor', preset.color)}
                            className="w-8 h-8 rounded-full border-2 border-white shadow-md hover:scale-110 transition-transform"
                            style={{ backgroundColor: preset.color }}
                            title={preset.name}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'receipt' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">
                  Pengaturan Struk & Print
                </h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Footer Struk
                    </label>
                    <textarea
                      value={settings.receiptFooter}
                      onChange={(e) => handleInputChange('receiptFooter', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Pesan yang akan muncul di bagian bawah struk"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Ukuran Kertas
                      </label>
                      <select
                        value={settings.printerSettings.paperSize}
                        onChange={(e) =>
                          handleInputChange('printerSettings.paperSize', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="58mm">58mm</option>
                        <option value="80mm">80mm</option>
                        <option value="A4">A4</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Jumlah Salinan
                      </label>
                      <input
                        type="number"
                        value={settings.printerSettings.copies}
                        onChange={(e) =>
                          handleInputChange('printerSettings.copies', parseInt(e.target.value) || 1)
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        min="1"
                        max="5"
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="autoPrint"
                        checked={settings.printerSettings.autoPrint}
                        onChange={(e) =>
                          handleInputChange('printerSettings.autoPrint', e.target.checked)
                        }
                        className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
                      />
                      <label
                        htmlFor="autoPrint"
                        className="ml-2 text-sm font-medium text-slate-700"
                      >
                        Auto Print Struk
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Pengaturan Sistem</h3>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Alert Stok Rendah
                      </label>
                      <input
                        type="number"
                        value={settings.lowStockAlert}
                        onChange={(e) =>
                          handleInputChange('lowStockAlert', parseInt(e.target.value) || 5)
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        min="1"
                        max="100"
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        Peringatan akan muncul jika stok produk kurang dari nilai ini
                      </p>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="autoBackup"
                        checked={settings.autoBackup}
                        onChange={(e) => handleInputChange('autoBackup', e.target.checked)}
                        className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
                      />
                      <label
                        htmlFor="autoBackup"
                        className="ml-2 text-sm font-medium text-slate-700"
                      >
                        Auto Backup Harian
                      </label>
                    </div>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h4 className="font-semibold text-red-800 mb-4 flex items-center">
                      <i className="fas fa-exclamation-triangle mr-2"></i>
                      Reset Data (Berbahaya)
                    </h4>
                    <p className="text-sm text-red-700 mb-4">
                      Fitur ini akan menghapus data secara permanen. Pastikan Anda sudah backup
                      data sebelum melakukan reset.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button
                        onClick={() => handleResetData('products')}
                        className="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center"
                      >
                        <i className="fas fa-box mr-2"></i>
                        Reset Produk
                      </button>

                      <button
                        onClick={() => handleResetData('customers')}
                        className="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center"
                      >
                        <i className="fas fa-users mr-2"></i>
                        Reset Pelanggan
                      </button>

                      <button
                        onClick={() => handleResetData('sales')}
                        className="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center"
                      >
                        <i className="fas fa-chart-line mr-2"></i>
                        Reset Penjualan
                      </button>

                      <button
                        onClick={() => handleResetData('settings')}
                        className="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center"
                      >
                        <i className="fas fa-cog mr-2"></i>
                        Reset Pengaturan
                      </button>
                    </div>

                    <div className="mt-4 pt-4 border-t border-red-200">
                      <button
                        onClick={() => handleResetData('all')}
                        className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-bold transition-colors flex items-center justify-center"
                      >
                        <i className="fas fa-trash-alt mr-2"></i>
                        RESET SEMUA DATA
                      </button>
                      <p className="text-xs text-red-600 mt-2 text-center">
                        Ini akan menghapus SEMUA data termasuk produk, pelanggan, penjualan, dan
                        pengaturan!
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-slate-700 mb-2">Informasi Aplikasi</h4>
                    <div className="space-y-1 text-sm text-slate-600">
                      <p>
                        <strong>Nama:</strong> POS & Inventory Management System
                      </p>
                      <p>
                        <strong>Versi:</strong> 2.0.0 (React Version)
                      </p>
                      <p>
                        <strong>Database:</strong> Supabase PostgreSQL
                      </p>
                      <p>
                        <strong>Framework:</strong> React + TypeScript
                      </p>
                      <p>
                        <strong>User ID:</strong> {user?.id}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
