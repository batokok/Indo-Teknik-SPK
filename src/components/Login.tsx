import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { SmartLogo } from './SmartLogo';
import { User, Lock, Eye, EyeOff, Search, AlertCircle, ArrowRight, ShieldCheck, Cpu } from 'lucide-react';

interface LoginProps {
  onTrackClick?: () => void;
}

export const Login: React.FC<LoginProps> = ({ onTrackClick }) => {
  const { login } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Mohon masukkan username dan kata sandi dengan lengkap.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const loginError = await login(username.trim(), password.trim());
      if (loginError) {
        setError(loginError);
      }
    } catch {
      setError('Terjadi kendala saat memvalidasi akun. Silakan coba kembali.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#040711] flex items-center justify-center p-3 sm:p-6 lg:p-10 font-sans text-slate-100 relative overflow-hidden selection:bg-cyan-500 selection:text-black">
      {/* FUTURISTIC IMMERSIVE BACKGROUND: CYBER-GRID & RADIAL DEPTH */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(6, 182, 212, 0.15) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(6, 182, 212, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />
      
      {/* MOVING SCANLINE EFFECT */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.8)_51%)] bg-[size:100%_4px]"
      />
      
      {/* GLOWING AMBIENT LIGHT ENGINES */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-cyan-600/15 rounded-full blur-[140px] pointer-events-none animate-pulse" />
      <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-[#EF4444]/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[160px] pointer-events-none" />

      {/* MAIN SPLIT-SCREEN CONTAINER (OUTER CYBER GLOW FRAME) */}
      <div className="w-full max-w-5xl mx-auto relative z-10 flex flex-col md:flex-row items-stretch justify-center rounded-3xl shadow-[0_0_60px_rgba(6,182,212,0.15)] border border-cyan-500/30 overflow-hidden backdrop-blur-2xl">
        
        {/* SISI KIRI: SHOWCASE BRAND INDO TEKNIK & ITECH (FUTURISTIC & IMMERSIVE) */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-[#0c172e]/98 via-[#081022]/98 to-[#050a16]/98 p-6 sm:p-9 lg:p-11 flex flex-col justify-between relative overflow-hidden border-b md:border-b-0 md:border-r border-cyan-500/25">
          {/* Subtle Technical Radial Glow & HUD Accents */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent pointer-events-none" />
          
          {/* Futuristic HUD Corner Decors */}
          <div className="absolute top-3.5 left-3.5 w-3.5 h-3.5 border-t-2 border-l-2 border-cyan-400/60 pointer-events-none" />
          <div className="absolute bottom-3.5 left-3.5 w-3.5 h-3.5 border-b-2 border-l-2 border-cyan-400/60 pointer-events-none" />

          {/* TOP SECTION: FOKUS DUA BRAND UTAMA (INDO TEKNIK & ITECH) */}
          <div className="space-y-6 relative z-10">
            {/* BRANDING BADGES: TERTATA RAPI TANPA LEWAT DIVIDER */}
            <div className="flex flex-col items-start gap-2.5 max-w-full">
              {/* Logo 1: INDO TEKNIK */}
              <div className="bg-white px-3.5 py-2 rounded-xl shadow-lg border border-slate-200 inline-flex items-center justify-center max-w-full">
                <SmartLogo baseName="logo-indo-teknik" alt="INDO TEKNIK" className="h-8 sm:h-9 object-contain" />
              </div>

              {/* Logo 2: ITech Authorized Dealer (Ukuran proporsional & rapi terkunci dalam box) */}
              <div className="bg-slate-900/95 border border-cyan-500/40 px-3 py-1.5 rounded-xl shadow-inner inline-flex items-center gap-2.5 max-w-full overflow-hidden">
                <div className="bg-white px-1.5 py-0.5 rounded-md flex items-center justify-center shrink-0 shadow-xs">
                  <SmartLogo baseName="logo-itech" alt="ITech" className="h-5 object-contain" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[9px] font-mono font-black text-cyan-300 uppercase tracking-wider leading-none truncate">
                    AUTHORIZED DEALER
                  </span>
                  <span className="text-[7.5px] font-mono text-slate-400 leading-tight truncate">
                    Diesel Fuel System Center
                  </span>
                </div>
              </div>
            </div>

            {/* TITLE: INDO TEKNIK EMPLOYEE PORTAL (FUTURISTIC & PROPORTIONAL) */}
            <div className="pt-2">
              <div className="inline-flex items-center gap-2 text-[9.5px] font-mono font-bold tracking-widest uppercase text-cyan-400 bg-cyan-950/60 border border-cyan-500/40 px-3 py-1 rounded-md mb-3 shadow-xs">
                <Cpu className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
                <span>Encrypted Operations Terminal</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight break-words">
                Indo Teknik Employee Portal
              </h1>
            </div>
          </div>

          {/* BOTTOM SECTION: INDO TEKNIK - ITECH CERTIFIED TECHNOLOGY CENTER */}
          <div className="pt-6 mt-8 border-t border-cyan-500/20 relative z-10 flex flex-col gap-2">
            <div className="text-xs font-mono font-bold text-slate-300 flex items-center justify-between gap-2 flex-wrap">
              <span className="text-cyan-300 tracking-wide flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="truncate">Indo Teknik - ITech Certified Technology Center</span>
              </span>
              <span className="text-[10px] font-mono text-cyan-500/80 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30 shrink-0">v3.2</span>
            </div>
          </div>
        </div>

        {/* SISI KANAN: FOCUSED LOGIN PORTAL (IMMERSIVE HUD GLOW) */}
        <div className="w-full md:w-1/2 bg-[#09101f]/98 p-6 sm:p-9 lg:p-11 flex flex-col justify-between relative z-10">
          {/* Futuristic HUD Corner Decors */}
          <div className="absolute top-3.5 right-3.5 w-3.5 h-3.5 border-t-2 border-r-2 border-cyan-400/60 pointer-events-none" />
          <div className="absolute bottom-3.5 right-3.5 w-3.5 h-3.5 border-b-2 border-r-2 border-cyan-400/60 pointer-events-none" />

          <div>
            {/* Header Form */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-1.5">
                <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  <span>Login Terminal</span>
                </h2>
                <div className="flex items-center gap-1 text-[9px] font-mono font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping mr-0.5" />
                  ONLINE
                </div>
              </div>
              <p className="text-xs text-slate-400">
                Masukkan kredensial akun staf Indo Teknik untuk mengakses stasiun kerja.
              </p>
            </div>

            {/* RAMAH & TIDAK MENCOLOK KASAR: PESAN ERROR VALIDASI */}
            {error && (
              <div 
                id="login-error-banner"
                className="mb-5 p-3.5 bg-rose-950/60 border border-rose-800/70 rounded-xl text-rose-200 text-xs flex items-start gap-2.5 shadow-sm animate-in fade-in duration-200"
              >
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-semibold">{error}</span>
                </div>
              </div>
            )}

            {/* FORM LOGIN */}
            <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-4">
              {/* Field 1: Username */}
              <div>
                <label className="block text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Username
                </label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    id="login-username-input"
                    type="text"
                    required
                    autoComplete="username"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="Masukkan username staf..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/90 border border-slate-800 hover:border-slate-700 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30 rounded-xl text-sm text-white placeholder-slate-500 outline-none transition-all font-medium shadow-inner"
                  />
                </div>
              </div>

              {/* Field 2: Password with Smooth Eye Toggle */}
              <div>
                <label className="block text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Kata Sandi
                </label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    id="login-password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="Masukkan kata sandi..."
                    className="w-full pl-10 pr-11 py-2.5 bg-slate-950/90 border border-slate-800 hover:border-slate-700 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30 rounded-xl text-sm text-white placeholder-slate-500 outline-none transition-all font-medium shadow-inner"
                  />
                  {/* Eye Icon Button for Password Toggle */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
                    title={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Tombol Login yang Tegas dan Mantap (Turbo Ignition Style) */}
              <button
                id="login-submit-btn"
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-3 bg-gradient-to-r from-[#EF4444] to-[#DC2626] hover:from-[#DC2626] hover:to-[#B91C1C] active:scale-[0.99] text-white text-xs font-mono font-bold uppercase tracking-wider py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(239,68,68,0.35)] hover:shadow-[0_0_28px_rgba(239,68,68,0.5)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed select-none"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Memvalidasi Kredensial...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk ke Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* OPSI JIKA CUSTOMER SALAH MASUK KE PORTAL STAFF */}
          {onTrackClick && (
            <div className="mt-8 pt-6 border-t border-slate-800/80">
              <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-center sm:text-left">
                  <p className="text-xs font-bold text-slate-200">
                    Bukan Staf Bengkel?
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Lacak progres servis mobil Anda secara mandiri tanpa login.
                  </p>
                </div>

                <button
                  id="go-to-customer-portal-btn"
                  type="button"
                  onClick={onTrackClick}
                  className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-mono font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-blue-900/40 shrink-0 cursor-pointer select-none active:scale-95"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Portal Pelanggan</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Login;


