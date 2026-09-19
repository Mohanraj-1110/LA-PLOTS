import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppState } from '../../context/AppStateContext';
import {
  MapPin,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Building,
  Eye,
  CalendarPlus,
  ExternalLink,
} from 'lucide-react';

export function AgentPlotsPage() {
  const { plots = [] } = useAppState() || {};
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPlots = plots
    .filter((p) => {
      if (filterStatus === 'all') return true;
      return p.status === filterStatus;
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

  const availableCount = plots.filter((p) => p.status === 'available').length;
  const reservedCount = plots.filter((p) => p.status === 'reserved').length;
  const soldCount = plots.filter((p) => p.status === 'sold').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-display tracking-tight">
            Property Inventory Catalog
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete real-time plot specifications, dimensions, facing, and status for client presentations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/agent/appointments"
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
          >
            <CalendarPlus className="w-4 h-4" />
            <span>Schedule Site Visit</span>
          </Link>
        </div>
      </div>

      {/* Summary Chips */}
      <div className="flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          onClick={() => setFilterStatus('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filterStatus === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
          }`}
        >
          All Plots ({plots.length})
        </button>
        <button
          type="button"
          onClick={() => setFilterStatus('available')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filterStatus === 'available'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
          }`}
        >
          Available ({availableCount})
        </button>
        <button
          type="button"
          onClick={() => setFilterStatus('reserved')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filterStatus === 'reserved'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-50'
          }`}
        >
          Reserved ({reservedCount})
        </button>
        <button
          type="button"
          onClick={() => setFilterStatus('sold')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filterStatus === 'sold'
              ? 'bg-slate-700 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Sold ({soldCount})
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Filter plots by number (e.g. A-12), project layout, facing (e.g. North-East)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200/80 rounded-2xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-xs transition-all"
        />
      </div>

      {/* Plots Grid */}
      {filteredPlots.length === 0 ? (
        <div className="py-16 text-center rounded-3xl bg-white border border-dashed border-slate-200">
          <MapPin className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-700">No plots found</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? 'No plots matched your search criteria. Try a different query.'
              : 'The property database is currently empty.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {filteredPlots.map((plot) => {
            const isAvailable = plot.status === 'available';
            const isReserved = plot.status === 'reserved';

            return (
              <div
                key={plot._id || plot.id}
                className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Top Status & Plot # */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-base font-black text-slate-900 group-hover:text-teal-700 transition-colors">
                      Plot #{plot.plotNumber}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                        isAvailable
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : isReserved
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {plot.status || 'Available'}
                    </span>
                  </div>

                  {/* Property Specifications */}
                  <div className="space-y-2 text-xs py-2 border-y border-slate-100 mb-3">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-400 font-semibold">Area / Dimensions</span>
                      <span className="font-bold text-slate-800">
                        {plot.areaSqft ? `${plot.areaSqft} sq.ft` : 'N/A'}
                        {plot.dimensions ? ` (${plot.dimensions})` : ''}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-400 font-semibold">Orientation</span>
                      <span className="font-bold text-slate-800 capitalize">
                        {plot.facing || 'East Facing'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-400 font-semibold">Type</span>
                      <span className="font-bold text-slate-800 capitalize">
                        {plot.type || 'Residential'}
                      </span>
                    </div>
                    {plot.project && (
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="text-slate-400 font-semibold">Layout Phase</span>
                        <span className="font-bold text-slate-800 truncate max-w-[120px]">
                          {plot.project}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-2 flex items-center gap-2">
                  <Link
                    to={`/plots/${plot._id || plot.id}`}
                    className="flex-1 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-center text-xs font-bold text-slate-700 transition-colors inline-flex items-center justify-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Details</span>
                  </Link>

                  {isAvailable && (
                    <Link
                      to="/agent/appointments"
                      className="py-2 px-3 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold transition-colors inline-flex items-center gap-1"
                      title="Schedule visit for client"
                    >
                      <CalendarPlus className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AgentPlotsPage;
