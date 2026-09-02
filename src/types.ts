export type Role = 'SA' | 'MECHANIC' | 'COMMON_RAIL' | 'TURBO' | 'FOREMAN' | 'ADMIN' | 'CUSTOMER' | 'BASIC';

export interface User {
  id: string;
  name: string;
  username: string;
  password?: string;
  role: Role;
  status: 'ACTIVE' | 'SUSPENDED';
  hasSeenTutorial?: boolean;
  geoLock?: {
    enabled: boolean;
    latitude: number;
    longitude: number;
    radius: number;
    addressName: string;
  };
}

export type Priority = 1 | 2 | 3;
export type WOStatus = 'QUEUE' | 'IN_PROGRESS' | 'PENDING_APPROVAL' | 'COMPLETED' | 'PENDING_PARTS' | 'CANCELLED';

export interface PartDetails {
  id: string;
  cylinderNo: string;
  serialNumber: string;
  solenoidCondition: string;
  threadPlugsState: string;
  nozzleTipState: string;
}

export interface InventoryItem {
  name: string;
  checked: boolean;
}

export interface DamageReport {
  partId: string;
  description: string;
}

export interface PartLog {
  id: string;
  date: string;
  nozzleTipJammed: boolean;
  nozzleTipWorn: boolean;
  valveScratched: boolean;
  valveLeak: boolean;
  shimAdjusted: boolean;
  sealKitReplaced: boolean;
  notes: string;
  findings?: string;
}

export interface LoosePartDetails {
  id: string;
  description: string;
  partNumber: string;
  physicalCondition: string;
}

export interface TodoAction {
  id: string;
  jenisPengerjaan: string;
  qty: number;
  catatanMekanik: string;
  estimasiHarga: string;
  estimasiHargaMin?: string;
  estimasiHargaMax?: string;
}

export interface CalibrationMetric {
  sebelum: string;
  sesudah: string;
}

export interface CalibrationData {
  volumeSemprotan: CalibrationMetric;
  debitBackleak: CalibrationMetric;
  tekanan: CalibrationMetric;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  email?: string;
  companyName?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  notes?: string;
}

export interface Vehicle {
  id: string;
  customerId: string;
  plateNumber: string;
  vin: string;
  brand: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface WorkOrder {
  id: string;
  createdAt: string;
  status: WOStatus;
  priority: Priority;
  
  // Link to Database
  customerId?: string;
  vehicleId?: string;
  createdBy?: string;
  
  // Customer Info (Snapshot)
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress?: string;
  
  // Bringer Info
  bringerName?: string;
  bringerPhone?: string;
  bringerAddress?: string;
  
  // Vehicle Info
  vehicleBrand: string;
  vin: string;
  plateNumber: string;
  odometer: string;
  fuelLevel: 'E' | '1/4' | '1/2' | '3/4' | 'F';
  estimasiPengerjaan: string;
  garansi: string;
  intakeDate?: string;
  fuelContaminated?: boolean;
  assyNo?: string;
  
  // Drop Method
  dropMethod: 'WHOLE' | 'PARTS';
  partsTracking: PartDetails[];
  looseParts?: LoosePartDetails[];
  
  // Complaint
  customerVoice: string;
  
  // Visual Map
  damages: DamageReport[];
  
  // Inventory
  inventory: InventoryItem[];
  
  // SPK Production Scope
  todoActions?: TodoAction[];

  // Mechanic assignment & logs
  mechanicId?: string;
  partLogs: PartLog[];
  startedAt?: string;
  totalElapsedSeconds?: number;
  isBlocked?: boolean;
  blockedReason?: 'HIDDEN_DEFECT' | 'WAITING_PARTS';
  calibrationData?: CalibrationData;
  repairResults?: Record<number, string>;
  currentDivision?: 'SUPPLY_PUMP' | 'COMMON_RAIL' | 'TURBO' | 'SA';
  divisionFlow?: ('SUPPLY_PUMP' | 'COMMON_RAIL' | 'TURBO')[];
  divisionNotes?: { from: string, to: string, note: string, date: string }[];
  isArchived?: boolean;
  archivedAt?: string;
  currentMilestone?: string;
  milestoneHistory?: { milestone: string; timestamp: string; updatedBy: string }[];
  isHandoverConfirmed?: boolean;
  handoverDate?: string;
  handoverConfirmedBy?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  cancelReason?: string;
}

export interface AppNotification {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  woId?: string;
}

export interface Claim {
  id: string;
  customerId: string;
  customerName: string;
  claimDate: string;
  relatedWOId?: string;
  divisionRelated: 'SUPPLY_PUMP' | 'COMMON_RAIL' | 'TURBO' | 'SA';
  assignedPersonId?: string;
  assignedPersonName?: string;
  claimType: 'DAMAGE' | 'COMPLAINT' | 'COMEBACK_JOB' | 'WARRANTY' | 'OTHER';
  cause: string;
  status: 'OPEN' | 'INVESTIGATING' | 'COMPLETED' | 'REJECTED';
  investigationNotes: string;
  finalDecision: string;
  rectificationAction: string;
  isWarrantyIncluded: boolean;
  isNegligence: boolean;
  completedDate?: string;
  createdAt: string;
}

export interface InternalMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: Role;
  recipientId?: string; // Specific User ID or 'ALL'
  recipientName?: string; // Specific User Name or 'Semua Tim'
  recipientRole?: Role | 'ALL';
  text: string;
  timestamp: string;
  createdAtMs: number;
  relatedWOId?: string;
  relatedPlateNumber?: string;
  dateKey: string;
  readBy?: string[];
}

// ==========================================
// GATE CONTROL (BARANG MASUK & KELUAR)
// ==========================================

export type GateEntryType = 'VEHICLE' | 'SPAREPART' | 'COMPONENT' | 'CUSTOMER_GOODS' | 'SUPPLIER_GOODS' | 'TOOLS' | 'OTHER';
export type GateCondition = 'GOOD' | 'USED' | 'DAMAGED' | 'FOR_SERVICE' | 'FOR_INSPECTION' | 'UNKNOWN';

export interface GateEntry {
  id: string; // Format: BM-YYMMDD-XXXX
  date: string; // YYYY-MM-DD
  time: string; // HH:mm WIB
  createdAt: string; // ISO String
  createdBy: string; // Authenticated employee name
  creatorUserId: string; // User ID
  status: 'RECORDED' | 'CANCELLED';
  
  bringerName: string; // Nama Pembawa (Required)
  bringerPhone?: string; // Optional phone
  customerName?: string; // Privacy: Only Name
  customerId?: string;
  
  entryType: GateEntryType;
  entryTypeCustom?: string;
  itemsDescription: string; // Apa yang dibawa
  qty?: number;
  unit?: string; // pcs, unit, set, dus, kendaraan, etc.
  condition: GateCondition;
  conditionNotes?: string;
  
  receivedBy: string; // Auto-filled employee name
  
  // Conditional for vehicle
  vehiclePlateNumber?: string;
  vehicleBrandModel?: string;
  
  notes?: string;
  photoUrl?: string;
  
  // Cancellation Audit Trail
  cancelledAt?: string;
  cancelledBy?: string;
  cancelReason?: string;
  
  // Archival Lifecycle
  isArchived?: boolean;
  archivedAt?: string;
}

export type GateExitType = 'NORMAL_SALES' | 'INTERNAL' | 'RETURN' | 'LOAN' | 'TRANSFER';
export type GateExitRefType = 'INVOICE' | 'SALES_ORDER' | 'SERVICE_ORDER' | 'HANDOVER' | 'INTERNAL' | 'OTHER';

export interface GateExitItem {
  id: string;
  name: string;
  qty: number;
  unit: string;
  notes?: string;
}

export interface GateExitDocument {
  id: string; // Format: SJ-YYMMDD-XXXX (Surat Jalan)
  date: string; // YYYY-MM-DD
  time: string; // HH:mm WIB
  createdAt: string; // ISO String
  createdBy: string; // Employee who issued the Surat Jalan
  creatorUserId: string;
  status: 'DRAFT' | 'READY' | 'COMPLETED' | 'CANCELLED';
  
  customerName?: string; // Privacy: Name only
  customerId?: string;
  bringerName: string; // Nama Pembawa / Sopir / Pengambil (Required)
  driverPlateNumber?: string; // No. Polisi Kendaraan Pengangkut (Optional)
  
  exitType: GateExitType;
  refType: GateExitRefType;
  referenceNumber?: string; // Ref NO (Invoice / SO / WO-YYYY-XXXX / ST-YYMMDD-XXXX)
  handoverId?: string; // Link to Serah Terima if created from it
  
  items: GateExitItem[];
  destination?: string; // Alamat / Tujuan Kirim (Opsional/Umum)
  notes?: string;
  
  // Physical Satpam check audit
  satpamCheckedBy?: string;
  satpamExitTime?: string;
  satpamNotes?: string;
  
  // Cancellation Audit Trail
  cancelledAt?: string;
  cancelledBy?: string;
  cancelReason?: string;

  // Archival Lifecycle
  isArchived?: boolean;
  archivedAt?: string;
}

export interface HandoverItem {
  id: string;
  name: string;
  qty: number;
  unit: string;
  condition?: string;
  notes?: string;
}

export interface HandoverDocument {
  id: string; // Format: ST-YYMMDD-XXXX
  date: string; // YYYY-MM-DD
  time: string; // HH:mm WIB
  createdAt: string; // ISO String
  createdBy: string; // Service Advisor or authorized issuer
  creatorUserId: string;
  status: 'COMPLETED' | 'CANCELLED';
  
  relatedWOId?: string; // Ref: WO-YYYY-XXXX
  customerName: string; // Privacy safe
  customerId?: string;
  vehiclePlateNumber?: string;
  vehicleBrandModel?: string;
  
  recipientName: string; // Nama Pembawa / Penerima (Required)
  recipientPhone?: string; // Optional
  
  handoverType: 'SERVICE_UNIT' | 'SPAREPART' | 'WARRANTY' | 'OTHER';
  items: HandoverItem[];
  warrantyPeriod?: string;
  notes?: string;
  
  isSuratJalanCreated?: boolean;
  suratJalanId?: string;
  
  // Cancellation Audit Trail
  cancelledAt?: string;
  cancelledBy?: string;
  cancelReason?: string;

  // Archival Lifecycle
  isArchived?: boolean;
  archivedAt?: string;
}

export type GatePrintDocumentType = 
  | { type: 'BARANG_MASUK'; data: GateEntry }
  | { type: 'SURAT_JALAN'; data: GateExitDocument }
  | { type: 'SERAH_TERIMA'; data: HandoverDocument };



