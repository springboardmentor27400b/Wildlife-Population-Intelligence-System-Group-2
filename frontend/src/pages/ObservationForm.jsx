import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft } from 'lucide-react';
import { createObservation, getObservation, updateObservation } from '../api/observations';
import { getMonitoringSites } from '../api/monitoringSites';
import { createMediaLog } from '../api/media';
import Button from '../components/common/Button';
import FormField from '../components/forms/FormField';
import SelectField from '../components/forms/SelectField';
import CoordinatesInput from '../components/forms/CoordinatesInput';
import FileUpload from '../components/forms/FileUpload';
import Card from '../components/common/Card';
import Toast from '../components/common/Toast';
import Spinner from '../components/common/Spinner';

export const ObservationForm = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [sites, setSites] = useState([]);
  const [toastMsg, setToastMsg] = useState(null);
  
  // State to hold uploaded file metadata
  const [uploadedMedia, setUploadedMedia] = useState(null);

  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm();

  useEffect(() => {
    const loadDependencies = async () => {
      try {
        // Fetch all sites for dropdown selection
        const sitesList = await getMonitoringSites({ page_size: 100 });
        setSites(
          sitesList.items.map(s => ({ value: s.id, label: s.name, lat: s.latitude, lon: s.longitude }))
        );
        
        if (isEdit) {
          const data = await getObservation(id);
          reset({
            species: data.species,
            count: data.count,
            observed_at: data.observed_at.split('.')[0], // strip timezone if necessary for datetime-local
            latitude: data.latitude,
            longitude: data.longitude,
            notes: data.notes || '',
            site_id: data.site_id
          });
        } else {
          // If query param site_id is provided, auto-select it and set coords
          const querySiteId = searchParams.get('site_id');
          reset({
            site_id: querySiteId || '',
            count: 1,
            observed_at: new Date().toISOString().slice(0, 16) // default current time
          });
          
          if (querySiteId) {
            const selectedSite = sitesList.items.find(s => s.id === querySiteId);
            if (selectedSite) {
              setValue('latitude', selectedSite.latitude);
              setValue('longitude', selectedSite.longitude);
            }
          }
        }
      } catch (err) {
        console.error(err);
        setToastMsg({ text: 'Failed to retrieve dependency details.', type: 'error' });
      } finally {
        setFetching(false);
      }
    };
    loadDependencies();
  }, [id, isEdit, reset, searchParams, setValue]);

  // Handle changing site to automatically prefill coordinates if available
  const handleSiteChange = (e) => {
    const selectedId = e.target.value;
    const selectedSite = sites.find(s => s.value === selectedId);
    if (selectedSite) {
      setValue('latitude', selectedSite.lat);
      setValue('longitude', selectedSite.lon);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setToastMsg(null);
    
    // Parse coordinates to floats
    const payload = {
      ...data,
      count: parseInt(data.count),
      latitude: parseFloat(data.latitude),
      longitude: parseFloat(data.longitude),
      observed_at: new Date(data.observed_at).toISOString()
    };

    try {
      let obsId = id;
      if (isEdit) {
        await updateObservation(id, payload);
        setToastMsg({ text: 'Sighting properties updated!', type: 'success' });
      } else {
        const obs = await createObservation(payload);
        obsId = obs.id;
        
        // Log media metadata associated with the new observation in PostgreSQL
        if (uploadedMedia) {
          await createMediaLog({
            observation_id: obsId,
            file_name: uploadedMedia.file_name,
            file_url: uploadedMedia.file_url,
            public_id: uploadedMedia.public_id,
            mime_type: uploadedMedia.mime_type,
            file_size: uploadedMedia.file_size,
            file_type: uploadedMedia.file_type
          });
        }
        setToastMsg({ text: 'Observation sighting logged successfully!', type: 'success' });
      }
      setTimeout(() => navigate('/observations'), 1000);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.detail || 'Failed to submit sighting log details.';
      setToastMsg({ text: msg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

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
        <Link to="/observations">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <span className="text-xs text-slate-500 font-medium">Back to Sighting Logs</span>
      </div>

      <div>
        <h2 className="text-xl font-bold font-outfit text-slate-800 dark:text-slate-100">
          {isEdit ? 'Modify Sighting Log' : 'Log Wildlife Sighting'}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Submit sighting coordinates, species count, and attach audio/photo media captures
        </p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            label="Species Name (Scientific or Common)"
            type="text"
            placeholder="e.g. Panthera leo (African Lion)"
            error={errors.species}
            {...register('species', { required: 'Species label is required' })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="Sighting Count"
              type="number"
              error={errors.count}
              {...register('count', {
                required: 'Sighting count is required',
                min: { value: 1, message: 'Count must be at least 1' }
              })}
            />
            <FormField
              label="Date & Time Observed"
              type="datetime-local"
              error={errors.observed_at}
              {...register('observed_at', { required: 'Sighting date is required' })}
            />
          </div>

          <div className="space-y-1">
            <SelectField
              label="Monitoring Site Area"
              options={sites}
              error={errors.site_id}
              onChange={handleSiteChange}
              {...register('site_id', { required: 'Monitoring site is required' })}
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

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350">
              Field Sighting Notes (Optional)
            </label>
            <textarea
              placeholder="Spotted behavior, weather, or visual notes..."
              className="block w-full px-3.5 py-2 text-sm border border-slate-300 dark:border-forest-800 rounded-lg bg-white dark:bg-forest-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 min-h-[90px]"
              {...register('notes')}
            />
          </div>

          {/* File Upload component (images or audio) */}
          {!isEdit && (
            <FileUpload
              onUploadSuccess={(meta) => setUploadedMedia(meta)}
            />
          )}

          <div className="flex justify-end pt-4 space-x-3">
            <Link to="/observations">
              <Button variant="outline">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              loading={loading}
            >
              {isEdit ? 'Save Changes' : 'Log Sighting'}
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
export default ObservationForm;
