import React, { useState, useEffect, useMemo, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Edit2, Trash2, UploadCloud, 
  File, FileText, Image as ImageIcon, Video, Music, 
  ChevronDown, X, Download, HardDrive, CheckCircle2, 
  Clock, AlertTriangle, ShieldAlert
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'react-hot-toast';
import uploadService from '../services/uploadService';
import siteService from '../services/siteService';
import deviceService from '../services/deviceService';

const UPLOAD_TYPES = ['Image', 'Video', 'Audio', 'Document', 'Survey File'];
const STATUSES = ['Pending Review', 'Processing', 'Processed', 'Rejected'];

const INITIAL_FORM_DATA = {
  title: '',
  upload_type: 'Image',
  monitoring_site_id: '',
  sensor_device_id: '',
  description: '',
  status: 'Pending Review'
};

const UploadsPage = () => {
  const { user } = useContext(AuthContext);
  
  const getRoleName = (roleObj) => {
    if (!roleObj) return "";
    return typeof roleObj === 'string' ? roleObj : (roleObj.name || roleObj.role_name || "");
  };
  const isAdmin = getRoleName(user?.role).toLowerCase() === "administrator";
  const userId = user?.id || user?._id;

  const [uploads, setUploads] = useState([]);
  const [sites, setSites] = useState([]);
  const [devices, setDevices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [editingUploadId, setEditingUploadId] = useState(null);
  const [uploadToDelete, setUploadToDelete] = useState(null);

  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [selectedFile, setSelectedFile] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [fetchedUploads, fetchedSites, fetchedDevices] = await Promise.all([
        uploadService.getUploads(),
        siteService.getSites(),
        deviceService.getDevices()
      ]);
      setUploads(fetchedUploads);
      setSites(fetchedSites);
      setDevices(fetchedDevices);
    } catch (error) {
      toast.error("Failed to load data.");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDevices = useMemo(() => {
    if (!formData.monitoring_site_id) return [];
    return devices.filter(d => (d.monitoring_site_id === formData.monitoring_site_id));
  }, [devices, formData.monitoring_site_id]);

  const summary = useMemo(() => {
    const totalSize = uploads.reduce((acc, curr) => acc + curr.file_size, 0);
    return {
      total: uploads.length,
      pending: uploads.filter(u => u.status === 'Pending Review').length,
      processed: uploads.filter(u => u.status === 'Processed').length,
      storage: totalSize > 1024 ? (totalSize / 1024).toFixed(2) + ' GB' : totalSize.toFixed(2) + ' MB',
    };
  }, [uploads]);

  const displayUploads = useMemo(() => {
    return uploads.filter(u => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = u.title.toLowerCase().includes(q) || 
                            u.file_name.toLowerCase().includes(q) ||
                            u.monitoring_site_name.toLowerCase().includes(q) ||
                            (u.sensor_device_name && u.sensor_device_name.toLowerCase().includes(q));
      const matchesStatus = statusFilter === 'All' || u.status === statusFilter;
      const matchesType = typeFilter === 'All' || u.upload_type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [uploads, searchQuery, statusFilter, typeFilter]);

  const canModify = (upload) => {
    return isAdmin || upload.uploaded_by === userId;
  };

  const handleOpenModal = (upload = null) => {
    setFormErrors({});
    setSelectedFile(null);
    if (upload) {
      setEditingUploadId(upload.id || upload._id);
      setFormData({ 
        title: upload.title,
        upload_type: upload.upload_type,
        monitoring_site_id: upload.monitoring_site_id,
        sensor_device_id: upload.sensor_device_id || '',
        description: upload.description || '',
        status: upload.status
      });
    } else {
      setEditingUploadId(null);
      setFormData({ ...INITIAL_FORM_DATA });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUploadId(null);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.monitoring_site_id) errors.monitoring_site_id = 'Monitoring Site is required';
    if (!editingUploadId && !selectedFile) errors.file = 'File is required';
    if (selectedFile && selectedFile.size > 20 * 1024 * 1024) errors.file = 'File size must not exceed 20 MB';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveUpload = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (editingUploadId && !selectedFile) {
        // Metadata only update
        const payload = {
          title: formData.title,
          upload_type: formData.upload_type,
          monitoring_site_id: formData.monitoring_site_id,
          sensor_device_id: formData.sensor_device_id || null,
          description: formData.description || null,
          status: formData.status
        };
        await uploadService.updateUpload(editingUploadId, payload);
        toast.success("Upload metadata updated successfully");
      } else {
        // Form Data with file
        const payload = new FormData();
        payload.append('title', formData.title);
        payload.append('upload_type', formData.upload_type);
        payload.append('monitoring_site_id', formData.monitoring_site_id);
        if (formData.sensor_device_id) payload.append('sensor_device_id', formData.sensor_device_id);
        if (formData.description) payload.append('description', formData.description);
        if (editingUploadId) payload.append('status', formData.status);
        payload.append('file', selectedFile);

        if (editingUploadId) {
          await uploadService.updateUpload(editingUploadId, payload);
          toast.success("Upload updated successfully");
        } else {
          await uploadService.createUpload(payload);
          toast.success("File uploaded successfully");
        }
      }
      handleCloseModal();
      fetchData();
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error(error.response.data.detail || "You do not have permission to modify this upload.");
      } else if (error.response?.status === 400) {
        toast.error(error.response.data.detail || "Validation error");
      } else {
        toast.error(editingUploadId ? "Failed to update upload" : "Failed to create upload");
      }
    }
  };

  const confirmDelete = (id) => {
    setUploadToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    try {
      await uploadService.deleteUpload(uploadToDelete);
      toast.success("Upload deleted successfully");
      fetchData();
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error(error.response.data.detail || "You do not have permission to modify this upload.");
      } else {
        toast.error("Failed to delete upload");
      }
    } finally {
      setIsDeleteModalOpen(false);
      setUploadToDelete(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Processed': return 'bg-green-100 text-green-700 border-green-200';
      case 'Processing': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Rejected': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-orange-100 text-orange-700 border-orange-200'; // Pending Review
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Image': return <ImageIcon className="w-5 h-5 text-purple-500" />;
      case 'Video': return <Video className="w-5 h-5 text-red-500" />;
      case 'Audio': return <Music className="w-5 h-5 text-orange-500" />;
      case 'Survey File': return <FileText className="w-5 h-5 text-green-500" />;
      default: return <File className="w-5 h-5 text-blue-500" />;
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
          <h1 className="text-3xl font-bold text-foreground">Field Uploads</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Manage raw data, imagery, and files collected from the field.
          </p>
        </div>
        <Button onClick={() => handleOpenModal()} className="gap-2 bg-primary text-white hover:bg-primary/90">
          <Plus className="w-5 h-5" />
          New Upload
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 soft-shadow bg-white rounded-xl">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <UploadCloud className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Uploads</p>
              <p className="text-2xl font-bold">{summary.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 soft-shadow bg-white rounded-xl">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
              <p className="text-2xl font-bold">{summary.pending}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 soft-shadow bg-white rounded-xl">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Processed Files</p>
              <p className="text-2xl font-bold">{summary.processed}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 soft-shadow bg-white rounded-xl">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <HardDrive className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Storage Used</p>
              <p className="text-2xl font-bold">{summary.storage}</p>
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
            placeholder="Search uploads..." 
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
              {UPLOAD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
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

      {/* Uploads List */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : displayUploads.length === 0 ? (
        <motion.div variants={itemVariants} className="bg-white rounded-xl soft-shadow p-12 flex flex-col items-center justify-center text-center border border-dashed border-gray-200">
          <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <File className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-foreground">No uploads found</h3>
          <p className="text-muted-foreground mt-1 max-w-sm">
            We couldn't find any uploads matching your search criteria.
          </p>
          <Button onClick={() => {setSearchQuery(''); setStatusFilter('All'); setTypeFilter('All');}} variant="outline" className="mt-4">
            Clear Filters
          </Button>
        </motion.div>
      ) : (
        <div className="bg-white rounded-xl soft-shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-medium">File Details</th>
                  <th className="px-6 py-4 font-medium">Source</th>
                  <th className="px-6 py-4 font-medium">Uploader</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {displayUploads.map(upload => (
                    <motion.tr 
                      key={upload.id || upload._id} 
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-50 rounded-lg border border-gray-100 shrink-0">
                            {getTypeIcon(upload.upload_type)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground truncate max-w-[200px]">{upload.title}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">{upload.file_name} • {upload.file_size.toFixed(2)} MB</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">{upload.monitoring_site_name}</span>
                          {upload.sensor_device_name && <span className="text-xs text-muted-foreground">{upload.sensor_device_name}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">{upload.uploaded_by_name}</span>
                          <span className="text-xs text-muted-foreground">{new Date(upload.uploaded_at).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-xs font-medium ${getStatusColor(upload.status)}`}>
                          {upload.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1 justify-end">
                          <a href={upload.file_url} target="_blank" rel="noreferrer">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                              <Download className="h-4 w-4" />
                            </Button>
                          </a>
                          {canModify(upload) && (
                            <>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => handleOpenModal(upload)}>
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => confirmDelete(upload.id || upload._id)}>
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
                <h2 className="text-xl font-bold">{editingUploadId ? 'Edit Upload' : 'New Upload'}</h2>
                <Button variant="ghost" size="icon" onClick={handleCloseModal} className="h-8 w-8 rounded-full">
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="p-6 overflow-y-auto">
                <form id="upload-form" onSubmit={handleSaveUpload} className="space-y-4">
                  
                  <div className="space-y-2">
                    <Label>File Selection {editingUploadId ? '(Optional)' : '<span class="text-destructive">*</span>'}</Label>
                    <div className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center ${formErrors.file ? 'border-destructive bg-destructive/5' : 'border-gray-200 bg-gray-50'}`}>
                      <UploadCloud className="h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm font-medium text-foreground mb-1">
                        {selectedFile ? selectedFile.name : (editingUploadId ? 'Upload new file to replace' : 'Click or drag file to upload')}
                      </p>
                      <p className="text-xs text-muted-foreground mb-4">
                        {selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB` : 'Max size: 20MB. Images, Videos, Audio, Documents.'}
                      </p>
                      <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                        {selectedFile ? 'Change File' : 'Browse Files'}
                      </Button>
                      <input 
                        type="file" 
                        className="hidden" 
                        ref={fileInputRef}
                        onChange={(e) => setSelectedFile(e.target.files[0])}
                      />
                    </div>
                    {formErrors.file && <p className="text-xs text-destructive">{formErrors.file}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
                      <Input 
                        id="title" value={formData.title} 
                        onChange={(e) => setFormData({...formData, title: e.target.value})} 
                        className={formErrors.title ? "border-destructive focus-visible:ring-destructive" : ""}
                        placeholder="e.g. Tiger Sighting Core Alpha"
                      />
                      {formErrors.title && <p className="text-xs text-destructive">{formErrors.title}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="upload_type">Upload Type <span className="text-destructive">*</span></Label>
                      <select 
                        id="upload_type" value={formData.upload_type} 
                        onChange={(e) => setFormData({...formData, upload_type: e.target.value})}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        {UPLOAD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="monitoring_site_id">Monitoring Site <span className="text-destructive">*</span></Label>
                      <select 
                        id="monitoring_site_id" value={formData.monitoring_site_id} 
                        onChange={(e) => {
                          setFormData({...formData, monitoring_site_id: e.target.value, sensor_device_id: ''});
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
                        <option value="">None / Not Applicable</option>
                        {filteredDevices.map(d => <option key={d.id || d._id} value={d.id || d._id}>{d.device_name} ({d.device_type})</option>)}
                      </select>
                    </div>
                  </div>

                  {editingUploadId && (
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
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <textarea 
                      id="description" value={formData.description} 
                      onChange={(e) => setFormData({...formData, description: e.target.value})} 
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[80px] resize-y"
                      placeholder="Additional context or notes about this upload..."
                    ></textarea>
                  </div>
                </form>
              </div>
              
              <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 mt-auto">
                <Button type="button" variant="outline" onClick={handleCloseModal}>Cancel</Button>
                <Button type="submit" form="upload-form" className="bg-primary hover:bg-primary/90 text-white">
                  {editingUploadId ? 'Save Changes' : 'Upload File'}
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
              <h3 className="text-xl font-bold mb-2">Delete Upload?</h3>
              <p className="text-muted-foreground mb-6">
                Are you sure you want to delete this upload? This action cannot be undone and the physical file will be removed.
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

export default UploadsPage;
