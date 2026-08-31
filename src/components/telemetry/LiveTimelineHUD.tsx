import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass, 
  Activity, 
  CheckCircle2, 
  Clock, 
  Layers, 
  Wrench, 
  ShieldCheck, 
  Zap, 
  Sliders, 
  ChevronRight, 
  Info,
  Flame,
  Check
} from 'lucide-react';
import { PulsingHealthNode } from './PulsingHealthNode';
import type { WorkOrder } from '../../types';

interface LiveTimelineHUDProps {
  workOrder: WorkOrder;
  compact?: boolean;
  onActionClick?: () => void;
  className?: string;
}

export const DIESEL_PRECISION_STAGES = [
  {
    id: 1,
    code: 'STAGE_01',
    title: 'Intake & Diagnosa Awal',
    sub: 'Registrasi fisik & Serial No.',
    spec: 'Static Pressure Check',
    icon: Compass
  },
  {
    id: 2,
    code: 'STAGE_02',
    title: 'Pembongkaran & Ultrasonic',
    sub: 'Ultrasonic Bath & Micro-inspection',
    spec: 'Decomp. Tolerance ±0.02mm',
    icon: Layers
  },
  {
    id: 3,
    code: 'STAGE_03',
    title: 'Kalibrasi Bangku Tes EPS',
    sub: 'Uji Tekanan 1600-2200 Bar',
    spec: 'Common Rail / Injection Pump Test',
    icon: Activity
  },
  {
    id: 4,
    code: 'STAGE_04',
    title: 'Perakitan & Part Replacement',
    sub: 'Penggantian Nozzle / Valve Set',
    spec: 'Torque Precision Calibrated',
    icon: Wrench
  },
  {
    id: 5,
    code: 'STAGE_05',
    title: 'QC & Sertifikasi Penyerahan',
    sub: 'Uji Semprot Akhir & Serah Terima',
    spec: '99.8% Factory Standard',
    icon: ShieldCheck
  }
];

export const getWorkOrderCurrentStage = (wo: WorkOrder): number => {
  if (wo.isHandoverConfirmed) return 5;
  if (wo.status === 'COMPLETED') return 5;
  if (wo.status === 'IN_PROGRESS') {
    if (wo.calibrationData && Object.keys(wo.calibrationData).length > 0) return 4;
    return 3;
  }
  if (wo.status === 'PENDING_PARTS') return 4;
  if (wo.status === 'PENDING_APPROVAL') return 2;
  if (wo.status === 'QUEUE') return 1;
  return 1;
};

export const LiveTimelineHUD: React.FC<LiveTimelineHUDProps> = ({
  workOrder,
  compact = false,
  onActionClick,
  className = ''
}) => {
  const [activeStageDetail, setActiveStageDetail] = useState<number | null>(null);
  const currentStage = getWorkOrderCurrentStage(workOrder);

  if (compact) {
    return (
      <div className={`w-full bg-slate-950/70 border border-slate-800/80 rounded-lg p-2 ${className}`}>
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-1.5">
            <PulsingHealthNode status={workOrder.status} priority={workOrder.priority} size="xs" />
            <span className="text-[9.5px] font-mono font-bold text-slate-300 uppercase tracking-tight">
              Telemetry Flow:
            </span>
            <span className="text-[9.5px] font-mono font-black text-cyan-400">
              {DIESEL_PRECISION_STAGES[currentStage - 1]?.title}
            </span>
          </div>
          <span className="text-[8px] font-mono bg-cyan-950/80 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-800/50">
            Tahap {currentStage}/5
          </span>
        </div>

        {/* Mini 5-stage progress bar */}
        <div className="grid grid-cols-5 gap-1 items-center">
          {DIESEL_PRECISION_STAGES.map((st) => {
            const isDone = st.id < currentStage || (st.id === 5 && (workOrder.status === 'COMPLETED' || workOrder.isHandoverConfirmed));
            const isCurrent = st.id === currentStage && !(st.id === 5 && (workOrder.status === 'COMPLETED' || workOrder.isHandoverConfirmed));
            
            return (
              <div 
                key={st.id} 
                className="flex flex-col gap-0.5"
                title={`${st.code}: ${st.title}`}
              >
                <div 
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    isDone 
                      ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' 
                      : isCurrent 
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_10px_#06b6d4] animate-pulse' 
                        : 'bg-slate-800'
                  }`}
                />
                <span className={`text-[7.5px] font-mono truncate text-center ${
                  isCurrent ? 'text-cyan-300 font-bold' : isDone ? 'text-emerald-400' : 'text-slate-600'
                }`}>
                  {st.id === 3 ? 'EPS Test' : st.id === 4 ? 'Assembly' : st.id === 5 ? 'QC/Handover' : `T-${st.id}`}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full bento-card-obsidian rounded-xl p-4 sm:p-5 relative ${className}`}>
      {/* Specular corner highlight */}
      <div className="specular-rim-top-right"></div>

      {/* Header telemetry bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-slate-800/80 mb-4">
        <div className="flex items-center gap-2.5">
          <PulsingHealthNode 
            status={workOrder.status} 
            priority={workOrder.priority} 
            size="md" 
            showLabel={true} 
          />
          <div className="h-4 w-px bg-slate-800 hidden sm:block"></div>
          <div>
            <h4 className="text-xs font-black text-white font-mono tracking-tight flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              LIVE TELEMETRY WORKFLOW HUD
            </h4>
            <p className="text-[10px] text-slate-400">
              Alur pengerjaan kalibrasi presisi & pengawasan mutu berstandar EPS Indo Teknik
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-[10px]">
          <span className="px-2 py-1 rounded bg-slate-900 border border-slate-700/80 text-slate-300">
            SPK: <strong className="text-white font-bold">{workOrder.id}</strong>
          </span>
          <span className="px-2 py-1 rounded bg-cyan-950/80 border border-cyan-700/60 text-cyan-300">
            Presisi Toleransi: <strong className="text-cyan-200 font-black">99.8%</strong>
          </span>
        </div>
      </div>

      {/* Interactive Flow Diagram */}
      <div className="relative py-2">
        {/* Connection line backdrop */}
        <div className="hidden md:block absolute top-[28px] left-[40px] right-[40px] h-1 bg-slate-800 rounded-full z-0">
          {/* Active completed energy line */}
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 rounded-full transition-all duration-700 relative shadow-[0_0_12px_rgba(6,182,212,0.6)]"
            style={{ width: `${Math.min(100, Math.max(0, ((currentStage - 1) / 4) * 100))}%` }}
          >
            {/* Pulsing trace particle */}
            <motion.div 
              className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-cyan-300 shadow-[0_0_10px_#67e8f9]"
              animate={{ scale: [1, 1.4, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            />
          </div>
        </div>

        {/* 5 Stages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative z-10">
          {DIESEL_PRECISION_STAGES.map((st) => {
            const Icon = st.icon;
            const isDone = st.id < currentStage || (st.id === 5 && (workOrder.status === 'COMPLETED' || workOrder.isHandoverConfirmed));
            const isCurrent = st.id === currentStage && !(st.id === 5 && (workOrder.status === 'COMPLETED' || workOrder.isHandoverConfirmed));
            const isPending = st.id > currentStage;

            return (
              <div 
                key={st.id}
                onClick={() => setActiveStageDetail(activeStageDetail === st.id ? null : st.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between relative group ${
                  isCurrent
                    ? 'bg-slate-900/90 border-cyan-500/80 shadow-[0_0_20px_rgba(6,182,212,0.25)] ring-1 ring-cyan-400/40'
                    : isDone
                      ? 'bg-slate-900/60 border-emerald-500/40 hover:border-emerald-400/70'
                      : 'bg-slate-950/50 border-slate-800/60 hover:border-slate-700 opacity-60 hover:opacity-90'
                }`}
              >
                {/* Node icon & Number */}
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono text-xs font-black transition-all ${
                    isCurrent
                      ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_#06b6d4]'
                      : isDone
                        ? 'bg-emerald-600 text-white shadow-[0_0_8px_#10b981]'
                        : 'bg-slate-800 text-slate-400'
                  }`}>
                    {isDone ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>

                  <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                    isCurrent 
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 animate-pulse' 
                      : isDone 
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' 
                        : 'bg-slate-800 text-slate-500'
                  }`}>
                    {isCurrent ? 'ACTIVE' : isDone ? 'DONE' : 'PENDING'}
                  </span>
                </div>

                {/* Stage Info */}
                <div>
                  <span className="text-[8.5px] font-mono text-slate-500 block uppercase font-semibold">
                    {st.code}
                  </span>
                  <h5 className={`text-[11px] font-bold tracking-tight leading-snug mt-0.5 ${
                    isCurrent ? 'text-cyan-200' : isDone ? 'text-slate-200' : 'text-slate-400'
                  }`}>
                    {st.title}
                  </h5>
                  <p className="text-[9.5px] text-slate-400 mt-1 line-clamp-2">
                    {st.sub}
                  </p>
                </div>

                {/* Micro spec badge */}
                <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[8px] font-mono text-slate-500 truncate">
                    {st.spec}
                  </span>
                  <Info className="w-2.5 h-2.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expanded Stage Specs Modal / Drawer */}
      <AnimatePresence>
        {activeStageDetail && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-3 border-t border-slate-800/80 overflow-hidden"
          >
            {(() => {
              const activeInfo迷 = DIESEL_PRECISION_STAGES.find(s => s.id === activeStageDetail);
              if (!activeInfo迷) return null;

              return (
                <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 font-mono text-[10px]">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-800 rounded font-black">
                        {activeInfo迷.code} PROTOCOL
                      </span>
                      <span className="text-white font-bold text-xs">{activeInfo迷.title}</span>
                    </div>
                    <p className="text-slate-300 font-sans text-xs">
                      {activeInfo迷.sub} — Diverifikasi melalui sensor digital EPS Calibration Bench Indo Teknik.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300">
                      Standar Toleransi: <strong className="text-emerald-400">{activeInfo迷.spec}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveStageDetail(null)}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs cursor-pointer"
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
