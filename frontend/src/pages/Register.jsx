import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';
import FormField from '../components/forms/FormField';
import SelectField from '../components/forms/SelectField';
import Toast from '../components/common/Toast';
import { USER_ROLES } from '../utils/constants';

export const Register = () => {
  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const roleOptions = Object.values(USER_ROLES).map(role => ({
    value: role,
    label: role
  }));

  const onSubmit = async (data) => {
    setLoading(true);
    setToastMsg(null);
    try {
      await registerAuth(data.email, data.password, data.full_name, data.role);
      setToastMsg({ text: 'Registration successful!', type: 'success' });
      setTimeout(() => navigate('/'), 1000);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.detail || 'Registration failed. Try again.';
      setToastMsg({ text: msg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-forest-950 px-4 transition-colors">
      <div className="bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-850 rounded-2xl shadow-xl w-full max-w-md p-8">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center justify-center text-center mb-6">
          <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-full mb-3 text-emerald-600 dark:text-emerald-400">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold font-outfit text-slate-800 dark:text-slate-100">
            Join Platform
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Register wildlife monitoring profile
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            label="Full Name"
            type="text"
            placeholder="e.g. Ranger John"
            error={errors.full_name}
            {...register('full_name', { required: 'Name is required' })}
          />

          <FormField
            label="Email Address"
            type="email"
            placeholder="e.g. name@agency.org"
            error={errors.email}
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[\w\.-]+@[\w\.-]+\.\w+$/,
                message: 'Invalid email format'
              }
            })}
          />

          <FormField
            label="Password (min 6 chars)"
            type="password"
            placeholder="••••••••"
            error={errors.password}
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters'
              }
            })}
          />

          <SelectField
            label="Designation Role"
            options={roleOptions}
            error={errors.role}
            {...register('role', { required: 'Role is required' })}
          />

          <Button
            type="submit"
            className="w-full mt-4"
            loading={loading}
          >
            Create Profile
          </Button>
        </form>

        {/* Footer Navigation */}
        <div className="text-center text-xs text-slate-500 dark:text-slate-400 mt-6">
          Have an account?{' '}
          <Link
            to="/login"
            className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
          >
            Log in
          </Link>
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
export default Register;
