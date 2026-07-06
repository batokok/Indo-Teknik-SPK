import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { User, WorkOrder, WOStatus, PartLog, AppNotification, Customer, Vehicle, Claim } from '../types';
import { db, auth } from '../firebase';
import { collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot, getDocs, runTransaction, serverTimestamp } from 'firebase/firestore';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';

// Pure JS SHA-256 Fallback for browsers with disabled/unsupported crypto.subtle (like nested sandboxed iframes or HTTP)
function sha256Fallback(ascii: string): string {
  function rightRotate(value: number, amount: number): number {
    return (value >>> amount) | (value << (32 - amount));
  }
  
  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  const lengthProperty = 'length';
  let i, j;
  let result = '';

  const words: number[] = [];
  const asciiLength = ascii.length;
  
  const hash: number[] = [];
  const k: number[] = [];
  let primeCounter = 0;

  const isPrime = (n: number) => {
    let divisor = 2;
    while (n % divisor) {
      divisor++;
    }
    return divisor === n;
  };

  let candidate = 2;
  while (primeCounter < 64) {
    if (isPrime(candidate)) {
      if (primeCounter < 8) {
        hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
      }
      k[primeCounter] = (mathPow(candidate, 1/3) * maxWord) | 0;
      primeCounter++;
    }
    candidate++;
  }

  let paddedAscii = ascii + '\x80';
  while (paddedAscii[lengthProperty] % 64 - 56) {
    paddedAscii += '\x00';
  }
  for (i = 0; i < paddedAscii[lengthProperty]; i++) {
    j = paddedAscii.charCodeAt(i);
    words[i >> 2] |= j << ((3 - i % 4) * 8);
  }
  words[words[lengthProperty]] = ((asciiLength * 8) / maxWord) | 0;
  words[words[lengthProperty]] = (asciiLength * 8);

  let h0 = hash[0], h1 = hash[1], h2 = hash[2], h3 = hash[3], h4 = hash[4], h5 = hash[5], h6 = hash[6], h7 = hash[7];

  for (i = 0; i < words[lengthProperty]; i += 16) {
    const w = words.slice(i, i + 16);
    const oldh0 = h0, oldh1 = h1, oldh2 = h2, oldh3 = h3, oldh4 = h4, oldh5 = h5, oldh6 = h6, oldh7 = h7;

    for (j = 0; j < 64; j++) {
      if (j >= 16) {
        const w15 = w[j - 15], w2 = w[j - 2];
        const s0 = rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3);
        const s1 = rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10);
        w[j] = (w[j - 16] + s0 + w[j - 7] + s1) | 0;
      }

      const ch = (h4 & h5) ^ (~h4 & h6);
      const maj = (h0 & h1) ^ (h0 & h2) ^ (h1 & h2);
      const sigma0 = rightRotate(h0, 2) ^ rightRotate(h0, 13) ^ rightRotate(h0, 22);
      const sigma1 = rightRotate(h4, 6) ^ rightRotate(h4, 11) ^ rightRotate(h4, 25);
      const t1 = (h7 + sigma1 + ch + k[j] + w[j]) | 0;
      const t2 = (sigma0 + maj) | 0;

      h7 = h6;
      h6 = h5;
      h5 = h4;
      h4 = (h3 + t1) | 0;
      h3 = h2;
      h2 = h1;
      h1 = h0;
      h0 = (t1 + t2) | 0;
    }

    h0 = (h0 + oldh0) | 0;
    h1 = (h1 + oldh1) | 0;
    h2 = (h2 + oldh2) | 0;
    h3 = (h3 + oldh3) | 0;
    h4 = (h4 + oldh4) | 0;
    h5 = (h5 + oldh5) | 0;
    h6 = (h6 + oldh6) | 0;
    h7 = (h7 + oldh7) | 0;
  }

  const hex = [h0, h1, h2, h3, h4, h5, h6, h7];
  for (i = 0; i < 8; i++) {
    let val = hex[i];
    if (val < 0) val += maxWord;
    let str = val.toString(16);
    while (str.length < 8) {
      str = '0' + str;
    }
    result += str;
  }
  return result;
}

// Secure Password Hashing Helper using Web Crypto SHA-256 with pure JS fallback
export async function hashPassword(password: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    try {
      const msgBuffer = new TextEncoder().encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      console.warn('crypto.subtle failed, falling back to pure JS hash', e);
    }
  }
  return sha256Fallback(password);
}

// Convert any Firestore timestamp or pending/estimate timestamp to string
export const parseTimestampToISO = (val: any): string => {
  if (!val) return new Date().toISOString();
  if (typeof val === 'string') return val;
  if (typeof val.toDate === 'function') return val.toDate().toISOString();
  if (val.seconds !== undefined) return new Date(val.seconds * 1000).toISOString();
  return new Date().toISOString();
};

interface AppContextType {
  currentUser: User | null;
  login: (username: string, password?: string) => Promise<string | null>;
  logout: () => void;
  users: User[];
  addUser: (user: Omit<User, 'id'>) => Promise<void>;
  updateUser: (id: string, updates: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  customers: Customer[];
  vehicles: Vehicle[];
  addCustomer: (cust: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Customer>;
  updateCustomer: (id: string, updates: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  addVehicle: (veh: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Vehicle>;
  workOrders: WorkOrder[];
  addWorkOrder: (wo: Omit<WorkOrder, 'id' | 'createdAt' | 'status' | 'partLogs'>) => WorkOrder;
  updateWOStatus: (id: string, status: WOStatus, mechanicId?: string) => void;
  updateWorkOrder: (id: string, updates: Partial<WorkOrder>) => void;
  addPartLog: (woId: string, log: Omit<PartLog, 'id' | 'date'>) => void;
  printWO: WorkOrder | null;
  setPrintWO: (wo: WorkOrder | null) => void;
  notifications: AppNotification[];
  toasts: AppNotification[];
  clearNotifications: () => void;
  markAllAsRead: () => void;
  removeToast: (id: string) => void;
  addNotification: (title: string, message: string, type?: 'info' | 'success' | 'warning' | 'error', woId?: string) => void;
  areToastsMuted: boolean;
  setAreToastsMuted: (muted: boolean) => void;
  isLoading: boolean;
  createSuperAdmin: (user: Omit<User, 'id'>) => Promise<void>;
  bypassLogin: (user: User) => void;
  clearAllUsers: () => Promise<void>;
  resetUserPassword: (id: string, newPassword: string) => Promise<void>;
  triggerDailySummaryManual: (dateStr?: string) => Promise<{ success: boolean; data?: any; error?: string }>;
  claims: Claim[];
  addClaim: (claim: Omit<Claim, 'id' | 'createdAt'>) => Promise<Claim>;
  updateClaim: (id: string, updates: Partial<Claim>) => Promise<void>;
  deleteClaim: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('itech_erp_current_user');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  const [users, setUsers] = useState<User[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [printWO, setPrintWO] = useState<WorkOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirebaseAuthed, setIsFirebaseAuthed] = useState(false);

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const stored = localStorage.getItem('itech_erp_notifications');
    return stored ? JSON.parse(stored) : [];
  });
  const [toasts, setToasts] = useState<AppNotification[]>([]);
  const [areToastsMuted, setAreToastsMutedState] = useState(() => localStorage.getItem('itech_erp_mute_toasts') === 'true');

  const setAreToastsMuted = (muted: boolean) => {
    setAreToastsMutedState(muted);
    localStorage.setItem('itech_erp_mute_toasts', muted ? 'true' : 'false');
  };

  const isInitialLoadRef = useRef(true);

  // Sync notifications to localStorage
  useEffect(() => {
    localStorage.setItem('itech_erp_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = (title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info', woId?: string) => {
    const newNotification: AppNotification = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      type,
      title,
      message,
      read: false,
      woId
    };
    
    // Add to notification list (limit to 50 items)
    setNotifications(prev => [newNotification, ...prev].slice(0, 50));
    
    // Add to toasts only if not muted
    if (!areToastsMuted) {
      setToasts(prev => [...prev, newNotification]);
      
      // Auto remove toast after 6 seconds
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== newNotification.id));
      }, 6000);
    }
  };

  const addNotificationRef = useRef(addNotification);
  useEffect(() => {
    addNotificationRef.current = addNotification;
  });

  const clearNotifications = () => setNotifications([]);
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };
  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Keep localStorage updated with currentUser state
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('itech_erp_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('itech_erp_current_user');
    }
  }, [currentUser]);

  // Handle immediate logout or updates if the logged-in user gets updated/suspended in the db
  useEffect(() => {
    if (currentUser && users.length > 0) {
      const dbUser = users.find(u => u.id === currentUser.id || u.username.toLowerCase() === currentUser.username.toLowerCase());
      if (dbUser) {
        if (dbUser.status === 'SUSPENDED') {
          setCurrentUser(null);
        } else {
          const hasChanged = 
            dbUser.username !== currentUser.username ||
            dbUser.name !== currentUser.name ||
            dbUser.role !== currentUser.role ||
            dbUser.status !== currentUser.status ||
            dbUser.password !== currentUser.password ||
            dbUser.hasSeenTutorial !== currentUser.hasSeenTutorial ||
            JSON.stringify(dbUser.geoLock) !== JSON.stringify(currentUser.geoLock);
            
          if (hasChanged) {
            setCurrentUser(dbUser);
          }
        }
      }
    }
  }, [users, currentUser?.id, currentUser?.username]);

  useEffect(() => {
    // Authenticate anonymously to access Firestore in background if possible, but don't block on it
    signInAnonymously(auth).catch(err => {
      console.warn("Anonymous sign-in not enabled or failed, using public rules fallback: ", err.message);
    });

    let unsubUsers: (() => void) | null = null;
    let unsubCustomers: (() => void) | null = null;
    let unsubVehicles: (() => void) | null = null;
    let unsubWO: (() => void) | null = null;
    let unsubClaims: (() => void) | null = null;

    let usersLoaded = false;
    let workOrdersLoaded = false;
    let customersLoaded = false;
    let vehiclesLoaded = false;
    let claimsLoaded = false;

    const checkLoadingComplete = () => {
      if (usersLoaded && workOrdersLoaded && customersLoaded && vehiclesLoaded && claimsLoaded) {
        setIsLoading(false);
      }
    };

    // Setup Firestore listeners unconditionally
    unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const dbUsers: User[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data() as any;
        data.id = doc.id;
        dbUsers.push(data as User);
      });
      setUsers(dbUsers);
      usersLoaded = true;
      checkLoadingComplete();
    }, (error) => {
      console.error("Users listen error:", error);
      usersLoaded = true;
      checkLoadingComplete();
    });

    unsubCustomers = onSnapshot(collection(db, 'customers'), (snapshot) => {
      const dbCusts: Customer[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data() as any;
        data.id = doc.id;
        data.createdAt = parseTimestampToISO(data.createdAt);
        data.updatedAt = parseTimestampToISO(data.updatedAt);
        dbCusts.push(data as Customer);
      });
      setCustomers(dbCusts);
      customersLoaded = true;
      checkLoadingComplete();
    }, (error) => {
      console.error("Customers listen error:", error);
      customersLoaded = true;
      checkLoadingComplete();
    });

    unsubVehicles = onSnapshot(collection(db, 'vehicles'), (snapshot) => {
      const dbVehs: Vehicle[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data() as any;
        data.id = doc.id;
        data.createdAt = parseTimestampToISO(data.createdAt);
        data.updatedAt = parseTimestampToISO(data.updatedAt);
        dbVehs.push(data as Vehicle);
      });
      setVehicles(dbVehs);
      vehiclesLoaded = true;
      checkLoadingComplete();
    }, (error) => {
      console.error("Vehicles listen error:", error);
      vehiclesLoaded = true;
      checkLoadingComplete();
    });

    unsubWO = onSnapshot(collection(db, 'workOrders'), (snapshot) => {
      const isInitial = isInitialLoadRef.current;
      const dbWOs: WorkOrder[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data({ serverTimestamps: 'estimate' }) as any;
        data.id = doc.id;
        if (!data.partLogs) data.partLogs = [];
        // Safely parse Firestore timestamps and estimate times
        data.createdAt = parseTimestampToISO(data.createdAt);
        if (data.intakeDate) data.intakeDate = parseTimestampToISO(data.intakeDate);
        if (data.startedAt) data.startedAt = parseTimestampToISO(data.startedAt);
        if (data.partLogs) {
          data.partLogs = data.partLogs.map((log: any) => ({
            ...log,
            date: parseTimestampToISO(log.date)
          }));
        }
        dbWOs.push(data as WorkOrder);
      });
      
      // Sort by createdAt descending
      dbWOs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setWorkOrders(dbWOs);

      // Only process real-time change events for toasts after the initial load batch is fully complete
      if (!isInitial) {
        snapshot.docChanges().forEach((change) => {
          const wo = change.doc.data() as WorkOrder;
          const id = change.doc.id;
          
          if (change.type === 'added') {
            addNotificationRef.current(
              'New Work Order Created',
              `Work Order ${id} has been registered for ${wo.customerName}.`,
              'info',
              id
            );
          } else if (change.type === 'modified') {
            const divisionLabel = wo.currentDivision === 'SUPPLY_PUMP' ? 'Fuel Pump' 
                                : wo.currentDivision === 'COMMON_RAIL' ? 'Common Rail' 
                                : 'SA Intake';
            addNotificationRef.current(
              'Work Order Updated',
              `Work Order ${id} (${wo.customerName}) status is now "${wo.status.replace(/_/g, ' ')}" [Division: ${divisionLabel}].`,
              wo.status === 'COMPLETED' ? 'success' : 'warning',
              id
            );
          }
        });
      } else {
        isInitialLoadRef.current = false;
      }
      workOrdersLoaded = true;
      checkLoadingComplete();
    }, (error) => {
      console.error("Work orders listen error:", error);
      workOrdersLoaded = true;
      checkLoadingComplete();
    });

    unsubClaims = onSnapshot(collection(db, 'claims'), (snapshot) => {
      const dbClaims: Claim[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data() as any;
        data.id = doc.id;
        data.createdAt = parseTimestampToISO(data.createdAt);
        data.claimDate = parseTimestampToISO(data.claimDate);
        if (data.completedDate) data.completedDate = parseTimestampToISO(data.completedDate);
        dbClaims.push(data as Claim);
      });
      dbClaims.sort((a, b) => new Date(b.claimDate).getTime() - new Date(a.claimDate).getTime());
      setClaims(dbClaims);
      claimsLoaded = true;
      checkLoadingComplete();
    }, (error) => {
      console.error("Claims listen error:", error);
      claimsLoaded = true;
      checkLoadingComplete();
    });

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        console.log("Firebase user authenticated anonymously:", firebaseUser.uid);
        setIsFirebaseAuthed(true);
      } else {
        setIsFirebaseAuthed(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubUsers) (unsubUsers as () => void)();
      if (unsubCustomers) (unsubCustomers as () => void)();
      if (unsubVehicles) (unsubVehicles as () => void)();
      if (unsubWO) (unsubWO as () => void)();
      if (unsubClaims) (unsubClaims as () => void)();
    };
  }, []);

  const hasTriggeredSummaryRef = useRef(false);

  useEffect(() => {
    if (!isLoading && isFirebaseAuthed && workOrders.length > 0 && users.length > 0 && !hasTriggeredSummaryRef.current) {
      hasTriggeredSummaryRef.current = true;
      import('../utils/scheduler').then(({ triggerDailySummary }) => {
        triggerDailySummary(workOrders, users)
          .then((res) => {
            if (res.success && res.isNew) {
              addNotificationRef.current(
                'Arsip Summary Harian Otomatis',
                `Aktivitas sistem dan status inventaris kritis tanggal ${res.data?.date} berhasil diarsipkan ke Firestore.`,
                'success'
              );
            }
          })
          .catch((err) => {
            console.error("Scheduler background execution error:", err);
          });
      });
    }
  }, [isLoading, isFirebaseAuthed, workOrders, users]);

  const triggerDailySummaryManual = async (dateStr?: string) => {
    const { triggerDailySummary } = await import('../utils/scheduler');
    const res = await triggerDailySummary(workOrders, users, dateStr);
    if (res.success && res.isNew) {
      addNotificationRef.current(
        'Summary Harian Berhasil',
        `Arsip manual aktivitas sistem dan inventaris kritis tanggal ${res.data?.date} berhasil disimpan.`,
        'success'
      );
    }
    return res;
  };

  const login = async (username: string, password?: string) => {
    if (!password) return 'Password required';
    const cleanUsername = username.toLowerCase();
    const user = users.find(u => u.username.toLowerCase() === cleanUsername);
    if (!user) return 'Invalid username or password';
    if (user.status !== 'ACTIVE') return 'Account is suspended';

    const hash = await hashPassword(password);

    // Support either with/without parentheses for kenji
    if (cleanUsername === 'kenji') {
      const cleanInputPassword = password.trim();
      const altPassword = cleanInputPassword.startsWith('(') && cleanInputPassword.endsWith(')')
        ? cleanInputPassword.slice(1, -1)
        : `(${cleanInputPassword})`;
      const altHash = await hashPassword(altPassword);
      
      if (
        user.password === cleanInputPassword || 
        user.password === hash || 
        user.password === altPassword || 
        user.password === altHash
      ) {
        const correctPassword = '(indoriau898!)';
        const correctHash = await hashPassword(correctPassword);
        const docRef = doc(db, 'users', user.id);
        await updateDoc(docRef, { password: correctHash }).catch(console.error);
        setCurrentUser({ ...user, password: correctHash });
        return null;
      }
    }

    if (user.password === password) {
      // Self-healing migration path: automatic upgrade to hashed password inside Firestore on-the-fly!
      const docRef = doc(db, 'users', user.id);
      await updateDoc(docRef, { password: hash }).catch(console.error);
      setCurrentUser({ ...user, password: hash });
      return null;
    } else if (user.password === hash) {
      setCurrentUser(user);
      return null;
    }

    return 'Invalid username or password';
  };

  const logout = () => setCurrentUser(null);

  const addUser = async (userData: Omit<User, 'id'>) => {
    const newId = Math.random().toString(36).substr(2, 9);
    const hashedPassword = await hashPassword(userData.password);
    const newUser: User = { 
      ...userData, 
      id: newId,
      username: userData.username.toLowerCase(),
      password: hashedPassword 
    };
    try {
      await setDoc(doc(db, 'users', newId), newUser);
    } catch (err: any) {
      console.error("Error in addUser:", err);
      throw new Error(`Failed to save user: ${err.message || err}`);
    }
  };

  const createSuperAdmin = async (userData: Omit<User, 'id'>) => {
    const newId = Math.random().toString(36).substr(2, 9);
    const hashedPassword = await hashPassword(userData.password);
    const newAdmin: User = {
      ...userData,
      id: newId,
      username: userData.username.toLowerCase(),
      password: hashedPassword
    };

    // Save super admin document
    try {
      await setDoc(doc(db, 'users', newId), newAdmin);
    } catch (err: any) {
      console.error("Error creating Super Admin:", err);
      throw new Error(`Failed to save Super Admin to database: ${err.message || err}`);
    }

    // Delete any default/demo users to clean up the DB
    const demoUsernames = ['admin', 'sa', 'lina', 'mechanic', 'commonrail', 'foreman', 'mech1', 'mech2'];
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      if (snapshot) {
        for (const d of snapshot.docs) {
          const u = d.data();
          if (demoUsernames.includes(u.username) && u.username !== userData.username.toLowerCase()) {
            await deleteDoc(doc(db, 'users', d.id)).catch(console.error);
          }
        }
      }
    } catch (err) {
      console.warn("Cleanup of demo users failed, proceeding:", err);
    }

    // Automatically log in
    setCurrentUser(newAdmin);
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    const updatedFields: Partial<User> = { ...updates };
    if (updates.username) {
      updatedFields.username = updates.username.toLowerCase();
    }
    if (updates.password) {
      updatedFields.password = await hashPassword(updates.password);
    }
    try {
      await updateDoc(doc(db, 'users', id), updatedFields);
    } catch (err: any) {
      console.error("Error in updateUser:", err);
      throw new Error(`Failed to update user: ${err.message || err}`);
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'users', id));
    } catch (err: any) {
      console.error("Error in deleteUser:", err);
      throw new Error(`Failed to delete user: ${err.message || err}`);
    }
  };

  const bypassLogin = (user: User) => {
    setCurrentUser(user);
  };

  const clearAllUsers = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      for (const d of snapshot.docs) {
        await deleteDoc(doc(db, 'users', d.id));
      }
      setUsers([]);
      setCurrentUser(null);
    } catch (err: any) {
      console.error("Error in clearAllUsers:", err);
      throw new Error(`Failed to clear database: ${err.message || err}`);
    }
  };

  const resetUserPassword = async (id: string, newPassword: string) => {
    const hashedPassword = await hashPassword(newPassword);
    try {
      await updateDoc(doc(db, 'users', id), { password: hashedPassword });
    } catch (err: any) {
      console.error("Error in resetUserPassword:", err);
      throw new Error(`Failed to reset password: ${err.message || err}`);
    }
  };

  const addCustomer = async (custData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => {
    const cleanPhone = custData.phone.trim();
    const id = `CUST-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const newCustomer: Customer = {
      ...custData,
      phone: cleanPhone,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'customers', id), newCustomer).catch(console.error);
    return newCustomer;
  };

  const updateCustomer = async (id: string, updates: Partial<Customer>) => {
    try {
      await updateDoc(doc(db, 'customers', id), {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (err: any) {
      console.error("Error in updateCustomer:", err);
      throw new Error(`Failed to update customer: ${err.message || err}`);
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'customers', id));
    } catch (err: any) {
      console.error("Error in deleteCustomer:", err);
      throw new Error(`Failed to delete customer: ${err.message || err}`);
    }
  };

  const addVehicle = async (vehData: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) => {
    const cleanPlate = vehData.plateNumber.toUpperCase().trim();
    const cleanVin = vehData.vin ? vehData.vin.toUpperCase().trim() : '';
    const id = `VEH-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const newVehicle: Vehicle = {
      ...vehData,
      plateNumber: cleanPlate,
      vin: cleanVin,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'vehicles', id), newVehicle).catch(console.error);
    return newVehicle;
  };

  const addWorkOrder = (woData: Omit<WorkOrder, 'id' | 'createdAt' | 'status' | 'partLogs'>) => {
    const id = `WO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    
    // Normalize and check existing customer/vehicle in background
    let resolvedCustId = '';
    let resolvedVehId = '';

    const cleanPhone = woData.customerPhone.trim();
    const cleanPlate = woData.plateNumber.toUpperCase().trim();
    const cleanVin = woData.vin ? woData.vin.toUpperCase().trim() : '';

    // Check if customer phone already exists
    const existingCust = customers.find(c => c.phone.trim() === cleanPhone);
    if (existingCust) {
      resolvedCustId = existingCust.id;
    } else {
      resolvedCustId = `CUST-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      const newCust: Customer = {
        id: resolvedCustId,
        name: woData.customerName,
        phone: cleanPhone,
        address: woData.customerAddress || '',
        email: woData.customerEmail,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: currentUser?.name || 'SA'
      };
      setDoc(doc(db, 'customers', resolvedCustId), newCust).catch(console.error);
    }

    // Check if vehicle plate already exists
    const existingVeh = vehicles.find(v => v.plateNumber.toUpperCase().trim() === cleanPlate);
    if (existingVeh) {
      resolvedVehId = existingVeh.id;
    } else {
      resolvedVehId = `VEH-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      const newVeh: Vehicle = {
        id: resolvedVehId,
        customerId: resolvedCustId,
        plateNumber: cleanPlate,
        vin: cleanVin,
        brand: woData.vehicleBrand,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setDoc(doc(db, 'vehicles', resolvedVehId), newVeh).catch(console.error);
    }

    const newWO: any = {
      ...woData,
      id,
      customerId: resolvedCustId,
      vehicleId: resolvedVehId,
      createdAt: serverTimestamp(), // Strict Server Timestamp control
      status: 'QUEUE',
      partLogs: [],
      currentDivision: woData.divisionFlow ? woData.divisionFlow[0] : 'SUPPLY_PUMP',
      createdBy: currentUser?.name || 'SA'
    };

    // Use transaction to ensure no ID collision and atomicity when multiple SAs input data
    runTransaction(db, async (transaction) => {
      const docRef = doc(db, 'workOrders', id);
      const docSnap = await transaction.get(docRef);
      if (docSnap.exists()) {
        // Highly rare collision: resolve safely inside transaction by generating a new ID
        const secondaryId = `WO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        const resolvedWO = { ...newWO, id: secondaryId };
        transaction.set(doc(db, 'workOrders', secondaryId), resolvedWO);
      } else {
        transaction.set(docRef, newWO);
      }
    }).catch(console.error);

    // Return an estimate object to prevent freezing the UI before the Firestore snapshot triggers
    return {
      ...newWO,
      createdAt: new Date().toISOString()
    } as WorkOrder;
  };

  const updateWOStatus = async (id: string, status: WOStatus, mechanicId?: string) => {
    try {
      const docRef = doc(db, 'workOrders', id);
      const currentData = workOrders.find(w => w.id === id);
      const isArchived = status === 'COMPLETED' ? true : (currentData?.isArchived || false);

      const updates: any = { status, isArchived };
      if (mechanicId !== undefined) {
        updates.mechanicId = mechanicId;
      }

      await updateDoc(docRef, updates);
    } catch (err) {
      console.error("Error updating WO status:", err);
    }
  };

  const updateWorkOrder = async (id: string, updates: Partial<WorkOrder>) => {
    try {
      const docRef = doc(db, 'workOrders', id);
      const currentData = workOrders.find(w => w.id === id);
      const status = updates.status !== undefined ? updates.status : (currentData?.status || 'QUEUE');
      const isArchived = updates.isArchived !== undefined 
        ? updates.isArchived 
        : (status === 'COMPLETED' ? true : (currentData?.isArchived || false));

      // Clean undefined values from updates to prevent Firestore validation failures
      const cleanUpdates: any = {};
      Object.keys(updates).forEach((key) => {
        const val = updates[key as keyof Partial<WorkOrder>];
        if (val !== undefined) {
          cleanUpdates[key] = val;
        }
      });

      await updateDoc(docRef, { ...cleanUpdates, isArchived });
    } catch (err) {
      console.error("Error updating work order:", err);
    }
  };

  const addPartLog = async (woId: string, logData: Omit<PartLog, 'id' | 'date'>) => {
    try {
      const docRef = doc(db, 'workOrders', woId);
      const currentData = workOrders.find(w => w.id === woId);
      const currentLogs = currentData?.partLogs || [];
      const newLog: PartLog = {
        ...logData,
        id: Math.random().toString(36).substr(2, 9),
        date: new Date().toISOString(),
      };

      await updateDoc(docRef, {
        partLogs: [...currentLogs, newLog]
      });
    } catch (err) {
      console.error("Error adding part log:", err);
    }
  };

  const addClaim = async (claimData: Omit<Claim, 'id' | 'createdAt'>) => {
    const id = `CLAIM-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const newClaim: Claim = {
      ...claimData,
      id,
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'claims', id), newClaim).catch(console.error);
    return newClaim;
  };

  const updateClaim = async (id: string, updates: Partial<Claim>) => {
    try {
      await updateDoc(doc(db, 'claims', id), updates);
    } catch (err: any) {
      console.error("Error in updateClaim:", err);
      throw new Error(`Failed to update claim: ${err.message || err}`);
    }
  };

  const deleteClaim = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'claims', id));
    } catch (err: any) {
      console.error("Error in deleteClaim:", err);
      throw new Error(`Failed to delete claim: ${err.message || err}`);
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser, login, logout, users, addUser, updateUser, deleteUser,
        customers, vehicles, addCustomer, updateCustomer, deleteCustomer, addVehicle,
        workOrders, addWorkOrder, updateWOStatus, updateWorkOrder, addPartLog,
        printWO, setPrintWO,
        notifications, toasts, clearNotifications, markAllAsRead, removeToast, addNotification,
        areToastsMuted, setAreToastsMuted,
        isLoading, createSuperAdmin, bypassLogin, clearAllUsers, resetUserPassword,
        triggerDailySummaryManual,
        claims, addClaim, updateClaim, deleteClaim,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};

