import React from 'react';
import { useApp } from '../store/AppContext';
import { Printer, Download, ArrowLeft, Mail, Phone, Globe, MapPin } from 'lucide-react';
import { SmartLogo } from './SmartLogo';
import { QRCodeSVG } from 'qrcode.react';

const formatRupiah = (value: string | number | undefined | null): string => {
  if (value === undefined || value === null) return '';
  const str = String(value).replace(/\D/g, '');
  if (!str) return '';
  const num = parseInt(str, 10);
  return 'Rp ' + num.toLocaleString('id-ID');
};

const PrintTemplate: React.FC = () => {
  const { printWO, setPrintWO, printType, trackingBaseUrl } = useApp();

  if (!printWO) return null;

  const baseTrackingUrl = trackingBaseUrl || 'https://it-erp-app.web.app';

  const TableInfo = ({ label, value }: { label: string; value: string }) => (
    <div className="flex justify-between py-1.5 border-b border-dashed border-slate-200 text-xs">
      <span className="text-slate-500 font-medium">{label}</span>
      <span className="text-slate-800 font-bold text-right">{value}</span>
    </div>
  );

  if (printType === 'HANDOVER') {
    return (
      <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-[100] overflow-y-auto print:static print:h-auto print:w-auto print:overflow-visible print:bg-white text-[#0f172a] font-sans">
        <style>{`
          @media print {
            body {
              background-color: white !important;
              color: #0f172a !important;
            }
            .no-print {
              display: none !important;
            }
            .print-page {
              padding: 8mm 6mm !important;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
        `}</style>
        <div className="max-w-[210mm] mx-auto bg-white p-8 shadow-2xl print:shadow-none print:max-w-none print:w-full print:p-[10mm] print:m-0 min-h-screen flex flex-col justify-between">
          <div>
            {/* ACTION BAR (Hidden in print) */}
            <div className="flex justify-between items-center mb-8 print:hidden no-print border-b pb-4">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setPrintWO(null)} 
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700 flex items-center gap-2 font-bold transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> Kembali
                </button>
                <div>
                  <h2 className="text-lg font-extrabold text-slate-800 leading-tight">Cetak Bukti Penyerahan Barang (Handover Receipt)</h2>
                  <p className="text-xs text-slate-500">Pratinjau sebelum cetak atau ekspor PDF</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <button 
                  onClick={() => window.print()} 
                  className="px-5 py-2.5 bg-slate-100 border border-slate-300 text-slate-800 rounded-lg hover:bg-slate-200 font-bold flex items-center gap-2 transition-colors shadow-xs cursor-pointer"
                  title="Pilih 'Save as PDF' di bagian Destination pada dialog Print"
                >
                  <Download className="w-4 h-4" /> Simpan PDF
                </button>
                <button 
                  onClick={() => window.print()} 
                  className="px-6 py-2.5 bg-[#0F2D59] text-white rounded-lg hover:bg-[#153a6c] font-bold flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> Cetak Bukti Serah
                </button>
              </div>
            </div>

            {/* HEADER AREA */}
            <div className="border-b-4 border-[#0F2D59] pb-4 mb-6">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <SmartLogo 
                      baseName="logo-indo-teknik" 
                      alt="IT INDO TEKNIK" 
                      className="h-10 w-auto object-contain flex-shrink-0" 
                      style={{ height: '42px', maxWidth: '180px' }}
                    />
                    <div className="border-l-2 border-slate-300 pl-3 leading-tight text-left">
                      <p className="text-[9px] font-black tracking-widest text-[#0F2D59] uppercase">INDO TEKNIK PEKANBARU</p>
                      <p className="text-[7.5px] text-slate-500 flex items-center gap-1 mt-0.5"><MapPin className="w-2.5 h-2.5 text-[#E21F26] shrink-0" /> Jl. Riau Ujung No.898-904, Pekanbaru</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2 pl-1">
                    <SmartLogo 
                      baseName="logo-itech" 
                      alt="ITech" 
                      className="h-5 w-auto object-contain flex-shrink-0" 
                      style={{ height: '20px', maxWidth: '60px' }}
                    />
                    <p className="text-[7.5px] font-black tracking-widest text-[#0F2D59] whitespace-nowrap bg-blue-50 px-1.5 py-0.5 rounded border border-blue-150">ITECH AUTHORIZED DEALER & WORKSHOP</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <h2 className="text-sm font-black bg-[#0F2D59]/5 px-3 py-1.5 rounded border border-blue-200 text-[#0F2D59] tracking-wider whitespace-nowrap uppercase">BUKTI SERAH TERIMA UNIT</h2>
                  <p className="text-[10px] font-mono mt-1 text-[#0f172a] font-bold whitespace-nowrap">NO. WO: {printWO.id}</p>
                </div>
              </div>
            </div>

            {/* DOCUMENT TITLE & INTRO */}
            <div className="text-center mb-6">
              <h1 className="text-xl font-black text-slate-800 uppercase tracking-tight">SURAT PENYERAHAN BARANG</h1>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-1">UNIT HANDOVER RECEIPT & WARRANTY STATEMENT</p>
              <div className="w-24 h-1 bg-[#E21F26] mx-auto mt-2"></div>
            </div>

            {/* METADATA GRID */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              {/* Customer Info */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2 border-b pb-1">INFORMASI PELANGGAN</h3>
                <TableInfo label="Nama Pelanggan" value={printWO.customerName} />
                <TableInfo label="No. Telepon" value={printWO.customerPhone} />
                <TableInfo label="Alamat Pelanggan" value={printWO.customerAddress || '-'} />
                {printWO.bringerName && <TableInfo label="Nama Pembawa" value={printWO.bringerName} />}
              </div>

              {/* Vehicle & WO Info */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2 border-b pb-1">INFORMASI KENDARAAN & WO</h3>
                <TableInfo label="Merek/Tipe" value={printWO.vehicleBrand || '-'} />
                <TableInfo label="No. Polisi" value={printWO.plateNumber || '-'} />
                <TableInfo label="No. Rangka (VIN)" value={printWO.vin || '-'} />
                <TableInfo label="Odometer" value={printWO.odometer ? `${printWO.odometer} km` : '-'} />
                <TableInfo label="Metode Penyerahan" value={printWO.dropMethod === 'PARTS' ? 'HANYA KOMPONEN / PARTS' : 'UNIT UTUH KENDARAAN'} />
              </div>
            </div>

            {/* SUMMARY OF SERVICE */}
            <div className="border border-slate-200 rounded-lg overflow-hidden mb-6">
              <div className="bg-slate-100 px-4 py-2 border-b border-slate-200">
                <h3 className="text-[10px] font-black text-slate-700 uppercase tracking-wider">DETAIL REKONSILIASI & TINDAKAN PERBAIKAN</h3>
              </div>
              <div className="p-4 space-y-4">
                {/* Voice / Symptoms worked on */}
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Keluhan Pelanggan yang Diselesaikan:</h4>
                  <div className="bg-white border border-slate-100 rounded p-2 text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                    {printWO.customerVoice}
                  </div>
                </div>

                {/* Scope of Actions performed */}
                {printWO.todoActions && printWO.todoActions.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Tindakan Jasa & Suku Cadang:</h4>
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50">
                          <th className="p-2">Item Pekerjaan</th>
                          <th className="p-2 text-center w-20">Qty</th>
                          <th className="p-2 text-right">Biaya/Estimasi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {printWO.todoActions.map((act) => (
                          <tr key={act.id} className="border-b border-slate-100">
                            <td className="p-2 font-medium text-slate-800">{act.jenisPengerjaan}</td>
                            <td className="p-2 text-center text-slate-600">{act.qty}</td>
                            <td className="p-2 text-right text-slate-600">{formatRupiah(act.estimasiHarga)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* COMPONENT PARTS HANDED OVER */}
            <div className="border border-slate-200 rounded-lg overflow-hidden mb-6">
              <div className="bg-slate-100 px-4 py-2 border-b border-slate-200">
                <h3 className="text-[10px] font-black text-slate-700 uppercase tracking-wider">KOMPONEN YANG DISERAHKAN KEMBALI</h3>
              </div>
              <div className="p-4">
                {printWO.dropMethod === 'PARTS' ? (
                  <div className="grid grid-cols-2 gap-4">
                    {printWO.partsTracking && printWO.partsTracking.length > 0 ? (
                      <div>
                        <h4 className="text-[10px] font-black text-slate-500 uppercase mb-2">Injector/Nozzle Diesel:</h4>
                        <ul className="space-y-1.5 text-xs text-slate-700">
                           {printWO.partsTracking.map((part) => (
                            <li key={part.id} className="flex items-center gap-2 bg-slate-50 px-2 py-1.5 rounded border border-slate-150">
                              <span className="w-2 h-2 rounded-full bg-[#E21F26]"></span>
                              <span className="font-bold">{part.cylinderNo}:</span> S/N {part.serialNumber || '-'} (Solenoid: {part.solenoidCondition})
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    {printWO.looseParts && printWO.looseParts.length > 0 ? (
                      <div>
                        <h4 className="text-[10px] font-black text-slate-500 uppercase mb-2">Komponen Terurai Lainnya:</h4>
                        <ul className="space-y-1.5 text-xs text-slate-700">
                          {printWO.looseParts.map((part) => (
                            <li key={part.id} className="flex items-center gap-2 bg-slate-50 px-2 py-1.5 rounded border border-slate-150">
                              <span className="w-2 h-2 rounded-full bg-[#0F2D59]"></span>
                              <span className="font-bold">{part.description}</span> - P/N {part.partNumber || '-'} ({part.physicalCondition})
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="text-xs text-slate-700 leading-relaxed">
                    <p className="font-bold mb-1 flex items-center gap-1.5 text-slate-800"><span className="w-2.5 h-2.5 rounded-full bg-[#E21F26]"></span> Unit Kendaraan Utuh ({printWO.vehicleBrand})</p>
                    <p className="pl-4 text-slate-500">Telah diserahkan kembali dalam kondisi perbaikan selesai, telah di-test drive oleh mekanik/foreman Indo Teknik, dan seluruh inventaris awal telah dicocokkan kembali secara lengkap.</p>
                  </div>
                )}
              </div>
            </div>

            {/* WARRANTY STATEMENT */}
            <div className="bg-[#0F2D59]/5 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="text-[10px] font-black text-[#0F2D59] uppercase tracking-wider mb-1">KETENTUAN GARANSI & PERSETUJUAN</h3>
              <p className="text-[10.5px] text-slate-800 leading-relaxed">
                Unit/komponen diesel yang diserahkan dalam surat ini dilindungi oleh garansi resmi Indo Teknik Pekanbaru selama <span className="font-bold">{printWO.garansi || '3 Bulan'}</span> terhitung sejak tanggal serah terima di bawah ini. Garansi berlaku apabila segel pengaman tidak rusak/copot dan kerusakan bukan diakibatkan oleh kontaminasi kualitas bahan bakar solar yang buruk.
              </p>
            </div>
          </div>

          {/* HANDOVER DATE AND SIGNATURES */}
          <div>
            <div className="flex justify-between items-center text-xs text-slate-500 mb-2 font-mono">
              <span>Waktu Serah Terima: {printWO.handoverDate ? new Date(printWO.handoverDate).toLocaleString('id-ID') : new Date().toLocaleString('id-ID')}</span>
              <span>Dicetak Secara Digital</span>
            </div>

            <div className="grid grid-cols-2 gap-6 text-center mt-6">
              <div className="border border-slate-200 rounded-lg p-4 flex flex-col justify-between h-36">
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">PIHAK BENGKEL (INDO TEKNIK)</span>
                  <p className="text-[9px] text-slate-400">Diserahkan Oleh,</p>
                </div>
                <div className="border-t border-slate-300 pt-2 mx-auto w-48 text-xs font-bold text-slate-800">
                  Front Office / Service Advisor
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg p-4 flex flex-col justify-between h-36">
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">PIHAK PELANGGAN / CUSTOMER</span>
                  <p className="text-[9px] text-slate-400">Diterima Oleh,</p>
                </div>
                <div className="border-t border-slate-300 pt-2 mx-auto w-48 text-xs font-bold text-slate-800">
                  {printWO.customerName}
                </div>
              </div>
            </div>

            <div className="text-center mt-8 text-[9px] text-slate-400 border-t pt-4 font-mono">
              Indo Teknik Pekanbaru • Authorized Diesel Service Specialist • Terimakasih Atas Kepercayaan Anda
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-[100] overflow-y-auto print:static print:h-auto print:w-auto print:overflow-visible print:bg-white text-[#0f172a] font-sans">
      <style>{`
        @media print {
          body {
            background-color: white !important;
            color: #0f172a !important;
          }
          .no-print {
            display: none !important;
          }
          .print-page {
            page-break-after: always;
            page-break-inside: avoid;
            break-after: page;
            padding: 8mm 6mm !important;
          }
          /* Ensure backgrounds and graphics render properly on prints & saves */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
      <div className="max-w-[210mm] mx-auto bg-white p-8 shadow-2xl print:shadow-none print:max-w-none print:w-full print:p-[10mm] print:m-0">
        
        {/* ACTION BAR (Hidden in print) */}
        <div className="flex justify-between items-center mb-8 print:hidden no-print border-b pb-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setPrintWO(null)} 
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700 flex items-center gap-2 font-bold transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Kembali
            </button>
            <div>
              <h2 className="text-lg font-extrabold text-slate-800 leading-tight">Cetak SPK & Inspection Sheet</h2>
              <p className="text-xs text-slate-500">Pratinjau sebelum cetak atau ekspor PDF</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={() => window.print()} 
              className="px-5 py-2.5 bg-slate-100 border border-slate-300 text-slate-800 rounded-lg hover:bg-slate-200 font-bold flex items-center gap-2 transition-colors shadow-xs cursor-pointer"
              title="Pilih 'Save as PDF' di bagian Destination pada dialog Print"
            >
              <Download className="w-4 h-4" /> Simpan PDF
            </button>
            <button 
              onClick={() => window.print()} 
              className="px-6 py-2.5 bg-[#0F2D59] text-white rounded-lg hover:bg-[#153a6c] font-bold flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Cetak Dokumen
            </button>
          </div>
        </div>

      <table className="w-full">
        <thead className="table-header-group">
          <tr>
            <td className="pb-4 border-b-4 border-[#0F2D59]">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <SmartLogo 
                      baseName="logo-indo-teknik" 
                      alt="IT INDO TEKNIK" 
                      className="h-10 w-auto object-contain flex-shrink-0" 
                      style={{ height: '42px', maxWidth: '180px' }}
                    />
                    <div className="border-l-2 border-slate-300 pl-3 leading-tight text-left">
                      <p className="text-[9px] font-black tracking-widest text-[#0F2D59] uppercase">INDO TEKNIK PEKANBARU</p>
                      <p className="text-[7.5px] text-slate-500 flex items-center gap-1 mt-0.5"><MapPin className="w-2.5 h-2.5 text-red-500 shrink-0" /> Jl. Riau Ujung No.898-904, Pekanbaru</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2 pl-1">
                    <SmartLogo 
                      baseName="logo-itech" 
                      alt="ITech" 
                      className="h-5 w-auto object-contain flex-shrink-0" 
                      style={{ height: '20px', maxWidth: '60px' }}
                    />
                    <p className="text-[7.5px] font-black tracking-widest text-[#0F2D59] whitespace-nowrap bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">ITECH AUTHORIZED DEALER & WORKSHOP</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <h2 className="text-sm font-black bg-slate-100 px-3 py-1.5 rounded border border-slate-300 text-[#0F2D59] tracking-wider whitespace-nowrap">WORK ORDER & INSPECTION</h2>
                  <p className="text-[10px] font-mono mt-1 text-[#0f172a] font-bold whitespace-nowrap">NO. WO: {printWO.id}</p>
                </div>
              </div>
            </td>
          </tr>
        </thead>
        <tbody className="print:table-row-group">
          <tr>
            <td>
        {/* --- PAGE 1: Customer Copy --- */}
        <div className="print-page print:h-auto print:w-full print:p-[4mm] print:box-border flex flex-col justify-between print:border-none pb-4 print:break-after-page">
          <div className="flex-1">
            <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div>
                  <h1 className="text-lg font-black tracking-tight text-[#0F2D59] uppercase">Inspection Sheet</h1>
                  <p className="text-[9px] font-bold tracking-widest text-slate-600">CUSTOMER COPY</p>
                </div>
                {printWO.status === 'COMPLETED' ? (
                  <div className="h-6 px-2.5 rounded text-[8px] font-extrabold tracking-wider uppercase bg-emerald-50 text-emerald-700 border border-emerald-200/80 flex items-center gap-1 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                    HASIL AKHIR / AFTER
                  </div>
                ) : (
                  <div className="h-6 px-2.5 rounded text-[8px] font-extrabold tracking-wider uppercase bg-amber-50 text-amber-700 border border-amber-200/80 flex items-center gap-1 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                    ESTIMASI AWAL
                  </div>
                )}
                <div className="h-6 px-2.5 bg-slate-50 text-slate-700 border border-slate-200 rounded text-[8.5px] font-mono font-bold flex items-center shrink-0">
                  ID: <span className="text-[#0F2D59] ml-1 select-all font-sans font-extrabold">{printWO.id}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3 text-[9px]">
              {/* Customer Info */}
              <div className="border border-slate-200 bg-slate-50/20 rounded-lg p-2 shadow-2xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <h3 className="font-extrabold border-b border-slate-200 pb-1 mb-1.5 text-[#0F2D59] text-[8px] uppercase tracking-wider flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span> Data Pemilik
                    </h3>
                    <div className="grid grid-cols-4 gap-y-1 gap-x-0.5 text-[8.5px]">
                      <span className="text-slate-500 col-span-1">Nama:</span> <span className="col-span-3 font-bold text-slate-800 truncate">{printWO.customerName}</span>
                      <span className="text-slate-500 col-span-1">Telp:</span> <span className="col-span-3 text-slate-800 font-mono">{printWO.customerPhone}</span>
                      <span className="text-slate-500 col-span-1">Alamat:</span> <span className="col-span-3 font-medium text-slate-700 truncate">{printWO.customerAddress || '-'}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-extrabold border-b border-slate-200 pb-1 mb-1.5 text-[#0F2D59] text-[8px] uppercase tracking-wider flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span> Data Pembawa
                    </h3>
                    <div className="grid grid-cols-4 gap-y-1 gap-x-0.5 text-[8.5px]">
                      <span className="text-slate-500 col-span-1">Nama:</span> <span className="col-span-3 font-bold text-slate-800 truncate">{printWO.bringerName || '-'}</span>
                      <span className="text-slate-500 col-span-1">Telp:</span> <span className="col-span-3 text-slate-800 font-mono">{printWO.bringerPhone || '-'}</span>
                      <span className="text-slate-500 col-span-1">Alamat:</span> <span className="col-span-3 font-medium text-slate-700 truncate">{printWO.bringerAddress || '-'}</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Vehicle Info */}
              <div className="border border-slate-200 bg-slate-50/20 rounded-lg p-2 shadow-2xs">
                <h3 className="font-extrabold border-b border-slate-200 pb-1 mb-1.5 text-[#0F2D59] text-[8px] uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span> Detail Kendaraan / Komponen
                </h3>
                <div className="grid grid-cols-3 gap-y-1 gap-x-0.5 text-[8.5px] text-slate-800">
                  <span className="text-slate-500">Brand/Model:</span> <span className="col-span-2 font-bold text-slate-900">{printWO.vehicleBrand}</span>
                  <span className="text-slate-500">No. Polisi:</span> <span className="col-span-2 font-black text-[#0F2D59] tracking-wider font-mono bg-blue-50 px-1 rounded inline-block w-fit">{printWO.plateNumber}</span>
                  <span className="text-slate-500">No. Rangka (VIN):</span> <span className="col-span-2 font-mono">{printWO.vin || '-'}</span>
                  <span className="text-slate-500">Odo / HM:</span> <span className="col-span-2 font-semibold text-slate-800">{printWO.odometer}</span>
                  <span className="text-slate-500">Level BBM:</span> <span className="col-span-2 font-semibold text-slate-800">{printWO.fuelLevel}</span>
                </div>
              </div>
            </div>

            {/* Operational Meta */}
            <div className="bg-blue-50/20 px-3 py-1.5 border border-blue-100 rounded-lg text-[9px] flex justify-between items-center mb-3 shadow-3xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                <span className="font-semibold text-slate-500">Waktu Masuk (Intake):</span>{' '}
                <span className="font-mono font-black text-[#0F2D59]">
                  {printWO.intakeDate ? new Date(printWO.intakeDate).toLocaleString('id-ID') : '-'}
                </span>
              </div>
              <div className="flex gap-4 text-[9px]">
                <div className="flex gap-1">
                  <span className="font-semibold text-slate-500">Estimasi Selesai:</span>{' '}
                  <span className="text-[#0F2D59] font-bold">{printWO.estimasiPengerjaan || '-'}</span>
                </div>
                <div className="flex gap-1 border-l border-slate-300 pl-4">
                  <span className="font-semibold text-slate-500">Masa Garansi:</span>{' '}
                  <span className="text-emerald-700 font-bold">{printWO.garansi || '-'}</span>
                </div>
              </div>
            </div>

            {/* Primary Complaint (Customer Voice) */}
            {(() => {
              const complaintLines = printWO.customerVoice
                ? printWO.customerVoice
                    .split('\n')
                    .map(l => l.trim().replace(/^\d+\.\s*/, ''))
                    .filter(l => l.length > 0 && !l.includes('[TEMUAN HIDDEN DEFECT]'))
                : [];
              
              if (complaintLines.length === 0) return null;

              return (
                <div className="mb-2">
                  <h3 className="font-bold bg-slate-100 p-1 border border-slate-300 mb-0 text-[#0F2D59] text-[9px] uppercase tracking-wider">Primary Complaint (Customer Voice)</h3>
                  <table className="w-full border-collapse border border-slate-300 text-[9px]">
                    <thead>
                      <tr className="bg-slate-50 text-[8px] uppercase text-slate-700">
                        <th className="border border-slate-300 p-0.5 text-center w-[6%] font-bold">NO</th>
                        <th className="border border-slate-300 p-0.5 text-left w-[94%] font-bold px-2">DESKRIPSI KELUHAN</th>
                      </tr>
                    </thead>
                    <tbody>
                      {complaintLines.map((line, idx) => (
                        <tr key={idx} className={`h-4.5 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                          <td className="border border-slate-300 p-0.5 text-center font-bold">{idx + 1}</td>
                          <td className="border border-slate-300 p-0.5 px-2 italic text-slate-800">{line}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })()}

            {/* Damage & Inventory / Component Serialization */}
            {printWO.dropMethod === 'WHOLE' && (
              <div className="grid grid-cols-2 gap-2 mb-2">
                {/* Damage Outlines summary */}
                <div>
                  <h3 className="font-bold bg-slate-100 p-1 border border-slate-300 text-[#0F2D59] text-[9px]">Visual Automotive Damage</h3>
                  <div className="border border-t-0 border-slate-300 p-1 min-h-[40px] text-[8px]">
                    {printWO.damages.length === 0 ? (
                      <p className="text-slate-500 italic text-center mt-2">No exterior/interior damages noted.</p>
                    ) : (
                      <div className="space-y-0.5 max-h-[60px] overflow-y-auto">
                        {printWO.damages.map(d => {
                          const partLabel = d.partId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                          return (
                            <div key={d.partId} className="bg-red-50 border border-red-200 px-1 py-0.5 rounded text-slate-800">
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
                  <h3 className="font-bold bg-slate-100 p-1 border border-slate-300 text-[#0F2D59] text-[9px]">Inventory Checklist</h3>
                  <div className="border border-t-0 border-slate-300 p-1 min-h-[40px]">
                    <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[7px]">
                      {printWO.inventory.map(item => (
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
            )}

            {/* Component Intake Tracking Array */}
            {printWO.looseParts && printWO.looseParts.length > 0 && printWO.dropMethod !== 'WHOLE' && (
              <div className="mb-2">
                <h3 className="font-bold bg-slate-100 p-1 border border-slate-300 mb-0 text-[#0F2D59] text-[9px] uppercase tracking-wider">A. COMPONENT / INJECTOR SERIALIZATION</h3>
                <table className="w-full border-collapse border border-slate-300 text-[9px]">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="border border-slate-300 p-0.5 text-left w-1/3 font-semibold px-2">Keterangan</th>
                      <th className="border border-slate-300 p-0.5 text-left w-1/3 font-semibold px-2">Part Number (P/N)</th>
                      <th className="border border-slate-300 p-0.5 text-left w-1/3 font-semibold px-2">Kondisi Fisik</th>
                    </tr>
                  </thead>
                  <tbody>
                    {printWO.looseParts.map((part, i) => (
                      <tr key={part.id || i} className={`h-4.5 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                        <td className="border border-slate-300 p-0.5 font-semibold text-slate-800 px-2">{part.description || '-'}</td>
                        <td className="border border-slate-300 p-0.5 font-mono text-slate-800 px-2">{part.partNumber || '-'}</td>
                        <td className="border border-slate-300 p-0.5 text-slate-800 px-2">{part.physicalCondition}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Signatures Lock to Page 1 Bottom */}
          <div className="mt-1 border-t border-slate-200 pt-1">
            <div className="flex items-stretch gap-4">
              <div className="flex-1 grid grid-cols-4 gap-2 text-center text-[8px]">
                <div>
                  <div className="h-14 border-b border-slate-300 mb-1"></div>
                  <p className="font-bold text-[#0f172a]">Tanda Tangan Pelanggan</p>
                </div>
                <div>
                  <div className="h-14 border-b border-slate-300 mb-1"></div>
                  <p className="font-bold text-[#0f172a]">Mekanik Pemeriksa / Tester</p>
                </div>
                <div>
                  <div className="h-14 border-b border-slate-300 mb-1"></div>
                  <p className="font-bold text-[#0f172a]">Service Advisor (SA)</p>
                </div>
                <div>
                  <div className="h-14 border-b border-slate-300 mb-1"></div>
                  <p className="font-bold text-[#0f172a]">Diketahui Oleh: Foreman</p>
                </div>
              </div>
              
              <div className="w-[1px] bg-slate-200 my-1 shrink-0"></div>
              
              <div className="w-48 flex-shrink-0 flex items-center gap-2 border border-blue-100 bg-blue-50/20 p-1.5 rounded">
                <div className="p-1.5 bg-white rounded border border-slate-200 shrink-0 flex items-center justify-center">
                  <QRCodeSVG
                    value={baseTrackingUrl + '/?tracking=' + printWO.id}
                    size={72}
                    level="L"
                    includeMargin={false}
                  />
                </div>
                <div className="text-left leading-tight">
                  <p className="text-[7.5px] font-black text-[#0F2D59] uppercase tracking-wider">E-TRACKING</p>
                  <p className="text-[6px] text-slate-500 font-bold leading-normal max-w-[95px] mt-0.5">Scan QR untuk melacak status pengerjaan secara real-time.</p>
                  <p className="text-[6.5px] font-mono font-bold text-blue-700 mt-1 select-all">{printWO.id}</p>
                </div>
              </div>
            </div>
            {/* The page footer is moved to global tfoot */}
          </div>
        </div>

        {/* --- PAGE 2: Internal Work Order (SPK) --- */}
        <div className="print-page print:h-auto print:w-full print:p-[4mm] print:box-border flex flex-col justify-between pt-2 pb-4">
          <div className="flex-1">
            <div className="flex justify-between items-center pb-2 mb-2 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div>
                  <h1 className="text-lg font-black tracking-tight text-[#0F2D59] uppercase">Surat Perintah Kerja (SPK)</h1>
                  <p className="text-[9px] font-bold tracking-widest text-slate-600">WORK ORDER</p>
                </div>
                {printWO.status === 'COMPLETED' ? (
                  <div className="h-6 px-2.5 rounded text-[8px] font-extrabold tracking-wider uppercase bg-emerald-50 text-emerald-700 border border-emerald-200/80 flex items-center gap-1 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                    HASIL AKHIR / AFTER
                  </div>
                ) : (
                  <div className="h-6 px-2.5 rounded text-[8px] font-extrabold tracking-wider uppercase bg-amber-50 text-amber-700 border border-amber-200/80 flex items-center gap-1 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                    ESTIMASI AWAL
                  </div>
                )}
                <div className="h-6 px-2.5 bg-slate-50 text-slate-700 border border-slate-200 rounded text-[8.5px] font-mono font-bold flex items-center shrink-0">
                  ID: <span className="text-[#0F2D59] ml-1 select-all font-sans font-extrabold">{printWO.id}</span>
                </div>
              </div>
              <div className="text-right flex flex-col items-end shrink-0">
                <div className="flex gap-2 items-center">
                  <div className="h-6 px-2.5 border border-slate-200 bg-slate-50 text-slate-700 rounded text-[8.5px] font-extrabold flex items-center shrink-0">
                    GARANSI: <span className="font-black ml-1.5 uppercase text-[#0F2D59]">{printWO.garansi || '-'}</span>
                  </div>
                  {printWO.priority === 1 && <div className="h-6 px-2.5 border border-red-200 text-red-750 text-[8px] font-black uppercase tracking-wider flex items-center justify-center rounded bg-red-50/50 shrink-0">Priority 1 : URGENT</div>}
                  {printWO.priority === 2 && <div className="h-6 px-2.5 border border-amber-200 text-amber-750 text-[8px] font-black uppercase tracking-wider flex items-center justify-center rounded bg-amber-50/50 shrink-0">Priority 2 : BOOKING</div>}
                  {printWO.priority === 3 && <div className="h-6 px-2.5 border border-blue-200 text-blue-750 text-[8px] font-black uppercase tracking-wider flex items-center justify-center rounded bg-blue-50/50 shrink-0">Priority 3 : REGULAR</div>}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3 text-[9px]">
              {/* Customer Profile */}
              <div className="border border-slate-200 bg-slate-50/20 rounded-lg p-2 shadow-2xs">
                <div className="grid grid-cols-2 gap-3 text-[#0f172a]">
                  <div>
                    <h3 className="font-extrabold border-b border-slate-200 pb-1 mb-1.5 text-[#0F2D59] text-[8px] uppercase tracking-wider flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span> Data Pemilik
                    </h3>
                    <div className="grid grid-cols-4 gap-y-1 gap-x-0.5 text-[8.5px]">
                      <span className="text-slate-500 col-span-1">Nama:</span> <span className="col-span-3 font-bold text-slate-800 truncate">{printWO.customerName}</span>
                      <span className="text-slate-500 col-span-1">Telp:</span> <span className="col-span-3 text-slate-800 font-mono">{printWO.customerPhone}</span>
                      <span className="text-slate-500 col-span-1">Alamat:</span> <span className="col-span-3 font-medium text-slate-700 truncate">{printWO.customerAddress || '-'}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-extrabold border-b border-slate-200 pb-1 mb-1.5 text-[#0F2D59] text-[8px] uppercase tracking-wider flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span> Data Pembawa
                    </h3>
                    <div className="grid grid-cols-4 gap-y-1 gap-x-0.5 text-[8.5px]">
                      <span className="text-slate-500 col-span-1">Nama:</span> <span className="col-span-3 font-bold text-slate-800 truncate">{printWO.bringerName || '-'}</span>
                      <span className="text-slate-500 col-span-1">Telp:</span> <span className="col-span-3 text-slate-800 font-mono">{printWO.bringerPhone || '-'}</span>
                      <span className="text-slate-500 col-span-1">Alamat:</span> <span className="col-span-3 font-medium text-slate-700 truncate">{printWO.bringerAddress || '-'}</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Component Technical Identity */}
              <div className="border border-slate-200 bg-slate-50/20 rounded-lg p-2 shadow-2xs">
                <h3 className="font-extrabold border-b border-slate-200 pb-1 mb-1.5 text-[#0F2D59] text-[8px] uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span> Identitas Teknis Komponen
                </h3>
                <div className="grid grid-cols-3 gap-y-1 gap-x-0.5 text-[8.5px] text-slate-800">
                  <span className="text-slate-500">Model/Year:</span> <span className="col-span-2 font-bold text-slate-900">{printWO.vehicleBrand}</span>
                  <span className="text-slate-500">No. Polisi:</span> <span className="col-span-2 font-black text-[#0F2D59] tracking-wider font-mono bg-blue-50 px-1 rounded inline-block w-fit">{printWO.plateNumber || '-'}</span>
                  <span className="text-slate-500">No. Rangka (VIN):</span> <span className="col-span-2 font-mono">{printWO.vin || '-'}</span>
                </div>
              </div>
            </div>

            {/* Operational Meta Row */}
            <div className="bg-blue-50/20 px-3 py-1.5 border border-blue-100 rounded-lg text-[9px] flex justify-between items-center mb-3 shadow-3xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                <span className="font-semibold text-slate-500">Waktu Masuk (Intake):</span>{' '}
                <span className="font-mono font-black text-[#0F2D59]">
                  {printWO.intakeDate ? new Date(printWO.intakeDate).toLocaleString('id-ID') : '-'}
                </span>
              </div>
            </div>

            {/* A. COMPONENT/INJECTOR SERIALIZATION */}
            {printWO.looseParts && printWO.looseParts.length > 0 && printWO.dropMethod !== 'WHOLE' && (
              <div className="mb-2">
                <h3 className="font-bold bg-[#0F2D59] text-white p-1 border border-[#0F2D59] mb-0 uppercase tracking-widest text-[9px] px-2">A. COMPONENT/INJECTOR SERIALIZATION</h3>
                <table className="w-full border-collapse border border-slate-300 text-[9px] text-[#0f172a]">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="border border-slate-300 p-0.5 text-left w-1/3 font-bold px-2">Keterangan</th>
                      <th className="border border-slate-300 p-0.5 text-left w-1/3 font-bold px-2">Part Number (P/N)</th>
                      <th className="border border-slate-300 p-0.5 text-left w-1/3 font-bold px-2">Kondisi Fisik</th>
                    </tr>
                  </thead>
                  <tbody>
                    {printWO.looseParts.map((part, index) => (
                      <tr key={part.id || index} className={`h-4.5 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                        <td className="border border-slate-300 p-0.5 px-2 font-semibold">{part.description || '-'}</td>
                        <td className="border border-slate-300 p-0.5 px-2 font-mono">{part.partNumber || '-'}</td>
                        <td className="border border-slate-300 p-0.5 px-2">{part.physicalCondition}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* RANGKUMAN HASIL PERBAIKAN (BEFORE VS AFTER) */}
            {(() => {
              const complaintLines = printWO.customerVoice
                ? printWO.customerVoice
                    .split('\n')
                    .map(l => l.trim().replace(/^\d+\.\s*/, ''))
                    .filter(l => l.length > 0 && !l.includes('[TEMUAN HIDDEN DEFECT]'))
                : [];

              if (complaintLines.length === 0) return null;

              return (
                <div className="mb-2">
                  <h3 className="font-bold bg-[#0F2D59] text-white p-1 border border-[#0F2D59] mb-0 uppercase tracking-widest text-[9px] px-2">
                    RANGKUMAN HASIL PERBAIKAN (BEFORE VS AFTER)
                  </h3>
                  <table className="w-full border-collapse border border-slate-300 text-[9px] text-[#0f172a]">
                    <thead>
                      <tr className="bg-slate-100 text-[8px] font-bold uppercase text-slate-700">
                        <th className="border border-slate-300 p-0.5 text-center w-[6%] font-bold">NO</th>
                        <th className="border border-slate-300 p-0.5 text-left w-[54%] font-bold px-2">KELUHAN / KONDISI SEBELUM (BEFORE)</th>
                        <th className="border border-slate-300 p-0.5 text-left w-[40%] font-bold px-2">STATUS / TINDAKAN SESUDAH (AFTER)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {complaintLines.map((line, idx) => (
                        <tr key={idx} className={`h-4.5 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                          <td className="border border-slate-300 p-0.5 text-center font-bold">{idx + 1}</td>
                          <td className="border border-slate-300 p-0.5 px-2 font-bold text-slate-800">{line}</td>
                          <td className="border border-slate-300 p-0.5 px-2 font-bold text-blue-900 bg-blue-50/10">
                            {printWO.repairResults?.[idx] || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })()}

            {/* B. ACTION & PARTS TO-DO BUILDER (TO-DO LIST) */}
            {printWO.todoActions && printWO.todoActions.length > 0 && (
              <div className="mb-2">
                <h3 className="font-bold bg-[#0F2D59] text-white p-1 border border-[#0F2D59] mb-0 uppercase tracking-widest text-[9px] px-2">DAFTAR TINDAKAN & RENCANA SUKU CADANG (TO-DO LIST)</h3>
                <table className="w-full border-collapse border border-slate-300 text-[9px] text-[#0f172a]">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="border border-slate-300 p-0.5 text-left font-bold px-2">JENIS PENGERJAAN</th>
                      <th className="border border-slate-300 p-0.5 text-center w-10 font-bold">QTY</th>
                      {printWO.todoActions.some(a => a.catatanMekanik) && (
                        <th className="border border-slate-300 p-0.5 text-left font-bold px-2">CATATAN MEKANIK</th>
                      )}
                      <th className="border border-slate-300 p-0.5 text-left w-28 font-bold px-2 text-right">ESTIMASI HARGA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {printWO.todoActions.map((action) => (
                      <tr key={action.id} className="h-4.5">
                        <td className="border border-slate-300 p-0.5 px-2 font-medium">{action.jenisPengerjaan || '-'}</td>
                        <td className="border border-slate-300 p-0.5 text-center font-bold">{action.qty}</td>
                        {printWO.todoActions.some(a => a.catatanMekanik) && (
                          <td className="border border-slate-300 p-0.5 px-2">{action.catatanMekanik || '-'}</td>
                        )}
                        <td className="border border-slate-300 p-0.5 px-2 font-bold text-right font-mono">
                          {action.estimasiHargaMin || action.estimasiHargaMax ? (
                            <>
                              {action.estimasiHargaMin ? formatRupiah(action.estimasiHargaMin) : 'Rp 0'} 
                              <span className="text-[8px] text-slate-400 font-normal mx-1">s/d</span> 
                              {action.estimasiHargaMax ? formatRupiah(action.estimasiHargaMax) : 'Rp 0'}
                            </>
                          ) : (
                            formatRupiah(action.estimasiHarga) || 'Rp 0'
                          )}
                        </td>
                      </tr>
                    ))}
                    {/* Total Row */}
                    <tr className="bg-slate-50 font-bold">
                      <td colSpan={printWO.todoActions.some(a => a.catatanMekanik) ? 3 : 2} className="border border-slate-300 p-0.5 px-2 text-right text-[9px]">TOTAL ESTIMASI BIAYA</td>
                      <td className="border border-slate-300 p-0.5 px-2 text-right font-mono text-[9px] text-[#0F2D59]">
                        {(() => {
                          const totalMin = printWO.todoActions.reduce((acc, action) => {
                            const val = String(action.estimasiHargaMin || action.estimasiHarga || '').replace(/\D/g, '');
                            return acc + (val ? parseInt(val, 10) : 0);
                          }, 0);
                          const totalMax = printWO.todoActions.reduce((acc, action) => {
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

            <div className="mb-1.5 text-[4.2pt] leading-[1.1] text-slate-600 text-justify border border-slate-200 p-1.5 rounded">
              <p className="font-extrabold mb-1 uppercase text-[#0F2D59] text-[5pt] tracking-wider text-center border-b pb-0.5 mb-1">SYARAT DAN KETENTUAN</p>
              <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
                <div className="space-y-0.5">
                  <p><strong>1.</strong> Kendaraan diserahkan kepada Indo Teknik untuk dilakukan pemeriksaan, diagnosa, perbaikan, pembongkaran, pemasangan, penggantian suku cadang, dan/atau pekerjaan lainnya sesuai dengan keluhan pelanggan dan hasil pemeriksaan teknisi.</p>
                  <p><strong>2.</strong> Pelanggan memberikan kuasa kepada Indo Teknik untuk melakukan pembongkaran komponen kendaraan yang diperlukan guna proses pemeriksaan (diagnosa) dan perbaikan.</p>
                  <p><strong>3.</strong> Hasil pemeriksaan teknisi dapat menemukan kerusakan lain yang tidak terlihat pada saat pemeriksaan awal. Apabila ditemukan kerusakan tambahan yang memerlukan penggantian suku cadang atau pekerjaan tambahan, Indo Teknik akan menginformasikan kepada pelanggan untuk memperoleh persetujuan sebelum pekerjaan dilakukan.</p>
                  <p><strong>4.</strong> Pelanggan memahami dan menyetujui bahwa penambahan pekerjaan, jasa, maupun suku cadang selama proses perbaikan akan menimbulkan tambahan biaya sesuai pekerjaan yang dilakukan.</p>
                  <p><strong>5.</strong> Apabila pelanggan menolak rekomendasi teknisi atau meminta pembatalan penggantian suku cadang yang telah direkomendasikan, termasuk meminta pemasangan kembali suku cadang lama setelah dilakukan pembongkaran, maka pelanggan memahami bahwa kondisi, performa, tenaga, fungsi, maupun keandalan kendaraan mungkin tidak kembali seperti semula. Segala risiko yang timbul akibat permintaan tersebut menjadi tanggung jawab pelanggan dan Indo Teknik dibebaskan dari segala tuntutan atas kondisi tersebut.</p>
                  <p><strong>6.</strong> Upah jasa pemeriksaan, diagnosa, pembongkaran, pemasangan kembali, serta pekerjaan yang telah dilakukan tetap menjadi kewajiban pelanggan meskipun pelanggan membatalkan penggantian suku cadang atau tidak melanjutkan proses perbaikan.</p>
                  <p><strong>7.</strong> Indo Teknik tidak bertanggung jawab atas kerusakan yang telah ada sebelum kendaraan diterima maupun kerusakan lain yang tidak berkaitan dengan pekerjaan yang dilakukan.</p>
                  <p><strong>8.</strong> Indo Teknik berhak melakukan uji fungsi atau test jalan apabila diperlukan untuk memastikan hasil pekerjaan.</p>
                </div>
                <div className="space-y-0.5">
                  <p><strong>9.</strong> Kendaraan yang telah selesai diperbaiki agar segera diambil oleh pelanggan. Apabila dalam waktu 30 (tiga puluh) hari kalender sejak pelanggan diberitahukan bahwa kendaraan telah selesai diperbaiki kendaraan belum diambil tanpa pemberitahuan, maka Indo Teknik tidak bertanggung jawab atas kehilangan barang yang ditinggalkan di dalam kendaraan maupun risiko yang timbul akibat penyimpanan kendaraan.</p>
                  <p><strong>10.</strong> Pelanggan wajib memeriksa kendaraan pada saat serah terima. Keluhan yang berkaitan dengan hasil pekerjaan agar disampaikan secepatnya kepada Indo Teknik untuk dilakukan pemeriksaan lebih lanjut.</p>
                  <p><strong>11.</strong> Barang-barang berharga yang tertinggal di dalam kendaraan bukan merupakan tanggung jawab Indo Teknik. Pelanggan disarankan untuk mengeluarkan seluruh barang berharga sebelum kendaraan diserahkan.</p>
                  <p><strong>12.</strong> Indo Teknik tidak menjamin seluruh keluhan kendaraan akan hilang hanya dengan penggantian satu komponen, karena kerusakan pada kendaraan dapat disebabkan oleh lebih dari satu komponen yang saling berkaitan. Hasil perbaikan mengikuti kondisi aktual kendaraan berdasarkan pemeriksaan teknisi.</p>
                  <p><strong>13.</strong> Apabila pelanggan meminta penghentian proses perbaikan sebelum pekerjaan selesai atau meminta kendaraan diserahkan kembali, maka seluruh pekerjaan yang telah dilakukan beserta biaya jasa dan suku cadang yang telah terpasang tetap menjadi kewajiban pelanggan untuk dibayarkan.</p>
                  <p><strong>14.</strong> Perintah Kerja ini merupakan bukti tanda terima kendaraan dan wajib dibawa oleh pelanggan pada saat pengambilan kendaraan sebagai dasar penyerahan kembali kendaraan.</p>
                  <p><strong>15.</strong> Dengan menandatangani Perintah Kerja ini, pelanggan menyatakan telah membaca, memahami, dan menyetujui seluruh syarat dan ketentuan yang tercantum dalam dokumen ini.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Signatures Page 2 Bottom */}
          <div className="mt-1 border-t border-slate-200 pt-1">
            <div className="flex items-stretch gap-4">
              <div className="flex-1 grid grid-cols-4 gap-2 text-center text-[8px]">
                <div>
                  <div className="h-11 border-b border-slate-300 mb-1"></div>
                  <p className="font-bold text-[#0f172a]">Tanda Tangan Pelanggan</p>
                </div>
                <div>
                  <div className="h-11 border-b border-slate-300 mb-1"></div>
                  <p className="font-bold text-[#0f172a]">Mekanik Pemeriksa / Tester</p>
                </div>
                <div>
                  <div className="h-11 border-b border-slate-300 mb-1"></div>
                  <p className="font-bold text-[#0f172a]">Service Advisor (SA)</p>
                </div>
                <div>
                  <div className="h-11 border-b border-slate-300 mb-1"></div>
                  <p className="font-bold text-[#0f172a]">Foreman / Kepala Bengkel</p>
                </div>
              </div>
              
              <div className="w-[1px] bg-slate-200 my-0.5 shrink-0"></div>
              
              <div className="w-48 flex-shrink-0 flex items-center gap-2 border border-blue-100 bg-blue-50/20 p-1.5 rounded">
                <div className="p-1.5 bg-white rounded border border-slate-200 shrink-0 flex items-center justify-center">
                  <QRCodeSVG
                    value={baseTrackingUrl + '/?tracking=' + printWO.id}
                    size={72}
                    level="L"
                    includeMargin={false}
                  />
                </div>
                <div className="text-left leading-tight">
                  <p className="text-[7.5px] font-black text-[#0F2D59] uppercase tracking-wider">E-TRACKING</p>
                  <p className="text-[6px] text-slate-500 font-bold leading-normal max-w-[95px] mt-0.5">Scan QR untuk melacak status pengerjaan secara real-time.</p>
                  <p className="text-[6.5px] font-mono font-bold text-blue-700 mt-1 select-all">{printWO.id}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
            </td>
          </tr>
        </tbody>
        <tfoot className="table-footer-group">
          <tr>
            <td className="pt-3 border-t-2 border-[#0F2D59]/20">
              <div className="flex justify-between items-center text-[8px] text-slate-500 font-sans">
                <div className="flex flex-col text-left">
                  <span className="font-extrabold text-[#0F2D59] tracking-wider uppercase">ITech Authorized Dealer & Workshop</span>
                  <span className="text-slate-500 mt-0.5">Jl. Riau Ujung No.898-904 Pekanbaru</span>
                </div>
                <div className="text-right flex flex-col font-mono text-[7.5px] items-end">
                  <span className="text-slate-400">Dicetak otomatis via Indo Teknik ERP pada {new Date().toLocaleDateString('id-ID')}</span>
                  <span className="font-semibold text-[#0F2D59] mt-0.5 tracking-widest uppercase">Dokumen Resmi Pelanggan</span>
                </div>
              </div>
            </td>
          </tr>
        </tfoot>
      </table>

      </div>
    </div>
  );
};

export default PrintTemplate;
