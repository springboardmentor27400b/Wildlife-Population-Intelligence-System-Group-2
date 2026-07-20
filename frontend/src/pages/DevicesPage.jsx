import React, { useState, useEffect, useMemo, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Edit2, Trash2, MapPin, 
  Activity, AlertTriangle, ChevronDown, X, Camera, Mic, 
  Wifi, WifiOff, Battery, BatteryMedium, BatteryLow, Clock, ShieldAlert, Droplets, CloudRain
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'react-hot-toast';
import deviceService from '../services/deviceService';
import siteService from '../services/siteService';

const DEVICE_TYPES = ['Camera Trap', 'Acoustic Sensor', 'GPS Collar', 'Temperature Sensor', 'Weather Sensor', 'Water Quality Sensor'];
const STATUSES = ['Online', 'Offline', 'Maintenance'];

const INITIAL_FORM_DATA = {
  device_name: '', device_id: '', device_type: 'Camera Trap', monitoring_site_id: '',
  location: '', latitude: 0, longitude: 0, status: 'Online', battery_level: 100,
  last_active: 'Just now', notes: ''
};

const DevicesPage = () => {
  const { user } = useContext(AuthContext);
  
  const getRoleName = (roleObj) => {
    if (!roleObj) return "";
    return typeof roleObj === 'string' ? roleObj : (roleObj.name || roleObj.role_name || "");
  };
  const isAdmin = getRoleName(user?.role).toLowerCase() === "administrator";

  const [devices, setDevices] = useState([]);
  const [sites, setSites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [editingDeviceId, setEditingDeviceId] = useState(null);
  const [deviceToDelete, setDeviceToDelete] = useState(null);

  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [fetchedDevices, fetchedSites] = await Promise.all([
        deviceService.getDevices(),
        siteService.getSites()
      ]);
      setDevices(fetchedDevices);
      setSites(fetchedSites);
    } catch (error) {
      toast.error("Failed to load data.");
    } finally {
      setIsLoading(false);
    }
  };

  const summary = useMemo(() => {
    return {
      total: devices.length,
      online: devices.filter(d => d.status === 'Online').length,
      cameras: devices.filter(d => d.device_type === 'Camera Trap').length,
      attention: devices.filter(d => d.status === 'Offline' || d.status === 'Maintenance' || parseInt(d.battery_level) <= 20).length,
    };
  }, [devices]);

  const filteredDevices = useMemo(() => {
    return devices.filter(d => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = d.device_name.toLowerCase().includes(q) || 
                            d.device_id.toLowerCase().includes(q) ||
                            d.monitoring_site_name.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'All' || d.status === statusFilter;
      const matchesType = typeFilter === 'All' || d.device_type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [devices, searchQuery, statusFilter, typeFilter]);

  const handleOpenModal = (device = null) => {
    setFormErrors({});
    if (device) {
      setEditingDeviceId(device.id || device._id);
      setFormData({ 
        device_name: device.device_name,
        device_id: device.device_id,
        device_type: device.device_type,
        monitoring_site_id: device.monitoring_site_id,
        location: device.location,
        latitude: device.latitude,
        longitude: device.longitude,
        status: device.status,
        battery_level: device.battery_level,
        last_active: device.last_active,
        notes: device.notes || ''
      });
    } else {
      setEditingDeviceId(null);
      setFormData({ ...INITIAL_FORM_DATA });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDeviceId(null);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.device_name.trim()) errors.device_name = 'Device name is required';
    if (!formData.device_id.trim()) errors.device_id = 'Device ID is required';
    if (!formData.monitoring_site_id) errors.monitoring_site_id = 'Monitoring Site is required';
    if (!formData.location.trim()) errors.location = 'Location is required';
    if (formData.latitude < -90 || formData.latitude > 90) errors.latitude = 'Invalid latitude';
    if (formData.longitude < -180 || formData.longitude > 180) errors.longitude = 'Invalid longitude';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSiteChange = (e) => {
    const siteId = e.target.value;
    const selectedSite = sites.find(s => (s.id || s._id) === siteId);
    if (selectedSite) {
      setFormData({
        ...formData,
        monitoring_site_id: siteId,
        monitoring_site_name: selectedSite.site_name,
        location: selectedSite.location,
        latitude: selectedSite.latitude,
        longitude: selectedSite.longitude
      });
    } else {
      setFormData({ ...formData, monitoring_site_id: siteId, monitoring_site_name: '' });
    }
  };

  const handleSaveDevice = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const payload = {
        ...formData,
        monitoring_site_name: sites.find(s => (s.id || s._id) === formData.monitoring_site_id)?.site_name || formData.monitoring_site_name
      };

      if (editingDeviceId) {
        await deviceService.updateDevice(editingDeviceId, payload);
        toast.success("Device updated successfully");
      } else {
        await deviceService.createDevice(payload);
        toast.success("Device registered successfully");
      }
      handleCloseModal();
      fetchData();
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error(error.response.data.detail || "Not authorized.");
      } else if (error.response?.status === 404) {
        toast.error("Selected monitoring site was not found.");
      } else if (error.response?.status === 409) {
        toast.error("A device with this Device ID already exists.");
      } else {
        toast.error(editingDeviceId ? "Failed to update device" : "Failed to register device");
      }
    }
  };

  const confirmDelete = (id) => {
    setDeviceToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    try {
      await deviceService.deleteDevice(deviceToDelete);
      toast.success("Device deleted successfully");
      fetchData();
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error(error.response.data.detail || "Not authorized.");
      } else {
        toast.error("Failed to delete device");
      }
    } finally {
      setIsDeleteModalOpen(false);
      setDeviceToDelete(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Online': return 'bg-green-100 text-green-700 border-green-200';
      case 'Maintenance': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Offline': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Online': return <Wifi className="w-3 h-3 mr-1" />;
      case 'Maintenance': return <AlertTriangle className="w-3 h-3 mr-1" />;
      case 'Offline': return <WifiOff className="w-3 h-3 mr-1" />;
      default: return null;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Camera Trap': return <Camera className="w-5 h-5 text-blue-500" />;
      case 'Acoustic Sensor': return <Mic className="w-5 h-5 text-purple-500" />;
      case 'Weather Sensor': return <CloudRain className="w-5 h-5 text-cyan-500" />;
      case 'Water Quality Sensor': return <Droplets className="w-5 h-5 text-teal-500" />;
      case 'GPS Collar': return <MapPin className="w-5 h-5 text-indigo-500" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  const getBatteryIcon = (battery) => {
    const level = parseInt(battery) || 0;
    if (level > 60) return <Battery className="w-4 h-4 text-green-500" />;
    if (level > 20) return <BatteryMedium className="w-4 h-4 text-orange-500" />;
    return <BatteryLow className="w-4 h-4 text-red-500" />;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8 pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sensor Devices</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Register, monitor, and manage field sensing equipment.
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => handleOpenModal()} className="gap-2 bg-primary text-white hover:bg-primary/90">
            <Plus className="w-5 h-5" />
            Register Device
          </Button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 soft-shadow bg-white rounded-xl">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Activity className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Devices</p>
              <p className="text-2xl font-bold">{summary.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 soft-shadow bg-white rounded-xl">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <Wifi className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Online Devices</p>
              <p className="text-2xl font-bold">{summary.online}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 soft-shadow bg-white rounded-xl">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Camera className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Camera Traps</p>
              <p className="text-2xl font-bold">{summary.cameras}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 soft-shadow bg-white rounded-xl">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <ShieldAlert className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground leading-tight">Devices Requiring<br/>Attention</p>
              <p className="text-2xl font-bold text-red-600">{summary.attention}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl soft-shadow">
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            type="text" 
            placeholder="Search by name, ID, or location..." 
            className="pl-9 bg-gray-50 border-gray-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          <span className="text-sm text-muted-foreground font-medium hidden lg:inline-block">Filter:</span>
          
          <div className="relative w-full sm:w-48">
            <select 
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full appearance-none bg-gray-50 border border-gray-200 text-foreground text-sm rounded-md focus:ring-primary focus:border-primary block p-2.5 pr-8"
            >
              <option value="All">All Types</option>
              {DEVICE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>

          <div className="relative w-full sm:w-40">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full appearance-none bg-gray-50 border border-gray-200 text-foreground text-sm rounded-md focus:ring-primary focus:border-primary block p-2.5 pr-8"
            >
              <option value="All">All Statuses</option>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Device List */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : filteredDevices.length === 0 ? (
        <motion.div variants={itemVariants} className="bg-white rounded-xl soft-shadow p-12 flex flex-col items-center justify-center text-center border border-dashed border-gray-200">
          <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <Activity className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-foreground">No devices found</h3>
          <p className="text-muted-foreground mt-1 max-w-sm">
            We couldn't find any sensor devices matching your search criteria. Adjust your filters or register a new device.
          </p>
          <Button onClick={() => {setSearchQuery(''); setStatusFilter('All'); setTypeFilter('All');}} variant="outline" className="mt-4">
            Clear Filters
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-4">
          <AnimatePresence>
            {filteredDevices.map(device => (
              <motion.div 
                key={device.id || device._id} 
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="h-full border border-gray-100 shadow-sm hover:shadow-md transition-shadow bg-white rounded-xl overflow-hidden group">
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-50 rounded-lg border border-gray-100">
                          {getTypeIcon(device.device_type)}
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-foreground line-clamp-1">{device.device_name}</h3>
                          <p className="text-xs font-mono text-muted-foreground uppercase">{device.device_id}</p>
                        </div>
                      </div>
                      
                      {isAdmin && (
                        <div className="flex gap-1 ml-2 shrink-0">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => handleOpenModal(device)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => confirmDelete(device.id || device._id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-y-3 mt-4 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4 shrink-0" />
                        <span className="truncate">{device.monitoring_site_name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        {getBatteryIcon(device.battery_level)}
                        <div className="flex items-center gap-2 w-full">
                          <span>{device.battery_level}%</span>
                          <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden shrink-0">
                            <div className={`h-full ${device.battery_level > 60 ? 'bg-green-500' : device.battery_level > 20 ? 'bg-orange-500' : 'bg-red-500'}`} style={{ width: `${device.battery_level}%` }}></div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Activity className="h-4 w-4 shrink-0" />
                        <span className="truncate">{device.device_type}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4 shrink-0" />
                        <span className="truncate">{device.last_active}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-between items-center text-xs font-medium">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full border ${getStatusColor(device.status)}`}>
                      {getStatusIcon(device.status)}
                      {device.status}
                    </span>
                    <span className="text-muted-foreground">Installed: {new Date(device.created_at).toLocaleDateString() || 'Unknown'}</span>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Register/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={handleCloseModal}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold">{editingDeviceId ? 'Edit Device' : 'Register Device'}</h2>
                <Button variant="ghost" size="icon" onClick={handleCloseModal} className="h-8 w-8 rounded-full">
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="p-6 overflow-y-auto">
                <form id="device-form" onSubmit={handleSaveDevice} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="device_name">Device Name <span className="text-destructive">*</span></Label>
                      <Input 
                        id="device_name" value={formData.device_name} 
                        onChange={(e) => setFormData({...formData, device_name: e.target.value})} 
                        className={formErrors.device_name ? "border-destructive focus-visible:ring-destructive" : ""}
                        placeholder="e.g. Nilgiri Trail Camera 01"
                      />
                      {formErrors.device_name && <p className="text-xs text-destructive">{formErrors.device_name}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="device_id">Device ID <span className="text-destructive">*</span></Label>
                      <Input 
                        id="device_id" value={formData.device_id} 
                        onChange={(e) => setFormData({...formData, device_id: e.target.value})} 
                        className={`uppercase ${formErrors.device_id ? "border-destructive focus-visible:ring-destructive" : ""}`}
                        placeholder="e.g. CAM-MD-01"
                        disabled={!!editingDeviceId}
                      />
                      {formErrors.device_id && <p className="text-xs text-destructive">{formErrors.device_id}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="device_type">Device Type</Label>
                      <select 
                        id="device_type" value={formData.device_type} 
                        onChange={(e) => setFormData({...formData, device_type: e.target.value})}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        {DEVICE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="monitoring_site_id">Monitoring Site <span className="text-destructive">*</span></Label>
                      <select 
                        id="monitoring_site_id" value={formData.monitoring_site_id} 
                        onChange={handleSiteChange}
                        className={`flex h-10 w-full rounded-md border ${formErrors.monitoring_site_id ? 'border-destructive' : 'border-input'} bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`}
                      >
                        <option value="" disabled>Select a site...</option>
                        {sites.map(s => <option key={s.id || s._id} value={s.id || s._id}>{s.site_name}</option>)}
                      </select>
                      {formErrors.monitoring_site_id && <p className="text-xs text-destructive">{formErrors.monitoring_site_id}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">Location <span className="text-destructive">*</span></Label>
                      <Input 
                        id="location" value={formData.location} 
                        onChange={(e) => setFormData({...formData, location: e.target.value})} 
                        className={formErrors.location ? "border-destructive focus-visible:ring-destructive" : ""}
                        placeholder="e.g. Mudumalai"
                      />
                      {formErrors.location && <p className="text-xs text-destructive">{formErrors.location}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="latitude">Latitude</Label>
                      <Input 
                        id="latitude" type="number" step="any" value={formData.latitude} 
                        onChange={(e) => setFormData({...formData, latitude: parseFloat(e.target.value) || 0})} 
                        className={formErrors.latitude ? "border-destructive focus-visible:ring-destructive" : ""}
                      />
                      {formErrors.latitude && <p className="text-xs text-destructive">{formErrors.latitude}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="longitude">Longitude</Label>
                      <Input 
                        id="longitude" type="number" step="any" value={formData.longitude} 
                        onChange={(e) => setFormData({...formData, longitude: parseFloat(e.target.value) || 0})} 
                        className={formErrors.longitude ? "border-destructive focus-visible:ring-destructive" : ""}
                      />
                      {formErrors.longitude && <p className="text-xs text-destructive">{formErrors.longitude}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="last_active">Last Active</Label>
                      <Input 
                        id="last_active" value={formData.last_active} 
                        onChange={(e) => setFormData({...formData, last_active: e.target.value})} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <select 
                        id="status" value={formData.status} 
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="battery_level">Battery %</Label>
                      <div className="flex items-center gap-2">
                        <Input 
                          id="battery_level" type="number" min="0" max="100" value={formData.battery_level} 
                          onChange={(e) => setFormData({...formData, battery_level: parseInt(e.target.value) || 0})} 
                        />
                        <span className="text-muted-foreground text-sm">%</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <textarea 
                      id="notes" value={formData.notes} 
                      onChange={(e) => setFormData({...formData, notes: e.target.value})} 
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[80px] resize-y"
                      placeholder="Maintenance logs, physical condition, exact coordinates..."
                    ></textarea>
                  </div>
                </form>
              </div>
              
              <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 mt-auto">
                <Button type="button" variant="outline" onClick={handleCloseModal}>Cancel</Button>
                <Button type="submit" form="device-form" className="bg-primary hover:bg-primary/90 text-white">
                  {editingDeviceId ? 'Save Changes' : 'Register Device'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsDeleteModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden p-6 text-center"
            >
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Remove Device?</h3>
              <p className="text-muted-foreground mb-6">
                Are you sure you want to remove this device? This action cannot be undone and will detach all historical sync logs.
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" className="flex-1" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
                <Button variant="destructive" className="flex-1" onClick={executeDelete}>Remove</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DevicesPage;
