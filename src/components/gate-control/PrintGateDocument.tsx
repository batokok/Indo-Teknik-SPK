import React, { useRef, useState } from 'react';
import { useApp } from '../../store/AppContext';
import { GatePrintDocumentType, GateEntry, GateExitDocument, HandoverDocument } from '../../types';
import { SmartLogo } from '../SmartLogo';
import { 
  Printer, 
  X, 
  Download, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Car, 
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { DocumentWatermark, WatermarkControl, WatermarkConfig, DEFAULT_WATERMARK_CONFIG } from '../DocumentWatermark';

export const PrintGateDocument: React.FC = () => {
  const { printGateDoc, setPrintGateDoc } = useApp();
  const printAreaRef = useRef<HTMLDivElement>(null);
  const [watermarkConfig, setWatermarkConfig] = useState<WatermarkConfig>(DEFAULT_WATERMARK_CONFIG);

  if (!printGateDoc) return null;

  const handlePrint = () => {
    window.print();
  };

  const { type, data } = printGateDoc;

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-start overflow-y-auto p-2 sm:p-6 print:p-0 print:bg-white print:static print:overflow-visible print:z-auto">
      {/* Top Floating Control Bar (Hidden on Print) */}
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl p-3 sm:p-4 mb-4 flex items-center justify-between shadow-2xl print:hidden sticky top-2 z-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Printer className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded border border-blue-500/30">
                Archival Print Engine
              </span>
              <span className="text-xs font-mono text-slate-400">Doc ID: {(data as any).id}</span>
            </div>
            <h4 className="text-sm font-black text-white uppercase tracking-tight">
              {type === 'BARANG_MASUK' && 'Tanda Terima Barang Masuk'}
              {type === 'SURAT_JALAN' && 'Surat Jalan / Pengeluaran Barang'}
              {type === 'SERAH_TERIMA' && 'Berita Acara Serah Terima (BAST)'}
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Watermark Control */}
          <WatermarkControl 
            config={watermarkConfig} 
            onChange={setWatermarkConfig} 
            documentStatus={(data as any).status} 
            documentType={type} 
          />

          <button
            type="button"
            onClick={handlePrint}
            className="h-10 px-5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider rounded-xl flex items-center gap-2 shadow-lg shadow-blue-900/50 transition-all cursor-pointer active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Dokumen Sekarang</span>
          </button>

          <button
            type="button"
            onClick={() => setPrintGateDoc(null)}
            className="h-10 px-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase rounded-xl transition-all cursor-pointer"
            title="Tutup Preview"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Printable Sheet (Single Page Strict Industrial Archival Layout) */}
      <div 
        ref={printAreaRef}
        className="relative overflow-hidden w-full max-w-[210mm] min-h-[297mm] bg-white text-black p-8 sm:p-10 shadow-2xl rounded-sm print:shadow-none print:m-0 print:p-6 print:w-full print:max-w-none print:min-h-0 flex flex-col justify-between"
        style={{
          fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif",
          color: '#000000',
          backgroundColor: '#ffffff'
        }}
      >
        {/* Subtle Customizable Watermark */}
        <DocumentWatermark 
          config={watermarkConfig} 
          documentStatus={(data as any).status} 
          documentType={type} 
        />

        {/* Document Content Top */}
        <div className="relative z-1 space-y-4">
          {/* Header Workshop */}
          <div className="border-b-2 border-black pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <SmartLogo baseName="logo-indo-teknik" alt="IT INDO TEKNIK" className="h-11 w-auto object-contain" />
                <SmartLogo baseName="logo-itech" alt="ITech" className="h-9 w-auto object-contain" />
                <div className="border-l-2 border-black pl-3">
                  <h1 className="text-xl font-black tracking-tight leading-none text-black uppercase">
                    INDO TEKNIK PEKANBARU
                  </h1>
                  <p className="text-[11.5px] font-extrabold text-[#0F2D59] tracking-wide mt-0.5">
                    One Stop Solution for All Your Diesel Needs
                  </p>
                  <p className="text-[10px] text-black font-semibold leading-tight mt-0.5">
                    Jl. Riau Ujung No.898-904, Pekanbaru • Telp: (0761) 853798
                  </p>
                </div>
              </div>

              {/* Prominent Document / WO Badge (Clear, Large, High Contrast without unnecessary Barcode/QR) */}
              <div className="flex flex-col items-end justify-center py-2 px-3 border-2 border-black rounded bg-slate-50 shrink-0 text-right">
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-wider">
                  {type === 'BARANG_MASUK' && 'NO. TANDA TERIMA'}
                  {type === 'SURAT_JALAN' && 'NO. SURAT JALAN'}
                  {type === 'SERAH_TERIMA' && 'NO. SERAH TERIMA'}
                </span>
                <span className="text-base sm:text-lg font-mono font-black text-black tracking-tight mt-0.5">
                  {(data as any).id}
                </span>
                {Boolean((data as any).relatedWOId || (data as any).referenceNumber) && (
                  <span className="text-[9.5px] font-mono font-bold text-blue-900 mt-0.5 bg-blue-100 px-1.5 py-0.5 rounded border border-blue-300">
                    REF: {(data as any).relatedWOId || (data as any).referenceNumber}
                  </span>
                )}
              </div>
            </div>

            {/* Document Title Bar */}
            <div className="mt-3 py-1.5 bg-black text-white px-3 flex items-center justify-between font-mono">
              <span className="text-xs font-black tracking-wider uppercase">
                {type === 'BARANG_MASUK' && 'BUKTI TANDA TERIMA BARANG MASUK'}
                {type === 'SURAT_JALAN' && 'SURAT JALAN PENGELUARAN BARANG (GATE PASS)'}
                {type === 'SERAH_TERIMA' && 'BERITA ACARA SERAH TERIMA UNIT & KOMPONEN (BAST)'}
              </span>
              <span className="text-xs font-black">
                NO: {(data as any).id}
              </span>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-4 border border-black p-3 bg-white text-[11px]">
            {/* Left Column */}
            <div className="space-y-1.5 border-r border-black/30 pr-3">
              <div className="flex justify-between">
                <span className="font-bold text-black uppercase">Tanggal & Waktu:</span>
                <span className="font-mono text-black font-bold">{(data as any).date} • {(data as any).time}</span>
              </div>

              {type === 'BARANG_MASUK' && (
                <>
                  <div className="flex justify-between">
                    <span className="font-bold text-black uppercase">Nama Pembawa:</span>
                    <span className="font-bold text-black">{(data as GateEntry).bringerName}</span>
                  </div>
                  {(data as GateEntry).bringerPhone && (
                    <div className="flex justify-between">
                      <span className="font-bold text-black uppercase">No. Telp Pembawa:</span>
                      <span className="font-mono text-black">{(data as GateEntry).bringerPhone}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="font-bold text-black uppercase">Konsumen / Pemilik:</span>
                    <span className="font-bold text-black">{(data as GateEntry).customerName || '-'}</span>
                  </div>
                </>
              )}

              {type === 'SURAT_JALAN' && (
                <>
                  <div className="flex justify-between">
                    <span className="font-bold text-black uppercase">Pembawa / Sopir:</span>
                    <span className="font-bold text-black">{(data as GateExitDocument).bringerName}</span>
                  </div>
                  {(data as GateExitDocument).driverPlateNumber && (
                    <div className="flex justify-between">
                      <span className="font-bold text-black uppercase">No. Polisi Kendaraan:</span>
                      <span className="font-mono font-black text-black">{(data as GateExitDocument).driverPlateNumber}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="font-bold text-black uppercase">Atas Nama Penerima:</span>
                    <span className="font-bold text-black">{(data as GateExitDocument).customerName || '-'}</span>
                  </div>
                </>
              )}

              {type === 'SERAH_TERIMA' && (
                <>
                  <div className="flex justify-between">
                    <span className="font-bold text-black uppercase">Konsumen / Pemilik:</span>
                    <span className="font-bold text-black">{(data as HandoverDocument).customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold text-black uppercase">Nama Penerima Fisik:</span>
                    <span className="font-bold text-black">{(data as HandoverDocument).recipientName}</span>
                  </div>
                  {(data as HandoverDocument).recipientPhone && (
                    <div className="flex justify-between">
                      <span className="font-bold text-black uppercase">No. Telp Penerima:</span>
                      <span className="font-mono text-black">{(data as HandoverDocument).recipientPhone}</span>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-1.5 pl-1">
              {type === 'BARANG_MASUK' && (
                <>
                  <div className="flex justify-between">
                    <span className="font-bold text-black uppercase">Kategori Masuk:</span>
                    <span className="font-bold text-black">{(data as GateEntry).entryType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold text-black uppercase">Kondisi Awal:</span>
                    <span className="font-bold text-black">{(data as GateEntry).condition}</span>
                  </div>
                  {(data as GateEntry).vehiclePlateNumber && (
                    <div className="flex justify-between">
                      <span className="font-bold text-black uppercase">No. Polisi:</span>
                      <span className="font-mono font-black text-black">{(data as GateEntry).vehiclePlateNumber}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="font-bold text-black uppercase">Petugas Penerima:</span>
                    <span className="font-bold text-black">{(data as GateEntry).receivedBy}</span>
                  </div>
                </>
              )}

              {type === 'SURAT_JALAN' && (
                <>
                  <div className="flex justify-between">
                    <span className="font-bold text-black uppercase">Jenis Pengeluaran:</span>
                    <span className="font-bold text-black">{(data as GateExitDocument).exitType}</span>
                  </div>
                  {(data as GateExitDocument).referenceNumber && (
                    <div className="flex justify-between">
                      <span className="font-bold text-black uppercase">No. Referensi:</span>
                      <span className="font-mono font-black text-black">{(data as GateExitDocument).referenceNumber}</span>
                    </div>
                  )}
                  {(data as GateExitDocument).destination && (
                    <div className="flex justify-between">
                      <span className="font-bold text-black uppercase">Tujuan Pengiriman:</span>
                      <span className="text-black text-right font-medium">{(data as GateExitDocument).destination}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="font-bold text-black uppercase">Diterbitkan Oleh:</span>
                    <span className="font-bold text-black">{(data as GateExitDocument).createdBy}</span>
                  </div>
                </>
              )}

              {type === 'SERAH_TERIMA' && (
                <>
                  {(data as HandoverDocument).relatedWOId && (
                    <div className="flex justify-between">
                      <span className="font-bold text-black uppercase">No. SPK Terkait:</span>
                      <span className="font-mono font-black text-black">{(data as HandoverDocument).relatedWOId}</span>
                    </div>
                  )}
                  {(data as HandoverDocument).vehiclePlateNumber && (
                    <div className="flex justify-between">
                      <span className="font-bold text-black uppercase">Kendaraan / No Pol:</span>
                      <span className="font-mono font-black text-black">
                        {(data as HandoverDocument).vehiclePlateNumber} {((data as HandoverDocument).vehicleBrandModel ? `(${(data as HandoverDocument).vehicleBrandModel})` : '')}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="font-bold text-black uppercase">Masa Garansi:</span>
                    <span className="font-bold text-black">{(data as HandoverDocument).warrantyPeriod || '1 Bulan'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold text-black uppercase">Petugas SA:</span>
                    <span className="font-bold text-black">{(data as HandoverDocument).createdBy}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Main Table Details */}
          <div className="border border-black">
            <div className="bg-black text-white text-[10px] font-black uppercase px-3 py-1 font-mono flex items-center justify-between">
              <span>RINCIAN BARANG / KOMPONEN</span>
              <span>VERIFIKASI FISIK WORKSHOP</span>
            </div>

            {type === 'BARANG_MASUK' && (
              <div className="p-3 text-xs space-y-2">
                <div className="flex items-start justify-between border-b border-black/20 pb-2">
                  <div>
                    <span className="font-bold text-black block text-sm">{(data as GateEntry).itemsDescription}</span>
                    {(data as GateEntry).conditionNotes && (
                      <span className="text-[11px] text-black italic block mt-0.5">
                        Catatan Cacat/Kondisi: {(data as GateEntry).conditionNotes}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="font-black text-base font-mono">{(data as GateEntry).qty || 1}</span>
                    <span className="text-xs font-bold uppercase ml-1">{(data as GateEntry).unit}</span>
                  </div>
                </div>
                {(data as GateEntry).notes && (
                  <p className="text-[11px] text-black">
                    <strong>Catatan Workshop:</strong> {(data as GateEntry).notes}
                  </p>
                )}
              </div>
            )}

            {(type === 'SURAT_JALAN' || type === 'SERAH_TERIMA') && (
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-black bg-slate-100 text-[10px] font-black uppercase font-mono">
                    <th className="p-2 border-r border-black w-10 text-center">No</th>
                    <th className="p-2 border-r border-black">Nama Barang / Deskripsi Komponen</th>
                    <th className="p-2 border-r border-black w-24 text-center">Jumlah (Qty)</th>
                    {type === 'SERAH_TERIMA' && (
                      <th className="p-2 border-r border-black w-32">Kondisi</th>
                    )}
                    <th className="p-2">Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {((data as any).items || []).map((item: any, idx: number) => (
                    <tr key={idx} className="border-b border-black/20 text-[11px]">
                      <td className="p-2 border-r border-black text-center font-mono font-bold">{idx + 1}</td>
                      <td className="p-2 border-r border-black font-bold text-black">{item.name}</td>
                      <td className="p-2 border-r border-black text-center font-mono font-bold">
                        {item.qty} {item.unit}
                      </td>
                      {type === 'SERAH_TERIMA' && (
                        <td className="p-2 border-r border-black">{item.condition || 'Baik'}</td>
                      )}
                      <td className="p-2 text-black">{item.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Special Section: Satpam / Gate Verification for Surat Jalan */}
          {type === 'SURAT_JALAN' && (
            <div className="border-2 border-black p-3 bg-white space-y-2">
              <div className="flex items-center justify-between border-b border-black pb-1">
                <span className="text-[11px] font-black uppercase font-mono tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-black" /> LEMBAR VERIFIKASI FISIK POS SATPAM / GATE
                </span>
                <span className="text-[9px] font-bold uppercase text-black">
                  Wajib Diperiksa Fisik Sebelum Kendaraan Keluar Area Bengkel
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-[10px] pt-1">
                <div>
                  <span className="font-bold block uppercase">Nama Petugas Satpam:</span>
                  <div className="border-b border-black h-6 mt-1 flex items-end">
                    <span className="font-mono text-xs">{(data as GateExitDocument).satpamCheckedBy || ''}</span>
                  </div>
                </div>
                <div>
                  <span className="font-bold block uppercase">Jam Kendaraan Keluar:</span>
                  <div className="border-b border-black h-6 mt-1 flex items-end">
                    <span className="font-mono text-xs">{(data as GateExitDocument).satpamExitTime || ''}</span>
                  </div>
                </div>
                <div>
                  <span className="font-bold block uppercase">Status Pemeriksaan:</span>
                  <div className="border-b border-black h-6 mt-1 flex items-end">
                    <span className="font-mono text-xs font-bold">[ &nbsp; ] SESUAI FISIK & JUMLAH</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Special Section: Warranty & Disclaimer for Serah Terima */}
          {type === 'SERAH_TERIMA' && (
            <div className="border border-black p-2.5 bg-white text-[9.5px] leading-tight space-y-1">
              <span className="font-black uppercase block border-b border-black pb-0.5">
                KETENTUAN GARANSI & REKOMENDASI TEKNIS WORKSHOP:
              </span>
              <p>
                1. Garansi berlaku selama <strong>{(data as HandoverDocument).warrantyPeriod || '1 Bulan / 1.000 KM'}</strong> sejak tanggal serah terima untuk pekerjaan kalibrasi / perbaikan yang tercantum.
              </p>
              <p>
                2. Garansi tidak berlaku apabila terjadi kontaminasi bahan bakar (solar kotor/bercampur air), kelalaian filter solar tidak diganti, atau pembongkaran oleh pihak lain tanpa persetujuan resmi workshop Indo Teknik.
              </p>
              {(data as HandoverDocument).notes && (
                <p className="font-bold pt-0.5 text-black">
                  Catatan SA: {(data as HandoverDocument).notes}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Bottom Signatures (Archival Standardized Placement) */}
        <div className="relative z-1 pt-6 mt-4 border-t-2 border-black">
          {type === 'BARANG_MASUK' && (
            <div className="grid grid-cols-2 gap-8 text-center text-xs">
              <div>
                <p className="font-bold uppercase text-black text-[10px]">Yang Menyerahkan (Pembawa)</p>
                <div className="h-16 border-b border-black mt-2 flex items-end justify-center pb-1">
                  <span className="font-bold text-black">{(data as GateEntry).bringerName}</span>
                </div>
                <p className="text-[9px] text-black mt-1">Nama Jelas & Tanda Tangan</p>
              </div>

              <div>
                <p className="font-bold uppercase text-black text-[10px]">Penerima Workshop</p>
                <div className="h-16 border-b border-black mt-2 flex items-end justify-center pb-1">
                  <span className="font-bold text-black">{(data as GateEntry).receivedBy}</span>
                </div>
                <p className="text-[9px] text-black mt-1">Petugas Workshop Indo Teknik</p>
              </div>
            </div>
          )}

          {type === 'SURAT_JALAN' && (
            <div className="grid grid-cols-3 gap-6 text-center text-xs">
              <div>
                <p className="font-bold uppercase text-black text-[10px]">Penerbit Surat Jalan</p>
                <div className="h-16 border-b border-black mt-2 flex items-end justify-center pb-1">
                  <span className="font-bold text-black">{(data as GateExitDocument).createdBy}</span>
                </div>
                <p className="text-[9px] text-black mt-1">Petugas Workshop</p>
              </div>

              <div>
                <p className="font-bold uppercase text-black text-[10px]">Pembawa / Pengemudi</p>
                <div className="h-16 border-b border-black mt-2 flex items-end justify-center pb-1">
                  <span className="font-bold text-black">{(data as GateExitDocument).bringerName}</span>
                </div>
                <p className="text-[9px] text-black mt-1">Nama Jelas Sopir</p>
              </div>

              <div>
                <p className="font-bold uppercase text-black text-[10px]">Petugas Pos Satpam (Gate)</p>
                <div className="h-16 border-b border-black mt-2 flex items-end justify-center pb-1">
                  <span className="font-bold text-black">______________________</span>
                </div>
                <p className="text-[9px] text-black mt-1">Tanda Tangan & Verifikasi</p>
              </div>
            </div>
          )}

          {type === 'SERAH_TERIMA' && (
            <div className="grid grid-cols-2 gap-8 text-center text-xs">
              <div>
                <p className="font-bold uppercase text-black text-[10px]">Diserahkan Oleh (Workshop)</p>
                <div className="h-16 border-b border-black mt-2 flex items-end justify-center pb-1">
                  <span className="font-bold text-black">{(data as HandoverDocument).createdBy}</span>
                </div>
                <p className="text-[9px] text-black mt-1">Service Advisor / Authorized</p>
              </div>

              <div>
                <p className="font-bold uppercase text-black text-[10px]">Diterima Oleh (Konsumen/Pembawa)</p>
                <div className="h-16 border-b border-black mt-2 flex items-end justify-center pb-1">
                  <span className="font-bold text-black">{(data as HandoverDocument).recipientName}</span>
                </div>
                <p className="text-[9px] text-black mt-1">Tanda Tangan & Nama Jelas</p>
              </div>
            </div>
          )}

          {/* Footer Archival Info */}
          <div className="flex items-center justify-between text-[8.5px] font-mono text-black uppercase mt-3 pt-2 border-t border-black/20">
            <span>INDO TEKNIK PEKANBARU • ONE STOP SOLUTION FOR ALL YOUR DIESEL NEEDS</span>
            <span>DICETAK: {new Date().toLocaleString('id-ID')} WIB</span>
            <span>DOKUMEN ARSIP RESMI</span>
          </div>
        </div>
      </div>
    </div>
  );
};
