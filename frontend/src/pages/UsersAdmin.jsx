import React, { useEffect, useState } from 'react';
import { listUsers, updateUserRole, deleteUser } from '../api/users';
import { useAuth } from '../hooks/useAuth';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Spinner from '../components/common/Spinner';
import Toast from '../components/common/Toast';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { Search, UserCheck, ShieldAlert, Trash2, Edit2, AlertCircle } from 'lucide-react';

export const UsersAdmin = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMsg, setToastMsg] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [targetRole, setTargetRole] = useState('');
  const [deleteUserId, setDeleteUserId] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await listUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
      setToastMsg({ text: 'Failed to retrieve user registry.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRoleChange = async () => {
    if (!editUser || !targetRole) return;
    try {
      await updateUserRole(editUser.id, targetRole);
      setToastMsg({ text: `Updated ${editUser.full_name}'s role successfully!`, type: 'success' });
      setEditUser(null);
      loadData();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.detail || 'Failed to update user authorization role.';
      setToastMsg({ text: msg, type: 'error' });
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteUserId) return;
    try {
      await deleteUser(deleteUserId);
      setToastMsg({ text: 'User profile permanently removed.', type: 'success' });
      setDeleteUserId(null);
      loadData();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.detail || 'Failed to remove user profile.';
      setToastMsg({ text: msg, type: 'error' });
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleColor = (role) => {
    switch (role) {
      case 'Administrator':
        return 'rose';
      case 'Wildlife Researcher':
        return 'blue';
      case 'Conservation Officer':
        return 'emerald';
      case 'Forest Department Officer':
        return 'amber';
      default:
        return 'slate';
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold font-outfit text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <UserCheck className="w-6 h-6 text-emerald-600" />
          Users & Access Roles Registry
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          View all registered accounts, change authorization levels, and delete inactive profiles.
        </p>
      </div>

      {/* Control panel search bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 wrapper text-slate-400" />
          <input
            type="text"
            placeholder="Search users name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 w-full text-xs bg-white dark:bg-forest-900 border rounded-xl focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Users table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-forest-950/40 border-b text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                <th className="py-4 px-6">Name</th>
                <th className="py-4 px-6">Email</th>
                <th className="py-4 px-6">System Role</th>
                <th className="py-4 px-6">Registered Date</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-forest-850">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-400 font-medium">
                    No users found matching query parameters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-forest-950/10">
                    <td className="py-4 px-6 font-bold text-slate-800 dark:text-slate-200">
                      {u.full_name}
                      {u.id === currentUser?.id && (
                        <span className="ml-1.5 text-[9px] bg-slate-100 dark:bg-forest-800 text-slate-500 px-1.5 py-0.5 rounded font-mono">
                          You
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-slate-500 dark:text-slate-400 font-mono">
                      {u.email}
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant={getRoleColor(u.role)}>
                        {u.role}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-slate-400">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-right space-x-1.5">
                      <button
                        onClick={() => {
                          setEditUser(u);
                          setTargetRole(u.role);
                        }}
                        disabled={u.id === currentUser?.id}
                        className={`p-1.5 rounded-lg border text-slate-600 dark:text-slate-450 hover:bg-slate-100 dark:hover:bg-forest-800 transition-colors inline-flex ${
                          u.id === currentUser?.id ? 'opacity-40 cursor-not-allowed' : ''
                        }`}
                        title="Edit user role authorization"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteUserId(u.id)}
                        disabled={u.id === currentUser?.id}
                        className={`p-1.5 rounded-lg border border-rose-100 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors inline-flex ${
                          u.id === currentUser?.id ? 'opacity-40 cursor-not-allowed' : ''
                        }`}
                        title="Delete user profile"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Role Editor Modal */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-forest-900 border rounded-2xl w-full max-w-sm p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold font-outfit text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <ShieldAlert className="w-5 h-5 text-indigo-650" />
              Adjust Access Authority
            </h3>
            
            <div className="space-y-1 text-xs">
              <p className="font-semibold text-slate-700 dark:text-slate-350">
                User: <span className="font-bold text-slate-900 dark:text-slate-100">{editUser.full_name}</span>
              </p>
              <p className="text-[10px] text-slate-400">
                Current Role: <span className="font-semibold">{editUser.role}</span>
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400 block">Select Role</label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-forest-950 border rounded-xl focus:outline-none focus:border-emerald-500 text-xs font-semibold"
              >
                <option value="Administrator">Administrator</option>
                <option value="Wildlife Researcher">Wildlife Researcher</option>
                <option value="Conservation Officer">Conservation Officer</option>
                <option value="Forest Department Officer">Forest Department Officer</option>
              </select>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setEditUser(null)}
                className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-655 hover:bg-slate-50 dark:hover:bg-forest-850"
              >
                Cancel
              </button>
              <button
                onClick={handleRoleChange}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Confirmation */}
      {deleteUserId && (
        <ConfirmDialog
          title="Delete User Account"
          message="Are you absolutely sure you want to permanently delete this user account? This profile registry cannot be restored and all linked observations records metadata association will be set to null."
          onConfirm={handleDeleteUser}
          onCancel={() => setDeleteUserId(null)}
        />
      )}

      {toastMsg && (
        <Toast
          message={toastMsg.text}
          type={toastMsg.type}
          onClose={() => setToastMsg(null)}
        />
      )}
    </div>
  );
};

export default UsersAdmin;
