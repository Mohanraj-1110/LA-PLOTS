import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppState } from '../../context/AppStateContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatSqft, formatCompactCurrency } from '../../utils/formatCurrency';
import { ROUTES } from '../../routes/routePaths';
import { PageHeader } from '../../components/layout/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { LoadingSpinner } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import {
  Calendar,
  UserPlus,
  Users,
  CheckCircle2,
  Edit2,
  Trash2,
  Share2,
} from 'lucide-react';

export function PlotDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { plots, customers, changePlotStatus, removePlot, loading } = useAppState();
  const { success } = useToast();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(0);

  const plot = plots.find((p) => p.id === id);

  // Associated customers interested in this plot or project
  const interestedBuyers = customers.filter(
    (c) => c.interestedPlotId === id || c.interestedPlotNumber === plot?.plotNumber
  );

  if (loading) {
    return <LoadingSpinner text="Loading plot specifications..." className="py-24" />;
  }

  if (!plot) {
    return (
      <ErrorState
        title="Plot Not Found"
        message={`The plot parcel with ID ${id} does not exist in inventory.`}
        onRetry={() => navigate(ROUTES.PLOTS)}
      />
    );
  }

  const handleStatusUpdate = async (newStatus) => {
    await changePlotStatus(plot.id, newStatus);
    success(`Plot ${plot.plotNumber} status updated to ${newStatus}`);
  };

  const handleDelete = async () => {
    await removePlot(plot.id);
    success(`Plot ${plot.plotNumber} deleted from inventory`);
    navigate(ROUTES.PLOTS);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `LA PLOTS - Plot ${plot.plotNumber}`,
        text: `Plot ${plot.plotNumber} at ${plot.projectName}: ${plot.areaSqft} sq.ft @ ₹${plot.ratePerSqft}/sq.ft (${formatCurrency(plot.totalAmount)})`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      success('Plot link copied to clipboard!');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <PageHeader
        title={`Plot ${plot.plotNumber}`}
        subtitle={`${plot.projectName} • ${plot.location}`}
        badge={<StatusBadge status={plot.status} />}
        breadcrumbs={[
          { label: 'Plots', to: ROUTES.PLOTS },
          { label: plot.plotNumber },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="p-2 text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors cursor-pointer"
              title="Share Plot Link"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => navigate(ROUTES.editPlotPath(plot.id))}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              <Edit2 className="w-4 h-4" />
              <span>Edit</span>
            </button>

            <button
              type="button"
              onClick={() =>
                navigate(`${ROUTES.ADD_APPOINTMENT}?plotId=${plot.id}&plotNo=${plot.plotNumber}&proj=${encodeURIComponent(plot.projectName)}`)
              }
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Schedule Site Visit</span>
            </button>

            <button
              type="button"
              onClick={() => setDeleteModalOpen(true)}
              className="p-2 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors cursor-pointer"
              title="Delete Plot"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        }
      />

      {/* Main Grid: Photo Gallery Left, Specs Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Photo Gallery (7 cols desktop) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="relative h-72 sm:h-96 w-full rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 shadow-xs">
            <img
              src={plot.photos[selectedPhoto] || plot.photos[0]}
              alt={plot.plotNumber}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-md text-sm font-black text-slate-900 shadow-md">
                {plot.plotNumber}
              </span>
            </div>
            <div className="absolute top-4 right-4">
              <StatusBadge status={plot.status} />
            </div>
          </div>

          {plot.photos.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {plot.photos.map((photoUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedPhoto(idx)}
                  className={`relative w-20 h-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 cursor-pointer ${
                    selectedPhoto === idx ? 'border-emerald-600 ring-2 ring-emerald-600/30' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={photoUrl} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Specifications & Price Card (5 cols desktop) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Total Acquisition Price
              </p>
              <h2 className="text-3xl font-black text-emerald-700 tracking-tight leading-none">
                {formatCurrency(plot.totalAmount)}
              </h2>
              <p className="text-xs font-semibold text-slate-500 mt-1">
                ₹{plot.ratePerSqft} per sq.ft • All Inclusive Basic Price
              </p>
            </div>

            {/* Quick Status Setter Pills */}
            <div className="pt-3 border-t border-slate-100">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Update Property Status:
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleStatusUpdate('available')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    plot.status === 'available'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white hover:bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}
                >
                  Mark Available
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusUpdate('reserved')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    plot.status === 'reserved'
                      ? 'bg-amber-500 text-white border-amber-500'
                      : 'bg-white hover:bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  Mark Reserved
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusUpdate('sold')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    plot.status === 'sold'
                      ? 'bg-rose-600 text-white border-rose-600'
                      : 'bg-white hover:bg-rose-50 text-rose-800 border-rose-200'
                  }`}
                >
                  Mark Sold
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusUpdate('blocked')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    plot.status === 'blocked'
                      ? 'bg-slate-700 text-white border-slate-700'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                  }`}
                >
                  Admin Hold
                </button>
              </div>
            </div>

            {/* Key Specs Table */}
            <div className="pt-3 border-t border-slate-100 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Area Dimension</span>
                <span className="font-bold text-slate-900">{formatSqft(plot.areaSqft)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Survey Number</span>
                <span className="font-mono font-bold text-slate-900">{plot.surveyNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Facing Orientation</span>
                <span className="font-bold text-emerald-700">{plot.facing} Facing</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Approach Road</span>
                <span className="font-bold text-slate-900">{plot.roadWidth} ft Wide</span>
              </div>
              {plot.coordinates && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">GPS Location</span>
                  <span className="font-mono text-[11px] text-slate-700">{plot.coordinates}</span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() =>
                navigate(`${ROUTES.ADD_CUSTOMER}?interestedPlot=${plot.plotNumber}&project=${encodeURIComponent(plot.projectName)}`)
              }
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Link Interested Buyer</span>
            </button>
          </div>
        </div>
      </div>

      {/* Description & Amenities */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Property Overview & Notes</h3>
          <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
            {plot.description ||
              'Prime residential plot in high appreciation investment corridor. Clear title with complete legal search report, demarcation stones fixed, and ready for immediate villa construction.'}
          </p>

          {plot.amenities && plot.amenities.length > 0 && (
            <div className="pt-3 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-800 mb-2">Amenities & Infrastructure:</h4>
              <div className="flex flex-wrap gap-2">
                {plot.amenities.map((amenity, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{amenity}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Interested Customers / Leads widget */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              <span>Interested Buyers</span>
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {interestedBuyers.length}
            </span>
          </div>

          {interestedBuyers.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-xs text-slate-400 mb-3">No buyers directly tagged yet.</p>
              <button
                type="button"
                onClick={() =>
                  navigate(`${ROUTES.ADD_CUSTOMER}?interestedPlot=${plot.plotNumber}&project=${encodeURIComponent(plot.projectName)}`)
                }
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer"
              >
                + Link New Buyer
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {interestedBuyers.map((cust) => (
                <div
                  key={cust.id}
                  onClick={() => navigate(ROUTES.customerDetailsPath(cust.id))}
                  className="p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50/50 border border-slate-100 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-bold text-slate-900">{cust.name}</p>
                    <StatusBadge status={cust.status} />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{cust.phone}</p>
                  <p className="text-[10px] font-semibold text-emerald-700 mt-1">
                    Budget: {formatCurrency(cust.budgetMin)} - {formatCurrency(cust.budgetMax)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Plot from Inventory?"
        message={`Are you sure you want to permanently delete Plot ${plot.plotNumber}? This action cannot be reversed.`}
        confirmText="Yes, Delete Plot"
      />
    </div>
  );
}

PlotDetailsPage.propTypes = {};
