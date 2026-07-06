import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { WorkOrder } from '../types';
import { SmartLogo } from './SmartLogo';
import { 
  Search, ArrowLeft, Clock, ShieldCheck, CheckCircle2, AlertTriangle, 
  Settings, Check, Compass, AlertCircle, PhoneCall, Share2, ClipboardList, 
  Info, Sparkles, Gauge, RefreshCw, ChevronRight, Calendar, User, Wrench
} from 'lucide-react';
import { motion } from 'motion/react';

interface PublicTrackingViewProps {
  initialWoId?: string;
  onBackToLogin: () => void;
}

export const GENERAL_TRACKING_MILESTONES = [
  { id: 'm1', label: 'Intake & Verifikasi', desc: 'Serah terima fisik unit/komponen dari pelanggan' },
  { id: 'm2', label: 'Pembongkaran & Pembersihan', desc: 'Unit/komponen dibongkar untuk proses pembersihan awal' },
  { id: 'm3', label: 'Pengecekan Fisik & Diagnosa Lab', desc: 'Pengujian awal tekanan, kalibrasi, & diagnosa kerusakan' },
  { id: 'm4', label: 'Analisis Estimasi & Persetujuan', desc: 'Penghitungan estimasi biaya & persetujuan tindakan pengerjaan' },
  { id: 'm5', label: 'Perbaikan & Penggantian Suku Cadang', desc: 'Proses perbaikan utama & penggantian komponen yang aus' },
  { id: 'm6', label: 'Kalibrasi Akhir & Quality Control', desc: 'Pengujian fungsi laboratorium & pengujian QC jalan' },
  { id: 'm7', label: 'Selesai & Siap Diserahkan', desc: 'Pekerjaan selesai 100% dan unit siap diambil/dikirim' }
];

const PublicTrackingView: React.FC<PublicTrackingViewProps> = ({ initialWoId = '', onBackToLogin }) => {
  const [woId, setWoId] = useState(initialWoId);
  const [searchInput, setSearchInput] = useState(initialWoId);
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastSync, setLastSync] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!woId) {
      setWorkOrder(null);
      return;
    }

    setLoading(true);
    setError('');

    // Set up real-time listener for the given Work Order ID (publicly readable under tracking rule)
    const docRef = doc(db, 'workOrders', woId.trim().toUpperCase());
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      setLoading(false);
      if (docSnap.exists()) {
        const data = docSnap.data() as WorkOrder;
        setWorkOrder(data);
        setLastSync(new Date().toLocaleTimeString('id-ID'));
        setError('');
      } else {
        setWorkOrder(null);
        setError('Nomor SPK / Work Order tidak ditemukan di database. Pastikan nomor yang Anda masukkan benar.');
      }
    }, (err) => {
      console.error("Public track load error:", err);
      setLoading(false);
      setError('Gagal menghubungkan ke server pelacakan. Hubungi Admin atau SA.');
    });

    return () => unsubscribe();
  }, [woId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    
    // Set search parameter in URL so it can be refreshed
    const url = new URL(window.location.href);
    url.searchParams.set('tracking', searchInput.trim().toUpperCase());
    window.history.pushState({}, '', url.toString());

    setWoId(searchInput.trim().toUpperCase());
  };

  const getMilestoneIndex = (wo: WorkOrder) => {
    if (!wo.currentMilestone) {
      // Automatic fallback based on workOrder.status
      if (wo.status === 'COMPLETED') return 6; // Ready
      if (wo.status === 'PENDING_APPROVAL') return 3; // Estimasi / Persetujuan
      if (wo.status === 'PENDING_PARTS') return 4; // Sedang menunggu parts/pengerjaan
      if (wo.status === 'QUEUE') return 0; // Intake
      return 4; // Default to Repair
    }
    return GENERAL_TRACKING_MILESTONES.findIndex(m => m.label === wo.currentMilestone);
  };

  const activeMilestoneIndex = workOrder ? getMilestoneIndex(workOrder) : 0;

  // Mask private fields
  const maskText = (text: string, keepLength = 4) => {
    if (!text) return '-';
    if (text.length <= keepLength) return text;
    return text.substring(0, keepLength) + '••••' + text.substring(text.length - 2);
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/?tracking=${woId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#070b13] text-slate-100 font-sans flex flex-col justify-between pb-10 relative overflow-x-hidden selection:bg-blue-500/30 selection:text-blue-200">
      
      {/* Dynamic Futuristic Glow Orbs */}
      <div className="absolute top-[-5%] left-[-15%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-tr from-blue-600/10 to-indigo-600/10 blur-[100px] sm:blur-[150px] pointer-events-none" />
      <div className="absolute top-[35%] right-[-15%] w-[70vw] h-[70vw] rounded-full bg-gradient-to-br from-emerald-600/8 to-teal-500/8 blur-[120px] sm:blur-[180px] pointer-events-none" />
      <div className="absolute bottom-[-5%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-tr from-purple-600/8 to-blue-500/8 blur-[90px] sm:blur-[130px] pointer-events-none" />

      {/* Cyber Grid Lines Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.003)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.003)_1px,transparent_1px)] bg-[size:24px_24px] sm:bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_100%)] pointer-events-none" />

      {/* Floating Glass Header */}
      <header className="border-b border-white/5 bg-[#080d16]/80 backdrop-blur-xl py-3 px-4 sm:px-6 sticky top-0 z-50 flex items-center justify-between shadow-lg shadow-black/30">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_#3b82f6]" />
          <div>
            <h1 className="text-xs sm:text-sm font-display font-black tracking-[0.12em] text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-blue-400 uppercase">
              INDO TEKNIK
            </h1>
            <p className="text-[7px] sm:text-[9px] text-slate-400 font-mono font-bold uppercase tracking-widest mt-0.5">Live Tracking System</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <SmartLogo baseName="logo-itech" alt="ITech" className="h-5 sm:h-6 object-contain bg-white/95 px-1.5 sm:px-2 py-0.5 rounded shadow-sm filter saturate-110" />
          <button 
            onClick={onBackToLogin}
            className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-[8px] sm:text-[10px] bg-white/[0.03] hover:bg-white/[0.08] text-slate-200 hover:text-white border border-white/10 hover:border-white/20 rounded-lg font-black uppercase tracking-wider transition-all duration-300 shadow-md backdrop-blur-md cursor-pointer active:scale-95"
          >
            Portal Staff
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 sm:py-8 z-10 relative">
        {/* Search Header Container */}
        <div className="text-center my-4 sm:my-8 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-full text-[8px] sm:text-[10px] font-bold text-blue-300 uppercase tracking-wider mb-3">
            <Sparkles className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-blue-400" />
            DIESEL LAB INTEGRATION
          </div>
          <h2 className="text-xl sm:text-3xl font-display font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400 tracking-tight leading-tight uppercase">
            Pantau Status Kerja Lab
          </h2>
          <p className="text-[10px] sm:text-xs text-slate-400 mt-2 max-w-sm sm:max-w-md mx-auto leading-relaxed">
            Dapatkan transparansi penuh pengerjaan kalibrasi, uji tekanan, & pergantian komponen Anda secara langsung dari sistem ERP Lab.
          </p>

          <form onSubmit={handleSearchSubmit} className="mt-5 sm:mt-7 relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl sm:rounded-2xl blur opacity-25 group-focus-within:opacity-40 transition-all duration-300" />
            
            {/* Fully Responsive Input Layout: Stacks on mobile, inline on tablet up */}
            <div className="relative flex flex-col sm:flex-row gap-2.5 sm:gap-0">
              <div className="relative flex-1">
                <input 
                  type="text"
                  placeholder="Masukkan No. SPK (e.g. WO-2026-0001)"
                  className="w-full bg-[#0b101c]/90 border border-white/10 rounded-xl sm:rounded-2xl py-3.5 sm:py-4 pl-11 pr-4 text-xs sm:text-sm font-semibold tracking-wide text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 shadow-2xl backdrop-blur-xl transition-all uppercase"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
                <Search className="w-4 h-4 text-slate-500 absolute left-4 top-4" />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto sm:absolute sm:right-2 sm:top-2 px-6 py-3.5 sm:py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 shadow-lg shadow-blue-500/20 active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Search className="w-3.5 h-3.5 sm:hidden" />
                Lacak Unit
              </button>
            </div>
          </form>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-slate-400 gap-3">
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-blue-500/10 border-t-blue-500 animate-spin"></div>
              <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 animate-pulse" />
            </div>
            <div className="text-center">
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-300">Menghubungkan ke Lab Database</p>
              <p className="text-[9px] sm:text-[10px] text-slate-500 mt-0.5">Mengambil status sinkronisasi...</p>
            </div>
          </div>
        )}

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-500/5 border border-red-500/20 p-4 sm:p-5 rounded-xl sm:rounded-2xl flex items-start gap-3 sm:gap-4 text-red-200 text-xs sm:text-sm max-w-lg mx-auto shadow-2xl backdrop-blur-md"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
              <AlertCircle className="w-4.5 h-4.5 text-red-400" />
            </div>
            <div>
              <h4 className="font-display font-bold text-red-400 uppercase tracking-wide text-xs sm:text-sm">Pencarian Gagal</h4>
              <p className="text-[10px] sm:text-xs mt-1 text-slate-300 leading-relaxed">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Work Order Info Display */}
        {workOrder && !loading && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="space-y-4 sm:space-y-6"
          >
            {/* Live Indicator Banner */}
            <div className="bg-white/[0.02] border border-white/5 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 shadow-xl backdrop-blur-md relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-emerald-500"></span>
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[9px] sm:text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider">No. SPK / WO:</span>
                    <span className="font-mono text-xs sm:text-sm font-black text-blue-400 tracking-wider break-all">{workOrder.id}</span>
                  </div>
                  <p className="text-[8px] sm:text-[10px] text-slate-400 mt-0.5">Status diperbarui oleh teknisi & mekanik lab secara real-time.</p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between border-t sm:border-t-0 border-white/5 pt-2.5 sm:pt-0">
                <span className="text-[8px] sm:text-[10px] text-slate-400 font-mono bg-white/[0.04] px-2 py-0.5 sm:px-2.5 sm:py-1 rounded border border-white/5">
                  Sync: {lastSync || 'Live'}
                </span>
                <button
                  onClick={handleCopyLink}
                  className={`px-2.5 py-1.5 border rounded-lg text-[8px] sm:text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer active:scale-95 ${
                    copied 
                      ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300' 
                      : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-slate-200 hover:text-white'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" /> Tersalin
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3 h-3" /> Salin Link
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Main Milestone Stepper Container */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
              <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
              <div className="border-b border-white/5 pb-4 mb-5 sm:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-[10px] sm:text-xs font-display font-black uppercase text-slate-300 tracking-wider flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-blue-400 animate-spin-slow" />
                    Alur Tahapan Pekerjaan
                  </h3>
                  <p className="text-[8px] sm:text-[10px] text-slate-400 mt-0.5">Lacak posisi unit/komponen Anda dalam 7 fase laboratorium.</p>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/20 text-blue-300 font-mono font-bold text-[8px] sm:text-[10px] px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-lg sm:rounded-xl uppercase tracking-wider w-fit shadow-sm">
                  {workOrder.status.replace(/_/g, ' ')}
                </div>
              </div>

              {/* Milestones Stepper */}
              <div className="space-y-5 sm:space-y-6 relative before:absolute before:left-3.5 sm:before:left-5.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-white/5">
                {GENERAL_TRACKING_MILESTONES.map((step, idx) => {
                  const isCompleted = idx < activeMilestoneIndex;
                  const isActive = idx === activeMilestoneIndex;

                  let stepBg = 'bg-[#090d16] border-white/5 text-slate-600';
                  let textColor = 'text-slate-400 font-medium';
                  
                  if (isCompleted) {
                    stepBg = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]';
                    textColor = 'text-slate-200 font-semibold';
                  } else if (isActive) {
                    stepBg = 'bg-blue-500/20 border-blue-400 text-blue-300 ring-4 ring-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.25)]';
                    textColor = 'text-white font-black';
                  }

                  return (
                    <motion.div 
                      key={step.id} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className={`flex items-start gap-3 sm:gap-6 relative group transition-all duration-300 ${isActive ? 'scale-[1.01]' : ''}`}
                    >
                      <div className={`w-7 h-7 sm:w-11 sm:h-11 rounded-full border flex items-center justify-center shrink-0 z-10 transition-all duration-300 ${stepBg}`}>
                        {isCompleted ? (
                          <Check className="w-3 h-3 sm:w-5 sm:h-5 text-emerald-400" />
                        ) : isActive ? (
                          <Compass className="w-3 h-3 sm:w-5 sm:h-5 animate-spin text-blue-400" />
                        ) : (
                          <span className="text-[8px] sm:text-[10px] font-mono font-bold text-slate-500">{idx + 1}</span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 pt-0.5 sm:pt-1.5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-0.5 sm:gap-2">
                          <h4 className={`text-xs sm:text-sm tracking-wide transition-colors ${textColor}`}>
                            {step.label}
                          </h4>
                          {isActive && (
                            <span className="text-[7px] sm:text-[8px] font-mono font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20 w-fit">
                              Dalam Proses
                            </span>
                          )}
                          {isCompleted && (
                            <span className="text-[7px] sm:text-[8px] font-mono font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/10 w-fit">
                              Selesai
                            </span>
                          )}
                        </div>
                        <p className="text-[9px] sm:text-[11px] text-slate-400 mt-1 leading-relaxed font-sans font-light">
                          {step.desc}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Real-time Logistics Tracker Logs */}
              {workOrder.milestoneHistory && workOrder.milestoneHistory.length > 0 && (
                <div className="mt-6 pt-5 border-t border-white/5">
                  <h4 className="text-[9px] sm:text-[10px] font-mono font-bold uppercase text-slate-300 tracking-wider mb-3.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                    Log Riwayat Pelacakan Unit
                  </h4>
                  <div className="space-y-2 max-h-44 sm:max-h-52 overflow-y-auto pr-1.5 custom-scrollbar">
                    {workOrder.milestoneHistory.map((log, index) => (
                      <div key={index} className="bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 hover:border-white/10 rounded-lg sm:rounded-xl p-2.5 sm:p-3 flex justify-between items-center text-[10px] sm:text-xs transition-all">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50 shadow-[0_0_6px_#3b82f6]" />
                          <div>
                            <span className="font-bold text-slate-200 block">{log.milestone}</span>
                            <span className="text-[8px] sm:text-[9px] text-slate-400 font-mono block sm:inline mt-0.5">
                              Petugas: {log.updatedBy}
                            </span>
                          </div>
                        </div>
                        <div className="text-right shrink-0 font-mono text-[8px] sm:text-[10px]">
                          <span className="text-slate-300 font-bold block">
                            {new Date(log.timestamp).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                          </span>
                          <span className="text-slate-400">
                            {new Date(log.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Grid Layout for details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Left Column: Intake Profile */}
              <div className="bg-white/[0.02] border border-white/5 rounded-xl sm:rounded-2xl p-4 sm:p-5 space-y-3.5 sm:space-y-4 shadow-xl backdrop-blur-md">
                <h3 className="text-[10px] sm:text-xs font-display font-black text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <ClipboardList className="w-3.5 h-3.5 text-slate-400" />
                  Identitas & Detail Intake
                </h3>

                <div className="grid grid-cols-2 gap-x-3.5 gap-y-3 sm:gap-x-4 sm:gap-y-4 text-[10px] sm:text-xs border-t border-white/5 pt-3.5 sm:pt-4">
                  <div>
                    <span className="text-slate-400 text-[8px] sm:text-[9px] font-mono uppercase font-bold tracking-wider block">Pelanggan</span>
                    <span className="font-bold text-white mt-0.5 block truncate">{workOrder.customerName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[8px] sm:text-[9px] font-mono uppercase font-bold tracking-wider block">No. Telepon</span>
                    <span className="font-mono font-semibold text-slate-300 mt-0.5 block">{maskText(workOrder.customerPhone)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[8px] sm:text-[9px] font-mono uppercase font-bold tracking-wider block">Metode Penyerahan</span>
                    <span className="font-semibold text-slate-300 flex items-center gap-1 mt-0.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${workOrder.dropMethod === 'PARTS' ? 'bg-orange-400 shadow-[0_0_8px_#fb923c]' : 'bg-blue-400 shadow-[0_0_8px_#60a5fa]'}`} />
                      {workOrder.dropMethod === 'PARTS' ? 'Komponen Saja' : 'Bawa Unit Mobil'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[8px] sm:text-[9px] font-mono uppercase font-bold tracking-wider block">Tanggal Masuk</span>
                    <span className="font-semibold text-slate-300 mt-0.5 block truncate">
                      {workOrder.intakeDate ? new Date(workOrder.intakeDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '-'}
                    </span>
                  </div>
                </div>

                {workOrder.dropMethod === 'WHOLE' && (
                  <div className="border-t border-white/5 pt-3.5 sm:pt-4">
                    <span className="text-slate-400 text-[8px] sm:text-[9px] font-mono uppercase font-bold tracking-wider block mb-2">Metadata Kendaraan</span>
                    <div className="grid grid-cols-3 gap-1.5 bg-white/[0.01] p-2 sm:p-3 rounded-lg sm:rounded-xl border border-white/5">
                      <div className="min-w-0">
                        <span className="text-[7px] sm:text-[9px] text-slate-400 block font-semibold truncate">Tipe/Brand</span>
                        <span className="text-[9px] sm:text-xs font-bold text-white mt-0.5 truncate block">{workOrder.vehicleBrand}</span>
                      </div>
                      <div className="min-w-0">
                        <span className="text-[7px] sm:text-[9px] text-slate-400 block font-semibold truncate">No. Plat</span>
                        <span className="text-[9px] sm:text-xs font-mono font-black text-blue-400 mt-0.5 block uppercase truncate">{workOrder.plateNumber}</span>
                      </div>
                      <div className="min-w-0">
                        <span className="text-[7px] sm:text-[9px] text-slate-400 block font-semibold truncate">Odometer</span>
                        <span className="text-[9px] sm:text-xs font-bold text-white mt-0.5 block truncate">{workOrder.odometer} Km</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Estimasi & Kontak WA */}
              <div className="bg-white/[0.02] border border-white/5 rounded-xl sm:rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-4 sm:gap-5 shadow-xl backdrop-blur-md">
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-[10px] sm:text-xs font-display font-black text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-400" />
                    Garansi & Estimasi Pengerjaan
                  </h3>

                  <div className="grid grid-cols-2 gap-3 border-t border-white/5 pt-3.5 sm:pt-4">
                    <div>
                      <span className="text-slate-400 text-[8px] sm:text-[9px] font-mono uppercase font-bold tracking-wider block">Masa Garansi</span>
                      <span className="font-black text-emerald-400 text-[9px] sm:text-xs tracking-wide bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-lg mt-1 inline-flex items-center gap-1 shadow-[0_0_12px_rgba(16,185,129,0.05)]">
                        <ShieldCheck className="w-3 h-3" />
                        {workOrder.garansi || 'Tidak Ada'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[8px] sm:text-[9px] font-mono uppercase font-bold tracking-wider block">Estimasi Selesai</span>
                      <span className="font-bold text-slate-200 mt-1 inline-flex items-center gap-1 text-[10px] sm:text-xs">
                        <Clock className="w-3 h-3 text-blue-400" />
                        {workOrder.estimasiPengerjaan || 'Menunggu Analisa'}
                      </span>
                    </div>
                  </div>

                  <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-2.5 sm:p-3 flex items-start gap-2">
                    <Info className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                    <p className="text-[8px] sm:text-[10px] text-slate-400 leading-relaxed font-sans font-light">
                      Estimasi dihitung setelah Service Advisor menganalisis kerusakan laboratorium dan mendapat persetujuan tindakan penggantian komponen.
                    </p>
                  </div>
                </div>

                <a
                  href={`https://wa.me/628123456789?text=Halo%20Service%20Advisor%20Indo%20Teknik,%20saya%20ingin%20menanyakan%20perkembangan%20Work%20Order%20${workOrder.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] sm:text-xs uppercase tracking-wider py-3.5 rounded-xl transition-all duration-300 shadow-lg shadow-emerald-600/10 flex items-center justify-center gap-1.5 hover:scale-[1.01] cursor-pointer"
                >
                  <PhoneCall className="w-3.5 h-3.5" /> Hubungi SA via WhatsApp
                </a>
              </div>
            </div>

            {/* Display Component List if Drop Method is Component */}
            {workOrder.dropMethod === 'PARTS' && workOrder.looseParts && workOrder.looseParts.length > 0 && (
              <div className="bg-white/[0.02] border border-white/5 rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur-md">
                <h3 className="text-[10px] sm:text-xs font-display font-black text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-orange-400" />
                  Daftar Identifikasi Komponen Masuk
                </h3>

                {/* Mobile Friendly Card List View (Visible on small screens) */}
                <div className="block md:hidden space-y-2.5">
                  {workOrder.looseParts.map((part, index) => (
                    <div key={part.id || index} className="bg-black/20 border border-white/5 p-3 rounded-lg flex flex-col gap-2">
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-slate-200 text-xs">{part.description}</span>
                        <span className="font-mono text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded font-bold uppercase truncate max-w-[120px]">
                          PN: {part.partNumber || '-'}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1.5 border-t border-white/5 pt-2">
                        <span className="font-semibold text-[8px] uppercase tracking-wider text-slate-500">Fisik:</span>
                        <span>{part.physicalCondition}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Responsive Table View (Visible on tablet up) */}
                <div className="hidden md:block overflow-x-auto border border-white/5 rounded-xl bg-black/20">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead className="bg-[#0b101c] text-slate-400 border-b border-white/5 font-mono font-bold uppercase tracking-wider">
                      <tr>
                        <th className="p-3">Nama Suku Cadang / Deskripsi</th>
                        <th className="p-3">Serial / Part Number</th>
                        <th className="p-3">Fisik Suku Cadang</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-300">
                      {workOrder.looseParts.map((part, index) => (
                        <tr key={part.id || index} className="hover:bg-white/[0.02] transition-colors">
                          <td className="p-3 font-semibold">{part.description}</td>
                          <td className="p-3 font-mono font-bold text-blue-400">{part.partNumber || '-'}</td>
                          <td className="p-3 text-xs text-slate-400">{part.physicalCondition}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Lab Test Bench Calibration Reports */}
            <div className="bg-white/[0.02] border border-white/5 rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-xl space-y-3.5 sm:space-y-4 backdrop-blur-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-white/5 pb-2.5 sm:pb-3">
                <h3 className="text-[10px] sm:text-xs font-display font-black text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Gauge className="w-4 h-4 text-blue-400" />
                  Laporan Pengujian Diesel Test Bench
                </h3>
                <span className="text-[7px] sm:text-[8px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-widest w-fit">
                  Akurasi Kalibrasi Lab
                </span>
              </div>

              {workOrder.calibrationData ? (
                <div className="space-y-3.5 sm:space-y-4">
                  {/* Mobile Friendly Component Comparison List (Visible on small screens) */}
                  <div className="block md:hidden space-y-2.5">
                    {[
                      {
                        title: 'Volume Semprotan (Spray Volume)',
                        desc: 'Kapasitas pengabutan & debit injeksi bahan bakar',
                        sebelum: workOrder.calibrationData.volumeSemprotan?.sebelum || '-',
                        sesudah: workOrder.calibrationData.volumeSemprotan?.sesudah || '-'
                      },
                      {
                        title: 'Debit Backleak (Backleak Flow)',
                        desc: 'Pencegahan slip tekanan balik saluran injector',
                        sebelum: workOrder.calibrationData.debitBackleak?.sebelum || '-',
                        sesudah: workOrder.calibrationData.debitBackleak?.sesudah || '-'
                      },
                      {
                        title: 'Tekanan Pembukaan (Opening Pressure)',
                        desc: 'Batas ambang bar semprot nozzle utama',
                        sebelum: workOrder.calibrationData.tekanan?.sebelum || '-',
                        sesudah: workOrder.calibrationData.tekanan?.sesudah || '-'
                      }
                    ].map((item, index) => (
                      <div key={index} className="bg-black/20 border border-white/5 p-3 rounded-lg flex flex-col gap-2">
                        <div>
                          <span className="font-bold text-slate-200 text-xs block">{item.title}</span>
                          <span className="text-[9px] text-slate-500 mt-0.5 block">{item.desc}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 border-t border-white/5 pt-2 mt-1">
                          <div className="bg-rose-500/[0.04] border border-rose-500/10 p-2 rounded text-center">
                            <span className="text-[8px] text-rose-400 font-bold block uppercase tracking-wider">Sebelum (Before)</span>
                            <span className="text-xs font-mono font-black text-rose-400 mt-0.5 block">{item.sebelum}</span>
                          </div>
                          <div className="bg-emerald-500/[0.04] border border-emerald-500/10 p-2 rounded text-center">
                            <span className="text-[8px] text-emerald-400 font-bold block uppercase tracking-wider">Sesudah (After)</span>
                            <span className="text-xs font-mono font-black text-emerald-400 mt-0.5 block">{item.sesudah}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Responsive Table View (Visible on tablet up) */}
                  <div className="hidden md:block overflow-x-auto border border-white/5 rounded-xl bg-black/20">
                    <table className="w-full border-collapse text-left text-xs">
                      <thead className="bg-[#0b101c] text-slate-400 border-b border-white/5 font-mono font-bold uppercase tracking-wider">
                        <tr>
                          <th className="p-3">Parameter Pengujian Laboratorium</th>
                          <th className="p-3 text-center w-36">Sebelum (Before)</th>
                          <th className="p-3 text-center w-12"></th>
                          <th className="p-3 text-center w-36">Sesudah (After)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-slate-300">
                        <tr className="hover:bg-white/[0.01] transition-colors">
                          <td className="p-3">
                            <span className="font-semibold block text-slate-200">Volume Semprotan (Spray Volume)</span>
                            <span className="text-[9px] text-slate-500">Kapasitas pengabutan & debit injeksi bahan bakar</span>
                          </td>
                          <td className="p-3 text-center font-mono font-bold text-rose-400 bg-rose-500/[0.03]">
                            {workOrder.calibrationData.volumeSemprotan?.sebelum || '-'}
                          </td>
                          <td className="p-3 text-center text-slate-500">
                            <ChevronRight className="w-4 h-4 mx-auto text-slate-600" />
                          </td>
                          <td className="p-3 text-center font-mono font-bold text-emerald-400 bg-emerald-500/[0.03]">
                            {workOrder.calibrationData.volumeSemprotan?.sesudah || '-'}
                          </td>
                        </tr>
                        <tr className="hover:bg-white/[0.01] transition-colors">
                          <td className="p-3">
                            <span className="font-semibold block text-slate-200">Debit Backleak (Backleak Flow)</span>
                            <span className="text-[9px] text-slate-500">Pencegahan slip tekanan balik saluran injector</span>
                          </td>
                          <td className="p-3 text-center font-mono font-bold text-rose-400 bg-rose-500/[0.03]">
                            {workOrder.calibrationData.debitBackleak?.sebelum || '-'}
                          </td>
                          <td className="p-3 text-center text-slate-500">
                            <ChevronRight className="w-4 h-4 mx-auto text-slate-600" />
                          </td>
                          <td className="p-3 text-center font-mono font-bold text-emerald-400 bg-emerald-500/[0.03]">
                            {workOrder.calibrationData.debitBackleak?.sesudah || '-'}
                          </td>
                        </tr>
                        <tr className="hover:bg-white/[0.01] transition-colors">
                          <td className="p-3">
                            <span className="font-semibold block text-slate-200">Tekanan Pembukaan (Opening Pressure)</span>
                            <span className="text-[9px] text-slate-500">Batas ambang bar semprot nozzle utama</span>
                          </td>
                          <td className="p-3 text-center font-mono font-bold text-rose-400 bg-rose-500/[0.03]">
                            {workOrder.calibrationData.tekanan?.sebelum || '-'}
                          </td>
                          <td className="p-3 text-center text-slate-500">
                            <ChevronRight className="w-4 h-4 mx-auto text-slate-600" />
                          </td>
                          <td className="p-3 text-center font-mono font-bold text-emerald-400 bg-emerald-500/[0.03]">
                            {workOrder.calibrationData.tekanan?.sesudah || '-'}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="p-2.5 sm:p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl flex items-center gap-2 text-[8px] sm:text-[10px] text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    Seluruh parameter kalibrasi diuji menggunakan standar pabrikan resmi untuk memastikan performa bahan bakar kembali optimal.
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 sm:py-8 bg-black/20 border border-white/5 rounded-xl">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/[0.02] flex items-center justify-center mx-auto mb-2.5">
                    <Clock className="w-4.5 h-4.5 text-slate-500" />
                  </div>
                  <h4 className="text-[10px] sm:text-xs font-bold text-slate-300">Hasil Uji Kalibrasi Belum Dirilis</h4>
                  <p className="text-[8px] sm:text-[10px] text-slate-500 mt-1 max-w-[240px] sm:max-w-xs mx-auto leading-relaxed">
                    Data kalibrasi awal (Before) dan kalibrasi final (After) akan otomatis tampil setelah unit diuji pada Test Bench laboratorium kami.
                  </p>
                </div>
              )}
            </div>

            {/* Action Plans / Todo List */}
            {workOrder.todoActions && workOrder.todoActions.length > 0 && (
              <div className="bg-white/[0.02] border border-white/5 rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur-md">
                <h3 className="text-[10px] sm:text-xs font-display font-black text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Settings className="w-4 h-4 text-blue-400" />
                  Rencana Pengerjaan & Penggantian Suku Cadang
                </h3>

                {/* Mobile Friendly Card List View (Visible on small screens) */}
                <div className="block md:hidden space-y-2.5">
                  {workOrder.todoActions.map((act) => (
                    <div key={act.id} className="bg-black/20 border border-white/5 p-3 rounded-lg flex flex-col gap-2">
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-slate-200 text-xs">{act.jenisPengerjaan || 'Inspeksi & Diagnosis Lab'}</span>
                        <span className="font-mono text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-0.5 rounded font-bold uppercase shrink-0">
                          Qty: {act.qty}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 border-t border-white/5 pt-2 mt-1">
                        <p className="font-semibold text-[8px] uppercase tracking-wider text-slate-500 mb-0.5">Catatan Diagnosis:</p>
                        <p className="leading-relaxed text-slate-300">{act.catatanMekanik || 'Menunggu diagnosis awal teknisi'}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Responsive Table View (Visible on tablet up) */}
                <div className="hidden md:block overflow-x-auto border border-white/5 rounded-xl bg-black/20">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead className="bg-[#0b101c] text-slate-400 border-b border-white/5 font-mono font-bold uppercase tracking-wider">
                      <tr>
                        <th className="p-3">Detail Tindakan / Part Terkait</th>
                        <th className="p-3 text-center w-20">Quantity</th>
                        <th className="p-3">Catatan Diagnosis Mekanik</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-300">
                      {workOrder.todoActions.map((act) => (
                        <tr key={act.id} className="hover:bg-white/[0.01] transition-colors">
                          <td className="p-3 font-semibold">{act.jenisPengerjaan || 'Inspeksi & Diagnosis Lab'}</td>
                          <td className="p-3 text-center font-mono font-bold text-blue-400">{act.qty}</td>
                          <td className="p-3 text-slate-400 text-[11px] leading-relaxed">
                            {act.catatanMekanik || 'Menunggu diagnosis awal teknisi'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </main>

      <footer className="text-center text-[8px] sm:text-[10px] text-slate-500 mt-10 px-4 z-10 relative">
        <p className="font-medium">Indo Teknik Pekanbaru • Authorized Diesel Fuel Injection System Dealer</p>
        <p className="text-slate-600 mt-1 font-mono">Integrated Real-time ERP System • © 2026 All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default PublicTrackingView;
