import React, { useState } from 'react';
import { Shield, Lock, User, Hash, KeyRound } from 'lucide-react';
import { User as AppUser } from '../types';
import { authAPI } from '../services/apiService';

interface LoginProps {
  onLogin: (user: AppUser) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [loginType, setLoginType] = useState<'admin' | 'cadet'>('cadet');
  const [identifier, setIdentifier] = useState(''); // Username or Regimental No
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login(identifier.trim(), password);

      // Map API response to AppUser format
      const user: AppUser = {
        id: response.user.id,
        name: response.user.name,
        role: response.user.role,
        cadetId: response.user.cadetId,
        rank: response.user.rank
      };

      onLogin(user);
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.response?.status === 401) {
        setError('Invalid credentials. Please check your username and password.');
      } else if (err.code === 'ERR_NETWORK') {
        setError('Cannot connect to server. Make sure the backend is running on port 5000.');
      } else {
        setError(err.response?.data?.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    if (loginType === 'admin') {
      setIdentifier('admin');
      setPassword('admin123');
    } else {
      setIdentifier('NCC001');
      setPassword('NCC001');
    }
  };

  return (
    <div className="min-h-screen bg-stone-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1579912437766-79b5e71fb8bc?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-stone-900/80 to-stone-900/95"></div>

      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-300">
        <div className="p-8 pb-6 text-center border-b border-stone-100">
          <div className="inline-flex items-center justify-center mb-4">
            <img alt="NCC Logo" src="src/assets/Images/Emblem_of_National_Cadet_Corps_(India).png" className="object-contain rounded-full h-32 w-32" />
          </div>
          <h1 className="text-2xl font-bold text-stone-900 uppercase tracking-wide">NATIONAL CADET CORPS</h1>
          <p className="text-stone-500 text-sm mt-1">14 A BN NCC</p>
        </div>

        <div className="flex border-b border-stone-200">
          <button
            onClick={() => { setLoginType('cadet'); setError(''); setIdentifier(''); setPassword(''); }}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${loginType === 'cadet' ? 'text-red-700 border-b-2 border-red-700 bg-red-50' : 'text-stone-500 hover:bg-stone-50'}`}
          >
            Cadet Login
          </button>
          <button
            onClick={() => { setLoginType('admin'); setError(''); setIdentifier(''); setPassword(''); }}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${loginType === 'admin' ? 'text-blue-900 border-b-2 border-blue-900 bg-blue-50' : 'text-stone-500 hover:bg-stone-50'}`}
          >
            Admin Login
          </button>
        </div>

        <div className="p-8 pt-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-600 uppercase mb-1.5">
                {loginType === 'admin' ? 'Username' : 'Regimental Number'}
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
                  {loginType === 'admin' ? <User size={18} /> : <Hash size={18} />}
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-offset-1 outline-none transition-all text-sm"
                  placeholder={loginType === 'admin' ? 'Enter username' : 'e.g. NCC001'}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-600 uppercase mb-1.5">Password</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-offset-1 outline-none transition-all text-sm"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-lg text-center font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 rounded-lg text-white font-bold shadow-md transition-transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${loginType === 'cadet'
                  ? 'bg-red-700 hover:bg-red-800 focus:ring-red-500'
                  : 'bg-stone-800 hover:bg-stone-900 focus:ring-stone-600'
                }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Authenticating...
                </span>
              ) : (
                'Access Command Center'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-stone-100 flex flex-col items-center gap-3">
            <p className="text-xs text-stone-400">Demo Credentials Available</p>
            <button
              type="button"
              onClick={fillDemoCredentials}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-full text-xs font-bold transition-colors disabled:opacity-50"
            >
              <KeyRound size={14} />
              Auto-fill {loginType === 'admin' ? 'Admin' : 'Cadet'} Login
            </button>
            <p className="text-xs text-stone-400 mt-2">
              Default: admin/admin123 or NCC001/NCC001
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};