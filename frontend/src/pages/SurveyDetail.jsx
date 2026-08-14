import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Milestone, Calendar, MapPin, Eye, Plus, ArrowLeft } from 'lucide-react';
import { getSurvey } from '../api/surveys';
import { getMonitoringSites } from '../api/monitoringSites';
import { useAuth } from '../hooks/useAuth';
import Badge from '../components/common/Badge';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import DataTable from '../components/common/DataTable';
import Toast from '../components/common/Toast';
import { formatDate } from '../utils/formatters';

export const SurveyDetail = () => {
  const { id } = useParams();
  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [survey, setSurvey] = useState(null);
  const [sites, setSites] = useState([]);
  const [toastMsg, setToastMsg] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const surveyData = await getSurvey(id);
        setSurvey(surveyData);
        
        // Fetch sites belonging to this survey
        const sitesData = await getMonitoringSites({ survey_id: id });
        setSites(sitesData.items);
      } catch (err) {
        console.error(err);
        setToastMsg({ text: 'Failed to retrieve survey details.', type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const siteColumns = [
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
      header: 'Coordinates',
      cell: (row) => (
        <span className="text-xs">
          {row.latitude.toFixed(4)}°, {row.longitude.toFixed(4)}°
        </span>
      )
    },
    {
      header: 'Actions',
      cell: (row) => (
        <Link to={`/monitoring-sites/${row.id}`}>
          <Button variant="outline" size="sm">
            <Eye className="w-3.5 h-3.5" />
          </Button>
        </Link>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 dark:text-slate-450 mb-4">Survey not found or access denied.</p>
        <Link to="/surveys">
          <Button variant="outline">Back to Surveys</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top controls */}
      <div className="flex items-center gap-3">
        <Link to="/surveys">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <span className="text-xs text-slate-500 font-medium">Back to Survey List</span>
      </div>

      {/* Survey Info Card */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold font-outfit text-slate-800 dark:text-slate-100">
                {survey.name}
              </h2>
              <Badge status={survey.status}>{survey.status}</Badge>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
              {survey.description || 'No description provided.'}
            </p>
            
            <div className="flex items-center gap-4 text-xs text-slate-500 pt-2">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-600" />
                Start: {formatDate(survey.start_date)}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-rose-600" />
                End: {formatDate(survey.end_date)}
              </span>
            </div>
          </div>
          {hasPermission('survey:update') && (
            <Link to={`/surveys/edit/${survey.id}`}>
              <Button variant="primary">
                Edit Survey
              </Button>
            </Link>
          )}
        </div>
      </Card>

      {/* Linked Monitoring Sites list */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold font-outfit text-slate-800 dark:text-slate-100">
            Monitoring Sites inside Survey ({sites.length})
          </h3>
          {hasPermission('site:create') && (
            <Link to={`/monitoring-sites/new?survey_id=${survey.id}`}>
              <Button variant="outline" size="sm" icon={Plus}>
                Add Site
              </Button>
            </Link>
          )}
        </div>

        <div className="bg-white dark:bg-forest-900 border border-slate-200 dark:border-forest-850 rounded-2xl shadow-sm overflow-hidden">
          <DataTable
            columns={siteColumns}
            data={sites}
            emptyMessage="No monitoring sites associated with this survey yet."
            actionText={hasPermission('site:create') ? 'Add Monitoring Site' : null}
            onActionClick={() => navigate(`/monitoring-sites/new?survey_id=${survey.id}`)}
          />
        </div>
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
export default SurveyDetail;
