import React from 'react';
import { motion } from 'motion/react';

export const ShimmerOverlay: React.FC = () => (
  <motion.div
    initial={{ x: '-100%' }}
    animate={{ x: '100%' }}
    transition={{
      repeat: Infinity,
      duration: 1.5,
      ease: 'linear',
    }}
    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"
  />
);

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden p-4 space-y-3 relative">
    {/* Table Header Bar */}
    <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-3">
      <div className="h-5 w-48 bg-slate-800 rounded-md"></div>
      <div className="flex gap-2">
        <div className="h-7 w-24 bg-slate-800 rounded-md"></div>
        <div className="h-7 w-24 bg-slate-800 rounded-md"></div>
      </div>
    </div>

    {/* Search & Filter Bar */}
    <div className="h-10 bg-slate-800/60 rounded-lg flex items-center px-3 justify-between">
      <div className="h-4 w-64 bg-slate-700/60 rounded"></div>
      <div className="h-4 w-20 bg-slate-700/60 rounded"></div>
    </div>

    {/* Table rows */}
    <div className="space-y-2 pt-1">
      {Array.from({ length: rows }).map((_, idx) => (
        <div
          key={idx}
          className="h-14 bg-slate-800/40 rounded-lg border border-slate-800/60 flex items-center px-4 justify-between gap-4"
        >
          <div className="flex items-center gap-3 w-1/4">
            <div className="w-8 h-8 rounded-full bg-slate-700/60 shrink-0"></div>
            <div className="space-y-1.5 w-full">
              <div className="h-3.5 bg-slate-700/80 rounded w-3/4"></div>
              <div className="h-2.5 bg-slate-700/40 rounded w-1/2"></div>
            </div>
          </div>
          <div className="h-4 bg-slate-700/60 rounded w-1/5"></div>
          <div className="h-6 bg-slate-700/50 rounded-full w-24"></div>
          <div className="h-7 bg-slate-700/60 rounded-md w-20"></div>
        </div>
      ))}
    </div>

    <ShimmerOverlay />
  </div>
);

export const BentoTelemetrySkeleton: React.FC = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 mb-4 relative overflow-hidden">
    {Array.from({ length: 6 }).map((_, i) => (
      <div
        key={i}
        className="bg-slate-900 border border-slate-800/90 rounded-xl p-3 h-20 flex flex-col justify-between relative overflow-hidden"
      >
        <div className="flex justify-between items-center">
          <div className="h-2.5 bg-slate-800 rounded w-12"></div>
          <div className="w-2 h-2 rounded-full bg-slate-800"></div>
        </div>
        <div className="flex justify-between items-baseline">
          <div className="h-6 bg-slate-800 rounded w-10"></div>
          <div className="w-4 h-4 bg-slate-800 rounded"></div>
        </div>
        <ShimmerOverlay />
      </div>
    ))}
  </div>
);

export const FormCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl ring-1 ring-slate-200/80 p-6 space-y-6 relative overflow-hidden shadow-xs">
    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
      <div className="h-5 bg-slate-200 rounded w-48"></div>
      <div className="h-5 bg-slate-100 rounded w-24"></div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <div className="h-3 bg-slate-200 rounded w-28"></div>
        <div className="h-10 bg-slate-100 rounded-lg"></div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-slate-200 rounded w-28"></div>
        <div className="h-10 bg-slate-100 rounded-lg"></div>
      </div>
    </div>
    <div className="space-y-2">
      <div className="h-3 bg-slate-200 rounded w-36"></div>
      <div className="h-20 bg-slate-100 rounded-lg"></div>
    </div>
    <ShimmerOverlay />
  </div>
);
