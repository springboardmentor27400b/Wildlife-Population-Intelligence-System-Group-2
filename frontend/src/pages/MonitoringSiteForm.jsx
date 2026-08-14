import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft } from 'lucide-react';
import { createMonitoringSite, getMonitoringSite, updateMonitoringSite } from '../api/monitoringSites';
import { getSurveys } from '../api/surveys';
import Button from '../components/common/Button';
import FormField from '../components/forms/FormField';
import SelectField from '../components/forms/SelectField';
import CoordinatesInput from '../components/forms/CoordinatesInput';
import Card from '../components/common/Card';
import Toast from '../components/common/Toast';
import Spinner from '../components/common/Spinner';
import { HABITAT_TYPES } from '../utils/constants';

export const MonitoringSiteForm = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [surveys, setSurveys] = useState([]);
  const [toastMsg, setToastMsg] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    const loadDependencies = async () => {
      try {
        // Fetch all surveys for dropdown selection
        const surveysList = await getSurveys({ page_size: 100 });
        setSurveys(surveysList.items.map(s => ({ value: s.id, label: s.name })));
        
        if (isEdit) {
          const data = await getMonitoringSite(id);
          reset({
            name: data.name,
            description: data.description || '',
            latitude: data.latitude,
            longitude: data.longitude,
            habitat_type: data.habitat_type,
            survey_id: data.survey_id
          });
        } else {
          // If query param survey_id is provided, auto-select it
          const querySurveyId = searchParams.get('survey_id');
          reset({
            survey_id: querySurveyId || '',
            habitat_type: 'Other'
          });
        }
      } catch (err) {
        console.error(err);
        setToastMsg({ text: 'Failed to retrieve dependency details.', type: 'error' });
      } finally {
        setFetching(false);
      }
    };
    loadDependencies();
  }, [id, isEdit, reset, searchParams]);

  const onSubmit = async (data) => {
    setLoading(true);
    setToastMsg(null);
    
    // Parse coordinates to floats
    const payload = {
      ...data,
      latitude: parseFloat(data.latitude),
      longitude: parseFloat(data.longitude)
    };

    try {
      if (isEdit) {
        await updateMonitoringSite(id, payload);
        setToastMsg({ text: 'Site settings updated successfully!', type: 'success' });
      } else {
        await createMonitoringSite(payload);
        setToastMsg({ text: 'Monitoring site registered successfully!', type: 'success' });
      }
      setTimeout(() => navigate('/monitoring-sites'), 1000);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.detail || 'Failed to submit site properties.';
      setToastMsg({ text: msg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const habitatOptions = Object.values(HABITAT_TYPES).map(hab => ({
    value: hab,
    label: hab
  }));

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      {/* Top navigation controls */}
      <div className="flex items-center gap-3">
        <Link to="/monitoring-sites">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <span className="text-xs text-slate-500 font-medium">Back to Site List</span>
      </div>

      <div>
        <h2 className="text-xl font-bold font-outfit text-slate-800 dark:text-slate-100">
          {isEdit ? 'Modify Monitoring Site' : 'Register Monitoring Site'}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Map name, coordinates, habitat type, and associated survey scope
        </p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            label="Site Identifier Name"
            type="text"
            placeholder="e.g. Ridge Sector C"
            error={errors.name}
            {...register('name', { required: 'Site name is required' })}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350">
              Description (Optional)
            </label>
            <textarea
              placeholder="Describe vegetation, access limits, or habitat profile..."
              className="block w-full px-3.5 py-2 text-sm border border-slate-300 dark:border-forest-800 rounded-lg bg-white dark:bg-forest-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 min-h-[90px]"
              {...register('description')}
            />
          </div>

          <CoordinatesInput
            latError={errors.latitude}
            lonError={errors.longitude}
            latRegister={register('latitude', {
              required: 'Latitude is required',
              validate: (val) => {
                const num = parseFloat(val);
                return (!isNaN(num) && num >= -90.0 && num <= 90.0) || 'Latitude must be between -90 and 90';
              }
            })}
            lonRegister={register('longitude', {
              required: 'Longitude is required',
              validate: (val) => {
                const num = parseFloat(val);
                return (!isNaN(num) && num >= -180.0 && num <= 180.0) || 'Longitude must be between -180 and 180';
              }
            })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectField
              label="Habitat Category"
              options={habitatOptions}
              error={errors.habitat_type}
              {...register('habitat_type', { required: 'Habitat type is required' })}
            />
            
            <SelectField
              label="Associated Survey Boundary"
              options={surveys}
              error={errors.survey_id}
              disabled={isEdit} // Prevent changing survey boundary after registration
              {...register('survey_id', { required: 'Survey link is required' })}
            />
          </div>

          <div className="flex justify-end pt-4 space-x-3">
            <Link to="/monitoring-sites">
              <Button variant="outline">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              loading={loading}
            >
              {isEdit ? 'Save Settings' : 'Deploy Site'}
            </Button>
          </div>
        </form>
      </Card>

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
export default MonitoringSiteForm;
