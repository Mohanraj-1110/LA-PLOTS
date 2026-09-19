import React, { useState } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { useToast } from '../../context/ToastContext';
import { appointmentService } from '../../services/appointmentService';
import {
  Calendar,
  Clock,
  User,
  Phone,
  MapPin,
  Plus,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
} from 'lucide-react';

export function AgentAppointmentsPage() {
  const { appointments = [], plots = [], refreshAppointments } = useAppState() || {};
  const { success, error: toastError } = useToast();

  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [plotNumber, setPlotNumber] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [notes, setNotes] = useState('');

  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    if (!customerName.trim() || !appointmentDate) {
      toastError('Customer name and appointment date are required.');
      return;
    }

    setSubmitting(true);
    try {
      await appointmentService.createAppointment({
        customerName: customerName.trim(),
        phone: phone.trim(),
        plotNumber: plotNumber.trim(),
        appointmentDate,
        date: appointmentDate,
        status: 'Scheduled',
        notes: notes.trim(),
        type: 'Site Visit',
      });
      success('Site visit scheduled successfully!');
      setShowModal(false);
      setCustomerName('');
      setPhone('');
      setPlotNumber('');
      setAppointmentDate('');
      setNotes('');
      if (refreshAppointments) refreshAppointments();
    } catch (err) {
      toastError(err.message || 'Failed to schedule appointment');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAppointments = appointments
    .filter((a) => {
      if (filter === 'all') return true;
      return (a.status || 'Scheduled').toLowerCase() === filter.toLowerCase();
    })
    .filter((a) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        a.customerName?.toLowerCase().includes(q) ||
        a.phone?.toLowerCase().includes(q) ||
        a.plotNumber?.toLowerCase().includes(q)
      );
    });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-display tracking-tight">
            Client Site Visits & Appointments
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Coordinate buyer property tours, layout visits, and physical plot verifications.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Book New Site Visit</span>
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200/80 shadow-xs">
          {['all', 'scheduled', 'completed', 'cancelled'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                filter === tab
                  ? 'bg-teal-50 text-teal-900 shadow-xs border border-teal-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search client name, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
          />
        </div>
      </div>

      {/* Appointments Grid / List */}
      {filteredAppointments.length === 0 ? (
        <div className="py-16 text-center rounded-3xl bg-white border border-dashed border-slate-200">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-700">No appointments found</p>
          <p className="text-xs text-slate-400 mt-1">
            {searchQuery ? 'No appointments match your search.' : 'Schedule your first client site visit to get started.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAppointments.map((appt) => {
            const isCompleted = appt.status === 'Completed';
            const isCancelled = appt.status === 'Cancelled';

            return (
              <div
                key={appt._id || appt.id}
                className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-sm font-black text-slate-900">
                      {appt.customerName || 'Client Visit'}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                        isCompleted
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : isCancelled
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : 'bg-teal-50 text-teal-800 border-teal-200'
                      }`}
                    >
                      {appt.status || 'Scheduled'}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs py-2 border-y border-slate-100 mb-3">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Clock className="w-3.5 h-3.5 text-teal-600" />
                      <span className="font-semibold text-slate-800">
                        {appt.date || appt.appointmentDate || 'Upcoming'}
                      </span>
                    </div>
                    {appt.phone && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <a href={`tel:${appt.phone}`} className="hover:text-teal-700">
                          {appt.phone}
                        </a>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>Plot: {appt.plotNumber || 'General Layout Tour'}</span>
                    </div>
                    {appt.notes && (
                      <p className="text-[11px] text-slate-500 italic mt-1 bg-slate-50 p-2 rounded-xl">
                        "{appt.notes}"
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Booking Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 font-display mb-1">
              Book Client Site Visit
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Schedule property inspection with client details
            </p>

            <form onSubmit={handleCreateAppointment} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Customer Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mobile Phone Number</label>
                <input
                  type="tel"
                  placeholder="e.g. +91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Plot of Interest</label>
                <select
                  value={plotNumber}
                  onChange={(e) => setPlotNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  <option value="">General Site Tour / Unspecified</option>
                  {plots.map((p) => (
                    <option key={p._id || p.id} value={p.plotNumber}>
                      Plot #{p.plotNumber} ({p.facing || 'East'} - {p.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Visit Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Notes / Client Requirements</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Client interested in corner East-facing parcel"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold transition-all shadow-xs"
                >
                  {submitting ? 'Booking...' : 'Confirm Visit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AgentAppointmentsPage;
