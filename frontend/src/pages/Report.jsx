import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Cpu, AlertTriangle, CheckCircle, Image as ImageIcon, FileText, Info, BarChart, ShieldAlert, Dna, Download, Loader2 } from 'lucide-react';
import { reportsAPI } from '../services/api';

export default function Report() {
  const location = useLocation();
  const navigate = useNavigate();
  const { result, imageUrl, filename } = location.state || {};
  const [imageDim, setImageDim] = useState(null);
  const [downloading, setDownloading] = useState(false);

  const handleReturn = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/upload');
    }
  };

  const handleDownloadPDF = async () => {
    if (!result) return;
    setDownloading(true);
    try {
      const blob = await reportsAPI.exportPDF({
        report_type: 'image',
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
        <p className="text-sm text-zinc-400">Please upload and analyze an image to view a detailed report.</p>
        <button
          onClick={() => navigate('/upload')}
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-xl text-xs font-bold shadow-lg transition cursor-pointer flex items-center space-x-2"
        >
          <ArrowLeft size={14} />
          <span>Go to Upload Page</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto pb-12">
      {/* Top Navigation / Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-800 pb-4 gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={handleReturn}
            className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 rounded-lg transition cursor-pointer"
            title="Return to Upload"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 className="text-xl font-bold text-zinc-100">Detailed Analysis Report</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Comprehensive classification and quality analysis data for {filename || 'image'}</p>
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
        
        {/* 1. Uploaded Image View */}
        <div className="bg-zinc-900 border border-zinc-850 p-5 rounded-2xl space-y-4">
          <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs uppercase tracking-wider border-b border-zinc-800 pb-3">
            <ImageIcon size={14} />
            <span>Uploaded Image View</span>
          </div>

          <div className="flex justify-center items-center bg-zinc-950 rounded-xl p-4 border border-zinc-850 relative min-h-[300px]">
            <div className="relative inline-block">
              <img
                src={imageUrl}
                alt="Analyzed preview"
                className="max-w-full max-h-[500px] object-contain rounded-lg block"
                onLoad={(e) => {
                  setImageDim({
                    naturalWidth: e.target.naturalWidth,
                    naturalHeight: e.target.naturalHeight
                  });
                }}
              />
              {/* YOLO Bounding Boxes Overlay - ONLY YOLOv8x rectangles */}
              {result.bounding_boxes && imageDim && (
                <div className="absolute inset-0 pointer-events-none">
                  {result.bounding_boxes.map((box, bIdx) => {
                    const { naturalWidth, naturalHeight } = imageDim;
                    const x1 = box.bounding_box ? box.bounding_box[0] : (box.xmin ?? 0);
                    const y1 = box.bounding_box ? box.bounding_box[1] : (box.ymin ?? 0);
                    const x2 = box.bounding_box ? box.bounding_box[2] : (box.xmax ?? 0);
                    const y2 = box.bounding_box ? box.bounding_box[3] : (box.ymax ?? 0);
                    
                    const left = (x1 / naturalWidth) * 100;
                    const top = (y1 / naturalHeight) * 100;
                    const width = ((x2 - x1) / naturalWidth) * 100;
                    const height = ((y2 - y1) / naturalHeight) * 100;

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
          </div>
          <div className="text-[10px] text-zinc-500 flex justify-between px-1">
            <span>Original Dimensions: {imageDim ? `${imageDim.naturalWidth}x${imageDim.naturalHeight}px` : 'Loading...'}</span>
            <span>Bounding Boxes Overlayed: {result.bounding_boxes?.length || 0}</span>
          </div>
        </div>

        {/* 1. IUCN Red List Conservation Status Section */}
        <div className="bg-zinc-900 border border-zinc-850 p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <ShieldAlert size={14} className="text-emerald-400" />
              <span>Conservation Status (IUCN Red List API)</span>
            </div>
            {result.conservation_status?.iucn_category ? (
              <span className={`px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-lg border ${
                ['CR', 'EN'].includes(result.conservation_status.iucn_category)
                  ? 'bg-rose-950/80 border-rose-800 text-rose-400 animate-pulse'
                  : ['VU', 'NT'].includes(result.conservation_status.iucn_category)
                  ? 'bg-amber-950/80 border-amber-800 text-amber-400'
                  : 'bg-emerald-950/80 border-emerald-800 text-emerald-400'
              }`}>
                IUCN: {result.conservation_status.iucn_category}
              </span>
            ) : (
              <span className="px-2.5 py-1 bg-zinc-800/60 border border-zinc-700/60 text-zinc-400 font-semibold text-[10px] uppercase tracking-wider rounded-lg">
                Not Evaluated
              </span>
            )}
          </div>

          {result.conservation_status?.iucn_category ? (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-zinc-950 p-4 rounded-xl border border-zinc-850">
              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Scientific Name</p>
                <p className="text-sm font-bold text-zinc-200 italic mt-0.5">{result.conservation_status.scientific_name || result.detected_species}</p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">IUCN Category</p>
                <p className="text-sm font-extrabold text-amber-400 mt-0.5">{result.conservation_status.iucn_category}</p>
                <p className="text-[10px] text-zinc-400 line-clamp-2 mt-0.5">{result.conservation_status.category_description}</p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Population Trend</p>
                <p className="text-sm font-bold text-zinc-300 mt-0.5">{result.conservation_status.population_trend || "Unknown"}</p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Assessment Year</p>
                <p className="text-sm font-bold text-zinc-300 font-mono mt-0.5">{result.conservation_status.assessment_year || "N/A"}</p>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-zinc-950/60 rounded-xl border border-zinc-850 text-center">
              <p className="text-xs font-semibold text-zinc-400">No IUCN conservation data available.</p>
              <p className="text-[10px] text-zinc-500 mt-0.5">The IUCN Red List API returned no record for "{result.detected_species}".</p>
            </div>
          )}
        </div>

        {/* 1.5. Taxonomic Classification (GBIF Species API) */}
        <div className="bg-zinc-900 border border-zinc-850 p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <Dna size={14} />
              <span>Taxonomic Classification</span>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono uppercase font-semibold">GBIF Species API</span>
          </div>

          {result.taxonomy ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 bg-zinc-950 p-4 rounded-xl border border-zinc-850">
              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Scientific Name</p>
                <p className="text-xs font-bold text-emerald-400 italic mt-0.5 truncate">{result.taxonomy.scientific_name}</p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Kingdom</p>
                <p className="text-xs font-bold text-zinc-200 mt-0.5">{result.taxonomy.kingdom}</p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Phylum</p>
                <p className="text-xs font-bold text-zinc-200 mt-0.5">{result.taxonomy.phylum}</p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Class</p>
                <p className="text-xs font-bold text-zinc-200 mt-0.5">{result.taxonomy.class}</p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Order</p>
                <p className="text-xs font-bold text-zinc-200 mt-0.5">{result.taxonomy.order}</p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Family</p>
                <p className="text-xs font-bold text-zinc-200 mt-0.5">{result.taxonomy.family}</p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Genus</p>
                <p className="text-xs font-bold text-zinc-200 mt-0.5 italic">{result.taxonomy.genus}</p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Species</p>
                <p className="text-xs font-bold text-zinc-200 mt-0.5 italic truncate">{result.taxonomy.species}</p>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-zinc-950/60 rounded-xl border border-zinc-850 text-center">
              <p className="text-xs font-semibold text-zinc-400">Taxonomic classification unavailable.</p>
              <p className="text-[10px] text-zinc-500 mt-0.5">The GBIF Species API returned no record for "{result.detected_species}".</p>
            </div>
          )}
        </div>

        {/* 2 & 3. Detection Summary and Top-5 Predictions (Two-column responsive layout) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          
          {/* Detection Summary */}
          <div className="bg-zinc-900 border border-zinc-850 p-5 rounded-2xl space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs uppercase tracking-wider border-b border-zinc-800 pb-3">
                <Cpu size={14} />
                <span>Detection Summary</span>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 bg-zinc-950 p-4 rounded-xl border border-zinc-850/60 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Primary Species</p>
                      {result.species_prediction?.fallback_used ? (
                        <span className="px-2 py-0.5 bg-amber-950/60 border border-amber-800/80 text-amber-400 text-[9px] font-extrabold rounded-md uppercase tracking-wider">
                          Fallback Prediction
                        </span>
                      ) : (
                        <span className="text-[9px] text-zinc-500 font-semibold uppercase tracking-wider">
                          {result.species_prediction?.source_model || "ViT"} Primary
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <h3 className="text-base font-extrabold text-emerald-400 truncate">{result.detected_species}</h3>
                    </div>
                  </div>
                  {result.species_prediction?.fallback_used && (
                    <p className="text-[10px] text-amber-400/90 mt-1">
                      Classified using <span className="font-semibold">Google SpeciesNet (v4.0.2a)</span> because ViT confidence was below 80%.
                    </p>
                  )}
                </div>
                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850/60 text-center flex flex-col justify-between">
                  <div>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Confidence</p>
                    <h3 className="text-base font-extrabold text-emerald-400 mt-1 font-mono">{(result.confidence * 100).toFixed(1)}%</h3>
                  </div>
                  <p className="text-[9px] text-zinc-500 font-mono mt-1">Source: {result.species_prediction?.source_model || "ViT"}</p>
                </div>
              </div>

              <div className="bg-zinc-950/50 border border-zinc-800/85 p-3.5 px-4 rounded-xl flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Number of Animals Detected</span>
                <span className="text-base font-extrabold text-emerald-400 bg-emerald-950/30 border border-emerald-900/30 px-3 py-0.5 rounded-lg font-mono">
                  {result.bounding_boxes?.length || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Top 5 Predictions */}
          {result.top5_predictions && (
            <div className="bg-zinc-900 border border-zinc-850 p-5 rounded-2xl space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-emerald-400 font-bold text-xs uppercase tracking-wider border-b border-zinc-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <BarChart size={14} />
                    <span>Top 5 Predictions</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono font-normal uppercase">({result.species_prediction?.source_model || "ViT"})</span>
                </div>
                
                <div className="space-y-3">
                  {result.top5_predictions.map((pred, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <span className="text-zinc-300 font-medium">
                        {idx + 1}. {pred.species}
                      </span>
                      <div className="flex items-center space-x-3 w-3/5 justify-end">
                        <div className="w-28 bg-zinc-950 h-2 rounded-full overflow-hidden shrink-0 border border-zinc-800">
                          <div className="bg-emerald-500 h-full" style={{ width: `${pred.confidence * 100}%` }}></div>
                        </div>
                        <span className="font-mono text-zinc-400 w-12 text-right text-[10px]">
                          {(pred.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* 4 & 5. Image Quality Report and AI Engine Info (Two-column responsive layout below predictions) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          
          {/* Image Quality Report */}
          {result.image_quality && (
            <div className="bg-zinc-900 border border-zinc-850 p-5 rounded-2xl space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs uppercase tracking-wider border-b border-zinc-800 pb-3">
                  <CheckCircle size={14} />
                  <span>Image Quality Report</span>
                </div>

                {result.image_quality.warning_message && (
                  <div className="p-3 bg-amber-950/20 border border-amber-900/30 rounded-xl text-[11px] text-amber-400 flex items-center space-x-2">
                    <AlertTriangle size={14} className="shrink-0 text-amber-500" />
                    <span>{result.image_quality.warning_message}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 text-xs bg-zinc-950/40 border border-zinc-850 p-3.5 rounded-xl font-medium">
                  <div className="flex justify-between items-center border-b border-zinc-850 pb-2 col-span-2">
                    <span className="text-zinc-500 text-[10px] uppercase tracking-wider">Overall Quality Score</span>
                    <span className="text-zinc-200 font-extrabold font-mono text-xs">
                      {result.image_quality.overall_score} <span className="text-zinc-500 font-normal text-[10px]">/ 100</span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-b border-zinc-850 pb-2 col-span-2">
                    <span className="text-zinc-500 text-[10px] uppercase tracking-wider">Overall Rating</span>
                    <span className={`font-bold uppercase tracking-wide text-[11px] ${
                      result.image_quality.overall_rating === 'Excellent' ? 'text-emerald-400' :
                      result.image_quality.overall_rating === 'Good' ? 'text-teal-400' :
                      result.image_quality.overall_rating === 'Acceptable' ? 'text-amber-400' :
                      'text-rose-400'
                    }`}>
                      {result.image_quality.overall_rating}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-1">
                    <span className="text-zinc-500 text-[10px] uppercase tracking-wider">Blur</span>
                    <span className={`text-[11px] ${
                      result.image_quality.blur_status === 'Good' ? 'text-emerald-400' :
                      result.image_quality.blur_status === 'Acceptable' ? 'text-amber-400' :
                      'text-rose-400'
                    }`}>
                      {result.image_quality.blur_status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-1">
                    <span className="text-zinc-500 text-[10px] uppercase tracking-wider">Brightness</span>
                    <span className={`text-[11px] ${
                      result.image_quality.brightness_status === 'Good' ? 'text-emerald-400' :
                      result.image_quality.brightness_status === 'Acceptable' ? 'text-amber-400' :
                      'text-rose-400'
                    }`}>
                      {result.image_quality.brightness_status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-1">
                    <span className="text-zinc-500 text-[10px] uppercase tracking-wider">Resolution</span>
                    <span className={`text-[11px] ${
                      result.image_quality.resolution_status === 'Acceptable' ? 'text-emerald-400' :
                      result.image_quality.resolution_status === 'Too Low' ? 'text-rose-400' : 'text-emerald-400'
                    }`}>
                      {result.image_quality.resolution}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-1">
                    <span className="text-zinc-500 text-[10px] uppercase tracking-wider">Contrast</span>
                    <span className={`text-[11px] ${
                      result.image_quality.contrast_status === 'Normal' ? 'text-emerald-400' :
                      'text-amber-400'
                    }`}>
                      {result.image_quality.contrast_status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center col-span-2 pt-1 border-t border-zinc-850/50">
                    <span className="text-zinc-500 text-[10px] uppercase tracking-wider">Noise</span>
                    <span className={`text-[11px] ${
                      result.image_quality.noise_status === 'Low' ? 'text-emerald-400' :
                      result.image_quality.noise_status === 'Moderate' ? 'text-amber-400' :
                      'text-rose-400'
                    }`}>
                      {result.image_quality.noise_status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI Information */}
          <div className="bg-zinc-900 border border-zinc-850 p-5 rounded-2xl space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs uppercase tracking-wider border-b border-zinc-800 pb-3">
                <Info size={14} />
                <span>AI Engine Information</span>
              </div>
              
              <div className="text-[11px] text-zinc-400 space-y-2 font-medium">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Model Name:</span>
                  <span className="text-zinc-300 max-w-[200px] truncate text-right" title={result.model_name}>{result.model_name}</span>
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
          <span>Return to Upload Page</span>
        </button>
      </div>

    </div>
  );
}
