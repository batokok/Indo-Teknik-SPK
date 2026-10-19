import React, { useState, useEffect } from 'react';
import { useApp } from '../store/AppContext';
import { MechanicalInspectionItem, MechanicalInspectionStatus } from '../types';
import { DEFAULT_MECHANICAL_INSPECTIONS } from './SADashboard';
import { 
  Printer, Download, ArrowLeft, MapPin, ShieldCheck, Wrench, CheckCircle, 
  FileText, ClipboardCheck, Layers, ZoomIn, ZoomOut, Columns, Rows, Eye, Maximize2,
  CheckSquare, Square, AlertTriangle, Phone, Mail, Globe
} from 'lucide-react';
import { SmartLogo } from './SmartLogo';
import { FuelGauge } from './FuelGauge';
import { CarInspectionMap, getPointInspectionStatus, CAR_INSPECTION_POINTS } from './CarInspectionMap';
import { DocumentWatermark, WatermarkControl, WatermarkConfig, DEFAULT_WATERMARK_CONFIG } from './DocumentWatermark';
import { QRCodeSVG } from 'qrcode.react';

// Exact 15 Clauses Verbatim from Official Indo Teknik Legal PDF Document (PDF 1)
export const LEGAL_TERMS_AND_CONDITIONS: string[] = [
  "Kendaraan diserahkan kepada Indo Teknik untuk dilakukan pemeriksaan, taksasi, perbaikan, pembongkaran, pemasangan, penggantian suku cadang, dan/atau pekerjaan lainnya sesuai dengan keluhan pelanggan dan hasil pemeriksaan mekanik.",
  "Pelanggan memberikan kuasa kepada Indo Teknik untuk melakukan pembongkaran komponen kendaraan yang diperlukan guna proses pemeriksaan (diagnosa) dan perbaikan.",
  "Hasil pemeriksaan teknisi dapat menemukan kerusakan lain yang tidak terlihat pada saat pemeriksaan awal. Apabila ditemukan kerusakan tambahan yang memerlukan penggantian suku cadang atau pekerjaan tambahan, Indo Teknik akan menginformasikan kepada pelanggan untuk memperoleh persetujuan sebelum pekerjaan dilakukan.",
  "Pelanggan memahami dan menyetujui bahwa penambahan pekerjaan, jasa, maupun suku cadang selama proses perbaikan akan menimbulkan tambahan biaya sesuai pekerjaan yang dilakukan.",
  "Apabila pelanggan menolak rekomendasi teknisi atau meminta pembatalan penggantian suku cadang yang telah direkomendasikan, termasuk meminta pemasangan kembali suku cadang lama setelah dilakukan pembongkaran, maka pelanggan memahami bahwa kondisi, performa, tenaga, fungsi, maupun keandalan kendaraan mungkin tidak kembali seperti semula. Segala risiko yang timbul akibat permintaan tersebut menjadi tanggung jawab pelanggan dan Indo Teknik dibebaskan dari segala tuntutan atas kondisi tersebut.",
  "Upah jasa pemeriksaan, diagnosa, pembongkaran, pemasangan kembali, serta pekerjaan yang telah dilakukan tetap menjadi kewajiban pelanggan meskipun pelanggan membatalkan penggantian suku cadang atau tidak melanjutkan proses perbaikan.",
  "Indo Teknik tidak bertanggung jawab atas kerusakan yang telah ada sebelum kendaraan diterima maupun kerusakan lain yang tidak berkaitan dengan pekerjaan yang dilakukan.",
  "Indo Teknik berhak melakukan uji fungsi atau test jalan apabila diperlukan untuk memastikan hasil pekerjaan.",
  "Kendaraan yang telah selesai diperbaiki agar segera diambil oleh pelanggan. Apabila dalam waktu 30 (tiga puluh) hari kalender sejak pelanggan diberitahukan bahwa kendaraan telah selesai diperbaiki kendaraan belum diambil tanpa pemberitahuan, maka Indo Teknik tidak bertanggung jawab atas kehilangan barang yang ditinggalkan di dalam kendaraan maupun risiko yang timbul akibat penyimpanan kendaraan.",
  "Pelanggan wajib memeriksa kendaraan pada saat serah terima. Keluhan yang berkaitan dengan hasil pekerjaan agar disampaikan selambat-lambatnya 7 hari kalender kepada Indo Teknik untuk dilakukan pemeriksaan lebih lanjut.",
  "Barang-barang berharga yang tertinggal di dalam kendaraan bukan merupakan tanggung jawab Indo Teknik Pelanggan disarankan untuk mengeluarkan seluruh barang berharga sebelum kendaraan diserahkan.",
  "Indo Teknik tidak menjamin seluruh keluhan kendaraan akan hilang hanya dengan penggantian satu komponen, karena kerusakan pada kendaraan dapat disebabkan oleh lebih dari satu komponen yang saling berkaitan. Hasil perbaikan mengikuti kondisi aktual kendaraan berdasarkan pemeriksaan teknisi.",
  "Apabila pelanggan meminta penghentian proses perbaikan sebelum pekerjaan selesai atau meminta kendaraan diserahkan kembali, maka seluruh pekerjaan yang telah dilakukan beserta biaya jasa dan suku cadang yang telah terpasang tetap menjadi kewajiban pelanggan untuk dibayarkan.",
  "Perintah Kerja ini merupakan bukti tanda terima kendaraan dan wajib dibawa oleh pelanggan pada saat pengambilan kendaraan sebagai dasar penyerahan kembali kendaraan.",
  "Dengan menandatangani Perintah Kerja ini, pelanggan menyatakan telah membaca, memahami, dan menyetujui seluruh syarat dan ketentuan yang tercantum dalam dokumen ini."
];

const formatRupiah = (value: string | number | undefined | null): string => {
  if (value === undefined || value === null) return '';
  const str = String(value).replace(/\D/g, '');
  if (!str) return '';
  const num = parseInt(str, 10);
  return 'Rp ' + num.toLocaleString('id-ID');
};

const formatOdometer = (value: string | number | undefined | null): string => {
  if (value === undefined || value === null) return '-';
  const cleanStr = String(value).trim();
  if (!cleanStr || cleanStr === '-' || cleanStr.toLowerCase() === 'nan') return '-';
  const num = parseInt(cleanStr.replace(/\D/g, ''), 10);
  if (isNaN(num) || num === 0) return '-';
  return `${num.toLocaleString('id-ID')} km`;
};

const formatDateIndo = (dateVal?: string | number | Date): string => {
  if (!dateVal) return '-';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatTimeIndo = (dateVal?: string | number | Date): string => {
  if (!dateVal) return '-';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
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

  // Synchronize document.title with sanitized WO ID for automatic PDF file naming upon Save as PDF
  useEffect(() => {
    if (printWO?.id) {
      const originalTitle = document.title;
      const cleanWoId = printWO.id.replace(/[^a-zA-Z0-9_-]/g, '_');
      document.title = cleanWoId;
      return () => {
        document.title = originalTitle;
      };
    }
  }, [printWO?.id]);

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
        
        <div className="relative max-w-[210mm] mx-auto bg-white p-3.5 sm:p-8 shadow-2xl print:shadow-none print:max-w-none print:w-full print:p-0 print:m-0 print-handover-sheet">
          {/* Subtle Watermark Overlay */}
          <DocumentWatermark 
            config={watermarkConfig} 
            documentStatus="COMPLETED" 
            documentType="HANDOVER" 
          />

          <div className="relative z-1 space-y-3">
            
            {/* ACTION BAR (Hidden in print) */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mb-6 print:hidden no-print border-b pb-3 bg-slate-50 -mx-3.5 sm:-mx-8 -mt-3.5 sm:-mt-8 p-3 sm:p-5 rounded-t-lg border-slate-200">
              <div className="flex items-center gap-2 sm:gap-3">
                <button 
                  onClick={() => setPrintWO(null)} 
                  className="px-3.5 py-2 min-h-[42px] border border-slate-300 rounded-lg hover:bg-white text-slate-700 flex items-center gap-2 text-xs sm:text-sm font-bold transition-colors shadow-xs cursor-pointer active:scale-95 shrink-0"
                >
                  <ArrowLeft className="w-4 h-4" /> <span className="hidden xs:inline">Kembali</span>
                </button>
                <div className="min-w-0">
                  <h2 className="text-sm sm:text-base font-extrabold text-slate-800 leading-tight truncate">Bukti Penyerahan Barang (Handover)</h2>
                  <p className="text-[10px] sm:text-xs text-slate-500 font-medium">Dokumen Resmi Penyerahan Unit & Garansi</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 justify-end">
                <WatermarkControl 
                  config={watermarkConfig} 
                  onChange={setWatermarkConfig} 
                  documentStatus="COMPLETED" 
                  documentType="HANDOVER" 
                />

                <button 
                  onClick={() => window.print()} 
                  className="flex-1 sm:flex-initial px-3.5 py-2 min-h-[42px] bg-white border border-rose-300 hover:bg-rose-50 text-rose-700 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer active:scale-95"
                  title="Simpan sebagai file PDF di HP / Laptop"
                >
                  <Download className="w-4 h-4 text-rose-600" /> Simpan PDF
                </button>
                <button 
                  onClick={() => window.print()} 
                  className="flex-1 sm:flex-initial px-4 py-2 min-h-[42px] bg-[#0F2D59] text-white rounded-lg hover:bg-[#153a6c] text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-colors shadow-md cursor-pointer active:scale-95"
                >
                  <Printer className="w-4 h-4" /> Cetak
                </button>
              </div>
            </div>

            {/* Mobile Sticky Action Bar at bottom */}
            <div className="sm:hidden fixed bottom-4 inset-x-3 z-50 flex gap-2 bg-slate-900/95 backdrop-blur-md p-2 rounded-2xl shadow-2xl border border-white/20 print:hidden">
              <button
                onClick={() => setPrintWO(null)}
                className="px-3 min-h-[44px] bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center justify-center shrink-0 active:scale-95 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 min-h-[44px] bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg active:scale-95 cursor-pointer"
              >
                <Download className="w-4 h-4" /> Simpan PDF
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 min-h-[44px] bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg active:scale-95 cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Cetak
              </button>
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
                        <MapPin className="w-3 h-3 text-[#E21F26] shrink-0" /> Jl. Riau Ujung No.898-904, Pekanbaru • WA: wa.me/628117531881 • Email: customerservice@indo-teknik.com
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
                Indo Teknik Pekanbaru • One Stop Solution for All Your Diesel Needs • Jl. Riau Ujung No.898-904, Pekanbaru • WA: wa.me/628117531881 • Email: customerservice@indo-teknik.com
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
  const isPartsOnly = printWO.dropMethod === 'PARTS';

  const isInventoryChecked = (itemName: string) => {
    const found = inventoryList.find(i => i.name.toLowerCase() === itemName.toLowerCase());
    return Boolean(found?.checked);
  };

  // Helper to parse min and max estimation values for an item
  const parseItemEstimation = (item: {
    estimasiHarga?: string;
    estimasiHargaMin?: string;
    estimasiHargaMax?: string;
  }) => {
    const rawMin = String(item.estimasiHargaMin || item.estimasiHarga || '').replace(/\D/g, '');
    const rawMax = String(item.estimasiHargaMax || '').replace(/\D/g, '');
    let min = rawMin ? parseInt(rawMin, 10) : 0;
    let max = rawMax ? parseInt(rawMax, 10) : 0;

    // Handle case where user entered reversed min and max
    if (min > 0 && max > 0 && min > max) {
      const temp = min;
      min = max;
      max = temp;
    }

    const hasRange = (min > 0 && max > 0 && max > min) || (min === 0 && max > 0);
    // Effective max for computing total max (if no upper bound specified, upper equals lower)
    const effectiveMax = max > 0 ? max : min;

    return { min, max, effectiveMax, hasRange };
  };

  const totalEstimationMin = todoList.reduce((sum, item) => {
    const { min } = parseItemEstimation(item);
    return sum + min;
  }, 0);

  const totalEstimationMax = todoList.reduce((sum, item) => {
    const { effectiveMax } = parseItemEstimation(item);
    return sum + effectiveMax;
  }, 0);

  const hasTotalRange = totalEstimationMax > totalEstimationMin && totalEstimationMax > 0;
  const hasAnyEstimation = totalEstimationMin > 0 || totalEstimationMax > 0;

  // =========================================================================
  // PAGE 1: SURAT PERINTAH KERJA (SPK DOKUMEN BENGKEL)
  // =========================================================================
  const trackingUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/?tracking=${printWO.id}`
    : '';
  const renderSPKPage1 = () => (
    <div className="relative print-page print-page-1 print:max-h-[285mm] print:overflow-hidden space-y-2 box-border">
      {/* Watermark */}
      <DocumentWatermark 
        config={watermarkConfig} 
        documentStatus={printWO.status} 
        documentType="SPK" 
      />

      <div className="relative z-1 space-y-1.5">
        {/* Header SPK */}
        <div className="border-b-2 border-[#0F2D59] pb-1.5">
          <div className="flex justify-between items-start gap-3">
            <div className="flex-shrink min-w-0">
              <div className="flex items-center gap-2.5">
                <SmartLogo 
                  baseName="logo-indo-teknik" 
                  alt="IT INDO TEKNIK" 
                  className="h-9 w-auto object-contain flex-shrink-0" 
                  style={{ height: '34px', maxWidth: '140px' }}
                />
                <div className="border-l-2 border-slate-300 pl-2.5 leading-tight text-left">
                  <p className="text-[11px] font-black tracking-widest text-[#0F2D59] uppercase">INDO TEKNIK PEKANBARU</p>
                  <p className="text-[9.5px] font-extrabold text-[#0F2D59] mt-0.5">
                    One Stop Solution for All Your Diesel Needs
                  </p>
                  <p className="text-[8px] text-slate-600 font-semibold flex items-center gap-1 mt-0.5 flex-wrap">
                    <MapPin className="w-2.5 h-2.5 text-[#E21F26] shrink-0" /> Jl. Riau Ujung No.898-904, Pekanbaru • WA: wa.me/628117531881 • Email: customerservice@indo-teknik.com
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-1 pl-0.5">
                <SmartLogo 
                  baseName="logo-itech" 
                  alt="ITech" 
                  className="h-6 w-auto object-contain flex-shrink-0 bg-white px-1.5 py-0.5 rounded border border-slate-200" 
                  style={{ height: '22px', maxWidth: '80px' }}
                />
                <p className="text-[9px] font-black tracking-wider text-[#0F2D59] whitespace-nowrap bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  ITECH AUTHORIZED DEALER & WORKSHOP
                </p>
              </div>
            </div>
            
            {/* Header Right / WO Number, Date, Time, QR Tracking */}
            <div className="flex items-center gap-2 shrink-0 max-w-[50%]">
              <div className="bg-white border border-slate-300 rounded-lg p-1 shadow-xs flex flex-col items-center justify-center shrink-0">
                <QRCodeSVG value={trackingUrl} size={42} level="M" />
                <span className="text-[6.5px] font-mono font-black text-slate-500 uppercase mt-0.5 tracking-tight">Scan Tracking</span>
              </div>

              <div className="text-right flex flex-col items-end">
                <div className="flex items-center justify-end gap-1 flex-wrap">
                  <span className="text-[8px] font-black bg-blue-100 text-blue-950 border border-blue-300 px-1.5 py-0.5 rounded uppercase shrink-0">
                    HALAMAN 1 • SPK
                  </span>
                </div>

                <div className="mt-1 flex items-center gap-1.5 bg-slate-50 border-2 border-slate-400 rounded-lg px-2.5 py-0.5 shadow-xs">
                  <span className="text-[9px] font-black text-slate-600 uppercase">NO. WO:</span>
                  <span className="text-sm sm:text-base font-mono font-black text-[#0F2D59] tracking-tight">{printWO.id}</span>
                </div>

                <div className="text-[8.5px] text-slate-600 font-bold mt-0.5 font-mono flex items-center gap-1">
                  <span>Tgl: {formatDateIndo(printWO.createdAt)}</span>
                  <span>•</span>
                  <span>Jam: {formatTimeIndo(printWO.createdAt)}</span>
                  <span>•</span>
                  <span>SA: {printWO.createdBy || 'Front Office'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* JUDUL UTAMA TENGAH HALAMAN: PERINTAH KERJA BENGKEL */}
        <div className="text-center py-1 border-y-2 border-[#0F2D59] bg-gradient-to-r from-slate-50 via-blue-50/50 to-slate-50 shadow-2xs">
          <h1 className="text-sm sm:text-base font-black tracking-widest text-[#0F2D59] uppercase">
            PERINTAH KERJA BENGKEL
          </h1>
          <p className="text-[8px] font-bold text-slate-500 tracking-wider uppercase font-mono">
            SURAT PERINTAH KERJA (SPK) • WORKSHOP INDO TEKNIK
          </p>
        </div>

        {/* SECTION 1: INFORMASI PELANGGAN & IDENTITAS KENDARAAN / KOMPONEN */}
        <div className="grid grid-cols-12 gap-2 text-xs">
          {/* Customer Box (6 Cols) */}
          <div className="col-span-6 border border-slate-300 bg-slate-50/90 rounded-lg p-2 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="font-black border-b border-slate-300 pb-0.5 mb-1 text-[#0F2D59] text-[9.5px] uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span> INFORMASI PELANGGAN
              </h3>
              <div className="space-y-0.5 text-xs">
                <div className="flex justify-between items-baseline gap-2">
                  <span className="text-slate-500 font-bold shrink-0 text-[9.5px] uppercase">Nama:</span>
                  <span className="font-black text-slate-950 text-right truncate text-[11px]">{printWO.customerName}</span>
                </div>
                <div className="flex justify-between items-baseline gap-2">
                  <span className="text-slate-500 font-bold shrink-0 text-[9.5px] uppercase">Contact Person:</span>
                  <span className="font-bold text-slate-800 text-right truncate text-[10.5px]">
                    {printWO.bringerName || printWO.customerName}
                  </span>
                </div>
                <div className="flex justify-between items-baseline gap-2">
                  <span className="text-slate-500 font-bold shrink-0 text-[9.5px] uppercase">No. Telp / WA:</span>
                  <span className="font-bold text-slate-900 text-right font-mono text-[10.5px] bg-white px-1 py-0.2 rounded border border-slate-200">
                    {printWO.customerPhone || '-'}
                  </span>
                </div>
                <div className="flex justify-between items-baseline gap-2">
                  <span className="text-slate-500 font-bold shrink-0 text-[9.5px] uppercase">Alamat:</span>
                  <span className="text-slate-700 text-right truncate text-[10px] max-w-[210px]">{printWO.customerAddress || '-'}</span>
                </div>
              </div>
            </div>
            {printWO.bringerName && printWO.bringerName !== printWO.customerName && (
              <div className="flex justify-between items-baseline gap-2 pt-0.5 mt-0.5 border-t border-slate-200">
                <span className="text-blue-900 font-black shrink-0 text-[9px] uppercase">Pembawa Unit:</span>
                <span className="font-bold text-slate-900 text-right truncate text-[9.5px]">
                  {printWO.bringerName} {printWO.bringerPhone ? `(${printWO.bringerPhone})` : ''}
                </span>
              </div>
            )}
          </div>

          {/* Vehicle / Component Source Box (6 Cols) */}
          {isPartsOnly ? (
            <div className="col-span-6 border border-slate-300 bg-slate-50/90 rounded-lg p-2 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="font-black border-b border-slate-300 pb-0.5 mb-1 text-[#0F2D59] text-[9.5px] uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> IDENTITAS KOMPONEN YANG DITERIMA
                  </span>
                  <span className="text-[8px] font-mono text-amber-900 bg-amber-100 px-1 py-0.2 rounded border border-amber-300">
                    {printWO.componentQty || loosePartsList.length || 1} Unit Fisik
                  </span>
                </h3>
                <div className="space-y-0.5 text-xs">
                  <div className="flex justify-between items-baseline gap-2">
                    <span className="text-slate-500 font-bold shrink-0 text-[9px] uppercase">Nama / Model:</span>
                    <span className="font-black text-slate-950 text-right truncate text-[10.5px]">
                      {printWO.componentName || printWO.vehicleBrand || 'Komponen Diesel Copotan'}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline gap-2">
                    <span className="text-slate-500 font-bold shrink-0 text-[9px] uppercase">Jenis & Merek:</span>
                    <span className="font-bold text-slate-800 text-right truncate text-[9.5px]">
                      {printWO.componentCategory || 'Komponen'} {printWO.componentBrand ? `• ${printWO.componentBrand}` : ''}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline gap-2">
                    <span className="text-slate-500 font-bold shrink-0 text-[9px] uppercase">Part Number (P/N):</span>
                    <span className="font-mono text-blue-900 text-right truncate text-[10px] font-bold">
                      {printWO.componentPartNumber || printWO.assyNo || '-'}
                    </span>
                  </div>
                  {printWO.componentSerialNumber && (
                    <div className="flex justify-between items-baseline gap-2">
                      <span className="text-slate-500 font-bold shrink-0 text-[9px] uppercase">Serial Number (S/N):</span>
                      <span className="font-mono text-slate-800 text-right truncate text-[9.5px]">
                        {printWO.componentSerialNumber}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-baseline gap-2">
                    <span className="text-slate-500 font-bold shrink-0 text-[9px] uppercase">Kondisi Diterima:</span>
                    <span className="font-bold text-emerald-800 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200 text-right truncate text-[9px]">
                      {printWO.componentIntakeCondition || 'Normal / Baik'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-baseline gap-2 pt-0.5 mt-0.5 border-t border-slate-200 text-[8.5px]">
                <span className="text-slate-500 font-bold uppercase">Asal Unit / Mesin:</span>
                <span className="font-medium text-slate-800 text-right truncate">
                  {printWO.componentOriginUnit || printWO.vehicleBrand || 'Copotan Tanpa Unit'}
                  {printWO.componentOriginPlate && printWO.componentOriginPlate !== '-' ? ` (${printWO.componentOriginPlate})` : ''}
                </span>
              </div>
            </div>
          ) : (
            <div className="col-span-6 border border-slate-300 bg-slate-50/90 rounded-lg p-2 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="font-black border-b border-slate-300 pb-0.5 mb-1 text-[#0F2D59] text-[9.5px] uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span> IDENTITAS KENDARAAN
                </h3>
                <div className="space-y-0.5 text-xs">
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-slate-500 font-bold shrink-0 text-[9.5px] uppercase">Nomor Polisi:</span>
                    <span className="font-mono font-black text-white text-[11px] bg-slate-950 px-2 py-0.2 rounded border border-slate-700 tracking-wider shadow-xs">
                      {printWO.plateNumber || '-'}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline gap-2">
                    <span className="text-slate-500 font-bold shrink-0 text-[9.5px] uppercase">Merek / Tipe:</span>
                    <span className="font-black text-slate-900 text-right truncate text-[10.5px]">{printWO.vehicleBrand || '-'}</span>
                  </div>
                  <div className="flex justify-between items-baseline gap-2">
                    <span className="text-slate-500 font-bold shrink-0 text-[9.5px] uppercase">Nomor Rangka:</span>
                    <span className="font-mono text-slate-800 text-right truncate text-[10px] font-semibold">{printWO.vin || '-'}</span>
                  </div>
                  <div className="flex justify-between items-baseline gap-2">
                    <span className="text-slate-500 font-bold shrink-0 text-[9.5px] uppercase">Nomor Mesin:</span>
                    <span className="font-mono text-slate-800 text-right truncate text-[10px] font-semibold">{printWO.engineNumber || printWO.assyNo || '-'}</span>
                  </div>
                  <div className="flex justify-between items-baseline gap-2">
                    <span className="text-slate-500 font-bold shrink-0 text-[9.5px] uppercase">Kilometer:</span>
                    <span className="font-bold text-slate-800 text-right text-[10px] font-mono">
                      {formatOdometer(printWO.odometer)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center gap-2 pt-0.5 mt-0.5 border-t border-slate-200 text-[8.5px]">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-bold uppercase">Bahan Bakar:</span>
                  <span className="font-black text-slate-800">[✓] Solar</span>
                  <span className="text-slate-400">[ ] Bensin</span>
                </div>
                <div className="flex items-center gap-1 font-mono text-[8px] text-slate-600">
                  <span>Level BBM: <strong>{printWO.fuelLevel || '1/2'}</strong></span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 2: KELUHAN PELANGGAN */}
        <div className="border border-slate-300 bg-white rounded-lg p-2 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-0.5 mb-1">
            <h3 className="text-[9.5px] font-black text-[#0F2D59] uppercase tracking-wider flex items-center gap-1">
              <Wrench className="w-3 h-3 text-amber-600" /> KELUHAN PELANGGAN (CUSTOMER VOICE)
            </h3>
            <span className="text-[8.5px] font-black px-1.5 py-0.2 rounded uppercase font-mono tracking-tight bg-slate-100 text-slate-700 border border-slate-200">
              Metode: {printWO.dropMethod === 'PARTS' ? 'KOMPONEN COPOTAN' : 'MOBIL UTUH'}
            </span>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded p-1.5 text-[10px] font-bold text-slate-900 leading-snug whitespace-pre-line min-h-[24px]">
            {printWO.customerVoice || 'Tidak ada catatan keluhan spesifik yang didaftarkan.'}
          </div>
        </div>

        {/* SECTION 3: LINGKUP PENGERJAAN, JASA SERVIS & ESTIMASI SUKU CADANG */}
        <div className="border border-slate-300 rounded-lg overflow-hidden shadow-xs">
          <div className="bg-[#0F2D59] text-white px-2.5 py-0.5 flex items-center justify-between">
            <h3 className="text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-emerald-400" /> LINGKUP PENGERJAAN, JASA SERVIS & ESTIMASI SUKU CADANG
            </h3>
            <span className="text-[8px] text-blue-200 font-bold font-mono">
              {todoList.length} Item Tindakan
            </span>
          </div>

          <div className="p-0.5 bg-white">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300 text-[8.5px]">
                <tr>
                  <th className="py-0.5 px-2 text-center w-7">No</th>
                  <th className="py-0.5 px-2">Jenis Pengerjaan / Tindakan</th>
                  <th className="py-0.5 px-2 text-center w-10">Qty</th>
                  <th className="py-0.5 px-2">Catatan Mekanik / Spesifikasi</th>
                  <th className="py-0.5 px-2 text-right w-36 sm:w-44 whitespace-nowrap">Estimasi Biaya</th>
                </tr>
              </thead>
              <tbody className={`divide-y divide-slate-200 ${todoList.length > 5 ? 'text-[9px]' : 'text-[9.5px]'}`}>
                {todoList.length > 0 ? (
                  todoList.map((act, idx) => {
                    const { min, max, hasRange } = parseItemEstimation(act);
                    return (
                      <tr key={act.id || idx} className="hover:bg-slate-50">
                        <td className="py-0.5 px-2 text-slate-500 font-bold text-center font-mono">{idx + 1}</td>
                        <td className="py-0.5 px-2 font-black text-slate-900">{act.jenisPengerjaan || 'Pemeriksaan & Servis'}</td>
                        <td className="py-0.5 px-2 text-center font-bold text-slate-800">{act.qty || 1}</td>
                        <td className="py-0.5 px-2 text-slate-600 text-[9px]">{act.catatanMekanik || '-'}</td>
                        <td className="py-0.5 px-2 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                          {hasRange ? (
                            min > 0 ? (
                              <span>
                                {formatRupiah(min)}{' '}
                                <span className="text-slate-500 font-sans text-[8.5px] font-semibold">s/d</span>{' '}
                                {formatRupiah(max)}
                              </span>
                            ) : (
                              <span>
                                <span className="text-slate-500 font-sans text-[8.5px] font-semibold mr-0.5">s/d</span>{' '}
                                {formatRupiah(max)}
                              </span>
                            )
                          ) : min > 0 ? (
                            formatRupiah(min)
                          ) : (
                            '-'
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-1.5 px-2 text-center text-slate-500 italic text-[9.5px]">
                      Tahap diagnosa & estimasi rincian pengerjaan sedang diproses oleh Foreman/Mekanik.
                    </td>
                  </tr>
                )}
              </tbody>
              {hasAnyEstimation && (
                <tfoot className="bg-slate-100 border-t-2 border-slate-300 text-xs font-black">
                  <tr>
                    <td colSpan={4} className="py-0.5 px-2 text-right uppercase text-slate-800 text-[9px]">
                      Total Estimasi Biaya Sementara:
                    </td>
                    <td className="py-0.5 px-2 text-right font-mono text-[#0F2D59] text-[11px] whitespace-nowrap font-black">
                      {hasTotalRange ? (
                        totalEstimationMin > 0 ? (
                          <span>
                            {formatRupiah(totalEstimationMin)}{' '}
                            <span className="text-slate-600 font-sans font-black text-[9px] mx-0.5">s/d</span>{' '}
                            {formatRupiah(totalEstimationMax)}
                          </span>
                        ) : (
                          <span>
                            <span className="text-slate-600 font-sans font-black text-[9px] mr-1">s/d</span>
                            {formatRupiah(totalEstimationMax)}
                          </span>
                        )
                      ) : (
                        formatRupiah(totalEstimationMin || totalEstimationMax)
                      )}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

        {/* SECTION 4: SYARAT DAN KETENTUAN (15 POIN RESMI VERBATIM TIM LEGAL INDO TEKNIK) */}
        <div className="border border-slate-300 bg-slate-50/90 rounded-lg p-2 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-300 pb-0.5 mb-1">
            <span className="font-black text-slate-900 uppercase text-[8.5px] tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0F2D59]"></span> SYARAT DAN KETENTUAN
            </span>
            <span className="text-[7px] text-slate-500 font-mono font-bold uppercase">
              Standar Legal Kontrak Perintah Kerja Indo Teknik
            </span>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[6.5px] leading-[1.28] text-slate-700">
            {LEGAL_TERMS_AND_CONDITIONS.map((term, index) => (
              <div key={index} className="flex items-start gap-1">
                <span className="font-black text-slate-950 shrink-0 font-mono text-[7px]">{index + 1}.</span>
                <span className="text-justify">{term}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 5: TANDA TANGAN 4 PIHAK (SESUAI DOKUMEN RESMI TIM LEGAL) */}
      <div className="border-t-2 border-slate-400 pt-1 shrink-0 print:break-inside-avoid">
        <div className="grid grid-cols-4 gap-2 text-center">
          {/* 1. Pelanggan */}
          <div className="border border-slate-300 rounded p-1 bg-slate-50/70 shadow-2xs">
            <p className="text-[8px] font-black text-slate-900 uppercase">Diserahkan oleh :</p>
            <p className="text-[8.5px] font-bold text-slate-800">Pelanggan</p>
            <div className="h-8 border-b border-slate-400 my-0.5 flex items-end justify-center pb-0.2 text-[6.5px] text-slate-400">
              (Nama & Tandatangan)
            </div>
            <p className="font-bold text-slate-950 text-[8.5px] truncate">{printWO.customerName}</p>
          </div>

          {/* 2. Counter Service */}
          <div className="border border-slate-300 rounded p-1 bg-slate-50/70 shadow-2xs">
            <p className="text-[8px] font-black text-slate-900 uppercase">Diterima oleh :</p>
            <p className="text-[8.5px] font-bold text-slate-800">Counter Service</p>
            <div className="h-8 border-b border-slate-400 my-0.5 flex items-end justify-center pb-0.2 text-[6.5px] text-slate-400">
              (Nama & Tandatangan)
            </div>
            <p className="font-bold text-slate-950 text-[8.5px] truncate">Front Office Staff</p>
          </div>

          {/* 3. Mekanik */}
          <div className="border border-slate-300 rounded p-1 bg-slate-50/70 shadow-2xs">
            <p className="text-[8px] font-black text-slate-900 uppercase">Dikerjakan oleh :</p>
            <p className="text-[8.5px] font-bold text-slate-800">Mekanik</p>
            <div className="h-8 border-b border-slate-400 my-0.5 flex items-end justify-center pb-0.2 text-[6.5px] text-slate-400">
              (Nama & Tandatangan)
            </div>
            <p className="font-bold text-slate-950 text-[8.5px] truncate">{printWO.mechanicName || 'Divisi Produksi'}</p>
          </div>

          {/* 4. Service Advisor */}
          <div className="border border-slate-300 rounded p-1 bg-slate-50/70 shadow-2xs">
            <p className="text-[8px] font-black text-slate-900 uppercase">Diperiksa oleh :</p>
            <p className="text-[8.5px] font-bold text-slate-800">Service Advisor</p>
            <div className="h-8 border-b border-slate-400 my-0.5 flex items-end justify-center pb-0.2 text-[6.5px] text-slate-400">
              (Nama & Tandatangan)
            </div>
            <p className="font-bold text-slate-950 text-[8.5px] truncate">{printWO.createdBy || 'Service Advisor'}</p>
          </div>
        </div>

        {/* SECTION 6: FOOTER AUTOMOTIVE AFTERMARKET RESMI */}
        <div className="mt-1 pt-1 border-t border-slate-300 text-center text-[7px] text-slate-600 font-sans leading-tight">
          <p className="font-black text-slate-900 tracking-wider uppercase text-[7.5px]">AUTOMOTIVE AFTERMARKET</p>
          <p className="mt-0.5 font-medium">
            JL. Riau Ujung No. 898-904, Pekanbaru – Riau • WhatsApp: wa.me/628117531881 • Email: customerservice@indo-teknik.com
          </p>
          <div className="flex justify-between items-center text-[6.5px] text-slate-400 font-mono mt-0.5 pt-0.5 border-t border-slate-200">
            <span>SPK Halaman 1 • Dokumen Sah Bengkel</span>
            <span>Dicetak: {new Date().toLocaleString('id-ID')} WIB</span>
          </div>
        </div>
      </div>
    </div>
  );

  // =========================================================================
  // PAGE 2 (OPTION A): LEMBAR PEMERIKSAAN KENDARAAN (VEHICLE INSPECTION & BODY MAP)
  // Digunakan jika dropMethod === 'WHOLE' (Bawa Kendaraan Utuh)
  // =========================================================================
  const renderVehicleInspectionPage2 = () => {
    // Only actual defects are counted
    const actualDefectPoints = CAR_INSPECTION_POINTS.filter(
      pt => getPointInspectionStatus(pt.id, printWO.damages || []).status === 'DEFECT'
    );
    const defectCount = actualDefectPoints.length;
    const okCount = CAR_INSPECTION_POINTS.filter(
      pt => getPointInspectionStatus(pt.id, printWO.damages || []).status === 'OK'
    ).length;

    const mechanicalSystems = [
      { id: 'mesin', name: 'Pemeriksaan Mesin', status: 'Diperiksa' },
      { id: 'injeksi', name: 'Sistem Injeksi (FIP/Common Rail/Supply Pump)', status: 'Fokus Uji Lab' },
      { id: 'turbo', name: 'Turbocharger', status: 'Diperiksa' },
      { id: 'kelistrikan', name: 'Kelistrikan & Solenoid', status: 'Diperiksa' },
      { id: 'rem', name: 'Sistem Rem', status: 'Pemeriksaan Visual' },
      { id: 'transmisi', name: 'Transmisi', status: 'Pemeriksaan Visual' },
      { id: 'suspensi', name: 'Suspensi', status: 'Pemeriksaan Visual' },
      { id: 'lainnya', name: 'Uji Jalan (Road Test)', status: 'Uji Fungsi' },
    ];

    return (
      <div className="relative print-page print-page-2 print:max-h-[285mm] print:overflow-hidden space-y-2 box-border">
        {/* Watermark */}
        <DocumentWatermark 
          config={watermarkConfig} 
          documentStatus={printWO.status} 
          documentType="INSPECTION" 
        />

        <div className="relative z-1 space-y-1.5">
          {/* Header Page 2 */}
          <div className="border-b-2 border-[#0F2D59] pb-1.5">
            <div className="flex justify-between items-start gap-3">
              <div className="flex-shrink min-w-0">
                <div className="flex items-center gap-2.5">
                  <SmartLogo 
                    baseName="logo-indo-teknik" 
                    alt="IT INDO TEKNIK" 
                    className="h-9 w-auto object-contain flex-shrink-0" 
                    style={{ height: '34px', maxWidth: '140px' }}
                  />
                  <div className="border-l-2 border-slate-300 pl-2.5 leading-tight text-left">
                    <p className="text-[11px] font-black tracking-widest text-[#0F2D59] uppercase">INDO TEKNIK PEKANBARU</p>
                    <p className="text-[9.5px] font-extrabold text-[#0F2D59] mt-0.5">
                      One Stop Solution for All Your Diesel Needs
                    </p>
                    <p className="text-[8px] text-slate-600 font-semibold flex items-center gap-1 mt-0.5 flex-wrap">
                      <MapPin className="w-2.5 h-2.5 text-[#E21F26] shrink-0" /> Jl. Riau Ujung No.898-904, Pekanbaru • WA: wa.me/628117531881 • Email: customerservice@indo-teknik.com
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-1 pl-0.5">
                  <SmartLogo 
                    baseName="logo-itech" 
                    alt="ITech" 
                    className="h-6 w-auto object-contain flex-shrink-0 bg-white px-1.5 py-0.5 rounded border border-slate-200" 
                    style={{ height: '22px', maxWidth: '80px' }}
                  />
                  <p className="text-[9px] font-black tracking-wider text-[#0F2D59] whitespace-nowrap bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    ITECH AUTHORIZED DEALER & WORKSHOP
                  </p>
                </div>
              </div>
              
              {/* Header Right / WO Number & Digital Verification QR */}
              <div className="flex items-center gap-2 shrink-0 max-w-[50%]">
                <div className="bg-white border border-slate-300 rounded-lg p-1 shadow-xs flex flex-col items-center justify-center shrink-0">
                  <QRCodeSVG value={trackingUrl} size={42} level="M" />
                  <span className="text-[6.5px] font-mono font-black text-slate-500 uppercase mt-0.5 tracking-tight">Scan Tracking</span>
                </div>

                <div className="text-right flex flex-col items-end">
                  <div className="flex items-center justify-end gap-1 flex-wrap">
                    <span className="text-[8px] font-black bg-blue-100 text-blue-950 border border-blue-300 px-1.5 py-0.5 rounded uppercase shrink-0">
                      HALAMAN 2 • INSPEKSI KENDARAAN
                    </span>
                  </div>

                  <div className="mt-1 flex items-center gap-1.5 bg-slate-50 border-2 border-slate-400 rounded-lg px-2.5 py-0.5 shadow-xs">
                    <span className="text-[9px] font-black text-slate-600 uppercase">NO. WO:</span>
                    <span className="text-sm sm:text-base font-mono font-black text-[#0F2D59] tracking-tight">{printWO.id}</span>
                  </div>

                  <div className="text-[8.5px] text-slate-600 font-bold mt-0.5 font-mono flex items-center gap-1">
                    <span>Tgl: {formatDateIndo(printWO.createdAt)}</span>
                    <span>•</span>
                    <span>Jam: {formatTimeIndo(printWO.createdAt)}</span>
                    <span>•</span>
                    <span>SA: {printWO.createdBy || 'Front Office'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Centered Main Heading */}
          <div className="text-center py-1 border-y-2 border-[#0F2D59] bg-gradient-to-r from-slate-50 via-blue-50/50 to-slate-50 shadow-2xs">
            <h2 className="text-sm sm:text-base font-black tracking-widest text-[#0F2D59] uppercase">
              LEMBAR PEMERIKSAAN KENDARAAN
            </h2>
            <p className="text-[8px] font-bold text-slate-500 tracking-wider uppercase font-mono">
              HASIL PEMERIKSAAN MEKANIK & INTEGRITAS FISIK UNIT
            </p>
          </div>

          {/* Profile Grid Compact */}
          <div className="grid grid-cols-12 gap-2 text-xs">
            <div className="col-span-6 border border-slate-300 bg-slate-50/90 rounded-lg p-2 shadow-xs flex flex-col justify-between">
              <div className="space-y-0.5">
                <h3 className="font-black border-b border-slate-300 pb-0.5 mb-1 text-[#0F2D59] text-[9.5px] uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span> DATA PELANGGAN
                </h3>
                <div className="flex justify-between items-baseline gap-2">
                  <span className="text-slate-500 font-bold shrink-0 text-[9.5px] uppercase">Pelanggan:</span>
                  <span className="font-black text-slate-950 text-right truncate text-[11px]">{printWO.customerName}</span>
                </div>
                <div className="flex justify-between items-baseline gap-2">
                  <span className="text-slate-500 font-bold shrink-0 text-[9.5px] uppercase">No. Telepon:</span>
                  <span className="font-bold text-slate-900 text-right font-mono text-[10.5px] bg-white px-1 py-0.2 rounded border border-slate-200">{printWO.customerPhone || '-'}</span>
                </div>
                <div className="flex justify-between items-baseline gap-2">
                  <span className="text-slate-500 font-bold shrink-0 text-[9.5px] uppercase">Alamat:</span>
                  <span className="text-slate-700 text-right truncate text-[10px] max-w-[210px]">{printWO.customerAddress || '-'}</span>
                </div>
              </div>
            </div>
            <div className="col-span-6 border border-slate-300 bg-slate-50/90 rounded-lg p-2 shadow-xs flex flex-col justify-between">
              <div className="space-y-0.5">
                <h3 className="font-black border-b border-slate-300 pb-0.5 mb-1 text-[#0F2D59] text-[9.5px] uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span> IDENTITAS UNIT
                </h3>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-500 font-bold shrink-0 text-[9.5px] uppercase">No. Polisi:</span>
                  <span className="font-mono font-black text-white text-[11px] bg-slate-950 px-2 py-0.2 rounded border border-slate-700 tracking-wider shadow-xs">
                    {printWO.plateNumber || '-'}
                  </span>
                </div>
                <div className="flex justify-between items-baseline gap-2">
                  <span className="text-slate-500 font-bold shrink-0 text-[9.5px] uppercase">Merek / Tipe:</span>
                  <span className="font-black text-slate-900 text-right truncate text-[10.5px]">{printWO.vehicleBrand || '-'}</span>
                </div>
                <div className="flex justify-between items-baseline gap-2">
                  <span className="text-slate-500 font-bold shrink-0 text-[9.5px] uppercase">Odometer:</span>
                  <span className="font-bold text-slate-800 text-right text-[10px] font-mono">
                    {formatOdometer(printWO.odometer)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* HIERARCHY 1: HASIL PEMERIKSAAN MEKANIK (DIESEL & VEHICLE DIAGNOSTIC REPORT) - PRIORITAS UTAMA BENGKEL */}
          <div className="border border-[#0F2D59] rounded-lg overflow-hidden bg-white shadow-xs">
            <div className="bg-[#0F2D59] text-white px-2 py-0.5 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Wrench className="w-3 h-3 text-amber-400" />
                <h3 className="text-[9px] font-black uppercase tracking-wider">
                  HASIL PEMERIKSAAN MEKANIK (DIESEL & VEHICLE DIAGNOSTIC REPORT)
                </h3>
              </div>
              <span className="text-[7.5px] font-mono text-blue-200 font-bold uppercase tracking-tight">
                Prioritas Utama Diagnosa Teknis Bengkel
              </span>
            </div>

            <div className="p-1 space-y-1">
              {/* Header Context: Keluhan Pelanggan yang dijawab oleh pemeriksaan */}
              <div className="bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 flex items-center gap-1.5 text-[8px]">
                <strong className="text-slate-900 uppercase shrink-0 font-black">Keluhan / Gejala Awal:</strong>
                <span className="text-slate-800 italic truncate">
                  {printWO.customerVoice ? printWO.customerVoice.replace(/\n/g, ' • ') : 'Pemeriksaan performa dan perawatan preventif diesel.'}
                </span>
              </div>

              {/* High-Density Technical Diagnostic Table */}
              <div className="border border-slate-300 rounded overflow-hidden">
                <table className="w-full text-left border-collapse text-[7.5px] leading-tight">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 font-black border-b border-slate-300 uppercase tracking-tight text-[7px]">
                      <th className="py-0.5 px-1 text-center w-6 border-r border-slate-200">No.</th>
                      <th className="py-0.5 px-1.5 w-[22%] border-r border-slate-200">Bagian / Sistem Diperiksa</th>
                      <th className="py-0.5 px-1.5 w-[14%] border-r border-slate-200">Metode Uji</th>
                      <th className="py-0.5 px-1 text-center w-[16%] border-r border-slate-200">Status Kondisi</th>
                      <th className="py-0.5 px-1.5 w-[28%] border-r border-slate-200">Hasil Temuan & Analisis Mekanik</th>
                      <th className="py-0.5 px-1.5 w-[20%]">Rekomendasi Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {(() => {
                      const mechList: MechanicalInspectionItem[] = (printWO.mechanicalInspections && printWO.mechanicalInspections.length > 0)
                        ? printWO.mechanicalInspections
                        : DEFAULT_MECHANICAL_INSPECTIONS;

                      return mechList.map((item, idx) => {
                        const isIssue = item.status === 'ISSUE_FOUND';
                        const isNormal = item.status === 'NORMAL';
                        const isFurther = item.status === 'FURTHER_TEST_NEEDED';

                        const statusBadgeText = isIssue
                          ? '[!] Ditemukan Masalah'
                          : isNormal
                            ? '[✓] Kondisi Normal'
                            : isFurther
                              ? '[?] Perlu Uji Lanjutan'
                              : '[-] Belum Diperiksa';

                        const statusBadgeClass = isIssue
                          ? 'bg-rose-100 text-rose-900 border-rose-300 font-black'
                          : isNormal
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold'
                            : isFurther
                              ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                              : 'bg-slate-100 text-slate-700 border-slate-300';

                        return (
                          <tr key={item.id || idx} className={isIssue ? 'bg-rose-50/40' : idx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}>
                            <td className="py-0.5 px-1 text-center font-mono font-bold text-slate-600 border-r border-slate-200">
                              {String(idx + 1).padStart(2, '0')}
                            </td>
                            <td className="py-0.5 px-1.5 font-bold text-slate-950 border-r border-slate-200">
                              {item.systemName}
                            </td>
                            <td className="py-0.5 px-1.5 text-slate-700 border-r border-slate-200">
                              {item.method || 'Visual & Standar Lab'}
                            </td>
                            <td className="py-0.5 px-1 text-center border-r border-slate-200 whitespace-nowrap">
                              <span className={`inline-block px-1 py-0.2 rounded border text-[7px] uppercase ${statusBadgeClass}`}>
                                {statusBadgeText}
                              </span>
                            </td>
                            <td className="py-0.5 px-1.5 border-r border-slate-200">
                              <div className="font-semibold text-slate-900 break-words">
                                {item.findings || (isNormal ? 'Komponen normal terverifikasi dalam batas toleransi standar.' : isIssue ? 'Terindikasi ketidaksesuaian performa pada sistem terkait.' : isFurther ? 'Data uji awal belum mencukupi untuk vonis kondisi final.' : 'Pemeriksaan terjadwal.')}
                              </div>
                              {item.diagnosisNotes && (
                                <div className="mt-0.5 text-[7px] text-blue-900 font-medium bg-blue-50/80 px-1 py-0.2 rounded border border-blue-200">
                                  <span className="font-black">Analisis: </span>{item.diagnosisNotes}
                                </div>
                              )}
                            </td>
                            <td className="py-0.5 px-1.5 text-slate-800 break-words">
                              {item.recommendation ? (
                                <span className="font-medium text-blue-950">{item.recommendation}</span>
                              ) : (
                                <span className="text-slate-400 italic">-</span>
                              )}
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>

              {/* Legal Notice: Kerusakan Tambahan */}
              <div className="px-1.5 py-0.5 rounded bg-amber-50/80 border border-amber-200 text-[7px] leading-tight text-amber-950 flex items-center justify-between">
                <span>
                  <strong className="font-black text-amber-900 uppercase mr-1">[!] Ketentuan Tambahan:</strong>
                  Apabila ditemukan kerusakan tambahan pada pengujian/pembongkaran lanjutan, pelanggan akan dihubungi untuk konfirmasi persetujuan sebelum penggantian part atau pembongkaran lebih lanjut.
                </span>
              </div>
            </div>
          </div>

          {/* HIERARCHY 2 & 3: DOKUMENTASI FISIK BODI KENDARAAN (VEHICLE CONDITION DIAGRAM & TABEL DETAIL TEMUAN) */}
          <CarInspectionMap
            damages={printWO.damages || []}
            isPrintMode={true}
            readonly={true}
          />

          {/* HIERARCHY 4: BAHAN BAKAR & CHECKLIST KELENGKAPAN INVENTARIS */}
          <div className="grid grid-cols-12 gap-2">
            {/* Level BBM (3.5 cols) */}
            <div className="col-span-4 border border-slate-300 rounded-lg p-1.5 bg-white shadow-xs flex flex-col justify-between">
              <div className="flex justify-between items-center mb-0.5">
                <h4 className="text-[8.5px] font-black text-[#0F2D59] uppercase tracking-wider">
                  LEVEL BAHAN BAKAR (BBM)
                </h4>
                <span className="text-[8px] font-mono font-black text-cyan-900 bg-cyan-50 px-1 py-0.2 rounded border border-cyan-200">
                  {printWO.fuelLevel || '1/2'}
                </span>
              </div>
              <div className="bg-slate-50 p-1 rounded border border-slate-200">
                <FuelGauge level={printWO.fuelLevel || '1/2'} onChange={() => {}} readonly={true} />
              </div>
              <div className="text-[7px] text-slate-500 font-mono text-right mt-0.5">
                Jenis BBM: Solar [✓]
              </div>
            </div>

            {/* Checklist Kelengkapan & Inventaris Unit (8 cols) */}
            <div className="col-span-8 border border-slate-300 rounded-lg p-1.5 bg-white shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-slate-200 pb-0.5 mb-1">
                <h4 className="text-[8.5px] font-black text-[#0F2D59] uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> CHECKLIST KELENGKAPAN & INVENTARIS UNIT
                </h4>
                <span className="text-[7.5px] text-slate-500 font-mono">
                  {DEFAULT_INVENTORY_ITEMS.filter(item => isInventoryChecked(item)).length} / {DEFAULT_INVENTORY_ITEMS.length} Terpasang
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1 text-[8px]">
                {DEFAULT_INVENTORY_ITEMS.map((item) => {
                  const checked = isInventoryChecked(item);
                  return (
                    <div
                      key={item}
                      className={`flex items-center gap-1 px-1 py-0.5 rounded border transition-colors ${
                        checked
                          ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-950'
                          : 'bg-slate-50 border-slate-200 text-slate-500'
                      }`}
                    >
                      <span
                        className={`w-3 h-3 rounded-full flex items-center justify-center text-[7px] font-black shrink-0 ${
                          checked ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {checked ? '✓' : '✗'}
                      </span>
                      <span className="truncate">{item}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* HIERARCHY 5: INFORMASI SERAH TERIMA & KESEPAKATAN */}
          <div className="border border-slate-200 bg-slate-50 rounded-lg p-1.5 text-[8px] text-slate-700 leading-snug">
            <span className="font-bold text-slate-900">Pernyataan Kesepakatan Serah Terima: </span>
            Hasil pemeriksaan teknis mekanik, temuan kondisi fisik bodi luar kendaraan, kelengkapan inventaris barang bawaan, dan level bahan bakar di atas telah diperiksa bersama secara seksama antara Pelanggan/Pembawa Unit dan Service Advisor Indo Teknik saat penerimaan unit.
          </div>
        </div>

        {/* Bottom Signatures Page 2 */}
        <div className="border-t-2 border-slate-400 pt-1.5 shrink-0 print:break-inside-avoid">
          <div className="text-right text-[7.5px] text-slate-500 font-mono mb-1">
            Pekanbaru, {new Date(printWO.createdAt || Date.now()).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
          <div className="grid grid-cols-2 gap-6 text-center">
            <div className="border border-slate-300 rounded-lg p-1.5 bg-slate-50/70 shadow-xs">
              <p className="text-[9px] font-black text-slate-900 uppercase">Pelanggan / Pembawa Unit</p>
              <div className="h-10 border-b border-slate-400 my-1 flex items-end justify-center pb-0.5 text-[7.5px] text-slate-400">
                (Tanda Tangan & Nama Terang)
              </div>
              <p className="font-black text-slate-950 text-[9.5px] truncate">{printWO.customerName}</p>
            </div>

            <div className="border border-slate-300 rounded-lg p-1.5 bg-slate-50/70 shadow-xs">
              <p className="text-[9px] font-black text-slate-900 uppercase">Service Advisor (Indo Teknik)</p>
              <div className="h-10 border-b border-slate-400 my-1 flex items-end justify-center pb-0.5 text-[7.5px] text-slate-400">
                (Tanda Tangan & Stempel)
              </div>
              <p className="font-black text-slate-950 text-[9.5px]">{printWO.createdBy || 'Front Office Staff'}</p>
            </div>
          </div>

          <div className="flex justify-between items-center text-[7px] text-slate-500 border-t border-slate-200 pt-0.5 mt-0.5 font-mono">
            <span>Indo Teknik Pekanbaru • WA: wa.me/628117531881 • Email: customerservice@indo-teknik.com</span>
            <span className="font-bold text-slate-800">Lembar Pemeriksaan Kendaraan Halaman 2 • Dicetak: {new Date().toLocaleString('id-ID')} WIB</span>
          </div>
        </div>
      </div>
    );
  };

  // =========================================================================
  // PAGE 2 (OPTION B): LEMBAR PEMERIKSAAN KOMPONEN (COMPONENT INSPECTION SHEET)
  // Khusus untuk Metode Drop: Bawa Komponen Copotan (dropMethod === 'PARTS')
  // =========================================================================
  // PAGE 2 (OPTION B): LEMBAR PEMERIKSAAN KOMPONEN (COMPONENT INSPECTION SHEET)
  // Khusus untuk Metode Drop: Bawa Komponen Copotan (dropMethod === 'PARTS')
  // Bersifat ADAPTIF & AUTO-OPTIMIZED FIT A4:
  // - Tabel 1: Kondisi Komponen Saat Dibawa (mengganti pencatatan nomor seri, isi sendiri)
  // - Tabel 2: Hasil Pemeriksaan Mekanik Komponen (Custom, tulis sendiri)
  // - Menyesuaikan persis jumlah barang (1 ya 1, 2 ya 2, 10 ya 10)
  // - Otomatis skala typography, padding, gap & tinggi agar PASTI FIT 1 HALAMAN A4
  // =========================================================================
  const renderComponentInspectionPage2 = () => {
    // Dynamic parts list: if loosePartsList has items, render them; if empty, fallback to 1 single component
    const actualParts = loosePartsList.length > 0 ? loosePartsList : [
      {
        id: 'p-default',
        description: printWO.vehicleBrand && printWO.vehicleBrand !== 'Copotan (Loose Parts)' 
          ? printWO.vehicleBrand 
          : (printWO.assyNo ? `Komponen Unit / Part (${printWO.assyNo})` : 'Komponen Diesel Lepas'),
        partNumber: printWO.assyNo || '',
        physicalCondition: 'Normal / Baik'
      }
    ];

    // Dynamic custom mechanical inspection items
    const actualMechList: MechanicalInspectionItem[] = (printWO.mechanicalInspections && printWO.mechanicalInspections.length > 0)
      ? printWO.mechanicalInspections
      : [
          {
            id: 'm1',
            systemName: 'Pengujian Kalibrasi Test Bench (Spray & Pressure)',
            category: 'DIESEL_CORE',
            method: 'Uji Test Bench Tekanan Tinggi',
            status: 'NOT_INSPECTED',
            findings: 'Pemeriksaan performa dan debit bahan bakar awal.',
            recommendation: 'Kalibrasi sesuai toleransi spesifikasi pabrikan.'
          }
        ];

    const partsCount = actualParts.length;
    const mechCount = actualMechList.length;
    const totalItems = partsCount + mechCount;

    // Automatic responsive scaling to GUARANTEE fitting 1 page of A4
    // totalItems <= 4: spacious
    // totalItems <= 7: normal
    // totalItems <= 10: compact
    // totalItems > 10: dense
    const density = totalItems <= 4 ? 'spacious' : totalItems <= 7 ? 'normal' : totalItems <= 10 ? 'compact' : 'dense';

    const cellPadding = 
      density === 'spacious' ? 'py-1.5 px-2.5' :
      density === 'normal' ? 'py-1 px-2' :
      density === 'compact' ? 'py-0.5 px-1.5' : 'py-0.5 px-1';

    const thPadding = 
      density === 'spacious' ? 'py-1 px-2 text-[8px]' :
      density === 'normal' ? 'py-0.5 px-1.5 text-[7.5px]' :
      density === 'compact' ? 'py-0.5 px-1 text-[7px]' : 'py-0.2 px-1 text-[6.5px]';

    const textMain = 
      density === 'spacious' ? 'text-[8.5px]' :
      density === 'normal' ? 'text-[8px]' :
      density === 'compact' ? 'text-[7.5px]' : 'text-[7px]';

    const textPn = 
      density === 'spacious' ? 'text-[8px]' :
      density === 'normal' ? 'text-[7.5px]' :
      density === 'compact' ? 'text-[7px]' : 'text-[6.5px]';

    const badgeText = 
      density === 'spacious' ? 'text-[7.5px] px-1.5 py-0.2' :
      density === 'normal' ? 'text-[7px] px-1 py-0.2' :
      density === 'compact' ? 'text-[6.5px] px-1 py-0.1' : 'text-[6px] px-0.8 py-0.1';

    const sigHeight = 
      density === 'spacious' ? 'h-10' :
      density === 'normal' ? 'h-8' :
      density === 'compact' ? 'h-7' : 'h-6';

    const containerSpacing = 
      density === 'spacious' ? 'space-y-2' :
      density === 'normal' ? 'space-y-1.5' :
      density === 'compact' ? 'space-y-1' : 'space-y-0.5';

    return (
      <div className={`relative print-page print-page-2 print:max-h-[285mm] print:overflow-hidden ${containerSpacing} box-border`}>
        {/* Watermark */}
        <DocumentWatermark 
          config={watermarkConfig} 
          documentStatus={printWO.status} 
          documentType="INSPECTION" 
        />

        <div className={`relative z-1 ${containerSpacing}`}>
          {/* Header Page 2 - Component Sheet */}
          <div className="border-b-2 border-[#0F2D59] pb-1.5">
            <div className="flex justify-between items-start gap-3">
              <div className="flex-shrink min-w-0">
                <div className="flex items-center gap-2.5">
                  <SmartLogo 
                    baseName="logo-indo-teknik" 
                    alt="IT INDO TEKNIK" 
                    className="h-9 w-auto object-contain flex-shrink-0" 
                    style={{ height: '34px', maxWidth: '140px' }}
                  />
                  <div className="border-l-2 border-slate-300 pl-2.5 leading-tight text-left">
                    <p className="text-[11px] font-black tracking-widest text-[#0F2D59] uppercase">INDO TEKNIK PEKANBARU</p>
                    <p className="text-[9.5px] font-extrabold text-[#0F2D59] mt-0.5">
                      One Stop Solution for All Your Diesel Needs
                    </p>
                    <p className="text-[8px] text-slate-600 font-semibold flex items-center gap-1 mt-0.5 flex-wrap">
                      <MapPin className="w-2.5 h-2.5 text-[#E21F26] shrink-0" /> Jl. Riau Ujung No.898-904, Pekanbaru • WA: wa.me/628117531881 • Email: customerservice@indo-teknik.com
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-0.5 pl-0.5">
                  <SmartLogo 
                    baseName="logo-itech" 
                    alt="ITech" 
                    className="h-6 w-auto object-contain flex-shrink-0 bg-white px-1.5 py-0.5 rounded border border-slate-200" 
                    style={{ height: '20px', maxWidth: '80px' }}
                  />
                  <p className="text-[9px] font-black tracking-wider text-[#0F2D59] whitespace-nowrap bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    ITECH AUTHORIZED DEALER & WORKSHOP
                  </p>
                </div>
              </div>
              
              {/* Header Right / WO Number & Digital Verification QR */}
              <div className="flex items-center gap-2 shrink-0 max-w-[50%]">
                <div className="bg-white border border-slate-300 rounded-lg p-1 shadow-xs flex flex-col items-center justify-center shrink-0">
                  <QRCodeSVG value={trackingUrl} size={40} level="M" />
                  <span className="text-[6.5px] font-mono font-black text-slate-500 uppercase mt-0.5 tracking-tight">Scan Tracking</span>
                </div>

                <div className="text-right flex flex-col items-end">
                  <div className="flex items-center justify-end gap-1 flex-wrap">
                    <h2 className="text-[11px] font-black bg-[#0F2D59] text-white px-2 py-0.5 rounded tracking-wider uppercase shadow-xs">
                      LEMBAR PEMERIKSAAN KOMPONEN
                    </h2>
                    <span className="text-[7.5px] font-black bg-amber-100 text-amber-950 border border-amber-300 px-1 py-0.5 rounded uppercase shrink-0">
                      HALAMAN 2 • KONDISI KOMPONEN & HASIL MEKANIK
                    </span>
                  </div>

                  <div className="mt-1 flex items-center gap-1.5 bg-slate-50 border-2 border-slate-400 rounded-lg px-2 py-0.5 shadow-xs">
                    <span className="text-[8.5px] font-black text-slate-600 uppercase">NO. WO:</span>
                    <span className="text-sm sm:text-base font-mono font-black text-[#0F2D59] tracking-tight">{printWO.id}</span>
                  </div>

                  <div className="text-[8px] text-slate-600 font-bold mt-0.5 font-mono flex items-center gap-1">
                    <span>Tgl: {new Date(printWO.createdAt || Date.now()).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    <span>•</span>
                    <span>SA: {printWO.createdBy || 'Front Office'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Grid Compact */}
          <div className="grid grid-cols-12 gap-2 text-xs">
            {/* Customer Box */}
            <div className="col-span-6 border border-slate-300 bg-slate-50/90 rounded-lg p-2 shadow-xs flex flex-col justify-between">
              <div className="space-y-0.5">
                <h3 className="font-black border-b border-slate-300 pb-0.5 mb-0.5 text-[#0F2D59] text-[9px] uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span> DATA PELANGGAN & PEMBAWA KOMPONEN
                </h3>
                <div className="flex justify-between items-baseline gap-2">
                  <span className="text-slate-500 font-bold shrink-0 text-[9px] uppercase">Pelanggan:</span>
                  <span className="font-black text-slate-950 text-right truncate text-[11px]">{printWO.customerName}</span>
                </div>
                <div className="flex justify-between items-baseline gap-2">
                  <span className="text-slate-500 font-bold shrink-0 text-[9px] uppercase">No. Telepon:</span>
                  <span className="font-bold text-slate-900 text-right font-mono text-[10px] bg-white px-1 py-0.2 rounded border border-slate-200">{printWO.customerPhone || '-'}</span>
                </div>
                <div className="flex justify-between items-baseline gap-2">
                  <span className="text-slate-500 font-bold shrink-0 text-[9px] uppercase">Alamat:</span>
                  <span className="text-slate-700 text-right truncate text-[9.5px] max-w-[210px]">{printWO.customerAddress || '-'}</span>
                </div>
                <div className="flex justify-between items-baseline gap-2 pt-0.5 border-t border-slate-200">
                  <span className="text-blue-900 font-black shrink-0 text-[9px] uppercase">Pembawa:</span>
                  <span className="font-bold text-slate-900 text-right truncate text-[9.5px]">
                    {printWO.bringerName || printWO.customerName} {printWO.bringerPhone ? `(${printWO.bringerPhone})` : ''}
                  </span>
                </div>
              </div>
            </div>

            {/* SECTION A: DATA PENERIMAAN KOMPONEN */}
            <div className="col-span-6 border border-slate-300 bg-slate-50/90 rounded-lg p-2 shadow-xs flex flex-col justify-between">
              <div className="space-y-0.5">
                <h3 className="font-black border-b border-slate-300 pb-0.5 mb-0.5 text-[#0F2D59] text-[9px] uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> SECTION A: DATA PENERIMAAN KOMPONEN
                  </span>
                  <span className="text-[7.5px] font-mono font-bold text-amber-900 bg-amber-100 border border-amber-300 px-1 py-0.2 rounded">
                    {printWO.componentQty || partsCount} Unit Fisik
                  </span>
                </h3>
                <div className="flex justify-between items-baseline gap-2">
                  <span className="text-slate-500 font-bold shrink-0 text-[8.5px] uppercase">Nama Komponen:</span>
                  <span className="font-black text-slate-950 text-right truncate text-[10px]">
                    {printWO.componentName || printWO.componentCategory || printWO.vehicleBrand || 'Komponen Diesel'}
                  </span>
                </div>
                <div className="flex justify-between items-baseline gap-2">
                  <span className="text-slate-500 font-bold shrink-0 text-[8.5px] uppercase">Jenis & Merek:</span>
                  <span className="font-bold text-slate-800 text-right truncate text-[9px]">
                    {printWO.componentCategory || 'Komponen'} {printWO.componentBrand ? `• ${printWO.componentBrand}` : ''}
                  </span>
                </div>
                <div className="flex justify-between items-baseline gap-2">
                  <span className="text-slate-500 font-bold shrink-0 text-[8.5px] uppercase">Part Number (P/N):</span>
                  <span className="font-mono text-blue-900 text-right truncate text-[9.5px] font-bold">
                    {printWO.componentPartNumber || printWO.assyNo || '-'}
                  </span>
                </div>
                <div className="flex justify-between items-baseline gap-2">
                  <span className="text-slate-500 font-bold shrink-0 text-[8.5px] uppercase">Kondisi Diterima:</span>
                  <span className="font-bold text-emerald-800 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200 text-right truncate text-[8.5px]">
                    {printWO.componentIntakeCondition || (actualParts[0]?.physicalCondition) || 'Normal / Baik'}
                  </span>
                </div>
                <div className="flex justify-between items-baseline gap-2 pt-0.5 border-t border-slate-200 text-[8.5px]">
                  <span className="text-slate-500 font-bold uppercase">Estimasi Pengerjaan:</span>
                  <span className="font-bold text-slate-900 text-right">{printWO.estimasiPengerjaan || '-'}</span>
                </div>
                <div className="flex justify-between items-baseline gap-2 text-[8.5px]">
                  <span className="text-slate-500 font-bold uppercase">Ketentuan Garansi:</span>
                  <span className="font-bold text-blue-950 text-right">{printWO.garansi || '-'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* TABEL 1: KONDISI KOMPONEN SAAT DIBAWA (ADAPTIVE TABLE - ISI SENDIRI) */}
          <div className="border border-slate-300 rounded-lg overflow-hidden bg-white shadow-xs">
            <div className="bg-[#0F2D59] text-white px-2 py-0.5 flex items-center justify-between">
              <h3 className="text-[8.5px] font-black uppercase tracking-wider flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-emerald-400" /> 
                1. KONDISI KOMPONEN SAAT DIBAWA ({partsCount} ITEM)
              </h3>
              <span className="text-[7.5px] text-blue-200 font-mono">
                Pencatatan Fisik Aktual Komponen Saat Diserahkan Pelanggan
              </span>
            </div>
            
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-slate-800 font-black uppercase">
                  <th className={`${thPadding} text-center w-7 border-r border-slate-200`}>NO</th>
                  <th className={`${thPadding} w-[32%] border-r border-slate-200`}>NAMA KOMPONEN / DESKRIPSI</th>
                  <th className={`${thPadding} w-[22%] border-r border-slate-200 font-mono`}>PART NUMBER (P/N) / NO. SERI</th>
                  <th className={`${thPadding} w-[24%] border-r border-slate-200`}>KONDISI KOMPONEN SAAT DIBAWA</th>
                  <th className={`${thPadding} w-[22%]`}>CATATAN PENERIMAAN FISIK</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {actualParts.map((part, index) => {
                  const cond = (part.physicalCondition || 'Normal / Baik').trim();
                  const isOk = cond.toLowerCase().includes('ok') || cond.toLowerCase().includes('normal') || cond.toLowerCase().includes('baik');
                  return (
                    <tr key={part.id || index} className={index % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}>
                      <td className={`${cellPadding} text-center font-mono font-bold text-slate-700 bg-slate-50 border-r border-slate-200 ${textMain}`}>
                        {index + 1}
                      </td>
                      <td className={`${cellPadding} font-bold text-slate-950 border-r border-slate-200 ${textMain}`}>
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"></span>
                          <span className="break-words">{part.description || `Komponen #${index + 1}`}</span>
                        </div>
                      </td>
                      <td className={`${cellPadding} font-mono font-bold text-slate-900 border-r border-slate-200 ${textPn}`}>
                        {part.partNumber ? (
                          <span className="bg-slate-100 px-1 py-0.2 rounded border border-slate-200 inline-block font-mono">
                            {part.partNumber}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-[7.5px]">- Belum ada P/N -</span>
                        )}
                      </td>
                      <td className={`${cellPadding} border-r border-slate-200 ${textMain}`}>
                        <span className={`inline-flex items-center gap-1 rounded font-bold border ${badgeText} ${
                          isOk 
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                            : 'bg-rose-50 text-rose-800 border-rose-300'
                        }`}>
                          {isOk ? '✓' : '⚠️'} {cond}
                        </span>
                      </td>
                      <td className={`${cellPadding} text-slate-700 ${textPn}`}>
                        <span className="font-semibold text-slate-900">Diterima lengkap; </span>
                        <span className="text-slate-500">siap uji kalibrasi lab</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* TABEL 2: HASIL PEMERIKSAAN MEKANIK KOMPONEN (CUSTOM - DITULIS SENDIRI) */}
          <div className="border border-[#0F2D59] rounded-lg overflow-hidden bg-white shadow-xs">
            <div className="bg-[#0F2D59] text-white px-2 py-0.5 flex items-center justify-between">
              <h3 className="text-[8.5px] font-black uppercase tracking-wider flex items-center gap-1">
                <Wrench className="w-3 h-3 text-amber-400" /> 
                2. HASIL PEMERIKSAAN MEKANIK & PENGUJIAN LAB ({mechCount} ITEM)
              </h3>
              <span className="text-[7.5px] text-blue-200 font-mono">
                Hasil Diagnosa & Pengujian Test Bench Komponen
              </span>
            </div>
            
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-slate-800 font-black uppercase">
                  <th className={`${thPadding} text-center w-7 border-r border-slate-200`}>NO</th>
                  <th className={`${thPadding} w-[26%] border-r border-slate-200`}>BAGIAN / KOMPONEN DIPERIKSA</th>
                  <th className={`${thPadding} w-[18%] border-r border-slate-200`}>METODE PENGUJIAN</th>
                  <th className={`${thPadding} w-[16%] text-center border-r border-slate-200`}>STATUS KONDISI</th>
                  <th className={`${thPadding} w-[24%] border-r border-slate-200`}>HASIL TEMUAN & ANALISIS MEKANIK</th>
                  <th className={`${thPadding} w-[16%]`}>REKOMENDASI TINDAKAN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {actualMechList.map((item, idx) => {
                  const isIssue = item.status === 'ISSUE_FOUND';
                  const isNormal = item.status === 'NORMAL';
                  const isFurther = item.status === 'FURTHER_TEST_NEEDED';

                  const statusBadgeText = isIssue
                    ? '[!] Ditemukan Masalah'
                    : isNormal
                      ? '[✓] Kondisi Normal'
                      : isFurther
                        ? '[?] Perlu Uji Lanjutan'
                        : '[-] Belum Diperiksa';

                  const statusBadgeClass = isIssue
                    ? 'bg-rose-100 text-rose-900 border-rose-300 font-black'
                    : isNormal
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold'
                      : isFurther
                        ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                        : 'bg-slate-100 text-slate-700 border-slate-300';

                  return (
                    <tr key={item.id || idx} className={isIssue ? 'bg-rose-50/40' : idx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}>
                      <td className={`${cellPadding} text-center font-mono font-bold text-slate-600 bg-slate-50 border-r border-slate-200 ${textMain}`}>
                        {idx + 1}
                      </td>
                      <td className={`${cellPadding} font-bold text-slate-950 border-r border-slate-200 ${textMain}`}>
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0"></span>
                          <span className="break-words">{item.systemName}</span>
                        </div>
                      </td>
                      <td className={`${cellPadding} text-slate-700 border-r border-slate-200 ${textPn}`}>
                        {item.method || 'Visual & Standar Lab'}
                      </td>
                      <td className={`${cellPadding} text-center border-r border-slate-200 whitespace-nowrap`}>
                        <span className={`inline-block px-1 py-0.2 rounded border uppercase ${badgeText} ${statusBadgeClass}`}>
                          {statusBadgeText}
                        </span>
                      </td>
                      <td className={`${cellPadding} border-r border-slate-200 ${textMain}`}>
                        <div className="font-semibold text-slate-900 break-words">
                          {item.findings || (isNormal ? 'Komponen normal terverifikasi sesuai standar toleransi lab.' : isIssue ? 'Terdeteksi deviasi/masalah pada hasil pengujian.' : 'Pemeriksaan lanjutan dijadwalkan.')}
                        </div>
                        {item.diagnosisNotes && (
                          <div className={`mt-0.5 text-blue-900 font-medium bg-blue-50/80 px-1 py-0.2 rounded border border-blue-200 ${textPn}`}>
                            <span className="font-black">Analisis: </span>{item.diagnosisNotes}
                          </div>
                        )}
                      </td>
                      <td className={`${cellPadding} text-slate-800 break-words ${textMain}`}>
                        {item.recommendation ? (
                          <span className="font-medium text-blue-950">{item.recommendation}</span>
                        ) : (
                          <span className="text-slate-400 italic text-[7.5px]">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* CATATAN KELUHAN & PERMINTAAN PEMERIKSAAN KOMPONEN (CUSTOMER VOICE) */}
          <div className="border border-slate-300 rounded-lg p-1.5 bg-white shadow-xs">
            <h3 className="text-[8.5px] font-black text-[#0F2D59] uppercase tracking-wider mb-0.5 flex items-center justify-between border-b border-slate-200 pb-0.5">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                KELUHAN / GEJALA AWAL & CATATAN PERMINTAAN PEMERIKSAAN KOMPONEN
              </span>
              <span className="text-[7.5px] font-mono text-slate-500 font-bold">Customer Voice & Requirement</span>
            </h3>
            <div className={`font-semibold text-slate-800 bg-slate-50 p-1.5 rounded border border-slate-200 leading-snug whitespace-pre-line ${textMain}`}>
              {printWO.customerVoice || 'Komponen diterima untuk verifikasi fisik awal, pengujian tekanan & kalibrasi di test bench laboratorium.'}
            </div>
          </div>

          {/* Serah Terima Notes */}
          <div className={`border border-slate-200 bg-slate-50 rounded-lg p-1.5 leading-tight ${textPn} text-slate-700`}>
            <span className="font-bold text-slate-900">Pernyataan Kesepakatan Serah Terima Komponen: </span>
            Pelanggan dan Laboratorium Indo Teknik telah bersama-sama memeriksa jumlah fisik, kondisi saat diserahkan, dan kelengkapan komponen di atas. Kerusakan internal/cacat tersembunyi akibat riwayat aus sebelum masuk bengkel bukan tanggung jawab pihak bengkel.
          </div>
        </div>

        {/* Bottom Signatures Page 2 - 3 Pihak Lab */}
        <div className="border-t-2 border-slate-400 pt-1 shrink-0 print:break-inside-avoid">
          <div className="text-right text-[7.5px] text-slate-500 font-mono mb-0.5">
            Pekanbaru, {new Date(printWO.createdAt || Date.now()).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="border border-slate-300 rounded-lg p-1 bg-slate-50/70 shadow-xs">
              <p className="text-[8.5px] font-black text-slate-900 uppercase">Pelanggan / Pembawa</p>
              <div className={`${sigHeight} border-b border-slate-400 my-0.5 flex items-end justify-center pb-0.5 text-[7px] text-slate-400`}>
                (Tanda Tangan & Nama Terang)
              </div>
              <p className="font-black text-slate-950 text-[9px] truncate">{printWO.bringerName || printWO.customerName}</p>
            </div>

            <div className="border border-slate-300 rounded-lg p-1 bg-slate-50/70 shadow-xs">
              <p className="text-[8.5px] font-black text-slate-900 uppercase">Service Advisor (Penerima)</p>
              <div className={`${sigHeight} border-b border-slate-400 my-0.5 flex items-end justify-center pb-0.5 text-[7px] text-slate-400`}>
                (Tanda Tangan & Stempel)
              </div>
              <p className="font-black text-slate-950 text-[9px] truncate">{printWO.createdBy || 'Front Office Staff'}</p>
            </div>

            <div className="border border-slate-300 rounded-lg p-1 bg-slate-50/70 shadow-xs">
              <p className="text-[8.5px] font-black text-slate-900 uppercase">Teknisi Lab / Foreman</p>
              <div className={`${sigHeight} border-b border-slate-400 my-0.5 flex items-end justify-center pb-0.5 text-[7px] text-slate-400`}>
                (Pemeriksa & Uji Fisik Lab)
              </div>
              <p className="font-black text-slate-950 text-[9px] truncate">{printWO.mechanicName || 'Laboratorium Diesel'}</p>
            </div>
          </div>

          <div className="flex justify-between items-center text-[7px] text-slate-500 border-t border-slate-200 pt-0.5 mt-0.5 font-mono">
            <span>Indo Teknik Pekanbaru • WA: wa.me/628117531881 • Email: customerservice@indo-teknik.com</span>
            <span className="font-bold text-slate-800">Lembar Pemeriksaan Komponen Halaman 2 • Dicetak: {new Date().toLocaleString('id-ID')} WIB</span>
          </div>
        </div>
      </div>
    );
  };

  // Helper to render either Vehicle Inspection or Component Inspection for Page 2
  const renderPage2 = () => {
    return isPartsOnly ? renderComponentInspectionPage2() : renderVehicleInspectionPage2();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[100] overflow-y-auto print:static print:h-auto print:w-auto print:overflow-visible print:bg-white text-[#0f172a] font-sans">
      <style>{`
        @page {
          size: A4 portrait;
          margin: 6mm 8mm !important;
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
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            max-height: 285mm !important;
            overflow: hidden !important;
          }
          .print-page-2 {
            page-break-after: avoid !important;
            break-after: avoid !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            max-height: 285mm !important;
            overflow: hidden !important;
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

      <div className={`w-full mx-auto bg-white p-3.5 sm:p-8 shadow-2xl print:shadow-none print:max-w-none print:w-full print:p-0 print:m-0 print-wrapper box-border ${
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
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mb-6 print:hidden no-print border-b pb-3 bg-slate-50 -mx-3.5 sm:-mx-8 -mt-3.5 sm:-mt-8 p-3.5 sm:p-5 rounded-t-lg border-slate-200">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button 
              onClick={() => setPrintWO(null)} 
              className="px-3.5 py-2 min-h-[42px] border border-slate-300 rounded-lg hover:bg-white text-slate-700 flex items-center gap-2 text-xs sm:text-sm font-bold transition-colors shadow-xs cursor-pointer active:scale-95 shrink-0"
            >
              <ArrowLeft className="w-4 h-4" /> <span className="hidden xs:inline">Kembali</span>
            </button>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-extrabold text-slate-800 leading-tight truncate">
                Pratinjau Cetak SPK {isPartsOnly ? '& Lembar Komponen' : '& Lembar Inspeksi'}
              </h2>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium">
                {isPartsOnly 
                  ? 'Dokumen Resmi Workshop & Pemeriksaan Komponen Lab (2 Halaman)' 
                  : 'Dokumen Resmi Workshop & Lembar Pemeriksaan Kendaraan (2 Halaman)'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 justify-between sm:justify-end">
            {/* View Mode Switcher */}
            <div className="flex bg-slate-200 p-1 rounded-lg border border-slate-300 text-xs font-bold overflow-x-auto max-w-full">
              <button
                type="button"
                onClick={() => setSpkViewMode('FULL_2_PAGES')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap text-[11px] sm:text-xs ${
                  spkViewMode === 'FULL_2_PAGES'
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" /> 2 Hal
              </button>
              <button
                type="button"
                onClick={() => setSpkViewMode('SPK_ONLY')}
                className={`px-2 sm:px-2.5 py-1.5 rounded-md flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap text-[11px] sm:text-xs ${
                  spkViewMode === 'SPK_ONLY'
                    ? 'bg-white text-[#0F2D59] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" /> Hal 1 (SPK)
              </button>
              <button
                type="button"
                onClick={() => setSpkViewMode('INSPECTION_ONLY')}
                className={`px-2 sm:px-2.5 py-1.5 rounded-md flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap text-[11px] sm:text-xs ${
                  spkViewMode === 'INSPECTION_ONLY'
                    ? 'bg-white text-[#0F2D59] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title={isPartsOnly ? 'Cetak Lembar Pemeriksaan Komponen Saja' : 'Cetak Lembar Pemeriksaan Kendaraan Saja'}
              >
                <ClipboardCheck className="w-3.5 h-3.5" /> {isPartsOnly ? 'Hal 2 (Komponen)' : 'Hal 2 (Mobil)'}
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

            {/* Zoom Controls (Hidden on small mobile) */}
            <div className="hidden xs:flex items-center bg-slate-200 p-1 rounded-lg border border-slate-300 text-xs font-bold">
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
              className="flex-1 sm:flex-initial h-10 px-3 sm:px-4 bg-white hover:bg-rose-50 border-2 border-rose-500/90 hover:border-rose-600 text-rose-700 hover:text-rose-800 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer min-h-[42px]"
              title="Simpan atau Ekspor SPK sebagai file PDF"
            >
              <Download className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Simpan PDF</span>
            </button>

            <button 
              onClick={() => window.print()} 
              className="flex-1 sm:flex-initial h-10 sm:h-11 px-4 sm:px-6 bg-[#0F2D59] hover:bg-[#16427e] text-white rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#0F2D59]/30 ring-2 ring-blue-400/40 ring-offset-2 active:scale-95 cursor-pointer min-h-[42px]"
              title="Cetak SPK Fisik ke Printer"
            >
              <Printer className="w-4 h-4 text-blue-200 shrink-0" />
              <span>
                {spkViewMode === 'FULL_2_PAGES' 
                  ? 'Cetak (2 Hal)' 
                  : spkViewMode === 'SPK_ONLY' 
                    ? 'Cetak Hal 1 (SPK)' 
                    : isPartsOnly ? 'Cetak Hal 2 (Komponen)' : 'Cetak Hal 2 (Mobil)'}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Sticky Quick-Action Bar at bottom */}
        <div className="sm:hidden fixed bottom-4 inset-x-3 z-50 flex gap-2 bg-slate-900/95 backdrop-blur-md p-2 rounded-2xl shadow-2xl border border-white/20 print:hidden">
          <button
            onClick={() => setPrintWO(null)}
            className="px-3 min-h-[44px] bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center justify-center shrink-0 active:scale-95 cursor-pointer"
            title="Kembali"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => window.print()}
            className="flex-1 min-h-[44px] bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg active:scale-95 cursor-pointer"
            title="Simpan PDF di Handphone"
          >
            <Download className="w-4 h-4" /> Simpan PDF
          </button>
          <button
            onClick={() => window.print()}
            className="flex-1 min-h-[44px] bg-[#0F2D59] hover:bg-blue-800 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg active:scale-95 cursor-pointer"
            title="Cetak ke Printer"
          >
            <Printer className="w-4 h-4" /> Cetak
          </button>
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
            <div className="print-page print-page-2 border border-slate-200/80 rounded-xl p-4 lg:p-6 bg-white shadow-xs print:border-none print:p-0 print:shadow-none">
              <div className="mb-2 text-[10px] font-black uppercase tracking-wider text-blue-900 flex items-center justify-between border-b border-slate-200 pb-1 print:hidden">
                <span className="flex items-center gap-1.5">
                  <ClipboardCheck className="w-3 h-3 text-blue-600" /> 
                  {isPartsOnly ? 'Lembar 2: Lembar Pemeriksaan Komponen (Component Inspection Sheet)' : 'Lembar 2: Visual Body Map & Lembar Pemeriksaan Kendaraan'}
                </span>
                <span className="font-mono bg-blue-50 text-blue-800 px-2 py-0.2 rounded">Halaman 2 dari 2</span>
              </div>
              {renderPage2()}
            </div>
          </div>
        )}

        {/* MODE 2: SPK ONLY */}
        {spkViewMode === 'SPK_ONLY' && renderSPKPage1()}

        {/* MODE 3: INSPECTION ONLY */}
        {spkViewMode === 'INSPECTION_ONLY' && renderPage2()}

      </div>
    </div>
  );
};

export default PrintTemplate;
