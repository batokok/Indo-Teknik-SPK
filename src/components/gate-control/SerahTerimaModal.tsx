import React, { useState, useEffect } from 'react';
import { useApp } from '../../store/AppContext';
import { HandoverDocument, HandoverItem, WorkOrder } from '../../types';
import { 
  X, 
  CheckCircle2, 
  User, 
  Package, 
  Car, 
  FileText, 
  Printer, 
  Plus, 
  Trash2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Calendar,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SerahTerimaModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialWO?: WorkOrder | null;
  onSuccessPrint?: (doc: HandoverDocument) => void;
  onForwardToSuratJalan?: (handoverDoc: HandoverDocument) => void;
}

export const SerahTerimaModal: React.FC<SerahTerimaModalProps> = ({
  isOpen,
  onClose,
  initialWO,
  onSuccessPrint,
  onForwardToSuratJalan
}) => {
  const { currentUser, customers, workOrders, addHandoverDocument, setPrintGateDoc } = useApp();

  // Role permissions: Only Service Advisor, Admin, and Super Admin can create Handover / Serah Terima (BAST).
  const canCreateHandover = currentUser?.role === 'SA' || currentUser?.role === 'ADMIN';

  const [selectedWOId, setSelectedWOId] = useState(initialWO?.id || '');
  const [selectedCustomerId, setSelectedCustomerId] = useState(initialWO?.customerId || '');
  const [customCustomerName, setCustomCustomerName] = useState(initialWO?.customerName || '');
  const [recipientName, setRecipientName] = useState(initialWO?.bringerName || '');
  const [recipientPhone, setRecipientPhone] = useState(initialWO?.bringerPhone || '');
  const [vehiclePlateNumber, setVehiclePlateNumber] = useState(initialWO?.plateNumber || '');
  const [vehicleBrandModel, setVehicleBrandModel] = useState(initialWO?.vehicleBrand || '');
  const [handoverType, setHandoverType] = useState<'SERVICE_UNIT' | 'SPAREPART' | 'WARRANTY' | 'OTHER'>('SERVICE_UNIT');
  const [warrantyPeriod, setWarrantyPeriod] = useState(initialWO?.garansi || '1 Bulan / 1.000 KM');
  const [notes, setNotes] = useState('');

  // Multi item list
  const [items, setItems] = useState<HandoverItem[]>(() => {
    if (initialWO?.todoActions && initialWO.todoActions.length > 0) {
      return initialWO.todoActions.map((t, idx) => ({
        id: String(idx + 1),
        name: t.jenisPengerjaan,
        qty: t.qty || 1,
        unit: 'Pcs',
        condition: 'Baik / Sudah Dikalibrasi',
        notes: t.catatanMekanik || ''
      }));
    }
    return [
      { id: '1', name: initialWO?.vehicleBrand ? `1 Unit ${initialWO.vehicleBrand} (${initialWO.plateNumber || ''})` : 'Unit Selesai Servis', qty: 1, unit: 'Unit', condition: 'Selesai & Berfungsi Normal', notes: '' }
    ];
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedDoc, setSavedDoc] = useState<HandoverDocument | null>(null);
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

  // Synchronize when initialWO changes
  useEffect(() => {
    if (initialWO) {
      setSelectedWOId(initialWO.id);
      setSelectedCustomerId(initialWO.customerId || '');
      setCustomCustomerName(initialWO.customerName);
      setRecipientName(initialWO.bringerName || initialWO.customerName);
      setRecipientPhone(initialWO.bringerPhone || '');
      setVehiclePlateNumber(initialWO.plateNumber || '');
      setVehicleBrandModel(initialWO.vehicleBrand || '');
      setWarrantyPeriod(initialWO.garansi || '1 Bulan / 1.000 KM');
      
      if (initialWO.todoActions && initialWO.todoActions.length > 0) {
        setItems(initialWO.todoActions.map((t, idx) => ({
          id: String(idx + 1),
          name: t.jenisPengerjaan,
          qty: t.qty || 1,
          unit: 'Pcs',
          condition: 'Baik / Selesai Kalibrasi',
          notes: t.catatanMekanik || ''
        })));
      } else {
        setItems([
          { 
            id: '1', 
            name: `Unit ${initialWO.vehicleBrand || 'Kendaraan'} (${initialWO.plateNumber || '-'})`, 
            qty: 1, 
            unit: 'Unit', 
            condition: 'Selesai & Berfungsi Normal', 
            notes: initialWO.customerVoice || '' 
          }
        ]);
      }
    }
  }, [initialWO]);

  if (!isOpen) return null;

  // Resolve customer name (Privacy-first: only customer name used)
  const resolvedCustomerName = canAccessCustomerDatabase && selectedCustomerId 
    ? (customers.find(c => c.id === selectedCustomerId)?.name || '')
    : customCustomerName;

  const handleSelectWO = (woId: string) => {
    setSelectedWOId(woId);
    const foundWO = workOrders.find(w => w.id === woId);
    if (foundWO) {
      setSelectedCustomerId(foundWO.customerId || '');
      setCustomCustomerName(foundWO.customerName);
      setRecipientName(foundWO.bringerName || foundWO.customerName);
      setRecipientPhone(foundWO.bringerPhone || '');
      setVehiclePlateNumber(foundWO.plateNumber || '');
      setVehicleBrandModel(foundWO.vehicleBrand || '');
      setWarrantyPeriod(foundWO.garansi || '1 Bulan / 1.000 KM');
      
      if (foundWO.todoActions && foundWO.todoActions.length > 0) {
        setItems(foundWO.todoActions.map((t, idx) => ({
          id: String(idx + 1),
          name: t.jenisPengerjaan,
          qty: t.qty || 1,
          unit: 'Pcs',
          condition: 'Baik / Selesai Kalibrasi',
          notes: t.catatanMekanik || ''
        })));
      }
    }
  };

  const addItemRow = () => {
    setItems(prev => [
      ...prev,
      { id: String(Date.now()), name: '', qty: 1, unit: 'Unit', condition: 'Baik / Normal', notes: '' }
    ]);
  };

  const updateItemRow = (id: string, field: keyof HandoverItem, val: any) => {
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
    setSelectedWOId('');
    setSelectedCustomerId('');
    setCustomCustomerName('');
    setRecipientName('');
    setRecipientPhone('');
    setVehiclePlateNumber('');
    setVehicleBrandModel('');
    setHandoverType('SERVICE_UNIT');
    setWarrantyPeriod('1 Bulan / 1.000 KM');
    setNotes('');
    setItems([{ id: '1', name: '', qty: 1, unit: 'Unit', condition: 'Baik', notes: '' }]);
    setSavedDoc(null);
    setShowConfirmModal(false);
    setValidationError('');
  };

  const handleValidateAndOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!canCreateHandover) {
      setValidationError('Akses Ditolak: Pembuatan Berita Acara Serah Terima hanya diizinkan untuk Service Advisor, Admin, dan Super Admin.');
      return;
    }

    if (!resolvedCustomerName.trim()) {
      setValidationError('Nama konsumen / pemilik wajib dipilih atau diisi.');
      return;
    }

    if (!recipientName.trim()) {
      setValidationError('Nama pembawa / penerima unit wajib diisi.');
      return;
    }

    const validItems = items.filter(item => item.name.trim() !== '');
    if (validItems.length === 0) {
      setValidationError('Minimal harus ada 1 item yang diserahterimakan.');
      return;
    }

    setShowConfirmModal(true);
  };

  const handleFinalSubmit = async () => {
    if (!canCreateHandover) {
      setValidationError('Akses Ditolak: Pembuatan Berita Acara Serah Terima hanya diizinkan untuk Service Advisor, Admin, dan Super Admin.');
      return;
    }

    try {
      setIsSubmitting(true);
      const now = new Date();
      const date = now.toISOString().split('T')[0];
      const time = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }) + ' WIB';

      const validItems = items.filter(item => item.name.trim() !== '').map((it, idx) => ({
        ...it,
        id: String(idx + 1)
      }));

      const docCreated = await addHandoverDocument({
        date,
        time,
        createdBy: currentUser?.name || 'Service Advisor',
        creatorUserId: currentUser?.id || 'anonymous',
        relatedWOId: selectedWOId.trim() || undefined,
        customerName: resolvedCustomerName.trim(),
        customerId: selectedCustomerId || undefined,
        vehiclePlateNumber: vehiclePlateNumber.trim() ? vehiclePlateNumber.toUpperCase().trim() : undefined,
        vehicleBrandModel: vehicleBrandModel.trim() || undefined,
        recipientName: recipientName.trim(),
        recipientPhone: recipientPhone.trim() || undefined,
        handoverType,
        items: validItems,
        warrantyPeriod: warrantyPeriod.trim() || undefined,
        notes: notes.trim() || undefined
      });

      setSavedDoc(docCreated);
      setShowConfirmModal(false);
      // Immediately open Print Preview & Print Layout
      setPrintGateDoc({ type: 'SERAH_TERIMA', data: docCreated });
      if (onSuccessPrint) onSuccessPrint(docCreated);
      resetForm();
      onClose();
    } catch (err: any) {
      console.error(err);
      setValidationError(err.message || 'Gagal menerbitkan Berita Acara Serah Terima.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  if (!canCreateHandover) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl text-center space-y-4"
        >
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white uppercase tracking-wide">Akses Terbatas</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Formulir Berita Acara Serah Terima (BAST) hanya dapat diakses dan diterbitkan oleh <span className="text-white font-bold">Service Advisor</span>, <span className="text-white font-bold">Admin</span>, dan <span className="text-white font-bold">Super Admin</span>.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold uppercase rounded-xl transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-teal-950 via-slate-900 to-slate-900 border-b border-teal-800/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  Gate Control
                </span>
                <span className="text-xs text-slate-400 font-mono">Format: ST-YYMMDD-XXXX</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide">
                Berita Acara Serah Terima (BAST)
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
            <div className="w-16 h-16 rounded-2xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 mb-4 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-xl font-black text-white uppercase tracking-wide">
              Serah Terima Berhasil Diterbitkan!
            </h4>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Nomor BAST: <strong className="text-teal-400 text-sm">{savedDoc.id}</strong>
            </p>

            <div className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-4 mt-5 text-left text-xs space-y-2">
              <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                <span className="text-slate-400">Konsumen:</span>
                <span className="font-bold text-slate-200">{savedDoc.customerName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                <span className="text-slate-400">Penerima / Pembawa:</span>
                <span className="font-bold text-slate-200">{savedDoc.recipientName}</span>
              </div>
              {savedDoc.vehiclePlateNumber && (
                <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                  <span className="text-slate-400">Kendaraan:</span>
                  <span className="font-mono font-bold text-amber-300">{savedDoc.vehiclePlateNumber} ({savedDoc.vehicleBrandModel || ''})</span>
                </div>
              )}
              <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                <span className="text-slate-400">Garansi Workshop:</span>
                <span className="font-bold text-teal-400">{savedDoc.warrantyPeriod || '1 Bulan'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Petugas Penyerah:</span>
                <span className="font-bold text-slate-200">{savedDoc.createdBy}</span>
              </div>
            </div>

            {/* Quick Action: Forward to Surat Jalan */}
            <div className="p-3.5 bg-gradient-to-r from-blue-950/60 to-slate-900 border border-blue-800/60 rounded-xl w-full mt-4 flex items-center justify-between text-left">
              <div>
                <span className="text-[11px] font-bold text-white block">Perlu Mengeluarkan Barang Lewat Gate?</span>
                <span className="text-[10px] text-slate-400">Buat Surat Jalan resmi langsung dari rincian Serah Terima ini.</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (onForwardToSuratJalan) onForwardToSuratJalan(savedDoc);
                }}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-black text-[11px] uppercase tracking-wider rounded-lg flex items-center gap-1.5 shadow-md shadow-blue-900/40 transition-all cursor-pointer shrink-0"
              >
                <span>Buat Surat Jalan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 mt-5 w-full">
              <button
                type="button"
                onClick={() => {
                  setPrintGateDoc({ type: 'SERAH_TERIMA', data: savedDoc });
                  if (onSuccessPrint) onSuccessPrint(savedDoc);
                }}
                className="w-full sm:flex-1 h-11 bg-teal-600 hover:bg-teal-500 text-white font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-teal-950/50 transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Dokumen BAST</span>
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="w-full sm:w-auto px-5 h-11 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Buat BAST Lainnya</span>
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
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <div className="truncate">
                  <span className="text-slate-500 block text-[9px] uppercase font-bold">Petugas SA</span>
                  <span className="text-teal-400 font-bold truncate">{currentUser?.name || 'Service Advisor'}</span>
                </div>
              </div>
            </div>

            {/* Quick Link SPK Picker - Accessible only to authorized roles */}
            {canAccessCustomerDatabase && (
              <div className="p-3 bg-slate-950/70 border border-teal-900/40 rounded-xl space-y-1.5">
                <label className="block text-[11px] font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Pilih dari SPK Selesai (Opsional)
                </label>
                <select
                  value={selectedWOId}
                  onChange={(e) => handleSelectWO(e.target.value)}
                  className="w-full h-10 bg-slate-900 border border-slate-700 rounded-xl px-3 text-xs text-white focus:outline-none focus:border-teal-500 transition-colors cursor-pointer"
                >
                  <option value="">-- Buat Manual / Tanpa Tautan SPK --</option>
                  {workOrders.map((wo) => (
                    <option key={wo.id} value={wo.id}>
                      {wo.id} - {wo.customerName} ({wo.plateNumber || wo.vehicleBrand}) [{wo.status}]
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Section 1: Data Pelanggan & Penerima */}
            <div className="space-y-3 pt-1">
              <h5 className="text-[11px] font-black uppercase text-teal-400 tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> 1. Pelanggan & Pembawa / Penerima Unit
              </h5>

              {/* Customer Link - Guarded by Role Privacy */}
              {canAccessCustomerDatabase ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                      Atas Nama Konsumen / Pemilik <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={selectedCustomerId}
                      onChange={(e) => {
                        setSelectedCustomerId(e.target.value);
                        if (e.target.value) setCustomCustomerName('');
                      }}
                      className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl px-3 text-xs text-white focus:outline-none focus:border-teal-500 transition-colors cursor-pointer"
                    >
                      <option value="">-- Pilih dari Database / Ketik Baru --</option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} {c.companyName ? `(${c.companyName})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                      Atau Nama Konsumen Manual
                    </label>
                    <input
                      type="text"
                      placeholder="Nama konsumen..."
                      disabled={!!selectedCustomerId}
                      value={customCustomerName}
                      onChange={(e) => setCustomCustomerName(e.target.value)}
                      className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors disabled:opacity-50"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                    Atas Nama Konsumen / Pemilik <span className="text-red-400">*</span> <span className="text-slate-500 text-[9px] font-normal">(Ketik Manual)</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ketik nama konsumen / perusahaan pemilik unit..."
                    value={customCustomerName}
                    onChange={(e) => {
                      setCustomCustomerName(e.target.value);
                      setSelectedCustomerId('');
                    }}
                    className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                    Nama Pembawa / Penerima Fisik <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Pak Joko / Supir Pemilik"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                    No. Telepon / HP Penerima <span className="text-slate-500 text-[9px]">(Opsional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="0812-xxxx-xxxx"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Informasi Unit & Garansi */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <h5 className="text-[11px] font-black uppercase text-teal-400 tracking-wider flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5" /> 2. Kendaraan & Ketentuan Garansi
              </h5>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                    Jenis Serah Terima
                  </label>
                  <select
                    value={handoverType}
                    onChange={(e) => setHandoverType(e.target.value as any)}
                    className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl px-3 text-xs text-white focus:outline-none focus:border-teal-500 transition-colors"
                  >
                    <option value="SERVICE_UNIT">Unit Kendaraan Selesai Servis</option>
                    <option value="SPAREPART">Komponen / Sparepart Selesai Kalibrasi</option>
                    <option value="WARRANTY">Klaim Garansi / Penggantian</option>
                    <option value="OTHER">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                    Nomor Polisi <span className="text-slate-500 text-[9px]">(Jika ada)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="BM 1234 XX"
                    value={vehiclePlateNumber}
                    onChange={(e) => setVehiclePlateNumber(e.target.value.toUpperCase())}
                    className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl px-3 text-xs text-amber-300 font-mono font-bold uppercase focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                    Masa Garansi Workshop
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 1 Bulan / 1.000 KM"
                    value={warrantyPeriod}
                    onChange={(e) => setWarrantyPeriod(e.target.value)}
                    className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl px-3 text-xs text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Daftar Barang yang Diserahkan */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <h5 className="text-[11px] font-black uppercase text-teal-400 tracking-wider flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5" /> 3. Daftar Rincian Barang yang Diserahkan
                </h5>
                <button
                  type="button"
                  onClick={addItemRow}
                  className="h-7 px-2.5 bg-teal-600/30 hover:bg-teal-600 text-teal-300 hover:text-white border border-teal-500/40 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer"
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
                        placeholder="Rincian Unit / Komponen..."
                        value={item.name}
                        onChange={(e) => updateItemRow(item.id, 'name', e.target.value)}
                        className="w-full h-9 bg-slate-900 border border-slate-700 rounded-lg px-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
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
                        className="w-16 h-9 bg-slate-900 border border-slate-700 rounded-lg px-2 text-xs text-center text-white focus:outline-none focus:border-teal-500 font-bold"
                      />
                      <select
                        value={item.unit}
                        onChange={(e) => updateItemRow(item.id, 'unit', e.target.value)}
                        className="w-24 h-9 bg-slate-900 border border-slate-700 rounded-lg px-2 text-xs text-white focus:outline-none focus:border-teal-500"
                      >
                        <option value="Unit">Unit</option>
                        <option value="Pcs">Pcs</option>
                        <option value="Set">Set</option>
                        <option value="Box">Box</option>
                        <option value="Kendaraan">Kendaraan</option>
                      </select>
                    </div>

                    {/* Kondisi */}
                    <div className="w-full sm:w-44">
                      <input
                        type="text"
                        placeholder="Kondisi fisik..."
                        value={item.condition || ''}
                        onChange={(e) => updateItemRow(item.id, 'condition', e.target.value)}
                        className="w-full h-9 bg-slate-900 border border-slate-700 rounded-lg px-2.5 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-teal-500"
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

            {/* Catatan / Rekomendasi */}
            <div className="pt-2 border-t border-slate-800">
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                Catatan / Rekomendasi Teknis untuk Konsumen <span className="text-slate-500 text-[9px]">(Opsional)</span>
              </label>
              <textarea
                rows={2}
                placeholder="Contoh: Disarankan ganti filter solar setiap 5.000 KM dan gunakan bahan bakar Dexlite / Pertamina Dex."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors custom-scrollbar"
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
                className="px-6 h-11 bg-teal-600 hover:bg-teal-500 text-white font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-teal-950/50 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Terbitkan Berita Acara (BAST)</span>
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
                className="bg-slate-900 border border-teal-500/50 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4"
              >
                <div className="flex items-center gap-3 text-teal-400">
                  <ShieldCheck className="w-7 h-7" />
                  <h4 className="text-base font-black uppercase text-white tracking-wide">
                    Konfirmasi Serah Terima
                  </h4>
                </div>

                <p className="text-xs text-slate-300">
                  Apakah unit / barang telah benar-benar diperiksa dan diserahkan kepada pihak penerima?
                </p>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs space-y-1.5">
                  <p><span className="text-slate-400">Konsumen:</span> <strong className="text-white">{resolvedCustomerName}</strong></p>
                  <p><span className="text-slate-400">Penerima Fisik:</span> <strong className="text-white">{recipientName}</strong></p>
                  <p><span className="text-slate-400">Masa Garansi:</span> <strong className="text-teal-400">{warrantyPeriod || '1 Bulan'}</strong></p>
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
                    className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-black uppercase rounded-xl flex items-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? 'Menerbitkan...' : 'Ya, Terbitkan BAST'}
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
