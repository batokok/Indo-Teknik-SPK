import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { User, Claim, WorkOrder } from '../types';
import { 
  Users, 
  UserPlus, 
  ShieldAlert, 
  Key, 
  Ban, 
  Edit, 
  Trash2, 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Layers, 
  Wrench, 
  ShieldCheck, 
  Settings, 
  AlertTriangle,
  ClipboardList,
  CheckCircle2,
  Clock,
  PieChart,
  MapPin,
  Navigation
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { users, addUser, updateUser, deleteUser, isLoading, workOrders, claims } = useApp();
  
  // Dashboard Sub-tabs
  const [adminTab, setAdminTab] = useState<'PERFORMANCE' | 'USERS'>('PERFORMANCE');

  // User CRUD state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUser, setNewUser] = useState<Partial<User>>({ role: 'SA', status: 'ACTIVE' });
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editRole, setEditRole] = useState<User['role']>('SA');
  const [editPassword, setEditPassword] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Geo-Lock Settings state
  const [geoLockUser, setGeoLockUser] = useState<User | null>(null);
  const [geoEnabled, setGeoEnabled] = useState(false);
  const [geoLat, setGeoLat] = useState<number>(-6.200000);
  const [geoLng, setGeoLng] = useState<number>(106.816666);
  const [geoRadius, setGeoRadius] = useState<number>(150);
  const [geoAddress, setGeoAddress] = useState<string>('');
  const [geoLocatingAdmin, setGeoLocatingAdmin] = useState(false);
  const [geoSaveError, setGeoSaveError] = useState<string | null>(null);

  const startGeoLockSetting = (user: User) => {
    setGeoLockUser(user);
    setGeoEnabled(user.geoLock?.enabled ?? false);
    setGeoLat(user.geoLock?.latitude ?? -6.200000);
    setGeoLng(user.geoLock?.longitude ?? 106.816666);
    setGeoRadius(user.geoLock?.radius ?? 150);
    setGeoAddress(user.geoLock?.addressName ?? '');
    setGeoSaveError(null);
  };

  const getAdminLocation = () => {
    setGeoLocatingAdmin(true);
    if (!navigator.geolocation) {
      alert("Browser Anda tidak mendukung Geolocation HTML5.");
      setGeoLocatingAdmin(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeoLat(position.coords.latitude);
        setGeoLng(position.coords.longitude);
        setGeoLocatingAdmin(false);
      },
      (error) => {
        console.error("Gagal mendeteksi lokasi admin:", error);
        alert(`Gagal mengambil GPS: ${error.message || 'Izin ditolak atau sinyal hilang'}`);
        setGeoLocatingAdmin(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleGeoLockSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!geoLockUser) return;
    setGeoSaveError(null);

    try {
      await updateUser(geoLockUser.id, {
        geoLock: {
          enabled: geoEnabled,
          latitude: Number(geoLat),
          longitude: Number(geoLng),
          radius: Number(geoRadius),
          addressName: geoAddress.trim() || 'Bengkel Utama Indo Teknik'
        }
      });
      setGeoLockUser(null);
    } catch (err: any) {
      setGeoSaveError(err?.message || "Gagal menyimpan setelan Geo-Lock");
    }
  };

  // 1. COMPUTE METRICS & STATS FOR ADMINISTRATIVE DECISION SUPPORT

  // Work Orders Summary counts
  const totalWOsCount = workOrders.length;
  const queueWOsCount = workOrders.filter(w => w.status === 'QUEUE').length;
  const activeWOsCount = workOrders.filter(w => w.status === 'IN_PROGRESS').length;
  const pendingWOsCount = workOrders.filter(w => w.status === 'PENDING_PARTS' || w.status === 'PENDING_APPROVAL').length;
  const completedWOsCount = workOrders.filter(w => w.status === 'COMPLETED').length;

  // Claims Summary counts
  const totalClaimsCount = claims.length;
  const claimRatePercent = totalWOsCount > 0 ? ((totalClaimsCount / totalWOsCount) * 100).toFixed(1) : '0.0';

  // MoM Claims comparison
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  const claimsThisMonth = claims.filter(c => {
    const d = new Date(c.claimDate);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).length;

  const claimsLastMonth = claims.filter(c => {
    const d = new Date(c.claimDate);
    return d.getMonth() === prevMonth && d.getFullYear() === prevMonthYear;
  }).length;

  let momClaimIndicator = <span className="flex items-center gap-1 text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200"><Minus className="w-3.5 h-3.5" /> Stabil MoM</span>;
  let momPercentText = '0%';
  if (claimsLastMonth > 0) {
    const momDiffPercent = ((claimsThisMonth - claimsLastMonth) / claimsLastMonth) * 100;
    momPercentText = `${Math.abs(Math.round(momDiffPercent))}%`;
    if (momDiffPercent > 0) {
      momClaimIndicator = <span className="flex items-center gap-0.5 text-[10px] bg-red-50 text-red-700 px-2 py-0.5 rounded border border-red-200 font-extrabold animate-pulse"><TrendingUp className="w-3.5 h-3.5" /> Naik {momPercentText} MoM</span>;
    } else if (momDiffPercent < 0) {
      momClaimIndicator = <span className="flex items-center gap-0.5 text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200 font-extrabold"><TrendingDown className="w-3.5 h-3.5" /> Turun {momPercentText} MoM</span>;
    }
  } else if (claimsThisMonth > 0) {
    momPercentText = '+100%';
    momClaimIndicator = <span className="flex items-center gap-0.5 text-[10px] bg-red-50 text-red-700 px-2 py-0.5 rounded border border-red-200 font-extrabold animate-pulse"><TrendingUp className="w-3.5 h-3.5" /> Naik {momPercentText} MoM</span>;
  }

  // Claims by Division
  const claimsFP = claims.filter(c => c.divisionRelated === 'SUPPLY_PUMP').length;
  const claimsCR = claims.filter(c => c.divisionRelated === 'COMMON_RAIL').length;
  const claimsSA = claims.filter(c => c.divisionRelated === 'SA').length;

  // Claims by Mechanic lookup
  const claimsByMech: { [name: string]: number } = {};
  claims.forEach(c => {
    const name = c.assignedPersonName || 'Belum Ditugaskan / SA';
    claimsByMech[name] = (claimsByMech[name] || 0) + 1;
  });

  // Division performance completed units
  const completedFPCount = workOrders.filter(w => (!w.currentDivision || w.currentDivision === 'SUPPLY_PUMP') && w.status === 'COMPLETED').length;
  const completedCRCount = workOrders.filter(w => w.currentDivision === 'COMMON_RAIL' && w.status === 'COMPLETED').length;

  // Calculate Average Duration helper
  const calculateUserAverageDuration = (userId: string) => {
    const finishedWOs = workOrders.filter(w => w.mechanicId === userId && w.status === 'COMPLETED');
    if (finishedWOs.length === 0) return '0j';
    const totalSecs = finishedWOs.reduce((acc, curr) => acc + (curr.totalElapsedSeconds || 0), 0);
    const avgSecs = totalSecs / finishedWOs.length;
    const hours = Math.floor(avgSecs / 3600);
    const minutes = Math.floor((avgSecs % 3600) / 60);
    if (hours > 0) return `${hours}j ${minutes}m`;
    return `${minutes}m`;
  };

  // Helper to calculate KPI score based on finished units and speed
  const calculateUserKpi = (userId: string) => {
    const finishedWOs = workOrders.filter(w => w.mechanicId === userId && w.status === 'COMPLETED');
    const claimRelated = claims.filter(c => c.assignedPersonId === userId).length;
    
    // Base score is 80. +4 for each completed task, -10 for each claim/complaint. Max 100. Min 20.
    let score = 80 + (finishedWOs.length * 4) - (claimRelated * 10);
    return Math.max(20, Math.min(100, score));
  };

  // CRUD User submit and logic
  const startEditing = (user: User) => {
    setEditingUserId(user.id);
    setEditName(user.name);
    setEditUsername(user.username);
    setEditRole(user.role);
    setEditPassword('');
    setEditError(null);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (newUser.name && newUser.username && newUser.password && newUser.role) {
      const cleanName = newUser.name.trim();
      const cleanUsername = newUser.username.trim().toLowerCase();
      const cleanPassword = newUser.password;

      // Validate name
      if (cleanName.length < 2 || cleanName.length > 50) {
        setFormError("Full Name must be between 2 and 50 characters!");
        return;
      }
      if (!/^[A-Za-z\s'.]+$/.test(cleanName)) {
        setFormError("Full Name can only contain letters, spaces, dots, and single quotes!");
        return;
      }

      // Validate username
      if (cleanUsername.length < 3 || cleanUsername.length > 20) {
        setFormError("Username must be between 3 and 20 characters!");
        return;
      }
      if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
        setFormError("Username can only contain alphanumeric characters and underscores!");
        return;
      }

      // Check duplicate username
      if (users.some(u => u.username === cleanUsername)) {
        setFormError("Username already exists!");
        return;
      }

      // Validate password
      if (cleanPassword.length < 8) {
        setFormError("Password must be at least 8 characters long!");
        return;
      }
      if (cleanPassword.toLowerCase() === cleanUsername.toLowerCase()) {
        setFormError("Password cannot be equal to your username!");
        return;
      }
      if (cleanPassword.toLowerCase() === 'password') {
        setFormError("Password cannot be 'password'!");
        return;
      }
      if (cleanPassword.toLowerCase() === 'admin') {
        setFormError("Password cannot be 'admin'!");
        return;
      }

      try {
        await addUser({
          ...newUser,
          name: cleanName,
          username: cleanUsername,
          password: cleanPassword,
        } as Omit<User, 'id'>);
        setShowAddForm(false);
        setNewUser({ role: 'SA', status: 'ACTIVE' });
      } catch (err: any) {
        setFormError(err?.message || "Failed to add user to database!");
      }
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError(null);
    if (!editingUserId) return;

    const cleanName = editName.trim();
    const cleanUsername = editUsername.trim().toLowerCase();

    // Validate name
    if (cleanName.length < 2 || cleanName.length > 50) {
      setEditError("Full Name must be between 2 and 50 characters!");
      return;
    }
    if (!/^[A-Za-z\s'.]+$/.test(cleanName)) {
      setEditError("Full Name can only contain letters, spaces, dots, and single quotes!");
      return;
    }

    // Validate username
    if (cleanUsername.length < 3 || cleanUsername.length > 20) {
      setEditError("Username must be between 3 and 20 characters!");
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
      setEditError("Username can only contain alphanumeric characters and underscores!");
      return;
    }

    // Check duplicate username (excluding current user)
    if (users.some(u => u.username === cleanUsername && u.id !== editingUserId)) {
      setEditError("Username already exists!");
      return;
    }

    // Validate password (only if provided)
    if (editPassword) {
      if (editPassword.length < 8) {
        setEditError("Password must be at least 8 characters long!");
        return;
      }
      if (editPassword.toLowerCase() === cleanUsername) {
        setEditError("Password cannot be equal to the username!");
        return;
      }
      if (editPassword.toLowerCase() === 'password') {
        setEditError("Password cannot be 'password'!");
        return;
      }
    }

    try {
      const updates: Partial<User> = {
        name: cleanName,
        username: cleanUsername,
        role: editRole,
      };
      if (editPassword) {
        updates.password = editPassword;
      }

      await updateUser(editingUserId, updates);
      setEditingUserId(null);
      setEditName('');
      setEditUsername('');
      setEditRole('SA');
      setEditPassword('');
    } catch (err: any) {
      setEditError(err?.message || "Failed to update user!");
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      await updateUser(user.id, { status: user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' });
    } catch (err: any) {
      alert(err?.message || "Failed to update user status!");
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUser(id);
      } catch (err: any) {
        alert(err?.message || "Failed to delete user!");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse p-4">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-7 bg-slate-200 rounded w-48"></div>
            <div className="h-4 bg-slate-150 rounded w-64"></div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm h-64"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" id="admin-dashboard-root">
      
      {/* Top Tab Bar Navigation */}
      <div className="flex justify-between items-center bg-slate-900 px-6 py-4 rounded-xl border border-slate-800 shadow-lg text-white">
        <div>
          <h1 className="text-sm font-bold tracking-tight flex items-center gap-2">
            <Settings className="w-4 h-4 text-indigo-400" />
            ADMINISTRATOR MANAGEMENT PANEL
          </h1>
          <p className="text-[10px] text-slate-400 mt-0.5">Pantau kinerja unit operasional, kelola hak akses personil, dan audit rasio garansi.</p>
        </div>

        <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700/60 shadow-inner">
          <button
            onClick={() => setAdminTab('PERFORMANCE')}
            className={`px-3.5 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
              adminTab === 'PERFORMANCE' 
                ? 'bg-[#1e3a8a] text-white shadow' 
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Dashboard Performa
          </button>
          <button
            onClick={() => setAdminTab('USERS')}
            className={`px-3.5 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
              adminTab === 'USERS' 
                ? 'bg-[#1e3a8a] text-white shadow' 
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Kelola Pengguna ({users.length})
          </button>
        </div>
      </div>

      {/* RENDER ACTIVE TAB */}
      {adminTab === 'PERFORMANCE' ? (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Executive KPI Stats Card Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                <ClipboardList className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-[8px] text-slate-400 font-extrabold uppercase tracking-wider">Antrean Operasional</span>
                <span className="text-base font-black text-slate-800 leading-tight">{queueWOsCount} Unit</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-[8px] text-slate-400 font-extrabold uppercase tracking-wider">Sedang Dikerjakan</span>
                <span className="text-base font-black text-slate-800 leading-tight">{activeWOsCount} Unit</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
              <div className="p-3 bg-red-50 text-red-600 rounded-lg">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-[8px] text-slate-400 font-extrabold uppercase tracking-wider">Tertunda Parts</span>
                <span className="text-base font-black text-slate-800 leading-tight">{pendingWOsCount} Unit</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-[8px] text-slate-400 font-extrabold uppercase tracking-wider">Pekerjaan Selesai</span>
                <span className="text-base font-black text-slate-800 leading-tight">{completedWOsCount} Unit</span>
              </div>
            </div>

            <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 shadow-sm flex items-center gap-3 col-span-2 md:col-span-1">
              <div className="p-3 bg-red-500/20 text-red-400 rounded-lg">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-[8px] text-slate-400 font-extrabold uppercase tracking-wider">Sertifikat Klaim</span>
                <span className="text-base font-black leading-tight">{totalClaimsCount} Klaim ({claimRatePercent}%)</span>
              </div>
            </div>
          </div>

          {/* Division and MoM Claim Analysis Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* MoM Claims Audit & Risk Assessment (Col 5) */}
            <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="text-xs font-black text-[#1e3a8a] uppercase tracking-wider">Analisa Klaim MoM & Risiko</h3>
                  <p className="text-[9px] text-slate-400 mt-0.5">Pemantauan persentase kelalaian teknis operasional.</p>
                </div>
                {momClaimIndicator}
              </div>

              {/* Month Compare Box */}
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 bg-slate-50 border border-slate-150 rounded-lg">
                  <span className="text-[8px] text-slate-400 block font-bold uppercase tracking-wider">Bulan Lalu</span>
                  <span className="text-xl font-mono font-black text-slate-700">{claimsLastMonth}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-150 rounded-lg">
                  <span className="text-[8px] text-slate-400 block font-bold uppercase tracking-wider">Bulan Ini</span>
                  <span className="text-xl font-mono font-black text-[#1e3a8a]">{claimsThisMonth}</span>
                </div>
              </div>

              {/* Division Risk Breakdowns */}
              <div className="space-y-3.5 pt-1">
                <h4 className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Penyebaran Klaim Berdasarkan Divisi</h4>
                
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>Divisi Fuel Pump</span>
                      <span className="font-mono">{claimsFP} Klaim</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: `${totalClaimsCount > 0 ? (claimsFP / totalClaimsCount) * 100 : 0}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>Divisi Common Rail</span>
                      <span className="font-mono">{claimsCR} Klaim</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="bg-purple-500 h-full rounded-full" style={{ width: `${totalClaimsCount > 0 ? (claimsCR / totalClaimsCount) * 100 : 0}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>Service Advisor / FO</span>
                      <span className="font-mono">{claimsSA} Klaim</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full rounded-full" style={{ width: `${totalClaimsCount > 0 ? (claimsSA / totalClaimsCount) * 100 : 0}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Claims by Cause list */}
              <div className="space-y-3 pt-2">
                <h4 className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Log Penyebab Klaim Terbuka</h4>
                <div className="max-h-36 overflow-y-auto divide-y divide-slate-100 border border-slate-100 rounded bg-slate-50/50 p-2 text-[10px]">
                  {claims.length === 0 ? (
                    <div className="text-center p-4 text-slate-400 italic">Belum ada komplain atau klaim masuk.</div>
                  ) : (
                    claims.map(c => (
                      <div key={c.id} className="py-1.5 first:pt-0 last:pb-0">
                        <span className="font-bold text-[#1e3a8a]">{c.customerName}</span>: <span className="text-slate-600">{c.cause}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Division Performance Monitor (Col 7) */}
            <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="text-xs font-black text-[#1e3a8a] uppercase tracking-wider">Performa Laboratorium Kalibrasi</h3>
                  <p className="text-[9px] text-slate-400 mt-0.5">Monitoring kapasitas pengerjaan real-time.</p>
                </div>
              </div>

              {/* Division KPI Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-amber-500" />
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Divisi Fuel Pump</span>
                  </div>
                  <div className="flex justify-between items-baseline pt-1">
                    <span className="text-2xl font-black text-slate-800 font-mono">{completedFPCount}</span>
                    <span className="text-[10px] text-slate-400 font-bold">SPK Selesai</span>
                  </div>
                  <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: `${totalWOsCount > 0 ? (completedFPCount / totalWOsCount) * 100 : 0}%` }}></div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Wrench className="w-4 h-4 text-purple-500" />
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Divisi Common Rail</span>
                  </div>
                  <div className="flex justify-between items-baseline pt-1">
                    <span className="text-2xl font-black text-slate-800 font-mono">{completedCRCount}</span>
                    <span className="text-[10px] text-slate-400 font-bold">SPK Selesai</span>
                  </div>
                  <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
                    <div className="bg-purple-500 h-full rounded-full" style={{ width: `${totalWOsCount > 0 ? (completedCRCount / totalWOsCount) * 100 : 0}%` }}></div>
                  </div>
                </div>
              </div>

              {/* Claims Breakdown by Person */}
              <div className="space-y-3 pt-1">
                <h4 className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Jumlah Klaim & Komplain per Personil</h4>
                <div className="border border-slate-200 rounded overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
                      <tr>
                        <th className="px-3 py-2">Nama Personil</th>
                        <th className="px-3 py-2 text-right">Total Klaim Kelalaian</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150">
                      {Object.keys(claimsByMech).length === 0 ? (
                        <tr>
                          <td colSpan={2} className="p-4 text-center text-slate-400 italic">Belum ada porsi klaim yang dicatat.</td>
                        </tr>
                      ) : (
                        Object.keys(claimsByMech).map(name => (
                          <tr key={name} className="hover:bg-slate-50/50">
                            <td className="px-3 py-2.5 font-bold text-slate-700">{name}</td>
                            <td className="px-3 py-2.5 text-right font-black font-mono text-red-600 bg-red-50/20">{claimsByMech[name]} Kasus</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Individual Mechanics & Foreman Performance (Full Width) */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <h3 className="text-xs font-black text-[#1e3a8a] uppercase tracking-wider">Performa Individu Mekanik & Foreman</h3>
              <p className="text-[9px] text-slate-400 mt-0.5">Analisis kapasitas unit selesai, rerata pengerjaan mandiri, dan indeks efisiensi (KPI).</p>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-4 py-2.5">Nama Teknisi / Foreman</th>
                    <th className="px-4 py-2.5">Divisi / Peran Bengkel</th>
                    <th className="px-4 py-2.5 text-center">SPK Selesai</th>
                    <th className="px-4 py-2.5 text-center">Sedang Dikerjakan</th>
                    <th className="px-4 py-2.5 text-center">Rerata Durasi Kerja</th>
                    <th className="px-4 py-2.5 text-right">Skor KPI Indeks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150">
                  {users
                    .filter(u => u.role === 'MECHANIC' || u.role === 'COMMON_RAIL' || u.role === 'FOREMAN')
                    .map(user => {
                      const completedCount = workOrders.filter(w => w.mechanicId === user.id && w.status === 'COMPLETED').length;
                      const activeCount = workOrders.filter(w => w.mechanicId === user.id && w.status === 'IN_PROGRESS').length;
                      const avgDuration = calculateUserAverageDuration(user.id);
                      const kpiScore = calculateUserKpi(user.id);

                      return (
                        <tr key={user.id} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3">
                            <span className="font-bold text-slate-800 block leading-tight">{user.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">@{user.username}</span>
                          </td>
                          <td className="px-4 py-3">
                            {user.role === 'FOREMAN' ? (
                              <span className="px-2 py-0.5 bg-orange-100 text-orange-800 rounded-md font-bold text-[9px] border border-orange-200 uppercase tracking-wider">🔧 Foreman (Pekerjaan Mandiri)</span>
                            ) : user.role === 'COMMON_RAIL' ? (
                              <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-md font-bold text-[9px] border border-purple-200 uppercase tracking-wider">🔬 Common Rail</span>
                            ) : (
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md font-bold text-[9px] border border-emerald-200 uppercase tracking-wider">⚙️ Fuel Pump</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center font-bold font-mono">{completedCount} Unit</td>
                          <td className="px-4 py-3 text-center">
                            {activeCount > 0 ? (
                              <span className="px-2 py-0.5 rounded-full bg-blue-150 text-blue-800 font-bold font-mono text-[10px] animate-pulse">{activeCount} Unit</span>
                            ) : (
                              <span className="text-slate-400 text-[10px]">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center font-bold font-mono text-slate-700">{avgDuration}</td>
                          <td className="px-4 py-3 text-right">
                            <span className={`px-2 py-1 font-mono font-black text-xs rounded border ${
                              kpiScore >= 85 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              kpiScore >= 70 ? 'bg-blue-50 text-blue-700 border-blue-200' :
                              'bg-red-50 text-red-700 border-red-200'
                            }`}>
                              {kpiScore} / 100
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* RENDER USERS MANAGEMENT SECTION */
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider">Pengaturan Hak Akses Bengkel</h2>
              <p className="text-[10px] text-slate-500 mt-0.5">Tambah akun baru, reset password, atau tangguhkan akses teknisi.</p>
            </div>
            <button
              id="admin-add-user"
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-[#1e3a8a] hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-2 self-start sm:self-auto cursor-pointer shadow-sm border border-transparent transition-all"
            >
              <UserPlus className="w-4 h-4" />
              Tambah Personil Baru
            </button>
          </div>

          {showAddForm && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-in slide-in-from-top-2 duration-350">
              <h3 className="text-xs font-black text-[#1e3a8a] uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Form Pendaftaran Akun Baru</h3>
              {formError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 text-xs font-bold rounded flex items-center gap-1.5 animate-in fade-in">
                  ⚠️ {formError}
                </div>
              )}
              <form onSubmit={handleAddSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-extrabold text-slate-500 mb-1">Nama Lengkap</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Budi Santoso"
                      className="w-full border border-slate-300 rounded p-2 text-xs font-bold outline-none bg-slate-50 focus:bg-white"
                      value={newUser.name || ''}
                      onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-extrabold text-slate-500 mb-1">Username (Login)</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: budi_mech"
                      className="w-full border border-slate-300 rounded p-2 text-xs font-bold outline-none bg-slate-50 focus:bg-white"
                      value={newUser.username || ''}
                      onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-extrabold text-slate-500 mb-1">Kata Sandi (Password)</label>
                    <input
                      type="password"
                      required
                      placeholder="Minimal 8 Karakter"
                      className="w-full border border-slate-300 rounded p-2 text-xs font-bold outline-none bg-slate-50 focus:bg-white"
                      value={newUser.password || ''}
                      onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-extrabold text-slate-500 mb-1">Peran (Role)</label>
                    <select
                      className="w-full border border-slate-300 rounded p-2 text-xs font-bold outline-none bg-slate-50"
                      value={newUser.role}
                      onChange={e => setNewUser({ ...newUser, role: e.target.value as User['role'] })}
                    >
                      <option value="SA">Service Advisor</option>
                      <option value="MECHANIC">Mekanik Fuel Pump</option>
                      <option value="COMMON_RAIL">Common Rail</option>
                      <option value="FOREMAN">Foreman Fuel Pump</option>
                      <option value="ADMIN">Super Admin</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 text-xs font-bold uppercase"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs font-bold uppercase cursor-pointer"
                  >
                    Simpan Akun
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Wrapped list & table for tutorial targeting */}
          <div id="admin-user-table" className="space-y-4">
            {/* Mobile view: list of cards */}
            <div className="block md:hidden space-y-4">
              {users.map(user => (
                <div key={user.id} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold shrink-0">
                        {user.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-semibold text-slate-950 truncate">{user.name}</h4>
                          {user.role !== 'ADMIN' && (
                            user.geoLock?.enabled ? (
                              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" title={`Geo-Locked: ${user.geoLock.addressName}`} />
                            ) : (
                              <MapPin className="w-3.5 h-3.5 text-slate-300 shrink-0 hover:text-slate-500 cursor-pointer" title="Geo-Lock Tidak Aktif (Klik untuk atur)" onClick={() => startGeoLockSetting(user)} />
                            )
                          )}
                        </div>
                        <p className="text-xs text-slate-500 font-mono truncate">@{user.username}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className={`px-2 py-0.5 text-[10px] leading-4 font-semibold rounded-full ${
                        user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                        user.role === 'FOREMAN' ? 'bg-orange-100 text-orange-800' :
                        user.role === 'SA' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {user.role}
                      </span>
                      <span className={`px-2 py-0.5 text-[10px] leading-4 font-semibold rounded-full ${
                        user.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.status}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-3 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Aksi</span>
                    <div className="flex items-center gap-3">
                      {user.role !== 'ADMIN' && (
                        <button
                          onClick={() => startGeoLockSetting(user)}
                          className="text-slate-500 hover:text-emerald-600 flex items-center gap-1 text-xs font-semibold"
                          title="Set Geo-Lock"
                        >
                          <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Geo-Lock</span>
                        </button>
                      )}
                      <button
                        onClick={() => startEditing(user)}
                        className="text-slate-500 hover:text-blue-600 flex items-center gap-1 text-xs font-semibold"
                        title="Edit User"
                      >
                        <Edit className="w-3.5 h-3.5 text-blue-500" />
                        <span>Ubah</span>
                      </button>
                      <button
                        onClick={() => handleToggleStatus(user)}
                        className={`flex items-center gap-1 text-xs font-semibold ${user.status === 'ACTIVE' ? 'text-slate-500 hover:text-orange-600' : 'text-orange-600 hover:text-green-600'}`}
                        title={user.status === 'ACTIVE' ? 'Suspend User' : 'Activate User'}
                      >
                        <Ban className="w-3.5 h-3.5 text-amber-500" />
                        <span>{user.status === 'ACTIVE' ? 'Suspend' : 'Aktifkan'}</span>
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-slate-500 hover:text-red-600 disabled:opacity-30 flex items-center gap-1 text-xs font-semibold"
                        title="Delete User"
                        disabled={user.username === 'admin' || user.username === 'kenji'}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop view: table */}
            <div className="hidden md:block bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-xs">
                  <thead className="bg-slate-50">
                    <tr className="text-slate-500 font-extrabold uppercase tracking-wider text-[10px]">
                      <th className="px-6 py-3.5 text-left">Nama Personil</th>
                      <th className="px-6 py-3.5 text-left">Username (Akses)</th>
                      <th className="px-6 py-3.5 text-left">Jabatan / Peran (Role)</th>
                      <th className="px-6 py-3.5 text-left">Status Akun</th>
                      <th className="px-6 py-3.5 text-right">Aksi Manajemen</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {users.map(user => (
                      <tr key={user.id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
                              {user.name.charAt(0)}
                            </div>
                            <div className="ml-4">
                              <div className="flex items-center gap-1.5">
                                <div className="text-sm font-bold text-slate-800">{user.name}</div>
                                {user.role !== 'ADMIN' && (
                                  user.geoLock?.enabled ? (
                                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 cursor-pointer" title={`Geo-Locked ke: ${user.geoLock.addressName} (Klik untuk edit)`} onClick={() => startGeoLockSetting(user)} />
                                  ) : (
                                    <MapPin className="w-3.5 h-3.5 text-slate-300 shrink-0 hover:text-slate-500 cursor-pointer" title="Geo-Lock Tidak Aktif (Klik untuk aktifkan)" onClick={() => startGeoLockSetting(user)} />
                                  )
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400">ID: {user.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-mono font-semibold text-slate-600">@{user.username}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.role === 'ADMIN' ? (
                            <span className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded border border-purple-200 text-[10px] font-black uppercase">Super Admin</span>
                          ) : user.role === 'FOREMAN' ? (
                            <span className="px-2.5 py-1 bg-orange-50 text-orange-700 rounded border border-orange-200 text-[10px] font-black uppercase">Foreman Fuel Pump</span>
                          ) : user.role === 'SA' ? (
                            <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded border border-blue-200 text-[10px] font-black uppercase">Service Advisor</span>
                          ) : user.role === 'COMMON_RAIL' ? (
                            <span className="px-2.5 py-1 bg-violet-50 text-violet-700 rounded border border-violet-200 text-[10px] font-black uppercase">Common Rail</span>
                          ) : (
                            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded border border-emerald-200 text-[10px] font-black uppercase">Mekanik Fuel Pump</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border uppercase ${
                            user.status === 'ACTIVE' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                              : 'bg-red-50 text-red-700 border-red-200 animate-pulse'
                          }`}>
                            {user.status === 'ACTIVE' ? 'Aktif' : 'Ditangguhkan'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right space-x-3">
                          {user.role !== 'ADMIN' && (
                            <button
                              onClick={() => startGeoLockSetting(user)}
                              className="text-emerald-600 hover:text-emerald-800 font-bold uppercase text-[10px]"
                            >
                              Geo-Lock
                            </button>
                          )}
                          <button
                            onClick={() => startEditing(user)}
                            className="text-blue-600 hover:text-blue-800 font-bold uppercase text-[10px]"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleToggleStatus(user)}
                            className="text-amber-600 hover:text-amber-800 font-bold uppercase text-[10px]"
                          >
                            {user.status === 'ACTIVE' ? 'Suspend' : 'Aktifkan'}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-800 font-bold uppercase text-[10px] disabled:opacity-20"
                            disabled={user.username === 'admin' || user.username === 'kenji'}
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Editing User Modal dialog */}
      {editingUserId && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="bg-slate-900 text-white p-4 shrink-0">
              <h3 className="text-xs font-black uppercase tracking-wider">Perbarui Informasi Akun</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Edit credentials & security clearance level.</p>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              {editError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs font-bold rounded flex items-center gap-1.5 animate-in fade-in">
                  ⚠️ {editError}
                </div>
              )}
              <div>
                <label className="block text-[10px] uppercase font-extrabold text-slate-500 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  className="w-full border border-slate-300 rounded p-2 text-xs font-bold outline-none bg-slate-50 focus:bg-white"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-extrabold text-slate-500 mb-1">Username (Akses)</label>
                <input
                  type="text"
                  required
                  className="w-full border border-slate-300 rounded p-2 text-xs font-bold outline-none bg-slate-100 text-slate-500"
                  value={editUsername}
                  onChange={e => setEditUsername(e.target.value)}
                  disabled={editUsername === 'admin' || editUsername === 'kenji'}
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-extrabold text-slate-500 mb-1">Peran (Role)</label>
                <select
                  className="w-full border border-slate-300 rounded p-2 text-xs font-bold outline-none bg-slate-50"
                  value={editRole}
                  onChange={e => setEditRole(e.target.value as User['role'])}
                  disabled={editUsername === 'admin' || editUsername === 'kenji'}
                >
                  <option value="SA">Service Advisor</option>
                  <option value="MECHANIC">Mekanik Fuel Pump</option>
                  <option value="COMMON_RAIL">Common Rail</option>
                  <option value="FOREMAN">Foreman Fuel Pump</option>
                  <option value="ADMIN">Super Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-extrabold text-slate-500 mb-1">
                  Kata Sandi Baru <span className="text-slate-400 font-normal">(Opsional)</span>
                </label>
                <input
                  type="password"
                  placeholder="Kosongkan jika tidak diubah"
                  className="w-full border border-slate-300 rounded p-2 text-xs font-bold outline-none bg-slate-50 focus:bg-white"
                  value={editPassword}
                  onChange={e => setEditPassword(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setEditingUserId(null); setEditError(null); }}
                  className="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 text-xs font-bold uppercase"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs font-bold uppercase cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Geo-Lock Settings Modal Dialog */}
      {geoLockUser && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="bg-[#1e3a8a] text-white p-4 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider">Pengaturan Geo-Locking</h3>
                <p className="text-[10px] text-slate-200 mt-0.5">Batasi akses operasional karyawan berdasarkan GPS.</p>
              </div>
              <MapPin className="w-5 h-5 text-emerald-300" />
            </div>
            
            <form onSubmit={handleGeoLockSave} className="p-6 space-y-4 overflow-y-auto flex-1">
              {geoSaveError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs font-bold rounded flex items-center gap-1.5 animate-in fade-in">
                  ⚠️ {geoSaveError}
                </div>
              )}

              {/* Status Indicator */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="block text-[11px] font-bold text-slate-800">Batasi Akses User Ini</span>
                  <span className="block text-[9px] text-slate-500">Wajibkan GPS presisi untuk login / operasional.</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={geoEnabled} 
                    onChange={(e) => setGeoEnabled(e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Geo-Lock parameters */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] uppercase font-extrabold text-slate-500 mb-1">Nama Lokasi Referensi</label>
                  <input
                    type="text"
                    required
                    disabled={!geoEnabled}
                    placeholder="Contoh: Bengkel Utama Indo Teknik"
                    className="w-full border border-slate-300 rounded p-2 text-xs font-bold outline-none bg-slate-50 focus:bg-white disabled:opacity-50"
                    value={geoAddress}
                    onChange={e => setGeoAddress(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-extrabold text-slate-500 mb-1">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      required
                      disabled={!geoEnabled}
                      placeholder="-6.200000"
                      className="w-full border border-slate-300 rounded p-2 text-xs font-mono font-bold outline-none bg-slate-50 focus:bg-white disabled:opacity-50"
                      value={geoLat}
                      onChange={e => setGeoLat(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-extrabold text-slate-500 mb-1">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      required
                      disabled={!geoEnabled}
                      placeholder="106.816666"
                      className="w-full border border-slate-300 rounded p-2 text-xs font-mono font-bold outline-none bg-slate-50 focus:bg-white disabled:opacity-50"
                      value={geoLng}
                      onChange={e => setGeoLng(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-extrabold text-slate-500 mb-1">Radius Toleransi (Meter)</label>
                  <input
                    type="number"
                    required
                    disabled={!geoEnabled}
                    placeholder="150"
                    min="10"
                    max="10000"
                    className="w-full border border-slate-300 rounded p-2 text-xs font-bold outline-none bg-slate-50 focus:bg-white disabled:opacity-50"
                    value={geoRadius}
                    onChange={e => setGeoRadius(parseInt(e.target.value) || 150)}
                  />
                </div>
              </div>

              {/* Capture Current GPS Location */}
              {geoEnabled && (
                <button
                  type="button"
                  onClick={getAdminLocation}
                  disabled={geoLocatingAdmin}
                  className="w-full bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg py-2 text-xs font-bold flex items-center justify-center gap-2 text-slate-700 cursor-pointer transition-all disabled:opacity-50"
                >
                  <Navigation className={`w-3.5 h-3.5 text-blue-600 ${geoLocatingAdmin ? 'animate-spin' : ''}`} />
                  {geoLocatingAdmin ? 'Mengakses GPS...' : 'Gunakan Lokasi Admin Saat Ini'}
                </button>
              )}

              {/* Form buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setGeoLockUser(null)}
                  className="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 text-xs font-bold uppercase"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1e3a8a] text-white rounded text-xs font-bold uppercase cursor-pointer"
                >
                  Simpan Setelan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
