import React, { useState, useEffect } from 'react';
import { useApp } from '../store/AppContext';
import { WorkOrder, Priority, PartLog, WOStatus, CalibrationData, CalibrationMetric } from '../types';
import { Play, Pause, CheckCircle, AlertTriangle, Timer, Clock, Send, Lock, Wrench, ClipboardList, AlertCircle, Search } from 'lucide-react';

const CALIBRATION_SPECS_DB = [
  { p_n: '0445110305', brand: 'Bosch', name: 'Toyota Hilux / Fortuner 2KD-FTV', pressure: '1600 Bar / 160 MPa', volume: '52.5 ± 2.5 cc', backleak: 'Max 12.0 cc' },
  { p_n: '0445110279', brand: 'Bosch', name: 'Hyundai H1 / Kia Sorento D4CB', pressure: '1600 Bar / 160 MPa', volume: '48.0 ± 2.0 cc', backleak: 'Max 10.5 cc' },
  { p_n: '295050-0180', brand: 'Denso', name: 'Mitsubishi Triton / Pajero Sport 4D56', pressure: '1800 Bar / 180 MPa', volume: '58.0 ± 3.0 cc', backleak: 'Max 15.0 cc' },
  { p_n: '295050-0520', brand: 'Denso', name: 'Toyota Innova / Fortuner 2GD-FTV', pressure: '2000 Bar / 200 MPa', volume: '45.0 ± 2.0 cc', backleak: 'Max 8.0 cc' },
  { p_n: 'EMBR00101D', brand: 'Delphi', name: 'Chevrolet Captiva 2.0 VCDi', pressure: '1600 Bar / 160 MPa', volume: '50.0 ± 2.5 cc', backleak: 'Max 11.0 cc' },
  { p_n: '0445120059', brand: 'Bosch Truck', name: 'Cummins ISDe / Dongfeng', pressure: '1400 Bar / 140 MPa', volume: '72.0 ± 4.0 cc', backleak: 'Max 18.0 cc' },
];

const parseEstimasiToSeconds = (estimasi: string): number => {
  if (!estimasi) return 3600; // Default 1 jam
  const matches = estimasi.match(/(\d+)\s*(hari|day|jam|hour|menit|min)/i);
  if (matches) {
    const val = parseInt(matches[1], 10);
    const text = matches[2].toLowerCase();
    if (text.includes('hari') || text.includes('day')) {
      return val * 24 * 3600;
    }
    if (text.includes('jam') || text.includes('hour')) {
      return val * 3600;
    }
    if (text.includes('menit') || text.includes('min')) {
      return val * 60;
    }
  }
  const valOnly = parseInt(estimasi, 10);
  if (!isNaN(valOnly)) return valOnly * 3600;
  return 3600;
};

const MechanicDashboard: React.FC = () => {
  const { workOrders, updateWorkOrder, currentUser, addPartLog } = useApp();
  const [activeWO, setActiveWO] = useState<WorkOrder | null>(null);

  // Specs Lookup State
  const [specsSearch, setSpecsSearch] = useState('');

  // Pause Interruption Modal State
  const [pauseModalOpen, setPauseModalOpen] = useState(false);
  
  // Hidden Defect Modal/Inputs State
  const [defectFormOpen, setDefectFormOpen] = useState(false);
  const [defectText, setDefectText] = useState('');
  const [defectCost, setDefectCost] = useState('');
  const [defectTime, setDefectTime] = useState('');

  // Manual Log Input State (Module 4)
  const [findings, setFindings] = useState('');
  const [notes, setNotes] = useState('');

  // Toast message state for FO sync alerts
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Live Digital Running Clock State (Module 1)
  const [currentElapsed, setCurrentElapsed] = useState<number>(0);

  // Track ticking clock for active work order
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (activeWO && activeWO.status === 'IN_PROGRESS') {
      const calcElapsed = () => {
        const base = activeWO.totalElapsedSeconds || 0;
        if (activeWO.startedAt) {
          const diff = Math.floor((Date.now() - new Date(activeWO.startedAt).getTime()) / 1000);
          return Math.max(0, base + diff);
        }
        return base;
      };

      setCurrentElapsed(calcElapsed());

      interval = setInterval(() => {
        setCurrentElapsed(calcElapsed());
      }, 1000);
    } else if (activeWO) {
      setCurrentElapsed(activeWO.totalElapsedSeconds || 0);
    } else {
      setCurrentElapsed(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeWO]);

  // Keep activeWO synced with the global state (changes in partLogs, status, etc.)
  useEffect(() => {
    if (activeWO) {
      const updated = workOrders.find(w => w.id === activeWO.id);
      if (updated) {
        setActiveWO(updated);
      }
    }
  }, [workOrders, activeWO?.id]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 5000);
  };

  const getPriorityBadge = (p: Priority) => {
    switch (p) {
      case 1:
        return <span className="px-2 py-1 bg-red-100 text-red-800 text-[10px] font-black rounded border border-red-200">🔴 P1: DARURAT</span>;
      case 2:
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-[10px] font-black rounded border border-yellow-200">🟡 P2: JANJI TEMU</span>;
      case 3:
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-[10px] font-black rounded border border-blue-200">🔵 P3: REGULER</span>;
    }
  };

  const getStatusBadge = (status: WOStatus) => {
    switch (status) {
      case 'QUEUE':
        return <span className="px-2 py-0.5 bg-slate-100 text-slate-800 text-[9px] rounded font-bold border border-slate-200">Antrean</span>;
      case 'IN_PROGRESS':
        return <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[9px] rounded font-bold border border-blue-200 animate-pulse">Sedang Kerja</span>;
      case 'PENDING_APPROVAL':
        return <span className="px-2 py-0.5 bg-red-100 text-red-800 text-[9px] rounded font-bold border border-red-200 animate-pulse">Butuh Persetujuan</span>;
      case 'PENDING_PARTS':
        return <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[9px] rounded font-bold border border-amber-200">Tertunda Parts</span>;
      case 'COMPLETED':
        return <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] rounded font-bold border border-emerald-200">Siap QC</span>;
      default:
        return null;
    }
  };

  // Sort queue list: Priority 1 first, then order of entry
  const queueList = [...workOrders]
    .filter(wo => wo.status !== 'COMPLETED')
    .sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

  const handleStartJob = (wo: WorkOrder) => {
    const nowStr = new Date().toISOString();
    updateWorkOrder(wo.id, {
      status: 'IN_PROGRESS',
      mechanicId: currentUser?.id || '3',
      startedAt: nowStr,
      isBlocked: false,
      blockedReason: undefined
    });
    
    setActiveWO({
      ...wo,
      status: 'IN_PROGRESS',
      mechanicId: currentUser?.id || '3',
      startedAt: nowStr,
      isBlocked: false,
      blockedReason: undefined
    });
    
    showToast(`Pekerjaan untuk WO ${wo.id} berhasil dimulai.`);
  };

  const handlePauseClick = () => {
    setPauseModalOpen(true);
  };

  const handleSelectPauseReason = (reason: 'WAITING_PARTS' | 'HIDDEN_DEFECT') => {
    if (!activeWO) return;
    
    // Freeze current running timer and calculate total seconds accrued
    const base = activeWO.totalElapsedSeconds || 0;
    let accrued = base;
    if (activeWO.startedAt) {
      accrued += Math.floor((Date.now() - new Date(activeWO.startedAt).getTime()) / 1000);
    }

    if (reason === 'WAITING_PARTS') {
      // Opsi 1: Menunggu suku cadang dari logistik
      updateWorkOrder(activeWO.id, {
        status: 'PENDING_PARTS',
        totalElapsedSeconds: accrued,
        startedAt: undefined,
        isBlocked: false,
        blockedReason: undefined
      });
      setPauseModalOpen(false);
      setActiveWO(null);
      showToast(`Pekerjaan dijedakan. Status: [Tertunda Parts]`);
    } else {
      // Opsi 2: Hidden defect - transition to details input
      setPauseModalOpen(false);
      setDefectFormOpen(true);
    }
  };

  const handleSaveHiddenDefect = () => {
    if (!activeWO) return;
    if (!defectText.trim()) {
      alert('Mohon isi detail temuan kerusakan terlebih dahulu.');
      return;
    }

    const base = activeWO.totalElapsedSeconds || 0;
    let accrued = base;
    if (activeWO.startedAt) {
      accrued += Math.floor((Date.now() - new Date(activeWO.startedAt).getTime()) / 1000);
    }

    // Completely lock mechanic's jobs, update global flag
    const defectNote = `[TEMUAN HIDDEN DEFECT]: ${defectText} (Est: Rp ${defectCost || '0'}, Waktu: ${defectTime || 'N/A'})`;
    const newCustomerVoice = activeWO.customerVoice 
      ? `${activeWO.customerVoice}\n${defectNote}`
      : defectNote;

    updateWorkOrder(activeWO.id, {
      status: 'PENDING_APPROVAL',
      totalElapsedSeconds: accrued,
      startedAt: undefined,
      isBlocked: true,
      blockedReason: 'HIDDEN_DEFECT',
      customerVoice: newCustomerVoice
    });

    const updated = {
      ...activeWO,
      status: 'PENDING_APPROVAL' as WOStatus,
      totalElapsedSeconds: accrued,
      startedAt: undefined,
      isBlocked: true,
      blockedReason: 'HIDDEN_DEFECT' as const,
      customerVoice: newCustomerVoice
    };

    setActiveWO(updated);
    setDefectFormOpen(false);
    setDefectText('');
    setDefectCost('');
    setDefectTime('');
    showToast(`PROTOKOL STOP-CLOCK AKTIF: Mengirimkan data kerusakan baru ke Front Office.`);
  };

  const handleComplete = (id: string) => {
    updateWorkOrder(id, {
      status: 'COMPLETED',
      startedAt: undefined,
      isBlocked: false,
      blockedReason: undefined
    });
    setActiveWO(null);
    showToast(`Pekerjaan selesai! Berhasil mengirim sinyal sinkronisasi real-time ke Front Office.`);
  };

  const handleToggleTodo = (actionId: string, isChecked: boolean) => {
    if (!activeWO || !activeWO.todoActions) return;
    
    const updatedTodos = activeWO.todoActions.map(action =>
      action.id === actionId ? { ...action, completed: isChecked } : action
    );

    updateWorkOrder(activeWO.id, {
      todoActions: updatedTodos
    });

    setActiveWO({
      ...activeWO,
      todoActions: updatedTodos
    });

    showToast(`Status tindakan berhasil disinkronkan ke server lokal.`);
  };
  
  const handleUpdateCalibration = (metric: keyof CalibrationData, field: keyof CalibrationMetric, value: string) => {
    if (!activeWO) return;
    const currentCal = activeWO.calibrationData || {
      volumeSemprotan: { sebelum: '', sesudah: '' },
      debitBackleak: { sebelum: '', sesudah: '' },
      tekanan: { sebelum: '', sesudah: '' },
    };

    const updatedCal = {
      ...currentCal,
      [metric]: {
        ...currentCal[metric],
        [field]: value
      }
    };

    updateWorkOrder(activeWO.id, {
      calibrationData: updatedCal
    });

    setActiveWO({
      ...activeWO,
      calibrationData: updatedCal
    });
  };

  const handleUpdateRepairResult = (index: number, value: string) => {
    if (!activeWO) return;
    const currentResults = activeWO.repairResults || {};
    const updatedResults = {
      ...currentResults,
      [index]: value
    };

    updateWorkOrder(activeWO.id, {
      repairResults: updatedResults
    });

    setActiveWO({
      ...activeWO,
      repairResults: updatedResults
    });
  };

  const handleSubmitPartLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWO) return;
    if (!findings.trim()) {
      alert('Mohon isi field Temuan / Suku Cadang terlebih dahulu.');
      return;
    }

    addPartLog(activeWO.id, {
      nozzleTipJammed: false,
      nozzleTipWorn: false,
      valveScratched: false,
      valveLeak: false,
      shimAdjusted: false,
      sealKitReplaced: false,
      findings: findings.trim(),
      notes: notes.trim()
    });

    setFindings('');
    setNotes('');
    showToast(`Log temuan baru berhasil disimpan ke ledger lokal.`);
  };

  // Helper for formatting time (Module 1)
  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return [
      hrs.toString().padStart(2, '0'),
      mins.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0'),
    ].join(':');
  };

  const estimasiSeconds = parseEstimasiToSeconds(activeWO?.estimasiPengerjaan || '');
  const isTimerCritical = currentElapsed >= 0.8 * estimasiSeconds;

  return (
    <div className="p-4 print:hidden flex flex-col lg:flex-row gap-4 h-full bg-slate-100 min-h-screen text-slate-900">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 z-50 bg-slate-900 text-white text-xs px-4 py-3 rounded-lg shadow-xl border border-blue-500/50 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-5">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Left Column: Queue List */}
      <div className="w-full lg:w-1/3 flex flex-col">
        <section className="bg-slate-850 bg-[#1e293b] text-white rounded-lg shadow-lg flex-1 flex flex-col overflow-hidden border border-slate-700">
          <div className="p-4 border-b border-slate-700 bg-slate-900">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-black uppercase tracking-widest text-blue-400 flex items-center">
                <Timer className="w-4 h-4 mr-2" />
                ANTREAN PRODUKSI LABORATORIUM
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded">
                  {queueList.length} Aktif
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
            {queueList.length === 0 ? (
              <div className="text-center p-8 text-slate-400 text-xs italic">Tidak ada pekerjaan dalam antrean aktif.</div>
            ) : (
              queueList.map((wo) => {
                const isActive = activeWO?.id === wo.id;
                return (
                  <div 
                    key={wo.id} 
                    className={`bg-slate-800 border-l-4 p-3 rounded-lg transition-all ${
                      isActive 
                        ? 'bg-slate-750 ring-2 ring-blue-500 border-blue-500' 
                        : 'hover:bg-slate-700 border-slate-600'
                    } ${
                      wo.priority === 1 ? 'border-l-red-500' : wo.priority === 2 ? 'border-l-yellow-500' : 'border-l-blue-500'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1.5">
                      {getPriorityBadge(wo.priority)}
                      <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded">{wo.id}</span>
                    </div>
                    <h4 className="text-xs font-black text-white truncate">{wo.vehicleBrand} - {wo.plateNumber}</h4>
                    <p className="text-[10px] text-slate-300 mt-1">Nama: {wo.customerName}</p>
                    
                    <div className="mt-3 flex justify-between items-center gap-2">
                      <div>
                        {getStatusBadge(wo.status)}
                      </div>
                      
                      {wo.status === 'QUEUE' && (
                        <button 
                          onClick={() => handleStartJob(wo)} 
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold rounded uppercase transition-colors flex items-center gap-1 shadow-md"
                        >
                          <Play className="w-3 h-3" /> MULAI KERJA
                        </button>
                      )}

                      {wo.status === 'PENDING_PARTS' && (
                        <button 
                          onClick={() => handleStartJob(wo)} 
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold rounded uppercase transition-colors flex items-center gap-1 shadow-md"
                        >
                          <Play className="w-3 h-3" /> LANJUTKAN
                        </button>
                      )}

                      {wo.status === 'IN_PROGRESS' && !isActive && (
                        <div className="text-[9px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                          Sedang Dikerjakan Mekanik Lain
                        </div>
                      )}

                      {wo.status === 'PENDING_APPROVAL' && (
                        <div className="text-[9px] text-red-400 font-bold uppercase tracking-wider flex items-center gap-1 animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                          Terblokir (Butuh Persetujuan)
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>

      {/* Right Column: Active Workspace Panel */}
      <div className="w-full lg:w-2/3 flex flex-col">
        {!activeWO ? (
          <div className="bg-white rounded-lg shadow-lg border border-slate-200 h-full flex flex-col items-center justify-center p-12 text-center flex-1 min-h-[400px]">
             <Wrench className="w-16 h-16 text-slate-300 mb-4 animate-spin duration-1000" />
             <h2 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-2">RUANG KERJA MEKANIK KOSONG</h2>
             <p className="text-slate-400 text-xs max-w-sm leading-relaxed">
               Silakan pilih salah satu pekerjaan dari Antrean Produksi di panel kiri kemudian klik <strong>MULAI KERJA</strong> untuk memuat lembar kerja lab diagnosis dan log perbaikan.
             </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg border border-slate-200 flex flex-col h-full relative overflow-hidden flex-1">
            
            {/* LOCK OVERLAY IF BLOCK PROTOCOL ACTIVE */}
            {activeWO.status === 'PENDING_APPROVAL' && activeWO.blockedReason === 'HIDDEN_DEFECT' && (
              <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center z-40 animate-in fade-in duration-300">
                <AlertTriangle className="w-16 h-16 text-red-500 animate-bounce mb-4" />
                <h2 className="text-xl font-black text-red-500 uppercase tracking-wider">
                  ⚠️ PROTOKOL STOP-CLOCK AKTIF!
                </h2>
                <h3 className="text-sm font-bold text-white mt-1 uppercase">
                  RUANG KERJA TERKUNCI (TEMUAN KERUSAKAN BARU)
                </h3>
                <p className="text-slate-300 text-xs max-w-md mt-4 leading-relaxed">
                  Sistem mendeteksi adanya temuan kerusakan tersembunyi (Hidden Defect) pada kendaraan ini. Sesuai standar operasional, lembar kerja Anda dikunci dan timer dihentikan sementara menunggu estimasi ulang biaya dan persetujuan dari pelanggan di Front Office.
                </p>
                <div className="mt-6 bg-slate-850 bg-slate-800 border border-slate-700 rounded-lg p-4 max-w-sm text-left">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Detail Kerusakan yang Dilaporkan:</div>
                  <div className="text-xs text-white font-medium mt-1 leading-normal">
                    {activeWO.customerVoice.split('\n').filter(line => line.includes('[TEMUAN HIDDEN DEFECT]')).pop() || activeWO.customerVoice}
                  </div>
                </div>
                <button 
                  onClick={() => setActiveWO(null)}
                  className="mt-8 px-6 py-2.5 bg-slate-800 hover:bg-slate-750 text-white font-bold text-xs rounded uppercase border border-slate-700 transition-all shadow-md flex items-center gap-2"
                >
                  Kembali ke Antrean Kerja
                </button>
              </div>
            )}

            {/* Panel Workspace Header */}
            <div className="bg-slate-550 bg-slate-900 text-white p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0 border-b border-slate-700">
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-lg font-black text-white">{activeWO.vehicleBrand}</h1>
                  {getPriorityBadge(activeWO.priority)}
                </div>
                <div className="text-[10px] text-slate-300 font-mono font-bold mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
                  <span>ID SPK: {activeWO.id}</span>
                  <span>PLAT NOMOR: {activeWO.plateNumber}</span>
                  <span>ESTIMASI SA: {activeWO.estimasiPengerjaan || 'N/A'}</span>
                </div>
              </div>

              {/* Module 1 Live Timer & Action Controls */}
              <div className="flex flex-col md:items-end gap-2 w-full md:w-auto">
                <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg">
                  <Clock className={`w-4 h-4 ${isTimerCritical ? 'text-[#ef4444] animate-pulse' : 'text-blue-400'}`} />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TIMER PRODUKSI:</span>
                  <span className={`font-mono text-sm font-black tracking-widest ${isTimerCritical ? 'text-[#ef4444] animate-pulse' : 'text-blue-400'}`}>
                    {formatTime(currentElapsed)}
                  </span>
                </div>
                
                <div className="flex gap-2 w-full justify-end">
                  {activeWO.status === 'IN_PROGRESS' && (
                    <button 
                      onClick={handlePauseClick} 
                      className="px-4 py-1.5 border border-slate-600 hover:bg-slate-800 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all"
                    >
                      <Pause className="w-3.5 h-3.5" /> JEDA / PAUSE
                    </button>
                  )}
                  <button 
                    onClick={() => handleComplete(activeWO.id)} 
                    className="px-4 py-1.5 bg-emerald-600 text-white rounded text-xs font-bold shadow-md hover:bg-emerald-500 uppercase tracking-wider flex items-center gap-1.5 transition-all"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> SIAP QC
                  </button>
                </div>
              </div>
            </div>

            {/* Active Workspace Form Container */}
            <div className="p-4 flex-1 overflow-y-auto">
              
              {/* MODULE 1: Pencarian Spesifikasi Standard Komponen */}
              <div className="mb-6 bg-[#0f172a] text-white border border-slate-700 rounded-lg p-4 shadow-md">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    PENCARIAN SPESIFIKASI STANDARD KOMPONEN
                  </h3>
                  <span className="text-[9px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                    Database Standar Lab
                  </span>
                </div>
                
                <p className="text-[11px] text-slate-300 leading-relaxed mb-3">
                  Masukkan Part Number (P/N) Bosch, Denso, atau Delphi untuk melihat standar tekanan pembukaan, debit semprotan, dan toleransi backleak.
                </p>

                <div className="relative mb-3">
                  <input
                    type="text"
                    placeholder="Cari berdasarkan P/N (contoh: 0445110305) atau model mesin..."
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2.5 pl-9 text-xs text-white focus:outline-none focus:border-emerald-500"
                    value={specsSearch}
                    onChange={(e) => setSpecsSearch(e.target.value)}
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>

                {specsSearch.trim() !== '' && (
                  <div className="space-y-3 mt-2">
                    {specsSearch.trim() !== '' && CALIBRATION_SPECS_DB.filter(s => 
                      s.p_n.toLowerCase().includes(specsSearch.toLowerCase()) || 
                      s.name.toLowerCase().includes(specsSearch.toLowerCase()) || 
                      s.brand.toLowerCase().includes(specsSearch.toLowerCase())
                    ).length === 0 ? (
                      <p className="text-[11px] text-slate-400 italic">Tidak ditemukan spesifikasi yang cocok dengan kata kunci "{specsSearch}".</p>
                    ) : (
                      CALIBRATION_SPECS_DB.filter(s => 
                        s.p_n.toLowerCase().includes(specsSearch.toLowerCase()) || 
                        s.name.toLowerCase().includes(specsSearch.toLowerCase()) || 
                        s.brand.toLowerCase().includes(specsSearch.toLowerCase())
                      ).map((spec) => (
                        <div key={spec.p_n} className="bg-slate-900 border border-slate-700 rounded p-3 text-xs">
                          <div className="flex flex-col sm:flex-row justify-between items-start gap-2 border-b border-slate-700 pb-2 mb-2">
                            <div>
                              <span className="font-mono font-black text-emerald-400 tracking-wider text-xs">{spec.p_n}</span>
                              <span className="ml-2 font-black text-white">{spec.brand}</span>
                            </div>
                            <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded font-bold border border-emerald-800">
                              {spec.name}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center text-[11px]">
                            <div className="bg-slate-850 p-2 rounded border border-slate-800">
                              <div className="text-slate-400 font-bold mb-0.5">Tekanan Pembukaan</div>
                              <div className="font-mono text-white font-black">{spec.pressure}</div>
                            </div>
                            <div className="bg-slate-850 p-2 rounded border border-slate-800">
                              <div className="text-slate-400 font-bold mb-0.5">Debit Semprotan</div>
                              <div className="font-mono text-white font-black">{spec.volume}</div>
                            </div>
                            <div className="bg-slate-850 p-2 rounded border border-slate-800">
                              <div className="text-slate-400 font-bold mb-0.5">Toleransi Backleak</div>
                              <div className="font-mono text-white font-black">{spec.backleak}</div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {specsSearch.trim() === '' && (
                  <div className="border-t border-slate-800 pt-3 mt-2">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Paling Sering Dicari:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {CALIBRATION_SPECS_DB.slice(0, 4).map((spec) => (
                        <button
                          key={spec.p_n}
                          type="button"
                          onClick={() => setSpecsSearch(spec.p_n)}
                          className="text-[10px] bg-slate-900 hover:bg-slate-850 border border-slate-700 text-slate-300 font-mono px-2 py-1 rounded transition-colors"
                        >
                          {spec.p_n} ({spec.brand})
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Customer Voice Card */}
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg shadow-sm">
                <h3 className="text-[10px] font-black text-red-800 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> KELUHAN UTAMA KONSUMEN (CUSTOMER VOICE)
                </h3>
                <p className="text-xs text-red-950 leading-relaxed font-semibold">{activeWO.customerVoice || 'Tidak ada deskripsi keluhan'}</p>
              </div>

              {/* Module 2: MANIFES KOMPONEN DITERIMA */}
              <div className="mb-6 bg-slate-50 border border-slate-200 rounded-lg p-4 shadow-sm">
                <h3 className="text-xs font-black text-slate-800 uppercase mb-3 flex items-center gap-2">
                  <span className="bg-slate-800 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black">1</span>
                  MANIFES KOMPONEN MASUK DARI FRONT OFFICE
                </h3>
                {!activeWO.looseParts || activeWO.looseParts.length === 0 ? (
                  <p className="text-xs text-slate-500 italic text-center py-2">Tidak ada data manifes komponen yang diinput SA.</p>
                ) : (
                  <div className="overflow-x-auto border border-slate-200 rounded-lg shadow-sm">
                    <table className="w-full text-xs text-left">
                      <thead className="text-[10px] text-slate-700 uppercase bg-slate-100 border-b border-slate-200 font-bold">
                        <tr>
                          <th className="px-3 py-2 font-black">Keterangan</th>
                          <th className="px-3 py-2 font-black">Part Number (P/N)</th>
                          <th className="px-3 py-2 font-black">Kondisi Fisik Luar</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {activeWO.looseParts.map((p, idx) => (
                          <tr key={p.id || idx} className="hover:bg-slate-550 hover:bg-slate-50">
                            <td className="px-3 py-2.5 font-bold text-slate-800">{p.description || '-'}</td>
                            <td className="px-3 py-2.5 font-mono text-slate-800">{p.partNumber || '-'}</td>
                            <td className="px-3 py-2.5 text-slate-800">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                p.physicalCondition?.toLowerCase() === 'ok' 
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}>
                                {p.physicalCondition || 'OK'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Module 3: DAFTAR TINDAKAN & CHECKLIST */}
              <div className="mb-6 bg-slate-50 border border-slate-200 rounded-lg p-4 shadow-sm">
                <h3 className="text-xs font-black text-slate-800 uppercase mb-3 flex items-center gap-2">
                  <span className="bg-slate-800 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black">2</span>
                  DAFTAR TINDAKAN & PANDUAN KERJA MEKANIK
                </h3>
                {!activeWO.todoActions || activeWO.todoActions.length === 0 ? (
                  <p className="text-xs text-slate-500 italic text-center py-2">Tidak ada tindakan panduan kerja dari Service Advisor.</p>
                ) : (
                  <div className="space-y-2">
                    {activeWO.todoActions.map((action) => (
                      <label 
                        key={action.id} 
                        className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                          action.completed 
                            ? 'bg-emerald-50 border-emerald-200' 
                            : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                        }`}
                      >
                        <input 
                          type="checkbox" 
                          className="w-4.5 h-4.5 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 mt-0.5 cursor-pointer"
                          checked={!!action.completed}
                          onChange={(e) => handleToggleTodo(action.id, e.target.checked)}
                        />
                        <div className="flex-1 text-xs">
                          <div className="flex justify-between items-start gap-2">
                            <span className={`font-bold ${action.completed ? 'text-slate-400 line-through' : 'text-slate-850 text-slate-800'}`}>
                              {action.jenisPengerjaan}
                            </span>
                            <span className="font-mono text-slate-500 text-[10px] font-bold bg-slate-100 px-1.5 py-0.5 rounded">Qty: {action.qty}</span>
                          </div>
                          {action.catatanMekanik && (
                            <p className="text-[11px] text-slate-500 mt-1 italic">Instruksi SA: {action.catatanMekanik}</p>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Module 4: REHAUL LOG TEMUAN & MANUALLY INPUTS */}
              <div className="mb-6 bg-slate-50 border border-slate-200 rounded-lg p-4 shadow-sm">
                <h3 className="text-xs font-black text-slate-800 uppercase mb-3 flex items-center gap-2">
                  <span className="bg-slate-800 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black">3</span>
                  LOG TEMUAN KERUSAKAN & PENGGANTIAN SUKU CADANG DALAM
                </h3>
                
                <form onSubmit={handleSubmitPartLog} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm mb-4">
                  <div className="grid grid-cols-1 gap-3.5 mb-3.5">
                    <div>
                      <label className="block text-[11px] font-black text-slate-700 uppercase mb-1">
                        Temuan / Suku Cadang <span className="text-red-500">*</span>
                      </label>
                      <textarea 
                        placeholder="Ketikkan secara manual temuan kerusakan atau suku cadang dalam yang diganti (Contoh: Ganti Valve Plate No. 3, Nozzle Tip Silinder 1 Macet)"
                        className="w-full rounded border border-slate-300 p-2.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none leading-relaxed"
                        rows={3}
                        value={findings}
                        onChange={e => setFindings(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-black text-slate-700 uppercase mb-1">
                        Catatan Tambahan (Notes)
                      </label>
                      <input 
                        type="text"
                        placeholder="Tambahkan catatan teknik atau keterangan lab penunjang..."
                        className="w-full rounded border border-slate-300 p-2.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button 
                      type="submit" 
                      className="bg-slate-800 hover:bg-slate-900 text-white px-5 py-2 rounded text-xs font-black uppercase transition-colors shadow flex items-center gap-1"
                    >
                      <Send className="w-3 h-3" /> TAMBAH LOG
                    </button>
                  </div>
                </form>

                {/* Module 4 Grid Table History */}
                {activeWO.partLogs && activeWO.partLogs.length > 0 && (
                  <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                    <table className="min-w-full divide-y divide-slate-200 text-xs">
                      <thead className="bg-slate-100 text-slate-700">
                        <tr>
                          <th className="px-4 py-2.5 text-left font-black uppercase tracking-wider w-1/4">JAM / TANGGAL</th>
                          <th className="px-4 py-2.5 text-left font-black uppercase tracking-wider w-1/2">TEMUAN / SUKU CADANG</th>
                          <th className="px-4 py-2.5 text-left font-black uppercase tracking-wider w-1/4">CATATAN (NOTES)</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-200">
                        {activeWO.partLogs.map((log, index) => (
                          <tr key={log.id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50 hover:bg-slate-100/50'}>
                            <td className="px-4 py-2.5 whitespace-nowrap text-slate-500 font-mono font-bold">
                              {new Date(log.date).toLocaleString('id-ID', { hour12: false })}
                            </td>
                            <td className="px-4 py-2.5 text-slate-800 font-bold leading-normal">{log.findings || 'Tidak ada temuan'}</td>
                            <td className="px-4 py-2.5 text-slate-600 leading-normal">{log.notes || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* MODULE 3: RANGKUMAN HASIL PERBAIKAN (BEFORE VS AFTER BUILDER) */}
              <div className="mb-6 bg-slate-50 border border-slate-200 rounded-lg p-4 shadow-sm">
                <h3 className="text-xs font-black text-slate-800 uppercase mb-3 flex items-center gap-2">
                  <span className="bg-slate-800 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black">4</span>
                  RANGKUMAN HASIL PERBAIKAN (BEFORE VS AFTER BUILDER)
                </h3>
                
                <p className="text-[11px] text-slate-500 leading-relaxed mb-4">
                  Berikut adalah keluhan pelanggan yang telah disetujui pada SPK awal (Kondisi Sebelum / Before). Silakan isi status pemulihan, tindakan teknis, atau kondisi akhir (Kondisi Sesudah / After) untuk setiap poin keluhan di bawah ini untuk mencetak rekap perbaikan resmi.
                </p>

                {(() => {
                  const complaintLines = activeWO.customerVoice
                    ? activeWO.customerVoice
                        .split('\n')
                        .map(l => l.trim())
                        .filter(l => l.length > 0 && !l.includes('[TEMUAN HIDDEN DEFECT]'))
                    : [];

                  if (complaintLines.length === 0) {
                    return (
                      <div className="text-center py-4 bg-white border border-slate-150 rounded text-xs text-slate-400 italic">
                        Tidak ada poin keluhan pelanggan yang terdaftar pada SPK ini.
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-3">
                      {complaintLines.map((line, idx) => (
                        <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm space-y-2">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5 border-b border-slate-100 pb-2">
                            <span className="text-[10px] bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-black uppercase tracking-wider">
                              Keluhan #{idx + 1}
                            </span>
                            <span className="text-[9px] text-slate-400 font-mono">Status Rekonsiliasi Perbaikan</span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                            {/* Before column (read-only symptom) */}
                            <div className="bg-red-50/35 border border-red-150 rounded p-2.5">
                              <span className="text-[9px] text-red-500 font-bold block uppercase tracking-wider mb-1">Sebelum / Gejala Keluhan (Before)</span>
                              <p className="text-xs font-bold text-slate-800 leading-relaxed">
                                {line}
                              </p>
                            </div>

                            {/* After column (editable repair output) */}
                            <div className="bg-emerald-50/25 border border-emerald-150 rounded p-2.5 flex flex-col justify-between">
                              <span className="text-[9px] text-emerald-600 font-bold block uppercase tracking-wider mb-1">Sesudah / Status Perbaikan (After)</span>
                              <input
                                type="text"
                                placeholder="Contoh: Kalibrasi ulang berhasil, komponen kembali normal / diganti komponen baru"
                                className="w-full text-xs p-2 border border-slate-200 rounded outline-none focus:border-emerald-500 font-semibold bg-white text-slate-800"
                                value={activeWO.repairResults?.[idx] || ''}
                                onChange={(e) => handleUpdateRepairResult(idx, e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

            </div>

            {/* Protocol Stop-Clock Footer Area */}
            <div className="bg-[#1e293b] text-white border-t-2 border-red-500 p-4 shrink-0 flex flex-col md:flex-row justify-between items-center gap-3">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-6 h-6 text-red-500 shrink-0 animate-pulse" />
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-red-500 flex items-center gap-1">
                    PROTOKOL STOP-CLOCK LAB DIESEL
                  </h4>
                  <p className="text-slate-400 text-[10px] mt-0.5 leading-relaxed">
                    Gunakan tombol ini jika mendeteksi kerusakan tersembunyi (Hidden Defect) di dalam komponen yang memerlukan estimasi ulang.
                  </p>
                </div>
              </div>
              <button 
                onClick={handlePauseClick} 
                className="w-full md:w-auto bg-red-600 hover:bg-red-500 text-white text-xs font-black py-2 px-5 rounded uppercase shadow-md flex items-center justify-center gap-1.5 transition-all"
              >
                <AlertTriangle className="w-4 h-4" /> AKTIFKAN STOP-CLOCK
              </button>
            </div>

          </div>
        )}
      </div>

      {/* PAUSE INTERRUPTION REASON MODAL OVERLAY */}
      {pauseModalOpen && (
        <div className="fixed inset-0 bg-slate-900/85 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="bg-slate-900 text-white p-4 flex items-center gap-2">
              <Pause className="w-5 h-5 text-blue-400" /> 
              <h3 className="text-sm font-black uppercase tracking-wider">
                PILIH ALASAN PENANGGUHAN JEDA
              </h3>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                Silakan pilih salah satu opsi interupsi di bawah untuk memperbarui status antrean ke sistem Front Office:
              </p>
              
              <div className="space-y-3">
                {/* Opsi 1 */}
                <button 
                  type="button"
                  onClick={() => handleSelectPauseReason('WAITING_PARTS')}
                  className="w-full text-left p-4 rounded-lg border border-slate-200 hover:border-amber-500 hover:bg-amber-50/20 transition-all flex items-start gap-3 group"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">📦</span>
                  <div>
                    <div className="font-black text-slate-800 text-xs">Opsi 1: Menunggu Suku Cadang Gudang</div>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-normal">
                      Mengubah status antrean menjadi <strong className="text-amber-600">[Tertunda Parts]</strong>. Anda dapat mengerjakan SPK lain di antrean.
                    </p>
                  </div>
                </button>

                {/* Opsi 2 */}
                <button 
                  type="button"
                  onClick={() => handleSelectPauseReason('HIDDEN_DEFECT')}
                  className="w-full text-left p-4 rounded-lg border border-slate-200 hover:border-red-500 hover:bg-red-50/20 transition-all flex items-start gap-3 group"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">⚠️</span>
                  <div>
                    <div className="font-black text-red-600 text-xs">Opsi 2: PROTOKOL STOP-CLOCK: Temuan Kerusakan Baru</div>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-normal">
                      Menghentikan timer kerja, mengunci ruang kerja lab Anda, dan mengirim notifikasi bahaya re-estimasi langsung ke Service Advisor.
                    </p>
                  </div>
                </button>
              </div>
            </div>
            <div className="bg-slate-50 p-4 flex justify-end border-t border-slate-200">
              <button 
                onClick={() => setPauseModalOpen(false)} 
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded transition-colors uppercase"
              >
                Kembali
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NESTED HIDDEN DEFECT DETAILS FORM MODAL */}
      {defectFormOpen && (
        <div className="fixed inset-0 bg-slate-900/85 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="bg-red-600 text-white p-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 animate-bounce" />
              <h3 className="text-sm font-black uppercase tracking-wider">
                FORM PROTOKOL STOP-CLOCK: TEMUAN KERUSAKAN BARU
              </h3>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">
                  Detail Temuan Kerusakan Baru <span className="text-red-500">*</span>
                </label>
                <textarea 
                  className="w-full rounded border border-slate-300 p-2.5 text-xs focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none leading-relaxed" 
                  rows={3} 
                  placeholder="Deskripsikan kerusakan tersembunyi yang Anda temukan (Contoh: Cup Nozzle retak rambut, solenoid gosong di dalam dll)" 
                  value={defectText} 
                  onChange={(e) => setDefectText(e.target.value)}
                  required
                ></textarea>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase mb-1">Estimasi Tambahan Biaya (Rp)</label>
                  <input 
                    type="text" 
                    className="w-full rounded border border-slate-300 p-2.5 text-xs focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none" 
                    placeholder="e.g. 1.500.000" 
                    value={defectCost} 
                    onChange={(e) => setDefectCost(e.target.value)} 
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase mb-1">Tambahan Waktu yang Dibutuhkan</label>
                  <input 
                    type="text" 
                    className="w-full rounded border border-slate-300 p-2.5 text-xs focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none" 
                    placeholder="e.g. +2 Hari / +5 Jam" 
                    value={defectTime} 
                    onChange={(e) => setDefectTime(e.target.value)} 
                  />
                </div>
              </div>
              
              <div className="bg-amber-50 border border-amber-200 rounded p-3 text-[11px] text-amber-800 leading-normal">
                <strong>💡 Catatan Protokol:</strong> Menekan tombol konfirmasi akan langsung menghentikan timer kerja, mengunci ruang kerja ini, dan membunyikan alarm visual pada dasbor Service Advisor di Front Office.
              </div>
            </div>
            <div className="bg-slate-50 p-4 flex justify-end gap-3 border-t border-slate-200">
              <button 
                onClick={() => {
                  setDefectFormOpen(false);
                  setPauseModalOpen(true);
                }} 
                className="px-4 py-2 text-xs font-bold text-slate-650 text-slate-600 hover:bg-slate-200 rounded transition-colors uppercase"
              >
                Batal
              </button>
              <button 
                onClick={handleSaveHiddenDefect} 
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded uppercase shadow-md flex items-center gap-1 transition-all"
              >
                <Send className="w-4 h-4" /> AKTIFKAN STOP-CLOCK
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MechanicDashboard;
