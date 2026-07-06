import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../store/AppContext';
import { WorkOrder, Priority, PartLog, WOStatus, CalibrationData, CalibrationMetric } from '../types';
import { Play, Pause, CheckCircle, AlertTriangle, Timer, Clock, Send, Lock, Wrench, ClipboardList, AlertCircle, Search, Compass, Check } from 'lucide-react';
import { GENERAL_TRACKING_MILESTONES } from './PublicTrackingView';

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

const getDivisionLabel = (div: string) => {
  if (div === 'SUPPLY_PUMP' || div === 'MECHANIC') return 'Fuel Pump';
  if (div === 'COMMON_RAIL') return 'Common Rail';
  return div.replace(/_/g, ' ');
};

const isWorkOrderAssignedToUser = (wo: WorkOrder, user: any, usersList: any[]): boolean => {
  if (!user || !wo.mechanicId) return false;
  
  const cleanId = wo.mechanicId.trim().toLowerCase();
  const cleanUserId = (user.id || '').trim().toLowerCase();
  const cleanUsername = (user.username || '').trim().toLowerCase();
  const cleanName = (user.name || '').trim().toLowerCase();
  
  if (cleanId === cleanUserId || cleanId === cleanUsername || cleanId === cleanName) return true;
  
  if (usersList && usersList.length > 0) {
    const assignedUser = usersList.find(u => 
      u.id.trim().toLowerCase() === cleanId || 
      u.username.trim().toLowerCase() === cleanId || 
      u.name.trim().toLowerCase() === cleanId
    );
    if (assignedUser) {
      const cleanAssignedUsername = assignedUser.username.trim().toLowerCase();
      const cleanAssignedId = assignedUser.id.trim().toLowerCase();
      const cleanAssignedName = assignedUser.name.trim().toLowerCase();
      if (
        cleanAssignedUsername === cleanUsername || 
        cleanAssignedId === cleanUserId || 
        cleanAssignedName === cleanName
      ) {
        return true;
      }
    }
  }
  
  return false;
};

const MechanicDashboard: React.FC = () => {
  const { workOrders, updateWorkOrder, currentUser, addPartLog, isLoading, users } = useApp();
  const [activeWO, setActiveWO] = useState<WorkOrder | null>(null);
  const [mobileView, setMobileView] = useState<'QUEUE' | 'WORKSPACE'>('QUEUE');
  const [activeStep, setActiveStep] = useState<number>(1);

  useEffect(() => {
    if (activeWO?.id) {
      setActiveStep(1);
    }
  }, [activeWO?.id]);

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

  // Transfer WO State
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [transferNote, setTransferNote] = useState('');

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

  const hasRestoredRef = useRef(false);

  // Auto-restore active work order if this mechanic already has an in-progress job
  useEffect(() => {
    if (!hasRestoredRef.current && !activeWO && currentUser && workOrders.length > 0) {
      const existingJob = workOrders.find(
        wo => wo.status === 'IN_PROGRESS' && isWorkOrderAssignedToUser(wo, currentUser, users)
      );
      if (existingJob) {
        setActiveWO(existingJob);
        setMobileView('WORKSPACE');
        showToast(`Sesi kerja WO ${existingJob.id} dipulihkan secara otomatis.`);
        hasRestoredRef.current = true;
      }
    }
  }, [workOrders, currentUser, activeWO, users]);

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
    .filter(wo => {
      const isAssignedToMe = isWorkOrderAssignedToUser(wo, currentUser, users);

      if (currentUser?.role === 'COMMON_RAIL') {
        return wo.currentDivision === 'COMMON_RAIL' && (!wo.mechanicId || isAssignedToMe);
      }
      // Fuel Pump Mechanics & Foreman can only see tasks explicitly assigned to them
      return (!wo.currentDivision || wo.currentDivision === 'SUPPLY_PUMP') && isAssignedToMe;
    })
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
    setMobileView('WORKSPACE');
  };

  const handleResumeJob = (wo: WorkOrder) => {
    setActiveWO(wo);
    showToast(`Membuka kembali lembar kerja WO ${wo.id}`);
    setMobileView('WORKSPACE');
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
      setMobileView('QUEUE');
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
    if (!activeWO) return;
    
    // Check if there's a next division in the flow
    let nextDivision: 'SUPPLY_PUMP' | 'COMMON_RAIL' | 'SA' | undefined = undefined;
    if (activeWO.divisionFlow && activeWO.currentDivision) {
      const currentIndex = activeWO.divisionFlow.indexOf(activeWO.currentDivision as any);
      if (currentIndex !== -1 && currentIndex < activeWO.divisionFlow.length - 1) {
        nextDivision = activeWO.divisionFlow[currentIndex + 1];
      }
    }

    if (nextDivision) {
      const noteEntry = {
        from: currentUser?.role || 'MECHANIC',
        to: nextDivision,
        note: 'Selesai di divisi sebelumnya (Otomatis berdasarkan Alur SPK)',
        date: new Date().toISOString()
      };
      
      const updatedHistory = activeWO.milestoneHistory ? [...activeWO.milestoneHistory] : [];
      const newMilestone = 'Kalibrasi Akhir & Quality Control';
      const newLog = {
        milestone: newMilestone,
        timestamp: new Date().toISOString(),
        updatedBy: currentUser?.name || 'Mekanik'
      };
      const newHistory = [...updatedHistory, newLog];

      updateWorkOrder(id, {
        currentDivision: nextDivision,
        status: 'QUEUE',
        mechanicId: undefined,
        startedAt: undefined,
        isBlocked: false,
        blockedReason: undefined,
        divisionNotes: [...(activeWO.divisionNotes || []), noteEntry],
        currentMilestone: newMilestone,
        milestoneHistory: newHistory
      });
      showToast(`Pekerjaan divisi selesai! Work Order otomatis diteruskan ke Divisi ${getDivisionLabel(nextDivision)}.`);
    } else {
      const updatedHistory = activeWO.milestoneHistory ? [...activeWO.milestoneHistory] : [];
      const newMilestone = 'Selesai & Siap Diserahkan';
      const newLog = {
        milestone: newMilestone,
        timestamp: new Date().toISOString(),
        updatedBy: currentUser?.name || 'Mekanik'
      };
      const newHistory = [...updatedHistory, newLog];

      updateWorkOrder(id, {
        currentDivision: 'SA',
        status: 'COMPLETED',
        startedAt: undefined,
        isBlocked: false,
        blockedReason: undefined,
        currentMilestone: newMilestone,
        milestoneHistory: newHistory
      });
      showToast(`Pekerjaan selesai seluruhnya! Berhasil mengirim sinyal sinkronisasi ke Front Office.`);
    }
    
    setActiveWO(null);
    setMobileView('QUEUE');
  };

  const handleTransferWO = () => {
    if (!activeWO) return;
    const targetDivision = currentUser?.role === 'COMMON_RAIL' ? 'SUPPLY_PUMP' : 'COMMON_RAIL';
    const noteEntry = {
      from: currentUser?.role || 'MECHANIC',
      to: targetDivision,
      note: transferNote,
      date: new Date().toISOString()
    };
    
    updateWorkOrder(activeWO.id, {
      currentDivision: targetDivision,
      status: 'QUEUE',
      mechanicId: undefined,
      startedAt: undefined,
      divisionNotes: [...(activeWO.divisionNotes || []), noteEntry]
    });
    
    setTransferModalOpen(false);
    setTransferNote('');
    setActiveWO(null);
    setMobileView('QUEUE');
    showToast(`Work Order berhasil dikirim ke Divisi ${getDivisionLabel(targetDivision)}.`);
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
    
    // Sanitize to allow only safe numeric, decimal, punctuation, and range symbols
    const sanitizedValue = value.replace(/[^0-9a-zA-Z.,\/\-\s]/g, '');
    
    const currentCal = activeWO.calibrationData || {
      volumeSemprotan: { sebelum: '', sesudah: '' },
      debitBackleak: { sebelum: '', sesudah: '' },
      tekanan: { sebelum: '', sesudah: '' },
    };

    const updatedCal = {
      ...currentCal,
      [metric]: {
        ...currentCal[metric],
        [field]: sanitizedValue
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

  if (isLoading) {
    return (
      <div className="p-4 print:hidden flex flex-col lg:flex-row gap-4 h-full bg-slate-100 min-h-screen text-slate-900">
        {/* Left column (Queue list) */}
        <div className="w-full lg:w-96 flex flex-col gap-4 animate-pulse">
          <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-5 bg-slate-200 rounded w-40"></div>
              <div className="h-5 bg-slate-200 rounded-full w-8"></div>
            </div>
            {/* Search filter skeleton */}
            <div className="h-9 bg-slate-100 rounded w-full"></div>
            
            {/* Queue items skeletons */}
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-3 bg-slate-50 rounded border border-slate-150 space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-slate-200 rounded w-20"></div>
                    <div className="h-4 bg-slate-200 rounded w-16"></div>
                  </div>
                  <div className="h-3 bg-slate-200 rounded w-32"></div>
                  <div className="h-3 bg-slate-200 rounded w-48"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column (Workspace) */}
        <div className="flex-1 bg-white rounded-lg p-6 border border-slate-200 shadow-sm space-y-6 animate-pulse">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-150">
            <div className="space-y-2">
              <div className="h-6 bg-slate-200 rounded w-48"></div>
              <div className="h-4 bg-slate-200 rounded w-32"></div>
            </div>
            <div className="flex gap-2">
              <div className="h-9 bg-slate-200 rounded w-28"></div>
              <div className="h-9 bg-slate-200 rounded w-28"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="h-5 bg-slate-200 rounded w-36"></div>
              <div className="h-24 bg-slate-100 rounded w-full"></div>
            </div>
            <div className="space-y-4">
              <div className="h-5 bg-slate-200 rounded w-36"></div>
              <div className="h-24 bg-slate-100 rounded w-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 print:hidden flex flex-col lg:flex-row gap-4 h-full bg-slate-100 min-h-screen text-slate-900">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 z-50 bg-slate-900 text-white text-xs px-4 py-3 rounded-lg shadow-xl border border-blue-500/50 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-5">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Mobile Tab View Controls */}
      <div className="flex bg-slate-200 p-1 rounded-lg lg:hidden shrink-0 mb-2">
        <button
          type="button"
          onClick={() => setMobileView('QUEUE')}
          className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${
            mobileView === 'QUEUE' 
              ? 'bg-[#1e293b] text-white shadow-md' 
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Antrean SPK ({queueList.length})
        </button>
        <button
          type="button"
          onClick={() => setMobileView('WORKSPACE')}
          className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all flex items-center justify-center gap-1.5 ${
            mobileView === 'WORKSPACE' 
              ? 'bg-[#1e293b] text-white shadow-md' 
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Ruang Kerja {activeWO && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>}
        </button>
      </div>

      {/* Left Column: Queue List */}
      <div id="mechanic-queue" className={`w-full lg:w-1/3 flex-col ${mobileView === 'QUEUE' ? 'flex' : 'hidden lg:flex'}`}>
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

                      {wo.status === 'IN_PROGRESS' && (
                        isActive ? (
                          <div className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            Sedang Aktif
                          </div>
                        ) : isWorkOrderAssignedToUser(wo, currentUser, users) ? (
                          <div className="flex gap-1.5">
                            <button 
                              onClick={() => handleResumeJob(wo)} 
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold rounded uppercase transition-colors flex items-center gap-1 shadow-md"
                            >
                              <Play className="w-3 h-3" /> LANJUTKAN KERJA
                            </button>
                            <button 
                              onClick={() => {
                                updateWorkOrder(wo.id, { mechanicId: currentUser?.id });
                                handleResumeJob(wo);
                              }} 
                              className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 text-[9px] font-bold rounded uppercase transition-colors flex items-center gap-1 shadow-xs border border-slate-600"
                              title="Force unlock / re-sync status jika sesi terputus"
                            >
                              Force Resume
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-1.5 items-end">
                            <div className="text-[9px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                              Dikerjakan Mekanik Lain
                            </div>
                            <button 
                              onClick={() => {
                                if (window.confirm(`Pekerjaan ini sedang dikerjakan mekanik lain. Apakah Anda yakin ingin melakukan FORCE OVERRIDE / mengambil alih pekerjaan ini?`)) {
                                  updateWorkOrder(wo.id, { 
                                    mechanicId: currentUser?.id, 
                                    status: 'IN_PROGRESS',
                                    startedAt: new Date().toISOString()
                                  });
                                  handleResumeJob({
                                    ...wo,
                                    mechanicId: currentUser?.id,
                                    status: 'IN_PROGRESS',
                                    startedAt: new Date().toISOString()
                                  });
                                }
                              }}
                              className="px-2 py-0.5 bg-rose-900/50 hover:bg-rose-800 text-rose-200 text-[8px] font-bold rounded uppercase border border-rose-700/50 transition-colors"
                            >
                              Force Takeover
                            </button>
                          </div>
                        )
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
      <div className={`w-full lg:w-2/3 flex-col ${mobileView === 'WORKSPACE' ? 'flex' : 'hidden lg:flex'}`}>
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
                  onClick={() => { setActiveWO(null); setMobileView('QUEUE'); }}
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
              <div id="mechanic-timer-action" className="flex flex-col md:items-end gap-2 w-full md:w-auto">
                <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg">
                  <Clock className={`w-4 h-4 ${isTimerCritical ? 'text-[#ef4444] animate-pulse' : 'text-blue-400'}`} />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TIMER PRODUKSI:</span>
                  <span className={`font-mono text-sm font-black tracking-widest ${isTimerCritical ? 'text-[#ef4444] animate-pulse' : 'text-blue-400'}`}>
                    {formatTime(currentElapsed)}
                  </span>
                </div>
                
                <div className="flex gap-2 w-full justify-end flex-wrap">
                  {currentUser?.role === 'MECHANIC' && activeWO.status === 'IN_PROGRESS' && activeWO.divisionFlow?.includes('SUPPLY_PUMP') && activeWO.divisionFlow?.includes('COMMON_RAIL') && (
                    <button 
                      onClick={() => setTransferModalOpen(true)}
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-bold shadow-md uppercase tracking-wider flex items-center gap-1.5 transition-all"
                    >
                      <Send className="w-3.5 h-3.5" /> KE COMMON RAIL
                    </button>
                  )}
                  {currentUser?.role === 'COMMON_RAIL' && activeWO.status === 'IN_PROGRESS' && activeWO.divisionFlow?.includes('SUPPLY_PUMP') && activeWO.divisionFlow?.includes('COMMON_RAIL') && (
                    <button 
                      onClick={() => setTransferModalOpen(true)}
                      className="px-4 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded text-xs font-bold shadow-md uppercase tracking-wider flex items-center gap-1.5 transition-all"
                    >
                      <Send className="w-3.5 h-3.5" /> KEMBALIKAN KE FILL PUMP
                    </button>
                  )}
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
                    <CheckCircle className="w-3.5 h-3.5" /> SELESAI / KE SA
                  </button>
                </div>
              </div>
            </div>

            {/* Active Workspace Form Container */}
            <div className="p-4 flex-1 overflow-y-auto">

              {/* FIVE-STEP WIZARD STEPPER HEADER */}
              <div className="mb-6 bg-slate-900 text-white rounded-xl p-4 shadow-lg border border-slate-700">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-4 border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400">
                      📋 PROSEDUR OPERASIONAL LABORATORIUM DIESEL
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-1">Selesaikan 5 langkah pengujian dan perbaikan komponen berikut.</p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-emerald-950/40 text-emerald-400 border border-emerald-800 px-2.5 py-1 rounded-full text-[10px] font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    LANGKAH {activeStep} DARI 5
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2 custom-scrollbar">
                  {[
                    { step: 1, title: 'VERIFIKASI', subtitle: 'Intake Komponen', icon: '🔍' },
                    { step: 2, title: 'TES AWAL', subtitle: 'Calibration Before', icon: '📊' },
                    { step: 3, title: 'PERBAIKAN', subtitle: 'Rehaul & Action', icon: '🔧' },
                    { step: 4, title: 'TES AKHIR', subtitle: 'Standard Spec', icon: '🚀' },
                    { step: 5, title: 'REKONSILIASI', subtitle: 'Symptom & Finish', icon: '✅' },
                  ].map((s) => {
                    const isCompleted = activeStep > s.step;
                    const isActive = activeStep === s.step;
                    return (
                      <button
                        key={s.step}
                        onClick={() => setActiveStep(s.step)}
                        type="button"
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border text-left min-w-[140px] transition-all cursor-pointer ${
                          isActive
                            ? 'bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-900/30 font-black'
                            : isCompleted
                            ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-300'
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750'
                        }`}
                      >
                        <span className="text-sm shrink-0">{s.icon}</span>
                        <div className="leading-tight">
                          <div className="text-[10px] uppercase font-black tracking-wider flex items-center gap-1">
                            Langkah {s.step}
                            {isCompleted && <span className="text-emerald-400 font-bold">✓</span>}
                          </div>
                          <div className="text-[9px] font-semibold opacity-90 truncate">{s.subtitle}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* STEP 1: VERIFIKASI KOMPONEN MASUK */}
              {activeStep === 1 && (
                <div className="space-y-6">
                  {/* LIVE WORK TRACKING MILESTONE CARD */}
                  <div className="bg-slate-900 text-white border border-slate-700 rounded-lg p-4 shadow-md">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-xs font-black uppercase tracking-widest text-blue-400 flex items-center gap-2">
                        <Compass className="w-4 h-4 text-blue-400" />
                        Pembaruan Tahapan Kerja Pelanggan (Live Tracking Milestone)
                      </h3>
                      <span className="text-[9px] bg-blue-950 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                        Customer Visibility: Live
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed mb-3">
                      Pilih tahapan pekerjaan saat ini. Pelanggan dapat memantau perkembangan ini secara real-time via QR code di SPK/Inspection Sheet mereka tanpa login.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                          Tahapan Kerja Aktif:
                        </label>
                        <select
                          className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-xs text-white font-semibold focus:outline-none focus:border-blue-500"
                          value={activeWO.currentMilestone || 'Intake & Verifikasi'}
                          onChange={(e) => {
                            const newMilestone = e.target.value;
                            const updatedHistory = activeWO.milestoneHistory ? [...activeWO.milestoneHistory] : [];
                            if (activeWO.currentMilestone !== newMilestone) {
                              const newLog = {
                                milestone: newMilestone,
                                timestamp: new Date().toISOString(),
                                updatedBy: currentUser?.name || 'Mekanik'
                              };
                              const newHistory = [...updatedHistory, newLog];

                              updateWorkOrder(activeWO.id, {
                                currentMilestone: newMilestone,
                                milestoneHistory: newHistory
                              });

                              setActiveWO({
                                ...activeWO,
                                currentMilestone: newMilestone,
                                milestoneHistory: newHistory
                              });

                              showToast(`Milestone pengerjaan diperbarui ke: ${newMilestone}`);
                            }
                          }}
                        >
                          {GENERAL_TRACKING_MILESTONES.map((m) => (
                            <option key={m.id} value={m.label}>
                              {m.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="bg-slate-950/40 p-2.5 rounded border border-slate-800 self-stretch flex flex-col justify-center">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status Live:</span>
                        </div>
                        <p className="text-[10.5px] font-mono text-emerald-400 font-bold mt-1.5 truncate">
                          {activeWO.currentMilestone || 'Intake & Verifikasi'}
                        </p>
                        <p className="text-[8px] text-slate-500 mt-0.5">
                          Setiap perubahan akan langsung mengupdate live tracking konsumen.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Customer Voice Card */}
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg shadow-sm">
                    <h3 className="text-[10px] font-black text-red-800 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> KELUHAN UTAMA KONSUMEN (CUSTOMER VOICE)
                    </h3>
                    <p className="text-xs text-red-950 leading-relaxed font-semibold">{activeWO.customerVoice || 'Tidak ada deskripsi keluhan'}</p>
                  </div>

                  {/* Division Transfer Notes */}
                  {activeWO.divisionNotes && activeWO.divisionNotes.length > 0 && (
                    <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg shadow-sm">
                      <h3 className="text-[10px] font-black text-indigo-800 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <Send className="w-3.5 h-3.5" /> CATATAN ANTAR DIVISI
                      </h3>
                      <div className="space-y-2">
                        {activeWO.divisionNotes.map((note, idx) => (
                          <div key={idx} className="bg-white border border-indigo-100 rounded p-2.5 text-xs">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-bold text-indigo-900 uppercase text-[9px] bg-indigo-100 px-1.5 py-0.5 rounded">
                                Dari: {getDivisionLabel(note.from)} → Ke: {getDivisionLabel(note.to)}
                              </span>
                              <span className="text-[9px] text-slate-400 font-mono">
                                {new Date(note.date).toLocaleString('id-ID', { hour12: false })}
                              </span>
                            </div>
                            <p className="text-slate-700 italic">"{note.note}"</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Module 2: MANIFES KOMPONEN DITERIMA */}
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 shadow-sm">
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
                              <tr key={p.id || idx} className="hover:bg-slate-50">
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

                  {/* Navigation Button Footer Step 1 */}
                  <div className="mt-6 flex justify-end gap-3 border-t border-slate-200 pt-4">
                    <button
                      onClick={() => setActiveStep(2)}
                      type="button"
                      className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-black uppercase rounded shadow-md flex items-center gap-2 transition-all cursor-pointer"
                    >
                      Mulai Pengujian Tes Awal ➔
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: TES AWAL & KALIBRASI SEBELUM PERBAIKAN */}
              {activeStep === 2 && (
                <div className="space-y-6">
                  {/* MODULE 1: Pencarian Spesifikasi Standard Komponen */}
                  <div id="specs-db-panel" className="bg-[#0f172a] text-white border border-slate-700 rounded-lg p-4 shadow-md">
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

                  {/* Navigation Button Footer Step 2 */}
                  <div className="mt-6 flex justify-between gap-3 border-t border-slate-200 pt-4">
                    <button
                      onClick={() => setActiveStep(1)}
                      type="button"
                      className="px-5 py-2.5 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-black uppercase rounded transition-all cursor-pointer"
                    >
                      ⬅ Kembali
                    </button>
                    <button
                      onClick={() => setActiveStep(3)}
                      type="button"
                      className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-black uppercase rounded shadow-md flex items-center gap-2 transition-all cursor-pointer"
                    >
                      Lanjutkan ke Perbaikan ➔
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: REHAUL, BONGKAR & LOG TINDAKAN PERBAIKAN */}
              {activeStep === 3 && (
                <div className="space-y-6">
                  {/* Module 3: DAFTAR TINDAKAN & CHECKLIST */}
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 shadow-sm">
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
                                <span className={`font-bold ${action.completed ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
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
                  <div id="parts-log-panel" className="bg-slate-50 border border-slate-200 rounded-lg p-4 shadow-sm">
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
                            className="w-full rounded border border-slate-300 p-2.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none leading-relaxed bg-white text-slate-800"
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
                            className="w-full rounded border border-slate-300 p-2.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white text-slate-800"
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button 
                          type="submit" 
                          className="bg-slate-800 hover:bg-slate-900 text-white px-5 py-2 rounded text-xs font-black uppercase transition-colors shadow flex items-center gap-1 cursor-pointer"
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
                              <tr key={log.id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
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

                  {/* Navigation Button Footer Step 3 */}
                  <div className="mt-6 flex justify-between gap-3 border-t border-slate-200 pt-4">
                    <button
                      onClick={() => setActiveStep(2)}
                      type="button"
                      className="px-5 py-2.5 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-black uppercase rounded transition-all cursor-pointer"
                    >
                      ⬅ Kembali
                    </button>
                    <button
                      onClick={() => setActiveStep(4)}
                      type="button"
                      className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-black uppercase rounded shadow-md flex items-center gap-2 transition-all cursor-pointer"
                    >
                      Lanjutkan ke Tes Akhir ➔
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: TES AKHIR & KALIBRASI SESUDAH PERBAIKAN */}
              {activeStep === 4 && (
                <div className="space-y-6">
                  {/* MODULE 1: Pencarian Spesifikasi Standard Komponen */}
                  <div id="specs-db-panel" className="bg-[#0f172a] text-white border border-slate-700 rounded-lg p-4 shadow-md">
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

                  {/* Navigation Button Footer Step 4 */}
                  <div className="mt-6 flex justify-between gap-3 border-t border-slate-200 pt-4">
                    <button
                      onClick={() => setActiveStep(3)}
                      type="button"
                      className="px-5 py-2.5 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-black uppercase rounded transition-all cursor-pointer"
                    >
                      ⬅ Kembali
                    </button>
                    <button
                      onClick={() => setActiveStep(5)}
                      type="button"
                      className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-black uppercase rounded shadow-md flex items-center gap-2 transition-all cursor-pointer"
                    >
                      Lanjutkan ke Rangkuman ➔
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 5: REKONSILIASI HASIL PERBAIKAN & FINISH */}
              {activeStep === 5 && (
                <div className="space-y-6">
                  {/* MODULE 3: RANGKUMAN HASIL PERBAIKAN (BEFORE VS AFTER BUILDER) */}
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 shadow-sm">
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

                  {/* LIVE WORK TRACKING MILESTONE CARD */}
                  <div className="bg-slate-900 text-white border border-slate-700 rounded-lg p-4 shadow-md">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-xs font-black uppercase tracking-widest text-blue-400 flex items-center gap-2">
                        <Compass className="w-4 h-4 text-blue-400" />
                        Pembaruan Tahapan Kerja Pelanggan (Live Tracking Milestone)
                      </h3>
                      <span className="text-[9px] bg-blue-950 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                        Customer Visibility: Live
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed mb-3">
                      Pilih tahapan pekerjaan akhir. Pelanggan dapat memantau perkembangan ini secara real-time via QR code di SPK/Inspection Sheet mereka tanpa login.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                          Tahapan Kerja Aktif:
                        </label>
                        <select
                          className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-xs text-white font-semibold focus:outline-none focus:border-blue-500"
                          value={activeWO.currentMilestone || 'Intake & Verifikasi'}
                          onChange={(e) => {
                            const newMilestone = e.target.value;
                            const updatedHistory = activeWO.milestoneHistory ? [...activeWO.milestoneHistory] : [];
                            if (activeWO.currentMilestone !== newMilestone) {
                              const newLog = {
                                milestone: newMilestone,
                                timestamp: new Date().toISOString(),
                                updatedBy: currentUser?.name || 'Mekanik'
                              };
                              const newHistory = [...updatedHistory, newLog];

                              updateWorkOrder(activeWO.id, {
                                currentMilestone: newMilestone,
                                milestoneHistory: newHistory
                              });

                              setActiveWO({
                                ...activeWO,
                                currentMilestone: newMilestone,
                                milestoneHistory: newHistory
                              });

                              showToast(`Milestone pengerjaan diperbarui ke: ${newMilestone}`);
                            }
                          }}
                        >
                          {GENERAL_TRACKING_MILESTONES.map((m) => (
                            <option key={m.id} value={m.label}>
                              {m.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="bg-slate-950/40 p-2.5 rounded border border-slate-800 self-stretch flex flex-col justify-center">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status Live:</span>
                        </div>
                        <p className="text-[10.5px] font-mono text-emerald-400 font-bold mt-1.5 truncate">
                          {activeWO.currentMilestone || 'Intake & Verifikasi'}
                        </p>
                        <p className="text-[8px] text-slate-500 mt-0.5">
                          Setiap perubahan akan langsung mengupdate live tracking konsumen.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Huge Finish Button */}
                  <div className="mt-8 bg-slate-900 text-white rounded-xl p-5 border-l-4 border-emerald-500 shadow-lg text-center space-y-4">
                    <h4 className="text-sm font-black text-white uppercase tracking-wider">🎉 PEKERJAAN TELAH SELESAI?</h4>
                    <p className="text-[11px] text-slate-300 max-w-md mx-auto leading-relaxed">
                      Seluruh tahapan, kalibrasi before-after, log suku cadang, dan rekonsiliasi keluhan telah diisi. Klik tombol di bawah untuk menyerahkan laporan SPK lab ini kembali ke Front Office (Service Advisor).
                    </p>
                    <button
                      type="button"
                      onClick={() => handleComplete(activeWO.id)}
                      className="w-full sm:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-950/40 transition-all flex items-center justify-center gap-2 mx-auto animate-pulse cursor-pointer"
                    >
                      <CheckCircle className="w-4.5 h-4.5" /> SELESAI & SERAHKAN KE FRONT OFFICE
                    </button>
                  </div>

                  {/* Navigation Button Footer Step 5 */}
                  <div className="mt-6 flex justify-start gap-3 border-t border-slate-200 pt-4">
                    <button
                      onClick={() => setActiveStep(4)}
                      type="button"
                      className="px-5 py-2.5 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-black uppercase rounded transition-all cursor-pointer"
                    >
                      ⬅ Kembali
                    </button>
                  </div>
                </div>
              )}

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

      {/* TRANSFER WO MODAL */}
      {transferModalOpen && (
        <div className="fixed inset-0 bg-slate-900/85 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="bg-indigo-600 text-white p-4 flex items-center gap-2">
              <Send className="w-5 h-5" />
              <h3 className="text-sm font-black uppercase tracking-wider">
                KIRIM WORK ORDER ANTAR DIVISI
              </h3>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">
                  Catatan untuk Divisi Tujuan
                </label>
                <textarea 
                  className="w-full rounded border border-slate-300 p-2.5 text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none leading-relaxed" 
                  rows={3} 
                  placeholder="Deskripsikan alasan atau instruksi khusus ke divisi tujuan..." 
                  value={transferNote} 
                  onChange={(e) => setTransferNote(e.target.value)}
                ></textarea>
              </div>
              <div className="bg-indigo-50 border border-indigo-200 rounded p-3 text-[11px] text-indigo-800 leading-normal">
                <strong>Info:</strong> Work Order ini akan dihapus dari antrean Anda dan dikirim ke divisi {currentUser?.role === 'COMMON_RAIL' ? 'Fuel Pump' : 'Common Rail'}.
              </div>
            </div>
            <div className="bg-slate-50 p-4 flex justify-end gap-3 border-t border-slate-200">
              <button 
                onClick={() => {
                  setTransferModalOpen(false);
                  setTransferNote('');
                }} 
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded transition-colors uppercase"
              >
                Batal
              </button>
              <button 
                onClick={handleTransferWO} 
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded uppercase shadow-md flex items-center gap-1 transition-all"
              >
                <Send className="w-4 h-4" /> KIRIM SEKARANG
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MechanicDashboard;
