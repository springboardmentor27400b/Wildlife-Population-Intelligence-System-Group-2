import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft } from 'lucide-react';
import { createCameraTrap, getCameraTrap, updateCameraTrap } from '../api/cameraTraps';
import { getMonitoringSites } from '../api/monitoringSites';
import Button from '../components/common/Button';
import FormField from '../components/forms/FormField';
import SelectField from '../components/forms/SelectField';
import Card from '../components/common/Card';
import Toast from '../components/common/Toast';
import Spinner from '../components/common/Spinner';
import { DEVICE_STATUS } from '../utils/constants';

export const CameraTrapForm = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [sites, setSites] = useState([]);
  const [toastMsg, setToastMsg] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    const loadDependencies = async () => {
      try {
        // Fetch all sites for dropdown selection
        const sitesList = await getMonitoringSites({ page_size: 100 });
        setSites(
          sitesList.items.map(s => ({ value: s.id, label: s.name }))
        );
        
        if (isEdit) {
          const data = await getCameraTrap(id);
          reset({
            model: data.model,
            serial_number: data.serial_number,
            status: data.status,
            site_id: data.site_id || ''
          });
        } else {
          // If query param site_id is provided, auto-select it
          const querySiteId = searchParams.get('site_id');
          reset({
            site_id: querySiteId || '',
            status: 'Active'
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
    
    // empty site_id string should be submitted as null
    const payload = {
      ...data,
      site_id: data.site_id ? data.site_id : null
    };

    try {
      if (isEdit) {
        await updateCameraTrap(id, payload);
        setToastMsg({ text: 'Camera properties updated!', type: 'success' });
      } else {
        await createCameraTrap(payload);
        setToastMsg({ text: 'Camera registered successfully!', type: 'success' });
      }
      setTimeout(() => navigate('/camera-traps'), 1000);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.detail || 'Failed to submit camera trap details.';
      setToastMsg({ text: msg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = Object.values(DEVICE_STATUS).map(st => ({
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
        <Link to="/camera-traps">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <span className="text-xs text-slate-500 font-medium">Back to Equipment</span>
      </div>

      <div>
        <h2 className="text-xl font-bold font-outfit text-slate-800 dark:text-slate-100">
          {isEdit ? 'Modify Camera Settings' : 'Register Camera Trap'}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Define model, serial, operational status, and site deployment linkage
        </p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            label="Camera Model Name"
            type="text"
            placeholder="e.g. Browning Strike Force"
            error={errors.model}
            {...register('model', { required: 'Model name is required' })}
          />

          <FormField
            label="Serial Number ID"
            type="text"
            placeholder="e.g. BROWNING-SF-88"
            error={errors.serial_number}
            {...register('serial_number', { required: 'Serial ID is required' })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectField
              label="Operational Status"
              options={statusOptions}
              error={errors.status}
              {...register('status', { required: 'Status is required' })}
            />
            
            <SelectField
              label="Deploy to Site (Optional)"
              options={sites}
              placeholder="Keep Unassigned"
              error={errors.site_id}
              {...register('site_id')}
            />
          </div>

          <div className="flex justify-end pt-4 space-x-3">
            <Link to="/camera-traps">
              <Button variant="outline">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              loading={loading}
            >
              {isEdit ? 'Save Settings' : 'Deploy Camera'}
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
export default CameraTrapForm;
