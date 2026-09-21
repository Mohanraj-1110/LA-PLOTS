import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
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
import { ImageUploader } from '../../components/common/ImageUploader';
import {
  MapPin,
  Compass,
  FileText,
  Calculator,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  Images,
} from 'lucide-react';

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

export function AddPlotPage() {
  const { addPlot } = useAppState();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  // Image upload state
  const [photos, setPhotos] = useState([]);
  const [primaryPhoto, setPrimaryPhoto] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(plotSchema),
    defaultValues: {
      plotNumber: '',
      surveyNumber: '',
      projectName: 'Greenfield Meadows',
      location: 'Devanahalli, North Bengaluru',
      areaSqft: 1500,
      ratePerSqft: 2850,
      facing: 'East',
      roadWidth: 40,
      status: 'available',
      description: '',
    },
  });

  // Watch Area & Rate for live auto-calculation
  const watchedArea = watch('areaSqft');
  const watchedRate = watch('ratePerSqft');
  const liveTotalAmount = calculatePlotTotal(watchedArea, watchedRate);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const newPlot = await addPlot({
        ...data,
        photos,
        primaryPhoto: primaryPhoto || photos[0] || '',
      });
      success(`Plot ${newPlot.plotNumber} added to inventory!`, 'Plot Registered');
      navigate(ROUTES.PLOTS);
    } catch (err) {
      toastError(err.message || 'Failed to create plot');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Register New Plot Parcel"
        subtitle="Add property dimensions, pricing rates, survey numbers, and facing orientation"
        breadcrumbs={[
          { label: 'Plots', to: ROUTES.PLOTS },
          { label: 'Register New Plot' },
        ]}
        actions={
          <button
            type="button"
            onClick={() => navigate(ROUTES.PLOTS)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Cancel</span>
          </button>
        }
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Project & Identification Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <MapPin className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Project & Location Details</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Project Name : "
              placeholder="Project"
              required
              error={errors.projectName?.message}
              {...register('projectName')}
            />

            <FormInput
              label="Location"
              placeholder="e.g. Trichy, Tamil Nadu"
              required
              error={errors.location?.message}
              {...register('location')}
            />

            <FormInput
              label="Plot Number"
              placeholder="e.g. GM-105 or Plot 42"
              required
              error={errors.plotNumber?.message}
              {...register('plotNumber')}
            />

            <FormInput
              label="Survey / Khasra Number"
              placeholder="e.g. Sy.No. 42/6"
              required
              error={errors.surveyNumber?.message}
              {...register('surveyNumber')}
            />
          </div>
        </div>

        {/* Area, Rate & LIVE Auto-Calculated Total Card */}
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
              placeholder="1500"
              error={errors.areaSqft?.message}
              {...register('areaSqft')}
            />

            <FormInput
              label="Rate per Sq.ft"
              type="number"
              prefix="₹"
              required
              placeholder="2850"
              error={errors.ratePerSqft?.message}
              {...register('ratePerSqft')}
            />

            {/* Prominent Live Calculated Total Price Banner */}
            <div className="p-3 bg-emerald-50/80 border border-emerald-300/80 rounded-2xl flex flex-col justify-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 mb-0.5">
                Total Plot Amount (Area × Rate)
              </p>
              <p className="text-xl font-black text-emerald-800 leading-none">
                {formatCurrency(liveTotalAmount)}
              </p>
              <p className="text-[10px] text-emerald-700 mt-1">
                Auto-computed live • Ready for contract
              </p>
            </div>
          </div>
        </div>

        {/* Orientation, Road & Status */}
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
              placeholder="40"
              error={errors.roadWidth?.message}
              {...register('roadWidth')}
            />

            <FormSelect
              label="Initial Inventory Status"
              options={STATUS_OPTIONS}
              required
              error={errors.status?.message}
              {...register('status')}
            />
          </div>

          <FormTextarea
            label="Plot Description & Highlights"
            placeholder="Highlight avenue plantations, proximity to clubhouse, vastu compliance, clear title details..."
            rows={3}
            {...register('description')}
          />
        </div>

        {/* Legal & Layout Documentation Reference */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <FileText className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Legal Sanction & Layout Reference (Text)</h3>
          </div>

          <FormInput
            label="Layout Sanction / Khata Reference Number"
            placeholder="e.g. BIAAPA/LP/2024-42 • Khata Certificate No. A-9882"
            {...register('layoutSanction')}
          />
        </div>

        {/* Plot Reference Photos */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Images className="w-5 h-5 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">Plot Reference Photos</h3>
            </div>
            {photos.length > 0 && (
              <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                {photos.length} photo{photos.length !== 1 ? 's' : ''} uploaded
              </span>
            )}
          </div>

          <p className="text-xs text-slate-500 -mt-1">
            Upload site photos, layout images, location photos, or any reference images for this plot. The <strong>⭐ Primary</strong> photo is used as the plot thumbnail.
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

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(ROUTES.PLOTS)}
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
            <span>Register Plot</span>
          </button>
        </div>
      </form>
    </div>
  );
}

AddPlotPage.propTypes = {};
