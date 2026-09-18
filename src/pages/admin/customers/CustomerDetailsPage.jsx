import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppState } from '../../context/AppStateContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatCompactCurrency } from '../../utils/formatCurrency';
import { formatMediumDate, formatDateTime } from '../../utils/dateHelpers';
import { ROUTES } from '../../routes/routePaths';
import { PageHeader } from '../../components/layout/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { LoadingSpinner } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import {
  Phone,
  Mail,
  MessageCircle,
  Calendar,
  Clock,
  MapPin,
  IndianRupee,
  Edit2,
  Trash2,
  CheckCircle2,
  Plus,
  Send,
  Building,
  User,
  ShieldCheck,
} from 'lucide-react';

const PIPELINE_STAGES = [
  'New',
  'Interested',
  'Site Visit',
  'Negotiation',
  'Booked',
  'Converted',
];

export function CustomerDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    customers,
    appointments,
    plots,
    changeCustomerStatus,
    editCustomer,
    removeCustomer,
    loading,
  } = useAppState();
  const { success } = useToast();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [newNote, setNewNote] = useState('');

  const customer = customers.find((c) => c.id === id);

  // Linked appointments
  const customerAppts = appointments.filter(
    (a) => a.customerId === id || a.customerName === customer?.name
  );

  // Linked plot
  const linkedPlot = plots.find(
    (p) =>
      p.id === customer?.interestedPlotId ||
      p.plotNumber === customer?.interestedPlotNumber
  );

  if (loading) {
    return <LoadingSpinner text="Loading customer profile..." className="py-24" />;
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

  const handleStageChange = async (newStage) => {
    await changeCustomerStatus(customer.id, newStage);
    success(`Moved ${customer.name} to "${newStage}" stage`);
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    const timestamp = new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
    const updatedNotes = customer.notes
      ? `[${timestamp}] ${newNote}\n\n${customer.notes}`
      : `[${timestamp}] ${newNote}`;

    await editCustomer(customer.id, { notes: updatedNotes });
    setNewNote('');
    success('Note appended to customer timeline');
  };

  const handleDelete = async () => {
    await removeCustomer(customer.id);
    success(`Customer ${customer.name} removed`);
    navigate(ROUTES.CUSTOMERS);
  };

  const cleanPhone = customer.phone?.replace(/[^0-9]/g, '') || '';
  const currentStageIndex = PIPELINE_STAGES.indexOf(customer.status);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <PageHeader
        title={customer.name}
        subtitle={`Client from ${customer.city} • Lead Score ${customer.leadScore || 80}/100`}
        badge={<StatusBadge status={customer.status} />}
        breadcrumbs={[
          { label: 'Customers', to: ROUTES.CUSTOMERS },
          { label: customer.name },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(ROUTES.editCustomerPath(customer.id))}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              <Edit2 className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
            <button
              type="button"
              onClick={() =>
                navigate(
                  `${ROUTES.ADD_APPOINTMENT}?custId=${customer.id}&custName=${encodeURIComponent(
                    customer.name
                  )}&custPhone=${encodeURIComponent(customer.phone)}&proj=${encodeURIComponent(
                    customer.interestedProjectName
                  )}`
                )
              }
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment</span>
            </button>
            <button
              type="button"
              onClick={() => setDeleteModalOpen(true)}
              className="p-2 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors cursor-pointer"
              title="Delete Customer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        }
      />

      {/* Deal Pipeline Progression Tracker */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Deal Pipeline Progression
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {PIPELINE_STAGES.map((stage, idx) => {
            const isCompleted = currentStageIndex > idx;
            const isCurrent = customer.status === stage;

            return (
              <button
                key={stage}
                type="button"
                onClick={() => handleStageChange(stage)}
                className={`py-2 px-3 rounded-2xl text-xs font-bold transition-all text-center cursor-pointer border ${
                  isCurrent
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : isCompleted
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-slate-800'
                }`}
              >
                <span className="block text-[10px] opacity-70 mb-0.5">Step {idx + 1}</span>
                <span>{stage}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Profile Info & Direct Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 5 Cols: Contact Card & Property Preference */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Buyer Profile & Quick Connect</h3>

            {/* Direct Connect Buttons */}
            <div className="grid grid-cols-3 gap-2 py-2">
              <a
                href={`tel:${customer.phone}`}
                className="p-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-2xl flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer text-xs font-bold"
              >
                <Phone className="w-5 h-5 text-emerald-600" />
                <span>Call Buyer</span>
              </a>
              <a
                href={`https://wa.me/${cleanPhone}`}
                target="_blank"
                rel="noreferrer"
                className="p-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-2xl flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer text-xs font-bold"
              >
                <MessageCircle className="w-5 h-5 text-emerald-600" />
                <span>WhatsApp</span>
              </a>
              {customer.email ? (
                <a
                  href={`mailto:${customer.email}`}
                  className="p-3 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-2xl flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer text-xs font-bold"
                >
                  <Mail className="w-5 h-5 text-blue-600" />
                  <span>Send Email</span>
                </a>
              ) : (
                <div className="p-3 bg-slate-50 text-slate-400 rounded-2xl flex flex-col items-center justify-center gap-1 text-xs">
                  <Mail className="w-5 h-5 opacity-40" />
                  <span>No Email</span>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Mobile Phone</span>
                <span className="font-bold text-slate-900">{customer.phone}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Email Address</span>
                <span className="font-medium text-slate-700">{customer.email || 'Not provided'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">City / Region</span>
                <span className="font-bold text-slate-900">{customer.city}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Budget Range</span>
                <span className="font-black text-emerald-700">
                  {formatCurrency(customer.budgetMin)} - {formatCurrency(customer.budgetMax)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Assigned Agent</span>
                <span className="font-bold text-slate-800">{customer.assignedAgent || 'Vikram Mehta'}</span>
              </div>
            </div>
          </div>

          {/* Linked Target Plot Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Target Project & Plot</h3>
            <p className="text-xs text-slate-500">
              Project: <span className="font-bold text-slate-800">{customer.interestedProjectName}</span>
            </p>

            {linkedPlot ? (
              <div
                onClick={() => navigate(ROUTES.plotDetailsPath(linkedPlot.id))}
                className="p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50/50 border border-slate-100 transition-colors cursor-pointer flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={linkedPlot.photos[0]}
                    alt=""
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div>
                    <p className="text-xs font-black text-slate-900">Plot {linkedPlot.plotNumber}</p>
                    <p className="text-[11px] text-slate-500">{linkedPlot.areaSqft} sq.ft • {linkedPlot.facing} Facing</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-emerald-700">{formatCompactCurrency(linkedPlot.totalAmount)}</p>
                  <StatusBadge status={linkedPlot.status} />
                </div>
              </div>
            ) : customer.interestedPlotNumber ? (
              <p className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                Plot {customer.interestedPlotNumber}
              </p>
            ) : (
              <p className="text-xs text-slate-400 italic">No specific plot parcel linked yet.</p>
            )}
          </div>
        </div>

        {/* Right 7 Cols: Interaction Notes Timeline & Scheduled Appointments */}
        <div className="lg:col-span-7 space-y-6">
          {/* Appointments Widget */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>Appointments & Site Visits</span>
              </h3>
              <button
                type="button"
                onClick={() =>
                  navigate(
                    `${ROUTES.ADD_APPOINTMENT}?custId=${customer.id}&custName=${encodeURIComponent(
                      customer.name
                    )}&custPhone=${encodeURIComponent(customer.phone)}&proj=${encodeURIComponent(
                      customer.interestedProjectName
                    )}`
                  )
                }
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer"
              >
                + New Appointment
              </button>
            </div>

            {customerAppts.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                No appointments scheduled for this customer yet.
              </p>
            ) : (
              <div className="space-y-2.5">
                {customerAppts.map((appt) => (
                  <div
                    key={appt.id}
                    onClick={() => navigate(ROUTES.APPOINTMENTS)}
                    className="p-3 bg-slate-50 hover:bg-emerald-50/50 rounded-2xl border border-slate-100 transition-colors cursor-pointer flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900">{appt.type}</p>
                      <p className="text-[11px] text-slate-500">
                        {appt.date} at {appt.time} • {appt.location}
                      </p>
                    </div>
                    <StatusBadge status={appt.status} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes & Interaction Log */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Interaction Log & Requirement Notes</h3>

            {/* Quick Note Logger */}
            <form onSubmit={handleAddNote} className="flex gap-2">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Log a call, site visit feedback, or next step..."
                className="flex-1 px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer flex-shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Log</span>
              </button>
            </form>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 max-h-60 overflow-y-auto">
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                {customer.notes || 'No notes logged yet. Use the logger above to record call logs.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Customer Profile?"
        message={`Are you sure you want to permanently delete ${customer.name}? This cannot be undone.`}
        confirmText="Delete Customer"
      />
    </div>
  );
}

CustomerDetailsPage.propTypes = {};
