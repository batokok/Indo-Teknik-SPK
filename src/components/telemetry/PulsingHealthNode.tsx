import React from 'react';
import type { Priority } from '../../types';

interface PulsingHealthNodeProps {
  status?: string;
  priority?: Priority | number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  isOverdue?: boolean;
  className?: string;
}

export const PulsingHealthNode: React.FC<PulsingHealthNodeProps> = ({
  status = 'QUEUE',
  priority = 3,
  size = 'sm',
  showLabel = false,
  isOverdue = false,
  className = ''
}) => {
  // Determine color and theme:
  // 🟢 Cyan/Emerald (99.8% Calibrated, Selesai, Siap Serah)
  // 🟡 Amber Beacon (Menunggu Part, Menunggu Persetujuan, Antrean)
  // 🔴 Crimson Laser (Darurat P1, Garansi Klaim, Overdue)
  // 🔵 Electric Cobalt (Sedang Pengerjaan, Kalibrasi Bangku Tes)

  let colorMode: 'emerald' | 'amber' | 'crimson' | 'cyan' | 'cobalt' = 'amber';
  let labelText = 'ANTREAN';
  let subLabel = 'Standby';

  if (isOverdue || priority === 1) {
    colorMode = 'crimson';
    labelText = isOverdue ? 'OVERDUE' : 'CRITICAL P1';
    subLabel = 'Prioritas Darurat';
  } else if (status === 'COMPLETED') {
    colorMode = 'emerald';
    labelText = '99.8% CALIBRATED';
    subLabel = 'Selesai Presisi';
  } else if (status === 'IN_PROGRESS' || status === 'INSPECTION' || status === 'CALIBRATION') {
    colorMode = 'cyan';
    labelText = 'LIVE TELEMETRY';
    subLabel = 'Bangku Kalibrasi Aktif';
  } else if (status === 'PENDING_APPROVAL') {
    colorMode = 'amber';
    labelText = 'APPROVAL PENDING';
    subLabel = 'Menunggu Customer';
  } else if (status === 'PENDING_PARTS') {
    colorMode = 'amber';
    labelText = 'PARTS BEACON';
    subLabel = 'Menunggu Suku Cadang';
  } else {
    colorMode = 'amber';
    labelText = 'QUEUE NODE';
    subLabel = 'Dalam Antrean';
  }

  const sizeClasses = {
    xs: 'w-2 h-2',
    sm: 'w-2.5 h-2.5',
    md: 'w-3.5 h-3.5',
    lg: 'w-5 h-5'
  };

  const coreColors = {
    emerald: 'bg-emerald-400 shadow-[0_0_10px_#10b981]',
    cyan: 'bg-cyan-400 shadow-[0_0_12px_#06b6d4]',
    amber: 'bg-amber-400 shadow-[0_0_10px_#f59e0b]',
    crimson: 'bg-rose-500 shadow-[0_0_14px_#f43f5e]',
    cobalt: 'bg-blue-400 shadow-[0_0_10px_#60a5fa]'
  };

  const ringAnimationClass = {
    emerald: 'telemetry-node-emerald',
    cyan: 'telemetry-node-cyan',
    amber: 'telemetry-node-amber',
    crimson: 'telemetry-node-crimson',
    cobalt: 'telemetry-node-cyan'
  };

  const badgeBg = {
    emerald: 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300',
    cyan: 'bg-cyan-950/80 border-cyan-500/40 text-cyan-300',
    amber: 'bg-amber-950/80 border-amber-500/40 text-amber-300',
    crimson: 'bg-rose-950/80 border-rose-500/50 text-rose-300',
    cobalt: 'bg-blue-950/80 border-blue-500/40 text-blue-300'
  };

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div className="relative flex items-center justify-center">
        {/* Radar Ring pulse */}
        <div className={`relative ${sizeClasses[size]} rounded-full ${coreColors[colorMode]} ${ringAnimationClass[colorMode]}`}>
          {/* Inner core specular white point */}
          <div className="absolute inset-0.5 rounded-full bg-white/70"></div>
        </div>
      </div>

      {showLabel && (
        <div className={`flex flex-col`}>
          <span className={`text-[9px] font-black tracking-wider uppercase font-mono px-1.5 py-0.5 rounded border ${badgeBg[colorMode]}`}>
            {labelText}
          </span>
          <span className="text-[8px] text-slate-400 font-medium tracking-tight">
            {subLabel}
          </span>
        </div>
      )}
    </div>
  );
};
