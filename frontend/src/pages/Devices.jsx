import React, { useState, useEffect } from 'react';
import { devicesAPI, sitesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Cpu, Plus, Search, Edit, Trash2, Calendar, Radio } from 'lucide-react';

export default function Devices() {
  const { user } = useAuth();
  const [devices, setDevices] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSiteId, setModalSiteId] = useState('');
  const [modalType, setModalType] = useState('CameraTrap');
  const [modalModel, setModalModel] = useState('');
  const [modalDeploymentDate, setModalDeploymentDate] = useState('');
  const [modalStatus, setModalStatus] = useState('Operational');
  const [editingId, setEditingId] = useState(null);
  
  const [errorMsg, setErrorMsg] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [devicesData, sitesData] = await Promise.all([
        devicesAPI.list(),
        sitesAPI.list()
      ]);
      setDevices(devicesData);
      setSites(sitesData);
      if (sitesData.length > 0) {
        setModalSiteId(sitesData[0].id.toString());
      }
    } catch (err) {
      console.error("Error loading devices data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingId(null);
    if (sites.length > 0) {
      setModalSiteId(sites[0].id.toString());
    } else {
      setModalSiteId('');
    }
    setModalType('CameraTrap');
    setModalModel('');
    setModalDeploymentDate(new Date().toISOString().split('T')[0]);
    setModalStatus('Operational');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (device) => {
    setEditingId(device.id);
    setModalSiteId(device.site_id.toString());
    setModalType(device.type);
    setModalModel(device.model_number || '');
    setModalDeploymentDate(device.deployment_date);
    setModalStatus(device.status);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!modalSiteId) {
      setErrorMsg('You must select a monitoring site first. Register a site if none exist.');
      return;
    }

    const payload = {
      site_id: parseInt(modalSiteId),
      type: modalType,
      model_number: modalModel || null,
      deployment_date: modalDeploymentDate,
      status: modalStatus
    };

    try {
      if (editingId) {
        await devicesAPI.update(editingId, payload);
      } else {
        await devicesAPI.create(payload);
      }
      window.dispatchEvent(new Event('dashboard-stats-update'));
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.detail || 'Failed to save device. Verify inputs.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this device?")) return;
    try {
      await devicesAPI.delete(id);
      window.dispatchEvent(new Event('dashboard-stats-update'));
      window.dispatchEvent(new CustomEvent('alertsUpdated'));
      fetchData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "Delete operation failed.");
    }
  };

  const getSiteName = (siteId) => {
    const site = sites.find(s => s.id === siteId);
    return site ? site.name : `Site (ID: ${siteId})`;
  };

  const filteredDevices = devices.filter(d => {
    const siteName = getSiteName(d.site_id).toLowerCase();
    const model = d.model_number ? d.model_number.toLowerCase() : '';
    const type = d.type.toLowerCase();
    const query = searchQuery.toLowerCase();
    return siteName.includes(query) || model.includes(query) || type.includes(query);
  });

  const canModify = user?.role === 'Admin' || user?.role === 'Researcher';

  return (
    <div className="space-y-6">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-100">Telemetry Devices</h2>
          <p className="text-sm text-zinc-400 mt-1">Register, configure, and review active field sensors.</p>
        </div>
        {canModify && (
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition shadow-lg shadow-emerald-900/20 cursor-pointer"
          >
            <Plus size={16} />
            <span>Register Device</span>
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
          placeholder="Search devices by site, model, or type..."
          className="w-full pl-10 pr-4 py-2 bg-zinc-950 border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg text-zinc-100 placeholder-zinc-600 outline-none text-sm transition"
        />
      </div>

      {/* Content Stream */}
      {loading ? (
        <div className="text-center py-12 text-zinc-500 text-sm">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-3"></div>
          Loading telemetry devices...
        </div>
      ) : filteredDevices.length === 0 ? (
        <div className="text-center py-16 bg-zinc-900 border border-zinc-800 border-dashed rounded-2xl text-zinc-500">
          <Cpu className="mx-auto text-zinc-600 mb-3" size={32} />
          <p className="font-bold text-zinc-400">No devices registered</p>
          <p className="text-xs text-zinc-650 mt-1">Try refining search parameters or register a new sensor.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDevices.map((device) => (
            <div key={device.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between hover:border-zinc-700/80 transition-all">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2">
                    {device.type === 'CameraTrap' ? (
                      <Cpu className="text-emerald-500" size={18} />
                    ) : (
                      <Radio className="text-emerald-500" size={18} />
                    )}
                    <span className="font-bold text-sm text-zinc-200">{device.type === 'CameraTrap' ? 'Camera Trap' : 'Audio Sensor'}</span>
                  </div>
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                    device.status === 'Operational' 
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/30' 
                      : device.status === 'Maintenance'
                        ? 'bg-yellow-950 text-yellow-400 border border-yellow-900/30'
                        : 'bg-red-950 text-red-400 border border-red-900/30'
                  }`}>
                    {device.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-zinc-455">
                  <p><strong>Site:</strong> <span className="text-zinc-300">{getSiteName(device.site_id)}</span></p>
                  <p><strong>Model:</strong> <span className="text-zinc-300">{device.model_number || 'N/A'}</span></p>
                  <p className="flex items-center space-x-1 mt-1 text-[11px] text-zinc-500">
                    <Calendar size={12} />
                    <span>Deployed: {device.deployment_date}</span>
                  </p>
                </div>
              </div>

              {canModify && (
                <div className="flex justify-end space-x-2 pt-4 border-t border-zinc-800/40 mt-5">
                  <button
                    onClick={() => handleOpenEditModal(device)}
                    title="Edit Device"
                    className="p-2 bg-zinc-950 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-lg transition cursor-pointer"
                  >
                    <Edit size={14} />
                  </button>
                  {user?.role === 'Admin' && (
                    <button
                      onClick={() => handleDelete(device.id)}
                      title="Remove Device"
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

      {/* Register / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-zinc-100">{editingId ? 'Edit Device Settings' : 'Register New Device'}</h3>
            
            {errorMsg && (
              <div className="p-3 bg-red-950/50 border border-red-900/30 text-red-400 text-xs rounded-lg font-medium text-center">
                {errorMsg}
              </div>
            )}

            {sites.length === 0 ? (
              <div className="space-y-4">
                <p className="text-xs text-zinc-400">You must register at least one monitoring site before adding devices.</p>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-350 rounded-xl text-sm font-semibold transition"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Select Deployment Site</label>
                  <select
                    value={modalSiteId}
                    onChange={(e) => setModalSiteId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-zinc-300 outline-none text-sm transition"
                  >
                    {sites.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.habitat_type})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Device Type</label>
                    <select
                      value={modalType}
                      onChange={(e) => setModalType(e.target.value)}
                      className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-zinc-300 outline-none text-sm transition"
                    >
                      <option value="CameraTrap">Camera Trap</option>
                      <option value="AudioSensor">Audio Sensor</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Status</label>
                    <select
                      value={modalStatus}
                      onChange={(e) => setModalStatus(e.target.value)}
                      className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-zinc-300 outline-none text-sm transition"
                    >
                      <option value="Operational">Operational</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Offline">Offline</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Model / Hardware Number</label>
                  <input
                    type="text"
                    value={modalModel}
                    onChange={(e) => setModalModel(e.target.value)}
                    placeholder="e.g. YoloCam-V4-Lite"
                    className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-zinc-100 outline-none text-sm transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Deployment Date</label>
                  <input
                    type="date"
                    required
                    value={modalDeploymentDate}
                    onChange={(e) => setModalDeploymentDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-zinc-300 outline-none text-sm transition"
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
                    {editingId ? 'Save Changes' : 'Register Sensor'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
