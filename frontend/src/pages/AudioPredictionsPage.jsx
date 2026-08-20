import React, { useState, useEffect, useRef, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud, Music, Play, CheckCircle2, AlertTriangle,
  Save, Loader2, RotateCcw, Clock, X, Search, ChevronLeft,
  ChevronRight, ArrowUpDown, Eye, Link2, FileAudio, CalendarClock, Info, Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { toast } from 'react-hot-toast';
import audioPredictionService from '../services/audioPredictionService';
import observationService from '../services/observationService';
import siteService from '../services/siteService';
import { AuthContext } from '../context/AuthContext';

const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const formatTimestamp = (ts) => {
  if (!ts) return '—';
  try {
    return new Date(ts).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  } catch {
    return '—';
  }
};

const speciesIconMap = {
  "Wolf Pack": "🐺",
  "Elephant": "🐘",
  "Tiger": "🐅",
  "Chimpanzee": "🐒",
  "Lion": "🦁",
  "Whale": "🐋",
  "Bird of Prey": "🦅",
  "Frog": "🐸",
  "Howler Monkey": "🐵",
  "Unknown": "❓"
};

const AudioPredictionsPage = () => {
  const { user } = useContext(AuthContext);

  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);

  const [isPredicting, setIsPredicting] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const [predictionError, setPredictionError] = useState(null);

  const [isLinking, setIsLinking] = useState(false);
  const [observations, setObservations] = useState([]);
  const [selectedObsId, setSelectedObsId] = useState('');

  const [history, setHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchObs = async () => {
      try {
        const obsData = await observationService.getObservations();
        setObservations(Array.isArray(obsData) ? obsData : (obsData?.data ?? []));
      } catch (err) {
        console.error('Error loading observations', err);
      }
    };
    fetchObs();
  }, []);

  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const data = await audioPredictionService.getAudioPredictions({
        page: currentPage,
        limit,
        search: searchTerm || undefined,
        status: statusFilter || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      });
      setHistory(data.predictions);
      setTotalRecords(data.total);
    } catch (err) {
      console.error('Error loading audio predictions history', err);
      toast.error('Failed to load history.');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [currentPage, statusFilter, sortBy, sortOrder]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchHistory();
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };

  const validateAndSetFile = (file) => {
    if (!file) return;
    const allowedExtensions = ['wav', 'mp3', 'flac'];
    const ext = file.name.split('.').pop().toLowerCase();

    if (!allowedExtensions.includes(ext)) {
      toast.error('Unsupported file type. Please upload a .wav, .mp3, or .flac file.');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size exceeds the 50 MB limit.');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setFileInfo({ name: file.name, size: file.size });
    setPredictionResult(null);
    setPredictionError(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length > 0) validateAndSetFile(e.dataTransfer.files[0]);
  };

  const handleFileChange = (e) => {
    if (e.target.files?.length > 0) validateAndSetFile(e.target.files[0]);
  };

  const handleRemoveAudio = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setFileInfo(null);
    setPredictionResult(null);
    setPredictionError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const runPrediction = async () => {
    if (!selectedFile) return;
    setIsPredicting(true);
    setPredictionResult(null);
    setPredictionError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const result = await audioPredictionService.predictAudioSpecies(formData);
      setPredictionResult(result);
      toast.success('AI Bioacoustic Classification completed!');
      fetchHistory();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.detail || 'AI prediction failed. Please try again.';
      setPredictionError(msg);
      toast.error(msg);
    } finally {
      setIsPredicting(false);
    }
  };

  const linkObservation = async () => {
    if (!predictionResult || !selectedObsId) {
      toast.error('Please select an existing observation to link.');
      return;
    }
    setIsLinking(true);
    try {
      await audioPredictionService.linkToObservation(
        predictionResult.id || predictionResult._id,
        selectedObsId
      );
      toast.success('Audio Prediction linked to existing observation!');
      handleRemoveAudio();
      fetchHistory();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || 'Failed to link observation.');
    } finally {
      setIsLinking(false);
    }
  };

  const getConfidenceColor = (score) => {
    const s = parseFloat(score);
    if (s >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (s >= 50) return 'text-indigo-600 bg-indigo-50 border-indigo-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Saved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Saved
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" /> Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 pb-12 text-gray-800">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Music className="w-8 h-8 text-green-600" />
            Bioacoustic Recognition
          </h1>
          <p className="text-gray-500 text-sm mt-1 max-w-2xl">
            Upload wildlife audio recordings to instantly classify species based on their vocalizations using AI.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-6 space-y-4">
          <Card className="border border-gray-100 bg-white/70 backdrop-blur-md overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 rounded-2xl">
            <CardHeader className="border-b border-gray-50 bg-gray-50/50 pb-4">
              <CardTitle className="flex items-center gap-2.5 text-lg font-bold text-gray-900">
                <Music className="w-5 h-5 text-green-600" />
                Audio Upload
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <AnimatePresence mode="wait">
                {!selectedFile ? (
                  <motion.div
                    key="upload-container"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${
                      isDragging
                        ? 'border-green-500 bg-green-50/50 scale-[1.01] shadow-inner'
                        : 'border-gray-200 bg-gray-50 hover:bg-gray-100/70'
                    }`}
                  >
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-md mb-5 text-green-600">
                      <UploadCloud className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-950">Drag & drop audio recording</h3>
                    <p className="text-sm text-gray-500 mt-1 mb-6">or click to browse local files</p>
                    <span className="text-xs text-gray-400 bg-white px-3 py-1.5 rounded-full border border-gray-100 shadow-sm font-medium">
                      Formats: WAV, MP3, FLAC (max 50 MB)
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="audio/wav,audio/mpeg,audio/flac"
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="preview-container"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    <div className="relative rounded-2xl overflow-hidden border border-gray-150 bg-gray-50 p-6 flex flex-col items-center justify-center shadow-inner gap-4">
                      <FileAudio className="w-12 h-12 text-green-500" />
                      <audio controls src={previewUrl} className="w-full max-w-sm" />
                    </div>

                    {fileInfo && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-600">
                        <FileAudio className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 truncate">{fileInfo.name}</p>
                          <p className="text-gray-400 mt-0.5">{formatFileSize(fileInfo.size)}</p>
                        </div>
                      </div>
                    )}

                    {!predictionResult && (
                      <Button
                        className="w-full h-12 text-base font-semibold shadow-md bg-green-600 hover:bg-green-700 text-white gap-2 transition-transform hover:scale-[1.01]"
                        onClick={runPrediction}
                        disabled={isPredicting}
                      >
                        {isPredicting ? (
                          <><Loader2 className="w-5 h-5 animate-spin" /> Classifying audio...</>
                        ) : (
                          <><Play className="w-5 h-5" /> Execute Bioacoustic Classification</>
                        )}
                      </Button>
                    )}

                    {!isPredicting && (
                      <Button
                        variant="outline"
                        className="w-full h-12 text-base font-semibold shadow-sm border-gray-200 text-gray-700 hover:bg-gray-50 gap-2 transition-colors mt-2"
                        onClick={handleRemoveAudio}
                      >
                        <RotateCcw className="w-5 h-5" /> Remove & Choose Different
                      </Button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-6 space-y-6">
          <AnimatePresence mode="wait">
            {predictionError && !isPredicting && (
              <motion.div
                key="error-panel"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="rounded-2xl border border-rose-100 bg-rose-50/40 p-8 flex flex-col items-center justify-center text-center shadow-inner"
              >
                <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center mb-4">
                  <AlertTriangle className="w-8 h-8 text-rose-500" />
                </div>
                <h3 className="text-lg font-bold text-rose-800 mb-1">Prediction Failed</h3>
                <p className="text-sm text-rose-600 max-w-sm mb-5">{predictionError}</p>
              </motion.div>
            )}

            {!predictionResult && !isPredicting && !predictionError && (
              <motion.div
                key="waiting"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="h-full min-h-[350px] rounded-2xl border border-gray-150 bg-gray-50/50 flex flex-col items-center justify-center text-center p-8"
              >
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-md mb-4 text-gray-400">
                  <CheckCircle2 className="w-8 h-8 opacity-40" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">Awaiting audio execution</h3>
                <p className="text-sm text-gray-500 mt-1 max-w-sm">
                  Upload an audio file to view prediction results.
                </p>
              </motion.div>
            )}

            {isPredicting && (
              <motion.div
                key="loading-animation"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full min-h-[350px] rounded-2xl border border-green-100 bg-green-50/20 flex flex-col items-center justify-center text-center p-8 shadow-inner"
              >
                <div className="relative w-24 h-24 mb-6">
                  <div className="absolute inset-0 border-4 border-green-500/10 rounded-full" />
                  <div className="absolute inset-0 border-4 border-green-600 rounded-full border-t-transparent animate-spin" />
                  <Music className="absolute inset-0 m-auto w-8 h-8 text-green-600 animate-pulse" />
                </div>
                <h3 className="text-xl font-extrabold text-green-950">Analyzing Spectrogram...</h3>
              </motion.div>
            )}

            {predictionResult && !isPredicting && (
              <motion.div
                key="results-card"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl border border-gray-100 bg-white shadow-xl overflow-hidden flex flex-col"
              >
                <div className="p-6 bg-gradient-to-b from-green-50/40 via-white to-white flex-grow">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-gray-400 tracking-wider uppercase">
                      Model v{predictionResult.model_version || '1.0.0 (Audio)'}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
                        <Clock className="w-3.5 h-3.5 text-green-500" />
                        {predictionResult.prediction_time}s
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-5 mt-4 mb-6">
                    <div className="w-20 h-20 bg-green-50 border border-green-100 rounded-2xl flex items-center justify-center text-4xl shadow-sm flex-shrink-0">
                      {speciesIconMap[predictionResult.species_name] || '🐾'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getConfidenceColor(predictionResult.confidence_score)}`}>
                          {predictionResult.confidence_score}% Confidence
                        </span>
                      </div>
                      <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mt-1">
                        {predictionResult.species_name}
                      </h2>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex flex-col items-center justify-center text-center">
                      <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Quality</span>
                      <span className={`text-sm font-extrabold ${predictionResult.audio_quality === 'Poor' ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {predictionResult.audio_quality || 'Unknown'}
                      </span>
                    </div>
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex flex-col items-center justify-center text-center">
                      <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Noise Level</span>
                      <span className="text-sm font-extrabold text-gray-800">
                        {predictionResult.noise_level_db !== undefined ? `${predictionResult.noise_level_db} dB` : '—'}
                      </span>
                    </div>
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex flex-col items-center justify-center text-center">
                      <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Duration</span>
                      <span className="text-sm font-extrabold text-gray-800">
                        {predictionResult.duration_seconds || predictionResult.duration ? `${(predictionResult.duration_seconds || predictionResult.duration).toFixed(2)}s` : '—'}
                      </span>
                    </div>
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex flex-col items-center justify-center text-center">
                      <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Source</span>
                      <span className="text-sm font-extrabold text-green-600">
                        {predictionResult.detection_source || 'Estimated'}
                      </span>
                    </div>
                  </div>

                  {predictionResult.events && predictionResult.events.length > 0 && (
                    <div className="mt-8 border-t border-gray-100 pt-6">
                      <h3 className="text-sm font-extrabold text-gray-900 mb-4 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-green-500" />
                        Acoustic Timeline ({predictionResult.event_count} Events)
                      </h3>
                      
                      {/* Timeline Bar */}
                      <div className="relative h-6 bg-gray-100 rounded-full mb-6 overflow-hidden">
                        {predictionResult.events.map((evt, idx) => {
                          const duration = predictionResult.duration_seconds || predictionResult.duration || 1;
                          const leftPct = (evt.start_time / duration) * 100;
                          const widthPct = (evt.duration / duration) * 100;
                          
                          return (
                            <div
                              key={idx}
                              className="absolute h-full bg-green-500 border-x border-green-600 group cursor-pointer transition-all hover:bg-green-400"
                              style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                            >
                              {/* Tooltip */}
                              <div className="hidden group-hover:block absolute bottom-full mb-1 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-900 text-white text-[10px] px-2 py-1 rounded shadow-lg z-10">
                                {evt.start_time}s - {evt.end_time}s: {evt.label}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Events Table */}
                      <div className="overflow-x-auto border border-gray-150 rounded-xl">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-gray-50/50 text-gray-500 uppercase tracking-wider border-b border-gray-100 sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur z-10">
                            <tr>
                              <th className="px-4 py-2.5 font-bold">Time (s)</th>
                              <th className="px-4 py-2.5 font-bold">Duration</th>
                              <th className="px-4 py-2.5 font-bold">Event Label</th>
                              <th className="px-4 py-2.5 font-bold">Confidence</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 bg-white">
                            {predictionResult.events.map((evt, idx) => (
                              <tr key={idx} className="hover:bg-green-50/30 transition-colors even:bg-muted/20">
                                <td className="px-4 py-2.5 font-semibold text-gray-700">{evt.start_time} – {evt.end_time}</td>
                                <td className="px-4 py-2.5 text-gray-600">{evt.duration}s</td>
                                <td className="px-4 py-2.5 font-bold text-gray-900">{evt.label}</td>
                                <td className="px-4 py-2.5 text-green-600 font-bold">{evt.confidence}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4 mt-8">
                    <div className="space-y-1.5">
                      <Label htmlFor="obs-select" className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Select Existing Observation to Link
                      </Label>
                      <select
                        id="obs-select"
                        value={selectedObsId}
                        onChange={(e) => setSelectedObsId(e.target.value)}
                        className="flex h-11 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all shadow-sm"
                      >
                        <option value="">— Select an observation —</option>
                        {observations.map(obs => (
                          <option key={obs.id || obs._id} value={obs.id || obs._id}>
                            {obs.species_name} — {obs.monitoring_site_name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700 text-white h-11 font-semibold shadow-md rounded-xl gap-2 transition-transform hover:scale-[1.01]"
                      onClick={linkObservation}
                      disabled={isLinking || !selectedObsId}
                    >
                      {isLinking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
                      Link Audio to Observation
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <Card className="border border-gray-150 overflow-hidden bg-white shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 rounded-2xl">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100 p-6">
          <CardTitle className="text-xl font-extrabold text-gray-950">Audio Prediction History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoadingHistory ? (
            <div className="p-10 text-center text-gray-500">Loading...</div>
          ) : history.length === 0 ? (
            <div className="p-10 text-center text-gray-500">No audio predictions found.</div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-gray-50 text-gray-500 sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur z-10">
                <tr>
                  <th className="px-6 py-4">Species</th>
                  <th className="px-6 py-4">Confidence</th>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {history.map(pred => (
                  <tr key={pred.id || pred._id} className="hover:bg-gray-50/50 even:bg-muted/20">
                    <td className="px-6 py-4 font-bold">{pred.species_name}</td>
                    <td className="px-6 py-4">{pred.confidence_score}%</td>
                    <td className="px-6 py-4">{formatTimestamp(pred.prediction_timestamp || pred.created_at)}</td>
                    <td className="px-6 py-4">{getStatusBadge(pred.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AudioPredictionsPage;

