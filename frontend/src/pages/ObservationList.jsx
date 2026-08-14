import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Eye, Edit2, Trash, Calendar, Camera, Volume2 } from 'lucide-react';
import { getObservations, deleteObservation } from '../api/observations';
import { useAuth } from '../hooks/useAuth';
import { usePagination } from '../hooks/usePagination';
import { useDebounce } from '../hooks/useDebounce';
import DataTable from '../components/common/DataTable';
import Pagination from '../components/common/Pagination';
import SearchBar from '../components/common/SearchBar';
import Button from '../components/common/Button';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Toast from '../components/common/Toast';
import FormField from '../components/forms/FormField';
import { formatDateTime } from '../utils/formatters';

export const ObservationList = () => {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [observations, setObservations] = useState([]);
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const debouncedSearch = useDebounce(search, 400);
  const { page, pageSize, total, setPaginationData, handlePageChange } = usePagination();

  // Delete dialog states
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  const fetchObservations = async () => {
    setLoading(true);
    try {
      const data = await getObservations({
        species: debouncedSearch || undefined,
        start_date: startDate ? new Date(startDate).toISOString() : undefined,
        end_date: endDate ? new Date(endDate).toISOString() : undefined,
        page,
        page_size: pageSize
      });
      setObservations(data.items);
      setPaginationData(data.total);
    } catch (err) {
      console.error(err);
      setToastMsg({ text: 'Failed to fetch observations list.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchObservations();
  }, [debouncedSearch, startDate, endDate, page]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteObservation(deleteTarget.id);
      setToastMsg({ text: 'Observation log removed!', type: 'success' });
      setDeleteTarget(null);
      fetchObservations();
    } catch (err) {
      console.error(err);
      setToastMsg({ text: err.response?.data?.detail || 'Failed to delete observation.', type: 'error' });
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns = [
    {
      header: 'Species',
      accessor: 'species',
      cell: (row) => (
        <span className="font-semibold text-slate-800 dark:text-slate-200">
          {row.species}
        </span>
      )
    },
    {
      header: 'Count',
      accessor: 'count',
      cell: (row) => (
        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-forest-850 font-bold font-mono text-xs">
          {row.count}
        </span>
      )
    },
    {
      header: 'Sighting Date & Time',
      accessor: 'observed_at',
      cell: (row) => <span>{formatDateTime(row.observed_at)}</span>
    },
    {
      header: 'Coordinates',
      cell: (row) => (
        <span className="text-xs font-mono text-slate-600 dark:text-slate-400">
          {row.latitude.toFixed(4)}°, {row.longitude.toFixed(4)}°
        </span>
      )
    },
    {
      header: 'Media',
      cell: (row) => {
        const hasImage = row.media?.some(m => m.file_type === 'image');
        const hasAudio = row.media?.some(m => m.file_type === 'audio');
        return (
          <div className="flex gap-1.5">
            {hasImage && (
              <span title="Image Attached" className="p-1 rounded-md bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 hover:scale-105 transition-transform flex items-center justify-center">
                <Camera className="w-3.5 h-3.5" />
              </span>
            )}
            {hasAudio && (
              <span title="Audio Attached" className="p-1 rounded-md bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 hover:scale-105 transition-transform flex items-center justify-center">
                <Volume2 className="w-3.5 h-3.5" />
              </span>
            )}
            {!hasImage && !hasAudio && (
              <span className="text-slate-400 dark:text-slate-600">-</span>
            )}
          </div>
        );
      }
    },
    {
      header: 'AI Status',
      cell: (row) => {
        const latestAnalysis = row.ai_analyses && row.ai_analyses.length > 0
          ? row.ai_analyses[row.ai_analyses.length - 1]
          : null;
        
        const hasImage = row.media?.some(m => m.file_type === 'image');
        const hasAudio = row.media?.some(m => m.file_type === 'audio');

        const imageDone = latestAnalysis?.image_completed;
        const audioDone = latestAnalysis?.audio_completed;

        return (
          <div className="text-[10px] space-y-0.5 font-mono">
            {hasImage && (
              <div className="flex items-center gap-1">
                <span className="text-slate-400 uppercase">Img:</span>
                {imageDone ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">✅ Done</span>
                ) : (
                  <span className="text-amber-600 dark:text-amber-400 font-bold">⏳ Pending</span>
                )}
              </div>
            )}
            {hasAudio && (
              <div className="flex items-center gap-1">
                <span className="text-slate-400 uppercase">Aud:</span>
                {audioDone ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">✅ Done</span>
                ) : (
                  <span className="text-amber-600 dark:text-amber-400 font-bold">⏳ Pending</span>
                )}
              </div>
            )}
            {!hasImage && !hasAudio && (
              <span className="text-slate-400 dark:text-slate-600">N/A</span>
            )}
          </div>
        );
      }
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
          <Link to={`/observations/${row.id}`}>
            <Button variant="outline" size="sm">
              <Eye className="w-3.5 h-3.5" />
            </Button>
          </Link>
          {hasPermission('observation:update') && (
            <Link to={`/observations/edit/${row.id}`}>
              <Button variant="outline" size="sm">
                <Edit2 className="w-3.5 h-3.5" />
              </Button>
            </Link>
          )}
          {hasPermission('observation:delete') && (
            <Button
              variant="outline"
              size="sm"
              className="text-rose-650 hover:bg-rose-50"
              onClick={() => setDeleteTarget(row)}
            >
              <Trash className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-outfit text-slate-800 dark:text-slate-100">
            Species Recognition & Sighting Logs
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Identify wildlife species from camera trap images and bird vocalizations using YOLOv8 and EfficientNet-B0.
          </p>
        </div>
        {hasPermission('observation:create') && (
          <Link to="/observations/new">
            <Button variant="primary" icon={Plus}>
              Log Sighting
            </Button>
          </Link>
        )}
      </div>

      {/* Filter panel */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-850 p-4 rounded-xl shadow-sm">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by species..."
        />
        
        {/* Date Filters */}
        <div className="flex items-center gap-3 w-full md:w-auto md:ml-auto">
          <div className="w-full sm:w-40">
            <FormField
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <span className="text-slate-400 text-xs">to</span>
          <div className="w-full sm:w-40">
            <FormField
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-850 rounded-2xl shadow-sm overflow-hidden">
        <DataTable
          columns={columns}
          data={observations}
          loading={loading}
          emptyMessage="No observations logged matching filter parameters."
          actionText={hasPermission('observation:create') ? 'Log Observation' : null}
          onActionClick={() => navigate('/observations/new')}
        />
        <Pagination
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={handlePageChange}
        />
      </div>

      {/* Confirm dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Sighting Log?"
        message={`Are you sure you want to delete this sighting of "${deleteTarget?.species}"? This record and any associated image/audio attachment links will be permanently deleted.`}
        loading={deleteLoading}
      />

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
export default ObservationList;
