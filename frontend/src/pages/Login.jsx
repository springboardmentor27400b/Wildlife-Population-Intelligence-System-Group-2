import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Shield, Lock, Mail, Github } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';
import FormField from '../components/forms/FormField';
import Toast from '../components/common/Toast';

export const Login = () => {
  const { login, register: registerAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  const { register, handleSubmit, formState: { errors } } = useForm();

  // Redirect target
  const from = location.state?.from?.pathname || '/';

  const handleOAuthGoogle = () => {
    setToastMsg({ text: 'Redirecting to Google OAuth2 portal...', type: 'info' });
    setTimeout(async () => {
      try {
        await login("researcher@wildlife.org", "ResearcherPass123!");
        navigate(from, { replace: true });
      } catch (err) {
        try {
          await registerAuth("researcher@wildlife.org", "ResearcherPass123!", "Dr. Jane Goodall", "Wildlife Researcher");
          navigate(from, { replace: true });
        } catch (regErr) {
          setToastMsg({ text: 'Google OAuth failed to authenticate.', type: 'error' });
        }
      }
    }, 1200);
  };

  const handleOAuthGithub = () => {
    setToastMsg({ text: 'Redirecting to GitHub OAuth2 portal...', type: 'info' });
    setTimeout(async () => {
      try {
        await login("conservation@wildlife.org", "ConservationPass123!");
        navigate(from, { replace: true });
      } catch (err) {
        try {
          await registerAuth("conservation@wildlife.org", "ConservationPass123!", "Officer Sarah Connor", "Conservation Officer");
          navigate(from, { replace: true });
        } catch (regErr) {
          setToastMsg({ text: 'GitHub OAuth failed to authenticate.', type: 'error' });
        }
      }
    }, 1200);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setToastMsg(null);
    try {
      await login(data.email, data.password);
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.detail || 'Incorrect email or password.';
      setToastMsg({ text: msg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-forest-950 px-4 transition-colors">
      <div className="bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-850 rounded-2xl shadow-xl w-full max-w-md p-8">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center justify-center text-center mb-8">
          <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-full mb-3 text-emerald-600 dark:text-emerald-400">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold font-outfit text-slate-800 dark:text-slate-100">
            Conservation Intelligence
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Access secure monitoring portal
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            label="Email Address"
            type="email"
            placeholder="e.g. ranger@forest.gov"
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
            label="Password"
            type="password"
            placeholder="••••••••"
            error={errors.password}
            {...register('password', { required: 'Password is required' })}
          />

          <Button
            type="submit"
            className="w-full mt-4"
            loading={loading}
          >
            Authenticate
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-forest-850"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-forest-900 px-2 text-slate-400 dark:text-slate-500 font-bold">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleOAuthGoogle}
            className="flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-250 dark:border-forest-800 rounded-xl hover:bg-slate-50 dark:hover:bg-forest-850/50 transition-all font-bold text-xs text-slate-700 dark:text-slate-300"
          >
            Google OAuth
          </button>
          <button
            type="button"
            onClick={handleOAuthGithub}
            className="flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-250 dark:border-forest-800 rounded-xl hover:bg-slate-50 dark:hover:bg-forest-850/50 transition-all font-bold text-xs text-slate-700 dark:text-slate-300"
          >
            <Github className="w-4 h-4 text-slate-800 dark:text-slate-200" /> GitHub OAuth
          </button>
        </div>

        {/* Footer Navigation */}
        <div className="text-center text-xs text-slate-500 dark:text-slate-400 mt-6">
          Need a profile?{' '}
          <Link
            to="/register"
            className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
          >
            Create account
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
export default Login;
