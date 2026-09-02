import React, { useState } from 'react';
import { useApp } from '../../store/AppContext';
import { GateExitDocument, GateExitType, GateExitRefType, GateExitItem } from '../../types';
import { 
  X, 
  ArrowUpRight, 
  User, 
  Package, 
  Car, 
  FileText, 
  CheckCircle2, 
  Printer, 
  Plus, 
  Trash2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Calendar,
  Link2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BarangKeluarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessPrint?: (doc: GateExitDocument) => void;
  initialValues?: Partial<GateExitDocument>;
}

export const BarangKeluarModal: React.FC<BarangKeluarModalProps> = ({
  isOpen,
  onClose,
  onSuccessPrint,
  initialValues
}) => {
  const { currentUser, customers, workOrders, handoverDocuments, addGateExitDocument, setPrintGateDoc } = useApp();

  const [bringerName, setBringerName] = useState(initialValues?.bringerName || '');
  const [driverPlateNumber, setDriverPlateNumber] = useState(initialValues?.driverPlateNumber || '');
  const [selectedCustomerId, setSelectedCustomerId] = useState(initialValues?.customerId || '');
  const [customCustomerName, setCustomCustomerName] = useState(initialValues?.customerName || '');
  const [exitType, setExitType] = useState<GateExitType>(initialValues?.exitType || 'NORMAL_SALES');
  const [refType, setRefType] = useState<GateExitRefType>(initialValues?.refType || 'SERVICE_ORDER');
  const [referenceNumber, setReferenceNumber] = useState(initialValues?.referenceNumber || '');
  const [destination, setDestination] = useState(initialValues?.destination || '');
  const [notes, setNotes] = useState(initialValues?.notes || '');

  // Multi-item list
  const [items, setItems] = useState<GateExitItem[]>(() => {
    if (initialValues?.items && initialValues.items.length > 0) {
      return initialValues.items;
    }
    return [
      { id: '1', name: '', qty: 1, unit: 'Unit', notes: '' }
    ];
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedDoc, setSavedDoc] = useState<GateExitDocument | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Access control: Lina, SA, ADMIN, FOREMAN, MECHANIC, COMMON_RAIL, TURBO can see customer database dropdown.
  // BASIC users cannot see the confidential customer database dropdown and must type manually.
  const isLina = currentUser?.name?.toLowerCase().includes('lina') || currentUser?.username?.toLowerCase().includes('lina');
  const canAccessCustomerDatabase = Boolean(
    currentUser?.role === 'ADMIN' ||
    currentUser?.role === 'SA' ||
    currentUser?.role === 'FOREMAN' ||
    currentUser?.role === 'MECHANIC' ||
    currentUser?.role === 'COMMON_RAIL' ||
    currentUser?.role === 'TURBO' ||
    isLina
  );

  if (!isOpen) return null;

  // Resolve customer name (Privacy safe: name only)
  const resolvedCustomerName = canAccessCustomerDatabase && selectedCustomerId 
    ? (customers.find(c => c.id === selectedCustomerId)?.name || '')
    : customCustomerName;

  const addItemRow = () => {
    setItems(prev => [
      ...prev,
      { id: String(Date.now()), name: '', qty: 1, unit: 'Unit', notes: '' }
    ]);
  };

  const updateItemRow = (id: string, field: keyof GateExitItem, val: any) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, [field]: val };
      }
      return item;
    }));
  };

  const removeItemRow = (id: string) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const resetForm = () => {
    setBringerName('');
    setDriverPlateNumber('');
    setSelectedCustomerId('');
    setCustomCustomerName('');
    setExitType('NORMAL_SALES');
    setRefType('SERVICE_ORDER');
    setReferenceNumber('');
    setDestination('');
    setNotes('');
    setItems([{ id: '1', name: '', qty: 1, unit: 'Unit', notes: '' }]);
    setSavedDoc(null);
    setShowConfirmModal(false);
    setValidationError('');
  };

  const handleValidateAndOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!bringerName.trim()) {
      setValidationError('Nama pembawa / sopir pengambil barang wajib diisi.');
      return;
    }

    const validItems = items.filter(item => item.name.trim() !== '');
    if (validItems.length === 0) {
      setValidationError('Minimal harus ada 1 item barang yang akan dikeluarkan.');
      return;
    }

    setShowConfirmModal(true);
  };

  const handleFinalSubmit = async () => {
    try {
      setIsSubmitting(true);
      const now = new Date();
      const date = now.toISOString().split('T')[0];
      const time = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }) + ' WIB';

      const validItems = items.filter(item => item.name.trim() !== '').map((it, idx) => ({
        ...it,
        id: String(idx + 1)
      }));

      const docCreated = await addGateExitDocument({
        date,
        time,
        createdBy: currentUser?.name || 'Gate Operator',
        creatorUserId: currentUser?.id || 'anonymous',
        customerName: resolvedCustomerName.trim() || undefined,
        customerId: selectedCustomerId || undefined,
        bringerName: bringerName.trim(),
        driverPlateNumber: driverPlateNumber.trim() ? driverPlateNumber.toUpperCase().trim() : undefined,
        exitType,
        refType,
        referenceNumber: referenceNumber.trim() || undefined,
        handoverId: initialValues?.handoverId || undefined,
        items: validItems,
        destination: destination.trim() || undefined,
        notes: notes.trim() || undefined
      });

      setSavedDoc(docCreated);
      setShowConfirmModal(false);
      // Immediately open Print Preview & Print Layout
      setPrintGateDoc({ type: 'SURAT_JALAN', data: docCreated });
      if (onSuccessPrint) onSuccessPrint(docCreated);
      resetForm();
      onClose();
    } catch (err: any) {
      console.error(err);
      setValidationError(err.message || 'Gagal menerbitkan Surat Jalan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-950 via-slate-900 to-slate-900 border-b border-blue-800/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <ArrowUpRight className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Gate Control
                </span>
                <span className="text-xs text-slate-400 font-mono">Format: SJ-YYMMDD-XXXX</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide">
                Penerbitan Surat Jalan / Barang Keluar
              </h3>
            </div>
          </div>

          <button 
            type="button"
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Saved Success View */}
        {savedDoc ? (
          <div className="p-6 text-center flex-1 overflow-y-auto flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 mb-4 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-xl font-black text-white uppercase tracking-wide">
              Surat Jalan Berhasil Diterbitkan!
            </h4>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Nomor Surat Jalan: <strong className="text-blue-400 text-sm">{savedDoc.id}</strong>
            </p>

            <div className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-4 mt-5 text-left text-xs space-y-2">
              <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                <span className="text-slate-400">Pembawa / Sopir:</span>
                <span className="font-bold text-slate-200">{savedDoc.bringerName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                <span className="text-slate-400">Konsumen / Penerima:</span>
                <span className="font-bold text-slate-200">{savedDoc.customerName || '-'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                <span className="text-slate-400">Total Macam Item:</span>
                <span className="font-bold text-blue-400">{savedDoc.items.length} Macam Barang</span>
              </div>
              {savedDoc.referenceNumber && (
                <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                  <span className="text-slate-400">Nomor Referensi:</span>
                  <span className="font-mono font-bold text-amber-300">{savedDoc.referenceNumber}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-400">Diterbitkan Oleh:</span>
                <span className="font-bold text-slate-200">{savedDoc.createdBy}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 mt-6 w-full">
              <button
                type="button"
                onClick={() => {
                  setPrintGateDoc({ type: 'SURAT_JALAN', data: savedDoc });
                  if (onSuccessPrint) onSuccessPrint(savedDoc);
                }}
                className="w-full sm:flex-1 h-11 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-950/50 transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Surat Jalan</span>
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="w-full sm:w-auto px-5 h-11 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Buat Lagi</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  resetForm();
                  onClose();
                }}
                className="w-full sm:w-auto px-5 h-11 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
              >
                <span>Tutup</span>
              </button>
            </div>
          </div>
        ) : (
          /* Input Form View */
          <form onSubmit={handleValidateAndOpenConfirm} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
            {validationError && (
              <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Auto Info Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <div>
                  <span className="text-slate-500 block text-[9px] uppercase font-bold">Tanggal</span>
                  <span className="font-mono text-slate-200 font-bold">{new Date().toLocaleDateString('id-ID')}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <div>
                  <span className="text-slate-500 block text-[9px] uppercase font-bold">Waktu</span>
                  <span className="font-mono text-slate-200 font-bold">{new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</span>
                </div>
              </div>
              <div className="col-span-2 sm:col-span-1 flex items-center gap-1.5 border-t sm:border-t-0 border-slate-800 pt-1.5 sm:pt-0">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <div className="truncate">
                  <span className="text-slate-500 block text-[9px] uppercase font-bold">Penerbit</span>
                  <span className="text-blue-400 font-bold truncate">{currentUser?.name || 'Gate Operator'}</span>
                </div>
              </div>
            </div>

            {/* Section 1: Kategori & Referensi */}
            <div className="space-y-3">
              <h5 className="text-[11px] font-black uppercase text-blue-400 tracking-wider flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5" /> 1. Kategori & Referensi Dokumen
              </h5>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                    Jenis Pengeluaran <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={exitType}
                    onChange={(e) => setExitType(e.target.value as GateExitType)}
                    className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl px-3 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="NORMAL_SALES">Penjualan / Pengambilan Servis</option>
                    <option value="RETURN">Retur / Pengembalian Barang</option>
                    <option value="LOAN">Peminjaman Komponen / Alat</option>
                    <option value="TRANSFER">Transfer Cabang / Mitra</option>
                    <option value="INTERNAL">Keperluan Internal / Mobile Service</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                    Tipe Dokumen Acuan
                  </label>
                  <select
                    value={refType}
                    onChange={(e) => setRefType(e.target.value as GateExitRefType)}
                    className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl px-3 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="SERVICE_ORDER">SPK Servis (Work Order)</option>
                    <option value="HANDOVER">Berita Acara Serah Terima</option>
                    <option value="INVOICE">Nomor Faktur / Invoice</option>
                    <option value="SALES_ORDER">Sales Order (SO)</option>
                    <option value="INTERNAL">Memo / Surat Tugas Internal</option>
                    <option value="OTHER">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                    Nomor Referensi Acuan <span className="text-slate-500 text-[9px]">(Pilih/Ketik)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: WO-2026-0045 / ST-260901-1234"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl px-3 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Pembawa & Tujuan */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <h5 className="text-[11px] font-black uppercase text-blue-400 tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> 2. Pembawa, Penerima & Tujuan
              </h5>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Nama Pembawa (Wajib) */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                    Nama Pembawa / Sopir <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Pak Joko / Driver Ekspedisi"
                    value={bringerName}
                    onChange={(e) => setBringerName(e.target.value)}
                    className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                {/* No Pol Kendaraan Pengangkut */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                    No. Polisi Kendaraan Pengangkut <span className="text-slate-500 text-[9px]">(Opsional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: BM 9876 YZ"
                    value={driverPlateNumber}
                    onChange={(e) => setDriverPlateNumber(e.target.value.toUpperCase())}
                    className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl px-3 text-xs text-amber-300 font-mono font-bold uppercase placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              {/* Customer Link - Guarded by Role Privacy */}
              {canAccessCustomerDatabase ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                      Atas Nama Konsumen / Penerima
                    </label>
                    <select
                      value={selectedCustomerId}
                      onChange={(e) => {
                        setSelectedCustomerId(e.target.value);
                        if (e.target.value) setCustomCustomerName('');
                      }}
                      className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl px-3 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                    >
                      <option value="">-- Pilih dari Database / Umum --</option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} {c.companyName ? `(${c.companyName})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                      Atau Nama Manual / Catatan Tujuan
                    </label>
                    <input
                      type="text"
                      placeholder="Ketik nama konsumen baru..."
                      disabled={!!selectedCustomerId}
                      value={customCustomerName}
                      onChange={(e) => setCustomCustomerName(e.target.value)}
                      className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                    Atas Nama Konsumen / Penerima / Perusahaan <span className="text-slate-500 text-[9px] font-normal">(Ketik Manual)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ketik nama konsumen / perusahaan / perwakilan penerima barang..."
                    value={customCustomerName}
                    onChange={(e) => {
                      setCustomCustomerName(e.target.value);
                      setSelectedCustomerId('');
                    }}
                    className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  Alamat / Wilayah Tujuan Pengiriman <span className="text-slate-500 text-[9px]">(Opsional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: PT ABC Workshop, Jl. Soekarno Hatta No. 88, Pekanbaru"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Section 3: Daftar Barang yang Dikeluarkan (Multi Item) */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <h5 className="text-[11px] font-black uppercase text-blue-400 tracking-wider flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5" /> 3. Daftar Rincian Barang yang Dikeluarkan
                </h5>
                <button
                  type="button"
                  onClick={addItemRow}
                  className="h-7 px-2.5 bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/40 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Tambah Baris</span>
                </button>
              </div>

              <div className="space-y-2">
                {items.map((item, index) => (
                  <div key={item.id} className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center text-[10px] font-mono font-bold text-slate-300 shrink-0">
                      {index + 1}
                    </span>

                    {/* Nama Barang */}
                    <div className="flex-1 w-full sm:w-auto">
                      <input
                        type="text"
                        required
                        placeholder="Nama Komponen / Sparepart / Barang..."
                        value={item.name}
                        onChange={(e) => updateItemRow(item.id, 'name', e.target.value)}
                        className="w-full h-9 bg-slate-900 border border-slate-700 rounded-lg px-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* Qty & Unit */}
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={item.qty}
                        onChange={(e) => updateItemRow(item.id, 'qty', e.target.value ? Number(e.target.value) : 1)}
                        className="w-16 h-9 bg-slate-900 border border-slate-700 rounded-lg px-2 text-xs text-center text-white focus:outline-none focus:border-blue-500 font-bold"
                      />
                      <select
                        value={item.unit}
                        onChange={(e) => updateItemRow(item.id, 'unit', e.target.value)}
                        className="w-24 h-9 bg-slate-900 border border-slate-700 rounded-lg px-2 text-xs text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="Unit">Unit</option>
                        <option value="Pcs">Pcs</option>
                        <option value="Set">Set</option>
                        <option value="Box">Box / Dus</option>
                        <option value="Batang">Batang</option>
                        <option value="Kendaraan">Kendaraan</option>
                        <option value="Kg">Kg</option>
                      </select>
                    </div>

                    {/* Keterangan */}
                    <div className="w-full sm:w-44">
                      <input
                        type="text"
                        placeholder="Keterangan..."
                        value={item.notes || ''}
                        onChange={(e) => updateItemRow(item.id, 'notes', e.target.value)}
                        className="w-full h-9 bg-slate-900 border border-slate-700 rounded-lg px-2.5 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* Delete button */}
                    <button
                      type="button"
                      disabled={items.length <= 1}
                      onClick={() => removeItemRow(item.id)}
                      className="p-2 text-slate-500 hover:text-red-400 disabled:opacity-30 transition-colors shrink-0 cursor-pointer"
                      title="Hapus Baris"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Catatan Ekstra */}
            <div className="pt-2 border-t border-slate-800">
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                Catatan Khusus Pengiriman / Satpam <span className="text-slate-500 text-[9px]">(Opsional)</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: Harap cek nomor segel boks sebelum truk keluar gate"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Form Actions */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  onClose();
                }}
                className="px-5 h-11 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 h-11 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-950/50 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Terbitkan Surat Jalan</span>
              </button>
            </div>
          </form>
        )}

        {/* Confirmation Modal */}
        <AnimatePresence>
          {showConfirmModal && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-slate-900 border border-blue-500/50 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4"
              >
                <div className="flex items-center gap-3 text-blue-400">
                  <ShieldCheck className="w-7 h-7" />
                  <h4 className="text-base font-black uppercase text-white tracking-wide">
                    Konfirmasi Surat Jalan
                  </h4>
                </div>

                <p className="text-xs text-slate-300">
                  Apakah seluruh rincian barang keluar dan pembawa sudah tepat untuk diterbitkan dokumen Surat Jalan resmi?
                </p>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs space-y-1.5">
                  <p><span className="text-slate-400">Pembawa / Sopir:</span> <strong className="text-white">{bringerName}</strong></p>
                  <p><span className="text-slate-400">Penerima:</span> <strong className="text-white">{resolvedCustomerName || '-'}</strong></p>
                  <p><span className="text-slate-400">Jumlah Macam Barang:</span> <strong className="text-blue-400">{items.filter(i => i.name.trim()).length} Baris Item</strong></p>
                  {referenceNumber && (
                    <p><span className="text-slate-400">No. Referensi:</span> <strong className="text-amber-300 font-mono">{referenceNumber}</strong></p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setShowConfirmModal(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase rounded-xl cursor-pointer"
                  >
                    Periksa Kembali
                  </button>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleFinalSubmit}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase rounded-xl flex items-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? 'Menerbitkan...' : 'Ya, Terbitkan'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
