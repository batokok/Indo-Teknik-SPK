import React, { useState } from 'react';
import { WorkOrder, User } from '../types';
import { 
  Printer, 
  Car, 
  Archive, 
  Search, 
  TrendingUp, 
  Clock, 
  Download, 
  History, 
  BarChart2, 
  ArrowRight, 
  FileSpreadsheet,
  Check,
  Wrench
} from 'lucide-react';

const formatRupiah = (value: string | number | undefined | null): string => {
  if (value === undefined || value === null) return '';
  const str = String(value).replace(/\D/g, '');
  if (!str) return '';
  const num = parseInt(str, 10);
  return 'Rp ' + num.toLocaleString('id-ID');
};

interface SADashboardArchiveAndHistoryProps {
  workOrders: WorkOrder[];
  users: User[];
  updateWorkOrder: (id: string, data: Partial<WorkOrder>) => void;
  setPrintWO: (wo: WorkOrder) => void;
}

export const SADashboardArchiveAndHistory: React.FC<SADashboardArchiveAndHistoryProps> = ({
  workOrders,
  users,
  updateWorkOrder,
  setPrintWO
}) => {
  const [archiveSubTab, setArchiveSubTab] = useState<'LIFETIME_HISTORY' | 'ADMIN_ARCHIVE'>('LIFETIME_HISTORY');

  // Admin & Archive Sub-states
  const [adminYearFilter, setAdminYearFilter] = useState<string>('ALL');
  const [adminMonthFilter, setAdminMonthFilter] = useState<string>('ALL');
  const [adminSearchQuery, setAdminSearchQuery] = useState<string>('');
  const [adminStatusFilter, setAdminStatusFilter] = useState<string>('ALL');
  const [adminDateRange, setAdminDateRange] = useState<'ALL' | 'TODAY' | '7_DAYS' | '30_DAYS' | 'THIS_YEAR'>('ALL');
  const [selectedAdminWO, setSelectedAdminWO] = useState<string | null>(null);

  // Vehicle History Sub-states
  const [historySearchQuery, setHistorySearchQuery] = useState<string>('');
  const [selectedVehiclePlate, setSelectedVehiclePlate] = useState<string>('');
  const [viewingHistoryDetailWO, setViewingHistoryDetailWO] = useState<string | null>(null);

  const getHistoricalWorkOrders = (pn: string) => {
    if (!pn || pn.trim().length < 3) return [];
    const q = pn.toLowerCase().trim();
    return workOrders.filter(wo => {
      // Look in part logs
      const hasPartLogs = wo.partLogs?.some(log => log.notes?.toLowerCase().includes(q) || log.findings?.toLowerCase().includes(q));
      // Look in loose parts
      const hasLooseParts = wo.looseParts?.some(lp => lp.partNumber?.toLowerCase().includes(q) || lp.description?.toLowerCase().includes(q));
      return hasPartLogs || hasLooseParts;
    });
  };

  return (
    <div className="bg-slate-900 text-white p-5 rounded-xl shadow-md border border-slate-700 mt-6 space-y-4">
      <div>
        <h3 className="text-xs font-black uppercase tracking-wider text-purple-400 flex items-center">
          <span className="mr-2">📚</span>
          <span>ARSIP DOKUMENTASI & BUKU SERVIS LIFETIME KENDARAAN</span>
        </h3>
        <p className="text-[10px] text-slate-400 mt-1">
          Lihat riwayat perbaikan kendaraan seumur hidup dan kelola arsip dokumen administrasi unit yang selesai.
        </p>
      </div>

      {/* Navigation Tabs for separate Archive vs Lifetime History */}
      <div className="flex border-b border-slate-800 mb-3 gap-1 overflow-x-auto custom-scrollbar">
        <button
          type="button"
          onClick={() => setArchiveSubTab('LIFETIME_HISTORY')}
          className={`px-3 py-2 text-xs font-black rounded-t-lg transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            archiveSubTab === 'LIFETIME_HISTORY' 
              ? 'bg-slate-800 text-purple-400 border-t-2 border-purple-500' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>🚗 Buku Servis Lifetime Kendaraan</span>
          <span className="text-[10px] bg-slate-750 text-slate-300 px-1.5 py-0.5 rounded-full font-mono font-bold">
            {new Set(workOrders.map(w => w.plateNumber.toUpperCase().trim())).size} Unit
          </span>
        </button>

        <button
          type="button"
          onClick={() => setArchiveSubTab('ADMIN_ARCHIVE')}
          className={`px-3 py-2 text-xs font-black rounded-t-lg transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            archiveSubTab === 'ADMIN_ARCHIVE' 
              ? 'bg-slate-800 text-emerald-400 border-t-2 border-emerald-500' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Archive className="w-3.5 h-3.5" />
          <span>🏛️ Administrasi & Laporan Arsip</span>
          <span className="text-[10px] bg-slate-750 text-slate-300 px-1.5 py-0.5 rounded-full font-mono font-bold">
            {workOrders.filter(w => w.isArchived === true).length}
          </span>
        </button>
      </div>

      {archiveSubTab === 'ADMIN_ARCHIVE' && (
        <div className="space-y-4">
          {/* Year & Month options populated dynamically */}
          {(() => {
            const years = Array.from(new Set(workOrders.map(w => {
              try {
                return new Date(w.createdAt || Date.now()).getFullYear().toString();
              } catch {
                return new Date().getFullYear().toString();
              }
            }))).sort().reverse();

            const months = [
              {v:'ALL', l:'Semua Bulan'}, {v:'01', l:'Januari'}, {v:'02', l:'Februari'}, {v:'03', l:'Maret'},
              {v:'04', l:'April'}, {v:'05', l:'Mei'}, {v:'06', l:'Juni'}, {v:'07', l:'Juli'},
              {v:'08', l:'Agustus'}, {v:'09', l:'September'}, {v:'10', l:'Oktober'}, {v:'11', l:'November'},
              {v:'12', l:'Desember'}
            ];

            // Filtering logic
            const adminFilteredWOs = workOrders.filter(wo => {
              // Search query
              if (adminSearchQuery.trim()) {
                const q = adminSearchQuery.toLowerCase();
                const matchId = wo.id.toLowerCase().includes(q);
                const matchCust = wo.customerName.toLowerCase().includes(q);
                const matchPlate = wo.plateNumber.toLowerCase().includes(q);
                const matchBrand = wo.vehicleBrand.toLowerCase().includes(q);
                const matchSA = users.find(u => u.id === wo.mechanicId)?.name.toLowerCase().includes(q);
                if (!matchId && !matchCust && !matchPlate && !matchBrand && !matchSA) return false;
              }
              // Status filter
              if (adminStatusFilter !== 'ALL') {
                if (adminStatusFilter === 'ARCHIVED' && !wo.isArchived) return false;
                if (adminStatusFilter === 'ACTIVE' && wo.isArchived) return false;
                if (adminStatusFilter !== 'ARCHIVED' && adminStatusFilter !== 'ACTIVE' && wo.status !== adminStatusFilter) return false;
              } else {
                // By default, admin view shows archived items, but can show all
                if (!wo.isArchived) return false;
              }
              // Year filter
              if (adminYearFilter !== 'ALL') {
                try {
                  const yr = new Date(wo.createdAt || Date.now()).getFullYear().toString();
                  if (yr !== adminYearFilter) return false;
                } catch { return false; }
              }
              // Month filter
              if (adminMonthFilter !== 'ALL') {
                try {
                  const mn = (new Date(wo.createdAt || Date.now()).getMonth() + 1).toString().padStart(2, '0');
                  if (mn !== adminMonthFilter) return false;
                } catch { return false; }
              }
              // Date range filter
              if (adminDateRange !== 'ALL') {
                try {
                  const woDate = new Date(wo.createdAt || Date.now());
                  const now = new Date();
                  if (adminDateRange === 'TODAY') {
                    if (woDate.toDateString() !== now.toDateString()) return false;
                  } else if (adminDateRange === '7_DAYS') {
                    const diffDays = Math.ceil(Math.abs(now.getTime() - woDate.getTime()) / (1000 * 60 * 60 * 24));
                    if (diffDays > 7) return false;
                  } else if (adminDateRange === '30_DAYS') {
                    const diffDays = Math.ceil(Math.abs(now.getTime() - woDate.getTime()) / (1000 * 60 * 60 * 24));
                    if (diffDays > 30) return false;
                  } else if (adminDateRange === 'THIS_YEAR') {
                    if (woDate.getFullYear() !== now.getFullYear()) return false;
                  }
                } catch { return false; }
              }
              return true;
            });

            // Stats calculation
            const totalEstIncome = adminFilteredWOs.reduce((acc, wo) => {
              const woTotal = wo.todoActions?.reduce((sum, act) => {
                const numStr = String(act.estimasiHargaMin || act.estimasiHarga || '').replace(/\D/g, '');
                const numVal = parseInt(numStr, 10);
                return sum + (isNaN(numVal) ? 0 : numVal);
              }, 0) || 0;
              return acc + woTotal;
            }, 0);

            const completedCount = adminFilteredWOs.filter(w => w.status === 'COMPLETED').length;
            const completionRate = adminFilteredWOs.length > 0 
              ? Math.round((completedCount / adminFilteredWOs.length) * 100) 
              : 0;

            // Helper for CSV export
            const handleExportCSV = () => {
              const headers = [
                'WO ID', 'Tanggal Intake', 'Nama Pelanggan', 'WhatsApp', 'No. Plat', 'Merek Kendaraan', 
                'Odometer', 'SA / Pembuat', 'Status Kerja', 'Prioritas', 'Alur Divisi', 'Jumlah Injektor',
                'Part Nozzle Tip Jammed', 'Part Nozzle Tip Worn', 'Part Valve Scratched', 'Part Valve Leak', 'Notes Mekanik'
              ];
              
              const rows = adminFilteredWOs.map(wo => {
                const divisionFlowStr = wo.divisionFlow?.join(' -> ') || '';
                const assignedMech = users.find(u => u.id === wo.mechanicId)?.name || 'Queue';
                const totalPartLogs = wo.partLogs?.length || 0;
                const nozzleTipJammedCount = wo.partLogs?.filter(l => l.nozzleTipJammed).length || 0;
                const nozzleTipWornCount = wo.partLogs?.filter(l => l.nozzleTipWorn).length || 0;
                const valveScratchedCount = wo.partLogs?.filter(l => l.valveScratched).length || 0;
                const valveLeakCount = wo.partLogs?.filter(l => l.valveLeak).length || 0;
                const mechanicNotes = wo.partLogs?.map(l => l.notes).filter(Boolean).join('; ') || '';

                return [
                  wo.id,
                  wo.intakeDate || wo.createdAt,
                  `"${wo.customerName.replace(/"/g, '""')}"`,
                  `"${wo.customerPhone}"`,
                  `"${wo.plateNumber}"`,
                  `"${wo.vehicleBrand.replace(/"/g, '""')}"`,
                  `"${wo.odometer}"`,
                  `"${assignedMech}"`,
                  wo.status,
                  wo.priority === 1 ? 'Urgent' : wo.priority === 2 ? 'Booking' : 'Regular',
                  `"${divisionFlowStr}"`,
                  totalPartLogs,
                  nozzleTipJammedCount,
                  nozzleTipWornCount,
                  valveScratchedCount,
                  valveLeakCount,
                  `"${mechanicNotes.replace(/"/g, '""')}"`
                ];
              });
              
              const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
              const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.setAttribute('href', url);
              link.setAttribute('download', `itech_workshop_export_${new Date().toISOString().slice(0,10)}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            };

            return (
              <div className="space-y-4">
                {/* Administrative Dashboard Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="bg-slate-850 p-3 rounded-lg border border-slate-800 flex flex-col justify-between">
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                      <BarChart2 className="w-3 h-3 text-blue-400" />
                      Total WO Terpilih
                    </span>
                    <span className="text-xl font-bold mt-1 text-slate-100">{adminFilteredWOs.length} Unit</span>
                    <span className="text-[8px] text-slate-500 mt-0.5 font-mono">Berdasarkan filter administrasi aktif</span>
                  </div>

                  <div className="bg-slate-850 p-3 rounded-lg border border-slate-800 flex flex-col justify-between">
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                      <Check className="w-3 h-3 text-emerald-400" />
                      Penyelesaian Selesai
                    </span>
                    <span className="text-xl font-bold mt-1 text-emerald-400">{completedCount} Unit ({completionRate}%)</span>
                    <span className="text-[8px] text-slate-500 mt-0.5 font-mono">Status COMPLETED / Siap QC</span>
                  </div>

                  <div className="bg-slate-850 p-3 rounded-lg border border-slate-800 flex flex-col justify-between">
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                      <TrendingUp className="w-3 h-3 text-amber-400" />
                      Estimasi Nilai Transaksi
                    </span>
                    <span className="text-xl font-bold mt-1 text-amber-400">{formatRupiah(totalEstIncome)}</span>
                    <span className="text-[8px] text-slate-500 mt-0.5 font-mono">Berdasarkan total estimasi jasa & parts</span>
                  </div>

                  <div className="bg-slate-850 p-3 rounded-lg border border-slate-800 flex flex-col justify-between">
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                      Export Data Akuntansi
                    </span>
                    <button
                      type="button"
                      onClick={handleExportCSV}
                      className="mt-2 w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black rounded-lg uppercase tracking-wider flex items-center justify-center gap-1 transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download Laporan CSV
                    </button>
                  </div>
                </div>

                {/* Admin filter selectors */}
                <div className="bg-slate-850 p-3 rounded-lg border border-slate-800 grid grid-cols-1 md:grid-cols-5 gap-3 shadow-inner">
                  {/* Search */}
                  <div>
                    <span className="block text-[9px] font-black uppercase text-slate-400 mb-1">Cari Keyword:</span>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-slate-500">
                        <Search className="w-3.5 h-3.5" />
                      </span>
                      <input
                        type="text"
                        value={adminSearchQuery}
                        onChange={(e) => setAdminSearchQuery(e.target.value)}
                        placeholder="Nama, Plat, ID SPK..."
                        className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-blue-500 text-xs text-white pl-8 pr-2 py-1.5 rounded-lg focus:ring-1 focus:ring-blue-500/20 outline-none transition-all font-medium"
                      />
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <span className="block text-[9px] font-black uppercase text-slate-400 mb-1">Filter Kategori Arsip:</span>
                    <select
                      value={adminStatusFilter}
                      onChange={(e) => setAdminStatusFilter(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-xs py-1.5 px-2 rounded-lg text-slate-200 font-bold focus:outline-none"
                    >
                      <option value="ALL">🏛️ Hanya Arsip Selesai (Default)</option>
                      <option value="ACTIVE">📋 Hanya Pekerjaan Aktif</option>
                      <option value="COMPLETED">✅ Hanya COMPLETED (Arsip)</option>
                      <option value="PENDING_PARTS">🔧 Hanya PENDING PARTS (Arsip)</option>
                    </select>
                  </div>

                  {/* Year */}
                  <div>
                    <span className="block text-[9px] font-black uppercase text-slate-400 mb-1">Filter Tahun:</span>
                    <select
                      value={adminYearFilter}
                      onChange={(e) => setAdminYearFilter(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-xs py-1.5 px-2 rounded-lg text-slate-200 font-bold focus:outline-none"
                    >
                      <option value="ALL">🗓️ Semua Tahun</option>
                      {years.map(yr => (
                        <option key={yr} value={yr}>{yr}</option>
                      ))}
                    </select>
                  </div>

                  {/* Month */}
                  <div>
                    <span className="block text-[9px] font-black uppercase text-slate-400 mb-1">Filter Bulan:</span>
                    <select
                      value={adminMonthFilter}
                      onChange={(e) => setAdminMonthFilter(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-xs py-1.5 px-2 rounded-lg text-slate-200 font-bold focus:outline-none"
                    >
                      {months.map(m => (
                        <option key={m.v} value={m.v}>{m.l}</option>
                      ))}
                    </select>
                  </div>

                  {/* Date range filter */}
                  <div>
                    <span className="block text-[9px] font-black uppercase text-slate-400 mb-1">Rentang Tanggal Cepat:</span>
                    <select
                      value={adminDateRange}
                      onChange={(e) => setAdminDateRange(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 text-xs py-1.5 px-2 rounded-lg text-slate-200 font-bold focus:outline-none"
                    >
                      <option value="ALL">♾️ Semua Rentang</option>
                      <option value="TODAY">📅 Hari Ini</option>
                      <option value="7_DAYS">📅 7 Hari Terakhir</option>
                      <option value="30_DAYS">📅 30 Hari Terakhir</option>
                      <option value="THIS_YEAR">📅 Tahun Berjalan</option>
                    </select>
                  </div>
                </div>

                {/* Administrative Table */}
                {adminFilteredWOs.length === 0 ? (
                  <div className="text-center p-8 text-slate-500 text-xs bg-slate-850 rounded-lg border border-slate-800">
                    Tidak ada data administrasi/arsip yang cocok dengan filter yang Anda tentukan.
                  </div>
                ) : (
                  <div>
                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto custom-scrollbar">
                      <table className="w-full border-collapse text-left text-xs text-slate-300">
                        <thead>
                          <tr className="bg-slate-800 text-slate-400 border-b border-slate-700 font-mono text-[10px] uppercase">
                            <th className="p-2">Intake Date</th>
                            <th className="p-2">WO ID</th>
                            <th className="p-2">Pelanggan</th>
                            <th className="p-2">Plat Nomor</th>
                            <th className="p-2">Total Nilai</th>
                            <th className="p-2 text-center">Status</th>
                            <th className="p-2 text-center">Aksi Administrasi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {adminFilteredWOs.map(wo => {
                           const estTotal = wo.todoActions?.reduce((sum, act) => {
                             const numStr = String(act.estimasiHargaMin || act.estimasiHarga || '').replace(/\D/g, '');
                             const numVal = parseInt(numStr, 10);
                             return sum + (isNaN(numVal) ? 0 : numVal);
                           }, 0) || 0;

                            const isSelected = selectedAdminWO === wo.id;

                            return (
                              <React.Fragment key={wo.id}>
                                <tr className={`hover:bg-slate-800/40 transition-colors ${isSelected ? 'bg-slate-800/80' : ''}`}>
                                  <td className="p-2 font-mono text-[10px] text-slate-400">
                                    {wo.intakeDate ? wo.intakeDate.replace('T', ' ') : new Date(wo.createdAt).toLocaleDateString('id-ID')}
                                  </td>
                                  <td className="p-2 font-mono text-[11px] text-blue-400 font-black">{wo.id}</td>
                                  <td className="p-2">
                                    <div className="font-bold text-slate-200">{wo.customerName}</div>
                                    <div className="text-[9px] text-slate-500 font-mono">{wo.customerPhone}</div>
                                  </td>
                                  <td className="p-2 font-mono font-black text-slate-200 uppercase">{wo.plateNumber}</td>
                                  <td className="p-2 font-mono text-amber-400 font-bold">{formatRupiah(estTotal)}</td>
                                  <td className="p-2 text-center">
                                    <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-black ${
                                      wo.status === 'COMPLETED' ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800' :
                                      wo.status === 'IN_PROGRESS' ? 'bg-blue-950/80 text-blue-300 border border-blue-800 animate-pulse' :
                                      'bg-slate-850 text-slate-300 border border-slate-800'
                                    }`}>
                                      {wo.status}
                                    </span>
                                  </td>
                                  <td className="p-2">
                                    <div className="flex items-center justify-center gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => setPrintWO(wo)}
                                        className="px-2 py-1 bg-slate-800 border border-slate-700 hover:bg-blue-600 hover:text-white rounded text-[9px] font-mono font-bold uppercase transition-all flex items-center gap-0.5 cursor-pointer"
                                      >
                                        <Printer className="w-3 h-3" />
                                        Print
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setPrintWO(wo);
                                          setTimeout(() => {
                                            window.print();
                                          }, 150);
                                        }}
                                        className="px-2 py-1 bg-slate-800 border border-slate-700 text-emerald-400 hover:bg-emerald-600 hover:text-white rounded text-[9px] font-mono font-bold uppercase transition-all flex items-center gap-0.5 cursor-pointer"
                                        title="Unduh Surat Perintah Kerja & Lembar Inspeksi sebagai PDF"
                                      >
                                        <Download className="w-3 h-3" />
                                        PDF
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setSelectedAdminWO(isSelected ? null : wo.id)}
                                        className="px-2 py-1 bg-slate-800 border border-slate-700 text-blue-400 hover:bg-blue-600 hover:text-white rounded text-[9px] font-mono font-bold uppercase transition-all flex items-center gap-0.5 cursor-pointer"
                                      >
                                        <History className="w-3 h-3" />
                                        {isSelected ? 'Tutup Audit' : 'Audit'}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => updateWorkOrder(wo.id, { isArchived: !wo.isArchived })}
                                        className="px-2 py-1 bg-slate-800 border border-slate-700 text-yellow-400 hover:bg-yellow-600 hover:text-white rounded text-[9px] font-mono font-bold uppercase transition-all flex items-center gap-0.5 cursor-pointer"
                                      >
                                        {wo.isArchived ? 'Restore' : 'Arsip'}
                                      </button>
                                    </div>
                                  </td>
                                </tr>

                                {/* Nested Audit Timeline & Diagnostic Details block */}
                                {isSelected && (
                                  <tr>
                                    <td colSpan={7} className="p-4 bg-slate-950 border-y border-slate-800">
                                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-slate-300">
                                        
                                        {/* Col 1: Audit Log / Event Timeline */}
                                        <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-850 space-y-3">
                                          <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5" />
                                            Jejak Audit Lifecycle (Timeline)
                                          </h4>
                                          <div className="relative pl-4 border-l border-slate-800 space-y-3 py-1">
                                            {/* Node 1: Created */}
                                            <div className="relative">
                                              <span className="absolute -left-[21px] top-1 w-2 h-2 rounded-full bg-blue-500"></span>
                                              <div className="text-[10px] font-bold text-slate-200">WO Terbuka di Workshop</div>
                                              <div className="text-[8px] text-slate-500 font-mono">{wo.intakeDate || wo.createdAt}</div>
                                              <p className="text-[9px] text-slate-400 mt-0.5">SA membuat registrasi intake kendaraan standard European ISO.</p>
                                            </div>

                                            {/* Node 2: Assigned */}
                                            {wo.mechanicId && (
                                              <div className="relative">
                                                <span className="absolute -left-[21px] top-1 w-2 h-2 rounded-full bg-purple-500"></span>
                                                <div className="text-[10px] font-bold text-slate-200">Diserahkan Ke Mekanik</div>
                                                <div className="text-[9px] text-slate-400 mt-0.5">
                                                  Ditugaskan kepada teknisi spesialis diesel: <strong>{users.find(u => u.id === wo.mechanicId)?.name}</strong>
                                                </div>
                                              </div>
                                            )}

                                            {/* Node 3: Current status */}
                                            <div className="relative">
                                              <span className={`absolute -left-[21px] top-1 w-2 h-2 rounded-full ${wo.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                                              <div className="text-[10px] font-bold text-slate-200">Tahap Akhir / Status</div>
                                              <div className="text-[9px] text-slate-400 mt-0.5">
                                                Status saat ini: <strong className="text-amber-400">{wo.status}</strong>. 
                                                {wo.isArchived && " Berkas disimpan permanen dalam lemari digital pusat."}
                                              </div>
                                            </div>
                                          </div>
                                        </div>

                                        {/* Col 2: Parts Telemetry / Injector Logs */}
                                        <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-850 space-y-3">
                                          <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                                            <Wrench className="w-3.5 h-3.5" />
                                            Rekam Fisik & Telemetri Parts
                                          </h4>
                                          {wo.partLogs && wo.partLogs.length > 0 ? (
                                            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                                              {wo.partLogs.map((log) => (
                                                <div key={log.id} className="p-2 bg-slate-950 rounded border border-slate-850 text-[9px] space-y-1">
                                                  <div className="flex justify-between items-center font-bold">
                                                    <span className="text-slate-200">Nozzle Log</span>
                                                    <span className="text-slate-500 font-mono">{log.date}</span>
                                                  </div>
                                                  <div className="grid grid-cols-2 gap-1 text-[8px] text-slate-400">
                                                    <div>Nozzle Jammed: {log.nozzleTipJammed ? '🔴 Ya' : '✅ Tidak'}</div>
                                                    <div>Nozzle Worn: {log.nozzleTipWorn ? '🔴 Ya' : '✅ Tidak'}</div>
                                                    <div>Valve Scratched: {log.valveScratched ? '🔴 Ya' : '✅ Tidak'}</div>
                                                    <div>Valve Leak: {log.valveLeak ? '🔴 Ya' : '✅ Tidak'}</div>
                                                  </div>
                                                  {log.notes && (
                                                    <div className="text-[8px] italic text-slate-500 bg-slate-900 p-1 rounded mt-1 border border-slate-850">
                                                      "{log.notes}"
                                                    </div>
                                                  )}
                                                </div>
                                              ))}
                                            </div>
                                          ) : (
                                            <p className="text-[9px] text-slate-500 italic">Tidak ada catatan parts log/injektor diesel terdaftar.</p>
                                          )}
                                        </div>



                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="block md:hidden space-y-3">
                      {adminFilteredWOs.map(wo => {
                        const estTotal = wo.todoActions?.reduce((sum, act) => {
                          const numStr = String(act.estimasiHargaMin || act.estimasiHarga || '').replace(/\D/g, '');
                          const numVal = parseInt(numStr, 10);
                          return sum + (isNaN(numVal) ? 0 : numVal);
                        }, 0) || 0;

                        const isSelected = selectedAdminWO === wo.id;

                        return (
                          <div key={wo.id} className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-3 shadow-md hover:border-slate-700 transition-all">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-mono text-xs text-blue-400 font-bold">{wo.id}</span>
                              <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-black ${
                                wo.status === 'COMPLETED' ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800' :
                                wo.status === 'IN_PROGRESS' ? 'bg-blue-950/80 text-blue-300 border border-blue-800 animate-pulse' :
                                'bg-slate-850 text-slate-300 border border-slate-800'
                              }`}>
                                {wo.status}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-800/80 pt-2.5">
                              <div>
                                <span className="text-[9px] text-slate-500 uppercase font-bold block">Pelanggan</span>
                                <span className="font-bold text-slate-200 block truncate">{wo.customerName}</span>
                                <span className="text-[9px] text-slate-400 font-mono block">{wo.customerPhone}</span>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-500 uppercase font-bold block">Plat & Nilai</span>
                                <span className="font-bold text-slate-200 block truncate uppercase">{wo.plateNumber}</span>
                                <span className="text-[10px] text-amber-400 font-mono font-bold block">{formatRupiah(estTotal)}</span>
                              </div>
                            </div>

                            <div className="text-[10px] text-slate-400 border-t border-slate-800/80 pt-2 font-mono">
                              Intake: {wo.intakeDate ? wo.intakeDate.replace('T', ' ') : new Date(wo.createdAt).toLocaleDateString('id-ID')}
                            </div>

                            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800/80">
                              <button
                                type="button"
                                onClick={() => setPrintWO(wo)}
                                className="flex-1 min-w-[70px] py-1.5 bg-slate-800 border border-slate-700 text-slate-200 text-[10px] font-bold rounded uppercase transition-all flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <Printer className="w-3 h-3" />
                                <span>Print</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setPrintWO(wo);
                                  setTimeout(() => {
                                    window.print();
                                  }, 150);
                                }}
                                className="flex-1 min-w-[70px] py-1.5 bg-slate-800 border border-slate-700 text-emerald-400 text-[10px] font-bold rounded uppercase transition-all flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <Download className="w-3 h-3" />
                                <span>PDF</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setSelectedAdminWO(isSelected ? null : wo.id)}
                                className="flex-1 min-w-[70px] py-1.5 bg-slate-800 border border-slate-700 text-blue-400 text-[10px] font-bold rounded uppercase transition-all flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <History className="w-3 h-3" />
                                <span>{isSelected ? 'Tutup' : 'Audit'}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => updateWorkOrder(wo.id, { isArchived: !wo.isArchived })}
                                className="flex-1 min-w-[70px] py-1.5 bg-slate-800 border border-slate-700 text-yellow-400 text-[10px] font-bold rounded uppercase transition-all flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <span>{wo.isArchived ? 'Restore' : 'Arsip'}</span>
                              </button>
                            </div>

                            {/* Nested Mobile Details */}
                            {isSelected && (
                              <div className="mt-3 p-3 bg-slate-950 rounded-lg border border-slate-800 text-slate-300 space-y-4">
                                {/* Audit Timeline */}
                                <div className="space-y-2">
                                  <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5" />
                                    Jejak Audit Lifecycle (Timeline)
                                  </h4>
                                  <div className="relative pl-4 border-l border-slate-800 space-y-3 py-1">
                                    <div className="relative">
                                      <span className="absolute -left-[21px] top-1 w-2 h-2 rounded-full bg-blue-500"></span>
                                      <div className="text-[10px] font-bold text-slate-200">WO Terbuka di Workshop</div>
                                      <div className="text-[8px] text-slate-500 font-mono">{wo.intakeDate || wo.createdAt}</div>
                                    </div>
                                    {wo.mechanicId && (
                                      <div className="relative">
                                        <span className="absolute -left-[21px] top-1 w-2 h-2 rounded-full bg-purple-500"></span>
                                        <div className="text-[10px] font-bold text-slate-200">Diserahkan Ke Mekanik</div>
                                        <div className="text-[9px] text-slate-400 mt-0.5">
                                          Teknisi: <strong>{users.find(u => u.id === wo.mechanicId)?.name}</strong>
                                        </div>
                                      </div>
                                    )}
                                    <div className="relative">
                                      <span className={`absolute -left-[21px] top-1 w-2 h-2 rounded-full ${wo.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                                      <div className="text-[10px] font-bold text-slate-200">Tahap Akhir / Status: <span className="text-amber-400">{wo.status}</span></div>
                                    </div>
                                  </div>
                                </div>

                                {/* Part Logs */}
                                <div className="space-y-2 pt-2 border-t border-slate-900">
                                  <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <Wrench className="w-3.5 h-3.5" />
                                    Rekam Fisik & Telemetri Parts
                                  </h4>
                                  {wo.partLogs && wo.partLogs.length > 0 ? (
                                    <div className="space-y-2">
                                      {wo.partLogs.map((log) => (
                                        <div key={log.id} className="p-2 bg-slate-900 rounded border border-slate-800 text-[9px] space-y-1">
                                          <div className="flex justify-between items-center font-bold">
                                            <span className="text-slate-200">Nozzle Log</span>
                                            <span className="text-slate-500 font-mono">{log.date}</span>
                                          </div>
                                          <div className="grid grid-cols-2 gap-1 text-[8px] text-slate-400">
                                            <div>Jammed: {log.nozzleTipJammed ? '🔴 Ya' : '✅ Tidak'}</div>
                                            <div>Worn: {log.nozzleTipWorn ? '🔴 Ya' : '✅ Tidak'}</div>
                                            <div>Scratched: {log.valveScratched ? '🔴 Ya' : '✅ Tidak'}</div>
                                            <div>Leak: {log.valveLeak ? '🔴 Ya' : '✅ Tidak'}</div>
                                          </div>
                                          {log.notes && <div className="text-[8px] italic text-slate-500">"{log.notes}"</div>}
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-[9px] text-slate-500 italic">Tidak ada catatan parts log/injektor diesel terdaftar.</p>
                                  )}
                                </div>


                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                  </div>
                )}

              </div>
            );
          })()}
        </div>
      )}

      {archiveSubTab === 'LIFETIME_HISTORY' && (
        <div className="space-y-4">
          {(() => {
            // Extract all unique vehicles
            const uniqueVehicles = Array.from(new Set(workOrders.map(w => w.plateNumber.toUpperCase().trim()))).map(plate => {
              const visits = workOrders.filter(w => w.plateNumber.toUpperCase().trim() === plate).sort((a,b) => b.createdAt.localeCompare(a.createdAt));
              const latestVisit = visits[0];
              return {
                plateNumber: plate,
                brand: latestVisit.vehicleBrand,
                owner: latestVisit.customerName,
                phone: latestVisit.customerPhone,
                visitsCount: visits.length,
                lastVisitDate: latestVisit.intakeDate || latestVisit.createdAt,
                latestOdometer: latestVisit.odometer,
                vin: latestVisit.vin,
                visits: visits
              };
            });

            // Filter unique vehicles
            const filteredVehicles = uniqueVehicles.filter(v => {
              if (!historySearchQuery.trim()) return true;
              const q = historySearchQuery.toLowerCase();
              return String(v.plateNumber).toLowerCase().includes(q) || String(v.brand).toLowerCase().includes(q) || String(v.owner).toLowerCase().includes(q);
            });

            const selectedVehicle = uniqueVehicles.find(v => v.plateNumber === selectedVehiclePlate);

            return (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Vehicle selection sidebar */}
                <div className="bg-slate-850 p-3 rounded-lg border border-slate-800 space-y-3 h-[500px] flex flex-col">
                  <span className="block text-[10px] font-black uppercase text-purple-400 tracking-wider flex items-center gap-1">
                    <Car className="w-3.5 h-3.5" />
                    Daftar Kendaraan Terdaftar
                  </span>

                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-slate-500">
                      <Search className="w-3.5 h-3.5" />
                    </span>
                    <input
                      type="text"
                      value={historySearchQuery}
                      onChange={(e) => setHistorySearchQuery(e.target.value)}
                      placeholder="Cari Plat Nomor / Pemilik..."
                      className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs text-white pl-8 pr-2 py-1.5 rounded-lg focus:outline-none transition-all font-medium"
                    />
                  </div>

                  <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                    {filteredVehicles.length === 0 ? (
                      <p className="text-[10px] text-slate-500 italic text-center py-4">Belum ada kendaraan terdaftar.</p>
                    ) : (
                      filteredVehicles.map(v => {
                        const isSelected = selectedVehiclePlate === v.plateNumber;
                        return (
                          <button
                            key={v.plateNumber}
                            type="button"
                            onClick={() => {
                              setSelectedVehiclePlate(v.plateNumber);
                              setViewingHistoryDetailWO(null);
                            }}
                            className={`w-full text-left p-2 rounded-lg border transition-all cursor-pointer flex justify-between items-center ${
                              isSelected 
                                ? 'bg-purple-950/40 border-purple-600 text-purple-300' 
                                : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/40'
                            }`}
                          >
                            <div className="space-y-0.5">
                              <div className="font-mono font-black text-xs uppercase tracking-wider">{v.plateNumber}</div>
                              <div className="text-[9px] text-slate-400 font-bold">{v.brand}</div>
                              <div className="text-[8px] text-slate-500">Pemilik: {v.owner}</div>
                            </div>
                            <div className="text-right flex flex-col items-end">
                              <span className="text-[8px] bg-slate-800 text-slate-300 px-1 rounded-full font-mono font-bold">
                                {v.visitsCount}x Servis
                              </span>
                              <span className="text-[7px] text-slate-500 font-mono mt-1">KM {v.latestOdometer}</span>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Vehicle details & history timeline view */}
                <div className="lg:col-span-2 bg-slate-850 p-4 rounded-lg border border-slate-800 h-[500px] flex flex-col overflow-y-auto custom-scrollbar">
                  {selectedVehicle ? (
                    <div className="space-y-4">
                      {/* Vehicle Identity Header card */}
                      <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div className="flex items-center gap-3">
                          {/* License plate emblem */}
                          <div className="px-3 py-1 bg-slate-950 border-2 border-slate-750 rounded text-center min-w-[100px] shadow-md">
                            <div className="text-[7px] text-slate-500 font-mono font-black">INDONESIA</div>
                            <div className="text-xs font-mono font-black text-white tracking-widest uppercase">{selectedVehicle.plateNumber}</div>
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-slate-200">{selectedVehicle.brand}</h4>
                            <p className="text-[8px] text-slate-500 font-mono">VIN: {selectedVehicle.vin || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="text-left sm:text-right text-[10px]">
                          <div className="text-slate-400 font-bold">Pemilik: <span className="text-slate-100">{selectedVehicle.owner}</span></div>
                          <div className="text-slate-400 mt-0.5">HP/WA: <span className="text-slate-100">{selectedVehicle.phone}</span></div>
                          <div className="text-[8px] text-purple-400 font-bold mt-1 uppercase tracking-wider">
                            PROKOL LINDUNG KILOMETER JANGKA PANJANG (ANTI-SPIKE)
                          </div>
                        </div>
                      </div>

                      {/* Mileage trend log */}
                      <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 text-xs">
                        <h5 className="text-[9px] font-black text-purple-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5" />
                          Tren Odometer Berjalan (KM/HM Tracking)
                        </h5>
                        <div className="flex items-center gap-1 overflow-x-auto py-1 custom-scrollbar">
                          {selectedVehicle.visits.slice().reverse().map((visit, idx) => (
                            <React.Fragment key={visit.id}>
                              {idx > 0 && <ArrowRight className="w-3 h-3 text-slate-600 flex-shrink-0" />}
                              <div className="p-1.5 bg-slate-900 rounded border border-slate-850 text-center min-w-[90px] flex-shrink-0">
                                <div className="text-[7px] text-slate-500 font-mono">{idx === 0 ? 'Mulai' : `#${idx+1}`}</div>
                                <div className="text-[10px] font-bold text-slate-200 font-mono">{visit.odometer}</div>
                                <div className="text-[7px] text-slate-500 mt-0.5 font-mono">
                                  {visit.intakeDate ? visit.intakeDate.split('T')[0] : 'N/A'}
                                </div>
                              </div>
                            </React.Fragment>
                          ))}
                        </div>
                      </div>

                      {/* Stepper visits list */}
                      <div className="space-y-3">
                        <h5 className="text-[10px] font-black text-slate-200 uppercase tracking-wider">
                          Jejak Rekam Medis Kunjungan Bengkel
                        </h5>
                        
                        <div className="relative pl-6 border-l border-slate-800 space-y-4">
                          {selectedVehicle.visits.map((visit, visitIdx) => {
                            const isVisitOpen = viewingHistoryDetailWO === visit.id;
                            const totalCost = visit.todoActions?.reduce((acc, act) => {
                              const numStr = String(act.estimasiHarga).replace(/\D/g, '');
                              const numVal = parseInt(numStr, 10);
                              return acc + (isNaN(numVal) ? 0 : numVal);
                            }, 0) || 0;

                            return (
                              <div key={visit.id} className="relative">
                                {/* Step point */}
                                <span className="absolute -left-[31px] top-1 w-3 h-3 rounded-full border-2 border-slate-900 bg-purple-500 shadow-md"></span>
                                
                                <div className="bg-slate-900/80 rounded-lg border border-slate-800 p-3 space-y-2">
                                  <div className="flex justify-between items-start flex-wrap gap-2">
                                    <div>
                                      <span className="text-[8px] bg-purple-900/60 text-purple-300 font-mono px-1.5 py-0.5 rounded font-bold mr-2 uppercase">
                                        Visit #{selectedVehicle.visitsCount - visitIdx}
                                      </span>
                                      <span className="font-mono text-xs text-blue-400 font-bold">{visit.id}</span>
                                      <div className="text-[9px] text-slate-500 mt-1">
                                        Tanggal Masuk: <strong>{visit.intakeDate ? visit.intakeDate.replace('T', ' ') : 'N/A'}</strong>
                                      </div>
                                    </div>
                                    <div className="text-right flex flex-col items-end">
                                      <span className="text-xs font-mono font-bold text-amber-400">{formatRupiah(totalCost)}</span>
                                      <button
                                        type="button"
                                        onClick={() => setViewingHistoryDetailWO(isVisitOpen ? null : visit.id)}
                                        className="text-[9px] text-blue-400 hover:text-blue-300 font-bold mt-1 flex items-center gap-0.5 cursor-pointer"
                                      >
                                        {isVisitOpen ? 'Tutup Detail ▲' : 'Buka Detail ▼'}
                                      </button>
                                    </div>
                                  </div>

                                  <div className="text-[10px] text-slate-300 bg-slate-950 p-2 rounded border border-slate-850">
                                    <div className="font-bold text-slate-400 text-[9px] uppercase">Keluhan Awal:</div>
                                    <p className="mt-0.5 text-slate-200">"{visit.customerVoice || 'Tanpa Catatan Keluhan'}"</p>
                                  </div>

                                  {/* Expandable visit detail information */}
                                  {isVisitOpen && (
                                    <div className="mt-2 pt-2 border-t border-slate-800 space-y-3 text-[10px] transition-all animate-fadeIn">
                                      <div>
                                        {/* Diagnostics & Labor */}
                                        <div className="space-y-1">
                                          <div className="font-bold text-slate-400 text-[9px] uppercase">Tindakan Kerja (SPK):</div>
                                          {visit.todoActions && visit.todoActions.length > 0 ? (
                                            <ul className="list-disc pl-4 space-y-0.5 text-slate-300">
                                              {visit.todoActions.map((act) => (
                                                <li key={act.id}>
                                                  {act.jenisPengerjaan} (Qty: {act.qty}) - <span className="font-mono text-amber-500">{formatRupiah(act.estimasiHarga)}</span>
                                                </li>
                                              ))}
                                            </ul>
                                          ) : (
                                            <p className="text-slate-500 italic">Tidak ada rincian tindakan.</p>
                                          )}
                                        </div>


                                      </div>

                                      {/* Physical findings & nozzle status */}
                                      {visit.partLogs && visit.partLogs.length > 0 && (
                                        <div className="space-y-1 pt-1 border-t border-slate-800/40">
                                          <div className="font-bold text-slate-400 text-[9px] uppercase">Temuan Kerusakan Injektor:</div>
                                          <div className="flex flex-wrap gap-1">
                                            {visit.partLogs.map((log) => {
                                              const defectList = [];
                                              if (log.nozzleTipJammed) defectList.push('Nozzle Jammed');
                                              if (log.nozzleTipWorn) defectList.push('Nozzle Worn');
                                              if (log.valveScratched) defectList.push('Valve Scratched');
                                              if (log.valveLeak) defectList.push('Valve Leak');
                                              return (
                                                <div key={log.id} className="p-1 bg-slate-950 rounded border border-slate-850 flex items-center gap-1.5 text-[8px]">
                                                  <span className="font-bold text-slate-300">Cyl log:</span>
                                                  <span>{defectList.length > 0 ? defectList.join(', ') : 'Kondisi OK'}</span>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      )}

                                      <div className="flex gap-2 justify-end pt-1">
                                        <button
                                          type="button"
                                          onClick={() => setPrintWO(visit)}
                                          className="px-2.5 py-1 bg-slate-800 border border-slate-700 hover:bg-purple-600 hover:text-white rounded font-mono font-bold uppercase transition-all flex items-center gap-1 cursor-pointer"
                                        >
                                          <Printer className="w-3 h-3" />
                                          Cetak Bukti Servis ini
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setPrintWO(visit);
                                            setTimeout(() => {
                                              window.print();
                                            }, 150);
                                          }}
                                          className="px-2.5 py-1 bg-slate-800 border border-slate-700 text-emerald-400 hover:bg-emerald-600 hover:text-white rounded font-mono font-bold uppercase transition-all flex items-center gap-1 cursor-pointer"
                                          title="Unduh Bukti Servis ini sebagai PDF"
                                        >
                                          <Download className="w-3 h-3" />
                                          Unduh PDF
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs">
                      <History className="w-8 h-8 text-slate-600 mb-2" />
                      <p>Silakan pilih atau cari nomor plat kendaraan di panel sebelah kiri untuk memuat Buku Servis digital seumur hidup.</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
