import React from 'react';
import { useApp } from '../store/AppContext';
import { Printer, Download, ArrowLeft, MapPin, ShieldCheck, Wrench, CheckCircle } from 'lucide-react';
import { SmartLogo } from './SmartLogo';
import { QRCodeSVG } from 'qrcode.react';
import { FuelGauge } from './FuelGauge';

const formatRupiah = (value: string | number | undefined | null): string => {
  if (value === undefined || value === null) return '';
  const str = String(value).replace(/\D/g, '');
  if (!str) return '';
  const num = parseInt(str, 10);
  return 'Rp ' + num.toLocaleString('id-ID');
};

const ALL_CAR_INSPECTION_PARTS = [
  { id: 'front-view', label: 'Tampak Depan' },
  { id: 'rear-view', label: 'Tampak Belakang' },
  { id: 'left-side', label: 'Samping Kiri' },
  { id: 'right-side', label: 'Samping Kanan' },
  { id: 'top-view', label: 'Top / Atap' },
  { id: 'dashboard-panel', label: 'Dashboard Panel' },
  { id: 'spion-dalam', label: 'Spion Dalam' },
  { id: 'soket-kelistrikan', label: 'Soket Kelistrikan' },
  { id: 'plafon', label: 'Plafon Mobil' },
];

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
  const { printWO, setPrintWO, printType, trackingBaseUrl } = useApp();

  if (!printWO) return null;

  const baseTrackingUrl = trackingBaseUrl || 'https://it-erp-app.web.app';

  const TableInfo = ({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) => (
    <div className="flex justify-between items-baseline py-1 border-b border-dashed border-slate-200 text-xs">
      <span className="text-slate-500 font-semibold shrink-0 pr-2">{label}:</span>
      <span className={`text-right truncate font-bold ${highlight ? 'text-[#0F2D59] font-black text-sm' : 'text-slate-900'}`}>
        {value}
      </span>
    </div>
  );

  // =========================================================================
  // 1-PAGE HANDOVER TEMPLATE (BUKTI PENYERAHAN BARANG / UNIT)
  // =========================================================================
  if (printType === 'HANDOVER') {
    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[100] overflow-y-auto print:static print:h-auto print:w-auto print:overflow-visible print:bg-white text-[#0f172a] font-sans">
        <style>{`
          @page {
            size: A4 portrait;
            margin: 6mm 8mm 6mm 8mm !important;
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
              height: 282mm !important;
              max-height: 282mm !important;
              page-break-after: avoid !important;
              break-after: avoid !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              display: flex !important;
              flex-direction: column !important;
              justify-content: space-between !important;
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
        
        <div className="max-w-[215mm] mx-auto bg-white p-6 sm:p-8 shadow-2xl print:shadow-none print:max-w-none print:w-full print:p-0 print:m-0 min-h-screen print:min-h-0 flex flex-col justify-between print-handover-sheet">
          <div className="flex-1 flex flex-col justify-start">
            
            {/* ACTION BAR (Hidden in print) */}
            <div className="flex justify-between items-center mb-4 print:hidden no-print border-b pb-3 bg-slate-50 -mx-6 sm:-mx-8 -mt-6 sm:-mt-8 p-4 rounded-t-lg border-slate-200">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setPrintWO(null)} 
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-white text-slate-700 flex items-center gap-2 text-sm font-bold transition-colors shadow-xs cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> Kembali
                </button>
                <div>
                  <h2 className="text-base font-extrabold text-slate-800 leading-tight">Bukti Penyerahan Barang (Handover Receipt)</h2>
                  <p className="text-xs text-slate-500">Format Cetak Rapi & Elegan (1 Halaman A4)</p>
                </div>
              </div>
              <div className="flex space-x-2">
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
            <div className="border-b-2 border-[#0F2D59] pb-2.5 mb-3">
              <div className="flex justify-between items-start gap-3">
                <div className="flex-shrink min-w-0">
                  <div className="flex items-center gap-3">
                    <SmartLogo 
                      baseName="logo-indo-teknik" 
                      alt="IT INDO TEKNIK" 
                      className="h-10 w-auto object-contain flex-shrink-0" 
                      style={{ height: '38px', maxWidth: '150px' }}
                    />
                    <div className="border-l-2 border-slate-300 pl-3 leading-tight text-left">
                      <p className="text-xs font-black tracking-widest text-[#0F2D59] uppercase">INDO TEKNIK PEKANBARU</p>
                      <p className="text-[10px] text-slate-600 font-semibold flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-[#E21F26] shrink-0" /> Jl. Riau Ujung No.898-904, Pekanbaru • Telp: (0761) 853798
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-1 pl-0.5">
                    <SmartLogo 
                      baseName="logo-itech" 
                      alt="ITech" 
                      className="h-5 w-auto object-contain flex-shrink-0" 
                      style={{ height: '20px', maxWidth: '70px' }}
                    />
                    <p className="text-[9.5px] font-black tracking-wider text-[#0F2D59] whitespace-nowrap bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      ITECH AUTHORIZED DEALER & WORKSHOP
                    </p>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end shrink-0 max-w-[48%]">
                  <h2 className="text-xs font-black bg-[#0F2D59] text-white px-3 py-1 rounded tracking-wider uppercase shadow-xs">
                    BUKTI SERAH TERIMA UNIT
                  </h2>
                  <p className="text-xs font-mono mt-1 text-slate-900 font-bold">
                    NO. WO: <span className="text-[#0F2D59] font-black text-sm">{printWO.id}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* DOCUMENT TITLE */}
            <div className="text-center mb-3">
              <h1 className="text-lg font-black text-slate-950 uppercase tracking-tight">SURAT PENYERAHAN BARANG / UNIT</h1>
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-0.5">UNIT HANDOVER RECEIPT & WARRANTY STATEMENT</p>
            </div>

            {/* METADATA GRID */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-slate-50/90 border border-slate-300 rounded-lg p-3 shadow-xs">
                <h3 className="text-[10.5px] font-black text-[#0F2D59] uppercase tracking-wider mb-2 border-b border-slate-200 pb-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span> INFORMASI PELANGGAN
                </h3>
                <TableInfo label="Nama Pelanggan" value={printWO.customerName} highlight />
                <TableInfo label="No. Telepon" value={printWO.customerPhone} />
                <TableInfo label="Alamat Pelanggan" value={printWO.customerAddress || '-'} />
                {printWO.bringerName && <TableInfo label="Nama Pembawa" value={`${printWO.bringerName} ${printWO.bringerPhone ? `(${printWO.bringerPhone})` : ''}`} />}
              </div>

              <div className="bg-slate-50/90 border border-slate-300 rounded-lg p-3 shadow-xs">
                <h3 className="text-[10.5px] font-black text-[#0F2D59] uppercase tracking-wider mb-2 border-b border-slate-200 pb-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-600"></span> INFORMASI KENDARAAN & WO
                </h3>
                <TableInfo label="Merek/Tipe" value={printWO.vehicleBrand || '-'} />
                <TableInfo label="No. Polisi" value={printWO.plateNumber || '-'} highlight />
                <TableInfo label="No. Rangka (VIN)" value={printWO.vin || '-'} />
                <TableInfo label="Odometer" value={printWO.odometer ? `${printWO.odometer} km` : '-'} />
                <TableInfo label="Metode Penyerahan" value={printWO.dropMethod === 'PARTS' ? 'KOMPONEN COPOTAN (PARTS)' : 'UNIT KENDARAAN UTUH'} />
              </div>
            </div>

            {/* SUMMARY OF SERVICE */}
            <div className="border border-slate-300 rounded-lg overflow-hidden mb-3 shadow-xs">
              <div className="bg-[#0F2D59] text-white px-3 py-1.5 flex items-center justify-between">
                <h3 className="text-[10.5px] font-black uppercase tracking-wider">DETAIL REKONSILIASI & TINDAKAN PERBAIKAN</h3>
                <span className="text-[9.5px] text-blue-200 font-bold">Hasil Akhir Bengkel</span>
              </div>
              <div className="p-3 space-y-2.5 bg-white">
                <div>
                  <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-wider mb-1">Keluhan Pelanggan yang Telah Diselesaikan:</h4>
                  <div className="bg-slate-50 border border-slate-200 rounded p-2.5 text-xs font-bold text-slate-900 whitespace-pre-line leading-relaxed">
                    {printWO.customerVoice}
                  </div>
                </div>

                {printWO.todoActions && printWO.todoActions.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-wider mb-1">Rincian Tindakan Jasa & Suku Cadang:</h4>
                    <table className="w-full table-auto text-left border-collapse border border-slate-300 text-xs">
                      <thead>
                        <tr className="border-b border-slate-300 text-slate-700 font-bold bg-slate-100 text-[10.5px] uppercase">
                          <th className="py-4 px-3 border-r border-slate-300">Item Pekerjaan</th>
                          <th className="py-4 px-3 text-center w-14 border-r border-slate-300">Qty</th>
                          <th className="py-4 px-3 text-right w-36">Biaya / Estimasi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {printWO.todoActions.slice(0, 5).map((act, idx) => (
                          <tr key={act.id} className={`border-b border-slate-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                            <td className="py-4 px-3 font-bold text-slate-950 border-r border-slate-200">{act.jenisPengerjaan}</td>
                            <td className="py-4 px-3 text-center font-bold text-slate-900 border-r border-slate-200">{act.qty}</td>
                            <td className="py-4 px-3 text-right font-mono font-bold text-slate-950">{formatRupiah(act.estimasiHarga)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* WARRANTY STATEMENT */}
            <div className="bg-blue-50/90 border border-blue-300 rounded-lg p-3 mb-3 shadow-xs">
              <h3 className="text-[10.5px] font-black text-[#0F2D59] uppercase tracking-wider mb-1">KETENTUAN GARANSI & PERSETUJUAN</h3>
              <p className="text-xs text-slate-800 leading-relaxed font-medium">
                Unit/komponen diesel yang diserahkan dalam surat ini dilindungi oleh garansi resmi Indo Teknik Pekanbaru selama <span className="font-black text-[#0F2D59] bg-blue-100 px-1.5 py-0.5 rounded text-xs">{printWO.garansi || '3 Bulan'}</span> terhitung sejak tanggal serah terima. Garansi berlaku apabila segel pengaman tidak rusak dan bukan akibat kontaminasi bahan bakar solar kotor.
              </p>
            </div>
          </div>

          {/* HANDOVER DATE AND SIGNATURES */}
          <div className="border-t-2 border-slate-300 pt-2 shrink-0 print:break-inside-avoid">
            <div className="flex justify-between items-center text-[10px] text-slate-600 mb-2 font-mono">
              <span>Waktu Serah Terima: <strong>{printWO.handoverDate ? new Date(printWO.handoverDate).toLocaleString('id-ID') : new Date().toLocaleString('id-ID')}</strong></span>
              <span className="font-bold">Dicetak Resmi via Indo Teknik ERP</span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="border border-slate-300 rounded-lg p-2.5 flex flex-col justify-between h-24 bg-slate-50/60 shadow-xs">
                <div>
                  <span className="text-[10.5px] font-black text-slate-800 uppercase tracking-wider">PIHAK BENGKEL (INDO TEKNIK)</span>
                  <p className="text-[9px] text-slate-500 font-semibold">Diserahkan Oleh,</p>
                </div>
                <div className="border-t border-slate-400 pt-1 mx-auto w-48 text-xs font-bold text-slate-900">
                  Front Office / Service Advisor
                </div>
              </div>

              <div className="border border-slate-300 rounded-lg p-2.5 flex flex-col justify-between h-24 bg-slate-50/60 shadow-xs">
                <div>
                  <span className="text-[10.5px] font-black text-slate-800 uppercase tracking-wider">PIHAK PELANGGAN / CUSTOMER</span>
                  <p className="text-[9px] text-slate-500 font-semibold">Diterima Oleh,</p>
                </div>
                <div className="border-t border-slate-400 pt-1 mx-auto w-48 text-xs font-bold text-slate-950 truncate">
                  {printWO.customerName}
                </div>
              </div>
            </div>

            <div className="text-center mt-2 text-[9.5px] text-slate-500 border-t border-slate-200 pt-1 font-mono">
              Indo Teknik Pekanbaru • Authorized Diesel Specialist • Jl. Riau Ujung No.898-904 Pekanbaru • Telp: (0761) 853798
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // STRICT 2-PAGE PRINT LAYOUT (HIGH CLARITY, PROPORTIONAL SPACING & ELDERLY-FRIENDLY)
  // PAGE 1: LEMBAR PEMERIKSAAN KENDARAAN (INSPECTION SHEET - CUSTOMER COPY)
  // PAGE 2: SURAT PERINTAH KERJA (SPK BENGKEL - WORKSHOP COPY)
  // =========================================================================

  const complaintLines = printWO.customerVoice
    ? printWO.customerVoice
        .split('\n')
        .map(l => l.trim().replace(/^\d+\.\s*/, ''))
        .filter(l => l.length > 0 && !l.includes('[TEMUAN HIDDEN DEFECT]'))
    : [];

  const todoList = printWO.todoActions || [];
  const damagesList = printWO.damages || [];
  const inventoryList = printWO.inventory || [];
  const loosePartsList = printWO.looseParts || [];

  // Determine checked inventory status helper
  const isInventoryChecked = (itemName: string) => {
    const found = inventoryList.find(i => i.name.toLowerCase() === itemName.toLowerCase());
    return Boolean(found?.checked);
  };

  // Adaptive row limit to guarantee perfect fit on A4
  const p1ComplaintLimit = complaintLines.length > 4 ? 4 : complaintLines.length;
  const p2ComplaintLimit = Math.min(complaintLines.length, 3);
  const p2TodoLimit = Math.min(todoList.length > 0 ? todoList.length : 1, 6);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[100] overflow-y-auto print:static print:h-auto print:w-auto print:overflow-visible print:bg-white text-[#0f172a] font-sans">
      <style>{`
        @page {
          size: A4 portrait;
          margin: 6mm 8mm 6mm 8mm !important;
        }
        @media print {
          html, body {
            width: 210mm !important;
            height: auto !important;
            min-height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background-color: white !important;
            color: #0f172a !important;
            overflow: visible !important;
          }
          .no-print {
            display: none !important;
          }
          .print-wrapper {
            width: 100% !important;
            max-width: 210mm !important;
            padding: 0 !important;
            margin: 0 auto !important;
            box-shadow: none !important;
          }
          /* PAGE 1: Enforced exactly 1 A4 page with clean break after */
          .print-sheet-1 {
            width: 100% !important;
            height: 282mm !important;
            max-height: 282mm !important;
            page-break-before: auto !important;
            page-break-after: always !important;
            break-after: page !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            box-sizing: border-box !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          /* PAGE 2: Enforced exactly 1 A4 page */
          .print-sheet-2 {
            width: 100% !important;
            height: 282mm !important;
            max-height: 282mm !important;
            page-break-before: auto !important;
            break-before: auto !important;
            page-break-after: avoid !important;
            break-after: avoid !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            box-sizing: border-box !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .print-signature-group {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            page-break-before: avoid !important;
            break-before: avoid !important;
            flex-shrink: 0 !important;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      <div className="max-w-[215mm] w-full mx-auto bg-white p-4 sm:p-8 shadow-2xl print:shadow-none print:max-w-none print:w-full print:p-0 print:m-0 print-wrapper box-border overflow-x-hidden">
        
        {/* ================= ACTION BAR (Hidden in print) ================= */}
        <div className="flex justify-between items-center mb-5 print:hidden no-print border-b pb-3 bg-slate-50 -mx-4 sm:-mx-8 -mt-4 sm:-mt-8 p-4 sm:p-5 rounded-t-lg border-slate-200">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setPrintWO(null)} 
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-white text-slate-700 flex items-center gap-2 text-sm font-bold transition-colors shadow-xs cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Kembali
            </button>
            <div>
              <h2 className="text-base font-extrabold text-slate-800 leading-tight">Cetak Dokumen Pemeriksaan & SPK</h2>
              <p className="text-xs text-slate-500">Format Visual Jelas, Bebas Tumpang Tindih & Nyaman Dibaca (Tepat 2 Halaman A4)</p>
            </div>
          </div>
          <div className="flex space-x-2">
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
              <Printer className="w-4 h-4" /> Cetak 2 Halaman
            </button>
          </div>
        </div>

        {/* ========================================================
            PAGE 1: LEMBAR PEMERIKSAAN KENDARAAN (INSPECTION SHEET)
            ======================================================== */}
        <div className="print-sheet-1 border-b-4 border-dashed border-slate-300 print:border-none pb-6 print:pb-0 mb-8 print:mb-0 min-h-[280mm] print:min-h-0 flex flex-col justify-between box-border">
          <div className="flex-1 flex flex-col justify-start">
            
            {/* Header Page 1 */}
            <div className="border-b-2 border-[#0F2D59] pb-2 mb-2">
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
                      <p className="text-[9.5px] text-slate-600 font-semibold flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-[#E21F26] shrink-0" /> Jl. Riau Ujung No.898-904, Pekanbaru • Telp: (0761) 853798
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-1 pl-0.5">
                    <SmartLogo 
                      baseName="logo-itech" 
                      alt="ITech" 
                      className="h-5 w-auto object-contain flex-shrink-0" 
                      style={{ height: '18px', maxWidth: '65px' }}
                    />
                    <p className="text-[9px] font-black tracking-wider text-[#0F2D59] whitespace-nowrap bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      ITECH AUTHORIZED DEALER & WORKSHOP
                    </p>
                  </div>
                </div>
                
                <div className="text-right flex flex-col items-end shrink-0 max-w-[48%]">
                  <div className="flex items-center justify-end gap-2 flex-wrap">
                    <h2 className="text-xs font-black bg-[#0F2D59] text-white px-3 py-1 rounded tracking-wider uppercase shadow-xs">
                      LEMBAR PEMERIKSAAN KENDARAAN
                    </h2>
                    <span className="text-[9px] font-black bg-blue-100 text-blue-950 border border-blue-300 px-2 py-0.5 rounded uppercase shrink-0">
                      CUSTOMER COPY
                    </span>
                  </div>
                  <div className="flex items-center justify-end gap-2 mt-1">
                    <p className="text-xs font-mono text-slate-900 font-bold">
                      NO. WO: <span className="text-[#0F2D59] font-black text-sm">{printWO.id}</span>
                    </p>
                    {printWO.status === 'COMPLETED' ? (
                      <span className="text-[9px] font-black px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300 shrink-0">
                        HASIL AKHIR
                      </span>
                    ) : (
                      <span className="text-[9px] font-black px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 shrink-0">
                        ESTIMASI AWAL
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 1: CUSTOMER & VEHICLE PROFILE GRID */}
            <div className="grid grid-cols-12 gap-2 mb-2 text-xs">
              
              {/* Customer Box (6 Cols) */}
              <div className="col-span-6 border border-slate-300 bg-slate-50/80 rounded-lg p-2.5 shadow-xs flex flex-col justify-between">
                <div>
                  <h3 className="font-black border-b border-slate-300 pb-1 mb-1.5 text-[#0F2D59] text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span> DATA PELANGGAN & PEMBAWA
                  </h3>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between items-baseline gap-2">
                      <span className="text-slate-500 font-semibold shrink-0">Pelanggan:</span>
                      <span className="font-black text-slate-950 text-[13px] truncate">{printWO.customerName}</span>
                    </div>
                    <div className="flex justify-between items-baseline gap-2">
                      <span className="text-slate-500 font-semibold shrink-0">No. Telepon:</span>
                      <span className="font-mono font-bold text-slate-900 text-xs">{printWO.customerPhone || '-'}</span>
                    </div>
                    <div className="flex justify-between items-baseline gap-2">
                      <span className="text-slate-500 font-semibold shrink-0">Alamat:</span>
                      <span className="text-slate-800 font-medium text-xs truncate max-w-[200px]">{printWO.customerAddress || '-'}</span>
                    </div>
                    {printWO.bringerName && (
                      <div className="flex justify-between items-baseline gap-2 pt-1 border-t border-dashed border-slate-200">
                        <span className="text-slate-500 font-semibold shrink-0">Pembawa:</span>
                        <span className="text-slate-900 font-bold text-xs truncate">{printWO.bringerName} {printWO.bringerPhone ? `(${printWO.bringerPhone})` : ''}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Vehicle & Fuel Box (6 Cols) */}
              <div className="col-span-6 border border-slate-300 bg-slate-50/80 rounded-lg p-2.5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center border-b border-slate-300 pb-1 mb-1.5">
                    <h3 className="font-black text-[#0F2D59] text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-600"></span> DATA KENDARAAN / UNIT
                    </h3>
                    <span className="text-[8.5px] font-black text-blue-950 bg-blue-100 px-1.5 py-0.5 rounded border border-blue-200">
                      {printWO.dropMethod === 'PARTS' ? 'PARTS COPOTAN' : 'KENDARAAN UTUH'}
                    </span>
                  </div>

                  <div className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-8 space-y-1 text-xs">
                      <div className="flex justify-between items-baseline gap-2">
                        <span className="text-slate-500 font-semibold shrink-0">Merek/Tipe:</span>
                        <span className="font-black text-slate-950 text-xs truncate">{printWO.vehicleBrand || '-'}</span>
                      </div>
                      <div className="flex justify-between items-baseline gap-2">
                        <span className="text-slate-500 font-semibold shrink-0">No. Polisi:</span>
                        <span className="font-black text-[#0F2D59] font-mono text-[13px] bg-blue-100/90 px-2 py-0.5 rounded border border-blue-300 inline-block">
                          {printWO.plateNumber || '-'}
                        </span>
                      </div>
                      <div className="flex justify-between items-baseline gap-2">
                        <span className="text-slate-500 font-semibold shrink-0">VIN / Rangka:</span>
                        <span className="font-mono font-bold text-slate-800 text-[11px] truncate max-w-[130px]">{printWO.vin || '-'}</span>
                      </div>
                      <div className="flex justify-between items-baseline gap-2">
                        <span className="text-slate-500 font-semibold shrink-0">Odometer:</span>
                        <span className="font-bold text-slate-950 text-xs">{printWO.odometer ? `${printWO.odometer} km` : '-'}</span>
                      </div>
                    </div>

                    {/* Fuel Indicator Gauge */}
                    <div className="col-span-4 flex flex-col items-center justify-center border-l border-slate-300 pl-2 text-center">
                      <span className="text-[8px] font-black text-slate-600 uppercase tracking-wider mb-0.5">BBM / SOLAR</span>
                      {printWO.fuelLevel ? (
                        <div className="w-full flex flex-col items-center">
                          <FuelGauge level={printWO.fuelLevel} theme="print" size="xs" className="border-none bg-transparent p-0 w-full" />
                          <span className="text-[11px] font-black text-[#0F2D59] mt-0.5">{printWO.fuelLevel}</span>
                        </div>
                      ) : (
                        <span className="text-[8.5px] text-slate-400 italic">N/A</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* OPERATIONAL TIMELINE ROW */}
            <div className="bg-blue-50/90 px-3 py-1.5 border border-blue-300 rounded-lg text-xs flex justify-between items-center mb-2 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="font-bold text-slate-700">Waktu Masuk:</span>
                <span className="font-mono font-black text-[#0F2D59] text-xs">
                  {printWO.intakeDate ? new Date(printWO.intakeDate).toLocaleString('id-ID') : '-'}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-700">Estimasi Selesai:</span>
                  <span className="text-[#0F2D59] font-black text-xs">{printWO.estimasiPengerjaan || '1-3 Hari Kerja'}</span>
                </div>
                <div className="flex items-center gap-1.5 border-l border-blue-300 pl-4">
                  <span className="font-bold text-slate-700">Garansi Servis:</span>
                  <span className="text-emerald-900 font-black text-xs">{printWO.garansi || '3 Bulan'}</span>
                </div>
              </div>
            </div>

            {/* SECTION 2: CUSTOMER COMPLAINTS */}
            {complaintLines.length > 0 && (
              <div className="mb-2">
                <div className="bg-[#0F2D59] text-white px-3 py-1 rounded-t font-black text-[10px] uppercase tracking-wider flex items-center justify-between">
                  <span>KELUHAN UTAMA PELANGGAN (CUSTOMER VOICE)</span>
                  <span className="text-[8.5px] text-blue-200 font-semibold">Wajib dianalisa & diperiksa teknisi</span>
                </div>
                <table className="w-full table-auto border-collapse border border-slate-300 text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-[10px] uppercase text-slate-700 font-bold">
                      <th className="border border-slate-300 py-3 px-3 text-center w-10">NO</th>
                      <th className="border border-slate-300 py-3 px-3 text-left">DESKRIPSI KELUHAN & GEJALA KERUSAKAN</th>
                    </tr>
                  </thead>
                  <tbody>
                    {complaintLines.slice(0, p1ComplaintLimit).map((line, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                        <td className="border border-slate-300 py-4 px-3 text-center font-bold text-slate-700 text-xs">{idx + 1}</td>
                        <td className="border border-slate-300 py-4 px-3 font-bold text-slate-950 text-xs leading-snug">{line}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* SECTION 3: VISUAL BODY DAMAGE INSPECTION MAP & INVENTORY */}
            {printWO.dropMethod === 'WHOLE' ? (
              <div className="grid grid-cols-12 gap-2 mb-2">
                {/* Visual Body Parts Grid (Left 7 Cols) */}
                <div className="col-span-7 border border-slate-300 rounded-lg overflow-hidden flex flex-col justify-between shadow-xs">
                  <div className="bg-slate-100 px-2.5 py-1 border-b border-slate-300 flex items-center justify-between">
                    <h3 className="text-[10px] font-black text-[#0F2D59] uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> PEMERIKSAAN KONDISI FISIK / BODI
                    </h3>
                    <span className="text-[8px] font-bold text-slate-500">9 Titik Inspeksi</span>
                  </div>

                  <div className="p-2 flex-1 flex flex-col justify-between bg-white">
                    {/* 9 Inspection Points Grid */}
                    <div className="grid grid-cols-3 gap-1 mb-1.5">
                      {ALL_CAR_INSPECTION_PARTS.map((part) => {
                        const defect = damagesList.find(d => d.partId === part.id);
                        const isDefective = Boolean(defect);
                        return (
                          <div 
                            key={part.id} 
                            className={`p-1 rounded border text-center flex flex-col items-center justify-center min-h-[30px] ${
                              isDefective 
                                ? 'bg-rose-50 border-rose-400 text-rose-950 font-bold' 
                                : 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                            }`}
                          >
                            <span className="text-[9px] font-bold leading-tight truncate w-full">{part.label}</span>
                            <span className={`text-[7.5px] font-black mt-0.5 px-1.5 py-0.2 rounded ${
                              isDefective ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
                            }`}>
                              {isDefective ? '⚠️ DEFECT' : '✓ OK'}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Defect Description Box */}
                    <div className="border border-slate-200 bg-slate-50 rounded p-1.5 text-[9px]">
                      <span className="font-black text-slate-700 block mb-0.5 text-[8.5px] uppercase">
                        Catatan Baret / Kerusakan Fisik Saat Masuk:
                      </span>
                      {damagesList.length === 0 ? (
                        <p className="text-emerald-800 italic font-semibold text-[9px]">
                          ✓ Kondisi bodi luar dan interior dalam keadaan mulus/OK saat serah terima.
                        </p>
                      ) : (
                        <div className="space-y-0.5">
                          {damagesList.map((d) => {
                            const partObj = ALL_CAR_INSPECTION_PARTS.find(p => p.id === d.partId);
                            return (
                              <div key={d.partId} className="flex items-center gap-1.5 text-slate-950 text-[9px]">
                                <span className="font-black text-rose-900 text-[8px] bg-rose-100 px-1 py-0.2 rounded border border-rose-200">
                                  {partObj ? partObj.label : d.partId}:
                                </span>
                                <span className="text-slate-900 font-medium truncate">{d.description || 'Ada baret / retak fisik'}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Inventory Checklist (Right 5 Cols) */}
                <div className="col-span-5 border border-slate-300 rounded-lg overflow-hidden flex flex-col justify-between shadow-xs">
                  <div className="bg-slate-100 px-2.5 py-1 border-b border-slate-300 flex items-center justify-between">
                    <h3 className="text-[10px] font-black text-[#0F2D59] uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> INVENTORY CHECKLIST
                    </h3>
                    <span className="text-[8px] font-bold text-slate-500">Kelengkapan</span>
                  </div>

                  <div className="p-2 flex-1 bg-white">
                    <div className="grid grid-cols-2 gap-x-1.5 gap-y-1 text-[8.5px]">
                      {DEFAULT_INVENTORY_ITEMS.map((item) => {
                        const checked = isInventoryChecked(item);
                        return (
                          <div 
                            key={item} 
                            className={`flex items-center py-0.5 px-1 rounded ${
                              checked ? 'bg-blue-50/90 font-bold text-slate-950' : 'text-slate-500'
                            }`}
                          >
                            <span className={`w-3 h-3 rounded-xs border flex items-center justify-center mr-1 text-[8px] font-black shrink-0 ${
                              checked ? 'bg-[#0F2D59] border-[#0F2D59] text-white' : 'border-slate-400 bg-white text-transparent'
                            }`}>
                              ✓
                            </span>
                            <span className="truncate font-semibold">{item}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* LOOSE PARTS SERIALIZATION TABLE */
              <div className="mb-2 border border-slate-300 rounded-lg overflow-hidden shadow-xs">
                <div className="bg-slate-100 px-3 py-1 border-b border-slate-300 flex items-center justify-between">
                  <h3 className="text-[10px] font-black text-[#0F2D59] uppercase tracking-wider flex items-center gap-1.5">
                    <Wrench className="w-4 h-4 text-blue-600" /> SERIALISASI & PEMERIKSAAN KOMPONEN COPOTAN (LOOSE PARTS)
                  </h3>
                  <span className="text-[8.5px] font-bold text-slate-500">Pemeriksaan Fisik Part</span>
                </div>
                <table className="w-full table-auto border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-700 border-b border-slate-300">
                      <th className="py-3 px-3 text-center w-10 border-r border-slate-300">NO</th>
                      <th className="py-3 px-3 text-left border-r border-slate-300">KETERANGAN KOMPONEN</th>
                      <th className="py-3 px-3 text-left border-r border-slate-300">PART NUMBER (P/N)</th>
                      <th className="py-3 px-3 text-center w-28 border-r border-slate-300">KONDISI FISIK</th>
                      <th className="py-3 px-3 text-left">STATUS / CATATAN</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(loosePartsList.length > 0 ? loosePartsList : [
                      { id: '1', description: 'Injector Common Rail Nozzle 1', partNumber: '-', physicalCondition: 'OK' },
                      { id: '2', description: 'Injector Common Rail Nozzle 2', partNumber: '-', physicalCondition: 'OK' },
                      { id: '3', description: 'Injector Common Rail Nozzle 3', partNumber: '-', physicalCondition: 'OK' },
                      { id: '4', description: 'Injector Common Rail Nozzle 4', partNumber: '-', physicalCondition: 'OK' },
                    ]).slice(0, 4).map((part, i) => (
                      <tr key={part.id || i} className={`border-b border-slate-200 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                        <td className="py-4 px-3 text-center font-bold text-slate-700 text-xs border-r border-slate-200">{i + 1}</td>
                        <td className="py-4 px-3 font-bold text-slate-950 text-xs border-r border-slate-200">{part.description || '-'}</td>
                        <td className="py-4 px-3 font-mono font-bold text-slate-800 text-xs border-r border-slate-200">{part.partNumber || '-'}</td>
                        <td className="py-4 px-3 text-center font-bold border-r border-slate-200">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                            part.physicalCondition === 'OK' ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'
                          }`}>
                            {part.physicalCondition || 'OK'}
                          </span>
                        </td>
                        <td className="py-4 px-3 text-slate-700 italic text-[11px] font-medium">Telah diverifikasi sesuai saat serah terima</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* PAGE 1 SIGNATURES & QR TRACKING FOOTER */}
          <div className="print-signature-group border-t-2 border-slate-300 pt-2 mt-auto shrink-0">
            <div className="flex items-center justify-between gap-3">
              {/* 4 Signatures Grid */}
              <div className="flex-1 grid grid-cols-4 gap-2 text-center text-xs">
                <div className="border border-slate-300 rounded-lg p-1.5 bg-slate-50/50 shadow-xs">
                  <div className="h-10 border-b border-slate-400 mb-1 flex items-end justify-center pb-0.5 text-[8.5px] text-slate-400">
                    (Tanda Tangan)
                  </div>
                  <p className="font-black text-slate-950 leading-tight text-[11px]">Pelanggan / Customer</p>
                  <p className="text-[9px] text-slate-600 font-semibold truncate mt-0.5">{printWO.customerName}</p>
                </div>

                <div className="border border-slate-300 rounded-lg p-1.5 bg-slate-50/50 shadow-xs">
                  <div className="h-10 border-b border-slate-400 mb-1 flex items-end justify-center pb-0.5 text-[8.5px] text-slate-400">
                    (Tanda Tangan)
                  </div>
                  <p className="font-black text-slate-950 leading-tight text-[11px]">Mekanik Tester</p>
                  <p className="text-[9px] text-slate-600 font-semibold mt-0.5">Pemeriksa Fisik</p>
                </div>

                <div className="border border-slate-300 rounded-lg p-1.5 bg-slate-50/50 shadow-xs">
                  <div className="h-10 border-b border-slate-400 mb-1 flex items-end justify-center pb-0.5 text-[8.5px] text-slate-400">
                    (Tanda Tangan)
                  </div>
                  <p className="font-black text-slate-950 leading-tight text-[11px]">Service Advisor (SA)</p>
                  <p className="text-[9px] text-slate-600 font-semibold mt-0.5">Front Office</p>
                </div>

                <div className="border border-slate-300 rounded-lg p-1.5 bg-slate-50/50 shadow-xs">
                  <div className="h-10 border-b border-slate-400 mb-1 flex items-end justify-center pb-0.5 text-[8.5px] text-slate-400">
                    (Tanda Tangan)
                  </div>
                  <p className="font-black text-slate-950 leading-tight text-[11px]">Foreman Bengkel</p>
                  <p className="text-[9px] text-slate-600 font-semibold mt-0.5">Ka. Produksi</p>
                </div>
              </div>

              {/* QR Live Tracking Box */}
              <div className="w-48 flex-shrink-0 flex items-center gap-2 border-2 border-blue-300 bg-blue-50/80 p-1.5 rounded-lg shadow-xs">
                <div className="p-1 bg-white rounded border border-slate-300 shrink-0 flex items-center justify-center shadow-xs">
                  <QRCodeSVG
                    value={baseTrackingUrl + '/?tracking=' + printWO.id}
                    size={42}
                    level="M"
                    includeMargin={false}
                  />
                </div>
                <div className="text-left leading-tight">
                  <p className="text-[9.5px] font-black text-[#0F2D59] uppercase tracking-wider">LIVE TRACKING</p>
                  <p className="text-[8px] text-slate-700 font-medium leading-tight mt-0.5">Scan status servis via HP.</p>
                  <p className="text-[11px] font-mono font-black text-blue-950 mt-0.5">{printWO.id}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center text-[8.5px] text-slate-500 border-t border-slate-200 pt-1 mt-1 font-mono">
              <span>Indo Teknik Pekanbaru • Jl. Riau Ujung No.898-904 Pekanbaru • (0761) 853798</span>
              <span className="font-bold text-slate-800">Dokumen Lembar Pemeriksaan Resmi • Halaman 1 dari 2</span>
            </div>
          </div>
        </div>


        {/* ========================================================
            PAGE 2: SURAT PERINTAH KERJA / SPK (WORKSHOP COPY)
            ======================================================== */}
        <div className="print-sheet-2 min-h-[280mm] print:min-h-0 flex flex-col justify-between box-border">
          <div className="flex-1 flex flex-col justify-start">
            
            {/* Header Page 2 */}
            <div className="border-b-2 border-[#0F2D59] pb-2 mb-2">
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
                      <p className="text-[9.5px] text-slate-600 font-semibold flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-[#E21F26] shrink-0" /> Jl. Riau Ujung No.898-904, Pekanbaru • Telp: (0761) 853798
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-1 pl-0.5">
                    <SmartLogo 
                      baseName="logo-itech" 
                      alt="ITech" 
                      className="h-5 w-auto object-contain flex-shrink-0" 
                      style={{ height: '18px', maxWidth: '65px' }}
                    />
                    <p className="text-[9px] font-black tracking-wider text-[#0F2D59] whitespace-nowrap bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      ITECH AUTHORIZED DEALER & WORKSHOP
                    </p>
                  </div>
                </div>
                
                <div className="text-right flex flex-col items-end shrink-0 max-w-[48%]">
                  <div className="flex items-center justify-end gap-2 flex-wrap">
                    <h2 className="text-xs font-black bg-[#0F2D59] text-white px-3 py-1 rounded tracking-wider uppercase shadow-xs">
                      SURAT PERINTAH KERJA (SPK)
                    </h2>
                    <span className="text-[9px] font-black bg-slate-200 text-slate-950 border border-slate-400 px-2 py-0.5 rounded uppercase shrink-0">
                      WORKSHOP COPY
                    </span>
                  </div>
                  <div className="flex items-center justify-end gap-2 mt-1">
                    <p className="text-xs font-mono text-slate-900 font-bold">
                      NO. WO: <span className="text-[#0F2D59] font-black text-sm">{printWO.id}</span>
                    </p>
                    {printWO.priority === 1 && <span className="text-[9px] font-black px-2 py-0.5 rounded bg-red-100 text-red-900 border border-red-300 shrink-0">P1: URGENT</span>}
                    {printWO.priority === 2 && <span className="text-[9px] font-black px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 shrink-0">P2: BOOKING</span>}
                    {printWO.priority === 3 && <span className="text-[9px] font-black px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-300 shrink-0">P3: REGULAR</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* TECHNICAL & CUSTOMER PROFILE ROW */}
            <div className="grid grid-cols-2 gap-2 mb-2 text-xs">
              <div className="border border-slate-300 bg-slate-50/80 rounded-lg p-2 shadow-xs">
                <h3 className="font-black border-b border-slate-300 pb-0.5 mb-1 text-[#0F2D59] text-[9.5px] uppercase tracking-wider">
                  DATA PELANGGAN & PEMBAWA
                </h3>
                <div className="space-y-0.5 text-xs">
                  <div className="flex justify-between items-baseline">
                    <span className="text-slate-500 font-semibold">Pelanggan:</span>
                    <span className="font-black text-slate-950 text-xs truncate">{printWO.customerName} ({printWO.customerPhone})</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-slate-500 font-semibold">Pembawa:</span>
                    <span className="text-slate-800 font-medium text-[11px] truncate">{printWO.bringerName || '-'} {printWO.bringerPhone ? `(${printWO.bringerPhone})` : ''}</span>
                  </div>
                </div>
              </div>

              <div className="border border-slate-300 bg-slate-50/80 rounded-lg p-2 shadow-xs">
                <h3 className="font-black border-b border-slate-300 pb-0.5 mb-1 text-[#0F2D59] text-[9.5px] uppercase tracking-wider">
                  IDENTITAS TEKNIS UNIT & KENDARAAN
                </h3>
                <div className="space-y-0.5 text-xs">
                  <div className="flex justify-between items-baseline">
                    <span className="text-slate-500 font-semibold">Merek/Tipe:</span>
                    <span className="font-bold text-slate-950 text-xs truncate">{printWO.vehicleBrand || '-'}</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-slate-500 font-semibold">No. Polisi:</span>
                    <span className="font-black text-[#0F2D59] font-mono text-xs bg-blue-100/90 px-1.5 py-0.2 rounded border border-blue-300 inline-block">
                      {printWO.plateNumber || '-'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: RANGKUMAN HASIL PERBAIKAN (BEFORE VS AFTER) */}
            {complaintLines.length > 0 && (
              <div className="mb-2 border border-slate-300 rounded-lg overflow-hidden shadow-xs">
                <div className="bg-[#0F2D59] text-white px-3 py-1 font-black text-[9.5px] uppercase tracking-wider flex items-center justify-between">
                  <span>RANGKUMAN DIAGNOSA & TINDAKAN PERBAIKAN (BEFORE VS AFTER)</span>
                  <span className="text-[8px] text-blue-200 font-semibold">Hasil Kalibrasi / Uji Bench</span>
                </div>
                <table className="w-full table-auto border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-[9.5px] font-bold uppercase text-slate-700 border-b border-slate-300">
                      <th className="py-3 px-3 text-center w-10 border-r border-slate-300">NO</th>
                      <th className="py-3 px-3 text-left w-[50%] border-r border-slate-300">KELUHAN / KONDISI AWAL (BEFORE)</th>
                      <th className="py-3 px-3 text-left w-[44%]">TINDAKAN / HASIL PERBAIKAN (AFTER)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {complaintLines.slice(0, p2ComplaintLimit).map((line, idx) => (
                      <tr key={idx} className={`border-b border-slate-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                        <td className="text-center font-bold text-slate-700 border-r border-slate-200 py-4 px-3 text-xs">{idx + 1}</td>
                        <td className="font-bold text-slate-950 border-r border-slate-200 py-4 px-3 text-xs leading-snug">{line}</td>
                        <td className="font-semibold text-blue-950 bg-blue-50/50 py-4 px-3 text-xs leading-snug">
                          {printWO.repairResults?.[idx] || 'Dalam proses diagnosa & pengerjaan teknisi'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* SECTION 3: DAFTAR TINDAKAN & SUKU CADANG (TO-DO LIST) */}
            <div className="mb-2 border border-slate-300 rounded-lg overflow-hidden shadow-xs">
              <div className="bg-[#0F2D59] text-white px-3 py-1 font-black text-[9.5px] uppercase tracking-wider flex items-center justify-between">
                <span>RINCIAN JASA PERBAIKAN & RENCANA SUKU CADANG (SPK TO-DO LIST)</span>
                <span className="text-[8px] text-blue-200 font-semibold">Estimasi Biaya Transparan</span>
              </div>
              <table className="w-full table-auto border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-[9.5px] uppercase font-bold text-slate-700 border-b border-slate-300">
                    <th className="py-3 px-3 text-left border-r border-slate-300">JENIS PENGERJAAN / SUKU CADANG</th>
                    <th className="py-3 px-3 text-center w-12 border-r border-slate-300">QTY</th>
                    <th className="py-3 px-3 text-left border-r border-slate-300">CATATAN TEKNIS / MEKANIK</th>
                    <th className="py-3 px-3 text-right w-40">ESTIMASI BIAYA (RP)</th>
                  </tr>
                </thead>
                <tbody>
                  {(todoList.length > 0 ? todoList : [
                    { id: '1', jenisPengerjaan: 'Kalibrasi Injector & Supply Pump', qty: 1, catatanMekanik: 'Uji test bench standar OEM', estimasiHarga: '500000' }
                  ]).slice(0, p2TodoLimit).map((action, i) => (
                    <tr key={action.id || i} className={`border-b border-slate-200 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                      <td className="font-bold text-slate-950 border-r border-slate-200 py-4 px-3 text-xs leading-snug">{action.jenisPengerjaan || '-'}</td>
                      <td className="text-center font-bold text-slate-900 border-r border-slate-200 py-4 px-3 text-xs">{action.qty}</td>
                      <td className="text-slate-700 font-medium border-r border-slate-200 py-4 px-3 text-[11px] leading-snug">{action.catatanMekanik || '-'}</td>
                      <td className="font-mono font-bold text-right text-slate-950 py-4 px-3 text-xs">
                        {action.estimasiHargaMin || action.estimasiHargaMax ? (
                          <>
                            {action.estimasiHargaMin ? formatRupiah(action.estimasiHargaMin) : 'Rp 0'} 
                            <span className="text-[10px] text-slate-400 font-normal mx-0.5">s/d</span> 
                            {action.estimasiHargaMax ? formatRupiah(action.estimasiHargaMax) : 'Rp 0'}
                          </>
                        ) : (
                          formatRupiah(action.estimasiHarga) || 'Rp 0'
                        )}
                      </td>
                    </tr>
                  ))}

                  {/* Total Estimasi Biaya Row */}
                  <tr className="bg-slate-100 font-black border-t-2 border-slate-300">
                    <td colSpan={2} className="text-right text-[11px] text-slate-800 border-r border-slate-300 font-bold py-4 px-3">
                      TOTAL ESTIMASI BIAYA:
                    </td>
                    <td className="text-slate-800 font-semibold text-[11px] border-r border-slate-300 py-4 px-3">
                      {todoList.reduce((sum, item) => sum + (parseInt(String(item.qty), 10) || 1), 0)} Total Item
                    </td>
                    <td className="text-right font-mono font-black text-[#0F2D59] py-4 px-3 text-xs">
                      {(() => {
                        const totalMin = todoList.reduce((acc, action) => {
                          const val = String(action.estimasiHargaMin || action.estimasiHarga || '').replace(/\D/g, '');
                          return acc + (val ? parseInt(val, 10) : 0);
                        }, 0);
                        const totalMax = todoList.reduce((acc, action) => {
                          const val = String(action.estimasiHargaMax || action.estimasiHarga || '').replace(/\D/g, '');
                          return acc + (val ? parseInt(val, 10) : 0);
                        }, 0);
                        
                        if (totalMin !== totalMax && totalMax > 0) {
                          return `${totalMin ? 'Rp ' + totalMin.toLocaleString('id-ID') : 'Rp 0'} s/d ${totalMax ? 'Rp ' + totalMax.toLocaleString('id-ID') : 'Rp 0'}`;
                        }
                        return totalMin > 0 ? 'Rp ' + totalMin.toLocaleString('id-ID') : 'Sesuai Hasil Analisa Diagnosa';
                      })()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SECTION 4: SYARAT & KETENTUAN PERINTAH KERJA (SPK TERMS) */}
            <div className="mb-2 text-[7.5px] leading-[1.25] text-slate-700 text-justify border border-slate-300 p-1.5 rounded-lg bg-slate-50/60 shadow-xs">
              <p className="font-black uppercase text-[#0F2D59] text-[8px] tracking-wider text-center border-b border-slate-300 pb-0.5 mb-1">
                SYARAT & KETENTUAN PERINTAH KERJA (SPK) INDO TEKNIK
              </p>
              <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
                <div className="space-y-0.5">
                  <p><strong>1. Kuasa Diagnosa:</strong> Pelanggan memberi kuasa penuh kepada teknisi Indo Teknik untuk membongkar, menguji bench, dan menganalisa komponen.</p>
                  <p><strong>2. Hidden Defect:</strong> Kerusakan tersembunyi yang baru ditemukan saat pembongkaran akan dikonfirmasi terlebih dahulu sebelum pengerjaan.</p>
                  <p><strong>3. Penambahan Biaya:</strong> Perubahan suku cadang atau pengerjaan tambahan akan menambah estimasi biaya sesuai persetujuan pelanggan.</p>
                  <p><strong>4. Pembatalan:</strong> Pembatalan sepihak setelah pembongkaran membebaskan bengkel dari tuntutan performa awal kendaraan/part.</p>
                  <p><strong>5. Jasa Diagnosa:</strong> Jasa diagnosa & uji lab yang telah berjalan tetap wajib dibayarkan pelanggan meskipun SPK dibatalkan.</p>
                  <p><strong>6. Kerusakan Fisik:</strong> Bengkel tidak bertanggung jawab atas kerusakan fisik awal yang telah tercatat pada Lembar Pemeriksaan Hal 1.</p>
                </div>
                <div className="space-y-0.5">
                  <p><strong>7. Standar Uji Bench:</strong> Seluruh kalibrasi injector dan supply pump dikerjakan berdasarkan database resmi pabrikan (OEM Standard).</p>
                  <p><strong>8. Batas Pengambilan:</strong> Unit/part yang telah selesai dikerjakan wajib diambil maksimal 30 hari kalender setelah pemberitahuan.</p>
                  <p><strong>9. Pemeriksaan Kembali:</strong> Pelanggan wajib memeriksa fisik unit & kelengkapan saat serah terima kembali barang dilakukan.</p>
                  <p><strong>10. Barang Berharga:</strong> Segala barang berharga yang tertinggal di dalam kendaraan bukan menjadi tanggung jawab pihak bengkel.</p>
                  <p><strong>11. Ketentuan Garansi:</strong> Garansi berlaku sesuai masa garansi dengan syarat segel bengkel utuh dan bukan akibat kontaminasi bahan bakar solar.</p>
                  <p><strong>12. Persetujuan Mutlak:</strong> Penandatanganan SPK ini merupakan bukti kesepakatan mutlak atas seluruh poin ketentuan di atas.</p>
                </div>
              </div>
            </div>
          </div>

          {/* PAGE 2 SIGNATURES & QR TRACKING FOOTER */}
          <div className="print-signature-group border-t-2 border-slate-300 pt-2 mt-auto shrink-0">
            <div className="flex items-center justify-between gap-3">
              {/* 4 Signatures Grid */}
              <div className="flex-1 grid grid-cols-4 gap-2 text-center text-xs">
                <div className="border border-slate-300 rounded-lg p-1.5 bg-slate-50/50 shadow-xs">
                  <div className="h-10 border-b border-slate-400 mb-1 flex items-end justify-center pb-0.5 text-[8.5px] text-slate-400">
                    (Tanda Tangan)
                  </div>
                  <p className="font-black text-slate-950 leading-tight text-[11px]">Pelanggan / Customer</p>
                  <p className="text-[9px] text-slate-600 font-semibold truncate mt-0.5">{printWO.customerName}</p>
                </div>

                <div className="border border-slate-300 rounded-lg p-1.5 bg-slate-50/50 shadow-xs">
                  <div className="h-10 border-b border-slate-400 mb-1 flex items-end justify-center pb-0.5 text-[8.5px] text-slate-400">
                    (Tanda Tangan)
                  </div>
                  <p className="font-black text-slate-950 leading-tight text-[11px]">Mekanik / Teknisi</p>
                  <p className="text-[9px] text-slate-600 font-semibold mt-0.5">Pelaksana Servis</p>
                </div>

                <div className="border border-slate-300 rounded-lg p-1.5 bg-slate-50/50 shadow-xs">
                  <div className="h-10 border-b border-slate-400 mb-1 flex items-end justify-center pb-0.5 text-[8.5px] text-slate-400">
                    (Tanda Tangan)
                  </div>
                  <p className="font-black text-slate-950 leading-tight text-[11px]">Service Advisor (SA)</p>
                  <p className="text-[9px] text-slate-600 font-semibold mt-0.5">Front Office</p>
                </div>

                <div className="border border-slate-300 rounded-lg p-1.5 bg-slate-50/50 shadow-xs">
                  <div className="h-10 border-b border-slate-400 mb-1 flex items-end justify-center pb-0.5 text-[8.5px] text-slate-400">
                    (Tanda Tangan)
                  </div>
                  <p className="font-black text-slate-950 leading-tight text-[11px]">Foreman / Ka. Bengkel</p>
                  <p className="text-[9px] text-slate-600 font-semibold mt-0.5">Approval Produksi</p>
                </div>
              </div>

              {/* QR Live Tracking Box */}
              <div className="w-48 flex-shrink-0 flex items-center gap-2 border-2 border-blue-300 bg-blue-50/80 p-1.5 rounded-lg shadow-xs">
                <div className="p-1 bg-white rounded border border-slate-300 shrink-0 flex items-center justify-center shadow-xs">
                  <QRCodeSVG
                    value={baseTrackingUrl + '/?tracking=' + printWO.id}
                    size={42}
                    level="M"
                    includeMargin={false}
                  />
                </div>
                <div className="text-left leading-tight">
                  <p className="text-[9.5px] font-black text-[#0F2D59] uppercase tracking-wider">LIVE TRACKING</p>
                  <p className="text-[8px] text-slate-700 font-medium leading-tight mt-0.5">Scan status servis via HP.</p>
                  <p className="text-[11px] font-mono font-black text-blue-950 mt-0.5">{printWO.id}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center text-[8.5px] text-slate-500 border-t border-slate-200 pt-1 mt-1 font-mono">
              <span>Indo Teknik Pekanbaru • Jl. Riau Ujung No.898-904 Pekanbaru • (0761) 853798</span>
              <span className="font-bold text-slate-800">Dokumen SPK Bengkel Resmi • Halaman 2 dari 2</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PrintTemplate;
