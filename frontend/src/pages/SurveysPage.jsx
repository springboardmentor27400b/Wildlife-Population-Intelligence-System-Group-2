import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Eye, Edit2, Trash2, MapPin, 
  CheckCircle, Clock, Calendar, User, Map, Target, AlertCircle, X
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

const DEFAULT_SURVEYS = [];

const STATUSES = ['Planned', 'Active', 'Completed'];

const Toast = ({ message, visible, onClose }) => (
  <AnimatePresence>
    {visible && (
      <motion.div
        initial={{ opacity: 0, y: 50, x: '-50%' }}
        animate={{ opacity: 1, y: 0, x: '-50%' }}
        exit={{ opacity: 0, y: 50, x: '-50%' }}
        className="fixed bottom-6 left-1/2 z-[100] bg-green-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2"
      >
        <CheckCircle className="w-5 h-5" />
        <span className="font-medium">{message}</span>
        <button onClick={onClose} className="ml-2 hover:bg-green-700 rounded-full p-1"><X className="w-4 h-4" /></button>
      </motion.div>
    )}
  </AnimatePresence>
);

const SurveysPage = () => {
  const [surveys, setSurveys] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [regionFilter, setRegionFilter] = useState('All');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [surveyToDelete, setSurveyToDelete] = useState(null);
  
  const [toastMessage, setToastMessage] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '', region: '', researcher: '', startDate: '', endDate: '',
    area: 0, progress: 0, status: 'Planned', objective: ''
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const saved = localStorage.getItem('wpis_surveys_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 0) {
          setSurveys(DEFAULT_SURVEYS);
          localStorage.setItem('wpis_surveys_v2', JSON.stringify(DEFAULT_SURVEYS));
        } else {
          setSurveys(parsed);
        }
      } catch (e) {
        setSurveys(DEFAULT_SURVEYS);
        localStorage.setItem('wpis_surveys_v2', JSON.stringify(DEFAULT_SURVEYS));
      }
    } else {
      setSurveys(DEFAULT_SURVEYS);
      localStorage.setItem('wpis_surveys_v2', JSON.stringify(DEFAULT_SURVEYS));
    }
  }, []);

  useEffect(() => {
    if (surveys.length > 0 || localStorage.getItem('wpis_surveys_v2')) {
      localStorage.setItem('wpis_surveys_v2', JSON.stringify(surveys));
    }
  }, [surveys]);

  const uniqueRegions = useMemo(() => {
    const regions = new Set(surveys.map(s => s.region));
    return Array.from(regions).sort();
  }, [surveys]);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const summary = useMemo(() => {
    return {
      total: surveys.length,
      active: surveys.filter(s => s.status === 'Active').length,
      completed: surveys.filter(s => s.status === 'Completed').length,
      totalArea: surveys.reduce((acc, curr) => acc + (parseFloat(curr.area) || 0), 0)
    };
  }, [surveys]);

  const filteredSurveys = useMemo(() => {
    return surveys.filter(s => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = s.name.toLowerCase().includes(q) || 
                            s.region.toLowerCase().includes(q) ||
                            s.researcher.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
      const matchesRegion = regionFilter === 'All' || s.region === regionFilter;
      return matchesSearch && matchesStatus && matchesRegion;
    });
  }, [surveys, searchQuery, statusFilter, regionFilter]);

  const handleOpenModal = (survey = null) => {
    setFormErrors({});
    if (survey) {
      setSelectedSurvey(survey.id);
      setFormData({ ...survey });
    } else {
      setSelectedSurvey(null);
      setFormData({ 
        name: '', region: '', researcher: '', startDate: '', endDate: '',
        area: 0, progress: 0, status: 'Planned', objective: '' 
      });
    }
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Survey name is required';
    if (!formData.region.trim()) errors.region = 'Region is required';
    if (!formData.researcher.trim()) errors.researcher = 'Lead researcher is required';
    if (formData.area <= 0) errors.area = 'Coverage area must be greater than 0';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveSurvey = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (selectedSurvey) {
      setSurveys(surveys.map(s => s.id === selectedSurvey ? { ...formData, id: selectedSurvey } : s));
      showToast('Survey updated successfully');
    } else {
      setSurveys([{ ...formData, id: 'sur' + Date.now() }, ...surveys]);
      showToast('New survey created successfully');
    }
    setIsModalOpen(false);
  };

  const openViewModal = (survey) => {
    setSelectedSurvey(survey);
    setIsViewModalOpen(true);
  };

  const confirmDelete = (id) => {
    setSurveyToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const executeDelete = () => {
    setSurveys(surveys.filter(s => s.id !== surveyToDelete));
    setIsDeleteModalOpen(false);
    setSurveyToDelete(null);
    showToast('Survey deleted successfully');
  };

  const handleDemoReset = () => {};

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-700 border-green-200';
      case 'Planned': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Completed': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Active': return <AlertCircle className="w-3 h-3 mr-1" />;
      case 'Planned': return <Clock className="w-3 h-3 mr-1" />;
      case 'Completed': return <CheckCircle className="w-3 h-3 mr-1" />;
      default: return null;
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
      
      <Toast message={toastMessage} visible={!!toastMessage} onClose={() => setToastMessage('')} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Map className="w-8 h-8 text-green-600" />
            Wildlife Surveys
          </h1>
          <p className="text-slate-500 text-sm mt-1 max-w-2xl">
            Plan, deploy, and track field surveys across monitoring sites.
          </p>
        </div>
        <Button onClick={() => handleOpenModal()} className="gap-2 bg-primary text-white hover:bg-primary/90">
          <Plus className="w-5 h-5" />
          Create Survey
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 soft-shadow bg-white shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 rounded-2xl">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Map className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Surveys</p>
              <p className="text-2xl font-bold">{summary.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 soft-shadow bg-white shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 rounded-2xl">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Surveys</p>
              <p className="text-2xl font-bold">{summary.active}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 soft-shadow bg-white shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 rounded-2xl">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Completed Surveys</p>
              <p className="text-2xl font-bold">{summary.completed}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 soft-shadow bg-white shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 rounded-2xl">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
              <Target className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground leading-tight">Total Coverage Area</p>
              <p className="text-2xl font-bold">{summary.totalArea} <span className="text-sm text-muted-foreground">sq km</span></p>
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
            placeholder="Search by survey name, region, or researcher..." 
            className="pl-9 bg-gray-50 border-gray-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full xl:w-auto">
          <div className="relative">
            <select 
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="w-full appearance-none bg-gray-50 border border-gray-200 text-foreground text-sm rounded-md focus:ring-primary focus:border-primary block p-2.5 pr-8"
            >
              <option value="All">All Regions</option>
              {uniqueRegions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div className="relative">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full appearance-none bg-gray-50 border border-gray-200 text-foreground text-sm rounded-md focus:ring-primary focus:border-primary block p-2.5 pr-8"
            >
              <option value="All">All Statuses</option>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredSurveys.length === 0 && (
        <motion.div variants={itemVariants} className="bg-white rounded-xl soft-shadow p-12 flex flex-col items-center justify-center text-center border border-dashed border-gray-200">
          <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <Map className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-foreground">No surveys found</h3>
          <p className="text-muted-foreground mt-1 max-w-sm">
            We couldn't find any surveys matching your search criteria.
          </p>
          <Button onClick={() => {setSearchQuery(''); setStatusFilter('All'); setRegionFilter('All');}} variant="outline" className="mt-4">
            Clear Filters
          </Button>
        </motion.div>
      )}

      {/* Responsive Table for large screens, Cards for small screens */}
      {filteredSurveys.length > 0 && (
        <motion.div variants={itemVariants} className="bg-white rounded-xl soft-shadow overflow-hidden">
          {/* Mobile view (Cards) */}
          <div className="block lg:hidden divide-y divide-gray-100">
            {filteredSurveys.map(survey => (
              <div key={survey.id} className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-foreground line-clamp-1">{survey.name}</h4>
                    <span className={`inline-flex mt-1 items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusColor(survey.status)}`}>
                      {getStatusIcon(survey.status)} {survey.status}
                    </span>
                  </div>
                  <div className="flex bg-gray-50 rounded border border-gray-100 shrink-0 ml-2">
                    <button onClick={() => openViewModal(survey)} className="p-2 text-muted-foreground hover:text-primary"><Eye className="w-4 h-4" /></button>
                    <button onClick={() => handleOpenModal(survey)} className="p-2 text-muted-foreground hover:text-primary"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => confirmDelete(survey.id)} className="p-2 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mt-2">
                  <div className="flex items-center gap-1"><MapPin className="w-3 h-3 shrink-0" /> <span className="truncate">{survey.region}</span></div>
                  <div className="flex items-center gap-1"><User className="w-3 h-3 shrink-0" /> <span className="truncate">{survey.researcher}</span></div>
                  <div className="flex items-center gap-1"><Target className="w-3 h-3 shrink-0" /> {survey.area} sq km</div>
                  <div className="flex items-center gap-1"><Calendar className="w-3 h-3 shrink-0" /> {survey.startDate || 'N/A'}</div>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <div className="flex justify-between items-center text-[10px] font-medium text-muted-foreground mb-1">
                    <span>Progress</span>
                    <span>{survey.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div className="bg-primary h-1 rounded-full" style={{ width: `${survey.progress}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop view (Table) */}
          <div className="hidden lg:block overflow-x-auto rounded-xl border border-border/50 shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur z-10">
                <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <th className="px-4 py-3 w-[25%]">Survey Name</th>
                  <th className="px-4 py-3 w-[15%]">Region & Area</th>
                  <th className="px-4 py-3 w-[15%]">Dates</th>
                  <th className="px-4 py-3 w-[15%]">Lead Researcher</th>
                  <th className="px-4 py-3 w-[15%]">Progress</th>
                  <th className="px-4 py-3 w-[15%] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSurveys.map(survey => (
                  <tr key={survey.id} className="hover:bg-gray-50/50 transition-colors even:bg-muted/20">
                    <td className="px-4 py-3">
                      <div className="font-bold text-foreground text-sm line-clamp-1" title={survey.name}>{survey.name}</div>
                      <div className="mt-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusColor(survey.status)}`}>
                          {getStatusIcon(survey.status)}
                          {survey.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-foreground flex items-center gap-1.5 whitespace-nowrap">
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" /> <span className="truncate max-w-[120px]">{survey.region}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5 whitespace-nowrap">
                        <Target className="w-3.5 h-3.5 shrink-0" /> {survey.area} sq km
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-foreground whitespace-nowrap">{survey.startDate || 'N/A'}</div>
                      <div className="text-xs text-muted-foreground mt-0.5 whitespace-nowrap">to {survey.endDate || 'N/A'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-foreground flex items-center gap-1.5 whitespace-nowrap">
                        <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" /> <span className="truncate max-w-[120px]">{survey.researcher}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-gray-200 rounded-full h-1.5 flex-1 min-w-[60px]">
                          <div className="bg-primary h-1.5 rounded-full" style={{ width: `${survey.progress}%` }}></div>
                        </div>
                        <span className="text-xs font-semibold text-foreground w-8 text-right">{survey.progress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Button title="View Details" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10" onClick={() => openViewModal(survey)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button title="Edit Survey" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10" onClick={() => handleOpenModal(survey)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button title="Delete Survey" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => confirmDelete(survey.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Hidden reset button for demo purposes */}
      <div className="flex justify-end opacity-20 hover:opacity-100 transition-opacity">
        <button onClick={handleDemoReset} className="text-xs text-muted-foreground hover:text-primary underline">
          Reset demo data
        </button>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold">{selectedSurvey ? 'Edit Survey' : 'Create Survey'}</h2>
                <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)} className="h-8 w-8 rounded-full">
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="p-6 overflow-y-auto">
                <form id="survey-form" onSubmit={handleSaveSurvey} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Survey Name <span className="text-destructive">*</span></Label>
                      <Input 
                        id="name" value={formData.name} 
                        onChange={(e) => setFormData({...formData, name: e.target.value})} 
                        className={formErrors.name ? "border-destructive focus-visible:ring-destructive" : ""}
                        placeholder="e.g. Wetland Bird Count"
                      />
                      {formErrors.name && <p className="text-xs text-destructive">{formErrors.name}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="region">Region / Site <span className="text-destructive">*</span></Label>
                      <Input 
                        id="region" value={formData.region} 
                        onChange={(e) => setFormData({...formData, region: e.target.value})} 
                        className={formErrors.region ? "border-destructive focus-visible:ring-destructive" : ""}
                        placeholder="e.g. Gulf of Mannar"
                      />
                      {formErrors.region && <p className="text-xs text-destructive">{formErrors.region}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="researcher">Lead Researcher <span className="text-destructive">*</span></Label>
                      <Input 
                        id="researcher" value={formData.researcher} 
                        onChange={(e) => setFormData({...formData, researcher: e.target.value})} 
                        className={formErrors.researcher ? "border-destructive focus-visible:ring-destructive" : ""}
                        placeholder="e.g. Dr. Anita Desai"
                      />
                      {formErrors.researcher && <p className="text-xs text-destructive">{formErrors.researcher}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="area">Coverage Area (sq km) <span className="text-destructive">*</span></Label>
                      <Input 
                        id="area" type="number" min="0" value={formData.area} 
                        onChange={(e) => setFormData({...formData, area: parseInt(e.target.value) || 0})} 
                        className={formErrors.area ? "border-destructive focus-visible:ring-destructive" : ""}
                      />
                      {formErrors.area && <p className="text-xs text-destructive">{formErrors.area}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input 
                        id="startDate" type="date" value={formData.startDate} 
                        onChange={(e) => setFormData({...formData, startDate: e.target.value})} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <Input 
                        id="endDate" type="date" value={formData.endDate} 
                        onChange={(e) => setFormData({...formData, endDate: e.target.value})} 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      <div className="flex justify-between">
                        <Label htmlFor="progress">Progress %</Label>
                        <span className="text-sm font-bold text-primary">{formData.progress}%</span>
                      </div>
                      <input 
                        id="progress" type="range" min="0" max="100" step="1"
                        value={formData.progress}
                        onChange={(e) => setFormData({...formData, progress: parseInt(e.target.value)})}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="objective">Survey Objective</Label>
                    <textarea 
                      id="objective" value={formData.objective} 
                      onChange={(e) => setFormData({...formData, objective: e.target.value})} 
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[80px] resize-y"
                      placeholder="Describe the main goals of this survey..."
                    ></textarea>
                  </div>
                </form>
              </div>
              
              <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 mt-auto">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" form="survey-form" className="bg-primary hover:bg-primary/90 text-white">
                  {selectedSurvey ? 'Save Changes' : 'Create Survey'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Detail Modal */}
      <AnimatePresence>
        {isViewModalOpen && selectedSurvey && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsViewModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-foreground pr-8">{selectedSurvey.name}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" /> {selectedSurvey.region}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsViewModalOpen(false)} className="absolute top-4 right-4 h-8 w-8 rounded-full">
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-muted-foreground">Survey Status</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(selectedSurvey.status)}`}>
                    {getStatusIcon(selectedSurvey.status)} {selectedSurvey.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Start Date</p>
                    <p className="text-sm font-semibold">{selectedSurvey.startDate || 'Not set'}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">End Date</p>
                    <p className="text-sm font-semibold">{selectedSurvey.endDate || 'Not set'}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Lead Researcher</p>
                    <p className="text-sm font-semibold flex items-center gap-1">
                      <User className="w-3 h-3" /> <span className="truncate">{selectedSurvey.researcher || 'Unassigned'}</span>
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Coverage Area</p>
                    <p className="text-sm font-semibold flex items-center gap-1">
                      <Target className="w-3 h-3" /> {selectedSurvey.area} sq km
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex justify-between items-center text-xs font-medium text-muted-foreground mb-2">
                    <span>Progress Overview</span>
                    <span>{selectedSurvey.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: `${selectedSurvey.progress}%` }}></div>
                  </div>
                </div>
                
                {selectedSurvey.objective && (
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-xs font-semibold text-muted-foreground mb-2">Survey Objective</p>
                    <p className="text-sm text-foreground">{selectedSurvey.objective}</p>
                  </div>
                )}
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
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Delete Survey?</h3>
              <p className="text-muted-foreground mb-6">
                Are you sure you want to delete this survey? All associated data records will be affected. This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" className="flex-1" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
                <Button variant="destructive" className="flex-1" onClick={executeDelete}>Delete</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SurveysPage;


