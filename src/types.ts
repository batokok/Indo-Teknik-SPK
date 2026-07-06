export type Role = 'SA' | 'MECHANIC' | 'COMMON_RAIL' | 'FOREMAN' | 'ADMIN' | 'CUSTOMER';

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
export type WOStatus = 'QUEUE' | 'IN_PROGRESS' | 'PENDING_APPROVAL' | 'COMPLETED' | 'PENDING_PARTS';

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
  currentDivision?: 'SUPPLY_PUMP' | 'COMMON_RAIL' | 'SA';
  divisionFlow?: ('SUPPLY_PUMP' | 'COMMON_RAIL')[];
  divisionNotes?: { from: string, to: string, note: string, date: string }[];
  isArchived?: boolean;
  currentMilestone?: string;
  milestoneHistory?: { milestone: string; timestamp: string; updatedBy: string }[];
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
  divisionRelated: 'SUPPLY_PUMP' | 'COMMON_RAIL' | 'SA';
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


