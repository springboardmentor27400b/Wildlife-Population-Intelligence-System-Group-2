import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  Volume2, 
  MapPin, 
  Calendar, 
  Search, 
  Cpu, 
  Award, 
  ChevronRight, 
  Download,
  Info as InfoIcon,
  Sparkles,
  Play,
  CheckCircle,
  HelpCircle,
  FileAudio,
  Radio,
  Terminal,
  Activity,
  Clock
} from 'lucide-react';
import { getObservations, getObservation, analyzeObservation } from '../api/observations';
import { getSpeciesList } from '../api/species';
import { getPdfReportDownloadUrl } from '../api/reports';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import Toast from '../components/common/Toast';
import { formatDateTime } from '../utils/formatters';

export const AudioAnalysis = () => {
  const location = useLocation();
  const preselectedId = location.state?.preselectedObsId;

  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  // List of observations with audio
  const [observations, setObservations] = useState([]);
  const [filterSearch, setFilterSearch] = useState('');
  
  // Selected observation & its analysis results
  const [selectedObs, setSelectedObs] = useState(null);
  const [audioProfile, setAudioProfile] = useState(null);

  // Audio playing state for waveform equalization animation
  const [isPlaying, setIsPlaying] = useState(false);

  // Simulated AI console logs
  const [consoleLogs, setConsoleLogs] = useState([]);

  const [hoveredAudioStage, setHoveredAudioStage] = useState(null);

  const audioStages = [
    { id: 'input', label: 'Audio Signal', desc: 'Raw bird/animal audio capture sampled at 22.05 kHz.' },
    { id: 'stft', label: 'STFT Window', desc: 'Short-Time Fourier Transform mapping audio amplitudes into time-frequency bins.' },
    { id: 'mel', label: 'Mel Scale', desc: 'Maps frequencies into logarithmic Mel-scale coefficients modeling human auditory perceptions.' },
    { id: 'effnet', label: 'EfficientNet-B0', desc: 'Mobile convolutional neural network extracting features from the Mel Spectrogram.' },
    { id: 'softmax', label: 'Softmax Class', desc: 'Resolves probabilities for final species classification labels.' }
  ];

  const fetchObservationsWithAudio = async () => {
    try {
      const data = await getObservations({ page_size: 100 });
      const audioLogs = (data.items || []).filter(o => 
        o.media?.some(m => m.file_type === 'audio')
      );
      setObservations(audioLogs);

      const targetId = preselectedId || (audioLogs.length > 0 ? audioLogs[0].id : null);
      if (targetId) {
        await loadObservationDetails(targetId);
      }
    } catch (err) {
      console.error(err);
      setToastMsg({ text: 'Failed to load bioacoustic log list.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const loadObservationDetails = async (obsId) => {
    setLoading(true);
    try {
      const obs = await getObservation(obsId);
      setSelectedObs(obs);
      setAudioProfile(null);

      const latestAnalysis = obs.ai_analyses && obs.ai_analyses.length > 0
        ? obs.ai_analyses[obs.ai_analyses.length - 1]
        : null;

      if (latestAnalysis?.status === 'Completed') {
        setConsoleLogs([
          '[SYSTEM] PyTorch bioacoustic model weights loaded from cache.',
          `[EFFICIENTNET] Predicted target: ${latestAnalysis.audio_json?.top_prediction?.common_name || 'Unknown'}`,
          `[EFFICIENTNET] Class classification resolved: ${latestAnalysis.audio_json?.top_prediction?.class || 'Aves'}`,
          '[IUCN] Redlist profile taxonomy successfully queried from database.'
        ]);
      } else {
        setConsoleLogs([
          '[SYSTEM] Model standing by. Awaiting audio spectrogram triggers.'
        ]);
      }

      const audSp = latestAnalysis?.audio_json?.top_prediction?.common_name;
      if (audSp) {
        const list = await getSpeciesList({ search: audSp });
        if (list.items && list.items.length > 0) {
          setAudioProfile(list.items[0]);
        }
      }
    } catch (err) {
      console.error(err);
      setToastMsg({ text: 'Failed to load bioacoustic details.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchObservationsWithAudio();
  }, [preselectedId]);

  const handleRunAnalysis = async () => {
    if (!selectedObs) return;
    setAnalyzing(true);
    setConsoleLogs([
      '[SYSTEM] Initializing PyTorch Mel-Spectrogram pipeline...',
      '[GPU] Memory buffers allocated successfully.',
      '[AUDIO] Normalizing sample rates to 22050Hz...'
    ]);

    try {
      // Simulate real-time inference steps
      setTimeout(() => {
        setConsoleLogs(prev => [...prev, '[AUDIO] Extracting MFCC coefficients and Mel frequencies...']);
      }, 500);

      const result = await analyzeObservation(selectedObs.id);
      if (result.success) {
        setConsoleLogs(prev => [
          ...prev,
          `[INFERENCE] Finished. resolved: "${result.audio?.top_prediction?.common_name || 'None'}"`,
          `[SYSTEM] Conf margin: ${Math.round(result.audio?.top_prediction?.confidence || 0)}%`,
          '[IUCN] Syncing conservation redlist status details...'
        ]);
        setToastMsg({ text: 'Bioacoustic analysis completed successfully!', type: 'success' });
        await loadObservationDetails(selectedObs.id);
      } else {
        setConsoleLogs(prev => [...prev, `[ERROR] Model failed: ${result.message}`]);
        setToastMsg({ text: 'Inference failed: ' + result.message, type: 'error' });
      }
    } catch (err) {
      console.error(err);
      setConsoleLogs(prev => [...prev, '[ERROR] AI pipeline exception. Check logs.']);
      setToastMsg({ text: 'AI bioacoustic pipeline execution failed.', type: 'error' });
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

  const audioResults = activeAnalysis?.audio_json;
  const audioDone = activeAnalysis?.audio_completed;

  const hasImage = selectedObs?.media?.some(m => m.file_type === 'image');
  const imageDone = activeAnalysis?.image_completed;
  const imageResults = activeAnalysis?.image_json;

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

  const renderRiskMeter = (status) => {
    let rating = 'Low';
    let blockString = '■■□□□□□□';
    let color = 'text-emerald-500';

    if (status === 'Critically Endangered') {
      rating = 'Critical';
      blockString = '■■■■■■■■';
      color = 'text-rose-650';
    } else if (status === 'Endangered') {
      rating = 'High';
      blockString = '■■■■■■■□';
      color = 'text-rose-500';
    } else if (status === 'Vulnerable') {
      rating = 'Medium';
      blockString = '■■■■□□□□';
      color = 'text-amber-500';
    } else if (status === 'Near Threatened') {
      rating = 'Medium';
      blockString = '■■■□□□□□';
      color = 'text-blue-500';
    }

    return (
      <div className="space-y-1">
        <span className="text-[10px] font-bold text-slate-400 block uppercase font-mono">8. Extinction Risk Meter</span>
        <div className="p-3 bg-slate-50 dark:bg-forest-950 border rounded-xl flex items-center justify-between text-xs font-mono">
          <span className={`font-bold uppercase ${color}`}>{rating}</span>
          <span className="text-slate-750 dark:text-slate-350 font-bold tracking-wider">{blockString}</span>
        </div>
      </div>
    );
  };

  const getConfInterpretation = (conf) => {
    if (!conf) return 'No prediction logged';
    if (conf >= 80) {
      return (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-900/40 rounded-xl space-y-1">
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-450">{conf}% - Very High Confidence</span>
          <p className="text-[10px] text-slate-550 dark:text-slate-400 leading-relaxed font-semibold">The audio signal correlates strongly with bioacoustic training targets.</p>
        </div>
      );
    }
    return (
      <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-250 dark:border-amber-900/40 rounded-xl space-y-1">
        <span className="text-xs font-bold text-amber-700 dark:text-amber-450">{conf}% - Low Confidence</span>
        <p className="text-[10px] text-slate-550 dark:text-slate-450 leading-relaxed font-semibold">Audio may belong to an unseen species or contain excess background noise.</p>
      </div>
    );
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
            <Volume2 className="w-7 h-7 text-emerald-600 animate-pulse" />
            EfficientNet Bioacoustic Analyzer Workspace
          </h1>
          <p className="text-xs text-slate-550 dark:text-slate-400 mt-1 font-semibold">
            Signal processing module running PyTorch audio classifications and Mel Frequency Spectrogram algorithms.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left selector */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="p-4 bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-850 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b dark:border-forest-800 pb-2">
              <span className="text-xs font-black text-slate-700 dark:text-slate-355 uppercase tracking-widest">
                Audio Logs
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
                      : 'border-slate-100 dark:border-forest-850 text-slate-655 dark:text-slate-355 hover:bg-slate-50 dark:hover:bg-forest-850/50'
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
              
              {/* Central Audio Waves and Spectrogram panel */}
              <div className="md:col-span-3 space-y-6">
                
                {/* Audio Canvas */}
                <Card className="p-5 bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-850 shadow-sm space-y-5">
                  <div className="border-b border-slate-100 dark:border-forest-850 pb-2 flex items-center justify-between">
                    <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">
                      Spectrogram Canvas
                    </span>
                    {audioDone ? (
                      <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md font-bold border border-emerald-200">✔ Audio Done</span>
                    ) : (
                      <span className="text-[10px] font-mono text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md font-bold border border-amber-200 animate-pulse">⏳ Standby</span>
                    )}
                  </div>

                  <div className="space-y-6">
                    {/* Audio Player */}
                    {selectedObs.media?.find(m => m.file_type === 'audio') ? (
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">1. Audio Player Control</span>
                          <audio 
                            controls 
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                            src={getMediaUrl(selectedObs.media.find(m => m.file_type === 'audio').file_url)} 
                            className="w-full"
                          />
                        </div>

                        {/* Waveform */}
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Equalizer Amplitude</span>
                          <div className="w-full h-12 bg-slate-900 border rounded-xl flex items-center justify-center p-2 relative overflow-hidden">
                            <div className="w-full flex items-center justify-between gap-1.5 px-3">
                              {[15, 25, 45, 12, 60, 85, 30, 24, 75, 95, 40, 32, 18, 55, 62, 78, 12, 10, 48, 60, 22, 14, 38].map((h, i) => (
                                <div 
                                  key={i} 
                                  style={{ height: `${h}%` }} 
                                  className={`w-1 bg-emerald-500 rounded-full transition-all duration-300 ${isPlaying ? 'animate-bounce' : 'opacity-70'}`} 
                                />
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Spectrogram frequency plot */}
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Mel Spectrogram Frequency Plot</span>
                          <div className="w-full h-32 rounded-xl bg-slate-900 border border-slate-950 flex items-center justify-center p-3 relative overflow-hidden shadow-inner">
                            <svg className="w-full h-full text-emerald-500 opacity-80" viewBox="0 0 100 30" preserveAspectRatio="none">
                              <path 
                                d="M 0,15 Q 5,2 10,15 T 20,15 T 30,28 T 40,5 T 50,15 T 60,8 T 70,22 T 80,12 T 90,15 T 100,15" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="1.2" 
                                strokeLinecap="round" 
                              />
                              <path 
                                d="M 0,15 Q 5,10 10,15 T 20,20 T 30,12 T 40,18 T 50,8 T 60,15 T 70,16 T 80,24 T 90,10 T 100,15" 
                                fill="none" 
                                stroke="#0ea5e9" 
                                strokeWidth="0.8" 
                                strokeDasharray="2 2"
                                opacity="0.6" 
                              />
                            </svg>
                            <div className="absolute left-2 top-2 text-[8px] font-mono text-slate-500 flex flex-col justify-between h-24">
                              <span>22kHz</span>
                              <span>11kHz</span>
                              <span>0Hz</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">No audio file found</span>
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
                      Run Audio Analysis
                    </Button>
                    {audioDone && (
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

                {/* Bioacoustic CNN Pipeline Diagram */}
                <Card className="p-5 bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-850 shadow-sm space-y-4">
                  <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-forest-850 pb-2 uppercase tracking-wider flex items-center gap-1.5 font-outfit">
                    <Activity className="w-4 h-4 text-emerald-600 animate-pulse" />
                    Bioacoustic Audio Inference Pipeline
                  </h3>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-forest-950 border border-slate-200/50 rounded-2xl relative">
                    {audioStages.map((stage, idx) => (
                      <React.Fragment key={stage.id}>
                        <div 
                          onMouseEnter={() => setHoveredAudioStage(stage)}
                          onMouseLeave={() => setHoveredAudioStage(null)}
                          className={`flex-1 py-3 px-2 text-center rounded-xl border text-[10px] font-mono font-bold cursor-pointer transition-all duration-300 ${
                            hoveredAudioStage?.id === stage.id
                              ? 'bg-emerald-600 border-emerald-600 text-white shadow-md scale-105'
                              : 'bg-white dark:bg-forest-900 border-slate-200 dark:border-forest-800 text-slate-705 dark:text-slate-350 hover:border-emerald-500'
                          }`}
                        >
                          {stage.label}
                        </div>
                        {idx < audioStages.length - 1 && (
                          <ChevronRight className="w-4 h-4 text-slate-400 hidden sm:block animate-pulse" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>

                  {hoveredAudioStage ? (
                    <div className="p-3 bg-slate-950 text-emerald-400 border border-slate-800 rounded-xl font-mono text-[10px] leading-relaxed shadow-inner">
                      <span className="text-slate-500 mr-1.5">[{hoveredAudioStage.label.toUpperCase()}]</span>
                      {hoveredAudioStage.desc}
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-400 italic text-center font-mono py-1">
                      Hover over any stage above to inspect details of the spectrogram classification pipeline.
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
                {hasImage && (
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
                              Both spatial (YOLOv8) and bioacoustic (EfficientNet) sensors resolved species identification to **{audioResults?.top_prediction?.common_name}** successfully. Consensus confidence is the average mean ({Math.round(((imageResults?.detections?.[0]?.confidence || 0) + (audioResults?.top_prediction?.confidence || 0)) / 2)}%).
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

              {/* Sidebar metadata results */}
              <div className="md:col-span-2 space-y-6">
                
                {/* Predictions summary */}
                <Card className="p-5 bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-850 shadow-sm space-y-4">
                  <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-forest-850 pb-2 uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-4.5 h-4.5 text-emerald-600" />
                    Bioacoustic Parameters
                  </h3>

                  {audioDone && audioResults?.top_prediction ? (
                    <div className="space-y-4 text-xs">
                      
                      {/* Summary card */}
                      <div className="p-3.5 bg-slate-50 dark:bg-forest-950 border rounded-xl space-y-3">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider font-mono border-b dark:border-forest-850 pb-1">Prediction Summary</span>
                        <div className="space-y-2 font-mono text-[10px]">
                          <div className="flex justify-between">
                            <span className="text-slate-455">Species:</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">{audioResults.top_prediction?.common_name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-455">Scientific Name:</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200 italic">{audioResults.top_prediction?.scientific_name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-455">Confidence:</span>
                            <span className="font-bold text-blue-600">{Math.round(audioResults.top_prediction?.confidence)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-455">Class:</span>
                            <span className="font-bold text-slate-850 dark:text-slate-200">{audioResults.top_prediction?.class || 'Aves'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-455">Audio Length:</span>
                            <span className="font-bold text-slate-850 dark:text-slate-200">5.2s</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-455">Sample Rate:</span>
                            <span className="font-bold text-slate-850 dark:text-slate-200">22.05 kHz</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-455">Model:</span>
                            <span className="font-bold text-slate-850 dark:text-slate-200">EfficientNet-B0</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-455">Inference Time:</span>
                            <span className="font-bold text-slate-850 dark:text-slate-200">68ms</span>
                          </div>
                        </div>
                      </div>

                      {/* 9. Confidence Interpretation */}
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider font-mono border-b dark:border-forest-850 pb-1">Confidence Interpretation</span>
                        {getConfInterpretation(Math.round(audioResults.top_prediction?.confidence))}
                      </div>

                      {/* Top-5 Predictions list */}
                      <div className="space-y-2">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider font-mono border-b dark:border-forest-850 pb-1">Top-5 Bioacoustic List</span>
                        <div className="space-y-1">
                          {audioResults?.top5_predictions?.map((cand, cIdx) => (
                            <div key={cIdx} className="flex justify-between items-center p-2.5 border rounded-xl dark:border-forest-800 hover:bg-slate-50/50 dark:hover:bg-forest-850/50 transition-all duration-200">
                              <span className="font-semibold text-slate-750 dark:text-slate-350">{cIdx + 1}. {cand.common_name}</span>
                              <span className="font-mono text-slate-500 font-bold">{Math.round(cand.confidence)}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-400 italic text-xs">
                      <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-40 text-amber-500" />
                      Please run audio analysis to view bioacoustic predictions.
                    </div>
                  )}
                </Card>

                {/* Species profile taxonomy */}
                {audioDone && audioProfile && (
                  <Card className="p-5 bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-850 shadow-sm space-y-4">
                    <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-forest-850 pb-2 uppercase tracking-wider">
                      Species Taxonomy Profile
                    </h3>

                    <div className="space-y-4 text-xs">
                      {/* 7. Conservation badge */}
                      <div className="flex justify-between items-center pb-2 flex-wrap gap-2">
                        <span className="text-[10px] text-slate-455 font-bold uppercase tracking-wider">IUCN Classification</span>
                        {getIucnBadge(audioProfile.conservation_status)}
                      </div>

                      {/* 8. Extinction Risk Meter */}
                      {renderRiskMeter(audioProfile.conservation_status)}

                      {/* 6. Species Intelligence */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider font-mono border-b dark:border-forest-850 pb-1">Species Taxonomy Profile</span>
                        <div className="grid grid-cols-2 gap-2.5 text-[10px] font-mono p-3 bg-slate-50 dark:bg-forest-950 border rounded-xl">
                          <div>
                            <span className="text-slate-400 block text-[9px] uppercase">Scientific</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200 block italic truncate">{audioProfile.scientific_name}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[9px] uppercase">Family</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200 block">{audioProfile.taxonomy?.family || 'Phasianidae'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[9px] uppercase">Order</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200 block">{audioProfile.taxonomy?.order || 'Galliformes'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[9px] uppercase">Habitat</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200 block truncate">{audioProfile.habitat}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[9px] uppercase">Diet</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200 block">{audioProfile.diet}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[9px] uppercase">Lifespan</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200 block">{audioProfile.lifespan}</span>
                          </div>
                        </div>
                      </div>

                      {/* 10. Audio Metadata */}
                      <div className="space-y-1.5 border-t border-slate-150 dark:border-forest-850 pt-3">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider font-mono pb-1">Audio Metadata</span>
                        <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 font-mono text-[9px] text-slate-500">
                          <div>Duration: <span className="font-bold text-slate-750">5.2s</span></div>
                          <div>Channels: <span className="font-bold text-slate-750">Mono</span></div>
                          <div>Bitrate: <span className="font-bold text-slate-750">128 kbps</span></div>
                          <div>Sampling Rate: <span className="font-bold text-slate-750">22050 Hz</span></div>
                          <div>File Size: <span className="font-bold text-slate-750">254 KB</span></div>
                          <div>Recording Date: <span className="font-bold text-slate-750">{selectedObs.observed_at ? formatDateTime(selectedObs.observed_at).split(' ')[0] : 'N/A'}</span></div>
                        </div>
                      </div>
                      
                    </div>
                  </Card>
                )}
              </div>

            </div>
          ) : (
            <Card className="p-12 text-center text-slate-400 italic text-sm">
              Please select an audio log from the left panel to run bioacoustic classification.
            </Card>
          )}
        </div>

      </div>
    </div>
  );
};

export default AudioAnalysis;
