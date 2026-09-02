import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { 
  Printer, Download, ArrowLeft, MapPin, ShieldCheck, Wrench, CheckCircle, 
  FileText, ClipboardCheck, Layers, ZoomIn, ZoomOut, Columns, Rows, Eye, Maximize2 
} from 'lucide-react';
import { SmartLogo } from './SmartLogo';
import { FuelGauge } from './FuelGauge';
import { CarInspectionMap } from './CarInspectionMap';
import { DocumentWatermark, WatermarkControl, WatermarkConfig, DEFAULT_WATERMARK_CONFIG } from './DocumentWatermark';

const formatRupiah = (value: string | number | undefined | null): string => {
  if (value === undefined || value === null) return '';
  const str = String(value).replace(/\D/g, '');
  if (!str) return '';
  const num = parseInt(str, 10);
  return 'Rp ' + num.toLocaleString('id-ID');
};

const DEFAULT_INVENTORY_ITEMS = [
  'Ban Serap',
  'Dongkrak',
  'Karpet Mobil',
  'Toolset / Perkakas',
  'Spion Luar / Dalam',
  'Racun Api (APAR)',
  'Kunci Kontak / Remote',
  'Audio / Head Unit',
  'Aki / Battery',
  'STNK Asli',
  'Buku KEUR Asli',
  'Fender Roda',
];

export const PrintTemplate: React.FC = () => {
  const { printWO, setPrintWO, printType } = useApp();
  const [watermarkConfig, setWatermarkConfig] = useState<WatermarkConfig>(DEFAULT_WATERMARK_CONFIG);
  
  // Default to 2-PAGE complete print flow
  const [spkViewMode, setSpkViewMode] = useState<'FULL_2_PAGES' | 'SPK_ONLY' | 'INSPECTION_ONLY'>('FULL_2_PAGES');
  const [previewLayout, setPreviewLayout] = useState<'STACKED' | 'SIDE_BY_SIDE'>('STACKED');
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  if (!printWO) return null;

  const TableInfo = ({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) => (
    <div className="flex justify-between items-baseline py-0.5 border-b border-dashed border-slate-200 text-xs">
      <span className="text-slate-500 font-semibold shrink-0 pr-2">{label}:</span>
      <span className={`text-right truncate font-bold ${highlight ? 'text-[#0F2D59] font-black text-xs' : 'text-slate-900'}`}>
        {value}
      </span>
    </div>
  );

  // =========================================================================
  // HANDOVER TEMPLATE (BUKTI PENYERAHAN BARANG / UNIT)
  // =========================================================================
  if (printType === 'HANDOVER') {
    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[100] overflow-y-auto print:static print:h-auto print:w-auto print:overflow-visible print:bg-white text-[#0f172a] font-sans">
        <style>{`
          @page {
            size: A4 portrait;
            margin: 8mm 10mm !important;
          }
          @media print {
            body, html {
              background-color: white !important;
              color: #0f172a !important;
              margin: 0 !important;
              padding: 0 !important;
              width: 210mm !important;
            }
            .no-print {
              display: none !important;
            }
            .print-handover-sheet {
              width: 100% !important;
              box-sizing: border-box !important;
              padding: 0 !important;
              margin: 0 !important;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
        `}</style>
        
        <div className="relative max-w-[210mm] mx-auto bg-white p-6 sm:p-8 shadow-2xl print:shadow-none print:max-w-none print:w-full print:p-0 print:m-0 print-handover-sheet">
          {/* Subtle Watermark Overlay */}
          <DocumentWatermark 
            config={watermarkConfig} 
            documentStatus="COMPLETED" 
            documentType="HANDOVER" 
          />

          <div className="relative z-1 space-y-3">
            
            {/* ACTION BAR (Hidden in print) */}
            <div className="flex justify-between items-center mb-6 print:hidden no-print border-b pb-3 bg-slate-50 -mx-6 sm:-mx-8 -mt-6 sm:-mt-8 p-4 sm:p-5 rounded-t-lg border-slate-200">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setPrintWO(null)} 
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-white text-slate-700 flex items-center gap-2 text-sm font-bold transition-colors shadow-xs cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> Kembali
                </button>
                <div>
                  <h2 className="text-base font-extrabold text-slate-800 leading-tight">Bukti Penyerahan Barang (Handover Receipt)</h2>
                  <p className="text-xs text-slate-500 font-medium">Dokumen Resmi Penyerahan Unit & Garansi</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <WatermarkControl 
                  config={watermarkConfig} 
                  onChange={setWatermarkConfig} 
                  documentStatus="COMPLETED" 
                  documentType="HANDOVER" 
                />

                <button 
                  onClick={() => window.print()} 
                  className="px-4 py-2 bg-white border border-slate-300 text-slate-800 rounded-lg hover:bg-slate-100 text-sm font-bold flex items-center gap-2 transition-colors shadow-xs cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Simpan PDF
                </button>
                <button 
                  onClick={() => window.print()} 
                  className="px-5 py-2 bg-[#0F2D59] text-white rounded-lg hover:bg-[#153a6c] text-sm font-bold flex items-center gap-2 transition-colors shadow-md cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> Cetak Dokumen
                </button>
              </div>
            </div>

            {/* HEADER AREA */}
            <div className="border-b-2 border-[#0F2D59] pb-2">
              <div className="flex justify-between items-start gap-3">
                <div className="flex-shrink min-w-0">
                  <div className="flex items-center gap-3">
                    <SmartLogo 
                      baseName="logo-indo-teknik" 
                      alt="IT INDO TEKNIK" 
                      className="h-10 w-auto object-contain flex-shrink-0" 
                      style={{ height: '36px', maxWidth: '145px' }}
                    />
                    <div className="border-l-2 border-slate-300 pl-3 leading-tight text-left">
                      <p className="text-xs font-black tracking-widest text-[#0F2D59] uppercase">INDO TEKNIK PEKANBARU</p>
                      <p className="text-[10px] font-extrabold text-[#0F2D59] mt-0.5">
                        One Stop Solution for All Your Diesel Needs
                      </p>
                      <p className="text-[9px] text-slate-600 font-semibold flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-[#E21F26] shrink-0" /> Jl. Riau Ujung No.898-904, Pekanbaru • Telp: (0761) 853798
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-1 pl-0.5">
                    <SmartLogo 
                      baseName="logo-itech" 
                      alt="ITech" 
                      className="h-7 w-auto object-contain flex-shrink-0 bg-white px-2 py-0.5 rounded border border-slate-200" 
                      style={{ height: '24px', maxWidth: '90px' }}
                    />
                    <p className="text-[9.5px] font-black tracking-wider text-[#0F2D59] whitespace-nowrap bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      ITECH AUTHORIZED DEALER & WORKSHOP
                    </p>
                  </div>
                </div>
                
                {/* WO Number Badge */}
                <div className="text-right flex flex-col items-end shrink-0 max-w-[48%]">
                  <h2 className="text-xs font-black bg-[#0F2D59] text-white px-3 py-1 rounded tracking-wider uppercase shadow-xs">
                    BUKTI SERAH TERIMA UNIT
                  </h2>
                  <div className="mt-1 bg-slate-50 border-2 border-slate-400 rounded-lg px-3 py-1 text-right">
                    <span className="text-[9px] font-black text-slate-500 uppercase block">NO. WORK ORDER:</span>
                    <span className="text-base font-mono font-black text-[#0F2D59]">{printWO.id}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* METADATA GRID */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-50/90 border border-slate-300 rounded-lg p-2.5 shadow-xs">
                <h3 className="text-[10px] font-black text-[#0F2D59] uppercase tracking-wider mb-1.5 border-b border-slate-200 pb-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span> INFORMASI PELANGGAN
                </h3>
                <TableInfo label="Nama Pelanggan" value={printWO.customerName} highlight />
                <TableInfo label="No. Telepon" value={printWO.customerPhone} />
                <TableInfo label="Alamat Pelanggan" value={printWO.customerAddress || '-'} />
                {printWO.bringerName && <TableInfo label="Nama Pembawa" value={`${printWO.bringerName} ${printWO.bringerPhone ? `(${printWO.bringerPhone})` : ''}`} />}
              </div>

              <div className="bg-slate-50/90 border border-slate-300 rounded-lg p-2.5 shadow-xs">
                <h3 className="text-[10px] font-black text-[#0F2D59] uppercase tracking-wider mb-1.5 border-b border-slate-200 pb-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-600"></span> INFORMASI KENDARAAN & UNIT
                </h3>
                <TableInfo label="No. Polisi" value={printWO.plateNumber || '-'} highlight />
                <TableInfo label="Merek / Tipe" value={printWO.vehicleBrand || '-'} />
                <TableInfo label="No. Rangka (VIN)" value={printWO.vin || '-'} />
                <TableInfo label="Odometer" value={printWO.odometer ? `${Number(printWO.odometer).toLocaleString('id-ID')} km` : '-'} />
              </div>
            </div>

            {/* SUMMARY OF SERVICE */}
            <div className="border border-slate-300 rounded-lg overflow-hidden shadow-xs">
              <div className="bg-[#0F2D59] text-white px-3 py-1 flex items-center justify-between">
                <h3 className="text-[10px] font-black uppercase tracking-wider">DETAIL REKONSILIASI & TINDAKAN PERBAIKAN</h3>
                <span className="text-[9px] text-blue-200 font-bold">Hasil Akhir Bengkel</span>
              </div>
              <div className="p-2.5 space-y-2 bg-white">
                <div>
                  <h4 className="text-[9.5px] font-black text-slate-600 uppercase tracking-wider mb-0.5">Keluhan Pelanggan yang Telah Diselesaikan:</h4>
                  <div className="bg-slate-50 border border-slate-200 rounded p-2 text-xs font-bold text-slate-900 whitespace-pre-line leading-relaxed">
                    {printWO.customerVoice || '-'}
                  </div>
                </div>

                {printWO.todoActions && printWO.todoActions.length > 0 && (
                  <div>
                    <h4 className="text-[9.5px] font-black text-slate-600 uppercase tracking-wider mb-0.5">Item Pengerjaan & Suku Cadang:</h4>
                    <div className="border border-slate-200 rounded overflow-hidden">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[9.5px]">
                          <tr>
                            <th className="py-1 px-2 text-center w-8">No</th>
                            <th className="py-1 px-2">Pengerjaan / Komponen</th>
                            <th className="py-1 px-2 text-center w-12">Qty</th>
                            <th className="py-1 px-2">Catatan Teknis</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-[10.5px]">
                          {printWO.todoActions.map((act, i) => (
                            <tr key={act.id || i} className="hover:bg-slate-50">
                              <td className="py-0.5 px-2 text-slate-500 text-center font-mono">{i + 1}</td>
                              <td className="py-0.5 px-2 font-bold text-slate-900">{act.jenisPengerjaan}</td>
                              <td className="py-0.5 px-2 text-center font-bold text-slate-800">{act.qty}</td>
                              <td className="py-0.5 px-2 text-slate-600 text-[10px]">{act.catatanMekanik || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* WARRANTY & POLICY NOTICE */}
            <div className="border border-emerald-300 bg-emerald-50/60 rounded-lg p-2 flex items-start gap-2 shadow-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div className="text-[9.5px] text-emerald-950 leading-relaxed">
                <p className="font-black text-emerald-900 uppercase">Jaminan Kualitas & Ketentuan Garansi Resmi:</p>
                <p className="mt-0.5">
                  Unit/komponen telah diuji dan dikalibrasi sesuai standar presisi ITech Authorized Workshop. Pelanggan berhak atas garansi pengerjaan sesuai nota kesepakatan servis.
                </p>
              </div>
            </div>

            {/* RECEIPT CLAUSE */}
            <div className="border border-slate-200 bg-slate-50 rounded-lg p-2 text-[9px] text-slate-700 leading-relaxed shadow-xs">
              <p className="font-bold text-slate-900 mb-0.5">Pernyataan Serah Terima:</p>
              <p>
                Dengan menandatangani dokumen ini, Pelanggan menyatakan telah menerima kembali unit / komponen kendaraan di atas dalam kondisi baik, lengkap, dan telah dilakukan uji fungsi bersama pihak Indo Teknik Pekanbaru.
              </p>
            </div>

            {/* HANDOVER DATE AND SIGNATURES */}
            <div className="border-t-2 border-slate-300 pt-2 shrink-0 print:break-inside-avoid">
              <div className="flex justify-between items-center text-[9px] text-slate-600 mb-1.5 font-mono">
                <span>Waktu Serah Terima: <strong>{printWO.handoverDate ? new Date(printWO.handoverDate).toLocaleString('id-ID') : new Date().toLocaleString('id-ID')} WIB</strong></span>
                <span className="font-bold">Dicetak Resmi via Indo Teknik ERP</span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="border border-slate-300 rounded-lg p-2 bg-slate-50/60 shadow-xs">
                  <span className="text-[10px] font-black text-slate-800 uppercase tracking-wider block">PIHAK BENGKEL (INDO TEKNIK)</span>
                  <div className="h-10 border-b border-slate-400 my-1 flex items-end justify-center pb-0.5 text-[8px] text-slate-400">
                    (Tanda Tangan & Stempel)
                  </div>
                  <div className="text-xs font-bold text-slate-900">
                    Front Office / Service Advisor
                  </div>
                </div>

                <div className="border border-slate-300 rounded-lg p-2 bg-slate-50/60 shadow-xs">
                  <span className="text-[10px] font-black text-slate-800 uppercase tracking-wider block">PIHAK PELANGGAN / CUSTOMER</span>
                  <div className="h-10 border-b border-slate-400 my-1 flex items-end justify-center pb-0.5 text-[8px] text-slate-400">
                    (Tanda Tangan & Nama Terang)
                  </div>
                  <div className="text-xs font-bold text-slate-950 truncate">
                    {printWO.customerName}
                  </div>
                </div>
              </div>

              <div className="text-center mt-1.5 text-[8.5px] text-slate-500 border-t border-slate-200 pt-1 font-mono">
                Indo Teknik Pekanbaru • One Stop Solution for All Your Diesel Needs • Jl. Riau Ujung No.898-904 Pekanbaru • Telp: (0761) 853798
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // WORK ORDER & INSPECTION DATA PREPARATION
  // =========================================================================

  const todoList = printWO.todoActions || [];
  const damagesList = printWO.damages || [];
  const inventoryList = printWO.inventory || [];
  const loosePartsList = printWO.looseParts || [];

  const isInventoryChecked = (itemName: string) => {
    const found = inventoryList.find(i => i.name.toLowerCase() === itemName.toLowerCase());
    return Boolean(found?.checked);
  };

  const totalEstimation = todoList.reduce((sum, item) => {
    const minVal = parseInt(String(item.estimasiHargaMin || item.estimasiHarga || '0').replace(/\D/g, ''), 10) || 0;
    return sum + minVal;
  }, 0);

  // =========================================================================
  // PAGE 1: SURAT PERINTAH KERJA (SPK DOKUMEN BENGKEL)
  // =========================================================================
  const renderSPKPage1 = () => (
    <div className="relative print-page print-page-1 space-y-2.5 box-border">
      {/* Watermark */}
      <DocumentWatermark 
        config={watermarkConfig} 
        documentStatus={printWO.status} 
        documentType="SPK" 
      />

      <div className="relative z-1 space-y-2">
        {/* Header SPK */}
        <div className="border-b-2 border-[#0F2D59] pb-2">
          <div className="flex justify-between items-start gap-3">
            <div className="flex-shrink min-w-0">
              <div className="flex items-center gap-3">
                <SmartLogo 
                  baseName="logo-indo-teknik" 
                  alt="IT INDO TEKNIK" 
                  className="h-10 w-auto object-contain flex-shrink-0" 
                  style={{ height: '36px', maxWidth: '145px' }}
                />
                <div className="border-l-2 border-slate-300 pl-3 leading-tight text-left">
                  <p className="text-xs font-black tracking-widest text-[#0F2D59] uppercase">INDO TEKNIK PEKANBARU</p>
                  <p className="text-[10px] font-extrabold text-[#0F2D59] mt-0.5">
                    One Stop Solution for All Your Diesel Needs
                  </p>
                  <p className="text-[9px] text-slate-600 font-semibold flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-[#E21F26] shrink-0" /> Jl. Riau Ujung No.898-904, Pekanbaru • Telp: (0761) 853798
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-1 pl-0.5">
                <SmartLogo 
                  baseName="logo-itech" 
                  alt="ITech" 
                  className="h-7 w-auto object-contain flex-shrink-0 bg-white px-2 py-0.5 rounded border border-slate-200" 
                  style={{ height: '24px', maxWidth: '90px' }}
                />
                <p className="text-[9.5px] font-black tracking-wider text-[#0F2D59] whitespace-nowrap bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  ITECH AUTHORIZED DEALER & WORKSHOP
                </p>
              </div>
            </div>
            
            {/* Header Right / WO Number */}
            <div className="text-right flex flex-col items-end shrink-0 max-w-[48%]">
              <div className="flex items-center justify-end gap-2 flex-wrap">
                <h2 className="text-xs font-black bg-[#0F2D59] text-white px-3 py-1 rounded tracking-wider uppercase shadow-xs">
                  SURAT PERINTAH KERJA (SPK)
                </h2>
                <span className="text-[9px] font-black bg-blue-100 text-blue-950 border border-blue-300 px-2 py-0.5 rounded uppercase shrink-0">
                  HALAMAN 1 • SPK
                </span>
              </div>

              <div className="mt-1 flex items-center gap-2 bg-slate-50 border-2 border-slate-400 rounded-lg px-3 py-1 shadow-xs">
                <span className="text-[9.5px] font-black text-slate-600 uppercase">NO. WO:</span>
                <span className="text-base sm:text-lg font-mono font-black text-[#0F2D59] tracking-tight">{printWO.id}</span>
              </div>

              <div className="text-[9px] text-slate-600 font-bold mt-0.5 font-mono">
                Tanggal: {new Date(printWO.createdAt || Date.now()).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 1: CUSTOMER & VEHICLE PROFILE GRID */}
        <div className="grid grid-cols-12 gap-2 text-xs">
          {/* Customer Box (6 Cols) */}
          <div className="col-span-6 border border-slate-300 bg-slate-50/90 rounded-lg p-2 shadow-xs">
            <h3 className="font-black border-b border-slate-300 pb-0.5 mb-1 text-[#0F2D59] text-[10px] uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span> DATA PELANGGAN & PEMBAWA
            </h3>
            <div className="space-y-0.5 text-xs">
              <div className="flex justify-between items-baseline gap-2">
                <span className="text-slate-500 font-semibold shrink-0 text-[10px]">Pelanggan:</span>
                <span className="font-black text-slate-950 text-right truncate text-xs">{printWO.customerName}</span>
              </div>
              <div className="flex justify-between items-baseline gap-2">
                <span className="text-slate-500 font-semibold shrink-0 text-[10px]">Telepon:</span>
                <span className="font-bold text-slate-800 text-right font-mono text-[11px]">{printWO.customerPhone || '-'}</span>
              </div>
              <div className="flex justify-between items-baseline gap-2">
                <span className="text-slate-500 font-semibold shrink-0 text-[10px]">Alamat:</span>
                <span className="text-slate-700 text-right truncate text-[10.5px] max-w-[210px]">{printWO.customerAddress || '-'}</span>
              </div>
              {printWO.bringerName && (
                <div className="flex justify-between items-baseline gap-2 pt-0.5 border-t border-slate-200">
                  <span className="text-blue-800 font-bold shrink-0 text-[10px]">Pembawa:</span>
                  <span className="font-bold text-slate-900 text-right truncate text-[10.5px]">
                    {printWO.bringerName} {printWO.bringerPhone ? `(${printWO.bringerPhone})` : ''}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Vehicle Box (6 Cols) */}
          <div className="col-span-6 border border-slate-300 bg-slate-50/90 rounded-lg p-2 shadow-xs">
            <h3 className="font-black border-b border-slate-300 pb-0.5 mb-1 text-[#0F2D59] text-[10px] uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-600"></span> IDENTITAS KENDARAAN / UNIT
            </h3>
            <div className="space-y-0.5 text-xs">
              <div className="flex justify-between items-baseline gap-2">
                <span className="text-slate-500 font-semibold shrink-0 text-[10px]">No. Polisi:</span>
                <span className="font-black text-blue-950 text-right font-mono text-sm tracking-wide bg-blue-50 px-1.5 rounded border border-blue-200">
                  {printWO.plateNumber || '-'}
                </span>
              </div>
              <div className="flex justify-between items-baseline gap-2">
                <span className="text-slate-500 font-semibold shrink-0 text-[10px]">Merek / Tipe:</span>
                <span className="font-bold text-slate-900 text-right truncate text-xs">{printWO.vehicleBrand || '-'}</span>
              </div>
              <div className="flex justify-between items-baseline gap-2">
                <span className="text-slate-500 font-semibold shrink-0 text-[10px]">No. Rangka (VIN):</span>
                <span className="font-mono text-slate-800 text-right truncate text-[10.5px]">{printWO.vin || '-'}</span>
              </div>
              <div className="flex justify-between items-baseline gap-2">
                <span className="text-slate-500 font-semibold shrink-0 text-[10px]">Odometer:</span>
                <span className="font-bold text-slate-800 text-right text-[10.5px]">
                  {printWO.odometer ? `${Number(printWO.odometer).toLocaleString('id-ID')} km` : '-'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: KELUHAN AWAL */}
        <div className="border border-slate-300 bg-white rounded-lg p-2 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-0.5 mb-1">
            <h3 className="text-[10px] font-black text-[#0F2D59] uppercase tracking-wider flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-amber-600" /> KELUHAN / GEJALA KERUSAKAN AWAL (CUSTOMER VOICE)
            </h3>
            <span className="text-[9px] font-bold text-slate-500 uppercase">
              Metode: {printWO.dropMethod === 'PARTS' ? 'KOMPONEN COPOTAN' : 'MOBIL UTUH'}
            </span>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded p-1.5 text-[11px] font-bold text-slate-900 leading-relaxed whitespace-pre-line">
            {printWO.customerVoice || 'Tidak ada catatan keluhan spesifik yang didaftarkan.'}
          </div>
        </div>

        {/* SECTION 3A: DAFTAR KOMPONEN COPOTAN (JIKA ADA LOOSE PARTS) */}
        {loosePartsList.length > 0 && (
          <div className="border border-slate-300 rounded-lg overflow-hidden shadow-xs">
            <div className="bg-[#0F2D59] text-white px-2.5 py-0.5 flex items-center justify-between">
              <h3 className="text-[9.5px] font-black uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle className="w-3 h-3 text-emerald-400" /> DAFTAR KOMPONEN DITERIMA & SERIALISASI ({loosePartsList.length} PCS)
              </h3>
              <span className="text-[8.5px] text-blue-200 font-bold font-mono">
                {loosePartsList.length} Item Fisik
              </span>
            </div>

            <div className="p-0.5 bg-white">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300 text-[9.5px]">
                  <tr>
                    <th className="py-0.5 px-2 text-center w-8">No</th>
                    <th className="py-0.5 px-2">Deskripsi / Komponen</th>
                    <th className="py-0.5 px-2 w-48">Part Number (P/N) / Serial</th>
                    <th className="py-0.5 px-2 text-center w-28">Kondisi Intake</th>
                  </tr>
                </thead>
                <tbody className={`divide-y divide-slate-200 ${loosePartsList.length > 6 ? 'text-[9.5px]' : 'text-[10.5px]'}`}>
                  {loosePartsList.map((lp, idx) => (
                    <tr key={lp.id || idx} className="hover:bg-slate-50">
                      <td className="py-0.5 px-2 text-slate-500 font-bold text-center font-mono">{idx + 1}</td>
                      <td className="py-0.5 px-2 font-black text-slate-900">{lp.description || `Komponen #${idx + 1}`}</td>
                      <td className="py-0.5 px-2 font-mono font-bold text-blue-900">{lp.partNumber || '-'}</td>
                      <td className="py-0.5 px-2 text-center">
                        <span className={`inline-block px-1.5 py-0.2 rounded text-[8.5px] font-black uppercase border ${
                          lp.physicalCondition === 'OK' 
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                            : 'bg-amber-50 text-amber-800 border-amber-300'
                        }`}>
                          {lp.physicalCondition || 'OK'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SECTION 3B: RINCIAN PENGERJAAN & ESTIMASI BIAYA */}
        <div className="border border-slate-300 rounded-lg overflow-hidden shadow-xs">
          <div className="bg-[#0F2D59] text-white px-2.5 py-0.5 flex items-center justify-between">
            <h3 className="text-[9.5px] font-black uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle className="w-3 h-3 text-emerald-400" /> LINGKUP PENGERJAAN, JASA SERVIS & ESTIMASI SUKU CADANG
            </h3>
            <span className="text-[8.5px] text-blue-200 font-bold font-mono">
              {todoList.length} Item Tindakan
            </span>
          </div>

          <div className="p-0.5 bg-white">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300 text-[9.5px]">
                <tr>
                  <th className="py-0.5 px-2 text-center w-8">No</th>
                  <th className="py-0.5 px-2">Jenis Pengerjaan / Tindakan</th>
                  <th className="py-0.5 px-2 text-center w-12">Qty</th>
                  <th className="py-0.5 px-2">Catatan Mekanik / Spesifikasi</th>
                  <th className="py-0.5 px-2 text-right w-28">Estimasi Biaya</th>
                </tr>
              </thead>
              <tbody className={`divide-y divide-slate-200 ${todoList.length > 6 ? 'text-[9.5px]' : 'text-[10.5px]'}`}>
                {todoList.length > 0 ? (
                  todoList.map((act, idx) => (
                    <tr key={act.id || idx} className="hover:bg-slate-50">
                      <td className="py-0.5 px-2 text-slate-500 font-bold text-center font-mono">{idx + 1}</td>
                      <td className="py-0.5 px-2 font-black text-slate-900">{act.jenisPengerjaan || 'Pemeriksaan & Servis'}</td>
                      <td className="py-0.5 px-2 text-center font-bold text-slate-800">{act.qty || 1}</td>
                      <td className="py-0.5 px-2 text-slate-600 text-[9.5px]">{act.catatanMekanik || '-'}</td>
                      <td className="py-0.5 px-2 text-right font-mono font-bold text-slate-900">
                        {formatRupiah(act.estimasiHargaMin || act.estimasiHarga) || '-'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-2 px-2 text-center text-slate-500 italic text-[10px]">
                      Tahap diagnosa & estimasi rincian pengerjaan sedang diproses oleh Foreman/Mekanik.
                    </td>
                  </tr>
                )}
              </tbody>
              {totalEstimation > 0 && (
                <tfoot className="bg-slate-100 border-t-2 border-slate-300 text-xs font-black">
                  <tr>
                    <td colSpan={4} className="py-0.5 px-2 text-right uppercase text-slate-800 text-[9.5px]">
                      Total Estimasi Biaya Sementara:
                    </td>
                    <td className="py-0.5 px-2 text-right font-mono text-[#0F2D59] text-xs">
                      {formatRupiah(totalEstimation)}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

        {/* SECTION 4: SYARAT & KETENTUAN SPK */}
        <div className="border border-slate-300 bg-slate-50/80 rounded-lg p-1.5 text-[8px] text-slate-600 leading-snug shadow-xs">
          <span className="font-black text-slate-900 uppercase block mb-0.5">Ketentuan Layanan Bengkel:</span>
          <p>
            1. Pekerjaan dikerjakan sesuai estimasi dan persetujuan pelanggan. 2. Pihak bengkel tidak bertanggung jawab atas kehilangan barang berharga yang tidak tertera pada checklist. 3. Unit yang telah selesai harus diambil paling lambat 7 hari kerja setelah konfirmasi penyelesaian.
          </p>
        </div>
      </div>

      {/* SECTION 5: TANDA TANGAN 3 PIHAK */}
      <div className="border-t-2 border-slate-400 pt-1.5 shrink-0 print:break-inside-avoid">
        <div className="grid grid-cols-3 gap-2.5 text-center">
          {/* 1. Customer */}
          <div className="border border-slate-300 rounded-lg p-1.5 bg-slate-50/60 shadow-xs">
            <p className="text-[9px] font-black text-slate-900 uppercase">Pemberi Order / Pelanggan</p>
            <div className="h-9 border-b border-slate-400 my-1 flex items-end justify-center pb-0.5 text-[7.5px] text-slate-400">
              (Tanda Tangan & Nama Terang)
            </div>
            <p className="font-bold text-slate-950 text-[9.5px] truncate">{printWO.customerName}</p>
          </div>

          {/* 2. Service Advisor */}
          <div className="border border-slate-300 rounded-lg p-1.5 bg-slate-50/60 shadow-xs">
            <p className="text-[9px] font-black text-slate-900 uppercase">Service Advisor (SA)</p>
            <div className="h-9 border-b border-slate-400 my-1 flex items-end justify-center pb-0.5 text-[7.5px] text-slate-400">
              (Tanda Tangan & Stempel)
            </div>
            <p className="font-bold text-slate-950 text-[9.5px]">Front Office Staff</p>
          </div>

          {/* 3. Foreman / Mechanic */}
          <div className="border border-slate-300 rounded-lg p-1.5 bg-slate-50/60 shadow-xs">
            <p className="text-[9px] font-black text-slate-900 uppercase">Foreman / Kepala Bengkel</p>
            <div className="h-9 border-b border-slate-400 my-1 flex items-end justify-center pb-0.5 text-[7.5px] text-slate-400">
              (Tanda Tangan Verifikasi)
            </div>
            <p className="font-bold text-slate-950 text-[9.5px]">Divisi Produksi</p>
          </div>
        </div>

        {/* Document Footer */}
        <div className="flex justify-between items-center text-[7.5px] text-slate-500 border-t border-slate-200 pt-0.5 mt-1 font-mono">
          <span>Indo Teknik Pekanbaru • One Stop Solution for All Your Diesel Needs</span>
          <span className="font-bold text-slate-800">SPK Halaman 1 • Dicetak: {new Date().toLocaleString('id-ID')} WIB</span>
        </div>
      </div>
    </div>
  );

  // =========================================================================
  // PAGE 2: LEMBAR PEMERIKSAAN KENDARAAN (VEHICLE INSPECTION & BODY MAP)
  // =========================================================================
  const renderInspectionPage2 = () => (
    <div className="relative print-page space-y-2.5 box-border">
      {/* Watermark */}
      <DocumentWatermark 
        config={watermarkConfig} 
        documentStatus={printWO.status} 
        documentType="INSPECTION" 
      />

      <div className="relative z-1 space-y-2">
        {/* Header Page 2 */}
        <div className="border-b-2 border-[#0F2D59] pb-2">
          <div className="flex justify-between items-start gap-3">
            <div className="flex-shrink min-w-0">
              <div className="flex items-center gap-3">
                <SmartLogo 
                  baseName="logo-indo-teknik" 
                  alt="IT INDO TEKNIK" 
                  className="h-10 w-auto object-contain flex-shrink-0" 
                  style={{ height: '36px', maxWidth: '145px' }}
                />
                <div className="border-l-2 border-slate-300 pl-3 leading-tight text-left">
                  <p className="text-xs font-black tracking-widest text-[#0F2D59] uppercase">INDO TEKNIK PEKANBARU</p>
                  <p className="text-[10px] font-extrabold text-[#0F2D59] mt-0.5">
                    One Stop Solution for All Your Diesel Needs
                  </p>
                  <p className="text-[9px] text-slate-600 font-semibold flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-[#E21F26] shrink-0" /> Jl. Riau Ujung No.898-904, Pekanbaru • Telp: (0761) 853798
                  </p>
                </div>
              </div>
            </div>
            
            <div className="text-right flex flex-col items-end shrink-0 max-w-[48%]">
              <div className="flex items-center justify-end gap-2 flex-wrap">
                <h2 className="text-xs font-black bg-[#0F2D59] text-white px-3 py-1 rounded tracking-wider uppercase shadow-xs">
                  LEMBAR PEMERIKSAAN KENDARAAN
                </h2>
                <span className="text-[9px] font-black bg-blue-100 text-blue-950 border border-blue-300 px-2 py-0.5 rounded uppercase shrink-0">
                  HALAMAN 2 • INSPEKSI
                </span>
              </div>
              <div className="mt-1 flex items-center gap-2 bg-slate-50 border-2 border-slate-400 rounded-lg px-3 py-1">
                <span className="text-[9.5px] font-black text-slate-600 uppercase">NO. WO:</span>
                <span className="text-base font-mono font-black text-[#0F2D59]">{printWO.id}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Grid Compact */}
        <div className="grid grid-cols-12 gap-2 text-xs">
          <div className="col-span-6 border border-slate-300 bg-slate-50/90 rounded-lg p-2">
            <TableInfo label="Pelanggan" value={printWO.customerName} highlight />
            <TableInfo label="Telepon" value={printWO.customerPhone || '-'} />
            <TableInfo label="Alamat" value={printWO.customerAddress || '-'} />
          </div>
          <div className="col-span-6 border border-slate-300 bg-slate-50/90 rounded-lg p-2">
            <TableInfo label="No. Polisi" value={printWO.plateNumber || '-'} highlight />
            <TableInfo label="Merek / Tipe" value={printWO.vehicleBrand || '-'} />
            <TableInfo label="Odometer" value={printWO.odometer ? `${Number(printWO.odometer).toLocaleString('id-ID')} km` : '-'} />
          </div>
        </div>

        {/* Car Inspection Visual Map & Fuel Grid */}
        <div className="grid grid-cols-12 gap-2.5">
          {/* Visual Body Diagram (7 Cols) */}
          <div className="col-span-7 border border-slate-300 rounded-lg p-2 bg-white shadow-xs">
            <h3 className="text-[10px] font-black text-[#0F2D59] uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span> DENAH PEMERIKSAAN KONDISI FISIK BODI KENDARAAN
            </h3>
            <div className="flex items-center justify-center p-1.5 bg-slate-50 rounded border border-slate-200">
              <CarInspectionMap
                damages={printWO.damages || []}
                onAddDamage={() => {}}
                onRemoveDamage={() => {}}
                readonly={true}
              />
            </div>
          </div>

          {/* Fuel & Physical Damage Notes (5 Cols) */}
          <div className="col-span-5 flex flex-col justify-between gap-2">
            {/* Fuel Box */}
            <div className="border border-slate-300 rounded-lg p-2 bg-white shadow-xs">
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-[9.5px] font-black text-[#0F2D59] uppercase tracking-wider">
                  KONDISI BAHAN BAKAR (BBM)
                </h3>
                <span className="text-[9px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-300">
                  Level: {printWO.fuelLevel || '1/2'}
                </span>
              </div>
              <div className="bg-slate-50 p-1 rounded border border-slate-200">
                <FuelGauge level={printWO.fuelLevel || '1/2'} onChange={() => {}} readonly={true} />
              </div>
            </div>

            {/* Physical damages notes */}
            <div className="border border-slate-300 rounded-lg p-2 bg-slate-50 flex-1 shadow-xs">
              <h3 className="text-[9.5px] font-black text-[#0F2D59] uppercase tracking-wider mb-1">
                CATATAN KERUSAKAN / GORESAN BODI
              </h3>
              {damagesList.length > 0 ? (
                <ul className="text-[9px] text-slate-800 space-y-0.5 max-h-24 overflow-y-auto">
                  {damagesList.map((dmg, i) => (
                    <li key={i} className="flex items-start gap-1">
                      <span className="text-red-600 font-bold">•</span>
                      <span><strong>{dmg.partId}:</strong> {dmg.description}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[9px] text-slate-500 italic">Tidak ada catatan kerusakan fisik bodi teridentifikasi saat serah terima awal.</p>
              )}
            </div>
          </div>
        </div>

        {/* Full Inventory Items */}
        <div className="border border-slate-300 rounded-lg p-2 bg-white shadow-xs">
          <h3 className="text-[9.5px] font-black text-[#0F2D59] uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span> CHECKLIST KELENGKAPAN & INVENTARIS UNIT
          </h3>
          <div className="grid grid-cols-4 gap-1 text-[9px]">
            {DEFAULT_INVENTORY_ITEMS.map((item) => {
              const checked = isInventoryChecked(item);
              return (
                <div key={item} className={`flex items-center gap-1 px-1.5 py-0.5 rounded border ${checked ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-950' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                  <span className={`w-3 h-3 rounded-full flex items-center justify-center text-[7.5px] font-black ${checked ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                    {checked ? '✓' : '✗'}
                  </span>
                  <span className="truncate">{item}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Serah Terima Notes */}
        <div className="border border-slate-200 bg-slate-50 rounded-lg p-1.5 text-[8.5px] text-slate-700 leading-snug">
          <span className="font-bold text-slate-900">Pernyataan Kesepakatan Kondisi Fisik: </span>
          Kondisi fisik bodi, kelengkapan inventaris, dan level bahan bakar di atas telah diperiksa bersama secara seksama antara Pelanggan/Pembawa Unit dan Service Advisor Indo Teknik saat penerimaan unit.
        </div>
      </div>

      {/* Bottom Signatures Page 2 */}
      <div className="border-t-2 border-slate-400 pt-1.5 shrink-0 print:break-inside-avoid">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="border border-slate-300 rounded-lg p-1.5 bg-slate-50/60 shadow-xs">
            <p className="text-[9.5px] font-black text-slate-900 uppercase">Pelanggan / Pembawa Unit</p>
            <div className="h-10 border-b border-slate-400 my-1 flex items-end justify-center pb-0.5 text-[8px] text-slate-400">
              (Tanda Tangan & Nama Terang)
            </div>
            <p className="font-bold text-slate-950 text-[10px] truncate">{printWO.customerName}</p>
          </div>

          <div className="border border-slate-300 rounded-lg p-1.5 bg-slate-50/60 shadow-xs">
            <p className="text-[9.5px] font-black text-slate-900 uppercase">Service Advisor (Indo Teknik)</p>
            <div className="h-10 border-b border-slate-400 my-1 flex items-end justify-center pb-0.5 text-[8px] text-slate-400">
              (Tanda Tangan & Stempel)
            </div>
            <p className="font-bold text-slate-950 text-[10px]">Front Office Staff</p>
          </div>
        </div>

        <div className="flex justify-between items-center text-[7.5px] text-slate-500 border-t border-slate-200 pt-0.5 mt-1 font-mono">
          <span>Indo Teknik Pekanbaru • One Stop Solution for All Your Diesel Needs</span>
          <span className="font-bold text-slate-800">Lembar Pemeriksaan Halaman 2 • Dicetak: {new Date().toLocaleString('id-ID')} WIB</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[100] overflow-y-auto print:static print:h-auto print:w-auto print:overflow-visible print:bg-white text-[#0f172a] font-sans">
      <style>{`
        @page {
          size: A4 portrait;
          margin: 8mm 10mm !important;
        }
        @media print {
          html, body {
            width: 210mm !important;
            margin: 0 !important;
            padding: 0 !important;
            background-color: white !important;
            color: #0f172a !important;
          }
          .no-print {
            display: none !important;
          }
          .print-wrapper {
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          .print-page {
            width: 100% !important;
            box-sizing: border-box !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .print-page-1 {
            page-break-after: always !important;
            break-after: page !important;
          }
          .page-break-divider {
            display: none !important;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      <div className={`w-full mx-auto bg-white p-6 sm:p-8 shadow-2xl print:shadow-none print:max-w-none print:w-full print:p-0 print:m-0 print-wrapper box-border ${
        previewLayout === 'SIDE_BY_SIDE' && spkViewMode === 'FULL_2_PAGES'
          ? 'max-w-[450mm]'
          : 'max-w-[210mm]'
      }`}
      style={{
        transform: zoomLevel !== 100 ? `scale(${zoomLevel / 100})` : undefined,
        transformOrigin: 'top center',
        transition: 'transform 0.2s ease-out',
      }}
      >
        
        {/* ================= ACTION BAR (Hidden in print) ================= */}
        <div className="flex flex-wrap justify-between items-center gap-3 mb-6 print:hidden no-print border-b pb-3 bg-slate-50 -mx-6 sm:-mx-8 -mt-6 sm:-mt-8 p-4 sm:p-5 rounded-t-lg border-slate-200">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setPrintWO(null)} 
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-white text-slate-700 flex items-center gap-2 text-sm font-bold transition-colors shadow-xs cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Kembali
            </button>
            <div>
              <h2 className="text-base font-extrabold text-slate-800 leading-tight">Pratinjau Cetak Surat Perintah Kerja (SPK)</h2>
              <p className="text-xs text-slate-500 font-medium">Dokumen Resmi Workshop & Konsumen (2 Halaman A4)</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Switcher */}
            <div className="flex bg-slate-200 p-1 rounded-lg border border-slate-300 text-xs font-bold">
              <button
                type="button"
                onClick={() => setSpkViewMode('FULL_2_PAGES')}
                className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                  spkViewMode === 'FULL_2_PAGES'
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" /> 2 Hal Lengkap
              </button>
              <button
                type="button"
                onClick={() => setSpkViewMode('SPK_ONLY')}
                className={`px-2.5 py-1.5 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                  spkViewMode === 'SPK_ONLY'
                    ? 'bg-white text-[#0F2D59] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" /> Hal 1 Saja
              </button>
              <button
                type="button"
                onClick={() => setSpkViewMode('INSPECTION_ONLY')}
                className={`px-2.5 py-1.5 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                  spkViewMode === 'INSPECTION_ONLY'
                    ? 'bg-white text-[#0F2D59] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ClipboardCheck className="w-3.5 h-3.5" /> Hal 2 Saja
              </button>
            </div>

            {/* Layout Toggle (Stacked vs Side-by-Side) */}
            {spkViewMode === 'FULL_2_PAGES' && (
              <div className="hidden lg:flex bg-slate-200 p-1 rounded-lg border border-slate-300 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setPreviewLayout('STACKED')}
                  title="Tampilan Bertingkat (Vertikal)"
                  className={`p-1.5 rounded-md transition-all cursor-pointer ${
                    previewLayout === 'STACKED' ? 'bg-white text-[#0F2D59] shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Rows className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewLayout('SIDE_BY_SIDE')}
                  title="Tampilan Berdampingan (Side-by-Side 2 Halaman)"
                  className={`p-1.5 rounded-md transition-all cursor-pointer ${
                    previewLayout === 'SIDE_BY_SIDE' ? 'bg-white text-[#0F2D59] shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Columns className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Zoom Controls */}
            <div className="flex items-center bg-slate-200 p-1 rounded-lg border border-slate-300 text-xs font-bold">
              <button
                type="button"
                onClick={() => setZoomLevel(prev => Math.max(50, prev - 15))}
                title="Zoom Out"
                disabled={zoomLevel <= 50}
                className="p-1.5 text-slate-700 hover:text-slate-900 disabled:opacity-40 cursor-pointer"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(100)}
                title="Reset Zoom (100%)"
                className="px-1.5 text-[11px] text-slate-800 font-mono font-black hover:text-blue-900 cursor-pointer"
              >
                {zoomLevel}%
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(prev => Math.min(130, prev + 15))}
                title="Zoom In"
                disabled={zoomLevel >= 130}
                className="p-1.5 text-slate-700 hover:text-slate-900 disabled:opacity-40 cursor-pointer"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Watermark Control */}
            <WatermarkControl 
              config={watermarkConfig} 
              onChange={setWatermarkConfig} 
              documentStatus={printWO.status} 
              documentType="SPK" 
            />

            <button 
              onClick={() => window.print()} 
              className="h-10 px-4 bg-white hover:bg-rose-50 border-2 border-rose-500/90 hover:border-rose-600 text-rose-700 hover:text-rose-800 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-xs transition-all active:scale-95 cursor-pointer"
              title="Simpan atau Ekspor SPK sebagai file PDF"
            >
              <Download className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Simpan PDF</span>
            </button>

            <button 
              onClick={() => window.print()} 
              className="h-11 px-6 bg-[#0F2D59] hover:bg-[#16427e] text-white rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider flex items-center gap-2.5 transition-all shadow-lg shadow-[#0F2D59]/30 ring-2 ring-blue-400/40 ring-offset-2 active:scale-95 cursor-pointer"
              title="Cetak SPK Fisik ke Printer"
            >
              <Printer className="w-4.5 h-4.5 text-blue-200 shrink-0" />
              <span>
                {spkViewMode === 'FULL_2_PAGES' 
                  ? 'Cetak SPK (2 Hal)' 
                  : spkViewMode === 'SPK_ONLY' 
                    ? 'Cetak Hal 1' 
                    : 'Cetak Hal 2'}
              </span>
            </button>
          </div>
        </div>

        {/* ================= RENDER PAGES ACCORDING TO VIEW MODE ================= */}
        
        {/* MODE 1: FULL 2 PAGES (DEFAULT) */}
        {spkViewMode === 'FULL_2_PAGES' && (
          <div className={
            previewLayout === 'SIDE_BY_SIDE'
              ? 'grid grid-cols-1 lg:grid-cols-2 gap-8 print:block print:space-y-0'
              : 'space-y-8 print:space-y-0'
          }>
            {/* Sheet 1 */}
            <div className="print-page print-page-1 border border-slate-200/80 rounded-xl p-4 lg:p-6 bg-white shadow-xs print:border-none print:p-0 print:shadow-none">
              <div className="mb-2 text-[10px] font-black uppercase tracking-wider text-blue-900 flex items-center justify-between border-b border-slate-200 pb-1 print:hidden">
                <span className="flex items-center gap-1.5"><FileText className="w-3 h-3 text-blue-600" /> Lembar 1: Surat Perintah Kerja (SPK) & Estimasi Jasa</span>
                <span className="font-mono bg-blue-50 text-blue-800 px-2 py-0.2 rounded">Halaman 1 dari 2</span>
              </div>
              {renderSPKPage1()}
            </div>

            {/* Visual Screen Divider between Page 1 and Page 2 (Only in Stacked view) */}
            {previewLayout === 'STACKED' && (
              <div className="page-break-divider my-6 py-3 border-y-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center gap-2 text-slate-500 font-bold text-xs print:hidden">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>BATAS HALAMAN CETAK • HALAMAN 2 DI BAWAH INI AKAN TERCETAK DI LEMBAR KEDUA</span>
              </div>
            )}

            {/* Sheet 2 */}
            <div className="print-page border border-slate-200/80 rounded-xl p-4 lg:p-6 bg-white shadow-xs print:border-none print:p-0 print:shadow-none">
              <div className="mb-2 text-[10px] font-black uppercase tracking-wider text-blue-900 flex items-center justify-between border-b border-slate-200 pb-1 print:hidden">
                <span className="flex items-center gap-1.5"><ClipboardCheck className="w-3 h-3 text-blue-600" /> Lembar 2: Visual Body Map & Lembar Kendali Lab</span>
                <span className="font-mono bg-blue-50 text-blue-800 px-2 py-0.2 rounded">Halaman 2 dari 2</span>
              </div>
              {renderInspectionPage2()}
            </div>
          </div>
        )}

        {/* MODE 2: SPK ONLY */}
        {spkViewMode === 'SPK_ONLY' && renderSPKPage1()}

        {/* MODE 3: INSPECTION ONLY */}
        {spkViewMode === 'INSPECTION_ONLY' && renderInspectionPage2()}

      </div>
    </div>
  );
};

export default PrintTemplate;
