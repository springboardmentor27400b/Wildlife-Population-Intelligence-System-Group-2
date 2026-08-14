import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Globe, Compass, Cpu, Volume2, Eye, Plus, ArrowLeft } from 'lucide-react';
import { getMonitoringSite } from '../api/monitoringSites';
import { getCameraTraps } from '../api/cameraTraps';
import { getAudioSensors } from '../api/audioSensors';
import { getObservations } from '../api/observations';
import { useAuth } from '../hooks/useAuth';
import Badge from '../components/common/Badge';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import DataTable from '../components/common/DataTable';
import Toast from '../components/common/Toast';
import { formatDate } from '../utils/formatters';

export const MonitoringSiteDetail = () => {
  const { id } = useParams();
  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [site, setSite] = useState(null);
  const [cameras, setCameras] = useState([]);
  const [sensors, setSensors] = useState([]);
  const [observations, setObservations] = useState([]);
  const [toastMsg, setToastMsg] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const siteData = await getMonitoringSite(id);
        setSite(siteData);
        
        // Fetch devices and sightings
        const camerasData = await getCameraTraps({ site_id: id });
        const sensorsData = await getAudioSensors({ site_id: id });
        const obsData = await getObservations({ site_id: id });
        
        setCameras(camerasData.items);
        setSensors(sensorsData.items);
        setObservations(obsData.items);
      } catch (err) {
        console.error(err);
        setToastMsg({ text: 'Failed to retrieve site details.', type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const cameraColumns = [
    {
      header: 'Model',
      accessor: 'model',
      cell: (row) => <span className="font-semibold">{row.model}</span>
    },
    {
      header: 'Serial Number',
      accessor: 'serial_number'
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => <Badge status={row.status}>{row.status}</Badge>
    }
  ];

  const sensorColumns = [
    {
      header: 'Model',
      accessor: 'model',
      cell: (row) => <span className="font-semibold">{row.model}</span>
    },
    {
      header: 'Serial Number',
      accessor: 'serial_number'
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => <Badge status={row.status}>{row.status}</Badge>
    }
  ];

  const obsColumns = [
    {
      header: 'Species',
      accessor: 'species',
      cell: (row) => <span className="font-semibold text-slate-800 dark:text-slate-200">{row.species}</span>
    },
    {
      header: 'Count',
      accessor: 'count'
    },
    {
      header: 'Observed At',
      accessor: 'observed_at',
      cell: (row) => <span className="text-xs">{formatDate(row.observed_at)}</span>
    },
    {
      header: 'Actions',
      cell: (row) => (
        <Link to={`/observations/${row.id}`}>
          <Button variant="outline" size="sm">
            <Eye className="w-3.5 h-3.5" />
          </Button>
        </Link>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!site) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 dark:text-slate-450 mb-4">Monitoring site not found or access denied.</p>
        <Link to="/monitoring-sites">
          <Button variant="outline">Back to Sites</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top controls */}
      <div className="flex items-center gap-3">
        <Link to="/monitoring-sites">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <span className="text-xs text-slate-500 font-medium">Back to Site List</span>
      </div>

      {/* Details Card */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold font-outfit text-slate-800 dark:text-slate-100">
                {site.name}
              </h2>
              <Badge status="Active">{site.habitat_type}</Badge>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
              {site.description || 'No description provided.'}
            </p>
            
            <div className="flex flex-wrap items-center gap-5 text-xs text-slate-500 pt-2">
              <span className="flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-emerald-600" />
                Latitude: {site.latitude.toFixed(5)}°
              </span>
              <span className="flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-emerald-600" />
                Longitude: {site.longitude.toFixed(5)}°
              </span>
            </div>
          </div>
          {hasPermission('site:update') && (
            <Link to={`/monitoring-sites/edit/${site.id}`}>
              <Button variant="primary">
                Edit Site
              </Button>
            </Link>
          )}
        </div>
      </Card>

      {/* Grid of Devices lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Camera Traps */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold font-outfit text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-emerald-600" />
              Camera Traps ({cameras.length})
            </h3>
            {hasPermission('device:create') && (
              <Link to={`/camera-traps/new?site_id=${site.id}`}>
                <Button variant="outline" size="sm" icon={Plus}>
                  Deploy
                </Button>
              </Link>
            )}
          </div>
          <div className="bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-850 rounded-2xl shadow-sm overflow-hidden">
            <DataTable
              columns={cameraColumns}
              data={cameras}
              emptyMessage="No camera traps deployed here."
            />
          </div>
        </div>

        {/* Audio Sensors */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold font-outfit text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-emerald-600" />
              Audio Sensors ({sensors.length})
            </h3>
            {hasPermission('device:create') && (
              <Link to={`/audio-sensors/new?site_id=${site.id}`}>
                <Button variant="outline" size="sm" icon={Plus}>
                  Deploy
                </Button>
              </Link>
            )}
          </div>
          <div className="bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-850 rounded-2xl shadow-sm overflow-hidden">
            <DataTable
              columns={sensorColumns}
              data={sensors}
              emptyMessage="No acoustic sensors deployed here."
            />
          </div>
        </div>
      </div>

      {/* Sighting list */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold font-outfit text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Eye className="w-5 h-5 text-emerald-600" />
            Recent Sightings Log ({observations.length})
          </h3>
          {hasPermission('observation:create') && (
            <Link to={`/observations/new?site_id=${site.id}`}>
              <Button variant="outline" size="sm" icon={Plus}>
                Log Sighting
              </Button>
            </Link>
          )}
        </div>
        <div className="bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-850 rounded-2xl shadow-sm overflow-hidden">
          <DataTable
            columns={obsColumns}
            data={observations}
            emptyMessage="No sightings logged for this site yet."
          />
        </div>
      </div>

      {toastMsg && (
        <Toast
          message={toastMsg.text}
          type={toastMsg.type}
          onClose={() => setToastMsg(null)}
        />
      )}
    </div>
  );
};
export default MonitoringSiteDetail;
