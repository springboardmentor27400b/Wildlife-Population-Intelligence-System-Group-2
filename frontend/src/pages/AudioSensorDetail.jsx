import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Volume2, MapPin, Calendar, Compass, ArrowLeft } from 'lucide-react';
import { getAudioSensor } from '../api/audioSensors';
import { getMonitoringSite } from '../api/monitoringSites';
import Badge from '../components/common/Badge';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import Toast from '../components/common/Toast';
import { formatDateTime } from '../utils/formatters';

export const AudioSensorDetail = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [sensor, setSensor] = useState(null);
  const [site, setSite] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const sensData = await getAudioSensor(id);
        setSensor(sensData);
        
        if (sensData.site_id) {
          const siteData = await getMonitoringSite(sensData.site_id);
          setSite(siteData);
        }
      } catch (err) {
        console.error(err);
        setToastMsg({ text: 'Failed to retrieve audio sensor details.', type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!sensor) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 dark:text-slate-450 mb-4">Equipment not found or access denied.</p>
        <Link to="/audio-sensors">
          <Button variant="outline">Back to Equipment</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top navigation controls */}
      <div className="flex items-center gap-3">
        <Link to="/audio-sensors">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <span className="text-xs text-slate-500 font-medium">Back to Equipment</span>
      </div>

      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold font-outfit text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Volume2 className="w-6 h-6 text-emerald-600" />
                {sensor.model}
              </h2>
              <Badge status={sensor.status}>{sensor.status}</Badge>
            </div>
            
            <p className="text-sm font-semibold text-slate-650 dark:text-slate-400">
              Serial Number: <span className="font-mono text-slate-800 dark:text-slate-200">{sensor.serial_number}</span>
            </p>
            
            <div className="flex items-center gap-2 text-xs text-slate-450 pt-2">
              <Calendar className="w-4 h-4" />
              <span>Registered: {formatDateTime(sensor.created_at)}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Deployment site card */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-550">
          Deployment Telemetry
        </h3>
        
        {site ? (
          <Card className="p-6 bg-slate-50/50 dark:bg-forest-950/20">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-emerald-650" />
                  <span className="font-bold text-slate-850 dark:text-slate-200">{site.name}</span>
                  <Badge status="Active">{site.habitat_type}</Badge>
                </div>
                <p className="text-xs text-slate-500 max-w-lg">
                  {site.description}
                </p>
                <div className="flex items-center gap-4 text-xs text-slate-450 font-mono pt-1">
                  <span>LAT: {site.latitude.toFixed(5)}°</span>
                  <span>LON: {site.longitude.toFixed(5)}°</span>
                </div>
              </div>
              <Link to={`/monitoring-sites/${site.id}`}>
                <Button variant="outline" size="sm">
                  View Site
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="p-6 bg-slate-100 dark:bg-forest-900 border border-slate-200 dark:border-forest-850 rounded-xl text-center text-xs text-slate-500">
            This equipment is currently unassigned. Edit details to deploy it to an active monitoring site.
          </div>
        )}
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
export default AudioSensorDetail;
