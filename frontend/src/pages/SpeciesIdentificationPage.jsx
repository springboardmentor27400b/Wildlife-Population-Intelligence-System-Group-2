import React, { useState, useEffect, useRef, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud, Music, Play, CheckCircle2, AlertTriangle,
  Loader2, RotateCcw, Clock, Link2, FileAudio, ImageIcon, Camera, Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { toast } from 'react-hot-toast';
import unifiedPredictionService from '../services/unifiedPredictionService';
import observationService from '../services/observationService';
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
  "Wolf": "🐺",
  "Elephant": "🐘",
  "Tiger": "🐅",
  "Chimpanzee": "🐒",
  "Monkey": "🐒",
  "Lion": "🦁",
  "Whale": "🐋",
  "Bird of Prey": "🦅",
  "Frog": "🐸",
  "Howler Monkey": "🐵",
  "Leopard": "🐆",
  "Bear": "🐻",
  "Deer": "🦌",
  "Rhinoceros": "🦏",
  "Unknown": "❓"
};

const SpeciesIdentificationPage = () => {
  const { user } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState('Image'); // 'Image' or 'Audio'
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
  const [filterSource, setFilterSource] = useState('');

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
      const data = await unifiedPredictionService.getUnifiedPredictions({
        page: currentPage,
        limit,
        search: searchTerm || undefined,
        source: filterSource || undefined
      });
      setHistory(data.predictions);
      setTotalRecords(data.total);
    } catch (err) {
      console.error('Error loading history', err);
      toast.error('Failed to load history.');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [currentPage, searchTerm, filterSource]);

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };

  const validateAndSetFile = (file) => {
    if (!file) return;
    
    let allowedExtensions = [];
    if (activeTab === 'Image') allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
    if (activeTab === 'Audio') allowedExtensions = ['wav', 'mp3', 'flac'];
    
    const ext = file.name.split('.').pop().toLowerCase();

    if (!allowedExtensions.includes(ext)) {
      toast.error(`Unsupported file type for ${activeTab}. Please upload a ${allowedExtensions.map(e=>`.${e}`).join(', ')} file.`);
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

  const handleRemoveMedia = () => {
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
      const result = await unifiedPredictionService.predictUnified(formData);
      setPredictionResult(result);
      toast.success('AI Classification completed successfully!');
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
      await unifiedPredictionService.linkToObservation(
        predictionResult.id || predictionResult._id,
        selectedObsId
      );
      toast.success('Prediction linked to existing observation!');
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
    if (s >= 50) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  const switchTab = (tab) => {
    if (isPredicting) return;
    setActiveTab(tab);
    handleRemoveMedia();
  };

  return (
    <div className="space-y-8 pb-12 text-gray-800">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="w-8 h-8 text-green-600" />
            Species Identification Engine
          </h1>
          <p className="text-gray-500 text-sm mt-1 max-w-2xl">
            Unified AI pipeline to classify species from either visual field captures or bioacoustic audio recordings, enriched with biological data.
          </p>
        </div>
      </div>
      
      {/* Tab Switcher */}
      <div className="flex gap-4">
        <button
            onClick={() => switchTab('Image')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-sm ${activeTab === 'Image' ? 'bg-green-600 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
        >
            <Camera className="w-5 h-5" /> Image Identification
        </button>
        <button
            onClick={() => switchTab('Audio')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-sm ${activeTab === 'Audio' ? 'bg-blue-600 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
        >
            <Activity className="w-5 h-5" /> Audio Identification
        </button>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-6 space-y-4">
          <Card className="border border-gray-100 bg-white/70 backdrop-blur-md overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 rounded-2xl">
            <CardHeader className="border-b border-gray-50 bg-gray-50/50 pb-4">
              <CardTitle className="flex items-center gap-2.5 text-lg font-bold text-gray-900">
                <UploadCloud className={`w-5 h-5 ${activeTab === 'Image' ? 'text-green-600' : 'text-blue-600'}`} />
                Upload {activeTab}
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
                    <div className={`w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-md mb-5 ${activeTab === 'Image' ? 'text-green-600' : 'text-blue-600'}`}>
                      {activeTab === 'Image' ? <ImageIcon className="w-8 h-8" /> : <Music className="w-8 h-8" />}
                    </div>
                    <h3 className="text-lg font-bold text-gray-950">Drag & drop {activeTab.toLowerCase()} file</h3>
                    <p className="text-sm text-gray-500 mt-1 mb-6">or click to browse local files</p>
                    <span className="text-xs text-gray-400 bg-white px-3 py-1.5 rounded-full border border-gray-100 shadow-sm font-medium">
                      {activeTab === 'Image' ? 'Formats: JPG, PNG, WEBP' : 'Formats: WAV, MP3, FLAC'} (max 50 MB)
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept={activeTab === 'Image' ? 'image/jpeg,image/png,image/webp' : 'audio/wav,audio/mpeg,audio/flac'}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="preview-container"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    <div className="relative rounded-2xl overflow-hidden border border-gray-150 bg-gray-50 p-6 flex flex-col items-center justify-center shadow-inner gap-4 min-h-[250px]">
                      {activeTab === 'Image' ? (
                          <img loading="lazy" src={previewUrl} alt="Preview" className="max-h-64 object-contain rounded-xl shadow-sm" />
                      ) : (
                          <>
                            <FileAudio className="w-12 h-12 text-blue-500" />
                            <audio controls src={previewUrl} className="w-full max-w-sm mt-4" />
                          </>
                      )}
                      {!isPredicting && !predictionResult && (
                        <Button variant="destructive" onClick={handleRemoveMedia} className="gap-2 shadow-lg mt-2 absolute top-2 right-2 opacity-80 hover:opacity-100 transition-opacity">
                          <RotateCcw className="w-4 h-4" /> Remove
                        </Button>
                      )}
                    </div>

                    {!predictionResult && (
                      <Button
                        className={`w-full h-12 text-base font-semibold shadow-md text-white gap-2 transition-transform hover:scale-[1.01] ${activeTab === 'Image' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                        onClick={runPrediction}
                        disabled={isPredicting}
                      >
                        {isPredicting ? (
                          <><Loader2 className="w-5 h-5 animate-spin" /> Identifying Species...</>
                        ) : (
                          <><Play className="w-5 h-5" /> Run AI Identification</>
                        )}
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
                <h3 className="text-lg font-bold text-gray-800">Awaiting media input</h3>
                <p className="text-sm text-gray-500 mt-1 max-w-sm">
                  Upload an image or audio file to identify the species and view detailed biological metadata.
                </p>
              </motion.div>
            )}

            {isPredicting && (
              <motion.div
                key="loading-animation"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`h-full min-h-[350px] rounded-2xl border flex flex-col items-center justify-center text-center p-8 shadow-inner ${activeTab === 'Image' ? 'border-green-100 bg-green-50/20' : 'border-blue-100 bg-blue-50/20'}`}
              >
                <div className="relative w-24 h-24 mb-6">
                  <div className={`absolute inset-0 border-4 rounded-full ${activeTab === 'Image' ? 'border-green-500/10' : 'border-blue-500/10'}`} />
                  <div className={`absolute inset-0 border-4 rounded-full border-t-transparent animate-spin ${activeTab === 'Image' ? 'border-green-600' : 'border-blue-600'}`} />
                  {activeTab === 'Image' ? <Camera className="absolute inset-0 m-auto w-8 h-8 text-green-600 animate-pulse" /> : <Music className="absolute inset-0 m-auto w-8 h-8 text-blue-600 animate-pulse" />}
                </div>
                <h3 className={`text-xl font-extrabold ${activeTab === 'Image' ? 'text-green-950' : 'text-blue-950'}`}>Analyzing Media...</h3>
              </motion.div>
            )}

            {predictionResult && !isPredicting && (
              <motion.div
                key="results-card"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl border border-gray-100 bg-white shadow-xl overflow-hidden flex flex-col"
              >
                <div className={`p-6 bg-gradient-to-b ${predictionResult.prediction_source === 'Image' ? 'from-green-50/40' : 'from-blue-50/40'} via-white to-white flex-grow`}>
                  <div className="flex items-center justify-between mb-4 border-b pb-4 border-gray-100">
                    <span className="text-xs font-bold text-gray-400 tracking-wider uppercase flex items-center gap-2">
                      <span className={`px-2 py-1 rounded bg-gray-100 text-gray-600`}>Source: {predictionResult.prediction_source}</span>
                    </span>
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                        {formatTimestamp(predictionResult.prediction_timestamp)}
                    </div>
                  </div>

                  <div className="flex items-center gap-5 mt-4 mb-4">
                    <div className="w-20 h-20 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center text-4xl shadow-sm flex-shrink-0">
                      {speciesIconMap[predictionResult.species_name] || '🐾'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getConfidenceColor(predictionResult.confidence_score)}`}>
                          {predictionResult.confidence_score}% Confidence
                        </span>
                        {predictionResult.conservation_status && (
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${predictionResult.conservation_status.includes('Endangered') || predictionResult.conservation_status.includes('Threatened') ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-green-50 text-green-700'}`}>
                                Risk: {predictionResult.conservation_status}
                            </span>
                        )}
                      </div>
                      <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                        {predictionResult.species_name}
                      </h2>
                      {predictionResult.scientific_name && (
                          <p className="text-sm italic text-gray-500 font-medium">
                              {predictionResult.scientific_name}
                          </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Confidence Visualization */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-semibold text-gray-700">Identification Confidence</span>
                      <span className="text-sm font-bold text-gray-900">{predictionResult.confidence_score}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className={`h-3 rounded-full ${parseFloat(predictionResult.confidence_score) >= 90 ? 'bg-green-500' : parseFloat(predictionResult.confidence_score) >= 70 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${predictionResult.confidence_score}%` }}></div>
                    </div>
                  </div>

                  {/* Explain Prediction Card */}
                  {predictionResult.explanation && (
                    <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 mb-6 text-sm">
                      <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2"><Activity className="w-4 h-4"/> AI Reasoning</h4>
                      {(() => {
                        try {
                           const expl = JSON.parse(predictionResult.explanation);
                           return (
                             <div className="space-y-1.5 text-blue-800">
                               <p><strong>Source:</strong> {expl.source}</p>
                               <p><strong>Reasoning:</strong> {expl.reasoning}</p>
                               <p><strong>Confidence:</strong> {expl.confidence_reasoning}</p>
                               <p><strong>Context:</strong> {expl.context}</p>
                             </div>
                           );
                        } catch (e) {
                           return <p className="text-blue-800">{predictionResult.explanation}</p>;
                        }
                      })()}
                    </div>
                  )}

                  {/* Biological Metadata Section */}
                  <div className="bg-gray-50 p-4 rounded-xl mb-6 grid grid-cols-2 gap-3 text-sm">
                      <div>
                          <p className="text-xs text-gray-400 font-bold uppercase">Family</p>
                          <p className="font-medium text-gray-700">{predictionResult.family || 'N/A'}</p>
                      </div>
                      <div>
                          <p className="text-xs text-gray-400 font-bold uppercase">Category</p>
                          <p className="font-medium text-gray-700">{predictionResult.category || 'N/A'}</p>
                      </div>
                      <div>
                          <p className="text-xs text-gray-400 font-bold uppercase">Food Chain</p>
                          <p className="font-medium text-gray-700">{predictionResult.food_chain_level || 'N/A'}</p>
                      </div>
                      <div>
                          <p className="text-xs text-gray-400 font-bold uppercase">Population Trend</p>
                          <p className="font-medium text-gray-700">{predictionResult.population_trend || 'N/A'}</p>
                      </div>
                      <div className="col-span-2 border-t pt-2 mt-1">
                          <p className="text-xs text-gray-400 font-bold uppercase">Habitat</p>
                          <p className="font-medium text-gray-700">{predictionResult.habitat || 'N/A'}</p>
                      </div>
                      <div className="col-span-2">
                          <p className="text-xs text-gray-400 font-bold uppercase">Diet</p>
                          <p className="font-medium text-gray-700">{predictionResult.diet || 'N/A'}</p>
                      </div>
                      <div className="col-span-2">
                          <p className="text-xs text-gray-400 font-bold uppercase">Behavior</p>
                          <p className="font-medium text-gray-700 text-xs leading-relaxed">{predictionResult.typical_behaviour || 'N/A'}</p>
                      </div>
                      <div className="col-span-2">
                          <p className="text-xs text-gray-400 font-bold uppercase">Brief Description</p>
                          <p className="font-medium text-gray-700 text-xs leading-relaxed">{predictionResult.brief_description || 'N/A'}</p>
                      </div>
                      {predictionResult.interesting_facts && (
                        <div className="col-span-2 bg-yellow-50 p-3 rounded-lg mt-2 border border-yellow-100">
                          <p className="text-xs text-yellow-800 font-bold uppercase mb-1">Interesting Fact</p>
                          <p className="font-medium text-yellow-900 text-xs">{predictionResult.interesting_facts}</p>
                        </div>
                      )}
                  </div>

                  {/* Species Gallery */}
                  <div className="mb-6">
                    <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">Reference Gallery</h4>
                    <div className="flex gap-3 overflow-x-auto pb-2 rounded-xl border border-border/50 shadow-sm">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="w-24 h-24 bg-gray-100 rounded-xl flex-shrink-0 border border-gray-200 flex items-center justify-center text-gray-400">
                          <ImageIcon className="w-6 h-6" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Similar Species */}
                  {predictionResult.similar_species && predictionResult.similar_species.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Similar Species</h4>
                      <div className="flex flex-wrap gap-2">
                        {predictionResult.similar_species.map(sp => (
                          <span key={sp} className="px-3 py-1 bg-gray-100 border border-gray-200 rounded-full text-xs font-semibold text-gray-600">
                            {speciesIconMap[sp] || '🐾'} {sp}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Top 5 Predictions */}
                  {predictionResult.top_predictions && predictionResult.top_predictions.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Top Predictions</h4>
                      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden text-xs">
                        {predictionResult.top_predictions.map((p, idx) => (
                          <div key={idx} className="flex justify-between items-center p-2 border-b border-gray-50 last:border-0">
                            <span className="font-semibold text-gray-700">{p.species}</span>
                            <span className={`font-bold ${getConfidenceColor(p.confidence).split(' ')[0]}`}>{p.confidence}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Model Information */}
                  <div className="bg-gray-50 p-4 rounded-xl mb-6 grid grid-cols-2 gap-3 text-xs">
                     <div>
                        <p className="text-gray-400 font-bold uppercase">Model Name</p>
                        <p className="font-medium text-gray-700">{predictionResult.model_name}</p>
                     </div>
                     <div>
                        <p className="text-gray-400 font-bold uppercase">Model Version</p>
                        <p className="font-medium text-gray-700">{predictionResult.model_version}</p>
                     </div>
                     <div>
                        <p className="text-gray-400 font-bold uppercase">Engine</p>
                        <p className="font-medium text-gray-700">{predictionResult.prediction_engine || 'Default'}</p>
                     </div>
                     <div>
                        <p className="text-gray-400 font-bold uppercase">Inference Time</p>
                        <p className="font-medium text-gray-700">{predictionResult.inference_time ? `${predictionResult.inference_time}s` : 'N/A'}</p>
                     </div>
                  </div>

                  <div className="space-y-4">
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
                      className="w-full bg-gray-900 hover:bg-gray-800 text-white h-11 font-semibold shadow-md rounded-xl gap-2 transition-transform hover:scale-[1.01]"
                      onClick={linkObservation}
                      disabled={isLinking || !selectedObsId}
                    >
                      {isLinking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
                      Link Identification to Observation
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <Card className="border border-gray-150 overflow-hidden bg-white shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 rounded-2xl">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <CardTitle className="text-xl font-extrabold text-gray-950">Unified Prediction History</CardTitle>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <input 
              type="text" 
              placeholder="Search species..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-full md:w-48"
            />
            <select 
              value={filterSource} 
              onChange={(e) => setFilterSource(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm"
            >
              <option value="">All Sources</option>
              <option value="Image">Image</option>
              <option value="Audio">Audio</option>
            </select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoadingHistory ? (
            <div className="p-10 text-center text-gray-500">Loading...</div>
          ) : history.length === 0 ? (
            <div className="p-10 text-center text-gray-500">No predictions found.</div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border/50 shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-gray-50 text-gray-500 sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur z-10">
                <tr>
                  <th className="px-6 py-4">Source</th>
                  <th className="px-6 py-4">Species</th>
                  <th className="px-6 py-4">Confidence</th>
                  <th className="px-6 py-4">Model</th>
                  <th className="px-6 py-4">Scientific Name</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {history.map(pred => (
                  <tr key={pred.id || pred._id} onClick={() => setPredictionResult(pred)} className="hover:bg-gray-50 cursor-pointer transition-colors">
                    <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${pred.prediction_source === 'Image' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                            {pred.prediction_source}
                        </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900 flex items-center gap-2">
                        {speciesIconMap[pred.species_name] || '🐾'} {pred.species_name}
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                            <span>{pred.confidence_score}%</span>
                            <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                <div className={`h-1.5 rounded-full ${parseFloat(pred.confidence_score) >= 90 ? 'bg-green-500' : parseFloat(pred.confidence_score) >= 70 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${pred.confidence_score}%` }}></div>
                            </div>
                        </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">{pred.model_version || 'Unknown'}</td>
                    <td className="px-6 py-4 italic text-gray-600">{pred.scientific_name || 'N/A'}</td>
                    <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${pred.status === 'Saved' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                            {pred.status || 'Pending'}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{formatTimestamp(pred.prediction_timestamp || pred.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
          {totalRecords > limit && (
            <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50/50">
              <span className="text-sm text-gray-500">
                Showing {(currentPage - 1) * limit + 1} to {Math.min(currentPage * limit, totalRecords)} of {totalRecords}
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Previous</Button>
                <Button variant="outline" size="sm" disabled={currentPage * limit >= totalRecords} onClick={() => setCurrentPage(p => p + 1)}>Next</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SpeciesIdentificationPage;
