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
  const { printWO, setPrintWO } = useApp();

  if (!printWO) return null;

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
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Cetak Dokumen
            </button>
          </div>
        </div>

      <table className="w-full">
        <thead className="table-header-group">
          <tr>
            <td className="pb-4 border-b-4 border-[#1e3a8a]">
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
                      <p className="text-[9px] font-black tracking-widest text-[#1e3a8a] uppercase">INDO TEKNIK PEKANBARU</p>
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
                    <p className="text-[7.5px] font-black tracking-widest text-[#1e3a8a] whitespace-nowrap bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">ITECH AUTHORIZED DEALER & WORKSHOP</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <h2 className="text-sm font-black bg-slate-100 px-3 py-1.5 rounded border border-slate-300 text-[#1e3a8a] tracking-wider whitespace-nowrap">WORK ORDER & INSPECTION</h2>
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
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-3">
                <div>
                  <h1 className="text-lg font-black tracking-tight text-[#1e3a8a] uppercase">Inspection Sheet</h1>
                  <p className="text-[9px] font-bold tracking-widest text-slate-600">CUSTOMER COPY</p>
                </div>
                {printWO.status === 'COMPLETED' ? (
                  <div className="px-2 py-0.5 rounded text-[8px] font-black tracking-widest uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-emerald-500 shrink-0"></span>
                    DOKUMEN: HASIL AKHIR/AFTER
                  </div>
                ) : (
                  <div className="px-2 py-0.5 rounded text-[8px] font-black tracking-widest uppercase bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-amber-500 shrink-0"></span>
                    DOKUMEN: ESTIMASI AWAL
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3 border border-blue-200 bg-blue-50/30 p-2.5 rounded-lg shadow-2xs">
                <QRCodeSVG
                  value={window.location.origin + '/?tracking=' + printWO.id}
                  size={90}
                  level="H"
                  includeMargin={true}
                  className="border-2 border-slate-300 p-1 rounded bg-white shrink-0 shadow-xs"
                />
                <div className="text-left leading-tight">
                  <p className="text-[8px] font-black text-[#1e3a8a] uppercase tracking-wider">Lacak Progres</p>
                  <p className="text-[7px] text-slate-500 font-medium max-w-[120px]">Imbaskan kamera anda ke kod QR ini untuk menjejak status semasa secara langsung.</p>
                  <p className="text-[8px] font-mono font-black text-blue-700 mt-1 select-all bg-white px-1 py-0.5 border border-slate-200 rounded">{printWO.id}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3 text-[9px]">
              {/* Customer Info */}
              <div className="border border-slate-200 bg-slate-50/20 rounded-lg p-2 shadow-2xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <h3 className="font-extrabold border-b border-slate-200 pb-1 mb-1.5 text-[#1e3a8a] text-[8px] uppercase tracking-wider flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span> Data Pemilik
                    </h3>
                    <div className="grid grid-cols-4 gap-y-1 gap-x-0.5 text-[8.5px]">
                      <span className="text-slate-500 col-span-1">Nama:</span> <span className="col-span-3 font-bold text-slate-800 truncate">{printWO.customerName}</span>
                      <span className="text-slate-500 col-span-1">Telp:</span> <span className="col-span-3 text-slate-800 font-mono">{printWO.customerPhone}</span>
                      <span className="text-slate-500 col-span-1">Alamat:</span> <span className="col-span-3 font-medium text-slate-700 truncate">{printWO.customerAddress || '-'}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-extrabold border-b border-slate-200 pb-1 mb-1.5 text-[#1e3a8a] text-[8px] uppercase tracking-wider flex items-center gap-1">
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
                <h3 className="font-extrabold border-b border-slate-200 pb-1 mb-1.5 text-[#1e3a8a] text-[8px] uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span> Detail Kendaraan / Komponen
                </h3>
                <div className="grid grid-cols-3 gap-y-1 gap-x-0.5 text-[8.5px] text-slate-800">
                  <span className="text-slate-500">Brand/Model:</span> <span className="col-span-2 font-bold text-slate-900">{printWO.vehicleBrand}</span>
                  <span className="text-slate-500">No. Polisi:</span> <span className="col-span-2 font-black text-blue-800 tracking-wider font-mono bg-blue-50 px-1 rounded inline-block w-fit">{printWO.plateNumber}</span>
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
                <span className="font-mono font-black text-[#1e3a8a]">
                  {printWO.intakeDate ? new Date(printWO.intakeDate).toLocaleString('id-ID') : '-'}
                </span>
              </div>
              <div className="flex gap-4 text-[9px]">
                <div className="flex gap-1">
                  <span className="font-semibold text-slate-500">Estimasi Selesai:</span>{' '}
                  <span className="text-[#1e3a8a] font-bold">{printWO.estimasiPengerjaan || '-'}</span>
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
                  <h3 className="font-bold bg-slate-100 p-1 border border-slate-300 mb-0 text-[#1e3a8a] text-[9px] uppercase tracking-wider">Primary Complaint (Customer Voice)</h3>
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
                  <h3 className="font-bold bg-slate-100 p-1 border border-slate-300 text-[#1e3a8a] text-[9px]">Visual Automotive Damage</h3>
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
                  <h3 className="font-bold bg-slate-100 p-1 border border-slate-300 text-[#1e3a8a] text-[9px]">Inventory Checklist</h3>
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
                <h3 className="font-bold bg-slate-100 p-1 border border-slate-300 mb-0 text-[#1e3a8a] text-[9px] uppercase tracking-wider">A. COMPONENT / INJECTOR SERIALIZATION</h3>
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
            <div className="grid grid-cols-4 gap-2 text-center text-[8px]">
              <div>
                <div className="h-16 border-b border-slate-300 mb-1.5"></div>
                <p className="font-bold text-[#0f172a]">Tanda Tangan Pelanggan</p>
              </div>
              <div>
                <div className="h-16 border-b border-slate-300 mb-1.5"></div>
                <p className="font-bold text-[#0f172a]">Mekanik Pemeriksa / Tester</p>
              </div>
              <div>
                <div className="h-16 border-b border-slate-300 mb-1.5"></div>
                <p className="font-bold text-[#0f172a]">Service Advisor (SA)</p>
              </div>
              <div>
                <div className="h-16 border-b border-slate-300 mb-1.5"></div>
                <p className="font-bold text-[#0f172a]">Diketahui Oleh: Foreman</p>
              </div>
            </div>
            {/* The page footer is moved to global tfoot */}
          </div>
        </div>

        {/* --- PAGE 2: Internal Work Order (SPK) --- */}
        <div className="print-page print:h-auto print:w-full print:p-[4mm] print:box-border flex flex-col justify-between pt-2 pb-4">
          <div className="flex-1">
            <div className="flex justify-between items-start pb-1 mb-2">
              <div className="flex-1 flex justify-between items-center mr-4">
                <div className="flex items-center gap-3">
                  <div>
                    <h1 className="text-lg font-black tracking-tight text-[#1e3a8a] uppercase">Surat Perintah Kerja (SPK)</h1>
                    <p className="text-[9px] font-bold tracking-widest text-slate-600">WORK ORDER</p>
                  </div>
                  {printWO.status === 'COMPLETED' ? (
                    <div className="px-2 py-0.5 rounded text-[8px] font-black tracking-widest uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-emerald-500 shrink-0"></span>
                      DOKUMEN: HASIL AKHIR/AFTER
                    </div>
                  ) : (
                    <div className="px-2 py-0.5 rounded text-[8px] font-black tracking-widest uppercase bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-amber-500 shrink-0"></span>
                      DOKUMEN: ESTIMASI AWAL
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3 border border-blue-200 bg-blue-50/30 p-2.5 rounded-lg shadow-2xs">
                  <QRCodeSVG
                    value={window.location.origin + '/?tracking=' + printWO.id}
                    size={90}
                    level="H"
                    includeMargin={true}
                    className="border-2 border-slate-300 p-1 rounded bg-white shrink-0 shadow-xs"
                  />
                  <div className="text-left leading-tight">
                    <p className="text-[8px] font-black text-[#1e3a8a] uppercase tracking-wider">Lacak Progres</p>
                    <p className="text-[7px] text-slate-500 font-medium max-w-[120px]">Imbaskan kamera anda ke kod QR ini untuk menjejak status semasa secara langsung.</p>
                    <p className="text-[8px] font-mono font-black text-blue-700 mt-1 select-all bg-white px-1 py-0.5 border border-slate-200 rounded">{printWO.id}</p>
                  </div>
                </div>
              </div>
              <div className="text-right flex flex-col items-end shrink-0">
                <div className="flex gap-2 items-center">
                  <div className="border-2 border-slate-800 px-2 py-0.5 text-[9px] font-black text-slate-800 flex items-center h-8 bg-slate-50 select-none">
                    WARRANTY: <span className="font-bold ml-1.5 uppercase">{printWO.garansi || '-'}</span>
                  </div>
                  {printWO.priority === 1 && <div className="text-xs font-black border-2 border-[#ef4444] text-[#ef4444] px-2.5 py-0.5 uppercase tracking-wider h-8 flex items-center justify-center rounded bg-red-50">Priority 1 : URGENT</div>}
                  {printWO.priority === 2 && <div className="text-xs font-black border-2 border-yellow-500 text-yellow-600 px-2.5 py-0.5 uppercase tracking-wider h-8 flex items-center justify-center rounded bg-yellow-50">Priority 2 : BOOKING</div>}
                  {printWO.priority === 3 && <div className="text-xs font-black border-2 border-blue-600 text-blue-600 px-2.5 py-0.5 uppercase tracking-wider h-8 flex items-center justify-center rounded bg-blue-50">Priority 3 : REGULAR</div>}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3 text-[9px]">
              {/* Customer Profile */}
              <div className="border border-slate-200 bg-slate-50/20 rounded-lg p-2 shadow-2xs">
                <div className="grid grid-cols-2 gap-3 text-[#0f172a]">
                  <div>
                    <h3 className="font-extrabold border-b border-slate-200 pb-1 mb-1.5 text-[#1e3a8a] text-[8px] uppercase tracking-wider flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span> Data Pemilik
                    </h3>
                    <div className="grid grid-cols-4 gap-y-1 gap-x-0.5 text-[8.5px]">
                      <span className="text-slate-500 col-span-1">Nama:</span> <span className="col-span-3 font-bold text-slate-800 truncate">{printWO.customerName}</span>
                      <span className="text-slate-500 col-span-1">Telp:</span> <span className="col-span-3 text-slate-800 font-mono">{printWO.customerPhone}</span>
                      <span className="text-slate-500 col-span-1">Alamat:</span> <span className="col-span-3 font-medium text-slate-700 truncate">{printWO.customerAddress || '-'}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-extrabold border-b border-slate-200 pb-1 mb-1.5 text-[#1e3a8a] text-[8px] uppercase tracking-wider flex items-center gap-1">
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
                <h3 className="font-extrabold border-b border-slate-200 pb-1 mb-1.5 text-[#1e3a8a] text-[8px] uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span> Identitas Teknis Komponen
                </h3>
                <div className="grid grid-cols-3 gap-y-1 gap-x-0.5 text-[8.5px] text-slate-800">
                  <span className="text-slate-500">Model/Year:</span> <span className="col-span-2 font-bold text-slate-900">{printWO.vehicleBrand}</span>
                  <span className="text-slate-500">No. Polisi:</span> <span className="col-span-2 font-black text-blue-800 tracking-wider font-mono bg-blue-50 px-1 rounded inline-block w-fit">{printWO.plateNumber || '-'}</span>
                  <span className="text-slate-500">No. Rangka (VIN):</span> <span className="col-span-2 font-mono">{printWO.vin || '-'}</span>
                </div>
              </div>
            </div>

            {/* Operational Meta Row */}
            <div className="bg-blue-50/20 px-3 py-1.5 border border-blue-100 rounded-lg text-[9px] flex justify-between items-center mb-3 shadow-3xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                <span className="font-semibold text-slate-500">Waktu Masuk (Intake):</span>{' '}
                <span className="font-mono font-black text-[#1e3a8a]">
                  {printWO.intakeDate ? new Date(printWO.intakeDate).toLocaleString('id-ID') : '-'}
                </span>
              </div>
            </div>

            {/* A. COMPONENT/INJECTOR SERIALIZATION */}
            {printWO.looseParts && printWO.looseParts.length > 0 && printWO.dropMethod !== 'WHOLE' && (
              <div className="mb-2">
                <h3 className="font-bold bg-[#1e3a8a] text-white p-1 border border-[#1e3a8a] mb-0 uppercase tracking-widest text-[9px] px-2">A. COMPONENT/INJECTOR SERIALIZATION</h3>
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
                  <h3 className="font-bold bg-[#1e3a8a] text-white p-1 border border-[#1e3a8a] mb-0 uppercase tracking-widest text-[9px] px-2">
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
                          <td className="border border-slate-300 p-0.5 px-2 font-bold text-emerald-800 bg-emerald-50/10">
                            {printWO.repairResults?.[idx] || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })()}

            {/* C. LAPORAN KALIBRASI TEST BENCH (DIESEL CALIBRATION REPORT) */}
            {printWO.calibrationData && (
              <div className="mb-2">
                <h3 className="font-bold bg-[#1e3a8a] text-white p-1 border border-[#1e3a8a] mb-0 uppercase tracking-widest text-[9px] px-2">
                  C. LAPORAN PENGUJIAN & KALIBRASI TEST BENCH (CALIBRATION REPORT)
                </h3>
                <table className="w-full border-collapse border border-slate-300 text-[9px] text-[#0f172a]">
                  <thead>
                    <tr className="bg-slate-100 text-[8px] font-bold uppercase text-slate-700">
                      <th className="border border-slate-300 p-0.5 text-left w-1/3 px-2">PARAMETER PENGUJIAN</th>
                      <th className="border border-slate-300 p-0.5 text-center w-1/3">KONDISI AWAL (BEFORE)</th>
                      <th className="border border-slate-300 p-0.5 text-center w-1/3">KONDISI AKHIR (AFTER)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="h-5">
                      <td className="border border-slate-300 p-0.5 px-2 font-bold">Volume Semprotan (Spray Volume)</td>
                      <td className="border border-slate-300 p-0.5 text-center font-mono font-bold text-red-700 bg-red-50/5">
                        {printWO.calibrationData.volumeSemprotan?.sebelum || '-'}
                      </td>
                      <td className="border border-slate-300 p-0.5 text-center font-mono font-bold text-emerald-800 bg-emerald-50/5">
                        {printWO.calibrationData.volumeSemprotan?.sesudah || '-'}
                      </td>
                    </tr>
                    <tr className="h-5 bg-slate-50">
                      <td className="border border-slate-300 p-0.5 px-2 font-bold">Debit Backleak (Backleak Flow)</td>
                      <td className="border border-slate-300 p-0.5 text-center font-mono font-bold text-red-700 bg-red-50/5">
                        {printWO.calibrationData.debitBackleak?.sebelum || '-'}
                      </td>
                      <td className="border border-slate-300 p-0.5 text-center font-mono font-bold text-emerald-800 bg-emerald-50/5">
                        {printWO.calibrationData.debitBackleak?.sesudah || '-'}
                      </td>
                    </tr>
                    <tr className="h-5">
                      <td className="border border-slate-300 p-0.5 px-2 font-bold">Tekanan Pembukaan (Opening Pressure)</td>
                      <td className="border border-slate-300 p-0.5 text-center font-mono font-bold text-red-700 bg-red-50/5">
                        {printWO.calibrationData.tekanan?.sebelum || '-'}
                      </td>
                      <td className="border border-slate-300 p-0.5 text-center font-mono font-bold text-emerald-800 bg-emerald-50/5">
                        {printWO.calibrationData.tekanan?.sesudah || '-'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* B. ACTION & PARTS TO-DO BUILDER (TO-DO LIST) */}
            {printWO.todoActions && printWO.todoActions.length > 0 && (
              <div className="mb-2">
                <h3 className="font-bold bg-[#1e3a8a] text-white p-1 border border-[#1e3a8a] mb-0 uppercase tracking-widest text-[9px] px-2">DAFTAR TINDAKAN & RENCANA SUKU CADANG (TO-DO LIST)</h3>
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
                      <td className="border border-slate-300 p-0.5 px-2 text-right font-mono text-[9px] text-[#1e3a8a]">
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

            <div className="mb-2 text-[6pt] leading-snug text-slate-700 text-justify border border-slate-200 p-1.5 rounded">
              <p className="font-bold mb-0.5 uppercase text-[#1e3a8a] text-[6.5pt]">SYARAT DAN KETENTUAN</p>
              <ol className="list-decimal pl-3 space-y-0.5">
                <li>Kendaraan diserahkan kepada bengkel untuk dilakukan pemeriksaan dan/atau perbaikan sesuai permintaan pelanggan.</li>
                <li>Pelanggan memberikan izin kepada bengkel untuk melakukan pembongkaran komponen yang diperlukan guna proses diagnosa dan perbaikan.</li>
                <li>Hasil pemeriksaan dapat menemukan kerusakan tambahan yang sebelumnya tidak terlihat dari pemeriksaan awal.</li>
                <li>Penggantian sparepart atau pekerjaan tambahan dapat dilakukan setelah memperoleh persetujuan pelanggan dan akan menimbulkan tambahan biaya.</li>
                <li>Apabila pelanggan meminta pembatalan penggantian komponen atau meminta pemasangan kembali komponen lama setelah dilakukan pembongkaran, pelanggan memahami dan menyetujui bahwa performa kendaraan mungkin tidak kembali seperti semula dan bengkel tidak bertanggung jawab atas penurunan fungsi, performa, atau timbulnya kerusakan lanjutan yang diakibatkan oleh penggunaan kembali komponen lama tersebut.</li>
                <li>Dalam hal pelanggan secara tegas menginstruksikan pemasangan kembali sparepart lama yang menurut pertimbangan teknis bengkel tidak direkomendasikan, maka seluruh risiko atas hasil pekerjaan menjadi tanggung jawab pelanggan.</li>
                <li>Jasa pemeriksaan, pembongkaran, pemasangan kembali, and pekerjaan yang telah dilakukan tetap wajib dibayarkan meskipun pelanggan membatalkan penggantian sparepart atau memilih tidak melanjutkan perbaikan.</li>
                <li>Bengkel tidak bertanggung jawab atas kerusakan yang telah ada sebelumnya atau kerusakan lain yang tidak berkaitan dengan pekerjaan yang dilakukan.</li>
                <li>Pelanggan memberikan izin kepada bengkel untuk melakukan uji fungsi atau test jalan apabila diperlukan dalam rangka memastikan hasil pekerjaan.</li>
                <li>Dengan menandatangani dokumen ini, pelanggan menyatakan telah membaca, memahami, dan menyetujui seluruh isi Surat Perintah Kerja.</li>
              </ol>
            </div>
          </div>

          {/* Signatures Page 2 Bottom */}
          <div className="mt-1 border-t border-slate-200 pt-1">
            <div className="grid grid-cols-4 gap-2 text-center text-[8px]">
              <div>
                <div className="h-16 border-b border-slate-300 mb-1.5"></div>
                <p className="font-bold text-[#0f172a]">Tanda Tangan Pelanggan</p>
              </div>
              <div>
                <div className="h-16 border-b border-slate-300 mb-1.5"></div>
                <p className="font-bold text-[#0f172a]">Mekanik Pemeriksa / Tester</p>
              </div>
              <div>
                <div className="h-16 border-b border-slate-300 mb-1.5"></div>
                <p className="font-bold text-[#0f172a]">Service Advisor (SA)</p>
              </div>
              <div>
                <div className="h-16 border-b border-slate-300 mb-1.5"></div>
                <p className="font-bold text-[#0f172a]">Foreman / Kepala Bengkel</p>
              </div>
            </div>
          </div>
        </div>
            </td>
          </tr>
        </tbody>
        <tfoot className="table-footer-group">
          <tr>
            <td className="pt-3 border-t-2 border-[#1e3a8a]/20">
              <div className="flex justify-between items-center text-[8px] text-slate-500 font-sans">
                <div className="flex flex-col text-left">
                  <span className="font-extrabold text-[#1e3a8a] tracking-wider uppercase">ITech Authorized Dealer & Workshop</span>
                  <span className="text-slate-500 mt-0.5">Jl. Riau Ujung No.898-904 Pekanbaru</span>
                </div>
                <div className="text-right flex flex-col font-mono text-[7.5px] items-end">
                  <span className="text-slate-400">Dicetak otomatis via Indo Teknik ERP pada {new Date().toLocaleDateString('id-ID')}</span>
                  <span className="font-semibold text-[#1e3a8a] mt-0.5 tracking-widest uppercase">Dokumen Resmi Pelanggan</span>
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
