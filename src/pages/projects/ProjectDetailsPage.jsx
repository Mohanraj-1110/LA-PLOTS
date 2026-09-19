import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ROUTES } from '../../routes/routePaths'
import { projectService } from '../../services/projectService'
import { plotService } from '../../services/plotService'
import { useToast } from '../../context/ToastContext'
import { PageHeader } from '../../components/layout/PageHeader'
import { LoadingSpinner } from '../../components/common/LoadingState'
import { ErrorState } from '../../components/common/ErrorState'
import { ConfirmDialog } from '../../components/common/ConfirmDialog'
import { formatCurrency } from '../../utils/formatCurrency'
import {
  Building2,
  MapPin,
  ShieldCheck,
  Calendar,
  Layers,
  Sparkles,
  CheckCircle2,
  ArrowLeft,
  Edit,
  Trash2,
  Plus,
  Phone,
  User,
  Clock,
  ExternalLink,
} from 'lucide-react'

export function ProjectDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { success, error: toastError } = useToast()

  const [project, setProject] = useState(null)
  const [plots, setPlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const proj = await projectService.getProjectById(id)
        if (proj) {
          setProject(proj)
          // Also fetch all plots to filter for this project
          const allPlots = await plotService.getAllPlots()
          const matched = allPlots.filter(
            (p) =>
              p.projectId === proj.id ||
              p.projectId === proj.code ||
              p.projectName === proj.name ||
              (proj.code && p.plotNumber?.startsWith(proj.code))
          )
          setPlots(matched)
        }
      } catch (err) {
        console.error(err)
        toastError('Failed to load project details')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [id])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await projectService.deleteProject(id)
      success(`Project "${project?.name}" deleted successfully`)
      navigate(ROUTES.PROJECTS)
    } catch (err) {
      toastError(err.message || 'Failed to delete project')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return <LoadingSpinner text="Loading project details..." className="py-24" />
  }

  if (!project) {
    return (
      <ErrorState
        title="Project Not Found"
        message="The requested real estate project could not be located."
        actionLabel="Back to Projects"
        onAction={() => navigate(ROUTES.PROJECTS)}
      />
    )
  }

  const totalPlots = plots.length > 0 ? plots.length : (project.totalPlots || 0)
  const availablePlots = plots.filter((p) => p.status === 'available').length
  const reservedPlots = plots.filter((p) => p.status === 'reserved').length
  const soldPlots = plots.filter((p) => p.status === 'sold').length
  const bookedPercent = totalPlots > 0 ? Math.round(((soldPlots + reservedPlots) / totalPlots) * 100) : 0

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <PageHeader
        title={project.name}
        subtitle={`${project.location} • Code: ${project.code || 'PRJ'}`}
        breadcrumbs={[
          { label: 'Projects', to: ROUTES.PROJECTS },
          { label: project.name },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link
              to={ROUTES.editProjectPath(project.id)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              <Edit className="w-4 h-4" />
              <span>Edit Project</span>
            </Link>
            <button
              type="button"
              onClick={() => setDeleteModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>
        }
      />

      {/* Hero Banner Card */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white shadow-md border border-slate-800">
        <div className="relative h-64 sm:h-72 w-full">
          <img
            src={
              project.image ||
              'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&auto=format&fit=crop&q=80'
            }
            alt={project.name}
            className="w-full h-full object-cover opacity-45"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          <div className="absolute top-5 left-5 flex items-center gap-2">
            <span className="px-3 py-1 bg-white/95 text-slate-900 text-xs font-black rounded-xl">
              {project.code || 'PRJ'}
            </span>
            <span className="px-3 py-1 bg-emerald-500/90 text-white text-xs font-bold rounded-xl uppercase tracking-wider">
              {project.status || 'Active'}
            </span>
          </div>

          <div className="absolute bottom-5 left-5 right-5 sm:left-8 sm:right-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight drop-shadow-sm">
                {project.name}
              </h2>
              <p className="text-sm text-emerald-300 font-semibold flex items-center gap-1.5 mt-1">
                <MapPin className="w-4 h-4" />
                <span>{project.location}, {project.city || 'Bengaluru'}</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to={`${ROUTES.ADD_PLOT}?projectName=${encodeURIComponent(project.name)}`}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Add Plot to Project</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">Total Plots</span>
            <Layers className="w-4 h-4 text-primary-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{totalPlots}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Master parcel plots</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">Available Plots</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-600">{availablePlots}</p>
          <p className="text-[11px] text-emerald-700 mt-0.5">Open for sale</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">Reserved / Sold</span>
            <ShieldCheck className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-blue-600">{soldPlots + reservedPlots}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">{soldPlots} Sold • {reservedPlots} Token</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">Inventory Velocity</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">{bookedPercent}%</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Total booking velocity</p>
        </div>
      </div>

      {/* Two Column Layout: Specifications Left, Plots Table Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Project Specifications */}
        <div className="lg:col-span-4 space-y-6">
          {/* Specifications Card */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Project Specifications
            </h3>

            <div className="space-y-3 divide-y divide-slate-100 text-xs">
              {project.reraNumber && (
                <div className="pt-2 flex items-start justify-between gap-2">
                  <span className="text-slate-500">RERA License:</span>
                  <span className="font-bold text-slate-900 text-right font-mono">
                    {project.reraNumber}
                  </span>
                </div>
              )}

              {project.surveyNumbers && (
                <div className="pt-2 flex items-start justify-between gap-2">
                  <span className="text-slate-500">Survey Numbers:</span>
                  <span className="font-bold text-slate-900 text-right">
                    {project.surveyNumbers}
                  </span>
                </div>
              )}

              {project.totalAreaSqft > 0 && (
                <div className="pt-2 flex items-start justify-between gap-2">
                  <span className="text-slate-500">Total Plotted Area:</span>
                  <span className="font-bold text-slate-900 text-right">
                    {project.totalAreaSqft.toLocaleString('en-IN')} sq.ft
                  </span>
                </div>
              )}

              {project.launchDate && (
                <div className="pt-2 flex items-start justify-between gap-2">
                  <span className="text-slate-500">Launch Date:</span>
                  <span className="font-bold text-slate-900 text-right">
                    {project.launchDate}
                  </span>
                </div>
              )}

              <div className="pt-2 flex items-start justify-between gap-2">
                <span className="text-slate-500">City / State:</span>
                <span className="font-bold text-slate-900 text-right">
                  {project.city || 'Bengaluru'}, {project.state || 'Karnataka'}
                </span>
              </div>

              {(project.contactPerson || project.contactPhone) && (
                <div className="pt-2 flex items-start justify-between gap-2">
                  <span className="text-slate-500">Site Contact:</span>
                  <span className="font-bold text-slate-900 text-right">
                    {project.contactPerson} {project.contactPhone ? `(${project.contactPhone})` : ''}
                  </span>
                </div>
              )}
            </div>

            {project.description && (
              <div className="pt-3 border-t border-slate-100">
                <p className="text-xs text-slate-600 leading-relaxed">
                  {project.description}
                </p>
              </div>
            )}
          </div>

          {/* Amenities Card */}
          {Array.isArray(project.amenities) && project.amenities.length > 0 && (
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                Layout Amenities ({project.amenities.length})
              </h3>
              <div className="grid grid-cols-1 gap-2 pt-1">
                {project.amenities.map((amenity, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 text-xs font-semibold text-slate-700"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Associated Plots List */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Plots in {project.name} ({plots.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Active parcels registered under this master layout
                </p>
              </div>

              <Link
                to={`${ROUTES.ADD_PLOT}?projectName=${encodeURIComponent(project.name)}`}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-50 text-primary-700 hover:bg-primary-100 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Plot</span>
              </Link>
            </div>

            {plots.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100">
                <Layers className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">No plots linked to this project yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Click "Add Plot to Project" to register parcel dimensions.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3 rounded-l-lg">Plot No</th>
                      <th className="py-2.5 px-3">Dimensions</th>
                      <th className="py-2.5 px-3">Facing</th>
                      <th className="py-2.5 px-3">Price</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 rounded-r-lg text-right">View</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {plots.map((plot) => (
                      <tr key={plot.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 font-bold text-slate-900">
                          <Link
                            to={ROUTES.plotDetailsPath(plot.id)}
                            className="hover:text-primary-600"
                          >
                            {plot.plotNumber}
                          </Link>
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          {plot.areaSqft} sq.ft
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          {plot.facing || 'East'}
                        </td>
                        <td className="py-3 px-3 font-bold text-emerald-700">
                          {formatCurrency(plot.totalAmount)}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              plot.status === 'available'
                                ? 'bg-emerald-100 text-emerald-800'
                                : plot.status === 'sold'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {plot.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <Link
                            to={ROUTES.plotDetailsPath(plot.id)}
                            className="p-1 text-slate-400 hover:text-primary-600 inline-block"
                            title="View Plot Details"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Project?"
        message={`Are you sure you want to permanently delete "${project.name}"?`}
        confirmText={deleting ? 'Deleting...' : 'Delete Project'}
      />
    </div>
  )
}

ProjectDetailsPage.propTypes = {}
export default ProjectDetailsPage
