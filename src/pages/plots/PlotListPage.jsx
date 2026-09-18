import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppState } from '../../context/AppStateContext';
import { ROUTES } from '../../routes/routePaths';
import { formatCurrency, formatSqft } from '../../utils/formatCurrency';
import { PageHeader } from '../../components/layout/PageHeader';
import { SearchBar } from '../../components/common/SearchBar';
import { FilterButton } from '../../components/common/FilterButton';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useToast } from '../../context/ToastContext';
import {
  Plus,
  LayoutGrid,
  List,
  Eye,
  Edit2,
  Trash2,
  MapPin,
} from 'lucide-react';

export function PlotListPage() {
  const { plots, removePlot } = useAppState();
  const { success } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Delete confirm state
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Status counts
  const counts = useMemo(() => {
    return {
      all: plots.length,
      available: plots.filter((p) => p.status === 'available').length,
      reserved: plots.filter((p) => p.status === 'reserved').length,
      sold: plots.filter((p) => p.status === 'sold').length,
      blocked: plots.filter((p) => p.status === 'blocked').length,
    };
  }, [plots]);

  // Unique project names for filter
  const projects = useMemo(() => {
    const set = new Set(plots.map((p) => p.projectName));
    return Array.from(set);
  }, [plots]);

  // Filtered & sorted plots
  const filteredPlots = useMemo(() => {
    return plots
      .filter((plot) => {
        // Status filter
        if (statusFilter !== 'all' && plot.status !== statusFilter) return false;

        // Project filter
        if (projectFilter !== 'all' && plot.projectName !== projectFilter) return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchPlotNo = plot.plotNumber?.toLowerCase().includes(q);
          const matchSurvey = plot.surveyNumber?.toLowerCase().includes(q);
          const matchProj = plot.projectName?.toLowerCase().includes(q);
          const matchLoc = plot.location?.toLowerCase().includes(q);
          if (!matchPlotNo && !matchSurvey && !matchProj && !matchLoc) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.totalAmount - b.totalAmount;
        if (sortBy === 'price-desc') return b.totalAmount - a.totalAmount;
        if (sortBy === 'area-asc') return a.areaSqft - b.areaSqft;
        if (sortBy === 'area-desc') return b.areaSqft - a.areaSqft;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
  }, [plots, statusFilter, projectFilter, searchQuery, sortBy]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    await removePlot(deleteTarget.id);
    success(`Plot ${deleteTarget.plotNumber} deleted successfully`);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Plot Inventory"
        subtitle={`Showing ${filteredPlots.length} of ${plots.length} total plots`}
        badge={
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            {counts.available} Available Now
          </span>
        }
        actions={
          <button
            type="button"
            onClick={() => navigate(ROUTES.ADD_PLOT)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Plot</span>
          </button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <FilterButton
            label="All Plots"
            count={counts.all}
            active={statusFilter === 'all'}
            onClick={() => {
              setStatusFilter('all');
              setSearchParams({});
            }}
          />
          <FilterButton
            label="Available"
            count={counts.available}
            active={statusFilter === 'available'}
            onClick={() => {
              setStatusFilter('available');
              setSearchParams({ status: 'available' });
            }}
          />
          <FilterButton
            label="Reserved"
            count={counts.reserved}
            active={statusFilter === 'reserved'}
            onClick={() => {
              setStatusFilter('reserved');
              setSearchParams({ status: 'reserved' });
            }}
          />
          <FilterButton
            label="Sold"
            count={counts.sold}
            active={statusFilter === 'sold'}
            onClick={() => {
              setStatusFilter('sold');
              setSearchParams({ status: 'sold' });
            }}
          />
          <FilterButton
            label="Blocked"
            count={counts.blocked}
            active={statusFilter === 'blocked'}
            onClick={() => {
              setStatusFilter('blocked');
              setSearchParams({ status: 'blocked' });
            }}
          />
        </div>

        {/* Search, Project Filter, Sort & View Mode Switcher */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          <div className="lg:col-span-5">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by plot no, survey no, or project..."
            />
          </div>

          <div className="lg:col-span-3">
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
            >
              <option value="all">All Projects ({projects.length})</option>
              {projects.map((proj) => (
                <option key={proj} value={proj}>
                  {proj}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
            >
              <option value="newest">Sort: Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="area-asc">Area: Low to High</option>
              <option value="area-desc">Area: High to Low</option>
            </select>
          </div>

          {/* Desktop Grid vs Table view toggle */}
          <div className="hidden lg:flex lg:col-span-2 justify-end items-center gap-1">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
              }`}
              title="Card Grid"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Plot List Content */}
      {filteredPlots.length === 0 ? (
        <EmptyState
          title="No plots match your filters"
          description="Try broadening your search term or reset the status filters to view plots."
          actionLabel="Add New Plot"
          onAction={() => navigate(ROUTES.ADD_PLOT)}
        />
      ) : viewMode === 'grid' ? (
        /* Card Grid View (Responsive 1 col mobile, 2 col tablet, 3-4 col desktop) */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {filteredPlots.map((plot) => (
            <div
              key={plot.id}
              onClick={() => navigate(ROUTES.plotDetailsPath(plot.id))}
              className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col group"
            >
              {/* Photo & Badge */}
              <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                <img
                  src={plot.photos[0]}
                  alt={plot.plotNumber}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-xl bg-white/95 backdrop-blur-md text-xs font-black text-slate-900 shadow-xs border border-white/40">
                    {plot.plotNumber}
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <StatusBadge status={plot.status} />
                </div>
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-white font-medium bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-xl">
                  <span className="truncate">{plot.projectName}</span>
                  <span className="flex-shrink-0 font-bold">{plot.facing} Facing</span>
                </div>
              </div>

              {/* Body details */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-xs text-slate-500 line-clamp-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                      <span>{plot.location}</span>
                    </p>
                    <span className="text-[10px] text-slate-400 font-mono flex-shrink-0">
                      {plot.surveyNumber}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 py-2.5 my-2 border-y border-slate-100 text-xs">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">Area</p>
                      <p className="font-bold text-slate-800">{formatSqft(plot.areaSqft)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">Rate</p>
                      <p className="font-bold text-slate-800">₹{plot.ratePerSqft} / sq.ft</p>
                    </div>
                  </div>
                </div>

                {/* Price & Action Bar */}
                <div className="pt-2 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Total Value</p>
                    <p className="text-base font-black text-emerald-700 leading-tight">
                      {formatCurrency(plot.totalAmount)}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(ROUTES.editPlotPath(plot.id));
                      }}
                      className="p-2 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer"
                      title="Edit Plot"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(plot);
                      }}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                      title="Delete Plot"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View (Desktop & Tablet with controlled horizontal scroll) */
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-700 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Plot No</th>
                  <th className="px-5 py-3.5">Project / Location</th>
                  <th className="px-5 py-3.5">Survey No</th>
                  <th className="px-5 py-3.5">Area (Sq.ft)</th>
                  <th className="px-5 py-3.5">Rate/Sq.ft</th>
                  <th className="px-5 py-3.5">Total Amount</th>
                  <th className="px-5 py-3.5">Facing / Road</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredPlots.map((plot) => (
                  <tr
                    key={plot.id}
                    onClick={() => navigate(ROUTES.plotDetailsPath(plot.id))}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-4 font-bold text-slate-900">{plot.plotNumber}</td>
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-900">{plot.projectName}</p>
                      <p className="text-[11px] text-slate-400">{plot.location}</p>
                    </td>
                    <td className="px-5 py-4 text-slate-500 font-mono">{plot.surveyNumber}</td>
                    <td className="px-5 py-4 font-bold text-slate-900">{formatSqft(plot.areaSqft)}</td>
                    <td className="px-5 py-4 font-semibold text-slate-800">₹{plot.ratePerSqft}</td>
                    <td className="px-5 py-4 font-black text-emerald-700">
                      {formatCurrency(plot.totalAmount)}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {plot.facing} • {plot.roadWidth}ft
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={plot.status} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => navigate(ROUTES.plotDetailsPath(plot.id))}
                          className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate(ROUTES.editPlotPath(plot.id))}
                          className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit Plot"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(plot)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Plot"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Plot Parcel?"
        message={`Are you sure you want to permanently delete Plot ${deleteTarget?.plotNumber} from ${deleteTarget?.projectName}? All linked history will be removed.`}
        confirmText="Delete Plot"
      />
    </div>
  );
}

PlotListPage.propTypes = {};
