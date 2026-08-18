import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { surveysAPI, sitesAPI, devicesAPI, observationsAPI, aiAPI, reportsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { UploadCloud, CheckCircle, AlertTriangle, FileAudio, FileImage, Trash2, Layers, MapPin, Cpu, ChevronDown, ChevronUp, Eye, Download, FileText } from 'lucide-react';

export default function Upload() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [surveys, setSurveys] = useState([]);
  const [sites, setSites] = useState([]);
  const [devices, setDevices] = useState([]);

  const handleDownloadPDF = async (reportType, filename, result) => {
    if (!result) return;
    try {
      const blob = await reportsAPI.exportPDF({
        report_type: reportType,
        filename: filename || 'image_analysis',
        result: result
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Wildlife_Image_Analysis_Report_${result.media_id || Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF download error:', err);
      navigate('/report', { state: { result, filename } });
    }
  };
  
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

  const [hasMoreMedia, setHasMoreMedia] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalMediaCount, setTotalMediaCount] = useState(0);

  const [aiResults, setAiResults] = useState({});
  const [aiLoading, setAiLoading] = useState({});
  const [aiError, setAiError] = useState({});
  const [imageDimensions, setImageDimensions] = useState({});

  const handleImageLoad = (e, filename) => {
    const { naturalWidth, naturalHeight } = e.target;
    setImageDimensions(prev => ({
      ...prev,
      [filename]: { naturalWidth, naturalHeight }
    }));
  };

  const runAIInference = async (mediaId, filename) => {
    setAiLoading(prev => ({ ...prev, [filename]: true }));
    setAiError(prev => ({ ...prev, [filename]: null }));
    try {
      const result = await aiAPI.analyzeImage(mediaId);
      setAiResults(prev => ({ ...prev, [filename]: result }));
      // Dispatch alertsUpdated event so header notification bell and dashboard update in real time
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

  const handleLoadMoreMedia = async () => {
    setLoadingMore(true);
    try {
      const nextSkip = uploadedMediaList.length;
      const res = await observationsAPI.listMedia(nextSkip, 12, 'image');
      if (res && res.items) {
        setUploadedMediaList(prev => [...prev, ...res.items]);
        setTotalMediaCount(res.total);
        setHasMoreMedia(res.has_more);
      }
    } catch (err) {
      console.error("Failed to load more media items:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleDeleteMedia = async (filename, type) => {
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
      // Clean up AI states
      setAiResults(prev => {
        const updated = { ...prev };
        delete updated[filename];
        return updated;
      });
      setAiLoading(prev => {
        const updated = { ...prev };
        delete updated[filename];
        return updated;
      });
      setAiError(prev => {
        const updated = { ...prev };
        delete updated[filename];
        return updated;
      });
      setImageDimensions(prev => {
        const updated = { ...prev };
        delete updated[filename];
        return updated;
      });

      setSuccessPayload(prev => {
        if (!prev) return prev;
        const updated = { ...prev };
        if (type === 'image') {
          updated.uploaded_images = (updated.uploaded_images || []).filter(
            path => path.split('/').pop() !== filename
          );
        } else {
          updated.uploaded_audio = (updated.uploaded_audio || []).filter(
            path => path.split('/').pop() !== filename
          );
        }
        return updated;
      });
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
        observationsAPI.listMedia(0, 12, 'image')
      ]);
      setSurveys(surveysData);
      setSites(sitesData);
      setDevices(devicesData);

      const items = getMediaItems(mediaRes);
      setUploadedMediaList(items);
      setTotalMediaCount(mediaRes?.total || items.length);
      setHasMoreMedia(Boolean(mediaRes?.has_more));

      if (surveysData.length > 0) setSelectedSurvey(surveysData[0].id.toString());
      if (sitesData.length > 0) setSelectedSite(sitesData[0].id.toString());
    } catch (err) {
      console.error("Error loading upload dependencies:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter devices: show only Operational CameraTraps
  const filteredDevices = devices.filter(d => d.status === 'Operational' && d.type === 'CameraTrap');

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    validateAndAddFiles(selectedFiles);
  };

  const validateAndAddFiles = (selectedFiles) => {
    setMsg({ text: '', isError: false });
    const validatedFiles = [];
    const maxSizeBytes = 10 * 1024 * 1024; // 10MB limit

    for (let file of selectedFiles) {
      // Validate file extension / mime type
      const ext = file.name.split('.').pop().toLowerCase();
      const isValidExt = ['jpg', 'jpeg', 'png'].includes(ext);
      
      if (!isValidExt) {
        setMsg({ text: `File "${file.name}" rejected: Only JPG or PNG formats are supported.`, isError: true });
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

  const handleRemoveFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
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
    fileInputRef.current.click();
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setMsg({ text: '', isError: false });
    setSuccessPayload(null);
    // Revoke previous preview URLs to free memory
    Object.values(previewUrls).forEach(url => URL.revokeObjectURL(url));
    setPreviewUrls({});
    setPreviewError({});
    setPreviewLoading({});
    setAiResults({});
    setAiError({});
    setAiLoading({});
    setImageDimensions({});

    if (!selectedSurvey || !selectedSite) {
      setMsg({ text: 'Please verify that a Survey and a Monitoring Site are selected.', isError: true });
      return;
    }

    if (files.length === 0) {
      setMsg({ text: 'Please select or drag-and-drop at least one media file to upload.', isError: true });
      return;
    }

    setUploading(true);
    setUploadProgress(15); // Start mock progress

    try {
      // Step 1: Upload media files with relational survey, site, and device IDs
      setUploadProgress(40);
      const uploadRes = await observationsAPI.uploadMedia(
        files, 
        parseInt(selectedSurvey), 
        parseInt(selectedSite), 
        selectedDevice ? parseInt(selectedDevice) : null
      );
      const fileUrls = uploadRes.urls;
      
      setUploadProgress(70);

      // Separate images and audio paths
      const imageUrls = [];
      const audioUrls = [];
      
      fileUrls.forEach(url => {
        const ext = url.split('.').pop().toLowerCase();
        if (['jpg', 'jpeg', 'png'].includes(ext)) {
          imageUrls.push(url);
        } else {
          audioUrls.push(url);
        }
      });

      // Step 2: Register the observation with file paths in SQL database
      const obsPayload = {
        survey_id: parseInt(selectedSurvey),
        site_id: parseInt(selectedSite),
        device_id: selectedDevice ? parseInt(selectedDevice) : null,
        uploaded_images: imageUrls,
        uploaded_audio: audioUrls,
        observation_notes: notes || null
      };

      const savedObs = await observationsAPI.create(obsPayload);
      window.dispatchEvent(new Event('dashboard-stats-update'));
      setUploadProgress(100);
      setSuccessPayload(savedObs);
      setMsg({ text: 'Media assets uploaded and saved to observation record successfully!', isError: false });
      
      const mediaRes = await observationsAPI.listMedia(0, 12, 'image');
      const mediaData = getMediaItems(mediaRes);
      setUploadedMediaList(mediaData);
      setTotalMediaCount(mediaRes?.total || mediaData.length);
      setHasMoreMedia(Boolean(mediaRes?.has_more));

      // Clear forms
      setFiles([]);
      setNotes('');

      // Automatically trigger preview and AI inference for each newly uploaded image
      for (const imgPath of imageUrls) {
        const filename = imgPath.split('/').pop();
        
        // 1. Fetch preview from GridFS automatically
        await handleFetchPreview(filename);

        // 2. Find matching media ID
        const matchingMedia = mediaData.find(m => m.filename === filename);
        if (matchingMedia && matchingMedia._id) {
          // 3. Trigger AI inference automatically!
          await runAIInference(matchingMedia._id, filename);
        }
      }
    } catch (err) {
      console.error(err);
      setMsg({ text: err.response?.data?.detail || 'An error occurred during media upload.', isError: true });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-zinc-100">Test Upload Media Assets</h2>
        <p className="text-sm text-zinc-400 mt-1">Upload field camera pictures or acoustic tapes to register observation activities.</p>
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

      {/* Media Analysis Section */}
      {successPayload && (
        <div className="bg-zinc-900 border border-emerald-900/30 rounded-2xl p-5 space-y-4">
          <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
            <CheckCircle size={16} />
            <span>Storage Database Confirmation</span>
          </div>
          <div className="text-xs text-zinc-400 space-y-2 bg-zinc-950 p-4 rounded-xl border border-zinc-850 font-mono">
            <p><strong>Observation ID:</strong> {successPayload.id}</p>
            <p><strong>Survey ID:</strong> {successPayload.survey_id}</p>
            <p><strong>Site ID:</strong> {successPayload.site_id}</p>
            <p><strong>Status:</strong> Ready for Phase 3 AI Inference</p>
          </div>

          <div className="space-y-6 pt-2">
            {successPayload.uploaded_images && successPayload.uploaded_images.map((path) => {
              const filename = path.split('/').pop();
              const url = previewUrls[filename];
              const loading = previewLoading[filename];
              const error = previewError[filename];
              
              return (
                <div key={path} className="bg-zinc-950 p-4 rounded-xl border border-zinc-850 space-y-4">
                  <p className="text-xs text-zinc-500 font-mono border-b border-zinc-900 pb-2">{filename}</p>
                  
                  {/* Side-by-side grid on desktop, single column on small screens */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Left Panel: Image & Bounding Boxes */}
                    <div className="flex flex-col justify-center items-center bg-zinc-900 rounded-xl p-4 border border-zinc-800 relative min-h-[250px]">
                      {url ? (
                        <div className="relative inline-block">
                          <img
                            src={url}
                            alt="Preview"
                            className="max-h-[350px] w-auto object-contain rounded block"
                            onLoad={(e) => handleImageLoad(e, filename)}
                          />
                          {aiResults[filename]?.bounding_boxes && imageDimensions[filename] && (
                            <div className="absolute inset-0 pointer-events-none">
                              {aiResults[filename].bounding_boxes.map((box, bIdx) => {
                                const { naturalWidth, naturalHeight } = imageDimensions[filename] || {};
                                if (!naturalWidth || !naturalHeight) return null;

                                const x1 = Array.isArray(box?.bounding_box) ? box.bounding_box[0] : (box?.xmin ?? 0);
                                const y1 = Array.isArray(box?.bounding_box) ? box.bounding_box[1] : (box?.ymin ?? 0);
                                const x2 = Array.isArray(box?.bounding_box) ? box.bounding_box[2] : (box?.xmax ?? 0);
                                const y2 = Array.isArray(box?.bounding_box) ? box.bounding_box[3] : (box?.ymax ?? 0);
                                
                                const left = Math.max(0, Math.min(100, (x1 / naturalWidth) * 100));
                                const top = Math.max(0, Math.min(100, (y1 / naturalHeight) * 100));
                                const width = Math.max(0, Math.min(100 - left, ((x2 - x1) / naturalWidth) * 100));
                                const height = Math.max(0, Math.min(100 - top, ((y2 - y1) / naturalHeight) * 100));

                                return (
                                  <div
                                    key={bIdx}
                                    className="border-2 border-emerald-500 bg-emerald-500/15 absolute rounded-sm"
                                    style={{
                                      left: `${left}%`,
                                      top: `${top}%`,
                                      width: `${width}%`,
                                      height: `${height}%`,
                                    }}
                                  />
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ) : error ? (
                        <p className="text-xs text-red-400 font-semibold">{error}</p>
                      ) : loading ? (
                        <p className="text-xs text-zinc-500 animate-pulse">Retrieving from GridFS...</p>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleFetchPreview(filename)}
                          className="py-1.5 px-4 bg-emerald-700/30 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-800/30 rounded-lg text-xs font-semibold transition cursor-pointer"
                        >
                          Preview Uploaded Image
                        </button>
                      )}
                    </div>

                    {/* Right Panel: AI Results Info */}
                    <div className="space-y-4">
                      {aiLoading[filename] && (
                        <div className="h-full flex flex-col justify-center items-center p-6 bg-zinc-900 border border-zinc-850 rounded-xl space-y-3">
                          <div className="animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent"></div>
                          <p className="text-xs text-zinc-400 font-medium">Classifying via AI Engine...</p>
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
                          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                            <div className="flex items-center space-x-2 text-emerald-400 font-bold text-[11px] uppercase tracking-wider">
                              <Cpu size={14} />
                              <span>AI Prediction Results</span>
                            </div>
                          </div>

                          <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-4 flex justify-between items-center">
                            <div>
                              <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Primary Species Detected</p>
                              <h4 className="text-lg font-bold text-emerald-400 mt-1">{aiResults[filename].detected_species}</h4>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Confidence</p>
                              <span className="text-lg font-extrabold text-emerald-400">
                                {(aiResults[filename].confidence * 100).toFixed(2)}%
                              </span>
                            </div>
                          </div>

                          <div className="border-t border-zinc-800 pt-3.5">
                            <div className="flex items-center justify-between bg-zinc-950/50 border border-zinc-800/85 p-3.5 px-4 rounded-xl">
                              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Number of Animals Detected</span>
                              <span className="text-base font-extrabold text-emerald-400 bg-emerald-950/30 border border-emerald-900/30 px-3 py-0.5 rounded-lg font-mono">
                                {aiResults[filename].bounding_boxes.length}
                              </span>
                            </div>
                          </div>

                          <div className="pt-3.5 border-t border-zinc-800 flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={() => {
                                navigate('/report', {
                                  state: {
                                    result: aiResults[filename],
                                    imageUrl: previewUrls[filename],
                                    filename: filename
                                  }
                                });
                              }}
                              className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-lg text-xs font-bold shadow-lg transition cursor-pointer flex items-center justify-center space-x-1.5 font-semibold"
                            >
                              <FileText size={14} />
                              <span>See Detailed Report</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDownloadPDF('image', filename, aiResults[filename])}
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

            {successPayload.uploaded_audio && successPayload.uploaded_audio.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Audio Files ({successPayload.uploaded_audio.length})</h4>
                <div className="grid grid-cols-1 gap-3">
                  {successPayload.uploaded_audio.map((path) => {
                    const filename = path.split('/').pop();
                    const url = previewUrls[filename];
                    const loading = previewLoading[filename];
                    const error = previewError[filename];
                    return (
                      <div key={path} className="bg-zinc-950 p-3 rounded-xl border border-zinc-850 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] text-zinc-500 truncate font-mono">{filename}</p>
                          {url ? (
                            <audio src={url} controls className="h-8 mt-1.5" />
                          ) : error ? (
                            <p className="text-xs text-red-400 font-semibold">{error}</p>
                          ) : loading ? (
                            <p className="text-xs text-zinc-500 animate-pulse">Retrieving from GridFS...</p>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleFetchPreview(filename)}
                              className="mt-1.5 py-1 px-3 bg-emerald-700/30 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-800/30 rounded text-[10px] font-semibold transition cursor-pointer"
                            >
                              Load Audio Preview
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Upload Another Image button */}
          <div className="pt-4 border-t border-zinc-850 flex justify-end">
            <button
              type="button"
              onClick={() => {
                setSuccessPayload(null);
                setAiResults({});
                setAiError({});
                setAiLoading({});
                setImageDimensions({});
                setPreviewUrls({});
                setPreviewError({});
                setPreviewLoading({});
              }}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-xl text-xs font-bold shadow-lg transition cursor-pointer"
            >
              Upload Another Image
            </button>
          </div>
        </div>
      )}

      {!successPayload && (
        <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Columns: Metadata Form */}
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
                {surveys.map(s => (
                  <option key={s.id} value={s.id}>{s.title}</option>
                ))}
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
                {sites.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
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
                {filteredDevices.map(d => {
                  const deviceTypeLabel = d.type === 'CameraTrap' 
                    ? 'Camera' 
                    : d.type === 'AudioSensor' 
                      ? 'Audio' 
                      : d.type.replace(/Trap|Sensor/g, '');
                  return (
                    <option key={d.id} value={d.id}>
                      {deviceTypeLabel} - {d.model_number || 'Sensor'} (ID: {d.id})
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Field Observation Notes</label>
              <textarea
                rows="4"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Camera triggered by moving pack of hyenas..."
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg text-zinc-100 placeholder-zinc-700 outline-none text-sm transition resize-none"
              />
            </div>
          </div>

          {/* Right Column: Drag-Drop Area & Files list */}
          <div className="md:col-span-2 bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center space-x-2 border-b border-zinc-800 pb-3 mb-2">
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Dropzone Container</span>
              </div>

              {/* Drag & Drop Box */}
              {user?.role === 'Admin' ? (
                <div className="border-2 border-red-900/30 border-dashed rounded-2xl p-8 bg-red-950/10 text-center flex flex-col items-center justify-center space-y-3">
                  <div className="h-12 w-12 rounded-xl bg-red-950/20 border border-red-900/30 flex items-center justify-center text-red-400">
                    <AlertTriangle size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-red-400">Upload Restricted</p>
                    <p className="text-xs text-zinc-500 mt-1">Administrator accounts are restricted to media viewing and deletion. Upload functionality is disabled.</p>
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
                    accept=".jpg,.jpeg,.png"
                    className="hidden" 
                  />
                  <div className="h-12 w-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-zinc-200">
                    <UploadCloud size={22} className="text-emerald-500 animate-pulse" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold text-zinc-200">Drag & Drop files here</p>
                    <p className="text-[10px] text-zinc-500 mt-1">Accepts JPG or PNG (Max 10MB per file)</p>
                  </div>
                  <span className="text-xs font-semibold text-emerald-500 hover:text-emerald-400 bg-emerald-950/20 border border-emerald-900/30 px-3 py-1.5 rounded-lg">Browse Local Storage</span>
                </div>
              )}

              {/* Upload Queue list */}
              {files.length > 0 && (
                <div className="space-y-2 mt-4 max-h-[220px] overflow-y-auto pr-1">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Upload Queue ({files.length})</p>
                  <div className="space-y-2">
                    {files.map((file, idx) => {
                      const isImg = file.type.startsWith('image/') || ['jpg', 'jpeg', 'png'].includes(file.name.split('.').pop().toLowerCase());
                      return (
                        <div key={idx} className="flex justify-between items-center bg-zinc-950 p-2.5 rounded-lg border border-zinc-850">
                          <div className="flex items-center space-x-2.5 overflow-hidden">
                            {isImg ? <FileImage size={16} className="text-purple-400 shrink-0" /> : <FileAudio size={16} className="text-blue-400 shrink-0" />}
                            <div className="overflow-hidden">
                              <p className="text-xs font-semibold text-zinc-300 truncate" title={file.name}>{file.name}</p>
                              <p className="text-[9px] text-zinc-500 mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>
                            </div>
                          </div>
                          <button 
                            type="button" 
                            onClick={() => handleRemoveFile(idx)}
                            className="text-zinc-500 hover:text-red-400 transition p-1 cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Submission and mock loading triggers */}
            {user?.role !== 'Admin' && (
              <button
                type="submit"
                disabled={uploading || files.length === 0 || Object.values(aiLoading).some(l => l)}
                className="w-full mt-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white rounded-xl font-bold text-sm shadow-lg active:scale-[0.98] transition cursor-pointer"
              >
                {uploading ? 'Processing File Storage...' : Object.values(aiLoading).some(l => l) ? 'Running AI Inference...' : 'Upload & Save Observation'}
              </button>
            )}
          </div>
        </form>
      )}

      {/* Uploaded Media Library Section */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <button
          type="button"
          onClick={() => setLibraryOpen(!libraryOpen)}
          className="w-full flex items-center justify-between border-b border-zinc-800 pb-3 outline-none text-left cursor-pointer group"
        >
          <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider group-hover:text-emerald-400 transition-colors">Uploaded Media Library</span>
          {libraryOpen ? <ChevronUp size={16} className="text-zinc-400 group-hover:text-emerald-400 transition-colors" /> : <ChevronDown size={16} className="text-zinc-400 group-hover:text-emerald-400 transition-colors" />}
        </button>
        
        {libraryOpen && (() => {
          const imageOnlyList = Array.isArray(uploadedMediaList)
            ? uploadedMediaList.filter(media => {
                const ft = (media.file_type || '').toLowerCase();
                const mime = (media.mime_type || '').toLowerCase();
                const fn = (media.filename || '').toLowerCase();
                const isAudioExt = /\.(mp3|wav|flac|aac|ogg)$/i.test(fn);
                if (ft === 'audio' || mime.startsWith('audio/') || isAudioExt) return false;
                const isImgType = ft === 'image' || mime.startsWith('image/');
                const isImgExt = /\.(jpg|jpeg|png)$/i.test(fn);
                return isImgType || isImgExt;
              })
            : [];

          return (
            <div className="space-y-4 pt-1">
              {imageOnlyList.length === 0 ? (
                <p className="text-xs text-zinc-500 italic">No uploaded image records found in the library.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {imageOnlyList.map((media) => {
                  const filename = media.filename;
                  const url = previewUrls[filename];
                  const loading = previewLoading[filename];
                  const error = previewError[filename];
                  const isImage = media.file_type === 'image';

                  // Resolve relational entity names from stored PostgreSQL IDs
                  const surveyObj = surveys.find((s) => s.id === media.survey_id);
                  const surveyName = surveyObj ? surveyObj.title : (media.survey_id ? `Survey #${media.survey_id}` : 'Unassigned Survey');
                  
                  const siteObj = sites.find((st) => st.id === media.site_id);
                  const siteName = siteObj ? siteObj.name : (media.site_id ? `Site #${media.site_id}` : 'Unassigned Site');

                  const deviceObj = devices.find((d) => d.id === media.device_id);
                  const deviceName = deviceObj ? `${deviceObj.type} (ID: ${media.device_id})` : (media.device_id ? `Device #${media.device_id}` : 'No Device Associated');

                  return (
                    <div key={media._id} className="bg-zinc-950 p-4 rounded-xl border border-zinc-850 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                            isImage ? 'bg-purple-950/40 text-purple-400 border border-purple-900/30' : 'bg-blue-950/40 text-blue-400 border border-blue-900/30'
                          }`}>
                            {media.file_type}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono">{(media.file_size / 1024).toFixed(1)} KB</span>
                        </div>
                        <p className="text-[11px] text-zinc-300 truncate font-semibold" title={media.original_filename}>
                          {media.original_filename}
                        </p>
                        <p className="text-[9px] text-zinc-650 truncate font-mono mt-0.5">{filename}</p>

                        {/* Relational Metadata Badges */}
                        <div className="mt-2 text-[10px] space-y-1 bg-zinc-900/60 p-2 rounded-lg border border-zinc-850">
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Survey Project:</span>
                            <span className="text-emerald-400 font-bold truncate max-w-[130px] text-right" title={surveyName}>{surveyName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Monitoring Site:</span>
                            <span className="text-teal-400 font-bold truncate max-w-[130px] text-right" title={siteName}>{siteName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Device:</span>
                            <span className="text-zinc-400 font-medium truncate max-w-[130px] text-right" title={deviceName}>{deviceName}</span>
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          {url ? (
                            isImage ? (
                              <div className="relative rounded-lg overflow-hidden border border-zinc-900 bg-zinc-900 flex items-center justify-center p-2">
                                <img src={url} alt="Preview" className="max-h-[150px] w-auto object-contain rounded block" />
                              </div>
                            ) : (
                              <div className="p-1">
                                <audio src={url} controls className="w-full h-8" />
                              </div>
                            )
                          ) : error ? (
                            <p className="text-xs text-red-400 font-semibold">{error}</p>
                          ) : loading ? (
                            <p className="text-xs text-zinc-500 animate-pulse">Retrieving media asset...</p>
                          ) : null}
                        </div>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-zinc-900">
                        {!url && !loading && (
                          <button
                            type="button"
                            onClick={() => handleFetchPreview(filename)}
                            className="w-full py-1.5 bg-emerald-700/30 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-800/30 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center justify-center space-x-1"
                          >
                            <Eye size={12} />
                            <span>View Media</span>
                          </button>
                        )}
                        {user?.role === 'Admin' && (
                          <button
                            type="button"
                            onClick={() => handleDeleteMedia(filename, media.file_type)}
                            className="w-full py-1.5 bg-red-950/40 hover:bg-red-900/30 text-red-400 border border-red-900/30 rounded-lg text-xs font-semibold transition flex items-center justify-center space-x-1 cursor-pointer"
                          >
                            <Trash2 size={12} />
                            <span>Delete Media</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Load More Media Button Container */}
            {hasMoreMedia ? (
              <div className="pt-4 flex justify-center border-t border-zinc-800">
                <button
                  type="button"
                  onClick={handleLoadMoreMedia}
                  disabled={loadingMore}
                  className="px-6 py-2.5 bg-zinc-850 hover:bg-zinc-800 border border-zinc-750 text-emerald-400 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50 flex items-center space-x-2"
                >
                  {loadingMore ? (
                    <>
                      <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-emerald-400"></div>
                      <span>Loading Next Batch...</span>
                    </>
                  ) : (
                    <span>Load More Uploaded Media ({uploadedMediaList.length} of {totalMediaCount})</span>
                  )}
                </button>
              </div>
            ) : uploadedMediaList.length > 0 ? (
              <div className="pt-3 text-center border-t border-zinc-850">
                <p className="text-[11px] text-zinc-500 font-mono">All uploaded media items loaded ({totalMediaCount} total)</p>
              </div>
            ) : null}
          </div>
          );
        })()}
      </div>
    </div>
  );
}
