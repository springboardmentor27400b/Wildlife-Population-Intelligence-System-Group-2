import React, { useState, useEffect, useRef, memo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '../services/authService';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Leaf, Eye, EyeOff, Loader2, ChevronDown, Check, UserIcon, Shield, Search, Trees } from 'lucide-react';

const registerSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirm_password: z.string(),
  role: z.string().min(1, "Please select your role to continue.")
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});

const roleDetails = {
  'Administrator': {
    icon: Shield,
    desc: "Manage users, roles, platform settings, and all system records."
  },
  'Wildlife Researcher': {
    icon: Search,
    desc: "Record observations, manage surveys, and analyse wildlife data."
  },
  'Conservation Officer': {
    icon: Leaf,
    desc: "Monitor conservation activities, sites, and protection actions."
  },
  'Forest Department Officer': {
    icon: Trees,
    desc: "Manage forest-area monitoring, field data, and official reports."
  }
};

const CustomSelect = ({ value, onChange, options, error }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const SelectedIcon = value && roleDetails[value] ? roleDetails[value].icon : UserIcon;

  return (
    <div className="relative" ref={containerRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-12 w-full cursor-pointer items-center justify-between rounded-md border ${error ? 'border-destructive' : 'border-input'} bg-white/50 px-3 py-2 text-sm shadow-sm transition-colors hover:bg-white/80 focus:outline-none focus:ring-2 focus:ring-ring`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') setIsOpen(!isOpen);
        }}
      >
        <div className="flex items-center gap-2">
          {value && <SelectedIcon className="h-4 w-4 text-primary" />}
          <span className={value ? "text-foreground font-medium" : "text-muted-foreground"}>
            {value || "Select your role"}
          </span>
        </div>
        <ChevronDown className={`h-4 w-4 opacity-50 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 mt-1 max-h-80 w-full overflow-auto rounded-md border bg-white shadow-xl"
          >
            <ul className="p-1">
              {options.map((option) => {
                const details = roleDetails[option] || { icon: UserIcon, desc: "" };
                const Icon = details.icon;
                return (
                  <li
                    key={option}
                    onClick={() => {
                      onChange(option);
                      setIsOpen(false);
                    }}
                    className="flex flex-col cursor-pointer rounded-sm px-3 py-2 text-sm hover:bg-primary/5 border-b last:border-b-0 border-gray-50"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 font-medium text-foreground">
                        <Icon className="h-4 w-4 text-primary opacity-80" />
                        {option}
                      </div>
                      {value === option && <Check className="h-4 w-4 text-primary" />}
                    </div>
                    {details.desc && (
                      <p className="text-xs text-muted-foreground pl-6 pr-2">{details.desc}</p>
                    )}
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
      {value && roleDetails[value] && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-muted-foreground mt-2 px-1 leading-tight">
          {roleDetails[value].desc}
        </motion.p>
      )}
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
};

const RegisterPage = memo(() => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [roles, setRoles] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register: registerForm, handleSubmit, control, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(registerSchema)
  });

  useEffect(() => {
    const fetchRoles = async () => {
      const fallbackRoles = ["Wildlife Researcher"];
      try {
        const rolesData = await authService.getRoles();
        if (rolesData && rolesData.length > 0) {
          setRoles(rolesData.map(r => r.role_name || r.name || r));
        } else {
          setRoles(fallbackRoles);
        }
      } catch (err) {
        console.error("Failed to fetch roles, using fallback");
        setRoles(fallbackRoles);
      }
    };
    fetchRoles();
  }, []);

  const onSubmit = async (data) => {
    try {
      setError('');
      await authService.register({
        full_name: data.full_name,
        email: data.email,
        password: data.password,
        role: data.role
      });
      navigate('/login');
    } catch (err) {
      let errorMessage = '';
      if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          errorMessage = err.response.data.detail.map(e => `${e.loc.join('.')}: ${e.msg}`).join(', ');
        } else {
          errorMessage = err.response.data.detail;
        }
      } else if (err.customMessage) {
        errorMessage = err.customMessage;
      } else {
        errorMessage = 'Authentication failed. Please try again.';
      }
      setError(errorMessage);
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
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="flex justify-center mb-8">
            <Link to="/" className="flex items-center gap-2 group">
              <motion.div whileHover={{ rotate: 180 }} transition={{ duration: 0.5 }}>
                <Leaf className="text-primary h-12 w-12 drop-shadow-md" />
              </motion.div>
              <span className="font-extrabold text-3xl tracking-tight text-foreground">WPIS</span>
            </Link>
          </div>

          <div className="glass-card rounded-3xl p-8 sm:p-10 border border-white/60 shadow-2xl shadow-primary/10 relative overflow-visible">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Request Access</h2>
              <p className="text-sm text-muted-foreground mt-2">Join the intelligent wildlife conservation platform.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0, scale: 0.9 }}
                    animate={{ opacity: 1, height: 'auto', scale: 1 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-4 rounded-xl flex flex-col gap-2"
                  >
                    <div>{error}</div>
                    {error.includes("An account already exists with this email") && (
                      <Link to="/login" className="inline-flex items-center justify-center w-full px-4 py-2 mt-2 text-sm font-medium text-white bg-destructive hover:bg-destructive/90 rounded-md transition-colors">
                        Go to Sign in
                      </Link>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="space-y-1.5 relative group">
                <Label htmlFor="full_name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground group-focus-within:text-primary transition-colors">Full Name</Label>
                <Input id="full_name" name="full_name" autoComplete="name" placeholder="John Doe" className="h-12 bg-white/50 focus:bg-white transition-colors" {...registerForm('full_name')} />
                {errors.full_name && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-destructive">{errors.full_name.message}</motion.p>}
              </div>

              <div className="space-y-1.5 relative group">
                <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground group-focus-within:text-primary transition-colors">Email Address</Label>
                <Input id="email" name="email" autoComplete="email" type="email" placeholder="name@company.com" className="h-12 bg-white/50 focus:bg-white transition-colors" {...registerForm('email')} />
                {errors.email && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-destructive">{errors.email.message}</motion.p>}
              </div>

              <div className="space-y-1.5 relative group">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground group-focus-within:text-primary transition-colors">Role</Label>
                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <CustomSelect 
                      options={roles} 
                      value={field.value} 
                      onChange={field.onChange} 
                      error={errors.role?.message}
                    />
                  )}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5 relative group">
                  <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground group-focus-within:text-primary transition-colors">Password</Label>
                  <div className="relative">
                    <Input id="password" name="password" autoComplete="new-password" type={showPassword ? "text" : "password"} className="h-12 bg-white/50 focus:bg-white transition-colors pr-10" {...registerForm('password')} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.password && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-destructive">{errors.password.message}</motion.p>}
                </div>

                <div className="space-y-1.5 relative group">
                  <Label htmlFor="confirm_password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground group-focus-within:text-primary transition-colors">Confirm</Label>
                  <div className="relative">
                    <Input id="confirm_password" name="confirm_password" autoComplete="new-password" type={showConfirmPassword ? "text" : "password"} className="h-12 bg-white/50 focus:bg-white transition-colors pr-10" {...registerForm('confirm_password')} />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground">
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.confirm_password && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-destructive">{errors.confirm_password.message}</motion.p>}
                </div>
              </div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button type="submit" className="w-full h-12 text-base font-semibold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 mt-4 bg-primary hover:bg-primary/90 text-white transition-all" disabled={isSubmitting}>
                  {isSubmitting ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Registering...</> : 'Create Account'}
                </Button>
              </motion.div>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account? <Link to="/login" className="font-semibold text-primary hover:underline transition-all hover:text-primary/80">Sign In</Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
});
RegisterPage.displayName = 'RegisterPage';
export default RegisterPage;
