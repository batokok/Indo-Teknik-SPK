import React, { useState, useMemo } from 'react';
import { useApp } from '../../store/AppContext';
import { GateEntry, GateExitDocument, HandoverDocument } from '../../types';
import { BarangMasukModal } from './BarangMasukModal';
import { BarangKeluarModal } from './BarangKeluarModal';
import { SerahTerimaModal } from './SerahTerimaModal';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  CheckCircle2, 
  Printer, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Ban, 
  Calendar, 
  User, 
  Package, 
  FileText, 
  ShieldCheck, 
  Clock, 
  AlertCircle,
  Car,
  Layers,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type TabType = 'ALL' | 'MASUK' | 'KELUAR' | 'SERAH_TERIMA';

export const GateControlDashboard: React.FC = () => {
  const { 
    currentUser, 
    gateEntries, 
    gateExitDocuments, 
    handoverDocuments, 
    cancelGateEntry, 
    cancelGateExitDocument, 
    cancelHandoverDocument,
    setPrintGateDoc 
  } = useApp();

  const [activeTab, setActiveTab] = useState<TabType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'TODAY' | 'WEEK' | 'MONTH' | 'ALL'>('TODAY');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'CANCELLED'>('ALL');

  // Modals state
  const [isBarangMasukOpen, setIsBarangMasukOpen] = useState(false);
  const [isBarangKeluarOpen, setIsBarangKeluarOpen] = useState(false);
  const [isSerahTerimaOpen, setIsSerahTerimaOpen] = useState(false);

  // Pre-fill state for Surat Jalan from Serah Terima
  const [suratJalanInitialValues, setSuratJalanInitialValues] = useState<Partial<GateExitDocument> | undefined>(undefined);

  // Detail Modal State
  const [viewDetailDoc, setViewDetailDoc] = useState<{
    type: 'BM' | 'SJ' | 'ST';
    doc: GateEntry | GateExitDocument | HandoverDocument;
  } | null>(null);

  // Cancel Modal State
  const [cancelTarget, setCancelTarget] = useState<{
    type: 'BM' | 'SJ' | 'ST';
    id: string;
    label: string;
  } | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Filter items by date range
  const filterByDate = (dateStr: string) => {
    if (dateFilter === 'ALL') return true;
    if (dateFilter === 'TODAY') return dateStr === todayStr;
    const docDate = new Date(dateStr).getTime();
    const now = new Date().getTime();
    if (dateFilter === 'WEEK') {
      const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
      return docDate >= sevenDaysAgo;
    }
    if (dateFilter === 'MONTH') {
      const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
      return docDate >= thirtyDaysAgo;
    }
    return true;
  };

  // Today counters
  const todayMetrics = useMemo(() => {
    const todayBM = gateEntries.filter(e => e.date === todayStr && e.status !== 'CANCELLED').length;
    const todaySJ = gateExitDocuments.filter(e => e.date === todayStr && e.status !== 'CANCELLED').length;
    const todayST = handoverDocuments.filter(e => e.date === todayStr && e.status !== 'CANCELLED').length;
    const todayCancelled = 
      gateEntries.filter(e => e.date === todayStr && e.status === 'CANCELLED').length +
      gateExitDocuments.filter(e => e.date === todayStr && e.status === 'CANCELLED').length +
      handoverDocuments.filter(e => e.date === todayStr && e.status === 'CANCELLED').length;

    return { todayBM, todaySJ, todayST, todayCancelled };
  }, [gateEntries, gateExitDocuments, handoverDocuments, todayStr]);

  // Unified list for display
  const filteredDocuments = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    const bmList = gateEntries.map(e => ({
      type: 'BM' as const,
      id: e.id,
      date: e.date,
      time: e.time,
      createdAt: e.createdAt,
      bringer: e.bringerName,
      customer: e.customerName || '-',
      details: e.itemsDescription,
      plateNumber: e.vehiclePlateNumber || '',
      creator: e.createdBy,
      status: e.status,
      ref: e.entryType,
      raw: e
    }));

    const sjList = gateExitDocuments.map(e => ({
      type: 'SJ' as const,
      id: e.id,
      date: e.date,
      time: e.time,
      createdAt: e.createdAt,
      bringer: e.bringerName,
      customer: e.customerName || '-',
      details: e.items.map(i => `${i.name} (${i.qty} ${i.unit})`).join(', '),
      plateNumber: e.driverPlateNumber || '',
      creator: e.createdBy,
      status: e.status === 'CANCELLED' ? 'CANCELLED' : 'COMPLETED',
      ref: e.referenceNumber || e.exitType,
      raw: e
    }));

    const stList = handoverDocuments.map(e => ({
      type: 'ST' as const,
      id: e.id,
      date: e.date,
      time: e.time,
      createdAt: e.createdAt,
      bringer: e.recipientName,
      customer: e.customerName,
      details: e.items.map(i => `${i.name} (${i.qty} ${i.unit})`).join(', '),
      plateNumber: e.vehiclePlateNumber || '',
      creator: e.createdBy,
      status: e.status,
      ref: e.relatedWOId || 'BAST',
      raw: e
    }));

    let all: typeof bmList = [];
    if (activeTab === 'ALL') {
      all = [...bmList, ...sjList, ...stList];
    } else if (activeTab === 'MASUK') {
      all = bmList;
    } else if (activeTab === 'KELUAR') {
      all = sjList;
    } else if (activeTab === 'SERAH_TERIMA') {
      all = stList;
    }

    return all.filter(item => {
      // Date filter
      if (!filterByDate(item.date)) return false;

      // Status filter
      if (statusFilter === 'ACTIVE' && item.status === 'CANCELLED') return false;
      if (statusFilter === 'CANCELLED' && item.status !== 'CANCELLED') return false;

      // Search query
      if (!query) return true;
      return (
        item.id.toLowerCase().includes(query) ||
        item.bringer.toLowerCase().includes(query) ||
        item.customer.toLowerCase().includes(query) ||
        item.details.toLowerCase().includes(query) ||
        item.plateNumber.toLowerCase().includes(query) ||
        item.creator.toLowerCase().includes(query) ||
        item.ref.toLowerCase().includes(query)
      );
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [gateEntries, gateExitDocuments, handoverDocuments, activeTab, searchQuery, dateFilter, statusFilter]);

  const handleOpenForwardSuratJalan = (handoverDoc: HandoverDocument) => {
    setSuratJalanInitialValues({
      customerName: handoverDoc.customerName,
      customerId: handoverDoc.customerId,
      bringerName: handoverDoc.recipientName,
      driverPlateNumber: handoverDoc.vehiclePlateNumber,
      exitType: 'NORMAL_SALES',
      refType: 'HANDOVER',
      referenceNumber: handoverDoc.id,
      handoverId: handoverDoc.id,
      items: handoverDoc.items.map((it, idx) => ({
        id: String(idx + 1),
        name: it.name,
        qty: it.qty,
        unit: it.unit,
        notes: it.notes || ''
      })),
      notes: `Diterbitkan dari Berita Acara Serah Terima No. ${handoverDoc.id}`
    });
    setIsSerahTerimaOpen(false);
    setIsBarangKeluarOpen(true);
  };

  const handleExecuteCancel = async () => {
    if (!cancelTarget || !cancelReason.trim()) return;
    try {
      setIsCancelling(true);
      if (cancelTarget.type === 'BM') {
        await cancelGateEntry(cancelTarget.id, cancelReason.trim());
      } else if (cancelTarget.type === 'SJ') {
        await cancelGateExitDocument(cancelTarget.id, cancelReason.trim());
      } else if (cancelTarget.type === 'ST') {
        await cancelHandoverDocument(cancelTarget.id, cancelReason.trim());
      }
      setCancelTarget(null);
      setCancelReason('');
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Banner / User Welcome */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Gate & Logistik Workshop
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {currentUser?.role === 'BASIC' ? 'Basic User Mode' : currentUser?.role}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
              Terminal Gate Control
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Pencatatan resmi barang masuk, penerbitan surat jalan keluar & serah terima unit workshop.
            </p>
          </div>
        </div>

        {/* Current Date & Active Operator */}
        <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-800 px-4 py-2.5 rounded-2xl self-start md:self-auto shadow-inner">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <div className="text-xs">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Operator Bertugas</span>
            <span className="font-bold text-slate-100">{currentUser?.name}</span>
          </div>
        </div>
      </div>

      {/* Big Action Buttons (Elderly & Touch Friendly Launcher) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Button 1: Barang Masuk */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsBarangMasukOpen(true)}
          className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-700/50 hover:border-emerald-500 text-left flex flex-col justify-between shadow-xl transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <ArrowDownLeft className="w-6 h-6" />
            </div>
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Registrasi Masuk
            </span>
          </div>
          <div>
            <h3 className="text-lg font-black text-white uppercase tracking-wide flex items-center gap-2">
              <span>+ Input Barang Masuk</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Catat komponen, kendaraan, atau sparepart yang dibawa konsumen / ekspedisi masuk workshop.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-emerald-400 font-bold">
            <span>Buka Formulir</span>
            <Plus className="w-4 h-4" />
          </div>
        </motion.button>

        {/* Button 2: Surat Jalan / Keluar */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setSuratJalanInitialValues(undefined);
            setIsBarangKeluarOpen(true);
          }}
          className="p-5 rounded-2xl bg-gradient-to-br from-blue-950/80 via-slate-900 to-slate-900 border border-blue-700/50 hover:border-blue-500 text-left flex flex-col justify-between shadow-xl transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
              <ArrowUpRight className="w-6 h-6" />
            </div>
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Surat Jalan
            </span>
          </div>
          <div>
            <h3 className="text-lg font-black text-white uppercase tracking-wide flex items-center gap-2">
              <span>+ Terbitkan Surat Jalan</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Keluarkan barang / unit selesai servis dengan verifikasi pengemudi dan pos satpam.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-blue-400 font-bold">
            <span>Buka Formulir</span>
            <Plus className="w-4 h-4" />
          </div>
        </motion.button>

        {/* Button 3: Serah Terima (BAST) */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsSerahTerimaOpen(true)}
          className="p-5 rounded-2xl bg-gradient-to-br from-teal-950/80 via-slate-900 to-slate-900 border border-teal-700/50 hover:border-teal-500 text-left flex flex-col justify-between shadow-xl transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30">
              Berita Acara (BAST)
            </span>
          </div>
          <div>
            <h3 className="text-lg font-black text-white uppercase tracking-wide flex items-center gap-2">
              <span>+ Buat Serah Terima</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Terbitkan Berita Acara Serah Terima unit & kalibrasi lengkap dengan klausul garansi.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-teal-400 font-bold">
            <span>Buka Formulir</span>
            <Plus className="w-4 h-4" />
          </div>
        </motion.button>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Barang Masuk Hari Ini</span>
            <span className="text-2xl font-black text-emerald-400 font-mono mt-1 block">{todayMetrics.todayBM}</span>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Surat Jalan Hari Ini</span>
            <span className="text-2xl font-black text-blue-400 font-mono mt-1 block">{todayMetrics.todaySJ}</span>
          </div>
          <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Serah Terima Hari Ini</span>
            <span className="text-2xl font-black text-teal-400 font-mono mt-1 block">{todayMetrics.todayST}</span>
          </div>
          <div className="p-3 bg-teal-500/10 rounded-xl text-teal-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Dibatalkan Hari Ini</span>
            <span className="text-2xl font-black text-rose-400 font-mono mt-1 block">{todayMetrics.todayCancelled}</span>
          </div>
          <div className="p-3 bg-rose-500/10 rounded-xl text-rose-400">
            <Ban className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Table & Filter Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl overflow-hidden">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 px-4 pt-3 overflow-x-auto gap-2 bg-slate-950/60 relative">
          {[
            { key: 'ALL', label: 'Semua Dokumen', icon: Layers, color: 'text-blue-400', lineBg: 'bg-blue-500' },
            { key: 'MASUK', label: 'Barang Masuk (BM)', icon: ArrowDownLeft, color: 'text-emerald-400', lineBg: 'bg-emerald-500' },
            { key: 'KELUAR', label: 'Surat Jalan (SJ)', icon: ArrowUpRight, color: 'text-blue-400', lineBg: 'bg-blue-500' },
            { key: 'SERAH_TERIMA', label: 'Serah Terima (ST)', icon: CheckCircle2, color: 'text-teal-400', lineBg: 'bg-teal-500' },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key as any)}
                className={`relative px-4 py-2.5 rounded-t-xl text-xs font-black uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? `${tab.color} bg-slate-900`
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="gateActiveTabIndicator"
                    className={`absolute bottom-0 left-0 right-0 h-0.5 ${tab.lineBg}`}
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Filter Toolbar */}
        <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari ID, Nama Pembawa, Konsumen, Plat, Rincian..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Date & Status Selectors */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as any)}
                className="bg-transparent text-xs font-bold text-slate-200 outline-none cursor-pointer"
              >
                <option value="TODAY" className="bg-slate-900">Hari Ini</option>
                <option value="WEEK" className="bg-slate-900">7 Hari Terakhir</option>
                <option value="MONTH" className="bg-slate-900">Bulan Ini</option>
                <option value="ALL" className="bg-slate-900">Semua Periode</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-transparent text-xs font-bold text-slate-200 outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-slate-900">Semua Status</option>
                <option value="ACTIVE" className="bg-slate-900">Aktif Saja</option>
                <option value="CANCELLED" className="bg-slate-900">Dibatalkan</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          {filteredDocuments.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-3">
              <Package className="w-12 h-12 mx-auto text-slate-600 opacity-50" />
              <p className="text-sm font-bold text-slate-400">Tidak ada dokumen yang sesuai dengan filter.</p>
              <p className="text-xs text-slate-600">Silakan ubah pencarian atau gunakan tombol diatas untuk membuat dokumen baru.</p>
            </div>
          ) : (
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  <th className="p-3.5 pl-5">Tipe & No. Dokumen</th>
                  <th className="p-3.5">Waktu</th>
                  <th className="p-3.5">Pembawa / Sopir</th>
                  <th className="p-3.5">Konsumen</th>
                  <th className="p-3.5">Rincian Barang</th>
                  <th className="p-3.5">Petugas</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 pr-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredDocuments.map((item) => {
                  const isCancelled = item.status === 'CANCELLED';

                  return (
                    <tr 
                      key={`${item.type}-${item.id}`}
                      className={`hover:bg-slate-850/50 transition-colors ${
                        isCancelled ? 'opacity-60 bg-rose-950/10' : ''
                      }`}
                    >
                      {/* Tipe & ID */}
                      <td className="p-3.5 pl-5">
                        <div className="flex items-center gap-2">
                          {item.type === 'BM' && (
                            <span className="w-6 h-6 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                              BM
                            </span>
                          )}
                          {item.type === 'SJ' && (
                            <span className="w-6 h-6 rounded bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-[10px]">
                              SJ
                            </span>
                          )}
                          {item.type === 'ST' && (
                            <span className="w-6 h-6 rounded bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-[10px]">
                              ST
                            </span>
                          )}
                          <div>
                            <span className="font-mono font-bold text-white block">{item.id}</span>
                            {item.plateNumber && (
                              <span className="text-[10px] font-mono font-bold text-amber-300 block">
                                {item.plateNumber}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Waktu */}
                      <td className="p-3.5 font-mono text-[11px]">
                        <span className="text-slate-300 block">{item.date}</span>
                        <span className="text-slate-500 text-[10px] block">{item.time}</span>
                      </td>

                      {/* Pembawa */}
                      <td className="p-3.5 font-bold text-white">
                        {item.bringer}
                      </td>

                      {/* Konsumen */}
                      <td className="p-3.5 text-slate-300">
                        {item.customer}
                      </td>

                      {/* Rincian */}
                      <td className="p-3.5 max-w-xs truncate text-slate-300">
                        {item.details}
                      </td>

                      {/* Petugas */}
                      <td className="p-3.5 text-[11px] text-slate-400">
                        {item.creator}
                      </td>

                      {/* Status */}
                      <td className="p-3.5">
                        {isCancelled ? (
                          <span className="px-2 py-0.5 rounded text-[9.5px] font-black uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            Dibatalkan
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[9.5px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Aktif
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 pr-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Print Button */}
                          <button
                            type="button"
                            onClick={() => {
                              if (item.type === 'BM') setPrintGateDoc({ type: 'BARANG_MASUK', data: item.raw as GateEntry });
                              if (item.type === 'SJ') setPrintGateDoc({ type: 'SURAT_JALAN', data: item.raw as GateExitDocument });
                              if (item.type === 'ST') setPrintGateDoc({ type: 'SERAH_TERIMA', data: item.raw as HandoverDocument });
                            }}
                            className="h-8 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                            title="Cetak Dokumen"
                          >
                            <Printer className="w-3.5 h-3.5 text-blue-400" />
                            <span className="hidden sm:inline">Cetak</span>
                          </button>

                          {/* If ST: Button to forward to Surat Jalan */}
                          {item.type === 'ST' && !isCancelled && (
                            <button
                              type="button"
                              onClick={() => handleOpenForwardSuratJalan(item.raw as HandoverDocument)}
                              className="h-8 px-2.5 bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/40 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                              title="Buat Surat Jalan dari BAST ini"
                            >
                              <ArrowRight className="w-3.5 h-3.5" />
                              <span className="hidden md:inline">Surat Jalan</span>
                            </button>
                          )}

                          {/* Cancel Button */}
                          {!isCancelled && (
                            <button
                              type="button"
                              onClick={() => setCancelTarget({
                                type: item.type,
                                id: item.id,
                                label: `${item.id} (${item.bringer})`
                              })}
                              className="h-8 px-2 bg-slate-900 border border-slate-700 hover:border-rose-700 text-rose-400 hover:bg-rose-950/60 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center cursor-pointer"
                              title="Batalkan Dokumen"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modals */}
      <BarangMasukModal
        isOpen={isBarangMasukOpen}
        onClose={() => setIsBarangMasukOpen(false)}
      />

      <BarangKeluarModal
        isOpen={isBarangKeluarOpen}
        onClose={() => {
          setIsBarangKeluarOpen(false);
          setSuratJalanInitialValues(undefined);
        }}
        initialValues={suratJalanInitialValues}
      />

      <SerahTerimaModal
        isOpen={isSerahTerimaOpen}
        onClose={() => setIsSerahTerimaOpen(false)}
        onForwardToSuratJalan={handleOpenForwardSuratJalan}
      />

      {/* Cancel Confirmation Modal */}
      <AnimatePresence>
        {cancelTarget && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-rose-700/60 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3 text-rose-400">
                <div className="p-2 bg-rose-500/20 rounded-xl border border-rose-500/40">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-black uppercase text-white tracking-wide">
                    Batalkan Dokumen Gate
                  </h4>
                  <p className="text-xs text-slate-400 font-mono">{cancelTarget.label}</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Dokumen yang dibatalkan akan ditandai di histori audit trail. Silakan masukkan alasan pembatalan dokumen secara jelas:
              </p>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                  Alasan Pembatalan <span className="text-red-400">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Contoh: Salah input nomor polisi / Pembawa batal mengeluarkan barang..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors custom-scrollbar"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={isCancelling}
                  onClick={() => {
                    setCancelTarget(null);
                    setCancelReason('');
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase rounded-xl cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  disabled={isCancelling || !cancelReason.trim()}
                  onClick={handleExecuteCancel}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-black uppercase rounded-xl flex items-center gap-2 cursor-pointer shadow-lg shadow-rose-950/50"
                >
                  {isCancelling ? 'Memproses...' : 'Konfirmasi Pembatalan'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
