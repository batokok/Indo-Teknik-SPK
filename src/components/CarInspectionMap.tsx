import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DamageReport } from '../types';
import { ShieldCheck, AlertCircle, CheckCircle2, Sparkles, Check, X, HelpCircle } from 'lucide-react';

export interface CarPartInspectionPoint {
  id: string;
  label: string;
  shortLabel: string;
  x: number; // percentage 0-100 on svg canvas
  y: number; // percentage 0-100 on svg canvas
  category?: 'EXTERIOR' | 'INTERIOR';
}

export const CAR_INSPECTION_POINTS: CarPartInspectionPoint[] = [
  { id: 'front-view', label: 'Tampak Depan (Bumper & Grille)', shortLabel: 'Depan', x: 50, y: 11, category: 'EXTERIOR' },
  { id: 'top-view', label: 'Top View (Kap Mesin)', shortLabel: 'Kap Mesin', x: 50, y: 25, category: 'EXTERIOR' },
  { id: 'left-side', label: 'Samping Kiri (Pintu & Fender L)', shortLabel: 'Samping Kiri', x: 19, y: 50, category: 'EXTERIOR' },
  { id: 'right-side', label: 'Samping Kanan (Pintu & Fender R)', shortLabel: 'Samping Kanan', x: 81, y: 50, category: 'EXTERIOR' },
  { id: 'spion-dalam', label: 'Kaca Spion Dalam & Sunvisor', shortLabel: 'Spion Dalam', x: 37, y: 38, category: 'INTERIOR' },
  { id: 'dashboard-panel', label: 'Dashboard & Panel Speedometer', shortLabel: 'Dashboard', x: 50, y: 44, category: 'INTERIOR' },
  { id: 'soket-kelistrikan', label: 'Soket Kelistrikan & Sekring', shortLabel: 'Kelistrikan', x: 63, y: 38, category: 'INTERIOR' },
  { id: 'plafon', label: 'Plafon / Atap Interior Mobil', shortLabel: 'Plafon Atap', x: 50, y: 64, category: 'INTERIOR' },
  { id: 'rear-view', label: 'Tampak Belakang (Bumper & Bagasi)', shortLabel: 'Belakang', x: 50, y: 89, category: 'EXTERIOR' },
];

export function getPointInspectionStatus(
  pointId: string,
  damages: DamageReport[] = []
): { status: 'DEFECT' | 'OK' | 'UNCHECKED'; description: string } {
  const item = damages.find(d => d.partId === pointId);
  if (!item) {
    return { status: 'UNCHECKED', description: '' };
  }
  if (item.status === 'DEFECT') {
    return { status: 'DEFECT', description: item.description || 'Ada kerusakan/baret fisik' };
  }
  if (item.status === 'OK') {
    return { status: 'OK', description: item.description || 'Tidak ditemukan kerusakan (Mulus)' };
  }
  if (item.status === 'UNCHECKED') {
    return { status: 'UNCHECKED', description: '' };
  }
  // Legacy compatibility: check description content
  const desc = (item.description || '').toLowerCase().trim();
  if (desc === '' || ['ok', 'normal', 'mulus', 'baik'].includes(desc)) {
    return { status: 'OK', description: item.description || 'Tidak ditemukan kerusakan (Mulus)' };
  }
  return { status: 'DEFECT', description: item.description };
}

interface CarInspectionMapProps {
  damages?: DamageReport[];
  interactive?: boolean;
  onTogglePoint?: (pointId: string) => void;
  className?: string;
  isPrintMode?: boolean;
  readonly?: boolean;
  onAddDamage?: (pointId: string) => void;
  onRemoveDamage?: (pointId: string) => void;
}

export const CarInspectionMap: React.FC<CarInspectionMapProps> = ({
  damages = [],
  interactive = false,
  onTogglePoint,
  className = '',
  isPrintMode = false,
  readonly = false,
}) => {
  const isInteractive = interactive && !readonly && !isPrintMode;

  const defectCount = CAR_INSPECTION_POINTS.filter(
    pt => getPointInspectionStatus(pt.id, damages).status === 'DEFECT'
  ).length;

  const okCount = CAR_INSPECTION_POINTS.filter(
    pt => getPointInspectionStatus(pt.id, damages).status === 'OK'
  ).length;

  const uncheckedCount = CAR_INSPECTION_POINTS.filter(
    pt => getPointInspectionStatus(pt.id, damages).status === 'UNCHECKED'
  ).length;

  // Render SVG Vehicle Blueprint with High Technical Precision
  const renderVehicleSVG = (sizeClass: string = "w-full max-w-[200px]") => (
    <svg
      viewBox="0 0 240 330"
      className={`${sizeClass} h-auto select-none drop-shadow-xs`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Blueprint background grid */}
      <pattern id="insp-grid" width="12" height="12" patternUnits="userSpaceOnUse">
        <path d="M 12 0 L 0 0 0 12" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
      </pattern>
      <rect width="240" height="330" fill="url(#insp-grid)" rx="8" />

      {/* Center Axis Reference Guide */}
      <line x1="120" y1="12" x2="120" y2="318" stroke="#cbd5e1" strokeWidth="0.8" strokeDasharray="3 3" />

      {/* Tires / Wheels (Technical blueprint proportion) */}
      <rect x="36" y="58" width="10" height="34" rx="3" fill="#1e293b" stroke="#0f172a" strokeWidth="1" />
      <rect x="194" y="58" width="10" height="34" rx="3" fill="#1e293b" stroke="#0f172a" strokeWidth="1" />
      <rect x="36" y="234" width="10" height="34" rx="3" fill="#1e293b" stroke="#0f172a" strokeWidth="1" />
      <rect x="194" y="234" width="10" height="34" rx="3" fill="#1e293b" stroke="#0f172a" strokeWidth="1" />

      {/* Side Mirrors */}
      <path d="M 46 96 C 35 96, 33 108, 45 112 Z" fill="#e2e8f0" stroke="#334155" strokeWidth="1.2" />
      <path d="M 194 96 C 205 96, 207 108, 195 112 Z" fill="#e2e8f0" stroke="#334155" strokeWidth="1.2" />

      {/* Main Vehicle Body Silhouette (Sedan/SUV Archetype) */}
      <path
        d="M 82 22 
           C 96 16, 144 16, 158 22 
           C 176 32, 186 64, 190 102 
           C 194 154, 194 226, 190 268 
           C 186 298, 168 312, 120 312 
           C 72 312, 54 298, 50 268 
           C 46 226, 46 154, 50 102 
           C 54 64, 64 32, 82 22 Z"
        fill="#FFFFFF"
        stroke="#1E293B"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />

      {/* Front Bumper & Headlights Zone */}
      <path d="M 72 34 C 92 24, 148 24, 168 34" stroke="#475569" strokeWidth="1.5" />
      <path d="M 60 44 C 70 34, 84 38, 84 48 C 70 48, 62 52, 60 44 Z" fill="#f1f5f9" stroke="#475569" strokeWidth="1.2" />
      <path d="M 180 44 C 170 34, 156 38, 156 48 C 170 48, 178 52, 180 44 Z" fill="#f1f5f9" stroke="#475569" strokeWidth="1.2" />
      <rect x="94" y="29" width="52" height="6" rx="2" fill="#e2e8f0" stroke="#64748b" strokeWidth="0.8" />

      {/* Hood (Kap Mesin) Contour */}
      <path d="M 66 74 C 90 70, 150 70, 174 74" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 2" />

      {/* Windshield (Front Glass) */}
      <path
        d="M 68 84 L 84 122 L 156 122 L 172 84 C 148 76, 92 76, 68 84 Z"
        fill="#e0f2fe"
        stroke="#0284c7"
        strokeWidth="1.4"
        opacity="0.85"
      />

      {/* Cabin Roof / Plafon Zone */}
      <rect x="78" y="130" width="84" height="78" rx="6" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.2" strokeDasharray="3 3" />
      <line x1="120" y1="135" x2="120" y2="203" stroke="#cbd5e1" strokeWidth="0.8" strokeDasharray="2 2" />

      {/* Rear Windshield (Kaca Belakang) */}
      <path
        d="M 82 216 L 68 252 C 96 260, 144 260, 172 252 L 158 216 Z"
        fill="#e0f2fe"
        stroke="#0284c7"
        strokeWidth="1.4"
        opacity="0.85"
      />

      {/* Rear Trunk / Tail Lights */}
      <path d="M 58 276 C 68 282, 80 278, 80 270" stroke="#dc2626" strokeWidth="2.5" />
      <path d="M 182 276 C 172 282, 160 278, 160 270" stroke="#dc2626" strokeWidth="2.5" />
      <path d="M 72 298 C 96 306, 144 306, 168 298" stroke="#475569" strokeWidth="1.8" />
    </svg>
  );

  // =========================================================================
  // PRINT MODE: Static Document Layout (No scrollbar, No pill button, Compact table)
  // =========================================================================
  if (isPrintMode) {
    return (
      <div className="flex flex-col bg-white border border-slate-300 rounded-lg p-1.5 text-slate-900 box-border">
        {/* Section Title with Integrated Legend */}
        <div className="flex items-center justify-between border-b border-slate-300 pb-1 mb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#0F2D59]"></span>
            <span className="text-[9px] font-black uppercase tracking-wider text-[#0F2D59]">
              DIAGRAM KONDISI FISIK KENDARAAN (VEHICLE CONDITION DIAGRAM)
            </span>
          </div>

          {/* Standardized Legend with Color + Symbol + Text (Grayscale safe) */}
          <div className="flex items-center gap-2.5 text-[7.5px] font-bold text-slate-700 font-mono">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[6.5px] font-black">✓</span>
              <span>Normal ({okCount})</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[6.5px] font-black">!</span>
              <span className="text-rose-900 font-black">Rusak ({defectCount})</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 text-slate-700 flex items-center justify-center text-[6.5px] font-black">?</span>
              <span className="text-slate-500">Belum Diperiksa ({uncheckedCount})</span>
            </span>
          </div>
        </div>

        {/* 2-Column Professional Layout: Diagram Left (4 cols) & Full Table Right (8 cols) */}
        <div className="grid grid-cols-12 gap-2 items-center">
          {/* Static Diagram with Numbered Callout Markers */}
          <div className="col-span-4 relative flex items-center justify-center bg-slate-50/80 rounded border border-slate-200 p-1 min-h-0">
            {renderVehicleSVG("w-full max-w-[125px] max-h-[140px]")}

            {/* Static Numbered Pin Markers with Status Badges */}
            {CAR_INSPECTION_POINTS.map((pt, idx) => {
              const { status } = getPointInspectionStatus(pt.id, damages);
              const isDefect = status === 'DEFECT';
              const isOk = status === 'OK';
              const numStr = String(idx + 1).padStart(2, '0');

              return (
                <div
                  key={pt.id}
                  style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none"
                >
                  <div
                    className={`flex items-center justify-center rounded-full text-[8px] font-black font-mono shadow-xs border ${
                      isDefect
                        ? 'w-5 h-5 bg-rose-600 text-white border-rose-800 ring-1 ring-rose-300'
                        : isOk
                          ? 'w-4 h-4 bg-emerald-600 text-white border-emerald-800'
                          : 'w-4 h-4 bg-slate-200 text-slate-700 border-slate-400'
                    }`}
                  >
                    {isDefect ? '!' : isOk ? '✓' : numStr}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Complete Inspection Findings Table (No Scrollbar, All 9 Points Complete) */}
          <div className="col-span-8 flex flex-col justify-between">
            <div className="border border-slate-300 rounded overflow-hidden">
              <table className="w-full text-left border-collapse text-[7.5px] leading-tight">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-black border-b border-slate-300 uppercase tracking-tight text-[7px]">
                    <th className="py-0.5 px-1 text-center w-6 border-r border-slate-200">No.</th>
                    <th className="py-0.5 px-1.5 border-r border-slate-200">Bagian Diperiksa</th>
                    <th className="py-0.5 px-1.5 text-center w-20 border-r border-slate-200">Kondisi</th>
                    <th className="py-0.5 px-1.5">Keterangan / Temuan Fisik</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {CAR_INSPECTION_POINTS.map((pt, idx) => {
                    const { status, description } = getPointInspectionStatus(pt.id, damages);
                    const isDefect = status === 'DEFECT';
                    const isOk = status === 'OK';
                    const isUnchecked = status === 'UNCHECKED';

                    return (
                      <tr key={pt.id} className={isDefect ? 'bg-rose-50/70' : idx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}>
                        <td className="py-0.5 px-1 text-center font-mono font-bold text-slate-600 border-r border-slate-200">
                          {String(idx + 1).padStart(2, '0')}
                        </td>
                        <td className="py-0.5 px-1.5 font-bold text-slate-900 border-r border-slate-200 whitespace-nowrap">
                          {pt.label}
                        </td>
                        <td className="py-0.5 px-1.5 text-center border-r border-slate-200 whitespace-nowrap">
                          {isDefect ? (
                            <span className="inline-flex items-center gap-0.5 text-rose-800 font-black font-mono text-[7px] uppercase">
                              [!] Rusak
                            </span>
                          ) : isOk ? (
                            <span className="inline-flex items-center gap-0.5 text-emerald-800 font-bold font-mono text-[7px] uppercase">
                              [✓] Normal
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-0.5 text-slate-500 font-medium font-mono text-[7px] uppercase">
                              [-] Belum Diperiksa
                            </span>
                          )}
                        </td>
                        <td className="py-0.5 px-1.5 text-slate-800 break-words leading-tight">
                          {isDefect ? (
                            <span className="font-bold text-rose-950">
                              {description || 'Terdapat cacat/baret fisik pada bagian ini'}
                            </span>
                          ) : isOk ? (
                            <span className="text-slate-600">
                              {description || 'Tidak ditemukan kerusakan fisik'}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">
                              Belum dilakukan pemeriksaan fisik
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Bottom Summary Callout */}
            <div className="mt-1 p-1 rounded bg-slate-50 border border-slate-200 text-[7.5px] leading-tight text-slate-700 flex items-center justify-between">
              <div>
                <strong>Ringkasan Pemeriksaan Bodi: </strong>
                {defectCount > 0 ? (
                  <span className="text-rose-900 font-bold">
                    Ditemukan {defectCount} titik cacat fisik luar/interior saat penerimaan.
                  </span>
                ) : (
                  <span className="text-emerald-800 font-bold">
                    Seluruh 9 titik bodi dan interior diverifikasi normal tanpa cacat fisik saat serah terima.
                  </span>
                )}
              </div>
              <span className="text-[7px] font-mono text-slate-500 shrink-0">
                Total: 9 Titik Standar
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // APP VIEW: Interactive Inspection Map & Responsive Table
  // =========================================================================
  return (
    <div className={`flex flex-col bg-white rounded-xl ring-1 ring-slate-200 shadow-xs overflow-hidden ${className}`}>
      {/* Header Info */}
      <div className="bg-[#0B132B] text-white px-3.5 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800">
        <div className="flex items-center gap-2 min-w-0">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <div className="flex flex-col">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-100">
              Vehicle Condition Inspection Diagram
            </span>
            <span className="text-[9px] text-slate-400">
              Peta Visual & Tabel Pemeriksaan Kondisi Bodi Kendaraan
            </span>
          </div>
          {isInteractive && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[9px] bg-blue-500/20 text-blue-300 border border-blue-400/30 px-1.5 py-0.5 rounded font-medium shrink-0 ml-1">
              <Sparkles className="w-2.5 h-2.5" /> Interaktif (Klik Pin)
            </span>
          )}
        </div>

        {/* Legend Status Header with 3 States */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <div className="flex items-center gap-2 bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-800 text-[9px] font-mono">
            <span className="flex items-center gap-1 text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Normal ({okCount})
            </span>
            <span className="text-slate-600">|</span>
            <span className="flex items-center gap-1 text-rose-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span> Rusak ({defectCount})
            </span>
            <span className="text-slate-600">|</span>
            <span className="flex items-center gap-1 text-slate-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-slate-400"></span> Belum ({uncheckedCount})
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Diagram Left (5 cols) & Comprehensive Table Right (7 cols) */}
      <div className="p-3 grid grid-cols-12 gap-3 items-start">
        {/* SVG Blueprint Canvas Container */}
        <div className="col-span-12 lg:col-span-5 relative flex flex-col items-center justify-center p-3 bg-gradient-to-b from-slate-50 to-slate-100/70 rounded-xl border border-slate-200 min-h-[260px] overflow-hidden">
          {renderVehicleSVG("w-full max-w-[190px]")}

          {/* Interactive Visual Pins */}
          {CAR_INSPECTION_POINTS.map((pt, idx) => {
            const { status, description } = getPointInspectionStatus(pt.id, damages);
            const isDefect = status === 'DEFECT';
            const isOk = status === 'OK';
            const isUnchecked = status === 'UNCHECKED';
            const numStr = String(idx + 1).padStart(2, '0');

            return (
              <div
                key={pt.id}
                style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
              >
                {/* Radar Ripple Pulse when Defective */}
                {isDefect && (
                  <motion.span
                    initial={{ scale: 0.8, opacity: 0.8 }}
                    animate={{ scale: [1, 2.2, 2.6], opacity: [0.8, 0.3, 0] }}
                    transition={{
                      duration: 1.8,
                      repeat: Infinity,
                      ease: 'easeOut',
                    }}
                    className="absolute inset-0 rounded-full bg-rose-500 pointer-events-none"
                  />
                )}

                <motion.button
                  type="button"
                  onClick={() => isInteractive && onTogglePoint?.(pt.id)}
                  disabled={!isInteractive}
                  whileHover={isInteractive ? { scale: 1.2 } : {}}
                  whileTap={isInteractive ? { scale: 0.92 } : {}}
                  title={`${numStr}. ${pt.label}: ${isDefect ? 'RUSAK / DEFECT' : isOk ? 'NORMAL / OK' : 'BELUM DIPERIKSA'}`}
                  className={`relative flex items-center justify-center rounded-full font-black text-[9px] font-mono transition-all group select-none shadow-sm ${
                    isInteractive ? 'cursor-pointer focus:outline-none' : 'cursor-default'
                  } ${
                    isDefect
                      ? 'w-5.5 h-5.5 bg-rose-600 text-white ring-2 ring-rose-300 ring-offset-1 shadow-[0_0_8px_rgba(225,29,72,0.4)]'
                      : isOk
                        ? 'w-4.5 h-4.5 bg-emerald-600 text-white ring-2 ring-emerald-200'
                        : 'w-4.5 h-4.5 bg-slate-200 text-slate-700 ring-1 ring-slate-400'
                  }`}
                >
                  {isDefect ? '!' : isOk ? '✓' : numStr}

                  {/* Floating Tooltip Label */}
                  <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 hidden group-hover:flex flex-col items-center z-30 pointer-events-none whitespace-nowrap">
                    <span className="bg-slate-900/95 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-lg border border-slate-700">
                      {numStr}. {pt.shortLabel}: {isDefect ? 'RUSAK / CACAT' : isOk ? 'NORMAL' : 'BELUM DIPERIKSA'}
                    </span>
                  </span>
                </motion.button>
              </div>
            );
          })}

          <div className="mt-2 text-[9px] text-slate-500 font-medium text-center">
            {isInteractive ? 'Klik pin untuk berganti status (Belum ➔ Normal ➔ Rusak)' : 'Diagram visual posisi fisik kendaraan'}
          </div>
        </div>

        {/* Detailed Inspection Table (Right 7 Cols) - Replaces narrow scrollbar list */}
        <div className="col-span-12 lg:col-span-7 flex flex-col justify-between space-y-2">
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
            <div className="bg-slate-50 px-3 py-1.5 border-b border-slate-200 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-800">
                Tabel Status Inspeksi Bodi ({CAR_INSPECTION_POINTS.length} Titik)
              </span>
              <span className="text-[9px] font-mono text-slate-500 font-bold">
                {defectCount > 0 ? `${defectCount} Rusak` : `${okCount} Normal`}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[10px]">
                <thead>
                  <tr className="bg-slate-100/70 text-slate-700 font-black border-b border-slate-200 text-[9px] uppercase tracking-wider">
                    <th className="py-1.5 px-2 text-center w-8 border-r border-slate-200">No.</th>
                    <th className="py-1.5 px-2.5 border-r border-slate-200">Bagian Diperiksa</th>
                    <th className="py-1.5 px-2 text-center w-24 border-r border-slate-200">Kondisi</th>
                    <th className="py-1.5 px-2.5">Keterangan / Temuan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {CAR_INSPECTION_POINTS.map((pt, idx) => {
                    const { status, description } = getPointInspectionStatus(pt.id, damages);
                    const isDefect = status === 'DEFECT';
                    const isOk = status === 'OK';
                    const isUnchecked = status === 'UNCHECKED';

                    return (
                      <tr
                        key={pt.id}
                        onClick={() => isInteractive && onTogglePoint?.(pt.id)}
                        className={`transition-colors ${
                          isInteractive ? 'cursor-pointer hover:bg-blue-50/50' : ''
                        } ${
                          isDefect
                            ? 'bg-rose-50/80 font-semibold'
                            : isOk
                              ? 'bg-emerald-50/40'
                              : 'bg-white'
                        }`}
                      >
                        <td className="py-1 px-2 text-center font-mono font-bold text-slate-600 border-r border-slate-200">
                          {String(idx + 1).padStart(2, '0')}
                        </td>
                        <td className="py-1 px-2.5 font-bold text-slate-900 border-r border-slate-200">
                          {pt.label}
                        </td>
                        <td className="py-1 px-2 text-center border-r border-slate-200">
                          <span
                            className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8.5px] font-black uppercase font-mono ${
                              isDefect
                                ? 'bg-rose-600 text-white'
                                : isOk
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {isDefect ? 'Rusak' : isOk ? 'Normal' : 'Belum'}
                          </span>
                        </td>
                        <td className="py-1 px-2.5 text-slate-800 break-words leading-tight">
                          {isDefect ? (
                            <span className="font-bold text-rose-900">
                              {description || 'Ada goresan/penyok fisik'}
                            </span>
                          ) : isOk ? (
                            <span className="text-slate-600">
                              {description || 'Tidak ditemukan kerusakan'}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">
                              Belum diperiksa
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes summary callout */}
          <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-[10px] text-slate-700">
            {defectCount === 0 ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>Seluruh titik bodi luar & interior diverifikasi mulus saat serah terima.</span>
              </span>
            ) : (
              <div className="space-y-1">
                <span className="font-black text-rose-700 block text-[10px]">
                  Detail Temuan Kerusakan / Cacat Fisik:
                </span>
                <div className="space-y-1">
                  {CAR_INSPECTION_POINTS.filter(pt => getPointInspectionStatus(pt.id, damages).status === 'DEFECT').map(pt => {
                    const { description } = getPointInspectionStatus(pt.id, damages);
                    return (
                      <div key={pt.id} className="text-slate-900 break-words leading-tight bg-white p-1.5 rounded-lg border border-rose-200">
                        <strong className="text-rose-900 uppercase">{pt.label}:</strong> {description || 'Ada goresan/penyok'}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
