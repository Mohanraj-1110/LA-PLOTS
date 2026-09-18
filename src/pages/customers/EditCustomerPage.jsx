import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppState } from '../../context/AppStateContext';
import { useToast } from '../../context/ToastContext';
import { customerSchema } from '../../utils/validators';
import { ROUTES } from '../../routes/routePaths';
import { PageHeader } from '../../components/layout/PageHeader';
import { FormInput } from '../../components/forms/FormInput';
import { FormSelect } from '../../components/forms/FormSelect';
import { FormTextarea } from '../../components/forms/FormTextarea';
import { LoadingSpinner } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
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

export function EditCustomerPage() {
  const { id } = useParams();
  const { customers, editCustomer, loading: stateLoading } = useAppState();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const customer = customers.find((c) => c.id === id);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(customerSchema),
  });

  useEffect(() => {
    if (customer) {
      reset({
        name: customer.name,
        phone: customer.phone,
        email: customer.email || '',
        city: customer.city || 'Bengaluru',
        budgetMin: customer.budgetMin,
        budgetMax: customer.budgetMax,
        interestedProjectName: customer.interestedProjectName,
        interestedPlotNumber: customer.interestedPlotNumber || '',
        status: customer.status,
        nextFollowup: customer.nextFollowup || '',
        notes: customer.notes || '',
      });
    }
  }, [customer, reset]);

  if (stateLoading) {
    return <LoadingSpinner text="Loading customer data..." className="py-24" />;
  }

  if (!customer) {
    return (
      <ErrorState
        title="Customer Not Found"
        message={`No customer matching ID ${id}.`}
        onRetry={() => navigate(ROUTES.CUSTOMERS)}
      />
    );
  }

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await editCustomer(id, data);
      success(`Customer ${data.name} updated!`);
      navigate(ROUTES.customerDetailsPath(id));
    } catch (err) {
      toastError(err.message || 'Failed to update customer');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title={`Edit ${customer.name}`}
        subtitle={`Pipeline stage: ${customer.status}`}
        breadcrumbs={[
          { label: 'Customers', to: ROUTES.CUSTOMERS },
          { label: customer.name, to: ROUTES.customerDetailsPath(id) },
          { label: 'Edit' },
        ]}
        actions={
          <button
            type="button"
            onClick={() => navigate(ROUTES.customerDetailsPath(id))}
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
            <UserPlus className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Personal & Contact Information</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Full Name"
              required
              error={errors.name?.message}
              {...register('name')}
            />

            <FormInput
              label="Mobile Number"
              icon={Phone}
              required
              error={errors.phone?.message}
              {...register('phone')}
            />

            <FormInput
              label="Email Address"
              icon={Mail}
              error={errors.email?.message}
              {...register('email')}
            />

            <FormInput
              label="City"
              icon={MapPin}
              required
              error={errors.city?.message}
              {...register('city')}
            />
          </div>
        </div>

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
              label="Interested Plot No."
              error={errors.interestedPlotNumber?.message}
              {...register('interestedPlotNumber')}
            />

            <FormInput
              label="Minimum Budget (₹)"
              type="number"
              prefix="₹"
              required
              error={errors.budgetMin?.message}
              {...register('budgetMin')}
            />

            <FormInput
              label="Maximum Budget (₹)"
              type="number"
              prefix="₹"
              required
              error={errors.budgetMax?.message}
              {...register('budgetMax')}
            />
          </div>
        </div>

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
            rows={3}
            {...register('notes')}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(ROUTES.customerDetailsPath(id))}
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
            <span>Update Customer</span>
          </button>
        </div>
      </form>
    </div>
  );
}

EditCustomerPage.propTypes = {};
