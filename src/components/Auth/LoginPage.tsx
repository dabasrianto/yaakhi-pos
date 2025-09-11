import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, updateProfile } from 'firebase/auth';
import { useFirebase } from '../../context/FirebaseContext';
import MolecularBackground from './MolecularBackground';

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
    password: ''
  });
  const { auth } = useFirebase();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
    } catch (error: any) {
      console.error('Login error:', error);
      let message = 'Terjadi kesalahan. Silakan coba lagi.';
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
        case 'auth/invalid-login-credentials':
          message = 'Email atau password yang Anda masukkan salah.';
          break;
        case 'auth/invalid-email':
          message = 'Format email yang Anda masukkan tidak valid.';
          break;
        case 'auth/user-disabled':
          message = 'Akun ini telah dinonaktifkan.';
          break;
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
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      await updateProfile(userCredential.user, {
        displayName: formData.name
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      let message = 'Gagal mendaftar. Silakan coba lagi.';
      switch (error.code) {
        case 'auth/email-already-in-use':
          message = 'Alamat email ini sudah terdaftar.';
          break;
        case 'auth/weak-password':
          message = 'Password terlalu lemah. Gunakan minimal 6 karakter.';
          break;
        case 'auth/invalid-email':
          message = 'Format email yang Anda masukkan tidak valid.';
          break;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error('Google login error:', error);
      setError('Gagal login dengan Google. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen flex justify-center items-center bg-slate-100 p-4">
      <MolecularBackground />
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
              <label htmlFor="name" className="block text-sm font-medium text-slate-700">Nama Lengkap</label>
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
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email</label>
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
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
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

        <div className="my-4 flex items-center before:flex-1 before:border-t before:border-slate-300 before:mt-0.5 after:flex-1 after:border-t after:border-slate-300 after:mt-0.5">
          <p className="text-center text-sm font-medium mx-4">atau</p>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:bg-slate-50 transition"
          disabled={loading}
        >
          <svg className="w-5 h-5" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.021,35.596,44,30.138,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
          </svg>
          {loading ? 'Loading...' : 'Lanjutkan dengan Google'}
        </button>
      </div>
    </div>
  );
};

export default LoginPage;