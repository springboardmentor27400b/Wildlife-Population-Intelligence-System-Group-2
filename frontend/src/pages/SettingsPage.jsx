import React, { useState, useEffect, useRef, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, User, Shield, Sliders, Info, Camera, Loader2, Save, Eye, EyeOff, CheckCircle2, AlertTriangle, Monitor, Moon, Sun
} from 'lucide-react';
import settingsService from '../services/settingsService';
import { toast } from 'react-hot-toast';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { AuthContext } from '../context/AuthContext';

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'preferences', label: 'Preferences', icon: Sliders },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'about', label: 'About System', icon: Info },
];

const SettingsPage = () => {
  const { user: authUser } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);
  
  // Data State
  const [profile, setProfile] = useState({
    full_name: '', email: '', phone_number: '', organization: '', designation: '', profile_picture: '',
    created_at: '', updated_at: '', role: ''
  });
  const [preferences, setPreferences] = useState({
    theme: 'System', language: 'en', notifications: true, autoRefresh: 30, dateFormat: 'YYYY-MM-DD', timeFormat: '24h'
  });
  
  // Security State
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [profData, prefData] = await Promise.all([
          settingsService.getProfile(),
          settingsService.getPreferences()
        ]);
        setProfile(profData);
        if (prefData) setPreferences(prefData);
      } catch (err) {
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handlePreferenceChange = (name, value) => {
    const newPrefs = { ...preferences, [name]: value };
    setPreferences(newPrefs);
    // Auto-save preferences
    settingsService.updatePreferences(newPrefs).then(() => {
      toast.success('Preferences updated');
      // Apply theme if implemented
      if (name === 'theme') {
        if (value === 'Dark') document.documentElement.classList.add('dark');
        else if (value === 'Light') document.documentElement.classList.remove('dark');
        else {
          if (window.matchMedia('(prefers-color-scheme: dark)').matches) document.documentElement.classList.add('dark');
          else document.documentElement.classList.remove('dark');
        }
      }
    }).catch(() => toast.error('Failed to update preferences'));
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await settingsService.updateProfile({
        full_name: profile.full_name,
        email: profile.email,
        phone_number: profile.phone_number,
        organization: profile.organization,
        designation: profile.designation,
        profile_picture: profile.profile_picture
      });
      toast.success('Profile saved successfully');
    } catch (err) {
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      return toast.error('Only JPG and PNG are allowed');
    }
    if (file.size > 2 * 1024 * 1024) {
      return toast.error('File size must be less than 2MB');
    }
    
    const reader = new FileReader();
    reader.onload = () => {
      setProfile(prev => ({ ...prev, profile_picture: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setProfile(prev => ({ ...prev, profile_picture: null }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) return toast.error('Passwords do not match');
    if (passwords.new.length < 8) return toast.error('Password must be at least 8 characters');
    
    setSaving(true);
    try {
      await settingsService.changePassword({
        old_password: passwords.current,
        new_password: passwords.new
      });
      toast.success('Password changed successfully');
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const calculateStrength = (pass) => {
    if (!pass) return 0;
    let s = 0;
    if (pass.length > 7) s += 25;
    if (/[A-Z]/.test(pass)) s += 25;
    if (/[0-9]/.test(pass)) s += 25;
    if (/[^A-Za-z0-9]/.test(pass)) s += 25;
    return s;
  };

  if (loading) {
    return (
      <div className="flex gap-6 animate-pulse">
        <div className="w-64 bg-gray-100 dark:bg-gray-800 rounded-2xl h-96 shrink-0 hidden md:block"></div>
        <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-2xl h-[600px]"></div>
      </div>
    );
  }

  return (
    <div className="pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-8 h-8 text-green-600" />
            Settings
          </h1>
        <p className="text-slate-500 text-sm mt-1 max-w-2xl">
            Configure system parameters and application defaults.
          </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 shrink-0 space-y-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                activeTab === tab.id 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800/50'
              }`}
            >
              <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-primary' : 'text-gray-400'}`} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-100 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-sm">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'profile' && (
                <div className="space-y-8">
                  <h2 className="text-lg font-bold">Profile Details</h2>
                  
                  <div className="flex items-center gap-6">
                    <div className="relative group">
                      <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 overflow-hidden flex items-center justify-center relative">
                        {profile.profile_picture ? (
                          <img loading="lazy" src={profile.profile_picture} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-10 h-10 text-gray-400" />
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                          <Camera className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <input type="file" 
                        accept="image/jpeg, image/png" 
                        ref={fileInputRef} 
                        onChange={handleAvatarUpload} 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer h-11 rounded-xl px-4 py-2.5 border-border/60 focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground/70 transition-all duration-300" 
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold mb-1">Profile Picture</p>
                      <p className="text-xs text-gray-500 mb-3">JPG or PNG. Max size 2MB.</p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>Upload New</Button>
                        {profile.profile_picture && (
                          <Button variant="ghost" size="sm" className="text-red-500" onClick={handleRemoveAvatar}>Remove</Button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-1">Full Name</label>
                      <Input name="full_name" value={profile.full_name || ''} onChange={handleProfileChange} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Email Address</label>
                      <Input name="email" value={profile.email || ''} onChange={handleProfileChange} type="email" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Phone Number</label>
                      <Input name="phone_number" value={profile.phone_number || ''} onChange={handleProfileChange} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Organization</label>
                      <Input name="organization" value={profile.organization || ''} onChange={handleProfileChange} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Designation</label>
                      <Input name="designation" value={profile.designation || ''} onChange={handleProfileChange} />
                    </div>
                  </div>
                  
                  <div className="pt-4 flex justify-end">
                    <Button onClick={handleSaveProfile} disabled={saving} className="gap-2">
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save Changes
                    </Button>
                  </div>
                </div>
              )}

              {activeTab === 'preferences' && (
                <div className="space-y-8">
                  <h2 className="text-lg font-bold">System Preferences</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
                      <h3 className="font-semibold mb-3 flex items-center gap-2"><Monitor className="w-4 h-4" /> Theme</h3>
                      <div className="flex gap-2 p-1 bg-gray-200 dark:bg-gray-800 rounded-lg w-fit">
                        {['Light', 'Dark', 'System'].map(t => (
                          <button 
                            key={t}
                            onClick={() => handlePreferenceChange('theme', t)}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${preferences.theme === t ? 'bg-white dark:bg-gray-700 shadow text-primary' : 'text-gray-500'}`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
                      <h3 className="font-semibold mb-3">Language</h3>
                      <select 
                        value={preferences.language} 
                        onChange={(e) => handlePreferenceChange('language', e.target.value)}
                        className="w-full h-10 rounded-xl bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-sm px-3 focus:ring-primary"
                      >
                        <option value="en">English (US)</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                      </select>
                    </div>

                    <div className="p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20 flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold">Push Notifications</h3>
                        <p className="text-xs text-gray-500">Receive system alerts</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={preferences.notifications} onChange={(e) => handlePreferenceChange('notifications', e.target.checked)} />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                      </label>
                    </div>

                    <div className="p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
                      <h3 className="font-semibold mb-3">Dashboard Auto-Refresh</h3>
                      <select 
                        value={preferences.autoRefresh} 
                        onChange={(e) => handlePreferenceChange('autoRefresh', parseInt(e.target.value))}
                        className="w-full h-10 rounded-xl bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-sm px-3 focus:ring-primary"
                      >
                        <option value={15}>Every 15 Seconds</option>
                        <option value={30}>Every 30 Seconds</option>
                        <option value={60}>Every 1 Minute</option>
                        <option value={300}>Every 5 Minutes</option>
                        <option value={0}>Manual</option>
                      </select>
                    </div>

                    <div className="p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
                      <h3 className="font-semibold mb-3">Date Format</h3>
                      <select 
                        value={preferences.dateFormat} 
                        onChange={(e) => handlePreferenceChange('dateFormat', e.target.value)}
                        className="w-full h-10 rounded-xl bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-sm px-3 focus:ring-primary"
                      >
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      </select>
                    </div>

                    <div className="p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
                      <h3 className="font-semibold mb-3">Time Format</h3>
                      <select 
                        value={preferences.timeFormat} 
                        onChange={(e) => handlePreferenceChange('timeFormat', e.target.value)}
                        className="w-full h-10 rounded-xl bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-sm px-3 focus:ring-primary"
                      >
                        <option value="24h">24-hour (14:30)</option>
                        <option value="12h">12-hour (02:30 PM)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-8">
                  <h2 className="text-lg font-bold">Account Security</h2>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                      <h3 className="font-semibold border-b pb-2 mb-4">Change Password</h3>
                      <div>
                        <label className="block text-sm font-medium mb-1">Current Password</label>
                        <div className="relative">
                          <Input 
                            type={showPassword ? "text" : "password"} 
                            value={passwords.current} 
                            onChange={(e) => setPasswords({...passwords, current: e.target.value})} 
                            required 
                          />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-gray-400">
                            {showPassword ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">New Password</label>
                        <Input 
                          type={showPassword ? "text" : "password"} 
                          value={passwords.new} 
                          onChange={(e) => setPasswords({...passwords, new: e.target.value})} 
                          required 
                        />
                        {passwords.new && (
                          <div className="mt-2">
                            <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all ${calculateStrength(passwords.new) < 50 ? 'bg-red-500' : calculateStrength(passwords.new) < 75 ? 'bg-orange-500' : 'bg-green-500'}`} 
                                style={{ width: `${calculateStrength(passwords.new)}%` }}
                              />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Strength: {calculateStrength(passwords.new) < 50 ? 'Weak' : calculateStrength(passwords.new) < 75 ? 'Medium' : 'Strong'}</p>
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Confirm Password</label>
                        <Input 
                          type={showPassword ? "text" : "password"} 
                          value={passwords.confirm} 
                          onChange={(e) => setPasswords({...passwords, confirm: e.target.value})} 
                          required 
                        />
                      </div>
                      <Button type="submit" disabled={saving} className="w-full">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Update Password
                      </Button>
                    </form>

                    <div>
                      <h3 className="font-semibold border-b pb-2 mb-4">Session Information</h3>
                      <div className="space-y-4">
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl text-sm">
                          <p className="text-gray-500 mb-1">Registered Email</p>
                          <p className="font-medium">{profile.email}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl text-sm">
                          <p className="text-gray-500 mb-1">User Role</p>
                          <p className="font-medium capitalize">{profile.role}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl text-sm">
                          <p className="text-gray-500 mb-1">Account Created</p>
                          <p className="font-medium">{new Date(profile.created_at).toLocaleString()}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl text-sm">
                          <p className="text-gray-500 mb-1">Last Profile Update</p>
                          <p className="font-medium">{profile.updated_at ? new Date(profile.updated_at).toLocaleString() : 'Not Available'}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl text-sm">
                          <p className="text-gray-500 mb-1">Last Login</p>
                          <p className="font-medium">Not Available</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'about' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 border-b pb-6">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                      <span className="text-primary font-bold text-2xl">WPIS</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Wildlife Population Intelligence System</h2>
                      <p className="text-sm text-gray-500">Version 1.0.0-beta</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-xl bg-gray-50 dark:bg-gray-800/50">
                      <h4 className="text-sm font-semibold text-gray-500 mb-2">Frontend Stack</h4>
                      <p className="font-medium">React + Vite + Tailwind CSS</p>
                    </div>
                    <div className="p-4 border rounded-xl bg-gray-50 dark:bg-gray-800/50">
                      <h4 className="text-sm font-semibold text-gray-500 mb-2">Backend Stack</h4>
                      <p className="font-medium">FastAPI (Python)</p>
                    </div>
                    <div className="p-4 border rounded-xl bg-gray-50 dark:bg-gray-800/50">
                      <h4 className="text-sm font-semibold text-gray-500 mb-2">Database</h4>
                      <p className="font-medium">MongoDB Atlas + Beanie ODM</p>
                    </div>
                    <div className="p-4 border rounded-xl bg-gray-50 dark:bg-gray-800/50">
                      <h4 className="text-sm font-semibold text-gray-500 mb-2">AI Engine</h4>
                      <p className="font-medium">TensorFlow / Keras</p>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t text-center text-sm text-gray-500">
                    <p>&copy; {new Date().getFullYear()} Wildlife Population Intelligence System. All rights reserved.</p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
