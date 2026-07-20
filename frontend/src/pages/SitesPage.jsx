import React, { useState, useEffect, useMemo, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Edit2, Trash2, MapPin, Map, Navigation, 
  Activity, AlertTriangle, ChevronDown, X, Leaf, Globe
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import siteService from '../services/siteService';
import { toast } from 'react-hot-toast';

const INITIAL_FORM_DATA = {
  site_name: '',
  location: '',
  state: '',
  district: '',
  latitude: 0,
  longitude: 0,
  habitat_type: 'Tropical Dry Forest',
  area_sq_km: 0,
  description: '',
  status: 'Active'
};

const SitesPage = () => {
  const { user } = useContext(AuthContext);
  
  const getRoleName = (roleObj) => {
    if (!roleObj) return "";
    return typeof roleObj === 'string' ? roleObj : (roleObj.name || roleObj.role_name || "");
  };
  const isAdmin = getRoleName(user?.role).toLowerCase() === "administrator";

  const [sites, setSites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [habitatFilter, setHabitatFilter] = useState('All');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [editingSiteId, setEditingSiteId] = useState(null);
  const [siteToDelete, setSiteToDelete] = useState(null);

  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchSites();
  }, []);

  const fetchSites = async () => {
    setIsLoading(true);
    try {
      const data = await siteService.getSites();
      setSites(data);
    } catch (error) {
      toast.error(error.customMessage || "Failed to fetch monitoring sites");
    } finally {
      setIsLoading(false);
    }
  };

  const summary = useMemo(() => {
    const habitats = new Set(sites.map(s => s.habitat_type));
    return {
      total: sites.length,
      active: sites.filter(s => s.status === 'Active').length,
      totalArea: sites.reduce((sum, s) => sum + (s.area_sq_km || 0), 0),
      uniqueHabitats: habitats.size,
    };
  }, [sites]);

  const filteredSites = useMemo(() => {
    return sites.filter(s => {
      const matchesSearch = s.site_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            s.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
      const matchesHabitat = habitatFilter === 'All' || s.habitat_type === habitatFilter;
      return matchesSearch && matchesStatus && matchesHabitat;
    });
  }, [sites, searchQuery, statusFilter, habitatFilter]);

  const handleOpenModal = (site = null) => {
    setFormErrors({});
    if (site) {
      setEditingSiteId(site.id || site._id);
      setFormData({
        site_name: site.site_name,
        location: site.location,
        state: site.state,
        district: site.district,
        latitude: site.latitude,
        longitude: site.longitude,
        habitat_type: site.habitat_type,
        area_sq_km: site.area_sq_km,
        description: site.description || '',
        status: site.status
      });
    } else {
      setEditingSiteId(null);
      setFormData({ ...INITIAL_FORM_DATA });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSiteId(null);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.site_name.trim()) errors.site_name = 'Site name is required';
    if (!formData.location.trim()) errors.location = 'Location is required';
    if (!formData.state.trim()) errors.state = 'State is required';
    if (!formData.district.trim()) errors.district = 'District is required';
    if (formData.latitude < -90 || formData.latitude > 90) errors.latitude = 'Invalid latitude (-90 to 90)';
    if (formData.longitude < -180 || formData.longitude > 180) errors.longitude = 'Invalid longitude (-180 to 180)';
    if (formData.area_sq_km <= 0) errors.area_sq_km = 'Area must be greater than 0';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveSite = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (editingSiteId) {
        await siteService.updateSite(editingSiteId, formData);
        toast.success("Site updated successfully");
      } else {
        await siteService.createSite(formData);
        toast.success("Site created successfully");
      }
      handleCloseModal();
      fetchSites();
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error("You are not authorized to edit this site.");
      } else {
        toast.error(editingSiteId ? "Failed to update site" : "Failed to create site");
      }
    }
  };

  const confirmDelete = (id) => {
    setSiteToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    try {
      await siteService.deleteSite(siteToDelete);
      toast.success("Site deleted successfully");
      fetchSites();
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error("You are not authorized to delete this site.");
      } else {
        toast.error("Failed to delete site");
      }
    } finally {
      setIsDeleteModalOpen(false);
      setSiteToDelete(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-700 border-green-200';
      case 'Inactive': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
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

  const uniqueHabitatsList = ['All', ...new Set(sites.map(s => s.habitat_type))];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8 pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Monitoring Sites</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Register and manage ecological monitoring locations.
          </p>
        </div>
        <Button onClick={() => handleOpenModal()} className="gap-2 bg-primary text-white hover:bg-primary/90">
          <Plus className="w-5 h-5" />
          Add Monitoring Site
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 soft-shadow bg-white rounded-xl">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Sites</p>
              <p className="text-2xl font-bold">{summary.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 soft-shadow bg-white rounded-xl">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <Activity className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Sites</p>
              <p className="text-2xl font-bold">{summary.active}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 soft-shadow bg-white rounded-xl">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Globe className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Coverage</p>
              <p className="text-2xl font-bold">{summary.totalArea} <span className="text-sm font-normal text-muted-foreground">sq km</span></p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 soft-shadow bg-white rounded-xl">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
              <Leaf className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Habitat Types</p>
              <p className="text-2xl font-bold">{summary.uniqueHabitats}</p>
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
            placeholder="Search sites by name or location..." 
            className="pl-9 bg-gray-50 border-gray-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-sm text-muted-foreground font-medium hidden sm:inline-block">Status:</span>
            <div className="relative w-full sm:w-40">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full appearance-none bg-gray-50 border border-gray-200 text-foreground text-sm rounded-md focus:ring-primary focus:border-primary block p-2.5 pr-8"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-sm text-muted-foreground font-medium hidden sm:inline-block">Habitat:</span>
            <div className="relative w-full sm:w-48">
              <select 
                value={habitatFilter}
                onChange={(e) => setHabitatFilter(e.target.value)}
                className="w-full appearance-none bg-gray-50 border border-gray-200 text-foreground text-sm rounded-md focus:ring-primary focus:border-primary block p-2.5 pr-8"
              >
                {uniqueHabitatsList.map(h => (
                   <option key={h} value={h}>{h === 'All' ? 'All Habitats' : h}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Site List */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : filteredSites.length === 0 ? (
        <motion.div variants={itemVariants} className="bg-white rounded-xl soft-shadow p-12 flex flex-col items-center justify-center text-center border border-dashed border-gray-200">
          <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <MapPin className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-foreground">No monitoring sites found</h3>
          <p className="text-muted-foreground mt-1 max-w-sm">
            We couldn't find any sites matching your search criteria. Try adjusting your filters or add a new site.
          </p>
          <Button onClick={() => {setSearchQuery(''); setStatusFilter('All'); setHabitatFilter('All');}} variant="outline" className="mt-4">
            Clear Filters
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AnimatePresence>
            {filteredSites.map(site => (
              <motion.div 
                key={site.id || site._id} 
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="h-full border border-gray-100 shadow-sm hover:shadow-md transition-shadow bg-white rounded-xl overflow-hidden group">
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(site.status)}`}>
                          {site.status}
                        </span>
                      </div>
                      {isAdmin && (
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => handleOpenModal(site)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => confirmDelete(site.id || site._id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-bold text-foreground line-clamp-1 mb-1">{site.site_name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px] mb-4">
                      {site.description || "No description provided."}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-y-3 mt-2 text-sm border-t border-gray-100 pt-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Map className="h-4 w-4 shrink-0" />
                        <span className="truncate">{site.location}, {site.state}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Navigation className="h-4 w-4 shrink-0" />
                        <span className="truncate">{site.habitat_type}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Globe className="h-4 w-4 shrink-0" />
                        <span>Lat: {site.latitude}, Lng: {site.longitude}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-between items-center text-xs font-medium text-muted-foreground">
                    <span>District: {site.district}</span>
                    <span className="shrink-0 font-bold">{site.area_sq_km} sq km</span>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create/Edit Modal */}
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
                <h2 className="text-xl font-bold">{editingSiteId ? 'Edit Monitoring Site' : 'Add Monitoring Site'}</h2>
                <Button variant="ghost" size="icon" onClick={handleCloseModal} className="h-8 w-8 rounded-full">
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="p-6 overflow-y-auto">
                <form id="site-form" onSubmit={handleSaveSite} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="site_name">Site Name <span className="text-destructive">*</span></Label>
                      <Input 
                        id="site_name" value={formData.site_name} 
                        onChange={(e) => setFormData({...formData, site_name: e.target.value})} 
                        className={formErrors.site_name ? "border-destructive focus-visible:ring-destructive" : ""}
                        placeholder="e.g. Core Zone Alpha"
                      />
                      {formErrors.site_name && <p className="text-xs text-destructive">{formErrors.site_name}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location <span className="text-destructive">*</span></Label>
                      <Input 
                        id="location" value={formData.location} 
                        onChange={(e) => setFormData({...formData, location: e.target.value})} 
                        className={formErrors.location ? "border-destructive focus-visible:ring-destructive" : ""}
                        placeholder="e.g. Mudumalai National Park"
                      />
                      {formErrors.location && <p className="text-xs text-destructive">{formErrors.location}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="state">State <span className="text-destructive">*</span></Label>
                      <Input 
                        id="state" value={formData.state} 
                        onChange={(e) => setFormData({...formData, state: e.target.value})} 
                        className={formErrors.state ? "border-destructive focus-visible:ring-destructive" : ""}
                        placeholder="e.g. Tamil Nadu"
                      />
                      {formErrors.state && <p className="text-xs text-destructive">{formErrors.state}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="district">District <span className="text-destructive">*</span></Label>
                      <Input 
                        id="district" value={formData.district} 
                        onChange={(e) => setFormData({...formData, district: e.target.value})} 
                        className={formErrors.district ? "border-destructive focus-visible:ring-destructive" : ""}
                        placeholder="e.g. Nilgiris"
                      />
                      {formErrors.district && <p className="text-xs text-destructive">{formErrors.district}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="latitude">Latitude <span className="text-destructive">*</span></Label>
                      <Input 
                        id="latitude" type="number" step="any" value={formData.latitude} 
                        onChange={(e) => setFormData({...formData, latitude: parseFloat(e.target.value) || 0})} 
                        className={formErrors.latitude ? "border-destructive focus-visible:ring-destructive" : ""}
                      />
                      {formErrors.latitude && <p className="text-xs text-destructive">{formErrors.latitude}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="longitude">Longitude <span className="text-destructive">*</span></Label>
                      <Input 
                        id="longitude" type="number" step="any" value={formData.longitude} 
                        onChange={(e) => setFormData({...formData, longitude: parseFloat(e.target.value) || 0})} 
                        className={formErrors.longitude ? "border-destructive focus-visible:ring-destructive" : ""}
                      />
                      {formErrors.longitude && <p className="text-xs text-destructive">{formErrors.longitude}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="habitat_type">Habitat Type</Label>
                      <select 
                        id="habitat_type" value={formData.habitat_type} 
                        onChange={(e) => setFormData({...formData, habitat_type: e.target.value})}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <option value="Tropical Dry Forest">Tropical Dry Forest</option>
                        <option value="Tropical Rainforest">Tropical Rainforest</option>
                        <option value="Wetland">Wetland</option>
                        <option value="Grassland">Grassland</option>
                        <option value="Mangrove">Mangrove</option>
                        <option value="Desert">Desert</option>
                        <option value="Alpine">Alpine</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="area_sq_km">Area Size (sq km) <span className="text-destructive">*</span></Label>
                      <Input 
                        id="area_sq_km" type="number" step="any" min="0" value={formData.area_sq_km} 
                        onChange={(e) => setFormData({...formData, area_sq_km: parseFloat(e.target.value) || 0})} 
                        className={formErrors.area_sq_km ? "border-destructive focus-visible:ring-destructive" : ""}
                      />
                      {formErrors.area_sq_km && <p className="text-xs text-destructive">{formErrors.area_sq_km}</p>}
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
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Notes / Description</Label>
                    <textarea 
                      id="description" value={formData.description} 
                      onChange={(e) => setFormData({...formData, description: e.target.value})} 
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[80px] resize-y"
                      placeholder="Additional details about access, challenges, or specific flora/fauna..."
                    ></textarea>
                  </div>
                </form>
              </div>
              
              <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 mt-auto">
                <Button type="button" variant="outline" onClick={handleCloseModal}>Cancel</Button>
                <Button type="submit" form="site-form" className="bg-primary hover:bg-primary/90 text-white">
                  {editingSiteId ? 'Save Changes' : 'Add Site'}
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
              <h3 className="text-xl font-bold mb-2">Delete Monitoring Site?</h3>
              <p className="text-muted-foreground mb-6">
                Are you sure you want to remove this site? This action cannot be undone.
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

export default SitesPage;
