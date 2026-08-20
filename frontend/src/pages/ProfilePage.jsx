import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import api from '../services/api';
import { motion } from 'framer-motion';
import { Shield, Mail, Calendar, Key, User, CheckCircle2, AlertCircle, Loader2 , UserCircle} from 'lucide-react';

const ProfilePage = () => {
  const { user, login } = useContext(AuthContext);
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });
  
  const [passwords, setPasswords] = useState({ old_password: '', new_password: '' });
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passMsg, setPassMsg] = useState({ text: '', type: '' });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const res = await api.put('/auth/profile', { full_name: fullName });
      login(localStorage.getItem('token'), res.data); // update context
      setMsg({ text: 'Profile updated successfully.', type: 'success' });
      setTimeout(() => setMsg({ text: '', type: '' }), 4000);
    } catch (err) {
      setMsg({ text: err.response?.data?.detail || 'Update failed', type: 'error' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setIsChangingPass(true);
    try {
      await api.put('/auth/change-password', passwords);
      setPassMsg({ text: 'Password changed successfully.', type: 'success' });
      setPasswords({ old_password: '', new_password: '' });
      setTimeout(() => setPassMsg({ text: '', type: '' }), 4000);
    } catch (err) {
      setPassMsg({ text: err.response?.data?.detail || 'Change password failed', type: 'error' });
    } finally {
      setIsChangingPass(false);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="max-w-5xl mx-auto space-y-8">
      
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <UserCircle className="w-8 h-8 text-green-600" />
            Profile
          </h1>
          <p className="text-slate-500 text-sm mt-1 max-w-2xl">
            Manage your user account details and preferences.
          </p>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-12 gap-8">
        
        {/* Left Column: Profile Card */}
        <motion.div variants={item} className="md:col-span-4 space-y-6">
          <Card className="border-0 soft-shadow bg-white overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 rounded-2xl">
            <div className="h-32 bg-gradient-to-r from-primary/80 to-secondary/80 relative"></div>
            <CardContent className="px-6 pb-6 pt-0 flex flex-col items-center text-center relative -mt-16">
              <Avatar className="h-32 w-32 ring-4 ring-white shadow-lg mb-4">
                <AvatarImage src="" />
                <AvatarFallback className="text-4xl bg-primary/10 text-primary font-bold">
                  {user?.full_name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <h3 className="font-bold text-2xl text-foreground mb-1">{user?.full_name}</h3>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6">
                <Shield className="w-3.5 h-3.5" />
                {user?.role}
              </div>
              
              <div className="w-full space-y-3 text-sm text-left">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Mail className="w-4 h-4 text-foreground/50" />
                  <span className="truncate">{user?.email}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Calendar className="w-4 h-4 text-foreground/50" />
                  <span>Joined {new Date(user?.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Column: Forms */}
        <motion.div variants={item} className="md:col-span-8 space-y-6">
          
          {/* Edit Profile Form */}
          <Card className="border-0 soft-shadow bg-white shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 rounded-2xl">
            <CardHeader className="px-8 pt-8 pb-4">
              <CardTitle className="text-xl flex items-center gap-2">
                <User className="w-5 h-5 text-primary" /> Personal Information
              </CardTitle>
              <CardDescription>Update your display name.</CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                {msg.text && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className={`text-sm p-4 rounded-xl flex items-center gap-2 ${msg.type === 'success' ? 'bg-secondary/10 text-secondary' : 'bg-destructive/10 text-destructive'}`}>
                    {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {msg.text}
                  </motion.div>
                )}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2 group">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground group-focus-within:text-primary transition-colors">Email Address</Label>
                    <Input value={user?.email || ''} disabled className="h-12 bg-gray-50/50 cursor-not-allowed" />
                  </div>
                  <div className="space-y-2 group">
                    <Label htmlFor="full_name" className="text-xs uppercase tracking-wider text-muted-foreground group-focus-within:text-primary transition-colors">Full Name</Label>
                    <Input 
                      id="full_name" 
                      value={fullName} 
                      onChange={e => setFullName(e.target.value)} 
                      className="h-12 bg-white focus:bg-white transition-colors"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button type="submit" disabled={isUpdating} className="rounded-xl px-6 h-11">
                    {isUpdating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin"/> Saving...</> : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Change Password Form */}
          <Card className="border-0 soft-shadow bg-white shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 rounded-2xl">
            <CardHeader className="px-8 pt-8 pb-4">
              <CardTitle className="text-xl flex items-center gap-2">
                <Key className="w-5 h-5 text-primary" /> Security
              </CardTitle>
              <CardDescription>Update your password to keep your account secure.</CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <form onSubmit={handleChangePassword} className="space-y-6">
                {passMsg.text && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className={`text-sm p-4 rounded-xl flex items-center gap-2 ${passMsg.type === 'success' ? 'bg-secondary/10 text-secondary' : 'bg-destructive/10 text-destructive'}`}>
                    {passMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {passMsg.text}
                  </motion.div>
                )}
                
                <div className="space-y-2 group">
                  <Label htmlFor="old_password" className="text-xs uppercase tracking-wider text-muted-foreground group-focus-within:text-primary transition-colors">Current Password</Label>
                  <Input 
                    id="old_password" 
                    type="password" 
                    value={passwords.old_password}
                    onChange={e => setPasswords({...passwords, old_password: e.target.value})}
                    required
                    className="h-12 max-w-md bg-white focus:bg-white transition-colors"
                  />
                </div>
                <div className="space-y-2 group">
                  <Label htmlFor="new_password" className="text-xs uppercase tracking-wider text-muted-foreground group-focus-within:text-primary transition-colors">New Password</Label>
                  <Input 
                    id="new_password" 
                    type="password"
                    value={passwords.new_password}
                    onChange={e => setPasswords({...passwords, new_password: e.target.value})}
                    required
                    className="h-12 max-w-md bg-white focus:bg-white transition-colors"
                  />
                </div>
                
                <div className="flex justify-end">
                  <Button type="submit" disabled={isChangingPass} className="rounded-xl px-6 h-11">
                    {isChangingPass ? <><Loader2 className="w-4 h-4 mr-2 animate-spin"/> Updating...</> : 'Update Password'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

        </motion.div>
      </div>
    </motion.div>
  );
};

export default ProfilePage;
