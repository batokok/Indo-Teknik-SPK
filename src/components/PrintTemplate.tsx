import React from 'react';
import { useApp } from '../store/AppContext';
import { Printer, Download, ArrowLeft, MapPin } from 'lucide-react';
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

export const PrintTemplate: React.FC = () => {
  const { printWO, setPrintWO, printType, trackingBaseUrl } = useApp();

  if (!printWO) return null;

  const baseTrackingUrl = trackingBaseUrl || 'https://it-erp-app.web.app';

  const TableInfo = ({ label, value }: { label: string; value: string }) => (
    <div className="flex justify-between py-0.5 border-b border-dashed border-slate-200 text-[8.5px]">
      <span className="text-slate-500 font-medium">{label}</span>
      <span className="text-slate-800 font-bold text-right truncate max-w-[65%]">{value}</span>
    </div>
  );

  // --- 1-PAGE HANDOVER TEMPLATE ---
  if (printType === 'HANDOVER') {
    return (
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-[100] overflow-y-auto print:static print:h-auto print:w-auto print:overflow-visible print:bg-white text-[#0f172a] font-sans">
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
                  className="px-3 py-1.5 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 text-xs font-bold transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Kembali
                </button>
                <div>
                  <h2 className="text-sm font-extrabold text-slate-800 leading-tight">Bukti Penyerahan Barang (Handover Receipt)</h2>
                  <p className="text-[10px] text-slate-500">Pratinjau sebelum cetak (Tepat 1 Halaman A4)</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => window.print()} 
                  className="px-3.5 py-1.5 bg-slate-100 border border-slate-300 text-slate-800 rounded-lg hover:bg-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Simpan PDF
                </button>
                <button 
                  onClick={() => window.print()} 
                  className="px-3.5 py-1.5 bg-[#0F2D59] text-white rounded-lg hover:bg-[#153a6c] text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Cetak Bukti Serah
                </button>
              </div>
            </div>

            {/* HEADER AREA */}
            <div className="border-b-2 border-[#0F2D59] pb-1.5 mb-2">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <SmartLogo 
                      baseName="logo-indo-teknik" 
                      alt="IT INDO TEKNIK" 
                      className="h-8 w-auto object-contain flex-shrink-0" 
                      style={{ height: '34px', maxWidth: '150px' }}
                    />
                    <div className="border-l border-slate-300 pl-2 leading-tight text-left">
                      <p className="text-[8.5px] font-black tracking-widest text-[#0F2D59] uppercase">INDO TEKNIK PEKANBARU</p>
                      <p className="text-[7px] text-slate-500 flex items-center gap-1 mt-0.5"><MapPin className="w-2.5 h-2.5 text-[#E21F26] shrink-0" /> Jl. Riau Ujung No.898-904, Pekanbaru</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 pl-0.5">
                    <SmartLogo 
                      baseName="logo-itech" 
                      alt="ITech" 
                      className="h-3.5 w-auto object-contain flex-shrink-0" 
                      style={{ height: '14px', maxWidth: '45px' }}
                    />
                    <p className="text-[6.5px] font-black tracking-widest text-[#0F2D59] whitespace-nowrap bg-blue-50 px-1 py-0.2 rounded border border-blue-150">ITECH AUTHORIZED DEALER & WORKSHOP</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <h2 className="text-[10px] font-black bg-[#0F2D59]/5 px-2 py-0.5 rounded border border-blue-200 text-[#0F2D59] tracking-wider whitespace-nowrap uppercase">BUKTI SERAH TERIMA UNIT</h2>
                  <p className="text-[8.5px] font-mono mt-0.5 text-[#0f172a] font-bold whitespace-nowrap">NO. WO: {printWO.id}</p>
                </div>
              </div>
            </div>

            {/* DOCUMENT TITLE */}
            <div className="text-center mb-2">
              <h1 className="text-sm font-black text-slate-800 uppercase tracking-tight">SURAT PENYERAHAN BARANG</h1>
              <p className="text-[7.5px] text-slate-500 uppercase font-bold tracking-widest">UNIT HANDOVER RECEIPT & WARRANTY STATEMENT</p>
            </div>

            {/* METADATA GRID */}
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="bg-slate-50/50 border border-slate-200 rounded p-2">
                <h3 className="text-[8px] font-black text-slate-600 uppercase tracking-wider mb-1 border-b pb-0.5">INFORMASI PELANGGAN</h3>
                <TableInfo label="Nama Pelanggan" value={printWO.customerName} />
                <TableInfo label="No. Telepon" value={printWO.customerPhone} />
                <TableInfo label="Alamat Pelanggan" value={printWO.customerAddress || '-'} />
                {printWO.bringerName && <TableInfo label="Nama Pembawa" value={printWO.bringerName} />}
              </div>

              <div className="bg-slate-50/50 border border-slate-200 rounded p-2">
                <h3 className="text-[8px] font-black text-slate-600 uppercase tracking-wider mb-1 border-b pb-0.5">INFORMASI KENDARAAN & WO</h3>
                <TableInfo label="Merek/Tipe" value={printWO.vehicleBrand || '-'} />
                <TableInfo label="No. Polisi" value={printWO.plateNumber || '-'} />
                <TableInfo label="No. Rangka (VIN)" value={printWO.vin || '-'} />
                <TableInfo label="Odometer" value={printWO.odometer ? `${printWO.odometer} km` : '-'} />
                <TableInfo label="Metode Penyerahan" value={printWO.dropMethod === 'PARTS' ? 'HANYA KOMPONEN / PARTS' : 'UNIT UTUH KENDARAAN'} />
              </div>
            </div>

            {/* SUMMARY OF SERVICE */}
            <div className="border border-slate-200 rounded overflow-hidden mb-2">
              <div className="bg-slate-100 px-2.5 py-0.5 border-b border-slate-200">
                <h3 className="text-[8px] font-black text-slate-700 uppercase tracking-wider">DETAIL REKONSILIASI & TINDAKAN PERBAIKAN</h3>
              </div>
              <div className="p-2 space-y-1.5">
                <div>
                  <h4 className="text-[7.5px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Keluhan Pelanggan yang Diselesaikan:</h4>
                  <div className="bg-white border border-slate-100 rounded p-1 text-[8.5px] text-slate-700 whitespace-pre-line leading-snug">
                    {printWO.customerVoice}
                  </div>
                </div>

                {printWO.todoActions && printWO.todoActions.length > 0 && (
                  <div>
                    <h4 className="text-[7.5px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Tindakan Jasa & Suku Cadang:</h4>
                    <table className="w-full text-left text-[8px] border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50">
                          <th className="p-0.5">Item Pekerjaan</th>
                          <th className="p-0.5 text-center w-10">Qty</th>
                          <th className="p-0.5 text-right">Biaya/Estimasi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {printWO.todoActions.slice(0, 4).map((act) => (
                          <tr key={act.id} className="border-b border-slate-100">
                            <td className="p-0.5 font-medium text-slate-800">{act.jenisPengerjaan}</td>
                            <td className="p-0.5 text-center text-slate-600">{act.qty}</td>
                            <td className="p-0.5 text-right text-slate-600 font-mono">{formatRupiah(act.estimasiHarga)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* WARRANTY STATEMENT */}
            <div className="bg-[#0F2D59]/5 border border-blue-200 rounded p-2 mb-2">
              <h3 className="text-[8px] font-black text-[#0F2D59] uppercase tracking-wider mb-0.5">KETENTUAN GARANSI & PERSETUJUAN</h3>
              <p className="text-[8px] text-slate-700 leading-snug">
                Unit/komponen diesel yang diserahkan dalam surat ini dilindungi oleh garansi resmi Indo Teknik Pekanbaru selama <span className="font-bold">{printWO.garansi || '3 Bulan'}</span> terhitung sejak tanggal serah terima. Garansi berlaku apabila segel pengaman tidak rusak dan bukan akibat solar kotor/kontaminasi.
              </p>
            </div>
          </div>

          {/* HANDOVER DATE AND SIGNATURES */}
          <div className="border-t border-slate-200 pt-1.5 shrink-0 print:break-inside-avoid">
            <div className="flex justify-between items-center text-[7.5px] text-slate-500 mb-1 font-mono">
              <span>Waktu Serah Terima: {printWO.handoverDate ? new Date(printWO.handoverDate).toLocaleString('id-ID') : new Date().toLocaleString('id-ID')}</span>
              <span>Dicetak Resmi via Indo Teknik ERP</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center mt-1">
              <div className="border border-slate-200 rounded p-1.5 flex flex-col justify-between h-20">
                <div>
                  <span className="text-[7.5px] font-black text-slate-500 uppercase tracking-wider">PIHAK BENGKEL (INDO TEKNIK)</span>
                  <p className="text-[7px] text-slate-400">Diserahkan Oleh,</p>
                </div>
                <div className="border-t border-slate-300 pt-0.5 mx-auto w-32 text-[8.5px] font-bold text-slate-800">
                  Front Office / Service Advisor
                </div>
              </div>

              <div className="border border-slate-200 rounded p-1.5 flex flex-col justify-between h-20">
                <div>
                  <span className="text-[7.5px] font-black text-slate-500 uppercase tracking-wider">PIHAK PELANGGAN / CUSTOMER</span>
                  <p className="text-[7px] text-slate-400">Diterima Oleh,</p>
                </div>
                <div className="border-t border-slate-300 pt-0.5 mx-auto w-32 text-[8.5px] font-bold text-slate-800 truncate">
                  {printWO.customerName}
                </div>
              </div>
            </div>

            <div className="text-center mt-1.5 text-[7px] text-slate-400 border-t pt-0.5 font-mono">
              Indo Teknik Pekanbaru • Authorized Diesel Specialist • Jl. Riau Ujung No.898-904 Pekanbaru
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- STRICT 2-PAGE PRINT LAYOUT (PAGE 1: INSPECTION SHEET, PAGE 2: WORK ORDER / SPK) ---
  const complaintLines = printWO.customerVoice
    ? printWO.customerVoice
        .split('\n')
        .map(l => l.trim().replace(/^\d+\.\s*/, ''))
        .filter(l => l.length > 0 && !l.includes('[TEMUAN HIDDEN DEFECT]'))
    : [];

  const todoList = printWO.todoActions || [];
  const todoCount = todoList.length;
  const complaintCount = complaintLines.length;
  const hasRepairResults = Boolean(printWO.repairResults && Object.keys(printWO.repairResults).length > 0);

  // Dynamic Density Calculation to prevent Page 2 overflow under high content load
  const isDense = todoCount > 3 || complaintCount > 2 || (todoCount > 2 && hasRepairResults);
  const isUltraDense = todoCount > 5 || (todoCount > 3 && complaintCount > 2);

  // Slice items dynamically so that content NEVER forces a 3rd page
  const maxComplaintsP1 = isDense ? 3 : 4;
  const maxComplaintsP2 = isUltraDense ? 2 : (isDense ? 3 : 4);
  const maxTodosP2 = isUltraDense ? 4 : (isDense ? 5 : 6);

  const displayedTodos = todoList.slice(0, maxTodosP2);
  const remainingTodosCount = todoCount - displayedTodos.length;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-[100] overflow-y-auto print:static print:h-auto print:w-auto print:overflow-visible print:bg-white text-[#0f172a] font-sans">
      <style>{`
        @page {
          size: A4 portrait;
          margin: 5mm 7mm 5mm 7mm !important;
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
            height: 285mm !important;
            max-height: 285mm !important;
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
            height: 285mm !important;
            max-height: 285mm !important;
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
          /* Group signature section with page content */
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

      <div className="max-w-[210mm] mx-auto bg-white p-6 shadow-2xl print:shadow-none print:max-w-none print:w-full print:p-0 print:m-0 print-wrapper">
        {/* ACTION BAR (Hidden in print) */}
        <div className="flex justify-between items-center mb-5 print:hidden no-print border-b pb-3">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setPrintWO(null)} 
              className="px-3.5 py-1.5 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 text-xs font-bold transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Kembali
            </button>
            <div>
              <h2 className="text-base font-extrabold text-slate-800 leading-tight">Cetak Lembar Pemeriksaan & SPK</h2>
              <p className="text-[11px] text-slate-500">Diformat presisi Tepat 2 Halaman A4 (Halaman 1: Customer Copy, Halaman 2: SPK Workshop)</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={() => window.print()} 
              className="px-4 py-2 bg-slate-100 border border-slate-300 text-slate-800 rounded-lg hover:bg-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Simpan PDF
            </button>
            <button 
              onClick={() => window.print()} 
              className="px-4 py-2 bg-[#0F2D59] text-white rounded-lg hover:bg-[#153a6c] text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" /> Cetak 2 Halaman
            </button>
          </div>
        </div>

        {/* ========================================================
            PAGE 1: LEMBAR PEMERIKSAAN / INSPECTION SHEET (CUSTOMER COPY)
            ======================================================== */}
        <div className="print-sheet-1 border-b-4 border-dashed border-slate-300 print:border-none pb-6 print:pb-0 mb-6 print:mb-0 min-h-[280mm] print:min-h-0 flex flex-col justify-between">
          <div className="flex-1 flex flex-col justify-start">
            {/* Header Page 1 */}
            <div className="border-b-2 border-[#0F2D59] pb-1.5 mb-1.5">
              <div className="flex justify-between items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <SmartLogo 
                      baseName="logo-indo-teknik" 
                      alt="IT INDO TEKNIK" 
                      className="h-7 w-auto object-contain flex-shrink-0" 
                      style={{ height: '30px', maxWidth: '140px' }}
                    />
                    <div className="border-l border-slate-300 pl-2 leading-tight text-left">
                      <p className="text-[8px] font-black tracking-widest text-[#0F2D59] uppercase">INDO TEKNIK PEKANBARU</p>
                      <p className="text-[6px] text-slate-500 flex items-center gap-1 mt-0.5"><MapPin className="w-2 h-2 text-red-500 shrink-0" /> Jl. Riau Ujung No.898-904, Pekanbaru</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5 pl-0.5">
                    <SmartLogo 
                      baseName="logo-itech" 
                      alt="ITech" 
                      className="h-3 w-auto object-contain flex-shrink-0" 
                      style={{ height: '12px', maxWidth: '40px' }}
                    />
                    <p className="text-[6px] font-black tracking-widest text-[#0F2D59] whitespace-nowrap bg-blue-50 px-1 py-0.2 rounded border border-blue-100">ITECH AUTHORIZED DEALER & WORKSHOP</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="flex items-center justify-end gap-1">
                    <h2 className="text-[9px] font-black bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300 text-[#0F2D59] tracking-wider whitespace-nowrap uppercase">LEMBAR PEMERIKSAAN (INSPECTION SHEET)</h2>
                    <span className="text-[7px] font-black bg-blue-50 text-blue-800 border border-blue-200 px-1 py-0.5 rounded uppercase">CUSTOMER COPY</span>
                  </div>
                  <div className="flex items-center justify-end gap-1.5 mt-0.5">
                    <p className="text-[8px] font-mono text-[#0f172a] font-bold whitespace-nowrap">NO. WO: <span className="text-[#0F2D59] font-black">{printWO.id}</span></p>
                    {printWO.status === 'COMPLETED' ? (
                      <span className="text-[6.5px] font-extrabold px-1 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">HASIL AKHIR</span>
                    ) : (
                      <span className="text-[6.5px] font-extrabold px-1 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200">ESTIMASI AWAL</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Customer & Vehicle Grid */}
            <div className="grid grid-cols-2 gap-1.5 mb-1.5 text-[7.5px]">
              {/* Customer Info */}
              <div className="border border-slate-200 bg-slate-50/20 rounded p-1.5">
                <div className="grid grid-cols-2 gap-1.5">
                  <div>
                    <h3 className="font-extrabold border-b border-slate-200 pb-0.5 mb-0.5 text-[#0F2D59] text-[7px] uppercase tracking-wider flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-blue-600"></span> Data Pemilik
                    </h3>
                    <div className="grid grid-cols-4 gap-y-0.5 gap-x-0.5 text-[7.5px]">
                      <span className="text-slate-500 col-span-1">Nama:</span> <span className="col-span-3 font-bold text-slate-800 truncate">{printWO.customerName}</span>
                      <span className="text-slate-500 col-span-1">Telp:</span> <span className="col-span-3 text-slate-800 font-mono">{printWO.customerPhone}</span>
                      <span className="text-slate-500 col-span-1">Alamat:</span> <span className="col-span-3 font-medium text-slate-700 truncate">{printWO.customerAddress || '-'}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-extrabold border-b border-slate-200 pb-0.5 mb-0.5 text-[#0F2D59] text-[7px] uppercase tracking-wider flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-slate-500"></span> Data Pembawa
                    </h3>
                    <div className="grid grid-cols-4 gap-y-0.5 gap-x-0.5 text-[7.5px]">
                      <span className="text-slate-500 col-span-1">Nama:</span> <span className="col-span-3 font-bold text-slate-800 truncate">{printWO.bringerName || '-'}</span>
                      <span className="text-slate-500 col-span-1">Telp:</span> <span className="col-span-3 text-slate-800 font-mono">{printWO.bringerPhone || '-'}</span>
                      <span className="text-slate-500 col-span-1">Alamat:</span> <span className="col-span-3 font-medium text-slate-700 truncate">{printWO.bringerAddress || '-'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vehicle / Component Info */}
              <div className="border border-slate-200 bg-slate-50/20 rounded p-1.5">
                <h3 className="font-extrabold border-b border-slate-200 pb-0.5 mb-0.5 text-[#0F2D59] text-[7px] uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-red-600"></span> Detail Kendaraan / Komponen
                </h3>
                {printWO.dropMethod === 'WHOLE' && printWO.fuelLevel ? (
                  <div className="grid grid-cols-12 gap-1">
                    <div className="col-span-8 grid grid-cols-3 gap-y-0.5 gap-x-0.5 text-[7.5px] text-slate-800 items-center">
                      <span className="text-slate-500">Model:</span> <span className="col-span-2 font-bold text-slate-900 truncate">{printWO.vehicleBrand}</span>
                      <span className="text-slate-500">No. Pol:</span> <span className="col-span-2 font-black text-[#0F2D59] font-mono bg-blue-50 px-1 py-0.2 rounded border border-blue-100 inline-block w-fit text-[7px]">{printWO.plateNumber}</span>
                      <span className="text-slate-500">VIN:</span> <span className="col-span-2 font-mono text-slate-700 truncate">{printWO.vin || '-'}</span>
                      <span className="text-slate-500">Odo/HM:</span> <span className="col-span-2 font-semibold text-slate-800">{printWO.odometer}</span>
                    </div>
                    <div className="col-span-4 flex flex-col items-center justify-center border-l border-dashed border-slate-300 pl-1">
                      <span className="text-[6px] font-mono text-slate-400 uppercase tracking-widest font-bold">BBM</span>
                      <FuelGauge level={printWO.fuelLevel} theme="print" size="xs" className="border-none bg-transparent p-0 w-full" />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-y-0.5 gap-x-0.5 text-[7.5px] text-slate-800">
                    <span className="text-slate-500">Model:</span> <span className="col-span-2 font-bold text-slate-900">{printWO.vehicleBrand}</span>
                    <span className="text-slate-500">No. Pol:</span> <span className="col-span-2 font-black text-[#0F2D59] font-mono bg-blue-50 px-1 rounded inline-block w-fit">{printWO.plateNumber}</span>
                    <span className="text-slate-500">No. Rangka:</span> <span className="col-span-2 font-mono">{printWO.vin || '-'}</span>
                    <span className="text-slate-500">Odo / HM:</span> <span className="col-span-2 font-semibold text-slate-800">{printWO.odometer}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Operational Meta Row */}
            <div className="bg-blue-50/20 px-2 py-0.5 border border-blue-100 rounded text-[7.5px] flex justify-between items-center mb-1.5">
              <div className="flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-emerald-500 shrink-0"></span>
                <span className="font-semibold text-slate-500">Waktu Masuk:</span>{' '}
                <span className="font-mono font-bold text-[#0F2D59]">
                  {printWO.intakeDate ? new Date(printWO.intakeDate).toLocaleString('id-ID') : '-'}
                </span>
              </div>
              <div className="flex gap-2.5 text-[7.5px]">
                <div className="flex gap-1">
                  <span className="font-semibold text-slate-500">Estimasi Selesai:</span>{' '}
                  <span className="text-[#0F2D59] font-bold">{printWO.estimasiPengerjaan || '-'}</span>
                </div>
                <div className="flex gap-1 border-l border-slate-300 pl-2.5">
                  <span className="font-semibold text-slate-500">Garansi:</span>{' '}
                  <span className="text-emerald-700 font-bold">{printWO.garansi || '-'}</span>
                </div>
              </div>
            </div>

            {/* Primary Complaint (Customer Voice) */}
            {complaintLines.length > 0 && (
              <div className="mb-1.5">
                <h3 className="font-bold bg-slate-100 px-1.5 py-0.5 border border-slate-300 text-[#0F2D59] text-[7.5px] uppercase tracking-wider">
                  KELUHAN UTAMA PELANGGAN (CUSTOMER VOICE)
                </h3>
                <table className="w-full border-collapse border border-slate-300 text-[7.5px]">
                  <thead>
                    <tr className="bg-slate-50 text-[7px] uppercase text-slate-700">
                      <th className="border border-slate-300 py-0.5 text-center w-[6%] font-bold">NO</th>
                      <th className="border border-slate-300 py-0.5 text-left w-[94%] font-bold px-1.5">DESKRIPSI KELUHAN</th>
                    </tr>
                  </thead>
                  <tbody>
                    {complaintLines.slice(0, maxComplaintsP1).map((line, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                        <td className="border border-slate-300 py-0.5 text-center font-bold">{idx + 1}</td>
                        <td className="border border-slate-300 py-0.5 px-1.5 italic text-slate-800">{line}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Damage & Inventory / Component Serialization */}
            {printWO.dropMethod === 'WHOLE' ? (
              <div className="grid grid-cols-2 gap-1.5 mb-1.5">
                {/* Damage Outlines summary */}
                <div>
                  <h3 className="font-bold bg-slate-100 px-1.5 py-0.5 border border-slate-300 text-[#0F2D59] text-[7.5px]">Kondisi Fisik / Visual Damage</h3>
                  <div className="border border-t-0 border-slate-300 p-1 min-h-[30px] text-[7px]">
                    {printWO.damages.length === 0 ? (
                      <p className="text-slate-500 italic text-center mt-1">Tidak ada catatan baret/rusak eksterior.</p>
                    ) : (
                      <div className="space-y-0.5 max-h-[44px] overflow-hidden">
                        {printWO.damages.slice(0, 3).map(d => {
                          const partLabel = d.partId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                          return (
                            <div key={d.partId} className="bg-red-50 border border-red-200 px-1 py-0.2 rounded text-slate-800">
                              <strong>{partLabel}</strong>: {d.description || 'Ada baret / retak'}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Inventory Checklist */}
                <div>
                  <h3 className="font-bold bg-slate-100 px-1.5 py-0.5 border border-slate-300 text-[#0F2D59] text-[7.5px]">Inventory Checklist</h3>
                  <div className="border border-t-0 border-slate-300 p-1 min-h-[30px]">
                    <div className="grid grid-cols-2 gap-x-1 gap-y-0.5 text-[6.5px]">
                      {printWO.inventory.slice(0, 10).map(item => (
                        <div key={item.name} className="flex items-center">
                          <div className={`w-1.5 h-1.5 border border-slate-500 mr-1 flex items-center justify-center ${item.checked ? 'bg-slate-800' : ''}`}>
                            {item.checked && <span className="text-white text-[5px]">✓</span>}
                          </div>
                          <span className={item.checked ? 'font-semibold text-slate-900' : 'text-slate-400 truncate'}>{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              printWO.looseParts && printWO.looseParts.length > 0 && (
                <div className="mb-1.5">
                  <h3 className="font-bold bg-slate-100 px-1.5 py-0.5 border border-slate-300 text-[#0F2D59] text-[7.5px] uppercase tracking-wider">
                    SERIALISASI KOMPONEN COPOTAN (LOOSE PARTS)
                  </h3>
                  <table className="w-full border-collapse border border-slate-300 text-[7.5px]">
                    <thead>
                      <tr className="bg-slate-50 text-[7px]">
                        <th className="border border-slate-300 py-0.5 text-left w-1/3 font-semibold px-1.5">Keterangan</th>
                        <th className="border border-slate-300 py-0.5 text-left w-1/3 font-semibold px-1.5">Part Number (P/N)</th>
                        <th className="border border-slate-300 py-0.5 text-left w-1/3 font-semibold px-1.5">Kondisi Fisik</th>
                      </tr>
                    </thead>
                    <tbody>
                      {printWO.looseParts.slice(0, 3).map((part, i) => (
                        <tr key={part.id || i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                          <td className="border border-slate-300 py-0.5 font-semibold text-slate-800 px-1.5">{part.description || '-'}</td>
                          <td className="border border-slate-300 py-0.5 font-mono text-slate-800 px-1.5">{part.partNumber || '-'}</td>
                          <td className="border border-slate-300 py-0.5 text-slate-800 px-1.5">{part.physicalCondition}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </div>

          {/* Signatures & Footer Page 1 (Strictly grouped with bottom of Page 1) */}
          <div className="print-signature-group border-t border-slate-300 pt-1 mt-auto shrink-0">
            <div className="flex items-center justify-between gap-2.5">
              <div className="flex-1 grid grid-cols-4 gap-1.5 text-center text-[7px]">
                <div>
                  <div className="h-8 border-b border-slate-400 mb-0.5"></div>
                  <p className="font-bold text-[#0f172a]">Tanda Tangan Pelanggan</p>
                </div>
                <div>
                  <div className="h-8 border-b border-slate-400 mb-0.5"></div>
                  <p className="font-bold text-[#0f172a]">Mekanik Tester</p>
                </div>
                <div>
                  <div className="h-8 border-b border-slate-400 mb-0.5"></div>
                  <p className="font-bold text-[#0f172a]">Service Advisor (SA)</p>
                </div>
                <div>
                  <div className="h-8 border-b border-slate-400 mb-0.5"></div>
                  <p className="font-bold text-[#0f172a]">Foreman</p>
                </div>
              </div>
              
              <div className="w-[1px] h-11 bg-slate-200 shrink-0"></div>
              
              <div className="w-36 flex-shrink-0 flex items-center gap-1 border border-blue-100 bg-blue-50/20 p-1 rounded">
                <div className="p-0.5 bg-white rounded border border-slate-200 shrink-0 flex items-center justify-center">
                  <QRCodeSVG
                    value={baseTrackingUrl + '/?tracking=' + printWO.id}
                    size={42}
                    level="L"
                    includeMargin={false}
                  />
                </div>
                <div className="text-left leading-tight">
                  <p className="text-[6.5px] font-black text-[#0F2D59] uppercase tracking-wider">LIVE TRACKING</p>
                  <p className="text-[5px] text-slate-500 font-medium leading-tight mt-0.5">Scan status real-time.</p>
                  <p className="text-[5.5px] font-mono font-bold text-blue-700 mt-0.5">{printWO.id}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center text-[6.5px] text-slate-400 border-t border-slate-200 pt-0.5 mt-0.5 font-mono">
              <span>Indo Teknik Pekanbaru • Jl. Riau Ujung No.898-904 Pekanbaru</span>
              <span>Dokumen Pemeriksaan Resmi • Halaman 1 dari 2</span>
            </div>
          </div>
        </div>


        {/* ========================================================
            PAGE 2: SURAT PERINTAH KERJA / SPK (INTERNAL WORKSHOP COPY)
            Strictly grouped layout with dynamic density adaptation
            ======================================================== */}
        <div className="print-sheet-2 min-h-[280mm] print:min-h-0 flex flex-col justify-between">
          <div className="flex-1 flex flex-col justify-start min-h-0">
            {/* Header Page 2 */}
            <div className="border-b-2 border-[#0F2D59] pb-1.5 mb-1.5">
              <div className="flex justify-between items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <SmartLogo 
                      baseName="logo-indo-teknik" 
                      alt="IT INDO TEKNIK" 
                      className="h-7 w-auto object-contain flex-shrink-0" 
                      style={{ height: '30px', maxWidth: '140px' }}
                    />
                    <div className="border-l border-slate-300 pl-2 leading-tight text-left">
                      <p className="text-[8px] font-black tracking-widest text-[#0F2D59] uppercase">INDO TEKNIK PEKANBARU</p>
                      <p className="text-[6px] text-slate-500 flex items-center gap-1 mt-0.5"><MapPin className="w-2 h-2 text-red-500 shrink-0" /> Jl. Riau Ujung No.898-904, Pekanbaru</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5 pl-0.5">
                    <SmartLogo 
                      baseName="logo-itech" 
                      alt="ITech" 
                      className="h-3 w-auto object-contain flex-shrink-0" 
                      style={{ height: '12px', maxWidth: '40px' }}
                    />
                    <p className="text-[6px] font-black tracking-widest text-[#0F2D59] whitespace-nowrap bg-blue-50 px-1 py-0.2 rounded border border-blue-100">ITECH AUTHORIZED DEALER & WORKSHOP</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="flex items-center justify-end gap-1">
                    <h2 className="text-[9px] font-black bg-[#0F2D59] text-white px-1.5 py-0.5 rounded tracking-wider whitespace-nowrap uppercase">SURAT PERINTAH KERJA (SPK)</h2>
                    <span className="text-[7px] font-black bg-slate-100 text-slate-800 border border-slate-300 px-1 py-0.5 rounded uppercase">WORKSHOP COPY</span>
                  </div>
                  <div className="flex items-center justify-end gap-1.5 mt-0.5">
                    <p className="text-[8px] font-mono text-[#0f172a] font-bold whitespace-nowrap">NO. WO: <span className="text-[#0F2D59] font-black">{printWO.id}</span></p>
                    {printWO.priority === 1 && <span className="text-[6.5px] font-black px-1 py-0.2 rounded bg-red-100 text-red-800 border border-red-200">P1: URGENT</span>}
                    {printWO.priority === 2 && <span className="text-[6.5px] font-black px-1 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-200">P2: BOOKING</span>}
                    {printWO.priority === 3 && <span className="text-[6.5px] font-black px-1 py-0.2 rounded bg-blue-100 text-blue-800 border border-blue-200">P3: REGULAR</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Customer & Technical Profile */}
            <div className="grid grid-cols-2 gap-1.5 mb-1.5 text-[7.5px]">
              <div className="border border-slate-200 bg-slate-50/20 rounded p-1.5">
                <div className="grid grid-cols-2 gap-1.5">
                  <div>
                    <h3 className="font-extrabold border-b border-slate-200 pb-0.5 mb-0.5 text-[#0F2D59] text-[7px] uppercase tracking-wider">Data Pemilik</h3>
                    <div className="grid grid-cols-4 gap-y-0.5 gap-x-0.5 text-[7.5px]">
                      <span className="text-slate-500 col-span-1">Nama:</span> <span className="col-span-3 font-bold text-slate-800 truncate">{printWO.customerName}</span>
                      <span className="text-slate-500 col-span-1">Telp:</span> <span className="col-span-3 text-slate-800 font-mono">{printWO.customerPhone}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-extrabold border-b border-slate-200 pb-0.5 mb-0.5 text-[#0F2D59] text-[7px] uppercase tracking-wider">Data Pembawa</h3>
                    <div className="grid grid-cols-4 gap-y-0.5 gap-x-0.5 text-[7.5px]">
                      <span className="text-slate-500 col-span-1">Nama:</span> <span className="col-span-3 font-bold text-slate-800 truncate">{printWO.bringerName || '-'}</span>
                      <span className="text-slate-500 col-span-1">Telp:</span> <span className="col-span-3 text-slate-800 font-mono">{printWO.bringerPhone || '-'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 bg-slate-50/20 rounded p-1.5">
                <h3 className="font-extrabold border-b border-slate-200 pb-0.5 mb-0.5 text-[#0F2D59] text-[7px] uppercase tracking-wider">Identitas Teknis Unit</h3>
                <div className="grid grid-cols-3 gap-y-0.5 gap-x-0.5 text-[7.5px]">
                  <span className="text-slate-500">Merek/Tipe:</span> <span className="col-span-2 font-bold text-slate-900 truncate">{printWO.vehicleBrand}</span>
                  <span className="text-slate-500">No. Pol:</span> <span className="col-span-2 font-black text-[#0F2D59] font-mono bg-blue-50 px-1 rounded inline-block w-fit text-[7px]">{printWO.plateNumber || '-'}</span>
                  <span className="text-slate-500">No. Rangka:</span> <span className="col-span-2 font-mono text-slate-700 truncate">{printWO.vin || '-'}</span>
                </div>
              </div>
            </div>

            {/* Rangkuman Hasil Perbaikan (Before vs After) */}
            {complaintLines.length > 0 && (
              <div className="mb-1.5">
                <h3 className="font-bold bg-[#0F2D59] text-white px-1.5 py-0.5 border border-[#0F2D59] text-[7.5px] uppercase tracking-wider">
                  RANGKUMAN HASIL PERBAIKAN (BEFORE VS AFTER)
                </h3>
                <table className="w-full border-collapse border border-slate-300 text-[7.5px]">
                  <thead>
                    <tr className="bg-slate-100 text-[7px] font-bold uppercase text-slate-700">
                      <th className="border border-slate-300 py-0.5 text-center w-[6%] font-bold">NO</th>
                      <th className="border border-slate-300 py-0.5 text-left w-[54%] font-bold px-1.5">KELUHAN / SEBELUM (BEFORE)</th>
                      <th className="border border-slate-300 py-0.5 text-left w-[40%] font-bold px-1.5">TINDAKAN / SESUDAH (AFTER)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {complaintLines.slice(0, maxComplaintsP2).map((line, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                        <td className="border border-slate-300 py-0.5 text-center font-bold">{idx + 1}</td>
                        <td className="border border-slate-300 py-0.5 px-1.5 font-bold text-slate-800">{line}</td>
                        <td className="border border-slate-300 py-0.5 px-1.5 font-bold text-blue-900 bg-blue-50/10">
                          {printWO.repairResults?.[idx] || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Action & Parts To-Do Builder */}
            {todoList.length > 0 && (
              <div className="mb-1.5">
                <h3 className="font-bold bg-[#0F2D59] text-white px-1.5 py-0.5 border border-[#0F2D59] text-[7.5px] uppercase tracking-wider">
                  DAFTAR TINDAKAN & RENCANA SUKU CADANG (TO-DO LIST)
                </h3>
                <table className="w-full border-collapse border border-slate-300 text-[7.5px]">
                  <thead>
                    <tr className="bg-slate-100 text-[7px]">
                      <th className="border border-slate-300 py-0.5 text-left font-bold px-1.5">JENIS PENGERJAAN</th>
                      <th className="border border-slate-300 py-0.5 text-center w-8 font-bold">QTY</th>
                      {todoList.some(a => a.catatanMekanik) && (
                        <th className="border border-slate-300 py-0.5 text-left font-bold px-1.5">CATATAN</th>
                      )}
                      <th className="border border-slate-300 py-0.5 text-right w-24 font-bold px-1.5">ESTIMASI BIAYA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedTodos.map((action) => (
                      <tr key={action.id}>
                        <td className="border border-slate-300 py-0.5 px-1.5 font-medium">{action.jenisPengerjaan || '-'}</td>
                        <td className="border border-slate-300 py-0.5 text-center font-bold">{action.qty}</td>
                        {todoList.some(a => a.catatanMekanik) && (
                          <td className="border border-slate-300 py-0.5 px-1.5 text-slate-600 truncate max-w-[120px]">{action.catatanMekanik || '-'}</td>
                        )}
                        <td className="border border-slate-300 py-0.5 px-1.5 font-bold text-right font-mono">
                          {action.estimasiHargaMin || action.estimasiHargaMax ? (
                            <>
                              {action.estimasiHargaMin ? formatRupiah(action.estimasiHargaMin) : 'Rp 0'} 
                              <span className="text-[6.5px] text-slate-400 font-normal mx-0.5">s/d</span> 
                              {action.estimasiHargaMax ? formatRupiah(action.estimasiHargaMax) : 'Rp 0'}
                            </>
                          ) : (
                            formatRupiah(action.estimasiHarga) || 'Rp 0'
                          )}
                        </td>
                      </tr>
                    ))}
                    {remainingTodosCount > 0 && (
                      <tr className="bg-blue-50/20 italic text-[6.5px] text-slate-600">
                        <td colSpan={todoList.some(a => a.catatanMekanik) ? 3 : 2} className="border border-slate-300 py-0.2 px-1.5">
                          + {remainingTodosCount} rincian item pekerjaan tambahan tercatat dalam sistem digital...
                        </td>
                        <td className="border border-slate-300 py-0.2 px-1.5 text-right font-bold text-slate-700">Tercakup</td>
                      </tr>
                    )}
                    {/* Total Row */}
                    <tr className="bg-slate-50 font-bold">
                      <td colSpan={todoList.some(a => a.catatanMekanik) ? 2 : 1} className="border border-slate-300 py-0.5 px-1.5 text-right text-[7.5px]">TOTAL ESTIMASI BIAYA</td>
                      <td className="border border-slate-300 py-0.5 px-1.5 text-center text-[7px] text-slate-600 font-mono">
                        {todoList.reduce((sum, item) => sum + (parseInt(String(item.qty), 10) || 1), 0)} unit
                      </td>
                      <td className="border border-slate-300 py-0.5 px-1.5 text-right font-mono text-[7.5px] text-[#0F2D59]">
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
                          return 'Rp ' + totalMin.toLocaleString('id-ID');
                        })()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* Terms and Conditions (Ultra-compact 2 column layout) */}
            <div className="mb-1.5 text-[4pt] leading-[1.08] text-slate-600 text-justify border border-slate-200 p-1 rounded bg-slate-50/10">
              <p className="font-extrabold uppercase text-[#0F2D59] text-[4.5pt] tracking-wider text-center border-b pb-0.5 mb-0.5">SYARAT DAN KETENTUAN PERINTAH KERJA (SPK)</p>
              <div className="grid grid-cols-2 gap-x-2 gap-y-0.2">
                <div className="space-y-0.2">
                  <p><strong>1.</strong> Unit diserahkan untuk diagnosa, kalibrasi & perbaikan diesel sesuai keluhan pelanggan.</p>
                  <p><strong>2.</strong> Pelanggan memberi kuasa penuh pembongkaran guna diagnosa laboratorium.</p>
                  <p><strong>3.</strong> Kerusakan tersembunyi (hidden defect) baru akan dikonfirmasi sebelum pengerjaan.</p>
                  <p><strong>4.</strong> Penambahan suku cadang/jasa baru akan menambah estimasi biaya sesuai kesepakatan.</p>
                  <p><strong>5.</strong> Pembatalan sepihak setelah bongkar membebaskan bengkel dari tuntutan performa awal.</p>
                  <p><strong>6.</strong> Jasa diagnosa & pembongkaran yang telah berjalan tetap wajib dibayarkan pelanggan.</p>
                  <p><strong>7.</strong> Bengkel tidak bertanggung jawab atas kerusakan awal yang telah ada sebelum serah terima.</p>
                </div>
                <div className="space-y-0.2">
                  <p><strong>8.</strong> Bengkel berhak melakukan tes bangku (test bench) dan uji fungsi sesuai standar SOP.</p>
                  <p><strong>9.</strong> Unit selesai wajib diambil maks 30 hari kalender setelah pemberitahuan dari SA.</p>
                  <p><strong>10.</strong> Pelanggan wajib memeriksa fisik & kelengkapan saat serah terima kembali barang.</p>
                  <p><strong>11.</strong> Barang berharga tertinggal di kendaraan bukan tanggung jawab pihak bengkel.</p>
                  <p><strong>12.</strong> Garansi berlaku sesuai masa garansi dengan syarat segel utuh dan solar bersih.</p>
                  <p><strong>13.</strong> SPK ini merupakan bukti resmi pengambilan unit dan wajib ditunjukkan.</p>
                  <p><strong>14.</strong> Penandatanganan dokumen ini menandakan persetujuan mutlak atas seluruh klausul.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Signatures & Footer Page 2 (Guaranteed grouped with Service Data on Page 2) */}
          <div className="print-signature-group border-t border-slate-300 pt-1 mt-auto shrink-0">
            <div className="flex items-center justify-between gap-2.5">
              <div className="flex-1 grid grid-cols-4 gap-1.5 text-center text-[7px]">
                <div>
                  <div className="h-8 border-b border-slate-400 mb-0.5"></div>
                  <p className="font-bold text-[#0f172a]">Tanda Tangan Pelanggan</p>
                </div>
                <div>
                  <div className="h-8 border-b border-slate-400 mb-0.5"></div>
                  <p className="font-bold text-[#0f172a]">Mekanik / Tester</p>
                </div>
                <div>
                  <div className="h-8 border-b border-slate-400 mb-0.5"></div>
                  <p className="font-bold text-[#0f172a]">Service Advisor (SA)</p>
                </div>
                <div>
                  <div className="h-8 border-b border-slate-400 mb-0.5"></div>
                  <p className="font-bold text-[#0f172a]">Foreman / Ka. Bengkel</p>
                </div>
              </div>
              
              <div className="w-[1px] h-11 bg-slate-200 shrink-0"></div>
              
              <div className="w-36 flex-shrink-0 flex items-center gap-1 border border-blue-100 bg-blue-50/20 p-1 rounded">
                <div className="p-0.5 bg-white rounded border border-slate-200 shrink-0 flex items-center justify-center">
                  <QRCodeSVG
                    value={baseTrackingUrl + '/?tracking=' + printWO.id}
                    size={42}
                    level="L"
                    includeMargin={false}
                  />
                </div>
                <div className="text-left leading-tight">
                  <p className="text-[6.5px] font-black text-[#0F2D59] uppercase tracking-wider">LIVE TRACKING</p>
                  <p className="text-[5px] text-slate-500 font-medium leading-tight mt-0.5">Scan status real-time.</p>
                  <p className="text-[5.5px] font-mono font-bold text-blue-700 mt-0.5">{printWO.id}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center text-[6.5px] text-slate-400 border-t border-slate-200 pt-0.5 mt-0.5 font-mono">
              <span>Indo Teknik Pekanbaru • Jl. Riau Ujung No.898-904 Pekanbaru</span>
              <span>Dokumen SPK Bengkel Resmi • Halaman 2 dari 2</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintTemplate;
