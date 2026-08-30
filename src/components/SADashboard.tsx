import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { Priority, PartDetails, InventoryItem, DamageReport, TodoAction, LoosePartDetails } from '../types';
import { Printer, Car, ShieldAlert, Plus, Trash2, Camera, User, ClipboardList, Check, ChevronRight, ChevronLeft, Wrench, Archive, RotateCcw, Search, GripVertical, Calendar, TrendingUp, Clock, Download, History, BarChart2, ArrowRight, BookOpen, FileSpreadsheet, ChevronDown, ChevronUp, RefreshCw, MapPin, Copy, Share2, Pencil, CheckCircle2, FileCheck, Sparkles, AlertCircle, AlertTriangle, MessageSquare, Ban, XCircle } from 'lucide-react';
import { Reorder, motion } from 'motion/react';
import { FuelGauge } from './FuelGauge';
import { EditWorkOrderModal } from './EditWorkOrderModal';
import { CarInspectionMap } from './CarInspectionMap';
import { copyWADraftToClipboard } from '../utils/whatsappDraft';

const formatRupiah = (value: string | number | undefined | null): string => {
  if (value === undefined || value === null) return '';
  const str = String(value).replace(/\D/g, '');
  if (!str) return '';
  const num = parseInt(str, 10);
  return 'Rp ' + num.toLocaleString('id-ID');
};

const INITIAL_INVENTORY: InventoryItem[] = [
  { name: 'Ban Serap', checked: false },
  { name: 'Dongkrak', checked: false },
  { name: 'Karpet', checked: false },
  { name: 'Toolset/Kotak Perkakas', checked: false },
  { name: 'Spion Luar/Dalam', checked: false },
  { name: 'Racun Api (APAR)', checked: false },
  { name: 'Gantungan Kunci', checked: false },
  { name: 'Central Lock/Remote', checked: false },
  { name: 'Tape/Audio Unit', checked: false },
  { name: 'Aki/Battery', checked: false },
  { name: 'Safety Belt', checked: false },
  { name: 'STNK Asli', checked: false },
  { name: 'Tanda Lunas Pajak Asli', checked: false },
  { name: 'Buku KEUR Asli', checked: false },
  { name: 'Fender Roda', checked: false },
];

const CAR_PARTS = [
  { id: 'front-view', label: 'Tampak Depan' },
  { id: 'rear-view', label: 'Tampak Belakang' },
  { id: 'left-side', label: 'Samping Kiri' },
  { id: 'right-side', label: 'Samping Kanan' },
  { id: 'top-view', label: 'Top View' },
  { id: 'dashboard-panel', label: 'Dashboard Panel' },
  { id: 'spion-dalam', label: 'Kaca Spion Dalam' },
  { id: 'soket-kelistrikan', label: 'Soket Kelistrikan' },
  { id: 'plafon', label: 'Plafon' },
];

const INITIAL_TODO_ACTIONS: TodoAction[] = [
  { id: 't1', jenisPengerjaan: '', qty: 1, catatanMekanik: '', estimasiHarga: '', estimasiHargaMin: '', estimasiHargaMax: '' },
];

const INITIAL_LOOSE_PARTS: LoosePartDetails[] = [
  { id: '1', description: 'Injector Nozzle 1', partNumber: '', physicalCondition: 'OK' },
  { id: '2', description: 'Injector Nozzle 2', partNumber: '', physicalCondition: 'OK' },
  { id: '3', description: 'Injector Nozzle 3', partNumber: '', physicalCondition: 'OK' },
  { id: '4', description: 'Injector Nozzle 4', partNumber: '', physicalCondition: 'OK' },
];

const INITIAL_PARTS_TRACKING = [
  { id: '1', cylinderNo: 'CYL 1', serialNumber: '', solenoidCondition: 'OK', threadPlugsState: 'OK', nozzleTipState: 'OK' },
  { id: '2', cylinderNo: 'CYL 2', serialNumber: '', solenoidCondition: 'OK', threadPlugsState: 'OK', nozzleTipState: 'OK' },
  { id: '3', cylinderNo: 'CYL 3', serialNumber: '', solenoidCondition: 'OK', threadPlugsState: 'OK', nozzleTipState: 'OK' },
  { id: '4', cylinderNo: 'CYL 4', serialNumber: '', solenoidCondition: 'OK', threadPlugsState: 'OK', nozzleTipState: 'OK' },
];

const SADashboard: React.FC = () => {
  const { addWorkOrder, setPrintWO, setPrintType, workOrders, users, updateWorkOrder, isLoading, customers, vehicles, trackingBaseUrl, addNotification, currentUser } = useApp();

  const getTrackingUrl = (woId: string) => {
    const base = trackingBaseUrl || window.location.origin;
    return `${base}/?tracking=${woId}`;
  };

  const handleCopyTrackingLink = (wo: any) => {
    const link = getTrackingUrl(wo.id);
    navigator.clipboard.writeText(link).then(() => {
      addNotification?.(
        'Salin Link Pelacakan',
        `Link pelacakan live untuk WO ${wo.id} (${wo.customerName}) berhasil disalin ke clipboard!`,
        'success',
        wo.id
      );
    }).catch(err => {
      console.error("Gagal menyalin link:", err);
    });
  };

  const handleShareWhatsApp = (wo: any) => {
    const link = getTrackingUrl(wo.id);
    const text = `Halo Bapak/Ibu ${wo.customerName}, berikut adalah tautan pelacakan langsung (Live Tracking Link) untuk pengerjaan ${wo.vehicleBrand} (${wo.plateNumber}) Anda di Indo Teknik: ${link}. Terima kasih!`;
    const cleanPhone = wo.customerPhone.replace(/\D/g, '');
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  };

  const handleCopyWADraft = (wo: any) => {
    const mechName = users.find(u => u.id === wo.mechanicId)?.name;
    const link = getTrackingUrl(wo.id);
    copyWADraftToClipboard(wo, mechName, link, () => {
      addNotification?.(
        'Draft WA Berhasil Disalin',
        `Template pesan WhatsApp status WO ${wo.id} untuk ${wo.customerName} siap di-paste & dikirim!`,
        'success',
        wo.id
      );
    });
  };

  // Component Lifecycle Tracking
  const [selectedHistoryPn, setSelectedHistoryPn] = useState<string | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Edit Work Order states (for SA and Super Admin)
  const [editingWO, setEditingWO] = useState<any | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Post-Handover 3-Action Dialog State
  const [handoverSuccessWO, setHandoverSuccessWO] = useState<any | null>(null);

  // Cancel Work Order state (Customer declined / cancelled)
  const [cancellingWO, setCancellingWO] = useState<any | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('');
  const [cancelCustomNotes, setCancelCustomNotes] = useState<string>('');
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [isProcessingCancel, setIsProcessingCancel] = useState<boolean>(false);

  const handleOpenCancelModal = (wo: any) => {
    setCancellingWO(wo);
    setCancelReason('');
    setCancelCustomNotes('');
    setCancelError(null);
  };

  const handleConfirmCancelWO = async () => {
    if (!cancellingWO) return;
    
    // Strict validation: user must select a reason from the dropdown
    if (!cancelReason || !cancelReason.trim()) {
      setCancelError('Silakan pilih salah satu alasan pembatalan dari dropdown terlebih dahulu.');
      return;
    }

    if (cancelReason === 'Lainnya (Wajib Tuliskan Keterangan Tambahan)' && !cancelCustomNotes.trim()) {
      setCancelError('Harap tuliskan keterangan detail alasan pembatalan pada kolom catatan tambahan.');
      return;
    }

    const finalReason = cancelReason.startsWith('Lainnya')
      ? (cancelCustomNotes.trim() || 'Dibatalkan oleh Pelanggan')
      : (cancelCustomNotes.trim() ? `${cancelReason} - ${cancelCustomNotes.trim()}` : cancelReason);

    const hasMilestone = (cancellingWO.milestoneHistory || []).some((h: any) => h.milestone === 'SPK Dibatalkan');
    const newHistory = hasMilestone ? (cancellingWO.milestoneHistory || []) : [
      ...(cancellingWO.milestoneHistory || []),
      {
        milestone: 'SPK Dibatalkan',
        timestamp: new Date().toISOString(),
        updatedBy: currentUser?.name || 'Service Advisor'
      }
    ];

    try {
      setIsProcessingCancel(true);
      setCancelError(null);

      await updateWorkOrder(cancellingWO.id, {
        status: 'CANCELLED',
        cancelledAt: new Date().toISOString(),
        cancelledBy: currentUser?.name || 'Service Advisor',
        cancelReason: finalReason,
        currentMilestone: 'SPK Dibatalkan',
        milestoneHistory: newHistory
      });

      addNotification?.(
        'SPK Berhasil Dibatalkan',
        `SPK ${cancellingWO.id} (${cancellingWO.customerName}) telah dibatalkan di sistem. Alasan: ${finalReason}.`,
        'warning',
        cancellingWO.id
      );

      setCancellingWO(null);
      setCancelReason('');
      setCancelCustomNotes('');
    } catch (err: any) {
      console.error('Error cancelling work order in Firestore:', err);
      setCancelError(`Gagal menyimpan pembatalan ke Firestore: ${err.message || err}`);
    } finally {
      setIsProcessingCancel(false);
    }
  };

  const handleConfirmHandover = (wo: any) => {
    const hasMilestone = (wo.milestoneHistory || []).some((h: any) => h.milestone === 'Selesai & Siap Diserahkan');
    const newHistory = hasMilestone ? (wo.milestoneHistory || []) : [
      ...(wo.milestoneHistory || []),
      {
        milestone: 'Selesai & Siap Diserahkan',
        timestamp: new Date().toISOString(),
        updatedBy: currentUser?.name || 'Service Advisor'
      }
    ];
    const updatedData: Partial<any> = {
      isHandoverConfirmed: true,
      handoverDate: new Date().toISOString(),
      handoverConfirmedBy: currentUser?.name || 'Service Advisor',
      status: 'COMPLETED',
      currentMilestone: 'Selesai & Siap Diserahkan',
      milestoneHistory: newHistory
    };
    updateWorkOrder(wo.id, updatedData);
    setHandoverSuccessWO({ ...wo, ...updatedData });
    addNotification?.(
      'Konfirmasi Serah Terima Berhasil',
      `Unit WO ${wo.id} (${wo.customerName}) telah resmi diserahkan. Silakan cetak bukti serah terima atau selesaikan arsip.`,
      'success',
      wo.id
    );
  };

  const handleArchiveWithToast = (wo: any) => {
    updateWorkOrder(wo.id, { isArchived: true });
    addNotification?.(
      'SPK Berhasil Diarsipkan',
      `SPK ${wo.id} (${wo.customerName}) telah dipindahkan ke Lemari Arsip & Buku Servis Lifetime Kendaraan.`,
      'success',
      wo.id
    );
  };

  const handleRestoreWithToast = (wo: any) => {
    updateWorkOrder(wo.id, { isArchived: false });
    addNotification?.(
      'SPK Berhasil Dipulihkan',
      `SPK ${wo.id} (${wo.customerName}) telah dipulihkan dari arsip dan kembali aktif ke antrean/monitor.`,
      'success',
      wo.id
    );
  };

  // Search and Filter states for the Live Work Order Status Monitor
  const [queueSearch, setQueueSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | '1' | '2' | '3'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'QUEUE' | 'IN_PROGRESS' | 'PENDING_APPROVAL' | 'PENDING_PARTS' | 'COMPLETED' | 'CANCELLED' | 'ARCHIVED'>('ALL');
  const [showArchived, setShowArchived] = useState(false);
  const [woListPage, setWoListPage] = useState(1);
  const [woListLimit, setWoListLimit] = useState(5);
  const [activeTab, setActiveTab] = useState<'MONITOR' | 'FORM'>('MONITOR');

  React.useEffect(() => {
    setWoListPage(1);
  }, [queueSearch, priorityFilter, statusFilter, showArchived]);

  const getHistoricalWorkOrders = (pn: string) => {
    if (!pn || pn.trim().length < 3) return [];
    const cleanPn = pn.trim().toLowerCase();
    return workOrders.filter(wo => 
      wo.looseParts?.some(lp => lp.partNumber && lp.partNumber.toLowerCase().includes(cleanPn)) ||
      wo.partsTracking?.some(p => p.serialNumber && p.serialNumber.toLowerCase().includes(cleanPn))
    );
  };

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  
  const [bringerName, setBringerName] = useState('');
  const [bringerPhone, setBringerPhone] = useState('');
  const [bringerAddress, setBringerAddress] = useState('');
  
  const [vehicleBrand, setVehicleBrand] = useState('');
  const [vin, setVin] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [odometer, setOdometer] = useState('');
  const [fuelLevel, setFuelLevel] = useState<'E' | '1/4' | '1/2' | '3/4' | 'F'>('1/2');
  const [estimasiPengerjaan, setEstimasiPengerjaan] = useState('');
  const [garansi, setGaransi] = useState('');
  const [intakeDate, setIntakeDate] = useState(new Date().toISOString().slice(0, 16));
  const [fuelContaminated, setFuelContaminated] = useState(false);
  const [assyNo, setAssyNo] = useState('');
  const [dropMethod, setDropMethod] = useState<'WHOLE' | 'PARTS'>('WHOLE');
  
  const [partsTracking, setPartsTracking] = useState<PartDetails[]>(INITIAL_PARTS_TRACKING);
  const [looseParts, setLooseParts] = useState<LoosePartDetails[]>(INITIAL_LOOSE_PARTS);
  const [complaintPoints, setComplaintPoints] = useState<string[]>(['']);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [damages, setDamages] = useState<DamageReport[]>([]);
  const [priority, setPriority] = useState<Priority>(3);
  const [divisionFlow, setDivisionFlow] = useState<('SUPPLY_PUMP' | 'COMMON_RAIL' | 'TURBO')[]>(['SUPPLY_PUMP']);
  
  const [todoActions, setTodoActions] = useState<TodoAction[]>(INITIAL_TODO_ACTIONS);

  // Wizard Flow States
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardError, setWizardError] = useState<string | null>(null);

  const validateStep = (stepNum: number) => {
    if (stepNum === 1) {
      if (divisionFlow.length === 0) return { valid: false, message: "Minimal 1 divisi harus dipilih dalam Alur Divisi Pengerjaan!" };
      
      const cleanCustName = customerName.trim();
      if (!cleanCustName) return { valid: false, message: "Nama Lengkap Pelanggan wajib diisi!" };
      if (cleanCustName.length < 2 || cleanCustName.length > 50) return { valid: false, message: "Nama Lengkap Pelanggan harus berukuran 2 s.d. 50 karakter!" };
      if (!/^[A-Za-z\s'.]+$/.test(cleanCustName)) return { valid: false, message: "Nama Lengkap Pelanggan hanya boleh berisi huruf, spasi, titik, dan tanda petik tunggal!" };

      const cleanCustPhone = customerPhone.trim();
      if (!cleanCustPhone) return { valid: false, message: "Nomor Telepon / WhatsApp wajib diisi!" };
      if (!/^\+?[0-9]{6,15}$/.test(cleanCustPhone)) return { valid: false, message: "Nomor Telepon / WhatsApp Pelanggan tidak valid! Harus berupa angka 6 s.d. 15 digit (boleh pakai '+')." };

      if (!customerAddress.trim()) return { valid: false, message: "Alamat Lengkap wajib diisi!" };

      // Validate bringer details if they are entered
      if (bringerName && bringerName.trim()) {
        const cleanBName = bringerName.trim();
        if (cleanBName.length < 2 || cleanBName.length > 50) return { valid: false, message: "Nama Lengkap Pembawa harus berukuran 2 s.d. 50 karakter!" };
        if (!/^[A-Za-z\s'.]+$/.test(cleanBName)) return { valid: false, message: "Nama Lengkap Pembawa hanya boleh berisi huruf, spasi, titik, dan tanda petik tunggal!" };
      }
      if (bringerPhone && bringerPhone.trim()) {
        const cleanBPhone = bringerPhone.trim();
        if (!/^\+?[0-9]{6,15}$/.test(cleanBPhone)) return { valid: false, message: "Nomor Telepon / WhatsApp Pembawa tidak valid! Harus berupa angka 6 s.d. 15 digit (boleh pakai '+')." };
      }
    } else if (stepNum === 2) {
      if (dropMethod === 'WHOLE' && !vehicleBrand.trim()) return { valid: false, message: "Merek / Tipe / Tahun Mobil wajib diisi!" };
      
      if (dropMethod === 'WHOLE') {
        const cleanPlate = plateNumber.trim().replace(/\s+/g, '');
        if (!plateNumber.trim()) return { valid: false, message: "Nomor Plat Kendaraan wajib diisi!" };
        if (!/^[A-Z]{1,2}[0-9]{1,4}[A-Z]{0,3}$/i.test(cleanPlate)) return { valid: false, message: "Nomor Plat Kendaraan tidak valid! Format standard: B 1234 CD (1-2 huruf, 1-4 angka, 0-3 huruf)" };

        if (vin && vin.trim()) {
          const cleanVin = vin.trim();
          if (!/^[A-Z0-9]{5,17}$/i.test(cleanVin)) return { valid: false, message: "Nomor Rangka (VIN) tidak valid! Harus berupa alphanumeric antara 5 s.d. 17 karakter." };
        }

        if (!odometer.trim()) return { valid: false, message: "Kilometer (KM) / Hour Meter (HM) wajib diisi!" };
      }

      if (!intakeDate.trim()) return { valid: false, message: "Waktu Masuk Unit wajib diisi!" };
      if (!estimasiPengerjaan.trim()) return { valid: false, message: "Estimasi Waktu Pengerjaan wajib diisi!" };
      if (!garansi.trim()) return { valid: false, message: "Masa Garansi wajib diisi!" };
    }
    return { valid: true, message: "" };
  };

  const handleNextStep = () => {
    setWizardError(null);
    const check = validateStep(wizardStep);
    if (check.valid) {
      setWizardStep(prev => prev + 1);
      setTimeout(() => {
        const formEl = document.getElementById('intake-form-header');
        if (formEl) {
          formEl.scrollIntoView({ behavior: 'smooth' });
        }
      }, 50);
    } else {
      setWizardError(check.message);
    }
  };

  const handlePrevStep = () => {
    setWizardError(null);
    setWizardStep(prev => prev - 1);
    setTimeout(() => {
      const formEl = document.getElementById('intake-form-header');
      if (formEl) {
        formEl.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };

  const handleStepClick = (targetStep: number) => {
    setWizardError(null);
    if (targetStep < wizardStep) {
      setWizardStep(targetStep);
    } else if (targetStep > wizardStep) {
      for (let s = wizardStep; s < targetStep; s++) {
        const check = validateStep(s);
        if (!check.valid) {
          setWizardError(check.message);
          return;
        }
      }
      setWizardStep(targetStep);
    }
  };

  // Mechanic Alert simulation state
  const [mechanicAlert, setMechanicAlert] = useState<string | null>(null);

  const [inventorySearch, setInventorySearch] = useState('');

  const toggleInventory = (index: number) => {
    const newInv = [...inventory];
    newInv[index].checked = !newInv[index].checked;
    setInventory(newInv);
  };

  const selectAllInventory = () => {
    setInventory(inventory.map(item => ({ ...item, checked: true })));
  };

  const deselectAllInventory = () => {
    setInventory(inventory.map(item => ({ ...item, checked: false })));
  };

  const addLoosePart = () => {
    setLooseParts([
      ...looseParts,
      { id: Math.random().toString(), description: '', partNumber: '', physicalCondition: 'OK' }
    ]);
  };

  const updateLoosePart = (index: number, field: keyof LoosePartDetails, value: string) => {
    const newParts = [...looseParts];
    newParts[index] = { ...newParts[index], [field]: value };
    setLooseParts(newParts);
  };

  const removeLoosePart = (index: number) => {
    setLooseParts(looseParts.filter((_, i) => i !== index));
  };

  const updatePart = (index: number, field: keyof PartDetails, value: string) => {
    const newParts = [...partsTracking];
    newParts[index] = { ...newParts[index], [field]: value };
    setPartsTracking(newParts);
  };

  const toggleDamage = (partId: string) => {
    const existing = damages.find((d) => d.partId === partId);
    if (existing) {
      setDamages(damages.filter((d) => d.partId !== partId));
    } else {
      setDamages([...damages, { partId, description: '' }]);
    }
  };

  const updateDamageDescription = (partId: string, desc: string) => {
    setDamages(damages.map((d) => (d.partId === partId ? { ...d, description: desc } : d)));
  };

  const addTodoAction = () => {
    setTodoActions([
      ...todoActions,
      { id: Math.random().toString(), jenisPengerjaan: '', qty: 1, catatanMekanik: '', estimasiHarga: '', estimasiHargaMin: '', estimasiHargaMax: '' }
    ]);
  };

  const updateTodoAction = (index: number, field: keyof TodoAction, value: any) => {
    const newActions = [...todoActions];
    let finalValue = value;
    if (field === 'estimasiHarga' || field === 'estimasiHargaMin' || field === 'estimasiHargaMax') {
      finalValue = String(value).replace(/\D/g, '');
    }
    newActions[index] = { ...newActions[index], [field]: finalValue };
    setTodoActions(newActions);
  };

  const removeTodoAction = (index: number) => {
    setTodoActions(todoActions.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all steps before actual form submission
    for (let s = 1; s <= 2; s++) {
      const check = validateStep(s);
      if (!check.valid) {
        setWizardStep(s);
        setWizardError(check.message);
        return;
      }
    }

    const customerVoiceCombined = complaintPoints
      .map(p => p.trim())
      .filter(p => p !== '')
      .join('\n');

    const wo = addWorkOrder({
      priority,
      currentDivision: divisionFlow[0],
      divisionFlow,
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      bringerName,
      bringerPhone,
      bringerAddress,
      vehicleBrand: dropMethod === 'PARTS' ? 'Copotan (Loose Parts)' : vehicleBrand,
      vin: dropMethod === 'PARTS' ? '' : vin,
      plateNumber: dropMethod === 'PARTS' ? '-' : plateNumber,
      odometer: dropMethod === 'PARTS' ? '-' : odometer,
      fuelLevel: dropMethod === 'PARTS' ? '' : fuelLevel,
      estimasiPengerjaan,
      garansi,
      intakeDate,
      fuelContaminated: dropMethod === 'PARTS' ? false : fuelContaminated,
      assyNo,
      dropMethod,
      partsTracking: [],
      looseParts: dropMethod === 'PARTS' ? JSON.parse(JSON.stringify(looseParts)) : [],
      customerVoice: customerVoiceCombined,
      damages: JSON.parse(JSON.stringify(damages)),
      inventory: JSON.parse(JSON.stringify(inventory)),
      todoActions: JSON.parse(JSON.stringify(todoActions)),
      currentMilestone: 'Intake & Verifikasi',
      milestoneHistory: [
        { 
          milestone: 'Intake & Verifikasi', 
          timestamp: new Date().toISOString(), 
          updatedBy: 'Service Advisor'
        }
      ]
    });
    setPrintWO(JSON.parse(JSON.stringify(wo)));
    setTimeout(() => window.print(), 500);

    // Reset Form (Optional but good practice)
    setCustomerName('');
    setCustomerEmail('');
    setCustomerPhone('');
    setCustomerAddress('');
    setVehicleBrand('');
    setVin('');
    setPlateNumber('');
    setOdometer('');
    setEstimasiPengerjaan('');
    setGaransi('');
    setIntakeDate(new Date().toISOString().slice(0, 16));
    setFuelContaminated(false);
    setAssyNo('');
    setComplaintPoints(['']);
    setPartsTracking(INITIAL_PARTS_TRACKING);
    setLooseParts(INITIAL_LOOSE_PARTS);
    setDamages([]);
    setInventory(INITIAL_INVENTORY.map(item => ({ ...item, checked: false })));
    setTodoActions([
      { id: 't1', jenisPengerjaan: '', qty: 1, catatanMekanik: '', estimasiHarga: '', estimasiHargaMin: '', estimasiHargaMax: '' },
    ]);
    setWizardStep(1);
    setWizardError(null);
    setWoListPage(1);
    setActiveTab('MONITOR');
  };

  const blockedWOs = workOrders.filter(w => w.status === 'PENDING_APPROVAL' && w.blockedReason === 'HIDDEN_DEFECT');

  if (isLoading) {
    return (
      <div className="p-4 print:hidden space-y-6">
        {/* Skeleton Top Alert Cards or Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800/60 h-24 rounded-lg border border-slate-700/50 p-4 flex flex-col justify-between animate-pulse">
            <div className="h-4 bg-slate-700/60 rounded w-1/3"></div>
            <div className="h-8 bg-slate-700/60 rounded w-1/2"></div>
          </div>
          <div className="bg-slate-800/60 h-24 rounded-lg border border-slate-700/50 p-4 flex flex-col justify-between animate-pulse">
            <div className="h-4 bg-slate-700/60 rounded w-1/4"></div>
            <div className="h-8 bg-slate-700/60 rounded w-1/3"></div>
          </div>
          <div className="bg-slate-800/60 h-24 rounded-lg border border-slate-700/50 p-4 flex flex-col justify-between animate-pulse">
            <div className="h-4 bg-slate-700/60 rounded w-1/2"></div>
            <div className="h-8 bg-slate-700/60 rounded w-2/3"></div>
          </div>
        </div>

        {/* Skeleton Live Work Order Status Monitor card */}
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 space-y-4 animate-pulse">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-2">
              <div className="h-5 bg-slate-800 rounded w-64"></div>
              <div className="h-3 bg-slate-800 rounded w-96"></div>
            </div>
            <div className="h-6 bg-slate-850 rounded w-28"></div>
          </div>

          <div className="flex border-b border-slate-800 gap-2 pb-1">
            <div className="h-8 bg-slate-800 rounded-t-lg w-36"></div>
            <div className="h-8 bg-slate-800 rounded-t-lg w-36"></div>
          </div>

          <div className="bg-slate-850 p-3 rounded-lg border border-slate-800 h-14 flex items-center justify-between">
            <div className="h-8 bg-slate-900 rounded w-72"></div>
            <div className="flex gap-2">
              <div className="h-8 bg-slate-900 rounded w-24"></div>
              <div className="h-8 bg-slate-900 rounded w-24"></div>
            </div>
          </div>

          {/* Table Skeleton */}
          <div className="overflow-x-auto space-y-3">
            <div className="h-9 bg-slate-800 rounded w-full"></div>
            <div className="h-12 bg-slate-850 rounded w-full"></div>
            <div className="h-12 bg-slate-850 rounded w-full"></div>
            <div className="h-12 bg-slate-850 rounded w-full"></div>
            <div className="h-12 bg-slate-850 rounded w-full"></div>
          </div>
        </div>

        {/* Form Skeleton */}
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 space-y-6 animate-pulse">
          <div className="h-6 bg-slate-800 rounded w-48"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="h-4 bg-slate-800 rounded w-24"></div>
              <div className="h-10 bg-slate-850 rounded w-full"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-slate-800 rounded w-24"></div>
              <div className="h-10 bg-slate-850 rounded w-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 print:hidden space-y-4">
      
      {/* HIGH-PRIORITY REAL-TIME BLOCKED WORK ORDER TOASTS */}
      {blockedWOs.map(wo => (
        <div key={wo.id} className="bg-red-50 border-2 border-red-500 rounded-lg p-4 animate-bounce flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
          <div className="flex items-start gap-3">
            <span className="text-2xl mt-0.5">🚨</span>
            <div>
              <h4 className="text-red-800 font-black text-xs uppercase tracking-wider flex items-center gap-1.5">
                PERINGATAN PROTOKOL STOP-CLOCK: TEMUAN KERUSAKAN BARU (HIDDEN DEFECT)
              </h4>
              <p className="text-red-700 text-xs mt-1 leading-relaxed">
                Pekerjaan untuk kendaraan <strong>{wo.vehicleBrand} ({wo.plateNumber})</strong> dengan <strong>WO ID: {wo.id}</strong> saat ini TERKUNCI di laboratorium diesel. Segera lakukan re-estimasi biaya dan hubungi pelanggan <strong>{wo.customerName} ({wo.customerPhone})</strong> untuk persetujuan tindakan lanjutan!
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={() => {
              updateWorkOrder(wo.id, { isBlocked: false, blockedReason: undefined, status: 'QUEUE' });
            }}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold rounded shadow transition-all whitespace-nowrap uppercase"
          >
            Selesaikan Blokir / Kembali ke Antrean
          </button>
        </div>
      ))}

      {/* WORKSPACE TAB SWITCHER */}
      <div className="flex bg-slate-200/80 p-1 rounded-xl border border-slate-300 max-w-lg mx-auto shadow-sm select-none">
        <button
          type="button"
          onClick={() => setActiveTab('MONITOR')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-5 text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
            activeTab === 'MONITOR'
              ? 'bg-[#0F2D59] text-white shadow-md scale-[1.02]'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-300/50'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          Monitor Antrean ({workOrders.filter(w => w.status !== 'COMPLETED').length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('FORM')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-5 text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
            activeTab === 'FORM'
              ? 'bg-[#0F2D59] text-white shadow-md scale-[1.02]'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-300/50'
          }`}
        >
          <ClipboardList className="w-3.5 h-3.5" />
          Registrasi SPK Baru
        </button>
      </div>

      {activeTab === 'MONITOR' ? (
        <>
          {/* LIVE WORK ORDER TRACKING DASHBOARD */}
          <div className="bg-slate-900 text-white p-4 rounded-lg shadow-md border border-slate-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-blue-400 flex items-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping mr-2"></span>
              LIVE WORK ORDER STATUS MONITOR (REAL-TIME MECHANIC FEED)
            </h3>
            <p className="text-[10px] text-slate-400 mt-1">
              Pantau antrean pengerjaan laboratorium diesel & arsipkan SPK yang telah selesai agar daftar tetap rapi.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono border border-slate-700">
              Antrean Aktif: {workOrders.filter(w => w.status !== 'COMPLETED').length} Unit
            </span>
          </div>
        </div>

        <>
          {/* INTERACTIVE WORKSHOP KPI CARDS BAR */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 mb-4 select-none">
            {/* All Active Card */}
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className={`p-2.5 rounded-lg border text-left transition-all relative overflow-hidden cursor-pointer flex flex-col justify-between h-16 ${
                statusFilter === 'ALL'
                  ? 'bg-blue-950/40 border-blue-500/80 shadow-md shadow-blue-900/10'
                  : 'bg-slate-850 border-slate-800/60 hover:border-slate-700 hover:bg-slate-800/80'
              }`}
            >
              <div className="flex items-center justify-between w-full gap-2">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 truncate">Semua SPK</span>
                <Car className={`w-3.5 h-3.5 shrink-0 ${statusFilter === 'ALL' ? 'text-blue-400 animate-pulse' : 'text-slate-500'}`} />
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-base font-black text-white">{workOrders.filter(w => w.status !== 'COMPLETED' || !w.isHandoverConfirmed).length}</span>
                <span className="text-[8px] text-slate-500 font-bold uppercase">Unit</span>
              </div>
              <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 transition-opacity ${statusFilter === 'ALL' ? 'opacity-100' : 'opacity-0'}`}></div>
            </button>

            {/* Queue Card */}
            <button
              type="button"
              onClick={() => setStatusFilter('QUEUE')}
              className={`p-2.5 rounded-lg border text-left transition-all relative overflow-hidden cursor-pointer flex flex-col justify-between h-16 ${
                statusFilter === 'QUEUE'
                  ? 'bg-slate-800/80 border-slate-400/80 shadow-md'
                  : 'bg-slate-850 border-slate-800/60 hover:border-slate-700 hover:bg-slate-800/80'
              }`}
            >
              <div className="flex items-center justify-between w-full gap-2">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 truncate">⏳ Antrean</span>
                <Clock className={`w-3.5 h-3.5 shrink-0 ${statusFilter === 'QUEUE' ? 'text-slate-300 animate-pulse' : 'text-slate-500'}`} />
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-base font-black text-white">{workOrders.filter(w => w.status === 'QUEUE').length}</span>
                <span className="text-[8px] text-slate-500 font-bold uppercase">Unit</span>
              </div>
              <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-slate-450 transition-opacity ${statusFilter === 'QUEUE' ? 'opacity-100' : 'opacity-0'}`}></div>
            </button>

            {/* In Progress Card */}
            <button
              type="button"
              onClick={() => setStatusFilter('IN_PROGRESS')}
              className={`p-2.5 rounded-lg border text-left transition-all relative overflow-hidden cursor-pointer flex flex-col justify-between h-16 ${
                statusFilter === 'IN_PROGRESS'
                  ? 'bg-blue-950/40 border-blue-400/80 shadow-md shadow-blue-900/10'
                  : 'bg-slate-850 border-slate-800/60 hover:border-slate-700 hover:bg-slate-800/80'
              }`}
            >
              <div className="flex items-center justify-between w-full gap-2">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 truncate">⚡ Kerja</span>
                <Wrench className={`w-3.5 h-3.5 shrink-0 ${statusFilter === 'IN_PROGRESS' ? 'text-blue-400 animate-pulse' : 'text-slate-500'}`} />
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-base font-black text-white">{workOrders.filter(w => w.status === 'IN_PROGRESS').length}</span>
                <span className="text-[8px] text-slate-500 font-bold uppercase">Unit</span>
              </div>
              <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400 transition-opacity ${statusFilter === 'IN_PROGRESS' ? 'opacity-100' : 'opacity-0'}`}></div>
            </button>

            {/* Pending Approval Card */}
            <button
              type="button"
              onClick={() => setStatusFilter('PENDING_APPROVAL')}
              className={`p-2.5 rounded-lg border text-left transition-all relative overflow-hidden cursor-pointer flex flex-col justify-between h-16 ${
                statusFilter === 'PENDING_APPROVAL'
                  ? 'bg-red-950/40 border-red-500/80 shadow-md shadow-red-900/10'
                  : 'bg-slate-850 border-slate-800/60 hover:border-slate-700 hover:bg-slate-800/80'
              }`}
            >
              <div className="flex items-center justify-between w-full gap-2">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 truncate">⚠️ Approval</span>
                <ShieldAlert className={`w-3.5 h-3.5 shrink-0 ${statusFilter === 'PENDING_APPROVAL' ? 'text-red-400 animate-bounce' : 'text-slate-500'}`} />
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-base font-black text-white">{workOrders.filter(w => w.status === 'PENDING_APPROVAL').length}</span>
                <span className="text-[8px] text-slate-500 font-bold uppercase">Unit</span>
              </div>
              <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-red-500 transition-opacity ${statusFilter === 'PENDING_APPROVAL' ? 'opacity-100' : 'opacity-0'}`}></div>
            </button>

            {/* Pending Parts Card */}
            <button
              type="button"
              onClick={() => setStatusFilter('PENDING_PARTS')}
              className={`p-2.5 rounded-lg border text-left transition-all relative overflow-hidden cursor-pointer flex flex-col justify-between h-16 ${
                statusFilter === 'PENDING_PARTS'
                  ? 'bg-amber-950/40 border-amber-500/80 shadow-md shadow-amber-900/10'
                  : 'bg-slate-850 border-slate-800/60 hover:border-slate-700 hover:bg-slate-800/80'
              }`}
            >
              <div className="flex items-center justify-between w-full gap-2">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 truncate">🔧 Part Tunda</span>
                <Archive className={`w-3.5 h-3.5 shrink-0 ${statusFilter === 'PENDING_PARTS' ? 'text-amber-400 animate-pulse' : 'text-slate-500'}`} />
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-base font-black text-white">{workOrders.filter(w => w.status === 'PENDING_PARTS').length}</span>
                <span className="text-[8px] text-slate-500 font-bold uppercase">Unit</span>
              </div>
              <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 transition-opacity ${statusFilter === 'PENDING_PARTS' ? 'opacity-100' : 'opacity-0'}`}></div>
            </button>

            {/* Completed Card */}
            <button
              type="button"
              onClick={() => setStatusFilter('COMPLETED')}
              className={`p-2.5 rounded-lg border text-left transition-all relative overflow-hidden cursor-pointer flex flex-col justify-between h-16 ${
                statusFilter === 'COMPLETED'
                  ? 'bg-emerald-950/40 border-emerald-500/80 shadow-md shadow-emerald-900/10'
                  : 'bg-slate-850 border-slate-800/60 hover:border-slate-700 hover:bg-slate-800/80'
              }`}
            >
              <div className="flex items-center justify-between w-full gap-2">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 truncate">✅ Siap QC</span>
                <Check className={`w-3.5 h-3.5 shrink-0 ${statusFilter === 'COMPLETED' ? 'text-emerald-400 font-black' : 'text-slate-500'}`} />
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-base font-black text-white">{workOrders.filter(w => w.status === 'COMPLETED' && !w.isHandoverConfirmed).length}</span>
                <span className="text-[8px] text-slate-500 font-bold uppercase">Unit</span>
              </div>
              <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 transition-opacity ${statusFilter === 'COMPLETED' ? 'opacity-100' : 'opacity-0'}`}></div>
            </button>
          </div>

          {/* Search & Filter Panel */}
            <div className="bg-slate-850 p-3 rounded-lg border border-slate-800 mb-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between shadow-inner">
              {/* Search Input */}
              <div className="relative flex-1 max-w-md">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  id="wo-search-input"
                  type="text"
                  placeholder="Cari nama, plat nomor, atau ID SPK..."
                  value={queueSearch}
                  onChange={(e) => setQueueSearch(e.target.value)}
                  className="w-full pl-9 pr-8 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                />
                {queueSearch && (
                  <button
                    type="button"
                    onClick={() => setQueueSearch('')}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-450 hover:text-white text-xs font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Quick Filters */}
              <div className="flex flex-wrap items-center gap-4">
                {/* Priority Filter */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Prioritas:</span>
                  <div className="flex flex-wrap bg-slate-950 p-1 rounded-xl border border-slate-800 shadow-inner gap-1 max-w-full">
                    {(['ALL', '1', '2', '3'] as const).map((p) => {
                      let label = 'Semua';
                      let activeClass = 'bg-slate-800 text-white border-slate-700';
                      let hoverClass = 'hover:bg-blue-600/20 hover:text-blue-400';
                      
                      if (p === '1') {
                        label = '🔴 Urgent';
                        activeClass = 'bg-red-500 text-white shadow-md shadow-red-900/40 border-transparent';
                        hoverClass = 'hover:bg-red-500/10 hover:text-red-400';
                      } else if (p === '2') {
                        label = '🟡 Booking';
                        activeClass = 'bg-amber-500 text-slate-950 shadow-md shadow-amber-900/40 border-transparent';
                        hoverClass = 'hover:bg-amber-500/10 hover:text-amber-400';
                      } else if (p === '3') {
                        label = '🔵 Regular';
                        activeClass = 'bg-blue-500 text-white shadow-md shadow-blue-900/40 border-transparent';
                        hoverClass = 'hover:bg-blue-500/10 hover:text-blue-400';
                      } else {
                        activeClass = 'bg-blue-600 text-white shadow-md shadow-blue-900/40 border-transparent';
                      }

                      const isActive = priorityFilter === p;
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPriorityFilter(p)}
                          className={`px-2 sm:px-3 py-1.5 sm:py-1 text-[10px] sm:text-[11px] font-black rounded-lg transition-all border border-transparent whitespace-nowrap ${
                            isActive 
                              ? `${activeClass}` 
                              : `text-slate-400 ${hoverClass} hover:border-slate-800`
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Status:</span>
                  <div className="relative">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                      className="bg-slate-950 border border-slate-800 hover:border-blue-500 focus:border-blue-500 text-xs font-black text-slate-200 py-1.5 pl-3 pr-8 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all cursor-pointer shadow-sm appearance-none"
                    >
                      <option value="ALL">📋 Semua Aktif</option>
                      <option value="QUEUE">⏳ Antrean</option>
                      <option value="IN_PROGRESS">⚡ Sedang Kerja</option>
                      <option value="PENDING_APPROVAL">⚠️ Butuh Persetujuan</option>
                      <option value="PENDING_PARTS">🔧 Tertunda Parts</option>
                      <option value="COMPLETED">✅ Selesai / Siap QC</option>
                      <option value="CANCELLED">❌ Dibatalkan (Cancel)</option>
                      <option value="ARCHIVED">📦 Hanya Diarsipkan</option>
                    </select>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none text-slate-400 text-[10px]">
                      ▼
                    </span>
                  </div>
                </div>

                {/* Show Archived Quick Toggle */}
                <button
                  type="button"
                  onClick={() => setShowArchived(!showArchived)}
                  className={`px-2.5 py-1.5 text-[10px] sm:text-[11px] font-black rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
                    showArchived 
                      ? 'bg-amber-950/80 border-amber-600 text-amber-300 shadow-sm' 
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                  title="Tampilkan juga SPK yang sudah diarsipkan agar dapat dipulihkan atau ditinjau"
                >
                  <Archive className="w-3.5 h-3.5 text-amber-400" />
                  <span>Termasuk Arsip</span>
                  {showArchived && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>}
                </button>
              </div>

              {/* Clear Filters Button if any is active */}
              {(queueSearch || priorityFilter !== 'ALL' || statusFilter !== 'ALL' || showArchived) && (
                <button
                  type="button"
                  onClick={() => {
                    setQueueSearch('');
                    setPriorityFilter('ALL');
                    setStatusFilter('ALL');
                    setShowArchived(false);
                  }}
                  className="text-[10px] text-blue-400 hover:text-blue-300 underline font-bold cursor-pointer"
                >
                  Reset Filter
                </button>
              )}
            </div>

            {(() => {
              const filteredWOs = workOrders.filter(wo => {
                const isSearchActive = Boolean(queueSearch.trim());

                // Filter by archive status
                if (statusFilter === 'ARCHIVED') {
                  if (!wo.isArchived) return false;
                } else if (!showArchived && !isSearchActive) {
                  // Hide archived items by default when browsing active queue without search
                  if (wo.isArchived) return false;
                }

                // Filter by operational status
                if (statusFilter !== 'ALL' && statusFilter !== 'ARCHIVED') {
                  if (wo.status !== statusFilter) return false;
                }

                // For COMPLETED items without search / without showArchived / without ARCHIVED status:
                if (statusFilter === 'ALL' && !showArchived && !isSearchActive && wo.status === 'COMPLETED') {
                  // If handover is not yet confirmed, we must show it in the active list so SA can confirm handover!
                  if (!wo.isHandoverConfirmed) return true;

                  try {
                    const dStr = wo.handoverDate || wo.intakeDate || wo.createdAt;
                    if (dStr) {
                      const d = new Date(dStr);
                      const today = new Date();
                      const isToday = d.getDate() === today.getDate() &&
                                      d.getMonth() === today.getMonth() &&
                                      d.getFullYear() === today.getFullYear();
                      if (!isToday) return false;
                    } else {
                      return false;
                    }
                  } catch {
                    return false;
                  }
                }

                // Filter by search query
                if (isSearchActive) {
                  const query = queueSearch.toLowerCase();
                  const matchesId = wo.id.toLowerCase().includes(query);
                  const matchesCustomer = wo.customerName.toLowerCase().includes(query);
                  const matchesPlate = wo.plateNumber.toLowerCase().includes(query);
                  if (!matchesId && !matchesCustomer && !matchesPlate) return false;
                }

                // Filter by priority
                if (priorityFilter !== 'ALL') {
                  if (wo.priority !== parseInt(priorityFilter, 10)) return false;
                }

                return true;
              }).sort((a, b) => {
                const tA = new Date(a.createdAt || a.intakeDate || 0).getTime();
                const tB = new Date(b.createdAt || b.intakeDate || 0).getTime();
                return tB - tA;
              });
              
              if (filteredWOs.length === 0) {
                const hasFilters = queueSearch || priorityFilter !== 'ALL' || statusFilter !== 'ALL';
                return (
                  <div className="text-center p-8 text-slate-400 text-xs bg-slate-900 rounded-lg border border-slate-800 flex flex-col items-center justify-center gap-2">
                    <p>
                      {hasFilters 
                        ? "Tidak ada SPK yang cocok dengan kata kunci pencarian atau filter yang aktif."
                        : "Belum ada SPK aktif terdaftar dalam antrean laboratorium. Silakan buat SPK baru menggunakan formulir di bawah."
                      }
                    </p>
                    {hasFilters && (
                      <button
                        type="button"
                        onClick={() => {
                          setQueueSearch('');
                          setPriorityFilter('ALL');
                          setStatusFilter('ALL');
                        }}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded text-[10px] mt-1 transition-all"
                      >
                        Reset Filter & Pencarian
                      </button>
                    )}
                  </div>
                );
              }

              const totalItems = filteredWOs.length;
              const totalPages = Math.ceil(totalItems / woListLimit);
              const startIndex = (woListPage - 1) * woListLimit;
              const paginatedWOs = filteredWOs.slice(startIndex, startIndex + woListLimit);

              return (
                <div id="wo-list-container">
                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto custom-scrollbar">
                    <table className="w-full border-collapse text-left text-xs text-slate-300">
                      <thead>
                        <tr className="bg-slate-800 text-slate-400 border-b border-slate-700">
                          <th className="p-2 font-bold w-24">WO ID</th>
                          <th className="p-2 font-bold w-24">Priority</th>
                          <th className="p-2 font-bold">Pelanggan</th>
                          <th className="p-2 font-bold">Kendaraan & Plat</th>
                          <th className="p-2 font-bold">Mekanik Terpilih</th>
                          <th className="p-2 font-bold text-center w-36">Status Kerja</th>
                          <th className="p-2 font-bold text-center w-36">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {paginatedWOs.map((wo) => {
                          const assignedMech = users.find(u => u.id === wo.mechanicId)?.name || 'Queue Antrean';
                          return (
                            <tr 
                              key={wo.id} 
                              className={`transition-colors ${
                                wo.isArchived 
                                  ? 'bg-slate-900/60 opacity-80 hover:opacity-100 border-b border-dashed border-amber-900/40' 
                                  : 'hover:bg-slate-800/50'
                              }`}
                            >
                              <td className="p-2 font-mono text-[11px] text-blue-400 font-bold">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span>{wo.id}</span>
                                  {wo.status === 'CANCELLED' && (
                                    <span 
                                      className="px-1.5 py-0.5 bg-rose-950 text-rose-300 text-[8px] font-black rounded border border-rose-800 flex items-center gap-0.5 shadow-xs tracking-wider"
                                      title={wo.cancelReason ? `Dibatalkan: ${wo.cancelReason}` : 'SPK Dibatalkan (Decline)'}
                                    >
                                      <Ban className="w-2.5 h-2.5 text-rose-400" />
                                      CANCEL
                                    </span>
                                  )}
                                  {wo.isArchived && (
                                    <span 
                                      className="px-1.5 py-0.5 bg-amber-950/90 text-amber-300 text-[8px] font-black rounded border border-amber-800/80 flex items-center gap-0.5 shadow-xs tracking-wider"
                                      title="Dokumen berstatus DIARSIPKAN. Klik Pulihkan untuk mengembalikan ke antrean aktif."
                                    >
                                      <Archive className="w-2.5 h-2.5 text-amber-400" />
                                      ARSIP
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="p-2 whitespace-nowrap">
                                {wo.priority === 1 && <span className="px-1.5 py-0.5 bg-red-900/40 text-red-300 text-[9px] font-black rounded border border-red-800 whitespace-nowrap inline-block">🔴 P1 Urgent</span>}
                                {wo.priority === 2 && <span className="px-1.5 py-0.5 bg-yellow-900/40 text-yellow-300 text-[9px] font-black rounded border border-yellow-800 whitespace-nowrap inline-block">🟡 P2 Booking</span>}
                                {wo.priority === 3 && <span className="px-1.5 py-0.5 bg-blue-900/40 text-blue-300 text-[9px] font-black rounded border border-blue-800 whitespace-nowrap inline-block">🔵 P3 Regular</span>}
                              </td>
                              <td className="p-2 truncate max-w-[140px] whitespace-nowrap text-ellipsis overflow-hidden" title={wo.customerName}>
                                <div className="font-bold text-slate-200 truncate whitespace-nowrap">{wo.customerName}</div>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="text-[9px] text-slate-500 font-mono truncate whitespace-nowrap">{wo.customerPhone}</span>
                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      onClick={() => handleCopyTrackingLink(wo)}
                                      className="p-0.5 hover:bg-slate-700 hover:text-blue-400 rounded transition-colors text-slate-400 cursor-pointer"
                                      title="Salin Link Pelacakan Live"
                                    >
                                      <Copy className="w-2.5 h-2.5" />
                                    </button>
                                    <button
                                      onClick={() => handleShareWhatsApp(wo)}
                                      className="p-0.5 hover:bg-slate-700 hover:text-emerald-400 rounded transition-colors text-slate-400 cursor-pointer"
                                      title="Kirim Pelacakan via WhatsApp"
                                    >
                                      <Share2 className="w-2.5 h-2.5" />
                                    </button>
                                    <button
                                      onClick={() => handleCopyWADraft(wo)}
                                      className="px-1.5 py-0.5 bg-emerald-950/80 hover:bg-emerald-700 hover:text-white text-emerald-300 border border-emerald-800/80 rounded text-[8.5px] font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                                      title="Salin Draft Template Pesan WhatsApp Status Pengerjaan (Siap Kirim)"
                                    >
                                      <MessageSquare className="w-2.5 h-2.5 text-emerald-400" />
                                      <span>Draft WA</span>
                                    </button>
                                  </div>
                                </div>
                              </td>
                              <td className="p-2 truncate max-w-[150px] whitespace-nowrap text-ellipsis overflow-hidden">
                                <div className="font-medium text-slate-200 truncate whitespace-nowrap">{wo.vehicleBrand}</div>
                                <div className="text-[10px] text-slate-400 font-mono font-bold truncate whitespace-nowrap">{wo.plateNumber}</div>
                              </td>
                              <td className="p-2 whitespace-nowrap">
                                <div className="flex items-center gap-1.5 whitespace-nowrap">
                                  <span className={`w-1.5 h-1.5 rounded-full ${wo.mechanicId ? 'bg-blue-400' : 'bg-slate-500'} shrink-0`}></span>
                                  <span className="font-medium truncate max-w-[120px]">{assignedMech}</span>
                                </div>
                              </td>
                              <td className="p-2 text-center">
                                <select
                                  value={wo.status}
                                  onChange={(e) => {
                                    const nextStatus = e.target.value as any;
                                    if (nextStatus === 'CANCELLED') {
                                      handleOpenCancelModal(wo);
                                    } else {
                                      updateWorkOrder(wo.id, { status: nextStatus });
                                    }
                                  }}
                                  className={`px-2 py-1 text-[10px] font-black rounded-lg border uppercase tracking-wider outline-none cursor-pointer transition-all shadow-xs ${
                                    wo.status === 'QUEUE' ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700' :
                                    wo.status === 'IN_PROGRESS' ? 'bg-blue-950 text-blue-300 border-blue-800/80 hover:bg-blue-900/50' :
                                    wo.status === 'PENDING_APPROVAL' ? 'bg-red-950 text-red-300 border-red-800/80 hover:bg-red-900/50' :
                                    wo.status === 'PENDING_PARTS' ? 'bg-amber-950 text-amber-300 border-amber-850 hover:bg-amber-900/50' :
                                    wo.status === 'CANCELLED' ? 'bg-rose-950 text-rose-300 border-rose-800/80 hover:bg-rose-900/50' :
                                    'bg-emerald-950 text-emerald-300 border-emerald-800/80 hover:bg-emerald-900/50'
                                  }`}
                                >
                                  <option value="QUEUE" className="bg-slate-900 text-slate-200 font-semibold">⏳ Antrean</option>
                                  <option value="IN_PROGRESS" className="bg-slate-900 text-slate-200 font-semibold">⚡ Sedang Kerja</option>
                                  <option value="PENDING_APPROVAL" className="bg-slate-900 text-slate-200 font-semibold">⚠️ Butuh Approval</option>
                                  <option value="PENDING_PARTS" className="bg-slate-900 text-slate-200 font-semibold">🔧 Tertunda Parts</option>
                                  <option value="COMPLETED" className="bg-slate-900 text-slate-200 font-semibold">✅ Selesai / Siap QC</option>
                                  <option value="CANCELLED" className="bg-slate-900 text-slate-200 font-semibold">❌ Dibatalkan (Cancel)</option>
                                </select>
                              </td>
                              <td className="p-2">
                                <div className="flex flex-col gap-1.5 items-center justify-center">
                                  {wo.isArchived ? (
                                    <div className="flex items-center gap-1 w-full justify-center">
                                      <button
                                        type="button"
                                        onClick={() => handleRestoreWithToast(wo)}
                                        className="px-2 py-1 bg-emerald-950/90 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-700/80 text-[8.5px] font-black rounded uppercase transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                                        title="Pulihkan SPK ini dari arsip kembali aktif ke antrean"
                                      >
                                        <RotateCcw className="w-2.5 h-2.5 text-emerald-400" />
                                        <span>Pulihkan</span>
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => {
                                          setPrintType('SPK');
                                          setPrintWO(wo);
                                        }}
                                        className="px-2 py-1 bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white text-[8.5px] font-bold rounded uppercase transition-all flex items-center gap-0.5 cursor-pointer"
                                        title="Cetak Dokumen SPK"
                                      >
                                        <Printer className="w-2.5 h-2.5" />
                                        <span>SPK</span>
                                      </button>

                                      {(currentUser?.role === 'SA' || currentUser?.role === 'ADMIN') && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setEditingWO(wo);
                                            setIsEditModalOpen(true);
                                          }}
                                          className="px-2 py-1 bg-slate-800 border border-slate-700 text-amber-300 hover:bg-amber-600 hover:text-white text-[8.5px] font-bold rounded uppercase transition-all flex items-center gap-0.5 cursor-pointer"
                                          title="Edit SPK / Koreksi Human Error"
                                        >
                                          <Pencil className="w-2.5 h-2.5" />
                                          <span>Edit</span>
                                        </button>
                                      )}
                                    </div>
                                  ) : wo.status === 'CANCELLED' ? (
                                    <div className="flex items-center gap-1 w-full justify-center">
                                      <button
                                        type="button"
                                        onClick={() => handleArchiveWithToast(wo)}
                                        className="px-2 py-1 bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white text-[8.5px] font-black rounded uppercase transition-all flex items-center gap-1 cursor-pointer"
                                        title="Arsipkan SPK Dibatalkan"
                                      >
                                        <Archive className="w-2.5 h-2.5 text-slate-400" />
                                        <span>Arsipkan</span>
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => {
                                          setPrintType('SPK');
                                          setPrintWO(wo);
                                        }}
                                        className="px-2 py-1 bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white text-[8.5px] font-bold rounded uppercase transition-all flex items-center gap-0.5 cursor-pointer"
                                        title="Cetak Dokumen SPK"
                                      >
                                        <Printer className="w-2.5 h-2.5" />
                                        <span>SPK</span>
                                      </button>

                                      {(currentUser?.role === 'SA' || currentUser?.role === 'ADMIN') && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setEditingWO(wo);
                                            setIsEditModalOpen(true);
                                          }}
                                          className="px-2 py-1 bg-slate-800 border border-slate-700 text-amber-300 hover:bg-amber-600 hover:text-white text-[8.5px] font-bold rounded uppercase transition-all flex items-center gap-0.5 cursor-pointer"
                                          title="Edit SPK / Koreksi Status"
                                        >
                                          <Pencil className="w-2.5 h-2.5" />
                                          <span>Edit</span>
                                        </button>
                                      )}
                                    </div>
                                  ) : wo.status === 'COMPLETED' && !wo.isHandoverConfirmed ? (
                                    <button
                                      type="button"
                                      onClick={() => handleConfirmHandover(wo)}
                                      className="w-full px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[9.5px] font-black rounded-lg uppercase tracking-wider transition-all flex items-center justify-center gap-1 shadow-md cursor-pointer animate-pulse"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                      <span>Konfirmasi Serah</span>
                                    </button>
                                  ) : wo.status === 'COMPLETED' && wo.isHandoverConfirmed ? (
                                    <div className="w-full flex flex-col gap-1">
                                      <div className="flex items-center gap-1 w-full">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setPrintType('HANDOVER');
                                            setPrintWO(wo);
                                          }}
                                          className="flex-1 px-1.5 py-1 bg-blue-950/80 border border-blue-800/70 text-blue-300 hover:bg-blue-600 hover:text-white text-[8.5px] font-bold rounded uppercase transition-all flex items-center justify-center gap-1 cursor-pointer"
                                          title="Simpan & Preview Dokumen Penyerahan PDF"
                                        >
                                          <Download className="w-2.5 h-2.5" />
                                          <span>Simpan PDF</span>
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() => {
                                            setPrintType('HANDOVER');
                                            setPrintWO(wo);
                                            setTimeout(() => window.print(), 300);
                                          }}
                                          className="flex-1 px-1.5 py-1 bg-purple-950/80 border border-purple-800/70 text-purple-300 hover:bg-purple-600 hover:text-white text-[8.5px] font-bold rounded uppercase transition-all flex items-center justify-center gap-1 cursor-pointer"
                                          title="Cetak Fisik Surat Bukti Serah Terima Resmi"
                                        >
                                          <Printer className="w-2.5 h-2.5" />
                                          <span>Cetak Serah</span>
                                        </button>
                                      </div>

                                      <div className="flex items-center gap-1 w-full">
                                        <button
                                          type="button"
                                          onClick={() => handleArchiveWithToast(wo)}
                                          className="flex-1 px-2 py-1 bg-emerald-950/90 border border-emerald-700/80 text-emerald-300 hover:bg-emerald-600 hover:text-white text-[8.5px] font-black rounded uppercase transition-all flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                                          title="Selesai pengerjaan dan pindahkan ke Buku Servis Lifetime & Arsip"
                                        >
                                          <Archive className="w-2.5 h-2.5" />
                                          <span>Selesai & Archive</span>
                                        </button>

                                        {(currentUser?.role === 'SA' || currentUser?.role === 'ADMIN') && (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setEditingWO(wo);
                                              setIsEditModalOpen(true);
                                            }}
                                            className="px-2 py-1 bg-slate-800 border border-slate-700 text-amber-300 hover:bg-amber-600 hover:text-white text-[8.5px] font-bold rounded uppercase transition-all flex items-center justify-center gap-0.5 cursor-pointer"
                                            title="Edit SPK / Koreksi Data Human Error"
                                          >
                                            <Pencil className="w-2.5 h-2.5" />
                                            <span>Edit</span>
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setPrintType('SPK');
                                          setPrintWO(wo);
                                        }}
                                        className="px-2 py-1 bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white text-[9px] font-bold rounded-md font-mono uppercase transition-all flex items-center gap-0.5 cursor-pointer"
                                        title="Cetak SPK Standard / Bukti Invoice Kerja"
                                      >
                                        <Printer className="w-3 h-3" />
                                        <span>SPK</span>
                                      </button>

                                      {(currentUser?.role === 'SA' || currentUser?.role === 'ADMIN') && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setEditingWO(wo);
                                            setIsEditModalOpen(true);
                                          }}
                                          className="px-2 py-1 bg-slate-800 border border-slate-700 text-amber-300 hover:bg-amber-600 hover:text-white text-[9px] font-bold rounded-md font-mono uppercase transition-all flex items-center gap-0.5 cursor-pointer"
                                          title="Edit SPK / Koreksi Data Human Error"
                                        >
                                          <Pencil className="w-3 h-3" />
                                          <span>Edit</span>
                                        </button>
                                      )}

                                      <button
                                        type="button"
                                        onClick={() => handleOpenCancelModal(wo)}
                                        className="px-2 py-1 bg-rose-950/60 border border-rose-800/70 text-rose-300 hover:bg-rose-600 hover:text-white text-[9px] font-bold rounded-md font-mono uppercase transition-all flex items-center gap-0.5 cursor-pointer"
                                        title="Batalkan SPK ini jika pelanggan decline / menolak estimasi pengerjaan"
                                      >
                                        <Ban className="w-3 h-3 text-rose-400" />
                                        <span>Cancel</span>
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Responsive Cards View */}
                  <div className="block md:hidden space-y-3">
                    {paginatedWOs.map((wo, index) => {
                      const assignedMech = users.find(u => u.id === wo.mechanicId)?.name || 'Queue Antrean';
                      return (
                        <motion.div
                          key={wo.id}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          whileHover={{ scale: 1.01, y: -2 }}
                          transition={{ duration: 0.25, delay: Math.min(index * 0.04, 0.2) }}
                          className={`p-4 rounded-xl border space-y-3 shadow-md transition-all ${
                            wo.isArchived
                              ? 'bg-slate-900/60 border-dashed border-amber-900/60 opacity-85 hover:opacity-100'
                              : 'bg-slate-850 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs text-blue-400 font-bold">{wo.id}</span>
                              {wo.status === 'CANCELLED' && (
                                <span className="px-1.5 py-0.5 bg-rose-950 text-rose-300 text-[8.5px] font-black rounded border border-rose-800 flex items-center gap-1 shadow-xs tracking-wider">
                                  <Ban className="w-2.5 h-2.5 text-rose-400" />
                                  CANCEL
                                </span>
                              )}
                              {wo.isArchived && (
                                <span className="px-1.5 py-0.5 bg-amber-950/90 text-amber-300 text-[8.5px] font-black rounded border border-amber-800/80 flex items-center gap-1 shadow-xs tracking-wider">
                                  <Archive className="w-2.5 h-2.5 text-amber-400" />
                                  DIARSIPKAN
                                </span>
                              )}
                            </div>
                            <div className="shrink-0 whitespace-nowrap">
                              {wo.priority === 1 && <span className="px-1.5 py-0.5 bg-red-900/40 text-red-300 text-[9px] font-black rounded border border-red-800 whitespace-nowrap inline-block">🔴 Urgent</span>}
                              {wo.priority === 2 && <span className="px-1.5 py-0.5 bg-yellow-900/40 text-yellow-300 text-[9px] font-black rounded border border-yellow-800 whitespace-nowrap inline-block">🟡 Booking</span>}
                              {wo.priority === 3 && <span className="px-1.5 py-0.5 bg-blue-900/40 text-blue-300 text-[9px] font-black rounded border border-blue-800 whitespace-nowrap inline-block">🔵 Regular</span>}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-800/80 pt-2.5">
                            <div>
                              <span className="text-[9px] text-slate-500 uppercase font-bold block">Pelanggan</span>
                              <span className="font-bold text-slate-200 block truncate">{wo.customerName}</span>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[9px] text-slate-400 font-mono truncate max-w-[80px] block">{wo.customerPhone}</span>
                                <button
                                  onClick={() => handleCopyTrackingLink(wo)}
                                  className="p-1 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded transition-colors cursor-pointer"
                                  title="Salin Link Pelacakan"
                                >
                                  <Copy className="w-2.5 h-2.5" />
                                </button>
                                <button
                                  onClick={() => handleShareWhatsApp(wo)}
                                  className="p-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded transition-colors cursor-pointer"
                                  title="Kirim via WhatsApp"
                                >
                                  <Share2 className="w-2.5 h-2.5" />
                                </button>
                                <button
                                  onClick={() => handleCopyWADraft(wo)}
                                  className="p-1 px-1.5 bg-emerald-950/80 hover:bg-emerald-700 text-emerald-300 border border-emerald-800/80 rounded text-[9px] font-bold transition-colors flex items-center gap-0.5 cursor-pointer shadow-xs"
                                  title="Salin Template Pesan WhatsApp Siap Kirim"
                                >
                                  <MessageSquare className="w-2.5 h-2.5" />
                                  <span>Draft WA</span>
                                </button>
                              </div>
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-500 uppercase font-bold block">Kendaraan</span>
                              <span className="font-bold text-slate-200 block truncate">{wo.vehicleBrand}</span>
                              <span className="text-[10px] text-blue-300 font-mono font-bold block">{wo.plateNumber}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-800/80 pt-2.5">
                            <div>
                              <span className="text-[9px] text-slate-500 uppercase font-bold block">Mekanik</span>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${wo.mechanicId ? 'bg-blue-400' : 'bg-slate-500'}`}></span>
                                <span className="font-medium text-slate-300 truncate max-w-[100px]">{assignedMech}</span>
                              </div>
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-500 uppercase font-bold block mb-0.5">Status Kerja</span>
                              <select
                                value={wo.status}
                                onChange={(e) => {
                                  const nextStatus = e.target.value as any;
                                  if (nextStatus === 'CANCELLED') {
                                    handleOpenCancelModal(wo);
                                  } else {
                                    updateWorkOrder(wo.id, { status: nextStatus });
                                  }
                                }}
                                className={`w-full px-1.5 py-0.5 text-[10px] font-black rounded-lg border uppercase tracking-wider outline-none cursor-pointer transition-all shadow-xs ${
                                  wo.status === 'QUEUE' ? 'bg-slate-800 text-slate-300 border-slate-700' :
                                  wo.status === 'IN_PROGRESS' ? 'bg-blue-950 text-blue-300 border-blue-800/80' :
                                  wo.status === 'PENDING_APPROVAL' ? 'bg-red-950 text-red-300 border-red-800/80' :
                                  wo.status === 'PENDING_PARTS' ? 'bg-amber-950 text-amber-300 border-amber-850' :
                                  wo.status === 'CANCELLED' ? 'bg-rose-950 text-rose-300 border-rose-850' :
                                  'bg-emerald-950 text-emerald-300 border-emerald-800/80'
                                }`}
                              >
                                <option value="QUEUE" className="bg-slate-900 text-slate-200">Antrean</option>
                                <option value="IN_PROGRESS" className="bg-slate-900 text-slate-200">Sedang Kerja</option>
                                <option value="PENDING_APPROVAL" className="bg-slate-900 text-slate-200">Approval</option>
                                <option value="PENDING_PARTS" className="bg-slate-900 text-slate-200">Tertunda Parts</option>
                                <option value="COMPLETED" className="bg-slate-900 text-slate-200">Selesai / Siap QC</option>
                                <option value="CANCELLED" className="bg-slate-900 text-slate-200">Dibatalkan (Cancel)</option>
                              </select>
                            </div>
                          </div>

                          {wo.isArchived ? (
                            <div className="flex gap-2 pt-2 border-t border-slate-800/80">
                              <button
                                type="button"
                                onClick={() => handleRestoreWithToast(wo)}
                                className="flex-1 py-2 bg-emerald-950 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-700 text-[10px] font-black rounded-lg uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                              >
                                <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Pulihkan SPK</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setPrintType('SPK');
                                  setPrintWO(wo);
                                }}
                                className="py-2 px-3 bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <Printer className="w-3.5 h-3.5" />
                                <span>SPK</span>
                              </button>

                              {(currentUser?.role === 'SA' || currentUser?.role === 'ADMIN') && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingWO(wo);
                                    setIsEditModalOpen(true);
                                  }}
                                  className="py-2 px-3 bg-slate-800 border border-slate-700 text-amber-300 hover:bg-slate-700 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer"
                                  title="Edit SPK"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                  <span>Edit</span>
                                </button>
                              )}
                            </div>
                          ) : wo.status === 'CANCELLED' ? (
                            <div className="flex gap-2 pt-2 border-t border-slate-800/80">
                              <button
                                type="button"
                                onClick={() => handleArchiveWithToast(wo)}
                                className="flex-1 py-2 bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 text-[10px] font-black rounded-lg uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <Archive className="w-3.5 h-3.5 text-slate-400" />
                                <span>Arsipkan</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setPrintType('SPK');
                                  setPrintWO(wo);
                                }}
                                className="py-2 px-3 bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <Printer className="w-3.5 h-3.5" />
                                <span>SPK</span>
                              </button>

                              {(currentUser?.role === 'SA' || currentUser?.role === 'ADMIN') && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingWO(wo);
                                    setIsEditModalOpen(true);
                                  }}
                                  className="py-2 px-3 bg-slate-800 border border-slate-700 text-amber-300 hover:bg-slate-700 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer"
                                  title="Edit SPK"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                  <span>Edit</span>
                                </button>
                              )}
                            </div>
                          ) : wo.status === 'COMPLETED' && !wo.isHandoverConfirmed ? (
                            <button
                              type="button"
                              onClick={() => handleConfirmHandover(wo)}
                              className="w-full py-2.5 mb-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[10.5px] font-black rounded-lg uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer animate-pulse"
                            >
                              <Check className="w-4 h-4" />
                              <span>Konfirmasi Serah Terima Unit</span>
                            </button>
                          ) : wo.status === 'COMPLETED' && wo.isHandoverConfirmed ? (
                            <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                              <div className="grid grid-cols-2 gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPrintType('HANDOVER');
                                    setPrintWO(wo);
                                  }}
                                  className="py-2 bg-blue-950 border border-blue-800 text-blue-300 hover:bg-blue-900 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  <span>Simpan PDF</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPrintType('HANDOVER');
                                    setPrintWO(wo);
                                    setTimeout(() => window.print(), 300);
                                  }}
                                  className="py-2 bg-purple-950 border border-purple-800 text-purple-300 hover:bg-purple-900 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                  <Printer className="w-3.5 h-3.5 text-purple-400" />
                                  <span>Cetak Serah</span>
                                </button>
                              </div>

                              <div className="flex gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleArchiveWithToast(wo)}
                                  className="flex-1 py-2 bg-emerald-950 border border-emerald-800 text-emerald-300 hover:bg-emerald-900 text-[10px] font-black rounded-lg uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                  <Archive className="w-3.5 h-3.5" />
                                  <span>Selesai & Archive</span>
                                </button>

                                {(currentUser?.role === 'SA' || currentUser?.role === 'ADMIN') && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingWO(wo);
                                      setIsEditModalOpen(true);
                                    }}
                                    className="px-3 py-2 bg-slate-800 border border-slate-700 text-amber-300 hover:bg-slate-700 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                    <span>Edit</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="flex gap-2 pt-2 border-t border-slate-800/80">
                              <button
                                type="button"
                                onClick={() => {
                                  setPrintType('SPK');
                                  setPrintWO(wo);
                                }}
                                className="flex-1 py-2 bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <Printer className="w-3.5 h-3.5" />
                                <span>SPK</span>
                              </button>

                              {(currentUser?.role === 'SA' || currentUser?.role === 'ADMIN') && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingWO(wo);
                                    setIsEditModalOpen(true);
                                  }}
                                  className="flex-1 py-2 bg-slate-800 border border-slate-700 text-amber-300 hover:bg-slate-700 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer"
                                  title="Edit SPK"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                  <span>Edit</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => handleOpenCancelModal(wo)}
                                className="px-3 py-2 bg-rose-950/80 border border-rose-800 text-rose-300 hover:bg-rose-900 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer"
                                title="Batalkan SPK"
                              >
                                <Ban className="w-3.5 h-3.5 text-rose-400" />
                                <span>Cancel</span>
                              </button>
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Pagination Controls */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-slate-850 bg-slate-900/40 p-4 rounded-xl">
                    {/* Items status */}
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <span className="text-xs text-slate-400 font-medium text-center sm:text-left">
                        Menampilkan <strong className="text-slate-200">{totalItems === 0 ? 0 : startIndex + 1}</strong> - <strong className="text-slate-200">{Math.min(startIndex + woListLimit, totalItems)}</strong> dari <strong className="text-slate-200">{totalItems}</strong> SPK Aktif
                      </span>
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="text-slate-500 text-[11px] uppercase tracking-wider font-bold">Baris per Halaman:</span>
                        <select
                          value={woListLimit}
                          onChange={(e) => {
                            setWoListLimit(Number(e.target.value));
                            setWoListPage(1);
                          }}
                          className="bg-slate-950 border border-slate-800 text-slate-200 py-1 px-2.5 rounded-lg text-xs font-bold outline-none cursor-pointer focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
                        >
                          <option value="5">5</option>
                          <option value="10">10</option>
                          <option value="15">15</option>
                          <option value="25">25</option>
                          <option value="50">50</option>
                        </select>
                      </div>
                    </div>

                    {/* Page buttons */}
                    {totalPages > 1 && (
                      <div className="flex items-center gap-1.5 select-none">
                        <button
                          type="button"
                          disabled={woListPage === 1}
                          onClick={() => setWoListPage(1)}
                          className={`w-8 h-8 rounded-lg border text-xs font-bold transition-all flex items-center justify-center ${
                            woListPage === 1
                              ? 'bg-slate-900/20 text-slate-600 border-slate-900/40 cursor-not-allowed'
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer'
                          }`}
                          title="Halaman Pertama"
                        >
                          «
                        </button>
                        <button
                          type="button"
                          disabled={woListPage === 1}
                          onClick={() => setWoListPage(prev => Math.max(prev - 1, 1))}
                          className={`w-8 h-8 rounded-lg border text-xs font-bold transition-all flex items-center justify-center ${
                            woListPage === 1
                              ? 'bg-slate-900/20 text-slate-600 border-slate-900/40 cursor-not-allowed'
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer'
                          }`}
                          title="Halaman Sebelumnya"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>

                        {/* Page number buttons */}
                        {(() => {
                          const pages = [];
                          const startPage = Math.max(1, woListPage - 2);
                          const endPage = Math.min(totalPages, startPage + 4);
                          const adjustedStart = Math.max(1, endPage - 4);
                          
                          for (let i = adjustedStart; i <= endPage; i++) {
                            pages.push(
                              <button
                                key={i}
                                type="button"
                                onClick={() => setWoListPage(i)}
                                className={`w-8 h-8 rounded-lg border text-xs font-bold transition-all ${
                                  woListPage === i
                                    ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-900/30 font-black scale-105'
                                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer'
                                }`}
                              >
                                {i}
                              </button>
                            );
                          }
                          return pages;
                        })()}

                        <button
                          type="button"
                          disabled={woListPage === totalPages}
                          onClick={() => setWoListPage(prev => Math.min(prev + 1, totalPages))}
                          className={`w-8 h-8 rounded-lg border text-xs font-bold transition-all flex items-center justify-center ${
                            woListPage === totalPages
                              ? 'bg-slate-900/20 text-slate-600 border-slate-900/40 cursor-not-allowed'
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer'
                          }`}
                          title="Halaman Berikutnya"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={woListPage === totalPages}
                          onClick={() => setWoListPage(totalPages)}
                          className={`w-8 h-8 rounded-lg border text-xs font-bold transition-all flex items-center justify-center ${
                            woListPage === totalPages
                              ? 'bg-slate-900/20 text-slate-600 border-slate-900/40 cursor-not-allowed'
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer'
                          }`}
                          title="Halaman Terakhir"
                        >
                          »
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </>
        </div>
          
          {/* Quick Action Banner to open Form */}
          <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 text-[#1e3a8a] rounded-xl border border-blue-100">
                <Plus className="w-6 h-6 animate-pulse text-blue-600" />
              </div>
              <div className="text-center sm:text-left">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Registrasi Unit / Komponen Baru</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Ingin mendaftarkan SPK baru? Buka Wizard Pengisian SPK Masuk dengan cepat.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setActiveTab('FORM');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-5 py-2.5 bg-[#0F2D59] hover:bg-blue-850 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Buka Form Registrasi
            </button>
          </div>
        </>
      ) : (
        <div className="space-y-4">
          {/* HIGH-DENSITY MINI STATUS TICKER FOR WORKSHOP LOADS */}
          <div className="bg-slate-900 text-white rounded-xl p-4 border border-slate-800 shadow-md flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in duration-300">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-400 block">Status Lab Terkini (Real-Time)</span>
                <span className="text-[9px] text-slate-400 font-medium">Beban kerja aktif saat ini di laboratorium diesel</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-bold font-mono">
              <span className="text-slate-400">Antrean: <strong className="text-white text-sm font-black">{workOrders.filter(w => w.status === 'QUEUE').length}</strong></span>
              <span className="text-slate-400">Dalam Proses: <strong className="text-blue-400 text-sm font-black">{workOrders.filter(w => w.status === 'IN_PROGRESS').length}</strong></span>
              <span className="text-slate-400">Butuh Parts: <strong className="text-amber-400 text-sm font-black">{workOrders.filter(w => w.status === 'PENDING_PARTS').length}</strong></span>
              <span className="text-slate-400">Butuh Approval: <strong className="text-rose-400 text-sm font-black">{workOrders.filter(w => w.status === 'PENDING_APPROVAL').length}</strong></span>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('MONITOR')}
              className="text-[10px] font-black text-blue-400 hover:text-blue-300 underline uppercase tracking-wider transition-colors cursor-pointer"
            >
              Buka Monitor Status &rarr;
            </button>
          </div>

          {/* WIZARD PROGRESS BAR */}
      <div id="intake-form-header" className="bg-white p-5 rounded-xl shadow-md border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-black text-[#1e3a8a] uppercase tracking-wide flex items-center gap-2">
              <span>📋</span> Wizard Pengisian SPK Masuk
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Ikuti alur pengerjaan langkah-demi-langkah untuk pengisian SPK yang lebih rapi, teratur, dan bebas kesalahan.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
              Langkah {wizardStep} dari 3
            </span>
          </div>
        </div>

        {/* Dynamic Horizontal Stepper */}
        <div className="relative flex items-start justify-between mt-6 px-4 md:px-12">
          {/* Stepper progress line wrapper */}
          <div className="absolute top-5 left-[calc(1rem+20px)] md:left-[calc(3rem+20px)] right-[calc(1rem+20px)] md:right-[calc(3rem+20px)] -translate-y-1/2 z-0 h-1">
            {/* Progress bar background line */}
            <div className="absolute inset-0 bg-slate-100 rounded-full" />
            {/* Active progress fill line */}
            <div 
              className="absolute left-0 top-0 bottom-0 bg-blue-600 rounded-full transition-all duration-500 ease-out"
              style={{ 
                width: wizardStep === 1 ? '0%' : wizardStep === 2 ? '50%' : '100%'
              }}
            />
          </div>

          {/* Stepper Node 1: Identity */}
          <button
            type="button"
            onClick={() => handleStepClick(1)}
            className="relative z-10 flex flex-col items-center group focus:outline-none"
          >
            <div 
              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 font-bold transition-all duration-300 ${
                wizardStep === 1 
                  ? 'bg-blue-600 border-blue-600 text-white ring-4 ring-blue-100 shadow-md scale-110' 
                  : wizardStep > 1 
                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm' 
                    : 'bg-white border-slate-200 text-slate-400 group-hover:border-slate-300'
              }`}
            >
              {wizardStep > 1 ? <Check className="w-5 h-5 stroke-[3px]" /> : <User className="w-5 h-5" />}
            </div>
            <span className={`text-[10px] md:text-[11px] mt-2 font-black uppercase tracking-wider transition-colors ${
              wizardStep === 1 ? 'text-blue-600' : wizardStep > 1 ? 'text-emerald-600' : 'text-slate-400'
            }`}>
              1. Identity
            </span>
            <span className="text-[9px] text-slate-400 font-medium hidden md:block">Data Pelanggan</span>
          </button>

          {/* Stepper Node 2: Vehicle */}
          <button
            type="button"
            onClick={() => handleStepClick(2)}
            className="relative z-10 flex flex-col items-center group focus:outline-none"
          >
            <div 
              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 font-bold transition-all duration-300 ${
                wizardStep === 2 
                  ? 'bg-blue-600 border-blue-600 text-white ring-4 ring-blue-100 shadow-md scale-110' 
                  : wizardStep > 2 
                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm' 
                    : 'bg-white border-slate-200 text-slate-400 group-hover:border-slate-300'
              }`}
            >
              {wizardStep > 2 ? <Check className="w-5 h-5 stroke-[3px]" /> : <Car className="w-5 h-5" />}
            </div>
            <span className={`text-[10px] md:text-[11px] mt-2 font-black uppercase tracking-wider transition-colors ${
              wizardStep === 2 ? 'text-blue-600' : wizardStep > 2 ? 'text-emerald-600' : 'text-slate-400'
            }`}>
              2. Vehicle
            </span>
            <span className="text-[9px] text-slate-400 font-medium hidden md:block">Unit & Inventaris</span>
          </button>

          {/* Stepper Node 3: Diagnostic */}
          <button
            type="button"
            onClick={() => handleStepClick(3)}
            className="relative z-10 flex flex-col items-center group focus:outline-none"
          >
            <div 
              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 font-bold transition-all duration-300 ${
                wizardStep === 3 
                  ? 'bg-blue-600 border-blue-600 text-white ring-4 ring-blue-100 shadow-md scale-110' 
                  : 'bg-white border-slate-200 text-slate-400 group-hover:border-slate-300'
              }`}
            >
              <Wrench className="w-5 h-5" />
            </div>
            <span className={`text-[10px] md:text-[11px] mt-2 font-black uppercase tracking-wider transition-colors ${
              wizardStep === 3 ? 'text-blue-600' : 'text-slate-400'
            }`}>
              3. Diagnostic
            </span>
            <span className="text-[9px] text-slate-400 font-medium hidden md:block">Keluhan & Estimasi</span>
          </button>
        </div>

        {/* Wizard validation error banner */}
        {wizardError && (
          <div className="mt-5 bg-rose-50 border-l-4 border-rose-500 text-rose-800 p-4 rounded-r-xl text-xs font-bold flex items-center justify-between shadow-2xs">
            <span className="flex items-center gap-2">
              ⚠️ <span className="font-extrabold uppercase">Masalah Validasi:</span> {wizardError}
            </span>
            <button 
              type="button" 
              onClick={() => setWizardError(null)}
              className="text-rose-500 hover:text-rose-700 text-sm font-black"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* STEP 1: IDENTITY */}
        {wizardStep === 1 && (
          <div className="bg-white p-5 rounded-xl shadow-md border border-slate-200 animate-in fade-in duration-300">
            <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
              <h3 className="text-sm font-black text-[#1e3a8a] uppercase tracking-wider flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-600" />
                1. Informasi Identitas Pelanggan (Identity Details)
              </h3>
              <span className="text-[10px] bg-blue-50 text-blue-800 font-bold px-2 py-1 rounded">Langkah 1 dari 3</span>
            </div>
            
            <div className="space-y-6">
              
              {/* Division Flow Drag & Drop */}
              <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100 mb-2">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-bold text-[11px] uppercase text-blue-900">Alur Divisi Pengerjaan (Work Flow) <span className="text-red-500">*</span></h4>
                    <p className="text-[9px] text-slate-500 italic mt-0.5">Atur urutan divisi dengan drag & drop (tahan dan geser ikon ⠿).</p>
                  </div>
                  {divisionFlow.length < 3 && (
                    <button
                      type="button"
                      onClick={() => {
                        const available = (['SUPPLY_PUMP', 'COMMON_RAIL', 'TURBO'] as const).find(d => !divisionFlow.includes(d));
                        if (available) setDivisionFlow([...divisionFlow, available]);
                      }}
                      className="text-[9px] flex items-center gap-1 bg-white border border-blue-200 text-blue-600 px-2 py-1 rounded hover:bg-blue-50 font-bold"
                    >
                      <Plus className="w-3 h-3" /> Tambah Divisi
                    </button>
                  )}
                </div>

                {divisionFlow.length === 0 && (
                   <div className="text-[10px] text-red-500 font-bold mb-2 p-2 bg-red-50 rounded">⚠️ Anda harus memilih minimal 1 divisi.</div>
                )}

                <Reorder.Group axis="y" values={divisionFlow} onReorder={setDivisionFlow} className="space-y-2">
                  {divisionFlow.map((div, index) => (
                    <Reorder.Item key={div} value={div} className="flex items-center gap-3 p-2.5 bg-white border border-slate-200 rounded-lg shadow-sm select-none">
                      <div className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 p-1">
                        <GripVertical className="w-4 h-4" />
                      </div>
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-black text-xs">
                        {index + 1}
                      </div>
                      <div className="flex-1 font-bold text-xs text-slate-700">
                        {div === 'SUPPLY_PUMP' ? '⚙️ Fuel Pump' : div === 'COMMON_RAIL' ? '🔬 Common Rail' : '🌀 Turbo'}
                      </div>
                      {divisionFlow.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setDivisionFlow(divisionFlow.filter(d => d !== div))}
                          className="text-slate-400 hover:text-red-500 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Data Pemilik */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4">
                  <h4 className="font-bold text-[11px] uppercase text-blue-900 border-b border-slate-200 pb-2">A. Data Pemilik (Owner Details)</h4>
                  
                  <div className="flex flex-col relative">
                    <label className="text-[10px] font-black uppercase text-slate-700">Nama Lengkap Pemilik <span className="text-red-500">*</span></label>
                    <span className="text-[9px] text-slate-400 italic mb-1">Sesuai KTP / STNK</span>
                    <input required={wizardStep === 1} type="text" placeholder="Masukkan nama pemilik" className="text-xs p-2.5 border border-slate-200 rounded-lg mt-1 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none font-semibold text-slate-800 shadow-sm" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                    {customerName.trim().length >= 2 && customers.filter(c => c.name.toLowerCase().includes(customerName.toLowerCase())).length > 0 && (
                      <div className="bg-white border border-slate-200 mt-1 rounded-lg shadow-lg max-h-40 overflow-y-auto z-50 absolute w-full top-full left-0">
                        {customers.filter(c => c.name.toLowerCase().includes(customerName.toLowerCase())).slice(0, 5).map(c => (
                          <div 
                            key={c.id} 
                            onClick={() => {
                              setCustomerName(c.name);
                              setCustomerPhone(c.phone);
                              setCustomerAddress(c.address);
                              if (c.email) setCustomerEmail(c.email);
                            }}
                            className="p-2 hover:bg-blue-50 text-xs font-semibold text-slate-800 cursor-pointer border-b border-slate-100 last:border-none flex justify-between"
                          >
                            <span>👤 {c.name}</span>
                            <span className="text-[10px] text-slate-500 font-mono">{c.phone}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col relative">
                    <label className="text-[10px] font-black uppercase text-slate-700">Nomor Telepon / WhatsApp <span className="text-red-500">*</span></label>
                    <span className="text-[9px] text-slate-400 italic mb-1">Untuk mengirimkan update foto perbaikan</span>
                    <input required={wizardStep === 1} type="tel" placeholder="Contoh: 081234567890" className="text-xs p-2.5 border border-slate-200 rounded-lg mt-1 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none font-semibold text-slate-800 shadow-sm" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
                    {customerPhone.trim().length >= 3 && customers.filter(c => c.phone.includes(customerPhone.trim())).length > 0 && (
                      <div className="bg-white border border-slate-200 mt-1 rounded-lg shadow-lg max-h-40 overflow-y-auto z-50 absolute w-full top-full left-0">
                        {customers.filter(c => c.phone.includes(customerPhone.trim())).slice(0, 5).map(c => (
                          <div 
                            key={c.id} 
                            onClick={() => {
                              setCustomerName(c.name);
                              setCustomerPhone(c.phone);
                              setCustomerAddress(c.address);
                              if (c.email) setCustomerEmail(c.email);
                            }}
                            className="p-2 hover:bg-blue-50 text-xs font-semibold text-slate-800 cursor-pointer border-b border-slate-100 last:border-none flex justify-between"
                          >
                            <span>👤 {c.name}</span>
                            <span className="text-[10px] text-slate-500 font-mono">{c.phone}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <label className="text-[10px] font-black uppercase text-slate-700">Alamat Lengkap <span className="text-red-500">*</span></label>
                    <span className="text-[9px] text-slate-400 italic mb-1">Alamat rumah atau kantor pemilik</span>
                    <input required={wizardStep === 1} type="text" placeholder="e.g. Jl. HR Soebrantas No. 12" className="text-xs p-2.5 border border-slate-200 rounded-lg mt-1 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none font-semibold text-slate-800 shadow-sm" value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} />
                  </div>
                  
                  <div className="flex flex-col">
                    <label className="text-[10px] font-black uppercase text-slate-700">Alamat Email Aktif</label>
                    <span className="text-[9px] text-slate-400 italic mb-1">Opsional (Bisa dikosongkan)</span>
                    <input type="email" placeholder="contoh: pelanggan@gmail.com" className="text-xs p-2.5 border border-slate-200 rounded-lg mt-1 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none font-medium text-slate-800 shadow-sm" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} />
                  </div>
                </div>

                {/* Data Pembawa */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4">
                  <h4 className="font-bold text-[11px] uppercase text-blue-900 border-b border-slate-200 pb-2 flex items-center justify-between">
                    B. Data Pembawa (Bringer Details)
                    <button 
                      type="button"
                      className="text-[9px] font-medium bg-blue-100 text-blue-800 px-2 py-0.5 rounded cursor-pointer hover:bg-blue-200"
                      onClick={() => {
                        setBringerName(customerName);
                        setBringerPhone(customerPhone);
                        setBringerAddress(customerAddress);
                      }}
                    >
                      Sama dengan Pemilik
                    </button>
                  </h4>

                  <div className="flex flex-col">
                    <label className="text-[10px] font-black uppercase text-slate-700">Nama Lengkap Pembawa</label>
                    <span className="text-[9px] text-slate-400 italic mb-1">Nama orang yang mengantar</span>
                    <input type="text" placeholder="Masukkan nama pembawa" className="text-xs p-2.5 border border-slate-200 rounded-lg mt-1 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none font-medium text-slate-800 shadow-sm" value={bringerName} onChange={(e) => setBringerName(e.target.value)} />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-[10px] font-black uppercase text-slate-700">Nomor Telepon / WhatsApp</label>
                    <span className="text-[9px] text-slate-400 italic mb-1">Opsional (Bisa dikosongkan)</span>
                    <input type="tel" placeholder="Contoh: 081234567890" className="text-xs p-2.5 border border-slate-200 rounded-lg mt-1 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none font-medium text-slate-800 shadow-sm" value={bringerPhone} onChange={(e) => setBringerPhone(e.target.value)} />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-[10px] font-black uppercase text-slate-700">Alamat Lengkap</label>
                    <span className="text-[9px] text-slate-400 italic mb-1">Opsional (Bisa dikosongkan)</span>
                    <input type="text" placeholder="e.g. Jl. HR Soebrantas No. 12" className="text-xs p-2.5 border border-slate-200 rounded-lg mt-1 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none font-medium text-slate-800 shadow-sm" value={bringerAddress} onChange={(e) => setBringerAddress(e.target.value)} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {wizardStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Drop Method (Metode Penyerahan Unit) - Moved to Top */}
            <div className="bg-white p-5 rounded-xl shadow-md border border-slate-200">
              <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
                <h3 className="text-sm font-black text-[#1e3a8a] uppercase tracking-wider flex items-center">
                  <Car className="w-5 h-5 mr-2 text-blue-600" />
                  Metode Penyerahan Unit (Drop Method)
                </h3>
                <span className="text-[10px] bg-blue-50 text-blue-800 font-bold px-2 py-1 rounded">Langkah 2 dari 3</span>
              </div>
              <p className="text-[10px] text-slate-500 italic mb-3">
                Pilih apakah konsumen membawa mobil utuh atau hanya membawa komponen copotan (loose parts) untuk diperbaiki di lab.
              </p>
              <div className="flex gap-3">
                <label className={`flex-1 flex flex-col items-center justify-center p-3 text-xs border rounded-xl cursor-pointer transition-all ${dropMethod === 'WHOLE' ? 'bg-blue-50 border-blue-600 text-blue-900 font-bold shadow-sm' : 'bg-slate-50 hover:bg-slate-100 border-slate-200 font-medium text-slate-600'}`}>
                  <input type="radio" className="hidden" checked={dropMethod === 'WHOLE'} onChange={() => setDropMethod('WHOLE')} />
                  <span className="text-sm">🚗 Bawa Mobil Utuh</span>
                  <span className="text-[8px] font-normal opacity-80 mt-1">(Whole Vehicle Unit)</span>
                </label>
                <label className={`flex-1 flex flex-col items-center justify-center p-3 text-xs border rounded-xl cursor-pointer transition-all ${dropMethod === 'PARTS' ? 'bg-blue-50 border-blue-600 text-blue-900 font-bold shadow-sm' : 'bg-slate-50 hover:bg-slate-100 border-slate-200 font-medium text-slate-600'}`}>
                  <input type="radio" className="hidden" checked={dropMethod === 'PARTS'} onChange={() => setDropMethod('PARTS')} />
                  <span className="text-sm">⚙️ Hanya Bawa Komponen</span>
                  <span className="text-[8px] font-normal opacity-80 mt-1">(Loose Parts / Copotan)</span>
                </label>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-md border border-slate-200">
              <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
                <h3 className="text-sm font-black text-[#1e3a8a] uppercase tracking-wider flex items-center">
                  <Car className="w-5 h-5 mr-2 text-blue-600" />
                  Informasi & Parameter {dropMethod === 'WHOLE' ? 'Kendaraan (Vehicle Details)' : 'Komponen (Component Details)'}
                </h3>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dropMethod === 'WHOLE' && (
                    <>
                      <div className="flex flex-col bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                        <label className="text-[10px] font-black uppercase text-slate-700">Merek / Tipe / Tahun Mobil <span className="text-red-500">*</span></label>
                        <span className="text-[9px] text-slate-400 italic mb-1">Merek & model kendaraan (e.g. Toyota Fortuner 2020)</span>
                        <input required={wizardStep === 2 && dropMethod === 'WHOLE'} type="text" className="text-xs p-2.5 border border-slate-200 rounded-lg mt-1 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none font-semibold text-slate-800 shadow-sm" placeholder="e.g. Toyota Fortuner 2020" value={vehicleBrand} onChange={(e) => setVehicleBrand(e.target.value)} />
                      </div>

                      <div className="flex flex-col bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                        <label className="text-[10px] font-black uppercase text-slate-700">Nomor Rangka / VIN</label>
                        <span className="text-[9px] text-slate-400 italic mb-1">Opsional (Bisa dikosongkan jika tidak ada)</span>
                        <input type="text" placeholder="Masukkan nomor rangka kendaraan" className="text-xs p-2.5 border border-slate-200 rounded-lg mt-1 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none font-medium text-slate-800 shadow-sm" value={vin} onChange={(e) => setVin(e.target.value)} />
                      </div>

                      <div className="flex flex-col bg-slate-50/50 p-3 rounded-lg border border-slate-100 relative">
                        <label className="text-[10px] font-black uppercase text-slate-700">Nomor Plat Kendaraan <span className="text-red-500">*</span></label>
                        <span className="text-[9px] text-slate-400 italic mb-1">Plat nomor polisi (e.g. BM 1234 AB)</span>
                        <input required={wizardStep === 2 && dropMethod === 'WHOLE'} type="text" placeholder="Masukkan nomor plat" className="text-xs p-2.5 border border-slate-200 rounded-lg mt-1 font-bold text-blue-800 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none shadow-sm uppercase" value={plateNumber} onChange={(e) => setPlateNumber(e.target.value)} />
                        {plateNumber.trim().length >= 2 && vehicles.filter(v => v.plateNumber.toUpperCase().includes(plateNumber.toUpperCase())).length > 0 && (
                          <div className="bg-white border border-slate-200 mt-1 rounded-lg shadow-lg max-h-40 overflow-y-auto z-50 absolute w-full top-full left-0">
                            {vehicles.filter(v => v.plateNumber.toUpperCase().includes(plateNumber.toUpperCase())).slice(0, 5).map(v => {
                              const owner = customers.find(c => c.id === v.customerId);
                              return (
                                <div 
                                  key={v.id} 
                                  onClick={() => {
                                    setPlateNumber(v.plateNumber);
                                    setVehicleBrand(v.brand);
                                    if (v.vin) setVin(v.vin);
                                    if (owner) {
                                      setCustomerName(owner.name);
                                      setCustomerPhone(owner.phone);
                                      setCustomerAddress(owner.address);
                                      if (owner.email) setCustomerEmail(owner.email);
                                    }
                                  }}
                                  className="p-2 hover:bg-blue-50 text-xs font-semibold text-slate-800 cursor-pointer border-b border-slate-100 last:border-none flex flex-col"
                                >
                                  <div className="flex justify-between">
                                    <span className="font-bold text-blue-700">🚗 {v.plateNumber}</span>
                                    <span className="text-[10px] text-slate-500">{v.brand}</span>
                                  </div>
                                  {owner && (
                                    <span className="text-[10px] text-slate-400 mt-0.5">Pemilik: {owner.name} ({owner.phone})</span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                        <label className="text-[10px] font-black uppercase text-slate-700">Kilometer (KM) / Hour Meter (HM) <span className="text-red-500">*</span></label>
                        <span className="text-[9px] text-slate-400 italic mb-1">Angka odometer saat ini (e.g. 150.000 KM)</span>
                        <input required={wizardStep === 2 && dropMethod === 'WHOLE'} type="text" placeholder="e.g. 150.000 KM / 2.500 HM" className="text-xs p-2.5 border border-slate-200 rounded-lg mt-1 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none font-semibold text-slate-800 shadow-sm" value={odometer} onChange={(e) => setOdometer(e.target.value)} />
                      </div>
                    </>
                  )}

                  <div className="flex flex-col bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                    <label className="text-[10px] font-black uppercase text-slate-700">Waktu Masuk Unit/Komponen <span className="text-red-500">*</span></label>
                    <span className="text-[9px] text-slate-400 italic mb-1">Waktu serah terima komponen / kendaraan</span>
                    <input required={wizardStep === 2} type="datetime-local" className="text-xs p-2.5 border border-slate-200 rounded-lg mt-1 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-slate-800 font-semibold shadow-sm" value={intakeDate} onChange={(e) => setIntakeDate(e.target.value)} />
                  </div>

                  {dropMethod === 'WHOLE' && (
                    <div className="flex flex-col bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                      <label className="text-[10px] font-black uppercase text-slate-700">Volume Solar / BBM</label>
                      <span className="text-[9px] text-slate-400 italic mb-1.5">Pilih indikator jarum bahan bakar</span>
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        <div className="md:col-span-7">
                          <div className="flex gap-1.5">
                            {['E', '1/4', '1/2', '3/4', 'F'].map((level) => (
                              <span 
                                key={level} 
                                onClick={() => setFuelLevel(level as any)}
                                className={`flex-1 text-xs font-black border text-center py-2.5 cursor-pointer rounded-lg transition-all ${fuelLevel === level ? 'bg-[#0F2D59] text-white border-[#0F2D59] shadow-sm' : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700 shadow-sm'}`}
                              >
                                {level}
                              </span>
                            ))}
                          </div>
                          <p className="text-[8.5px] text-slate-500 mt-2 leading-relaxed">
                            Penunjuk status BBM terekam dan ditampilkan dalam visualisasi indikator dasbor pada Lembar Kerja (SPK) cetak serta halaman pelacakan pelanggan.
                          </p>
                        </div>
                        <div className="md:col-span-5 flex justify-center">
                          <FuelGauge level={fuelLevel} theme="light" size="sm" className="w-full max-w-[170px]" />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                    <label className="text-[10px] font-black uppercase text-slate-700">Estimasi Waktu Pengerjaan <span className="text-red-500">*</span></label>
                    <span className="text-[9px] text-slate-400 italic mb-1">Berapa lama estimasi selesai?</span>
                    <input required={wizardStep === 2} type="text" list="estimasi-suggestions" className="text-xs p-2.5 border border-slate-200 rounded-lg mt-1 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none font-semibold text-slate-800 shadow-sm" placeholder="e.g. 3 Hari / 24 Jam" value={estimasiPengerjaan} onChange={(e) => setEstimasiPengerjaan(e.target.value)} />
                    <datalist id="estimasi-suggestions">
                      <option value="12 Jam" />
                      <option value="24 Jam" />
                      <option value="48 Jam" />
                      <option value="1 Hari" />
                      <option value="2 Hari" />
                      <option value="3 Hari" />
                      <option value="5 Hari" />
                      <option value="1 Minggu" />
                    </datalist>
                  </div>

                  <div className="flex flex-col bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                    <label className="text-[10px] font-black uppercase text-slate-700">Masa Garansi <span className="text-red-500">*</span></label>
                    <span className="text-[9px] text-slate-400 italic mb-1">Masa garansi yang diberikan</span>
                    <input required={wizardStep === 2} type="text" list="garansi-suggestions" className="text-xs p-2.5 border border-slate-200 rounded-lg mt-1 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none font-semibold text-slate-800 shadow-sm" placeholder="e.g. 3 Bulan / 1000 Jam Kerja (HM)" value={garansi} onChange={(e) => setGaransi(e.target.value)} />
                    <datalist id="garansi-suggestions">
                      <option value="1 Bulan" />
                      <option value="3 Bulan" />
                      <option value="6 Bulan" />
                      <option value="1.000 Jam Kerja (HM)" />
                      <option value="2.000 Jam Kerja (HM)" />
                      <option value="Tanpa Garansi" />
                    </datalist>
                  </div>

                  <div className="flex flex-col md:col-span-2 bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                    <label className="text-[10px] font-black uppercase text-slate-700">Tingkat Prioritas (Priority Level) <span className="text-red-500">*</span></label>
                    <span className="text-[9px] text-slate-400 italic mb-1">Prioritas pengerjaan di bengkel</span>
                    <select className="text-xs p-2.5 border border-slate-200 rounded-lg mt-1 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none font-bold text-slate-800 shadow-sm" value={priority} onChange={(e) => setPriority(Number(e.target.value) as Priority)}>
                      <option value={3}>🔵 Priority 3: Servis Biasa / Bongkar Berat (Regular / Heavy Repair)</option>
                      <option value={2}>🟡 Priority 2: Booking Antrean / Janji Temu (Appointment / Booking)</option>
                      <option value={1}>🔴 Priority 1: Gawat / Kendaraan Mogok Total (Emergency / Breakdown)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Inventory Checklist Matrix */}
            {dropMethod === 'WHOLE' && (
              <div className="bg-white p-5 rounded-xl shadow-md border border-slate-200">
                <div className="border-b border-slate-100 pb-3 mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <h3 className="text-sm font-black text-[#1e3a8a] uppercase tracking-wider flex items-center">
                    📋 Inventaris Barang Bawaan Mobil (Inventory Checklist)
                  </h3>
                </div>
                
                <p className="text-[10px] text-slate-500 italic mb-4">
                  👉 <strong>Cara Mengisi:</strong> Beri tanda centang (✓) pada barang bawaan yang ada di dalam mobil agar aman tidak hilang. Gunakan tombol cepat di bawah untuk mencentang semua jika lengkap.
                </p>

                {/* Quick action buttons & Search */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={selectAllInventory}
                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[10px] rounded-lg border border-blue-200 transition-colors uppercase"
                    >
                      ✓ Centang Semua
                    </button>
                    <button
                      type="button"
                      onClick={deselectAllInventory}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] rounded-lg border border-slate-300 transition-colors uppercase"
                    >
                      ✕ Kosongkan Semua
                    </button>
                  </div>

                  <div className="relative flex-1 max-w-xs">
                    <input
                      type="text"
                      placeholder="Cari nama barang bawaan..."
                      value={inventorySearch}
                      onChange={(e) => setInventorySearch(e.target.value)}
                      className="w-full text-xs p-2 pl-3 border border-slate-200 rounded-lg bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none font-medium shadow-2xs"
                    />
                    {inventorySearch && (
                      <button
                        type="button"
                        onClick={() => setInventorySearch('')}
                        className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs font-black"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 p-3 bg-slate-50/50 rounded-xl border border-slate-100">
                  {(() => {
                    const filtered = inventory
                      .map((item, index) => ({ item, index }))
                      .filter(({ item }) => item.name.toLowerCase().includes(inventorySearch.toLowerCase()));

                    if (filtered.length === 0) {
                      return (
                        <div className="col-span-full text-center py-4 text-slate-400 text-xs font-medium">
                          Barang "{inventorySearch}" tidak ditemukan.
                        </div>
                      );
                    }

                    return filtered.map(({ item, index }) => (
                      <label key={item.name} className="flex items-center gap-2.5 cursor-pointer bg-white p-2.5 rounded-lg border border-slate-150 hover:bg-blue-50/40 transition-colors shadow-xs">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500" 
                          checked={item.checked} 
                          onChange={() => toggleInventory(index)} 
                        />
                        <span className={`text-[10px] select-none ${item.checked ? 'text-blue-900 font-black' : 'text-slate-700 font-semibold'}`}>
                          {item.name}
                        </span>
                      </label>
                    ));
                  })()}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: DIAGNOSTIC DETAILS & COMPONENT ESTIMATIONS */}
        {wizardStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Customer Voice (Daftar Keluhan Pelanggan) */}
            <div className="bg-white p-5 rounded-xl shadow-md border border-slate-200">
              <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
                <h3 className="text-sm font-black text-[#1e3a8a] uppercase tracking-wider flex items-center">
                  <ShieldAlert className="w-5 h-5 mr-2 text-blue-600" />
                  3. Keluhan Konsumen (Customer Voice / Symptoms)
                </h3>
                <span className="text-[10px] bg-blue-50 text-blue-800 font-bold px-2 py-1 rounded">Langkah 3 dari 3</span>
              </div>

              <div className="flex flex-col space-y-2">
                <div className="flex justify-between items-center bg-slate-50 p-2 rounded border border-slate-150">
                  <label className="text-[10px] font-black uppercase text-slate-700 tracking-wider">
                    Customer Voice (Daftar Keluhan Pelanggan)
                  </label>
                  <button
                    type="button"
                    onClick={() => setComplaintPoints([...complaintPoints, ''])}
                    className="px-3.5 py-1.5 bg-[#1e3a8a] text-white text-[10px] font-black uppercase rounded-lg hover:bg-blue-800 transition-colors flex items-center gap-1 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah Keluhan
                  </button>
                </div>

                <div className="border border-slate-200 rounded overflow-x-auto">
                  <table className="w-full text-left border-collapse bg-slate-50 text-xs">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 text-slate-600">
                        <th className="p-2 text-[9px] font-bold uppercase w-[8%] text-center">NO</th>
                        <th className="p-2 text-[9px] font-bold uppercase w-[77%]">DESKRIPSI GEJALA / KELUHAN</th>
                        <th className="p-2 text-[9px] font-bold uppercase w-[15%] text-center">AKSI</th>
                      </tr>
                    </thead>
                    <tbody>
                      {complaintPoints.map((point, idx) => (
                        <tr key={idx} className="border-b border-slate-200 bg-white hover:bg-slate-50/50">
                          <td className="p-2 font-mono font-bold text-slate-400 text-center">
                            #{idx + 1}
                          </td>
                          <td className="p-1.5">
                            <input
                              type="text"
                              required={wizardStep === 3}
                              placeholder={`Masukkan poin keluhan pelanggan #${idx + 1} (e.g. Suara kasar saat mesin dingin)`}
                              value={point}
                              onChange={(e) => {
                                const newList = [...complaintPoints];
                                newList[idx] = e.target.value;
                                setComplaintPoints(newList);
                              }}
                              className="w-full text-xs p-2 border border-slate-200 rounded focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] outline-none font-semibold text-slate-800 bg-slate-50/30 focus:bg-white transition-all"
                            />
                          </td>
                          <td className="p-1.5 text-center">
                            <button
                              type="button"
                              disabled={complaintPoints.length === 1}
                              onClick={() => {
                                if (complaintPoints.length > 1) {
                                  setComplaintPoints(complaintPoints.filter((_, i) => i !== idx));
                                }
                              }}
                              className={`px-2.5 py-1.5 rounded text-[10px] font-bold uppercase transition-colors ${
                                complaintPoints.length === 1
                                  ? 'text-slate-300 cursor-not-allowed'
                                  : 'text-rose-600 hover:bg-rose-50'
                              }`}
                            >
                              Hapus
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Interactive Damage & Visual Map Preview */}
            {dropMethod === 'WHOLE' && (
              <div className="bg-white p-5 rounded-xl shadow-md border border-slate-200 flex-1">
                <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-black text-[#1e3a8a] uppercase tracking-wider flex items-center">
                    <ShieldAlert className="w-5 h-5 mr-2 text-blue-600" />
                    Peta Kerusakan Fisik Mobil (Visual Body Damage Map 2.0)
                  </h3>
                  <span className="text-[9px] bg-blue-50 text-blue-800 font-bold px-2 py-0.5 rounded">Interactive Blueprint</span>
                </div>
                
                <p className="text-[10px] text-slate-500 italic mb-4">
                  👉 <strong>Cara Mengisi:</strong> Klik pin nomor pada diagram mobil atau tombol di bawah jika terdapat baret, penyok, atau retak saat mobil diterima. Pin akan berubah warna menjadi merah, lalu tuliskan catatan detailnya.
                </p>

                {/* Car Inspection Interactive Silhouette Map */}
                <div className="mb-4">
                  <CarInspectionMap
                    damages={damages}
                    interactive={true}
                    onTogglePoint={(pointId) => toggleDamage(pointId)}
                    className="shadow-sm"
                  />
                </div>

                <div className="mb-4 space-y-4">
                  {/* Vehicle Body Outlines Quick Buttons */}
                  <div>
                    <p className="text-[10px] font-black text-slate-700 uppercase tracking-wider mb-2">Tombol Cepat Titik Eksterior & Interior</p>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                      {CAR_PARTS.map(part => {
                        const isDefective = damages.some((d) => d.partId === part.id);
                        return (
                          <button
                            key={part.id} 
                            type="button" 
                            onClick={() => toggleDamage(part.id)}
                            className={`h-14 rounded-xl border-2 flex flex-col items-center justify-center text-[10px] p-2 text-center uppercase cursor-pointer transition-all ${
                              isDefective 
                                ? 'bg-rose-50 border-rose-500 text-rose-700 font-bold shadow-sm' 
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-blue-50 hover:border-blue-300'
                            }`}
                          >
                            <span className="font-bold block truncate w-full">{part.label}</span>
                            <span className={`text-[8px] font-black mt-1 px-1.5 py-0.2 rounded-full ${
                              isDefective ? 'bg-rose-600 text-white' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {isDefective ? '⚠️ DEFECT' : '✓ OK'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {damages.length > 0 && (
                    <div className="bg-rose-50/30 p-3 rounded-xl border border-rose-200 mt-2 space-y-2">
                      <p className="text-[10px] font-black uppercase text-rose-900 tracking-wider">Tulis Catatan Baret & Kerusakan Di Sini:</p>
                      <div className="flex flex-col gap-2">
                        {damages.map(d => {
                          const part = CAR_PARTS.find(p => p.id === d.partId)!;
                          return (
                            <div key={d.partId} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-rose-100 shadow-xs">
                              <span className="text-[9px] font-bold bg-rose-100 text-rose-800 px-2 py-1 rounded uppercase tracking-wider">{part?.label || d.partId}</span>
                              <input
                                type="text"
                                required={wizardStep === 3}
                                className="flex-1 text-[10px] rounded-md border border-slate-200 px-2.5 py-1.5 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none bg-slate-50/50 text-slate-800 font-medium"
                                placeholder={`Tulis baret sebelah mana pada ${part?.label || d.partId} (e.g. Baret halus di bawah lampu kiri)`}
                                value={d.description}
                                onChange={(e) => updateDamageDescription(d.partId, e.target.value)}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Mock Image Uploader */}
                <div className="mt-4 border-t border-slate-100 pt-3">
                  <label className="text-[10px] font-black uppercase text-slate-700 mb-1.5 block">Foto Bukti Fisik Masuk (Bukti Keadaan Mobil)</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[1, 2].map((slot) => (
                      <div key={slot} className="h-16 border border-dashed border-slate-300 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:border-blue-400 cursor-pointer transition-colors bg-slate-50/50">
                        <Camera className="w-5 h-5 mr-2 text-slate-400" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Ambil Foto Slot {slot}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Work Order Scope & Serialization */}
            <div className="bg-white p-5 rounded-xl shadow-md border border-slate-200 space-y-6">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <h3 className="text-sm font-black text-[#1e3a8a] uppercase tracking-wider flex items-center">
                  <ClipboardList className="w-5 h-5 mr-2 text-blue-600" />
                  Cakupan Pengerjaan Lab & Estimasi (Work Order Scope)
                </h3>
              </div>

              {/* Component Serialization */}
              {dropMethod === 'PARTS' && (
                <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                  <div>
                    <h4 className="text-[11px] font-black uppercase text-[#1e3a8a] tracking-wider">A. Pencatatan Nomor Seri Komponen (Component Serialization)</h4>
                    <p className="text-[9px] text-slate-500 italic">Masukkan nama komponen, Part Number (P/N), dan kondisi saat diserahkan.</p>
                  </div>
                  <button
                    type="button"
                    onClick={addLoosePart}
                    className="px-3 py-1.5 bg-blue-600 text-white text-[10px] font-black uppercase rounded-lg hover:bg-blue-700 transition-colors flex items-center shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Tambah Baris Komponen
                  </button>
                </div>
                
                {(() => {
                  const allHistoryCount = looseParts.reduce((acc, part) => {
                    return acc + (part.partNumber ? getHistoricalWorkOrders(part.partNumber).length : 0);
                  }, 0);
                  
                  if (allHistoryCount > 0) {
                    return (
                      <div className="mb-3 bg-rose-50 border border-rose-200 text-rose-950 p-3 rounded-xl flex items-start gap-3">
                        <span className="text-lg">⚠️</span>
                        <div className="text-[11px]">
                          <strong className="text-rose-800 block uppercase font-black mb-0.5">PERINGATAN DETEKSI GARANSI & RIWAYAT SERVIS:</strong>
                          Sistem mendeteksi <span className="font-bold underline">{allHistoryCount} komponen</span> yang Anda masukkan sudah pernah diservis di laboratorium kami sebelumnya. Silakan klik tombol <span className="bg-rose-100 text-rose-800 font-bold px-1 rounded">Riwayat Servis</span> berwarna merah di bawah kolom Part Number untuk memverifikasi guna menghindari klaim garansi ganda.
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}
                
                <div className="overflow-x-auto border border-slate-200 rounded-lg bg-white">
                  <table className="w-full border-collapse text-xs">
                    <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
                      <tr>
                        <th className="p-2 text-left font-bold uppercase tracking-wider w-1/3">Nama Komponen / Nozzle / Pump</th>
                        <th className="p-2 text-left font-bold uppercase tracking-wider w-1/3">Part Number (P/N)</th>
                        <th className="p-2 text-left font-bold uppercase tracking-wider w-1/4">Kondisi Fisik Komponen</th>
                        <th className="p-2 text-center font-bold uppercase tracking-wider w-12">Hapus</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150">
                      {looseParts.map((part, index) => (
                        <tr key={part.id} className="hover:bg-slate-50/50">
                          <td className="p-2">
                            <input
                              type="text"
                              placeholder="Contoh: Injector Nozzle 1 / Fuel Pump"
                              className="w-full p-2 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-slate-50/30 focus:bg-white text-xs font-semibold text-slate-800"
                              value={part.description}
                              onChange={(e) => updateLoosePart(index, 'description', e.target.value)}
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              placeholder="Contoh: 0445120007 / P/N Parts"
                              className="w-full p-2 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-slate-50/30 focus:bg-white text-xs font-mono font-bold text-slate-800"
                              value={part.partNumber}
                              onChange={(e) => updateLoosePart(index, 'partNumber', e.target.value)}
                            />
                            {(() => {
                              if (!part.partNumber) return null;
                              const matches = getHistoricalWorkOrders(part.partNumber);
                              if (matches.length > 0) {
                                return (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedHistoryPn(part.partNumber);
                                      setShowHistoryModal(true);
                                    }}
                                    className="mt-1 flex items-center gap-1 text-[9px] bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold border border-rose-200 px-2 py-1 rounded-lg shadow-sm transition-colors cursor-pointer w-full justify-center"
                                    title="Klik untuk melihat riwayat garansi/servis komponen ini"
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
                                    Sering Diservis ({matches.length}x) - LIHAT RIWAYAT
                                  </button>
                                );
                              }
                            })()}
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              placeholder="e.g. Drat Slek, Soket Retak, OK"
                              className="w-full p-2 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-slate-50/30 focus:bg-white text-xs text-slate-800 font-medium"
                              value={part.physicalCondition}
                              onChange={(e) => updateLoosePart(index, 'physicalCondition', e.target.value)}
                            />
                          </td>
                          <td className="p-2 text-center">
                            {looseParts.length > 1 ? (
                              <button
                                type="button"
                                onClick={() => removeLoosePart(index)}
                                className="p-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors mx-auto block"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              )}

              {/* Action Builder */}
              <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                  <div>
                    <h4 className="text-[11px] font-black uppercase text-[#1e3a8a] tracking-wider">B. Daftar Pengerjaan & Estimasi Harga (Action & Parts Builder)</h4>
                    <p className="text-[9px] text-slate-500 italic">Tambahkan tindakan pengerjaan dan estimasi biaya perbaikan.</p>
                  </div>
                  <button 
                    type="button" 
                    onClick={addTodoAction} 
                    className="px-3 py-1.5 bg-blue-600 text-white text-[10px] font-black uppercase rounded-lg hover:bg-blue-700 transition-colors flex items-center shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Tambah Pengerjaan
                  </button>
                </div>
                
                <div className="overflow-x-auto border border-slate-200 rounded-lg bg-white">
                  <table className="w-full border-collapse text-xs">
                    <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
                      <tr>
                        <th className="p-2 text-left font-bold uppercase tracking-wider">Jenis Pengerjaan / Tindakan</th>
                        <th className="p-2 text-center font-bold uppercase tracking-wider w-16">Qty</th>
                        <th className="p-2 text-left font-bold uppercase tracking-wider">Catatan Tambahan</th>
                        <th className="p-2 text-left font-bold uppercase tracking-wider w-72">Estimasi Rentang Harga (Rp)</th>
                        <th className="p-2 text-center font-bold uppercase tracking-wider w-12">Hapus</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150 bg-white">
                      {todoActions.map((action, index) => (
                        <tr key={action.id} className="hover:bg-slate-50/40">
                          <td className="p-2">
                            <input 
                              type="text" 
                              required={wizardStep === 3}
                              placeholder="Contoh: Kalibrasi Injector, Ganti Nozzle Tip" 
                              className="w-full p-2 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-xs font-semibold text-slate-800 bg-slate-50/20 focus:bg-white" 
                              value={action.jenisPengerjaan} 
                              onChange={(e) => updateTodoAction(index, 'jenisPengerjaan', e.target.value)} 
                            />
                          </td>
                          <td className="p-2">
                            <input 
                              type="number" 
                              min="1" 
                              className="w-full text-center p-2 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-xs font-bold text-slate-800 bg-slate-50/20 focus:bg-white" 
                              value={action.qty} 
                              onChange={(e) => updateTodoAction(index, 'qty', parseInt(e.target.value) || 1)} 
                            />
                          </td>
                          <td className="p-2">
                            <input 
                              type="text" 
                              placeholder="Contoh: Kode nozzle / catatan khusus" 
                              className="w-full p-2 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-xs text-slate-700 bg-slate-50/20 focus:bg-white font-medium" 
                              value={action.catatanMekanik} 
                              onChange={(e) => updateTodoAction(index, 'catatanMekanik', e.target.value)} 
                            />
                          </td>
                          <td className="p-2">
                            <div className="flex items-center gap-1.5">
                              <input 
                                type="text" 
                                placeholder="Min (Rp)" 
                                className="w-1/2 p-2 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-xs font-bold text-blue-700 bg-slate-50/20 focus:bg-white" 
                                value={formatRupiah(action.estimasiHargaMin)} 
                                onChange={(e) => updateTodoAction(index, 'estimasiHargaMin', e.target.value)} 
                              />
                              <span className="text-slate-400 font-bold text-[10px] shrink-0">s/d</span>
                              <input 
                                type="text" 
                                placeholder="Max (Rp)" 
                                className="w-1/2 p-2 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-xs font-bold text-blue-700 bg-slate-50/20 focus:bg-white" 
                                value={formatRupiah(action.estimasiHargaMax)} 
                                onChange={(e) => updateTodoAction(index, 'estimasiHargaMax', e.target.value)} 
                              />
                            </div>
                          </td>
                          <td className="p-2 text-center">
                            <button 
                              type="button" 
                              onClick={() => removeTodoAction(index)} 
                              className="p-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors mx-auto block"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* WIZARD NAVIGATION BAR */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-100 bg-slate-50 p-4 rounded-xl border border-slate-200 mt-6 shadow-xs">
          <div>
            {wizardStep > 1 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Kembali
              </button>
            ) : (
              <div className="w-10" />
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest hidden sm:block">
              Langkah {wizardStep} dari 3
            </span>
          </div>

          <div>
            {wizardStep < 3 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-2.5 bg-[#1e3a8a] hover:bg-blue-800 text-white rounded-xl text-xs font-black uppercase transition-all flex items-center gap-1.5 shadow-md shadow-blue-100 active:scale-95 cursor-pointer"
              >
                Lanjutkan <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button 
                type="submit" 
                className="px-6 py-2.5 bg-[#dc2626] hover:bg-red-700 text-white rounded-xl text-xs font-black uppercase shadow-md shadow-red-100 transition-all flex items-center gap-1.5 transform active:scale-95 border border-transparent cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                Simpan & Cetak SPK Awal
              </button>
            )}
          </div>
        </div>
      </form>
        </div>
      )}



      {/* MODULE 2: RiwayatKomponenModal */}
      {showHistoryModal && selectedHistoryPn && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="bg-[#1e3a8a] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🕒</span>
                <h3 className="text-sm font-black uppercase tracking-wider">
                  RIWAYAT LIFECYCLE & SERVIS KOMPONEN (P/N: {selectedHistoryPn})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowHistoryModal(false);
                  setSelectedHistoryPn(null);
                }}
                className="text-white hover:text-slate-200 text-sm font-black"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 max-h-[500px] overflow-y-auto space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                Berikut adalah rekam jejak digital perbaikan komponen ini yang tersimpan secara lokal di server NAS. Gunakan informasi ini untuk mendeteksi klaim garansi palsu atau fraud dari pelanggan.
              </p>

              {(() => {
                const historyList = getHistoricalWorkOrders(selectedHistoryPn);
                if (historyList.length === 0) {
                  return <p className="text-xs text-slate-400 italic text-center py-4">Tidak ada riwayat servis sebelumnya.</p>;
                }
                return (
                  <div className="space-y-4">
                    {historyList.map((wo) => {
                      const matchedItem = wo.looseParts?.find(lp => lp.partNumber && lp.partNumber.toLowerCase().includes(selectedHistoryPn.toLowerCase()));
                      return (
                        <div key={wo.id} className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs space-y-2">
                          <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-2">
                            <div>
                              <span className="font-mono font-black text-[#1e3a8a] text-xs">{wo.id}</span>
                              <span className="ml-2 text-slate-400 font-bold">
                                {new Date(wo.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                              </span>
                            </div>
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-black rounded border border-emerald-200 uppercase">
                              {wo.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[11px]">
                            <div>
                              <span className="text-slate-400 font-bold">Pelanggan:</span>
                              <div className="font-semibold text-slate-800">{wo.customerName} ({wo.customerPhone})</div>
                            </div>
                            <div>
                              <span className="text-slate-400 font-bold">Mekanik Lab:</span>
                              <div className="font-semibold text-slate-800">
                                {users.find(u => u.id === wo.mechanicId)?.name || 'Mekanik Lab'}
                              </div>
                            </div>
                          </div>

                          {matchedItem && (
                            <div className="bg-white p-2 rounded border border-slate-150 text-[11px]">
                              <div className="text-slate-400 font-bold">Nama Komponen di SPK:</div>
                              <div className="font-semibold text-slate-800">{matchedItem.description} ({matchedItem.physicalCondition})</div>
                            </div>
                          )}

                          {wo.partLogs && wo.partLogs.length > 0 && (
                            <div className="space-y-1">
                              <span className="text-slate-400 font-bold text-[11px]">Log Temuan Teknik:</span>
                              <div className="bg-white p-2 rounded border border-slate-150 space-y-1 max-h-[100px] overflow-y-auto">
                                {wo.partLogs.map((log) => (
                                  <div key={log.id} className="border-b border-slate-100 last:border-none pb-1 mb-1 last:pb-0 last:mb-0">
                                    <span className="text-[10px] text-slate-400 font-mono font-bold block">
                                      {new Date(log.date).toLocaleString('id-ID', { hour12: false })}
                                    </span>
                                    <p className="font-medium text-slate-700">{log.findings}</p>
                                    {log.notes && <p className="text-[10px] text-slate-500 italic">Notes: {log.notes}</p>}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            <div className="bg-slate-50 p-4 flex justify-end border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setShowHistoryModal(false);
                  setSelectedHistoryPn(null);
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-black text-xs rounded uppercase transition-all shadow-md"
              >
                Tutup Dokumen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POST-HANDOVER SUCCESS ACTION MODAL (3 Buttons: Simpan PDF, Cetak Bukti Serah, Selesai dan Archive) */}
      {handoverSuccessWO && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-750 text-slate-100 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-900/60 to-emerald-800/40 p-6 border-b border-emerald-700/40 flex items-start gap-4">
              <div className="p-3 bg-emerald-500 text-slate-950 rounded-xl shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <span className="text-[11px] font-mono font-black text-emerald-400 uppercase tracking-widest block mb-1">
                  Status Penyerahan Terverifikasi
                </span>
                <h3 className="text-lg font-black text-white tracking-tight">
                  Unit Berhasil Diserahkan ke Pelanggan
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Serah terima SPK <span className="font-mono font-bold text-white">{handoverSuccessWO.id}</span> telah tercatat resmi di log sistem.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setHandoverSuccessWO(null)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs border-b border-slate-850 pb-2">
                  <span className="text-slate-400 font-medium">Pelanggan:</span>
                  <span className="font-bold text-slate-200">{handoverSuccessWO.customerName} ({handoverSuccessWO.customerPhone})</span>
                </div>
                <div className="flex items-center justify-between text-xs border-b border-slate-850 pb-2">
                  <span className="text-slate-400 font-medium">Kendaraan:</span>
                  <span className="font-bold text-blue-400">{handoverSuccessWO.vehicleBrand} - {handoverSuccessWO.plateNumber}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Waktu Serah Terima:</span>
                  <span className="font-mono font-semibold text-emerald-300">
                    {new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-400 text-center">
                Silakan pilih tindakan dokumen resmi selanjutnya di bawah ini:
              </p>

              {/* The 3 Action Buttons */}
              <div className="space-y-2.5">
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setPrintType('HANDOVER');
                      setPrintWO(handoverSuccessWO);
                    }}
                    className="p-3 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/50 text-blue-200 hover:text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex flex-col items-center justify-center gap-1.5 shadow-md cursor-pointer group"
                  >
                    <Download className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
                    <span>1. Simpan PDF</span>
                    <span className="text-[9px] text-blue-300/70 font-normal lowercase">download & preview</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPrintType('HANDOVER');
                      setPrintWO(handoverSuccessWO);
                      setTimeout(() => window.print(), 300);
                    }}
                    className="p-3 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/50 text-purple-200 hover:text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex flex-col items-center justify-center gap-1.5 shadow-md cursor-pointer group"
                  >
                    <Printer className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
                    <span>2. Cetak Bukti Serah</span>
                    <span className="text-[9px] text-purple-300/70 font-normal lowercase">cetak surat fisik</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    updateWorkOrder(handoverSuccessWO.id, { isArchived: true });
                    addNotification?.(
                      'SPK Berhasil Diselesaikan & Diarsipkan',
                      `SPK ${handoverSuccessWO.id} telah dikeluarkan dari SPK Aktif dan tersimpan aman di Buku Servis Lifetime Kendaraan.`,
                      'success',
                      handoverSuccessWO.id
                    );
                    setHandoverSuccessWO(null);
                  }}
                  className="w-full p-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 cursor-pointer group"
                >
                  <Archive className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>3. Selesai dan Archive (Hapus dari SPK Aktif)</span>
                </button>
              </div>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setHandoverSuccessWO(null)}
                  className="text-[11px] text-slate-400 hover:text-slate-200 underline cursor-pointer"
                >
                  Tutup jendela (Biarkan tetap di daftar SPK Aktif)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CANCEL SPK CONFIRMATION MODAL */}
      {cancellingWO && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-750 text-slate-100 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="bg-gradient-to-r from-rose-950/90 to-rose-900/60 p-5 border-b border-rose-800/40 flex items-start gap-4">
              <div className="p-2.5 bg-rose-500 text-white rounded-xl shadow-lg shadow-rose-500/30 shrink-0">
                <Ban className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <span className="text-[11px] font-mono font-black text-rose-400 uppercase tracking-widest block mb-1">
                  Pembatalan SPK / Customer Decline
                </span>
                <h3 className="text-lg font-black text-white tracking-tight">
                  Konfirmasi Pembatalan SPK
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Membatalkan pengerjaan untuk SPK <span className="font-mono font-bold text-white">{cancellingWO.id}</span>
                </p>
              </div>
              <button
                type="button"
                disabled={isProcessingCancel}
                onClick={() => setCancellingWO(null)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1 cursor-pointer disabled:opacity-50"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Unit Info Box */}
              <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                  <span className="text-slate-400 font-medium">Pelanggan:</span>
                  <span className="font-bold text-slate-200">{cancellingWO.customerName} ({cancellingWO.customerPhone})</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Kendaraan / Unit:</span>
                  <span className="font-bold text-blue-400">{cancellingWO.vehicleBrand} - {cancellingWO.plateNumber}</span>
                </div>
              </div>

              {/* Error Banner */}
              {cancelError && (
                <div className="p-3 bg-rose-950/90 border border-rose-700 text-rose-200 text-xs rounded-xl flex items-start gap-2.5 animate-in fade-in">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div className="flex-1 font-medium">{cancelError}</div>
                </div>
              )}

              {/* Cancellation Reason Dropdown Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-300 block">
                    Alasan Pembatalan SPK <span className="text-rose-400">*</span>
                  </label>
                  {!cancelReason && (
                    <span className="text-[10px] text-rose-400 font-mono font-bold animate-pulse">
                      Wajib Dipilih
                    </span>
                  )}
                </div>
                <select
                  value={cancelReason}
                  onChange={(e) => {
                    setCancelReason(e.target.value);
                    if (cancelError) setCancelError(null);
                  }}
                  disabled={isProcessingCancel}
                  className={`w-full bg-slate-950 border text-xs text-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none font-medium transition-all ${
                    !cancelReason ? 'border-rose-800/80 bg-rose-950/10' : 'border-slate-700'
                  }`}
                >
                  <option value="" disabled className="text-slate-500">
                    -- Pilih Alasan Pembatalan dari Dropdown (Wajib) --
                  </option>
                  <option value="Pelanggan Menolak Estimasi Biaya (Decline / Biaya Terlalu Tinggi)">
                    Pelanggan Menolak Estimasi Biaya (Decline / Biaya Terlalu Tinggi)
                  </option>
                  <option value="Pelanggan Membatalkan Servis / Mengambil Kembali Unit">
                    Pelanggan Membatalkan Servis / Mengambil Kembali Unit
                  </option>
                  <option value="Spare Part Tidak Tersedia & Pelanggan Menolak Menunggu Inden">
                    Spare Part Tidak Tersedia & Pelanggan Menolak Menunggu Inden
                  </option>
                  <option value="Kerusakan Tidak Dapat Diperbaiki / Di Luar Kapasitas Bengkel">
                    Kerusakan Tidak Dapat Diperbaiki / Di Luar Kapasitas Bengkel
                  </option>
                  <option value="Salah Registrasi SPK / Duplikasi Dokumen">
                    Salah Registrasi SPK / Duplikasi Dokumen
                  </option>
                  <option value="Lainnya (Wajib Tuliskan Keterangan Tambahan)">
                    Lainnya (Wajib Tuliskan Keterangan Tambahan)
                  </option>
                </select>
              </div>

              {/* Additional notes */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Catatan Tambahan {cancelReason.startsWith('Lainnya') ? <span className="text-rose-400">* (Wajib Diisi)</span> : '(Opsional)'}:
                  </label>
                </div>
                <textarea
                  value={cancelCustomNotes}
                  onChange={(e) => {
                    setCancelCustomNotes(e.target.value);
                    if (cancelError) setCancelError(null);
                  }}
                  disabled={isProcessingCancel}
                  placeholder={cancelReason.startsWith('Lainnya') ? "Harap tuliskan detail alasan pembatalan di sini..." : "Tuliskan catatan rinci pembatalan jika ada..."}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none placeholder:text-slate-600 resize-none font-medium"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  disabled={isProcessingCancel}
                  onClick={() => setCancellingWO(null)}
                  className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
                >
                  Kembali
                </button>
                <button
                  type="button"
                  disabled={isProcessingCancel || !cancelReason}
                  onClick={handleConfirmCancelWO}
                  className={`flex-1 py-2.5 px-4 text-white text-xs font-black rounded-xl uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg ${
                    isProcessingCancel || !cancelReason
                      ? 'bg-slate-700 opacity-60 cursor-not-allowed text-slate-400'
                      : 'bg-rose-600 hover:bg-rose-700 shadow-rose-900/40 cursor-pointer'
                  }`}
                >
                  {isProcessingCancel ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      <span>Menyimpan ke Firestore...</span>
                    </>
                  ) : (
                    <>
                      <Ban className="w-4 h-4" />
                      <span>Konfirmasi Batal SPK</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT WORK ORDER MODAL (SA & Admin Human Error Fixes) */}
      <EditWorkOrderModal
        wo={editingWO}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingWO(null);
        }}
      />
    </div>
  );
};

export default SADashboard;
