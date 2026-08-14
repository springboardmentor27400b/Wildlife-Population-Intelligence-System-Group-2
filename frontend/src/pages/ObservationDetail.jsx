import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Eye, 
  MapPin, 
  Calendar, 
  User, 
  FileAudio, 
  ArrowLeft, 
  FileText, 
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  Image as ImageIcon,
  Sparkles,
  Info
} from 'lucide-react';
import { getObservation } from '../api/observations';
import { getMonitoringSite } from '../api/monitoringSites';
import Badge from '../components/common/Badge';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import Toast from '../components/common/Toast';
import { formatDateTime } from '../utils/formatters';

export const ObservationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  const [observation, setObservation] = useState(null);
  const [site, setSite] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const obsData = await getObservation(id);
      setObservation(obsData);
      
      if (obsData.site_id) {
        const siteData = await getMonitoringSite(obsData.site_id);
        setSite(siteData);
      }
    } catch (err) {
      console.error(err);
      setToastMsg({ text: 'Failed to retrieve sighting details.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!observation) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 dark:text-slate-455 mb-4">Observation not found or access denied.</p>
        <Link to="/observations">
          <Button variant="outline">Back to Observations</Button>
        </Link>
      </div>
    );
  }

  const getMediaUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('/static/')) {
      const BASE = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.split('/api')[0] : 'http://localhost:8000';
      return `${BASE}${url}`;
    }
    return url;
  };

  const aiAnalysis = observation.ai_analyses && observation.ai_analyses.length > 0
    ? observation.ai_analyses[observation.ai_analyses.length - 1]
    : null;
    
  const imageResults = aiAnalysis?.image_json;
  const audioResults = aiAnalysis?.audio_json;

  const hasImage = observation.media?.some(m => m.file_type === 'image');
  const hasAudio = observation.media?.some(m => m.file_type === 'audio');

  const imageMediaItem = observation.media?.find(m => m.file_type === 'image');
  const audioMediaItem = observation.media?.find(m => m.file_type === 'audio');

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <Toast 
          text={toastMsg.text} 
          type={toastMsg.type} 
          onClose={() => setToastMsg(null)} 
        />
      )}

      {/* Header breadcrumb */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-forest-850 pb-4">
        <div className="flex items-center gap-3">
          <Link to="/observations">
            <button className="p-2 rounded-lg border border-slate-200 dark:border-forest-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-forest-850 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold font-outfit text-slate-800 dark:text-slate-100">
              Sighting Log Details
            </h1>
            <p className="text-xs text-slate-550 dark:text-slate-400 mt-0.5 font-mono">
              ID: {observation.id}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Link to={`/observations/edit/${observation.id}`}>
            <Button variant="outline" size="sm">
              Edit Details
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns: Metadata details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Observation Core Data */}
          <Card className="p-6 bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-850 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b border-slate-100 dark:border-forest-850 pb-2">
              <Info className="w-5 h-5 text-emerald-600" />
              Observation Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 font-bold block uppercase tracking-wider">Reported Species</span>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-forest-950 px-2 py-1 rounded inline-block">
                  {observation.species}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 font-bold block uppercase tracking-wider">Sighting Quantity</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200 font-mono">
                  {observation.count} individuals
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 font-bold block uppercase tracking-wider">Sighting Timestamp</span>
                <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5 font-mono">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  {formatDateTime(observation.observed_at)}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 font-bold block uppercase tracking-wider">Observer / Reporter</span>
                <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-slate-400" />
                  {observation.reporter?.full_name || 'System Auto-Log'}
                </span>
              </div>
            </div>

            {observation.notes && (
              <div className="space-y-1 border-t border-slate-100 dark:border-forest-850 pt-3 text-xs">
                <span className="text-slate-400 font-bold block uppercase tracking-wider">Sighting Notes</span>
                <p className="text-slate-600 dark:text-slate-350 italic leading-relaxed">
                  "{observation.notes}"
                </p>
              </div>
            )}
          </Card>

          {/* Monitoring Site Geography Card */}
          {site && (
            <Card className="p-6 bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-850 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b border-slate-100 dark:border-forest-850 pb-2">
                <MapPin className="w-5 h-5 text-emerald-600" />
                Site & Geography details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 font-bold block uppercase tracking-wider">Monitoring Site</span>
                  <span className="font-semibold text-slate-850 dark:text-slate-250 block mt-0.5">{site.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block uppercase tracking-wider">Habitat Classification</span>
                  <span className="font-semibold text-slate-850 dark:text-slate-250 block mt-0.5">{site.habitat_type}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block uppercase tracking-wider">Coordinates</span>
                  <span className="font-mono text-slate-600 dark:text-slate-300 block mt-0.5">
                    {observation.latitude.toFixed(5)}°, {observation.longitude.toFixed(5)}°
                  </span>
                </div>
              </div>
            </Card>
          )}

          {/* Raw Media Upload Viewer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Image Preview */}
            <Card className="p-6 bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-850 shadow-sm flex flex-col justify-between min-h-[220px]">
              <span className="text-xs font-bold text-slate-400 uppercase block mb-3">RAW IMAGE CAPTURE</span>
              {hasImage ? (
                <div className="flex-1 w-full h-40 rounded-xl overflow-hidden bg-slate-100 border relative">
                  <img 
                    src={getMediaUrl(imageMediaItem.file_url)} 
                    alt="Sighting log" 
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center border border-dashed rounded-xl p-4 text-slate-400">
                  <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                  <span className="text-xs">No Image attached to this log</span>
                </div>
              )}
            </Card>

            {/* Audio Preview */}
            <Card className="p-6 bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-850 shadow-sm flex flex-col justify-between min-h-[220px]">
              <span className="text-xs font-bold text-slate-400 uppercase block mb-3">RAW AUDIO RECORDING</span>
              {hasAudio ? (
                <div className="flex-1 flex flex-col justify-center space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-forest-950 border rounded-xl">
                    <FileAudio className="w-8 h-8 text-blue-600 flex-shrink-0 animate-pulse" />
                    <div className="min-w-0">
                      <span className="text-[10px] font-mono text-slate-400 block truncate">FILE: {audioMediaItem.file_name}</span>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-350 block">Bioacoustic Log</span>
                    </div>
                  </div>
                  <audio 
                    controls 
                    src={getMediaUrl(audioMediaItem.file_url)} 
                    className="w-full"
                  />
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center border border-dashed rounded-xl p-4 text-slate-400">
                  <FileAudio className="w-8 h-8 mb-2 opacity-50" />
                  <span className="text-xs">No Audio attached to this log</span>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Right Column: AI Analysis Summary card */}
        <div className="space-y-6">
          <Card className="p-6 bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-850 shadow-sm space-y-6">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b border-slate-100 dark:border-forest-850 pb-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              AI Analysis Summary
            </h3>

            {/* Image AI Status */}
            <div className="space-y-3 p-4 bg-slate-50 dark:bg-forest-950 border rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-550 dark:text-slate-300">Image Analysis</span>
                {aiAnalysis?.image_completed ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40">✔ Completed</span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-600 dark:bg-amber-950/40">⏳ Pending</span>
                )}
              </div>

              {aiAnalysis?.image_completed && imageResults?.detections?.[0] ? (
                <div className="space-y-1.5 text-xs font-mono border-t border-slate-200/50 dark:border-forest-850/50 pt-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Detected:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{imageResults.detections[0].species}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Confidence:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{Math.round(imageResults.detections[0].confidence)}%</span>
                  </div>
                </div>
              ) : (
                <p className="text-[10px] text-slate-400 italic">No image predictions logged for this observation.</p>
              )}

              {hasImage && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full text-center text-[10px] font-extrabold uppercase mt-1"
                  onClick={() => navigate('/species-recognition', { state: { preselectedObsId: observation.id } })}
                >
                  View Full Image Analysis
                </Button>
              )}
            </div>

            {/* Audio AI Status */}
            <div className="space-y-3 p-4 bg-slate-50 dark:bg-forest-950 border rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-550 dark:text-slate-300">Audio Analysis</span>
                {aiAnalysis?.audio_completed ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40">✔ Completed</span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-600 dark:bg-amber-950/40">⏳ Pending</span>
                )}
              </div>

              {aiAnalysis?.audio_completed && audioResults?.top_prediction ? (
                <div className="space-y-1.5 text-xs font-mono border-t border-slate-200/50 dark:border-forest-850/50 pt-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Predicted:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{audioResults.top_prediction.common_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Confidence:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{Math.round(audioResults.top_prediction.confidence)}%</span>
                  </div>
                </div>
              ) : (
                <p className="text-[10px] text-slate-400 italic">No audio predictions logged for this observation.</p>
              )}

              {hasAudio && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full text-center text-[10px] font-extrabold uppercase mt-1"
                  onClick={() => navigate('/audio-analysis', { state: { preselectedObsId: observation.id } })}
                >
                  View Full Audio Analysis
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ObservationDetail;
