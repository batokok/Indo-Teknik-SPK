import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { WorkOrder, User } from '../types';
import { BarChart3, TrendingUp, Users, Award, ShieldAlert, Package, Search } from 'lucide-react';

const ManagerAnalytics: React.FC = () => {
  const { workOrders, users } = useApp();
  const [authPin, setAuthPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (authPin === '9999' || authPin === 'admin') {
      setIsAuthenticated(true);
      setErrorMessage('');
    } else {
      setErrorMessage('PIN Kredensial Manajemen Salah! Silakan gunakan PIN "9999" atau "admin".');
    }
  };

  // 1. Mechanic Efficiency Calculation
  // Get all mechanics
  const mechanics = users.filter((u) => u.role === 'MECHANIC');
  
  const mechanicStats = mechanics.map((mech) => {
    // Filter work orders completed by this mechanic
    const completedWOs = workOrders.filter(
      (wo) => wo.mechanicId === mech.id && wo.status === 'COMPLETED'
    );
    
    // Average elapsed time
    const totalWOs = completedWOs.length;
    const totalSeconds = completedWOs.reduce((acc, wo) => acc + (wo.totalElapsedSeconds || 0), 0);
    const avgSeconds = totalWOs > 0 ? Math.round(totalSeconds / totalWOs) : 0;

    return {
      id: mech.id,
      name: mech.name,
      username: mech.username,
      totalCompleted: totalWOs,
      avgSeconds,
    };
  }).sort((a, b) => {
    // Rank by total completed first, then by lower average speed (or just total completed)
    if (b.totalCompleted !== a.totalCompleted) {
      return b.totalCompleted - a.totalCompleted;
    }
    return a.avgSeconds - b.avgSeconds;
  });

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

  // 2. Frequency of Damages parsed from partLogs findings & notes
  const damageKeywords = [
    { key: 'nozzle', label: 'Nozzle Tip Macet / Aus', pattern: /nozzle|ujung/i },
    { key: 'valve', label: 'Valve Plate Tergores / Bocor', pattern: /valve|katup|plate/i },
    { key: 'shim', label: 'Shim Adjust / Penyetelan Celah', pattern: /shim|ganjal|celah/i },
    { key: 'seal', label: 'Seal Kit Rusak / Diganti', pattern: /seal|o-ring|karet/i },
    { key: 'solenoid', label: 'Solenoid Bermasalah / Gosong', pattern: /solenoid|koil|magnet/i },
    { key: 'body', label: 'Keretakan Body Injector', pattern: /retak|bodi|body/i },
  ];

  // Count keyword hits
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

  // Sum of all keyword hits
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
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-200 text-red-600">
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
                className="w-full text-center p-3 border-2 border-slate-300 rounded-lg text-lg tracking-widest font-black focus:border-red-500 focus:ring-0 outline-none"
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
              className="w-full bg-slate-900 hover:bg-slate-850 text-white text-xs font-black py-3 rounded-lg uppercase tracking-wider transition-colors shadow"
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

  return (
    <div className="p-4 space-y-6 bg-slate-100 min-h-screen">
      
      {/* Analytics Title */}
      <div className="bg-slate-900 text-white p-6 rounded-lg shadow-md border border-slate-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-lg font-black tracking-wider uppercase text-blue-400 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            DASBOR ANALITIK MANAJEMEN & PRODUKTIVITAS
          </h1>
          <p className="text-slate-300 text-xs mt-1.5 leading-relaxed">
            Informasi real-time performa mekanik laboratorium kalibrasi diesel dan analisis distribusi kerusakan tersimpan di server lokal NAS IT Indo Teknik.
          </p>
        </div>
        <button
          onClick={() => setIsAuthenticated(false)}
          className="px-3.5 py-1.5 border border-slate-700 hover:bg-slate-800 text-[10px] font-black uppercase rounded text-slate-300 transition-colors"
        >
          Kunci Layar
        </button>
      </div>

      {/* Metric Cards Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border border-slate-200">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-black uppercase tracking-wider">Total Work Order</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-800">{workOrders.length}</span>
            <span className="text-[10px] text-slate-500 font-bold">SPK Masuk</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border border-slate-200">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-black uppercase tracking-wider">Pekerjaan Selesai</span>
            <Award className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-800">
              {workOrders.filter((w) => w.status === 'COMPLETED').length}
            </span>
            <span className="text-[10px] text-emerald-600 font-bold">
              {workOrders.length > 0 
                ? Math.round((workOrders.filter((w) => w.status === 'COMPLETED').length / workOrders.length) * 100) 
                : 0}% Rasio
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border border-slate-200">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-black uppercase tracking-wider">Sedang Berjalan</span>
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping"></span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-800">
              {workOrders.filter((w) => w.status === 'IN_PROGRESS').length}
            </span>
            <span className="text-[10px] text-slate-500 font-bold">Di Lab Uji</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border border-slate-200">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-black uppercase tracking-wider">Log Kerusakan</span>
            <Package className="w-4 h-4 text-purple-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-800">{totalLogsAnalyzed}</span>
            <span className="text-[10px] text-slate-500 font-bold">Ledger Diagnosis</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* GRID 1: Peringkat Efisiensi Mekanik */}
        <section className="bg-white rounded-lg shadow border border-slate-200 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              1. PERINGKAT EFISIENSI MEKANIK (CLOCK SPEED RUNNING)
            </h3>
            <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded border border-blue-200 uppercase">
              Urutan Kecepatan
            </span>
          </div>
          
          <div className="p-4 flex-1">
            <p className="text-[11px] text-slate-500 leading-relaxed mb-4">
              Peringkat efisiensi dihitung otomatis berdasarkan jumlah Surat Perintah Kerja (SPK) yang diselesaikan status <strong>COMPLETED (QC READY)</strong> dikalikan rata-rata waktu clock speed running sejak tombol Mulai Kerja diklik hingga selesai.
            </p>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 text-[10px] uppercase font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-2.5 text-center w-12 font-black">Rank</th>
                    <th className="px-4 py-2.5 font-black">Nama Mekanik</th>
                    <th className="px-4 py-2.5 text-center font-black">SPK Selesai</th>
                    <th className="px-4 py-2.5 text-center font-black">Rerata Durasi Kerja</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {mechanicStats.map((stat, index) => (
                    <tr key={stat.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-center">
                        {index === 0 && <span className="text-lg">🥇</span>}
                        {index === 1 && <span className="text-lg">🥈</span>}
                        {index === 2 && <span className="text-lg">🥉</span>}
                        {index > 2 && <span className="font-bold text-slate-400">{index + 1}</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-800">{stat.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">@{stat.username}</div>
                      </td>
                      <td className="px-4 py-3 text-center font-black text-slate-800">
                        {stat.totalCompleted} <span className="text-[10px] text-slate-400 font-normal">Unit</span>
                      </td>
                      <td className="px-4 py-3 text-center font-mono font-bold text-blue-600 bg-blue-50/30">
                        {stat.totalCompleted > 0 ? formatAvgTime(stat.avgSeconds) : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* GRID 2: Distribusi Kasus Kerusakan Terbanyak */}
        <section className="bg-white rounded-lg shadow border border-slate-200 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Package className="w-4 h-4 text-red-600" />
              2. DISTRIBUSI KASUS KERUSAKAN KOMPONEN (STOK PLANNING)
            </h3>
            <span className="text-[10px] bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded border border-red-200 uppercase">
              Keyword Analyzer
            </span>
          </div>

          <div className="p-4 flex-1">
            <p className="text-[11px] text-slate-500 leading-relaxed mb-4">
              Sistem melakukan crawling text mining secara real-time terhadap deskripsi temuan kerusakan manual pada <strong>Log Suku Cadang</strong>. Berguna untuk memprediksi kebutuhan stok komponen paling krusial di gudang.
            </p>

            <div className="space-y-4">
              {sortedDamages.map((kw) => (
                <div key={kw.key} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-700">{kw.label}</span>
                    <span className="font-mono text-slate-500 font-bold">
                      {kw.count} Temuan ({kw.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200 flex">
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

            <div className="mt-6 p-3 bg-slate-50 border border-slate-200 rounded-lg text-[10px] text-slate-500 leading-relaxed">
              <strong>💡 Rekomendasi Logistik Gudang:</strong> Berdasarkan data kerusakan teranalisis di atas, kami merekomendasikan untuk menaikkan safety stock item <strong className="text-slate-700">{sortedDamages[0]?.label || 'Suku Cadang Teratas'}</strong> sebesar <strong>15%</strong> pada siklus belanja inventaris berikutnya karena mendominasi total kasus laboratorium.
            </div>
          </div>
        </section>

      </div>

    </div>
  );
};

export default ManagerAnalytics;
