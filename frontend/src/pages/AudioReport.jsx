import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Cpu, AlertTriangle, CheckCircle, FileAudio, FileText, Info, BarChart, Clock, BarChart3, HelpCircle, Download, Loader2 } from 'lucide-react';
import { reportsAPI } from '../services/api';

export default function AudioReport() {
  const location = useLocation();
  const navigate = useNavigate();
  const { result, audioUrl, filename } = location.state || {};
  const [downloading, setDownloading] = useState(false);

  const handleReturn = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/audio-analysis');
    }
  };

  const handleDownloadPDF = async () => {
    if (!result) return;
    setDownloading(true);
    try {
      const blob = await reportsAPI.exportPDF({
        report_type: 'audio',
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
      alert('Failed to download PDF report from server. Using browser print preview fallback.');
      window.print();
    } finally {
      setDownloading(false);
    }
  };

  if (!result) {
    return (
      <div className="min-h-[70vh] flex flex-col justify-center items-center space-y-4">
        <AlertTriangle size={48} className="text-amber-500 animate-bounce" />
        <h3 className="text-lg font-bold text-zinc-200">No Analysis Report Data Found</h3>
        <p className="text-sm text-zinc-400">Please upload and analyze an audio file to view a detailed report.</p>
        <button
          onClick={() => navigate('/audio-analysis')}
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-xl text-xs font-bold shadow-lg transition cursor-pointer flex items-center space-x-2"
        >
          <ArrowLeft size={14} />
          <span>Go to Audio Analysis Page</span>
        </button>
      </div>
    );
  }

  // Calculate warning messages based on quality rules
  const warnings = [];
  if (result.audio_quality?.clipping_detected) {
    warnings.push("Audio signal clipping detected. This might distort frequencies.");
  }
  if (result.audio_quality?.silence_percentage > 50.0) {
    warnings.push("High silence percentage detected. The recording might contain limited bioacoustic signals.");
  }
  if (result.audio_quality?.estimated_noise_level > 0.05) {
    warnings.push("High background noise floor estimated. Low amplitude calls may be obscured.");
  }
  if (result.audio_quality?.overall_score < 50) {
    warnings.push("Poor overall recording quality score. Predictions may be unreliable.");
  }

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto pb-12">
      {/* Top Navigation / Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-800 pb-4 gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={handleReturn}
            className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 rounded-lg transition cursor-pointer"
            title="Return to Audio Analysis"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 className="text-xl font-bold text-zinc-100">Detailed Bioacoustic Analysis Report</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Comprehensive classification and quality analysis data for {filename || 'audio file'}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-2 text-xs text-zinc-500 bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-lg">
            <FileText size={12} className="text-emerald-500" />
            <span className="font-mono">ID: {result.media_id || 'N/A'}</span>
          </div>
          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-xl text-xs font-bold shadow-lg transition cursor-pointer flex items-center space-x-2 disabled:opacity-50"
          >
            {downloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            <span>{downloading ? 'Generating PDF...' : 'Download PDF'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="space-y-6">
        
        {/* 1. Uploaded Audio Player View */}
        <div className="bg-zinc-900 border border-zinc-855 p-5 rounded-2xl space-y-4">
          <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs uppercase tracking-wider border-b border-zinc-800 pb-3">
            <FileAudio size={14} />
            <span>Uploaded Audio View</span>
          </div>

          <div className="flex flex-col justify-center items-center bg-zinc-950 rounded-xl p-6 border border-zinc-850 relative min-h-[160px] space-y-4">
            <div className="h-16 w-16 rounded-full bg-emerald-950/20 border border-emerald-900/30 flex items-center justify-center text-emerald-500">
              <FileAudio size={32} />
            </div>
            {audioUrl ? (
              <audio src={audioUrl} controls className="w-full max-w-xl h-10" />
            ) : (
              <p className="text-xs text-zinc-500 italic">Audio preview not loaded.</p>
            )}
          </div>
          <div className="text-[10px] text-zinc-500 flex justify-between px-1">
            <span>File Name: {filename || 'audio.wav'}</span>
            <span>Duration: {result.audio_quality?.duration.toFixed(1)} seconds</span>
          </div>
        </div>

        {/* 2 & 3. Detection Summary and Top-5 Predictions (Two-column responsive layout) */}
        <div className={`grid grid-cols-1 ${(!result.is_low_confidence && result.common_name !== 'Unknown Species Detected') ? 'md:grid-cols-2' : ''} gap-6 items-stretch`}>
          
          {/* Detection Summary */}
          <div className="bg-zinc-900 border border-zinc-850 p-5 rounded-2xl space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs uppercase tracking-wider border-b border-zinc-800 pb-3">
                <Cpu size={14} />
                <span>Detection Summary</span>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 bg-zinc-950 p-4 rounded-xl border border-zinc-855 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
                      {result.fallback_used || result.classification_level === 'animal_category' ? 'Animal Category' : 'Species'}
                    </p>
                    <div className="flex items-center space-x-2">
                      <span className="text-[9px] font-mono text-zinc-300 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded font-semibold">
                        {result.source_model || result.classification_source || "AnimalCLAP"}
                      </span>
                      {result.fallback_used && (
                        <span className="px-2 py-0.5 bg-amber-950/60 border border-amber-800/80 text-amber-400 text-[9px] font-extrabold rounded-md uppercase tracking-wider">
                          Fallback Classification
                        </span>
                      )}
                    </div>
                  </div>
                  <h3 className="text-base font-extrabold text-emerald-400 mt-1 truncate">
                    {result.animal_category || result.common_name || result.detected_species}
                  </h3>
                  {!result.fallback_used && result.scientific_name && result.scientific_name !== 'N/A' && (
                    <div className="border-t border-zinc-900 pt-1.5">
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Scientific Name</p>
                      <p className="text-xs font-semibold italic text-emerald-300 mt-0.5">{result.scientific_name}</p>
                    </div>
                  )}
                </div>

                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-855 text-center flex flex-col justify-center">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Confidence</p>
                  <h3 className="text-base font-extrabold text-emerald-400 mt-1 font-mono">
                    {((result.confidence || 0) * 100).toFixed(1)}%
                  </h3>
                  <p className="text-[9px] text-zinc-500 font-mono mt-0.5">
                    {result.fallback_used ? 'YAMNet (Fallback)' : (result.classification_source || 'AnimalCLAP')}
                  </p>
                </div>
              </div>

              {result.is_low_confidence && (
                <div className="p-3.5 bg-amber-950/30 border border-amber-900/40 rounded-xl text-xs text-amber-400 flex items-center space-x-2.5">
                  <AlertTriangle size={16} className="shrink-0 text-amber-500" />
                  <div>
                    <p className="font-bold text-[11px] text-amber-300 uppercase tracking-wider">Status: {result.status || "Low Confidence Prediction"}</p>
                    <p className="text-[11px] text-amber-400/90 mt-0.5">{result.reason || "BirdNET confidence below identification threshold."}</p>
                  </div>
                </div>
              )}

              {result.taxonomy && (
                <div className="bg-zinc-950/40 border border-zinc-855 p-4 rounded-xl space-y-2">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Taxonomy Details</p>
                  <div className="grid grid-cols-2 gap-4 text-xs font-medium text-zinc-300">
                    <div>
                      <span className="text-zinc-500">Genus:</span> <span className="text-zinc-200 font-semibold">{result.taxonomy.genus || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500">Species:</span> <span className="text-zinc-200 font-semibold italic">{result.taxonomy.species || "N/A"}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-zinc-950/50 border border-zinc-800/85 p-3.5 px-4 rounded-xl flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Total Sound Segments</span>
                <span className="text-base font-extrabold text-emerald-400 bg-emerald-950/30 border border-emerald-900/30 px-3 py-0.5 rounded-lg font-mono">
                  {(result.is_low_confidence || result.common_name === 'Unknown Species Detected') ? 'N/A' : (result.detected_events?.length || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Top 5 Predictions */}
          {result.top5_predictions && !result.is_low_confidence && result.common_name !== 'Unknown Species Detected' && (
            <div className="bg-zinc-900 border border-zinc-855 p-5 rounded-2xl space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-emerald-400 font-bold text-xs uppercase tracking-wider border-b border-zinc-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <BarChart size={14} />
                    <span>Top 5 Predictions</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono font-semibold uppercase">({result.source_model || result.model_name || "AnimalCLAP"})</span>
                </div>
                
                <div className="space-y-3">
                  {result.top5_predictions.map((pred, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <span className="text-zinc-300 font-medium truncate max-w-[45%]">
                        {idx + 1}. {pred.common_name || pred.species} 
                        {pred.scientific_name && <span className="text-[9px] text-zinc-500 italic ml-1">({pred.scientific_name})</span>}
                      </span>
                      <div className="flex items-center space-x-3 w-3/5 justify-end">
                        <div className="w-28 bg-zinc-950 h-2 rounded-full overflow-hidden shrink-0 border border-zinc-800">
                          <div className="bg-emerald-500 h-full" style={{ width: `${(pred.confidence || 0) * 100}%` }}></div>
                        </div>
                        <span className="font-mono text-zinc-400 w-12 text-right text-[10px]">
                          {((pred.confidence || 0) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* 4 & 5. Audio Quality Report and AI Engine Info (Two-column responsive layout below predictions) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          
          {/* Audio Quality Report */}
          {result.audio_quality && (
            <div className="bg-zinc-900 border border-zinc-850 p-5 rounded-2xl space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs uppercase tracking-wider border-b border-zinc-800 pb-3">
                  <CheckCircle size={14} />
                  <span>Audio Quality Report</span>
                </div>

                {warnings.length > 0 && (
                  <div className="space-y-2">
                    {warnings.map((warn, wIdx) => (
                      <div key={wIdx} className="p-3 bg-amber-950/20 border border-amber-900/30 rounded-xl text-[11px] text-amber-400 flex items-center space-x-2">
                        <AlertTriangle size={14} className="shrink-0 text-amber-500" />
                        <span>{warn}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs bg-zinc-950/40 border border-zinc-850 p-4 rounded-xl font-medium">
                  <div className="flex justify-between items-center border-b border-zinc-850 pb-2 col-span-2">
                    <span className="text-zinc-500 text-[10px] uppercase tracking-wider">Overall Quality Score</span>
                    <span className="text-zinc-200 font-extrabold font-mono text-xs">
                      {result.audio_quality.overall_score} <span className="text-zinc-500 font-normal text-[10px]">/ 100</span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-b border-zinc-850 pb-2 col-span-2">
                    <span className="text-zinc-500 text-[10px] uppercase tracking-wider">Overall Rating</span>
                    <span className={`font-bold uppercase tracking-wide text-[11px] ${
                      result.audio_quality.overall_rating === 'Excellent' ? 'text-emerald-400' :
                      result.audio_quality.overall_rating === 'Good' ? 'text-teal-400' :
                      result.audio_quality.overall_rating === 'Acceptable' ? 'text-amber-400' :
                      'text-rose-400'
                    }`}>
                      {result.audio_quality.overall_rating}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-zinc-850/30">
                    <span className="text-zinc-500 text-[10px] uppercase tracking-wider">Duration</span>
                    <span className="text-zinc-300 font-semibold">{result.audio_quality.duration.toFixed(1)}s</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-zinc-850/30">
                    <span className="text-zinc-500 text-[10px] uppercase tracking-wider">Sample Rate</span>
                    <span className="text-zinc-300 font-semibold font-mono">{result.audio_quality.sample_rate} Hz</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-zinc-850/30">
                    <span className="text-zinc-500 text-[10px] uppercase tracking-wider">Channels</span>
                    <span className="text-zinc-300 font-semibold">{result.audio_quality.channels} (Mono)</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-zinc-850/30">
                    <span className="text-zinc-500 text-[10px] uppercase tracking-wider">Signal Level (RMS)</span>
                    <span className="text-zinc-300 font-semibold font-mono">{result.audio_quality.signal_level.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between items-center pb-1">
                    <span className="text-zinc-500 text-[10px] uppercase tracking-wider">Clipping Status</span>
                    <span className={`text-[11px] font-semibold ${
                      result.audio_quality.clipping_detected ? 'text-rose-400' : 'text-emerald-400'
                    }`}>
                      {result.audio_quality.clipping_detected ? 'Clipping Detected' : 'Normal'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-1">
                    <span className="text-zinc-500 text-[10px] uppercase tracking-wider">Silence Percentage</span>
                    <span className="text-zinc-300 font-semibold font-mono">{result.audio_quality.silence_percentage.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center col-span-2 pt-2 border-t border-zinc-850/50">
                    <span className="text-zinc-500 text-[10px] uppercase tracking-wider">Background Noise Level</span>
                    <span className="text-zinc-300 font-semibold font-mono">{result.audio_quality.estimated_noise_level.toFixed(4)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI Engine Info */}
          <div className="bg-zinc-900 border border-zinc-850 p-5 rounded-2xl space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs uppercase tracking-wider border-b border-zinc-800 pb-3">
                <Info size={14} />
                <span>AI Engine Information</span>
              </div>
              
              <div className="text-[11px] text-zinc-400 space-y-2.5 font-medium">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Model Name:</span>
                  <span className="text-zinc-300 font-semibold">{result.model_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Model Version:</span>
                  <span className="text-zinc-300">{result.model_version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Inference Time:</span>
                  <span className="text-zinc-300 font-mono">{Math.round(result.inference_time_ms)}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Timestamp:</span>
                  <span className="text-zinc-300 font-mono text-[10px]">
                    {result.prediction_timestamp ? new Date(result.prediction_timestamp).toLocaleString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Navigation Return Button */}
      <div className="pt-6 border-t border-zinc-850 flex justify-center sm:justify-start">
        <button
          onClick={handleReturn}
          className="px-8 py-3 bg-zinc-900 hover:bg-zinc-800 active:scale-95 text-zinc-300 hover:text-white rounded-xl text-xs font-bold border border-zinc-800 hover:border-zinc-700 shadow-md transition cursor-pointer flex items-center space-x-2"
        >
          <ArrowLeft size={14} />
          <span>Return to Audio Analysis</span>
        </button>
      </div>

    </div>
  );
}
