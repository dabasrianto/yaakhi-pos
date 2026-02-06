import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';

interface LoginPageProps {
  onBack?: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onBack }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;
    } catch (error: any) {
      console.error('Login error:', error);
      let message = 'Terjadi kesalahan. Silakan coba lagi.';
      if (error.message.includes('Invalid login credentials')) {
        message = 'Email atau password yang Anda masukkan salah.';
      } else if (error.message.includes('Email not confirmed')) {
        message = 'Email belum dikonfirmasi. Silakan cek inbox email Anda.';
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            display_name: formData.name,
          },
        },
      });

      if (error) throw error;
    } catch (error: any) {
      console.error('Registration error:', error);
      let message = 'Gagal mendaftar. Silakan coba lagi.';
      if (error.message.includes('already registered')) {
        message = 'Alamat email ini sudah terdaftar.';
      } else if (error.message.includes('Password should be at least 6 characters')) {
        message = 'Password terlalu lemah. Gunakan minimal 6 karakter.';
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen flex justify-center items-center bg-slate-100 p-4">
      <div className="w-full max-w-sm bg-white p-8 rounded-xl shadow-lg">
        {onBack && (
          <button
            onClick={onBack}
            className="mb-4 text-slate-600 hover:text-slate-800 flex items-center gap-2"
          >
            <i className="fas fa-arrow-left"></i>
            Kembali
          </button>
        )}

        <h1 className="text-2xl font-bold text-center text-slate-800 mb-6">
          {isRegister ? 'Daftar' : 'Login'}
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={isRegister ? handleRegister : handleLogin} className="space-y-4">
          {isRegister && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700">
                Nama Lengkap
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
                disabled={loading}
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              required
              minLength={6}
              disabled={loading}
            />
            {isRegister && <p className="text-xs text-slate-500 mt-1">Minimal 6 karakter.</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-300 text-white py-2.5 mt-2 rounded-lg font-semibold transition duration-300"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {isRegister ? 'Mendaftar...' : 'Login...'}
              </div>
            ) : (
              isRegister ? 'Daftar' : 'Login'
            )}
          </button>
        </form>

        <p className="text-center text-sm mt-6">
          {isRegister ? 'Sudah punya akun? ' : 'Belum punya akun? '}
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
              setFormData({ name: '', email: '', password: '' });
            }}
            className="font-medium text-indigo-600 hover:underline"
            disabled={loading}
          >
            {isRegister ? 'Login di sini' : 'Daftar di sini'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
