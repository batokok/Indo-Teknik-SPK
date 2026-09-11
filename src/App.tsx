/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './store/AppContext';
import Login from './components/Login';
import SuperAdminSetup from './components/SuperAdminSetup';
import SADashboard from './components/SADashboard';
import MechanicDashboard from './components/MechanicDashboard';
import ForemanDashboard from './components/ForemanDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import PrintTemplate from './components/PrintTemplate';
import ManagerAnalytics from './components/ManagerAnalytics';
import FirebaseDiagnostics from './components/FirebaseDiagnostics';
import { SmartLogo } from './components/SmartLogo';
import { SADashboardArchiveAndHistory } from './components/SADashboardArchiveAndHistory';
import { CustomerManagement } from './components/CustomerManagement';
import PublicTrackingView from './components/PublicTrackingView';
import ClaimManagement from './components/ClaimManagement';
import { InternalMessaging } from './components/InternalMessaging';
import { GateControlDashboard } from './components/gate-control/GateControlDashboard';
import { PrintGateDocument } from './components/gate-control/PrintGateDocument';
import { LogOut, BarChart3, ClipboardList, Bell, X, Menu, Archive, Users, RefreshCw, HelpCircle, ShieldAlert, ChevronDown, ChevronRight, Briefcase, Wrench, Calendar, Clock, ArrowDownLeft, ShieldCheck } from 'lucide-react';
import { RoleOnboardingTutorial } from './components/RoleOnboardingTutorial';
import { motion } from 'motion/react';
import { LocationGuard } from './components/LocationGuard';

const MainLayout: React.FC = () => {
  const { 
    currentUser, 
    logout, 
    printWO, 
    printGateDoc,
    notifications, 
    clearNotifications, 
    markAllAsRead, 
    users,
    workOrders,
    updateWorkOrder,
    setPrintWO,
    isLoading,
    addNotification,
    updateUser
  } = useApp();
  const [currentView, setCurrentView] = useState<'DEFAULT' | 'ANALYTICS' | 'ARCHIVE_HISTORY' | 'CUSTOMERS' | 'CLAIMS' | 'GATE_CONTROL' | 'SA_INTAKE'>('DEFAULT');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRefreshingFeed, setIsRefreshingFeed] = useState(false);
  const [isManagementOpen, setIsManagementOpen] = useState(true);
  const [isLabOpsOpen, setIsLabOpsOpen] = useState(true);

  const [isTrackingView, setIsTrackingView] = useState(false);
  const [trackingWOId, setTrackingWOId] = useState('');
  const [showLoginScreen, setShowLoginScreen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const trackId = params.get('tracking') || params.get('woId');
    if (trackId) {
      setTrackingWOId(trackId);
      setIsTrackingView(true);
    }
  }, []);

  const refreshWorkshopFeed = () => {
    if (isRefreshingFeed) return;
    setIsRefreshingFeed(true);
    // Simulate premium micro-refresh
    setTimeout(() => {
      setIsRefreshingFeed(false);
      const activeCount = workOrders ? workOrders.filter(w => w.status !== 'COMPLETED' && w.status !== 'CANCELLED').length : 0;
      addNotification(
        'Sirkuit Live Sinkron',
        `Berhasil memvalidasi status terbaru dengan server cloud. Terdeteksi ${activeCount} pengerjaan aktif.`,
        'success'
      );
    }, 850);
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full bg-[#0f172a] flex items-center justify-center font-sans text-white">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white mx-auto"></div>
          <p className="text-sm text-slate-400">Loading Indo Teknik - ITech Authorized Dealer ERP...</p>
        </div>
      </div>
    );
  }

  if (isTrackingView) {
    return (
      <PublicTrackingView 
        initialWoId={trackingWOId} 
        onBackToLogin={() => {
          const url = new URL(window.location.href);
          url.searchParams.delete('tracking');
          url.searchParams.delete('woId');
          window.history.pushState({}, '', url.toString());
          setIsTrackingView(false);
          setTrackingWOId('');
          if (!currentUser) {
            setShowLoginScreen(true);
          }
        }} 
      />
    );
  }

  if (!currentUser) {
    const hasAdmin = users.some(u => u.role === 'ADMIN');
    if (!hasAdmin) {
      return <SuperAdminSetup />;
    }
    if (showLoginScreen) {
      return <Login onTrackClick={() => setShowLoginScreen(false)} />;
    }
    return (
      <PublicTrackingView 
        initialWoId="" 
        onBackToLogin={() => {
          setShowLoginScreen(true);
        }} 
      />
    );
  }

  const getDashboardTitle = () => {
    switch (currentUser.role) {
      case 'BASIC': return 'Gate & Pos Logistik';
      case 'SA': return 'Intake Dashboard';
      case 'MECHANIC': return 'Produksi (Fuel Pump)';
      case 'COMMON_RAIL': return 'Produksi (Common Rail)';
      case 'FOREMAN': return 'Foreman Fuel Pump Command';
      case 'ADMIN': return 'Admin Panel';
      default: return 'Dashboard';
    }
  };

  const getHeaderTitle = () => {
    if (currentUser.role === 'BASIC' || currentView === 'GATE_CONTROL') {
      return 'Terminal Gate Control & Logistik Workshop';
    }
    if (currentView === 'SA_INTAKE') {
      return 'Vehicle Intake & Pembuatan SPK (Admin Mode)';
    }
    if (currentView === 'CLAIMS') {
      return 'Sistem Manajemen Klaim & Garansi';
    }
    if (currentView === 'ANALYTICS') {
      return 'Analitika Manajemen & Stok';
    }
    if (currentView === 'CUSTOMERS') {
      return 'Manajemen Konsumen & Database Kendaraan';
    }
    if (currentView === 'ARCHIVE_HISTORY') {
      return 'Arsip & Buku Servis Kendaraan';
    }
    switch (currentUser.role) {
      case 'BASIC': return 'Gate Control & Logistik Pos Satpam';
      case 'SA': return 'Vehicle Intake & Service Form';
      case 'MECHANIC': return 'Lab Diagnostics & Repair - Fuel Pump';
      case 'COMMON_RAIL': return 'Lab Diagnostics & Repair - Common Rail';
      case 'FOREMAN': return 'Foreman Fuel Pump Overview';
      case 'ADMIN': return 'System Administration & Management';
      default: return 'Dashboard';
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 11) return 'Selamat Pagi';
    if (hour >= 11 && hour < 15) return 'Selamat Siang';
    if (hour >= 15 && hour < 18.5) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  const getGreetingName = (user: any) => {
    if (!user) return '';
    const name = user.name || '';
    const username = user.username || '';
    
    const lowerName = name.toLowerCase();
    const isGeneric = 
      lowerName.includes('admin') || 
      lowerName.includes('advisor') || 
      lowerName.includes('mechanic') || 
      lowerName.includes('foreman') || 
      lowerName.includes('common rail') || 
      lowerName.includes('service') ||
      lowerName.includes('sa');
      
    if (isGeneric && username) {
      if (username === 'sa') return 'Advisor';
      if (username === 'commonrail') return 'Common Rail';
      return username.charAt(0).toUpperCase() + username.slice(1);
    }
    
    return name;
  };

  return (
    <LocationGuard currentUser={currentUser} logout={logout}>
      <div className="flex h-screen w-full bg-[#f8fafc] text-slate-800 font-sans overflow-hidden print:h-auto print:overflow-visible print:block selection:bg-blue-600 selection:text-white">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 md:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-[#0A1120] border-r border-slate-800/80 text-white flex flex-col shrink-0 print:hidden z-50 transform md:transform-none md:static md:flex transition-transform duration-300 ease-in-out shadow-2xl ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="p-4 border-b border-slate-800/80 flex flex-col gap-3 shrink-0 bg-gradient-to-b from-slate-900/60 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <h1 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <span className="text-blue-400">INDO</span>
                <span className="text-[#EF4444]">TEKNIK</span>
              </h1>
              <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 py-1.5 px-3 rounded-lg mt-1.5 self-start shadow-inner">
                <SmartLogo baseName="logo-itech" alt="ITech" className="h-6 sm:h-7 object-contain bg-white px-2 py-0.5 rounded shadow-xs" />
                <span className="text-[10px] font-black text-slate-200 uppercase tracking-widest whitespace-nowrap">Authorized Dealer</span>
              </div>
            </div>
            {/* Close Button on mobile */}
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 md:hidden flex items-center justify-center min-h-[44px] min-w-[44px] cursor-pointer"
              title="Close Sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Premium Welcome Card aligned with Indo Teknik red/blue branding */}
          <div id="user-profile" className="bg-gradient-to-r from-blue-950/40 via-slate-900/60 to-slate-900/30 border border-blue-900/40 border-l-4 border-l-[#EF4444] p-3 rounded-xl flex flex-col gap-0.5 shadow-md">
            <span className="text-xs font-bold text-slate-100 leading-tight">
              {getGreeting()}, <span className="text-blue-300 font-black">{getGreetingName(currentUser)}</span>!
            </span>
            <span className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              {currentUser.role === 'ADMIN' ? 'Super Admin' :
               currentUser.role === 'FOREMAN' ? 'Foreman Fuel Pump' :
               currentUser.role === 'SA' ? 'Service Advisor' :
               currentUser.role === 'BASIC' ? 'Pos Satpam & Logistik' :
               currentUser.role === 'MECHANIC' ? 'Mekanik Fuel Pump' :
               currentUser.role === 'COMMON_RAIL' ? 'Mekanik Common Rail' : currentUser.role}
            </span>
          </div>
        </div>
        
        <nav id="sidebar-navigation" className="shrink-0 py-3 px-3 space-y-4 overflow-y-auto custom-scrollbar">
          {/* GROUP 1: OPERASIONAL LAB & BENGKEL */}
          <div className="space-y-1">
            <button
              onClick={() => setIsLabOpsOpen(!isLabOpsOpen)}
              className="w-full flex items-center justify-between px-3 py-2 text-[10px] font-black text-slate-400 hover:text-white uppercase tracking-wider hover:bg-slate-800/50 rounded-lg transition-colors cursor-pointer min-h-[40px]"
            >
              <span className="flex items-center gap-2">
                <Wrench className="w-3.5 h-3.5 text-[#EF4444]" />
                Operasional Lab & Bengkel
              </span>
              {isLabOpsOpen ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              )}
            </button>

            {isLabOpsOpen && (
              <div className="space-y-1 pl-1">
                {/* Gate Control & Logistik Workshop (Available for ALL roles: BASIC, SA, FOREMAN, MECHANIC, ADMIN) */}
                <motion.button
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ scale: 1.01, x: 2 }}
                  whileTap={{ scale: 0.99 }}
                  transition={{ duration: 0.15 }}
                  onClick={() => { setCurrentView('GATE_CONTROL'); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition-all duration-150 cursor-pointer border-l-4 ${
                    currentView === 'GATE_CONTROL' 
                      ? 'bg-blue-600/20 text-blue-200 border-l-[#EF4444] border-t border-r border-b border-blue-500/30 font-bold shadow-md' 
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border-l-transparent font-medium'
                  }`}
                >
                  <ShieldCheck className={`w-4 h-4 transition-colors flex-shrink-0 ${currentView === 'GATE_CONTROL' ? 'text-emerald-400' : 'text-slate-400'}`} />
                  Gate Control & Logistik
                </motion.button>

                {currentUser.role === 'BASIC' ? null : currentUser.role === 'ADMIN' ? (
                  <>
                    <motion.button
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      whileHover={{ scale: 1.01, x: 2 }}
                      whileTap={{ scale: 0.99 }}
                      transition={{ duration: 0.15 }}
                      onClick={() => { setCurrentView('SA_INTAKE'); setIsSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition-all duration-150 cursor-pointer border-l-4 ${
                        currentView === 'SA_INTAKE' 
                          ? 'bg-blue-600/20 text-blue-200 border-l-[#EF4444] border-t border-r border-b border-blue-500/30 font-bold shadow-md' 
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border-l-transparent font-medium'
                      }`}
                    >
                      <ClipboardList className={`w-4 h-4 transition-colors flex-shrink-0 ${currentView === 'SA_INTAKE' ? 'text-blue-400' : 'text-slate-400'}`} />
                      Intake & Buat SPK
                    </motion.button>

                    <motion.button
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      whileHover={{ scale: 1.01, x: 2 }}
                      whileTap={{ scale: 0.99 }}
                      transition={{ duration: 0.15, delay: 0.02 }}
                      onClick={() => { setCurrentView('ARCHIVE_HISTORY'); setIsSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition-all duration-150 cursor-pointer border-l-4 ${
                        currentView === 'ARCHIVE_HISTORY' 
                          ? 'bg-blue-600/20 text-blue-200 border-l-[#EF4444] border-t border-r border-b border-blue-500/30 font-bold shadow-md' 
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border-l-transparent font-medium'
                      }`}
                    >
                      <Archive className={`w-4 h-4 transition-colors flex-shrink-0 ${currentView === 'ARCHIVE_HISTORY' ? 'text-blue-400' : 'text-slate-400'}`} />
                      Buku Servis & Arsip
                    </motion.button>

                    <motion.button
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      whileHover={{ scale: 1.01, x: 2 }}
                      whileTap={{ scale: 0.99 }}
                      transition={{ duration: 0.15, delay: 0.04 }}
                      onClick={() => { setCurrentView('CLAIMS'); setIsSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition-all duration-150 cursor-pointer border-l-4 ${
                        currentView === 'CLAIMS' 
                          ? 'bg-red-600/20 text-red-200 border-l-[#EF4444] border-t border-r border-b border-red-500/30 font-bold shadow-md' 
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border-l-transparent font-medium'
                      }`}
                    >
                      <ShieldAlert className={`w-4 h-4 transition-colors flex-shrink-0 ${currentView === 'CLAIMS' ? 'text-red-400' : 'text-slate-400'}`} />
                      Klaim & Garansi
                    </motion.button>
                  </>
                ) : (
                  <>
                    <motion.button
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      whileHover={{ scale: 1.01, x: 2 }}
                      whileTap={{ scale: 0.99 }}
                      transition={{ duration: 0.15 }}
                      onClick={() => { setCurrentView('DEFAULT'); setIsSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition-all duration-150 cursor-pointer border-l-4 ${
                        currentView === 'DEFAULT' 
                          ? 'bg-blue-600/20 text-blue-200 border-l-[#EF4444] border-t border-r border-b border-blue-500/30 font-bold shadow-md' 
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border-l-transparent font-medium'
                      }`}
                    >
                      <ClipboardList className={`w-4 h-4 transition-colors flex-shrink-0 ${currentView === 'DEFAULT' ? 'text-blue-400' : 'text-slate-400'}`} />
                      {getDashboardTitle()}
                    </motion.button>

                    <motion.button
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      whileHover={{ scale: 1.01, x: 2 }}
                      whileTap={{ scale: 0.99 }}
                      transition={{ duration: 0.15, delay: 0.03 }}
                      onClick={() => { setCurrentView('ARCHIVE_HISTORY'); setIsSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition-all duration-150 cursor-pointer border-l-4 ${
                        currentView === 'ARCHIVE_HISTORY' 
                          ? 'bg-blue-600/20 text-blue-200 border-l-[#EF4444] border-t border-r border-b border-blue-500/30 font-bold shadow-md' 
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border-l-transparent font-medium'
                      }`}
                    >
                      <Archive className={`w-4 h-4 transition-colors flex-shrink-0 ${currentView === 'ARCHIVE_HISTORY' ? 'text-blue-400' : 'text-slate-400'}`} />
                      Buku Servis & Arsip
                    </motion.button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* GROUP 2: ADMINISTRASI & MANAJEMEN (Hidden for BASIC role) */}
          {currentUser.role !== 'BASIC' && (
            <div className="space-y-1">
              <button
                onClick={() => setIsManagementOpen(!isManagementOpen)}
                className="w-full flex items-center justify-between px-3 py-2 text-[10px] font-black text-slate-400 hover:text-white uppercase tracking-wider hover:bg-slate-800/50 rounded-lg transition-colors cursor-pointer min-h-[40px]"
              >
                <span className="flex items-center gap-2">
                  <Briefcase className="w-3.5 h-3.5 text-blue-400" />
                  Administrasi & Manajemen
                </span>
                {isManagementOpen ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                )}
              </button>

              {isManagementOpen && (
                <div className="space-y-1 pl-1">
                  {currentUser.role === 'ADMIN' ? (
                    <>
                      <motion.button
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        whileHover={{ scale: 1.01, x: 2 }}
                        whileTap={{ scale: 0.99 }}
                        transition={{ duration: 0.15 }}
                        onClick={() => { setCurrentView('DEFAULT'); setIsSidebarOpen(false); }}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition-all duration-150 cursor-pointer border-l-4 ${
                          currentView === 'DEFAULT' 
                            ? 'bg-blue-600/20 text-blue-200 border-l-[#EF4444] border-t border-r border-b border-blue-500/30 font-bold shadow-md' 
                            : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border-l-transparent font-medium'
                        }`}
                      >
                        <Users className={`w-4 h-4 transition-colors flex-shrink-0 ${currentView === 'DEFAULT' ? 'text-blue-400' : 'text-slate-400'}`} />
                        Kelola Pengguna
                      </motion.button>

                      <motion.button
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        whileHover={{ scale: 1.01, x: 2 }}
                        whileTap={{ scale: 0.99 }}
                        transition={{ duration: 0.15, delay: 0.03 }}
                        onClick={() => { setCurrentView('CUSTOMERS'); setIsSidebarOpen(false); }}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition-all duration-150 cursor-pointer border-l-4 ${
                          currentView === 'CUSTOMERS' 
                            ? 'bg-blue-600/20 text-blue-200 border-l-[#EF4444] border-t border-r border-b border-blue-500/30 font-bold shadow-md' 
                            : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border-l-transparent font-medium'
                        }`}
                      >
                        <Users className={`w-4 h-4 transition-colors flex-shrink-0 ${currentView === 'CUSTOMERS' ? 'text-blue-400' : 'text-slate-400'}`} />
                        Kelola Konsumen
                      </motion.button>

                      <motion.button
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        whileHover={{ scale: 1.01, x: 2 }}
                        whileTap={{ scale: 0.99 }}
                        transition={{ duration: 0.15, delay: 0.06 }}
                        onClick={() => { setCurrentView('ANALYTICS'); setIsSidebarOpen(false); }}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition-all duration-150 cursor-pointer border-l-4 ${
                          currentView === 'ANALYTICS' 
                            ? 'bg-blue-600/20 text-blue-200 border-l-[#EF4444] border-t border-r border-b border-blue-500/30 font-bold shadow-md' 
                            : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border-l-transparent font-medium'
                        }`}
                      >
                        <BarChart3 className={`w-4 h-4 transition-colors flex-shrink-0 ${currentView === 'ANALYTICS' ? 'text-blue-400' : 'text-slate-400'}`} />
                        Analitik & KPI
                      </motion.button>
                    </>
                  ) : (
                    <>
                      <motion.button
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        whileHover={{ scale: 1.01, x: 2 }}
                        whileTap={{ scale: 0.99 }}
                        transition={{ duration: 0.15 }}
                        onClick={() => { setCurrentView('CLAIMS'); setIsSidebarOpen(false); }}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition-all duration-150 cursor-pointer border-l-4 ${
                          currentView === 'CLAIMS' 
                            ? 'bg-red-600/20 text-red-200 border-l-[#EF4444] border-t border-r border-b border-red-500/30 font-bold shadow-md' 
                            : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border-l-transparent font-medium'
                        }`}
                      >
                        <ShieldAlert className={`w-4 h-4 transition-colors flex-shrink-0 ${currentView === 'CLAIMS' ? 'text-red-400' : 'text-slate-400'}`} />
                        Klaim & Garansi
                      </motion.button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </nav>
        
        {currentUser && (
          /* Workshop Feed section inside Sidebar */
          <div className="px-3 mt-2 flex-1 flex flex-col min-h-0 border-t border-slate-800/80 pt-3 overflow-hidden">
            <div className="flex items-center justify-between px-2 mb-1.5 shrink-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10.5px] font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                  Workshop Feed
                </span>
                <span className="text-[8.5px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-400/90" title="Feed di-clear otomatis setiap pergantian hari">
                  Hari Ini
                </span>
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="bg-amber-400 text-slate-950 font-black text-[9px] px-1.5 py-0.2 rounded-full">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={refreshWorkshopFeed}
                  className="p-1 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
                  title="Sinkronisasi Live Feed"
                >
                  <RefreshCw className={`w-3 h-3 ${isRefreshingFeed ? 'animate-spin text-blue-400' : ''}`} />
                </button>
                {notifications.length > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[10px] text-slate-400 hover:text-blue-300 underline transition-colors cursor-pointer"
                  >
                    Read All
                  </button>
                )}
              </div>
            </div>

            <div className={`flex-1 overflow-y-auto space-y-2 pr-1 select-none custom-scrollbar transition-opacity duration-300 ${isRefreshingFeed ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
              {notifications.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs italic">
                  Menunggu aktivitas bengkel terbaru...
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-2.5 rounded-xl border text-xs transition-colors ${
                      notif.read 
                        ? 'bg-slate-900/30 border-slate-800/60 text-slate-400' 
                        : 'bg-slate-900/90 border-slate-800 text-slate-200 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1.5">
                      <span className={`font-black tracking-wide text-[11px] ${
                        notif.type === 'success' ? 'text-emerald-400' :
                        notif.type === 'warning' ? 'text-amber-400' :
                        notif.type === 'error' ? 'text-red-400' : 'text-blue-400'
                      }`}>
                        {notif.title}
                      </span>
                      <span className="text-[9px] text-slate-500 font-mono shrink-0">{notif.timestamp}</span>
                    </div>
                    <p className="mt-0.5 leading-relaxed text-[11px] break-words text-slate-300">{notif.message}</p>
                  </div>
                ))
              )}
            </div>
            
            {notifications.length > 0 && (
              <button
                onClick={clearNotifications}
                className="w-full mt-2 text-center text-[10px] text-slate-400 hover:text-red-400 py-1 transition-colors hover:bg-slate-900/50 rounded-lg shrink-0 border-t border-slate-800/50 cursor-pointer"
              >
                Bersihkan Histori Feed
              </button>
            )}
          </div>
        )}

        <div className="p-3 mt-auto bg-slate-950/80 border-t border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center text-xs font-black uppercase text-white shadow-md shadow-blue-900/20">
              {currentUser.name.slice(0, 2)}
            </div>
            <div className="text-xs flex-1 min-w-0">
              <p className="font-bold truncate text-slate-100">{currentUser.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{currentUser.role}</p>
            </div>
            <button
              onClick={async () => {
                if (currentUser) {
                  try {
                    await updateUser(currentUser.id, { hasSeenTutorial: false });
                    addNotification(
                      'Panduan Sistem Aktif',
                      'Menampilkan kembali panduan langkah-demi-langkah interaktif.',
                      'info'
                    );
                  } catch (e) {
                    console.error(e);
                  }
                }
              }}
              className="p-1.5 text-slate-400 hover:text-blue-400 rounded-lg transition-colors flex-shrink-0 cursor-pointer"
              title="Panduan Sistem"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
            <button
              onClick={logout}
              className="p-1.5 text-slate-400 hover:text-[#EF4444] rounded-lg transition-colors flex-shrink-0 cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main className="flex-1 flex flex-col min-w-0 print:hidden bg-[#f8fafc]">
        {/* Header */}
        <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-3 sm:px-4 md:px-8 shrink-0 print:hidden shadow-xs">
          <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
            {/* Mobile Hamburger menu */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-1 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 md:hidden transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
              title="Buka Navigasi"
              aria-label="Buka Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex flex-col min-w-0">
              <span className="text-[8.5px] sm:text-[9.5px] font-black text-blue-600 tracking-wider sm:tracking-widest uppercase flex items-center gap-1 sm:gap-1.5 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"></span>
                <span className="truncate">Indo Teknik • ITech Dealer</span>
              </span>
              <h2 className="text-xs sm:text-sm md:text-lg font-black text-slate-900 tracking-tight leading-none mt-0.5 sm:mt-1 truncate">
                {getHeaderTitle()}
              </h2>
            </div>
          </div>

          {/* Right Header Widgets */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Mobile Cloud Sync Pulse for ultra-compact display */}
            <div className="flex sm:hidden items-center justify-center p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700" title="Cloud Synced">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
            </div>

            {/* Shift & Operational Status */}
            <div className="hidden md:flex items-center gap-2 bg-blue-50/80 border border-blue-200/80 px-3 py-1.5 rounded-xl text-blue-900 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              <span className="text-[10px] font-black tracking-wider uppercase">Shift Workshop Aktif</span>
            </div>

            {/* Live Sync Status Pill */}
            <div className="hidden sm:flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-emerald-800 shadow-2xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              <span className="text-[10px] font-black tracking-wider uppercase">Cloud Synced</span>
            </div>

            {/* Date & Time Pill */}
            <div className="hidden lg:flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-slate-800 shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-[11px] font-bold font-mono">
                {new Date().toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto relative bg-[#f8fafc] pb-24 md:pb-6 custom-scrollbar">
          {/* Brand Announcement / Welcome Banner */}
          <div className="mx-2.5 sm:mx-4 md:mx-6 mt-3 sm:mt-4 md:mt-5 p-3 sm:p-3.5 bg-white border border-slate-200 rounded-xl sm:rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 shadow-xs print:hidden">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="p-2 sm:p-2.5 bg-blue-50 border border-blue-200 text-blue-600 rounded-xl shrink-0">
                <Wrench className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
              </div>
              <div className="min-w-0">
                <h4 className="text-[11px] sm:text-xs font-black text-slate-900 uppercase tracking-wider truncate">INDO TEKNIK PEKANBARU</h4>
                <p className="text-[9.5px] sm:text-[10px] text-slate-500 font-medium truncate">Authorized Diesel Specialist • ITech Partner</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl border border-slate-200 self-start sm:self-auto shadow-2xs shrink-0">
              <SmartLogo baseName="logo-itech" alt="ITech" className="h-5 sm:h-7 object-contain bg-white px-1.5 sm:px-2 py-0.5 rounded shadow-2xs border border-slate-200" />
              <span className="text-[9.5px] sm:text-[10.5px] font-black text-[#EF4444] tracking-wider sm:tracking-widest uppercase whitespace-nowrap">ITech Authorized</span>
            </div>
          </div>

          {currentUser.role === 'BASIC' || currentView === 'GATE_CONTROL' ? (
            <div className="p-4 md:p-6">
              <GateControlDashboard />
            </div>
          ) : currentView === 'SA_INTAKE' && currentUser.role === 'ADMIN' ? (
            <SADashboard />
          ) : currentView === 'ANALYTICS' && currentUser.role === 'ADMIN' ? (
            <div className="p-6">
              <ManagerAnalytics />
            </div>
          ) : currentView === 'CUSTOMERS' && currentUser.role === 'ADMIN' ? (
            <div className="p-6">
              <CustomerManagement />
            </div>
          ) : currentView === 'ARCHIVE_HISTORY' ? (
            <div className="p-6">
              <SADashboardArchiveAndHistory
                workOrders={workOrders}
                users={users}
                updateWorkOrder={updateWorkOrder}
                setPrintWO={setPrintWO}
              />
            </div>
          ) : currentView === 'CLAIMS' ? (
            <div className="p-6">
              <ClaimManagement />
            </div>
          ) : (
            <>
              {currentUser.role === 'SA' && <SADashboard />}
              {(currentUser.role === 'MECHANIC' || currentUser.role === 'COMMON_RAIL') && <MechanicDashboard />}
              {currentUser.role === 'FOREMAN' && <ForemanDashboard />}
              {currentUser.role === 'ADMIN' && <div className="p-6 h-full"><AdminDashboard /></div>}
            </>
          )}
        </div>
        
        {/* Footer Status Bar */}
        <footer className="min-h-8 md:h-8 bg-white border-t border-slate-200 px-4 flex flex-col md:flex-row items-center justify-between gap-y-1.5 py-1.5 md:py-0 shrink-0 print:hidden select-none text-slate-600">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-5 gap-y-1">
            <span className="flex items-center gap-1.5 text-[9px] font-bold text-slate-700 uppercase tracking-wider">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              Database Connected
            </span>
            <span className="flex items-center gap-1.5 text-[9px] font-bold text-slate-700 uppercase tracking-wider">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              Print Service Active
            </span>
            <span className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              WA Gateway Offline
            </span>
          </div>
          <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500 font-mono text-center md:text-right">
            ITech Authorized Dealer • {new Date().getFullYear()}
          </div>
        </footer>
      </main>

      {/* Floating Mobile Bottom Dock */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md bg-[#0A1120]/95 backdrop-blur-md border border-slate-800 rounded-2xl shadow-2xl z-40 md:hidden flex items-center justify-around p-1.5 text-slate-300 print:hidden">
        {/* Home/Dashboard Tab */}
        <button
          onClick={() => { setCurrentView(currentUser.role === 'BASIC' ? 'GATE_CONTROL' : 'DEFAULT'); setIsSidebarOpen(false); }}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all cursor-pointer ${
            (currentUser.role === 'BASIC' ? currentView === 'GATE_CONTROL' : currentView === 'DEFAULT') ? 'text-blue-400 bg-blue-500/20 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          {currentUser.role === 'BASIC' ? <ShieldCheck className="w-5 h-5" /> : <ClipboardList className="w-5 h-5" />}
          <span className="text-[9px] mt-1 tracking-tight">{currentUser.role === 'BASIC' ? 'Gate Control' : 'Terminal'}</span>
        </button>

        {/* Archive/History Tab (Hidden for BASIC) */}
        {currentUser.role !== 'BASIC' && (
          <button
            onClick={() => { setCurrentView('ARCHIVE_HISTORY'); setIsSidebarOpen(false); }}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all cursor-pointer ${
              currentView === 'ARCHIVE_HISTORY' ? 'text-blue-400 bg-blue-500/20 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Archive className="w-5 h-5" />
            <span className="text-[9px] mt-1 tracking-tight">Arsip</span>
          </button>
        )}

        {/* Claim Tab (SA or ADMIN only) */}
        {(currentUser.role === 'ADMIN' || currentUser.role === 'SA') && (
          <button
            onClick={() => { setCurrentView('CLAIMS'); setIsSidebarOpen(false); }}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all cursor-pointer ${
              currentView === 'CLAIMS' ? 'text-red-400 bg-red-500/20 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-5 h-5" />
            <span className="text-[9px] mt-1 tracking-tight">Klaim</span>
          </button>
        )}

        {/* Customers Tab (ADMIN only) */}
        {currentUser.role === 'ADMIN' && (
          <button
            onClick={() => { setCurrentView('CUSTOMERS'); setIsSidebarOpen(false); }}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all cursor-pointer ${
              currentView === 'CUSTOMERS' ? 'text-blue-400 bg-blue-500/20 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[9px] mt-1 tracking-tight">Konsumen</span>
          </button>
        )}

        {/* Toggle Sidebar Tab */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all cursor-pointer ${
            isSidebarOpen ? 'text-red-400 bg-red-500/20 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Menu className="w-5 h-5" />
          <span className="text-[9px] mt-1 tracking-tight">Menu</span>
        </button>
      </div>

      {/* Print Overlays */}
      {printWO && <PrintTemplate />}
      {printGateDoc && <PrintGateDocument />}

      {/* Role-Specific Onboarding Tutorial Overlay */}
      <RoleOnboardingTutorial />

      {/* Global Real-Time Internal Workshop Messaging System */}
      <InternalMessaging />
      </div>
    </LocationGuard>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
