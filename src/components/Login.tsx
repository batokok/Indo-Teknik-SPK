import React, { useState } from 'react';
import { useApp } from '../store/AppContext';

const Login: React.FC = () => {
  const { login } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() && password.trim()) {
      const loginError = login(username.trim(), password.trim());
      if (loginError) {
        setError(loginError);
      }
    } else {
      setError('Please enter both username and password');
    }
  };

  return (
    <div className="h-screen w-full bg-[#0f172a] flex items-center justify-center p-4 font-sans text-white">
      <div className="bg-slate-900 p-8 rounded-lg shadow-2xl w-full max-w-sm border border-slate-800">
        <div className="flex justify-center mb-6">
          <img src="/icon-it.png" alt="IT" className="w-12 h-12 object-contain rounded" />
        </div>
        <div className="flex flex-col items-center justify-center mb-8 gap-4">
          <img src="/logo-indo-teknik.png" alt="IT INDO TEKNIK" className="h-10 object-contain bg-white p-2 rounded w-full max-w-[200px]" />
          <div className="flex flex-col items-center">
             <img src="/logo-itech.png" alt="ITech" className="h-8 object-contain bg-white p-1 rounded w-full max-w-[150px]" />
             <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-2">Authorized Dealer</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-500/50 text-red-200 text-sm rounded text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Username</label>
            <input
              type="text"
              required
              className="w-full bg-slate-800 border border-slate-700 rounded p-2.5 text-sm text-white focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a]"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Password</label>
            <input
              type="password"
              required
              className="w-full bg-slate-800 border border-slate-700 rounded p-2.5 text-sm text-white focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a]"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#ef4444] hover:bg-red-600 text-white text-xs font-bold uppercase tracking-wider py-3 rounded transition-colors mt-4"
          >
            Access Terminal
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-slate-500 flex flex-col gap-1">
          <p>Demo Accounts:</p>
          <p>admin / password</p>
          <p>sa / password</p>
          <p>mechanic / password</p>
          <p>foreman / password</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
