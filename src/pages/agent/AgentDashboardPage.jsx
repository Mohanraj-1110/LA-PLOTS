import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppState } from '../../context/AppStateContext';
import { useAuth } from '../../context/AuthContext';
import {
  MapPin,
  Calendar,
  Compass,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Search,
  Filter,
  Eye,
  Plus,
  Building,
  CalendarPlus,
  UserCheck,
} from 'lucide-react';

export function AgentDashboardPage() {
  const { profile } = useAuth();
  const { plots = [], appointments = [], enquiries = [] } = useAppState() || {};
  const [plotFilter, setPlotFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Property Details Only - Zero Sales Turnover / Amounts
  const totalPlots = plots.length;
  const availablePlots = plots.filter((p) => p.status === 'available').length;
  const reservedPlots = plots.filter((p) => p.status === 'reserved').length;
  const soldPlots = plots.filter((p) => p.status === 'sold').length;

  const upcomingAppts = appointments.filter(
    (a) => a.status === 'Upcoming' || a.status === 'Scheduled'
  );
  const activeEnquiries = enquiries.filter(
    (e) => e.status === 'New' || e.status === 'In Progress'
  );

  const filteredPlots = plots
    .filter((p) => {
      if (plotFilter === 'all') return true;
      return p.status === plotFilter;
    })
    .filter((p) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        p.plotNumber?.toLowerCase().includes(q) ||
        p.project?.toLowerCase().includes(q) ||
        p.facing?.toLowerCase().includes(q) ||
        p.type?.toLowerCase().includes(q)
      );
    });

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-teal-900 via-slate-900 to-emerald-950 p-6 sm:p-8 text-white relative overflow-hidden shadow-lg border border-teal-800/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-400/30 mb-3">
              <Building className="w-3.5 h-3.5" /> Property Consultant Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight font-display">
              Welcome back, {profile?.name || 'Partner Agent'}
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-300 max-w-xl">
              Track live plot availability, coordinate client site visits, and follow up with buyer inquiries across all layout developments.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              to="/agent/appointments"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-extrabold shadow-md transition-all active:scale-95"
            >
              <CalendarPlus className="w-4 h-4" />
              <span>Book Client Visit</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Property Details Metric Cards (Zero Sales Figures) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="rounded-2xl bg-white p-4 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Plots</span>
            <MapPin className="w-4 h-4 text-slate-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{totalPlots}</p>
          <p className="text-[10px] text-slate-400 mt-1 font-semibold">Total parcels</p>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Available</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-700">{availablePlots}</p>
          <p className="text-[10px] text-emerald-600/80 mt-1 font-semibold">Ready for booking</p>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Reserved</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-700">{reservedPlots}</p>
          <p className="text-[10px] text-amber-600/80 mt-1 font-semibold">Under token advance</p>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-600 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Sold</span>
            <Building className="w-4 h-4 text-slate-600" />
          </div>
          <p className="text-2xl font-black text-slate-800">{soldPlots}</p>
          <p className="text-[10px] text-slate-400 mt-1 font-semibold">Registered plots</p>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-teal-600 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Site Visits</span>
            <Calendar className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-black text-teal-700">{upcomingAppts.length}</p>
          <p className="text-[10px] text-teal-600/80 mt-1 font-semibold">Scheduled client visits</p>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-indigo-600 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Inquiries</span>
            <Compass className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-indigo-700">{activeEnquiries.length}</p>
          <p className="text-[10px] text-indigo-600/80 mt-1 font-semibold">Active buyer leads</p>
        </div>
      </div>

      {/* Two Column Layout: Plot Inventory + Site Visits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Property Inventory Details */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
              <div>
                <h2 className="text-base font-black text-slate-900 font-display">
                  Property Inventory Directory
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Detailed plot parcels, dimensions, orientation & availability
                </p>
              </div>

              {/* Status Filter Buttons */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                {['all', 'available', 'reserved', 'sold'].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setPlotFilter(tab)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                      plotFilter === tab
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input */}
            <div className="relative mb-4">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by plot number, layout project, or facing..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
              />
            </div>

            {/* Plot List Table / Cards */}
            {filteredPlots.length === 0 ? (
              <div className="py-12 text-center rounded-2xl bg-slate-50/60 border border-dashed border-slate-200">
                <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-600">No properties found</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {searchQuery ? 'Try changing your search or filter criteria.' : 'No plot inventory is currently registered in the database.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-extrabold tracking-wider">
                      <th className="pb-3 font-extrabold">Plot #</th>
                      <th className="pb-3 font-extrabold">Dimensions / Area</th>
                      <th className="pb-3 font-extrabold">Facing</th>
                      <th className="pb-3 font-extrabold">Type</th>
                      <th className="pb-3 font-extrabold">Status</th>
                      <th className="pb-3 font-extrabold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPlots.slice(0, 8).map((plot) => {
                      const statusStyles = {
                        available: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                        reserved: 'bg-amber-50 text-amber-700 border-amber-200',
                        sold: 'bg-slate-100 text-slate-600 border-slate-200',
                      };
                      return (
                        <tr key={plot._id || plot.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 font-black text-slate-900">
                            {plot.plotNumber || 'Plot'}
                          </td>
                          <td className="py-3 text-slate-600 font-semibold">
                            {plot.areaSqft ? `${plot.areaSqft} sq.ft` : 'N/A'}
                            {plot.dimensions ? ` (${plot.dimensions})` : ''}
                          </td>
                          <td className="py-3 text-slate-600 font-medium capitalize">
                            {plot.facing || 'East'}
                          </td>
                          <td className="py-3 text-slate-600 font-medium capitalize">
                            {plot.type || 'Residential'}
                          </td>
                          <td className="py-3">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border capitalize ${
                                statusStyles[plot.status] || statusStyles.available
                              }`}
                            >
                              {plot.status || 'available'}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <Link
                              to={`/plots/${plot._id || plot.id}`}
                              className="inline-flex items-center gap-1 text-teal-700 hover:text-teal-800 font-bold text-xs"
                            >
                              <span>View</span>
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Site Visits & Leads */}
        <div className="space-y-6">
          {/* Upcoming Site Visits */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 font-display">
                  Scheduled Site Visits
                </h3>
                <p className="text-[11px] text-slate-400">Client appointments</p>
              </div>
              <Link
                to="/agent/appointments"
                className="text-xs font-bold text-teal-700 hover:text-teal-800"
              >
                View All
              </Link>
            </div>

            {upcomingAppts.length === 0 ? (
              <div className="py-8 text-center rounded-2xl bg-slate-50/60 border border-dashed border-slate-200">
                <Calendar className="w-6 h-6 text-slate-300 mx-auto mb-1.5" />
                <p className="text-xs font-bold text-slate-600">No scheduled visits</p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Book a new site inspection with interested buyers.
                </p>
                <Link
                  to="/agent/appointments"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-800"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Schedule Site Visit</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingAppts.slice(0, 4).map((appt) => (
                  <div
                    key={appt._id || appt.id}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-2"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        {appt.customerName || 'Client Visit'}
                      </p>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Plot: {appt.plotNumber || 'General Layout'}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400 font-semibold">
                        <Clock className="w-3 h-3 text-teal-600" />
                        <span>{appt.date || appt.appointmentDate || 'Upcoming'}</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-teal-100 text-teal-800 uppercase">
                      {appt.status || 'Scheduled'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Customer Leads & Enquiries */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 font-display">
                  Active Buyer Inquiries
                </h3>
                <p className="text-[11px] text-slate-400">Assigned customer leads</p>
              </div>
              <Link
                to="/agent/enquiries"
                className="text-xs font-bold text-teal-700 hover:text-teal-800"
              >
                View All
              </Link>
            </div>

            {activeEnquiries.length === 0 ? (
              <div className="py-8 text-center rounded-2xl bg-slate-50/60 border border-dashed border-slate-200">
                <Compass className="w-6 h-6 text-slate-300 mx-auto mb-1.5" />
                <p className="text-xs font-bold text-slate-600">No active enquiries</p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Customer web and call leads will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeEnquiries.slice(0, 4).map((enq) => (
                  <div
                    key={enq._id || enq.id}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-100"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-slate-800">{enq.name || 'Inquirer'}</p>
                      <span className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 uppercase">
                        {enq.status || 'New'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 truncate">
                      {enq.message || enq.notes || enq.phone || 'Interested in property'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AgentDashboardPage;
