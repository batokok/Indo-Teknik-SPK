import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { Customer } from '../types';
import { Users, UserPlus, Edit, Trash2, Search, Phone, MapPin, Mail, Building, FileText, Plus, X, Calendar, Car } from 'lucide-react';

export const CustomerManagement: React.FC = () => {
  const { customers, vehicles, addCustomer, updateCustomer, deleteCustomer, isLoading } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  
  // Form fields state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const resetForm = () => {
    setName('');
    setPhone('');
    setAddress('');
    setEmail('');
    setCompanyName('');
    setNotes('');
    setFormError(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowAddForm(true);
  };

  const handleOpenEdit = (cust: Customer) => {
    setEditingCustomer(cust);
    setName(cust.name);
    setPhone(cust.phone);
    setAddress(cust.address || '');
    setEmail(cust.email || '');
    setCompanyName(cust.companyName || '');
    setNotes(cust.notes || '');
    setFormError(null);
  };

  // Validations
  const validateForm = (): boolean => {
    if (!name.trim()) {
      setFormError('Nama lengkap konsumen wajib diisi!');
      return false;
    }
    if (name.trim().length < 2) {
      setFormError('Nama konsumen minimal 2 karakter!');
      return false;
    }
    if (!phone.trim()) {
      setFormError('Nomor telepon wajib diisi!');
      return false;
    }
    if (!/^[0-9+\-\s()]{7,18}$/.test(phone.trim())) {
      setFormError('Format nomor telepon tidak valid!');
      return false;
    }
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setFormError('Format email tidak valid!');
      return false;
    }
    return true;
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      // Check duplicate phone (offline check)
      const duplicate = customers.find(c => c.phone.replace(/[\s\-()]/g, '') === phone.trim().replace(/[\s\-()]/g, ''));
      if (duplicate) {
        setFormError(`Nomor telepon ini sudah terdaftar atas nama ${duplicate.name}!`);
        return;
      }

      await addCustomer({
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        email: email.trim() || undefined,
        companyName: companyName.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      setShowAddForm(false);
      resetForm();
    } catch (err: any) {
      setFormError(err?.message || 'Gagal menambahkan konsumen.');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;
    if (!validateForm()) return;

    try {
      // Check duplicate phone excluding current
      const duplicate = customers.find(c => 
        c.id !== editingCustomer.id && 
        c.phone.replace(/[\s\-()]/g, '') === phone.trim().replace(/[\s\-()]/g, '')
      );
      if (duplicate) {
        setFormError(`Nomor telepon ini sudah digunakan oleh konsumen lain (${duplicate.name})!`);
        return;
      }

      await updateCustomer(editingCustomer.id, {
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        email: email.trim() || undefined,
        companyName: companyName.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      setEditingCustomer(null);
      resetForm();
    } catch (err: any) {
      setFormError(err?.message || 'Gagal mengubah data konsumen.');
    }
  };

  const handleDelete = async (cust: Customer) => {
    const associatedVehicles = vehicles.filter(v => v.customerId === cust.id);
    const vehicleMsg = associatedVehicles.length > 0 
      ? `\nKONSUMEN INI MEMILIKI ${associatedVehicles.length} KENDARAAN TERTAUT (Plat: ${associatedVehicles.map(v => v.plateNumber).join(', ')}).\n`
      : '';
    
    if (confirm(`Apakah Anda yakin ingin menghapus konsumen "${cust.name}"?${vehicleMsg}\nTindakan ini tidak dapat dibatalkan!`)) {
      try {
        await deleteCustomer(cust.id);
      } catch (err: any) {
        alert(err?.message || 'Gagal menghapus konsumen.');
      }
    }
  };

  const filteredCustomers = customers.filter(cust => {
    const q = searchQuery.toLowerCase();
    return (
      cust.name.toLowerCase().includes(q) ||
      cust.phone.toLowerCase().includes(q) ||
      (cust.companyName && cust.companyName.toLowerCase().includes(q)) ||
      (cust.address && cust.address.toLowerCase().includes(q)) ||
      (cust.email && cust.email.toLowerCase().includes(q)) ||
      cust.id.toLowerCase().includes(q)
    );
  });

  const getCustomerVehicles = (customerId: string) => {
    return vehicles.filter(v => v.customerId === customerId);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse p-4">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-7 bg-slate-200 rounded w-48"></div>
            <div className="h-4 bg-slate-150 rounded w-64"></div>
          </div>
          <div className="h-10 bg-slate-200 rounded-lg w-28"></div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm p-6 space-y-4">
          <div className="h-10 bg-slate-100 rounded w-full"></div>
          <div className="space-y-3 pt-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-slate-100 rounded w-full"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Manajemen Konsumen
          </h2>
          <p className="text-sm text-slate-500">Kelola database profil pelanggan dan riwayat kendaraan terdaftar</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium flex items-center gap-2 self-start sm:self-auto transition-colors shadow-sm"
        >
          <UserPlus className="w-4 h-4" />
          Tambah Konsumen
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Cari nama, No. Telp, perusahaan, email, alamat, atau ID..."
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="px-3 py-2 border border-slate-300 text-slate-600 hover:bg-slate-50 rounded text-xs font-semibold self-start sm:self-auto"
          >
            Bersihkan filter
          </button>
        )}
      </div>

      {/* Stats Quick Readout */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-50 p-3 border border-slate-200 rounded-lg flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-blue-100 flex items-center justify-center text-blue-700 font-bold shrink-0">
            {customers.length}
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Konsumen</div>
            <div className="text-xs font-bold text-slate-700">Terdaftar di Sistem</div>
          </div>
        </div>
        <div className="bg-slate-50 p-3 border border-slate-200 rounded-lg flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold shrink-0">
            {vehicles.length}
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Kendaraan</div>
            <div className="text-xs font-bold text-slate-700">Koleksi Terkait</div>
          </div>
        </div>
        <div className="bg-slate-50 p-3 border border-slate-200 rounded-lg flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-green-100 flex items-center justify-center text-green-700 font-bold shrink-0">
            {customers.filter(c => c.companyName).length}
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Klien Korporat</div>
            <div className="text-xs font-bold text-slate-700">Entitas Perusahaan</div>
          </div>
        </div>
      </div>

      {/* Customer List Container */}
      {filteredCustomers.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-lg border border-slate-200 shadow-sm text-slate-500">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="font-semibold text-slate-700 mb-1">Konsumen Tidak Ditemukan</h4>
          <p className="text-xs">Tidak ada data konsumen yang sesuai dengan kata kunci pencarian Anda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map(cust => {
            const custVehicles = getCustomerVehicles(cust.id);
            return (
              <div key={cust.id} className="bg-white border border-slate-200 rounded-lg shadow-sm hover:border-slate-300 hover:shadow transition-all p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  {/* Name and Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900 text-base truncate" title={cust.name}>
                        {cust.name}
                      </h3>
                      <p className="text-[10px] font-mono text-slate-400 mt-0.5">{cust.id}</p>
                    </div>
                    {cust.companyName && (
                      <span className="shrink-0 bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-black uppercase px-2 py-0.5 rounded flex items-center gap-1">
                        <Building className="w-3 h-3" />
                        {cust.companyName}
                      </span>
                    )}
                  </div>

                  {/* Details block */}
                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-mono">{cust.phone}</span>
                    </div>
                    {cust.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{cust.email}</span>
                      </div>
                    )}
                    {cust.address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{cust.address}</span>
                      </div>
                    )}
                    {cust.notes && (
                      <div className="flex items-start gap-2 bg-slate-50 p-2 rounded border border-slate-100 text-[11px] text-slate-500">
                        <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{cust.notes}</span>
                      </div>
                    )}
                  </div>

                  {/* Connected Vehicles */}
                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <Car className="w-3.5 h-3.5 text-blue-500" />
                        Kendaraan Terdaftar ({custVehicles.length})
                      </span>
                      {custVehicles.length > 3 && (
                        <span className="text-[9px] font-semibold text-slate-400 italic">
                          Scroll untuk semua ({custVehicles.length})
                        </span>
                      )}
                    </div>
                    {custVehicles.length === 0 ? (
                      <p className="text-[11px] text-slate-450 italic bg-slate-50 p-2 rounded border border-slate-150 text-center">
                        Belum ada kendaraan terkait
                      </p>
                    ) : (
                      <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200">
                        {custVehicles.map((v) => (
                          <div 
                            key={v.id} 
                            className="bg-slate-50 border border-slate-200 hover:border-slate-300 rounded p-2 text-[11px] space-y-1 hover:bg-slate-100/30 transition-colors"
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-mono font-bold text-slate-800 bg-white border border-slate-300 px-1.5 py-0.5 rounded shadow-2xs">
                                {v.plateNumber}
                              </span>
                              <span className="font-extrabold text-blue-600 uppercase text-[10px]">
                                {v.brand}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-slate-500 font-mono text-[9px] bg-slate-200/40 px-1.5 py-0.5 rounded border border-slate-150">
                              <span className="text-slate-400 uppercase text-[8px] font-bold">VIN / Rangka:</span>
                              <span className="font-black text-slate-700 tracking-wider">
                                {v.vin || <span className="text-slate-400 italic font-normal">TIDAK ADA VIN</span>}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions Row */}
                <div className="pt-3 border-t border-slate-100 flex justify-between items-center bg-slate-50/50 -mx-5 -mb-5 px-5 py-3 rounded-b-lg">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Gabung: {cust.createdAt ? new Date(cust.createdAt).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }) : '-'}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenEdit(cust)}
                      className="p-1.5 bg-white border border-slate-200 hover:border-blue-300 text-slate-600 hover:text-blue-600 rounded shadow-xs transition-colors"
                      title="Ubah Konsumen"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(cust)}
                      className="p-1.5 bg-white border border-slate-200 hover:border-red-300 text-slate-600 hover:text-red-600 rounded shadow-xs transition-colors"
                      title="Hapus Konsumen"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Customer Dialog Modal */}
      {(showAddForm || editingCustomer) && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-lg w-full animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-lg">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">
                {showAddForm ? 'Tambah Konsumen Baru' : 'Ubah Detail Konsumen'}
              </h3>
              <button
                onClick={() => { setShowAddForm(false); setEditingCustomer(null); }}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <form onSubmit={showAddForm ? handleAddSubmit : handleEditSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs font-bold rounded flex items-center gap-1.5">
                  ⚠️ {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nama Lengkap *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Budi Santoso"
                    className="w-full border border-slate-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">No. Telepon / WhatsApp *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 081234567890"
                    className="w-full border border-slate-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Email (Opsional)</label>
                  <input
                    type="email"
                    placeholder="Contoh: budi@company.com"
                    className="w-full border border-slate-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Perusahaan / Korporasi (Opsional)</label>
                  <input
                    type="text"
                    placeholder="Contoh: PT. Jasa Sejahtera"
                    className="w-full border border-slate-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Alamat Domisili</label>
                  <textarea
                    rows={2}
                    placeholder="Alamat lengkap konsumen..."
                    className="w-full border border-slate-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Catatan Tambahan</label>
                  <textarea
                    rows={2}
                    placeholder="Keterangan preferensi atau info penting lainnya..."
                    className="w-full border border-slate-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-600"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setShowAddForm(false); setEditingCustomer(null); }}
                  className="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 text-sm font-medium transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors shadow-sm"
                >
                  {showAddForm ? 'Tambah Konsumen' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
