import React, { useEffect, useState, useMemo } from 'react';
import { analyticsAPI } from '../services/api';
import MathFormula from './MathFormula';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import {
  Globe,
  UploadCloud,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Layers,
  MapPin,
  FileCode,
  ShieldCheck,
  BarChart3,
  Info
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function GisHabitatSection() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null);

  // File states
  const [redFile, setRedFile] = useState(null);
  const [nirFile, setNirFile] = useState(null);

  const fetchGisHabitat = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await analyticsAPI.getGisHabitat();
      setData(res);
    } catch (err) {
      console.error('Failed to fetch GIS habitat suitability:', err);
      setError(err.response?.data?.detail || 'Failed to load GIS habitat suitability metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGisHabitat();
  }, []);

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!redFile || !nirFile) {
      setError('Supported formats: Sentinel-2 JP2 and GeoTIFF. Please select both RED (Band 4) and NIR (Band 8) raster files (.jp2, .tif, or .tiff).');
      return;
    }

    try {
      setProcessing(true);
      setError(null);
      setUploadSuccess(null);

      const formData = new FormData();
      formData.append('red_band', redFile);
      formData.append('nir_band', nirFile);

      const res = await analyticsAPI.uploadRasters(formData);
      setData(res);
      setUploadSuccess('Raster processing completed successfully! Calculated NDVI output saved with spatial metadata.');
    } catch (err) {
      console.error('Failed to process raster rasters:', err);
      setError(err.response?.data?.detail || 'Failed to process satellite rasters using Rasterio.');
    } finally {
      setProcessing(false);
    }
  };

  // Prepare Suitability Distribution Bar Chart Data
  const dist = data?.suitability_distribution;
  const chartData = useMemo(() => ({
    labels: ['High Suitability (≥0.50)', 'Moderate (0.20-0.49)', 'Low (0.00-0.19)', 'Unsuitable (<0.00)'],
    datasets: [
      {
        label: 'Raster Pixel Distribution (%)',
        data: dist ? [
          dist.high?.percentage || 0,
          dist.moderate?.percentage || 0,
          dist.low?.percentage || 0,
          dist.unsuitable?.percentage || 0
        ] : [0, 0, 0, 0],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderWidth: 1,
        borderRadius: 6
      }
    ]
  }), [dist]);

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-950/60 via-zinc-900 to-zinc-900 border border-blue-500/30 rounded-xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-400">
              <Globe size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
                Phase 4 GIS: Satellite Habitat Suitability Analysis
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 font-medium">
                  Rasterio & GeoPandas Engine
                </span>
              </h2>
              <div className="text-xs text-zinc-400 mt-1 flex items-center gap-1.5 flex-wrap">
                <span>Normalized Difference Vegetation Index:</span>
                <MathFormula math="\text{NDVI} = \frac{\text{NIR} - \text{RED}}{\text{NIR} + \text{RED}}" />
              </div>
            </div>
          </div>

          <button
            onClick={fetchGisHabitat}
            disabled={loading || processing}
            className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium border border-zinc-700 transition flex items-center gap-2"
          >
            <RefreshCw size={14} className={loading || processing ? 'animate-spin' : ''} />
            Refresh Spatial Data
          </button>
        </div>
      </div>

      {/* Raster Upload Card */}
      <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl space-y-4">
        <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
          <UploadCloud size={18} className="text-blue-400" />
          Upload Sentinel-2 Band Rasters (JP2 / GeoTIFF)
        </h3>
        <p className="text-xs text-zinc-400">
          Supported formats: Sentinel-2 JP2 and GeoTIFF. Upload RED (Band 4) and NIR (Band 8) raster files (`.jp2`, `.tif`, or `.tiff`). Rasterio will compute floating-point NDVI, preserve CRS metadata, and write the processed spatial layer.
        </p>

        <form onSubmit={handleUploadSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">
              RED Band File (Band 4 .jp2 / .tif)
            </label>
            <input
              type="file"
              accept=".jp2,.tif,.tiff"
              onChange={(e) => setRedFile(e.target.files[0] || null)}
              className="w-full text-xs text-zinc-300 bg-zinc-950 border border-zinc-750 rounded-lg file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-950 file:text-blue-300 hover:file:bg-blue-900 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">
              NIR Band File (Band 8 .jp2 / .tif)
            </label>
            <input
              type="file"
              accept=".jp2,.tif,.tiff"
              onChange={(e) => setNirFile(e.target.files[0] || null)}
              className="w-full text-xs text-zinc-300 bg-zinc-950 border border-zinc-750 rounded-lg file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-950 file:text-blue-300 hover:file:bg-blue-900 cursor-pointer"
            />
          </div>

          <button
            type="submit"
            disabled={processing || !redFile || !nirFile}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-lg text-xs font-semibold transition flex items-center justify-center gap-2 shadow"
          >
            {processing ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                Processing Rasters with Rasterio...
              </>
            ) : (
              <>
                <UploadCloud size={14} />
                Process NDVI & Habitat
              </>
            )}
          </button>
        </form>

        {uploadSuccess && (
          <div className="p-3 bg-emerald-950/40 border border-emerald-800/50 rounded-lg text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            <span>{uploadSuccess}</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-950/40 border border-red-800/50 rounded-lg text-red-300 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="p-8 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center text-zinc-400">
          <RefreshCw className="animate-spin text-blue-500 mr-3" size={20} />
          Loading GIS habitat suitability telemetry...
        </div>
      ) : data && !data.has_raster ? (
        <div className="p-6 bg-zinc-900/60 border border-zinc-800 rounded-xl text-center space-y-2">
          <div className="p-3 bg-zinc-800/80 rounded-full inline-block text-zinc-400 mb-1">
            <Globe size={24} />
          </div>
          <h4 className="text-sm font-semibold text-zinc-200">Pending Satellite Raster Data</h4>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            {data.message || 'No GeoTIFF rasters uploaded yet. Upload RED (Band 4) and NIR (Band 8) TIFF files using the form above.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* NDVI Summary KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-950/40 to-zinc-900 border border-blue-500/40 p-5 rounded-xl">
              <div className="text-xs font-semibold uppercase tracking-wider text-blue-400 mb-1 flex items-center gap-1">
                <span>Mean NDVI</span>
                <MathFormula math="\text{Vegetation Score}" className="text-[11px]" />
              </div>
              <div className="text-3xl font-extrabold text-blue-300">
                {data?.mean_ndvi ?? '0.0000'}
              </div>
              <div className="text-xs text-blue-400/80 mt-1 flex items-center gap-1">
                <ShieldCheck size={12} />
                {data?.habitat_classification || 'Classified'}
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl">
              <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                Minimum NDVI
              </div>
              <div className="text-3xl font-extrabold text-zinc-100">
                {data?.min_ndvi ?? '0.0000'}
              </div>
              <div className="text-xs text-zinc-500 mt-1">Water / bare soil threshold</div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl">
              <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                Maximum NDVI
              </div>
              <div className="text-3xl font-extrabold text-emerald-400">
                {data?.max_ndvi ?? '0.0000'}
              </div>
              <div className="text-xs text-zinc-500 mt-1">Dense canopy peak</div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl">
              <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                Standard Deviation / CRS
              </div>
              <div className="text-2xl font-extrabold text-zinc-100">
                ±{data?.std_ndvi ?? '0.000'}
              </div>
              <div className="text-xs text-zinc-400 mt-1 flex items-center gap-1">
                <MapPin size={12} className="text-blue-400" />
                CRS: {data?.crs || 'EPSG:4326'}
              </div>
            </div>
          </div>

          {/* Suitability Distribution Chart & Table */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart */}
            <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl">
              <h4 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2">
                Habitat Suitability Pixel Distribution (%)
              </h4>
              <div className="h-64">
                <Bar
                  data={chartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'top', labels: { color: '#a1a1aa', font: { size: 11 } } },
                    },
                    scales: {
                      x: { ticks: { color: '#a1a1aa', font: { size: 10 } }, grid: { color: '#27272a' } },
                      y: { ticks: { color: '#a1a1aa' }, grid: { color: '#27272a' } },
                    },
                  }}
                />
              </div>
            </div>

            {/* Table */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col">
              <div className="p-4 bg-zinc-800/50 border-b border-zinc-800 font-semibold text-xs text-zinc-300 uppercase tracking-wider flex justify-between items-center">
                <span>NDVI Pixel Category Breakdown</span>
                <span className="text-zinc-500 font-mono">Total Pixels: {data?.total_pixels?.toLocaleString() || 0}</span>
              </div>
              <div className="flex-1 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-900 text-zinc-400 border-b border-zinc-800 sticky top-0">
                    <tr>
                      <th className="p-3">Suitability Category</th>
                      <th className="p-3 text-right">Pixel Count</th>
                      <th className="p-3 text-right">Coverage (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50 text-zinc-300">
                    {dist ? (
                      [
                        { key: 'high', label: dist.high?.label, count: dist.high?.count, pct: dist.high?.percentage, color: 'text-emerald-400' },
                        { key: 'moderate', label: dist.moderate?.label, count: dist.moderate?.count, pct: dist.moderate?.percentage, color: 'text-blue-400' },
                        { key: 'low', label: dist.low?.label, count: dist.low?.count, pct: dist.low?.percentage, color: 'text-amber-400' },
                        { key: 'unsuitable', label: dist.unsuitable?.label, count: dist.unsuitable?.count, pct: dist.unsuitable?.percentage, color: 'text-red-400' },
                      ].map((row, idx) => (
                        <tr key={idx} className="hover:bg-zinc-800/30">
                          <td className={`p-3 font-medium ${row.color}`}>{row.label}</td>
                          <td className="p-3 text-right text-zinc-300">{row.count?.toLocaleString()}</td>
                          <td className={`p-3 text-right font-bold ${row.color}`}>{row.pct}%</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="p-4 text-center text-zinc-500">No pixel distribution available.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
