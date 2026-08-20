import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Download, Printer, Filter, X, Search, ChevronLeft, ChevronRight,
  Activity, MapPin, Users, Camera, CheckCircle2, Clock, AlertCircle, Leaf,
  Target, TrendingUp, ChevronDown, ChevronUp, RotateCcw, ExternalLink, BarChart2
} from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { toast } from 'react-hot-toast';

import reportService from '../services/reportService';
import siteService from '../services/siteService';

// ─── Design tokens ───────────────────────────────────────────────────────────
const SPECIES_COLORS  = ['#22c55e','#3b82f6','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#ec4899','#14b8a6'];
const STATUS_COLORS   = { 'Verified': '#22c55e', 'Pending Validation': '#f59e0b', 'Pending': '#f59e0b', 'Rejected': '#ef4444' };

const EMPTY_FILTERS = {
  start_date: '', end_date: '', species: '', monitoring_site_id: '', verification_status: '', search: ''
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const a   = document.createElement('a');
  a.href    = url;
  a.setAttribute('download', filename);
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

const StatusBadge = ({ status }) => {
  const map = {
    'Verified':          'bg-green-100 text-green-700 border-green-200',
    'Pending Validation':'bg-orange-100 text-orange-700 border-orange-200',
    'Pending':           'bg-orange-100 text-orange-700 border-orange-200',
    'Rejected':          'bg-red-100 text-red-700 border-red-200',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-xs font-medium ${map[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
};

const SkeletonCard = () => (
  <div className="h-32 bg-gray-200 rounded-2xl animate-pulse" />
);
const SkeletonChart = ({ h = 320 }) => (
  <div className={`bg-gray-200 rounded-2xl animate-pulse`} style={{ height: h }} />
);

// ─── Main Component ───────────────────────────────────────────────────────────
const ReportsPage = () => {
  // ── Filter state
  const [draftFilters, setDraftFilters] = useState({ ...EMPTY_FILTERS });
  const [activeFilters, setActiveFilters] = useState({ ...EMPTY_FILTERS });
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // ── Data state
  const [summary,  setSummary]  = useState(null);
  const [charts,   setCharts]   = useState(null);
  const [obsData,  setObsData]  = useState({ observations: [], total: 0 });
  const [sites,    setSites]    = useState([]);

  // ── Table state
  const [page,      setPage]      = useState(0);
  const PAGE_SIZE = 10;
  const [sortBy,    setSortBy]    = useState('observed_at');
  const [sortOrder, setSortOrder] = useState(-1);

  // ── UI state
  const [isLoadingSummary,  setIsLoadingSummary]  = useState(true);
  const [isLoadingCharts,   setIsLoadingCharts]   = useState(true);
  const [isLoadingTable,    setIsLoadingTable]    = useState(true);
  const [isLoadingSites,    setIsLoadingSites]    = useState(true);
  const [error,             setError]             = useState(null);

  const fetchAbort = useRef(null);

  // ── Active filter count badge
  const activeFilterCount = Object.entries(activeFilters).filter(([, v]) => v !== '').length;

  // ─── Load sites once ──────────────────────────────────────────────────────
  useEffect(() => {
    siteService.getSites()
      .then(setSites)
      .catch(() => {})
      .finally(() => setIsLoadingSites(false));
  }, []);

  // ─── Load report data whenever filters / page / sort change ─────────────
  const loadAll = useCallback(async () => {
    if (fetchAbort.current) fetchAbort.current.abort();
    fetchAbort.current = new AbortController();

    setError(null);
    setIsLoadingSummary(true);
    setIsLoadingCharts(true);
    setIsLoadingTable(true);

    const filters = activeFilters;
    try {
      const [sum, chartData, obs] = await Promise.all([
        reportService.getSummary(filters),
        reportService.getSpeciesData(filters),
        reportService.getObservations(filters, page * PAGE_SIZE, PAGE_SIZE, sortBy, sortOrder),
      ]);
      setSummary(sum);
      setCharts(chartData);
      setObsData(obs);
    } catch (err) {
      if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
        setError('Failed to load report data. Please try again.');
        toast.error('Failed to load report data.');
      }
    } finally {
      setIsLoadingSummary(false);
      setIsLoadingCharts(false);
      setIsLoadingTable(false);
    }
  }, [activeFilters, page, sortBy, sortOrder]);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const applyFilters = (e) => {
    e?.preventDefault();
    setActiveFilters({ ...draftFilters });
    setPage(0);
    setIsFilterOpen(false);
  };

  const resetFilters = () => {
    setDraftFilters({ ...EMPTY_FILTERS });
    setActiveFilters({ ...EMPTY_FILTERS });
    setPage(0);
    setIsFilterOpen(false);
  };

  const handleSort = (col) => {
    if (sortBy === col) setSortOrder(o => o === -1 ? 1 : -1);
    else { setSortBy(col); setSortOrder(-1); }
    setPage(0);
  };

  const SortIcon = ({ col }) => {
    if (sortBy !== col) return <ChevronDown className="w-3 h-3 opacity-30 inline ml-1" />;
    return sortOrder === -1
      ? <ChevronDown className="w-3 h-3 inline ml-1 text-primary" />
      : <ChevronUp   className="w-3 h-3 inline ml-1 text-primary" />;
  };

  const handleExport = async (type) => {
    const toastId = toast.loading(`Generating ${type.toUpperCase()} report…`);
    try {
      const blob = type === 'pdf'
        ? await reportService.exportPdf(activeFilters)
        : await reportService.exportExcel(activeFilters);
      downloadBlob(blob, `WPIS_Report_${new Date().toISOString().slice(0,10)}.${type === 'pdf' ? 'pdf' : 'xlsx'}`);
      toast.success(`${type.toUpperCase()} downloaded!`, { id: toastId });
    } catch {
      toast.error(`Failed to export ${type.toUpperCase()}`, { id: toastId });
    }
  };

  // ─── Animations ───────────────────────────────────────────────────────────
  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const item      = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } } };

  // ─── Error State ──────────────────────────────────────────────────────────
  if (error && !summary) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-5">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Failed to Load Reports</h2>
        <p className="text-slate-500 text-sm mt-1 max-w-2xl">
            Legacy report generation and data extraction utilities.
          </p>
        <Button onClick={loadAll} className="gap-2"><RotateCcw className="w-4 h-4" /> Retry</Button>
      </div>
    );
  }

  // ─── Derived chart data ───────────────────────────────────────────────────
  const verificationData = (charts?.verification_distribution || []).map(v => ({
    name:  v.status,
    value: v.count,
    fill:  STATUS_COLORS[v.status] || '#9ca3af',
  }));

  const totalPages = Math.ceil(obsData.total / PAGE_SIZE);
  const hasNextPage = (page + 1) < totalPages;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-7 pb-12">

      {/* ── Page Header ── */}
      <motion.div variants={item} className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-8 h-8 text-green-600" />
            Reports & Exports
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Generate, filter, and export wildlife observation analytics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Filter toggle */}
          <Button
            variant={activeFilterCount > 0 ? 'default' : 'outline'}
            className="gap-2 relative"
            onClick={() => setIsFilterOpen(f => !f)}
          >
            <Filter className="w-4 h-4" />
            {activeFilterCount > 0 ? `Filters (${activeFilterCount})` : 'Filters'}
            {activeFilterCount > 0 && (
              <span
                onClick={(e) => { e.stopPropagation(); resetFilters(); }}
                className="ml-1 text-xs rounded-full bg-white/25 hover:bg-white/40 px-1.5 cursor-pointer"
              >✕</span>
            )}
          </Button>

          {/* Export buttons */}
          <Button variant="outline" className="gap-2 bg-white" onClick={() => handleExport('pdf')}>
            <FileText className="w-4 h-4 text-red-500" /> Export PDF
          </Button>
          <Button variant="outline" className="gap-2 bg-white" onClick={() => handleExport('excel')}>
            <Download className="w-4 h-4 text-green-600" /> Export Excel
          </Button>
          <Button variant="outline" className="gap-2 bg-white" onClick={() => window.print()}>
            <Printer className="w-4 h-4" /> Print
          </Button>
        </div>
      </motion.div>

      {/* ── Filter Panel ── */}
      <AnimatePresence>
        {isFilterOpen && (
          <motion.div
            key="filter-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <Card className="border-0 bg-white shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 rounded-2xl">
              <CardContent className="p-5">
                <form onSubmit={applyFilters}>
                  {/* Search bar spanning full width */}
                  <div className="mb-4">
                    <Label className="mb-1 block">Search</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        className="pl-9"
                        placeholder="Search species, observer, site…"
                        value={draftFilters.search}
                        onChange={e => setDraftFilters(f => ({ ...f, search: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="space-y-1.5">
                      <Label>Start Date</Label>
                      <Input type="date"
                        value={draftFilters.start_date}
                        onChange={e => setDraftFilters(f => ({ ...f, start_date: e.target.value }))} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>End Date</Label>
                      <Input type="date"
                        value={draftFilters.end_date}
                        onChange={e => setDraftFilters(f => ({ ...f, end_date: e.target.value }))} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Species</Label>
                      <Input
                        placeholder="e.g. Tiger"
                        value={draftFilters.species}
                        onChange={e => setDraftFilters(f => ({ ...f, species: e.target.value }))} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Monitoring Site</Label>
                      <select className="flex w-full border bg-background text-sm focus: h-11 rounded-xl px-4 py-2.5 border-border/60 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300"
                        value={draftFilters.monitoring_site_id}
                        onChange={e => setDraftFilters(f => ({ ...f, monitoring_site_id: e.target.value }))}
                      >
                        <option value="">All Sites</option>
                        {sites.map(s => <option key={s.id || s._id} value={s.id || s._id}>{s.site_name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Verification Status</Label>
                      <select className="flex w-full border bg-background text-sm focus: h-11 rounded-xl px-4 py-2.5 border-border/60 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300"
                        value={draftFilters.verification_status}
                        onChange={e => setDraftFilters(f => ({ ...f, verification_status: e.target.value }))}
                      >
                        <option value="">All Statuses</option>
                        <option value="Verified">Verified</option>
                        <option value="Pending Validation">Pending</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-5">
                    <Button type="button" variant="ghost" onClick={resetFilters} className="gap-2">
                      <RotateCcw className="w-3.5 h-3.5" /> Reset Filters
                    </Button>
                    <Button type="submit">Apply Filters</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── KPI Summary Cards ── */}
      <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {isLoadingSummary
          ? [1,2,3,4].map(i => <SkeletonCard key={i} />)
          : [
              { label: 'Total Species',       value: summary?.total_species,        icon: Leaf,          bg: 'bg-emerald-100', ic: 'text-emerald-600' },
              { label: 'Total Observations',  value: summary?.total_observations,   icon: Activity,      bg: 'bg-blue-100',    ic: 'text-blue-600' },
              { label: 'Verified Records',    value: summary?.verified_observations, icon: CheckCircle2,  bg: 'bg-green-100',   ic: 'text-green-600' },
              { label: 'Pending Validation',  value: summary?.pending_observations, icon: Clock,         bg: 'bg-orange-100',  ic: 'text-orange-600' },
            ].map(({ label, value, icon: Icon, bg, ic }) => (
              <motion.div key={label} whileHover={{ scale: 1.02, y: -3 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
                <Card className="border-0 bg-white h-full shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 rounded-2xl">
                  <CardContent className="p-5 flex flex-col justify-between h-full">
                    <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                      <Icon className={`w-5 h-5 ${ic}`} />
                    </div>
                    <div>
                      <p className="text-2xl font-black text-foreground tracking-tight">{(value ?? 0).toLocaleString()}</p>
                      <p className="text-xs font-medium text-muted-foreground mt-0.5">{label}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
        }
      </motion.div>

      {/* ── Secondary KPI row ── */}
      <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {isLoadingSummary
          ? [1,2,3,4].map(i => <SkeletonCard key={i} />)
          : [
              { label: 'Monitoring Sites', value: summary?.total_monitoring_sites, icon: MapPin,  bg: 'bg-violet-100', ic: 'text-violet-600' },
              { label: 'Sensor Devices',   value: summary?.total_sensor_devices,   icon: Camera,  bg: 'bg-cyan-100',   ic: 'text-cyan-600' },
              { label: 'Field Uploads',    value: summary?.total_uploads,           icon: Download,bg: 'bg-pink-100',   ic: 'text-pink-600' },
              { label: 'Registered Users', value: summary?.total_users,             icon: Users,   bg: 'bg-amber-100',  ic: 'text-amber-600' },
            ].map(({ label, value, icon: Icon, bg, ic }) => (
              <Card key={label} className="border-0 bg-white shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 rounded-2xl">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-5 h-5 ${ic}`} />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-foreground">{(value ?? 0).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{label}</p>
                  </div>
                </CardContent>
              </Card>
            ))
        }
      </motion.div>

      {/* ── Charts Row ── */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Species Distribution Pie */}
        <Card className="border-0 bg-white lg:col-span-1 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 rounded-2xl">
          <CardHeader className="border-b border-gray-50 pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-primary" /> Species Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 h-[280px]">
            {isLoadingCharts ? <SkeletonChart h={240} /> :
             !charts?.species_distribution?.length ? (
               <div className="flex items-center justify-center h-full text-muted-foreground text-sm">No data</div>
             ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.species_distribution.slice(0, 6)}
                    cx="50%" cy="50%"
                    innerRadius={55} outerRadius={80}
                    paddingAngle={4}
                    dataKey="count" nameKey="species"
                  >
                    {charts.species_distribution.slice(0, 6).map((_, i) => (
                      <Cell key={i} fill={SPECIES_COLORS[i % SPECIES_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val, name, { payload }) => [val, payload.species]}
                    contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }}
                  />
                  <Legend
                    formatter={(value, { payload }) => payload.species}
                    iconType="circle" iconSize={8}
                    wrapperStyle={{ fontSize: 11 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Monthly Area Chart */}
        <Card className="border-0 bg-white lg:col-span-2 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 rounded-2xl">
          <CardHeader className="border-b border-gray-50 pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Monthly Observations
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 h-[280px]">
            {isLoadingCharts ? <SkeletonChart h={240} /> :
             !charts?.monthly_observations?.length ? (
               <div className="flex items-center justify-center h-full text-muted-foreground text-sm">No data</div>
             ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts.monthly_observations} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorObs" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}    />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }} />
                  <Area type="monotone" dataKey="count" name="Observations" stroke="#22c55e" strokeWidth={2.5} fill="url(#colorObs)" dot={{ r: 3, fill: '#22c55e' }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Verification Status Donut ── */}
      {!isLoadingCharts && verificationData.length > 0 && (
        <motion.div variants={item}>
          <Card className="border-0 bg-white shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 rounded-2xl">
            <CardHeader className="border-b border-gray-50 pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" /> Verification Status Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={verificationData}
                    cx="50%" cy="50%"
                    innerRadius={60} outerRadius={85}
                    paddingAngle={4}
                    dataKey="value" nameKey="name"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {verificationData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }} />
                  <Legend iconType="circle" iconSize={9} wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ── Observation Table ── */}
      <motion.div variants={item}>
        <Card className="border-0 bg-white overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 rounded-2xl">
          <CardHeader className="border-b border-gray-100 flex flex-row items-center justify-between py-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" /> Observation Records
            </CardTitle>
            <span className="text-xs text-muted-foreground">
              {obsData.total > 0 ? `Showing ${page * PAGE_SIZE + 1}–${Math.min((page+1)*PAGE_SIZE, obsData.total)} of ${obsData.total}` : ''}
            </span>
          </CardHeader>

          <CardContent className="p-0">
            {isLoadingTable ? (
              <div className="flex justify-center py-16">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : obsData.observations.length === 0 ? (
              /* ── Empty state ── */
              <div className="py-20 flex flex-col items-center text-center px-4">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-5">
                  <Search className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1">No observations found</h3>
                <p className="text-muted-foreground text-sm mb-6 max-w-sm">
                  Try adjusting your filters or expanding the date range to find matching records.
                </p>
                <Button variant="outline" onClick={resetFilters} className="gap-2">
                  <RotateCcw className="w-4 h-4" /> Reset Filters
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-border/50 shadow-sm">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-gray-50 border-b border-gray-100 sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur z-10">
                    <tr>
                      {/* Thumbnail */}
                      <th className="px-4 py-3 font-medium w-14">Img</th>

                      {/* Sortable columns */}
                      {[
                        { label: 'Species',  col: 'species_name' },
                        { label: 'Confidence', col: 'confidence_score' },
                        { label: 'Observer', col: 'observer_name' },
                        { label: 'Site',     col: 'monitoring_site_name' },
                        { label: 'Date',     col: 'observed_at' },
                        { label: 'Status',   col: 'verification_status' },
                      ].map(({ label, col }) => (
                        <th
                          key={col}
                          className="px-4 py-3 font-medium cursor-pointer hover:text-foreground select-none"
                          onClick={() => handleSort(col)}
                        >
                          {label}<SortIcon col={col} />
                        </th>
                      ))}

                      {/* Actions */}
                      <th className="px-4 py-3 font-medium">View</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence mode="wait">
                      {obsData.observations.map((obs, i) => (
                        <motion.tr
                          key={obs.id || obs._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ delay: i * 0.03 }}
                          className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors"
                        >
                          {/* Thumbnail */}
                          <td className="px-4 py-3">
                            {obs.file_url ? (
                              <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-100 bg-gray-50 shrink-0">
                                <img loading="lazy"
                                  src={obs.file_url}
                                  alt={obs.species_name}
                                  className="w-full h-full object-cover"
                                  onError={e => { e.target.style.display = 'none'; }}
                                />
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                <Target className="w-4 h-4 text-primary" />
                              </div>
                            )}
                          </td>

                          {/* Species */}
                          <td className="px-4 py-3">
                            <p className="font-semibold text-foreground">{obs.species_name}</p>
                            {obs.scientific_name && (
                              <p className="text-xs text-muted-foreground italic">{obs.scientific_name}</p>
                            )}
                          </td>

                          {/* Confidence */}
                          <td className="px-4 py-3">
                            {obs.confidence_score != null ? (
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${
                                obs.confidence_score >= 90 ? 'bg-green-100 text-green-700 border-green-200' :
                                obs.confidence_score >= 70 ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                                'bg-red-100 text-red-700 border-red-200'
                              }`}>
                                {obs.confidence_score}%
                              </span>
                            ) : (
                              <span className="text-muted-foreground text-xs">—</span>
                            )}
                          </td>

                          {/* Observer */}
                          <td className="px-4 py-3 text-muted-foreground">{obs.observer_name}</td>

                          {/* Site */}
                          <td className="px-4 py-3 text-muted-foreground">{obs.monitoring_site_name}</td>

                          {/* Date */}
                          <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                            {new Date(obs.observed_at).toLocaleDateString()}
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3"><StatusBadge status={obs.verification_status} /></td>

                          {/* View Details */}
                          <td className="px-4 py-3">
                            {obs.file_url && (
                              <a
                                href={obs.file_url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                              >
                                <ExternalLink className="w-3 h-3" /> View
                              </a>
                            )}
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>

          {/* ── Pagination ── */}
          {obsData.total > PAGE_SIZE && (
            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
              <Button
                variant="outline" size="sm"
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0 || isLoadingTable}
                className="gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </Button>
              <span className="text-xs text-muted-foreground">
                Page <span className="font-semibold text-foreground">{page + 1}</span> of {totalPages}
              </span>
              <Button
                variant="outline" size="sm"
                onClick={() => setPage(p => p + 1)}
                disabled={!hasNextPage || isLoadingTable}
                className="gap-1"
              >
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default ReportsPage;
