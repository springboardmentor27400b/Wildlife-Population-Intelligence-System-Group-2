import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { profileAPI } from '../services/api';
import { User, Lock, CheckCircle, AlertTriangle } from 'lucide-react';

export default function Profile() {
  const { user, updateProfileState } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [profileMsg, setProfileMsg] = useState({ text: '', isError: false });
  const [pwdMsg, setPwdMsg] = useState({ text: '', isError: false });
  
  const [profileLoading, setProfileLoading] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name);
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg({ text: '', isError: false });
    setProfileLoading(true);

    try {
      const updated = await profileAPI.update({ full_name: fullName });
      updateProfileState(updated);
      setProfileMsg({ text: 'Profile details updated successfully.', isError: false });
    } catch (err) {
      console.error(err);
      setProfileMsg({ text: err.response?.data?.detail || 'Failed to update profile.', isError: true });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdMsg({ text: '', isError: false });

    if (password !== confirmPassword) {
      setPwdMsg({ text: 'New passwords do not match.', isError: true });
      return;
    }

    setPwdLoading(true);
    try {
      await profileAPI.update({ password });
      setPwdMsg({ text: 'Password changed successfully.', isError: false });
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error(err);
      setPwdMsg({ text: err.response?.data?.detail || 'Failed to change password.', isError: true });
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-zinc-100">User Profile Settings</h2>
        <p className="text-sm text-zinc-400 mt-1">Manage your telemetry credentials and credentials security settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Profile Card & Info Update */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center space-x-4 border-b border-zinc-800 pb-5">
            <div className="h-16 w-16 rounded-full bg-emerald-900/40 border border-emerald-700/30 flex items-center justify-center font-bold text-emerald-400 text-2xl">
              {user?.full_name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-zinc-200 text-lg leading-snug">{user?.full_name}</h3>
              <p className="text-xs text-zinc-500">{user?.email}</p>
              <div className="mt-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 bg-emerald-950/50 border border-emerald-900/30 px-2 py-0.5 rounded">
                  {user?.role} Role
                </span>
              </div>
            </div>
          </div>

          {profileMsg.text && (
            <div className={`p-3 rounded-lg text-xs font-semibold flex items-center justify-center space-x-2 ${
              profileMsg.isError 
                ? 'bg-red-950/50 border border-red-900/30 text-red-400' 
                : 'bg-emerald-950/50 border border-emerald-900/30 text-emerald-400'
            }`}>
              {profileMsg.isError ? <AlertTriangle size={14} /> : <CheckCircle size={14} />}
              <span>{profileMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-zinc-100 outline-none transition text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email}
                className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-850 text-zinc-600 rounded-xl outline-none text-sm cursor-not-allowed"
              />
              <span className="text-[10px] text-zinc-600 block">Email addresses cannot be modified directly. Contact your administrator.</span>
            </div>

            <button
              type="submit"
              disabled={profileLoading}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white rounded-xl font-bold text-sm shadow-lg active:scale-[0.98] transition cursor-pointer"
            >
              {profileLoading ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 border-b border-zinc-800 pb-4 mb-5">
              <Lock size={18} className="text-emerald-500" />
              <h3 className="font-bold text-zinc-200 text-sm uppercase tracking-wider">Change Password</h3>
            </div>

            {pwdMsg.text && (
              <div className={`p-3 rounded-lg text-xs font-semibold flex items-center justify-center space-x-2 mb-4 ${
                pwdMsg.isError 
                  ? 'bg-red-950/50 border border-red-900/30 text-red-400' 
                  : 'bg-emerald-950/50 border border-emerald-900/30 text-emerald-400'
              }`}>
                {pwdMsg.isError ? <AlertTriangle size={14} /> : <CheckCircle size={14} />}
                <span>{pwdMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">New Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-zinc-100 placeholder-zinc-700 outline-none transition text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-zinc-100 placeholder-zinc-700 outline-none transition text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={pwdLoading}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white rounded-xl font-bold text-sm shadow-lg active:scale-[0.98] transition cursor-pointer"
              >
                {pwdLoading ? 'Updating Password...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
