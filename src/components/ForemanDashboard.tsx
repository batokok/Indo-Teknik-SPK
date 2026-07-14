import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { WorkOrder, User } from '../types';
import MechanicDashboard from './MechanicDashboard';
import { motion } from 'motion/react';
import { 
  ClipboardList, 
  UserCheck, 
  Users, 
  Wrench, 
  Layers, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  HelpCircle,
  TrendingUp,
  UserCheck2
} from 'lucide-react';

const ForemanDashboard: React.FC = () => {
  const { workOrders, users, updateWorkOrder, currentUser, addNotification } = useApp();
  const [activeTab, setActiveTab] = useState<'MANAGE' | 'MY_DESK'>('MANAGE');
  const [selectedWOId, setSelectedWOId] = useState<string | null>(null);

  // Filter all active work orders across divisions for Kepala Bengkel
  const fpWorkOrders = workOrders.filter(wo => {
    return wo.status !== 'COMPLETED';
  });

  // Filter mechanics (Both Fuel Pump and Common Rail divisions)
  const fpMechanics = users.filter(u => u.role === 'MECHANIC' || u.role === 'COMMON_RAIL');

  // Find foreman user (self)
  const selfUser = currentUser;

  // Active / Unassigned statistics
  const unassignedQueue = fpWorkOrders.filter(wo => !wo.mechanicId);
  const activeJobs = fpWorkOrders.filter(wo => wo.mechanicId && wo.status === 'IN_PROGRESS');
  const pendingParts = fpWorkOrders.filter(wo => wo.status === 'PENDING_PARTS');
  const pendingApproval = fpWorkOrders.filter(wo => wo.status === 'PENDING_APPROVAL');

  const handleAssignTask = (woId: string, mechanicId: string) => {
    const mechanicName = users.find(u => u.id === mechanicId)?.name || 'Mekanik';
    const targetWO = workOrders.find(wo => wo.id === woId);
    if (!targetWO) return;

    updateWorkOrder(woId, { 
      mechanicId: mechanicId 
    });

    // Send a system notification
    addNotification(
      'Penugasan Tugas Baru',
      `Foreman telah menugaskan WO ${woId} kepada ${mechanicName}.`,
      'info',
      woId
    );

    setSelectedWOId(null);
  };

  const getPriorityBadge = (priority: number) => {
    switch (priority) {
      case 1:
        return <span className="px-2 py-0.5 bg-red-100 text-red-800 text-[9px] font-black rounded border border-red-200 whitespace-nowrap inline-block">P1: DARURAT</span>;
      case 2:
        return <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-[9px] font-black rounded border border-yellow-200 whitespace-nowrap inline-block">P2: JANJI TEMU</span>;
      default:
        return <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[9px] font-black rounded border border-blue-200 whitespace-nowrap inline-block">P3: REGULER</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'QUEUE':
        return <span className="px-2 py-0.5 bg-slate-100 text-slate-800 text-[9px] rounded font-bold border border-slate-200 whitespace-nowrap inline-block">Menunggu</span>;
      case 'IN_PROGRESS':
        return <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[9px] rounded font-bold border border-blue-200 animate-pulse whitespace-nowrap inline-block">Sedang Kerja</span>;
      case 'PENDING_APPROVAL':
        return <span className="px-2 py-0.5 bg-red-100 text-red-800 text-[9px] rounded font-bold border border-red-200 whitespace-nowrap inline-block">Butuh Persetujuan</span>;
      case 'PENDING_PARTS':
        return <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[9px] rounded font-bold border border-amber-200 whitespace-nowrap inline-block">Tertunda Parts</span>;
      default:
        return <span className="px-2 py-0.5 bg-slate-100 text-slate-800 text-[9px] rounded font-bold border border-slate-200 whitespace-nowrap inline-block">{status}</span>;
    }
  };

  // Helper to find what a mechanic is currently working on
  const getMechanicCurrentJob = (mechId: string) => {
    return workOrders.find(wo => wo.mechanicId === mechId && wo.status === 'IN_PROGRESS');
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-hidden" id="foreman-root">
      {/* Upper Navigation Tabs */}
      <div className="bg-slate-900 px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 shrink-0 gap-4">
        <div>
          <h1 className="text-sm font-bold text-slate-100 tracking-tight flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            FOREMAN FUEL PUMP COMMAND CENTER
          </h1>
          <p className="text-[10px] text-slate-400 mt-0.5">Pantau beban kerja, koordinasikan divisi, dan tugaskan tugas kalibrasi secara real-time.</p>
        </div>

        <div className="flex bg-slate-800 p-0.5 rounded-lg border border-slate-700/60 shadow-inner">
          <button
            onClick={() => setActiveTab('MANAGE')}
            className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'MANAGE' 
                ? 'bg-emerald-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Manajemen Tugas FP
          </button>
          <button
            onClick={() => setActiveTab('MY_DESK')}
            className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'MY_DESK' 
                ? 'bg-emerald-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            Lembar Kerja Saya
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'MY_DESK' ? (
          <div className="h-full overflow-hidden">
            <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 flex items-center gap-2 text-xs text-emerald-800 font-bold shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              Workspace Aktif Foreman: Menjalankan pekerjaan yang ditugaskan ke akun Anda sendiri.
            </div>
            <div className="h-full overflow-y-auto">
              <MechanicDashboard />
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col p-6 overflow-y-auto space-y-6">
            {/* KPI Metrics Dashboard Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.2 }}
                className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center gap-3 cursor-pointer"
              >
                <div className="p-3 rounded-md bg-blue-50 text-blue-600">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-[9px] text-slate-400 uppercase font-bold tracking-wider">Antrean Masuk (FP)</span>
                  <span className="text-lg font-black text-slate-800 leading-tight">{unassignedQueue.length} Unit</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.2, delay: 0.05 }}
                className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center gap-3 cursor-pointer"
              >
                <div className="p-3 rounded-md bg-emerald-50 text-emerald-600">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-[9px] text-slate-400 uppercase font-bold tracking-wider">Sedang Kerja</span>
                  <span className="text-lg font-black text-slate-800 leading-tight">{activeJobs.length} Unit</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.2, delay: 0.1 }}
                className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center gap-3 cursor-pointer"
              >
                <div className="p-3 rounded-md bg-amber-50 text-amber-600">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-[9px] text-slate-400 uppercase font-bold tracking-wider">Tertunda Parts</span>
                  <span className="text-lg font-black text-slate-800 leading-tight">{pendingParts.length} Unit</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.2, delay: 0.15 }}
                className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center gap-3 cursor-pointer"
              >
                <div className="p-3 rounded-md bg-red-50 text-red-600">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-[9px] text-slate-400 uppercase font-bold tracking-wider">Butuh Persetujuan</span>
                  <span className="text-lg font-black text-slate-800 leading-tight">{pendingApproval.length} Unit</span>
                </div>
              </motion.div>
            </div>

            {/* Task Board and Mechanic Status Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Work Order Queue List (Col 8) */}
              <div className="lg:col-span-8 space-y-4">
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
                  <div className="px-5 py-4 border-b border-slate-150 flex justify-between items-center bg-slate-50/50">
                    <div>
                      <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider">Semua Antrean & Pekerjaan Divisi Fuel Pump</h2>
                      <p className="text-[10px] text-slate-500 mt-0.5">Tugaskan antrean masuk atau re-assign pekerjaan mekanik.</p>
                    </div>
                    <span className="text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded">
                      {fpWorkOrders.length} Total SPK Aktif
                    </span>
                  </div>

                  {fpWorkOrders.length === 0 ? (
                    <div className="p-12 text-center">
                      <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <h3 className="text-xs font-bold text-slate-700">Tidak ada antrean Fuel Pump</h3>
                      <p className="text-[10px] text-slate-400 mt-1">Semua pekerjaan telah selesai, atau belum ada kiriman baru dari Service Advisor.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-150">
                      {fpWorkOrders.map((wo) => {
                        const assignedMech = users.find(u => u.id === wo.mechanicId);
                        const isAssignedToSelf = wo.mechanicId === currentUser?.id;
                        const isDropdownOpen = selectedWOId === wo.id;

                        return (
                          <div key={wo.id} className="p-5 hover:bg-slate-50/40 transition-colors space-y-3">
                            <div className="flex flex-wrap justify-between items-center gap-2">
                              <div className="flex items-center gap-2.5">
                                <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                                  {wo.id}
                                </span>
                                <div className="text-xs font-bold text-slate-700">
                                  {wo.vehicleBrand} <span className="text-slate-400 font-normal">({wo.plateNumber})</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5">
                                {getPriorityBadge(wo.priority)}
                                <select
                                  value={wo.status}
                                  onChange={(e) => {
                                    const newStatus = e.target.value as any;
                                    const updates: Partial<WorkOrder> = { status: newStatus };
                                    if (newStatus !== 'PENDING_APPROVAL') {
                                      updates.isBlocked = false;
                                      updates.blockedReason = undefined;
                                    }
                                    updateWorkOrder(wo.id, updates);
                                    addNotification(
                                      'Pembaruan Status oleh Kepala Bengkel',
                                      `Foreman (Kepala Bengkel) mengubah status WO ${wo.id} menjadi "${newStatus.replace(/_/g, ' ')}".`,
                                      'info',
                                      wo.id
                                    );
                                  }}
                                  className={`px-2 py-1 text-[10px] font-black rounded-lg border uppercase tracking-wider outline-none cursor-pointer transition-all shadow-xs ${
                                    wo.status === 'QUEUE' ? 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200' :
                                    wo.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200' :
                                    wo.status === 'PENDING_APPROVAL' ? 'bg-red-100 text-red-800 border-red-300 hover:bg-red-200' :
                                    wo.status === 'PENDING_PARTS' ? 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200' :
                                    'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
                                  }`}
                                >
                                  <option value="QUEUE" className="text-slate-800">⏳ Menunggu</option>
                                  <option value="IN_PROGRESS" className="text-slate-800">⚡ Sedang Kerja</option>
                                  <option value="PENDING_APPROVAL" className="text-slate-800">⚠️ Butuh Approval</option>
                                  <option value="PENDING_PARTS" className="text-slate-800">🔧 Tertunda Parts</option>
                                  <option value="COMPLETED" className="text-slate-800">✅ Selesai</option>
                                </select>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-150">
                              <div>
                                <span className="text-slate-400 block text-[9px] uppercase font-bold">Pelanggan</span>
                                <span className="font-semibold text-slate-800">{wo.customerName}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[9px] uppercase font-bold">Tgl Intake</span>
                                <span className="font-semibold text-slate-800">{wo.intakeDate ? new Date(wo.intakeDate).toLocaleDateString('id-ID') : '-'}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[9px] uppercase font-bold">Odometer</span>
                                <span className="font-semibold text-slate-800 font-mono">{wo.odometer?.toLocaleString() || '0'} Km</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[9px] uppercase font-bold">Metode Drop</span>
                                <span className="font-semibold text-slate-800">{wo.dropMethod === 'WHOLE' ? '🚙 Bawa Unit' : '📦 Kirim Pompa'}</span>
                              </div>
                            </div>

                            {/* Global Override/Force Unlock notice for Foreman */}
                            {(wo.isBlocked || wo.status === 'PENDING_APPROVAL') && (
                              <div className="bg-red-50/80 border border-red-200/60 rounded-lg p-3 text-[11px] text-red-950 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3.5 shadow-sm">
                                <div className="flex items-center gap-2">
                                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                                  <div>
                                    <span className="font-extrabold uppercase block text-[9px] tracking-wider text-red-600">PROTOL STOP-CLOCK AKTIF (TERKUNCI)</span>
                                    <span>Pekerjaan terhenti sementara menunggu persetujuan / Suku Cadang.</span>
                                  </div>
                                </div>
                                <button
                                  onClick={() => {
                                    updateWorkOrder(wo.id, { 
                                      isBlocked: false, 
                                      blockedReason: undefined, 
                                      status: 'IN_PROGRESS' 
                                    });
                                    addNotification(
                                      'Buka Kunci Global oleh Foreman',
                                      `Foreman (Kepala Bengkel) memaksa buka kunci (Force Unlock) pada WO ${wo.id} agar mekanik dapat melanjutkan pengerjaan.`,
                                      'success',
                                      wo.id
                                    );
                                  }}
                                  className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white font-extrabold text-[9px] rounded uppercase transition-colors shadow-sm cursor-pointer whitespace-nowrap self-stretch sm:self-auto text-center"
                                >
                                  Force Unlock / Override
                                </button>
                              </div>
                            )}

                            {/* Assignment Bar */}
                            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-slate-500 font-bold uppercase">Petugas Kalibrasi:</span>
                                {assignedMech ? (
                                  <div className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full border font-bold ${
                                    isAssignedToSelf 
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                      : 'bg-blue-50 text-blue-700 border-blue-200'
                                  }`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${isAssignedToSelf ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500'}`}></div>
                                    {assignedMech.name} {isAssignedToSelf && '(Anda)'}
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full bg-slate-100 text-slate-500 border border-slate-200 font-bold">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                                    Queue Antrean FP
                                  </div>
                                )}
                              </div>

                              <div className="relative">
                                {isDropdownOpen ? (
                                  <div className="absolute right-0 bottom-full mb-2 bg-white border border-slate-200 rounded-lg shadow-xl py-1.5 min-w-[220px] z-20">
                                    <div className="px-3 py-1 border-b border-slate-100 text-[9px] uppercase font-black tracking-wider text-slate-400 bg-slate-50">
                                      Pilih Petugas FP
                                    </div>
                                    <button
                                      onClick={() => handleAssignTask(wo.id, selfUser?.id || '')}
                                      className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 font-bold flex justify-between items-center border-b border-slate-100"
                                    >
                                      <span>🔧 Tugaskan ke Diri Sendiri</span>
                                      <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-100/50 px-1 py-0.5 rounded">Foreman</span>
                                    </button>
                                    {fpMechanics.map((mech) => {
                                      const currentJob = getMechanicCurrentJob(mech.id);
                                      return (
                                        <button
                                          key={mech.id}
                                          onClick={() => handleAssignTask(wo.id, mech.id)}
                                          className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-blue-50 flex flex-col transition-colors"
                                        >
                                          <span className="font-bold text-slate-800">{mech.name}</span>
                                          <span className="text-[9px] text-slate-400 leading-tight">
                                            {currentJob ? `🔴 Sedang Kerja: WO ${currentJob.id}` : '🟢 Bebas (Idle)'}
                                          </span>
                                        </button>
                                      );
                                    })}
                                    <div className="p-1 border-t border-slate-100">
                                      <button 
                                        onClick={() => setSelectedWOId(null)}
                                        className="w-full text-center py-1 text-[9px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded"
                                      >
                                        Batal
                                      </button>
                                    </div>
                                  </div>
                                ) : null}

                                <button
                                  onClick={() => setSelectedWOId(isDropdownOpen ? null : wo.id)}
                                  className={`px-3.5 py-1.5 text-xs font-black rounded-lg transition-all shadow-sm border uppercase tracking-wider flex items-center gap-1.5 cursor-pointer ${
                                    assignedMech 
                                      ? 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50' 
                                      : 'bg-[#1e3a8a] text-white border-transparent hover:bg-blue-800 shadow-md shadow-blue-100'
                                  }`}
                                >
                                  <UserCheck2 className="w-3.5 h-3.5" />
                                  {assignedMech ? 'Ubah Petugas' : 'Tugaskan Mekanik'}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Mechanics Productivity Tracker (Col 4) */}
              <div className="lg:col-span-4 space-y-4">
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 space-y-4">
                  <div>
                    <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider">Status Mekanik Fuel Pump</h2>
                    <p className="text-[10px] text-slate-500 mt-0.5">Monitoring ketersediaan teknisi lab secara real-time.</p>
                  </div>

                  {fpMechanics.length === 0 ? (
                    <div className="text-center p-6 text-slate-400 text-xs italic">
                      Belum ada mekanik Fuel Pump terdaftar dalam sistem.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {fpMechanics.map((mech) => {
                        const currentJob = getMechanicCurrentJob(mech.id);

                        return (
                          <div key={mech.id} className="p-3 border border-slate-150 rounded-lg bg-slate-50/50 flex flex-col gap-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="font-bold text-xs text-slate-800 block leading-tight">{mech.name}</span>
                                <span className="text-[9px] text-slate-400 font-mono">ID: {mech.id} • FP Division</span>
                              </div>
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border uppercase ${
                                currentJob 
                                  ? 'bg-red-50 text-red-700 border-red-200' 
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 animate-pulse'
                              }`}>
                                {currentJob ? 'Sibuk' : 'Idle'}
                              </span>
                            </div>

                            {currentJob ? (
                              <div className="bg-white p-2 rounded border border-slate-150 text-[10px] space-y-1">
                                <div className="text-slate-400 font-bold uppercase text-[8px] tracking-wider">Pekerjaan Aktif</div>
                                <div className="flex justify-between font-bold text-slate-700">
                                  <span>{currentJob.id}</span>
                                  <span className="text-blue-600 font-mono">{currentJob.plateNumber}</span>
                                </div>
                                <div className="text-slate-500">Unit: {currentJob.vehicleBrand}</div>
                              </div>
                            ) : (
                              <div className="text-[10px] text-slate-400 italic">
                                Siap menerima penugasan kalibrasi.
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForemanDashboard;
