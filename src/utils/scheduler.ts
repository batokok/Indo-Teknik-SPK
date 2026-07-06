import { db, auth } from '../firebase';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { WorkOrder, User } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error in Scheduler: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface DailySummary {
  id: string; // "daily_summary_YYYY-MM-DD"
  date: string; // "YYYY-MM-DD"
  createdAt: string; // ISO String
  systemActivity: {
    totalWorkOrders: number;
    newWorkOrdersToday: number;
    completedWorkOrdersToday: number;
    queueCount: number;
    inProgressCount: number;
    pendingPartsCount: number;
    pendingApprovalCount: number;
    supplyPumpCount: number;
    commonRailCount: number;
    saCount: number;
    activeMechanicsCount: number;
  };
  criticalInventoryStatus: {
    nozzleTipWornCount: number;
    nozzleTipJammedCount: number;
    valveScratchedCount: number;
    valveLeakCount: number;
    shimAdjustedCount: number;
    sealKitReplacedCount: number;
    blockedWorkOrders: {
      id: string;
      customerName: string;
      vehicleBrand: string;
      plateNumber: string;
      blockedReason: string;
      currentDivision: string;
    }[];
  };
}

/**
 * Calculates and returns the daily summary data based on current state.
 */
export function calculateDailySummary(
  dateStr: string,
  workOrders: WorkOrder[],
  users: User[]
): DailySummary {
  const startOfDay = new Date(dateStr);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(dateStr);
  endOfDay.setHours(23, 59, 59, 999);

  // Filter WO created today
  const newWOsToday = workOrders.filter(wo => {
    const createdDate = new Date(wo.createdAt);
    return createdDate >= startOfDay && createdDate <= endOfDay;
  });

  // Filter WO completed today (assuming status changes to COMPLETED or has ended today)
  const completedToday = workOrders.filter(wo => {
    if (wo.status !== 'COMPLETED') return false;
    // Use startedAt or latest milestone or milestone history if available,
    // otherwise fallback to workOrder createdAt
    const compDate = wo.milestoneHistory?.find(m => m.milestone === 'COMPLETED' || m.milestone === 'Selesai')?.timestamp 
      || wo.createdAt;
    const d = new Date(compDate);
    return d >= startOfDay && d <= endOfDay;
  });

  // Counts by status
  let queueCount = 0;
  let inProgressCount = 0;
  let pendingPartsCount = 0;
  let pendingApprovalCount = 0;

  workOrders.forEach(wo => {
    if (wo.status === 'QUEUE') queueCount++;
    else if (wo.status === 'IN_PROGRESS') inProgressCount++;
    else if (wo.status === 'PENDING_PARTS') pendingPartsCount++;
    else if (wo.status === 'PENDING_APPROVAL') pendingApprovalCount++;
  });

  // Counts by division
  let supplyPumpCount = 0;
  let commonRailCount = 0;
  let saCount = 0;

  workOrders.forEach(wo => {
    if (wo.currentDivision === 'SUPPLY_PUMP') supplyPumpCount++;
    else if (wo.currentDivision === 'COMMON_RAIL') commonRailCount++;
    else saCount++;
  });

  // Active mechanics
  const activeMechanics = users.filter(u => 
    (u.role === 'MECHANIC' || u.role === 'COMMON_RAIL') && u.status === 'ACTIVE'
  ).length;

  // Calculate spare part usage and wear patterns from partLogs
  let nozzleTipWornCount = 0;
  let nozzleTipJammedCount = 0;
  let valveScratchedCount = 0;
  let valveLeakCount = 0;
  let shimAdjustedCount = 0;
  let sealKitReplacedCount = 0;

  workOrders.forEach(wo => {
    if (wo.partLogs) {
      wo.partLogs.forEach(log => {
        if (log.nozzleTipWorn) nozzleTipWornCount++;
        if (log.nozzleTipJammed) nozzleTipJammedCount++;
        if (log.valveScratched) valveScratchedCount++;
        if (log.valveLeak) valveLeakCount++;
        if (log.shimAdjusted) shimAdjustedCount++;
        if (log.sealKitReplaced) sealKitReplacedCount++;
      });
    }
  });

  // Blocked jobs (critical inventory status)
  const blockedWorkOrders = workOrders
    .filter(wo => wo.status === 'PENDING_PARTS' || wo.isBlocked)
    .map(wo => ({
      id: wo.id,
      customerName: wo.customerName,
      vehicleBrand: wo.vehicleBrand,
      plateNumber: wo.plateNumber,
      blockedReason: wo.blockedReason || 'WAITING_PARTS',
      currentDivision: wo.currentDivision || 'MECHANIC'
    }));

  return {
    id: `daily_summary_${dateStr}`,
    date: dateStr,
    createdAt: new Date().toISOString(),
    systemActivity: {
      totalWorkOrders: workOrders.length,
      newWorkOrdersToday: newWOsToday.length,
      completedWorkOrdersToday: completedToday.length,
      queueCount,
      inProgressCount,
      pendingPartsCount,
      pendingApprovalCount,
      supplyPumpCount,
      commonRailCount,
      saCount,
      activeMechanicsCount: activeMechanics
    },
    criticalInventoryStatus: {
      nozzleTipWornCount,
      nozzleTipJammedCount,
      valveScratchedCount,
      valveLeakCount,
      shimAdjustedCount,
      sealKitReplacedCount,
      blockedWorkOrders
    }
  };
}

/**
 * Checks if a daily summary exists for the given date.
 * If not, calculates and stores it.
 */
export async function triggerDailySummary(
  workOrders: WorkOrder[],
  users: User[],
  forcedDate?: string
): Promise<{ success: boolean; isNew: boolean; data?: DailySummary; error?: string }> {
  // Use today's local date format (YYYY-MM-DD)
  const today = new Date();
  const dateStr = forcedDate || today.toLocaleDateString('en-CA'); // en-CA gives YYYY-MM-DD
  const docId = `daily_summary_${dateStr}`;
  const docPath = `dailySummaries/${docId}`;

  try {
    const docRef = doc(db, 'dailySummaries', docId);
    let docSnap;
    try {
      docSnap = await getDoc(docRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, docPath);
    }

    if (docSnap && docSnap.exists()) {
      return {
        success: true,
        isNew: false,
        data: docSnap.data() as DailySummary
      };
    }

    // Generate and archive
    const summaryData = calculateDailySummary(dateStr, workOrders, users);
    try {
      await setDoc(docRef, summaryData);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, docPath);
    }

    console.log(`Daily summary successfully generated and archived for ${dateStr}`);
    return {
      success: true,
      isNew: true,
      data: summaryData
    };
  } catch (error) {
    console.error("Failed to run daily summary scheduled task:", error);
    return {
      success: false,
      isNew: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
