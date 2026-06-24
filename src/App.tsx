/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './store/AppContext';
import Login from './components/Login';
import SADashboard from './components/SADashboard';
import MechanicDashboard from './components/MechanicDashboard';
import ForemanDashboard from './components/ForemanDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import PrintTemplate from './components/PrintTemplate';
import ManagerAnalytics from './components/ManagerAnalytics';
import { LogOut, BarChart3, ClipboardList } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { currentUser, logout, printWO } = useApp();
  const [currentView, setCurrentView] = useState<'DEFAULT' | 'ANALYTICS'>('DEFAULT');

  if (!currentUser) {
    return <Login />;
  }

  const getDashboardTitle = () => {
    switch (currentUser.role) {
      case 'SA': return 'Intake Dashboard';
      case 'MECHANIC': return 'Production Queue';
      case 'FOREMAN': return 'Foreman Command';
      case 'ADMIN': return 'Admin Panel';
      default: return 'Dashboard';
    }
  };

  const getHeaderTitle = () => {
    if (currentView === 'ANALYTICS') {
      return 'Analitika Manajemen & Stok';
    }
    switch (currentUser.role) {
      case 'SA': return 'Vehicle Intake & Service Form';
      case 'MECHANIC': return 'Lab Diagnostics & Repair';
      case 'FOREMAN': return 'Foreman Overview';
      case 'ADMIN': return 'System Administration';
      default: return 'Dashboard';
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#f1f5f9] text-[#0f172a] font-sans overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-[#0f172a] text-white flex flex-col shrink-0 print:hidden">
        <div className="p-6 border-b border-slate-700">
          <div className="flex flex-col gap-4">
            <img src="/logo-indo-teknik.png" alt="IT INDO TEKNIK" className="h-8 object-contain self-start bg-white p-1 rounded" />
            <div className="flex flex-col">
              <img src="/logo-itech.png" alt="ITech" className="h-6 object-contain self-start bg-white p-1 rounded mb-1" />
              <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Authorized Dealer</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 py-4 px-3 space-y-2">
          <button
            onClick={() => setCurrentView('DEFAULT')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              currentView === 'DEFAULT' ? 'bg-[#1e3a8a] text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <ClipboardList className="w-4 h-4 text-blue-400" />
            {getDashboardTitle()}
          </button>

          {currentUser.role === 'ADMIN' && (
            <button
              onClick={() => setCurrentView('ANALYTICS')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentView === 'ANALYTICS' ? 'bg-[#1e3a8a] text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              Dasbor Analitik
            </button>
          )}
        </nav>

        <div className="p-4 mt-auto bg-slate-900 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold uppercase">
              {currentUser.name.slice(0, 2)}
            </div>
            <div className="text-xs flex-1 min-w-0">
              <p className="font-semibold truncate">{currentUser.name}</p>
              <p className="text-slate-400 truncate">{currentUser.role}</p>
            </div>
            <button
              onClick={logout}
              className="p-2 text-slate-400 hover:text-[#ef4444] rounded transition-colors flex-shrink-0"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 print:hidden">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wide">
              {getHeaderTitle()}
            </h2>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto relative">
          {currentView === 'ANALYTICS' && currentUser.role === 'ADMIN' ? (
            <ManagerAnalytics />
          ) : (
            <>
              {currentUser.role === 'SA' && <SADashboard />}
              {currentUser.role === 'MECHANIC' && <MechanicDashboard />}
              {currentUser.role === 'FOREMAN' && <ForemanDashboard />}
              {currentUser.role === 'ADMIN' && <div className="p-6 h-full"><AdminDashboard /></div>}
            </>
          )}
        </div>
        
        {/* Footer Status Bar */}
        <footer className="h-8 bg-white border-t border-slate-200 px-4 flex items-center justify-between shrink-0 print:hidden">
          <div className="flex gap-4 text-[10px] font-medium text-slate-500 uppercase tracking-tighter">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Database Connected</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Print Service Active</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> WA Gateway Ready</span>
          </div>
          <div className="text-[10px] text-slate-400">
            ITech Authorized Dealer • {new Date().getFullYear()}
          </div>
        </footer>
      </main>

      {/* Print Overlay */}
      {printWO && <PrintTemplate />}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
