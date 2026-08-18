import React, { useState, useEffect } from 'react';
import { sitesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MapPin, Plus, Search, Edit, Trash2, Map } from 'lucide-react';

export default function Sites() {
  const { user } = useAuth();
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalName, setModalName] = useState('');
  const [modalLat, setModalLat] = useState('');
  const [modalLng, setModalLng] = useState('');
  const [modalHabitat, setModalHabitat] = useState('');
  const [modalProtectedArea, setModalProtectedArea] = useState('');
  const [editingId, setEditingId] = useState(null);
  
  const [errorMsg, setErrorMsg] = useState('');

  const fetchSites = async () => {
    setLoading(true);
    try {
      const data = await sitesAPI.list();
      setSites(data);
    } catch (err) {
      console.error("Error loading sites:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSites();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setModalName('');
    setModalLat('');
    setModalLng('');
    setModalHabitat('Forest');
    setModalProtectedArea('');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (site) => {
    setEditingId(site.id);
    setModalName(site.name);
    setModalLat(site.latitude.toString());
    setModalLng(site.longitude.toString());
    setModalHabitat(site.habitat_type);
    setModalProtectedArea(site.protected_area || '');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const payload = {
      name: modalName,
      latitude: parseFloat(modalLat),
      longitude: parseFloat(modalLng),
      habitat_type: modalHabitat,
      protected_area: modalProtectedArea || null
    };

    try {
      if (editingId) {
        await sitesAPI.update(editingId, payload);
      } else {
        await sitesAPI.create(payload);
      }
      setIsModalOpen(false);
      fetchSites();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.detail || 'Failed to save site. Verify coordinates and details.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this monitoring site? This may fail if devices are connected to it.")) return;
    try {
      await sitesAPI.delete(id);
      fetchSites();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "Delete operation failed. Site may have connected devices.");
    }
  };

  const filteredSites = sites.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.habitat_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.protected_area && s.protected_area.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const canModify = user?.role === 'Admin' || user?.role === 'Researcher';

  return (
    <div className="space-y-6">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-100">Monitoring Sites</h2>
          <p className="text-sm text-zinc-400 mt-1">Register and locate geographical research sectors and plots.</p>
        </div>
        {canModify && (
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition shadow-lg shadow-emerald-900/20 cursor-pointer"
          >
            <Plus size={16} />
            <span>Add Site</span>
          </button>
        )}
      </div>

      {/* Filter and search controls */}
      <div className="relative bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
        <Search className="absolute left-7 top-7 text-zinc-500" size={16} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search sites by name, habitat, or protected region..."
          className="w-full pl-10 pr-4 py-2 bg-zinc-950 border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg text-zinc-100 placeholder-zinc-600 outline-none text-sm transition"
        />
      </div>

      {/* Content Stream */}
      {loading ? (
        <div className="text-center py-12 text-zinc-500 text-sm">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-3"></div>
          Loading geographical sectors...
        </div>
      ) : filteredSites.length === 0 ? (
        <div className="text-center py-16 bg-zinc-900 border border-zinc-800 border-dashed rounded-2xl text-zinc-500">
          <MapPin className="mx-auto text-zinc-600 mb-3" size={32} />
          <p className="font-bold text-zinc-400">No monitoring sites registered</p>
          <p className="text-xs text-zinc-650 mt-1">Try refining search parameters or register a new site.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredSites.map((site) => (
            <div key={site.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between hover:border-zinc-700/80 transition-all">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-zinc-100 text-base leading-snug">{site.name}</h3>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300">
                    {site.habitat_type}
                  </span>
                </div>
                
                <p className="text-xs text-zinc-400 mb-4">
                  <strong>Protected Area:</strong> {site.protected_area || 'Not specified'}
                </p>

                <div className="p-3 bg-zinc-950/60 rounded-xl space-y-1 text-xs text-zinc-500 border border-zinc-850">
                  <p><strong>GPS Coordinates (WGS84):</strong></p>
                  <div className="flex space-x-4">
                    <p>Latitude: <span className="text-zinc-300 font-mono">{site.latitude}</span></p>
                    <p>Longitude: <span className="text-zinc-300 font-mono">{site.longitude}</span></p>
                  </div>
                </div>
              </div>

              {canModify && (
                <div className="flex justify-end space-x-2 pt-4 border-t border-zinc-800/40 mt-5">
                  <button
                    onClick={() => handleOpenEditModal(site)}
                    title="Edit Site"
                    className="p-2 bg-zinc-950 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-lg transition cursor-pointer"
                  >
                    <Edit size={14} />
                  </button>
                  {user?.role === 'Admin' && (
                    <button
                      onClick={() => handleDelete(site.id)}
                      title="Delete Site"
                      className="p-2 bg-zinc-950 border border-red-950 hover:bg-red-950/40 text-red-500 rounded-lg transition cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              )}

            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-zinc-100">{editingId ? 'Edit Monitoring Site' : 'Add Monitoring Site'}</h3>
            
            {errorMsg && (
              <div className="p-3 bg-red-950/50 border border-red-900/30 text-red-400 text-xs rounded-lg font-medium text-center">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Site Name</label>
                <input
                  type="text"
                  required
                  value={modalName}
                  onChange={(e) => setModalName(e.target.value)}
                  placeholder="e.g. Serengeti Sector A-3"
                  className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-zinc-100 outline-none text-sm transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Latitude (-90 to 90)</label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={modalLat}
                    onChange={(e) => setModalLat(e.target.value)}
                    placeholder="e.g. -2.152345"
                    className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-zinc-300 outline-none text-sm transition"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Longitude (-180 to 180)</label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={modalLng}
                    onChange={(e) => setModalLng(e.target.value)}
                    placeholder="e.g. 34.685324"
                    className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-zinc-300 outline-none text-sm transition"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Habitat Type</label>
                <select
                  value={modalHabitat}
                  onChange={(e) => setModalHabitat(e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-zinc-300 outline-none text-sm transition"
                >
                  <option value="Forest">Forest</option>
                  <option value="Savanna">Savanna</option>
                  <option value="Grassland">Grassland</option>
                  <option value="Wetland">Wetland</option>
                  <option value="Desert">Desert</option>
                  <option value="Marine">Marine</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Protected Area / Park Name</label>
                <input
                  type="text"
                  value={modalProtectedArea}
                  onChange={(e) => setModalProtectedArea(e.target.value)}
                  placeholder="e.g. Serengeti National Park"
                  className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-zinc-100 outline-none text-sm transition"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-sm font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold transition shadow-lg shadow-emerald-950/20 cursor-pointer"
                >
                  {editingId ? 'Save Changes' : 'Add Site'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
