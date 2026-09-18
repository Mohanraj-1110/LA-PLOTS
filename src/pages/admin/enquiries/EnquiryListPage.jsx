import React, { useState, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { enquiryService } from '../../services/enquiryService';
import { useAppState } from '../../context/AppStateContext';
import { useToast } from '../../context/ToastContext';
import { ROUTES } from '../../routes/routePaths';
import { formatMediumDate } from '../../utils/dateHelpers';
import { PageHeader } from '../../components/layout/PageHeader';
import { SearchBar } from '../../components/common/SearchBar';
import { FilterButton } from '../../components/common/FilterButton';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Modal } from '../../components/common/Modal';
import { FormInput } from '../../components/forms/FormInput';
import { FormSelect } from '../../components/forms/FormSelect';
import { FormTextarea } from '../../components/forms/FormTextarea';
import {
  Compass,
  Phone,
  MessageCircle,
  Mail,
  UserCheck,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

const SOURCES = [
  'All Sources',
  'Website',
  'Facebook',
  'Instagram',
  'WhatsApp',
  'Reference',
  'Walk-in',
];

export function EnquiryListPage() {
  const navigate = useNavigate();
  const { addCustomer } = useAppState();
  const { success, error: toastError } = useToast();

  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSource, setSelectedSource] = useState('All Sources');
  const [searchQuery, setSearchQuery] = useState('');
  const [newEnquiryModal, setNewEnquiryModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // New enquiry form
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [project, setProject] = useState('Greenfield Meadows');
  const [budget, setBudget] = useState('₹45 - 60 Lakhs');
  const [requirement, setRequirement] = useState('');
  const [source, setSource] = useState('Website');
  const [submitting, setSubmitting] = useState(false);

  const loadEnquiries = async () => {
    try {
      const data = await enquiryService.getAllEnquiries();
      setEnquiries(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEnquiries();
  }, []);

  const filteredEnquiries = useMemo(() => {
    return enquiries.filter((enq) => {
      if (selectedSource !== 'All Sources' && enq.source !== selectedSource) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = enq.customerName?.toLowerCase().includes(q);
        const matchPhone = enq.phone?.replace(/\s/g, '').includes(q.replace(/\s/g, ''));
        const matchProj = enq.project?.toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchProj) return false;
      }
      return true;
    });
  }, [enquiries, selectedSource, searchQuery]);

  const handleCreateEnquiry = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const created = await enquiryService.createEnquiry({
        customerName,
        phone,
        email,
        project,
        budget,
        requirement,
        source,
      });
      setEnquiries((prev) => [created, ...prev]);
      success(`Enquiry from ${created.customerName} recorded!`);
      setNewEnquiryModal(false);
      setCustomerName('');
      setPhone('');
      setEmail('');
      setRequirement('');
    } catch (err) {
      toastError(err.message || 'Failed to record enquiry');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (enq, newStatus) => {
    await enquiryService.updateEnquiryStatus(enq.id, newStatus);
    setEnquiries((prev) =>
      prev.map((e) => (e.id === enq.id ? { ...e, status: newStatus } : e))
    );
    success(`Enquiry status updated to ${newStatus}`);
  };

  const handleConvertToCustomer = async (enq) => {
    try {
      await addCustomer({
        name: enq.customerName,
        phone: enq.phone,
        email: enq.email || '',
        city: 'Bengaluru',
        budgetMin: 4000000,
        budgetMax: 6000000,
        interestedProjectName: enq.project,
        status: 'Interested',
        notes: `Converted from ${enq.source} inquiry. Requirement: ${enq.requirement}`,
      });
      await enquiryService.updateEnquiryStatus(enq.id, 'Converted');
      setEnquiries((prev) =>
        prev.map((e) => (e.id === enq.id ? { ...e, status: 'Converted' } : e))
      );
      success(`${enq.customerName} converted into an active customer!`);
      navigate(ROUTES.CUSTOMERS);
    } catch (err) {
      toastError(err.message || 'Failed to convert');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    await enquiryService.deleteEnquiry(deleteTarget.id);
    setEnquiries((prev) => prev.filter((e) => e.id !== deleteTarget.id));
    success(`Enquiry from ${deleteTarget.customerName} removed`);
    setDeleteTarget(null);
  };

  const cleanPhone = (p) => p.replace(/[^0-9]/g, '');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inbound Lead Inquiries"
        subtitle={`Multi-channel real estate lead generation • ${enquiries.length} inquiries received`}
        badge={
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
            Omnichannel
          </span>
        }
        actions={
          <button
            type="button"
            onClick={() => setNewEnquiryModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Record Enquiry</span>
          </button>
        }
      />

      {/* Filter and search */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {SOURCES.map((src) => (
            <FilterButton
              key={src}
              label={src}
              active={selectedSource === src}
              onClick={() => setSelectedSource(src)}
            />
          ))}
        </div>

        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by prospect name, phone, or interested project..."
        />
      </div>

      {/* Enquiries Grid */}
      {filteredEnquiries.length === 0 ? (
        <EmptyState
          title="No enquiries found"
          description="No prospective buyer inquiries found matching this source or search."
          actionLabel="Log New Enquiry"
          onAction={() => setNewEnquiryModal(true)}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredEnquiries.map((enq) => (
            <div
              key={enq.id}
              className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-1">
                      {enq.source}
                    </span>
                    <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                      {enq.customerName}
                    </h3>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      enq.status === 'Converted'
                        ? 'bg-emerald-100 text-emerald-800'
                        : enq.status === 'Site Visit Planned'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {enq.status}
                  </span>
                </div>

                <div className="space-y-1.5 py-2.5 my-2 border-y border-slate-100 text-xs">
                  <p className="flex items-center justify-between">
                    <span className="text-slate-400">Target Project</span>
                    <span className="font-bold text-slate-800">{enq.project}</span>
                  </p>
                  <p className="flex items-center justify-between">
                    <span className="text-slate-400">Budget</span>
                    <span className="font-bold text-emerald-700">{enq.budget}</span>
                  </p>
                  <p className="flex items-center justify-between">
                    <span className="text-slate-400">Received On</span>
                    <span className="text-slate-600">{formatMediumDate(enq.createdAt)}</span>
                  </p>
                  {enq.requirement && (
                    <p className="text-[11px] text-slate-600 italic pt-1 border-t border-slate-100 line-clamp-2">
                      "{enq.requirement}"
                    </p>
                  )}
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <a
                    href={`tel:${enq.phone}`}
                    className="p-2 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors cursor-pointer"
                    title="Call"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                  <a
                    href={`https://wa.me/${cleanPhone(enq.phone)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors cursor-pointer"
                    title="WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>
                </div>

                <div className="flex items-center gap-1.5">
                  {enq.status !== 'Converted' ? (
                    <button
                      type="button"
                      onClick={() => handleConvertToCustomer(enq)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      title="Convert to Active Customer"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Convert</span>
                    </button>
                  ) : (
                    <span className="text-[11px] font-bold text-emerald-700">Converted</span>
                  )}
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(enq)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Enquiry Modal */}
      <Modal
        isOpen={newEnquiryModal}
        onClose={() => setNewEnquiryModal(false)}
        title="Record Inbound Lead Enquiry"
        subtitle="Log web, call, or social media property interest"
        maxWidth="md"
      >
        <form onSubmit={handleCreateEnquiry} className="space-y-4">
          <FormInput
            label="Prospect Name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="e.g. Vivek Chawla"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <FormInput
              label="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98190 22345"
              required
            />
            <FormInput
              label="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vivek@gmail.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormSelect
              label="Interested Project"
              value={project}
              onChange={(e) => setProject(e.target.value)}
              options={[
                'Greenfield Meadows',
                'Vedic Valley',
                'Emerald Palms',
                'Sunrise Enclave',
                'Golden Acres',
              ]}
            />
            <FormSelect
              label="Lead Source"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              options={SOURCES.filter((s) => s !== 'All Sources')}
            />
          </div>

          <FormInput
            label="Budget Estimation"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="e.g. ₹40 - 50 Lakhs"
          />

          <FormTextarea
            label="Requirement Notes"
            value={requirement}
            onChange={(e) => setRequirement(e.target.value)}
            placeholder="e.g. Seeking East facing 1500 sq.ft plot, ready to visit this weekend..."
            rows={3}
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setNewEnquiryModal(false)}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Record Enquiry</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Enquiry Record?"
        message={`Remove enquiry from ${deleteTarget?.customerName}?`}
        confirmText="Delete Enquiry"
      />
    </div>
  );
}

EnquiryListPage.propTypes = {};
