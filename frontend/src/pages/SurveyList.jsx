import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Eye, Edit2, Trash } from 'lucide-react';
import { getSurveys, deleteSurvey } from '../api/surveys';
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
import { formatDate } from '../utils/formatters';
import { SURVEY_STATUS } from '../utils/constants';

export const SurveyList = () => {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [surveys, setSurveys] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const debouncedSearch = useDebounce(search, 400);
  const { page, pageSize, total, setPaginationData, handlePageChange } = usePagination();

  // Delete dialog states
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  const fetchSurveys = async () => {
    setLoading(true);
    try {
      const data = await getSurveys({
        search: debouncedSearch || undefined,
        status: statusFilter || undefined,
        page,
        page_size: pageSize
      });
      setSurveys(data.items);
      setPaginationData(data.total);
    } catch (err) {
      console.error(err);
      setToastMsg({ text: 'Failed to fetch surveys list.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSurveys();
  }, [debouncedSearch, statusFilter, page]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteSurvey(deleteTarget.id);
      setToastMsg({ text: 'Survey deleted successfully!', type: 'success' });
      setDeleteTarget(null);
      fetchSurveys();
    } catch (err) {
      console.error(err);
      setToastMsg({ text: err.response?.data?.detail || 'Failed to delete survey.', type: 'error' });
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns = [
    {
      header: 'Survey Name',
      accessor: 'name',
      cell: (row) => (
        <span className="font-semibold text-slate-800 dark:text-slate-200">
          {row.name}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => <Badge status={row.status}>{row.status}</Badge>
    },
    {
      header: 'Timeline',
      accessor: 'start_date',
      cell: (row) => (
        <span className="text-xs">
          {formatDate(row.start_date)} - {formatDate(row.end_date)}
        </span>
      )
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
          <Link to={`/surveys/${row.id}`}>
            <Button variant="outline" size="sm">
              <Eye className="w-3.5 h-3.5" />
            </Button>
          </Link>
          {hasPermission('survey:update') && (
            <Link to={`/surveys/edit/${row.id}`}>
              <Button variant="outline" size="sm">
                <Edit2 className="w-3.5 h-3.5" />
              </Button>
            </Link>
          )}
          {hasPermission('survey:delete') && (
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

  const statusOptions = Object.values(SURVEY_STATUS).map(st => ({
    value: st,
    label: st
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-outfit text-slate-800 dark:text-slate-100">
            Surveys Boundary
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Define survey timelines, census regions, and project scopes
          </p>
        </div>
        {hasPermission('survey:create') && (
          <Link to="/surveys/new">
            <Button variant="primary" icon={Plus}>
              New Survey
            </Button>
          </Link>
        )}
      </div>

      {/* Filter panel */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-850 p-4 rounded-xl shadow-sm">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search surveys by name..."
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
          data={surveys}
          loading={loading}
          emptyMessage="No surveys found matching filter parameters."
          actionText={hasPermission('survey:create') ? 'Create Survey' : null}
          onActionClick={() => navigate('/surveys/new')}
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
        title="Delete Survey?"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? All associated monitoring sites, camera devices, and observations will be permanently removed.`}
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
export default SurveyList;
