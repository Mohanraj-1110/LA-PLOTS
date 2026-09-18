import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppState } from '../../context/AppStateContext';
import { useToast } from '../../context/ToastContext';
import { appointmentSchema } from '../../utils/validators';
import { ROUTES } from '../../routes/routePaths';
import { PageHeader } from '../../components/layout/PageHeader';
import { FormInput } from '../../components/forms/FormInput';
import { FormSelect } from '../../components/forms/FormSelect';
import { FormTextarea } from '../../components/forms/FormTextarea';
import {
  CalendarPlus,
  Calendar,
  Clock,
  MapPin,
  Building,
  User,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';

const APPT_TYPES = [
  'Site Visit',
  'Office Meeting',
  'Document Meeting',
  'Follow-up Call',
  'Registration',
  'Payment',
];

const PROJECT_OPTIONS = [
  'Greenfield Meadows',
  'Vedic Valley',
  'Emerald Palms',
  'Sunrise Enclave',
  'Golden Acres',
];

export function AddAppointmentPage() {
  const [searchParams] = useSearchParams();
  const { addAppointment, customers, plots } = useAppState();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  // Pre-fill query params if forwarded from Customer Details or Plot Details
  const initialCustId = searchParams.get('custId') || '';
  const initialCustName = searchParams.get('custName') || '';
  const initialCustPhone = searchParams.get('custPhone') || '';
  const initialPlot = searchParams.get('plotNo') || '';
  const initialProj = searchParams.get('proj') || 'Greenfield Meadows';

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      customerName: initialCustName,
      customerPhone: initialCustPhone,
      projectName: initialProj,
      plotNumber: initialPlot,
      type: 'Site Visit',
      date: new Date().toISOString().split('T')[0],
      time: '10:30 AM',
      location: 'Site Office',
      notes: '',
    },
  });

  const handleSelectCustomer = (e) => {
    const custId = e.target.value;
    const found = customers.find((c) => c.id === custId);
    if (found) {
      setValue('customerName', found.name);
      setValue('customerPhone', found.phone);
      if (found.interestedProjectName) setValue('projectName', found.interestedProjectName);
      if (found.interestedPlotNumber) setValue('plotNumber', found.interestedPlotNumber);
    }
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const newAppt = await addAppointment({
        ...data,
        customerId: initialCustId,
      });
      success(`Appointment with ${newAppt.customerName} scheduled!`, 'Appointment Confirmed');
      navigate(ROUTES.APPOINTMENTS);
    } catch (err) {
      toastError(err.message || 'Failed to schedule appointment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Schedule New Appointment"
        subtitle="Book site visit, office negotiation, registry, or document signing"
        breadcrumbs={[
          { label: 'Appointments', to: ROUTES.APPOINTMENTS },
          { label: 'Schedule Appointment' },
        ]}
        actions={
          <button
            type="button"
            onClick={() => navigate(ROUTES.APPOINTMENTS)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Cancel</span>
          </button>
        }
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Customer Information */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">Customer Details</h3>
            </div>
            {customers.length > 0 && (
              <select
                onChange={handleSelectCustomer}
                className="text-xs font-semibold py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer"
              >
                <option value="">Quick Fill from Client List...</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Customer Full Name"
              placeholder="e.g. Dr. Suresh Reddy"
              required
              error={errors.customerName?.message}
              {...register('customerName')}
            />

            <FormInput
              label="Customer Mobile Number"
              placeholder="+91 98850 33412"
              required
              error={errors.customerPhone?.message}
              {...register('customerPhone')}
            />
          </div>
        </div>

        {/* Appointment Type, Date & Time */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Calendar className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Schedule & Engagement Type</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormSelect
              label="Appointment Type"
              options={APPT_TYPES}
              required
              error={errors.type?.message}
              {...register('type')}
            />

            <FormInput
              label="Meeting Date"
              type="date"
              required
              error={errors.date?.message}
              {...register('date')}
            />

            <FormInput
              label="Meeting Time"
              placeholder="e.g. 10:30 AM"
              required
              error={errors.time?.message}
              {...register('time')}
            />
          </div>
        </div>

        {/* Location, Project & Plot */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <MapPin className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Venue & Property Association</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormSelect
              label="Project"
              options={PROJECT_OPTIONS}
              required
              error={errors.projectName?.message}
              {...register('projectName')}
            />

            <FormInput
              label="Associated Plot No. (Optional)"
              placeholder="e.g. SE-12"
              error={errors.plotNumber?.message}
              {...register('plotNumber')}
            />

            <FormInput
              label="Meeting Location / Venue"
              placeholder="e.g. Site Office, Shamshabad"
              required
              error={errors.location?.message}
              {...register('location')}
            />
          </div>

          <FormTextarea
            label="Agenda & Specific Preparation Notes"
            placeholder="e.g. Family visit with civil engineer for soil inspection, arrange site vehicle..."
            rows={3}
            {...register('notes')}
          />
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(ROUTES.APPOINTMENTS)}
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
            <span>Confirm Appointment</span>
          </button>
        </div>
      </form>
    </div>
  );
}

AddAppointmentPage.propTypes = {};
