import React, { useState, useEffect } from 'react';
import { WorkOrder, LoosePartDetails, TodoAction, InventoryItem, Priority, WOStatus, User, MechanicalInspectionItem, DEFAULT_COMPONENT_CATEGORIES } from '../types';
import { DEFAULT_MECHANICAL_INSPECTIONS } from './SADashboard';
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

  const [activeTab, setActiveTab] = useState<'CUSTOMER_VEHICLE' | 'PARTS_ACTIONS' | 'MECHANICAL_DIAGNOSTICS' | 'COMPLAINTS_INVENTORY' | 'STATUS_FLOW'>('CUSTOMER_VEHICLE');
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

  // Component Intake Identity (When dropMethod === 'PARTS')
  const [componentCategory, setComponentCategory] = useState<string>('Injector');
  const [componentName, setComponentName] = useState<string>('');
  const [componentBrand, setComponentBrand] = useState<string>('');
  const [componentPartNumber, setComponentPartNumber] = useState<string>('');
  const [componentSerialNumber, setComponentSerialNumber] = useState<string>('');
  const [componentQty, setComponentQty] = useState<number>(1);
  const [componentOriginUnit, setComponentOriginUnit] = useState<string>('');
  const [componentOriginPlate, setComponentOriginPlate] = useState<string>('');
  const [componentIntakeCondition, setComponentIntakeCondition] = useState<string>('Normal / Baik (Utuh tanpa retak fisik)');
  const [componentAccessories, setComponentAccessories] = useState<string>('Tanpa pipa nozzle / kelengkapan standar');

  const [customerVoice, setCustomerVoice] = useState('');
  const [looseParts, setLooseParts] = useState<LoosePartDetails[]>([]);
  const [todoActions, setTodoActions] = useState<TodoAction[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [mechanicalInspections, setMechanicalInspections] = useState<MechanicalInspectionItem[]>([]);

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

      // Populate component identity
      setComponentCategory(wo.componentCategory || 'Injector');
      setComponentName(wo.componentName || '');
      setComponentBrand(wo.componentBrand || '');
      setComponentPartNumber(wo.componentPartNumber || wo.assyNo || '');
      setComponentSerialNumber(wo.componentSerialNumber || '');
      setComponentQty(wo.componentQty || (wo.looseParts?.length || 1));
      setComponentOriginUnit(wo.componentOriginUnit || (wo.vehicleBrand !== 'Copotan (Loose Parts)' ? wo.vehicleBrand : ''));
      setComponentOriginPlate(wo.componentOriginPlate || (wo.plateNumber !== '-' ? wo.plateNumber : ''));
      setComponentIntakeCondition(wo.componentIntakeCondition || 'Normal / Baik (Utuh tanpa retak fisik)');
      setComponentAccessories(wo.componentAccessories || 'Tanpa pipa nozzle / kelengkapan standar');

      setCustomerVoice(wo.customerVoice || '');
      setLooseParts(wo.looseParts ? JSON.parse(JSON.stringify(wo.looseParts)) : []);
      setTodoActions(wo.todoActions ? JSON.parse(JSON.stringify(wo.todoActions)) : []);
      
      // Setup mechanicalInspections
      if (wo.mechanicalInspections && wo.mechanicalInspections.length > 0) {
        setMechanicalInspections(JSON.parse(JSON.stringify(wo.mechanicalInspections)));
      } else {
        setMechanicalInspections(JSON.parse(JSON.stringify(DEFAULT_MECHANICAL_INSPECTIONS)));
      }

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

  const handleUpdateMechanicalInspection = (
    id: string,
    field: keyof MechanicalInspectionItem,
    value: any
  ) => {
    setMechanicalInspections(prev =>
      prev.map(item => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleAddMechanicalInspection = (name: string = 'Pemeriksaan Komponen Baru') => {
    const newId = `mech_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setMechanicalInspections(prev => [
      ...prev,
      {
        id: newId,
        systemName: name,
        category: 'DIESEL_CORE',
        method: 'Uji Kalibrasi Test Bench / Visual Lab',
        status: 'NOT_INSPECTED',
        findings: '',
        diagnosisNotes: '',
        recommendation: '',
      }
    ]);
  };

  const handleRemoveMechanicalInspection = (id: string) => {
    setMechanicalInspections(prev => prev.filter(m => m.id !== id));
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
        vehicleBrand: dropMethod === 'PARTS' ? (componentOriginUnit.trim() || vehicleBrand.trim() || 'Copotan (Loose Parts)') : vehicleBrand.trim(),
        plateNumber: dropMethod === 'PARTS' ? (componentOriginPlate.trim() || plateNumber.trim() || '-') : plateNumber.toUpperCase().trim(),
        vin: dropMethod === 'PARTS' ? '' : vin.toUpperCase().trim(),
        odometer: dropMethod === 'PARTS' ? '-' : odometer.trim(),
        fuelLevel: dropMethod === 'PARTS' ? '1/2' : fuelLevel,
        fuelContaminated: dropMethod === 'PARTS' ? false : fuelContaminated,
        assyNo: (componentPartNumber || assyNo).trim() || undefined,
        intakeDate: intakeDate || undefined,
        estimasiPengerjaan: estimasiPengerjaan.trim(),
        garansi: garansi.trim(),
        priority,

        // Component-Centric Intake Identity
        componentCategory: dropMethod === 'PARTS' ? componentCategory : undefined,
        componentName: dropMethod === 'PARTS' ? componentName : undefined,
        componentBrand: dropMethod === 'PARTS' ? componentBrand : undefined,
        componentPartNumber: dropMethod === 'PARTS' ? componentPartNumber : undefined,
        componentSerialNumber: dropMethod === 'PARTS' ? componentSerialNumber : undefined,
        componentQty: dropMethod === 'PARTS' ? componentQty : undefined,
        componentOriginUnit: dropMethod === 'PARTS' ? componentOriginUnit : undefined,
        componentOriginPlate: dropMethod === 'PARTS' ? componentOriginPlate : undefined,
        componentIntakeCondition: dropMethod === 'PARTS' ? componentIntakeCondition : undefined,
        componentAccessories: dropMethod === 'PARTS' ? componentAccessories : undefined,

        customerVoice: customerVoice.trim(),
        looseParts: dropMethod === 'PARTS' ? looseParts : [],
        todoActions,
        inventory,
        mechanicalInspections,

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
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200 my-auto flex flex-col max-h-[94vh]">
        
        {/* MODAL HEADER */}
        <div className="bg-[#0F2D59] text-white p-3 sm:p-5 flex items-center justify-between shrink-0 border-b border-blue-900 gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="p-1.5 sm:p-2 bg-blue-600/30 rounded-xl border border-blue-400/30 shrink-0">
              <ClipboardList className="w-4 h-4 sm:w-5 sm:h-5 text-blue-300" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h3 className="text-xs sm:text-base font-black uppercase tracking-wider truncate">
                  Edit Dokumen SPK
                </h3>
                <span className="bg-blue-400/20 text-blue-200 border border-blue-300/30 text-[9px] sm:text-[10px] font-mono font-bold px-1.5 sm:px-2 py-0.5 rounded-full">
                  {wo.id}
                </span>
                {isArchived && (
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Archive className="w-3 h-3 text-amber-400" />
                    ARSIP
                  </span>
                )}
              </div>
              <p className="text-[10px] sm:text-[11px] text-blue-200/80 mt-0.5 truncate hidden sm:block">
                Koreksi data pelanggan, unit kendaraan, komponen, atau rincian pengerjaan.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyWADraft}
              className="px-2.5 sm:px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1 sm:gap-1.5 cursor-pointer shadow-md"
              title="Salin template pesan status pengerjaan siap kirim ke WhatsApp pelanggan"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Draft WA</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
              title="Tutup Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TAB NAVIGATION */}
        <div className="flex bg-slate-100 border-b border-slate-200 p-1 sm:p-1.5 gap-1 shrink-0 overflow-x-auto custom-scrollbar select-none">
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
            onClick={() => setActiveTab('MECHANICAL_DIAGNOSTICS')}
            className={`flex-1 min-w-[140px] flex items-center justify-center gap-1.5 py-2 px-3 text-[11px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
              activeTab === 'MECHANICAL_DIAGNOSTICS'
                ? 'bg-white text-[#0F2D59] shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5 text-blue-600" />
            Pemeriksaan Mekanik
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
                      className="w-full p-2.5 min-h-[42px] text-[15px] sm:text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-600 block mb-1">
                      Nomor Telepon / WhatsApp <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      inputMode="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full p-2.5 min-h-[42px] text-[15px] sm:text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono shadow-xs"
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
                      className="w-full p-2.5 min-h-[42px] text-[15px] sm:text-xs text-slate-800 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none shadow-xs"
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
                      className="w-full p-2.5 min-h-[42px] text-[15px] sm:text-xs text-slate-800 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none shadow-xs"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION: DATA PEMBAWA (OPSIONAL) */}
              <div className="bg-slate-50 p-3.5 sm:p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-slate-500" />
                    2. Data Pembawa / Sopir (Opsional)
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      setBringerName(customerName);
                      setBringerPhone(customerPhone);
                      setBringerAddress(customerAddress);
                    }}
                    className="text-[10px] bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold px-2 py-1 rounded-md cursor-pointer transition-colors active:scale-95"
                  >
                    ⚡ Sama dgn Pemilik
                  </button>
                </div>
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
                      className="w-full p-2.5 min-h-[42px] text-[15px] sm:text-xs text-slate-800 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-600 block mb-1">
                      No. Telp Pembawa
                    </label>
                    <input
                      type="tel"
                      inputMode="tel"
                      value={bringerPhone}
                      onChange={(e) => setBringerPhone(e.target.value)}
                      placeholder="08xxxxxxxx"
                      className="w-full p-2.5 min-h-[42px] text-[15px] sm:text-xs text-slate-800 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono shadow-xs"
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
                      className="w-full p-2.5 min-h-[42px] text-[15px] sm:text-xs text-slate-800 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none shadow-xs"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION: DATA UNIT / KENDARAAN */}
              <div className="bg-slate-50 p-3.5 sm:p-4 rounded-xl border border-slate-200 space-y-3">
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
                      className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider transition-colors cursor-pointer ${
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
                          className="w-full p-2.5 min-h-[42px] text-[15px] sm:text-xs font-black font-mono text-slate-900 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none shadow-xs uppercase"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-[10px] font-black uppercase text-slate-600 block mb-1">
                          Merek / Model Kendaraan
                        </label>
                        <input
                          type="text"
                          value={vehicleBrand}
                          onChange={(e) => setVehicleBrand(e.target.value)}
                          placeholder="Toyota Hilux 2.5D"
                          className="w-full p-2.5 min-h-[42px] text-[15px] sm:text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none shadow-xs"
                        />
                        {/* Quick brand chips */}
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {['Toyota Hilux', 'Mitsubishi Triton', 'Pajero Sport', 'Isuzu D-Max', 'Canter / PS125', 'Innova Reborn'].map(bp => (
                            <button
                              key={bp}
                              type="button"
                              onClick={() => setVehicleBrand(bp)}
                              className={`text-[9px] font-bold px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                                vehicleBrand === bp ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {bp}
                            </button>
                          ))}
                        </div>
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
                          className="w-full p-2.5 min-h-[42px] text-[15px] sm:text-xs font-mono text-slate-800 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none shadow-xs uppercase"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-600 block mb-1">
                          Odometer / KM / HM
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={odometer}
                          onChange={(e) => setOdometer(e.target.value)}
                          placeholder="120.000 KM"
                          className="w-full p-2.5 min-h-[42px] text-[15px] sm:text-xs text-slate-800 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none shadow-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-600 block mb-1">
                          Level Indikator BBM
                        </label>
                        <select
                          value={fuelLevel}
                          onChange={(e) => setFuelLevel(e.target.value as any)}
                          className="w-full p-2.5 min-h-[42px] text-[15px] sm:text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer shadow-xs"
                        >
                          <option value="E">E (Kosong / Empty)</option>
                          <option value="1/4">1/4 Tangki</option>
                          <option value="1/2">1/2 Tangki</option>
                          <option value="3/4">3/4 Tangki</option>
                          <option value="F">F (Penuh / Full)</option>
                        </select>
                      </div>
                      <div className="flex items-center pt-2 sm:pt-5">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={fuelContaminated}
                            onChange={(e) => setFuelContaminated(e.target.checked)}
                            className="w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500 cursor-pointer"
                          />
                          <span className="text-xs font-bold text-rose-700">Solar Terindikasi Tercampur Air / Kotor</span>
                        </label>
                      </div>
                    </>
                  ) : (
                    <div className="col-span-1 sm:col-span-3 space-y-3 bg-amber-50/50 p-3.5 rounded-xl border border-amber-200">
                      <div className="flex items-center justify-between border-b border-amber-200 pb-1.5">
                        <h5 className="text-[11px] font-black uppercase text-[#0F2D59] tracking-wider flex items-center gap-1.5">
                          <Wrench className="w-3.5 h-3.5 text-amber-600" />
                          IDENTITAS KOMPONEN YANG DITERIMA
                        </h5>
                        <span className="text-[9px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.2 rounded">
                          Loose Component Intake
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3 text-xs">
                        {/* 1. Jenis Komponen */}
                        <div className="md:col-span-6 flex flex-col">
                          <label className="text-[9.5px] font-black uppercase text-slate-700 mb-1">
                            1. Jenis Komponen <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={componentCategory}
                            onChange={(e) => setComponentCategory(e.target.value)}
                            className="p-2 min-h-[38px] border border-slate-300 rounded-lg bg-white font-bold text-slate-900 outline-none cursor-pointer"
                          >
                            {DEFAULT_COMPONENT_CATEGORIES.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>

                        {/* 2. Nama / Model Komponen */}
                        <div className="md:col-span-6 flex flex-col">
                          <label className="text-[9.5px] font-black uppercase text-slate-700 mb-1">
                            2. Nama / Model Komponen <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={componentName}
                            onChange={(e) => setComponentName(e.target.value)}
                            placeholder="e.g. Common Rail Injector G3S33"
                            className="p-2 min-h-[38px] border border-slate-300 rounded-lg bg-white font-bold text-slate-900 outline-none"
                          />
                        </div>

                        {/* 3. Merek */}
                        <div className="md:col-span-3 flex flex-col">
                          <label className="text-[9.5px] font-black uppercase text-slate-700 mb-1">
                            3. Merek / Manufacturer
                          </label>
                          <input
                            type="text"
                            value={componentBrand}
                            onChange={(e) => setComponentBrand(e.target.value)}
                            placeholder="e.g. Denso / Bosch"
                            className="p-2 border border-slate-300 rounded-lg bg-white font-semibold text-slate-800 outline-none"
                          />
                        </div>

                        {/* 4. Part Number */}
                        <div className="md:col-span-3 flex flex-col">
                          <label className="text-[9.5px] font-black uppercase text-slate-700 mb-1">
                            4. Part Number (P/N)
                          </label>
                          <input
                            type="text"
                            value={componentPartNumber}
                            onChange={(e) => {
                              setComponentPartNumber(e.target.value);
                              setAssyNo(e.target.value);
                            }}
                            placeholder="e.g. 095000-5471"
                            className="p-2 border border-slate-300 rounded-lg bg-white font-mono font-bold text-slate-900 outline-none"
                          />
                        </div>

                        {/* 5. Serial Number */}
                        <div className="md:col-span-3 flex flex-col">
                          <label className="text-[9.5px] font-black uppercase text-slate-700 mb-1">
                            5. Serial Number (S/N)
                          </label>
                          <input
                            type="text"
                            value={componentSerialNumber}
                            onChange={(e) => setComponentSerialNumber(e.target.value)}
                            placeholder="e.g. SN-8829104"
                            className="p-2 border border-slate-300 rounded-lg bg-white font-mono font-semibold text-slate-800 outline-none"
                          />
                        </div>

                        {/* 6. Jumlah */}
                        <div className="md:col-span-3 flex flex-col">
                          <label className="text-[9.5px] font-black uppercase text-slate-700 mb-1">
                            6. Jumlah Komponen (Qty) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="30"
                            value={componentQty}
                            onChange={(e) => setComponentQty(Math.max(1, parseInt(e.target.value) || 1))}
                            className="p-2 border border-slate-300 rounded-lg bg-white font-mono font-black text-slate-900 outline-none"
                          />
                        </div>

                        {/* 7. Asal Mesin */}
                        <div className="md:col-span-6 flex flex-col">
                          <label className="text-[9.5px] font-black uppercase text-slate-700 mb-1">
                            7. Asal Mesin / Kendaraan (Opsional)
                          </label>
                          <input
                            type="text"
                            value={componentOriginUnit}
                            onChange={(e) => {
                              setComponentOriginUnit(e.target.value);
                              setVehicleBrand(e.target.value);
                            }}
                            placeholder="e.g. Canter PS125 / Hilux 2GD"
                            className="p-2 border border-slate-300 rounded-lg bg-white font-semibold text-slate-800 outline-none"
                          />
                        </div>

                        {/* 8. Plat Asal */}
                        <div className="md:col-span-6 flex flex-col">
                          <label className="text-[9.5px] font-black uppercase text-slate-700 mb-1">
                            8. Nomor Polisi / Identitas Unit Asal
                          </label>
                          <input
                            type="text"
                            value={componentOriginPlate}
                            onChange={(e) => {
                              setComponentOriginPlate(e.target.value);
                              setPlateNumber(e.target.value);
                            }}
                            placeholder="e.g. BM 8899 QA / Genset 02"
                            className="p-2 border border-slate-300 rounded-lg bg-white font-mono font-bold uppercase text-slate-900 outline-none"
                          />
                        </div>

                        {/* 9. Kondisi Saat Diterima */}
                        <div className="md:col-span-6 flex flex-col">
                          <label className="text-[9.5px] font-black uppercase text-slate-700 mb-1">
                            9. Kondisi Komponen Saat Diterima
                          </label>
                          <input
                            type="text"
                            value={componentIntakeCondition}
                            onChange={(e) => setComponentIntakeCondition(e.target.value)}
                            placeholder="e.g. Utuh tanpa retak fisik, drat baik"
                            className="p-2 border border-slate-300 rounded-lg bg-white font-semibold text-slate-800 outline-none"
                          />
                        </div>

                        {/* 10. Aksesori / Kelengkapan */}
                        <div className="md:col-span-6 flex flex-col">
                          <label className="text-[9.5px] font-black uppercase text-slate-700 mb-1">
                            10. Kelengkapan & Aksesori yang Diserahkan
                          </label>
                          <input
                            type="text"
                            value={componentAccessories}
                            onChange={(e) => setComponentAccessories(e.target.value)}
                            placeholder="e.g. Unit komponen saja / Pipa return terpasang"
                            className="p-2 border border-slate-300 rounded-lg bg-white font-semibold text-slate-800 outline-none"
                          />
                        </div>
                      </div>
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
                      className="w-full p-2.5 min-h-[42px] text-[15px] sm:text-xs font-mono text-slate-800 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none shadow-xs"
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
                      className="w-full p-2.5 min-h-[42px] text-[15px] sm:text-xs text-slate-800 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none shadow-xs"
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
                      className="w-full p-2.5 min-h-[42px] text-[15px] sm:text-xs text-slate-800 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none shadow-xs"
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
                      className="w-full p-2.5 min-h-[42px] text-[15px] sm:text-xs text-slate-800 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-600 block mb-1">
                      Prioritas Pengerjaan
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(Number(e.target.value) as Priority)}
                      className="w-full p-2.5 min-h-[42px] text-[15px] sm:text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer shadow-xs"
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
              <div className="bg-slate-50 p-3.5 sm:p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-black uppercase text-[#0F2D59] tracking-wider flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-amber-600" />
                      Kondisi Komponen Saat Dibawa (Loose Parts Condition)
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Catat nama komponen, Part Number (P/N) / No. Seri, dan kondisi fisik komponen saat dibawa oleh pelanggan (isi sendiri).
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setLooseParts([
                          ...looseParts,
                          { id: `p_${Date.now()}`, description: `Komponen #${looseParts.length + 1}`, partNumber: '', physicalCondition: 'Normal / Baik' }
                        ]);
                      }}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-900 border border-slate-300 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                    >
                      + 1 Komponen
                    </button>
                    <button
                      type="button"
                      onClick={handleAddLoosePart}
                      className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white text-[11px] sm:text-[10px] font-black uppercase rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer min-h-[38px] active:scale-95"
                    >
                      <Plus className="w-4 h-4 sm:w-3.5 sm:h-3.5" /> Tambah Baris Komponen
                    </button>
                  </div>
                </div>

                {looseParts.length === 0 ? (
                  <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-xl bg-white">
                    <p className="text-xs text-slate-400 font-medium">Belum ada baris komponen yang ditambahkan.</p>
                    <button
                      type="button"
                      onClick={handleAddLoosePart}
                      className="mt-2 text-xs font-bold text-blue-600 hover:underline cursor-pointer min-h-[36px] px-3 py-1"
                    >
                      + Tambah Komponen Pertama
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Mobile Card Layout (< sm) */}
                    <div className="sm:hidden space-y-3">
                      {looseParts.map((part, index) => {
                        const matches = part.partNumber ? getHistoricalWorkOrders(part.partNumber) : [];
                        return (
                          <div key={part.id || index} className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs space-y-2.5">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                              <span className="text-[11px] font-black text-slate-600 uppercase">Komponen #{index + 1}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveLoosePart(index)}
                                className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer flex items-center gap-1 text-[11px] font-bold"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Hapus
                              </button>
                            </div>
                            <div>
                              <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Nama Komponen</label>
                              <input
                                type="text"
                                placeholder="e.g. Injector Silinder 1 / Supply Pump"
                                value={part.description}
                                onChange={(e) => handleUpdateLoosePart(index, 'description', e.target.value)}
                                className="w-full p-2.5 min-h-[42px] text-[15px] font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Part Number (P/N)</label>
                              <input
                                type="text"
                                placeholder="e.g. 0445120007"
                                value={part.partNumber}
                                onChange={(e) => handleUpdateLoosePart(index, 'partNumber', e.target.value)}
                                className="w-full p-2.5 min-h-[42px] text-[15px] font-mono font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                              />
                              {matches.length > 0 && (
                                <div className="mt-1.5 flex items-center justify-between bg-amber-50 border border-amber-200 text-amber-900 px-2 py-1.5 rounded text-[10px]">
                                  <span className="font-bold flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
                                    Pernah diservis ({matches.length}x)
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setPreviewPn(part.partNumber)}
                                    className="text-blue-700 underline font-black cursor-pointer py-0.5 px-1"
                                  >
                                    Lihat Histori
                                  </button>
                                </div>
                              )}
                            </div>
                            <div>
                              <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Kondisi Fisik</label>
                              <input
                                type="text"
                                placeholder="e.g. Drat OK, Soket Utuh"
                                value={part.physicalCondition}
                                onChange={(e) => handleUpdateLoosePart(index, 'physicalCondition', e.target.value)}
                                className="w-full p-2.5 min-h-[42px] text-[14px] text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Desktop Table Layout (sm+) */}
                    <div className="hidden sm:block overflow-x-auto border border-slate-200 rounded-xl bg-white">
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
                  </>
                )}
              </div>

              {/* TODO ACTIONS & ESTIMATED PRICING */}
              <div className="bg-slate-50 p-3.5 sm:p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-black uppercase text-[#0F2D59] tracking-wider flex items-center gap-2">
                      <ClipboardList className="w-4 h-4 text-blue-600" />
                      Daftar Tindakan & Estimasi Biaya (Action Builder)
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Rincian jenis pengerjaan, kuantitas, dan estimasi biaya pengerjaan.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddTodoAction}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[11px] sm:text-[10px] font-black uppercase rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer min-h-[38px] active:scale-95"
                  >
                    <Plus className="w-4 h-4 sm:w-3.5 sm:h-3.5" /> Tambah Pengerjaan
                  </button>
                </div>

                {/* Quick Action Presets */}
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1.5">
                    Preset Cepat Pengerjaan:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { text: 'Kalibrasi Injector Common Rail', defaultPrice: '250.000' },
                      { text: 'Overhaul Supply Pump', defaultPrice: '1.500.000' },
                      { text: 'Ganti Nozzle Tip & Valve', defaultPrice: '850.000' },
                      { text: 'Uji Test Bench & Balancing', defaultPrice: '300.000' },
                      { text: 'Kuras Tangki & Jalur Solar', defaultPrice: '450.000' }
                    ].map((preset) => (
                      <button
                        key={preset.text}
                        type="button"
                        onClick={() => {
                          setTodoActions([
                            ...todoActions,
                            {
                              id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
                              jenisPengerjaan: preset.text,
                              qty: 1,
                              catatanMekanik: '',
                              estimasiHarga: preset.defaultPrice,
                              estimasiHargaMin: preset.defaultPrice,
                              estimasiHargaMax: preset.defaultPrice
                            }
                          ]);
                        }}
                        className="text-[10px] bg-white hover:bg-blue-50 text-slate-700 border border-slate-200 rounded-lg px-2.5 py-1.5 font-bold transition-all flex items-center gap-1 active:scale-95 shadow-2xs cursor-pointer"
                      >
                        <Plus className="w-3 h-3 text-blue-600" />
                        {preset.text}
                      </button>
                    ))}
                  </div>
                </div>

                {todoActions.length === 0 ? (
                  <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-xl bg-white">
                    <p className="text-xs text-slate-400 font-medium">Belum ada rincian pengerjaan yang dimasukkan.</p>
                    <button
                      type="button"
                      onClick={handleAddTodoAction}
                      className="mt-2 text-xs font-bold text-blue-600 hover:underline cursor-pointer min-h-[36px] px-3 py-1"
                    >
                      + Tambah Pengerjaan Pertama
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Mobile Card Layout (< sm) */}
                    <div className="sm:hidden space-y-3">
                      {todoActions.map((action, index) => (
                        <div key={action.id || index} className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs space-y-2.5">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <span className="text-[11px] font-black text-slate-600 uppercase">Pengerjaan #{index + 1}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveTodoAction(index)}
                              className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer flex items-center gap-1 text-[11px] font-bold"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Hapus
                            </button>
                          </div>
                          <div>
                            <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Jenis Pengerjaan</label>
                            <input
                              type="text"
                              placeholder="e.g. Kalibrasi Common Rail"
                              value={action.jenisPengerjaan}
                              onChange={(e) => handleUpdateTodoAction(index, 'jenisPengerjaan', e.target.value)}
                              className="w-full p-2.5 min-h-[42px] text-[15px] font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                            />
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Qty</label>
                              <input
                                type="number"
                                inputMode="numeric"
                                min={1}
                                value={action.qty || 1}
                                onChange={(e) => handleUpdateTodoAction(index, 'qty', parseInt(e.target.value) || 1)}
                                className="w-full p-2.5 min-h-[42px] text-[15px] font-bold text-center text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white outline-none"
                              />
                            </div>
                            <div className="col-span-2">
                              <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Catatan Teknis</label>
                              <input
                                type="text"
                                placeholder="Catatan opsional"
                                value={action.catatanMekanik || ''}
                                onChange={(e) => handleUpdateTodoAction(index, 'catatanMekanik', e.target.value)}
                                className="w-full p-2.5 min-h-[42px] text-[14px] text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white outline-none"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Estimasi Biaya (Min - Max Rp)</label>
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                inputMode="numeric"
                                placeholder="Min (Rp)"
                                value={action.estimasiHargaMin || action.estimasiHarga || ''}
                                onChange={(e) => handleUpdateTodoAction(index, 'estimasiHargaMin', e.target.value)}
                                className="w-1/2 p-2.5 min-h-[42px] text-[15px] font-mono font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white outline-none"
                              />
                              <span className="text-slate-400 font-bold">-</span>
                              <input
                                type="text"
                                inputMode="numeric"
                                placeholder="Max (Rp)"
                                value={action.estimasiHargaMax || ''}
                                onChange={(e) => handleUpdateTodoAction(index, 'estimasiHargaMax', e.target.value)}
                                className="w-1/2 p-2.5 min-h-[42px] text-[15px] font-mono font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Desktop Table Layout (sm+) */}
                    <div className="hidden sm:block overflow-x-auto border border-slate-200 rounded-xl bg-white">
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
                  </>
                )}
              </div>

            </div>
          )}

          {/* TAB: MECHANICAL DIAGNOSTICS */}
          {activeTab === 'MECHANICAL_DIAGNOSTICS' && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3 mb-3">
                  <div>
                    <h4 className="text-xs font-black uppercase text-[#0F2D59] tracking-wider flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-blue-600" />
                      Hasil Pemeriksaan Mekanik (Diesel & Mechanical Findings)
                    </h4>
                    <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                      Pemeriksaan teknis sistem mesin diesel & komponen mekanik (Kustom dapat ditulis sendiri)
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="text-[9px] font-mono font-bold bg-white px-2.5 py-1 rounded border border-slate-200 text-slate-700">
                      {mechanicalInspections.filter(m => m.status === 'ISSUE_FOUND').length} Masalah •{' '}
                      {mechanicalInspections.filter(m => m.status === 'NORMAL').length} Normal
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddMechanicalInspection()}
                      className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-black uppercase flex items-center gap-1 shadow-xs cursor-pointer transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> + Pemeriksaan
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {mechanicalInspections.map((item, idx) => {
                    const isIssue = item.status === 'ISSUE_FOUND';
                    const isNormal = item.status === 'NORMAL';
                    const isFurther = item.status === 'FURTHER_TEST_NEEDED';
                    const isNotInspected = item.status === 'NOT_INSPECTED';

                    return (
                      <div
                        key={item.id}
                        className={`rounded-xl border p-3.5 space-y-3 transition-all ${
                          isIssue
                            ? 'bg-rose-50/50 border-rose-300 ring-1 ring-rose-200'
                            : isNormal
                              ? 'bg-emerald-50/40 border-emerald-300'
                              : isFurther
                                ? 'bg-amber-50/40 border-amber-300'
                                : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0 mr-2">
                            <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-mono font-bold shrink-0">
                              {String(idx + 1).padStart(2, '0')}
                            </span>
                            <div className="flex-1 min-w-0">
                              <input
                                type="text"
                                value={item.systemName}
                                onChange={(e) => handleUpdateMechanicalInspection(item.id, 'systemName', e.target.value)}
                                placeholder="Bagian / Komponen Diperiksa..."
                                className="w-full text-xs font-black uppercase text-slate-900 bg-white border border-slate-300 rounded px-2 py-0.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                            <button
                              type="button"
                              onClick={() => handleUpdateMechanicalInspection(item.id, 'status', 'NORMAL')}
                              className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase transition-all cursor-pointer border ${
                                isNormal
                                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                                  : 'bg-white hover:bg-emerald-50 text-emerald-800 border-slate-300'
                              }`}
                            >
                              ✓ Normal
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateMechanicalInspection(item.id, 'status', 'ISSUE_FOUND')}
                              className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase transition-all cursor-pointer border ${
                                isIssue
                                  ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
                                  : 'bg-white hover:bg-rose-50 text-rose-800 border-slate-300'
                              }`}
                            >
                              ⚠️ Masalah
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateMechanicalInspection(item.id, 'status', 'FURTHER_TEST_NEEDED')}
                              className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase transition-all cursor-pointer border ${
                                isFurther
                                  ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                                  : 'bg-white hover:bg-amber-50 text-amber-800 border-slate-300'
                              }`}
                            >
                              🔍 Uji Lanjutan
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateMechanicalInspection(item.id, 'status', 'NOT_INSPECTED')}
                              className={`px-2 py-1 rounded-lg text-[9px] font-medium uppercase transition-all cursor-pointer border ${
                                isNotInspected
                                  ? 'bg-slate-700 text-white border-slate-800 shadow-xs'
                                  : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-300'
                              }`}
                            >
                              Belum Diperiksa
                            </button>

                            {mechanicalInspections.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveMechanicalInspection(item.id)}
                                className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Hapus pemeriksaan ini"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 text-xs">
                          <div className="md:col-span-4 flex flex-col">
                            <label className="text-[9.5px] font-black uppercase text-slate-600 mb-1">
                              Metode Pemeriksaan:
                            </label>
                            <input
                              type="text"
                              value={item.method}
                              onChange={(e) => handleUpdateMechanicalInspection(item.id, 'method', e.target.value)}
                              placeholder="e.g. Uji test bench FIP / Cek visual / Scanner"
                              className="p-2 border border-slate-200 rounded-lg text-[10px] bg-white outline-none font-medium text-slate-800"
                            />
                          </div>

                          <div className="md:col-span-8 flex flex-col">
                            <label className="text-[9.5px] font-black uppercase text-slate-600 mb-1">
                              Hasil Temuan Pemeriksaan Mekanik:
                            </label>
                            <textarea
                              rows={2}
                              value={item.findings}
                              onChange={(e) => handleUpdateMechanicalInspection(item.id, 'findings', e.target.value)}
                              placeholder="Temuan faktual hasil inspeksi..."
                              className="p-2 border border-slate-200 rounded-lg text-[10px] bg-white outline-none font-medium text-slate-800 resize-none"
                            />
                          </div>

                          <div className="md:col-span-6 flex flex-col">
                            <label className="text-[9.5px] font-black uppercase text-slate-600 mb-1">
                              Analisis / Diagnosis Mekanik:
                            </label>
                            <textarea
                              rows={2}
                              value={item.diagnosisNotes || ''}
                              onChange={(e) => handleUpdateMechanicalInspection(item.id, 'diagnosisNotes', e.target.value)}
                              placeholder="Dugaan teknis atau analisis penyebab masalah..."
                              className="p-2 border border-slate-200 rounded-lg text-[10px] bg-white outline-none font-medium text-slate-800 resize-none"
                            />
                          </div>

                          <div className="md:col-span-6 flex flex-col">
                            <label className="text-[9.5px] font-black uppercase text-slate-600 mb-1">
                              Rekomendasi Tindakan:
                            </label>
                            <textarea
                              rows={2}
                              value={item.recommendation || ''}
                              onChange={(e) => handleUpdateMechanicalInspection(item.id, 'recommendation', e.target.value)}
                              placeholder="Pekerjaan atau servis yang disarankan..."
                              className="p-2 border border-slate-200 rounded-lg text-[10px] bg-white outline-none font-medium text-slate-800 resize-none"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: COMPLAINTS & INVENTORY */}
          {activeTab === 'COMPLAINTS_INVENTORY' && (
            <div className="space-y-6">

              {/* CUSTOMER VOICE / KELUHAN */}
              <div className="bg-slate-50 p-3.5 sm:p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-black uppercase text-[#0F2D59] tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  Keluhan / Gejala Awal Kendaraan (Customer Voice)
                </h4>
                {/* Quick Symptom Chips */}
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1.5">
                    Preset Cepat Gejala Diesel:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'Asap Hitam Tebal',
                      'Asap Putih Pedih',
                      'Mesin Pincang / Hunting',
                      'Susah Start Saat Dingin',
                      'Tarikan Berat / Tenaga Loyo',
                      'Check Engine Menyala',
                      'BBM Boros & Bau Solar'
                    ].map((symptom) => (
                      <button
                        key={symptom}
                        type="button"
                        onClick={() => {
                          const separator = customerVoice.trim().length > 0 ? ', ' : '';
                          setCustomerVoice(customerVoice.trim() + separator + symptom);
                        }}
                        className="text-[10px] bg-white hover:bg-emerald-50 text-slate-700 border border-slate-200 rounded-lg px-2.5 py-1.5 font-bold transition-all flex items-center gap-1 active:scale-95 shadow-2xs cursor-pointer"
                      >
                        <Plus className="w-3 h-3 text-emerald-600" />
                        {symptom}
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  rows={4}
                  value={customerVoice}
                  onChange={(e) => setCustomerVoice(e.target.value)}
                  placeholder="Contoh: Asap hitam tebal saat tarikan awal, mesin pincang di rpm 1500, check engine menyala..."
                  className="w-full p-3 text-[15px] sm:text-xs text-slate-800 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none leading-relaxed shadow-xs"
                />
              </div>

              {/* INVENTORY CHECKLIST */}
              <div className="bg-slate-50 p-3.5 sm:p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase text-[#0F2D59] tracking-wider flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-blue-600" />
                    Kelengkapan Fisik & Inventaris Kendaraan
                  </h4>
                  <div className="flex gap-2 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setInventory(inventory.map(i => ({ ...i, checked: true })))}
                      className="text-blue-600 font-bold hover:underline cursor-pointer py-1"
                    >
                      Pilih Semua
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => setInventory(inventory.map(i => ({ ...i, checked: false })))}
                      className="text-slate-500 font-bold hover:underline cursor-pointer py-1"
                    >
                      Kosongkan
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 pt-2">
                  {inventory.map((item, index) => (
                    <label
                      key={index}
                      className={`flex items-center gap-2.5 p-3 min-h-[44px] rounded-xl border transition-all cursor-pointer select-none ${
                        item.checked
                          ? 'bg-blue-50/70 border-blue-300 text-blue-900 font-bold shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100/60'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => toggleInventoryItem(index)}
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
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
                      className="w-full p-2.5 min-h-[42px] text-[15px] sm:text-xs font-black text-slate-900 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer uppercase tracking-wider shadow-xs"
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
                      className="w-full p-2.5 min-h-[42px] text-[15px] sm:text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer shadow-xs"
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
                      className="w-full p-2.5 min-h-[42px] text-[15px] sm:text-xs text-slate-900 bg-white border border-rose-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none font-medium shadow-xs"
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
        <div className="bg-slate-100 p-3 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3 border-t border-slate-200 shrink-0">
          <div className="text-[10px] sm:text-xs text-slate-500 font-medium text-center sm:text-left hidden sm:block">
            <span className="font-bold text-slate-700">Service Advisor:</span> Koreksi ini disimpan permanen ke database Firestore.
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer min-h-[42px] flex items-center justify-center"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex-[2] sm:flex-none px-4 sm:px-6 py-2.5 bg-[#0F2D59] hover:bg-blue-900 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-h-[42px]"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Menyimpan...' : 'Simpan'}
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
