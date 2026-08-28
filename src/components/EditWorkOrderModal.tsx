import React, { useState, useEffect } from 'react';
import { WorkOrder, LoosePartDetails, TodoAction, InventoryItem, Priority, WOStatus, User } from '../types';
import { useApp } from '../store/AppContext';
import { 
  X, 
  Save, 
  User as UserIcon, 
  Car, 
  Wrench, 
  ClipboardList, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  FileText, 
  CheckSquare, 
  Layers,
  History,
  Info,
  MessageSquare,
  Archive,
  RotateCcw
} from 'lucide-react';
import { copyWADraftToClipboard } from '../utils/whatsappDraft';

interface EditWorkOrderModalProps {
  wo: WorkOrder | null;
  isOpen: boolean;
  onClose: () => void;
}

const INITIAL_INVENTORY_TEMPLATE = [
  'STNK',
  'Buku Servis',
  'Kunci Roda / Dongkrak',
  'Ban Cadangan',
  'Audio / Head Unit',
  'Kamera Mundur / Dashcam',
  'Barang Berharga di Kabin',
  'Kondisi Bodi Lecet/Penyok'
];

export const EditWorkOrderModal: React.FC<EditWorkOrderModalProps> = ({
  wo,
  isOpen,
  onClose,
}) => {
  const { updateWorkOrder, users, workOrders, addNotification, currentUser } = useApp();

  const [activeTab, setActiveTab] = useState<'CUSTOMER_VEHICLE' | 'PARTS_ACTIONS' | 'COMPLAINTS_INVENTORY' | 'STATUS_FLOW'>('CUSTOMER_VEHICLE');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form states initialized from wo
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [bringerName, setBringerName] = useState('');
  const [bringerPhone, setBringerPhone] = useState('');
  const [bringerAddress, setBringerAddress] = useState('');

  const [dropMethod, setDropMethod] = useState<'WHOLE' | 'PARTS'>('WHOLE');
  const [vehicleBrand, setVehicleBrand] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [vin, setVin] = useState('');
  const [odometer, setOdometer] = useState('');
  const [fuelLevel, setFuelLevel] = useState<'E' | '1/4' | '1/2' | '3/4' | 'F'>('1/2');
  const [fuelContaminated, setFuelContaminated] = useState(false);
  const [assyNo, setAssyNo] = useState('');
  const [intakeDate, setIntakeDate] = useState('');
  const [estimasiPengerjaan, setEstimasiPengerjaan] = useState('');
  const [garansi, setGaransi] = useState('');
  const [priority, setPriority] = useState<Priority>(2);

  const [customerVoice, setCustomerVoice] = useState('');
  const [looseParts, setLooseParts] = useState<LoosePartDetails[]>([]);
  const [todoActions, setTodoActions] = useState<TodoAction[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  const [status, setStatus] = useState<WOStatus>('QUEUE');
  const [cancelReason, setCancelReason] = useState<string>('');
  const [currentDivision, setCurrentDivision] = useState<'SUPPLY_PUMP' | 'COMMON_RAIL' | 'TURBO' | 'SA'>('SUPPLY_PUMP');
  const [divisionFlow, setDivisionFlow] = useState<('SUPPLY_PUMP' | 'COMMON_RAIL' | 'TURBO')[]>(['SUPPLY_PUMP']);
  const [mechanicId, setMechanicId] = useState<string>('');
  const [isArchived, setIsArchived] = useState(false);

  // History preview state for part number in modal
  const [previewPn, setPreviewPn] = useState<string | null>(null);

  useEffect(() => {
    if (wo) {
      setCustomerName(wo.customerName || '');
      setCustomerPhone(wo.customerPhone || '');
      setCustomerEmail(wo.customerEmail || '');
      setCustomerAddress(wo.customerAddress || '');
      setBringerName(wo.bringerName || '');
      setBringerPhone(wo.bringerPhone || '');
      setBringerAddress(wo.bringerAddress || '');

      setDropMethod(wo.dropMethod || 'WHOLE');
      setVehicleBrand(wo.vehicleBrand || '');
      setPlateNumber(wo.plateNumber || '');
      setVin(wo.vin || '');
      setOdometer(wo.odometer || '');
      setFuelLevel(wo.fuelLevel || '1/2');
      setFuelContaminated(wo.fuelContaminated || false);
      setAssyNo(wo.assyNo || '');
      setIntakeDate(wo.intakeDate || (wo.createdAt ? new Date(wo.createdAt).toISOString().slice(0, 16) : ''));
      setEstimasiPengerjaan(wo.estimasiPengerjaan || '');
      setGaransi(wo.garansi || '');
      setPriority(wo.priority || 2);

      setCustomerVoice(wo.customerVoice || '');
      setLooseParts(wo.looseParts ? JSON.parse(JSON.stringify(wo.looseParts)) : []);
      setTodoActions(wo.todoActions ? JSON.parse(JSON.stringify(wo.todoActions)) : []);
      
      // Setup inventory
      if (wo.inventory && wo.inventory.length > 0) {
        setInventory(JSON.parse(JSON.stringify(wo.inventory)));
      } else {
        setInventory(INITIAL_INVENTORY_TEMPLATE.map(name => ({ name, checked: false })));
      }

      setStatus(wo.status || 'QUEUE');
      setCancelReason(wo.cancelReason || '');
      setCurrentDivision(wo.currentDivision || 'SUPPLY_PUMP');
      setDivisionFlow(wo.divisionFlow || ['SUPPLY_PUMP']);
      setMechanicId(wo.mechanicId || '');
      setIsArchived(wo.isArchived || false);
      setErrorMsg(null);
      setPreviewPn(null);
    }
  }, [wo]);

  if (!isOpen || !wo) return null;

  // Check if current user is authorized (SA or ADMIN)
  const isAuthorized = currentUser?.role === 'SA' || currentUser?.role === 'ADMIN';

  const getHistoricalWorkOrders = (pn: string) => {
    if (!pn || pn.trim().length < 3) return [];
    const cleanPn = pn.toLowerCase().trim();
    return workOrders.filter(w => 
      w.id !== wo.id && (
        w.looseParts?.some(lp => lp.partNumber && lp.partNumber.toLowerCase().includes(cleanPn)) ||
        w.partLogs?.some(log => log.notes?.toLowerCase().includes(cleanPn) || log.findings?.toLowerCase().includes(cleanPn))
      )
    );
  };

  const handleAddLoosePart = () => {
    setLooseParts([
      ...looseParts,
      { id: Math.random().toString(), description: '', partNumber: '', physicalCondition: 'OK' }
    ]);
  };

  const handleUpdateLoosePart = (index: number, field: keyof LoosePartDetails, value: string) => {
    const updated = [...looseParts];
    updated[index] = { ...updated[index], [field]: value };
    setLooseParts(updated);
  };

  const handleRemoveLoosePart = (index: number) => {
    setLooseParts(looseParts.filter((_, i) => i !== index));
  };

  const handleAddTodoAction = () => {
    setTodoActions([
      ...todoActions,
      { id: Math.random().toString(), jenisPengerjaan: '', qty: 1, catatanMekanik: '', estimasiHarga: '', estimasiHargaMin: '', estimasiHargaMax: '' }
    ]);
  };

  const handleUpdateTodoAction = (index: number, field: keyof TodoAction, value: any) => {
    const updated = [...todoActions];
    let finalVal = value;
    if (field === 'estimasiHarga' || field === 'estimasiHargaMin' || field === 'estimasiHargaMax') {
      finalVal = String(value).replace(/\D/g, '');
    }
    updated[index] = { ...updated[index], [field]: finalVal };
    setTodoActions(updated);
  };

  const handleRemoveTodoAction = (index: number) => {
    setTodoActions(todoActions.filter((_, i) => i !== index));
  };

  const toggleInventoryItem = (index: number) => {
    const updated = [...inventory];
    updated[index].checked = !updated[index].checked;
    setInventory(updated);
  };

  const toggleDivisionInFlow = (div: 'SUPPLY_PUMP' | 'COMMON_RAIL' | 'TURBO') => {
    if (divisionFlow.includes(div)) {
      if (divisionFlow.length === 1) return; // Keep at least one
      setDivisionFlow(divisionFlow.filter(d => d !== div));
      if (currentDivision === div) {
        const remaining = divisionFlow.filter(d => d !== div);
        setCurrentDivision(remaining[0]);
      }
    } else {
      setDivisionFlow([...divisionFlow, div]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthorized) {
      setErrorMsg("Akses ditolak: Hanya Service Advisor dan Super Admin yang dapat mengedit SPK!");
      return;
    }

    if (!customerName.trim()) {
      setErrorMsg("Nama Pelanggan wajib diisi!");
      setActiveTab('CUSTOMER_VEHICLE');
      return;
    }

    if (!customerPhone.trim()) {
      setErrorMsg("Nomor Telepon Pelanggan wajib diisi!");
      setActiveTab('CUSTOMER_VEHICLE');
      return;
    }

    if (dropMethod === 'WHOLE' && !plateNumber.trim()) {
      setErrorMsg("Nomor Plat Kendaraan wajib diisi untuk drop unit utuh!");
      setActiveTab('CUSTOMER_VEHICLE');
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    try {
      const updates: Partial<WorkOrder> = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim(),
        customerAddress: customerAddress.trim(),
        bringerName: bringerName.trim() || undefined,
        bringerPhone: bringerPhone.trim() || undefined,
        bringerAddress: bringerAddress.trim() || undefined,

        dropMethod,
        vehicleBrand: dropMethod === 'PARTS' ? 'Copotan (Loose Parts)' : vehicleBrand.trim(),
        plateNumber: dropMethod === 'PARTS' ? '-' : plateNumber.toUpperCase().trim(),
        vin: dropMethod === 'PARTS' ? '' : vin.toUpperCase().trim(),
        odometer: dropMethod === 'PARTS' ? '-' : odometer.trim(),
        fuelLevel: dropMethod === 'PARTS' ? '1/2' : fuelLevel,
        fuelContaminated: dropMethod === 'PARTS' ? false : fuelContaminated,
        assyNo: assyNo.trim() || undefined,
        intakeDate: intakeDate || undefined,
        estimasiPengerjaan: estimasiPengerjaan.trim(),
        garansi: garansi.trim(),
        priority,

        customerVoice: customerVoice.trim(),
        looseParts: dropMethod === 'PARTS' ? looseParts : [],
        todoActions,
        inventory,

        status,
        cancelReason: status === 'CANCELLED' ? (cancelReason.trim() || wo.cancelReason || 'Dibatalkan oleh Pelanggan') : undefined,
        cancelledAt: status === 'CANCELLED' ? (wo.cancelledAt || new Date().toISOString()) : undefined,
        cancelledBy: status === 'CANCELLED' ? (wo.cancelledBy || currentUser?.name || 'Service Advisor') : undefined,
        currentDivision,
        divisionFlow,
        mechanicId: mechanicId || undefined,
        isArchived,
      };

      await updateWorkOrder(wo.id, updates);

      addNotification(
        'SPK Berhasil Diperbarui',
        `Perubahan data SPK ${wo.id} (${customerName.trim()}) telah berhasil disimpan.`,
        'success',
        wo.id
      );

      setIsSaving(false);
      onClose();
    } catch (err: any) {
      console.error("Error saving work order edits:", err);
      setErrorMsg(`Gagal menyimpan perubahan: ${err.message || 'Terjadi kesalahan sistem'}`);
      setIsSaving(false);
    }
  };

  const handleCopyWADraft = () => {
    if (!wo) return;
    const currentMechName = users.find(u => u.id === (mechanicId || wo.mechanicId))?.name;
    const tempWO = {
      ...wo,
      customerName,
      customerPhone,
      vehicleBrand,
      plateNumber,
      status,
      todoActions,
      complaint: customerVoice || wo.complaint
    };
    copyWADraftToClipboard(tempWO, currentMechName, undefined, () => {
      addNotification?.(
        'Draft WA Berhasil Disalin',
        `Template pesan WhatsApp status WO ${wo.id} untuk ${customerName || wo.customerName} siap di-paste & dikirim!`,
        'success',
        wo.id
      );
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200 my-auto flex flex-col max-h-[92vh]">
        
        {/* MODAL HEADER */}
        <div className="bg-[#0F2D59] text-white p-4 sm:p-5 flex items-center justify-between shrink-0 border-b border-blue-900">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/30 rounded-xl border border-blue-400/30">
              <ClipboardList className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black uppercase tracking-wider">
                  Edit Dokumen SPK (Koreksi Data)
                </h3>
                <span className="bg-blue-400/20 text-blue-200 border border-blue-300/30 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                  {wo.id}
                </span>
                {isArchived && (
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Archive className="w-3 h-3 text-amber-400" />
                    DIARSIPKAN
                  </span>
                )}
              </div>
              <p className="text-[11px] text-blue-200/80 mt-0.5">
                Koreksi kesalahan input data pelanggan, unit kendaraan, komponen, atau rincian pengerjaan.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyWADraft}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
              title="Salin template pesan status pengerjaan siap kirim ke WhatsApp pelanggan"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Draft WA</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TAB NAVIGATION */}
        <div className="flex bg-slate-100 border-b border-slate-200 p-1.5 gap-1 shrink-0 overflow-x-auto custom-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('CUSTOMER_VEHICLE')}
            className={`flex-1 min-w-[130px] flex items-center justify-center gap-1.5 py-2 px-3 text-[11px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
              activeTab === 'CUSTOMER_VEHICLE'
                ? 'bg-white text-[#0F2D59] shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <UserIcon className="w-3.5 h-3.5 text-blue-600" />
            Pelanggan & Unit
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('PARTS_ACTIONS')}
            className={`flex-1 min-w-[130px] flex items-center justify-center gap-1.5 py-2 px-3 text-[11px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
              activeTab === 'PARTS_ACTIONS'
                ? 'bg-white text-[#0F2D59] shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Wrench className="w-3.5 h-3.5 text-amber-600" />
            Komponen & Tindakan
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('COMPLAINTS_INVENTORY')}
            className={`flex-1 min-w-[130px] flex items-center justify-center gap-1.5 py-2 px-3 text-[11px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
              activeTab === 'COMPLAINTS_INVENTORY'
                ? 'bg-white text-[#0F2D59] shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-emerald-600" />
            Keluhan & Inventaris
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('STATUS_FLOW')}
            className={`flex-1 min-w-[130px] flex items-center justify-center gap-1.5 py-2 px-3 text-[11px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
              activeTab === 'STATUS_FLOW'
                ? 'bg-white text-[#0F2D59] shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-purple-600" />
            Status & Divisi
          </button>
        </div>

        {/* ERROR BANNER */}
        {errorMsg && (
          <div className="bg-rose-50 border-b border-rose-200 p-3 px-6 text-rose-800 text-xs flex items-center gap-2 shrink-0">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-semibold">{errorMsg}</span>
          </div>
        )}

        {/* MODAL BODY (SCROLLABLE) */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* TAB 1: CUSTOMER & VEHICLE */}
          {activeTab === 'CUSTOMER_VEHICLE' && (
            <div className="space-y-6">
              
              {/* SECTION: DATA PELANGGAN */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-black uppercase text-[#0F2D59] tracking-wider flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-blue-600" />
                  1. Informasi Pelanggan (Pemilik)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-600 block mb-1">
                      Nama Lengkap Pelanggan <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full p-2.5 text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-600 block mb-1">
                      Nomor Telepon / WhatsApp <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full p-2.5 text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-600 block mb-1">
                      Email Pelanggan (Opsional)
                    </label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full p-2.5 text-xs text-slate-800 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-600 block mb-1">
                      Alamat Pelanggan
                    </label>
                    <input
                      type="text"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      className="w-full p-2.5 text-xs text-slate-800 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION: DATA PEMBAWA (OPSIONAL) */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-slate-500" />
                  2. Informasi Pembawa Unit / Sopir / PIC Lapangan (Opsional)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-600 block mb-1">
                      Nama Pembawa
                    </label>
                    <input
                      type="text"
                      value={bringerName}
                      onChange={(e) => setBringerName(e.target.value)}
                      placeholder="e.g. Budi (Sopir)"
                      className="w-full p-2.5 text-xs text-slate-800 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-600 block mb-1">
                      No. Telp Pembawa
                    </label>
                    <input
                      type="text"
                      value={bringerPhone}
                      onChange={(e) => setBringerPhone(e.target.value)}
                      placeholder="08xxxxxxxx"
                      className="w-full p-2.5 text-xs text-slate-800 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-600 block mb-1">
                      Alamat / Catatan Pembawa
                    </label>
                    <input
                      type="text"
                      value={bringerAddress}
                      onChange={(e) => setBringerAddress(e.target.value)}
                      placeholder="Alamat PIC pembawa"
                      className="w-full p-2.5 text-xs text-slate-800 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION: DATA UNIT / KENDARAAN */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase text-[#0F2D59] tracking-wider flex items-center gap-2">
                    <Car className="w-4 h-4 text-blue-600" />
                    3. Data Fisik Unit / Kendaraan
                  </h4>
                  <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-lg border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Metode Drop:</span>
                    <button
                      type="button"
                      onClick={() => setDropMethod(dropMethod === 'WHOLE' ? 'PARTS' : 'WHOLE')}
                      className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider transition-colors ${
                        dropMethod === 'WHOLE' ? 'bg-blue-600 text-white' : 'bg-amber-600 text-white'
                      }`}
                    >
                      {dropMethod === 'WHOLE' ? 'Mobil Utuh' : 'Copotan (Loose Parts)'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {dropMethod === 'WHOLE' ? (
                    <>
                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-600 block mb-1">
                          Nomor Plat Kendaraan <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={plateNumber}
                          onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                          placeholder="BM 1234 XY"
                          className="w-full p-2.5 text-xs font-black font-mono text-slate-900 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-600 block mb-1">
                          Merek / Model Kendaraan
                        </label>
                        <input
                          type="text"
                          value={vehicleBrand}
                          onChange={(e) => setVehicleBrand(e.target.value)}
                          placeholder="Toyota Hilux 2.5D"
                          className="w-full p-2.5 text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-600 block mb-1">
                          Nomor Rangka (VIN)
                        </label>
                        <input
                          type="text"
                          value={vin}
                          onChange={(e) => setVin(e.target.value.toUpperCase())}
                          placeholder="MHF123..."
                          className="w-full p-2.5 text-xs font-mono text-slate-800 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-600 block mb-1">
                          Odometer / KM / HM
                        </label>
                        <input
                          type="text"
                          value={odometer}
                          onChange={(e) => setOdometer(e.target.value)}
                          placeholder="120.000 KM"
                          className="w-full p-2.5 text-xs text-slate-800 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-600 block mb-1">
                          Level Indikator BBM
                        </label>
                        <select
                          value={fuelLevel}
                          onChange={(e) => setFuelLevel(e.target.value as any)}
                          className="w-full p-2.5 text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                        >
                          <option value="E">E (Kosong / Empty)</option>
                          <option value="1/4">1/4 Tangki</option>
                          <option value="1/2">1/2 Tangki</option>
                          <option value="3/4">3/4 Tangki</option>
                          <option value="F">F (Penuh / Full)</option>
                        </select>
                      </div>
                      <div className="flex items-center pt-5">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={fuelContaminated}
                            onChange={(e) => setFuelContaminated(e.target.checked)}
                            className="w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500"
                          />
                          <span className="text-xs font-bold text-rose-700">Solar Terindikasi Tercampur Air / Kotor</span>
                        </label>
                      </div>
                    </>
                  ) : (
                    <div className="col-span-3 bg-amber-50 p-3 rounded-lg border border-amber-200 text-amber-900 text-xs">
                      <strong>Komponen Copotan (Loose Parts):</strong> Rincian nomor seri dan part number diatur pada tab <em>"Komponen & Tindakan"</em>.
                    </div>
                  )}

                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-600 block mb-1">
                      Nomor Assembly / Assy No
                    </label>
                    <input
                      type="text"
                      value={assyNo}
                      onChange={(e) => setAssyNo(e.target.value)}
                      placeholder="e.g. 294000-0380"
                      className="w-full p-2.5 text-xs font-mono text-slate-800 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-600 block mb-1">
                      Waktu Masuk Intake
                    </label>
                    <input
                      type="datetime-local"
                      value={intakeDate}
                      onChange={(e) => setIntakeDate(e.target.value)}
                      className="w-full p-2.5 text-xs text-slate-800 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-600 block mb-1">
                      Estimasi Pengerjaan
                    </label>
                    <input
                      type="text"
                      value={estimasiPengerjaan}
                      onChange={(e) => setEstimasiPengerjaan(e.target.value)}
                      placeholder="e.g. 1 Hari Kerja"
                      className="w-full p-2.5 text-xs text-slate-800 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-600 block mb-1">
                      Masa Garansi
                    </label>
                    <input
                      type="text"
                      value={garansi}
                      onChange={(e) => setGaransi(e.target.value)}
                      placeholder="e.g. 1 Bulan / 1.000 KM"
                      className="w-full p-2.5 text-xs text-slate-800 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-600 block mb-1">
                      Prioritas Pengerjaan
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(Number(e.target.value) as Priority)}
                      className="w-full p-2.5 text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                    >
                      <option value={1}>🔴 Prioritas 1 (Urgent / Express)</option>
                      <option value={2}>🟡 Prioritas 2 (Standard)</option>
                      <option value={3}>🟢 Prioritas 3 (Reguler / Standby)</option>
                    </select>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: PARTS & ACTIONS */}
          {activeTab === 'PARTS_ACTIONS' && (
            <div className="space-y-6">

              {/* LOOSE PARTS SECTION */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black uppercase text-[#0F2D59] tracking-wider flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-amber-600" />
                      Daftar Komponen / Injektor / Supply Pump (P/N Details)
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Input Part Number komponen untuk pelacakan histori dan masa garansi.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddLoosePart}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-black uppercase rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah Baris Komponen
                  </button>
                </div>

                {looseParts.length === 0 ? (
                  <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-xl bg-white">
                    <p className="text-xs text-slate-400 font-medium">Belum ada baris komponen yang ditambahkan.</p>
                    <button
                      type="button"
                      onClick={handleAddLoosePart}
                      className="mt-2 text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                    >
                      + Tambah Komponen Pertama
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white">
                    <table className="w-full border-collapse text-xs">
                      <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
                        <tr>
                          <th className="p-2.5 text-left font-bold uppercase tracking-wider w-1/3">Nama Komponen</th>
                          <th className="p-2.5 text-left font-bold uppercase tracking-wider w-1/3">Part Number (P/N)</th>
                          <th className="p-2.5 text-left font-bold uppercase tracking-wider">Kondisi Fisik</th>
                          <th className="p-2.5 text-center font-bold uppercase tracking-wider w-12">Hapus</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-150">
                        {looseParts.map((part, index) => {
                          const matches = part.partNumber ? getHistoricalWorkOrders(part.partNumber) : [];
                          return (
                            <tr key={part.id || index} className="hover:bg-slate-50/50">
                              <td className="p-2.5">
                                <input
                                  type="text"
                                  placeholder="e.g. Injector Silinder 1 / Supply Pump"
                                  value={part.description}
                                  onChange={(e) => handleUpdateLoosePart(index, 'description', e.target.value)}
                                  className="w-full p-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                                />
                              </td>
                              <td className="p-2.5">
                                <input
                                  type="text"
                                  placeholder="e.g. 0445120007"
                                  value={part.partNumber}
                                  onChange={(e) => handleUpdateLoosePart(index, 'partNumber', e.target.value)}
                                  className="w-full p-2 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                                />
                                {matches.length > 0 && (
                                  <div className="mt-1 flex items-center justify-between bg-amber-50 border border-amber-200 text-amber-900 px-2 py-1 rounded text-[10px]">
                                    <span className="font-bold flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
                                      Pernah diservis ({matches.length}x)
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => setPreviewPn(part.partNumber)}
                                      className="text-blue-700 underline font-black hover:text-blue-900 cursor-pointer"
                                    >
                                      Lihat Histori
                                    </button>
                                  </div>
                                )}
                              </td>
                              <td className="p-2.5">
                                <input
                                  type="text"
                                  placeholder="e.g. Drat OK, Soket Utuh"
                                  value={part.physicalCondition}
                                  onChange={(e) => handleUpdateLoosePart(index, 'physicalCondition', e.target.value)}
                                  className="w-full p-2 border border-slate-200 rounded-lg text-xs text-slate-700 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                                />
                              </td>
                              <td className="p-2.5 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveLoosePart(index)}
                                  className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4 mx-auto" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* TODO ACTIONS & ESTIMATED PRICING */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black uppercase text-[#0F2D59] tracking-wider flex items-center gap-2">
                      <ClipboardList className="w-4 h-4 text-blue-600" />
                      Daftar Tindakan & Estimasi Harga (Action Builder)
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Rincian jenis pengerjaan, kuantitas, dan rentang estimasi biaya pengerjaan.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddTodoAction}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah Pengerjaan
                  </button>
                </div>

                {todoActions.length === 0 ? (
                  <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-xl bg-white">
                    <p className="text-xs text-slate-400 font-medium">Belum ada rincian pengerjaan yang dimasukkan.</p>
                    <button
                      type="button"
                      onClick={handleAddTodoAction}
                      className="mt-2 text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                    >
                      + Tambah Pengerjaan Pertama
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white">
                    <table className="w-full border-collapse text-xs">
                      <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
                        <tr>
                          <th className="p-2.5 text-left font-bold uppercase tracking-wider">Jenis Pengerjaan</th>
                          <th className="p-2.5 text-center font-bold uppercase tracking-wider w-16">Qty</th>
                          <th className="p-2.5 text-left font-bold uppercase tracking-wider">Catatan Teknis</th>
                          <th className="p-2.5 text-left font-bold uppercase tracking-wider w-64">Rentang Estimasi Biaya (Rp)</th>
                          <th className="p-2.5 text-center font-bold uppercase tracking-wider w-12">Hapus</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-150">
                        {todoActions.map((action, index) => (
                          <tr key={action.id || index} className="hover:bg-slate-50/50">
                            <td className="p-2.5">
                              <input
                                type="text"
                                placeholder="e.g. Kalibrasi Common Rail / Ganti Nozzle Tip"
                                value={action.jenisPengerjaan}
                                onChange={(e) => handleUpdateTodoAction(index, 'jenisPengerjaan', e.target.value)}
                                className="w-full p-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                              />
                            </td>
                            <td className="p-2.5 text-center">
                              <input
                                type="number"
                                min={1}
                                value={action.qty || 1}
                                onChange={(e) => handleUpdateTodoAction(index, 'qty', parseInt(e.target.value) || 1)}
                                className="w-full p-2 border border-slate-200 rounded-lg text-xs font-bold text-center text-slate-800 bg-slate-50 focus:bg-white outline-none"
                              />
                            </td>
                            <td className="p-2.5">
                              <input
                                type="text"
                                placeholder="Catatan opsional mekanik"
                                value={action.catatanMekanik || ''}
                                onChange={(e) => handleUpdateTodoAction(index, 'catatanMekanik', e.target.value)}
                                className="w-full p-2 border border-slate-200 rounded-lg text-xs text-slate-700 bg-slate-50 focus:bg-white outline-none"
                              />
                            </td>
                            <td className="p-2.5">
                              <div className="flex items-center gap-1">
                                <input
                                  type="text"
                                  placeholder="Min (Rp)"
                                  value={action.estimasiHargaMin || action.estimasiHarga || ''}
                                  onChange={(e) => handleUpdateTodoAction(index, 'estimasiHargaMin', e.target.value)}
                                  className="w-1/2 p-2 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 bg-slate-50 focus:bg-white outline-none"
                                />
                                <span className="text-slate-400 font-bold">-</span>
                                <input
                                  type="text"
                                  placeholder="Max (Rp)"
                                  value={action.estimasiHargaMax || ''}
                                  onChange={(e) => handleUpdateTodoAction(index, 'estimasiHargaMax', e.target.value)}
                                  className="w-1/2 p-2 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 bg-slate-50 focus:bg-white outline-none"
                                />
                              </div>
                            </td>
                            <td className="p-2.5 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveTodoAction(index)}
                                className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4 mx-auto" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 3: COMPLAINTS & INVENTORY */}
          {activeTab === 'COMPLAINTS_INVENTORY' && (
            <div className="space-y-6">

              {/* CUSTOMER VOICE / KELUHAN */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-black uppercase text-[#0F2D59] tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  Keluhan / Gejala Awal Kendaraan (Customer Voice)
                </h4>
                <textarea
                  rows={4}
                  value={customerVoice}
                  onChange={(e) => setCustomerVoice(e.target.value)}
                  placeholder="Contoh: Asap hitam tebal saat tarikan awal, mesin pincang di rpm 1500, check engine menyala..."
                  className="w-full p-3 text-xs text-slate-800 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none leading-relaxed"
                />
              </div>

              {/* INVENTORY CHECKLIST */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase text-[#0F2D59] tracking-wider flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-blue-600" />
                    Kelengkapan Fisik & Inventaris Kendaraan
                  </h4>
                  <div className="flex gap-2 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setInventory(inventory.map(i => ({ ...i, checked: true })))}
                      className="text-blue-600 font-bold hover:underline cursor-pointer"
                    >
                      Pilih Semua
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => setInventory(inventory.map(i => ({ ...i, checked: false })))}
                      className="text-slate-500 font-bold hover:underline cursor-pointer"
                    >
                      Kosongkan
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 pt-2">
                  {inventory.map((item, index) => (
                    <label
                      key={index}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                        item.checked
                          ? 'bg-blue-50/70 border-blue-300 text-blue-900 font-bold shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100/60'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => toggleInventoryItem(index)}
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                      />
                      <span className="text-xs">{item.name}</span>
                    </label>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: STATUS & FLOW */}
          {activeTab === 'STATUS_FLOW' && (
            <div className="space-y-6">

              {/* STATUS UPDATE */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-black uppercase text-[#0F2D59] tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-600" />
                  Status Pengerjaan & Mekanik Penanggung Jawab
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-600 block mb-1">
                      Status Pekerjaan (Work Order Status)
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as WOStatus)}
                      className="w-full p-2.5 text-xs font-black text-slate-900 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer uppercase tracking-wider"
                    >
                      <option value="QUEUE">⏳ Antrean Masuk (Queue)</option>
                      <option value="IN_PROGRESS">⚡ Sedang Dikerjakan (In Progress)</option>
                      <option value="PENDING_APPROVAL">⚠️ Butuh Approval (Pending Approval)</option>
                      <option value="PENDING_PARTS">🔧 Tertunda Sparepart (Pending Parts)</option>
                      <option value="COMPLETED">✅ Selesai / Siap QC & Serah Terima (Completed)</option>
                      <option value="CANCELLED">❌ SPK Dibatalkan (Customer Decline / Cancelled)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-600 block mb-1">
                      Mekanik PIC / Penanggung Jawab
                    </label>
                    <select
                      value={mechanicId}
                      onChange={(e) => setMechanicId(e.target.value)}
                      className="w-full p-2.5 text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                    >
                      <option value="">-- Belum Ditugaskan (Antrean Bebas) --</option>
                      {users
                        .filter(u => u.role === 'MECHANIC' || u.role === 'COMMON_RAIL' || u.role === 'FOREMAN')
                        .map(u => (
                          <option key={u.id} value={u.id}>
                            {u.name} ({u.role === 'COMMON_RAIL' ? 'Common Rail' : u.role === 'MECHANIC' ? 'Fuel Pump' : 'Foreman'})
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                {status === 'CANCELLED' && (
                  <div className="mt-3 p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-2 animate-in fade-in">
                    <label className="text-[11px] font-black uppercase text-rose-800 tracking-wider block">
                      Alasan Pembatalan SPK:
                    </label>
                    <input
                      type="text"
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      placeholder="Contoh: Pelanggan Menolak Estimasi Biaya (Decline)"
                      className="w-full p-2.5 text-xs text-slate-900 bg-white border border-rose-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none font-medium"
                    />
                  </div>
                )}
              </div>

              {/* DIVISION FLOW */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-black uppercase text-[#0F2D59] tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  Alur Divisi Pengerjaan (Multi-Division Routing)
                </h4>
                
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Pilih Divisi yang Menangani SPK ini:</span>
                  <div className="flex flex-wrap gap-2">
                    {(['SUPPLY_PUMP', 'COMMON_RAIL', 'TURBO'] as const).map(div => {
                      const isSelected = divisionFlow.includes(div);
                      const isCurrent = currentDivision === div;
                      return (
                        <div
                          key={div}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
                            isSelected
                              ? 'bg-blue-50 border-blue-300 text-blue-900'
                              : 'bg-white border-slate-200 text-slate-400'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleDivisionInFlow(div)}
                            className="w-4 h-4 text-blue-600 rounded border-slate-300 cursor-pointer"
                          />
                          <span>{div === 'SUPPLY_PUMP' ? 'Fuel Pump Lab' : div === 'COMMON_RAIL' ? 'Common Rail Lab' : 'Turbocharger'}</span>
                          {isSelected && (
                            <button
                              type="button"
                              onClick={() => setCurrentDivision(div)}
                              className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-black cursor-pointer ${
                                isCurrent
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-slate-200 text-slate-700 hover:bg-blue-100'
                              }`}
                            >
                              {isCurrent ? 'Divisi Aktif' : 'Jadikan Aktif'}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* ARCHIVE MANAGEMENT */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-black uppercase text-[#0F2D59] tracking-wider flex items-center gap-2">
                  <Archive className="w-4 h-4 text-amber-600" />
                  Status Arsip Dokumen (Archive Lifecycle)
                </h4>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-white rounded-lg border border-slate-200">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
                      <span>Status Saat Ini:</span>
                      {isArchived ? (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-black rounded border border-amber-300 flex items-center gap-1">
                          <Archive className="w-3 h-3 text-amber-600" />
                          Diarsipkan ke Lemari Arsip
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded border border-emerald-300">
                          Aktif di Monitor / Antrean
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {isArchived 
                        ? 'SPK ini disimpan di arsip historis. Anda dapat memulihkannya kembali agar tampil di antrean live dashboard.'
                        : 'SPK ini aktif dalam siklus pengerjaan laboratorium dan muncul di monitor operasional.'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsArchived(!isArchived)}
                    className={`px-3 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                      isArchived
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-amber-600 hover:bg-amber-700 text-white'
                    }`}
                  >
                    {isArchived ? (
                      <>
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Pulihkan ke Antrean Aktif</span>
                      </>
                    ) : (
                      <>
                        <Archive className="w-3.5 h-3.5" />
                        <span>Pindahkan ke Arsip</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>
          )}

        </form>

        {/* MODAL FOOTER */}
        <div className="bg-slate-100 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 shrink-0">
          <div className="text-xs text-slate-500 font-medium text-center sm:text-left">
            <span className="font-bold text-slate-700">Service Advisor:</span> Koreksi ini disimpan permanen ke database Firestore & NAS.
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleCopyWADraft}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              title="Salin template pesan WhatsApp status terkini siap kirim ke pelanggan"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Draft WA</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-[#0F2D59] hover:bg-blue-900 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </div>

      </div>

      {/* SUB-MODAL: HISTORY PREVIEW MODAL */}
      {previewPn && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full p-5 border border-slate-200 animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h4 className="text-xs font-black uppercase text-[#0F2D59] flex items-center gap-2">
                <History className="w-4 h-4 text-blue-600" />
                Histori Servis Komponen (P/N: {previewPn})
              </h4>
              <button
                type="button"
                onClick={() => setPreviewPn(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-black p-1"
              >
                ✕
              </button>
            </div>
            <div className="max-h-[350px] overflow-y-auto space-y-3">
              {(() => {
                const history = getHistoricalWorkOrders(previewPn);
                if (history.length === 0) {
                  return <p className="text-xs text-slate-500 italic text-center py-4">Tidak ada riwayat servis sebelumnya.</p>;
                }
                return history.map(w => (
                  <div key={w.id} className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1">
                    <div className="flex justify-between items-center font-bold">
                      <span className="font-mono text-blue-700">{w.id}</span>
                      <span className="text-slate-500 text-[10px]">
                        {w.createdAt ? new Date(w.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-700">
                      Pelanggan: <strong className="text-slate-900">{w.customerName}</strong> ({w.customerPhone})
                    </div>
                    <div className="text-[11px] text-slate-600">
                      Status: <span className="font-bold text-emerald-700">{w.status}</span> | Kendaraan: {w.vehicleBrand} ({w.plateNumber})
                    </div>
                  </div>
                ));
              })()}
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
              <span className="text-[10px] text-slate-500 italic flex items-center gap-1">
                <Info className="w-3 h-3 text-blue-500" />
                SPK tetap dapat dibuat dan dilanjutkan untuk komponen ini.
              </span>
              <button
                type="button"
                onClick={() => setPreviewPn(null)}
                className="px-4 py-1.5 bg-[#0F2D59] text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
