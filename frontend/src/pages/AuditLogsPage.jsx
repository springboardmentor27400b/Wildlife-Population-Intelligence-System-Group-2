import React, { useState, useEffect, useMemo, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, Download, ChevronLeft, ChevronRight, Calendar, User, 
  X, Activity, ShieldAlert, Table, Clock, Info, AlertTriangle, CheckCircle2, XCircle, ChevronDown, RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'react-hot-toast';
import auditLogService from '../services/auditLogService';

const SEVERITIES = ['INFO', 'WARNING', 'ERROR', 'SUCCESS'];
const STATUSES = ['Success', 'Failed'];

const AuditLogsPage = () => {
  const { user } = useContext(AuthContext);

  // States
  const [logs, setLogs] = useState([]);
  const [totalLogs, setTotalLogs] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'timeline'
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterUser, setFilterUser] = useState('');
  const [filterModule, setFilterModule] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Active filters applied to fetch
  const [appliedFilters, setAppliedFilters] = useState({
    search: '',
    user: '',
    module: '',
    action: '',
    severity: 'All',
    status: 'All',
    start_date: null,
    end_date: null
  });

  // Selected Log for detail panel
  const [selectedLog, setSelectedLog] = useState(null);

  // Fetch audit logs when applied filters or pagination changes
  useEffect(() => {
    fetchLogs();
  }, [appliedFilters, currentPage, pageSize]);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: pageSize,
      };

      if (appliedFilters.search) params.search = appliedFilters.search;
      if (appliedFilters.user) params.user = appliedFilters.user;
      if (appliedFilters.module) params.module = appliedFilters.module;
      if (appliedFilters.action) params.action = appliedFilters.action;
      if (appliedFilters.severity !== 'All') params.severity = appliedFilters.severity;
      if (appliedFilters.status !== 'All') params.status = appliedFilters.status;
      if (appliedFilters.start_date) params.start_date = new Date(appliedFilters.start_date);
      if (appliedFilters.end_date) params.end_date = new Date(appliedFilters.end_date);

      const response = await auditLogService.getAuditLogs(params);
      setLogs(response.logs || []);
      setTotalLogs(response.total || 0);
    } catch (error) {
      console.error("Failed to load audit logs", error);
      toast.error("Failed to fetch audit logs.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyFilters = () => {
    setCurrentPage(1);
    setAppliedFilters({
      search: searchQuery,
      user: filterUser,
      module: filterModule,
      action: filterAction,
      severity: filterSeverity,
      status: filterStatus,
      start_date: startDate ? new Date(startDate) : null,
      end_date: endDate ? new Date(endDate) : null
    });
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterUser('');
    setFilterModule('');
    setFilterAction('');
    setFilterSeverity('All');
    setFilterStatus('All');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
    setAppliedFilters({
      search: '',
      user: '',
      module: '',
      action: '',
      severity: 'All',
      status: 'All',
      start_date: null,
      end_date: null
    });
  };

  // Exports
  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      const params = {};
      if (appliedFilters.search) params.search = appliedFilters.search;
      if (appliedFilters.user) params.user = appliedFilters.user;
      if (appliedFilters.module) params.module = appliedFilters.module;
      if (appliedFilters.action) params.action = appliedFilters.action;
      if (appliedFilters.severity !== 'All') params.severity = appliedFilters.severity;
      if (appliedFilters.status !== 'All') params.status = appliedFilters.status;
      if (appliedFilters.start_date) params.start_date = appliedFilters.start_date;
      if (appliedFilters.end_date) params.end_date = appliedFilters.end_date;

      await auditLogService.exportExcel(params);
      toast.success("Excel report exported successfully");
    } catch (error) {
      console.error("Excel export failed", error);
      toast.error("Failed to export Excel report.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      const params = {};
      if (appliedFilters.search) params.search = appliedFilters.search;
      if (appliedFilters.user) params.user = appliedFilters.user;
      if (appliedFilters.module) params.module = appliedFilters.module;
      if (appliedFilters.action) params.action = appliedFilters.action;
      if (appliedFilters.severity !== 'All') params.severity = appliedFilters.severity;
      if (appliedFilters.status !== 'All') params.status = appliedFilters.status;
      if (appliedFilters.start_date) params.start_date = appliedFilters.start_date;
      if (appliedFilters.end_date) params.end_date = appliedFilters.end_date;

      await auditLogService.exportPdf(params);
      toast.success("PDF report exported successfully");
    } catch (error) {
      console.error("PDF export failed", error);
      toast.error("Failed to export PDF report.");
    } finally {
      setIsExporting(false);
    }
  };

  // Severity style helper
  const getSeverityStyles = (severity) => {
    const sev = (severity || 'INFO').toUpperCase();
    switch (sev) {
      case 'SUCCESS':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/30';
      case 'WARNING':
        return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/30';
      case 'ERROR':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/30';
      default: // INFO
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/30';
    }
  };

  // Status style helper
  const getStatusStyles = (status) => {
    const stat = (status || 'Success').toLowerCase();
    if (stat === 'failed' || stat === 'fail') {
      return 'bg-red-50 text-red-700 border-red-100 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/20';
    }
    return 'bg-green-50 text-green-700 border-green-100 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/20';
  };

  // Grouping for Timeline view
  const groupedLogs = useMemo(() => {
    const todayGroup = [];
    const yesterdayGroup = [];
    const earlierGroup = [];

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);

    logs.forEach((log) => {
      const logDate = new Date(log.timestamp);
      if (logDate >= startOfToday) {
        todayGroup.push(log);
      } else if (logDate >= startOfYesterday) {
        yesterdayGroup.push(log);
      } else {
        earlierGroup.push(log);
      }
    });

    return {
      today: todayGroup,
      yesterday: yesterdayGroup,
      earlier: earlierGroup
    };
  }, [logs]);

  const totalPages = Math.ceil(totalLogs / pageSize);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8 pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <ShieldAlert className="w-8 h-8 text-primary" />
            System Audit Logs
          </h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Track and monitor administrator activity, model triggers, and security audits.
          </p>
        </div>
        
        {/* Export Buttons */}
        <div className="flex items-center gap-3">
          <Button 
            onClick={handleExportExcel} 
            disabled={isExporting || isLoading || logs.length === 0}
            variant="outline" 
            className="gap-2 border-border/80 hover:bg-muted"
          >
            <Download className="w-4 h-4" />
            Export Excel
          </Button>
          <Button 
            onClick={handleExportPdf} 
            disabled={isExporting || isLoading || logs.length === 0}
            variant="outline" 
            className="gap-2 border-border/80 hover:bg-muted"
          >
            <Download className="w-4 h-4" />
            Export PDF
          </Button>
          <Button 
            onClick={fetchLogs} 
            disabled={isLoading}
            variant="ghost" 
            size="icon" 
            className="h-10 w-10 text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Search & Filters Controls */}
      <div className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-border/60 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Main Search Input */}
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              type="text" 
              placeholder="Search User, Action, Description, Module..." 
              className="pl-9 bg-gray-50 dark:bg-gray-800 border-border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            
            {/* View Mode Toggle */}
            <div className="flex border border-border rounded-lg overflow-hidden shrink-0">
              <Button 
                variant={viewMode === 'table' ? 'default' : 'ghost'} 
                size="sm" 
                onClick={() => setViewMode('table')}
                className="rounded-none gap-1.5 h-9"
              >
                <Table className="w-4 h-4" />
                Table
              </Button>
              <Button 
                variant={viewMode === 'timeline' ? 'default' : 'ghost'} 
                size="sm" 
                onClick={() => setViewMode('timeline')}
                className="rounded-none gap-1.5 h-9"
              >
                <Clock className="w-4 h-4" />
                Timeline
              </Button>
            </div>

            {/* Advanced Filters Button */}
            <Button 
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              variant="outline" 
              className="gap-2 h-9 border-border"
            >
              <Filter className="w-4 h-4" />
              Filters
              <ChevronDown className={`w-4 h-4 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
            </Button>

            <Button onClick={handleApplyFilters} className="bg-primary hover:bg-primary/90 text-white h-9">
              Apply
            </Button>
          </div>
        </div>

        {/* Advanced Filters Grid */}
        <AnimatePresence>
          {showAdvancedFilters && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-4 border-t border-border/60">
                
                {/* User filter */}
                <div className="space-y-1.5">
                  <Label htmlFor="filter-user">User Name / ID</Label>
                  <Input 
                    id="filter-user" 
                    placeholder="e.g. Harshitha" 
                    value={filterUser} 
                    onChange={(e) => setFilterUser(e.target.value)} 
                    className="bg-gray-50 dark:bg-gray-800 h-9"
                  />
                </div>

                {/* Module filter */}
                <div className="space-y-1.5">
                  <Label htmlFor="filter-module">Module</Label>
                  <Input 
                    id="filter-module" 
                    placeholder="e.g. Auth, Observations" 
                    value={filterModule} 
                    onChange={(e) => setFilterModule(e.target.value)} 
                    className="bg-gray-50 dark:bg-gray-800 h-9"
                  />
                </div>

                {/* Action filter */}
                <div className="space-y-1.5">
                  <Label htmlFor="filter-action">Action</Label>
                  <Input 
                    id="filter-action" 
                    placeholder="e.g. LOGIN, CREATE_SURVEY" 
                    value={filterAction} 
                    onChange={(e) => setFilterAction(e.target.value)} 
                    className="bg-gray-50 dark:bg-gray-800 h-9"
                  />
                </div>

                {/* Severity Dropdown */}
                <div className="space-y-1.5">
                  <Label htmlFor="filter-severity">Severity</Label>
                  <select 
                    id="filter-severity" 
                    value={filterSeverity} 
                    onChange={(e) => setFilterSeverity(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-border text-foreground text-sm rounded-md focus:ring-primary focus:border-primary block p-2.5 h-9 py-1"
                  >
                    <option value="All">All Severities</option>
                    {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {/* Status Dropdown */}
                <div className="space-y-1.5">
                  <Label htmlFor="filter-status">Status</Label>
                  <select 
                    id="filter-status" 
                    value={filterStatus} 
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-border text-foreground text-sm rounded-md focus:ring-primary focus:border-primary block p-2.5 h-9 py-1"
                  >
                    <option value="All">All Statuses</option>
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {/* Start Date */}
                <div className="space-y-1.5">
                  <Label htmlFor="filter-start-date">Start Date</Label>
                  <Input 
                    id="filter-start-date" 
                    type="date" 
                    value={startDate} 
                    onChange={(e) => setStartDate(e.target.value)} 
                    className="bg-gray-50 dark:bg-gray-800 h-9"
                  />
                </div>

                {/* End Date */}
                <div className="space-y-1.5">
                  <Label htmlFor="filter-end-date">End Date</Label>
                  <Input 
                    id="filter-end-date" 
                    type="date" 
                    value={endDate} 
                    onChange={(e) => setEndDate(e.target.value)} 
                    className="bg-gray-50 dark:bg-gray-800 h-9"
                  />
                </div>

                {/* Reset button */}
                <div className="flex items-end justify-end">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleResetFilters} 
                    className="w-full border-dashed text-muted-foreground hover:text-foreground h-9"
                  >
                    Reset Filters
                  </Button>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="flex justify-center items-center py-24 bg-white dark:bg-gray-900 rounded-xl border border-border/60">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            <span className="text-muted-foreground text-sm font-medium">Fetching logs...</span>
          </div>
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-dashed border-border/80 p-16 flex flex-col items-center justify-center text-center">
          <ShieldAlert className="w-12 h-12 text-muted-foreground/60 mb-4" />
          <h3 className="text-lg font-bold text-foreground">No audit logs found</h3>
          <p className="text-muted-foreground mt-1 max-w-sm text-sm">
            We couldn't find any system audit logs matching your current filters. Adjust your search or clear filters to see more.
          </p>
          <Button onClick={handleResetFilters} variant="outline" className="mt-4">
            Reset Filters
          </Button>
        </div>
      ) : (
        <>
          {/* Table View */}
          {viewMode === 'table' && (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-border/60 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-gray-50 dark:bg-gray-800/40 text-xs font-semibold text-muted-foreground uppercase">
                      <th className="py-4 px-5">Timestamp</th>
                      <th className="py-4 px-5">User</th>
                      <th className="py-4 px-5">Module</th>
                      <th className="py-4 px-5">Action</th>
                      <th className="py-4 px-5">Description</th>
                      <th className="py-4 px-5 text-center">Severity</th>
                      <th className="py-4 px-5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40 text-sm">
                    {logs.map((log) => (
                      <tr 
                        key={log.id || log._id} 
                        onClick={() => setSelectedLog(log)}
                        className="hover:bg-muted/40 cursor-pointer transition-colors duration-200"
                      >
                        <td className="py-3.5 px-5 text-muted-foreground whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-5 font-medium text-foreground">
                          {log.user_name || "System"}
                          <div className="text-[10px] text-muted-foreground font-mono truncate max-w-[80px]" title={log.user_role}>
                            {log.user_role || "Anonymous"}
                          </div>
                        </td>
                        <td className="py-3.5 px-5">
                          <span className="bg-muted dark:bg-gray-800 px-2 py-1 rounded text-xs font-medium border border-border/50">
                            {log.module}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 font-mono text-xs font-bold text-foreground">
                          {log.action}
                        </td>
                        <td className="py-3.5 px-5 text-muted-foreground max-w-sm truncate" title={log.description}>
                          {log.description}
                        </td>
                        <td className="py-3.5 px-5 text-center whitespace-nowrap">
                          <span className={`inline-flex items-center text-xs px-2.5 py-0.5 rounded-full font-bold border ${getSeverityStyles(log.severity)}`}>
                            {log.severity}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-center whitespace-nowrap">
                          <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full font-semibold border ${getStatusStyles(log.status)}`}>
                            {log.status === "Success" ? <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-green-500" /> : <XCircle className="w-3.5 h-3.5 mr-1 text-red-500" />}
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Timeline View */}
          {viewMode === 'timeline' && (
            <div className="space-y-6">
              
              {/* Today's group */}
              {groupedLogs.today.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-primary uppercase tracking-wider pl-4">Today</h3>
                  <div className="relative border-l-2 border-primary/20 dark:border-primary/10 ml-4 pl-6 space-y-4">
                    {groupedLogs.today.map((log) => (
                      <TimelineCard key={log.id || log._id} log={log} onClick={() => setSelectedLog(log)} getSeverityStyles={getSeverityStyles} getStatusStyles={getStatusStyles} />
                    ))}
                  </div>
                </div>
              )}

              {/* Yesterday's group */}
              {groupedLogs.yesterday.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-amber-500 uppercase tracking-wider pl-4">Yesterday</h3>
                  <div className="relative border-l-2 border-primary/20 dark:border-primary/10 ml-4 pl-6 space-y-4">
                    {groupedLogs.yesterday.map((log) => (
                      <TimelineCard key={log.id || log._id} log={log} onClick={() => setSelectedLog(log)} getSeverityStyles={getSeverityStyles} getStatusStyles={getStatusStyles} />
                    ))}
                  </div>
                </div>
              )}

              {/* Earlier group */}
              {groupedLogs.earlier.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider pl-4">Earlier</h3>
                  <div className="relative border-l-2 border-primary/20 dark:border-primary/10 ml-4 pl-6 space-y-4">
                    {groupedLogs.earlier.map((log) => (
                      <TimelineCard key={log.id || log._id} log={log} onClick={() => setSelectedLog(log)} getSeverityStyles={getSeverityStyles} getStatusStyles={getStatusStyles} />
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-gray-900 p-4 rounded-xl border border-border/60 shadow-sm text-sm">
            <div className="text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{logs.length}</span> of{' '}
              <span className="font-semibold text-foreground">{totalLogs}</span> entries
            </div>

            <div className="flex items-center gap-4">
              {/* Page size selector */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-muted-foreground text-xs font-medium">Rows per page:</span>
                <select 
                  value={pageSize} 
                  onChange={(e) => {
                    setPageSize(parseInt(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-gray-50 border border-border text-foreground text-xs rounded-md focus:ring-primary focus:border-primary block px-2.5 py-1.5"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              {/* Page buttons */}
              <div className="flex items-center gap-1.5">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8 rounded-lg"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <span className="text-muted-foreground">
                  Page <span className="font-semibold text-foreground">{currentPage}</span> of{' '}
                  <span className="font-semibold text-foreground">{totalPages || 1}</span>
                </span>

                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8 rounded-lg"
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Log Detail Panel Overlay */}
      <AnimatePresence>
        {selectedLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-end p-0">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
              onClick={() => setSelectedLog(null)}
            />

            {/* Sliding Panel */}
            <motion.div 
              initial={{ x: '100%' }} 
              animate={{ x: 0 }} 
              exit={{ x: '100%' }} 
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md sm:max-w-lg h-full bg-white dark:bg-gray-900 border-l border-border shadow-2xl flex flex-col z-10"
            >
              {/* Detail Header */}
              <div className="p-6 border-b border-border/60 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-foreground">Log Details</h3>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">ID: {selectedLog.id || selectedLog._id}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setSelectedLog(null)} 
                  className="h-8 w-8 rounded-full"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Detail Fields */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Severity and Status Top Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Severity</span>
                    <div>
                      <span className={`inline-flex items-center text-xs px-2.5 py-0.5 rounded-full font-bold border ${getSeverityStyles(selectedLog.severity)}`}>
                        {selectedLog.severity || 'INFO'}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Status</span>
                    <div>
                      <span className={`inline-flex items-center text-xs px-2.5 py-0.5 rounded-full font-semibold border ${getStatusStyles(selectedLog.status)}`}>
                        {selectedLog.status === "Success" ? <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-green-500" /> : <XCircle className="w-3.5 h-3.5 mr-1 text-red-500" />}
                        {selectedLog.status || 'Success'}
                      </span>
                    </div>
                  </div>
                </div>

                <hr className="border-border/60" />

                {/* Main details list */}
                <div className="space-y-4">
                  
                  {/* User details */}
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-sm font-semibold text-muted-foreground">User</span>
                    <span className="text-sm text-foreground col-span-2 font-medium">{selectedLog.user_name || 'System/Anonymous'}</span>
                  </div>

                  {/* User Role */}
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-sm font-semibold text-muted-foreground">User Role</span>
                    <span className="text-sm text-foreground col-span-2 font-medium">{selectedLog.user_role || 'System'}</span>
                  </div>

                  {/* User ID */}
                  {selectedLog.user_id && (
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-sm font-semibold text-muted-foreground">User ID</span>
                      <span className="text-sm text-muted-foreground font-mono col-span-2 text-xs truncate" title={selectedLog.user_id}>{selectedLog.user_id}</span>
                    </div>
                  )}

                  {/* Module */}
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-sm font-semibold text-muted-foreground">Module</span>
                    <span className="text-sm text-foreground col-span-2 font-medium">
                      <span className="bg-muted dark:bg-gray-800 px-2 py-0.5 rounded text-xs border border-border/40 font-mono">
                        {selectedLog.module}
                      </span>
                    </span>
                  </div>

                  {/* Action */}
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-sm font-semibold text-muted-foreground">Action</span>
                    <span className="text-sm text-foreground font-mono font-bold col-span-2">{selectedLog.action}</span>
                  </div>

                  {/* Resource ID */}
                  {selectedLog.resource_id && (
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-sm font-semibold text-muted-foreground">Resource ID</span>
                      <span className="text-sm text-muted-foreground font-mono col-span-2 text-xs truncate" title={selectedLog.resource_id}>{selectedLog.resource_id}</span>
                    </div>
                  )}

                  {/* IP Address */}
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-sm font-semibold text-muted-foreground">IP Address</span>
                    <span className="text-sm text-foreground font-mono col-span-2">{selectedLog.ip_address || 'Local/Internal'}</span>
                  </div>

                  {/* Timestamp */}
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-sm font-semibold text-muted-foreground">Timestamp</span>
                    <span className="text-sm text-foreground col-span-2 font-medium">
                      {new Date(selectedLog.timestamp).toLocaleString()}
                    </span>
                  </div>

                </div>

                <hr className="border-border/60" />

                {/* Description */}
                <div className="space-y-2">
                  <span className="text-sm font-semibold text-muted-foreground block">Description</span>
                  <div className="bg-muted/40 dark:bg-gray-800/40 p-4 rounded-xl border border-border/40 text-sm text-foreground leading-relaxed whitespace-pre-line">
                    {selectedLog.description}
                  </div>
                </div>

              </div>

              {/* Footer action */}
              <div className="p-6 border-t border-border/60 bg-gray-50 dark:bg-gray-900/50 flex justify-end">
                <Button onClick={() => setSelectedLog(null)} className="w-full bg-primary text-white hover:bg-primary/90">
                  Close Detail Panel
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

// Sub-component for Timeline log cards
const TimelineCard = ({ log, onClick, getSeverityStyles, getStatusStyles }) => {
  // Dot styling based on severity
  const getDotStyles = (severity) => {
    const sev = (severity || 'INFO').toUpperCase();
    switch (sev) {
      case 'SUCCESS': return 'bg-green-500 ring-green-100 dark:ring-green-900/20';
      case 'WARNING': return 'bg-amber-500 ring-amber-100 dark:ring-amber-900/20';
      case 'ERROR': return 'bg-red-500 ring-red-100 dark:ring-red-900/20';
      default: return 'bg-blue-500 ring-blue-100 dark:ring-blue-900/20';
    }
  };

  return (
    <div className="relative group">
      
      {/* Circle indicator on vertical track */}
      <span className={`absolute -left-[31px] top-1.5 flex h-4 w-4 rounded-full ring-4 items-center justify-center transition-transform group-hover:scale-125 ${getDotStyles(log.severity)}`}>
      </span>

      {/* Main card */}
      <div 
        onClick={onClick}
        className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-border/60 shadow-xs hover:shadow-md cursor-pointer transition-all duration-300 transform hover:-translate-y-0.5 hover:border-border"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-foreground">{log.action}</span>
            <span className="bg-muted dark:bg-gray-800 px-2 py-0.5 rounded text-[10px] font-semibold border border-border/40 font-mono">
              {log.module}
            </span>
          </div>
          <span className="text-xs text-muted-foreground font-medium">
            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>

        <p className="text-sm text-foreground/90 font-medium mb-3 line-clamp-2">
          {log.description}
        </p>

        <div className="flex items-center justify-between text-xs pt-2 border-t border-border/40 text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-muted-foreground" />
            <span>{log.user_name || "System"}</span>
            <span className="opacity-40">•</span>
            <span className="italic">{log.user_role || "Anonymous"}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center text-[10px] px-2 py-0.5 rounded-full font-bold border ${getSeverityStyles(log.severity)}`}>
              {log.severity}
            </span>
            <span className={`inline-flex items-center text-[10px] px-1.5 py-0.5 rounded-full font-semibold border ${getStatusStyles(log.status)}`}>
              {log.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditLogsPage;
