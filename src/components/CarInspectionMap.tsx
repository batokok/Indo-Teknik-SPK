import React from 'react';
import { DamageReport } from '../types';
import { ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';

export interface CarPartInspectionPoint {
  id: string;
  label: string;
  shortLabel: string;
  x: number; // percentage 0-100 on svg canvas
  y: number; // percentage 0-100 on svg canvas
}

export const CAR_INSPECTION_POINTS: CarPartInspectionPoint[] = [
  { id: 'front-view', label: 'Tampak Depan (Bumper/Grill)', shortLabel: 'Depan', x: 50, y: 12 },
  { id: 'top-view', label: 'Top View (Kap Mesin)', shortLabel: 'Kap', x: 50, y: 28 },
  { id: 'left-side', label: 'Samping Kiri (Pintu/Fender L)', shortLabel: 'Kiri', x: 20, y: 50 },
  { id: 'right-side', label: 'Samping Kanan (Pintu/Fender R)', shortLabel: 'Kanan', x: 80, y: 50 },
  { id: 'dashboard-panel', label: 'Dashboard & Panel Speedometer', shortLabel: 'Dashboard', x: 50, y: 44 },
  { id: 'spion-dalam', label: 'Kaca Spion Dalam & Sunvisor', shortLabel: 'Spion', x: 38, y: 37 },
  { id: 'plafon', label: 'Plafon / Atap Interior Mobil', shortLabel: 'Plafon', x: 50, y: 62 },
  { id: 'soket-kelistrikan', label: 'Soket Kelistrikan & Sekring', shortLabel: 'Kelistrikan', x: 64, y: 37 },
  { id: 'rear-view', label: 'Tampak Belakang (Bumper/Bagasi)', shortLabel: 'Belakang', x: 50, y: 88 },
];

interface CarInspectionMapProps {
  damages?: DamageReport[];
  interactive?: boolean;
  onTogglePoint?: (pointId: string) => void;
  className?: string;
  isPrintMode?: boolean;
}

export const CarInspectionMap: React.FC<CarInspectionMapProps> = ({
  damages = [],
  interactive = false,
  onTogglePoint,
  className = '',
  isPrintMode = false,
}) => {
  const defectMap = new Map(damages.map(d => [d.partId, d]));
  const defectCount = damages.length;

  return (
    <div className={`flex flex-col bg-white rounded-xl border border-slate-200 overflow-hidden ${className}`}>
      {/* Header Info */}
      <div className="bg-[#0B132B] text-white px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-[11px] font-black uppercase tracking-wider">
            Vehicle Body & Interior Visual Map 2.0
          </span>
        </div>
        <div className="flex items-center gap-2">
          {defectCount > 0 ? (
            <span className="bg-rose-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
              <AlertCircle className="w-3 h-3" /> {defectCount} Titik Kerusakan / Baret
            </span>
          ) : (
            <span className="bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
              <CheckCircle2 className="w-3 h-3" /> Kondisi Fisik Mulus (100% OK)
            </span>
          )}
        </div>
      </div>

      <div className="p-3 grid grid-cols-12 gap-3 items-center">
        {/* SVG Blueprint Canvas */}
        <div className="col-span-12 sm:col-span-7 relative flex items-center justify-center p-2 bg-slate-50/70 rounded-xl border border-slate-200/80 min-h-[190px]">
          <svg
            viewBox="0 0 240 320"
            className="w-full max-w-[210px] h-auto drop-shadow-xs"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Background Grid Pattern for Technical Blueprint feel */}
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
            </pattern>
            <rect width="240" height="320" fill="url(#grid)" rx="10" />

            {/* Car Outer Outline (Sedan/SUV Archetype Silhouette) */}
            <path
              d="M 85 24 
                 C 95 18, 145 18, 155 24 
                 C 175 35, 185 70, 188 110 
                 C 192 160, 192 220, 188 260 
                 C 184 290, 165 305, 120 305 
                 C 75 305, 56 290, 52 260 
                 C 48 220, 48 160, 52 110 
                 C 55 70, 65 35, 85 24 Z"
              fill="#F8FAFC"
              stroke="#334155"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />

            {/* Front Bumper & Headlights */}
            <path d="M 75 38 C 90 28, 150 28, 165 38" stroke="#64748B" strokeWidth="1.8" />
            <path d="M 62 48 C 72 38, 86 42, 86 52 C 72 52, 64 56, 62 48 Z" fill="#E2E8F0" stroke="#475569" strokeWidth="1.2" />
            <path d="M 178 48 C 168 38, 154 42, 154 52 C 168 52, 176 56, 178 48 Z" fill="#E2E8F0" stroke="#475569" strokeWidth="1.2" />

            {/* Windshield (Front Glass) */}
            <path
              d="M 70 85 L 85 125 L 155 125 L 170 85 C 145 76, 95 76, 70 85 Z"
              fill="#E0F2FE"
              stroke="#0284C7"
              strokeWidth="1.5"
              opacity="0.8"
            />

            {/* Roof / Plafon Zone */}
            <rect x="80" y="132" width="80" height="74" rx="8" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="1.2" strokeDasharray="3 3" />

            {/* Rear Windshield */}
            <path
              d="M 82 214 L 68 250 C 95 258, 145 258, 172 250 L 158 214 Z"
              fill="#E0F2FE"
              stroke="#0284C7"
              strokeWidth="1.5"
              opacity="0.8"
            />

            {/* Rear Tail Lights & Bumper */}
            <path d="M 58 272 C 68 278, 80 274, 80 266" stroke="#EF4444" strokeWidth="2.5" />
            <path d="M 182 272 C 172 278, 160 274, 160 266" stroke="#EF4444" strokeWidth="2.5" />
            <path d="M 70 292 C 95 300, 145 300, 170 292" stroke="#64748B" strokeWidth="2" />

            {/* Side Mirrors */}
            <path d="M 52 98 C 40 98, 38 112, 50 114 Z" fill="#CBD5E1" stroke="#475569" strokeWidth="1.2" />
            <path d="M 188 98 C 200 98, 202 112, 190 114 Z" fill="#CBD5E1" stroke="#475569" strokeWidth="1.2" />

            {/* Wheels Representation */}
            <rect x="42" y="60" width="8" height="30" rx="3" fill="#1E293B" />
            <rect x="190" y="60" width="8" height="30" rx="3" fill="#1E293B" />
            <rect x="42" y="225" width="8" height="30" rx="3" fill="#1E293B" />
            <rect x="190" y="225" width="8" height="30" rx="3" fill="#1E293B" />
          </svg>

          {/* Interactive / Static Visual Pins Layer */}
          {CAR_INSPECTION_POINTS.map((pt, idx) => {
            const hasDefect = defectMap.has(pt.id);
            return (
              <button
                key={pt.id}
                type="button"
                onClick={() => interactive && onTogglePoint?.(pt.id)}
                disabled={!interactive}
                style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
                title={`${pt.label}: ${hasDefect ? 'DEFECT / BARET' : 'OK'}`}
                className={`absolute -translate-x-1/2 -translate-y-1/2 group transition-all duration-200 ${
                  interactive ? 'cursor-pointer hover:scale-125 focus:outline-none' : 'cursor-default'
                }`}
              >
                <div
                  className={`flex items-center justify-center rounded-full font-black text-[10px] shadow-md transition-all ${
                    hasDefect
                      ? 'w-6 h-6 bg-rose-600 text-white ring-4 ring-rose-200 ring-offset-1 animate-pulse'
                      : 'w-5 h-5 bg-emerald-600 text-white ring-2 ring-emerald-200 ring-offset-0.5'
                  }`}
                >
                  {hasDefect ? '!' : idx + 1}
                </div>

                {/* Floating Tooltip Label */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 hidden group-hover:flex flex-col items-center z-30 pointer-events-none whitespace-nowrap">
                  <span className="bg-slate-900 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-lg">
                    {pt.shortLabel}: {hasDefect ? 'DEFECT' : 'OK'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Legend & Defect Details List (Right 5 Cols) */}
        <div className="col-span-12 sm:col-span-5 flex flex-col justify-between h-full space-y-2 text-xs">
          <div className="space-y-1">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1">
              Daftar Titik Pemeriksaan (9 Poin)
            </h4>
            <div className="grid grid-cols-1 gap-1 max-h-[140px] overflow-y-auto pr-1">
              {CAR_INSPECTION_POINTS.map((pt, idx) => {
                const defect = defectMap.get(pt.id);
                const isDefective = Boolean(defect);
                return (
                  <div
                    key={pt.id}
                    onClick={() => interactive && onTogglePoint?.(pt.id)}
                    className={`flex items-center justify-between p-1.5 rounded-lg border text-[11px] transition-colors ${
                      interactive ? 'cursor-pointer' : ''
                    } ${
                      isDefective
                        ? 'bg-rose-50 border-rose-300 text-rose-950 font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                        isDefective ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {idx + 1}
                      </span>
                      <span className="truncate">{pt.shortLabel}</span>
                    </div>
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                      isDefective ? 'bg-rose-600 text-white' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {isDefective ? 'DEFECT' : 'OK'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Notes summary */}
          <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-[10px] text-slate-600">
            {defectCount === 0 ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Seluruh permukaan bodi luar & interior diverifikasi mulus saat serah terima.
              </span>
            ) : (
              <div className="space-y-0.5">
                <span className="font-bold text-rose-700 block">Detail Temuan Baret:</span>
                {damages.map(d => (
                  <div key={d.partId} className="truncate text-slate-800">
                    • <strong>{CAR_INSPECTION_POINTS.find(p => p.id === d.partId)?.shortLabel || d.partId}:</strong> {d.description || 'Ada goresan/retak'}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
