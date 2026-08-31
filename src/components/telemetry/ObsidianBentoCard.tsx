import React from 'react';
import { PulsingHealthNode } from './PulsingHealthNode';
import { LucideIcon } from 'lucide-react';

interface ObsidianBentoCardProps {
  children: React.ReactNode;
  className?: string;
  glowVariant?: 'cyan' | 'emerald' | 'amber' | 'crimson' | 'default';
  headerTitle?: string;
  headerSubtitle?: string;
  headerBadge?: string;
  headerBadgeColor?: 'cyan' | 'emerald' | 'amber' | 'crimson' | 'slate';
  headerIcon?: LucideIcon;
  telemetryStatus?: string;
  telemetryPriority?: number;
  rightAction?: React.ReactNode;
  id?: string;
}

export const ObsidianBentoCard: React.FC<ObsidianBentoCardProps> = ({
  children,
  className = '',
  glowVariant = 'default',
  headerTitle,
  headerSubtitle,
  headerBadge,
  headerBadgeColor = 'cyan',
  headerIcon: HeaderIcon,
  telemetryStatus,
  telemetryPriority,
  rightAction,
  id
}) => {
  const rimClass = {
    cyan: 'specular-rim-top-right',
    emerald: 'specular-rim-emerald',
    amber: 'specular-rim-amber',
    crimson: 'specular-rim-crimson',
    default: 'specular-rim-top-right'
  }[glowVariant];

  const badgeClasses = {
    cyan: 'bg-cyan-950/80 border-cyan-700/60 text-cyan-300',
    emerald: 'bg-emerald-950/80 border-emerald-700/60 text-emerald-300',
    amber: 'bg-amber-950/80 border-amber-700/60 text-amber-300',
    crimson: 'bg-rose-950/80 border-rose-700/60 text-rose-300',
    slate: 'bg-slate-900 border-slate-700 text-slate-300'
  }[headerBadgeColor];

  return (
    <div 
      id={id}
      className={`bento-card-obsidian rounded-2xl p-4 sm:p-5 relative group transition-all duration-300 ${className}`}
    >
      {/* Specular corner highlight rim */}
      <div className={rimClass}></div>

      {/* Optional Card Header Bar */}
      {(headerTitle || telemetryStatus || rightAction) && (
        <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3.5 mb-3.5 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5 min-w-0">
            {telemetryStatus && (
              <PulsingHealthNode 
                status={telemetryStatus} 
                priority={telemetryPriority} 
                size="sm" 
              />
            )}
            
            {HeaderIcon && (
              <div className="w-7 h-7 rounded-lg bg-slate-800/80 border border-slate-700/70 flex items-center justify-center text-cyan-400 shrink-0">
                <HeaderIcon className="w-3.5 h-3.5" />
              </div>
            )}

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-black text-white font-mono tracking-tight uppercase truncate">
                  {headerTitle}
                </h4>
                {headerBadge && (
                  <span className={`text-[8.5px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${badgeClasses}`}>
                    {headerBadge}
                  </span>
                )}
              </div>
              {headerSubtitle && (
                <p className="text-[10px] text-slate-400 truncate">
                  {headerSubtitle}
                </p>
              )}
            </div>
          </div>

          {rightAction && (
            <div className="flex items-center gap-1.5 shrink-0">
              {rightAction}
            </div>
          )}
        </div>
      )}

      {/* Main Card Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
