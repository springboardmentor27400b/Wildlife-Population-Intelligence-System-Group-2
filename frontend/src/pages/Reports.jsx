import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Activity, 
  MapPin, 
  Search, 
  TrendingUp, 
  Sprout,
  RefreshCw,
  Compass,
  FileCheck,
  FileSpreadsheet,
  AlertTriangle
} from 'lucide-react';
import { getObservations } from '../api/observations';
import { getSurveys } from '../api/surveys';
import { getMonitoringSites } from '../api/monitoringSites';
import { getSpeciesList } from '../api/species';
import { getPdfReportDownloadUrl, downloadPdfReport, downloadExcelReport } from '../api/reports';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import Toast from '../components/common/Toast';
import { formatDateTime } from '../utils/formatters';

export const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [observations, setObservations] = useState([]);
  const [surveys, setSurveys] = useState([]);
  const [sites, setSites] = useState([]);
  const [speciesList, setSpeciesList] = useState([]);
  const [searchObs, setSearchObs] = useState('');
  const [searchSrv, setSearchSrv] = useState('');
  const [toastMsg, setToastMsg] = useState(null);

  // Report Generator Filter states
  const [reportType, setReportType] = useState('survey'); // 'survey', 'population', 'biodiversity', 'habitat', 'conservation'
  const [selectedSite, setSelectedSite] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState('');
  const [selectedHabitat, setSelectedHabitat] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [previewData, setPreviewData] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [obsData, srvData, sitesData, spData] = await Promise.all([
        getObservations({ page_size: 100 }),
        getSurveys({ page_size: 100 }),
        getMonitoringSites({ page_size: 100 }),
        getSpeciesList({ page_size: 100 })
      ]);
      setObservations(obsData.items || []);
      setSurveys(srvData.items || []);
      setSites(sitesData.items || []);
      setSpeciesList(spData.items || []);
    } catch (err) {
      console.error(err);
      setToastMsg({ text: 'Failed to retrieve database logs for reports.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDownload = async (targetId, typeName) => {
    try {
      setToastMsg({ text: `Compiling and downloading ${typeName} PDF Report...`, type: 'info' });
      const filters = {
        site_id: selectedSite,
        species: selectedSpecies,
        habitat: selectedHabitat,
        status: selectedStatus,
        start_date: startDate,
        end_date: endDate
      };
      
      const blob = await downloadPdfReport(targetId, filters);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report_${targetId}_${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setToastMsg({ text: `${typeName} PDF downloaded successfully!`, type: 'success' });
    } catch (err) {
      console.error(err);
      setToastMsg({ text: 'Failed to compile or download PDF report.', type: 'error' });
    }
  };

  const handleExcelDownload = async (targetId, typeName) => {
    try {
      setToastMsg({ text: `Compiling and downloading ${typeName} Excel Spreadsheet...`, type: 'info' });
      const filters = {
        site_id: selectedSite,
        species: selectedSpecies,
        habitat: selectedHabitat,
        status: selectedStatus,
        start_date: startDate,
        end_date: endDate
      };
      
      const blob = await downloadExcelReport(targetId, filters);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report_${targetId}_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setToastMsg({ text: `${typeName} Excel downloaded successfully!`, type: 'success' });
    } catch (err) {
      console.error(err);
      setToastMsg({ text: 'Failed to compile or download Excel spreadsheet.', type: 'error' });
    }
  };

  const handleGeneratePreview = () => {
    let summary = {};
    if (reportType === 'survey') {
      const matchingSurveys = surveys.filter(srv => {
        if (selectedSite && srv.site_id !== selectedSite) return false;
        if (startDate && srv.start_date && srv.start_date < startDate) return false;
        if (endDate && srv.end_date && srv.end_date > endDate) return false;
        return true;
      });
      summary = {
        title: 'Wildlife Survey Report digest',
        totalSurveys: matchingSurveys.length,
        surveysList: matchingSurveys.map(s => ({
          name: s.name || 'N/A',
          investigator: s.investigator || 'N/A',
          dates: `${s.start_date ? new Date(s.start_date).toLocaleDateString() : 'N/A'} - ${s.end_date ? new Date(s.end_date).toLocaleDateString() : 'Active'}`
        }))
      };
    } else if (reportType === 'population') {
      const obsFilter = observations.filter(o => {
        if (selectedSpecies && o.species?.toLowerCase() !== selectedSpecies.toLowerCase()) return false;
        if (selectedSite && o.site_id !== selectedSite) return false;
        return true;
      });
      const sightedCount = obsFilter.reduce((sum, o) => sum + (o.count || 0), 0);
      const profile = speciesList.find(sp => sp.common_name?.toLowerCase() === selectedSpecies.toLowerCase() || sp.scientific_name?.toLowerCase() === selectedSpecies.toLowerCase());
      
      summary = {
        title: 'Species Population Report',
        speciesName: selectedSpecies || 'All Sighted Species',
        scientificName: profile?.scientific_name || 'N/A',
        totalSightings: obsFilter.length,
        sightedCount,
        trend: profile?.population_trend || 'N/A',
        distributionSites: Array.from(new Set(obsFilter.map(o => o.site_id))).length
      };
    } else if (reportType === 'biodiversity') {
      const siteObs = selectedSite ? observations.filter(o => o.site_id === selectedSite) : observations;
      const uniqueSpecies = Array.from(new Set(siteObs.map(o => o.species).filter(Boolean)));
      const totalCount = siteObs.reduce((sum, o) => sum + (o.count || 0), 0);

      // Shannon Wiener Index
      let shannon = 0;
      if (totalCount > 0 && uniqueSpecies.length > 0) {
        const counts = {};
        siteObs.forEach(o => {
          if (o.species) counts[o.species] = (counts[o.species] || 0) + (o.count || 0);
        });
        let sum = 0;
        Object.values(counts).forEach(cnt => {
          const p = cnt / totalCount;
          if (p > 0) sum += p * Math.log(p);
        });
        shannon = parseFloat((-sum).toFixed(2));
      }

      summary = {
        title: 'Biodiversity Index Census Report',
        speciesRichness: uniqueSpecies.length,
        shannonIndex: shannon || 'N/A',
        totalAnimals: totalCount,
        siteName: selectedSite ? (sites.find(s => s.id === selectedSite)?.name || 'N/A') : 'Global Sanctuary'
      };
    } else if (reportType === 'habitat') {
      const matchingSites = sites.filter(s => {
        if (selectedHabitat && s.habitat_type !== selectedHabitat) return false;
        if (selectedSite && s.id !== selectedSite) return false;
        return true;
      });
      summary = {
        title: 'Habitat Suitability Assessment Report',
        totalSites: matchingSites.length,
        habitatType: selectedHabitat || 'All Habitats',
        sitesList: matchingSites.map(s => ({
          name: s.name || 'N/A',
          coords: `${s.latitude?.toFixed(4) || 'N/A'}, ${s.longitude?.toFixed(4) || 'N/A'}`,
          suitability: s.suitability_score !== undefined ? `${s.suitability_score}%` : 'N/A'
        }))
      };
    } else if (reportType === 'conservation') {
      const matchSp = speciesList.filter(sp => {
        if (selectedStatus && sp.conservation_status !== selectedStatus) return false;
        return true;
      });
      summary = {
        title: 'Conservation recommendation status overview',
        totalVulnerable: matchSp.length,
        statusFilter: selectedStatus || 'All Threat Levels',
        speciesList: matchSp.map(sp => ({
          name: sp.common_name || 'N/A',
          status: sp.conservation_status || 'N/A',
          diet: sp.diet || 'N/A'
        }))
      };
    }
    setPreviewData(summary);
    setToastMsg({ text: 'Dynamic Report Preview generated successfully!', type: 'success' });
  };

  // Filter observation sightings
  const filteredObs = observations.filter(obs => 
    obs.species.toLowerCase().includes(searchObs.toLowerCase()) ||
    obs.id.toLowerCase().includes(searchObs.toLowerCase())
  );

  // Filter surveys
  const filteredSrv = surveys.filter(srv => 
    srv.name.toLowerCase().includes(searchSrv.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-forest-850 pb-4">
        <div>
          <h1 className="text-2xl font-black font-outfit text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <FileCheck className="w-7 h-7 text-emerald-600 animate-pulse" />
            Conservation & Intelligence Reports
          </h1>
          <p className="text-xs text-slate-550 dark:text-slate-400 mt-1 font-semibold">
            Compile and download professional PDF reports using real-time database observations and AI pipelines.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" icon={RefreshCw} onClick={fetchData}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Reports Generator Parameters Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 p-5 bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-850 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 font-outfit text-sm uppercase tracking-wide">
            Configure Report Criteria
          </h3>
          <div className="space-y-3 text-xs">
            <div>
              <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Report Category</label>
              <select
                value={reportType}
                onChange={(e) => { setReportType(e.target.value); setPreviewData(null); }}
                className="w-full px-2.5 py-1.5 border rounded-lg dark:bg-forest-955 dark:border-forest-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="survey">Wildlife Survey Report</option>
                <option value="population">Species Population Report</option>
                <option value="biodiversity">Biodiversity Report</option>
                <option value="habitat">Habitat Assessment Report</option>
                <option value="conservation">Conservation Report</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Monitoring Site</label>
              <select
                value={selectedSite}
                onChange={(e) => setSelectedSite(e.target.value)}
                className="w-full px-2.5 py-1.5 border rounded-lg dark:bg-forest-955 dark:border-forest-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="">All Sites</option>
                {sites.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Species Sighted</label>
              <select
                value={selectedSpecies}
                onChange={(e) => setSelectedSpecies(e.target.value)}
                className="w-full px-2.5 py-1.5 border rounded-lg dark:bg-forest-955 dark:border-forest-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="">All Species</option>
                {Array.from(new Set(observations.map(o => o.species).filter(Boolean))).map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Habitat Type</label>
              <select
                value={selectedHabitat}
                onChange={(e) => setSelectedHabitat(e.target.value)}
                className="w-full px-2.5 py-1.5 border rounded-lg dark:bg-forest-955 dark:border-forest-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="">All Habitats</option>
                <option value="Forest">Forest</option>
                <option value="Grassland">Grassland</option>
                <option value="Wetland">Wetland</option>
                <option value="Desert">Desert</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">IUCN Threat Level</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-2.5 py-1.5 border rounded-lg dark:bg-forest-955 dark:border-forest-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="">All Statuses</option>
                <option value="Critically Endangered">Critically Endangered</option>
                <option value="Endangered">Endangered</option>
                <option value="Vulnerable">Vulnerable</option>
                <option value="Least Concern">Least Concern</option>
              </select>
            </div>

            <Button 
              onClick={handleGeneratePreview}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-2 mt-3 font-bold"
            >
              Generate Summary Preview
            </Button>
          </div>
        </Card>

        {/* Dynamic Preview panel */}
        <Card className="lg:col-span-2 p-5 bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-850 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 font-outfit text-sm uppercase tracking-wide border-b pb-2">
              Report Live Summary Preview
            </h3>
            {previewData ? (
              <div className="space-y-3.5 text-xs text-slate-655 dark:text-slate-300">
                <div className="p-3 bg-slate-50 dark:bg-forest-955 rounded-xl border font-bold text-slate-800 dark:text-slate-100 text-center uppercase tracking-wide">
                  {previewData.title}
                </div>
                
                {reportType === 'survey' && (
                  <div className="space-y-2">
                    <div>Total surveys compiled: <span className="font-mono font-bold text-slate-850 dark:text-slate-200">{previewData.totalSurveys}</span></div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {previewData.surveysList.map((s, idx) => (
                        <div key={idx} className="p-2 bg-slate-50 dark:bg-forest-955 border rounded-lg">
                          <span className="font-bold block text-slate-800 dark:text-slate-250">Survey: {s.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono block">Date: {s.dates}</span>
                          <span className="text-[10px] text-slate-400 block">Lead Investigator: {s.investigator}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {reportType === 'population' && (
                  <div className="space-y-2">
                    <div>Species Name: <span className="font-bold text-slate-850 dark:text-slate-200">{previewData.speciesName}</span></div>
                    <div>Scientific Taxonomy Name: <span className="font-mono font-bold text-slate-850 dark:text-slate-200">{previewData.scientificName}</span></div>
                    <div>Total Sightings logged: <span className="font-bold text-slate-850 dark:text-slate-200">{previewData.totalSightings}</span></div>
                    <div>Sighted population quantity: <span className="font-bold text-slate-850 dark:text-slate-200">{previewData.sightedCount}</span></div>
                    <div>Global Population Trend: <span className="font-bold text-slate-850 dark:text-slate-200">{previewData.trend}</span></div>
                    <div>Active Distribution sites: <span className="font-bold text-slate-850 dark:text-slate-200">{previewData.distributionSites}</span></div>
                  </div>
                )}

                {reportType === 'biodiversity' && (
                  <div className="space-y-2">
                    <div>Selected Site area: <span className="font-bold text-slate-850 dark:text-slate-200">{previewData.siteName}</span></div>
                    <div>Species Richness: <span className="font-mono font-bold text-slate-850 dark:text-slate-200">{previewData.speciesRichness}</span></div>
                    <div>Calculated Shannon Index (H'): <span className="font-bold text-slate-850 dark:text-slate-200">{previewData.shannonIndex}</span></div>
                    <div>Total animals quantity observed: <span className="font-bold text-slate-850 dark:text-slate-200">{previewData.totalAnimals}</span></div>
                  </div>
                )}

                {reportType === 'habitat' && (
                  <div className="space-y-2">
                    <div>Habitat Type category: <span className="font-bold text-slate-850 dark:text-slate-200">{previewData.habitatType}</span></div>
                    <div>Total monitoring sites compiled: <span className="font-bold text-slate-850 dark:text-slate-200">{previewData.totalSites}</span></div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {previewData.sitesList.map((s, idx) => (
                        <div key={idx} className="p-2 bg-slate-50 dark:bg-forest-955 border rounded-lg">
                          <span className="font-bold block text-slate-800 dark:text-slate-250">Site: {s.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono block">Coordinates: {s.coords}</span>
                          <span className="text-[10px] text-slate-455 block font-bold">Suitability Score: {s.suitability}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {reportType === 'conservation' && (
                  <div className="space-y-2">
                    <div>Selected Threat filter: <span className="font-bold text-slate-850 dark:text-slate-200">{previewData.statusFilter}</span></div>
                    <div>Vulnerable species identified count: <span className="font-bold text-slate-850 dark:text-slate-200">{previewData.totalVulnerable}</span></div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {previewData.speciesList.map((sp, idx) => (
                        <div key={idx} className="p-2 bg-slate-50 dark:bg-forest-955 border rounded-lg flex justify-between items-center">
                          <div>
                            <span className="font-bold block text-slate-800 dark:text-slate-250">{sp.name}</span>
                            <span className="text-[10px] text-slate-400">Diet Type: {sp.diet}</span>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[9px] font-black">{sp.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400 italic text-xs space-y-1">
                <FileText className="w-8 h-8 text-slate-300" />
                <span>Select criteria and click generate to view dynamic preview.</span>
              </div>
            )}
          </div>
          
          <div className="flex gap-3 mt-6 border-t pt-4">
            <Button 
              disabled={!previewData} 
              icon={FileText} 
              onClick={() => handleDownload(reportType, previewData?.title || 'Wildlife')}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs py-2 font-bold justify-center"
            >
              Export PDF Report
            </Button>
            <Button 
              disabled={!previewData} 
              icon={FileSpreadsheet} 
              onClick={() => handleExcelDownload(reportType, previewData?.title || 'Wildlife')}
              className="flex-1 bg-blue-600 hover:bg-blue-750 text-white rounded-xl text-xs py-2 font-bold justify-center"
            >
              Export Excel Spreadsheet
            </Button>
          </div>
        </Card>
      </div>

      {/* Global Reports grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-850 flex flex-col justify-between shadow-sm hover:scale-[1.02] transition-transform duration-300">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-955 flex items-center justify-center text-emerald-600 border border-emerald-100/50">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-800 dark:text-slate-100 font-outfit text-sm">Population Analytics</h3>
                <span className="text-[9px] font-bold text-slate-400 block tracking-wider uppercase font-mono">GLOBAL SUMMARY</span>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-semibold">
              Downloads a comprehensive summary of monthly species sighting counts, density distributions, regression forecasts, and alerts.
            </p>
          </div>
          <Button 
            onClick={() => handleDownload('population', 'Population Analytics')}
            className="mt-5 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white w-full rounded-xl"
          >
            <Download className="w-4 h-4" /> Download PDF Report
          </Button>
        </Card>

        <Card className="p-6 bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-850 flex flex-col justify-between shadow-sm hover:scale-[1.02] transition-transform duration-300">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-955 flex items-center justify-center text-indigo-650 border border-indigo-100/50">
                <Sprout className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-800 dark:text-slate-100 font-outfit text-sm">Ecological Intelligence</h3>
                <span className="text-[9px] font-bold text-slate-400 block tracking-wider uppercase font-mono">BIODIVERSITY CENSUS</span>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-semibold">
              Downloads summary index of species richness, Shannon biodiversity, suitability indices, and our weighted Wildlife Health Score.
            </p>
          </div>
          <Button 
            onClick={() => handleDownload('ecology', 'AI Ecological Intelligence')}
            className="mt-5 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-750 text-white w-full rounded-xl"
          >
            <Download className="w-4 h-4" /> Download PDF Report
          </Button>
        </Card>

        <Card className="p-6 bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-850 flex flex-col justify-between shadow-sm hover:scale-[1.02] transition-transform duration-300">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-955 flex items-center justify-center text-blue-600 border border-blue-100/50">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-800 dark:text-slate-100 font-outfit text-sm">Habitat Suitability</h3>
                <span className="text-[9px] font-bold text-slate-400 block tracking-wider uppercase font-mono">SITE CONSTRAINTS</span>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-semibold">
              Downloads microclimates, canopy vegetation densities, health rankings, and risk alert reports across monitoring sites.
            </p>
          </div>
          <Button 
            onClick={() => handleDownload('habitat', 'Habitat Intelligence')}
            className="mt-5 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white w-full rounded-xl"
          >
            <Download className="w-4 h-4" /> Download PDF Report
          </Button>
        </Card>
      </div>

      {toastMsg && (
        <Toast
          message={toastMsg.text}
          type={toastMsg.type}
          onClose={() => setToastMsg(null)}
        />
      )}
    </div>
  );
};

export default Reports;
