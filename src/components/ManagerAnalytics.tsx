import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { WorkOrder, User } from '../types';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { motion } from 'motion/react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { 
  BarChart3, TrendingUp, Users, Award, ShieldAlert, Package, Clock, 
  ClipboardList, CheckCircle2, AlertCircle, PlayCircle, Loader2, Gauge, RefreshCw,
  Trophy, Medal, Flame, Zap, Sparkles, Star, Target, Crown, Info, Gift, DollarSign, X,
  Calendar, History, Database, ChevronDown, ChevronUp, ChevronLeft, ChevronRight
} from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const ManagerAnalytics: React.FC = () => {
  const { workOrders, users, isLoading, triggerDailySummaryManual } = useApp();
  const [authPin, setAuthPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Daily Summary Archiving State
  const [dailySummaries, setDailySummaries] = useState<any[]>([]);
  const [isFetchingSummaries, setIsFetchingSummaries] = useState(true);
  const [selectedTriggerDate, setSelectedTriggerDate] = useState(new Date().toLocaleDateString('en-CA'));
  const [isTriggering, setIsTriggering] = useState(false);
  const [triggerResult, setTriggerResult] = useState<{ success: boolean; message: string } | null>(null);
  const [expandedSummaryId, setExpandedSummaryId] = useState<string | null>(null);

  React.useEffect(() => {
    if (isAuthenticated) {
      const unsubscribe = onSnapshot(
        collection(db, 'dailySummaries'),
        (snapshot) => {
          const summaries: any[] = [];
          snapshot.forEach((doc) => {
            summaries.push(doc.data());
          });
          // Sort by date descending
          summaries.sort((a, b) => b.date.localeCompare(a.date));
          setDailySummaries(summaries);
          setIsFetchingSummaries(false);
        },
        (error) => {
          console.error("Error fetching daily summaries:", error);
          setIsFetchingSummaries(false);
        }
      );
      return () => unsubscribe();
    }
  }, [isAuthenticated]);

  const handleManualTrigger = async () => {
    setIsTriggering(true);
    setTriggerResult(null);
    try {
      const res = await triggerDailySummaryManual(selectedTriggerDate);
      if (res.success) {
        setTriggerResult({
          success: true,
          message: res.isNew 
            ? `Berhasil membuat & mengarsipkan summary harian untuk tanggal ${selectedTriggerDate}.`
            : `Summary harian untuk tanggal ${selectedTriggerDate} sudah ada di Firestore database.`
        });
      } else {
        setTriggerResult({
          success: false,
          message: `Gagal menjalankan tugas: ${res.error}`
        });
      }
    } catch (err: any) {
      setTriggerResult({
        success: false,
        message: `Gagal: ${err.message || String(err)}`
      });
    } finally {
      setIsTriggering(false);
    }
  };

  // States for competitive incentive calculator & gamified leaderboard
  const [bonusPerSPK, setBonusPerSPK] = useState(50000); // Default Rp 50,000 per SPK
  const [kpiMultiplier, setKpiMultiplier] = useState(1.5); // Default 1.5x multiplier for high KPI
  const [leaderboardFilter, setLeaderboardFilter] = useState<'ALL' | 'FP' | 'CR'>('ALL');
  const [celebrationWinner, setCelebrationWinner] = useState<{name: string; title: string; bonus: number; spkCount: number} | null>(null);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (authPin === '9999' || authPin === 'admin') {
      setIsAuthenticated(true);
      setErrorMessage('');
    } else {
      setErrorMessage('PIN Kredensial Manajemen Salah! Silakan gunakan PIN "9999" atau "admin".');
    }
  };

  // 1. Process Incoming Orders Statistics
  const totalOrders = workOrders.length;
  const queueOrders = workOrders.filter(w => w.status === 'QUEUE').length;
  const inProgressOrders = workOrders.filter(w => w.status === 'IN_PROGRESS').length;
  const pendingPartsOrders = workOrders.filter(w => w.status === 'PENDING_PARTS').length;
  const pendingApprovalOrders = workOrders.filter(w => w.status === 'PENDING_APPROVAL').length;
  const completedOrders = workOrders.filter(w => w.status === 'COMPLETED').length;

  const activeWorkOrders = workOrders.filter(w => w.status !== 'COMPLETED' && !w.isArchived).length;
  const inventoryLows = workOrders.filter(w => w.status === 'PENDING_PARTS' || (w.isBlocked && w.blockedReason === 'WAITING_PARTS')).length;

  // Horizontal Card-Stack Slider State for Primary Metrics
  const metricScrollRef = React.useRef<HTMLDivElement>(null);
  const [activeMetricSlide, setActiveMetricSlide] = useState(0);

  const primaryMetrics = [
    {
      id: 'active_wo',
      title: 'Active Work Orders',
      value: activeWorkOrders,
      subtitle: 'SPK Berjalan di Bengkel',
      icon: <Gauge className="w-5 h-5 text-indigo-600" />,
      colorClass: 'border-indigo-150 bg-indigo-50/30 text-indigo-900',
      badge: 'Real-time'
    },
    {
      id: 'inventory_lows',
      title: 'Inventory Lows',
      value: inventoryLows,
      subtitle: 'Suku Cadang Menunggu/Kosong',
      icon: <AlertCircle className="w-5 h-5 text-rose-600" />,
      colorClass: 'border-rose-150 bg-rose-50/30 text-rose-900',
      badge: 'Kritis'
    },
    {
      id: 'queue',
      title: 'Antrean (Queue)',
      value: queueOrders,
      subtitle: 'SPK Menunggu Antrean',
      icon: <ClipboardList className="w-5 h-5 text-slate-600" />,
      colorClass: 'border-slate-200 bg-slate-50/30 text-slate-800',
      badge: 'Queue'
    },
    {
      id: 'in_progress',
      title: 'Di Lab Uji',
      value: inProgressOrders,
      subtitle: 'Uji Kalibrasi Aktif',
      icon: <PlayCircle className="w-5 h-5 text-blue-600" />,
      colorClass: 'border-blue-150 bg-blue-50/30 text-blue-900',
      badge: 'Kalibrasi'
    },
    {
      id: 'approval',
      title: 'Pending Approval',
      value: pendingApprovalOrders,
      subtitle: 'Menunggu Persetujuan Pelanggan',
      icon: <Clock className="w-5 h-5 text-amber-600" />,
      colorClass: 'border-amber-150 bg-amber-50/30 text-amber-950',
      badge: 'Konfirmasi'
    },
    {
      id: 'completed',
      title: 'Selesai QC',
      value: completedOrders,
      subtitle: 'Total SPK Selesai',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
      colorClass: 'border-emerald-150 bg-emerald-50/30 text-emerald-955',
      badge: 'Archive-ready'
    }
  ];

  const handleMetricScroll = () => {
    if (metricScrollRef.current) {
      const scrollLeft = metricScrollRef.current.scrollLeft;
      const clientWidth = metricScrollRef.current.clientWidth;
      const index = Math.round(scrollLeft / (clientWidth || 1));
      setActiveMetricSlide(index);
    }
  };

  const slideMetricTo = (index: number) => {
    if (metricScrollRef.current) {
      const clientWidth = metricScrollRef.current.clientWidth;
      metricScrollRef.current.scrollTo({
        left: index * (clientWidth + 16), // account for gap
        behavior: 'smooth'
      });
      setActiveMetricSlide(index);
    }
  };

  const slideMetricNext = () => {
    const nextIndex = Math.min(primaryMetrics.length - 1, activeMetricSlide + 1);
    slideMetricTo(nextIndex);
  };

  const slideMetricPrev = () => {
    const prevIndex = Math.max(0, activeMetricSlide - 1);
    slideMetricTo(prevIndex);
  };

  const orderDistributionData = [
    { name: 'Antrean (Queue)', value: queueOrders, color: '#64748b' },
    { name: 'Dikerjakan (In Progress)', value: inProgressOrders, color: '#3b82f6' },
    { name: 'Pending Parts', value: pendingPartsOrders, color: '#ef4444' },
    { name: 'Persetujuan (Pending Approval)', value: pendingApprovalOrders, color: '#f59e0b' },
    { name: 'Selesai (Completed)', value: completedOrders, color: '#10b981' },
  ].filter(item => item.value > 0);

  // 2. Mechanic Productivity Calculations
  const mechanicsFillPump = users.filter((u) => u.role === 'MECHANIC' && u.status === 'ACTIVE');
  const mechanicsCommonRail = users.filter((u) => u.role === 'COMMON_RAIL' && u.status === 'ACTIVE');

  const calculateMechanicStats = (mechanicList: User[]) => {
    return mechanicList.map((mech) => {
      const completedWOs = workOrders.filter(
        (wo) => wo.mechanicId === mech.id && wo.status === 'COMPLETED'
      );
      
      const totalWOs = completedWOs.length;
      const totalSeconds = completedWOs.reduce((acc, wo) => acc + (wo.totalElapsedSeconds || 0), 0);
      const avgSeconds = totalWOs > 0 ? Math.round(totalSeconds / totalWOs) : 0;
      
      // KPI Score Calculation: Base 60, +5 points per unit completed, with speed bonus
      // Standard target is 2 hours (7200 seconds)
      let speedBonus = 0;
      if (totalWOs > 0 && avgSeconds > 0) {
        if (avgSeconds <= 3600) speedBonus = 20; // under 1 hour
        else if (avgSeconds <= 7200) speedBonus = 10; // under 2 hours
        else if (avgSeconds <= 14400) speedBonus = 5; // under 4 hours
      }
      const rawKpi = 50 + (totalWOs * 5) + speedBonus;
      const kpiScore = Math.min(100, Math.max(30, rawKpi));

      return {
        id: mech.id,
        name: mech.name,
        username: mech.username,
        completedCount: totalWOs,
        avgSeconds,
        kpiScore,
      };
    }).sort((a, b) => b.kpiScore - a.kpiScore);
  };

  const fillPumpStats = calculateMechanicStats(mechanicsFillPump);
  const commonRailStats = calculateMechanicStats(mechanicsCommonRail);

  // Helper to format average time
  const formatAvgTime = (totalSecs: number) => {
    if (totalSecs === 0) return '00:00:00';
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return [
      hrs.toString().padStart(2, '0'),
      mins.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0'),
    ].join(':');
  };

  // 3. Service Advisor (SA) Productivity Calculations
  const serviceAdvisors = users.filter(u => u.role === 'SA' && u.status === 'ACTIVE');
  const saStats = serviceAdvisors.map(sa => {
    // Count WOs created by this SA
    // Fallback: search if wo.createdBy matches the SA name, or if no createdBy we attribute dynamically
    const woRegistered = workOrders.filter(wo => {
      if (wo.createdBy) {
        return wo.createdBy.toLowerCase() === sa.name.toLowerCase() || wo.createdBy.toLowerCase() === sa.username.toLowerCase();
      }
      // If no createdBy, fallback to first SA in DB for demo, or attribute evenly
      return false;
    });

    const registeredCount = woRegistered.length;
    
    // SA Completeness Ratio (Check how complete their intake descriptions are)
    const completeIntakes = woRegistered.filter(wo => 
      wo.customerPhone && wo.customerAddress && wo.vehicleBrand && wo.plateNumber && wo.customerVoice
    ).length;
    const completenessRatio = registeredCount > 0 ? Math.round((completeIntakes / registeredCount) * 100) : 100;

    // SA KPI calculation: 40% volume, 60% completeness
    const volumeScore = Math.min(50, registeredCount * 8);
    const completenessScore = completenessRatio * 0.5;
    const kpiScore = Math.min(100, Math.round(50 + volumeScore + completenessScore));

    return {
      id: sa.id,
      name: sa.name,
      username: sa.username,
      registeredCount,
      completenessRatio,
      kpiScore
    };
  }).sort((a, b) => b.kpiScore - a.kpiScore);

  // 4. Damage keyword analysis for Stock Planning
  const damageKeywords = [
    { key: 'nozzle', label: 'Nozzle Tip Macet / Aus', pattern: /nozzle|ujung/i },
    { key: 'valve', label: 'Valve Plate Tergores / Bocor', pattern: /valve|katup|plate/i },
    { key: 'shim', label: 'Shim Adjust / Penyetelan Celah', pattern: /shim|ganjal|celah/i },
    { key: 'seal', label: 'Seal Kit Rusak / Diganti', pattern: /seal|o-ring|karet/i },
    { key: 'solenoid', label: 'Solenoid Bermasalah / Gosong', pattern: /solenoid|koil|magnet/i },
    { key: 'body', label: 'Keretakan Body Injector', pattern: /retak|bodi|body/i },
  ];

  const damageCounts: Record<string, number> = {
    nozzle: 0,
    valve: 0,
    shim: 0,
    seal: 0,
    solenoid: 0,
    body: 0,
  };

  let totalLogsAnalyzed = 0;
  workOrders.forEach((wo) => {
    if (wo.partLogs) {
      wo.partLogs.forEach((log) => {
        totalLogsAnalyzed++;
        const textToAnalyze = `${log.findings || ''} ${log.notes || ''}`.toLowerCase();
        damageKeywords.forEach((kw) => {
          if (kw.pattern.test(textToAnalyze)) {
            damageCounts[kw.key]++;
          }
        });
      });
    }
  });

  const totalDamageHits = Object.values(damageCounts).reduce((a, b) => a + b, 0) || 1;
  const sortedDamages = damageKeywords.map((kw) => {
    const count = damageCounts[kw.key];
    const percentage = Math.round((count / totalDamageHits) * 100);
    return {
      ...kw,
      count,
      percentage,
    };
  }).sort((a, b) => b.count - a.count);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[500px] p-6 bg-[#f8fafc]">
        <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-200 text-blue-600">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-1">OTENTIKASI KREDENSIAL MANAJEMEN</h2>
          <p className="text-slate-500 text-xs mb-6 leading-relaxed">
            Halaman ini memuat laporan produktivitas lab dan rahasia logistik persediaan. Silakan masukkan PIN Otoritas Pemilik untuk melanjutkan.
          </p>

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="Masukkan PIN Pemilik / Admin"
                className="w-full text-center p-3 border-2 border-slate-300 rounded-lg text-lg tracking-widest font-black focus:border-blue-500 focus:ring-0 outline-none"
                value={authPin}
                onChange={(e) => setAuthPin(e.target.value)}
                autoFocus
              />
            </div>
            {errorMessage && (
              <p className="text-red-600 text-xs font-semibold bg-red-50 p-2.5 rounded border border-red-200">
                {errorMessage}
              </p>
            )}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-black py-3 rounded-lg uppercase tracking-wider transition-colors shadow"
            >
              Verifikasi Masuk
            </button>
          </form>
          <div className="mt-4 text-[10px] text-slate-400">
            *Gunakan PIN: <strong className="text-slate-600">9999</strong> atau <strong className="text-slate-600">admin</strong> untuk simulasi offline.
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <span className="ml-2 text-sm text-slate-500">Memuat analisis performa...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Title Header Block */}
      <div className="bg-slate-900 text-white p-6 rounded-lg shadow-sm border border-slate-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-lg font-black tracking-wider uppercase text-blue-400 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            Dasbor Analitik & Indikator Performa (KPI)
          </h1>
          <p className="text-slate-300 text-xs mt-1.5 leading-relaxed">
            Analisis real-time performa Service Advisor, efisiensi mekanik per divisi lab uji kalibrasi diesel, dan pemantauan order masuk.
          </p>
        </div>
        <button
          onClick={() => setIsAuthenticated(false)}
          className="px-3.5 py-1.5 border border-slate-700 hover:bg-slate-800 text-[10px] font-black uppercase rounded text-slate-300 transition-colors"
        >
          Kunci Layar
        </button>
      </div>

      {/* 1. Primary Metrics Overview (Responsive Card Slider for Mobile / High-Density Grid for Desktop) */}
      
      {/* Mobile Slider View */}
      <div className="block md:hidden bg-slate-100 p-3.5 rounded-xl border border-slate-200 relative shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-black uppercase text-slate-600 tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            Metrik Utama (Geser / Swipe)
          </span>
          <div className="flex gap-1.5">
            <button 
              onClick={slideMetricPrev}
              disabled={activeMetricSlide === 0}
              className="p-1 rounded-full bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none shadow-xs transition-colors cursor-pointer"
              title="Sebelumnya"
            >
              <ChevronLeft className="w-3.5 h-3.5 text-slate-700" />
            </button>
            <button 
              onClick={slideMetricNext}
              disabled={activeMetricSlide === primaryMetrics.length - 1}
              className="p-1 rounded-full bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none shadow-xs transition-colors cursor-pointer"
              title="Berikutnya"
            >
              <ChevronRight className="w-3.5 h-3.5 text-slate-700" />
            </button>
          </div>
        </div>

        {/* Scrollable Container */}
        <div 
          ref={metricScrollRef}
          onScroll={handleMetricScroll}
          className="flex flex-row overflow-x-auto snap-x snap-mandatory gap-4 pb-2 scrollbar-none scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {primaryMetrics.map((metric, index) => (
            <motion.div 
              key={metric.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.015 }}
              transition={{ duration: 0.25, delay: index * 0.03 }}
              className={`flex-shrink-0 w-[82vw] sm:w-[260px] snap-center p-4 rounded-xl border bg-white flex flex-col justify-between h-28 shadow-xs ${metric.colorClass}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">{metric.title}</span>
                  <span className="text-[10px] text-slate-500 mt-0.5 block font-medium leading-tight">{metric.subtitle}</span>
                </div>
                <div className="p-1.5 rounded-lg bg-white shadow-2xs border border-slate-100 shrink-0">
                  {metric.icon}
                </div>
              </div>
              <div className="flex items-end justify-between mt-2">
                <span className="text-3xl font-black text-slate-800 tracking-tight font-mono">{metric.value}</span>
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-white/80 border border-slate-100">
                  {metric.badge}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Slider Dots Indicator */}
        <div className="flex items-center justify-center gap-1.5 mt-2">
          {primaryMetrics.map((_, idx) => (
            <button
              key={idx}
              onClick={() => slideMetricTo(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                activeMetricSlide === idx ? 'w-4 bg-blue-600' : 'w-1.5 bg-slate-300'
              }`}
              title={`Geser ke ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Desktop Grid View */}
      <div className="hidden md:grid md:grid-cols-6 gap-4">
        {primaryMetrics.map((metric, index) => (
          <motion.div 
            key={metric.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.03, y: -2 }}
            transition={{ duration: 0.3, delay: index * 0.04 }}
            className={`bg-white p-4 rounded-xl shadow-xs border flex flex-col justify-between hover:border-blue-400 transition-all hover:shadow-sm duration-250 h-28 cursor-pointer ${metric.colorClass}`}
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">{metric.title}</span>
                <span className="text-[10px] text-slate-500 mt-0.5 block leading-tight font-medium">{metric.subtitle}</span>
              </div>
              <div className="p-1.5 rounded-lg bg-white shadow-2xs border border-slate-100 shrink-0">
                {metric.icon}
              </div>
            </div>
            <div className="flex items-end justify-between mt-2">
              <span className="text-2xl font-black text-slate-800 tracking-tight font-mono">{metric.value}</span>
              <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full bg-white/60 border border-slate-100">
                {metric.badge}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Orders Flow distribution */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200 flex flex-col justify-between lg:col-span-1">
          <div>
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <RefreshCw className="w-4 h-4 text-blue-600" />
              Distribusi Status SPK Masuk
            </h3>
            <p className="text-[11px] text-slate-500 mb-4">Total: {totalOrders} Work Orders terdaftar saat ini.</p>
          </div>
          
          <div className="h-48 w-full flex items-center justify-center">
            {orderDistributionData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={orderDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {orderDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} SPK`, 'Jumlah']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-400 italic">Belum ada aktivitas SPK.</p>
            )}
          </div>

          <div className="space-y-1.5 pt-3 border-t border-slate-100">
            {orderDistributionData.map((item, index) => (
              <div key={index} className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600">{item.name}</span>
                </div>
                <span className="font-bold text-slate-800 font-mono">{item.value} ({Math.round((item.value / totalOrders) * 100)}%)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Columns: Service Advisor Productivity */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200 lg:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-indigo-600" />
              Performa Service Advisor (SA)
            </h3>
            <p className="text-[11px] text-slate-500 mb-4">
              Indikator performa dihitung berdasarkan volume pendaftaran SPK dan rasio kelengkapan formulir inspeksi kendaraan.
            </p>
          </div>

          {saStats.length > 0 ? (
            <div className="space-y-4">
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={saStats} layout="vertical" margin={{ left: 20, right: 10, top: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" stroke="#94a3b8" fontSize={10} />
                    <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={80} />
                    <Tooltip formatter={(value) => [`${value} unit`, 'Pendaftaran']} />
                    <Bar dataKey="registeredCount" fill="#4f46e5" radius={[0, 4, 4, 0]} name="SPK Terdaftar" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* SA KPI Table */}
              <div className="border border-slate-200 rounded overflow-hidden">
                <table className="w-full text-[11px] text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[9px] font-bold">
                    <tr>
                      <th className="px-3 py-2">Nama SA</th>
                      <th className="px-3 py-2 text-center">SPK Terdaftar</th>
                      <th className="px-3 py-2 text-center">Akurasi Data</th>
                      <th className="px-3 py-2 text-right">Skor KPI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150">
                    {saStats.map((sa, idx) => (
                      <tr key={sa.id} className="hover:bg-slate-50/50">
                        <td className="px-3 py-2 font-bold text-slate-800">{sa.name}</td>
                        <td className="px-3 py-2 text-center font-bold font-mono">{sa.registeredCount} Unit</td>
                        <td className="px-3 py-2 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            sa.completenessRatio >= 80 ? 'bg-green-150 text-green-800' : 'bg-amber-150 text-amber-800'
                          }`}>
                            {sa.completenessRatio}% Lengkap
                          </span>
                        </td>
                        <td className="px-3 py-2 text-right font-black font-mono text-indigo-600 bg-indigo-50/20">{sa.kpiScore} / 100</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-450 italic text-xs">Belum ada data Service Advisor aktif.</div>
          )}
        </div>
      </div>

      {/* GAMIFIED MECHANICS LEADERBOARD CHAMPIONSHIP */}
      <section className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 space-y-6 overflow-hidden">
        {/* Section Header */}
        <div className="border-b border-slate-150 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500 animate-bounce" />
              Sirkuit Kompetisi & Peringkat Juara Mekanik Lab
            </h2>
            <p className="text-slate-500 text-xs mt-1">
              Sistem gamifikasi performa kalibrasi diesel berdasarkan kecepatan penanganan (turnaround) dan volume penyelesaian SPK.
            </p>
          </div>
          
          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">Filter Divisi:</span>
            <button
              onClick={() => setLeaderboardFilter('ALL')}
              className={`px-3 py-1 rounded text-[10px] font-black uppercase border transition-colors ${
                leaderboardFilter === 'ALL'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Semua Divisi
            </button>
            <button
              onClick={() => setLeaderboardFilter('FP')}
              className={`px-3 py-1 rounded text-[10px] font-black uppercase border transition-colors ${
                leaderboardFilter === 'FP'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Fuel Pump
            </button>
            <button
              onClick={() => setLeaderboardFilter('CR')}
              className={`px-3 py-1 rounded text-[10px] font-black uppercase border transition-colors ${
                leaderboardFilter === 'CR'
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Common Rail
            </button>
          </div>
        </div>

        {/* Celebration Popup Alert */}
        {celebrationWinner && (
          <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 text-white p-5 rounded-lg shadow-lg border border-amber-400 relative overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            {/* Ambient Sparkles */}
            <div className="absolute right-4 top-4 opacity-20 pointer-events-none">
              <Sparkles className="w-24 h-24 text-white" />
            </div>
            <button
              onClick={() => setCelebrationWinner(null)}
              className="absolute top-2 right-2 hover:bg-black/15 text-white/80 hover:text-white rounded-full p-1 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center border border-white/30 shrink-0">
                <Crown className="w-8 h-8 text-yellow-100 animate-pulse" />
              </div>
              <div className="text-center sm:text-left space-y-1">
                <span className="bg-white/20 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-white/20">
                  🏆 SELEBRASI JUARA BULANAN INDO TEKNIK
                </span>
                <h4 className="text-base font-black uppercase tracking-tight">
                  Selamat Kepada {celebrationWinner.name}!
                </h4>
                <p className="text-xs text-amber-50 font-medium">
                  Meraih gelar <strong className="underline decoration-wavy decoration-yellow-300">{celebrationWinner.title}</strong> setelah menuntaskan <strong>{celebrationWinner.spkCount} SPK</strong> kalibrasi diesel.
                </p>
                <div className="pt-1.5 flex flex-wrap gap-2 justify-center sm:justify-start">
                  <span className="bg-white text-amber-700 text-[10px] font-black px-2.5 py-0.5 rounded shadow">
                    Bonus Kinerja: {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(celebrationWinner.bonus)}
                  </span>
                  <span className="bg-amber-800/30 text-white text-[10px] font-bold px-2.5 py-0.5 rounded border border-white/10">
                    Sertifikat Digital Dibuat!
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Podium Top-3 Section */}
        {(() => {
          const allMechanicsLeaderboard = [
            ...fillPumpStats.map(m => ({ ...m, division: 'Fuel Pump', divisionKey: 'FP' })),
            ...commonRailStats.map(m => ({ ...m, division: 'Common Rail', divisionKey: 'CR' }))
          ].sort((a, b) => b.kpiScore - a.kpiScore || b.completedCount - a.completedCount || a.avgSeconds - b.avgSeconds);

          const filteredLeaderboard = allMechanicsLeaderboard.filter(mech => {
            if (leaderboardFilter === 'ALL') return true;
            return mech.divisionKey === leaderboardFilter;
          });

          const podiumMechanics = filteredLeaderboard.slice(0, 3);
          
          const getMechanicRankTitle = (score: number) => {
            if (score >= 90) return { title: 'Supreme Calibration Legend', color: 'text-amber-700 bg-amber-50 border-amber-200' };
            if (score >= 80) return { title: 'Master Speed Precisionist', color: 'text-blue-700 bg-blue-50 border-blue-200' };
            if (score >= 70) return { title: 'Senior Calibration Ninja', color: 'text-purple-700 bg-purple-50 border-purple-200' };
            if (score >= 55) return { title: 'Competent Technician', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
            return { title: 'Junior Apprentice', color: 'text-slate-600 bg-slate-50 border-slate-200' };
          };

          const getMechanicLevel = (score: number) => {
            const level = Math.floor(score / 10);
            const xpPercent = (score % 10) * 10;
            return { level, xpPercent };
          };

          return (
            <>
              {podiumMechanics.length > 0 ? (
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-150 shadow-inner">
                  <h3 className="text-center text-[10px] font-black uppercase text-slate-450 tracking-widest mb-4">
                    👑 podium juara saat ini 👑
                  </h3>
                  
                  {/* The Podium Grid */}
                  <div className="grid grid-cols-3 items-end gap-2 md:gap-4 max-w-xl mx-auto pt-6">
                    {/* 2nd Place */}
                    {podiumMechanics[1] ? (
                      <div className="flex flex-col items-center text-center space-y-2">
                        <div className="relative group">
                          <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center border-2 border-slate-300 shadow relative">
                            <Medal className="w-6 h-6 text-slate-400" />
                            <span className="absolute -top-1.5 -right-1.5 bg-slate-400 text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center border border-white">
                              2
                            </span>
                          </div>
                        </div>
                        <div className="space-y-0.5">
                          <div className="text-xs font-black text-slate-850 truncate max-w-[90px] md:max-w-none">
                            {podiumMechanics[1].name}
                          </div>
                          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                            {podiumMechanics[1].division}
                          </div>
                        </div>
                        {/* Podium Column */}
                        <div className="w-full h-16 bg-gradient-to-t from-slate-200 to-slate-100 border-t-2 border-slate-300 rounded-t-lg flex flex-col justify-center items-center shadow-md">
                          <span className="text-xs font-black text-slate-500 font-mono">
                            {podiumMechanics[1].kpiScore}
                          </span>
                          <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">
                            KPI Score
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="h-1" />
                    )}

                    {/* 1st Place */}
                    {podiumMechanics[0] ? (
                      <div className="flex flex-col items-center text-center space-y-2">
                        <div className="relative group">
                          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center border-4 border-amber-400 shadow-lg relative animate-pulse">
                            <Trophy className="w-8 h-8 text-amber-500" />
                            <Crown className="w-6 h-6 text-yellow-500 absolute -top-5 left-1/2 -translate-x-1/2 transform drop-shadow" />
                            <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white">
                              1
                            </span>
                          </div>
                        </div>
                        <div className="space-y-0.5">
                          <div className="text-sm font-black text-slate-900 truncate max-w-[100px] md:max-w-none flex items-center gap-1 justify-center">
                            {podiumMechanics[0].name}
                          </div>
                          <div className="text-[9px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 uppercase tracking-wider inline-block">
                            {podiumMechanics[0].division}
                          </div>
                        </div>
                        {/* Podium Column */}
                        <div className="w-full h-24 bg-gradient-to-t from-amber-200 to-amber-100 border-t-4 border-amber-400 rounded-t-lg flex flex-col justify-center items-center shadow-lg relative overflow-hidden">
                          <span className="text-sm font-black text-amber-700 font-mono">
                            {podiumMechanics[0].kpiScore}
                          </span>
                          <span className="text-[8px] text-amber-600 font-black uppercase tracking-wider">
                            Champion
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="h-1" />
                    )}

                    {/* 3rd Place */}
                    {podiumMechanics[2] ? (
                      <div className="flex flex-col items-center text-center space-y-2">
                        <div className="relative group">
                          <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center border-2 border-orange-300 shadow relative">
                            <Medal className="w-6 h-6 text-orange-500" />
                            <span className="absolute -top-1.5 -right-1.5 bg-orange-400 text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center border border-white">
                              3
                            </span>
                          </div>
                        </div>
                        <div className="space-y-0.5">
                          <div className="text-xs font-black text-slate-850 truncate max-w-[90px] md:max-w-none">
                            {podiumMechanics[2].name}
                          </div>
                          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                            {podiumMechanics[2].division}
                          </div>
                        </div>
                        {/* Podium Column */}
                        <div className="w-full h-12 bg-gradient-to-t from-orange-100 to-orange-50 border-t-2 border-orange-300 rounded-t-lg flex flex-col justify-center items-center shadow-md">
                          <span className="text-xs font-black text-orange-700 font-mono">
                            {podiumMechanics[2].kpiScore}
                          </span>
                          <span className="text-[8px] text-orange-500 font-bold uppercase tracking-wider">
                            KPI Score
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="h-1" />
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 italic text-xs border border-dashed border-slate-200 rounded">
                  Tidak ada mekanik yang memenuhi kriteria peringkat saat ini.
                </div>
              )}

              {/* Split Grid for Leaderboard details and Payout Incentives calculator */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4">
                
                {/* Left Panel: Mechanic stats list with RPG levels (col-span-7) */}
                <div className="lg:col-span-7 space-y-4">
                  <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400" />
                    Detail Kompetisi & Perkembangan Level RPG
                  </h3>

                  <div className="space-y-3">
                    {filteredLeaderboard.map((mech, idx) => {
                      const rankTitleInfo = getMechanicRankTitle(mech.kpiScore);
                      const levelInfo = getMechanicLevel(mech.kpiScore);
                      const isTop1 = idx === 0 && leaderboardFilter === 'ALL';
                      
                      return (
                        <div 
                          key={mech.id} 
                          className={`p-4 rounded-lg border transition-all ${
                            isTop1 
                              ? 'bg-amber-50/50 border-amber-200 shadow-sm' 
                              : 'bg-white border-slate-150 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            {/* Left Block: Avatar, Name, Title */}
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-full font-black text-sm flex items-center justify-center shrink-0 ${
                                idx === 0 ? 'bg-amber-500 text-white ring-4 ring-amber-100' :
                                idx === 1 ? 'bg-slate-300 text-slate-700' :
                                idx === 2 ? 'bg-orange-300 text-orange-800' :
                                'bg-slate-100 text-slate-600 border border-slate-200'
                              }`}>
                                #{idx + 1}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-bold text-slate-800 text-sm truncate">{mech.name}</span>
                                  <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-500">
                                    {mech.division}
                                  </span>
                                </div>
                                <span className={`inline-block text-[9px] font-black uppercase px-2 py-0.5 rounded border mt-1 ${rankTitleInfo.color}`}>
                                  {rankTitleInfo.title}
                                </span>
                              </div>
                            </div>

                            {/* Right Block: Level & XP Bar */}
                            <div className="space-y-1 sm:text-right min-w-[140px]">
                              <div className="flex justify-between text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                                <span>Level {levelInfo.level} Tech</span>
                                <span className="font-mono">{levelInfo.xpPercent}% XP</span>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200">
                                <div 
                                  className="bg-blue-600 h-full rounded-full transition-all duration-500"
                                  style={{ width: `${levelInfo.xpPercent}%` }}
                                />
                              </div>
                              <div className="flex justify-between items-center text-[10px] text-slate-450 mt-1">
                                <span className="flex items-center gap-1 font-mono">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                                  {mech.completedCount} SPK
                                </span>
                                <span className="flex items-center gap-1 font-mono">
                                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                                  {mech.completedCount > 0 ? formatAvgTime(mech.avgSeconds) : 'N/A'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right Panel: Competitive Bonus & Incentive Calculator (col-span-5) */}
                <div className="lg:col-span-5 bg-slate-900 text-white p-5 rounded-xl border border-slate-800 space-y-5 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div>
                      <span className="bg-blue-900/40 text-blue-400 border border-blue-900 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
                        🎛️ SIMULATOR PROGRAM REWARD & INSENTIF
                      </span>
                      <h3 className="text-xs font-black text-slate-200 uppercase tracking-wider mt-2.5 flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4 text-emerald-400" />
                        Kalkulator Bonus Berbasis Kinerja (KPI)
                      </h3>
                      <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
                        Atur slider bonus dasar dan pengali KPI untuk memperkirakan pengeluaran insentif efisiensi teknisi bulan ini.
                      </p>
                    </div>

                    {/* Sliders Block */}
                    <div className="space-y-3.5 bg-slate-950 p-3.5 rounded-lg border border-slate-800 text-xs">
                      {/* Slider 1: Base Bonus */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between font-bold text-slate-300">
                          <span>Bonus Dasar per SPK:</span>
                          <span className="font-mono text-emerald-400">
                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(bonusPerSPK)}
                          </span>
                        </div>
                        <input 
                          type="range" 
                          min={10000} 
                          max={200000} 
                          step={5000}
                          className="w-full accent-blue-500 bg-slate-800 cursor-pointer"
                          value={bonusPerSPK}
                          onChange={(e) => setBonusPerSPK(Number(e.target.value))}
                        />
                        <div className="flex justify-between text-[9px] text-slate-500">
                          <span>Rp 10rb</span>
                          <span>Rp 200rb</span>
                        </div>
                      </div>

                      {/* Slider 2: KPI Multiplier */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between font-bold text-slate-300">
                          <span>Pengali KPI Tinggi (Score &gt;= 85):</span>
                          <span className="font-mono text-amber-400">
                            {kpiMultiplier}x Multiplier
                          </span>
                        </div>
                        <input 
                          type="range" 
                          min={1.1} 
                          max={2.5} 
                          step={0.1}
                          className="w-full accent-amber-500 bg-slate-800 cursor-pointer"
                          value={kpiMultiplier}
                          onChange={(e) => setKpiMultiplier(Number(e.target.value))}
                        />
                        <div className="flex justify-between text-[9px] text-slate-500">
                          <span>1.1x</span>
                          <span>2.5x</span>
                        </div>
                      </div>
                    </div>

                    {/* Calculated Results Area */}
                    <div className="space-y-2.5">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                        Proyeksi Pembayaran Bonus Berdasarkan Performa:
                      </span>
                      
                      <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                        {filteredLeaderboard.map((mech) => {
                          const basePayout = mech.completedCount * bonusPerSPK;
                          const multiplier = mech.kpiScore >= 85 ? kpiMultiplier : mech.kpiScore >= 70 ? 1.2 : 1.0;
                          const totalPayout = Math.round(basePayout * multiplier);

                          return (
                            <div key={mech.id} className="flex justify-between items-center bg-slate-950/40 p-2 border border-slate-800/60 rounded text-[11px]">
                              <div>
                                <span className="font-bold block text-slate-200">{mech.name}</span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {mech.completedCount} SPK × {multiplier}x Mult
                                </span>
                              </div>
                              <span className="font-mono font-black text-emerald-400">
                                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(totalPayout)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Launch Ceremony Action Button */}
                  {filteredLeaderboard.length > 0 && (
                    <button
                      onClick={() => {
                        const winner = filteredLeaderboard[0];
                        const basePayout = winner.completedCount * bonusPerSPK;
                        const multiplier = winner.kpiScore >= 85 ? kpiMultiplier : winner.kpiScore >= 70 ? 1.2 : 1.0;
                        const finalBonus = Math.round(basePayout * multiplier);
                        const titleInfo = getMechanicRankTitle(winner.kpiScore);
                        
                        setCelebrationWinner({
                          name: winner.name,
                          title: titleInfo.title,
                          bonus: finalBonus,
                          spkCount: winner.completedCount
                        });
                      }}
                      className="w-full mt-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-[11px] font-black py-3 rounded-lg uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <Crown className="w-4 h-4 text-slate-950" />
                      Umumkan Penghargaan & Selebrasi Juara
                    </button>
                  )}
                </div>

              </div>
            </>
          );
        })()}
      </section>

      {/* 2. Mechanics Productivity per Division */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Division A: Mechanics Fuel Pump / Supply Pump */}
        <section className="bg-white rounded-lg shadow-sm border border-slate-200 p-5 space-y-4">
          <div className="border-b border-slate-150 pb-3 flex justify-between items-center">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-emerald-600" />
              A. Divisi Lab Kalibrasi Fuel Pump (Supply Pump)
            </h3>
            <span className="text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-100">
              Mekanik FP
            </span>
          </div>

          {fillPumpStats.length > 0 ? (
            <div className="space-y-4">
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={fillPumpStats} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} />
                    <YAxis stroke="#94a3b8" fontSize={9} />
                    <Tooltip formatter={(value) => [`${value} SPK`, 'Selesai']} />
                    <Bar dataKey="completedCount" fill="#10b981" radius={[4, 4, 0, 0]} name="Pekerjaan Selesai" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* TableFP */}
              <div className="border border-slate-200 rounded overflow-hidden">
                <table className="w-full text-[11px] text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[9px] font-bold">
                    <tr>
                      <th className="px-3 py-2">Nama Mekanik</th>
                      <th className="px-3 py-2 text-center">SPK Selesai</th>
                      <th className="px-3 py-2 text-center">Rerata Durasi</th>
                      <th className="px-3 py-2 text-right">Skor KPI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150">
                    {fillPumpStats.map((stat) => (
                      <tr key={stat.id} className="hover:bg-slate-50/50">
                        <td className="px-3 py-2 font-bold text-slate-800">{stat.name}</td>
                        <td className="px-3 py-2 text-center font-bold font-mono">{stat.completedCount} Unit</td>
                        <td className="px-3 py-2 text-center font-mono text-slate-600">
                          {stat.completedCount > 0 ? formatAvgTime(stat.avgSeconds) : 'N/A'}
                        </td>
                        <td className="px-3 py-2 text-right font-black font-mono text-emerald-600 bg-emerald-50/20">{stat.kpiScore} / 100</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-450 italic text-xs">Belum ada mekanik Fuel Pump aktif.</div>
          )}
        </section>

        {/* Division B: Mechanics Common Rail */}
        <section className="bg-white rounded-lg shadow-sm border border-slate-200 p-5 space-y-4">
          <div className="border-b border-slate-150 pb-3 flex justify-between items-center">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-purple-600" />
              B. Divisi Lab Kalibrasi Common Rail
            </h3>
            <span className="text-[10px] font-extrabold uppercase bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-100">
              Mekanik CR
            </span>
          </div>

          {commonRailStats.length > 0 ? (
            <div className="space-y-4">
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={commonRailStats} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} />
                    <YAxis stroke="#94a3b8" fontSize={9} />
                    <Tooltip formatter={(value) => [`${value} SPK`, 'Selesai']} />
                    <Bar dataKey="completedCount" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Pekerjaan Selesai" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* TableCR */}
              <div className="border border-slate-200 rounded overflow-hidden">
                <table className="w-full text-[11px] text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[9px] font-bold">
                    <tr>
                      <th className="px-3 py-2">Nama Mekanik</th>
                      <th className="px-3 py-2 text-center">SPK Selesai</th>
                      <th className="px-3 py-2 text-center">Rerata Durasi</th>
                      <th className="px-3 py-2 text-right">Skor KPI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150">
                    {commonRailStats.map((stat) => (
                      <tr key={stat.id} className="hover:bg-slate-50/50">
                        <td className="px-3 py-2 font-bold text-slate-800">{stat.name}</td>
                        <td className="px-3 py-2 text-center font-bold font-mono">{stat.completedCount} Unit</td>
                        <td className="px-3 py-2 text-center font-mono text-slate-600">
                          {stat.completedCount > 0 ? formatAvgTime(stat.avgSeconds) : 'N/A'}
                        </td>
                        <td className="px-3 py-2 text-right font-black font-mono text-purple-600 bg-purple-50/20">{stat.kpiScore} / 100</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-450 italic text-xs">Belum ada mekanik Common Rail aktif.</div>
          )}
        </section>

      </div>

      {/* 3. Damage Distribution & Stock Planning */}
      <section className="bg-white rounded-lg shadow-sm border border-slate-200 p-5 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 -mx-5 -mt-5 flex justify-between items-center mb-4">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Package className="w-4 h-4 text-rose-600" />
            C. Analisis Kerusakan Komponen Terbanyak (Rekomendasi Stok Persediaan)
          </h3>
          <span className="text-[10px] bg-rose-50 text-rose-700 font-bold px-2 py-0.5 rounded border border-rose-100 uppercase">
            Data Crawling
          </span>
        </div>

        <div className="space-y-4">
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Crawling deskripsi log diagnosis riwayat pengerjaan secara real-time untuk memprediksi suku cadang kritis yang wajib disiapkan di gudang Indo Teknik.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3.5">
              {sortedDamages.slice(0, 3).map((kw) => (
                <div key={kw.key} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-700">{kw.label}</span>
                    <span className="font-mono text-slate-500 font-bold">
                      {kw.count} Kasus ({kw.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200 flex">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        kw.percentage > 40 ? 'bg-red-500' : kw.percentage > 20 ? 'bg-amber-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.max(3, kw.percentage)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3.5">
              {sortedDamages.slice(3).map((kw) => (
                <div key={kw.key} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-700">{kw.label}</span>
                    <span className="font-mono text-slate-500 font-bold">
                      {kw.count} Kasus ({kw.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200 flex">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        kw.percentage > 40 ? 'bg-red-500' : kw.percentage > 20 ? 'bg-amber-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.max(3, kw.percentage)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-lg text-xs text-blue-800 leading-relaxed flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <strong>Rekomendasi Pembelian Inventaris:</strong> Berdasarkan data di atas, item <strong className="text-slate-900">"{sortedDamages[0]?.label || 'Suku Cadang Teratas'}"</strong> adalah kasus kerusakan yang paling mendominasi. Tim logistik direkomendasikan meningkatkan stok aman (safety stock) suku cadang terkait sebesar <strong>15%</strong> pada siklus belanja berikutnya.
            </div>
          </div>
        </div>
      </section>

      {/* 4. Daily Archive & Trigger Section */}
      <section className="bg-white rounded-lg shadow-sm border border-slate-200 p-5 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 -mx-5 -mt-5 flex justify-between items-center mb-4">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Database className="w-4 h-4 text-blue-600" />
            D. Arsip Summary Harian Otomatis & Inventaris Kritis (Firestore)
          </h3>
          <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded border border-blue-100 uppercase">
            Scheduled Task & Database Archive
          </span>
        </div>

        <div className="space-y-6">
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Sistem ini mengintegrasikan tugas terjadwal otomatis (scheduled task) yang merekam summary aktivitas harian, produktivitas, serta status suku cadang kritis/kosong yang menghambat pengerjaan (blocked jobs) untuk disimpan di Firestore.
          </p>

          {/* Trigger Panel */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              Simulasi Pemicu Tugas Terjadwal (Manual Override)
            </h4>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-3">
              <div className="flex-1">
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Tanggal Summary</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="date"
                    value={selectedTriggerDate}
                    onChange={(e) => setSelectedTriggerDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleManualTrigger}
                  disabled={isTriggering}
                  className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-xs font-black uppercase rounded-lg shadow-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  {isTriggering ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <Database className="w-3.5 h-3.5" />
                      Picu & Simpan Summary
                    </>
                  )}
                </button>
              </div>
            </div>

            {triggerResult && (
              <div className={`mt-3 p-3 rounded-lg border text-xs leading-relaxed flex items-start gap-2 ${
                triggerResult.success 
                  ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
                  : 'bg-rose-50 border-rose-100 text-rose-800'
              }`}>
                <AlertCircle className={`w-4 h-4 shrink-0 mt-0.5 ${triggerResult.success ? 'text-emerald-600' : 'text-rose-600'}`} />
                <div>{triggerResult.message}</div>
              </div>
            )}
          </div>

          {/* History List */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-4 h-4 text-slate-500" />
              Daftar Summary Harian di Firestore ({dailySummaries.length})
            </h4>

            {isFetchingSummaries ? (
              <div className="text-center py-6 text-slate-450 italic text-xs flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
                Mengambil data dari Firestore...
              </div>
            ) : dailySummaries.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 border border-dashed border-slate-200 rounded-lg text-slate-455 italic text-xs">
                Belum ada arsip daily summary di Firestore. Gunakan tombol simulasi di atas untuk membuat summary pertama Anda!
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 font-sans">
                {dailySummaries.map((summary) => {
                  const isExpanded = expandedSummaryId === summary.id;
                  const act = summary.systemActivity || {};
                  const inv = summary.criticalInventoryStatus || {};
                  
                  return (
                    <div key={summary.id} className="border border-slate-200 rounded-lg overflow-hidden bg-white hover:border-blue-200 transition-colors">
                      {/* Summary Row Header */}
                      <div 
                        onClick={() => setExpandedSummaryId(isExpanded ? null : summary.id)}
                        className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 text-blue-600 rounded">
                            <Calendar className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-black text-slate-800 font-mono tracking-wider">{summary.date}</span>
                            <div className="text-[10px] text-slate-400 mt-0.5">Dibuat pada: {new Date(summary.createdAt).toLocaleString()}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="hidden sm:flex items-center gap-4 text-xs font-mono">
                            <span className="text-slate-500">SPK: <strong className="text-slate-800">{act.totalWorkOrders || 0}</strong></span>
                            <span className="text-emerald-600">Selesai: <strong className="font-bold">{act.completedWorkOrdersToday || 0}</strong></span>
                            <span className="text-amber-600">Suku Cadang Kosong: <strong className="font-bold">{inv.blockedWorkOrders?.length || 0}</strong></span>
                          </div>
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </div>
                      </div>

                      {/* Summary Row Body (Expanded) */}
                      {isExpanded && (
                        <div className="border-t border-slate-100 bg-slate-50/40 p-4 space-y-4 text-xs">
                          {/* Grid statistics */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="bg-white p-3 rounded border border-slate-200">
                              <span className="block text-[9px] font-black uppercase text-slate-400 tracking-wider">Total Work Order</span>
                              <strong className="text-lg font-black text-slate-800 font-mono mt-1 block">{act.totalWorkOrders || 0}</strong>
                              <div className="text-[9px] text-slate-400 mt-0.5">+{act.newWorkOrdersToday || 0} baru hari ini</div>
                            </div>
                            <div className="bg-white p-3 rounded border border-slate-200">
                              <span className="block text-[9px] font-black uppercase text-slate-400 tracking-wider">Antrean Lab</span>
                              <strong className="text-lg font-black text-slate-800 font-mono mt-1 block">{act.queueCount || 0}</strong>
                              <div className="text-[9px] text-slate-400 mt-0.5">Dikerjakan: {act.inProgressCount || 0}</div>
                            </div>
                            <div className="bg-white p-3 rounded border border-slate-200">
                              <span className="block text-[9px] font-black uppercase text-slate-400 tracking-wider">Divisi Supply Pump</span>
                              <strong className="text-lg font-black text-slate-800 font-mono mt-1 block">{act.supplyPumpCount || 0}</strong>
                              <div className="text-[9px] text-slate-400 mt-0.5">Common Rail: {act.commonRailCount || 0}</div>
                            </div>
                            <div className="bg-white p-3 rounded border border-slate-200">
                              <span className="block text-[9px] font-black uppercase text-slate-400 tracking-wider">Mekanik Aktif</span>
                              <strong className="text-lg font-black text-slate-800 font-mono mt-1 block">{act.activeMechanicsCount || 0}</strong>
                              <div className="text-[9px] text-slate-400 mt-0.5">Divisi SA: {act.saCount || 0}</div>
                            </div>
                          </div>

                          {/* Critical Inventory & Wear report */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Replaced Parts stats */}
                            <div className="bg-white p-3.5 rounded-lg border border-slate-200">
                              <h5 className="text-[10px] font-black uppercase text-rose-700 tracking-wider mb-2 flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                                <Package className="w-3.5 h-3.5" />
                                Konsumsi Suku Cadang Terdiagnosis (Wear Patterns)
                              </h5>
                              <div className="space-y-2 text-[11px]">
                                <div className="flex justify-between items-center py-0.5">
                                  <span className="text-slate-600 font-medium">Nozzle Tip Aus (Worn)</span>
                                  <span className="font-bold font-mono text-slate-800">{inv.nozzleTipWornCount || 0} kali</span>
                                </div>
                                <div className="flex justify-between items-center py-0.5">
                                  <span className="text-slate-600 font-medium">Nozzle Tip Macet (Jammed)</span>
                                  <span className="font-bold font-mono text-slate-800">{inv.nozzleTipJammedCount || 0} kali</span>
                                </div>
                                <div className="flex justify-between items-center py-0.5">
                                  <span className="text-slate-600 font-medium">Valve Plate Tergores (Scratched)</span>
                                  <span className="font-bold font-mono text-slate-800">{inv.valveScratchedCount || 0} kali</span>
                                </div>
                                <div className="flex justify-between items-center py-0.5">
                                  <span className="text-slate-600 font-medium">Valve Bocor (Leak)</span>
                                  <span className="font-bold font-mono text-slate-800">{inv.valveLeakCount || 0} kali</span>
                                </div>
                                <div className="flex justify-between items-center py-0.5">
                                  <span className="text-slate-600 font-medium">Shim Adjust Ganjal Celah</span>
                                  <span className="font-bold font-mono text-slate-800">{inv.shimAdjustedCount || 0} kali</span>
                                </div>
                                <div className="flex justify-between items-center py-0.5">
                                  <span className="text-slate-600 font-medium">Seal Kit Diganti</span>
                                  <span className="font-bold font-mono text-slate-800">{inv.sealKitReplacedCount || 0} kali</span>
                                </div>
                              </div>
                            </div>

                            {/* Blocked Jobs list */}
                            <div className="bg-white p-3.5 rounded-lg border border-slate-200 flex flex-col justify-between">
                              <div>
                                <h5 className="text-[10px] font-black uppercase text-amber-700 tracking-wider mb-2 flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                                  <AlertCircle className="w-3.5 h-3.5" />
                                  Blocked Jobs (Menunggu Suku Cadang Kosong)
                                </h5>
                                {(!inv.blockedWorkOrders || inv.blockedWorkOrders.length === 0) ? (
                                  <p className="text-[10.5px] text-slate-450 italic py-4 text-center">Tidak ada antrean tertahan karena suku cadang kosong.</p>
                                ) : (
                                  <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                                    {inv.blockedWorkOrders.map((wo: any, idx: number) => (
                                      <div key={idx} className="p-2 bg-amber-50/40 border border-amber-100/60 rounded text-[10.5px]">
                                        <div className="flex justify-between font-black">
                                          <span className="text-slate-800">SPK {wo.id}</span>
                                          <span className="text-amber-700 uppercase tracking-tighter text-[9px] px-1.5 bg-amber-100 rounded border border-amber-200">
                                            {wo.blockedReason === 'WAITING_PARTS' ? 'Menunggu Part' : 'Kerusakan Tersembunyi'}
                                          </span>
                                        </div>
                                        <div className="text-slate-600 mt-1 font-medium">{wo.customerName} • {wo.vehicleBrand} ({wo.plateNumber})</div>
                                        <div className="text-[9.5px] text-slate-400 mt-0.5 uppercase tracking-wide font-bold">Divisi: {wo.currentDivision}</div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

    </div>
  );
};

export default ManagerAnalytics;
