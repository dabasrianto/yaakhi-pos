import React from 'react';
import LoginPage from './LoginPage';
import MolecularBackground from './MolecularBackground';

interface LandingPageProps {
  onShowLogin: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onShowLogin }) => {
  const [showLogin, setShowLogin] = React.useState(false);

  if (showLogin) {
    return <LoginPage onBack={() => setShowLogin(false)} />;
  }


  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 to-indigo-100 p-6 sm:p-8">
      <MolecularBackground />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
              <i className="fas fa-store text-2xl"></i>
            </div>
            <span className="font-bold text-xl text-slate-800">POS Keren</span>
          </div>
          <button 
            onClick={() => setShowLogin(true)}
            className="font-semibold text-slate-600 hover:text-indigo-600 transition"
          >
            Login
          </button>
        </header>

        {/* Hero Section */}
        <main className="grid md:grid-cols-2 gap-16 items-center mt-16 md:mt-24">
          {/* Left Column */}
          <div className="text-center md:text-left">
            <h1 className="text-4xl lg:text-6xl font-black text-slate-800 leading-tight mb-6">
              Transformasi Bisnis Anda dengan POS Tercanggih
            </h1>
            <p className="text-lg text-slate-600 mb-8 max-w-lg mx-auto md:mx-0">
              Kelola inventori, lacak penjualan, dan layani pelanggan lebih cepat dengan aplikasi Point of Sale (POS) yang terintegrasi penuh.
            </p>
            <button 
              onClick={onShowLogin}
              className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-8 py-4 rounded-lg text-lg transition-transform transform hover:scale-105"
            >
              Coba Gratis 7 Hari <i className="fas fa-arrow-right ml-2"></i>
            </button>
            <p className="text-sm text-slate-500 mt-4">Tanpa perlu kartu kredit.</p>
          </div>

          {/* Right Column (App Mockup) */}
          <div className="hidden md:block">
            <div className="bg-slate-800 rounded-xl p-2 shadow-2xl transform rotate-3">
              <div className="flex items-center gap-1.5 px-2 py-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="bg-white rounded-b-lg p-4 h-96 overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-slate-800">Dashboard</h2>
                  <span className="text-sm text-slate-500">Hari Ini</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-xs text-green-800">Pemasukan</p>
                    <p className="text-xl font-bold text-green-900">Rp 1.2Jt</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-xs text-blue-800">Profit</p>
                    <p className="text-xl font-bold text-blue-900">Rp 450rb</p>
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="font-semibold text-slate-700 text-sm mb-2">Produk Terlaris</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="bg-slate-100 px-2 py-1 rounded">Kopi Susu</span>
                      <span className="font-bold">25x</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="bg-slate-100 px-2 py-1 rounded">Roti Bakar</span>
                      <span className="font-bold">18x</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LandingPage;