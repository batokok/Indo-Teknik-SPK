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
  { id: 'spion-dalam', label: 'Kaca Spion Dalam' },
  { id: 'soket-kelistrikan', label: 'Soket Kelistrikan' },
  { id: 'plafon', label: 'Plafon Mobil' },
];

const DEFAULT_INVENTORY_ITEMS = [
  'Ban Serap',
  'Dongkrak',
  'Karpet',
  'Toolset / Kotak Perkakas',
  'Spion Luar / Dalam',
  'Racun Api (APAR)',
  'Gantungan Kunci',
  'Central Lock / Remote',
  'Tape / Audio Unit',
  'Aki / Battery',
  'Safety Belt',
  'STNK Asli',
  'Tanda Pajak Asli',
  'Buku KEUR Asli',
  'Fender Roda',
];

export const PrintTemplate: React.FC = () => {
  const { printWO, setPrintWO, printType, trackingBaseUrl } = useApp();

  if (!printWO) return null;

  const baseTrackingUrl = trackingBaseUrl || 'https://it-erp-app.web.app';

  const TableInfo = ({ label, value }: { label: string; value: string }) => (
    <div className="flex justify-between py-0.5 border-b border-dashed border-slate-200 text-[10px]">
      <span className="text-slate-500 font-medium shrink-0 pr-2">{label}</span>
      <span className="text-slate-900 font-bold text-right truncate">{value}</span>
    </div>
  );

  // --- 1-PAGE HANDOVER TEMPLATE ---
  if (printType === 'HANDOVER') {
    return (
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-[100] overflow-y-auto print:static print:h-auto print:w-auto print:overflow-visible print:bg-white text-[#0f172a] font-sans">
        <style>{`
          @page {
            size: A4 portrait;
            margin: 5mm 7mm 5mm 7mm !important;
          }
          @media print {
            body, html {
              background-color: white !important;
              color: #0f172a !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            .no-print {
              display: none !important;
            }
            .print-handover-sheet {
              width: 100% !important;
              height: 285mm !important;
              max-height: 285mm !important;
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
              overflow: hidden !important;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
        `}</style>
        <div className="max-w-[210mm] mx-auto bg-white p-6 shadow-2xl print:shadow-none print:max-w-none print:w-full print:p-0 print:m-0 min-h-screen print:min-h-0 flex flex-col justify-between print-handover-sheet">
          <div className="flex-1 flex flex-col justify-start">
            {/* ACTION BAR (Hidden in print) */}
            <div className="flex justify-between items-center mb-3 print:hidden no-print border-b pb-2">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setPrintWO(null)} 
                  className="px-3.5 py-1.5 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 text-xs font-bold transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> Kembali
                </button>
                <div>
                  <h2 className="text-sm font-extrabold text-slate-800 leading-tight">Bukti Penyerahan Barang (Handover Receipt)</h2>
                  <p className="text-[11px] text-slate-500">Pratinjau sebelum cetak (Tepat 1 Halaman A4)</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => window.print()} 
                  className="px-3.5 py-1.5 bg-slate-100 border border-slate-300 text-slate-800 rounded-lg hover:bg-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Simpan PDF
                </button>
                <button 
                  onClick={() => window.print()} 
                  className="px-4 py-1.5 bg-[#0F2D59] text-white rounded-lg hover:bg-[#153a6c] text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> Cetak Bukti Serah
                </button>
              </div>
            </div>

            {/* HEADER AREA */}
            <div className="border-b-2 border-[#0F2D59] pb-2 mb-2">
              <div className="flex justify-between items-start gap-3">
                <div className="flex-shrink min-w-0">
                  <div className="flex items-center gap-2">
                    <SmartLogo 
                      baseName="logo-indo-teknik" 
                      alt="IT INDO TEKNIK" 
                      className="h-8 w-auto object-contain flex-shrink-0" 
                      style={{ height: '32px', maxWidth: '140px' }}
                    />
                    <div className="border-l-2 border-slate-300 pl-2 leading-tight text-left">
                      <p className="text-[10px] font-black tracking-widest text-[#0F2D59] uppercase">INDO TEKNIK PEKANBARU</p>
                      <p className="text-[8px] text-slate-600 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3 text-[#E21F26] shrink-0" /> Jl. Riau Ujung No.898-904, Pekanbaru</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-1 pl-0.5">
                    <SmartLogo 
                      baseName="logo-itech" 
                      alt="ITech" 
                      className="h-5.5 w-auto object-contain flex-shrink-0" 
                      style={{ height: '22px', maxWidth: '75px' }}
                    />
                    <p className="text-[8px] font-black tracking-widest text-[#0F2D59] whitespace-nowrap bg-blue-50 px-2 py-0.5 rounded border border-blue-200">ITECH AUTHORIZED DEALER & WORKSHOP</p>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end shrink-0 max-w-[48%]">
                  <h2 className="text-[10.5px] font-black bg-[#0F2D59]/10 px-2 py-0.5 rounded border border-blue-300 text-[#0F2D59] tracking-wider uppercase">BUKTI SERAH TERIMA UNIT</h2>
                  <p className="text-[10px] font-mono mt-0.5 text-[#0f172a] font-black">NO. WO: <span className="text-[#0F2D59]">{printWO.id}</span></p>
                </div>
              </div>
            </div>

            {/* DOCUMENT TITLE */}
            <div className="text-center mb-2.5">
              <h1 className="text-base font-black text-slate-900 uppercase tracking-tight">SURAT PENYERAHAN BARANG</h1>
              <p className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">UNIT HANDOVER RECEIPT & WARRANTY STATEMENT</p>
            </div>

            {/* METADATA GRID */}
            <div className="grid grid-cols-2 gap-2.5 mb-2.5">
              <div className="bg-slate-50/70 border border-slate-200 rounded-lg p-2.5">
                <h3 className="text-[10px] font-black text-slate-700 uppercase tracking-wider mb-1.5 border-b pb-0.5">INFORMASI PELANGGAN</h3>
                <TableInfo label="Nama Pelanggan" value={printWO.customerName} />
                <TableInfo label="No. Telepon" value={printWO.customerPhone} />
                <TableInfo label="Alamat Pelanggan" value={printWO.customerAddress || '-'} />
                {printWO.bringerName && <TableInfo label="Nama Pembawa" value={printWO.bringerName} />}
              </div>

              <div className="bg-slate-50/70 border border-slate-200 rounded-lg p-2.5">
                <h3 className="text-[10px] font-black text-slate-700 uppercase tracking-wider mb-1.5 border-b pb-0.5">INFORMASI KENDARAAN & WO</h3>
                <TableInfo label="Merek/Tipe" value={printWO.vehicleBrand || '-'} />
                <TableInfo label="No. Polisi" value={printWO.plateNumber || '-'} />
                <TableInfo label="No. Rangka (VIN)" value={printWO.vin || '-'} />
                <TableInfo label="Odometer" value={printWO.odometer ? `${printWO.odometer} km` : '-'} />
                <TableInfo label="Metode Penyerahan" value={printWO.dropMethod === 'PARTS' ? 'HANYA KOMPONEN / PARTS' : 'UNIT UTUH KENDARAAN'} />
              </div>
            </div>

            {/* SUMMARY OF SERVICE */}
            <div className="border border-slate-200 rounded-lg overflow-hidden mb-2.5">
              <div className="bg-slate-100 px-3 py-1 border-b border-slate-200">
                <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-wider">DETAIL REKONSILIASI & TINDAKAN PERBAIKAN</h3>
              </div>
              <div className="p-2.5 space-y-2">
                <div>
                  <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-wider mb-0.5">Keluhan Pelanggan yang Diselesaikan:</h4>
                  <div className="bg-white border border-slate-200 rounded p-1.5 text-[10px] text-slate-800 whitespace-pre-line leading-relaxed">
                    {printWO.customerVoice}
                  </div>
                </div>

                {printWO.todoActions && printWO.todoActions.length > 0 && (
                  <div>
                    <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-wider mb-0.5">Tindakan Jasa & Suku Cadang:</h4>
                    <table className="w-full text-left text-[9.5px] border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-600 font-bold bg-slate-50">
                          <th className="p-1">Item Pekerjaan</th>
                          <th className="p-1 text-center w-12">Qty</th>
                          <th className="p-1 text-right">Biaya / Estimasi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {printWO.todoActions.slice(0, 5).map((act) => (
                          <tr key={act.id} className="border-b border-slate-100">
                            <td className="p-1 font-medium text-slate-900">{act.jenisPengerjaan}</td>
                            <td className="p-1 text-center text-slate-700 font-bold">{act.qty}</td>
                            <td className="p-1 text-right text-slate-800 font-mono font-semibold">{formatRupiah(act.estimasiHarga)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* WARRANTY STATEMENT */}
            <div className="bg-blue-50/50 border border-blue-200 rounded-lg p-2.5 mb-2.5">
              <h3 className="text-[10px] font-black text-[#0F2D59] uppercase tracking-wider mb-1">KETENTUAN GARANSI & PERSETUJUAN</h3>
              <p className="text-[9.5px] text-slate-700 leading-relaxed">
                Unit/komponen diesel yang diserahkan dalam surat ini dilindungi oleh garansi resmi Indo Teknik Pekanbaru selama <span className="font-black text-[#0F2D59]">{printWO.garansi || '3 Bulan'}</span> terhitung sejak tanggal serah terima. Garansi berlaku apabila segel pengaman tidak rusak dan bukan akibat solar kotor/kontaminasi.
              </p>
            </div>
          </div>

          {/* HANDOVER DATE AND SIGNATURES */}
          <div className="border-t border-slate-300 pt-2 shrink-0 print:break-inside-avoid">
            <div className="flex justify-between items-center text-[9px] text-slate-500 mb-1.5 font-mono">
              <span>Waktu Serah Terima: {printWO.handoverDate ? new Date(printWO.handoverDate).toLocaleString('id-ID') : new Date().toLocaleString('id-ID')}</span>
              <span>Dicetak Resmi via Indo Teknik ERP</span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center mt-1">
              <div className="border border-slate-200 rounded-lg p-2 flex flex-col justify-between h-24">
                <div>
                  <span className="text-[9.5px] font-black text-slate-600 uppercase tracking-wider">PIHAK BENGKEL (INDO TEKNIK)</span>
                  <p className="text-[8.5px] text-slate-400">Diserahkan Oleh,</p>
                </div>
                <div className="border-t border-slate-300 pt-1 mx-auto w-40 text-[10px] font-bold text-slate-800">
                  Front Office / Service Advisor
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg p-2 flex flex-col justify-between h-24">
                <div>
                  <span className="text-[9.5px] font-black text-slate-600 uppercase tracking-wider">PIHAK PELANGGAN / CUSTOMER</span>
                  <p className="text-[8.5px] text-slate-400">Diterima Oleh,</p>
                </div>
                <div className="border-t border-slate-300 pt-1 mx-auto w-40 text-[10px] font-bold text-slate-900 truncate">
                  {printWO.customerName}
                </div>
              </div>
            </div>

            <div className="text-center mt-2 text-[8.5px] text-slate-400 border-t pt-1 font-mono">
              Indo Teknik Pekanbaru • Authorized Diesel Specialist • Jl. Riau Ujung No.898-904 Pekanbaru
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // STRICT 2-PAGE PRINT LAYOUT WITH ENHANCED FONT SIZES (CLEAR & READABLE)
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

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[100] overflow-y-auto print:static print:h-auto print:w-auto print:overflow-visible print:bg-white text-[#0f172a] font-sans">
      <style>{`
        @page {
          size: A4 portrait;
          margin: 4mm 6mm 4mm 6mm !important;
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
          /* PAGE 1: Enforced exactly 1 A4 page with page break after */
          .print-sheet-1 {
            width: 100% !important;
            height: 288mm !important;
            max-height: 288mm !important;
            page-break-before: auto !important;
            page-break-after: always !important;
            break-after: page !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            overflow: hidden !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            box-sizing: border-box !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          /* PAGE 2: Enforced exactly 1 A4 page without spilling into Page 3 */
          .print-sheet-2 {
            width: 100% !important;
            height: 288mm !important;
            max-height: 288mm !important;
            page-break-before: auto !important;
            break-before: auto !important;
            page-break-after: avoid !important;
            break-after: avoid !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            overflow: hidden !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            box-sizing: border-box !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          /* Signature and QR footer stays grouped */
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

      <div className="max-w-[210mm] w-full mx-auto bg-white p-4 sm:p-6 shadow-2xl print:shadow-none print:max-w-none print:w-full print:p-0 print:m-0 print-wrapper box-border overflow-x-hidden">
        
        {/* ================= ACTION BAR (Hidden in print) ================= */}
        <div className="flex justify-between items-center mb-5 print:hidden no-print border-b pb-3 bg-slate-50 -mx-4 sm:-mx-6 -mt-4 sm:-mt-6 p-4 rounded-t-lg border-slate-200">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setPrintWO(null)} 
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-white text-slate-700 flex items-center gap-2 text-xs font-bold transition-colors shadow-xs cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Kembali
            </button>
            <div>
              <h2 className="text-base font-extrabold text-slate-800 leading-tight">Cetak Dokumen Pemeriksaan & SPK</h2>
              <p className="text-xs text-slate-500">Diformat presisi Tepat 2 Halaman A4 (Ukuran teks besar & jelas dibaca)</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={() => window.print()} 
              className="px-4 py-2 bg-white border border-slate-300 text-slate-800 rounded-lg hover:bg-slate-100 text-xs font-bold flex items-center gap-2 transition-colors shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4" /> Simpan PDF
            </button>
            <button 
              onClick={() => window.print()} 
              className="px-5 py-2 bg-[#0F2D59] text-white rounded-lg hover:bg-[#153a6c] text-xs font-bold flex items-center gap-2 transition-colors shadow-md cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Cetak 2 Halaman
            </button>
          </div>
        </div>

        {/* ========================================================
            PAGE 1: LEMBAR PEMERIKSAAN KENDARAAN (INSPECTION SHEET)
            ======================================================== */}
        <div className="print-sheet-1 border-b-4 border-dashed border-slate-300 print:border-none pb-6 print:pb-0 mb-8 print:mb-0 min-h-[280mm] print:min-h-0 flex flex-col justify-between box-border">
          <div className="flex-1 flex flex-col justify-start min-h-0">
            
            {/* Header Page 1 */}
            <div className="border-b-2 border-[#0F2D59] pb-1.5 mb-1.5">
              <div className="flex justify-between items-start gap-3">
                <div className="flex-shrink min-w-0">
                  <div className="flex items-center gap-2">
                    <SmartLogo 
                      baseName="logo-indo-teknik" 
                      alt="IT INDO TEKNIK" 
                      className="h-8 w-auto object-contain flex-shrink-0" 
                      style={{ height: '32px', maxWidth: '140px' }}
                    />
                    <div className="border-l-2 border-slate-300 pl-2 leading-tight text-left">
                      <p className="text-[10px] font-black tracking-widest text-[#0F2D59] uppercase">INDO TEKNIK PEKANBARU</p>
                      <p className="text-[8px] text-slate-600 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-red-600 shrink-0" /> Jl. Riau Ujung No.898-904, Pekanbaru • Telp: (0761) 853798
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-1 pl-0.5">
                    <SmartLogo 
                      baseName="logo-itech" 
                      alt="ITech" 
                      className="h-5.5 w-auto object-contain flex-shrink-0" 
                      style={{ height: '22px', maxWidth: '75px' }}
                    />
                    <p className="text-[8px] font-black tracking-widest text-[#0F2D59] whitespace-nowrap bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      ITECH AUTHORIZED DEALER & WORKSHOP
                    </p>
                  </div>
                </div>
                
                <div className="text-right flex flex-col items-end shrink-0 max-w-[48%]">
                  <div className="flex items-center justify-end gap-1.5 flex-wrap">
                    <h2 className="text-[10px] font-black bg-[#0F2D59] text-white px-2 py-0.5 rounded tracking-wider uppercase shadow-xs">
                      LEMBAR PEMERIKSAAN KENDARAAN
                    </h2>
                    <span className="text-[7.5px] font-black bg-blue-100 text-blue-900 border border-blue-300 px-1.5 py-0.5 rounded uppercase shrink-0">
                      CUSTOMER COPY
                    </span>
                  </div>
                  <div className="flex items-center justify-end gap-1.5 mt-0.5">
                    <p className="text-[10px] font-mono text-[#0f172a] font-bold">
                      NO. WO: <span className="text-[#0F2D59] font-black text-[11px]">{printWO.id}</span>
                    </p>
                    {printWO.status === 'COMPLETED' ? (
                      <span className="text-[7.5px] font-black px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0">
                        HASIL AKHIR
                      </span>
                    ) : (
                      <span className="text-[7.5px] font-black px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300 shrink-0">
                        ESTIMASI AWAL
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 1: CUSTOMER & VEHICLE PROFILE GRID */}
            <div className="grid grid-cols-2 gap-2 mb-1.5 text-[9.5px]">
              {/* Customer Box */}
              <div className="border border-slate-300 bg-slate-50/50 rounded-lg p-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <h3 className="font-black border-b border-slate-200 pb-0.5 mb-1 text-[#0F2D59] text-[9px] uppercase tracking-wider flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span> DATA PEMILIK
                    </h3>
                    <div className="grid grid-cols-3 gap-y-0.5 text-[9.5px]">
                      <span className="text-slate-500 font-medium">Nama:</span>
                      <span className="col-span-2 font-bold text-slate-900 truncate">{printWO.customerName}</span>
                      <span className="text-slate-500 font-medium">Telp:</span>
                      <span className="col-span-2 font-mono font-bold text-slate-900">{printWO.customerPhone}</span>
                      <span className="text-slate-500 font-medium">Alamat:</span>
                      <span className="col-span-2 text-slate-700 truncate">{printWO.customerAddress || '-'}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-black border-b border-slate-200 pb-0.5 mb-1 text-[#0F2D59] text-[9px] uppercase tracking-wider flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span> DATA PEMBAWA
                    </h3>
                    <div className="grid grid-cols-3 gap-y-0.5 text-[9.5px]">
                      <span className="text-slate-500 font-medium">Nama:</span>
                      <span className="col-span-2 font-bold text-slate-900 truncate">{printWO.bringerName || '-'}</span>
                      <span className="text-slate-500 font-medium">Telp:</span>
                      <span className="col-span-2 font-mono text-slate-800">{printWO.bringerPhone || '-'}</span>
                      <span className="text-slate-500 font-medium">Alamat:</span>
                      <span className="col-span-2 text-slate-700 truncate">{printWO.bringerAddress || '-'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vehicle & Fuel Box */}
              <div className="border border-slate-300 bg-slate-50/50 rounded-lg p-2">
                <h3 className="font-black border-b border-slate-200 pb-0.5 mb-1 text-[#0F2D59] text-[9px] uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span> DATA KENDARAAN / UNIT
                  </span>
                  <span className="text-[8px] font-bold text-slate-600">
                    {printWO.dropMethod === 'PARTS' ? 'KOMPONEN COPOTAN (PARTS)' : 'UNIT KENDARAAN UTUH'}
                  </span>
                </h3>
                
                <div className="grid grid-cols-12 gap-1.5 items-center">
                  <div className="col-span-8 grid grid-cols-3 gap-y-0.5 text-[9.5px]">
                    <span className="text-slate-500 font-medium">Merek/Model:</span>
                    <span className="col-span-2 font-bold text-slate-900 truncate">{printWO.vehicleBrand || '-'}</span>
                    <span className="text-slate-500 font-medium">No. Polisi:</span>
                    <span className="col-span-2 font-black text-[#0F2D59] font-mono text-[10px] bg-blue-100/70 px-1.5 rounded inline-block w-fit">
                      {printWO.plateNumber || '-'}
                    </span>
                    <span className="text-slate-500 font-medium">No. Rangka:</span>
                    <span className="col-span-2 font-mono text-slate-800 truncate">{printWO.vin || '-'}</span>
                    <span className="text-slate-500 font-medium">Odo / HM:</span>
                    <span className="col-span-2 font-bold text-slate-900">{printWO.odometer ? `${printWO.odometer} km` : '-'}</span>
                  </div>

                  {/* Fuel Indicator Gauge */}
                  <div className="col-span-4 flex flex-col items-center justify-center border-l border-slate-200 pl-1.5 text-center">
                    <span className="text-[7.5px] font-black text-slate-600 uppercase tracking-wider mb-0.5">INDIKATOR BBM</span>
                    {printWO.fuelLevel ? (
                      <div className="w-full flex flex-col items-center">
                        <FuelGauge level={printWO.fuelLevel} theme="print" size="xs" className="border-none bg-transparent p-0 w-full" />
                        <span className="text-[8.5px] font-black text-[#0F2D59] mt-0.5">Posisi: {printWO.fuelLevel}</span>
                      </div>
                    ) : (
                      <span className="text-[8px] text-slate-400 italic">Tidak Terdata</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* OPERATIONAL TIMELINE ROW */}
            <div className="bg-blue-50/50 px-2.5 py-1 border border-blue-200 rounded-lg text-[9px] flex justify-between items-center mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span className="font-bold text-slate-600">Waktu Masuk:</span>
                <span className="font-mono font-black text-[#0F2D59]">
                  {printWO.intakeDate ? new Date(printWO.intakeDate).toLocaleString('id-ID') : '-'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <span className="font-bold text-slate-600">Estimasi Pengerjaan:</span>
                  <span className="text-[#0F2D59] font-black">{printWO.estimasiPengerjaan || '1-3 Hari Kerja'}</span>
                </div>
                <div className="flex items-center gap-1 border-l border-blue-200 pl-3">
                  <span className="font-bold text-slate-600">Masa Garansi:</span>
                  <span className="text-emerald-800 font-black">{printWO.garansi || '3 Bulan'}</span>
                </div>
              </div>
            </div>

            {/* SECTION 2: CUSTOMER COMPLAINTS */}
            {complaintLines.length > 0 && (
              <div className="mb-1.5">
                <div className="bg-[#0F2D59] text-white px-2 py-0.5 rounded-t font-black text-[9px] uppercase tracking-wider flex items-center justify-between">
                  <span>KELUHAN UTAMA PELANGGAN (CUSTOMER VOICE)</span>
                  <span className="text-[7.5px] text-blue-200 font-normal">Wajib diperiksa teknisi</span>
                </div>
                <table className="w-full border-collapse border border-slate-300 text-[9.5px]">
                  <thead>
                    <tr className="bg-slate-100 text-[8px] uppercase text-slate-700 font-bold">
                      <th className="border border-slate-300 py-0.5 text-center w-[6%]">NO</th>
                      <th className="border border-slate-300 py-0.5 text-left px-2 w-[94%]">DESKRIPSI KELUHAN & GEJALA KERUSAKAN</th>
                    </tr>
                  </thead>
                  <tbody>
                    {complaintLines.slice(0, 3).map((line, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                        <td className="border border-slate-300 py-0.5 text-center font-bold text-slate-700">{idx + 1}</td>
                        <td className="border border-slate-300 py-0.5 px-2 font-semibold text-slate-900">{line}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* SECTION 3: VISUAL BODY DAMAGE INSPECTION MAP & INVENTORY */}
            {printWO.dropMethod === 'WHOLE' ? (
              <div className="grid grid-cols-12 gap-2 mb-1.5">
                {/* Visual Body Parts Grid (Left 7 Cols) */}
                <div className="col-span-7 border border-slate-300 rounded-lg overflow-hidden flex flex-col justify-between">
                  <div className="bg-slate-100 px-2 py-0.5 border-b border-slate-300 flex items-center justify-between">
                    <h3 className="text-[9px] font-black text-[#0F2D59] uppercase tracking-wider flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-blue-600" /> PEMERIKSAAN KONDISI FISIK / BODI MOBIL
                    </h3>
                    <span className="text-[7.5px] font-bold text-slate-500">9 Titik Inspeksi</span>
                  </div>

                  <div className="p-1.5 flex-1 flex flex-col justify-between">
                    {/* 9 Inspection Points Grid */}
                    <div className="grid grid-cols-3 gap-1 mb-1">
                      {ALL_CAR_INSPECTION_PARTS.map((part) => {
                        const defect = damagesList.find(d => d.partId === part.id);
                        const isDefective = Boolean(defect);
                        return (
                          <div 
                            key={part.id} 
                            className={`p-1 rounded border text-center flex flex-col items-center justify-center min-h-[28px] ${
                              isDefective 
                                ? 'bg-rose-50 border-rose-400 text-rose-900' 
                                : 'bg-emerald-50/50 border-emerald-300 text-emerald-900'
                            }`}
                          >
                            <span className="text-[8px] font-bold leading-tight truncate w-full">{part.label}</span>
                            <span className={`text-[7px] font-black mt-0.5 px-1 rounded ${
                              isDefective ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
                            }`}>
                              {isDefective ? '⚠️ DEFECT' : '✓ OK'}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Defect Description Box */}
                    <div className="border border-slate-200 bg-slate-50 rounded p-1 text-[9px]">
                      <span className="font-black text-slate-700 block mb-0.5 text-[8px] uppercase">
                        Catatan Baret / Kerusakan Fisik Saat Masuk:
                      </span>
                      {damagesList.length === 0 ? (
                        <p className="text-emerald-700 italic font-medium text-[8.5px]">
                          ✓ Kondisi bodi luar dan interior dalam keadaan mulus/OK saat serah terima.
                        </p>
                      ) : (
                        <div className="space-y-0.5">
                          {damagesList.map((d) => {
                            const partObj = ALL_CAR_INSPECTION_PARTS.find(p => p.id === d.partId);
                            return (
                              <div key={d.partId} className="flex items-center gap-1.5 text-slate-900 text-[8.5px]">
                                <span className="font-black text-rose-800 text-[8px] bg-rose-100 px-1 py-0.5 rounded border border-rose-200">
                                  {partObj ? partObj.label : d.partId}:
                                </span>
                                <span className="text-slate-800 font-medium truncate">{d.description || 'Ada baret / retak fisik'}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Inventory Checklist (Right 5 Cols) */}
                <div className="col-span-5 border border-slate-300 rounded-lg overflow-hidden flex flex-col justify-between">
                  <div className="bg-slate-100 px-2 py-0.5 border-b border-slate-300 flex items-center justify-between">
                    <h3 className="text-[9px] font-black text-[#0F2D59] uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-emerald-600" /> INVENTORY CHECKLIST
                    </h3>
                    <span className="text-[7.5px] font-bold text-slate-500">Kelengkapan Unit</span>
                  </div>

                  <div className="p-1.5 flex-1">
                    <div className="grid grid-cols-2 gap-x-1.5 gap-y-0.5 text-[8px]">
                      {DEFAULT_INVENTORY_ITEMS.map((item) => {
                        const checked = isInventoryChecked(item);
                        return (
                          <div 
                            key={item} 
                            className={`flex items-center py-0.5 px-1 rounded ${
                              checked ? 'bg-blue-50/80 font-bold text-slate-900' : 'text-slate-500'
                            }`}
                          >
                            <span className={`w-3 h-3 rounded-xs border flex items-center justify-center mr-1 text-[7.5px] font-black shrink-0 ${
                              checked ? 'bg-[#0F2D59] border-[#0F2D59] text-white' : 'border-slate-400 bg-white text-transparent'
                            }`}>
                              ✓
                            </span>
                            <span className="truncate">{item}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* LOOSE PARTS SERIALIZATION TABLE */
              <div className="mb-1.5 border border-slate-300 rounded-lg overflow-hidden">
                <div className="bg-slate-100 px-2 py-0.5 border-b border-slate-300 flex items-center justify-between">
                  <h3 className="text-[9px] font-black text-[#0F2D59] uppercase tracking-wider flex items-center gap-1">
                    <Wrench className="w-3 h-3 text-blue-600" /> SERIALISASI & PEMERIKSAAN KOMPONEN COPOTAN (LOOSE PARTS)
                  </h3>
                  <span className="text-[7.5px] font-bold text-slate-500">Pemeriksaan Fisik Part</span>
                </div>
                <table className="w-full border-collapse text-[9px]">
                  <thead>
                    <tr className="bg-slate-50 text-[8px] uppercase font-bold text-slate-700 border-b border-slate-300">
                      <th className="py-0.5 px-1.5 text-center w-7 border-r border-slate-300">NO</th>
                      <th className="py-0.5 px-2 text-left border-r border-slate-300">KETERANGAN KOMPONEN</th>
                      <th className="py-0.5 px-2 text-left border-r border-slate-300">PART NUMBER (P/N)</th>
                      <th className="py-0.5 px-1.5 text-center w-24 border-r border-slate-300">KONDISI FISIK</th>
                      <th className="py-0.5 px-2 text-left">STATUS / CATATAN</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(loosePartsList.length > 0 ? loosePartsList : [
                      { id: '1', description: 'Injector Common Rail Nozzle 1', partNumber: '-', physicalCondition: 'OK' },
                      { id: '2', description: 'Injector Common Rail Nozzle 2', partNumber: '-', physicalCondition: 'OK' },
                      { id: '3', description: 'Injector Common Rail Nozzle 3', partNumber: '-', physicalCondition: 'OK' },
                      { id: '4', description: 'Injector Common Rail Nozzle 4', partNumber: '-', physicalCondition: 'OK' },
                    ]).slice(0, 4).map((part, i) => (
                      <tr key={part.id || i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                        <td className="py-0.5 px-1.5 text-center font-bold text-slate-700 border-r border-slate-200">{i + 1}</td>
                        <td className="py-0.5 px-2 font-bold text-slate-900 border-r border-slate-200">{part.description || '-'}</td>
                        <td className="py-0.5 px-2 font-mono font-semibold text-slate-800 border-r border-slate-200">{part.partNumber || '-'}</td>
                        <td className="py-0.5 px-1.5 text-center font-black border-r border-slate-200">
                          <span className={`px-1.5 py-0.5 rounded text-[7.5px] ${
                            part.physicalCondition === 'OK' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {part.physicalCondition || 'OK'}
                          </span>
                        </td>
                        <td className="py-0.5 px-2 text-slate-700 italic text-[8.5px]">Telah diverifikasi sesuai saat serah terima</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* PAGE 1 SIGNATURES & QR TRACKING FOOTER */}
          <div className="print-signature-group border-t-2 border-slate-300 pt-1 mt-auto shrink-0">
            <div className="flex items-center justify-between gap-2.5">
              {/* 4 Signatures Grid */}
              <div className="flex-1 grid grid-cols-4 gap-1.5 text-center text-[8.5px]">
                <div className="border border-slate-200 rounded p-1">
                  <div className="h-9 border-b border-slate-400 mb-0.5 flex items-end justify-center pb-0.5 text-[7.5px] text-slate-300">
                    (Tanda Tangan)
                  </div>
                  <p className="font-black text-slate-900 leading-tight">Pelanggan / Customer</p>
                  <p className="text-[7px] text-slate-500 truncate">{printWO.customerName}</p>
                </div>

                <div className="border border-slate-200 rounded p-1">
                  <div className="h-9 border-b border-slate-400 mb-0.5 flex items-end justify-center pb-0.5 text-[7.5px] text-slate-300">
                    (Tanda Tangan)
                  </div>
                  <p className="font-black text-slate-900 leading-tight">Mekanik Tester</p>
                  <p className="text-[7px] text-slate-500">Pemeriksa Fisik</p>
                </div>

                <div className="border border-slate-200 rounded p-1">
                  <div className="h-9 border-b border-slate-400 mb-0.5 flex items-end justify-center pb-0.5 text-[7.5px] text-slate-300">
                    (Tanda Tangan)
                  </div>
                  <p className="font-black text-slate-900 leading-tight">Service Advisor (SA)</p>
                  <p className="text-[7px] text-slate-500">Front Office</p>
                </div>

                <div className="border border-slate-200 rounded p-1">
                  <div className="h-9 border-b border-slate-400 mb-0.5 flex items-end justify-center pb-0.5 text-[7.5px] text-slate-300">
                    (Tanda Tangan)
                  </div>
                  <p className="font-black text-slate-900 leading-tight">Foreman Bengkel</p>
                  <p className="text-[7px] text-slate-500">Ka. Produksi</p>
                </div>
              </div>

              {/* QR Live Tracking Box */}
              <div className="w-44 flex-shrink-0 flex items-center gap-1.5 border-2 border-blue-200 bg-blue-50/50 p-1 rounded-lg">
                <div className="p-1 bg-white rounded border border-slate-300 shrink-0 flex items-center justify-center shadow-xs">
                  <QRCodeSVG
                    value={baseTrackingUrl + '/?tracking=' + printWO.id}
                    size={42}
                    level="M"
                    includeMargin={false}
                  />
                </div>
                <div className="text-left leading-tight">
                  <p className="text-[8px] font-black text-[#0F2D59] uppercase tracking-wider">LIVE TRACKING</p>
                  <p className="text-[6.5px] text-slate-600 font-medium leading-tight mt-0.5">Scan status servis real-time via HP.</p>
                  <p className="text-[7.5px] font-mono font-black text-blue-800 mt-0.5">{printWO.id}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center text-[7.5px] text-slate-500 border-t border-slate-200 pt-0.5 mt-0.5 font-mono">
              <span>Indo Teknik Pekanbaru • Jl. Riau Ujung No.898-904 Pekanbaru • (0761) 853798</span>
              <span className="font-bold text-slate-700">Dokumen Lembar Pemeriksaan Resmi • Halaman 1 dari 2</span>
            </div>
          </div>
        </div>


        {/* ========================================================
            PAGE 2: SURAT PERINTAH KERJA / SPK (WORKSHOP COPY)
            ======================================================== */}
        <div className="print-sheet-2 min-h-[280mm] print:min-h-0 flex flex-col justify-between box-border">
          <div className="flex-1 flex flex-col justify-start min-h-0">
            
            {/* Header Page 2 */}
            <div className="border-b-2 border-[#0F2D59] pb-1.5 mb-1.5">
              <div className="flex justify-between items-start gap-3">
                <div className="flex-shrink min-w-0">
                  <div className="flex items-center gap-2">
                    <SmartLogo 
                      baseName="logo-indo-teknik" 
                      alt="IT INDO TEKNIK" 
                      className="h-8 w-auto object-contain flex-shrink-0" 
                      style={{ height: '32px', maxWidth: '140px' }}
                    />
                    <div className="border-l-2 border-slate-300 pl-2 leading-tight text-left">
                      <p className="text-[10px] font-black tracking-widest text-[#0F2D59] uppercase">INDO TEKNIK PEKANBARU</p>
                      <p className="text-[8px] text-slate-600 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-red-600 shrink-0" /> Jl. Riau Ujung No.898-904, Pekanbaru • Telp: (0761) 853798
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-1 pl-0.5">
                    <SmartLogo 
                      baseName="logo-itech" 
                      alt="ITech" 
                      className="h-5.5 w-auto object-contain flex-shrink-0" 
                      style={{ height: '22px', maxWidth: '75px' }}
                    />
                    <p className="text-[8px] font-black tracking-widest text-[#0F2D59] whitespace-nowrap bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      ITECH AUTHORIZED DEALER & WORKSHOP
                    </p>
                  </div>
                </div>
                
                <div className="text-right flex flex-col items-end shrink-0 max-w-[48%]">
                  <div className="flex items-center justify-end gap-1.5 flex-wrap">
                    <h2 className="text-[10px] font-black bg-[#0F2D59] text-white px-2 py-0.5 rounded tracking-wider uppercase shadow-xs">
                      SURAT PERINTAH KERJA (SPK)
                    </h2>
                    <span className="text-[7.5px] font-black bg-slate-100 text-slate-900 border border-slate-400 px-1.5 py-0.5 rounded uppercase shrink-0">
                      WORKSHOP COPY
                    </span>
                  </div>
                  <div className="flex items-center justify-end gap-1.5 mt-0.5">
                    <p className="text-[10px] font-mono text-[#0f172a] font-bold">
                      NO. WO: <span className="text-[#0F2D59] font-black text-[11px]">{printWO.id}</span>
                    </p>
                    {printWO.priority === 1 && <span className="text-[7.5px] font-black px-1.5 py-0.5 rounded bg-red-100 text-red-800 border border-red-300 shrink-0">P1: URGENT</span>}
                    {printWO.priority === 2 && <span className="text-[7.5px] font-black px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300 shrink-0">P2: BOOKING</span>}
                    {printWO.priority === 3 && <span className="text-[7.5px] font-black px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-300 shrink-0">P3: REGULAR</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* TECHNICAL & CUSTOMER PROFILE ROW */}
            <div className="grid grid-cols-2 gap-2 mb-1.5 text-[9.5px]">
              <div className="border border-slate-300 bg-slate-50/50 rounded-lg p-2">
                <h3 className="font-black border-b border-slate-200 pb-0.5 mb-1 text-[#0F2D59] text-[9px] uppercase tracking-wider">
                  DATA PELANGGAN & PEMBAWA
                </h3>
                <div className="grid grid-cols-4 gap-y-0.5 text-[9.5px]">
                  <span className="text-slate-500 font-medium">Pelanggan:</span>
                  <span className="col-span-3 font-bold text-slate-900 truncate">{printWO.customerName} ({printWO.customerPhone})</span>
                  <span className="text-slate-500 font-medium">Pembawa:</span>
                  <span className="col-span-3 text-slate-800 truncate">{printWO.bringerName || '-'} {printWO.bringerPhone ? `(${printWO.bringerPhone})` : ''}</span>
                </div>
              </div>

              <div className="border border-slate-300 bg-slate-50/50 rounded-lg p-2">
                <h3 className="font-black border-b border-slate-200 pb-0.5 mb-1 text-[#0F2D59] text-[9px] uppercase tracking-wider">
                  IDENTITAS TEKNIS UNIT & KENDARAAN
                </h3>
                <div className="grid grid-cols-4 gap-y-0.5 text-[9.5px]">
                  <span className="text-slate-500 font-medium">Merek/Tipe:</span>
                  <span className="col-span-3 font-bold text-slate-900 truncate">{printWO.vehicleBrand || '-'}</span>
                  <span className="text-slate-500 font-medium">No. Polisi:</span>
                  <span className="col-span-3 font-black text-[#0F2D59] font-mono text-[10px] bg-blue-100/70 px-1.5 rounded inline-block w-fit">
                    {printWO.plateNumber || '-'}
                  </span>
                  <span className="text-slate-500 font-medium">No. Rangka:</span>
                  <span className="col-span-3 font-mono text-slate-800 truncate">{printWO.vin || '-'}</span>
                </div>
              </div>
            </div>

            {/* SECTION 2: RANGKUMAN HASIL PERBAIKAN (BEFORE VS AFTER) */}
            {complaintLines.length > 0 && (
              <div className="mb-1.5 border border-slate-300 rounded-lg overflow-hidden">
                <div className="bg-[#0F2D59] text-white px-2 py-0.5 font-black text-[9px] uppercase tracking-wider flex items-center justify-between">
                  <span>RANGKUMAN DIAGNOSA & TINDAKAN PERBAIKAN (BEFORE VS AFTER)</span>
                  <span className="text-[7.5px] text-blue-200 font-normal">Hasil Kalibrasi / Uji Bench</span>
                </div>
                <table className="w-full border-collapse text-[9.5px]">
                  <thead>
                    <tr className="bg-slate-100 text-[8px] font-bold uppercase text-slate-700 border-b border-slate-300">
                      <th className="py-0.5 px-1 text-center w-[6%] border-r border-slate-300">NO</th>
                      <th className="py-0.5 px-2 text-left w-[50%] border-r border-slate-300">KELUHAN / KONDISI AWAL (BEFORE)</th>
                      <th className="py-0.5 px-2 text-left w-[44%]">TINDAKAN / HASIL PERBAIKAN (AFTER)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {complaintLines.slice(0, 3).map((line, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                        <td className="py-0.5 px-1 text-center font-bold text-slate-700 border-r border-slate-200">{idx + 1}</td>
                        <td className="py-0.5 px-2 font-bold text-slate-900 border-r border-slate-200">{line}</td>
                        <td className="py-0.5 px-2 font-bold text-blue-900 bg-blue-50/30">
                          {printWO.repairResults?.[idx] || 'Dalam proses diagnosa & pengerjaan teknisi'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* SECTION 3: DAFTAR TINDAKAN & SUKU CADANG (TO-DO LIST) */}
            <div className="mb-1.5 border border-slate-300 rounded-lg overflow-hidden">
              <div className="bg-[#0F2D59] text-white px-2 py-0.5 font-black text-[9px] uppercase tracking-wider flex items-center justify-between">
                <span>RINCIAN JASA PERBAIKAN & RENCANA SUKU CADANG (SPK TO-DO LIST)</span>
                <span className="text-[7.5px] text-blue-200 font-normal">Estimasi Biaya Transparan</span>
              </div>
              <table className="w-full border-collapse text-[9.5px]">
                <thead>
                  <tr className="bg-slate-100 text-[8px] uppercase font-bold text-slate-700 border-b border-slate-300">
                    <th className="py-0.5 px-2 text-left border-r border-slate-300">JENIS PENGERJAAN / SUKU CADANG</th>
                    <th className="py-0.5 px-1 text-center w-10 border-r border-slate-300">QTY</th>
                    <th className="py-0.5 px-2 text-left border-r border-slate-300">CATATAN TEKNIS / MEKANIK</th>
                    <th className="py-0.5 px-2 text-right w-36">ESTIMASI BIAYA (RP)</th>
                  </tr>
                </thead>
                <tbody>
                  {(todoList.length > 0 ? todoList.slice(0, 4) : [
                    { id: '1', jenisPengerjaan: 'Kalibrasi Injector & Supply Pump', qty: 1, catatanMekanik: 'Uji test bench standar OEM', estimasiHarga: '500000' }
                  ]).map((action, i) => (
                    <tr key={action.id || i} className="border-b border-slate-200">
                      <td className="py-0.5 px-2 font-bold text-slate-900 border-r border-slate-200">{action.jenisPengerjaan || '-'}</td>
                      <td className="py-0.5 px-1 text-center font-bold text-slate-800 border-r border-slate-200">{action.qty}</td>
                      <td className="py-0.5 px-2 text-slate-700 border-r border-slate-200 text-[8.5px] truncate max-w-[150px]">{action.catatanMekanik || '-'}</td>
                      <td className="py-0.5 px-2 font-mono font-bold text-right text-slate-900">
                        {action.estimasiHargaMin || action.estimasiHargaMax ? (
                          <>
                            {action.estimasiHargaMin ? formatRupiah(action.estimasiHargaMin) : 'Rp 0'} 
                            <span className="text-[7.5px] text-slate-400 font-normal mx-0.5">s/d</span> 
                            {action.estimasiHargaMax ? formatRupiah(action.estimasiHargaMax) : 'Rp 0'}
                          </>
                        ) : (
                          formatRupiah(action.estimasiHarga) || 'Rp 0'
                        )}
                      </td>
                    </tr>
                  ))}

                  {/* Total Estimasi Biaya Row */}
                  <tr className="bg-slate-100/90 font-black border-t-2 border-slate-300">
                    <td colSpan={2} className="py-1 px-2 text-right text-[9px] text-slate-800 border-r border-slate-300">
                      TOTAL ESTIMASI BIAYA SERVIS & SUKU CADANG:
                    </td>
                    <td className="py-1 px-2 text-slate-600 text-[8.5px] border-r border-slate-300">
                      {todoList.reduce((sum, item) => sum + (parseInt(String(item.qty), 10) || 1), 0)} Total Item
                    </td>
                    <td className="py-1 px-2 text-right font-mono text-[10px] text-[#0F2D59]">
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
            <div className="mb-1.5 text-[7.5px] leading-[1.3] text-slate-700 text-justify border border-slate-300 p-1.5 rounded-lg bg-slate-50/40">
              <p className="font-black uppercase text-[#0F2D59] text-[8px] tracking-wider text-center border-b border-slate-300 pb-0.5 mb-1">
                SYARAT & KETENTUAN PERINTAH KERJA (SPK) INDO TEKNIK
              </p>
              <div className="grid grid-cols-2 gap-x-2.5 gap-y-0.5">
                <div className="space-y-0.5">
                  <p><strong>1. Kuasa Diagnosa:</strong> Pelanggan memberi kuasa penuh kepada teknisi Indo Teknik untuk membongkar, menguji bench, dan menganalisa komponen.</p>
                  <p><strong>2. Hidden Defect:</strong> Kerusakan tersembunyi yang baru ditemukan saat pembongkaran akan dikonfirmasi terlebih dahulu sebelum pengerjaan.</p>
                  <p><strong>3. Penambahan Biaya:</strong> Perubahan suku cadang atau pengerjaan tambahan akan menambah estimasi biaya sesuai persetujuan pelanggan.</p>
                  <p><strong>4. Pembatalan (Decline):</strong> Pembatalan sepihak setelah pembongkaran membebaskan bengkel dari tuntutan performa awal kendaraan/part.</p>
                  <p><strong>5. Jasa Diagnosa:</strong> Jasa diagnosa & uji lab yang telah berjalan tetap wajib dibayarkan pelanggan meskipun SPK dibatalkan.</p>
                  <p><strong>6. Kerusakan Bawaan:</strong> Bengkel tidak bertanggung jawab atas kerusakan fisik awal yang telah tercatat pada Lembar Pemeriksaan Hal 1.</p>
                </div>
                <div className="space-y-0.5">
                  <p><strong>7. Standar Uji Bench:</strong> Seluruh kalibrasi injector dan supply pump dikerjakan berdasarkan database resmi pabrikan (OEM Standard).</p>
                  <p><strong>8. Batas Pengambilan:</strong> Unit/part yang telah selesai dikerjakan wajib diambil maksimal 30 hari kalender setelah pemberitahuan dari SA.</p>
                  <p><strong>9. Pemeriksaan Kembali:</strong> Pelanggan wajib memeriksa fisik unit & kelengkapan saat serah terima kembali barang dilakukan.</p>
                  <p><strong>10. Barang Berharga:</strong> Segala barang berharga yang tertinggal di dalam kendaraan bukan menjadi tanggung jawab pihak bengkel.</p>
                  <p><strong>11. Ketentuan Garansi:</strong> Garansi berlaku sesuai masa berlaku dengan syarat segel bengkel utuh dan bukan kontaminasi bahan bakar kotor.</p>
                  <p><strong>12. Persetujuan Mutlak:</strong> Penandatanganan SPK ini merupakan bukti kesepakatan mutlak atas seluruh poin ketentuan di atas.</p>
                </div>
              </div>
            </div>
          </div>

          {/* PAGE 2 SIGNATURES & QR TRACKING FOOTER */}
          <div className="print-signature-group border-t-2 border-slate-300 pt-1 mt-auto shrink-0">
            <div className="flex items-center justify-between gap-2.5">
              {/* 4 Signatures Grid */}
              <div className="flex-1 grid grid-cols-4 gap-1.5 text-center text-[8.5px]">
                <div className="border border-slate-200 rounded p-1">
                  <div className="h-9 border-b border-slate-400 mb-0.5 flex items-end justify-center pb-0.5 text-[7.5px] text-slate-300">
                    (Tanda Tangan)
                  </div>
                  <p className="font-black text-slate-900 leading-tight">Pelanggan / Customer</p>
                  <p className="text-[7px] text-slate-500 truncate">{printWO.customerName}</p>
                </div>

                <div className="border border-slate-200 rounded p-1">
                  <div className="h-9 border-b border-slate-400 mb-0.5 flex items-end justify-center pb-0.5 text-[7.5px] text-slate-300">
                    (Tanda Tangan)
                  </div>
                  <p className="font-black text-slate-900 leading-tight">Mekanik / Teknisi</p>
                  <p className="text-[7px] text-slate-500">Pelaksana Servis</p>
                </div>

                <div className="border border-slate-200 rounded p-1">
                  <div className="h-9 border-b border-slate-400 mb-0.5 flex items-end justify-center pb-0.5 text-[7.5px] text-slate-300">
                    (Tanda Tangan)
                  </div>
                  <p className="font-black text-slate-900 leading-tight">Service Advisor (SA)</p>
                  <p className="text-[7px] text-slate-500">Front Office</p>
                </div>

                <div className="border border-slate-200 rounded p-1">
                  <div className="h-9 border-b border-slate-400 mb-0.5 flex items-end justify-center pb-0.5 text-[7.5px] text-slate-300">
                    (Tanda Tangan)
                  </div>
                  <p className="font-black text-slate-900 leading-tight">Foreman / Ka. Bengkel</p>
                  <p className="text-[7px] text-slate-500">Approval Produksi</p>
                </div>
              </div>

              {/* QR Live Tracking Box */}
              <div className="w-44 flex-shrink-0 flex items-center gap-1.5 border-2 border-blue-200 bg-blue-50/50 p-1 rounded-lg">
                <div className="p-1 bg-white rounded border border-slate-300 shrink-0 flex items-center justify-center shadow-xs">
                  <QRCodeSVG
                    value={baseTrackingUrl + '/?tracking=' + printWO.id}
                    size={42}
                    level="M"
                    includeMargin={false}
                  />
                </div>
                <div className="text-left leading-tight">
                  <p className="text-[8px] font-black text-[#0F2D59] uppercase tracking-wider">LIVE TRACKING</p>
                  <p className="text-[6.5px] text-slate-600 font-medium leading-tight mt-0.5">Scan status servis real-time via HP.</p>
                  <p className="text-[7.5px] font-mono font-black text-blue-800 mt-0.5">{printWO.id}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center text-[7.5px] text-slate-500 border-t border-slate-200 pt-0.5 mt-0.5 font-mono">
              <span>Indo Teknik Pekanbaru • Jl. Riau Ujung No.898-904 Pekanbaru • (0761) 853798</span>
              <span className="font-bold text-slate-700">Dokumen SPK Bengkel Resmi • Halaman 2 dari 2</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PrintTemplate;
