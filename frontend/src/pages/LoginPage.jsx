import React, { useState, useContext, memo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { authService } from '../services/authService';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Leaf, Eye, EyeOff, Loader2 } from 'lucide-react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const LoginPage = memo(() => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm({
    resolver: zodResolver(loginSchema)
  });

  React.useEffect(() => {
    const subscription = watch(() => setError(''));
    return () => subscription.unsubscribe();
  }, [watch]);

  React.useEffect(() => {
    setError('');
  }, []);

  const onSubmit = async (data) => {
    try {
      setError('');
      const response = await authService.login(data.email, data.password);
      if (response?.access_token && response?.user) {
        login(response.access_token, response.user);
        navigate('/dashboard');
      } else {
        setError('Invalid authentication data received from server.');
      }
    } catch (err) {
      let errorMessage = 'Unable to sign in. Please try again.';
      if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          errorMessage = err.response.data.detail.map(e => `${e.loc.join('.')}: ${e.msg}`).join(', ');
        } else {
          errorMessage = err.response.data.detail;
        }
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      setError(errorMessage);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsGoogleLoading(true);
    setError('');
    try {
      const response = await authService.loginWithGoogle(credentialResponse.credential);
      if (response?.access_token && response?.user) {
        login(response.access_token, response.user);
        navigate('/dashboard');
      } else {
        setError('Invalid authentication data received from server.');
      }
    } catch (err) {
      let errorMessage = 'Unable to sign in. Please try again.';
      if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          errorMessage = err.response.data.detail.map(e => `${e.loc.join('.')}: ${e.msg}`).join(', ');
        } else {
          errorMessage = err.response.data.detail;
        }
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      setError(errorMessage);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#F8FAF8]">
      {/* Background Decor */}
      <div className="absolute inset-0 w-full h-full pointer-events-none -z-10 overflow-hidden flex items-center justify-center">
        {/* Soft SVG-like background gradient */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[60%] bg-primary/20 rounded-[100%] blur-[120px] mix-blend-multiply opacity-70 animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[60%] bg-secondary/20 rounded-[100%] blur-[120px] mix-blend-multiply opacity-70 animate-pulse" style={{ animationDuration: '10s' }}></div>
      </div>

      <div className="w-full max-w-md px-4 py-8 z-10 my-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="flex justify-center mb-8">
            <Link to="/" className="flex items-center gap-2">
              <Leaf className="text-primary h-10 w-10" />
              <span className="font-bold text-2xl tracking-tight">WPIS</span>
            </Link>
          </div>

          <div className="glass-card rounded-2xl p-8 sm:p-10">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Welcome back</h2>
              <p className="text-sm text-muted-foreground mt-2">Enter your credentials to access the platform</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-lg flex items-center"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="space-y-2 relative group">
                <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground group-focus-within:text-primary transition-colors">Email Address</Label>
                <Input 
                  id="email"
                  name="email"
                  autoComplete="email" 
                  type="email" 
                  placeholder="name@company.com" 
                  className="h-12 bg-white/50 focus:bg-white transition-colors"
                  {...register('email')} 
                />
                {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
              </div>

              <div className="space-y-2 relative group">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground group-focus-within:text-primary transition-colors">Password</Label>
                  <span className="text-xs font-medium text-primary cursor-pointer hover:underline">Forgot password?</span>
                </div>
                <div className="relative">
                  <Input 
                    id="password" 
                    name="password"
                    autoComplete="current-password"
                    type={showPassword ? "text" : "password"} 
                    className="h-12 bg-white/50 focus:bg-white transition-colors pr-10"
                    placeholder="••••••••"
                    {...register('password')} 
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
              </div>

              <Button type="submit" className="w-full h-12 text-base font-semibold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30" disabled={isSubmitting || isGoogleLoading}>
                {isSubmitting ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Authenticating...</> : 'Sign In'}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-muted-foreground/20" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#F8FAF8] px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            {!googleClientId ? (
              <div className="flex flex-col items-center justify-center p-3 border border-dashed border-gray-300 rounded-xl bg-gray-50/50">
                <p className="text-xs text-muted-foreground text-center">Google sign-in is not configured yet. Please use email and password.</p>
              </div>
            ) : (
              <GoogleOAuthProvider clientId={googleClientId}>
                 <div className="flex justify-center w-full min-h-[40px]">
                   {isGoogleLoading ? (
                      <Button disabled variant="outline" className="w-full h-10 border-gray-300 text-gray-500">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Authenticating with Google...
                      </Button>
                   ) : (
                     <GoogleLogin 
                       onSuccess={handleGoogleSuccess}
                       onError={() => setError('Google sign-in was unsuccessful. Please try again.')}
                       useOneTap
                       width="100%"
                       theme="filled_blue"
                       shape="rectangular"
                       size="large"
                     />
                   )}
                 </div>
              </GoogleOAuthProvider>
            )}

            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account? <Link to="/register" className="font-semibold text-primary hover:underline transition-all">Request Access</Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
});
LoginPage.displayName = 'LoginPage';
export default LoginPage;
