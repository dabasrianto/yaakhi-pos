import React, { useState } from 'react';
import { X, Rocket, Zap, Users, Package, TrendingUp, Keyboard } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose, onComplete }) => {
  const { settings } = useSettings();
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      icon: <Rocket className="w-16 h-16" />,
      title: 'Selamat Datang di POS System!',
      description: 'Sistem Point of Sale modern yang membantu Anda mengelola bisnis dengan lebih efisien.',
      features: [
        'Transaksi cepat dan mudah',
        'Manajemen inventory real-time',
        'Laporan penjualan lengkap',
        'Database pelanggan terintegrasi'
      ]
    },
    {
      icon: <Zap className="w-16 h-16" />,
      title: 'Mulai Transaksi dengan Cepat',
      description: 'Gunakan halaman POS untuk melakukan transaksi penjualan.',
      features: [
        'Pilih produk dari daftar atau scan barcode',
        'Tambahkan diskon dan pajak otomatis',
        'Berbagai metode pembayaran',
        'Cetak struk langsung'
      ]
    },
    {
      icon: <Package className="w-16 h-16" />,
      title: 'Kelola Inventory dengan Mudah',
      description: 'Monitor stok produk dan dapatkan notifikasi stok rendah.',
      features: [
        'Tambah/edit produk dengan detail lengkap',
        'Kategori produk untuk organisasi lebih baik',
        'Tracking harga jual dan modal',
        'Laporan inventory real-time'
      ]
    },
    {
      icon: <Users className="w-16 h-16" />,
      title: 'Database Pelanggan',
      description: 'Simpan data pelanggan dan track riwayat pembelian mereka.',
      features: [
        'Profil pelanggan lengkap',
        'Riwayat transaksi otomatis',
        'Sistem saldo pelanggan',
        'Export data pelanggan'
      ]
    },
    {
      icon: <Keyboard className="w-16 h-16" />,
      title: 'Keyboard Shortcuts',
      description: 'Bekerja lebih cepat dengan keyboard shortcuts.',
      features: [
        'Ctrl + K - Pencarian global',
        'Ctrl + P - Buka POS',
        'Ctrl + I - Buka Inventory',
        '? - Lihat semua shortcuts'
      ]
    },
    {
      icon: <TrendingUp className="w-16 h-16" />,
      title: 'Siap Memulai!',
      description: 'Semua fitur sudah siap digunakan. Mari mulai bisnis Anda!',
      features: [
        'Tambahkan produk pertama Anda',
        'Atur informasi toko di Settings',
        'Mulai transaksi pertama',
        'Pantau performa di Dashboard'
      ]
    }
  ];

  const currentStepData = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="fixed inset-0 bg-black/60" onClick={handleSkip}></div>

      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors z-10"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <div
          className="relative p-8 text-white"
          style={{
            background: `linear-gradient(135deg, ${settings.themeColor || '#6366f1'} 0%, ${settings.themeColor || '#6366f1'}DD 100%)`
          }}
        >
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
              {currentStepData.icon}
            </div>
          </div>

          <h2 className="text-3xl font-bold text-center mb-3">
            {currentStepData.title}
          </h2>

          <p className="text-center text-white/90 text-lg">
            {currentStepData.description}
          </p>

          <div className="flex justify-center gap-2 mt-6">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === currentStep
                    ? 'w-8 bg-white'
                    : 'w-2 bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="p-8">
          <div className="space-y-3 mb-8">
            {currentStepData.features.map((feature, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-750 rounded-lg"
              >
                <div
                  className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{
                    backgroundColor: `${settings.themeColor || '#6366f1'}20`,
                    color: settings.themeColor || '#6366f1'
                  }}
                >
                  {index + 1}
                </div>
                <p className="text-gray-700 dark:text-gray-300 flex-1">
                  {feature}
                </p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between gap-4">
            <button
              onClick={handleSkip}
              className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Lewati Tutorial
            </button>

            <div className="flex items-center gap-3">
              {currentStep > 0 && (
                <button
                  onClick={handlePrevious}
                  className="px-6 py-2 border-2 rounded-lg font-semibold transition-all hover:scale-105"
                  style={{
                    borderColor: settings.themeColor || '#6366f1',
                    color: settings.themeColor || '#6366f1'
                  }}
                >
                  Sebelumnya
                </button>
              )}

              <button
                onClick={handleNext}
                className="px-8 py-3 rounded-lg font-semibold text-white transition-all hover:scale-105 shadow-lg"
                style={{
                  backgroundColor: settings.themeColor || '#6366f1'
                }}
              >
                {currentStep === steps.length - 1 ? 'Mulai Sekarang!' : 'Lanjut'}
              </button>
            </div>
          </div>
        </div>

        <div className="px-8 pb-6 text-center text-sm text-gray-500">
          <p>
            Tekan <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-750 rounded border text-xs">?</kbd>
            {' '}kapan saja untuk melihat keyboard shortcuts
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;
