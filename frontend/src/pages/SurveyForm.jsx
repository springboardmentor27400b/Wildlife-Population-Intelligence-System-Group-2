import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft } from 'lucide-react';
import { createSurvey, getSurvey, updateSurvey } from '../api/surveys';
import Button from '../components/common/Button';
import FormField from '../components/forms/FormField';
import SelectField from '../components/forms/SelectField';
import Card from '../components/common/Card';
import Toast from '../components/common/Toast';
import Spinner from '../components/common/Spinner';
import { SURVEY_STATUS } from '../utils/constants';

export const SurveyForm = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [toastMsg, setToastMsg] = useState(null);

  const { register, handleSubmit, reset, formState: { errors }, watch } = useForm();

  // Watch start date to validate end date is after start date
  const startDate = watch('start_date');

  useEffect(() => {
    if (isEdit) {
      const fetchSurveyDetails = async () => {
        try {
          const data = await getSurvey(id);
          // Format date strings for HTML5 date inputs
          reset({
            name: data.name,
            description: data.description || '',
            start_date: data.start_date.split('T')[0],
            end_date: data.end_date.split('T')[0],
            status: data.status
          });
        } catch (err) {
          console.error(err);
          setToastMsg({ text: 'Failed to retrieve survey details.', type: 'error' });
        } finally {
          setFetching(false);
        }
      };
      fetchSurveyDetails();
    }
  }, [id, isEdit, reset]);

  const onSubmit = async (data) => {
    setLoading(true);
    setToastMsg(null);
    try {
      if (isEdit) {
        await updateSurvey(id, data);
        setToastMsg({ text: 'Survey updated successfully!', type: 'success' });
      } else {
        await createSurvey(data);
        setToastMsg({ text: 'Survey created successfully!', type: 'success' });
      }
      setTimeout(() => navigate('/surveys'), 1000);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.detail || 'Failed to submit survey properties.';
      setToastMsg({ text: msg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = Object.values(SURVEY_STATUS).map(st => ({
    value: st,
    label: st
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
        <Link to="/surveys">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <span className="text-xs text-slate-500 font-medium">Back to Survey List</span>
      </div>

      <div>
        <h2 className="text-xl font-bold font-outfit text-slate-800 dark:text-slate-100">
          {isEdit ? 'Modify Survey Scope' : 'Add New Survey Scope'}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Define name, description, active date limits, and initial status
        </p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            label="Survey Name"
            type="text"
            placeholder="e.g. Tiger Census Summer 2026"
            error={errors.name}
            {...register('name', { required: 'Survey name is required' })}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350">
              Description (Optional)
            </label>
            <textarea
              placeholder="Provide context and region scope for the census..."
              className="block w-full px-3.5 py-2 text-sm border border-slate-300 dark:border-forest-800 rounded-lg bg-white dark:bg-forest-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 min-h-[100px]"
              {...register('description')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="Start Date"
              type="date"
              error={errors.start_date}
              {...register('start_date', { required: 'Start date is required' })}
            />
            <FormField
              label="End Date"
              type="date"
              error={errors.end_date}
              {...register('end_date', {
                required: 'End date is required',
                validate: (val) => {
                  if (startDate && new Date(val) < new Date(startDate)) {
                    return 'End date must be after start date';
                  }
                  return true;
                }
              })}
            />
          </div>

          <SelectField
            label="Initial Status"
            options={statusOptions}
            error={errors.status}
            {...register('status', { required: 'Status is required' })}
          />

          <div className="flex justify-end pt-4 space-x-3">
            <Link to="/surveys">
              <Button variant="outline">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              loading={loading}
            >
              {isEdit ? 'Save Changes' : 'Create Project'}
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
export default SurveyForm;
