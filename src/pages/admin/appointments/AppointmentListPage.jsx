import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../../context/AppStateContext';
import { ROUTES } from '../../routes/routePaths';
import { formatMediumDate } from '../../utils/dateHelpers';
import { PageHeader } from '../../components/layout/PageHeader';
import { SearchBar } from '../../components/common/SearchBar';
import { FilterButton } from '../../components/common/FilterButton';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useToast } from '../../context/ToastContext';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  CheckCircle2,
  XCircle,
  Plus,
  Building,
  User,
  Trash2,
  RotateCcw,
} from 'lucide-react';

const APPT_TYPES = [
  'All Types',
  'Site Visit',
  'Office Meeting',
  'Document Meeting',
  'Follow-up Call',
  'Registration',
  'Payment',
];

export function AppointmentListPage() {
  const { appointments, changeAppointmentStatus, removeAppointment } = useAppState();
  const { success } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('Upcoming'); // 'Upcoming' | 'Completed' | 'All'
  const [selectedType, setSelectedType] = useState('All Types');
  const [searchQuery, setSearchQuery] = useState('');
  const [cancelTarget, setCancelTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Tab counts
  const tabCounts = useMemo(() => {
    return {
      Upcoming: appointments.filter((a) => a.status === 'Upcoming').length,
      Completed: appointments.filter((a) => a.status === 'Completed').length,
      All: appointments.length,
    };
  }, [appointments]);

  const filteredAppts = useMemo(() => {
    return appointments.filter((a) => {
      // Tab filter
      if (activeTab === 'Upcoming' && a.status !== 'Upcoming') return false;
      if (activeTab === 'Completed' && a.status !== 'Completed') return false;

      // Type filter
      if (selectedType !== 'All Types' && a.type !== selectedType) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = a.customerName?.toLowerCase().includes(q);
        const matchPhone = a.customerPhone?.replace(/\s/g, '').includes(q.replace(/\s/g, ''));
        const matchProj = a.projectName?.toLowerCase().includes(q);
        const matchLoc = a.location?.toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchProj && !matchLoc) return false;
      }

      return true;
    });
  }, [appointments, activeTab, selectedType, searchQuery]);

  const handleMarkComplete = async (appt) => {
    await changeAppointmentStatus(appt.id, 'Completed');
    success(`Appointment with ${appt.customerName} marked as Completed!`);
  };

  const handleCancelConfirm = async () => {
    if (!cancelTarget) return;
    await changeAppointmentStatus(cancelTarget.id, 'Cancelled');
    success(`Appointment cancelled`);
    setCancelTarget(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    await removeAppointment(deleteTarget.id);
    success(`Appointment record removed`);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Appointments & Site Visits"
        subtitle={`Managing ${appointments.length} total scheduled engagements`}
        badge={
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            {tabCounts.Upcoming} Upcoming Visits
          </span>
        }
        actions={
          <button
            type="button"
            onClick={() => navigate(ROUTES.ADD_APPOINTMENT)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Appointment</span>
          </button>
        }
      />

      {/* Filter Tabs & Search */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Main Tabs */}
          <div className="flex items-center gap-2">
            <FilterButton
              label="Upcoming"
              count={tabCounts.Upcoming}
              active={activeTab === 'Upcoming'}
              onClick={() => setActiveTab('Upcoming')}
            />
            <FilterButton
              label="Completed"
              count={tabCounts.Completed}
              active={activeTab === 'Completed'}
              onClick={() => setActiveTab('Completed')}
            />
            <FilterButton
              label="All"
              count={tabCounts.All}
              active={activeTab === 'All'}
              onClick={() => setActiveTab('All')}
            />
          </div>

          {/* Type Filter dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="py-2 px-3 bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
            >
              {APPT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by customer, phone, location, or project..."
        />
      </div>

      {/* Appointment Cards (1 col mobile, 2 col tablet, 3 col desktop) */}
      {filteredAppts.length === 0 ? (
        <EmptyState
          title="No appointments scheduled"
          description="There are no appointments matching your current tab or search criteria."
          actionLabel="Schedule Appointment"
          onAction={() => navigate(ROUTES.ADD_APPOINTMENT)}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredAppts.map((appt) => (
            <div
              key={appt.id}
              className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-slate-100 text-slate-800 mb-1">
                      {appt.type}
                    </span>
                    <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                      {appt.customerName}
                    </h3>
                  </div>
                  <StatusBadge status={appt.status} />
                </div>

                {/* Date, Time, Location */}
                <div className="space-y-2 py-3 my-2 border-y border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span className="font-bold text-slate-900">{formatMediumDate(appt.date)}</span>
                    <span className="text-slate-400">•</span>
                    <span className="font-semibold text-slate-700">{appt.time}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{appt.location}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span className="font-medium text-slate-700 truncate">
                      {appt.projectName} {appt.plotNumber ? `(Plot ${appt.plotNumber})` : ''}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <a
                      href={`tel:${appt.customerPhone}`}
                      className="text-emerald-700 font-semibold hover:underline"
                    >
                      {appt.customerPhone}
                    </a>
                  </div>

                  {appt.notes && (
                    <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-100">
                      "{appt.notes}"
                    </p>
                  )}
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="pt-3 flex items-center justify-between gap-2">
                {appt.status === 'Upcoming' ? (
                  <button
                    type="button"
                    onClick={() => handleMarkComplete(appt)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Complete</span>
                  </button>
                ) : (
                  <span className="text-[11px] text-slate-400 font-medium">Session Concluded</span>
                )}

                <div className="flex items-center gap-1">
                  {appt.status === 'Upcoming' && (
                    <button
                      type="button"
                      onClick={() => setCancelTarget(appt)}
                      className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                      title="Cancel Appointment"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(appt)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete Appointment"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancel Confirm Dialog */}
      <ConfirmDialog
        isOpen={Boolean(cancelTarget)}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancelConfirm}
        title="Cancel Appointment?"
        message={`Are you sure you want to cancel the ${cancelTarget?.type} with ${cancelTarget?.customerName}?`}
        confirmText="Cancel Appointment"
        isDestructive={false}
      />

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Appointment Record?"
        message={`Are you sure you want to permanently delete this appointment record?`}
        confirmText="Delete Record"
        isDestructive={true}
      />
    </div>
  );
}

AppointmentListPage.propTypes = {};
