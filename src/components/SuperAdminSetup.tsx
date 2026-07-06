import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { SmartLogo } from './SmartLogo';

const SuperAdminSetup: React.FC = () => {
  const { createSuperAdmin } = useApp();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanName = name.trim();
    const cleanUsername = username.trim().toLowerCase();

    // 1. Validate name
    if (cleanName.length < 2 || cleanName.length > 50) {
      setError("Full Name must be between 2 and 50 characters!");
      return;
    }
    if (!/^[A-Za-z\s'.]+$/.test(cleanName)) {
      setError("Full Name can only contain letters, spaces, dots, and single quotes!");
      return;
    }

    // 2. Validate username
    if (cleanUsername.length < 3 || cleanUsername.length > 20) {
      setError("Username must be between 3 and 20 characters!");
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
      setError("Username can only contain alphanumeric characters and underscores!");
      return;
    }

    // 3. Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    // 4. Validate password strength
    if (password.length < 8) {
      setError("Password must be at least 8 characters long!");
      return;
    }
    if (password.toLowerCase() === cleanUsername) {
      setError("Password cannot be equal to your username!");
      return;
    }
    if (password.toLowerCase() === 'password') {
      setError("Password cannot be 'password'!");
      return;
    }
    if (password.toLowerCase() === 'admin') {
      setError("Password cannot be 'admin'!");
      return;
    }

    try {
      setSuccess(true);
      await createSuperAdmin({
        name: cleanName,
        username: cleanUsername,
        password: password,
        role: 'ADMIN',
        status: 'ACTIVE'
      });
    } catch (err: any) {
      setSuccess(false);
      setError(err?.message || "Failed to create Super Admin account");
    }
  };

  return (
    <div className="h-screen w-full bg-[#0f172a] flex items-center justify-center p-4 font-sans text-white overflow-y-auto">
      <div className="bg-slate-900 p-8 rounded-lg shadow-2xl w-full max-w-md border border-slate-800">
        <div className="flex flex-col items-center justify-center mb-6 text-center gap-4">
          <SmartLogo baseName="logo-indo-teknik" alt="IT INDO TEKNIK" className="h-10 object-contain bg-white px-3 py-1.5 rounded shadow-sm" />
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700/60 py-1 px-2.5 rounded shadow-sm">
              <SmartLogo baseName="logo-itech" alt="ITech" className="h-4 object-contain bg-white px-1.5 py-0.5 rounded" />
              <span className="text-[10px] font-semibold text-slate-300 uppercase tracking-widest whitespace-nowrap">Authorized Dealer</span>
            </div>
          </div>
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider mt-2">Initialize System</h2>
          <p className="text-xs text-slate-400 max-w-xs">One-time security configuration. Create your main Super Admin credentials to begin.</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-500/50 text-red-200 text-sm rounded text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Full Name</label>
            <input
              type="text"
              required
              disabled={success}
              className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] disabled:opacity-50"
              placeholder="e.g. Kenji Yeo"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Username</label>
            <input
              type="text"
              required
              disabled={success}
              className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] disabled:opacity-50"
              placeholder="e.g. kenji"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Password</label>
            <input
              type="password"
              required
              disabled={success}
              className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] disabled:opacity-50"
              placeholder="Min 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Confirm Password</label>
            <input
              type="password"
              required
              disabled={success}
              className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] disabled:opacity-50"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={success}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white text-xs font-bold uppercase tracking-wider py-3 rounded transition-colors mt-4 flex items-center justify-center gap-2"
          >
            {success ? 'Saving Credentials...' : 'Create Super Admin & Log In'}
          </button>
        </form>

        <div className="mt-6 text-center text-[10px] text-slate-500">
          <p>This screen is only accessible when no administrators exist.</p>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminSetup;
