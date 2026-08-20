import React, { useState, useEffect, useMemo, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Edit2, Trash2, Camera,
  FileText, Activity, MapPin, Target, CheckCircle2,
  Clock, X, Check, XCircle, ChevronDown, User, AlertTriangle, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight
, ClipboardList} from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'react-hot-toast';

import observationService from '../services/observationService';
import siteService from '../services/siteService';
import deviceService from '../services/deviceService';
import uploadService from '../services/uploadService';

const OBSERVATION_TYPES = ['Camera Trap', 'Direct Sighting', 'Audio Detection', 'Survey Record', 'AI Detection'];
const STATUSES = ['Pending Validation', 'Verified', 'Rejected'];

const getLocalISOString = () => {
  const tzoffset = (new Date()).getTimezoneOffset() * 60000;
  return (new Date(Date.now() - tzoffset)).toISOString().slice(0, 16);
};

const INITIAL_FORM_DATA = {
  species_name: '',
  scientific_name: '',
  observation_type: 'Direct Sighting',
  monitoring_site_id: '',
  sensor_device_id: '',
  field_upload_id: '',
  observed_at: getLocalISOString(),
  count: 1,
  confidence_score: '',
  latitude: '',
  longitude: '',
  notes: ''
};

const ObservationsPage = () => {
  const { user } = useContext(AuthContext);
  
  const getRoleName = (roleObj) => {
    if (!roleObj) return "";
    return typeof roleObj === 'string' ? roleObj : (roleObj.name || roleObj.role_name || "");
  };
  const isAdmin = getRoleName(user?.role).toLowerCase() === "administrator";
  const userId = user?.id || user?._id;

  const [observations, setObservations] = useState([]);
  const [sites, setSites] = useState([]);
  const [devices, setDevices] = useState([]);
  const [uploads, setUploads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [siteFilter, setSiteFilter] = useState('All');
  
  const [sortConfig, setSortConfig] = useState({ key: 'observed_at', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  
  const [editingObsId, setEditingObsId] = useState(null);
  const [obsToDelete, setObsToDelete] = useState(null);
  const [verifyAction, setVerifyAction] = useState({ id: null, status: null });

  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [fetchedObs, fetchedSites, fetchedDevices, fetchedUploads] = await Promise.all([
        observationService.getObservations(),
        siteService.getSites(),
        deviceService.getDevices(),
        uploadService.getUploads()
      ]);
      setObservations(fetchedObs);
      setSites(fetchedSites);
      setDevices(fetchedDevices);
      setUploads(fetchedUploads);
    } catch (error) {
      toast.error("Failed to load observations data.");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDevices = useMemo(() => {
    if (!formData.monitoring_site_id) return [];
    return devices.filter(d => (d.monitoring_site_id === formData.monitoring_site_id));
  }, [devices, formData.monitoring_site_id]);

  const filteredUploads = useMemo(() => {
    if (!formData.monitoring_site_id) return [];
    return uploads.filter(u => (u.monitoring_site_id === formData.monitoring_site_id));
  }, [uploads, formData.monitoring_site_id]);

  const selectedUpload = useMemo(() => {
    if (!formData.field_upload_id) return null;
    return filteredUploads.find(u => (u.id || u._id) === formData.field_upload_id);
  }, [formData.field_upload_id, filteredUploads]);

  const summary = useMemo(() => {
    const uniqueSpecies = new Set(observations.map(o => o.species_name.toLowerCase()));
    return {
      total: observations.length,
      verified: observations.filter(o => o.verification_status === 'Verified').length,
      pending: observations.filter(o => o.verification_status === 'Pending Validation').length,
      species: uniqueSpecies.size,
    };
  }, [observations]);

  const displayObservations = useMemo(() => {
    let filtered = observations.filter(o => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = o.species_name.toLowerCase().includes(q) || 
                            o.observer_name.toLowerCase().includes(q) ||
                            o.monitoring_site_name.toLowerCase().includes(q) ||
                            (o.file_name && o.file_name.toLowerCase().includes(q));
      const matchesStatus = statusFilter === 'All' || o.verification_status === statusFilter;
      const matchesType = typeFilter === 'All' || o.observation_type === typeFilter;
      const matchesSite = siteFilter === 'All' || o.monitoring_site_id === siteFilter;
      return matchesSearch && matchesStatus && matchesType && matchesSite;
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        if (sortConfig.key === 'observed_at') {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        }
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [observations, searchQuery, statusFilter, typeFilter, siteFilter, sortConfig]);

  // Pagination logic
  const paginatedObservations = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return displayObservations.slice(startIndex, startIndex + itemsPerPage);
  }, [displayObservations, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(displayObservations.length / itemsPerPage);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const canModify = (obs) => isAdmin || obs.observer_id === userId;

  const handleOpenModal = (obs = null) => {
    setFormErrors({});
    if (obs) {
      setEditingObsId(obs.id || obs._id);
      
      const observedDate = new Date(obs.observed_at);
      const tzoffset = observedDate.getTimezoneOffset() * 60000;
      const localISOString = (new Date(observedDate - tzoffset)).toISOString().slice(0, 16);
      
      setFormData({ 
        species_name: obs.species_name,
        scientific_name: obs.scientific_name || '',
        observation_type: obs.observation_type,
        monitoring_site_id: obs.monitoring_site_id,
        sensor_device_id: obs.sensor_device_id || '',
        field_upload_id: obs.field_upload_id || '',
        observed_at: localISOString,
        count: obs.count,
        confidence_score: obs.confidence_score !== null ? obs.confidence_score : '',
        latitude: obs.latitude !== null ? obs.latitude : '',
        longitude: obs.longitude !== null ? obs.longitude : '',
        notes: obs.notes || ''
      });
    } else {
      setEditingObsId(null);
      setFormData({ ...INITIAL_FORM_DATA, observed_at: getLocalISOString() });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingObsId(null);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.species_name.trim()) errors.species_name = 'Species name is required';
    if (!formData.monitoring_site_id) errors.monitoring_site_id = 'Monitoring Site is required';
    if (!formData.observed_at) errors.observed_at = 'Date and time is required';
    if (formData.count < 1) errors.count = 'Count must be at least 1';
    
    const conf = parseFloat(formData.confidence_score);
    if (formData.confidence_score !== '' && (isNaN(conf) || conf < 0 || conf > 100)) {
      errors.confidence_score = 'Must be between 0 and 100';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveObservation = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const payload = {
        ...formData,
        observed_at: new Date(formData.observed_at).toISOString(),
        confidence_score: formData.confidence_score !== '' ? parseFloat(formData.confidence_score) : null,
        latitude: formData.latitude !== '' ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude !== '' ? parseFloat(formData.longitude) : null,
        sensor_device_id: formData.sensor_device_id || null,
        field_upload_id: formData.field_upload_id || null,
      };

      if (editingObsId) {
        await observationService.updateObservation(editingObsId, payload);
        toast.success("Observation updated successfully");
      } else {
        await observationService.createObservation(payload);
        toast.success("Observation added successfully");
      }
      handleCloseModal();
      fetchData();
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error(error.response.data.detail || "You do not have permission.");
      } else {
        toast.error(editingObsId ? "Failed to update observation" : "Failed to add observation");
      }
    }
  };

  const confirmDelete = (id) => {
    setObsToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    try {
      await observationService.deleteObservation(obsToDelete);
      toast.success("Observation deleted successfully");
      fetchData();
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error(error.response.data.detail || "You do not have permission.");
      } else {
        toast.error("Failed to delete observation");
      }
    } finally {
      setIsDeleteModalOpen(false);
      setObsToDelete(null);
    }
  };

  const confirmVerify = (id, status) => {
    setVerifyAction({ id, status });
    setIsVerifyModalOpen(true);
  };

  const executeVerify = async () => {
    try {
      await observationService.verifyObservation(verifyAction.id, verifyAction.status);
      toast.success(`Observation marked as ${verifyAction.status}`);
      fetchData();
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error(error.response.data.detail || "Only an Administrator can verify records.");
      } else {
        toast.error("Failed to verify observation");
      }
    } finally {
      setIsVerifyModalOpen(false);
      setVerifyAction({ id: null, status: null });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Verified': return 'bg-green-100 text-green-700 border-green-200';
      case 'Rejected': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-orange-100 text-orange-700 border-orange-200';
    }
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
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <ClipboardList className="w-8 h-8 text-green-600" />
            Observation Records
          </h1>
          <p className="text-slate-500 text-sm mt-1 max-w-2xl">
            Verified wildlife sightings and manual field data entries.
          </p>
        </div>
        <Button onClick={() => handleOpenModal()} className="gap-2 bg-primary text-white hover:bg-primary/90">
          <Plus className="w-5 h-5" />
          Add Observation
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 soft-shadow bg-white shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 rounded-2xl">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Activity className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Observations</p>
              <p className="text-2xl font-bold">{summary.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 soft-shadow bg-white shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 rounded-2xl">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Verified Records</p>
              <p className="text-2xl font-bold">{summary.verified}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 soft-shadow bg-white shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 rounded-2xl">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending Validation</p>
              <p className="text-2xl font-bold">{summary.pending}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 soft-shadow bg-white shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 rounded-2xl">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
              <Target className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Species Recorded</p>
              <p className="text-2xl font-bold">{summary.species}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col xl:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl soft-shadow">
        <div className="relative w-full xl:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            type="text" 
            placeholder="Search species, observer, site, file..." 
            className="pl-9 bg-gray-50 border-gray-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap xl:flex-nowrap items-center gap-3 w-full xl:w-auto">
          
          <div className="relative w-full sm:w-auto sm:min-w-[140px]">
            <select 
              value={siteFilter}
              onChange={(e) => setSiteFilter(e.target.value)}
              className="w-full appearance-none bg-gray-50 border border-gray-200 text-foreground text-sm rounded-md focus:ring-primary focus:border-primary block p-2.5 pr-8"
            >
              <option value="All">All Sites</option>
              {sites.map(s => <option key={s.id || s._id} value={s.id || s._id}>{s.site_name}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>

          <div className="relative w-full sm:w-auto sm:min-w-[140px]">
            <select 
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full appearance-none bg-gray-50 border border-gray-200 text-foreground text-sm rounded-md focus:ring-primary focus:border-primary block p-2.5 pr-8"
            >
              <option value="All">All Types</option>
              {OBSERVATION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>

          <div className="relative w-full sm:w-auto sm:min-w-[140px]">
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

      {/* Observations List */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : displayObservations.length === 0 ? (
        <motion.div variants={itemVariants} className="bg-white rounded-xl soft-shadow p-12 flex flex-col items-center justify-center text-center border border-dashed border-gray-200">
          <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <Target className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-foreground">No observations found</h3>
          <p className="text-muted-foreground mt-1 max-w-sm">
            We couldn't find any observations matching your search criteria.
          </p>
          <Button onClick={() => {setSearchQuery(''); setStatusFilter('All'); setTypeFilter('All'); setSiteFilter('All');}} variant="outline" className="mt-4">
            Clear Filters
          </Button>
        </motion.div>
      ) : (
        <div className="bg-white rounded-xl soft-shadow overflow-hidden">
          <div className="overflow-x-auto rounded-xl border border-border/50 shadow-sm">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="text-xs text-muted-foreground uppercase bg-gray-50 border-b border-gray-100 sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur z-10">
                <tr>
                  <th className="px-6 py-4 font-medium cursor-pointer hover:text-primary transition-colors select-none" onClick={() => requestSort('species_name')}>
                    <div className="flex items-center gap-1">
                      Species Info
                      {sortConfig.key === 'species_name' ? (sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
                    </div>
                  </th>
                  <th className="px-6 py-4 font-medium cursor-pointer hover:text-primary transition-colors select-none" onClick={() => requestSort('monitoring_site_name')}>
                    <div className="flex items-center gap-1">
                      Location & Type
                      {sortConfig.key === 'monitoring_site_name' ? (sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
                    </div>
                  </th>
                  <th className="px-6 py-4 font-medium cursor-pointer hover:text-primary transition-colors select-none" onClick={() => requestSort('observed_at')}>
                    <div className="flex items-center gap-1">
                      Date & Observer
                      {sortConfig.key === 'observed_at' ? (sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
                    </div>
                  </th>
                  <th className="px-6 py-4 font-medium text-center cursor-pointer hover:text-primary transition-colors select-none" onClick={() => requestSort('confidence_score')}>
                    <div className="flex items-center justify-center gap-1">
                      Score
                      {sortConfig.key === 'confidence_score' ? (sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
                    </div>
                  </th>
                  <th className="px-6 py-4 font-medium cursor-pointer hover:text-primary transition-colors select-none" onClick={() => requestSort('verification_status')}>
                    <div className="flex items-center gap-1">
                      Status
                      {sortConfig.key === 'verification_status' ? (sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
                    </div>
                  </th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {paginatedObservations.map(obs => (
                    <motion.tr 
                      key={obs.id || obs._id} 
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                            <Target className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{obs.species_name} <span className="text-xs text-muted-foreground ml-1">x{obs.count}</span></p>
                            <p className="text-xs text-muted-foreground italic">{obs.scientific_name || 'Unspecified'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span className="font-medium text-foreground">{obs.monitoring_site_name}</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Activity className="h-3 w-3" /> {obs.observation_type}</span>
                            {obs.file_url && (
                              <a href={obs.file_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                                <FileText className="h-3 w-3" /> Attachment
                              </a>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 text-foreground font-medium">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span>{new Date(obs.observed_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <User className="h-3.5 w-3.5 shrink-0" />
                            <span>{obs.observer_name}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">
                          {obs.confidence_score !== null ? `${obs.confidence_score}%` : '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-xs font-medium ${getStatusColor(obs.verification_status)}`}>
                          {obs.verification_status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1 justify-end">
                          {isAdmin && obs.verification_status === 'Pending Validation' && (
                            <>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => confirmVerify(obs.id || obs._id, 'Verified')} title="Verify">
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => confirmVerify(obs.id || obs._id, 'Rejected')} title="Reject">
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          
                          {canModify(obs) && (
                            <>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => handleOpenModal(obs)} title="Edit">
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => confirmDelete(obs.id || obs._id)} title="Delete">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 bg-gray-50/50">
              <div className="text-sm text-muted-foreground">
                Showing <span className="font-medium text-foreground">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="font-medium text-foreground">{Math.min(currentPage * itemsPerPage, displayObservations.length)}</span> of <span className="font-medium text-foreground">{displayObservations.length}</span> results
              </div>
              <div className="flex items-center gap-1">
                <Button 
                  variant="outline" size="sm" className="h-8 w-8 p-0" 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    className={`h-8 w-8 p-0 ${currentPage === page ? 'bg-primary text-white' : ''}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ))}
                <Button 
                  variant="outline" size="sm" className="h-8 w-8 p-0" 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
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
              className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold">{editingObsId ? 'Edit Observation' : 'Add Observation'}</h2>
                <Button variant="ghost" size="icon" onClick={handleCloseModal} className="h-8 w-8 rounded-full">
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="p-6 overflow-y-auto">
                <form id="observation-form" onSubmit={handleSaveObservation} className="space-y-6">
                  
                  {/* Taxonomy */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="species_name">Species Name <span className="text-destructive">*</span></Label>
                      <Input 
                        id="species_name" value={formData.species_name} 
                        onChange={(e) => setFormData({...formData, species_name: e.target.value})} 
                        className={formErrors.species_name ? "border-destructive focus-visible:ring-destructive" : ""}
                        placeholder="e.g. Tiger"
                      />
                      {formErrors.species_name && <p className="text-xs text-destructive">{formErrors.species_name}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="scientific_name">Scientific Name (Optional)</Label>
                      <Input 
                        id="scientific_name" value={formData.scientific_name} 
                        onChange={(e) => setFormData({...formData, scientific_name: e.target.value})} 
                        placeholder="e.g. Panthera tigris"
                        className="italic"
                      />
                    </div>
                  </div>

                  {/* Context */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="observation_type">Observation Type <span className="text-destructive">*</span></Label>
                      <select 
                        id="observation_type" value={formData.observation_type} 
                        onChange={(e) => setFormData({...formData, observation_type: e.target.value})}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        {OBSERVATION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="monitoring_site_id">Monitoring Site <span className="text-destructive">*</span></Label>
                      <select 
                        id="monitoring_site_id" value={formData.monitoring_site_id} 
                        onChange={(e) => {
                          setFormData({...formData, monitoring_site_id: e.target.value, sensor_device_id: '', field_upload_id: ''});
                        }}
                        className={`flex h-10 w-full rounded-md border ${formErrors.monitoring_site_id ? 'border-destructive' : 'border-input'} bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`}
                      >
                        <option value="" disabled>Select a site...</option>
                        {sites.map(s => <option key={s.id || s._id} value={s.id || s._id}>{s.site_name}</option>)}
                      </select>
                      {formErrors.monitoring_site_id && <p className="text-xs text-destructive">{formErrors.monitoring_site_id}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sensor_device_id">Sensor Device (Optional)</Label>
                      <select 
                        id="sensor_device_id" value={formData.sensor_device_id} 
                        onChange={(e) => setFormData({...formData, sensor_device_id: e.target.value})}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
                        disabled={!formData.monitoring_site_id}
                      >
                        <option value="">None</option>
                        {filteredDevices.map(d => <option key={d.id || d._id} value={d.id || d._id}>{d.device_name}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Linked Upload */}
                  <div className="space-y-2 border border-gray-100 bg-gray-50/50 p-4 rounded-lg">
                    <Label htmlFor="field_upload_id">Linked Field Upload (Optional)</Label>
                    <div className="flex flex-col sm:flex-row gap-4 items-start">
                      <select 
                        id="field_upload_id" value={formData.field_upload_id} 
                        onChange={(e) => setFormData({...formData, field_upload_id: e.target.value})}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 flex-1"
                        disabled={!formData.monitoring_site_id}
                      >
                        <option value="">No linked upload</option>
                        {filteredUploads.map(u => <option key={u.id || u._id} value={u.id || u._id}>{u.title} ({u.file_name})</option>)}
                      </select>
                      
                      {selectedUpload && (
                        <div className="shrink-0 w-24 h-24 border border-gray-200 rounded overflow-hidden bg-white flex items-center justify-center">
                          {selectedUpload.upload_type === 'Image' ? (
                            <img loading="lazy" src={selectedUpload.file_url} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-center p-2 text-xs text-muted-foreground flex flex-col items-center">
                              <FileText className="w-6 h-6 mb-1 text-primary" />
                              {selectedUpload.upload_type}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Time and Metrics */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="observed_at">Date & Time <span className="text-destructive">*</span></Label>
                      <Input 
                        id="observed_at" type="datetime-local" value={formData.observed_at} 
                        onChange={(e) => setFormData({...formData, observed_at: e.target.value})} 
                        className={formErrors.observed_at ? "border-destructive focus-visible:ring-destructive" : ""}
                      />
                      {formErrors.observed_at && <p className="text-xs text-destructive">{formErrors.observed_at}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="count">Animal Count <span className="text-destructive">*</span></Label>
                      <Input 
                        id="count" type="number" min="1" value={formData.count} 
                        onChange={(e) => setFormData({...formData, count: parseInt(e.target.value) || 1})} 
                        className={formErrors.count ? "border-destructive focus-visible:ring-destructive" : ""}
                      />
                      {formErrors.count && <p className="text-xs text-destructive">{formErrors.count}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confidence_score">Confidence % (Optional)</Label>
                      <Input 
                        id="confidence_score" type="number" min="0" max="100" step="any" value={formData.confidence_score} 
                        onChange={(e) => setFormData({...formData, confidence_score: e.target.value})} 
                        className={formErrors.confidence_score ? "border-destructive focus-visible:ring-destructive" : ""}
                        placeholder="0-100"
                      />
                      {formErrors.confidence_score && <p className="text-xs text-destructive">{formErrors.confidence_score}</p>}
                    </div>
                  </div>

                  {/* Geospatial & Notes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="latitude">Latitude (Optional)</Label>
                      <Input 
                        id="latitude" type="number" step="any" value={formData.latitude} 
                        onChange={(e) => setFormData({...formData, latitude: e.target.value})} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="longitude">Longitude (Optional)</Label>
                      <Input 
                        id="longitude" type="number" step="any" value={formData.longitude} 
                        onChange={(e) => setFormData({...formData, longitude: e.target.value})} 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <textarea 
                      id="notes" value={formData.notes} 
                      onChange={(e) => setFormData({...formData, notes: e.target.value})} 
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[80px] resize-y"
                      placeholder="Behavioral observations, weather conditions..."
                    ></textarea>
                  </div>
                </form>
              </div>
              
              <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 mt-auto">
                <Button type="button" variant="outline" onClick={handleCloseModal}>Cancel</Button>
                <Button type="submit" form="observation-form" className="bg-primary hover:bg-primary/90 text-white">
                  {editingObsId ? 'Save Changes' : 'Submit Observation'}
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
              <h3 className="text-xl font-bold mb-2">Delete Observation?</h3>
              <p className="text-muted-foreground mb-6">
                Are you sure you want to delete this observation? Linked files and hardware will not be affected, but this record will be permanently lost.
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" className="flex-1" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
                <Button variant="destructive" className="flex-1" onClick={executeDelete}>Delete</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Verify Confirmation Modal */}
      <AnimatePresence>
        {isVerifyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsVerifyModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden p-6 text-center"
            >
              <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${verifyAction.status === 'Verified' ? 'bg-green-100' : 'bg-red-100'}`}>
                {verifyAction.status === 'Verified' ? <Check className="w-8 h-8 text-green-600" /> : <XCircle className="w-8 h-8 text-red-600" />}
              </div>
              <h3 className="text-xl font-bold mb-2">{verifyAction.status === 'Verified' ? 'Approve Observation?' : 'Reject Observation?'}</h3>
              <p className="text-muted-foreground mb-6">
                You are about to mark this observation as {verifyAction.status}. The record will be permanently stamped with your authorization.
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" className="flex-1" onClick={() => setIsVerifyModalOpen(false)}>Cancel</Button>
                <Button className={`flex-1 text-white ${verifyAction.status === 'Verified' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`} onClick={executeVerify}>
                  Confirm {verifyAction.status}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ObservationsPage;
