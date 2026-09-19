import React, { useState } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { useToast } from '../../context/ToastContext';
import { enquiryService } from '../../services/enquiryService';
import {
  Compass,
  Phone,
  Mail,
  User,
  Clock,
  Search,
  Filter,
  CheckCircle,
} from 'lucide-react';

export function AgentEnquiriesPage() {
  const { enquiries = [], refreshEnquiries } = useAppState() || {};
  const { success, error: toastError } = useToast();
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEnquiries = enquiries
    .filter((e) => {
      if (filter === 'all') return true;
      return (e.status || 'New').toLowerCase() === filter.toLowerCase();
    })
    .filter((e) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        e.name?.toLowerCase().includes(q) ||
        e.phone?.toLowerCase().includes(q) ||
        e.email?.toLowerCase().includes(q) ||
        e.message?.toLowerCase().includes(q)
      );
    });

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await enquiryService.updateEnquiry(id, { status: newStatus });
      success(`Enquiry marked as ${newStatus}`);
      if (refreshEnquiries) refreshEnquiries();
    } catch (err) {
      toastError(err.message || 'Failed to update enquiry status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 font-display tracking-tight">
          Customer Leads & Inquiries
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review inbound buyer requests, follow up with prospective clients, and update inquiry progress.
        </p>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200/80 shadow-xs">
          {['all', 'new', 'in progress', 'contacted', 'converted'].map((tab) => (
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
            placeholder="Search lead name, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
          />
        </div>
      </div>

      {/* Leads List */}
      {filteredEnquiries.length === 0 ? (
        <div className="py-16 text-center rounded-3xl bg-white border border-dashed border-slate-200">
          <Compass className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-700">No enquiries found</p>
          <p className="text-xs text-slate-400 mt-1">
            {searchQuery ? 'No leads matched your search query.' : 'New buyer inquiries will appear here.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEnquiries.map((enq) => (
            <div
              key={enq._id || enq.id}
              className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-sm font-black text-slate-900">
                    {enq.name || 'Anonymous Lead'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-teal-100 text-teal-800 border border-teal-200">
                    {enq.status || 'New'}
                  </span>
                </div>

                <div className="space-y-2 text-xs py-2 border-y border-slate-100 mb-3">
                  {enq.phone && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <a href={`tel:${enq.phone}`} className="hover:text-teal-700 font-semibold">
                        {enq.phone}
                      </a>
                    </div>
                  )}
                  {enq.email && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <a href={`mailto:${enq.email}`} className="hover:text-teal-700 truncate">
                        {enq.email}
                      </a>
                    </div>
                  )}
                  <p className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl mt-2 leading-relaxed">
                    "{enq.message || enq.notes || 'Inquired about available plots'}"
                  </p>
                </div>
              </div>

              {/* Status Update Buttons */}
              <div className="pt-2 flex items-center gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => handleStatusUpdate(enq._id || enq.id, 'Contacted')}
                  className="flex-1 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors"
                >
                  Mark Contacted
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusUpdate(enq._id || enq.id, 'Converted')}
                  className="flex-1 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold transition-colors"
                >
                  Mark Converted
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AgentEnquiriesPage;
