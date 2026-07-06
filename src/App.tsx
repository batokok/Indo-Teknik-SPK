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
import { LogOut, BarChart3, ClipboardList, Bell, BellOff, X, Menu, Archive, Users, RefreshCw, HelpCircle, ShieldAlert, ChevronDown, ChevronRight, Briefcase, Wrench, Calendar, Clock } from 'lucide-react';
import { RoleOnboardingTutorial } from './components/RoleOnboardingTutorial';
import { motion } from 'motion/react';
import { LocationGuard } from './components/LocationGuard';

const MainLayout: React.FC = () => {
  const { 
    currentUser, 
    logout, 
    printWO, 
    notifications, 
    toasts, 
    clearNotifications, 
    markAllAsRead, 
    removeToast,
    users,
    workOrders,
    updateWorkOrder,
    setPrintWO,
    isLoading,
    addNotification,
    updateUser,
    areToastsMuted,
    setAreToastsMuted
  } = useApp();
  const [currentView, setCurrentView] = useState<'DEFAULT' | 'ANALYTICS' | 'ARCHIVE_HISTORY' | 'CUSTOMERS' | 'CLAIMS'>('DEFAULT');
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
          <p className="text-sm text-slate-400">Loading Indo Teknik ERP...</p>
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
      case 'SA': return 'Intake Dashboard';
      case 'MECHANIC': return 'Produksi (Fuel Pump)';
      case 'COMMON_RAIL': return 'Produksi (Common Rail)';
      case 'FOREMAN': return 'Foreman Fuel Pump Command';
      case 'ADMIN': return 'Admin Panel';
      default: return 'Dashboard';
    }
  };

  const getHeaderTitle = () => {
    if (currentView === 'CLAIMS') {
      return 'Sistem Manajemen Klaim & Garansi';
    }
    if (currentView === 'ANALYTICS') {
      return 'Analitika Manajemen & Stok';
    }
    if (currentView === 'ARCHIVE_HISTORY') {
      return 'Arsip & Buku Servis Kendaraan';
    }
    switch (currentUser.role) {
      case 'SA': return 'Vehicle Intake & Service Form';
      case 'MECHANIC': return 'Lab Diagnostics & Repair - Fuel Pump';
      case 'COMMON_RAIL': return 'Lab Diagnostics & Repair - Common Rail';
      case 'FOREMAN': return 'Foreman Fuel Pump Overview';
      case 'ADMIN': return 'System Administration';
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
      <div className="flex h-screen w-full bg-[#f1f5f9] text-[#0f172a] font-sans overflow-hidden print:h-auto print:overflow-visible print:block">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-[#0a1526] text-white flex flex-col shrink-0 print:hidden z-50 transform md:transform-none md:static md:flex transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="p-4 border-b border-slate-800 flex flex-col gap-3 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <h1 className="text-sm font-black text-white uppercase tracking-wider">
                INDO <span className="text-[#dc2626]">TEKNIK</span>
              </h1>
              <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 py-1 px-2.5 rounded mt-1.5 self-start shadow-xs">
                <SmartLogo baseName="logo-itech" alt="ITech" className="h-3.5 object-contain bg-white px-1 py-0.5 rounded" />
                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest whitespace-nowrap">Authorized Dealer</span>
              </div>
            </div>
            {/* Close Button on mobile */}
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 md:hidden flex items-center justify-center min-h-[44px] min-w-[44px]"
              title="Close Sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Premium Welcome Card aligned with Indo Teknik red/blue branding */}
          <div id="user-profile" className="bg-[#1e3a8a]/10 border border-[#1e3a8a]/20 border-l-4 border-l-[#dc2626] p-2.5 rounded-lg flex flex-col gap-0.5 shadow-inner">
            <span className="text-xs font-bold text-slate-100 leading-tight">
              {getGreeting()}, <span className="text-blue-300 font-black">{getGreetingName(currentUser)}</span>!
            </span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              {currentUser.role === 'ADMIN' ? 'Super Admin' :
               currentUser.role === 'FOREMAN' ? 'Foreman Fuel Pump' :
               currentUser.role === 'SA' ? 'Service Advisor' :
               currentUser.role === 'MECHANIC' ? 'Mekanik Fuel Pump' :
               currentUser.role === 'COMMON_RAIL' ? 'Mekanik Common Rail' : currentUser.role}
            </span>
          </div>
        </div>
        
        <nav id="sidebar-navigation" className="shrink-0 py-2.5 px-3 space-y-4">
          {/* GROUP 1: OPERASIONAL LAB & BENGKEL */}
          <div className="space-y-1">
            <button
              onClick={() => setIsLabOpsOpen(!isLabOpsOpen)}
              className="w-full flex items-center justify-between px-3 py-2.5 text-[10px] font-black text-slate-400 hover:text-white uppercase tracking-wider hover:bg-slate-800/40 rounded-lg transition-colors cursor-pointer min-h-[44px]"
            >
              <span className="flex items-center gap-2">
                <Wrench className="w-3.5 h-3.5 text-[#dc2626]" />
                Operasional Lab & Bengkel
              </span>
              {isLabOpsOpen ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              )}
            </button>

            {isLabOpsOpen && (
              <div className="space-y-1.5 md:space-y-1 pl-1">
                {currentUser.role === 'ADMIN' ? (
                  <>
                    <motion.button
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      whileHover={{ scale: 1.015, x: 2 }}
                      whileTap={{ scale: 0.985 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => { setCurrentView('ARCHIVE_HISTORY'); setIsSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-3 md:py-1.5 rounded-lg text-sm transition-all duration-150 cursor-pointer border-l-4 border-b ${
                        currentView === 'ARCHIVE_HISTORY' 
                          ? 'bg-[#1e3a8a] text-white border-l-[#dc2626] border-b-transparent font-black shadow-xs' 
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border-l-transparent border-b-[#1e3a8a]/35 hover:border-b-[#1e3a8a]/60 font-medium'
                      }`}
                    >
                      <Archive className={`w-5 h-5 md:w-4 md:h-4 transition-colors flex-shrink-0 ${currentView === 'ARCHIVE_HISTORY' ? 'text-white' : 'text-blue-400/90'}`} />
                      Buku Servis & Arsip
                    </motion.button>

                    <motion.button
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      whileHover={{ scale: 1.015, x: 2 }}
                      whileTap={{ scale: 0.985 }}
                      transition={{ duration: 0.2, delay: 0.05 }}
                      onClick={() => { setCurrentView('CLAIMS'); setIsSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-3 md:py-1.5 rounded-lg text-sm transition-all duration-150 cursor-pointer border-l-4 border-b ${
                        currentView === 'CLAIMS' 
                          ? 'bg-[#1e3a8a] text-white border-l-[#dc2626] border-b-transparent font-black shadow-xs' 
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border-l-transparent border-b-[#1e3a8a]/35 hover:border-b-[#1e3a8a]/60 font-medium'
                      }`}
                    >
                      <ShieldAlert className={`w-5 h-5 md:w-4 md:h-4 transition-colors flex-shrink-0 ${currentView === 'CLAIMS' ? 'text-white' : 'text-red-400'}`} />
                      Klaim & Garansi
                    </motion.button>
                  </>
                ) : (
                  <>
                    <motion.button
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      whileHover={{ scale: 1.015, x: 2 }}
                      whileTap={{ scale: 0.985 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => { setCurrentView('DEFAULT'); setIsSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-3 md:py-1.5 rounded-lg text-sm transition-all duration-150 cursor-pointer border-l-4 border-b ${
                        currentView === 'DEFAULT' 
                          ? 'bg-[#1e3a8a] text-white border-l-[#dc2626] border-b-transparent font-black shadow-xs' 
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border-l-transparent border-b-[#1e3a8a]/35 hover:border-b-[#1e3a8a]/60 font-medium'
                      }`}
                    >
                      <ClipboardList className={`w-5 h-5 md:w-4 md:h-4 transition-colors flex-shrink-0 ${currentView === 'DEFAULT' ? 'text-white' : 'text-blue-400/90'}`} />
                      {getDashboardTitle()}
                    </motion.button>

                    <motion.button
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      whileHover={{ scale: 1.015, x: 2 }}
                      whileTap={{ scale: 0.985 }}
                      transition={{ duration: 0.2, delay: 0.05 }}
                      onClick={() => { setCurrentView('ARCHIVE_HISTORY'); setIsSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-3 md:py-1.5 rounded-lg text-sm transition-all duration-150 cursor-pointer border-l-4 border-b ${
                        currentView === 'ARCHIVE_HISTORY' 
                          ? 'bg-[#1e3a8a] text-white border-l-[#dc2626] border-b-transparent font-black shadow-xs' 
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border-l-transparent border-b-[#1e3a8a]/35 hover:border-b-[#1e3a8a]/60 font-medium'
                      }`}
                    >
                      <Archive className={`w-5 h-5 md:w-4 md:h-4 transition-colors flex-shrink-0 ${currentView === 'ARCHIVE_HISTORY' ? 'text-white' : 'text-blue-400/90'}`} />
                      Buku Servis & Arsip
                    </motion.button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* GROUP 2: ADMINISTRASI & MANAJEMEN */}
          <div className="space-y-1">
            <button
              onClick={() => setIsManagementOpen(!isManagementOpen)}
              className="w-full flex items-center justify-between px-3 py-2.5 text-[10px] font-black text-slate-400 hover:text-white uppercase tracking-wider hover:bg-slate-800/40 rounded-lg transition-colors cursor-pointer min-h-[44px]"
            >
              <span className="flex items-center gap-2">
                <Briefcase className="w-3.5 h-3.5 text-[#3b82f6]" />
                Administrasi & Manajemen
              </span>
              {isManagementOpen ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              )}
            </button>

            {isManagementOpen && (
              <div className="space-y-1.5 md:space-y-1 pl-1">
                {currentUser.role === 'ADMIN' ? (
                  <>
                    <motion.button
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      whileHover={{ scale: 1.015, x: 2 }}
                      whileTap={{ scale: 0.985 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => { setCurrentView('DEFAULT'); setIsSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-3 md:py-1.5 rounded-lg text-sm transition-all duration-150 cursor-pointer border-l-4 border-b ${
                        currentView === 'DEFAULT' 
                          ? 'bg-[#1e3a8a] text-white border-l-[#dc2626] border-b-transparent font-black shadow-xs' 
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border-l-transparent border-b-[#1e3a8a]/35 hover:border-b-[#1e3a8a]/60 font-medium'
                      }`}
                    >
                      <Users className={`w-5 h-5 md:w-4 md:h-4 transition-colors flex-shrink-0 ${currentView === 'DEFAULT' ? 'text-white' : 'text-blue-400/90'}`} />
                      Kelola Pengguna
                    </motion.button>

                    <motion.button
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      whileHover={{ scale: 1.015, x: 2 }}
                      whileTap={{ scale: 0.985 }}
                      transition={{ duration: 0.2, delay: 0.05 }}
                      onClick={() => { setCurrentView('CUSTOMERS'); setIsSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-3 md:py-1.5 rounded-lg text-sm transition-all duration-150 cursor-pointer border-l-4 border-b ${
                        currentView === 'CUSTOMERS' 
                          ? 'bg-[#1e3a8a] text-white border-l-[#dc2626] border-b-transparent font-black shadow-xs' 
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border-l-transparent border-b-[#1e3a8a]/35 hover:border-b-[#1e3a8a]/60 font-medium'
                      }`}
                    >
                      <Users className={`w-5 h-5 md:w-4 md:h-4 transition-colors flex-shrink-0 ${currentView === 'CUSTOMERS' ? 'text-white' : 'text-blue-400/90'}`} />
                      Kelola Konsumen
                    </motion.button>

                    <motion.button
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      whileHover={{ scale: 1.015, x: 2 }}
                      whileTap={{ scale: 0.985 }}
                      transition={{ duration: 0.2, delay: 0.1 }}
                      onClick={() => { setCurrentView('ANALYTICS'); setIsSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-3 md:py-1.5 rounded-lg text-sm transition-all duration-150 cursor-pointer border-l-4 border-b ${
                        currentView === 'ANALYTICS' 
                          ? 'bg-[#1e3a8a] text-white border-l-[#dc2626] border-b-transparent font-black shadow-xs' 
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border-l-transparent border-b-[#1e3a8a]/35 hover:border-b-[#1e3a8a]/60 font-medium'
                      }`}
                    >
                      <BarChart3 className={`w-5 h-5 md:w-4 md:h-4 transition-colors flex-shrink-0 ${currentView === 'ANALYTICS' ? 'text-white' : 'text-blue-400/90'}`} />
                      Analitik & KPI
                    </motion.button>
                  </>
                ) : (
                  <>
                    <motion.button
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      whileHover={{ scale: 1.015, x: 2 }}
                      whileTap={{ scale: 0.985 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => { setCurrentView('CLAIMS'); setIsSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-3 md:py-1.5 rounded-lg text-sm transition-all duration-150 cursor-pointer border-l-4 border-b ${
                        currentView === 'CLAIMS' 
                          ? 'bg-[#1e3a8a] text-white border-l-[#dc2626] border-b-transparent font-black shadow-xs' 
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border-l-transparent border-b-[#1e3a8a]/35 hover:border-b-[#1e3a8a]/60 font-medium'
                      }`}
                    >
                      <ShieldAlert className={`w-5 h-5 md:w-4 md:h-4 transition-colors flex-shrink-0 ${currentView === 'CLAIMS' ? 'text-white' : 'text-red-400'}`} />
                      Klaim & Garansi
                    </motion.button>
                  </>
                )}
              </div>
            )}
          </div>
        </nav>
        
        {currentUser && (
          /* Workshop Feed section inside Sidebar */
          <div className="px-3 mt-2 flex-1 flex flex-col min-h-0 border-t border-slate-800 pt-4 overflow-hidden">
            <div className="flex items-center justify-between px-2 mb-2 shrink-0">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                Workshop Feed
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="bg-amber-500 text-slate-950 font-bold text-[9px] px-1.5 py-0.5 rounded-full">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
                <button
                  onClick={refreshWorkshopFeed}
                  className="ml-1.5 p-1 hover:bg-slate-800 rounded transition-colors text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
                  title="Sinkronisasi Live Feed"
                >
                  <RefreshCw className={`w-3 h-3 ${isRefreshingFeed ? 'animate-spin text-blue-400' : ''}`} />
                </button>
              </span>
              {notifications.length > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-[10px] text-slate-400 hover:text-white underline transition-colors cursor-pointer"
                >
                  Read All
                </button>
              )}
            </div>

            <div className={`flex-1 overflow-y-auto space-y-2 pr-1 select-none scrollbar-thin scrollbar-thumb-slate-700 transition-opacity duration-300 ${isRefreshingFeed ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
              {notifications.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs italic">
                  No live updates yet. Waiting for workshop activity...
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-2 rounded-md border text-xs transition-colors ${
                      notif.read 
                        ? 'bg-slate-900/40 border-slate-800/80 text-slate-500' 
                        : 'bg-slate-900 border-slate-700 text-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1.5">
                      <span className={`font-semibold tracking-wide ${
                        notif.type === 'success' ? 'text-emerald-400' :
                        notif.type === 'warning' ? 'text-amber-400' :
                        notif.type === 'error' ? 'text-red-400' : 'text-blue-400'
                      }`}>
                        {notif.title}
                      </span>
                      <span className="text-[9px] text-slate-500 font-mono shrink-0">{notif.timestamp}</span>
                    </div>
                    <p className="mt-0.5 leading-relaxed text-[11px] break-words">{notif.message}</p>
                  </div>
                ))
              )}
            </div>
            
            {notifications.length > 0 && (
              <button
                onClick={clearNotifications}
                className="w-full mt-2 text-center text-[10px] text-slate-500 hover:text-red-400 py-1 transition-colors hover:bg-slate-900/50 rounded shrink-0 border-t border-slate-800/50"
              >
                Clear Feed History
              </button>
            )}
          </div>
        )}

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
              onClick={() => setAreToastsMuted(!areToastsMuted)}
              className={`p-2 rounded transition-colors flex-shrink-0 cursor-pointer ${
                areToastsMuted ? 'text-red-400 hover:text-red-300 hover:bg-slate-800' : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800'
              }`}
              title={areToastsMuted ? "Aktifkan Notifikasi Layar (Muted)" : "Senyapkan Notifikasi Layar"}
            >
              {areToastsMuted ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
            </button>
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
              className="p-2 text-slate-400 hover:text-blue-400 rounded transition-colors flex-shrink-0 cursor-pointer"
              title="Panduan Sistem"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
            <button
              onClick={logout}
              className="p-2 text-slate-400 hover:text-[#ef4444] rounded transition-colors flex-shrink-0 cursor-pointer"
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
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shrink-0 print:hidden shadow-2xs">
          <div className="flex items-center gap-4">
            {/* Mobile Hamburger menu */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2.5 -ml-2.5 rounded-xl text-slate-500 hover:text-[#1e3a8a] hover:bg-slate-100 md:hidden transition-all cursor-pointer"
              title="Open Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-blue-600 tracking-widest uppercase">Indo Teknik ERP Portal</span>
              <h2 className="text-base md:text-xl font-extrabold text-slate-800 tracking-tight leading-none mt-1">
                {getHeaderTitle()}
              </h2>
            </div>
          </div>

          {/* Right Header Widgets */}
          <div className="hidden sm:flex items-center gap-4">
            {/* Live Sync Status Pill */}
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-xl text-emerald-800 shadow-3xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-black tracking-widest uppercase">Live Synchronized</span>
            </div>

            {/* Date Pill */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl text-slate-700 shadow-3xs">
              <Calendar className="w-4 h-4 text-[#1e3a8a]" />
              <span className="text-xs font-bold font-mono">
                {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto relative bg-slate-50 pb-24 md:pb-6">
          {currentView === 'ANALYTICS' && currentUser.role === 'ADMIN' ? (
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
        <footer className="min-h-8 md:h-8 bg-slate-50 border-t border-slate-200/80 px-4 flex flex-col md:flex-row items-center justify-between gap-y-1.5 py-1.5 md:py-0 shrink-0 print:hidden select-none">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-5 gap-y-1">
            <span className="flex items-center gap-1.5 text-[9px] font-bold text-slate-600 uppercase tracking-wider">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              Database Connected
            </span>
            <span className="flex items-center gap-1.5 text-[9px] font-bold text-slate-600 uppercase tracking-wider">
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
          <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 font-mono text-center md:text-right">
            ITech Authorized Dealer • {new Date().getFullYear()}
          </div>
        </footer>
      </main>

      {/* Premium Floating Mobile Bottom Dock */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md bg-slate-900/95 backdrop-blur-md border border-slate-800/80 rounded-2xl shadow-2xl z-40 md:hidden flex items-center justify-around p-1.5 text-white print:hidden">
        {/* Home/Dashboard Tab */}
        <button
          onClick={() => { setCurrentView('DEFAULT'); setIsSidebarOpen(false); }}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all ${
            currentView === 'DEFAULT' ? 'text-blue-400 bg-blue-500/10 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ClipboardList className="w-5 h-5" />
          <span className="text-[9px] mt-1 tracking-tight">Terminal</span>
        </button>

        {/* Archive/History Tab */}
        <button
          onClick={() => { setCurrentView('ARCHIVE_HISTORY'); setIsSidebarOpen(false); }}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all ${
            currentView === 'ARCHIVE_HISTORY' ? 'text-blue-400 bg-blue-500/10 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Archive className="w-5 h-5" />
          <span className="text-[9px] mt-1 tracking-tight">Arsip</span>
        </button>

        {/* Claim Tab (SA or ADMIN only) */}
        {(currentUser.role === 'ADMIN' || currentUser.role === 'SA') && (
          <button
            onClick={() => { setCurrentView('CLAIMS'); setIsSidebarOpen(false); }}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all ${
              currentView === 'CLAIMS' ? 'text-red-400 bg-red-500/10 font-bold' : 'text-slate-400 hover:text-slate-200'
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
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all ${
              currentView === 'CUSTOMERS' ? 'text-blue-400 bg-blue-500/10 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[9px] mt-1 tracking-tight">Konsumen</span>
          </button>
        )}

        {/* Toggle Sidebar Tab */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all ${
            isSidebarOpen ? 'text-red-400 bg-red-500/10 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Menu className="w-5 h-5" />
          <span className="text-[9px] mt-1 tracking-tight">Menu</span>
        </button>
      </div>

      {/* Print Overlay */}
      {printWO && <PrintTemplate />}

      {/* Role-Specific Onboarding Tutorial Overlay */}
      <RoleOnboardingTutorial />

      {/* Floating Toast Notification Container */}
      <div className="fixed bottom-24 md:bottom-12 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none print:hidden">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-4 rounded-lg shadow-2xl border flex items-start gap-3 pointer-events-auto transition-all duration-300 transform translate-y-0 ${
              toast.type === 'success' ? 'bg-emerald-950/95 border-emerald-800 text-emerald-200' :
              toast.type === 'warning' ? 'bg-amber-950/95 border-amber-800 text-amber-200' :
              toast.type === 'error' ? 'bg-red-950/95 border-red-800 text-red-200' :
              'bg-slate-900/95 border-slate-700 text-slate-100'
            }`}
          >
            <div className="flex-1">
              <h4 className="text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${
                  toast.type === 'success' ? 'bg-emerald-400 animate-pulse' :
                  toast.type === 'warning' ? 'bg-amber-400 animate-pulse' :
                  toast.type === 'error' ? 'bg-red-400 animate-pulse' :
                  'bg-blue-400 animate-pulse'
                }`} />
                {toast.title}
              </h4>
              <p className="text-xs leading-relaxed">{toast.message}</p>
              <span className="text-[10px] text-slate-400 font-mono mt-1 block">{toast.timestamp}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-0.5 rounded hover:bg-slate-800/50 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

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
