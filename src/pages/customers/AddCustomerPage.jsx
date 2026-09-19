import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppState } from '../../context/AppStateContext';
import { useToast } from '../../context/ToastContext';
import { customerSchema } from '../../utils/validators';
import { ROUTES } from '../../routes/routePaths';
import { PageHeader } from '../../components/layout/PageHeader';
import { FormInput } from '../../components/forms/FormInput';
import { FormSelect } from '../../components/forms/FormSelect';
import { FormTextarea } from '../../components/forms/FormTextarea';
import {
  UserPlus,
  Phone,
  Mail,
  MapPin,
  IndianRupee,
  Calendar,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';

const PROJECT_OPTIONS = [
  'Greenfield Meadows',
  'Vedic Valley',
  'Emerald Palms',
  'Sunrise Enclave',
  'Golden Acres',
];

const STATUS_OPTIONS = [
  { value: 'New', label: 'New Lead' },
  { value: 'Interested', label: 'Interested' },
  { value: 'Site Visit', label: 'Site Visit Scheduled' },
  { value: 'Negotiation', label: 'In Negotiation' },
  { value: 'Booked', label: 'Booked (Token Paid)' },
  { value: 'Follow-up', label: 'Follow-up Required' },
  { value: 'Converted', label: 'Converted (Sale Registered)' },
  { value: 'Lost', label: 'Lost Lead' },
];

export function AddCustomerPage() {
  const [searchParams] = useSearchParams();
  const { addCustomer } = useAppState();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const initialPlot = searchParams.get('interestedPlot') || '';
  const initialProj = searchParams.get('project') || 'Greenfield Meadows';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      city: 'Bengaluru',
      budgetMin: 3500000,
      budgetMax: 5000000,
      interestedProjectName: initialProj,
      interestedPlotNumber: initialPlot,
      status: 'New',
      nextFollowup: '',
      notes: '',
    },
  });

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const newCust = await addCustomer({
        ...data,
        interestedPlotId: '',
        assignedAgent: data.assignedAgent || '',
      });
      success(`Customer ${newCust.name} added to pipeline!`, 'Lead Recorded');
      navigate(ROUTES.CUSTOMERS);
    } catch (err) {
      toastError(err.message || 'Failed to create customer');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Add Customer / Lead"
        subtitle="Record buyer profile, budget parameters, and deal progress status"
        breadcrumbs={[
          { label: 'Customers', to: ROUTES.CUSTOMERS },
          { label: 'New Customer' },
        ]}
        actions={
          <button
            type="button"
            onClick={() => navigate(ROUTES.CUSTOMERS)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Cancel</span>
          </button>
        }
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Contact info */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <UserPlus className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Personal & Contact Information</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Full Name"
              placeholder="e.g. Ramesh Kumar"
              required
              error={errors.name?.message}
              {...register('name')}
            />

            <FormInput
              label="Mobile Number"
              placeholder="+91 98450 12345"
              icon={Phone}
              required
              error={errors.phone?.message}
              {...register('phone')}
            />

            <FormInput
              label="Email Address"
              placeholder="ramesh.k@gmail.com"
              icon={Mail}
              error={errors.email?.message}
              {...register('email')}
            />

            <FormInput
              label="City"
              placeholder="e.g. Bengaluru"
              icon={MapPin}
              required
              error={errors.city?.message}
              {...register('city')}
            />
          </div>
        </div>

        {/* Project Interest & Budget */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <IndianRupee className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Project Interest & Budget Range</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormSelect
              label="Interested Project"
              options={PROJECT_OPTIONS}
              required
              error={errors.interestedProjectName?.message}
              {...register('interestedProjectName')}
            />

            <FormInput
              label="Interested Plot No. (Optional)"
              placeholder="e.g. GM-101 or SE-12"
              error={errors.interestedPlotNumber?.message}
              {...register('interestedPlotNumber')}
            />

            <FormInput
              label="Minimum Budget (₹)"
              type="number"
              prefix="₹"
              required
              placeholder="3500000"
              error={errors.budgetMin?.message}
              {...register('budgetMin')}
            />

            <FormInput
              label="Maximum Budget (₹)"
              type="number"
              prefix="₹"
              required
              placeholder="5000000"
              error={errors.budgetMax?.message}
              {...register('budgetMax')}
            />
          </div>
        </div>

        {/* Status & Next Followup */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Calendar className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Deal Pipeline Stage & Follow-up</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormSelect
              label="Pipeline Status"
              options={STATUS_OPTIONS}
              required
              error={errors.status?.message}
              {...register('status')}
            />

            <FormInput
              label="Next Follow-up Date"
              type="date"
              error={errors.nextFollowup?.message}
              {...register('nextFollowup')}
            />
          </div>

          <FormTextarea
            label="Client Requirements & Notes"
            placeholder="Plot dimensions preference, Vastu concerns, payment schedule flexibility..."
            rows={3}
            {...register('notes')}
          />
        </div>

        {/* Form actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(ROUTES.CUSTOMERS)}
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
            <span>Save Customer</span>
          </button>
        </div>
      </form>
    </div>
  );
}

AddCustomerPage.propTypes = {};
