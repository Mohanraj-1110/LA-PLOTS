import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppState } from '../../context/AppStateContext';
import { useToast } from '../../context/ToastContext';
import { plotSchema } from '../../utils/validators';
import { calculatePlotTotal } from '../../utils/calculateProfit';
import { formatCurrency } from '../../utils/formatCurrency';
import { ROUTES } from '../../routes/routePaths';
import { PageHeader } from '../../components/layout/PageHeader';
import { FormInput } from '../../components/forms/FormInput';
import { FormSelect } from '../../components/forms/FormSelect';
import { FormTextarea } from '../../components/forms/FormTextarea';
import { LoadingSpinner } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { ImageUploader } from '../../components/common/ImageUploader';
import {
  MapPin,
  Compass,
  Calculator,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  Images,
} from 'lucide-react';

const PROJECT_OPTIONS = [
  { value: 'Greenfield Meadows', label: 'Greenfield Meadows (Devanahalli, Bengaluru)' },
  { value: 'Vedic Valley', label: 'Vedic Valley (Electronic City Phase 2, Bengaluru)' },
  { value: 'Emerald Palms', label: 'Emerald Palms (ECR Coastal Highway, Chennai)' },
  { value: 'Sunrise Enclave', label: 'Sunrise Enclave (Shamshabad, Hyderabad)' },
  { value: 'Golden Acres', label: 'Golden Acres (Hinjewadi Phase 3, Pune)' },
];

const FACING_OPTIONS = [
  'East',
  'North',
  'West',
  'South',
  'North-East',
  'North-West',
  'South-East',
  'South-West',
  'Corner',
];

const STATUS_OPTIONS = [
  { value: 'available', label: 'Available (Open for sale)' },
  { value: 'reserved', label: 'Reserved (Token advance received)' },
  { value: 'sold', label: 'Sold (Registry completed)' },
  { value: 'blocked', label: 'Blocked (Administrative hold)' },
];

export function EditPlotPage() {
  const { id } = useParams();
  const { plots, editPlot, loading: stateLoading } = useAppState();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  // Image state — populated from currentPlot once loaded
  const [photos, setPhotos] = useState([]);
  const [primaryPhoto, setPrimaryPhoto] = useState('');

  const currentPlot = plots.find((p) => p.id === id);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(plotSchema),
  });

  useEffect(() => {
    if (currentPlot) {
      reset({
        plotNumber: currentPlot.plotNumber,
        surveyNumber: currentPlot.surveyNumber,
        projectName: currentPlot.projectName,
        location: currentPlot.location,
        areaSqft: currentPlot.areaSqft,
        ratePerSqft: currentPlot.ratePerSqft,
        facing: currentPlot.facing,
        roadWidth: currentPlot.roadWidth,
        status: currentPlot.status,
        description: currentPlot.description || '',
      });
      // Pre-populate photos
      const existingPhotos = Array.isArray(currentPlot.photos) ? currentPlot.photos : [];
      setPhotos(existingPhotos);
      setPrimaryPhoto(currentPlot.primaryPhoto || existingPhotos[0] || '');
    }
  }, [currentPlot, reset]);

  const watchedArea = watch('areaSqft');
  const watchedRate = watch('ratePerSqft');
  const liveTotalAmount = calculatePlotTotal(watchedArea, watchedRate);

  if (stateLoading) {
    return <LoadingSpinner text="Loading plot details..." className="py-24" />;
  }

  if (!currentPlot) {
    return (
      <ErrorState
        title="Plot Not Found"
        message={`No plot found matching ID ${id}.`}
        onRetry={() => navigate(ROUTES.PLOTS)}
      />
    );
  }

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await editPlot(id, {
        ...data,
        photos,
        primaryPhoto: primaryPhoto || photos[0] || '',
      });
      success(`Plot ${data.plotNumber} updated successfully!`);
      navigate(ROUTES.plotDetailsPath(id));
    } catch (err) {
      toastError(err.message || 'Failed to update plot');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title={`Edit Plot ${currentPlot.plotNumber}`}
        subtitle={`${currentPlot.projectName} • ${currentPlot.location}`}
        breadcrumbs={[
          { label: 'Plots', to: ROUTES.PLOTS },
          { label: currentPlot.plotNumber, to: ROUTES.plotDetailsPath(id) },
          { label: 'Edit' },
        ]}
        actions={
          <button
            type="button"
            onClick={() => navigate(ROUTES.plotDetailsPath(id))}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Cancel</span>
          </button>
        }
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <MapPin className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Project & Location Details</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormSelect
              label="Select Project"
              options={PROJECT_OPTIONS}
              required
              error={errors.projectName?.message}
              {...register('projectName')}
            />

            <FormInput
              label="Location"
              required
              error={errors.location?.message}
              {...register('location')}
            />

            <FormInput
              label="Plot Number"
              required
              error={errors.plotNumber?.message}
              {...register('plotNumber')}
            />

            <FormInput
              label="Survey / Khasra Number"
              required
              error={errors.surveyNumber?.message}
              {...register('surveyNumber')}
            />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">Dimensions & Pricing Calculation</h3>
            </div>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Auto-Calculated
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
            <FormInput
              label="Plot Area"
              type="number"
              suffix="sq.ft"
              required
              error={errors.areaSqft?.message}
              {...register('areaSqft')}
            />

            <FormInput
              label="Rate per Sq.ft"
              type="number"
              prefix="₹"
              required
              error={errors.ratePerSqft?.message}
              {...register('ratePerSqft')}
            />

            <div className="p-3 bg-emerald-50/80 border border-emerald-300/80 rounded-2xl flex flex-col justify-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 mb-0.5">
                Total Plot Amount (Area × Rate)
              </p>
              <p className="text-xl font-black text-emerald-800 leading-none">
                {formatCurrency(liveTotalAmount)}
              </p>
              <p className="text-[10px] text-emerald-700 mt-1">
                Recalculated automatically
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Compass className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Orientation & Physical Specs</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormSelect
              label="Facing Direction"
              options={FACING_OPTIONS}
              required
              error={errors.facing?.message}
              {...register('facing')}
            />

            <FormInput
              label="Approach Road Width"
              type="number"
              suffix="ft"
              required
              error={errors.roadWidth?.message}
              {...register('roadWidth')}
            />

            <FormSelect
              label="Inventory Status"
              options={STATUS_OPTIONS}
              required
              error={errors.status?.message}
              {...register('status')}
            />
          </div>

          <FormTextarea
            label="Plot Description & Highlights"
            rows={3}
            {...register('description')}
          />
        </div>

        {/* ── PLOT REFERENCE PHOTOS ─────────────────────────────────── */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Images className="w-5 h-5 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">Plot Reference Photos</h3>
            </div>
            {photos.length > 0 && (
              <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                {photos.length} photo{photos.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          <p className="text-xs text-slate-500 -mt-1">
            Upload or replace site reference photos. The <strong>⭐ Primary</strong> photo is used as the plot thumbnail. Images are stored in the database.
          </p>

          <ImageUploader
            images={photos}
            onChange={setPhotos}
            primaryImage={primaryPhoto}
            onPrimaryChange={setPrimaryPhoto}
            maxFiles={6}
            label="plot photos"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(ROUTES.plotDetailsPath(id))}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            {submitting ? (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            <span>Save Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
}

EditPlotPage.propTypes = {};
