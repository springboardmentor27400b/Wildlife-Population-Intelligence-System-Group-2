import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getDashboardSummary } from '../api/dashboard';
import { getObservations } from '../api/observations';
import { getMonitoringSites } from '../api/monitoringSites';
import { getCameraTraps } from '../api/cameraTraps';
import { getAudioSensors } from '../api/audioSensors';
import { getSpeciesList } from '../api/species';

import Spinner from '../components/common/Spinner';
import Toast from '../components/common/Toast';

import ResearcherDashboardView from './dashboard/ResearcherDashboardView';
import ConservationDashboardView from './dashboard/ConservationDashboardView';
import ForestOfficerDashboardView from './dashboard/ForestOfficerDashboardView';
import AdminDashboardView from './dashboard/AdminDashboardView';

export const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);
  const [observations, setObservations] = useState([]);
  const [sites, setSites] = useState([]);
  const [cameras, setCameras] = useState([]);
  const [sensors, setSensors] = useState([]);
  const [speciesList, setSpeciesList] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const [summary, obsData, sitesData, camsData, sensData, spData] = await Promise.all([
        getDashboardSummary(),
        getObservations({ page_size: 100 }),
        getMonitoringSites({ page_size: 100 }),
        getCameraTraps({ page_size: 100 }),
        getAudioSensors({ page_size: 100 }),
        getSpeciesList({ page_size: 100 })
      ]);
      setMetrics(summary);
      setObservations(obsData.items || []);
      setSites(sitesData.items || []);
      setCameras(camsData.items || []);
      setSensors(sensData.items || []);
      setSpeciesList(spData.items || []);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const renderDashboardByRole = () => {
    const role = user?.role;
    switch (role) {
      case 'Wildlife Researcher':
        return (
          <ResearcherDashboardView
            metrics={metrics}
            fetchMetrics={fetchMetrics}
            observations={observations}
            sites={sites}
            speciesList={speciesList}
            cameras={cameras}
            sensors={sensors}
            loading={loading}
          />
        );
      case 'Conservation Officer':
        return (
          <ConservationDashboardView
            metrics={metrics}
            fetchMetrics={fetchMetrics}
            observations={observations}
            sites={sites}
            speciesList={speciesList}
            cameras={cameras}
            sensors={sensors}
            loading={loading}
          />
        );
      case 'Forest Department Officer':
        return (
          <ForestOfficerDashboardView
            metrics={metrics}
            fetchMetrics={fetchMetrics}
            observations={observations}
            sites={sites}
            cameras={cameras}
            sensors={sensors}
            loading={loading}
          />
        );
      case 'Administrator':
      default:
        return (
          <AdminDashboardView
            metrics={metrics}
            fetchMetrics={fetchMetrics}
            observations={observations}
            sites={sites}
            speciesList={speciesList}
            cameras={cameras}
            sensors={sensors}
            loading={loading}
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner Card */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-800 text-white rounded-3xl p-6 shadow-md relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="space-y-2 z-10">
          <h1 className="text-3xl font-black font-outfit uppercase">WILDLIFE INTELLIGENCE DASHBOARD</h1>
          <p className="text-xs text-emerald-100 max-w-xl font-semibold leading-relaxed">
            Welcome back, <span className="font-extrabold text-white underline">{user?.full_name || 'Admin'}</span> ({user?.role || 'Administrator'}). Monitor wildlife observations, AI analyses, species activity, and ecosystem health in one place.
          </p>
        </div>
        <div className="flex gap-3 z-10 flex-wrap">
          <Link to="/map">
            <button className="bg-white text-emerald-800 hover:bg-emerald-50 font-bold border-none py-2.5 px-4 shadow-md rounded-xl text-xs transition-colors">
              Open Command Map
            </button>
          </Link>
          <Link to="/species-recognition">
            <button className="bg-emerald-955 text-white hover:bg-emerald-900 border-none py-2.5 px-4 shadow-md rounded-xl text-xs transition-colors">
              Run Image Inference
            </button>
          </Link>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full filter blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-48 h-48 bg-emerald-500/10 rounded-full filter blur-2xl pointer-events-none" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="animate-fade-in">
          {renderDashboardByRole()}
        </div>
      )}

      {errorMsg && (
        <Toast
          message={errorMsg}
          type="error"
          onClose={() => setErrorMsg(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;
