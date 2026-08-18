import React, { useState } from 'react';
import BiodiversityShannonSection from '../components/BiodiversityShannonSection';
import { useAuth } from '../context/AuthContext';
import { reportsAPI } from '../services/api';
import { Dna, ShieldCheck, Clock, Download, Loader2, FileSpreadsheet } from 'lucide-react';

export default function BiodiversityIntelligence() {
  const { user } = useAuth();
  const [downloading, setDownloading] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const blob = await reportsAPI.exportPDF({
        report_type: 'biodiversity',
        filename: 'biodiversity_intelligence_report',
        result: {}
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Wildlife_Biodiversity_Intelligence_Report_${Date.now()}.pdf`;
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
        report_type: 'biodiversity',
        filename: 'biodiversity_intelligence_report',
        user_info: userInfo,
        result: {}
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Wildlife_Biodiversity_Intelligence_Export_${Date.now()}.xlsx`;
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
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 flex items-center gap-1">
              <ShieldCheck size={12} />
              PDF Module 7
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-zinc-900 border border-zinc-800 text-zinc-400 flex items-center gap-1">
              <Clock size={12} />
              6-Month Filtered Analytics
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-100 mt-1 flex items-center gap-2">
            <span>Biodiversity Intelligence Engine</span>
            <Dna size={24} className="text-emerald-400" />
          </h1>
          <p className="text-xs md:text-sm text-zinc-400 mt-1">
            Shannon Diversity Index (H'), Species Richness (S), Pielou's Evenness (J'), and Relative Abundance.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportExcel}
            disabled={exportingExcel}
            className="flex items-center space-x-2 px-4 py-2.5 bg-teal-700 hover:bg-teal-600 active:scale-95 text-white rounded-xl text-xs font-bold transition shadow-lg disabled:opacity-50 cursor-pointer"
          >
            {exportingExcel ? <Loader2 size={14} className="animate-spin" /> : <FileSpreadsheet size={14} />}
            <span>{exportingExcel ? 'Exporting Excel...' : 'Export Excel'}</span>
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="flex items-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-xl text-xs font-bold transition shadow-lg disabled:opacity-50 cursor-pointer"
          >
            {downloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            <span>{downloading ? 'Generating PDF...' : 'Download PDF'}</span>
          </button>
        </div>
      </div>

      {/* Module 7 Main Section */}
      <BiodiversityShannonSection />
    </div>
  );
}
