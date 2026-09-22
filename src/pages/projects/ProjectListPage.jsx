import React, { useState, useEffect, useMemo } from 'react'
import PropTypes from 'prop-types'
import { Link, useNavigate } from 'react-router-dom'
import { ROUTES } from '../../routes/routePaths'
import { projectService } from '../../services/projectService'
import { useToast } from '../../context/ToastContext'
import { PageHeader } from '../../components/layout/PageHeader'
import { SearchBar } from '../../components/common/SearchBar'
import { FilterButton } from '../../components/common/FilterButton'
import { EmptyState } from '../../components/common/EmptyState'
import { LoadingSpinner } from '../../components/common/LoadingState'
import { ConfirmDialog } from '../../components/common/ConfirmDialog'
import {
  Building2,
  Plus,
  MapPin,
  ShieldCheck,
  Calendar,
  Layers,
  CheckCircle2,
  Clock,
  ArrowRight,
  Edit,
  Trash2,
  Grid,
  List,
  Sparkles,
  ExternalLink,
} from 'lucide-react'

const STATUS_FILTERS = [
  { id: 'all', label: 'All Projects' },
  { id: 'active', label: 'Active Projects' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'completed', label: 'Completed' },
]

export function ProjectListPage() {
  const navigate = useNavigate()
  const { success, error: toastError } = useToast()

  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'table'
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const loadProjects = async () => {
    try {
      setLoading(true)
      const data = await projectService.getAllProjects()
      setProjects(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load projects:', err)
      toastError(err.message || 'Failed to load projects list')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProjects()
  }, [])

  // KPI calculations
  const totalProjects = projects.length
  const activeCount = projects.filter((p) => (p.status || 'active').toLowerCase() === 'active').length
  const totalPlotsAcrossProjects = projects.reduce((acc, p) => acc + (p.totalPlots || p.plotsCount || 0), 0)
  const totalAreaSqft = projects.reduce((acc, p) => acc + (p.totalAreaSqft || 0), 0)

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return projects.filter((proj) => {
      const status = (proj.status || 'active').toLowerCase()
      if (activeFilter !== 'all' && status !== activeFilter) {
        return false
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchName = proj.name?.toLowerCase().includes(q)
        const matchLoc = proj.location?.toLowerCase().includes(q)
        const matchCode = proj.code?.toLowerCase().includes(q)
        const matchRera = proj.reraNumber?.toLowerCase().includes(q)
        const matchCity = proj.city?.toLowerCase().includes(q)
        if (!matchName && !matchLoc && !matchCode && !matchRera && !matchCity) {
          return false
        }
      }

      return true
    })
  }, [projects, activeFilter, searchQuery])

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await projectService.deleteProject(deleteTarget.id)
      setProjects((prev) => prev.filter((p) => p.id !== deleteTarget.id))
      success(`Project "${deleteTarget.name}" removed successfully`)
      setDeleteTarget(null)
    } catch (err) {
      toastError(err.message || 'Failed to delete project')
    } finally {
      setDeleting(false)
    }
  }

  const getStatusBadge = (status) => {
    const s = (status || 'active').toLowerCase()
    if (s === 'active') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
          Active Project
        </span>
      )
    }
    if (s === 'upcoming') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
          <Clock className="w-3 h-3 text-purple-600" />
          Upcoming
        </span>
      )
    }
    if (s === 'completed') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
          <CheckCircle2 className="w-3 h-3 text-blue-600" />
          Completed
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800">
        {status}
      </span>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <PageHeader
        title="Manage Real Estate Projects"
        subtitle="Manage master layouts, plotted community development phases, RERA licenses & locations"
        badge={
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-100 text-primary-800">
            {totalProjects} Registered Projects
          </span>
        }
        actions={
          <Link
            to={ROUTES.ADD_PROJECT}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-md shadow-primary-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Project</span>
          </Link>
        }
      />

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Total Projects</span>
            <div className="w-8 h-8 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{totalProjects}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Across South India</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Active Developments</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-700">{activeCount}</p>
          <p className="text-[11px] text-emerald-600 mt-0.5">Open for booking</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Total Planned Plots</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{totalPlotsAcrossProjects}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Master parcel plots</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Total Land Area</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">
            {totalAreaSqft > 0 ? `${(totalAreaSqft / 1000).toFixed(0)}k` : '585k'}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Square feet plotted</p>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {STATUS_FILTERS.map((f) => (
              <FilterButton
                key={f.id}
                label={f.label}
                active={activeFilter === f.id}
                onClick={() => setActiveFilter(f.id)}
              />
            ))}
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 self-end sm:self-auto bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search projects by name, city, location, RERA number, or code..."
        />
      </div>

      {/* Content Section */}
      {loading ? (
        <LoadingSpinner text="Loading projects directory..." className="py-24" />
      ) : filteredProjects.length === 0 ? (
        <EmptyState
          title={searchQuery || activeFilter !== 'all' ? "No projects match your filter" : "No projects in MongoDB Atlas yet"}
          description={searchQuery || activeFilter !== 'all' ? "Try modifying your search keywords or create a new real estate project." : "Your MongoDB Atlas database has no projects stored yet. Click below to add your first real estate project."}
          actionLabel="Add New Project"
          onAction={() => navigate(ROUTES.ADD_PROJECT)}
        />
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => {
            const total = project.totalPlots || project.plotsCount || 0
            const available = project.availablePlots !== undefined ? project.availablePlots : total
            const sold = project.soldPlots || 0
            const reserved = project.reservedPlots || 0
            const soldPercent = total > 0 ? Math.round(((sold + reserved) / total) * 100) : 0

            return (
              <div
                key={project.id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between group"
              >
                {/* Top Image or Header Banner */}
                <div>
                  <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                    <img
                      src={
                        project.image ||
                        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=80'
                      }
                      alt={project.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                    {/* Top status & code badge */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className="px-2.5 py-1 bg-white/90 backdrop-blur-md rounded-xl text-xs font-black text-slate-900 shadow-xs">
                        {project.code || 'PRJ'}
                      </span>
                      {getStatusBadge(project.status)}
                    </div>

                    {/* Bottom Title on Image */}
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <h3 className="text-base font-extrabold tracking-tight leading-tight truncate drop-shadow-sm">
                        {project.name}
                      </h3>
                      <p className="text-xs text-white/90 flex items-center gap-1 mt-0.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span>{project.location}</span>
                      </p>
                    </div>
                  </div>

                  {/* Body Specs */}
                  <div className="p-4 sm:p-5 space-y-4">
                    {/* RERA Number badge */}
                    {project.reraNumber && (
                      <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-600">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span className="truncate font-medium">RERA: {project.reraNumber}</span>
                      </div>
                    )}

                    {/* Inventory Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-600">Inventory Status</span>
                        <span className="text-slate-900">{total} Plots Total</span>
                      </div>

                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
                        <div
                          style={{ width: `${total > 0 ? (available / total) * 100 : 100}%` }}
                          className="bg-emerald-500 h-full"
                          title={`Available: ${available}`}
                        />
                        <div
                          style={{ width: `${total > 0 ? (reserved / total) * 100 : 0}%` }}
                          className="bg-amber-400 h-full"
                          title={`Reserved: ${reserved}`}
                        />
                        <div
                          style={{ width: `${total > 0 ? (sold / total) * 100 : 0}%` }}
                          className="bg-blue-500 h-full"
                          title={`Sold: ${sold}`}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span>{available} Available</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-blue-500" />
                          <span>{sold} Sold</span>
                        </span>
                        <span className="font-semibold text-primary-700">{soldPercent}% booked</span>
                      </div>
                    </div>

                    {/* Amenities pills */}
                    {Array.isArray(project.amenities) && project.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {project.amenities.slice(0, 3).map((amenity, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-semibold"
                          >
                            {amenity}
                          </span>
                        ))}
                        {project.amenities.length > 3 && (
                          <span className="px-1.5 py-0.5 text-slate-400 text-[10px] font-semibold">
                            +{project.amenities.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="px-4 sm:px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Link
                    to={ROUTES.projectDetailsPath(project.id)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    <span>View Project</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <div className="flex items-center gap-1">
                    <Link
                      to={ROUTES.editProjectPath(project.id)}
                      className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-white rounded-lg transition-colors"
                      title="Edit Project Details"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(project)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
                      title="Delete Project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Project</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Total Plots</th>
                  <th className="py-3.5 px-4">Available</th>
                  <th className="py-3.5 px-4">Sold</th>
                  <th className="py-3.5 px-4">RERA Number</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProjects.map((proj) => {
                  const total = proj.totalPlots || proj.plotsCount || 0
                  const available = proj.availablePlots !== undefined ? proj.availablePlots : total
                  const sold = proj.soldPlots || 0

                  return (
                    <tr key={proj.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <Link
                          to={ROUTES.projectDetailsPath(proj.id)}
                          className="hover:text-primary-600 flex items-center gap-2"
                        >
                          <span className="w-7 h-7 rounded-lg bg-primary-100 text-primary-800 text-[11px] font-black flex items-center justify-center flex-shrink-0">
                            {proj.code || 'PRJ'}
                          </span>
                          <span>{proj.name}</span>
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate max-w-xs">{proj.location}</span>
                      </td>
                      <td className="py-3.5 px-4">{getStatusBadge(proj.status)}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{total}</td>
                      <td className="py-3.5 px-4 text-emerald-600 font-bold">{available}</td>
                      <td className="py-3.5 px-4 text-blue-600 font-bold">{sold}</td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                        {proj.reraNumber || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to={ROUTES.projectDetailsPath(proj.id)}
                            className="p-1.5 text-slate-400 hover:text-primary-600 rounded-lg hover:bg-slate-100"
                            title="View Details"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                          <Link
                            to={ROUTES.editProjectPath(proj.id)}
                            className="p-1.5 text-slate-400 hover:text-primary-600 rounded-lg hover:bg-slate-100"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(proj)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Real Estate Project?"
        message={`Are you sure you want to delete project "${deleteTarget?.name}"? Plots associated with this project will remain in the system.`}
        confirmText={deleting ? 'Deleting...' : 'Delete Project'}
      />
    </div>
  )
}

ProjectListPage.propTypes = {}
export default ProjectListPage
