import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../../context/AppStateContext';
import { ROUTES } from '../../routes/routePaths';
import { formatCurrency, formatCompactCurrency } from '../../utils/formatCurrency';
import { formatMediumDate } from '../../utils/dateHelpers';
import { PageHeader } from '../../components/layout/PageHeader';
import { SearchBar } from '../../components/common/SearchBar';
import { FilterButton } from '../../components/common/FilterButton';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useToast } from '../../context/ToastContext';
import {
  UserPlus,
  Phone,
  Mail,
  MessageCircle,
  Calendar,
  Eye,
  Edit2,
  Trash2,
  MapPin,
  Clock,
  LayoutGrid,
  List,
} from 'lucide-react';

const STATUS_TABS = [
  'All',
  'New',
  'Interested',
  'Site Visit',
  'Negotiation',
  'Booked',
  'Follow-up',
  'Converted',
  'Lost',
];

export function CustomerListPage() {
  const { customers, removeCustomer } = useAppState();
  const { success } = useToast();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [viewMode, setViewMode] = useState('grid');
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Status counts
  const counts = useMemo(() => {
    const acc = { All: customers.length };
    STATUS_TABS.forEach((st) => {
      if (st !== 'All') {
        acc[st] = customers.filter((c) => c.status === st).length;
      }
    });
    return acc;
  }, [customers]);

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      if (selectedStatus !== 'All' && c.status !== selectedStatus) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = c.name?.toLowerCase().includes(q);
        const matchPhone = c.phone?.replace(/\s/g, '').includes(q.replace(/\s/g, ''));
        const matchCity = c.city?.toLowerCase().includes(q);
        const matchProj = c.interestedProjectName?.toLowerCase().includes(q);
        const matchPlot = c.interestedPlotNumber?.toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchCity && !matchProj && !matchPlot) return false;
      }

      return true;
    });
  }, [customers, selectedStatus, searchQuery]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    await removeCustomer(deleteTarget.id);
    success(`Customer ${deleteTarget.name} removed successfully`);
    setDeleteTarget(null);
  };

  const getCleanPhone = (phone) => (phone ? phone.replace(/[^0-9]/g, '') : '');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers & Leads Pipeline"
        subtitle={`Managing ${customers.length} total client relationships`}
        badge={
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
            {counts['Negotiation'] + counts['Site Visit'] + counts['Booked']} Hot Deals
          </span>
        }
        actions={
          <button
            type="button"
            onClick={() => navigate(ROUTES.ADD_CUSTOMER)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New Customer</span>
          </button>
        }
      />

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-4">
        {/* Status Pipeline Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {STATUS_TABS.map((tab) => (
            <FilterButton
              key={tab}
              label={tab}
              count={counts[tab] || 0}
              active={selectedStatus === tab}
              onClick={() => setSelectedStatus(tab)}
            />
          ))}
        </div>

        {/* Search & View Toggle */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="w-full sm:max-w-md">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by buyer name, phone, city, or project..."
            />
          </div>

          <div className="hidden sm:flex items-center gap-1 self-end sm:self-auto">
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

      {/* List Content */}
      {filteredCustomers.length === 0 ? (
        <EmptyState
          title="No customers found"
          description="No buyers match the selected lead status or search criteria."
          actionLabel="Add New Customer"
          onAction={() => navigate(ROUTES.ADD_CUSTOMER)}
        />
      ) : viewMode === 'grid' ? (
        /* Cards Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredCustomers.map((cust) => (
            <div
              key={cust.id}
              onClick={() => navigate(ROUTES.customerDetailsPath(cust.id))}
              className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                      {cust.name}
                    </h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span>{cust.city}</span>
                    </p>
                  </div>
                  <StatusBadge status={cust.status} />
                </div>

                {/* Property & Budget info */}
                <div className="my-3 p-3 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Target Project</span>
                    <span className="font-bold text-slate-800 truncate max-w-[150px]">
                      {cust.interestedProjectName}
                    </span>
                  </div>
                  {cust.interestedPlotNumber && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Target Plot</span>
                      <span className="font-mono font-bold text-emerald-700">
                        {cust.interestedPlotNumber}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                    <span className="text-slate-400">Budget Range</span>
                    <span className="font-bold text-slate-900">
                      {formatCompactCurrency(cust.budgetMin)} - {formatCompactCurrency(cust.budgetMax)}
                    </span>
                  </div>
                </div>

                {/* Next Followup */}
                {cust.nextFollowup && (
                  <div className="flex items-center gap-1.5 text-xs text-amber-700 font-semibold mb-2">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Follow-up: {formatMediumDate(cust.nextFollowup)}</span>
                  </div>
                )}
              </div>

              {/* Action Toolbar */}
              <div
                className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Direct Connect Buttons */}
                <div className="flex items-center gap-1.5">
                  <a
                    href={`tel:${cust.phone}`}
                    className="p-2 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors cursor-pointer"
                    title="Call Customer"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                  <a
                    href={`https://wa.me/${getCleanPhone(cust.phone)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors cursor-pointer"
                    title="WhatsApp Message"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>
                  {cust.email && (
                    <a
                      href={`mailto:${cust.email}`}
                      className="p-2 text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                      title="Send Email"
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => navigate(ROUTES.editCustomerPath(cust.id))}
                    className="p-2 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer"
                    title="Edit Customer"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(cust)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    title="Delete Customer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-700 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Customer Name</th>
                  <th className="px-5 py-3.5">Contact</th>
                  <th className="px-5 py-3.5">Project / Plot</th>
                  <th className="px-5 py-3.5">Budget</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Next Follow-up</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredCustomers.map((cust) => (
                  <tr
                    key={cust.id}
                    onClick={() => navigate(ROUTES.customerDetailsPath(cust.id))}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-900">{cust.name}</p>
                      <p className="text-[11px] text-slate-400">{cust.city}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800">{cust.phone}</p>
                      <p className="text-[11px] text-slate-400">{cust.email || '-'}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-900">{cust.interestedProjectName}</p>
                      <p className="text-[11px] font-mono text-emerald-700">
                        {cust.interestedPlotNumber ? `Plot ${cust.interestedPlotNumber}` : 'General Inquiry'}
                      </p>
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-800">
                      {formatCompactCurrency(cust.budgetMin)} - {formatCompactCurrency(cust.budgetMax)}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={cust.status} />
                    </td>
                    <td className="px-5 py-4 text-amber-700 font-semibold">
                      {formatMediumDate(cust.nextFollowup)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => navigate(ROUTES.customerDetailsPath(cust.id))}
                          className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate(ROUTES.editCustomerPath(cust.id))}
                          className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(cust)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete"
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

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Customer Record?"
        message={`Are you sure you want to permanently remove ${deleteTarget?.name}? All interaction history will be deleted.`}
        confirmText="Delete Record"
      />
    </div>
  );
}

CustomerListPage.propTypes = {};
