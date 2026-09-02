import React, { useState } from 'react';
import { Stamp, Shield, Settings2, Eye, EyeOff } from 'lucide-react';

export type WatermarkPreset = 'AUTO' | 'DRAFT' | 'COMPLETED' | 'ORIGINAL' | 'PAID' | 'BRAND' | 'ARCHIVE' | 'CUSTOM' | 'NONE';

export interface WatermarkConfig {
  enabled: boolean;
  preset: WatermarkPreset;
  customText: string;
  opacity: number; // 0.08 to 0.65
  colorTheme: 'slate' | 'amber' | 'emerald' | 'blue' | 'rose' | 'indigo';
  showSubtitle: boolean;
}

export const DEFAULT_WATERMARK_CONFIG: WatermarkConfig = {
  enabled: true,
  preset: 'AUTO',
  customText: '',
  opacity: 0.18, // 18% clear visibility by default
  colorTheme: 'blue',
  showSubtitle: true,
};

interface DocumentWatermarkProps {
  config: WatermarkConfig;
  documentStatus?: string; // e.g. 'COMPLETED', 'ESTIMATE', 'DRAFT', 'READY', 'RECORDED'
  documentType?: string; // e.g. 'SPK', 'HANDOVER', 'GATE_ENTRY', 'SURAT_JALAN', 'BAST'
  className?: string;
}

/**
 * Resolves the display text and accent colors according to preset / document status.
 * Notice: config.colorTheme is respected and used directly so user color choices always take effect!
 */
export const resolveWatermarkDetails = (
  config: WatermarkConfig,
  docStatus?: string,
  docType?: string
): { mainText: string; subText?: string; colorClass: string; borderColor: string; styleColor: string } => {
  if (!config.enabled || config.preset === 'NONE') {
    return { mainText: '', colorClass: '', borderColor: '', styleColor: 'transparent' };
  }

  let text = 'INDO TEKNIK';
  let sub = 'ONE STOP SOLUTION FOR ALL YOUR DIESEL NEEDS';

  // Determine text content based on preset or document status
  if (config.preset === 'CUSTOM' && config.customText.trim()) {
    text = config.customText.toUpperCase();
    sub = 'OFFICIAL WORKSHOP DOCUMENT';
  } else if (config.preset === 'DRAFT') {
    text = 'DRAFT';
    sub = 'ESTIMASI / BELUM FINAL';
  } else if (config.preset === 'COMPLETED') {
    text = 'COMPLETED';
    sub = 'SELESAI & TERVERIFIKASI';
  } else if (config.preset === 'ORIGINAL') {
    text = 'ORIGINAL';
    sub = 'DOKUMEN ASLI RESMI';
  } else if (config.preset === 'PAID') {
    text = 'PAID / LUNAS';
    sub = 'TRANSAKSI TERKONFIRMASI';
  } else if (config.preset === 'BRAND') {
    text = 'INDO TEKNIK';
    sub = 'ONE STOP SOLUTION FOR ALL YOUR DIESEL NEEDS';
  } else if (config.preset === 'ARCHIVE') {
    text = 'ARSIP WORKSHOP';
    sub = 'INTERNAL USE ONLY';
  } else {
    // AUTO preset based on document status & type
    if (docStatus === 'COMPLETED' || docStatus === 'DONE') {
      text = 'COMPLETED';
      sub = 'PEKERJAAN SELESAI & TERVERIFIKASI';
    } else if (docStatus === 'CANCELLED') {
      text = 'CANCELLED / BATAL';
      sub = 'DOKUMEN DIBATALKAN';
    } else if (docStatus === 'ESTIMATE' || docStatus === 'DRAFT' || docStatus === 'READY') {
      text = 'DRAFT / ESTIMASI';
      sub = 'MENUNGGU PERSETUJUAN';
    } else {
      text = 'INDO TEKNIK';
      sub = 'ONE STOP SOLUTION FOR ALL YOUR DIESEL NEEDS';
    }
  }

  // Active theme directly follows user selection in config.colorTheme
  const theme = config.colorTheme || 'blue';

  const themeColors = {
    slate: { textClass: 'text-slate-900', border: 'border-slate-800', hex: 'rgba(15, 23, 42, 1)' },
    blue: { textClass: 'text-blue-900', border: 'border-blue-800', hex: 'rgba(15, 45, 89, 1)' },
    emerald: { textClass: 'text-emerald-800', border: 'border-emerald-700', hex: 'rgba(6, 95, 70, 1)' },
    amber: { textClass: 'text-amber-800', border: 'border-amber-700', hex: 'rgba(180, 83, 9, 1)' },
    rose: { textClass: 'text-rose-800', border: 'border-rose-700', hex: 'rgba(190, 18, 60, 1)' },
    indigo: { textClass: 'text-indigo-900', border: 'border-indigo-800', hex: 'rgba(49, 46, 129, 1)' },
  };

  const selected = themeColors[theme] || themeColors.blue;

  return {
    mainText: text,
    subText: sub,
    colorClass: selected.textClass,
    borderColor: selected.border,
    styleColor: selected.hex
  };
};

/**
 * The Printable high-contrast watermark backdrop layer.
 */
export const DocumentWatermark: React.FC<DocumentWatermarkProps> = ({
  config,
  documentStatus,
  documentType,
  className = '',
}) => {
  if (!config.enabled || config.preset === 'NONE') return null;

  const { mainText, subText, colorClass, borderColor, styleColor } = resolveWatermarkDetails(
    config,
    documentStatus,
    documentType
  );

  if (!mainText) return null;

  return (
    <div 
      className={`absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none flex flex-col items-center justify-center z-20 print:flex ${className}`}
      style={{
        WebkitPrintColorAdjust: 'exact',
        printColorAdjust: 'exact',
      }}
      aria-hidden="true"
    >
      <div 
        className="transform -rotate-[30deg] flex flex-col items-center justify-center transition-all duration-200 print:break-inside-avoid pointer-events-none"
        style={{
          opacity: config.opacity,
          WebkitPrintColorAdjust: 'exact',
          printColorAdjust: 'exact',
        }}
      >
        {/* Double Outline Box for Authentic Security Stamp Style */}
        <div 
          className={`border-4 sm:border-[6px] md:border-[8px] rounded-2xl sm:rounded-3xl px-6 sm:px-12 py-3 sm:py-5 text-center max-w-[95%] border-dashed ${borderColor} pointer-events-none shadow-none`}
          style={{ 
            borderColor: styleColor,
            WebkitPrintColorAdjust: 'exact',
            printColorAdjust: 'exact',
          }}
        >
          <div className="flex items-center justify-center gap-3 mb-1 pointer-events-none">
            <span 
              className={`text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-widest uppercase whitespace-nowrap font-mono ${colorClass}`}
              style={{ 
                color: styleColor, 
                textShadow: '0 0 1px currentColor, 0 0 2px currentColor' 
              }}
            >
              {mainText}
            </span>
          </div>

          {config.showSubtitle && subText && (
            <div 
              className="mt-1 pt-1 border-t-2 border-current flex items-center justify-center gap-2 pointer-events-none"
              style={{ color: styleColor }}
            >
              <span className="text-[10px] sm:text-xs md:text-sm font-black tracking-[0.2em] uppercase font-mono">
                ✦ {subText} ✦
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Floating / Embedded Interactive Watermark Customizer Control for Print Preview Bars.
 */
interface WatermarkControlProps {
  config: WatermarkConfig;
  onChange: (newConfig: WatermarkConfig) => void;
  documentStatus?: string;
  documentType?: string;
}

export const WatermarkControl: React.FC<WatermarkControlProps> = ({
  config,
  onChange,
  documentStatus,
  documentType
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const presets: { id: WatermarkPreset; label: string; badge?: string }[] = [
    { id: 'AUTO', label: 'Auto (Status)', badge: 'Default' },
    { id: 'DRAFT', label: 'Draft' },
    { id: 'COMPLETED', label: 'Completed' },
    { id: 'ORIGINAL', label: 'Original' },
    { id: 'BRAND', label: 'Indo Teknik' },
    { id: 'PAID', label: 'Paid / Lunas' },
    { id: 'ARCHIVE', label: 'Arsip' },
    { id: 'CUSTOM', label: 'Kustom...' },
    { id: 'NONE', label: 'Tanpa Watermark' },
  ];

  const opacityOptions = [
    { label: 'Halus (10%)', value: 0.10 },
    { label: 'Standar Jelas (18%)', value: 0.18 },
    { label: 'Tebal Kontras (28%)', value: 0.28 },
    { label: 'Sangat Tebal (45%)', value: 0.45 },
    { label: 'Solid Pekat (65%)', value: 0.65 },
  ];

  const colorThemes: { id: WatermarkConfig['colorTheme']; label: string; color: string }[] = [
    { id: 'blue', label: 'Indo Teknik Blue', color: 'bg-[#0F2D59]' },
    { id: 'slate', label: 'Neutral Slate', color: 'bg-slate-800' },
    { id: 'emerald', label: 'Completed Green', color: 'bg-emerald-700' },
    { id: 'amber', label: 'Draft Amber', color: 'bg-amber-600' },
    { id: 'rose', label: 'Urgent Red', color: 'bg-rose-700' },
    { id: 'indigo', label: 'Official Indigo', color: 'bg-indigo-700' },
  ];

  const currentDetails = resolveWatermarkDetails(config, documentStatus, documentType);

  return (
    <div className="relative inline-block text-left print:hidden">
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onChange({ ...config, enabled: !config.enabled })}
          className={`h-9 px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all border cursor-pointer ${
            config.enabled && config.preset !== 'NONE'
              ? 'bg-blue-950/70 border-blue-500/40 text-blue-300 hover:bg-blue-900/60 shadow-xs'
              : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
          }`}
          title={config.enabled ? 'Watermark Aktif' : 'Watermark Nonaktif'}
        >
          <Stamp className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden sm:inline">Watermark:</span>
          <span className="font-extrabold truncate max-w-[100px]">
            {config.enabled && config.preset !== 'NONE'
              ? currentDetails.mainText || 'Aktif'
              : 'Off'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`h-9 w-9 rounded-lg flex items-center justify-center border transition-all cursor-pointer ${
            isOpen
              ? 'bg-blue-600 border-blue-500 text-white shadow-md'
              : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
          }`}
          title="Pengaturan Watermark"
        >
          <Settings2 className="w-4 h-4" />
        </button>
      </div>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute right-0 mt-2 w-84 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-4 z-50 text-slate-200 text-xs space-y-3.5 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Stamp className="w-4 h-4 text-blue-400" />
                <h4 className="font-black text-white uppercase tracking-wider text-xs">
                  Pengaturan Watermark
                </h4>
              </div>
              <button
                type="button"
                onClick={() => onChange({ ...config, enabled: !config.enabled })}
                className="text-[11px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
              >
                {config.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                {config.enabled ? 'Nonaktifkan' : 'Aktifkan'}
              </button>
            </div>

            {/* Presets Grid */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                1. Pilih Teks Stempel
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {presets.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      onChange({
                        ...config,
                        enabled: p.id !== 'NONE',
                        preset: p.id
                      });
                    }}
                    className={`px-2 py-1.5 rounded-lg text-[10.5px] font-bold border transition-all text-center truncate cursor-pointer ${
                      config.preset === p.id && config.enabled
                        ? 'bg-blue-600 text-white border-blue-400 shadow-xs font-black'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Text input if CUSTOM preset selected */}
            {config.preset === 'CUSTOM' && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Teks Kustom
                </label>
                <input
                  type="text"
                  value={config.customText}
                  onChange={e => onChange({ ...config, customText: e.target.value })}
                  placeholder="Contoh: DISETUJUI, GARANSI 3 BULAN..."
                  className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>
            )}

            {/* Color Theme Selector (Always active) */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <span>2. Pilihan Warna Cap</span>
                <span className="text-blue-300 font-bold capitalize">{config.colorTheme}</span>
              </div>
              <div className="grid grid-cols-6 gap-1.5">
                {colorThemes.map(ct => (
                  <button
                    key={ct.id}
                    type="button"
                    onClick={() => onChange({ ...config, colorTheme: ct.id })}
                    className={`h-8 rounded-lg flex flex-col items-center justify-center transition-all cursor-pointer border ${
                      config.colorTheme === ct.id
                        ? 'border-blue-400 ring-2 ring-blue-500/50 bg-slate-800 scale-105 shadow-md'
                        : 'border-slate-700 bg-slate-800/80 hover:border-slate-500 opacity-80 hover:opacity-100'
                    }`}
                    title={ct.label}
                  >
                    <span className={`w-4 h-4 rounded-full ${ct.color} border border-white/20`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Opacity Selector */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <span>3. Tingkat Ketebalan & Kejelasan</span>
                <span className="text-blue-400 font-mono font-black">
                  {Math.round(config.opacity * 100)}%
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {opacityOptions.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onChange({ ...config, opacity: opt.value })}
                    className={`px-2 py-1.5 rounded-lg text-[10px] font-bold border text-center transition-all cursor-pointer ${
                      config.opacity === opt.value
                        ? 'bg-blue-600 text-white border-blue-400 shadow-xs'
                        : 'bg-slate-800/90 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Subtitle Checkbox */}
            <label className="flex items-center gap-2 pt-2 border-t border-slate-800 text-[11px] text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={config.showSubtitle}
                onChange={e => onChange({ ...config, showSubtitle: e.target.checked })}
                className="w-3.5 h-3.5 rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-0 focus:outline-none"
              />
              <span>Tampilkan Subtitle Cap Keamanan</span>
            </label>
          </div>
        </>
      )}
    </div>
  );
};
