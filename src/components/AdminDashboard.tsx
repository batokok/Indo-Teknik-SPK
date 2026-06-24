import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { User } from '../types';
import { Users, UserPlus, ShieldAlert, Key, Ban, Edit, Trash2 } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { users, addUser, updateUser, deleteUser } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUser, setNewUser] = useState<Partial<User>>({ role: 'SA', status: 'ACTIVE' });
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editPassword, setEditPassword] = useState('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUser.name && newUser.username && newUser.password && newUser.role) {
      addUser(newUser as Omit<User, 'id'>);
      setShowAddForm(false);
      setNewUser({ role: 'SA', status: 'ACTIVE' });
    }
  };

  const handlePasswordUpdate = (id: string) => {
    if (editPassword) {
      updateUser(id, { password: editPassword });
      setEditingUserId(null);
      setEditPassword('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">User Management</h2>
          <p className="text-sm text-slate-500">Control system access and roles</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold mb-4">Create New User</h3>
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  className="w-full border border-slate-300 rounded p-2"
                  value={newUser.name || ''}
                  onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                <input
                  type="text"
                  required
                  className="w-full border border-slate-300 rounded p-2"
                  value={newUser.username || ''}
                  onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  className="w-full border border-slate-300 rounded p-2"
                  value={newUser.password || ''}
                  onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                <select
                  className="w-full border border-slate-300 rounded p-2"
                  value={newUser.role}
                  onChange={e => setNewUser({ ...newUser, role: e.target.value as User['role'] })}
                >
                  <option value="SA">Service Advisor</option>
                  <option value="MECHANIC">Mechanic</option>
                  <option value="FOREMAN">Foreman</option>
                  <option value="ADMIN">Super Admin</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Create User
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {users.map(user => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
                      {user.name.charAt(0)}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-slate-900">{user.name}</div>
                      <div className="text-sm text-slate-500">{user.username}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                    user.role === 'FOREMAN' ? 'bg-orange-100 text-orange-800' :
                    user.role === 'SA' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {editingUserId === user.id ? (
                    <div className="flex items-center justify-end gap-2">
                      <input
                        type="password"
                        placeholder="New password"
                        className="border border-slate-300 rounded px-2 py-1 text-sm w-32"
                        value={editPassword}
                        onChange={(e) => setEditPassword(e.target.value)}
                      />
                      <button onClick={() => handlePasswordUpdate(user.id)} className="text-green-600 hover:text-green-900 text-xs font-bold">Save</button>
                      <button onClick={() => { setEditingUserId(null); setEditPassword(''); }} className="text-slate-500 hover:text-slate-700 text-xs font-bold">Cancel</button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => setEditingUserId(user.id)}
                        className="text-slate-400 hover:text-blue-600"
                        title="Reset Password"
                      >
                        <Key className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => updateUser(user.id, { status: user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' })}
                        className={`${user.status === 'ACTIVE' ? 'text-slate-400 hover:text-orange-600' : 'text-orange-600 hover:text-green-600'}`}
                        title={user.status === 'ACTIVE' ? 'Suspend User' : 'Activate User'}
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="text-slate-400 hover:text-red-600"
                        title="Delete User"
                        disabled={user.username === 'admin'} // prevent deleting initial admin
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
