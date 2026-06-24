export type Role = 'SA' | 'MECHANIC' | 'FOREMAN' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  username: string;
  password?: string;
  role: Role;
  status: 'ACTIVE' | 'SUSPENDED';
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

export interface WorkOrder {
  id: string;
  createdAt: string;
  status: WOStatus;
  priority: Priority;
  
  // Customer Info
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress?: string;
  
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
  isArchived?: boolean;
}
