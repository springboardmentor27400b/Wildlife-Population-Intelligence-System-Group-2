import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Eye, Edit2, Trash } from 'lucide-react';
import { getCameraTraps, deleteCameraTrap } from '../api/cameraTraps';
import { useAuth } from '../hooks/useAuth';
import { usePagination } from '../hooks/usePagination';
import { useDebounce } from '../hooks/useDebounce';
import DataTable from '../components/common/DataTable';
import Pagination from '../components/common/Pagination';
import SearchBar from '../components/common/SearchBar';
import SelectField from '../components/forms/SelectField';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Toast from '../components/common/Toast';
import { DEVICE_STATUS } from '../utils/constants';

export const CameraTrapList = () => {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [cameras, setCameras] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const debouncedSearch = useDebounce(search, 400);
  const { page, pageSize, total, setPaginationData, handlePageChange } = usePagination();

  // Delete dialog states
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  const fetchCameras = async () => {
    setLoading(true);
    try {
      const data = await getCameraTraps({
        search: debouncedSearch || undefined,
        status: statusFilter || undefined,
        page,
        page_size: pageSize
      });
      setCameras(data.items);
      setPaginationData(data.total);
    } catch (err) {
      console.error(err);
      setToastMsg({ text: 'Failed to fetch camera traps.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCameras();
  }, [debouncedSearch, statusFilter, page]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteCameraTrap(deleteTarget.id);
      setToastMsg({ text: 'Camera trap registration removed!', type: 'success' });
      setDeleteTarget(null);
      fetchCameras();
    } catch (err) {
      console.error(err);
      setToastMsg({ text: err.response?.data?.detail || 'Failed to delete camera trap.', type: 'error' });
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns = [
    {
      header: 'Model Name',
      accessor: 'model',
      cell: (row) => (
        <span className="font-semibold text-slate-800 dark:text-slate-200">
          {row.model}
        </span>
      )
    },
    {
      header: 'Serial Number',
      accessor: 'serial_number'
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => <Badge status={row.status}>{row.status}</Badge>
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
          <Link to={`/camera-traps/${row.id}`}>
            <Button variant="outline" size="sm">
              <Eye className="w-3.5 h-3.5" />
            </Button>
          </Link>
          {hasPermission('device:update') && (
            <Link to={`/camera-traps/edit/${row.id}`}>
              <Button variant="outline" size="sm">
                <Edit2 className="w-3.5 h-3.5" />
              </Button>
            </Link>
          )}
          {hasPermission('device:delete') && (
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

  const statusOptions = Object.values(DEVICE_STATUS).map(st => ({
    value: st,
    label: st
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-outfit text-slate-800 dark:text-slate-100">
            Camera Traps
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Physical optical camera assets deployed in the field
          </p>
        </div>
        {hasPermission('device:create') && (
          <Link to="/camera-traps/new">
            <Button variant="primary" icon={Plus}>
              Register Camera
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-850 p-4 rounded-xl shadow-sm">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by model or serial..."
        />
        <div className="w-full sm:w-48 ml-auto">
          <SelectField
            placeholder="All Statuses"
            options={statusOptions}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-850 rounded-2xl shadow-sm overflow-hidden">
        <DataTable
          columns={columns}
          data={cameras}
          loading={loading}
          emptyMessage="No camera traps found matching filter parameters."
          actionText={hasPermission('device:create') ? 'Deploy Camera' : null}
          onActionClick={() => navigate('/camera-traps/new')}
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
        title="Delete Camera Trap?"
        message={`Are you sure you want to delete camera trap "${deleteTarget?.serial_number}"? This equipment record will be removed from databases.`}
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
export default CameraTrapList;
