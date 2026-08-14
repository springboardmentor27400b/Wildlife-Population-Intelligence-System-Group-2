import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Eye, Edit2, Trash } from 'lucide-react';
import { getMonitoringSites, deleteMonitoringSite } from '../api/monitoringSites';
import { useAuth } from '../hooks/useAuth';
import { usePagination } from '../hooks/usePagination';
import { useDebounce } from '../hooks/useDebounce';
import DataTable from '../components/common/DataTable';
import Pagination from '../components/common/Pagination';
import SearchBar from '../components/common/SearchBar';
import SelectField from '../components/forms/SelectField';
import Button from '../components/common/Button';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Toast from '../components/common/Toast';
import { HABITAT_TYPES } from '../utils/constants';

export const MonitoringSiteList = () => {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sites, setSites] = useState([]);
  const [search, setSearch] = useState('');
  const [habitatFilter, setHabitatFilter] = useState('');

  const debouncedSearch = useDebounce(search, 400);
  const { page, pageSize, total, setPaginationData, handlePageChange } = usePagination();

  // Delete dialog states
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  const fetchSites = async () => {
    setLoading(true);
    try {
      const data = await getMonitoringSites({
        search: debouncedSearch || undefined,
        habitat_type: habitatFilter || undefined,
        page,
        page_size: pageSize
      });
      setSites(data.items);
      setPaginationData(data.total);
    } catch (err) {
      console.error(err);
      setToastMsg({ text: 'Failed to fetch monitoring sites.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSites();
  }, [debouncedSearch, habitatFilter, page]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteMonitoringSite(deleteTarget.id);
      setToastMsg({ text: 'Monitoring site deleted successfully!', type: 'success' });
      setDeleteTarget(null);
      fetchSites();
    } catch (err) {
      console.error(err);
      setToastMsg({ text: err.response?.data?.detail || 'Failed to delete site.', type: 'error' });
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns = [
    {
      header: 'Site Name',
      accessor: 'name',
      cell: (row) => (
        <span className="font-semibold text-slate-800 dark:text-slate-200">
          {row.name}
        </span>
      )
    },
    {
      header: 'Habitat Type',
      accessor: 'habitat_type'
    },
    {
      header: 'Latitude',
      accessor: 'latitude',
      cell: (row) => <span>{row.latitude.toFixed(5)}°</span>
    },
    {
      header: 'Longitude',
      accessor: 'longitude',
      cell: (row) => <span>{row.longitude.toFixed(5)}°</span>
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
          <Link to={`/monitoring-sites/${row.id}`}>
            <Button variant="outline" size="sm">
              <Eye className="w-3.5 h-3.5" />
            </Button>
          </Link>
          {hasPermission('site:update') && (
            <Link to={`/monitoring-sites/edit/${row.id}`}>
              <Button variant="outline" size="sm">
                <Edit2 className="w-3.5 h-3.5" />
              </Button>
            </Link>
          )}
          {hasPermission('site:delete') && (
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

  const habitatOptions = Object.values(HABITAT_TYPES).map(hab => ({
    value: hab,
    label: hab
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-outfit text-slate-800 dark:text-slate-100">
            Monitoring Sites
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Geographic regions containing camera traps and acoustic telemetry sensors
          </p>
        </div>
        {hasPermission('site:create') && (
          <Link to="/monitoring-sites/new">
            <Button variant="primary" icon={Plus}>
              New Site
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-850 p-4 rounded-xl shadow-sm">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search monitoring sites..."
        />
        <div className="w-full sm:w-48 ml-auto">
          <SelectField
            placeholder="All Habitats"
            options={habitatOptions}
            value={habitatFilter}
            onChange={(e) => setHabitatFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-850 rounded-2xl shadow-sm overflow-hidden">
        <DataTable
          columns={columns}
          data={sites}
          loading={loading}
          emptyMessage="No monitoring sites found matching filter parameters."
          actionText={hasPermission('site:create') ? 'Create Monitoring Site' : null}
          onActionClick={() => navigate('/monitoring-sites/new')}
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
        title="Delete Monitoring Site?"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? All operational camera traps and audio sensors deployed here will be detached.`}
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
export default MonitoringSiteList;
