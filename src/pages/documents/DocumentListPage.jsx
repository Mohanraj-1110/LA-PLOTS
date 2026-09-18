import React, { useState, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { documentService } from '../../services/documentService';
import { useToast } from '../../context/ToastContext';
import { formatMediumDate } from '../../utils/dateHelpers';
import { PageHeader } from '../../components/layout/PageHeader';
import { SearchBar } from '../../components/common/SearchBar';
import { FilterButton } from '../../components/common/FilterButton';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingState';
import { FormInput } from '../../components/forms/FormInput';
import { FormSelect } from '../../components/forms/FormSelect';
import { FormTextarea } from '../../components/forms/FormTextarea';
import {
  FileText,
  Trash2,
  Eye,
  Plus,
  CheckCircle2,
  Building,
  ShieldCheck,
  FileCode,
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Land Documents',
  'Layout Plans',
  'Sale Agreements',
  'Customer KYC',
  'Receipts',
  'Registration',
  'Other',
];

export function DocumentListPage() {
  const { success, error: toastError } = useToast();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [recordModalOpen, setRecordModalOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Form State (Pure Text)
  const [docName, setDocName] = useState('');
  const [category, setCategory] = useState('Land Documents');
  const [selectedProject, setSelectedProject] = useState('Greenfield Meadows');
  const [selectedPlotNo, setSelectedPlotNo] = useState('');
  const [legalRef, setLegalRef] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadDocs = async () => {
    try {
      const data = await documentService.getAllDocuments();
      setDocuments(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocs();
  }, []);

  // Category counts
  const categoryCounts = useMemo(() => {
    const acc = { All: documents.length };
    CATEGORIES.forEach((cat) => {
      if (cat !== 'All') {
        acc[cat] = documents.filter((d) => d.category === cat).length;
      }
    });
    return acc;
  }, [documents]);

  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      if (selectedCategory !== 'All' && doc.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = doc.name?.toLowerCase().includes(q);
        const matchProj = doc.projectName?.toLowerCase().includes(q);
        const matchPlot = doc.plotNumber?.toLowerCase().includes(q);
        const matchRef = doc.notes?.toLowerCase().includes(q);
        if (!matchName && !matchProj && !matchPlot && !matchRef) return false;
      }
      return true;
    });
  }, [documents, selectedCategory, searchQuery]);

  const handleRecordSubmit = async (e) => {
    e.preventDefault();
    if (!docName.trim()) {
      toastError('Please provide a document title');
      return;
    }

    setSubmitting(true);
    try {
      const finalName = docName.trim();
      const newDoc = await documentService.uploadDocument({
        name: finalName,
        category,
        projectName: selectedProject,
        plotNumber: selectedPlotNo,
        notes: notes.trim() || legalRef.trim(),
        fileSize: legalRef.trim() ? `Ref: ${legalRef}` : 'Verified Record',
      });
      setDocuments((prev) => [newDoc, ...prev]);
      success(`Document record "${finalName}" saved to Firestore!`, 'Saved to Cloud DB');
      setRecordModalOpen(false);
      setDocName('');
      setSelectedPlotNo('');
      setLegalRef('');
      setNotes('');
    } catch (err) {
      toastError(err.message || 'Failed to register record');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    await documentService.deleteDocument(deleteTarget.id);
    setDocuments((prev) => prev.filter((d) => d.id !== deleteTarget.id));
    success(`Document "${deleteTarget.name}" deleted from Cloud Firestore`);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documents & Legal Registry"
        subtitle={`Cloud Firestore text records • ${documents.length} verified records`}
        badge={
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            RERA & Bank Compliant
          </span>
        }
        actions={
          <button
            type="button"
            onClick={() => setRecordModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Document Record</span>
          </button>
        }
      />

      {/* Filter Tabs & Search */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <FilterButton
              key={cat}
              label={cat}
              count={categoryCounts[cat] || 0}
              active={selectedCategory === cat}
              onClick={() => setSelectedCategory(cat)}
            />
          ))}
        </div>

        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by document title, project, or plot number..."
        />
      </div>

      {/* Documents Grid / Cards */}
      {loading ? (
        <LoadingSpinner text="Querying Cloud Firestore records..." className="py-24" />
      ) : filteredDocs.length === 0 ? (
        <EmptyState
          title="No document records found"
          description="No records in this category match your search."
          actionLabel="Add Document Record"
          onAction={() => setRecordModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                    {doc.category}
                  </span>
                </div>

                <h3 className="text-xs font-extrabold text-slate-900 leading-snug line-clamp-2 mb-1.5">
                  {doc.name}
                </h3>

                <div className="space-y-1 text-[11px] text-slate-500 mb-3">
                  {doc.projectName && (
                    <p className="flex items-center gap-1 text-slate-700 font-medium">
                      <Building className="w-3 h-3 text-slate-400 flex-shrink-0" />
                      <span className="truncate">
                        {doc.projectName} {doc.plotNumber ? `(Plot ${doc.plotNumber})` : ''}
                      </span>
                    </p>
                  )}
                  <p className="text-slate-400">
                    {doc.fileSize || 'Text Record'} • Created {formatMediumDate(doc.uploadedAt)}
                  </p>
                  {doc.notes && (
                    <p className="text-xs text-slate-600 line-clamp-2 italic bg-slate-50 p-2 rounded-xl mt-2 border border-slate-100">
                      "{doc.notes}"
                    </p>
                  )}
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewDoc(doc)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Details</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeleteTarget(doc)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Delete Record"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Register Document Record Modal (Pure Text) */}
      <Modal
        isOpen={recordModalOpen}
        onClose={() => setRecordModalOpen(false)}
        title="Register Legal Document Record"
        subtitle="Save title deed, RERA sanction, or KYC reference as text in Cloud Firestore"
        maxWidth="md"
      >
        <form onSubmit={handleRecordSubmit} className="space-y-4">
          <FormInput
            label="Document Title / Name"
            value={docName}
            onChange={(e) => setDocName(e.target.value)}
            placeholder="e.g. Mother Deed - Sy.No 42/1 Devanahalli"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <FormSelect
              label="Document Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={CATEGORIES.filter((c) => c !== 'All')}
            />

            <FormSelect
              label="Project Association"
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              options={[
                'Greenfield Meadows',
                'Vedic Valley',
                'Emerald Palms',
                'Sunrise Enclave',
                'Golden Acres',
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormInput
              label="Plot Number (Optional)"
              value={selectedPlotNo}
              onChange={(e) => setSelectedPlotNo(e.target.value)}
              placeholder="e.g. GM-101"
            />
            <FormInput
              label="Registry / Sanction Number"
              value={legalRef}
              onChange={(e) => setLegalRef(e.target.value)}
              placeholder="e.g. BIAAPA/LP/2024-42"
            />
          </div>

          <FormTextarea
            label="Legal Notes & Reference Summary"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Enter Khata certification details, encumbrance certificate number, or sub-registrar book details..."
            rows={3}
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setRecordModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              {submitting ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              <span>Save Record</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Document Details Modal */}
      {previewDoc && (
        <Modal
          isOpen={Boolean(previewDoc)}
          onClose={() => setPreviewDoc(null)}
          title={previewDoc.name}
          subtitle={`${previewDoc.category} • Cloud Firestore Text Record`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                <FileCode className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-emerald-950">{previewDoc.name}</h4>
                <p className="text-[11px] text-emerald-700">
                  Category: <span className="font-semibold">{previewDoc.category}</span> • ID: <span className="font-mono">{previewDoc.id}</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div>
                <span className="text-slate-400 block text-[11px]">Project Name</span>
                <span className="font-bold text-slate-800">{previewDoc.projectName || 'General / All'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Plot Association</span>
                <span className="font-bold text-slate-800">{previewDoc.plotNumber ? `Plot ${previewDoc.plotNumber}` : 'Project Level'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Recorded Date</span>
                <span className="font-bold text-slate-800">{formatMediumDate(previewDoc.uploadedAt)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Recorded By</span>
                <span className="font-bold text-slate-800">{previewDoc.uploadedBy || 'Admin'}</span>
              </div>
            </div>

            {previewDoc.notes && (
              <div className="p-3.5 bg-white rounded-xl border border-slate-200 text-xs">
                <span className="text-slate-400 block text-[11px] mb-1 font-semibold">Legal Notes & References</span>
                <p className="text-slate-700 whitespace-pre-wrap">{previewDoc.notes}</p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Document Record?"
        message={`Are you sure you want to remove the record for "${deleteTarget?.name}" from Cloud Firestore?`}
        confirmText="Delete Record"
      />
    </div>
  );
}

DocumentListPage.propTypes = {};
