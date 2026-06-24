import React from 'react';
import { useApp } from '../store/AppContext';

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
    <div className="fixed inset-0 bg-white z-[100] overflow-y-auto print:block print:bg-transparent print:absolute print:inset-0 text-[#0f172a] font-sans">
      <div className="max-w-[210mm] mx-auto bg-white p-8 shadow-2xl print:shadow-none print:p-0">
        
        {/* ACTION BAR (Hidden in print) */}
        <div className="flex justify-between items-center mb-8 print:hidden no-print border-b pb-4">
          <h2 className="text-xl font-bold">Print Preview Mode</h2>
          <div className="flex space-x-4">
            <button onClick={() => setPrintWO(null)} className="px-4 py-2 border rounded hover:bg-slate-50 text-slate-700">Cancel</button>
            <button onClick={() => window.print()} className="px-4 py-2 bg-[#1e3a8a] text-white rounded hover:bg-blue-800 font-bold">Confirm Print</button>
          </div>
        </div>

        {/* --- PAGE 1: Customer Copy --- */}
        <div className="print-page print:h-[297mm] print:w-[210mm] print:p-[12mm] print:box-border flex flex-col justify-between border-b-2 border-slate-100 print:border-none pb-12 print:pb-0">
          <div className="flex-1">
            {/* Header */}
            <div className="flex justify-between items-center border-b-4 border-[#1e3a8a] pb-4 mb-4 gap-6">
              <div className="flex-shrink-0">
                <div className="flex items-center">
                  <img 
                    src="/logo-indo-teknik.png" 
                    alt="IT INDO TEKNIK" 
                    className="h-10 w-auto object-contain flex-shrink-0" 
                    style={{ height: '40px', maxWidth: '180px' }}
                  />
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <img 
                    src="/logo-itech.png" 
                    alt="ITech" 
                    className="h-6 w-auto object-contain flex-shrink-0" 
                    style={{ height: '24px', maxWidth: '60px' }}
                  />
                  <p className="text-xs font-bold tracking-widest text-[#1e3a8a] whitespace-nowrap">Authorized Dealer</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <h2 className="text-lg font-bold bg-slate-100 px-4 py-1.5 rounded border border-slate-300 text-[#1e3a8a] whitespace-nowrap">INSPECTION SHEET</h2>
                <p className="text-xs font-mono mt-1 text-[#0f172a] font-bold whitespace-nowrap">WO ID: {printWO.id}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
              {/* Customer Info */}
              <div className="border border-slate-300 rounded p-3">
                <h3 className="font-bold border-b border-slate-200 pb-1.5 mb-1.5 text-[#1e3a8a]">Customer Information</h3>
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-slate-500">Name:</span> <span className="col-span-2 font-bold">{printWO.customerName}</span>
                  <span className="text-slate-500">Phone:</span> <span className="col-span-2">{printWO.customerPhone}</span>
                  <span className="text-slate-500">Email:</span> <span className="col-span-2 truncate">{printWO.customerEmail || '-'}</span>
                  <span className="text-slate-500">Address:</span> <span className="col-span-2 font-medium">{printWO.customerAddress || '-'}</span>
                </div>
              </div>
              {/* Vehicle Info */}
              <div className="border border-slate-300 rounded p-3">
                <h3 className="font-bold border-b border-slate-200 pb-1.5 mb-1.5 text-[#1e3a8a]">Vehicle & Component Meta</h3>
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-slate-500">Brand/Model:</span> <span className="col-span-2 font-bold">{printWO.vehicleBrand}</span>
                  <span className="text-slate-500">Plate No:</span> <span className="col-span-2 font-bold text-blue-800">{printWO.plateNumber}</span>
                  <span className="text-slate-500">VIN No:</span> <span className="col-span-2">{printWO.vin || '-'}</span>
                  <span className="text-slate-500">Odo/HM:</span> <span className="col-span-2 font-semibold">{printWO.odometer}</span>
                  <span className="text-slate-500">Fuel Level:</span> <span className="col-span-2 font-semibold">{printWO.fuelLevel}</span>
                </div>
              </div>
            </div>

            {/* Operational Meta */}
            <div className="bg-slate-50 p-2 border border-slate-200 rounded text-xs flex justify-between items-center mb-4">
              <div>
                <span className="font-semibold text-slate-500">Intake Date/Time:</span>{' '}
                <span className="font-mono font-bold text-[#0f172a]">
                  {printWO.intakeDate ? new Date(printWO.intakeDate).toLocaleString('id-ID') : '-'}
                </span>
              </div>
            </div>

            {/* Estimation & Warranty Metadata */}
            <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
              <div className="border-b border-dashed border-slate-400 pb-1 flex justify-between">
                <span className="font-semibold text-[#1e3a8a]">Estimasi Waktu Pengerjaan:</span>{' '}
                <span className="text-[#0f172a] font-bold">{printWO.estimasiPengerjaan || '-'}</span>
              </div>
              <div className="border-b border-dashed border-slate-400 pb-1 flex justify-between">
                <span className="font-semibold text-[#1e3a8a]">Slot Garansi Pasca-Servis:</span>{' '}
                <span className="text-[#0f172a] font-bold truncate ml-2">{printWO.garansi || '-'}</span>
              </div>
            </div>

            <div className="mb-4 text-xs">
              <h3 className="font-bold bg-slate-100 p-2 border border-slate-300 mb-0 text-[#1e3a8a]">Primary Complaint (Customer Voice)</h3>
              <div className="border border-t-0 border-slate-300 p-3 italic text-slate-700 min-h-[45px]">
                "{printWO.customerVoice}"
              </div>
            </div>

            {/* Damage & Inventory / Component Serialization */}
            {printWO.dropMethod === 'WHOLE' && (
              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Damage Outlines summary */}
                <div>
                  <h3 className="font-bold bg-slate-100 p-1.5 border border-slate-300 text-[#1e3a8a] text-xs">Visual Automotive Damage</h3>
                  <div className="border border-t-0 border-slate-300 p-2 min-h-[90px] text-[10px]">
                    {printWO.damages.length === 0 ? (
                      <p className="text-slate-500 italic text-center mt-6">No exterior/interior damages noted.</p>
                    ) : (
                      <div className="space-y-1 max-h-[110px] overflow-y-auto">
                        {printWO.damages.map(d => {
                          const partLabel = d.partId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                          return (
                            <div key={d.partId} className="bg-red-50 border border-red-200 px-2 py-0.5 rounded text-slate-800">
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
                  <h3 className="font-bold bg-slate-100 p-1.5 border border-slate-300 text-[#1e3a8a] text-xs">Inventory Checklist</h3>
                  <div className="border border-t-0 border-slate-300 p-2 min-h-[90px]">
                    <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[9px]">
                      {printWO.inventory.map(item => (
                        <div key={item.name} className="flex items-center">
                          <div className={`w-2.5 h-2.5 border border-slate-500 mr-1.5 flex items-center justify-center ${item.checked ? 'bg-slate-800' : ''}`}>
                            {item.checked && <span className="text-white text-[7px]">✓</span>}
                          </div>
                          <span className={item.checked ? 'font-semibold text-slate-900' : 'text-slate-400'}>{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Component Intake Tracking Array */}
            <div className="mb-4">
              <h3 className="font-bold bg-slate-100 p-1.5 border border-slate-300 mb-0 text-[#1e3a8a] text-xs uppercase tracking-wider">A. COMPONENT / INJECTOR SERIALIZATION</h3>
              <table className="w-full border-collapse border border-slate-300 text-xs">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="border border-slate-300 p-1.5 text-left w-1/3 font-semibold">Keterangan</th>
                    <th className="border border-slate-300 p-1.5 text-left w-1/3 font-semibold">Part Number (P/N)</th>
                    <th className="border border-slate-300 p-1.5 text-left w-1/3 font-semibold">Kondisi Fisik</th>
                  </tr>
                </thead>
                <tbody>
                  {(printWO.looseParts || []).map((part, i) => (
                    <tr key={part.id || i} className={`h-6 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                      <td className="border border-slate-300 p-1.5 font-semibold text-slate-800">{part.description || '-'}</td>
                      <td className="border border-slate-300 p-1.5 font-mono text-slate-800">{part.partNumber || '-'}</td>
                      <td className="border border-slate-300 p-1.5 text-slate-800">{part.physicalCondition}</td>
                    </tr>
                  ))}
                  {(!printWO.looseParts || printWO.looseParts.length < 4) && 
                    Array.from({ length: Math.max(1, 4 - (printWO.looseParts?.length || 0)) }).map((_, idx) => {
                      const absoluteIndex = (printWO.looseParts?.length || 0) + idx;
                      return (
                        <tr key={`empty1-${idx}`} className={`h-6 ${absoluteIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                          <td className="border border-slate-300 p-1.5"></td>
                          <td className="border border-slate-300 p-1.5"></td>
                          <td className="border border-slate-300 p-1.5"></td>
                        </tr>
                      );
                    })
                  }
                </tbody>
              </table>
            </div>
          </div>

          {/* Signatures Lock to Page 1 Bottom */}
          <div className="mt-4 border-t border-slate-200 pt-4">
            <div className="grid grid-cols-4 gap-4 text-center text-[10px]">
              <div>
                <div className="h-10 border-b border-slate-300 mb-1"></div>
                <p className="font-bold text-[#0f172a]">Tanda Tangan Pelanggan</p>
              </div>
              <div>
                <div className="h-10 border-b border-slate-300 mb-1"></div>
                <p className="font-bold text-[#0f172a]">Mekanik Pemeriksa / Tester</p>
              </div>
              <div>
                <div className="h-10 border-b border-slate-300 mb-1"></div>
                <p className="font-bold text-[#0f172a]">Service Advisor (SA)</p>
              </div>
              <div>
                <div className="h-10 border-b border-slate-300 mb-1"></div>
                <p className="font-bold text-[#0f172a]">Diketahui Oleh: Foreman</p>
              </div>
            </div>
            <p className="text-[8px] text-slate-400 text-center mt-3 font-mono">Printed via iTech Authorized Local Terminal on {new Date().toLocaleDateString('id-ID')}</p>
          </div>
        </div>

        {/* --- PAGE 2: Internal Work Order (SPK) --- */}
        <div className="print-page print:h-[297mm] print:w-[210mm] print:p-[12mm] print:box-border flex flex-col justify-between pt-8 print:pt-0 pb-12 print:pb-0">
          <div className="flex-1">
            {/* Header */}
            <div className="flex justify-between items-start border-b-4 border-[#1e3a8a] pb-3 mb-4">
              <div>
                <h1 className="text-xl font-black tracking-tight text-[#1e3a8a] uppercase">Surat Perintah Kerja (SPK)</h1>
                <p className="text-[10px] font-bold tracking-widest text-slate-600">INTERNAL LAB ROUTING & PRODUCTION LINE</p>
              </div>
              <div className="text-right flex flex-col items-end">
                <div className="flex gap-2 items-center">
                  <div className="border-2 border-slate-800 px-2 py-0.5 text-[9px] font-black text-slate-800 flex items-center h-8 bg-slate-50 select-none">
                    WARRANTY: <span className="font-bold ml-1.5 uppercase">{printWO.garansi || '-'}</span>
                  </div>
                  {printWO.priority === 1 && <div className="text-xs font-black border-2 border-[#ef4444] text-[#ef4444] px-2.5 py-0.5 uppercase tracking-wider h-8 flex items-center justify-center rounded bg-red-50">Priority 1 : URGENT</div>}
                  {printWO.priority === 2 && <div className="text-xs font-black border-2 border-yellow-500 text-yellow-600 px-2.5 py-0.5 uppercase tracking-wider h-8 flex items-center justify-center rounded bg-yellow-50">Priority 2 : BOOKING</div>}
                  {printWO.priority === 3 && <div className="text-xs font-black border-2 border-blue-600 text-blue-600 px-2.5 py-0.5 uppercase tracking-wider h-8 flex items-center justify-center rounded bg-blue-50">Priority 3 : REGULAR</div>}
                </div>
                <p className="text-xs font-mono mt-1 text-[#0f172a] font-bold">WO ID: {printWO.id}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
              {/* Customer Profile */}
              <div className="border border-slate-300 rounded p-3">
                <h3 className="font-bold border-b border-slate-200 pb-1.5 mb-1.5 text-[#1e3a8a]">Customer / Company Profile</h3>
                <div className="grid grid-cols-3 gap-0.5 text-[#0f172a]">
                  <span className="text-slate-500">Nama Pelanggan:</span> <span className="col-span-2 font-bold">{printWO.customerName}</span>
                  <span className="text-slate-500">Alamat Lengkap:</span> <span className="col-span-2 font-medium">{printWO.customerAddress || '-'}</span>
                  <span className="text-slate-500">No. Telp/HP:</span> <span className="col-span-2 font-mono">{printWO.customerPhone}</span>
                  <span className="text-slate-500">Alamat Email:</span> <span className="col-span-2 truncate">{printWO.customerEmail || '-'}</span>
                </div>
              </div>
              {/* Component Technical Identity */}
              <div className="border border-slate-300 rounded p-3">
                <h3 className="font-bold border-b border-slate-200 pb-1.5 mb-1.5 text-[#1e3a8a]">Component Technical Identity</h3>
                <div className="grid grid-cols-3 gap-0.5 text-[#0f172a]">
                  <span className="text-slate-500">Model/Year:</span> <span className="col-span-2 font-bold">{printWO.vehicleBrand}</span>
                  <span className="text-slate-500">Plate Number:</span> <span className="col-span-2 font-bold text-blue-800">{printWO.plateNumber || '-'}</span>
                  <span className="text-slate-500">VIN No:</span> <span className="col-span-2">{printWO.vin || '-'}</span>
                </div>
              </div>
            </div>

            {/* Operational Meta Row */}
            <div className="bg-slate-50 p-2 border border-slate-200 rounded text-xs flex justify-between items-center mb-4">
              <div>
                <span className="font-semibold text-slate-500">Intake Date/Time:</span>{' '}
                <span className="font-mono font-bold text-[#0f172a]">
                  {printWO.intakeDate ? new Date(printWO.intakeDate).toLocaleString('id-ID') : '-'}
                </span>
              </div>
            </div>

            {/* A. COMPONENT/INJECTOR SERIALIZATION */}
            <div className="mb-4">
              <h3 className="font-bold bg-[#1e3a8a] text-white p-1.5 border border-[#1e3a8a] mb-0 uppercase tracking-widest text-[11px]">A. COMPONENT/INJECTOR SERIALIZATION</h3>
              <table className="w-full border-collapse border border-slate-300 text-xs text-[#0f172a]">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-slate-300 p-2 text-left w-1/3 font-bold">Keterangan</th>
                    <th className="border border-slate-300 p-2 text-left w-1/3 font-bold">Part Number (P/N)</th>
                    <th className="border border-slate-300 p-2 text-left w-1/3 font-bold">Kondisi Fisik</th>
                  </tr>
                </thead>
                <tbody>
                  {(printWO.looseParts || []).map((part, index) => (
                    <tr key={part.id || index} className={`h-6 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                      <td className="border border-slate-300 p-1.5 font-semibold">{part.description || '-'}</td>
                      <td className="border border-slate-300 p-1.5 font-mono">{part.partNumber || '-'}</td>
                      <td className="border border-slate-300 p-1.5 text-xs">{part.physicalCondition}</td>
                    </tr>
                  ))}
                  {(!printWO.looseParts || printWO.looseParts.length < 4) && 
                    Array.from({ length: Math.max(1, 4 - (printWO.looseParts?.length || 0)) }).map((_, idx) => {
                      const absoluteIndex = (printWO.looseParts?.length || 0) + idx;
                      return (
                        <tr key={`empty2-${idx}`} className={`h-6 ${absoluteIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                          <td className="border border-slate-300 p-1.5"></td>
                          <td className="border border-slate-300 p-1.5"></td>
                          <td className="border border-slate-300 p-1.5"></td>
                        </tr>
                      );
                    })
                  }
                </tbody>
              </table>
            </div>

            {/* RANGKUMAN HASIL PERBAIKAN (BEFORE VS AFTER) */}
            {(() => {
              const complaintLines = printWO.customerVoice
                ? printWO.customerVoice
                    .split('\n')
                    .map(l => l.trim())
                    .filter(l => l.length > 0 && !l.includes('[TEMUAN HIDDEN DEFECT]'))
                : [];

              return (
                <div className="mb-4">
                  <h3 className="font-bold bg-[#1e3a8a] text-white p-1.5 border border-[#1e3a8a] mb-0 uppercase tracking-widest text-[11px] px-2">
                    RANGKUMAN HASIL PERBAIKAN (BEFORE VS AFTER)
                  </h3>
                  <table className="w-full border-collapse border border-slate-300 text-xs text-[#0f172a]">
                    <thead>
                      <tr className="bg-slate-100 text-[10px] font-bold uppercase text-slate-700">
                        <th className="border border-slate-300 p-1.5 text-center w-[8%] font-bold">NO</th>
                        <th className="border border-slate-300 p-1.5 text-left w-[52%] font-bold">KELUHAN / KONDISI SEBELUM (BEFORE)</th>
                        <th className="border border-slate-300 p-1.5 text-left w-[40%] font-bold">STATUS / TINDAKAN SESUDAH (AFTER)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {complaintLines.length === 0 ? (
                        <tr className="h-6">
                          <td className="border border-slate-300 p-1.5 text-center text-slate-400 italic" colSpan={3}>
                            - Tidak ada data keluhan terdaftar -
                          </td>
                        </tr>
                      ) : (
                        complaintLines.map((line, idx) => (
                          <tr key={idx} className={`h-7 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                            <td className="border border-slate-300 p-1.5 text-center font-bold">{idx + 1}</td>
                            <td className="border border-slate-300 p-1.5 font-bold text-slate-800">{line}</td>
                            <td className="border border-slate-300 p-1.5 font-bold text-emerald-800 bg-emerald-50/10">
                              {printWO.repairResults?.[idx] || '-'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              );
            })()}

            {/* B. ACTION & PARTS TO-DO BUILDER (TO-DO LIST) */}
            {printWO.todoActions && printWO.todoActions.length > 0 && (
              <div className="mb-4">
                <h3 className="font-bold bg-[#1e3a8a] text-white p-1.5 border border-[#1e3a8a] mb-0 uppercase tracking-widest text-[11px] px-2">DAFTAR TINDAKAN & RENCANA SUKU CADANG (TO-DO LIST)</h3>
                <table className="w-full border-collapse border border-slate-300 text-[11px] text-[#0f172a]">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="border border-slate-300 p-1.5 text-left font-bold px-2">JENIS PENGERJAAN</th>
                      <th className="border border-slate-300 p-1.5 text-center w-12 font-bold">QTY</th>
                      <th className="border border-slate-300 p-1.5 text-left font-bold px-2">CATATAN MEKANIK</th>
                      <th className="border border-slate-300 p-1.5 text-left w-44 font-bold px-2">ESTIMASI HARGA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {printWO.todoActions.map((action) => (
                      <tr key={action.id} className="h-6">
                        <td className="border border-slate-300 p-1 px-2 font-medium">{action.jenisPengerjaan || '-'}</td>
                        <td className="border border-slate-300 p-1 text-center font-bold">{action.qty}</td>
                        <td className="border border-slate-300 p-1 px-2">{action.catatanMekanik || '-'}</td>
                        <td className="border border-slate-300 p-1 px-2 font-bold text-right font-mono">{formatRupiah(action.estimasiHarga) || '-'}</td>
                      </tr>
                    ))}
                    {/* Empty rows to ensure matrix has space for writing */}
                    {Array.from({ length: Math.max(0, 4 - printWO.todoActions.length) }).map((_, i) => (
                      <tr key={`empty-${i}`} className="h-6">
                        <td className="border border-slate-300 p-1"></td>
                        <td className="border border-slate-300 p-1 text-center"></td>
                        <td className="border border-slate-300 p-1"></td>
                        <td className="border border-slate-300 p-1"></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mb-4 text-[7.5pt] leading-snug text-slate-700 text-justify border border-slate-200 p-2 rounded">
              <p className="font-bold mb-0.5 uppercase text-[#1e3a8a]">Syarat & Ketentuan Servis (S&K):</p>
              <ol className="list-decimal pl-4 space-y-0.5">
                <li>Harap simpan copy SPK ini dan tunjukkan kepada petugas untuk validasi pengambilan barang/unit.</li>
                <li>Estimasi biaya jasa & parts serta estimasi waktu pengerjaan yang tercantum bersifat sementara. Apabila ditemukan kerusakan tambahan di luar kerusakan standar (hidden defects) pada komponen internal saat pembongkaran laboratorium, estimasi waktu pengerjaan dan nilai biaya dapat berubah sewaktu-waktu dengan konfirmasi terlebih dahulu.</li>
                <li>Indo Teknik tidak bertanggung jawab atas unit kendaraan, mesin, atau komponen lepasan (loose parts) yang tidak diambil oleh pemiliknya setelah melewati kurun waktu 3 (tiga) bulan sejak notifikasi selesai diterbitkan.</li>
                <li>Garansi pekerjaan tidak berlaku untuk suku cadang yang diperoleh atau dibawa sendiri dari luar oleh konsumen, atau jika kerusakan disebabkan oleh kontaminasi solar kotor/air.</li>
              </ol>
            </div>
          </div>

          {/* Signatures Page 2 Bottom */}
          <div className="mt-4 border-t border-slate-200 pt-4">
            <div className="grid grid-cols-4 gap-4 text-center text-[10px]">
              <div>
                <div className="h-10 border-b border-slate-300 mb-1"></div>
                <p className="font-bold text-[#0f172a]">Tanda Tangan Pelanggan</p>
              </div>
              <div>
                <div className="h-10 border-b border-slate-300 mb-1"></div>
                <p className="font-bold text-[#0f172a]">Mekanik Pemeriksa / Tester</p>
              </div>
              <div>
                <div className="h-10 border-b border-slate-300 mb-1"></div>
                <p className="font-bold text-[#0f172a]">Service Advisor (SA)</p>
              </div>
              <div>
                <div className="h-10 border-b border-slate-300 mb-1"></div>
                <p className="font-bold text-[#0f172a]">Foreman / Kepala Bengkel</p>
              </div>
            </div>
            <p className="text-[8px] text-slate-400 text-center mt-3 font-mono">Printed via iTech Authorized Local Terminal on {new Date().toLocaleDateString('id-ID')}</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PrintTemplate;
