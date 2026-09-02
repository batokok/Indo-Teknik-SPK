import React, { useState } from 'react';
import { useApp } from '../../store/AppContext';
import { GateEntry, GateEntryType, GateCondition } from '../../types';
import { 
  X, 
  ArrowDownLeft, 
  User, 
  Package, 
  Car, 
  FileText, 
  CheckCircle2, 
  Printer, 
  Plus, 
  AlertCircle,
  Clock,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BarangMasukModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessPrint?: (entry: GateEntry) => void;
}

export const BarangMasukModal: React.FC<BarangMasukModalProps> = ({
  isOpen,
  onClose,
  onSuccessPrint
}) => {
  const { currentUser, customers, addGateEntry, setPrintGateDoc } = useApp();

  const [bringerName, setBringerName] = useState('');
  const [bringerPhone, setBringerPhone] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customCustomerName, setCustomCustomerName] = useState('');
  const [entryType, setEntryType] = useState<GateEntryType>('COMPONENT');
  const [entryTypeCustom, setEntryTypeCustom] = useState('');
  const [itemsDescription, setItemsDescription] = useState('');
  const [qty, setQty] = useState<number | ''>(1);
  const [unit, setUnit] = useState('Unit');
  const [condition, setCondition] = useState<GateCondition>('FOR_SERVICE');
  const [conditionNotes, setConditionNotes] = useState('');
  const [vehiclePlateNumber, setVehiclePlateNumber] = useState('');
  const [vehicleBrandModel, setVehicleBrandModel] = useState('');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedEntry, setSavedEntry] = useState<GateEntry | null>(null);
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

  // Resolve customer name (Privacy-first: only customer name used)
  const resolvedCustomerName = canAccessCustomerDatabase && selectedCustomerId 
    ? (customers.find(c => c.id === selectedCustomerId)?.name || '')
    : customCustomerName;

  const resetForm = () => {
    setBringerName('');
    setBringerPhone('');
    setSelectedCustomerId('');
    setCustomCustomerName('');
    setEntryType('COMPONENT');
    setEntryTypeCustom('');
    setItemsDescription('');
    setQty(1);
    setUnit('Unit');
    setCondition('FOR_SERVICE');
    setConditionNotes('');
    setVehiclePlateNumber('');
    setVehicleBrandModel('');
    setNotes('');
    setSavedEntry(null);
    setShowConfirmModal(false);
    setValidationError('');
  };

  const handleValidateAndOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!bringerName.trim()) {
      setValidationError('Nama pembawa barang wajib diisi.');
      return;
    }

    if (!itemsDescription.trim()) {
      setValidationError('Rincian / deskripsi barang wajib diisi.');
      return;
    }

    if (entryType === 'VEHICLE' && !vehiclePlateNumber.trim()) {
      setValidationError('Nomor Polisi Kendaraan wajib diisi untuk jenis barang Kendaraan.');
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

      const entry = await addGateEntry({
        date,
        time,
        createdBy: currentUser?.name || 'Gate Operator',
        creatorUserId: currentUser?.id || 'anonymous',
        bringerName: bringerName.trim(),
        bringerPhone: bringerPhone.trim() || undefined,
        customerName: resolvedCustomerName.trim() || undefined,
        customerId: selectedCustomerId || undefined,
        entryType,
        entryTypeCustom: entryType === 'OTHER' ? entryTypeCustom.trim() : undefined,
        itemsDescription: itemsDescription.trim(),
        qty: typeof qty === 'number' ? qty : undefined,
        unit: unit.trim(),
        condition,
        conditionNotes: conditionNotes.trim() || undefined,
        receivedBy: currentUser?.name || 'Gate Operator',
        vehiclePlateNumber: vehiclePlateNumber.trim() ? vehiclePlateNumber.toUpperCase().trim() : undefined,
        vehicleBrandModel: vehicleBrandModel.trim() || undefined,
        notes: notes.trim() || undefined
      });

      setSavedEntry(entry);
      setShowConfirmModal(false);
      // Immediately open Print Preview & Print Layout
      setPrintGateDoc({ type: 'BARANG_MASUK', data: entry });
      if (onSuccessPrint) onSuccessPrint(entry);
      resetForm();
      onClose();
    } catch (err: any) {
      console.error(err);
      setValidationError(err.message || 'Gagal menyimpan data barang masuk.');
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
        className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border-b border-emerald-800/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <ArrowDownLeft className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Gate Control
                </span>
                <span className="text-xs text-slate-400 font-mono">Format: BM-YYMMDD-XXXX</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide">
                Input Barang Masuk
              </h3>
            </div>
          </div>

          <button 
            type="button"
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Saved Success View */}
        {savedEntry ? (
          <div className="p-6 text-center flex-1 overflow-y-auto flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-4 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-xl font-black text-white uppercase tracking-wide">
              Barang Masuk Berhasil Dicatat!
            </h4>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Nomor Registrasi: <strong className="text-emerald-400 text-sm">{savedEntry.id}</strong>
            </p>

            <div className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-4 mt-5 text-left text-xs space-y-2">
              <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                <span className="text-slate-400">Nama Pembawa:</span>
                <span className="font-bold text-slate-200">{savedEntry.bringerName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                <span className="text-slate-400">Konsumen / Pemilik:</span>
                <span className="font-bold text-slate-200">{savedEntry.customerName || '-'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                <span className="text-slate-400">Rincian Barang:</span>
                <span className="font-bold text-slate-200">{savedEntry.itemsDescription} ({savedEntry.qty || 1} {savedEntry.unit})</span>
              </div>
              {savedEntry.vehiclePlateNumber && (
                <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                  <span className="text-slate-400">Nomor Polisi:</span>
                  <span className="font-bold text-amber-300 font-mono">{savedEntry.vehiclePlateNumber}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-400">Penerima Workshop:</span>
                <span className="font-bold text-slate-200">{savedEntry.receivedBy}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 mt-6 w-full">
              <button
                type="button"
                onClick={() => {
                  setPrintGateDoc({ type: 'BARANG_MASUK', data: savedEntry });
                  if (onSuccessPrint) onSuccessPrint(savedEntry);
                }}
                className="w-full sm:flex-1 h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Tanda Terima</span>
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="w-full sm:w-auto px-5 h-11 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Input Lagi</span>
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

            {/* Auto Fields Banner */}
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
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <div className="truncate">
                  <span className="text-slate-500 block text-[9px] uppercase font-bold">Penerima</span>
                  <span className="text-emerald-400 font-bold truncate">{currentUser?.name || 'Gate Operator'}</span>
                </div>
              </div>
            </div>

            {/* Section: Pembawa & Pelanggan */}
            <div className="space-y-3">
              <h5 className="text-[11px] font-black uppercase text-emerald-400 tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> 1. Data Pembawa & Pelanggan
              </h5>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Nama Pembawa (Wajib) */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                    Nama Pembawa Barang <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Budi Santoso / Sopir PT ABC"
                    value={bringerName}
                    onChange={(e) => setBringerName(e.target.value)}
                    className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                {/* No Telepon Pembawa (Opsional) */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                    No. Telepon / HP Pembawa <span className="text-slate-500 text-[9px]">(Opsional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="0812-xxxx-xxxx"
                    value={bringerPhone}
                    onChange={(e) => setBringerPhone(e.target.value)}
                    className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              {/* Customer Link - Guarded by Role Privacy */}
              {canAccessCustomerDatabase ? (
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                    Atas Nama Konsumen / Perusahaan <span className="text-slate-500 text-[9px] font-normal">(Pilih dari database atau ketik baru)</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <select
                      value={selectedCustomerId}
                      onChange={(e) => {
                        setSelectedCustomerId(e.target.value);
                        if (e.target.value) setCustomCustomerName('');
                      }}
                      className="h-10 bg-slate-950 border border-slate-700 rounded-xl px-3 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
                    >
                      <option value="">-- Pilih dari Daftar Konsumen --</option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} {c.companyName ? `(${c.companyName})` : ''}
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      placeholder="Atau ketik nama konsumen baru..."
                      disabled={!!selectedCustomerId}
                      value={customCustomerName}
                      onChange={(e) => setCustomCustomerName(e.target.value)}
                      className="h-10 bg-slate-950 border border-slate-700 rounded-xl px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors disabled:opacity-50"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                    Atas Nama Konsumen / Perusahaan <span className="text-slate-500 text-[9px] font-normal">(Ketik Manual)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ketik nama konsumen / perusahaan pemilik barang..."
                    value={customCustomerName}
                    onChange={(e) => {
                      setCustomCustomerName(e.target.value);
                      setSelectedCustomerId('');
                    }}
                    className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              )}
            </div>

            {/* Section: Rincian Barang Masuk */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <h5 className="text-[11px] font-black uppercase text-emerald-400 tracking-wider flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5" /> 2. Rincian Barang Masuk
              </h5>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Jenis Barang */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                    Kategori Barang <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={entryType}
                    onChange={(e) => setEntryType(e.target.value as GateEntryType)}
                    className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl px-3 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  >
                    <option value="COMPONENT">Komponen (Injector/Supply Pump/Turbo)</option>
                    <option value="VEHICLE">Kendaraan Utuh (Mobil/Truk)</option>
                    <option value="SPAREPART">Sparepart Baru / Ganti</option>
                    <option value="CUSTOMER_GOODS">Barang Titipan Konsumen</option>
                    <option value="SUPPLIER_GOODS">Pengiriman Supplier / Ekspedisi</option>
                    <option value="TOOLS">Alat / Peralatan Bengkel</option>
                    <option value="OTHER">Lain-lain</option>
                  </select>
                </div>

                {/* Qty & Satuan */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                    Jumlah (Qty)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={qty}
                    onChange={(e) => setQty(e.target.value ? Number(e.target.value) : '')}
                    className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl px-3 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                    Satuan
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl px-3 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  >
                    <option value="Unit">Unit</option>
                    <option value="Pcs">Pcs</option>
                    <option value="Set">Set</option>
                    <option value="Box">Box / Dus</option>
                    <option value="Batang">Batang</option>
                    <option value="Kendaraan">Kendaraan</option>
                    <option value="Lusin">Lusin</option>
                    <option value="Kg">Kg</option>
                  </select>
                </div>
              </div>

              {/* Conditional Vehicle Inputs */}
              {entryType === 'VEHICLE' && (
                <div className="p-3 bg-blue-950/40 border border-blue-800/60 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-blue-300 text-xs font-bold uppercase">
                    <Car className="w-4 h-4" />
                    <span>Informasi Kendaraan Masuk</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">
                        Nomor Polisi <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: BM 1234 XX"
                        value={vehiclePlateNumber}
                        onChange={(e) => setVehiclePlateNumber(e.target.value.toUpperCase())}
                        className="w-full h-9 bg-slate-950 border border-slate-700 rounded-lg px-3 text-xs text-amber-300 font-mono font-bold uppercase focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">
                        Merk / Tipe Kendaraan
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Toyota Hilux / Mitsubishi Canter"
                        value={vehicleBrandModel}
                        onChange={(e) => setVehicleBrandModel(e.target.value)}
                        className="w-full h-9 bg-slate-950 border border-slate-700 rounded-lg px-3 text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Deskripsi Barang */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                  Deskripsi / Apa yang Dibawa <span className="text-red-400">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Contoh: 1 Set Injector Common Rail Hilux (4 pcs), kode part 23670-0L050, kardus coklat."
                  value={itemsDescription}
                  onChange={(e) => setItemsDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors custom-scrollbar"
                />
              </div>

              {/* Kondisi Fisik Saat Masuk */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                    Kondisi Fisik Saat Masuk
                  </label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as GateCondition)}
                    className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl px-3 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  >
                    <option value="FOR_SERVICE">Untuk Servis / Kalibrasi</option>
                    <option value="FOR_INSPECTION">Untuk Pengecekan / Uji Diagnosa</option>
                    <option value="GOOD">Baik / Baru / Utuh</option>
                    <option value="USED">Bekas / Copotan</option>
                    <option value="DAMAGED">Rusak / Ada Cacat Fisik</option>
                    <option value="UNKNOWN">Belum Diperiksa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                    Catatan Kondisi / Cacat Awal <span className="text-slate-500 text-[9px]">(Opsional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Ujung solenoid ada lecet, tanpa packing asli"
                    value={conditionNotes}
                    onChange={(e) => setConditionNotes(e.target.value)}
                    className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              {/* Catatan Tambahan */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  Catatan Tambahan / Lokasi Penyimpanan Sementara <span className="text-slate-500 text-[9px]">(Opsional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Ditaruh di Rak Penerimaan Bagian Common Rail"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            {/* Form Action Buttons */}
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
                className="px-6 h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Simpan Dokumen Masuk</span>
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
                className="bg-slate-900 border border-emerald-500/50 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4"
              >
                <div className="flex items-center gap-3 text-emerald-400">
                  <ShieldCheck className="w-7 h-7" />
                  <h4 className="text-base font-black uppercase text-white tracking-wide">
                    Konfirmasi Pencatatan
                  </h4>
                </div>

                <p className="text-xs text-slate-300">
                  Apakah seluruh data barang masuk sudah sesuai dan siap disimpan ke sistem registrasi gate?
                </p>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs space-y-1.5">
                  <p><span className="text-slate-400">Pembawa:</span> <strong className="text-white">{bringerName}</strong></p>
                  <p><span className="text-slate-400">Pelanggan:</span> <strong className="text-white">{resolvedCustomerName || '-'}</strong></p>
                  <p><span className="text-slate-400">Barang:</span> <strong className="text-emerald-400">{itemsDescription}</strong></p>
                  <p><span className="text-slate-400">Qty:</span> <strong className="text-white">{qty || 1} {unit}</strong></p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setShowConfirmModal(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase rounded-xl"
                  >
                    Cek Lagi
                  </button>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleFinalSubmit}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase rounded-xl flex items-center gap-2"
                  >
                    {isSubmitting ? 'Menyimpan...' : 'Ya, Simpan'}
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
