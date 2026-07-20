import React, { memo, useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Leaf, Camera, Fingerprint, Activity, Map, Trees, ArrowRight, ShieldCheck, BarChart3, Loader2, Eye, EyeOff } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { AuthContext } from '../context/AuthContext';
import { authService } from '../services/authService';

const LandingPage = memo(() => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  
  const [isLoginView, setIsLoginView] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('');
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    const fetchRoles = async () => {
      const fallbackRoles = ["Administrator", "Wildlife Researcher", "Conservation Officer", "Forest Department Officer"];
      try {
        const rolesData = await authService.getRoles();
        if (rolesData && rolesData.length > 0) {
          setRoles(rolesData.map(r => r.role_name || r.name || r));
        } else {
          setRoles(fallbackRoles);
        }
      } catch (err) {
        setRoles(fallbackRoles);
      }
    };
    fetchRoles();
  }, []);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      if (isLoginView) {
        const data = await authService.login(email, password);
        login(data.access_token, data.user);
        navigate('/dashboard');
      } else {
        await authService.register({
          full_name: fullName,
          email,
          password,
          role: role || 'Wildlife Researcher'
        });
        // Auto login after register
        const data = await authService.login(email, password);
        login(data.access_token, data.user);
        navigate('/dashboard');
      }
    } catch (err) {
      let errorMessage = "Authentication failed. Please try again.";
      if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          errorMessage = err.response.data.detail.map(e => `${e.loc.join('.')}: ${e.msg}`).join(', ');
        } else {
          errorMessage = err.response.data.detail;
        }
      } else if (err.customMessage) {
        errorMessage = err.customMessage;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setIsLoading(true);
    try {
      const data = await authService.loginWithGoogle(credentialResponse.credential);
      login(data.access_token, data.user);
      navigate('/dashboard');
    } catch (err) {
      let errorMessage = "Google authentication failed. Please try again.";
      if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          errorMessage = err.response.data.detail.map(e => `${e.loc.join('.')}: ${e.msg}`).join(', ');
        } else {
          errorMessage = err.response.data.detail;
        }
      } else if (err.customMessage) {
        errorMessage = err.customMessage;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden font-sans">
      
      {/* Glassmorphic Navbar */}
      <motion.nav 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 w-full z-50 glass"
      >
        <div className="flex items-center justify-between p-4 max-w-7xl mx-auto">
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div 
              whileHover={{ rotate: 180 }} 
              transition={{ duration: 0.5 }}
            >
              <Leaf className="text-primary h-8 w-8" />
            </motion.div>
            <span className="font-bold text-xl tracking-tight text-foreground">WPIS</span>
          </Link>
          <div className="flex gap-4 items-center">
            <Button variant="ghost" className="hidden sm:inline-flex" onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setIsLoginView(true);
            }}>
              Sign In
            </Button>
            <Button className="rounded-full px-6 shadow-md shadow-primary/20 hover:shadow-lg transition-all" onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setIsLoginView(false);
            }}>
              Get Started
            </Button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section with Custom Forest Gradient & Auth Form */}
      <section className="relative pt-32 pb-20 px-6 min-h-screen flex flex-col justify-center items-center overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -z-10 mix-blend-multiply"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-secondary/10 rounded-full blur-[120px] -z-10 mix-blend-multiply"></div>

        <div className="max-w-7xl mx-auto z-10 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Text */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-left"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <ShieldCheck className="h-4 w-4" /> Enterprise-Grade Conservation
            </motion.div>
            <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
              Wildlife Population <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Intelligence</span>
            </motion.h1>
            <motion.p variants={itemVariants} className="text-xl text-muted-foreground max-w-xl mb-10 leading-relaxed">
              AI-powered platform for wildlife conservation, biodiversity monitoring, intelligent species recognition and environmental analytics.
            </motion.p>
          </motion.div>

          {/* Right Auth Form */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto"
          >
            <Card className="glass-card border-white/20 shadow-2xl relative overflow-hidden">
              {/* Subtle top gradient line */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary"></div>
              
              <CardHeader className="space-y-1 text-center pt-8">
                <CardTitle className="text-2xl font-bold">
                  {isLoginView ? 'Welcome back' : 'Create an account'}
                </CardTitle>
                <CardDescription>
                  {isLoginView 
                    ? 'Enter your credentials to access your dashboard' 
                    : 'Join us to start monitoring wildlife populations'}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pb-8">
                {error && (
                  <div className="p-3 mb-4 text-sm text-destructive bg-destructive/10 rounded-md">
                    {error}
                  </div>
                )}

                {/* Google Sign In Button */}
                <div className="flex justify-center mb-6">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => setError('Google Sign In was unsuccessful. Try again.')}
                    useOneTap
                    shape="rectangular"
                    theme="outline"
                    text={isLoginView ? "signin_with" : "signup_with"}
                    size="large"
                  />
                </div>

                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-muted-foreground/20" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground rounded-full">
                      Or continue with email
                    </span>
                  </div>
                </div>

                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <AnimatePresence mode="wait">
                    {!isLoginView && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2 overflow-hidden"
                      >
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input 
                          id="fullName" 
                          name="fullName"
                          autoComplete="name"
                          placeholder="Jane Doe" 
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          required={!isLoginView}
                          className="bg-white/50 focus:bg-white transition-colors"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <AnimatePresence mode="wait">
                    {!isLoginView && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2 overflow-hidden"
                      >
                        <Label htmlFor="role">Role</Label>
                        <select 
                          id="role"
                          value={role}
                          onChange={(e) => setRole(e.target.value)}
                          required={!isLoginView}
                          className="flex h-10 w-full rounded-md border border-input bg-white/50 px-3 py-2 text-sm focus:bg-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <option value="" disabled>Select your role</option>
                          {roles.map(r => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      name="email"
                      autoComplete="email"
                      type="email" 
                      placeholder="name@example.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required 
                      className="bg-white/50 focus:bg-white transition-colors"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      {isLoginView && (
                        <a href="#" className="text-xs text-primary hover:underline">
                          Forgot password?
                        </a>
                      )}
                    </div>
                    <div className="relative">
                      <Input 
                        id="password" 
                        name="password"
                        autoComplete={isLoginView ? "current-password" : "new-password"}
                        type={showPassword ? "text" : "password"} 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={8}
                        className="bg-white/50 focus:bg-white transition-colors pr-10"
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait</>
                    ) : (
                      isLoginView ? 'Sign In' : 'Sign Up'
                    )}
                  </Button>
                </form>

                <div className="mt-6 text-center text-sm">
                  <span className="text-muted-foreground">
                    {isLoginView ? "Don't have an account? " : "Already have an account? "}
                  </span>
                  <button 
                    type="button" 
                    onClick={() => {
                      setIsLoginView(!isLoginView);
                      setError('');
                    }}
                    className="text-primary font-medium hover:underline"
                  >
                    {isLoginView ? 'Sign up' : 'Sign in'}
                  </button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-white soft-shadow relative z-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-border/50">
            {[
              { label: 'Species Tracked', value: '1,200+' },
              { label: 'Data Points', value: '4.5M' },
              { label: 'Active Sites', value: '350' },
              { label: 'Uptime', value: '99.9%' }
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center"
              >
                <h4 className="text-4xl font-bold text-foreground mb-2">{stat.value}</h4>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Future AI Modules */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Intelligent Modules</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our upcoming suite of AI-driven tools designed to revolutionize field research and conservation efforts.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { title: 'Wildlife Survey', icon: Map, desc: 'Plan and track detailed surveys.' },
            { title: 'Image Analysis', icon: Camera, desc: 'Automated AI classification of camera trap images.' },
            { title: 'Species ID', icon: Fingerprint, desc: 'Identify individual animals by unique markings.' },
            { title: 'Population Monitoring', icon: Activity, desc: 'Track population trends over time.' },
            { title: 'Habitat Intelligence', icon: Trees, desc: 'Analyze environmental changes and risks.' },
            { title: 'Conservation Planning', icon: BarChart3, desc: 'Generate actionable insights for conservation.' },
          ].map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              whileHover={{ y: -8 }}
            >
              <Card className="h-full border-0 soft-shadow soft-shadow-hover transition-all bg-white rounded-2xl overflow-hidden">
                <CardHeader className="p-8">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                  <CardDescription className="text-base leading-relaxed">{feature.desc}</CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-white py-12 px-6 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Leaf className="text-primary h-6 w-6" />
            <span className="font-bold text-foreground">WPIS Platform</span>
          </div>
          <div className="flex gap-8 text-sm font-medium text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
            <a href="#" className="hover:text-primary transition-colors">Documentation</a>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} WPIS. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
});

LandingPage.displayName = 'LandingPage';
export default LandingPage;
