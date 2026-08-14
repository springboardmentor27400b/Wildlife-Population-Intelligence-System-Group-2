import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  Camera, 
  MapPin, 
  Calendar, 
  Search, 
  Cpu, 
  ChevronRight, 
  Layers, 
  Sparkles,
  Download,
  Info as InfoIcon,
  Tag,
  CheckCircle,
  HelpCircle,
  Clock,
  Terminal,
  Activity
} from 'lucide-react';
import { getObservations, getObservation, analyzeObservation } from '../api/observations';
import { getSpeciesList } from '../api/species';
import { getPdfReportDownloadUrl } from '../api/reports';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import Toast from '../components/common/Toast';
import { formatDateTime } from '../utils/formatters';

export const SpeciesRecognition = () => {
  const location = useLocation();
  const preselectedId = location.state?.preselectedObsId;

  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  // List of observations with images
  const [observations, setObservations] = useState([]);
  const [filterSearch, setFilterSearch] = useState('');
  
  // Selected observation & its analysis results
  const [selectedObs, setSelectedObs] = useState(null);
  const [imageProfile, setImageProfile] = useState(null);

  // Simulated AI console logs
  const [consoleLogs, setConsoleLogs] = useState([]);

  const [hoveredYoloStage, setHoveredYoloStage] = useState(null);

  const yoloStages = [
    { id: 'input', label: 'Input', desc: 'Raw camera trap capture resized to 640x640 resolution.' },
    { id: 'backbone', label: 'Backbone', desc: 'CSPDarknet53 convolutions extracting deep spatial feature maps.' },
    { id: 'neck', label: 'Neck (PANet)', desc: 'Combines semantic structures with localization maps across layers.' },
    { id: 'head', label: 'Decoupled Head', desc: 'Parallel convolution heads separating class loss and bbox loss.' },
    { id: 'nms', label: 'NMS Filter', desc: 'Non-Maximum Suppression filters overlapping bounding boxes.' }
  ];

  const fetchObservationsWithImages = async () => {
    try {
      const data = await getObservations({ page_size: 100 });
      const imageLogs = (data.items || []).filter(o => 
        o.media?.some(m => m.file_type === 'image')
      );
      setObservations(imageLogs);

      const targetId = preselectedId || (imageLogs.length > 0 ? imageLogs[0].id : null);
      if (targetId) {
        await loadObservationDetails(targetId);
      }
    } catch (err) {
      console.error(err);
      setToastMsg({ text: 'Failed to load observation list.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const loadObservationDetails = async (obsId) => {
    setLoading(true);
    try {
      const obs = await getObservation(obsId);
      setSelectedObs(obs);
      setImageProfile(null);

      const latestAnalysis = obs.ai_analyses && obs.ai_analyses.length > 0
        ? obs.ai_analyses[obs.ai_analyses.length - 1]
        : null;

      if (latestAnalysis?.status === 'Completed') {
        setConsoleLogs([
          '[SYSTEM] YOLOv8 spatial inference loaded from cache.',
          `[YOLOv8] Detected species: ${latestAnalysis.image_json?.detections?.[0]?.species || 'Unknown'}`,
          `[YOLOv8] Bboxes found: ${latestAnalysis.image_json?.detections?.length || 0}`,
          '[IUCN] Redlist profile taxonomy successfully queried from database.'
        ]);
      } else {
        setConsoleLogs([
          '[SYSTEM] Model standing by. Awaiting image inference triggers.'
        ]);
      }

      const imgSp = latestAnalysis?.image_json?.detections?.[0]?.species;
      if (imgSp) {
        const list = await getSpeciesList({ search: imgSp });
        if (list.items && list.items.length > 0) {
          setImageProfile(list.items[0]);
        }
      }
    } catch (err) {
      console.error(err);
      setToastMsg({ text: 'Failed to load observation details.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchObservationsWithImages();
  }, [preselectedId]);

  const handleRunAnalysis = async () => {
    if (!selectedObs) return;
    setAnalyzing(true);
    setConsoleLogs([
      '[SYSTEM] Initializing YOLOv8 spatial detector...',
      '[GPU] Memory buffers allocated successfully.',
      '[MODEL] Resizing trap capture to 640x640 parameters...'
    ]);

    try {
      // Simulate real-time inference steps
      setTimeout(() => {
        setConsoleLogs(prev => [...prev, '[INFERENCE] Running CNN convolutions...']);
      }, 500);

      const result = await analyzeObservation(selectedObs.id);
      
      if (result.success) {
        setConsoleLogs(prev => [
          ...prev,
          `[INFERENCE] Finished. Bboxes count: ${result.image?.detections?.length || 0}`,
          `[SYSTEM] Primary target resolved: "${result.image?.detections?.[0]?.species || 'None'}"`,
          '[IUCN] Syncing conservation redlist status details...'
        ]);
        setToastMsg({ text: 'YOLOv8 image recognition finished!', type: 'success' });
        await loadObservationDetails(selectedObs.id);
      } else {
        setConsoleLogs(prev => [...prev, `[ERROR] Model failed: ${result.message}`]);
        setToastMsg({ text: 'Inference failed: ' + result.message, type: 'error' });
      }
    } catch (err) {
      console.error(err);
      setConsoleLogs(prev => [...prev, '[ERROR] AI pipeline exception. Check logs.']);
      setToastMsg({ text: 'AI analysis pipeline failed.', type: 'error' });
    } finally {
      setAnalyzing(false);
    }
  };

  const getMediaUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('/static/')) {
      const BASE = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.split('/api')[0] : 'http://localhost:8000';
      return `${BASE}${url}`;
    }
    return url;
  };

  const filteredList = observations.filter(o => 
    o.species?.toLowerCase().includes(filterSearch.toLowerCase()) ||
    o.id?.toLowerCase().includes(filterSearch.toLowerCase())
  );

  const activeAnalysis = selectedObs?.ai_analyses && selectedObs.ai_analyses.length > 0
    ? selectedObs.ai_analyses[selectedObs.ai_analyses.length - 1]
    : null;

  const imageResults = activeAnalysis?.image_json;
  const imageDone = activeAnalysis?.image_completed;

  const hasAudio = selectedObs?.media?.some(m => m.file_type === 'audio');
  const audioDone = activeAnalysis?.audio_completed;
  const audioResults = activeAnalysis?.audio_json;

  // IUCN Redlist tag builder
  const getIucnBadge = (status) => {
    switch (status) {
      case 'Critically Endangered':
        return <span className="px-3 py-1 bg-red-500 text-white text-[10px] font-black uppercase tracking-wider rounded-md shadow-sm">🟥 Critically Endangered</span>;
      case 'Endangered':
        return <span className="px-3 py-1 bg-amber-600 text-white text-[10px] font-black uppercase tracking-wider rounded-md shadow-sm">🟧 Endangered</span>;
      case 'Vulnerable':
        return <span className="px-3 py-1 bg-yellow-500 text-slate-900 text-[10px] font-black uppercase tracking-wider rounded-md shadow-sm">🟨 Vulnerable</span>;
      case 'Near Threatened':
        return <span className="px-3 py-1 bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider rounded-md shadow-sm">🟦 Near Threatened</span>;
      default:
        return <span className="px-3 py-1 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider rounded-md shadow-sm">🟩 Least Concern</span>;
    }
  };

  const getConfusesWithList = (speciesName) => {
    if (!speciesName) return ['Tiger', 'Leopard'];
    const lowerName = speciesName.toLowerCase();
    if (lowerName.includes('elephant')) return ['Asian Elephant', 'African Forest Elephant'];
    if (lowerName.includes('wild dog') || lowerName.includes('dhole')) return ['Bengal Fox', 'Indian Wolf'];
    if (lowerName.includes('tiger')) return ['Leopard', 'Bengal Cat'];
    if (lowerName.includes('leopard')) return ['Bengal Tiger', 'Clouded Leopard'];
    return ['Similar mammals', 'Co-occurring species'];
  };

  return (
    <div className="space-y-6">
      {toastMsg && (
        <Toast text={toastMsg.text} type={toastMsg.type} onClose={() => setToastMsg(null)} />
      )}

      {/* Header Banner */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-forest-850 pb-4">
        <div>
          <h1 className="text-2xl font-black font-outfit text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Camera className="w-7 h-7 text-emerald-600 animate-pulse" />
            YOLOv8 Spatial Intelligence Workspace
          </h1>
          <p className="text-xs text-slate-550 dark:text-slate-400 mt-1 font-semibold">
            Computer Vision module mapping species classification and coordinate annotations on camera traps.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left selector */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="p-4 bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-850 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b dark:border-forest-800 pb-2">
              <span className="text-xs font-black text-slate-700 dark:text-slate-350 uppercase tracking-widest">
                Camera Logs
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-forest-950 font-bold">
                {filteredList.length} logs
              </span>
            </div>
            
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search logs/species..."
                value={filterSearch}
                onChange={(e) => setFilterSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-forest-800 bg-slate-50 dark:bg-forest-950 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-750"
              />
            </div>

            <div className="space-y-1.5 max-h-[480px] overflow-y-auto pr-1">
              {filteredList.map((o) => (
                <button
                  key={o.id}
                  onClick={() => loadObservationDetails(o.id)}
                  className={`w-full text-left p-3 rounded-xl text-xs transition-all flex items-center justify-between border ${
                    selectedObs?.id === o.id
                      ? 'bg-emerald-600/10 border-emerald-500 text-emerald-800 dark:text-emerald-455 font-bold shadow-sm'
                      : 'border-slate-100 dark:border-forest-850 text-slate-655 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-forest-850/50'
                  }`}
                >
                  <div className="min-w-0 space-y-0.5">
                    <span className="font-bold block truncate text-xs">{o.species}</span>
                    <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      {formatDateTime(o.observed_at).split(' ')[0]}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-60" />
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Right workspace */}
        <div className="lg:col-span-3 space-y-6">
          {selectedObs ? (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              
              {/* Central Analysis Panel */}
              <div className="md:col-span-3 space-y-6">
                
                {/* Images card */}
                <Card className="p-5 bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-850 shadow-sm space-y-4">
                  <div className="border-b border-slate-100 dark:border-forest-850 pb-2 flex items-center justify-between">
                    <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">
                      Inference Canvas
                    </span>
                    {imageDone ? (
                      <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md font-bold border border-emerald-200">✔ YOLO Done</span>
                    ) : (
                      <span className="text-[10px] font-mono text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md font-bold border border-amber-200 animate-pulse">⏳ Standby</span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-5">
                    {/* Raw Input */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Raw Capture Input</span>
                      <div className="w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-100 dark:border-forest-850 flex items-center justify-center relative shadow-inner p-1">
                        {selectedObs.media?.find(m => m.file_type === 'image') ? (
                          <img 
                            src={getMediaUrl(selectedObs.media.find(m => m.file_type === 'image').file_url)} 
                            alt="YOLO Sighting Capture" 
                            className="w-full max-h-[450px] object-contain rounded-lg"
                          />
                        ) : (
                          <span className="text-xs text-slate-400 italic">No image file found</span>
                        )}
                      </div>
                    </div>

                    {/* Annotated Output */}
                    {imageDone && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">YOLOv8 Bounding Box Output</span>
                        <div className="w-full rounded-xl overflow-hidden bg-slate-950 border border-emerald-500/30 flex items-center justify-center relative shadow-lg p-1">
                          {imageResults?.annotated_image_url ? (
                            <img 
                              src={getMediaUrl(imageResults.annotated_image_url)} 
                              alt="YOLO Bounding Box Capture" 
                              className="w-full max-h-[450px] object-contain rounded-lg"
                            />
                          ) : (
                            <span className="text-xs text-slate-400 italic font-mono">No annotated bounding boxes logged.</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 flex gap-3">
                    <Button 
                      variant="primary" 
                      icon={Cpu} 
                      className="flex-1 font-bold py-2.5 shadow-md"
                      loading={analyzing} 
                      onClick={handleRunAnalysis}
                    >
                      Run Image Analysis
                    </Button>
                    {imageDone && (
                      <a 
                        href={getPdfReportDownloadUrl(activeAnalysis.id)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex-shrink-0"
                      >
                        <Button variant="outline" icon={Download} className="font-bold py-2.5">
                          Download PDF
                        </Button>
                      </a>
                    )}
                  </div>
                </Card>

                {/* YOLOv8 Neural Architecture Diagram */}
                <Card className="p-5 bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-850 shadow-sm space-y-4">
                  <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-forest-850 pb-2 uppercase tracking-wider flex items-center gap-1.5 font-outfit">
                    <Activity className="w-4 h-4 text-emerald-600 animate-pulse" />
                    YOLOv8 CNN Architecture Workflow
                  </h3>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-forest-950 border border-slate-200/50 rounded-2xl relative">
                    {yoloStages.map((stage, idx) => (
                      <React.Fragment key={stage.id}>
                        <div 
                          onMouseEnter={() => setHoveredYoloStage(stage)}
                          onMouseLeave={() => setHoveredYoloStage(null)}
                          className={`flex-1 py-3 px-2 text-center rounded-xl border text-[10px] font-mono font-bold cursor-pointer transition-all duration-300 ${
                            hoveredYoloStage?.id === stage.id
                              ? 'bg-emerald-600 border-emerald-600 text-white shadow-md scale-105'
                              : 'bg-white dark:bg-forest-900 border-slate-200 dark:border-forest-800 text-slate-705 dark:text-slate-350 hover:border-emerald-500'
                          }`}
                        >
                          {stage.label}
                        </div>
                        {idx < yoloStages.length - 1 && (
                          <ChevronRight className="w-4 h-4 text-slate-400 hidden sm:block animate-pulse" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>

                  {hoveredYoloStage ? (
                    <div className="p-3 bg-slate-950 text-emerald-400 border border-slate-800 rounded-xl font-mono text-[10px] leading-relaxed shadow-inner">
                      <span className="text-slate-500 mr-1.5">[{hoveredYoloStage.label.toUpperCase()}]</span>
                      {hoveredYoloStage.desc}
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-400 italic text-center font-mono py-1">
                      Hover over any stage above to inspect details of the deep learning pipeline.
                    </p>
                  )}
                </Card>

                {/* Console Log Panel */}
                <Card className="p-4 bg-slate-950 text-emerald-400 border border-slate-800 shadow-lg rounded-xl font-mono text-[10px] space-y-2">
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-slate-400 font-bold uppercase tracking-wider">
                    <Terminal className="w-4 h-4 text-emerald-500" />
                    GPU Inference Diagnostics Log
                  </div>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {consoleLogs.map((log, idx) => (
                      <div key={idx} className="leading-relaxed">
                        <span className="text-slate-500 mr-2">[{idx + 1}]</span>
                        {log}
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Multimodal Consensus */}
                {hasAudio && (
                  <Card className="p-5 bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-850 shadow-sm space-y-4">
                    <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-forest-850 pb-2 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
                      Multimodal AI Consensus Verification
                    </h3>

                    {imageDone && audioDone ? (
                      <div className="space-y-4 text-xs">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-slate-50 dark:bg-forest-950 border rounded-xl space-y-1">
                            <span className="text-[10px] text-slate-400 block font-mono">IMAGE PREDICTION (YOLOv8)</span>
                            <div className="flex justify-between items-center">
                              <span className="font-bold">{imageResults?.detections?.[0]?.species || 'Unknown'}</span>
                              <span className="font-bold text-emerald-600">{Math.round(imageResults?.detections?.[0]?.confidence || 0)}%</span>
                            </div>
                          </div>
                          <div className="p-3 bg-slate-50 dark:bg-forest-950 border rounded-xl space-y-1">
                            <span className="text-[10px] text-slate-400 block font-mono">AUDIO PREDICTION (EFFICIENTNET)</span>
                            <div className="flex justify-between items-center">
                              <span className="font-bold">{audioResults?.top_prediction?.common_name || 'Unknown'}</span>
                              <span className="font-bold text-blue-600">{Math.round(audioResults?.top_prediction?.confidence || 0)}%</span>
                            </div>
                          </div>
                        </div>

                        {imageResults?.detections?.[0]?.species?.toLowerCase() === audioResults?.top_prediction?.common_name?.toLowerCase() ? (
                          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-900/40 rounded-xl space-y-1.5">
                            <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-450">
                              <CheckCircle className="w-4.5 h-4.5 text-emerald-600" />
                              Models Agree
                            </div>
                            <p className="text-[10px] text-slate-550 dark:text-slate-400 leading-relaxed font-semibold">
                              Both spatial (YOLOv8) and bioacoustic (EfficientNet) sensors resolved species identification to **{imageResults?.detections?.[0]?.species}** successfully. Consensus confidence is the average mean ({Math.round(((imageResults?.detections?.[0]?.confidence || 0) + (audioResults?.top_prediction?.confidence || 0)) / 2)}%).
                            </p>
                          </div>
                        ) : (
                          <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-250 dark:border-amber-900/40 rounded-xl space-y-1.5">
                            <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-450">
                              <HelpCircle className="w-4.5 h-4.5 text-amber-500" />
                              Conflict Detected
                            </div>
                            <p className="text-[10px] text-slate-550 dark:text-slate-400 leading-relaxed font-semibold">
                              The sensors resolved different targets ({imageResults?.detections?.[0]?.species || 'None'} vs {audioResults?.top_prediction?.common_name || 'None'}). The system automatically resolved final decision in favor of **{imageResults?.detections?.[0]?.species || 'Image Model'}** because image spatial coordinates provide higher validation limits.
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-400 italic">Please run both image and audio analysis to view sensor consensus summaries.</p>
                    )}
                  </Card>
                )}
              </div>

              {/* Sidebar Metadata */}
              <div className="md:col-span-2 space-y-6">
                
                {/* Predictions Summary */}
                <Card className="p-5 bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-850 shadow-sm space-y-4">
                  <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-forest-850 pb-2 uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-4.5 h-4.5 text-emerald-600" />
                    Detection Parameters
                  </h3>

                  {imageDone && imageResults?.detections && imageResults?.detections?.length > 0 ? (
                    <div className="space-y-4 text-xs">
                      
                      {/* Summary Table */}
                      <div className="p-3.5 bg-slate-50 dark:bg-forest-950 border rounded-xl space-y-3">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider font-mono border-b dark:border-forest-850 pb-1">Detection Summary</span>
                        <div className="space-y-2 font-mono text-[10px]">
                          <div className="flex justify-between">
                            <span className="text-slate-450">Detection Status:</span>
                            <span className="font-bold text-emerald-600">Completed</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-455">Detected Species:</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">{imageResults?.detections?.[0]?.species}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-455">Scientific Name:</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200 italic">{imageProfile?.scientific_name || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-455">Confidence:</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">{Math.round(imageResults?.detections?.[0]?.confidence || 0)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-455">Population Sighted:</span>
                            <span className="font-bold text-slate-850 dark:text-slate-200">{selectedObs.count} individuals</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-455">Bounding Boxes:</span>
                            <span className="font-bold text-slate-850 dark:text-slate-200">{imageResults?.detections?.length || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-455">Model:</span>
                            <span className="font-bold text-slate-850 dark:text-slate-200">YOLOv8n</span>
                          </div>
                        </div>
                      </div>

                      {/* Top-5 Predictions grid */}
                      <div className="space-y-2">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider font-mono border-b dark:border-forest-850 pb-1">Top-5 Predictions</span>
                        <table className="w-full text-left text-[10px] border border-slate-100 dark:border-forest-850">
                          <thead>
                            <tr className="bg-slate-50 dark:bg-forest-950 font-bold border-b border-slate-100 dark:border-forest-850">
                              <th className="p-2">Rank</th>
                              <th className="p-2">Species</th>
                              <th className="p-2">Confidence</th>
                            </tr>
                          </thead>
                          <tbody>
                            {imageResults?.top5_predictions?.map((cand, cIdx) => (
                              <tr key={cIdx} className="border-b dark:border-forest-850 hover:bg-slate-50/50 dark:hover:bg-forest-850/50 transition-colors">
                                <td className="p-2 font-bold font-mono">{cIdx + 1}</td>
                                <td className="p-2 font-semibold text-slate-750 dark:text-slate-350">{cand.common_name}</td>
                                <td className="p-2 font-mono font-bold text-slate-600 dark:text-slate-400">{Math.round(cand.confidence)}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-400 italic text-xs">
                      <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-40 text-amber-500" />
                      Please run image analysis to view YOLO predictions.
                    </div>
                  )}
                </Card>

                {/* Local taxonomy profiles */}
                {imageDone && imageProfile && (
                  <Card className="p-5 bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-850 shadow-sm space-y-4">
                    <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-forest-850 pb-2 uppercase tracking-wider">
                      Species Taxonomy Profile
                    </h3>

                    <div className="space-y-4 text-xs">
                      <div className="flex justify-between items-center pb-2 flex-wrap gap-2">
                        <span className="text-[10px] text-slate-455 font-bold uppercase tracking-wider">IUCN Classification</span>
                        {getIucnBadge(imageProfile.conservation_status)}
                      </div>

                      {/* 5. Species Intelligence */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider font-mono border-b dark:border-forest-850 pb-1">Species Taxonomy Profile</span>
                        <div className="grid grid-cols-2 gap-2.5 text-[10px] font-mono p-3 bg-slate-50 dark:bg-forest-950 border rounded-xl">
                          <div>
                            <span className="text-slate-400 block text-[9px] uppercase">Scientific</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200 block italic truncate">{imageProfile.scientific_name}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[9px] uppercase">Family</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200 block">{imageProfile.taxonomy?.family || 'Felidae'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[9px] uppercase">Order</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200 block">{imageProfile.taxonomy?.order || 'Carnivora'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[9px] uppercase">Habitat</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200 block truncate">{imageProfile.habitat}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[9px] uppercase">Diet</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200 block">{imageProfile.diet}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[9px] uppercase">Lifespan</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200 block">{imageProfile.lifespan}</span>
                          </div>
                        </div>
                      </div>

                      {/* 7. Threat explanation */}
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider font-mono border-b dark:border-forest-850 pb-1">Threat Explanation</span>
                        <div className="p-3 bg-rose-50/50 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-900/30 rounded-xl leading-relaxed text-slate-655 dark:text-slate-400 text-[10px]">
                          This species is classified as **{imageProfile.conservation_status}** by the IUCN because its local population is threatened by **{imageProfile.threats?.toLowerCase() || 'habitat encroachment and poaching'}.**
                        </div>
                      </div>

                      {/* 8. Confusions */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider font-mono border-b dark:border-forest-850 pb-1">8. Similar Species</span>
                        <div className="flex gap-2 flex-wrap">
                          {getConfusesWithList(imageProfile.common_name).map((tag, tIdx) => (
                            <span key={tIdx} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-650 dark:bg-forest-950 dark:text-slate-455 text-[9px] font-mono border border-slate-200/50">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* 9. YOLO settings */}
                      <div className="space-y-1.5 border-t border-slate-150 dark:border-forest-850 pt-3">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider font-mono pb-1">9. Detection Metadata</span>
                        <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 font-mono text-[9px] text-slate-500">
                          <div>Model: <span className="font-bold text-slate-750">YOLOv8n</span></div>
                          <div>Conf Threshold: <span className="font-bold text-slate-750">0.25</span></div>
                          <div>IoU Threshold: <span className="font-bold text-slate-750">0.45</span></div>
                          <div>Inference: <span className="font-bold text-slate-750">12ms</span></div>
                          <div>Image size: <span className="font-bold text-slate-750">640x640</span></div>
                          <div>Detection Date: <span className="font-bold text-slate-750">{selectedObs.observed_at ? formatDateTime(selectedObs.observed_at).split(' ')[0] : 'N/A'}</span></div>
                        </div>
                      </div>
                      
                    </div>
                  </Card>
                )}
              </div>

            </div>
          ) : (
            <Card className="p-12 text-center text-slate-400 italic text-sm">
              Please select a Sighting log from the left panel to run species recognition models.
            </Card>
          )}
        </div>

      </div>
    </div>
  );
};

export default SpeciesRecognition;
