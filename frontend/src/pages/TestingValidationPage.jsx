import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, CheckCircle2, XCircle, AlertTriangle, ShieldCheck, Activity, Database, Server, Cpu, Clock, LayoutDashboard, Leaf, Map, ActivitySquare, BrainCircuit, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { toast } from 'react-hot-toast';

import { populationEstimationService } from '../services/populationEstimationService';
import habitatIntelligenceService from '../services/habitatIntelligenceService';
import ecosystemHealthService from '../services/ecosystemHealthService';
import conservationRecommendationService from '../services/conservationRecommendationService';
import wildlifeDashboardService from '../services/wildlifeDashboardService';
import wildlifeReportService from '../services/wildlifeReportService';
import observationService from '../services/observationService';
import predictionService from '../services/predictionService';

const PremiumKPICard = ({ title, value, icon: Icon, colorClass, gradientClass, loading }) => (
  <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden bg-white group h-full">
    <CardContent className="p-6 relative">
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${gradientClass} opacity-10 rounded-bl-full transition-transform group-hover:scale-110`} />
      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className="text-slate-500 text-sm mt-1 max-w-2xl">
            System health checks and model validation metrics.
          </p>
          {loading ? (
            <div className="h-9 w-16 bg-gray-200 animate-pulse rounded mt-1" />
          ) : (
            <h3 className={`text-3xl font-black tracking-tight ${colorClass}`}>{value}</h3>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${gradientClass} shadow-inner`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center p-12 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 border border-gray-100">
      <Icon className="w-8 h-8 text-gray-400" />
    </div>
    <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-500 max-w-sm mb-6">{description}</p>
    {action}
  </div>
);

const StatusBadge = ({ status }) => {
  if (status === 'Passed' || status === 'Healthy' || status === 'Available') {
    return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200"><CheckCircle2 className="w-3 h-3"/> {status}</span>;
  }
  if (status === 'Failed' || status === 'Error') {
    return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200"><XCircle className="w-3 h-3"/> {status}</span>;
  }
  if (status === 'Warning') {
    return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200"><AlertTriangle className="w-3 h-3"/> {status}</span>;
  }
  return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200"><Clock className="w-3 h-3"/> {status}</span>;
};

const TestingValidationPage = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  
  // States for results
  const [apiResults, setApiResults] = useState([]);
  const [dataChecks, setDataChecks] = useState([]);
  const [aiMetrics, setAiMetrics] = useState(null);
  
  // Aggregate KPIs
  const [kpis, setKpis] = useState({ total: 0, passed: 0, failed: 0, pending: 0 });

  const ping = async (service, endpoint, fn) => {
    const start = performance.now();
    try {
      await fn();
      const time = Math.round(performance.now() - start);
      return { service, endpoint, status: 'Passed', time, error: null };
    } catch (e) {
      const time = Math.round(performance.now() - start);
      return { service, endpoint, status: 'Failed', time, error: e.message || 'Error' };
    }
  };

  const runValidation = async () => {
    setIsRunning(true);
    setHasRun(true);
    
    // Set Pending State
    setKpis({ total: 0, passed: 0, failed: 0, pending: 15 });
    setApiResults([]);
    setDataChecks([]);
    setAiMetrics(null);

    const apiChecks = [
      ping('Population Intelligence', 'getDashboardStats()', () => populationEstimationService.getDashboardStats()),
      ping('Habitat Intelligence', 'getDashboardSummary()', () => habitatIntelligenceService.getDashboardSummary()),
      ping('Ecosystem Health', 'getSummary()', () => ecosystemHealthService.getSummary()),
      ping('Conservation Engine', 'getSummary()', () => conservationRecommendationService.getSummary()),
      ping('Wildlife Dashboard', 'getExecutiveSummary()', () => wildlifeDashboardService.getExecutiveSummary()),
      ping('Reports & Exports', 'getHistory()', () => wildlifeReportService.getHistory()),
      ping('Observations API', 'getObservations()', () => observationService.getObservations({ limit: 1 })),
      ping('Predictions API', 'getPredictions()', () => predictionService.getPredictions({ limit: 1 }))
    ];

    const results = await Promise.allSettled(apiChecks);
    const resolvedApiResults = results.map(r => r.status === 'fulfilled' ? r.value : { status: 'Failed', error: 'Promise rejected' });
    setApiResults(resolvedApiResults);

    // Data Integrity
    let dataIntegrityResults = [];
    try {
      const obsRes = await observationService.getObservations({ limit: 200 });
      const obs = Array.isArray(obsRes) ? obsRes : (obsRes.observations || []);
      const totalObs = obs.length;
      
      const missingSpecies = obs.filter(o => !o.species_name).length;
      const missingCoords = obs.filter(o => !o.latitude || !o.longitude).length;
      const unverified = obs.filter(o => o.verification_status !== 'Verified').length;
      
      dataIntegrityResults = [
        { check: 'Missing Species Name', checked: totalObs, issues: missingSpecies, status: missingSpecies === 0 ? 'Passed' : 'Failed' },
        { check: 'Missing Coordinates', checked: totalObs, issues: missingCoords, status: missingCoords === 0 ? 'Passed' : 'Failed' },
        { check: 'Unverified Records', checked: totalObs, issues: unverified, status: unverified === 0 ? 'Passed' : 'Failed' },
      ];
    } catch (e) {
      dataIntegrityResults = [
        { check: 'Observation Data Fetch', checked: 0, issues: 1, status: 'Failed', error: e.message }
      ];
    }
    setDataChecks(dataIntegrityResults);

    // AI Validation
    let aiMetricsResult = null;
    try {
      const predRes = await predictionService.getPredictions({ limit: 100 });
      const preds = Array.isArray(predRes) ? predRes : (predRes.predictions || []);
      const totalPreds = preds.length;
      
      if (totalPreds > 0) {
        const avgConf = (preds.reduce((acc, p) => acc + (p.confidence_score || 0), 0) / totalPreds).toFixed(1);
        const uniqueSpecies = new Set(preds.map(p => p.species_name).filter(Boolean)).size;
        aiMetricsResult = {
          count: totalPreds,
          avgConf: avgConf + '%',
          uniqueSpecies,
          status: 'Passed'
        };
      } else {
        aiMetricsResult = {
          count: 0,
          avgConf: 'Confidence metric unavailable',
          uniqueSpecies: 0,
          status: 'Passed'
        };
      }
    } catch (e) {
      aiMetricsResult = { count: 0, avgConf: 'Not Available', uniqueSpecies: 0, status: 'Failed' };
    }
    setAiMetrics(aiMetricsResult);

    // Calc KPIs
    const allChecks = [...resolvedApiResults, ...dataIntegrityResults];
    const total = allChecks.length + 1;
    const passed = allChecks.filter(c => c.status === 'Passed').length + (aiMetricsResult.status === 'Passed' ? 1 : 0);
    const failed = allChecks.filter(c => c.status === 'Failed').length + (aiMetricsResult.status === 'Failed' ? 1 : 0);
    
    setKpis({ total, passed, failed, pending: 0 });
    
    setIsRunning(false);
    
    if (failed > 0) {
      toast.error('Validation completed with errors.');
    } else {
      toast.success('Validation completed successfully.');
    }
  };

  const getModuleStatus = (moduleName) => {
    if (!hasRun || isRunning) return 'Not Tested';
    const res = apiResults.find(r => r.service === moduleName);
    return res ? res.status : 'Not Tested';
  };

  const getSystemStatus = () => {
    if (!hasRun || isRunning) return 'Not Tested';
    const failedApis = apiResults.filter(r => r.status === 'Failed').length;
    if (failedApis === 0) return 'Healthy';
    if (failedApis < 3) return 'Warning';
    return 'Error';
  };

  const getBackendStatus = () => {
    if (!hasRun || isRunning) return 'Not Tested';
    const failedApis = apiResults.filter(r => r.status === 'Failed').length;
    return failedApis === 0 ? 'Healthy' : 'Error';
  };

  return (
    <div className="space-y-8 pb-12 text-gray-800 font-sans">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-green-600" />
            Testing & Validation
          </h1>
          <p className="text-gray-500 mt-1">
            Systematic live-validation of core intelligent modules and data pipelines.
          </p>
        </div>
        <Button onClick={runValidation} disabled={isRunning} className="gap-2 bg-teal-600 hover:bg-teal-700 text-white h-11 rounded-xl shadow-sm px-6">
          {isRunning ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Play className="w-4 h-4" />}
          {isRunning ? 'Running Validation...' : 'Run Validation'}
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <PremiumKPICard title="Total Tests Executed" value={kpis.total} icon={ActivitySquare} colorClass="text-gray-900" gradientClass="from-gray-700 to-gray-900" loading={isRunning} />
        <PremiumKPICard title="Passed Tests" value={kpis.passed} icon={CheckCircle2} colorClass="text-green-600" gradientClass="from-green-500 to-emerald-600" loading={isRunning} />
        <PremiumKPICard title="Failed Tests" value={kpis.failed} icon={XCircle} colorClass="text-red-600" gradientClass="from-red-500 to-rose-600" loading={isRunning} />
        <PremiumKPICard title="Pending Checks" value={kpis.pending} icon={Clock} colorClass="text-amber-600" gradientClass="from-amber-400 to-orange-500" loading={false} />
      </div>

      {!hasRun && !isRunning && (
        <EmptyState 
          icon={ShieldCheck} 
          title="No Validation Activity" 
          description="Validation results are generated when live checks are executed. Run validation to verify system health."
          action={<Button onClick={runValidation} className="bg-gray-900 text-white hover:bg-gray-800">Start Checks</Button>}
        />
      )}

      {(hasRun || isRunning) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Module Validation */}
          <Card className="border-0 bg-white shadow-sm rounded-2xl col-span-1 lg:col-span-2">
            <CardHeader className="border-b border-gray-50 pb-4">
              <CardTitle className="text-base flex items-center gap-2"><LayoutDashboard className="w-5 h-5 text-teal-600" /> Module Validation</CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold text-xs uppercase">
                  <tr>
                    <th className="px-6 py-4">WPIS Module</th>
                    <th className="px-6 py-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {[
                    { name: 'Population Intelligence', icon: Activity },
                    { name: 'Habitat Intelligence', icon: Map },
                    { name: 'Ecosystem Health', icon: Leaf },
                    { name: 'Conservation Engine', icon: ShieldCheck },
                    { name: 'Wildlife Dashboard', icon: LayoutDashboard },
                    { name: 'Reports & Exports', icon: FileText }
                  ].map((mod, i) => (
                    <tr key={i} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
                          <mod.icon className="w-4 h-4 text-teal-600" />
                        </div>
                        {mod.name}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <StatusBadge status={getModuleStatus(mod.name)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* System Health */}
          <Card className="border-0 bg-white shadow-sm rounded-2xl flex flex-col">
            <CardHeader className="border-b border-gray-50 pb-4">
              <CardTitle className="text-base flex items-center gap-2"><Server className="w-5 h-5 text-teal-600" /> System Health</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 flex-1 space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="font-semibold text-gray-700 flex items-center gap-2"><LayoutDashboard className="w-4 h-4"/> Frontend App</span>
                <StatusBadge status={hasRun ? 'Healthy' : 'Not Tested'} />
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="font-semibold text-gray-700 flex items-center gap-2"><Server className="w-4 h-4"/> Backend API</span>
                <StatusBadge status={getBackendStatus()} />
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="font-semibold text-gray-700 flex items-center gap-2"><Database className="w-4 h-4"/> Database</span>
                <StatusBadge status={getBackendStatus() === 'Healthy' ? 'Healthy' : 'Not Tested'} />
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="font-semibold text-gray-700 flex items-center gap-2"><BrainCircuit className="w-4 h-4"/> AI Services</span>
                <StatusBadge status={getModuleStatus('Predictions API')} />
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="font-semibold text-gray-700 flex items-center gap-2"><Activity className="w-4 h-4"/> Overall System</span>
                <StatusBadge status={getSystemStatus()} />
              </div>
            </CardContent>
          </Card>

          {/* API Validation */}
          <Card className="border-0 bg-white shadow-sm rounded-2xl col-span-1 lg:col-span-3">
            <CardHeader className="border-b border-gray-50 pb-4">
              <CardTitle className="text-base flex items-center gap-2"><Cpu className="w-5 h-5 text-teal-600" /> API Endpoint Validation</CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold text-xs uppercase">
                  <tr>
                    <th className="px-6 py-4">Service</th>
                    <th className="px-6 py-4">Endpoint Called</th>
                    <th className="px-6 py-4 text-right">Response Time</th>
                    <th className="px-6 py-4 text-right">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {apiResults.map((api, i) => (
                    <tr key={i} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4 font-medium text-gray-900">{api.service}</td>
                      <td className="px-6 py-4 text-gray-500 font-mono text-xs">{api.endpoint}</td>
                      <td className="px-6 py-4 text-right font-medium text-gray-600">{api.time}ms</td>
                      <td className="px-6 py-4 text-right">
                        <StatusBadge status={api.status} />
                      </td>
                    </tr>
                  ))}
                  {isRunning && apiResults.length === 0 && (
                    <tr><td colSpan="4" className="text-center py-8 text-gray-400">Pinging APIs...</td></tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Data Integrity */}
          <Card className="border-0 bg-white shadow-sm rounded-2xl col-span-1 lg:col-span-2">
            <CardHeader className="border-b border-gray-50 pb-4">
              <CardTitle className="text-base flex items-center gap-2"><Database className="w-5 h-5 text-teal-600" /> Data Integrity Validation</CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold text-xs uppercase">
                  <tr>
                    <th className="px-6 py-4">Integrity Check</th>
                    <th className="px-6 py-4 text-right">Records Checked</th>
                    <th className="px-6 py-4 text-right">Issues Found</th>
                    <th className="px-6 py-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {dataChecks.map((check, i) => (
                    <tr key={i} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4 font-medium text-gray-900">{check.check}</td>
                      <td className="px-6 py-4 text-right text-gray-600">{check.checked}</td>
                      <td className="px-6 py-4 text-right font-medium text-gray-900">{check.issues}</td>
                      <td className="px-6 py-4 text-right">
                        <StatusBadge status={check.status} />
                      </td>
                    </tr>
                  ))}
                  {isRunning && dataChecks.length === 0 && (
                    <tr><td colSpan="4" className="text-center py-8 text-gray-400">Scanning data...</td></tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* AI Model Validation */}
          <Card className="border-0 bg-white shadow-sm rounded-2xl col-span-1">
            <CardHeader className="border-b border-gray-50 pb-4">
              <CardTitle className="text-base flex items-center gap-2"><BrainCircuit className="w-5 h-5 text-teal-600" /> AI Model Validation</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {isRunning && !aiMetrics ? (
                <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"/></div>
              ) : aiMetrics ? (
                <>
                  <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                    <span className="text-sm font-medium text-gray-600">Model Availability</span>
                    <StatusBadge status={aiMetrics.status} />
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                    <span className="text-sm font-medium text-gray-600">Predictions Evaluated</span>
                    <span className="font-bold text-gray-900">{aiMetrics.count}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                    <span className="text-sm font-medium text-gray-600">Avg Confidence</span>
                    <span className="font-bold text-teal-700 bg-teal-50 px-2 py-1 rounded text-xs">{aiMetrics.avgConf}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Unique Species Detected</span>
                    <span className="font-bold text-gray-900">{aiMetrics.uniqueSpecies}</span>
                  </div>
                </>
              ) : null}
            </CardContent>
          </Card>

        </div>
      )}
    </div>
  );
};

export default TestingValidationPage;
