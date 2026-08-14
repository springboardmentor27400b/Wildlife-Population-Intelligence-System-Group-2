import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { User, Mail, Shield, AlertTriangle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { updateProfile } from '../api/users';
import Button from '../components/common/Button';
import FormField from '../components/forms/FormField';
import Toast from '../components/common/Toast';
import Card from '../components/common/Card';

export const Profile = () => {
  const { user, login } = useAuth(); // We can reload user in state if context supports
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);
  
  // Reload page helper or update context user:
  // To keep simple, we can update localStorage and refresh window or trigger context refresh.
  // AuthContext automatically pulls silenty from getProfile on boot, so we update and trigger success toast.
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      full_name: user?.full_name || '',
      email: user?.email || '',
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setToastMsg(null);
    try {
      const updatedUser = await updateProfile(data);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      // Re-read profile
      setToastMsg({ text: 'Profile updated successfully!', type: 'success' });
      setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.detail || 'Failed to update profile settings.';
      setToastMsg({ text: msg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div>
        <h2 className="text-xl font-bold font-outfit text-slate-800 dark:text-slate-100">
          Account Settings
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          View credential attributes and adjust details
        </p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Identity details */}
          <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-forest-950/40 rounded-xl border border-slate-150 dark:border-forest-850">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold text-lg">
              {user?.full_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {user?.full_name}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-slate-450 mt-0.5">
                <Shield className="w-3.5 h-3.5 text-emerald-600" />
                <span>{user?.role}</span>
              </div>
            </div>
          </div>

          <FormField
            label="Edit Full Name"
            type="text"
            error={errors.full_name}
            {...register('full_name', { required: 'Name is required' })}
          />

          <FormField
            label="Edit Email Address"
            type="email"
            error={errors.email}
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[\w\.-]+@[\w\.-]+\.\w+$/,
                message: 'Invalid email format'
              }
            })}
          />

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              loading={loading}
            >
              Save Settings
            </Button>
          </div>
        </form>
      </Card>

      {/* Security alert card */}
      <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-250 dark:border-amber-900 rounded-xl flex gap-3 text-xs text-amber-800 dark:text-amber-300">
        <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
        <div>
          <span className="font-semibold block mb-0.5">Role Restricted Access</span>
          You are currently logged in with **{user?.role}** access keys. Contact your database administrator if you require higher authority privileges.
        </div>
      </div>

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
export default Profile;
