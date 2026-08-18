import React, { useState } from 'react';
import GisHabitatSection from '../components/GisHabitatSection';
import { useAuth } from '../context/AuthContext';
import { reportsAPI } from '../services/api';
import { Layers, ShieldCheck, Sun, Download, Loader2, FileSpreadsheet } from 'lucide-react';

export default function HabitatIntelligence() {
  const { user } = useAuth();
  const [downloading, setDownloading] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const blob = await reportsAPI.exportPDF({
        report_type: 'habitat',
        filename: 'habitat_intelligence_report',
        result: {}
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Wildlife_Habitat_Intelligence_Report_${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF download error:', err);
      window.print();
    } finally {
      setDownloading(false);
    }
  };

  const handleExportExcel = async () => {
    setExportingExcel(true);
    try {
      const userInfo = {
        full_name: user?.full_name || user?.name || user?.email || 'Authenticated User',
        email: user?.email || 'N/A',
        role: user?.role || 'Researcher'
      };

      const blob = await reportsAPI.exportExcel({
        report_type: 'habitat',
        filename: 'habitat_intelligence_report',
        user_info: userInfo,
        result: {}
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Wildlife_Habitat_Intelligence_Export_${Date.now()}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Excel export error:', err);
      alert('Failed to export Excel report.');
    } finally {
      setExportingExcel(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-950/60 border border-amber-800/60 text-amber-400 flex items-center gap-1">
              <ShieldCheck size={12} />
              PDF Module 8
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-zinc-900 border border-zinc-800 text-zinc-400 flex items-center gap-1">
              <Sun size={12} />
              Sentinel-2 JP2 & GeoTIFF GIS Processing
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-100 mt-1 flex items-center gap-2">
            <span>Habitat Intelligence Engine</span>
            <Layers size={24} className="text-amber-400" />
          </h1>
          <p className="text-xs md:text-sm text-zinc-400 mt-1">
            Satellite-derived Normalized Difference Vegetation Index (NDVI) and spatial GIS habitat suitability.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportExcel}
            disabled={exportingExcel}
            className="flex items-center space-x-2 px-4 py-2.5 bg-yellow-700 hover:bg-yellow-600 active:scale-95 text-white rounded-xl text-xs font-bold transition shadow-lg disabled:opacity-50 cursor-pointer"
          >
            {exportingExcel ? <Loader2 size={14} className="animate-spin" /> : <FileSpreadsheet size={14} />}
            <span>{exportingExcel ? 'Exporting Excel...' : 'Export Excel'}</span>
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="flex items-center space-x-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 active:scale-95 text-white rounded-xl text-xs font-bold transition shadow-lg disabled:opacity-50 cursor-pointer"
          >
            {downloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            <span>{downloading ? 'Generating PDF...' : 'Download PDF'}</span>
          </button>
        </div>
      </div>

      {/* Module 8 Main Section */}
      <GisHabitatSection />
    </div>
  );
}
