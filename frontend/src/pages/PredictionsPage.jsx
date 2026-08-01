import React, { useState, useEffect, useRef, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud, ImageIcon, Camera, CheckCircle2, AlertTriangle,
  Save, Loader2, RotateCcw, Check, Clock, X, Search, ChevronLeft,
  ChevronRight, ArrowUpDown, Filter, Eye, Trash2, ShieldAlert,
  Link2, FileImage, Ruler, CalendarClock, Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { toast } from 'react-hot-toast';
import predictionService from '../services/predictionService';
import observationService from '../services/observationService';
import siteService from '../services/siteService';
import { AuthContext } from '../context/AuthContext';

// ── Species icon map ────────────────────────────────────────────────────────
const speciesIconMap = {
  "Apex Predators": "👑",
  "Cold-Climate Survivors": "❄️",
  "Flight Masters": "🦅",
  "Pack Hunters & Social Strategists": "🐺",
  "Speed Demons": "🐆",
  "Stealth & Shadows": "🐈‍⬛",
  "Survival Geniuses": "🦊",
  "Tiny Survivors": "🐿️",
  "Tough Defenders": "🦏",
  "Underwater Specialists": "🐬",
  "Other": "🐾"
};

// ── Helpers ──────────────────────────────────────────────────────────────────
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

// ── PredictionsPage ──────────────────────────────────────────────────────────
const PredictionsPage = () => {
  const { user } = useContext(AuthContext);

  // Upload states
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileInfo, setFileInfo] = useState(null); // { name, size }
  const [imageSource, setImageSource] = useState('Camera Trap');

  // Prediction states
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const [predictionError, setPredictionError] = useState(null);

  // Save-as-new-observation states
  const [isSaving, setIsSaving] = useState(false);
  const [sites, setSites] = useState([]);
  const [selectedSiteId, setSelectedSiteId] = useState('');

  // Link-to-existing-observation states
  const [linkMode, setLinkMode] = useState(false); // toggle between "Save New" and "Link Existing"
  const [isLinking, setIsLinking] = useState(false);
  const [observations, setObservations] = useState([]);
  const [selectedObsId, setSelectedObsId] = useState('');

  // History table states
  const [history, setHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  // Detail Modal state
  const [selectedPredDetail, setSelectedPredDetail] = useState(null);

  const fileInputRef = useRef(null);

  // ── Load monitoring sites ──────────────────────────────────────────────
  useEffect(() => {
    const fetchSites = async () => {
      try {
        const sitesData = await siteService.getSites();
        setSites(sitesData);
        if (sitesData.length > 0) {
          setSelectedSiteId(sitesData[0].id || sitesData[0]._id);
        }
      } catch (err) {
        console.error('Error loading sites', err);
      }
    };
    fetchSites();
  }, []);

  // ── Load existing observations for linking ─────────────────────────────
  useEffect(() => {
    const fetchObs = async () => {
      try {
        const obsData = await observationService.getObservations();
        // Support both array and {data: [...]} shapes
        setObservations(Array.isArray(obsData) ? obsData : (obsData?.data ?? []));
      } catch (err) {
        console.error('Error loading observations', err);
      }
    };
    fetchObs();
  }, []);

  // ── Fetch prediction history ───────────────────────────────────────────
  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const data = await predictionService.getPredictions({
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
      console.error('Error loading predictions history', err);
      toast.error('Failed to load prediction history.');
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

  // ── File handling ──────────────────────────────────────────────────────
  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };

  const validateAndSetFile = (file) => {
    if (!file) return;
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
    const ext = file.name.split('.').pop().toLowerCase();

    if (!allowedExtensions.includes(ext)) {
      toast.error('Unsupported file type. Please upload a .jpg, .jpeg, .png, or .webp image.');
      return;
    }

    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('File size exceeds the 20 MB limit.');
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

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setFileInfo(null);
    setPredictionResult(null);
    setPredictionError(null);
    setLinkMode(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Run prediction ─────────────────────────────────────────────────────
  const runPrediction = async () => {
    if (!selectedFile) return;
    setIsPredicting(true);
    setPredictionResult(null);
    setPredictionError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('source', imageSource);

    try {
      const result = await predictionService.predictSpecies(formData);
      setPredictionResult(result);
      toast.success('AI Species Recognition completed!');
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

  // ── Save as new observation ────────────────────────────────────────────
  const saveObservation = async () => {
    if (!predictionResult || !selectedSiteId) {
      toast.error('Please select a monitoring site.');
      return;
    }
    const siteObj = sites.find(s => (s.id || s._id) === selectedSiteId);
    const siteName = siteObj ? siteObj.site_name : 'Unknown Site';

    setIsSaving(true);
    try {
      await predictionService.savePrediction(
        predictionResult.id || predictionResult._id,
        selectedSiteId,
        siteName
      );
      toast.success('Prediction saved as new Observation Record!');
      handleRemoveImage();
      fetchHistory();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || 'Failed to save observation.');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Link to existing observation ───────────────────────────────────────
  const linkObservation = async () => {
    if (!predictionResult || !selectedObsId) {
      toast.error('Please select an existing observation to link.');
      return;
    }
    setIsLinking(true);
    try {
      await predictionService.linkToObservation(
        predictionResult.id || predictionResult._id,
        selectedObsId
      );
      toast.success('Prediction linked to existing observation!');
      handleRemoveImage();
      fetchHistory();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || 'Failed to link observation.');
    } finally {
      setIsLinking(false);
    }
  };

  // ── Discard ────────────────────────────────────────────────────────────
  const discardPrediction = async () => {
    if (!predictionResult) return;
    try {
      await predictionService.discardPrediction(predictionResult.id || predictionResult._id);
      toast.success('Prediction discarded.');
      handleRemoveImage();
      fetchHistory();
    } catch (err) {
      console.error(err);
      toast.error('Failed to discard prediction.');
    }
  };

  // ── UI helpers ─────────────────────────────────────────────────────────
  const getConfidenceColor = (score) => {
    const s = parseFloat(score);
    if (s >= 90) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (s >= 70) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  const getConfidenceBarColor = (score) => {
    const s = parseFloat(score);
    if (s >= 90) return 'bg-emerald-500';
    if (s >= 70) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Saved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Saved
          </span>
        );
      case 'Discarded':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
            <X className="w-3.5 h-3.5" /> Discarded
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

  const totalPages = Math.ceil(totalRecords / limit);

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 pb-12 text-gray-800">
      {/* Page Header */}
      <div className="relative p-6 rounded-2xl bg-gradient-to-r from-emerald-850 via-teal-900 to-emerald-950 text-white shadow-xl overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(16,185,129,0.1),transparent_70%)]" />
        <div className="relative z-10">
          <h1 className="text-3xl font-black tracking-tight">AI Wildlife Recognition</h1>
          <p className="mt-2 text-emerald-200 max-w-xl text-sm md:text-base">
            Upload images from camera traps or field surveys to instantly classify wildlife species,
            evaluate confidence levels, and log observation data.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* ── LEFT: Upload Card ── */}
        <div className="lg:col-span-6 space-y-4">
          <Card className="shadow-lg border border-gray-100 bg-white/70 backdrop-blur-md rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-gray-50 bg-gray-50/50 pb-4">
              <CardTitle className="flex items-center gap-2.5 text-lg font-bold text-gray-900">
                <UploadCloud className="w-5 h-5 text-emerald-600" />
                Image Upload
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {/* Image Source Toggle */}
              {!selectedFile && (
                <div className="mb-6 flex flex-col gap-2">
                  <Label className="text-sm font-bold text-gray-700">Image Source</Label>
                  <div className="flex bg-gray-100 p-1 rounded-xl">
                    <button
                      className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                        imageSource === 'Camera Trap' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                      }`}
                      onClick={() => setImageSource('Camera Trap')}
                    >
                      Camera Trap
                    </button>
                    <button
                      className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                        imageSource === 'Drone' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                      }`}
                      onClick={() => setImageSource('Drone')}
                    >
                      Drone
                    </button>
                  </div>
                </div>
              )}

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
                        ? 'border-emerald-500 bg-emerald-50/50 scale-[1.01] shadow-inner'
                        : 'border-gray-200 bg-gray-50 hover:bg-gray-100/70'
                    }`}
                  >
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-md mb-5 text-emerald-600">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-950">Drag & drop wildlife photo</h3>
                    <p className="text-sm text-gray-500 mt-1 mb-6">or click to browse local files</p>
                    <span className="text-xs text-gray-400 bg-white px-3 py-1.5 rounded-full border border-gray-100 shadow-sm font-medium">
                      Formats: JPG, JPEG, PNG, WEBP (max 20 MB)
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="preview-container"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    {/* Image preview */}
                    <div className="relative rounded-2xl overflow-hidden border border-gray-150 bg-gray-50 flex items-center justify-center min-h-[280px] max-h-[380px] group shadow-inner">
                      <img src={previewUrl} alt="Preview" className="max-h-[360px] object-contain rounded-xl" />
                      
                      {/* Render Bounding Boxes if predictionResult is available */}
                      {predictionResult?.detections?.map((det, idx) => (
                        <div
                          key={idx}
                          className="absolute border-2 border-emerald-500 rounded-sm bg-emerald-500/10 transition-all"
                          style={{
                            left: `${det.bbox[0]}%`,
                            top: `${det.bbox[1]}%`,
                            width: `${det.bbox[2] - det.bbox[0]}%`,
                            height: `${det.bbox[3] - det.bbox[1]}%`
                          }}
                        >
                          <span className="absolute -top-6 left-0 bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap">
                            {det.species} ({det.confidence}%)
                          </span>
                        </div>
                      ))}

                      {!isPredicting && !predictionResult && (
                        <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <Button variant="destructive" onClick={handleRemoveImage} className="gap-2 shadow-lg">
                            <RotateCcw className="w-4 h-4" /> Remove & Choose Different
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* File info panel */}
                    {fileInfo && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-600">
                        <FileImage className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 truncate">{fileInfo.name}</p>
                          <p className="text-gray-400 mt-0.5">{formatFileSize(fileInfo.size)}</p>
                        </div>
                        {!predictionResult && !isPredicting && (
                          <button
                            onClick={handleRemoveImage}
                            className="p-1 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}

                    {!predictionResult && (
                      <Button
                        className="w-full h-12 text-base font-semibold shadow-md bg-emerald-600 hover:bg-emerald-700 text-white gap-2 transition-transform hover:scale-[1.01]"
                        onClick={runPrediction}
                        disabled={isPredicting}
                      >
                        {isPredicting ? (
                          <><Loader2 className="w-5 h-5 animate-spin" /> Classifying species...</>
                        ) : (
                          <><Camera className="w-5 h-5" /> Execute AI Classification</>
                        )}
                      </Button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>

        {/* ── RIGHT: Results / Status ── */}
        <div className="lg:col-span-6 space-y-6">
          <AnimatePresence mode="wait">
            {/* Error state */}
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
                <Button
                  variant="outline"
                  className="border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl"
                  onClick={() => { setPredictionError(null); setPredictionResult(null); }}
                >
                  <RotateCcw className="w-4 h-4 mr-2" /> Try Again
                </Button>
              </motion.div>
            )}

            {/* Waiting state */}
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
                <h3 className="text-lg font-bold text-gray-800">Awaiting AI execution</h3>
                <p className="text-sm text-gray-500 mt-1 max-w-sm">
                  Upload an image and click "Execute AI Classification" to view results.
                </p>
              </motion.div>
            )}

            {/* Loading state */}
            {isPredicting && (
              <motion.div
                key="loading-animation"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full min-h-[350px] rounded-2xl border border-emerald-100 bg-emerald-50/20 flex flex-col items-center justify-center text-center p-8 shadow-inner"
              >
                <div className="relative w-24 h-24 mb-6">
                  <div className="absolute inset-0 border-4 border-emerald-500/10 rounded-full" />
                  <div className="absolute inset-0 border-4 border-emerald-600 rounded-full border-t-transparent animate-spin" />
                  <Camera className="absolute inset-0 m-auto w-8 h-8 text-emerald-600 animate-pulse" />
                </div>
                <h3 className="text-xl font-extrabold text-emerald-950">Analyzing Bio-Features...</h3>
                <p className="text-sm text-emerald-700/80 mt-1 max-w-xs">
                  Running model inference, processing layers, and computing class confidence distributions.
                </p>
              </motion.div>
            )}

            {/* Results card */}
            {predictionResult && !isPredicting && (
              <motion.div
                key="results-card"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl border border-gray-100 bg-white shadow-xl overflow-hidden flex flex-col"
              >
                <div className="p-6 bg-gradient-to-b from-emerald-50/40 via-white to-white flex-grow">
                  {/* Header row */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-gray-400 tracking-wider uppercase">
                      Model v{predictionResult.model_version || '1.0.0'}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
                        <Clock className="w-3.5 h-3.5 text-emerald-500" />
                        {predictionResult.prediction_time}s
                      </span>
                    </div>
                  </div>

                  {/* Prediction timestamp */}
                  {predictionResult.prediction_timestamp && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-4 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 w-fit">
                      <CalendarClock className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="font-medium">
                        Predicted at: {formatTimestamp(predictionResult.prediction_timestamp)}
                      </span>
                    </div>
                  )}

                  {/* Species result */}
                  <div className="flex items-center gap-5 mt-4 mb-6">
                    <div className="w-20 h-20 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center text-4xl shadow-sm flex-shrink-0">
                      {speciesIconMap[predictionResult.species_name] || '🐾'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getConfidenceColor(predictionResult.confidence_score)}`}>
                          {predictionResult.confidence_score}% Confidence
                        </span>
                        {predictionResult.confidence_score >= 90 && (
                          <span className="inline-flex items-center gap-0.5 px-2.5 py-0.5 rounded-full text-xs font-bold text-amber-700 bg-amber-50 border border-amber-100">
                            ★ High Confidence
                          </span>
                        )}
                      </div>
                      <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mt-1">
                        {predictionResult.species_name}
                      </h2>
                    </div>
                  </div>

                  {/* Image metadata row */}
                  {(predictionResult.image_width || predictionResult.image_height) && (
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-4 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                      <div className="flex items-center gap-1.5">
                        <Ruler className="w-4 h-4 text-emerald-500" />
                        <span className="font-semibold">Dimensions:</span> {predictionResult.image_width} × {predictionResult.image_height} px
                      </div>
                      <div className="h-4 w-px bg-gray-200"></div>
                      <div className="flex items-center gap-1.5">
                        <Camera className="w-4 h-4 text-emerald-500" />
                        <span className="font-semibold">Source:</span> {predictionResult.image_source || 'Camera Trap'}
                      </div>
                      <div className="h-4 w-px bg-gray-200"></div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className={`w-4 h-4 ${predictionResult.image_quality === 'Poor' ? 'text-rose-500' : 'text-emerald-500'}`} />
                        <span className="font-semibold">Quality:</span> {predictionResult.image_quality}
                      </div>
                      <div className="h-4 w-px bg-gray-200"></div>
                      <div className="flex items-center gap-1.5">
                        <Camera className="w-4 h-4 text-emerald-500" />
                        <span className="font-semibold">Detection:</span> {predictionResult.detection_source || 'Simulation'}
                      </div>
                    </div>
                  )}

                  {/* Multiple Detections Table */}
                  {predictionResult.animal_count > 0 && predictionResult.detections?.length > 0 && (
                    <div className="mb-6 border border-gray-150 rounded-2xl overflow-hidden">
                      <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                        <h4 className="text-sm font-extrabold text-gray-800">Animals Detected ({predictionResult.animal_count})</h4>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-gray-50/50 text-gray-500 uppercase tracking-wider">
                            <tr>
                              <th className="px-4 py-2 font-bold">Species</th>
                              <th className="px-4 py-2 font-bold">Confidence</th>
                              <th className="px-4 py-2 font-bold">Behaviour</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {predictionResult.detections.map((det, idx) => (
                              <tr key={idx} className="hover:bg-gray-50">
                                <td className="px-4 py-2.5 font-semibold text-gray-800">{det.species}</td>
                                <td className="px-4 py-2.5 text-emerald-600 font-bold">{det.confidence}%</td>
                                <td className="px-4 py-2.5 text-gray-600 font-medium">{det.behaviour}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Confidence bar */}
                  <div className="space-y-1 mb-8">
                    <div className="flex justify-between text-xs font-bold text-gray-500">
                      <span>Inference Confidence</span>
                      <span>{predictionResult.confidence_score}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3.5 overflow-hidden border border-gray-50">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${getConfidenceBarColor(predictionResult.confidence_score)}`}
                        style={{ width: `${predictionResult.confidence_score}%` }}
                      />
                    </div>
                  </div>

                  {/* Top-3 predictions */}
                  {predictionResult.top_3_predictions?.length > 0 && (
                    <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-5 mb-2">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-400 mb-3.5">
                        Top Classification Probabilities
                      </h4>
                      <div className="space-y-3.5">
                        {predictionResult.top_3_predictions.map((pred, idx) => (
                          <div key={idx} className="space-y-1.5">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-semibold text-gray-800 flex items-center gap-1.5">
                                <span className="text-base">{speciesIconMap[pred.species] || '🐾'}</span>
                                {pred.species}
                              </span>
                              <span className="font-bold text-gray-600 bg-white px-2 py-0.5 rounded border border-gray-100 shadow-sm text-xs">
                                {pred.confidence}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200/50 rounded-full h-2">
                              <div
                                className="h-full bg-emerald-600 rounded-full"
                                style={{ width: `${pred.confidence}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Footer: Save / Link / Discard ── */}
                <div className="p-5 border-t border-gray-50 bg-gray-50/50">
                  {/* Mode toggle */}
                  <div className="flex items-center gap-2 mb-4 p-1 bg-gray-100 rounded-xl">
                    <button
                      onClick={() => setLinkMode(false)}
                      className={`flex-1 text-xs font-bold py-2 px-3 rounded-lg transition-all ${
                        !linkMode
                          ? 'bg-white text-emerald-700 shadow-sm border border-emerald-100'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Save className="w-3.5 h-3.5 inline mr-1.5" />
                      Save as New Observation
                    </button>
                    <button
                      onClick={() => setLinkMode(true)}
                      className={`flex-1 text-xs font-bold py-2 px-3 rounded-lg transition-all ${
                        linkMode
                          ? 'bg-white text-emerald-700 shadow-sm border border-emerald-100'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Link2 className="w-3.5 h-3.5 inline mr-1.5" />
                      Link to Existing
                    </button>
                  </div>

                  <AnimatePresence mode="wait">
                    {!linkMode ? (
                      /* Save as new observation */
                      <motion.div
                        key="save-new"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="space-y-4"
                      >
                        <div className="space-y-1.5">
                          <Label htmlFor="site-select" className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Link to Monitoring Site
                          </Label>
                          <select
                            id="site-select"
                            value={selectedSiteId}
                            onChange={(e) => setSelectedSiteId(e.target.value)}
                            className="flex h-11 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
                          >
                            {sites.length === 0 && <option value="">No sites available</option>}
                            {sites.map(s => (
                              <option key={s.id || s._id} value={s.id || s._id}>{s.site_name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <Button
                            variant="outline"
                            className="flex-1 text-gray-600 hover:text-gray-900 border-gray-200 h-11 font-semibold rounded-xl"
                            onClick={discardPrediction}
                            disabled={isSaving}
                          >
                            Discard Prediction
                          </Button>
                          <Button
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white h-11 font-semibold shadow-md rounded-xl gap-2 transition-transform hover:scale-[1.01]"
                            onClick={saveObservation}
                            disabled={isSaving || !selectedSiteId}
                          >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Save as Observation
                          </Button>
                        </div>
                      </motion.div>
                    ) : (
                      /* Link to existing observation */
                      <motion.div
                        key="link-existing"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="space-y-4"
                      >
                        <div className="space-y-1.5">
                          <Label htmlFor="obs-select" className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Select Existing Observation
                          </Label>
                          <select
                            id="obs-select"
                            value={selectedObsId}
                            onChange={(e) => setSelectedObsId(e.target.value)}
                            className="flex h-11 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
                          >
                            <option value="">— Select an observation —</option>
                            {observations.map(obs => (
                              <option key={obs.id || obs._id} value={obs.id || obs._id}>
                                {obs.species_name} — {obs.monitoring_site_name} ({new Date(obs.observed_at).toLocaleDateString()})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-2 text-xs text-blue-700">
                          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <span>This will attach the AI prediction result to the selected observation record without creating a new entry.</span>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <Button
                            variant="outline"
                            className="flex-1 text-gray-600 hover:text-gray-900 border-gray-200 h-11 font-semibold rounded-xl"
                            onClick={discardPrediction}
                            disabled={isLinking}
                          >
                            Discard Prediction
                          </Button>
                          <Button
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white h-11 font-semibold shadow-md rounded-xl gap-2 transition-transform hover:scale-[1.01]"
                            onClick={linkObservation}
                            disabled={isLinking || !selectedObsId}
                          >
                            {isLinking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
                            Link to Observation
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── History Table ── */}
      <Card className="shadow-lg border border-gray-150 rounded-2xl overflow-hidden bg-white">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100 p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-extrabold text-gray-950">Prediction History</CardTitle>
              <p className="text-xs font-semibold text-gray-400 mt-1 uppercase tracking-wider">AI Classification Logs</p>
            </div>
            <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3">
              <div className="relative w-64">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search species, user, image..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-sm"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="py-2 px-3.5 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-sm font-semibold text-gray-600"
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Saved">Saved</option>
                <option value="Discarded">Discarded</option>
              </select>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-2 px-4 shadow-sm text-sm font-semibold">
                Search
              </Button>
            </form>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoadingHistory ? (
            <div className="flex flex-col justify-center items-center py-20 gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
              <p className="text-sm text-gray-500 font-medium">Loading prediction history...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-16 px-4">
              <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h4 className="text-base font-bold text-gray-700">No predictions found</h4>
              <p className="text-sm text-gray-400 mt-1">Try refining your search terms or upload a new image.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-gray-50 border-b border-gray-100 text-gray-500 font-extrabold">
                  <tr>
                    <th className="px-6 py-4">Image</th>
                    <th className="px-6 py-4 cursor-pointer" onClick={() => toggleSort('species_name')}>
                      <div className="flex items-center gap-1">Species <ArrowUpDown className="w-3.5 h-3.5" /></div>
                    </th>
                    <th className="px-6 py-4 cursor-pointer" onClick={() => toggleSort('confidence_score')}>
                      <div className="flex items-center gap-1">Confidence <ArrowUpDown className="w-3.5 h-3.5" /></div>
                    </th>
                    <th className="px-6 py-4 cursor-pointer" onClick={() => toggleSort('prediction_time')}>
                      <div className="flex items-center gap-1">Inference Time <ArrowUpDown className="w-3.5 h-3.5" /></div>
                    </th>
                    <th className="px-6 py-4 cursor-pointer" onClick={() => toggleSort('prediction_timestamp')}>
                      <div className="flex items-center gap-1">Predicted At <ArrowUpDown className="w-3.5 h-3.5" /></div>
                    </th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {history.map((pred) => (
                    <tr key={pred.id || pred._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="w-14 h-14 rounded-xl overflow-hidden border border-gray-150 bg-gray-50 shadow-inner">
                          <img
                            src={pred.file_url}
                            alt={pred.species_name}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=150&auto=format&fit=crop&q=60'; }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900">
                        <span className="flex items-center gap-1.5">
                          <span className="text-base">{speciesIconMap[pred.species_name] || '🐾'}</span>
                          {pred.species_name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getConfidenceColor(pred.confidence_score)}`}>
                          {pred.confidence_score}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 font-medium">
                        {pred.prediction_time}s
                      </td>
                      <td className="px-6 py-4 text-gray-500 font-medium text-xs">
                        {formatTimestamp(pred.prediction_timestamp || pred.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(pred.status)}
                        {pred.observation_id && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-emerald-600 font-medium">
                            <Link2 className="w-3 h-3" /> Linked
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedPredDetail(pred)}
                          className="hover:bg-emerald-50 hover:text-emerald-700 text-gray-400"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-between text-sm font-semibold text-gray-500">
            <div>
              Showing <span className="text-gray-800 font-bold">{Math.min(limit * (currentPage - 1) + 1, totalRecords)}</span> to{' '}
              <span className="text-gray-800 font-bold">{Math.min(limit * currentPage, totalRecords)}</span> of{' '}
              <span className="text-gray-800 font-bold">{totalRecords}</span> results
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="h-9 px-3 rounded-lg border-gray-200">
                <ChevronLeft className="w-4 h-4 mr-1" /> Prev
              </Button>
              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalPages }).map((_, idx) => (
                  <Button
                    key={idx}
                    variant={currentPage === idx + 1 ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(idx + 1)}
                    className={`h-9 w-9 rounded-lg ${currentPage === idx + 1 ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'border-gray-200 text-gray-600 hover:bg-gray-100'}`}
                  >
                    {idx + 1}
                  </Button>
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="h-9 px-3 rounded-lg border-gray-200">
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* ── Detail Modal ── */}
      <AnimatePresence>
        {selectedPredDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-4xl max-h-[90vh] flex flex-col border border-gray-100"
            >
              {/* Modal header */}
              <div className="px-6 py-5 bg-gradient-to-r from-emerald-850 to-emerald-950 text-white flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
                    <span className="text-2xl">{speciesIconMap[selectedPredDetail.species_name] || '🐾'}</span>
                    {selectedPredDetail.species_name} — Detail View
                  </h3>
                  <p className="text-xs text-emerald-200/90 font-medium mt-0.5">
                    Prediction ID: {selectedPredDetail.id || selectedPredDetail._id}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedPredDetail(null)}
                  className="rounded-full p-1.5 hover:bg-white/10 text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal body */}
              <div className="overflow-y-auto p-6 flex-grow">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Image column */}
                  <div className="rounded-2xl overflow-hidden border border-gray-150 bg-gray-50 flex items-center justify-center min-h-[280px] max-h-[380px] shadow-inner">
                    <img
                      src={selectedPredDetail.file_url}
                      alt={selectedPredDetail.species_name}
                      className="max-h-[360px] object-contain rounded-xl"
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=300&auto=format&fit=crop&q=60'; }}
                    />
                  </div>

                  {/* Info column */}
                  <div className="space-y-5">
                    {/* Confidence + status */}
                    <div>
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">Prediction Result</h4>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold border ${getConfidenceColor(selectedPredDetail.confidence_score)}`}>
                          {selectedPredDetail.confidence_score}% Confidence
                        </span>
                        {getStatusBadge(selectedPredDetail.status)}
                      </div>
                    </div>

                    {/* Timing + metadata grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <span className="text-xs text-gray-400 font-bold block uppercase mb-1">Inference Time</span>
                        <span className="text-sm font-bold text-gray-800">{selectedPredDetail.prediction_time}s</span>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <span className="text-xs text-gray-400 font-bold block uppercase mb-1">Model Version</span>
                        <span className="text-sm font-bold text-gray-800">{selectedPredDetail.model_version || '1.0.0'}</span>
                      </div>
                      {(selectedPredDetail.image_width || selectedPredDetail.image_height) && (
                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                          <span className="text-xs text-gray-400 font-bold block uppercase mb-1">Image Dimensions</span>
                          <span className="text-sm font-bold text-gray-800">
                            {selectedPredDetail.image_width} × {selectedPredDetail.image_height} px
                          </span>
                        </div>
                      )}
                      {selectedPredDetail.prediction_timestamp && (
                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                          <span className="text-xs text-gray-400 font-bold block uppercase mb-1">Predicted At</span>
                          <span className="text-xs font-bold text-gray-800">
                            {formatTimestamp(selectedPredDetail.prediction_timestamp)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Linked observation badge */}
                    {selectedPredDetail.observation_id && (
                      <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-700 font-semibold">
                        <Link2 className="w-4 h-4" />
                        Linked to Observation ID: {selectedPredDetail.observation_id}
                      </div>
                    )}

                    {/* Top-3 probabilities */}
                    {selectedPredDetail.top_3_predictions?.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                          Top Class Distributions
                        </h4>
                        <div className="space-y-2.5">
                          {selectedPredDetail.top_3_predictions.map((pred, idx) => (
                            <div key={idx} className="flex items-center justify-between text-sm bg-white border border-gray-100 rounded-lg p-2.5 shadow-sm">
                              <span className="font-semibold text-gray-800 flex items-center gap-1.5">
                                <span className="text-base">{speciesIconMap[pred.species] || '🐾'}</span>
                                {pred.species}
                              </span>
                              <span className="font-bold text-gray-600 bg-gray-50 px-2 py-0.5 rounded border border-gray-100 text-xs">
                                {pred.confidence}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* File + user metadata */}
                    <div className="space-y-2 pt-2 border-t border-gray-100 text-xs text-gray-500 font-medium">
                      <div>
                        <span className="font-bold text-gray-400 mr-1.5 uppercase">File:</span>
                        <span className="text-gray-700">{selectedPredDetail.file_name}</span>
                      </div>
                      <div>
                        <span className="font-bold text-gray-400 mr-1.5 uppercase">Executed By:</span>
                        <span className="text-gray-700">{selectedPredDetail.user_name || 'Unknown User'}</span>
                      </div>
                      <div>
                        <span className="font-bold text-gray-400 mr-1.5 uppercase">Created At:</span>
                        <span className="text-gray-700">{formatTimestamp(selectedPredDetail.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal footer */}
              <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 text-right">
                <Button
                  onClick={() => setSelectedPredDetail(null)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-5 font-semibold h-10"
                >
                  Close Detail View
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PredictionsPage;
