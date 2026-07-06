import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { SmartLogo } from './SmartLogo';
import { Search } from 'lucide-react';

interface LoginProps {
  onTrackClick?: () => void;
}

const Login: React.FC<LoginProps> = ({ onTrackClick }) => {
  const { login } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() && password.trim()) {
      const loginError = await login(username.trim(), password.trim());
      if (loginError) {
        setError(loginError);
      }
    } else {
      setError('Please enter both username and password');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0b0f19] flex items-center justify-center p-4 py-8 font-sans text-white relative overflow-hidden overflow-y-auto">
      {/* Background glowing gradients for depth */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>
      
      {/* Subtle tech grid mesh pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none"></div>

      <div className="bg-slate-900/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-sm border border-slate-800/80 relative z-10">
        <div className="flex flex-col items-center justify-center mb-8 text-center gap-4">
          <div className="bg-white px-4 py-2 rounded-xl shadow-md border border-slate-200">
            <SmartLogo baseName="logo-indo-teknik" alt="IT INDO TEKNIK" className="h-9 object-contain" />
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1.5 bg-slate-850 border border-slate-700/65 py-1 px-3 rounded-lg shadow-inner">
              <SmartLogo baseName="logo-itech" alt="ITech" className="h-4 object-contain bg-white px-1.5 py-0.5 rounded" />
              <span className="text-[10px] font-extrabold text-slate-300 uppercase tracking-widest whitespace-nowrap">AUTHORIZED DEALER & WORKSHOP</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/80 border border-red-500/30 text-red-200 text-xs rounded-xl text-center font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Username</label>
            <div className="relative">
              <input
                type="text"
                required
                className="w-full bg-slate-850/80 border border-slate-700/80 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all shadow-inner"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                className="w-full bg-slate-850/80 border border-slate-700/80 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all shadow-inner"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-widest py-3 rounded-xl transition-all shadow-lg active:scale-[0.98] cursor-pointer mt-5"
          >
            Access ERP Terminal
          </button>
        </form>

        {onTrackClick && (
          <div className="mt-6 border-t border-slate-800/80 pt-5 text-center">
            <p className="text-[11px] text-slate-400 font-medium mb-3">Pelanggan? Lacak status pengerjaan secara instan:</p>
            <button
              type="button"
              onClick={onTrackClick}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-widest py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-blue-900/30 active:scale-[0.98] cursor-pointer"
            >
              <Search className="w-4 h-4 text-white" /> Lacak Progres SPK / QR Code
            </button>
          </div>
        )}

        <div className="mt-6 text-center text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
          <p>Indo Teknik ERP System v3.0</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
