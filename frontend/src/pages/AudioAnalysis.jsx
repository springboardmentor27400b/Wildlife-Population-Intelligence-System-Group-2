import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { surveysAPI, sitesAPI, devicesAPI, observationsAPI, aiAPI, reportsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { UploadCloud, CheckCircle, AlertTriangle, FileAudio, Trash2, Layers, MapPin, Cpu, ChevronDown, ChevronUp, Clock, BarChart3, HelpCircle, Download, FileText } from 'lucide-react';

export default function AudioAnalysis({ mode }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleDownloadPDF = async (reportType, filename, result) => {
    if (!result) return;
    try {
      const blob = await reportsAPI.exportPDF({
        report_type: reportType,
        filename: filename || 'bioacoustic_analysis',
        result: result
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Wildlife_Bioacoustic_Analysis_Report_${result.media_id || Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF download error:', err);
      navigate('/audio-report', { state: { result, filename } });
    }
  };

  const currentAnalysisType = mode || (location.pathname.includes('other-wildlife') ? 'wildlife' : 'bird');
  const [analysisType, setAnalysisType] = useState(currentAnalysisType);

  useEffect(() => {
    setAnalysisType(currentAnalysisType);
    setSuccessPayload(null);
    setMsg({ text: '', isError: false });
  }, [currentAnalysisType]);

  const [surveys, setSurveys] = useState([]);
  const [sites, setSites] = useState([]);
  const [devices, setDevices] = useState([]);
  
  const [selectedSurvey, setSelectedSurvey] = useState('');
  const [selectedSite, setSelectedSite] = useState('');
  const [selectedDevice, setSelectedDevice] = useState('');
  const [notes, setNotes] = useState('');

  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState({ text: '', isError: false });
  const [successPayload, setSuccessPayload] = useState(null);

  const [previewUrls, setPreviewUrls] = useState({});
  const [previewLoading, setPreviewLoading] = useState({});
  const [previewError, setPreviewError] = useState({});
  const [uploadedMediaList, setUploadedMediaList] = useState([]);
  const [libraryOpen, setLibraryOpen] = useState(false);

  const [aiResults, setAiResults] = useState({});
  const [aiLoading, setAiLoading] = useState({});
  const [aiError, setAiError] = useState({});

  const handleFetchPreview = async (filename) => {
    setPreviewError(prev => ({ ...prev, [filename]: '' }));
    setPreviewLoading(prev => ({ ...prev, [filename]: true }));
    try {
      const blob = await observationsAPI.getMediaBlob(filename);
      const url = URL.createObjectURL(blob);
      setPreviewUrls(prev => ({ ...prev, [filename]: url }));
    } catch (err) {
      console.error(err);
      setPreviewError(prev => ({ ...prev, [filename]: 'Failed to retrieve media file.' }));
    } finally {
      setPreviewLoading(prev => ({ ...prev, [filename]: false }));
    }
  };

  const runAIInference = async (mediaId, filename) => {
    setAiLoading(prev => ({ ...prev, [filename]: true }));
    setAiError(prev => ({ ...prev, [filename]: null }));
    try {
      const result = await aiAPI.analyzeAudio(mediaId, analysisType);
      setAiResults(prev => ({ ...prev, [filename]: result }));
      window.dispatchEvent(new CustomEvent('alertsUpdated'));
    } catch (err) {
      console.error(`AI Inference failed for ${filename}:`, err);
      setAiError(prev => ({
        ...prev,
        [filename]: err.response?.data?.detail || "AI inference pipeline execution failed."
      }));
    } finally {
      setAiLoading(prev => ({ ...prev, [filename]: false }));
    }
  };

  const handleDeleteMedia = async (filename) => {
    try {
      await observationsAPI.deleteMedia(filename);
      if (previewUrls[filename]) {
        URL.revokeObjectURL(previewUrls[filename]);
        setPreviewUrls(prev => {
          const updated = { ...prev };
          delete updated[filename];
          return updated;
        });
      }
      setUploadedMediaList(prev => prev.filter(m => m.filename !== filename));
      setMsg({ text: 'Media asset deleted successfully!', isError: false });
    } catch (err) {
      console.error("Failed to delete media:", err);
      setMsg({ text: err.response?.data?.detail || 'An error occurred while deleting media.', isError: true });
    }
  };

  const getMediaItems = (res) => {
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.items)) return res.items;
    return [];
  };

  const fileInputRef = useRef(null);

  const fetchData = async () => {
    try {
      const [surveysData, sitesData, devicesData, mediaRes] = await Promise.all([
        surveysAPI.list(),
        sitesAPI.list(),
        devicesAPI.list(),
        observationsAPI.listMedia(0, 100, 'audio')
      ]);
      setSurveys(surveysData);
      setSites(sitesData);
      setDevices(devicesData);

      const items = getMediaItems(mediaRes);
      setUploadedMediaList(items.filter(m => m.file_type === 'audio'));

      if (surveysData.length > 0) setSelectedSurvey(surveysData[0].id.toString());
      if (sitesData.length > 0) setSelectedSite(sitesData[0].id.toString());
    } catch (err) {
      console.error("Error loading upload dependencies:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredDevices = devices.filter(d => d.status === 'Operational' && d.type === 'AudioSensor');

  const validateAndAddFiles = (selectedFiles) => {
    setMsg({ text: '', isError: false });
    const validatedFiles = [];
    const maxSizeBytes = 10 * 1024 * 1024; 

    for (let file of selectedFiles) {
      const ext = file.name.split('.').pop().toLowerCase();
      const isValidExt = ['wav', 'mp3'].includes(ext);
      
      if (!isValidExt) {
        setMsg({ text: `File "${file.name}" rejected: Only WAV or MP3 formats are supported.`, isError: true });
        continue;
      }
      if (file.size > maxSizeBytes) {
        setMsg({ text: `File "${file.name}" rejected: Size exceeds the 10MB limit.`, isError: true });
        continue;
      }
      validatedFiles.push(file);
    }
    setFiles(prev => [...prev, ...validatedFiles]);
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    validateAndAddFiles(selectedFiles);
  };

  const handleRemoveFile = (index) => {
    setFiles(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    validateAndAddFiles(droppedFiles);
  };

  const triggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (files.length === 0) {
      setMsg({ text: 'Please select at least one audio file to upload.', isError: true });
      return;
    }

    setUploading(true);
    setUploadProgress(10);
    setMsg({ text: '', isError: false });
    setSuccessPayload(null);
    Object.values(previewUrls).forEach(url => URL.revokeObjectURL(url));
    setPreviewUrls({});
    setPreviewError({});
    setPreviewLoading({});
    setAiResults({});
    setAiError({});
    setAiLoading({});

    try {
      const uploadRes = await observationsAPI.uploadMedia(
        files,
        selectedSurvey ? parseInt(selectedSurvey) : null,
        selectedSite ? parseInt(selectedSite) : null,
        selectedDevice ? parseInt(selectedDevice) : null
      );
      const audioUrls = uploadRes.urls || [];
      setUploadProgress(50);

      const obsPayload = {
        survey_id: selectedSurvey ? parseInt(selectedSurvey) : null,
        site_id: selectedSite ? parseInt(selectedSite) : null,
        device_id: selectedDevice ? parseInt(selectedDevice) : null,
        notes: notes || `Field audio observation uploaded via Audio Analysis portal (${analysisType === 'wildlife' ? 'AnimalCLAP' : 'BirdNET'}).`,
        uploaded_images: [],
        uploaded_audio: audioUrls
      };

      const savedObs = await observationsAPI.create(obsPayload);
      setUploadProgress(100);
      setSuccessPayload(savedObs);
      setMsg({ text: 'Audio assets uploaded and saved to observation record successfully!', isError: false });
      
      const mediaRes = await observationsAPI.listMedia(0, 100, 'audio');
      const mediaData = getMediaItems(mediaRes);
      setUploadedMediaList(mediaData.filter(m => m.file_type === 'audio'));

      setFiles([]);
      setNotes('');

      for (const audPath of audioUrls) {
        const filename = audPath.split('/').pop();
        await handleFetchPreview(filename);
        const matchingMedia = mediaData.find(m => m.filename === filename);
        if (matchingMedia && matchingMedia._id) {
          await runAIInference(matchingMedia._id, filename);
        }
      }
    } catch (err) {
      console.error(err);
      setMsg({ text: err.response?.data?.detail || 'An error occurred during audio upload.', isError: true });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 w-full">
      <div>
        <h2 className="text-xl font-bold text-zinc-100">Audio Analysis</h2>
        <p className="text-sm text-zinc-400 mt-1">Upload field acoustic tapes or audio clips to register bioacoustic observation activities.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div 
          onClick={() => {
            if (location.pathname !== '/audio-analysis/bird-analysis') {
              navigate('/audio-analysis/bird-analysis');
            }
          }}
          className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex items-start space-x-4 ${
            analysisType === 'bird'
              ? 'bg-emerald-950/20 border-emerald-500/80 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
              : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 opacity-80'
          }`}
        >
          <div className={`h-12 w-12 rounded-xl flex items-center justify-center border shrink-0 ${
            analysisType === 'bird'
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
              : 'bg-zinc-950 border-zinc-800 text-zinc-400'
          }`}>
            <span className="text-2xl">🐦</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h4 className="text-sm font-bold text-zinc-100">Bird Analysis</h4>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-emerald-950/40 text-emerald-400 border border-emerald-900/30">Active</span>
            </div>
            <p className="text-xs text-zinc-400 leading-normal">Identify bird species using BirdNET AI.</p>
          </div>
        </div>

        <div 
          onClick={() => {
            if (location.pathname !== '/audio-analysis/other-wildlife') {
              navigate('/audio-analysis/other-wildlife');
            }
          }}
          className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex items-start space-x-4 ${
            analysisType === 'wildlife'
              ? 'bg-amber-950/20 border-amber-500/80 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
              : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 opacity-80'
          }`}
        >
          <div className={`h-12 w-12 rounded-xl flex items-center justify-center border shrink-0 ${
            analysisType === 'wildlife'
              ? 'bg-amber-950/40 border-amber-500/30 text-amber-400'
              : 'bg-zinc-950 border-zinc-800 text-zinc-400'
          }`}>
            <span className="text-2xl">🐾</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h4 className="text-sm font-bold text-zinc-100">Other Wildlife</h4>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-amber-950/40 text-amber-400 border border-amber-900/30">Active</span>
            </div>
            <p className="text-xs text-zinc-400 leading-normal">Identify Mammals, Amphibians and Insects using AnimalCLAP AI.</p>
          </div>
        </div>
      </div>

      {msg.text && (
        <div className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 border ${
          msg.isError 
            ? 'bg-red-950/40 border-red-900/30 text-red-400' 
            : 'bg-emerald-950/40 border-emerald-900/30 text-emerald-400'
        }`}>
          {msg.isError ? <AlertTriangle size={16} /> : <CheckCircle size={16} />}
          <span>{msg.text}</span>
        </div>
      )}

      {(analysisType === 'bird' || analysisType === 'wildlife') && successPayload && (
        <div className="bg-zinc-900 border border-emerald-900/30 rounded-2xl p-5 space-y-4">
          <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
            <CheckCircle size={16} />
            <span>Storage Database Confirmation</span>
          </div>
          <div className="text-xs text-zinc-400 space-y-2 bg-zinc-950 p-4 rounded-xl border border-zinc-850 font-mono">
            <p><strong>Observation ID:</strong> {successPayload.id}</p>
            <p><strong>Survey ID:</strong> {successPayload.survey_id}</p>
            <p><strong>Site ID:</strong> {successPayload.site_id}</p>
            <p><strong>Status:</strong> Ready for Phase 3 Bioacoustic Recognition</p>
          </div>

          <div className="space-y-6 pt-2">
            {successPayload.uploaded_audio && successPayload.uploaded_audio.length > 0 && (
              <div className="space-y-4">
                {successPayload.uploaded_audio.map((path) => {
                  const filename = path.split('/').pop();
                  const url = previewUrls[filename];
                  const loading = previewLoading[filename];
                  const error = previewError[filename];
                  return (
                    <div key={path} className="bg-zinc-950 p-5 rounded-xl border border-zinc-850 space-y-4">
                      <p className="text-xs text-zinc-550 truncate font-mono border-b border-zinc-900 pb-2">{filename}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col justify-center items-center bg-zinc-900 rounded-xl p-4 border border-zinc-800 relative min-h-[220px]">
                          {url ? (
                            <div className="w-full flex flex-col items-center justify-center space-y-4">
                              <div className="h-16 w-16 rounded-full bg-emerald-950/20 border border-emerald-900/30 flex items-center justify-center text-emerald-500">
                                <FileAudio size={32} />
                              </div>
                              <audio src={url} controls className="w-full h-10" />
                            </div>
                          ) : error ? (
                            <p className="text-xs text-red-400 font-semibold">{error}</p>
                          ) : loading ? (
                            <p className="text-xs text-zinc-500 animate-pulse">Retrieving from GridFS...</p>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleFetchPreview(filename)}
                              className="py-2 px-4 bg-emerald-700/30 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-800/30 rounded-lg text-xs font-semibold transition cursor-pointer"
                            >
                              Load Audio Preview
                            </button>
                          )}
                        </div>

                        <div className="space-y-4">
                          {aiLoading[filename] && (
                            <div className="h-full flex flex-col justify-center items-center p-6 bg-zinc-900 border border-zinc-850 rounded-xl space-y-3 min-h-[220px]">
                              <div className="animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent"></div>
                              <p className="text-xs text-zinc-400 font-medium">Classifying via {analysisType === 'wildlife' ? 'AnimalCLAP' : 'BirdNET'} AI Engine...</p>
                            </div>
                          )}

                          {aiError[filename] && (
                            <div className="p-4 bg-red-950/20 border border-red-900/30 rounded-xl text-xs text-red-400 flex items-center space-x-2">
                              <AlertTriangle size={14} className="shrink-0" />
                              <span>{aiError[filename]}</span>
                            </div>
                          )}

                          {aiResults[filename] && (
                            <div className="bg-zinc-900 border border-zinc-850 rounded-xl p-5 space-y-4">
                              <div className="flex items-center space-x-2 text-emerald-400 font-bold text-[11px] uppercase tracking-wider border-b border-zinc-800 pb-3">
                                <Cpu size={14} />
                                <span>AI Bioacoustic Prediction Results ({aiResults[filename].model_name || 'AI'})</span>
                              </div>

                              <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-4 space-y-3">
                                <div className="flex justify-between items-center">
                                  <div>
                                    <div className="flex items-center space-x-2">
                                      <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Common Name</p>
                                      {aiResults[filename].is_low_confidence && (
                                        <span className="px-1.5 py-0.5 bg-amber-950/60 border border-amber-800/80 text-amber-400 text-[8px] font-extrabold rounded uppercase tracking-wider">
                                          Low Confidence
                                        </span>
                                      )}
                                    </div>
                                    <h4 className="text-lg font-bold text-emerald-400 mt-1">{aiResults[filename].common_name || aiResults[filename].detected_species}</h4>
                                  </div>
                                  {!aiResults[filename].is_low_confidence && aiResults[filename].common_name !== 'Unknown Species Detected' && (
                                    <div className="text-right">
                                      <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Confidence</p>
                                      <span className="text-lg font-extrabold text-emerald-400">
                                        {(aiResults[filename].confidence * 100).toFixed(2)}%
                                      </span>
                                    </div>
                                  )}
                                </div>
                                {aiResults[filename].scientific_name && (
                                  <div className="border-t border-emerald-900/20 pt-2">
                                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Scientific Name</p>
                                    <p className="text-sm font-semibold italic text-emerald-300 mt-0.5">{aiResults[filename].scientific_name}</p>
                                  </div>
                                )}
                              </div>

                              <div className="grid grid-cols-3 gap-2.5">
                                <div className="bg-zinc-950/50 border border-zinc-850 p-2.5 rounded-lg flex flex-col justify-center items-center text-center">
                                  <Clock size={14} className="text-emerald-500 mb-1" />
                                  <span className="text-[9px] font-bold text-zinc-550 uppercase tracking-wider">Duration</span>
                                  <span className="text-xs font-extrabold text-zinc-200 mt-0.5">
                                    {aiResults[filename].audio_quality?.duration.toFixed(1)}s
                                  </span>
                                </div>
                                <div className="bg-zinc-950/50 border border-zinc-850 p-2.5 rounded-lg flex flex-col justify-center items-center text-center">
                                  <BarChart3 size={14} className="text-emerald-500 mb-1" />
                                  <span className="text-[9px] font-bold text-zinc-550 uppercase tracking-wider">Quality Score</span>
                                  <span className="text-xs font-extrabold text-zinc-200 mt-0.5">
                                    {aiResults[filename].audio_quality?.overall_score}%
                                  </span>
                                </div>
                                <div className="bg-zinc-950/50 border border-zinc-850 p-2.5 rounded-lg flex flex-col justify-center items-center text-center">
                                  <HelpCircle size={14} className="text-emerald-500 mb-1" />
                                  <span className="text-[9px] font-bold text-zinc-550 uppercase tracking-wider">Rating</span>
                                  <span className="text-[11px] font-extrabold text-emerald-450 mt-0.5 truncate w-full" title={aiResults[filename].audio_quality?.overall_rating}>
                                    {aiResults[filename].audio_quality?.overall_rating}
                                  </span>
                                </div>
                              </div>

                              <div className="pt-3 border-t border-zinc-800 flex items-center space-x-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigate('/audio-report', {
                                      state: {
                                        result: aiResults[filename],
                                        audioUrl: url,
                                        filename: filename
                                      }
                                    });
                                  }}
                                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-lg text-xs font-bold shadow-lg transition cursor-pointer flex items-center justify-center space-x-1.5"
                                >
                                  <FileText size={14} />
                                  <span>See Detailed Report</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDownloadPDF('audio', filename, aiResults[filename])}
                                  className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-emerald-400 hover:text-emerald-300 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center space-x-1 border border-zinc-700"
                                  title="Download PDF Report"
                                >
                                  <Download size={14} />
                                  <span>PDF</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-zinc-850 flex justify-end">
            <button
              type="button"
              onClick={() => {
                setSuccessPayload(null);
                setFiles([]);
              }}
              className="py-2.5 px-6 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Analyze Another Audio
            </button>
          </div>
        </div>
      )}

      {(analysisType === 'bird' || analysisType === 'wildlife') && !successPayload && (
        <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-4">
            <div className="flex items-center space-x-2 border-b border-zinc-800 pb-3 mb-2">
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Observation Metadata</span>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center space-x-1">
                <Layers size={12} className="text-emerald-500" />
                <span>Assign to Survey</span>
              </label>
              <select
                value={selectedSurvey}
                onChange={(e) => setSelectedSurvey(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg text-zinc-300 outline-none text-sm transition"
              >
                {surveys.length === 0 && <option value="">No Active Surveys</option>}
                {surveys.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center space-x-1">
                <MapPin size={12} className="text-emerald-500" />
                <span>Monitoring Site</span>
              </label>
              <select
                value={selectedSite}
                onChange={(e) => setSelectedSite(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg text-zinc-300 outline-none text-sm transition"
              >
                {sites.length === 0 && <option value="">No Active Sites</option>}
                {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center space-x-1">
                <Cpu size={12} className="text-emerald-500" />
                <span>Deployed Device (Optional)</span>
              </label>
              <select
                value={selectedDevice}
                onChange={(e) => setSelectedDevice(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg text-zinc-300 outline-none text-sm transition"
              >
                <option value="">No Device Associated</option>
                {filteredDevices.map(d => <option key={d.id} value={d.id}>{d.model_number || 'Sensor'} (ID: {d.id})</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Field Observation Notes</label>
              <textarea
                rows="4"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Audio recorder active overnight near waterhole..."
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg text-zinc-100 placeholder-zinc-700 outline-none text-sm transition resize-none"
              />
            </div>
          </div>
          <div className="md:col-span-2 bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center space-x-2 border-b border-zinc-800 pb-3 mb-2">
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Dropzone Container</span>
              </div>
              {user?.role === 'Admin' ? (
                <div className="border-2 border-red-900/30 border-dashed rounded-2xl p-8 bg-red-950/10 text-center flex flex-col items-center justify-center space-y-3">
                  <div className="h-12 w-12 rounded-xl bg-red-950/20 border border-red-900/30 flex items-center justify-center text-red-400">
                    <AlertTriangle size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-red-400">Upload Restricted</p>
                    <p className="text-xs text-zinc-500 mt-1">Administrator accounts are restricted to media viewing and deletion.</p>
                  </div>
                </div>
              ) : (
                <div 
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={triggerFileSelect}
                  className="border-2 border-zinc-800 border-dashed rounded-2xl p-8 bg-zinc-950/40 hover:bg-zinc-950/70 hover:border-emerald-600/30 transition text-center cursor-pointer flex flex-col items-center justify-center space-y-3"
                >
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    multiple 
                    onChange={handleFileChange}
                    accept=".wav,.mp3"
                    className="hidden" 
                  />
                  <div className="h-12 w-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-zinc-200">
                    <UploadCloud size={22} className="text-emerald-500 animate-pulse" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold text-zinc-200">Drag & Drop files here</p>
                    <p className="text-[10px] text-zinc-500 mt-1">Accepts WAV or MP3 (Max 10MB per file)</p>
                  </div>
                  <span className="text-xs font-semibold text-emerald-500 hover:text-emerald-400 bg-emerald-950/20 border border-emerald-900/30 px-3 py-1.5 rounded-lg">Browse Local Storage</span>
                </div>
              )}
              {files.length > 0 && (
                <div className="space-y-2 mt-4 max-h-[220px] overflow-y-auto pr-1">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Upload Queue ({files.length})</p>
                  <div className="space-y-2">
                    {files.map((file, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-zinc-950 p-2.5 rounded-lg border border-zinc-850">
                        <div className="flex items-center space-x-2.5 overflow-hidden">
                          <FileAudio size={16} className="text-blue-400 shrink-0" />
                          <div className="overflow-hidden">
                            <p className="text-xs font-semibold text-zinc-300 truncate" title={file.name}>{file.name}</p>
                            <p className="text-[9px] text-zinc-500 mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>
                          </div>
                        </div>
                        <button type="button" onClick={() => handleRemoveFile(idx)} className="text-zinc-500 hover:text-red-400 transition p-1 cursor-pointer">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {user?.role !== 'Admin' && (
              <button
                type="submit"
                disabled={uploading || files.length === 0}
                className="w-full mt-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white rounded-xl font-bold text-sm shadow-lg active:scale-[0.98] transition cursor-pointer"
              >
                {uploading ? 'Processing File Storage...' : 'Upload & Save Audio'}
              </button>
            )}
          </div>
        </form>
      )}

      {(analysisType === 'bird' || analysisType === 'wildlife') && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <button
          type="button"
          onClick={() => setLibraryOpen(!libraryOpen)}
          className="w-full flex items-center justify-between border-b border-zinc-800 pb-3 outline-none text-left cursor-pointer group"
        >
          <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider group-hover:text-emerald-400 transition-colors">Uploaded Audio Library</span>
          {libraryOpen ? <ChevronUp size={16} className="text-zinc-400" /> : <ChevronDown size={16} className="text-zinc-400" />}
        </button>
        {libraryOpen && (
          <div className="space-y-4 pt-1">
            {!Array.isArray(uploadedMediaList) || uploadedMediaList.length === 0 ? (
              <p className="text-xs text-zinc-500 italic">No uploaded audio records found in the library.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {uploadedMediaList.map((media) => {
                  const filename = media.filename;
                  const url = previewUrls[filename];
                  return (
                    <div key={media._id} className="bg-zinc-950 p-4 rounded-xl border border-zinc-850 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-blue-950/40 text-blue-400 border border-blue-900/30">
                            {media.file_type}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-300 truncate font-semibold">{media.original_filename}</p>
                        <div className="mt-3">
                          {url ? <audio src={url} controls className="w-full h-8" /> : null}
                        </div>
                      </div>
                      <div className="space-y-2 pt-2 border-t border-zinc-900">
                        {!url && (
                          <button type="button" onClick={() => handleFetchPreview(filename)} className="w-full py-1.5 bg-emerald-700/30 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-800/30 rounded-lg text-xs font-semibold transition cursor-pointer">Preview Audio</button>
                        )}
                        {user?.role === 'Admin' && (
                          <button type="button" onClick={() => handleDeleteMedia(filename)} className="w-full py-1.5 bg-red-950/40 hover:bg-red-900/30 text-red-400 border border-red-900/30 rounded-lg text-xs font-semibold transition flex items-center justify-center space-x-1 cursor-pointer">
                            <Trash2 size={12} />
                            <span>Delete</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        </div>
      )}
    </div>
  );
}
