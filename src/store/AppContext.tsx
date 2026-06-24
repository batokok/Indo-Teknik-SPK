import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, WorkOrder, WOStatus, PartLog } from '../types';

interface AppContextType {
  currentUser: User | null;
  login: (username: string, password?: string) => string | null;
  logout: () => void;
  users: User[];
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  workOrders: WorkOrder[];
  addWorkOrder: (wo: Omit<WorkOrder, 'id' | 'createdAt' | 'status' | 'partLogs'>) => void;
  updateWOStatus: (id: string, status: WOStatus, mechanicId?: string) => void;
  updateWorkOrder: (id: string, updates: Partial<WorkOrder>) => void;
  addPartLog: (woId: string, log: Omit<PartLog, 'id' | 'date'>) => void;
  printWO: WorkOrder | null;
  setPrintWO: (wo: WorkOrder | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEMO_USERS: User[] = [
  { id: '1', name: 'Super Admin', username: 'admin', password: 'password', role: 'ADMIN', status: 'ACTIVE' },
  { id: '2', name: 'Service Advisor', username: 'sa', password: 'password', role: 'SA', status: 'ACTIVE' },
  { id: '3', name: 'Mechanic 1', username: 'mechanic', password: 'password', role: 'MECHANIC', status: 'ACTIVE' },
  { id: '4', name: 'Foreman', username: 'foreman', password: 'password', role: 'FOREMAN', status: 'ACTIVE' },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(DEMO_USERS);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [printWO, setPrintWO] = useState<WorkOrder | null>(null);

  // Load from local storage on mount
  useEffect(() => {
    const savedUsers = localStorage.getItem('itech_erp_users');
    if (savedUsers) {
      try {
        setUsers(JSON.parse(savedUsers));
      } catch (e) {
        console.error('Failed to parse saved users', e);
      }
    }

    const saved = localStorage.getItem('itech_erp_work_orders') || localStorage.getItem('bosch_erp_work_orders');
    if (saved) {
      try {
        setWorkOrders(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved work orders', e);
      }
    }

    // Live lightweight state synchronization listener (Standard storage event + ultra-light polling)
    const syncState = () => {
      const savedWO = localStorage.getItem('itech_erp_work_orders');
      if (savedWO) {
        try {
          const parsed = JSON.parse(savedWO);
          setWorkOrders(prev => {
            if (JSON.stringify(prev) !== JSON.stringify(parsed)) {
              return parsed;
            }
            return prev;
          });
        } catch (e) {
          console.error('Failed to sync work orders', e);
        }
      }

      const savedU = localStorage.getItem('itech_erp_users');
      if (savedU) {
        try {
          const parsed = JSON.parse(savedU);
          setUsers(prev => {
            if (JSON.stringify(prev) !== JSON.stringify(parsed)) {
              return parsed;
            }
            return prev;
          });
        } catch (e) {
          console.error('Failed to sync users', e);
        }
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'itech_erp_work_orders' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setWorkOrders(prev => {
            if (JSON.stringify(prev) !== JSON.stringify(parsed)) {
              return parsed;
            }
            return prev;
          });
        } catch (err) {
          console.error('Failed to parse storage update', err);
        }
      }
      if (e.key === 'itech_erp_users' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setUsers(prev => {
            if (JSON.stringify(prev) !== JSON.stringify(parsed)) {
              return parsed;
            }
            return prev;
          });
        } catch (err) {
          console.error('Failed to parse storage update', err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(syncState, 2000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('itech_erp_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('itech_erp_work_orders', JSON.stringify(workOrders));
  }, [workOrders]);

  const login = (username: string, password?: string) => {
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) {
      return 'Invalid username or password';
    }
    if (user.status !== 'ACTIVE') {
      return 'Account is suspended';
    }
    setCurrentUser(user);
    return null;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const addUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = { ...userData, id: Math.random().toString(36).substr(2, 9) };
    setUsers(prev => [...prev, newUser]);
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const addWorkOrder = (woData: Omit<WorkOrder, 'id' | 'createdAt' | 'status' | 'partLogs'>) => {
    const newWO: WorkOrder = {
      ...woData,
      id: `WO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      status: 'QUEUE',
      partLogs: [],
    };
    setWorkOrders((prev) => [newWO, ...prev]);
    return newWO;
  };

  const updateWOStatus = (id: string, status: WOStatus, mechanicId?: string) => {
    setWorkOrders((prev) =>
      prev.map((wo) => {
        if (wo.id === id) {
          return { 
            ...wo, 
            status, 
            ...(mechanicId && { mechanicId }),
            isArchived: status === 'COMPLETED' ? true : wo.isArchived
          };
        }
        return wo;
      })
    );
  };

  const updateWorkOrder = (id: string, updates: Partial<WorkOrder>) => {
    setWorkOrders((prev) =>
      prev.map((wo) => {
        if (wo.id === id) {
          const status = updates.status !== undefined ? updates.status : wo.status;
          const isArchived = updates.isArchived !== undefined 
            ? updates.isArchived 
            : (status === 'COMPLETED' ? true : wo.isArchived);
          return { 
            ...wo, 
            ...updates,
            isArchived
          };
        }
        return wo;
      })
    );
  };

  const addPartLog = (woId: string, logData: Omit<PartLog, 'id' | 'date'>) => {
    const newLog: PartLog = {
      ...logData,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
    };
    setWorkOrders((prev) =>
      prev.map((wo) => {
        if (wo.id === woId) {
          return { ...wo, partLogs: [...wo.partLogs, newLog] };
        }
        return wo;
      })
    );
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        login,
        logout,
        users,
        addUser,
        updateUser,
        deleteUser,
        workOrders,
        addWorkOrder,
        updateWOStatus,
        updateWorkOrder,
        addPartLog,
        printWO,
        setPrintWO,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
