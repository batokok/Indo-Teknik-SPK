import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { Claim, WorkOrder, User, Customer } from '../types';
import { 
  ShieldAlert, 
  Plus, 
  Filter, 
  Search, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Info,
  UserCheck,
  Calendar,
  Wrench,
  Hammer,
  HelpCircle,
  FileSpreadsheet,
  Cpu
} from 'lucide-react';

const ClaimManagement: React.FC = () => {
  const { 
    claims, 
    addClaim, 
    updateClaim, 
    deleteClaim, 
    workOrders, 
    users, 
    customers, 
    currentUser,
    addNotification
  } = useApp();

  const isSAOrAdmin = currentUser?.role === 'SA' || currentUser?.role === 'ADMIN';

  // State variables for form input
  const [customerId, setCustomerId] = useState('');
  const [claimDate, setClaimDate] = useState(new Date().toISOString().split('T')[0]);
  const [relatedWOId, setRelatedWOId] = useState('');
  const [divisionRelated, setDivisionRelated] = useState<'SUPPLY_PUMP' | 'COMMON_RAIL' | 'SA'>('SUPPLY_PUMP');
  const [assignedPersonId, setAssignedPersonId] = useState('');
  const [claimType, setClaimType] = useState<Claim['claimType']>('COMPLAINT');
  const [cause, setCause] = useState('');
  const [investigationNotes, setInvestigationNotes] = useState('');
  const [finalDecision, setFinalDecision] = useState('');
  const [rectificationAction, setRectificationAction] = useState('');
  const [isWarrantyIncluded, setIsWarrantyIncluded] = useState(false);
  const [isNegligence, setIsNegligence] = useState(false);
  const [status, setStatus] = useState<Claim['status']>('OPEN');
  const [completedDate, setCompletedDate] = useState('');

  // Customer & SPK search/filtering state
  const [customerSearch, setCustomerSearch] = useState('');
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const [showAllCustomerWOs, setShowAllCustomerWOs] = useState(false);

  // Helper calculations
  const selectedCustomer = customers.find(c => c.id === customerId);

  // Filter customers based on search input
  const searchedCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.phone.includes(customerSearch) ||
    (c.companyName && c.companyName.toLowerCase().includes(customerSearch.toLowerCase()))
  );

  // Filter and sort work orders for selected customer
  const sortedWOs = workOrders
    .filter(wo => {
      if (!customerId) return false;
      return wo.customerId === customerId;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Editing Claim modal state
  const [editingClaim, setEditingClaim] = useState<Claim | null>(null);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | Claim['status']>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | Claim['claimType']>('ALL');

  // Submit new claim handler
  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) {
      addNotification('Gagal Input', 'Silakan pilih customer terlebih dahulu!', 'warning');
      return;
    }

    const selectedCust = customers.find(c => c.id === customerId);
    const assignedUser = users.find(u => u.id === assignedPersonId);

    const claimPayload: Omit<Claim, 'id' | 'createdAt'> = {
      customerId,
      customerName: selectedCust?.name || 'Unknown Customer',
      claimDate,
      relatedWOId: relatedWOId || undefined,
      divisionRelated,
      assignedPersonId: assignedPersonId || undefined,
      assignedPersonName: assignedUser?.name || undefined,
      claimType,
      cause,
      status,
      investigationNotes,
      finalDecision,
      rectificationAction,
      isWarrantyIncluded,
      isNegligence,
      completedDate: completedDate || undefined,
    };

    try {
      await addClaim(claimPayload);
      // Reset form fields
      setCustomerId('');
      setRelatedWOId('');
      setAssignedPersonId('');
      setCause('');
      setInvestigationNotes('');
      setFinalDecision('');
      setRectificationAction('');
      setIsWarrantyIncluded(false);
      setIsNegligence(false);
      setStatus('OPEN');
      setCompletedDate('');
      addNotification('Klaim Tersimpan', 'Registrasi klaim/komplain berhasil disimpan!', 'success');
    } catch (err: any) {
      addNotification('Gagal Menyimpan', 'Gagal menyimpan klaim: ' + err.message, 'error');
    }
  };

  // Update existing claim handler
  const handleUpdateClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClaim) return;

    try {
      const updates: Partial<Claim> = {
        status,
        investigationNotes,
        finalDecision,
        rectificationAction,
        isWarrantyIncluded,
        isNegligence,
        completedDate: completedDate || undefined,
        assignedPersonId: assignedPersonId || undefined,
        assignedPersonName: users.find(u => u.id === assignedPersonId)?.name || undefined,
        cause
      };

      // If completing, auto-set date if empty
      if (status === 'COMPLETED' && !completedDate) {
        updates.completedDate = new Date().toISOString().split('T')[0];
      }

      await updateClaim(editingClaim.id, updates);
      setEditingClaim(null);
      addNotification('Klaim Diperbarui', 'Update progres klaim berhasil disimpan!', 'success');
    } catch (err: any) {
      addNotification('Gagal Memperbarui', 'Gagal memperbarui klaim: ' + err.message, 'error');
    }
  };

  // Open Edit Modal & Populate form
  const openEditModal = (claim: Claim) => {
    setEditingClaim(claim);
    setStatus(claim.status);
    setInvestigationNotes(claim.investigationNotes || '');
    setFinalDecision(claim.finalDecision || '');
    setRectificationAction(claim.rectificationAction || '');
    setIsWarrantyIncluded(claim.isWarrantyIncluded);
    setIsNegligence(claim.isNegligence);
    setCompletedDate(claim.completedDate || '');
    setAssignedPersonId(claim.assignedPersonId || '');
    setCause(claim.cause || '');
  };

  // Delete claim handler
  const handleDeleteClaim = async (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus catatan klaim ini?')) {
      try {
        await deleteClaim(id);
        addNotification('Klaim Dihapus', 'Klaim berhasil dihapus dari database.', 'info');
      } catch (err: any) {
        addNotification('Gagal Menghapus', 'Gagal menghapus klaim: ' + err.message, 'error');
      }
    }
  };

  // Filtered claims to display
  const filteredClaims = claims.filter(c => {
    const matchesSearch = c.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (c.relatedWOId && c.relatedWOId.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesType = typeFilter === 'ALL' || c.claimType === typeFilter;

    // Workshop crew roles can only see claims related to their division
    if (currentUser?.role === 'MECHANIC' || currentUser?.role === 'FOREMAN') {
      return matchesSearch && matchesStatus && matchesType && c.divisionRelated === 'SUPPLY_PUMP';
    }
    if (currentUser?.role === 'COMMON_RAIL') {
      return matchesSearch && matchesStatus && matchesType && c.divisionRelated === 'COMMON_RAIL';
    }

    return matchesSearch && matchesStatus && matchesType;
  });

  // Calculate stats
  const totalClaimsCount = claims.length;
  const openClaimsCount = claims.filter(c => c.status === 'OPEN').length;
  const pendingClaimsCount = claims.filter(c => c.status === 'INVESTIGATING').length;
  const resolvedClaimsCount = claims.filter(c => c.status === 'COMPLETED').length;
  const negligenceClaimsCount = claims.filter(c => c.isNegligence).length;
  const warrantyClaimsCount = claims.filter(c => c.isWarrantyIncluded).length;

  const totalCompletedWOs = workOrders.length || 1;
  const claimRate = ((totalClaimsCount / totalCompletedWOs) * 100).toFixed(1);

  const getClaimTypeLabel = (type: Claim['claimType']) => {
    switch (type) {
      case 'DAMAGE': return '❌ Kerusakan Komponen';
      case 'COMPLAINT': return '💬 Keluhan Pelanggan';
      case 'COMEBACK_JOB': return '🔄 Kerjaan Comeback';
      case 'WARRANTY': return '🛡️ Klaim Garansi';
      default: return '📁 Lain-lain';
    }
  };

  const getDivisionLabel = (div: string) => {
    if (div === 'SUPPLY_PUMP') return 'Fuel Pump';
    if (div === 'COMMON_RAIL') return 'Common Rail';
    return 'Service Advisor / FO';
  };

  return (
    <div className="space-y-4 sm:space-y-6" id="claim-workspace-container">
      {/* Upper Status Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-4">
        <div className="bg-[#1e3a8a] text-white p-3 sm:p-4 rounded-xl border border-[#1e3a8a] shadow-xs flex flex-col justify-between">
          <span className="text-[9px] uppercase font-bold tracking-widest text-blue-100">Total Klaim/Komplain</span>
          <div className="flex items-baseline gap-1.5 mt-1 sm:mt-2">
            <span className="text-lg sm:text-2xl font-black">{totalClaimsCount}</span>
            <span className="text-[9px] sm:text-[10px] text-blue-200 font-mono">Kasus</span>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-xl border-l-4 border-l-[#dc2626] border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-[9px] uppercase font-bold tracking-widest text-[#dc2626]">Terbuka / Baru</span>
          <div className="flex items-baseline gap-1.5 mt-1 sm:mt-2">
            <span className="text-lg sm:text-2xl font-black text-[#dc2626]">{openClaimsCount}</span>
            <span className="text-[9px] sm:text-[10px] text-slate-400">Open</span>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-xl border-l-4 border-l-amber-500 border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-[9px] uppercase font-bold tracking-widest text-amber-600">Dalam Investigasi</span>
          <div className="flex items-baseline gap-1.5 mt-1 sm:mt-2">
            <span className="text-lg sm:text-2xl font-black text-amber-700">{pendingClaimsCount}</span>
            <span className="text-[9px] sm:text-[10px] text-slate-400">Review</span>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-xl border-l-4 border-l-emerald-500 border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-[9px] uppercase font-bold tracking-widest text-emerald-600">Diselesaikan</span>
          <div className="flex items-baseline gap-1.5 mt-1 sm:mt-2">
            <span className="text-lg sm:text-2xl font-black text-emerald-700">{resolvedClaimsCount}</span>
            <span className="text-[9px] sm:text-[10px] text-slate-400">Selesai</span>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between col-span-2 sm:col-span-1 lg:col-span-1">
          <span className="text-[9px] uppercase font-bold tracking-widest text-slate-500">Rasio Klaim vs SPK</span>
          <div className="flex items-baseline gap-1.5 mt-1 sm:mt-2">
            <span className="text-lg sm:text-2xl font-black text-slate-800">{claimRate}%</span>
            <span className="text-[9px] sm:text-[10px] text-slate-400 font-mono">Total WO</span>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start">
        
        {/* Left Side: Register New Claim Form (Col 4) */}
        {isSAOrAdmin ? (
          <div className="lg:col-span-5 xl:col-span-4 bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-xs font-black text-[#1e3a8a] uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-red-500" />
                Registrasi Klaim Baru
              </h2>
              <p className="text-[10px] text-slate-500 mt-1">Gunakan formulir ini untuk mencatat keluhan, kerusakan parts, comeback pengerjaan, atau klaim garansi baru.</p>
            </div>

            <form onSubmit={handleSubmitClaim} className="space-y-3.5">
              <div>
                <label className="block text-[10px] uppercase font-extrabold text-slate-500 mb-1">Customer <span className="text-red-500">*</span></label>
                {selectedCustomer ? (
                  <div className="bg-[#eff6ff] border border-blue-200 p-2.5 rounded-lg flex flex-col sm:flex-row gap-2.5 sm:items-center sm:justify-between shadow-xs animate-in fade-in duration-200">
                    <div>
                      <h4 className="text-xs font-black text-[#1e3a8a]">{selectedCustomer.name}</h4>
                      <p className="text-[9px] text-slate-500 font-medium mt-0.5">
                        {selectedCustomer.phone} {selectedCustomer.companyName ? `• ${selectedCustomer.companyName}` : ''}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomerId('');
                        setRelatedWOId('');
                        setCustomerSearch('');
                      }}
                      className="text-[9px] font-black text-[#dc2626] hover:text-red-800 bg-red-50 hover:bg-red-100 px-2 py-1 rounded transition-colors uppercase cursor-pointer self-start sm:self-center"
                    >
                      Ganti Customer
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Cari Nama / No HP Customer..."
                        value={customerSearch}
                        onChange={e => {
                          setCustomerSearch(e.target.value);
                          setIsCustomerDropdownOpen(true);
                        }}
                        onFocus={() => setIsCustomerDropdownOpen(true)}
                        onBlur={() => {
                          // Allow suggestion clicks to register
                          setTimeout(() => setIsCustomerDropdownOpen(false), 200);
                        }}
                        className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 p-2 pl-8 rounded-lg outline-none focus:border-blue-500 focus:bg-white"
                      />
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
                      {customerSearch && (
                        <button
                          type="button"
                          onClick={() => setCustomerSearch('')}
                          className="text-slate-400 hover:text-slate-600 absolute right-2.5 top-2.5 text-xs font-bold"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {isCustomerDropdownOpen && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto divide-y divide-slate-100">
                        {searchedCustomers.length === 0 ? (
                          <div className="p-3 text-xs text-slate-500 text-center">
                            Tidak ada customer cocok
                          </div>
                        ) : (
                          searchedCustomers.slice(0, 8).map(c => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => {
                                setCustomerId(c.id);
                                setCustomerSearch('');
                                setIsCustomerDropdownOpen(false);
                                setRelatedWOId('');
                              }}
                              className="w-full text-left p-2 hover:bg-blue-50 transition-colors flex flex-col gap-0.5 cursor-pointer"
                            >
                              <span className="text-xs font-black text-slate-800">{c.name}</span>
                              <span className="text-[9px] text-slate-500">
                                {c.phone} {c.companyName ? `• ${c.companyName}` : ''}
                              </span>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-extrabold text-slate-500 mb-1">Tanggal Claim</label>
                  <input
                    type="date"
                    required
                    value={claimDate}
                    onChange={e => setClaimDate(e.target.value)}
                    className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 p-2 rounded-lg outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-extrabold text-slate-500 mb-1">
                    SPK Terkait <span className="text-slate-400 font-normal">(Opsional)</span>
                  </label>
                  
                  {customerId ? (
                    <div className="space-y-2">
                      {sortedWOs.length === 0 ? (
                        <div className="text-[10px] text-amber-600 bg-amber-50 p-2 rounded-lg border border-amber-200 font-bold">
                          ⚠️ Tidak ada SPK untuk customer ini
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <div className="grid grid-cols-1 gap-1.5">
                            {sortedWOs.slice(0, 3).map(wo => {
                              const isSelected = relatedWOId === wo.id;
                              const dateFormatted = wo.createdAt ? new Date(wo.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : 'Baru';
                              return (
                                <button
                                  key={wo.id}
                                  type="button"
                                  onClick={() => setRelatedWOId(isSelected ? '' : wo.id)}
                                  className={`text-left p-2 rounded-lg border transition-all flex justify-between items-center cursor-pointer ${
                                    isSelected 
                                      ? 'bg-blue-50/80 border-[#1e3a8a] ring-1 ring-[#1e3a8a] text-blue-950 font-bold' 
                                      : 'bg-slate-50/50 hover:bg-slate-50 border-slate-200 text-slate-700'
                                  }`}
                                >
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-mono text-[10px] font-black">{wo.id}</span>
                                      <span className="text-[9px] bg-slate-200/60 px-1 py-0.2 rounded text-slate-600 font-bold">{dateFormatted}</span>
                                    </div>
                                    <p className="text-[9px] truncate font-medium mt-0.5 text-slate-500">
                                      {wo.vehicleBrand} • <span className="font-mono">{wo.plateNumber}</span>
                                    </p>
                                  </div>
                                  {isSelected && (
                                    <CheckCircle2 className="w-4 h-4 text-[#1e3a8a] flex-shrink-0" />
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          {sortedWOs.length > 3 && (
                            <div className="pt-1">
                              <button
                                type="button"
                                onClick={() => setShowAllCustomerWOs(!showAllCustomerWOs)}
                                className="text-[10px] font-extrabold text-[#1e3a8a] hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                              >
                                {showAllCustomerWOs ? 'Sembunyikan SPK Lama' : `Lihat Semua SPK (${sortedWOs.length})`}
                              </button>

                              {showAllCustomerWOs && (
                                <div className="mt-2 space-y-1 bg-slate-50 p-2 rounded-lg border border-slate-200 max-h-40 overflow-y-auto font-mono">
                                  {sortedWOs.slice(3).map(wo => {
                                    const isSelected = relatedWOId === wo.id;
                                    const dateFormatted = wo.createdAt ? new Date(wo.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Baru';
                                    return (
                                      <button
                                        key={wo.id}
                                        type="button"
                                        onClick={() => setRelatedWOId(isSelected ? '' : wo.id)}
                                        className={`w-full text-left p-1.5 rounded text-[10px] transition-colors flex justify-between items-center cursor-pointer ${
                                          isSelected ? 'bg-blue-100 text-blue-950 font-bold' : 'hover:bg-slate-100 text-slate-600'
                                        }`}
                                      >
                                        <span>{wo.id} ({dateFormatted}) - {wo.vehicleBrand}</span>
                                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#1e3a8a]" />}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-[10px] text-slate-400 bg-slate-50 p-3 rounded-lg border border-slate-200 border-dashed italic text-center leading-normal">
                      Pilih customer terlebih dahulu untuk memunculkan riwayat SPK
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-extrabold text-slate-500 mb-1">Jenis Klaim / Komplain</label>
                <select
                  value={claimType}
                  onChange={e => setClaimType(e.target.value as any)}
                  className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 p-2 rounded-lg outline-none focus:border-blue-500"
                >
                  <option value="COMPLAINT">💬 Keluhan Pelanggan (Complaint)</option>
                  <option value="DAMAGE">❌ Kerusakan Komponen Baru (Damage)</option>
                  <option value="COMEBACK_JOB">🔄 Kerjaan Balik Bengkel (Comeback Job)</option>
                  <option value="WARRANTY">🛡️ Pengajuan Garansi (WarrantyClaim)</option>
                  <option value="OTHER">📁 Lain-lain</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-extrabold text-slate-500 mb-1">Divisi Terkait</label>
                  <select
                    value={divisionRelated}
                    onChange={e => {
                      setDivisionRelated(e.target.value as any);
                      setAssignedPersonId(''); // reset assigned person
                    }}
                    className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 p-2 rounded-lg outline-none focus:border-blue-500"
                  >
                    <option value="SUPPLY_PUMP">Fuel Pump</option>
                    <option value="COMMON_RAIL">Common Rail</option>
                    <option value="SA">Service Advisor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-extrabold text-slate-500 mb-1">Personil Ditugaskan</label>
                  <select
                    value={assignedPersonId}
                    onChange={e => setAssignedPersonId(e.target.value)}
                    className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 p-2 rounded-lg outline-none focus:border-blue-500"
                  >
                    <option value="">-- Pilih Personil --</option>
                    {/* Filter mechanics/foremen based on selected division */}
                    {users
                      .filter(u => {
                        if (divisionRelated === 'SUPPLY_PUMP') {
                          return u.role === 'MECHANIC' || u.role === 'FOREMAN';
                        }
                        if (divisionRelated === 'COMMON_RAIL') {
                          return u.role === 'COMMON_RAIL';
                        }
                        return u.role === 'SA';
                      })
                      .map(u => (
                        <option key={u.id} value={u.id}>{u.name} ({u.role === 'FOREMAN' ? 'Foreman' : u.role === 'SA' ? 'SA' : 'Mekanik'})</option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-extrabold text-slate-500 mb-1">Penyebab Klaim <span className="text-red-500">*</span></label>
                <textarea
                  required
                  rows={2}
                  value={cause}
                  onChange={e => setCause(e.target.value)}
                  placeholder="Contoh: Injector bocor atau oli terkontaminasi setelah kalibrasi..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 text-xs rounded-lg focus:ring-1 focus:ring-blue-500 outline-none leading-relaxed"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-[#1e3a8a] text-white text-xs font-black p-3 rounded-lg shadow hover:bg-blue-800 transition-colors uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Daftarkan Komplain
              </button>
            </form>
          </div>
        ) : (
          <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2">Panduan Pengisian Klaim</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Sebagai kru laboratorium produksi, Anda dapat melihat seluruh daftar klaim yang dialokasikan ke divisi Anda. 
              Gunakan panel kanan untuk melihat rincian instruksi investigasi, status garansi, serta keputusan akhir pengerjaan.
            </p>
            <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-800 leading-normal">
              <strong>Info Peran Anda:</strong> Hubungi Service Advisor atau Admin untuk memperbarui keputusan klaim secara formal.
            </div>
          </div>
        )}

        {/* Right Side: Live Claims List and Action Tracker */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          
          {/* Filters Bar with Indo Teknik Blue accent */}
          <div className="bg-white text-slate-800 p-4 rounded-xl border-t-4 border-t-[#1e3a8a] border-x border-b border-slate-200 shadow-xs flex flex-col md:flex-row gap-3.5 justify-between items-center">
            <div className="relative w-full md:max-w-xs">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                placeholder="Cari klaim, customer, SPK..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#1e3a8a] focus:border-[#1e3a8a] transition-all"
              />
            </div>

            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 w-full md:w-auto">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 text-[10px] font-black text-slate-700 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#1e3a8a] cursor-pointer"
              >
                <option value="ALL">Status: Semua</option>
                <option value="OPEN">🔴 Baru / Terbuka</option>
                <option value="INVESTIGATING">🟡 Investigasi</option>
                <option value="COMPLETED">🟢 Selesai</option>
                <option value="REJECTED">⚪ Ditolak / Close</option>
              </select>

              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 text-[10px] font-black text-slate-700 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#1e3a8a] cursor-pointer"
              >
                <option value="ALL">Jenis: Semua</option>
                <option value="COMPLAINT">💬 Complaint</option>
                <option value="DAMAGE">❌ Damage</option>
                <option value="COMEBACK_JOB">🔄 Comeback</option>
                <option value="WARRANTY">🛡️ Garansi</option>
              </select>
            </div>
          </div>

          {/* List of Claims */}
          <div className="space-y-4" id="claims-listing-block">
            {filteredClaims.length === 0 ? (
              <div className="bg-white p-12 text-center border border-slate-200 rounded-xl">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-xs font-bold text-slate-700">Tidak ada klaim ditemukan</h3>
                <p className="text-[10px] text-slate-400 mt-1">Coba ubah filter pencarian atau buat registrasi keluhan baru.</p>
              </div>
            ) : (
              filteredClaims.map((claim) => {
                const associatedWO = workOrders.find(wo => wo.id === claim.relatedWOId);
                
                return (
                  <div key={claim.id} className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 sm:p-5 space-y-4 hover:border-[#1e3a8a]/40 hover:shadow-sm transition-all duration-200">
                    <div className="flex flex-wrap justify-between items-start gap-2.5 border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-black text-[#1e3a8a] bg-blue-50/50 px-2 py-0.5 rounded border border-blue-100">
                            {claim.id}
                          </span>
                          <span className="text-xs font-black text-slate-800">{claim.customerName}</span>
                        </div>
                        <p className="text-[9px] text-slate-400 mt-1 uppercase font-bold flex items-center gap-1.5">
                          <Calendar className="w-3 h-3" /> Claim Date: {new Date(claim.claimDate).toLocaleDateString('id-ID')}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        {claim.isWarrantyIncluded && (
                          <span className="bg-emerald-50 text-emerald-700 text-[8px] font-black uppercase px-2 py-0.5 rounded border border-emerald-100">🛡️ Garansi</span>
                        )}
                        {claim.isNegligence && (
                          <span className="bg-red-50 text-red-700 text-[8px] font-black uppercase px-2 py-0.5 rounded border border-red-100 animate-pulse">⚠️ Kelalaian</span>
                        )}
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black border uppercase ${
                          claim.status === 'OPEN' ? 'bg-red-50 text-red-700 border-red-200' :
                          claim.status === 'INVESTIGATING' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          claim.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          {claim.status === 'OPEN' ? '🔴 Open / Baru' :
                           claim.status === 'INVESTIGATING' ? '🟡 Investigasi' :
                           claim.status === 'COMPLETED' ? '🟢 Selesai' : '⚪ Ditolak'}
                        </span>
                      </div>
                    </div>

                    {/* Technical Meta Row */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 text-[10px] sm:text-xs text-slate-600 bg-slate-50 p-2.5 sm:p-3 rounded-lg border border-slate-100">
                      <div>
                        <span className="text-slate-400 block text-[8px] uppercase font-bold tracking-wider">Jenis Klaim</span>
                        <span className="font-bold text-slate-700">{getClaimTypeLabel(claim.claimType)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[8px] uppercase font-bold tracking-wider">Divisi Terkait</span>
                        <span className="font-bold text-slate-700">{getDivisionLabel(claim.divisionRelated)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[8px] uppercase font-bold tracking-wider">Investigator</span>
                        <span className="font-bold text-slate-700 flex items-center gap-1 truncate" title={claim.assignedPersonName || 'Belum Ditugaskan'}>
                          <UserCheck className="w-3.5 h-3.5 text-[#1e3a8a] flex-shrink-0" />
                          <span className="truncate">{claim.assignedPersonName || 'Belum Ditugaskan'}</span>
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[8px] uppercase font-bold tracking-wider">SPK Terkait</span>
                        <span className="font-mono font-bold text-[#1e3a8a] truncate" title={claim.relatedWOId || 'Tidak Ada'}>{claim.relatedWOId || 'Tidak Ada'}</span>
                      </div>
                    </div>

                    {/* Investigation Notes, Final Decision & Action */}
                    <div className="space-y-2.5">
                      <div className="text-xs">
                        <strong className="text-slate-450 block uppercase text-[9px] tracking-wider mb-0.5">Penyebab Masalah:</strong>
                        <p className="text-slate-800 font-medium pl-3 border-l-2 border-slate-300 leading-relaxed bg-slate-50/30 py-1 rounded-r">{claim.cause}</p>
                      </div>

                      {claim.investigationNotes && (
                        <div className="text-xs">
                          <strong className="text-amber-600 block uppercase text-[9px] tracking-wider mb-0.5">Catatan Investigasi:</strong>
                          <p className="text-slate-700 italic pl-3 border-l-2 border-amber-300 leading-relaxed">{claim.investigationNotes}</p>
                        </div>
                      )}

                      {claim.finalDecision && (
                        <div className="text-xs">
                          <strong className="text-blue-600 block uppercase text-[9px] tracking-wider mb-0.5">Keputusan Akhir:</strong>
                          <p className="text-slate-800 font-semibold pl-3 border-l-2 border-blue-400 leading-relaxed bg-blue-50/10 py-1 rounded-r">{claim.finalDecision}</p>
                        </div>
                      )}

                      {claim.rectificationAction && (
                        <div className="text-xs">
                          <strong className="text-emerald-600 block uppercase text-[9px] tracking-wider mb-0.5">Tindakan Perbaikan:</strong>
                          <p className="text-slate-800 font-medium pl-3 border-l-2 border-emerald-400 leading-relaxed">{claim.rectificationAction}</p>
                        </div>
                      )}

                      {claim.completedDate && (
                        <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 bg-slate-50 px-2 py-1 rounded w-fit">
                          📅 Tanggal Selesai Claim: {new Date(claim.completedDate).toLocaleDateString('id-ID')}
                        </div>
                      )}
                    </div>

                    {/* Update Action Button (Integrated role control) */}
                    <div className="pt-2 flex flex-col sm:flex-row sm:justify-end gap-2 border-t border-slate-100">
                      {isSAOrAdmin || currentUser?.id === claim.assignedPersonId ? (
                        <button
                          onClick={() => openEditModal(claim)}
                          className="w-full sm:w-auto px-3.5 py-2 sm:py-1.5 bg-[#1e3a8a] hover:bg-blue-800 text-white text-[10px] font-black rounded-lg transition-all shadow-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Wrench className="w-3.5 h-3.5" />
                          {isSAOrAdmin ? 'Update Keputusan & Status' : 'Tulis Catatan Investigasi'}
                        </button>
                      ) : null}

                      {isSAOrAdmin && (
                        <button
                          onClick={() => handleDeleteClaim(claim.id)}
                          className="w-full sm:w-auto px-3 py-2 sm:py-1.5 text-slate-500 hover:text-[#dc2626] hover:bg-red-50 text-[10px] font-bold rounded transition-colors uppercase flex items-center justify-center cursor-pointer"
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Editing Claim Modal Component */}
      {editingClaim && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg my-auto overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
            <div className="bg-[#1e3a8a] text-white p-4 shrink-0">
              <h3 className="text-xs font-black uppercase tracking-wider">Update Progres Kasus Klaim</h3>
              <p className="text-[9px] text-blue-100 mt-0.5">Kasus ID: {editingClaim.id} • Customer: {editingClaim.customerName}</p>
            </div>

            <form onSubmit={handleUpdateClaim} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
              {isSAOrAdmin ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase font-extrabold text-slate-500 mb-1">Status Progres</label>
                      <select
                        value={status}
                        onChange={e => setStatus(e.target.value as any)}
                        className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 p-2 rounded outline-none focus:ring-1 focus:ring-[#1e3a8a]"
                      >
                        <option value="OPEN">🔴 Open / Baru</option>
                        <option value="INVESTIGATING">🟡 Investigasi / Review</option>
                        <option value="COMPLETED">🟢 Selesai / Approved</option>
                        <option value="REJECTED">⚪ Ditolak / Closed</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-extrabold text-slate-500 mb-1">Tanggal Selesai Klaim</label>
                      <input
                        type="date"
                        value={completedDate}
                        onChange={e => setCompletedDate(e.target.value)}
                        className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 p-2 rounded outline-none focus:ring-1 focus:ring-[#1e3a8a]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-150 select-none cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isWarrantyIncluded}
                        onChange={e => setIsWarrantyIncluded(e.target.checked)}
                        className="w-4 h-4 rounded text-[#1e3a8a] focus:ring-0 cursor-pointer"
                      />
                      <span className="text-[11px] font-black text-slate-700 uppercase tracking-wide">🛡️ Termasuk Garansi</span>
                    </label>

                    <label className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-150 select-none cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isNegligence}
                        onChange={e => setIsNegligence(e.target.checked)}
                        className="w-4 h-4 rounded text-[#dc2626] focus:ring-0 cursor-pointer"
                      />
                      <span className="text-[11px] font-black text-slate-700 uppercase tracking-wide">⚠️ Faktor Kelalaian</span>
                    </label>
                  </div>
                </>
              ) : null}

              <div>
                <label className="block text-[10px] uppercase font-extrabold text-slate-500 mb-1">Catatan Hasil Investigasi Laboratorium</label>
                <textarea
                  rows={3}
                  value={investigationNotes}
                  onChange={e => setInvestigationNotes(e.target.value)}
                  placeholder="Isi rincian hasil investigasi diesel pump atau material injector..."
                  className="w-full p-2.5 border border-slate-200 text-xs rounded outline-none bg-slate-50 focus:bg-white focus:ring-1 focus:ring-[#1e3a8a]"
                ></textarea>
              </div>

              {isSAOrAdmin ? (
                <>
                  <div>
                    <label className="block text-[10px] uppercase font-extrabold text-slate-500 mb-1">Keputusan Akhir (Final Decision)</label>
                    <textarea
                      rows={2}
                      value={finalDecision}
                      onChange={e => setFinalDecision(e.target.value)}
                      placeholder="Contoh: Disetujui garansi penuh, atau diganti oleh klaim pengerjaan ulang..."
                      className="w-full p-2.5 border border-slate-200 text-xs rounded outline-none bg-slate-50 focus:bg-white focus:ring-1 focus:ring-[#1e3a8a]"
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-extrabold text-slate-500 mb-1">Tindakan Perbaikan (Rectification Action)</label>
                    <textarea
                      rows={2}
                      value={rectificationAction}
                      onChange={e => setRectificationAction(e.target.value)}
                      placeholder="Contoh: Penggantian Nozzle Tip baru di laboratorium tanpa biaya tambahan..."
                      className="w-full p-2.5 border border-slate-200 text-xs rounded outline-none bg-slate-50 focus:bg-white focus:ring-1 focus:ring-[#1e3a8a]"
                    ></textarea>
                  </div>
                </>
              ) : null}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-150 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingClaim(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded transition-colors uppercase cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1e3a8a] hover:bg-blue-800 text-white text-xs font-black rounded uppercase shadow transition-colors cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClaimManagement;
