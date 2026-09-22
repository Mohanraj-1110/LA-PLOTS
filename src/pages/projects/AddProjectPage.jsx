import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ROUTES } from '../../routes/routePaths'
import { projectService } from '../../services/projectService'
import { useToast } from '../../context/ToastContext'
import { PageHeader } from '../../components/layout/PageHeader'
import { FormInput } from '../../components/forms/FormInput'
import { FormSelect } from '../../components/forms/FormSelect'
import { FormTextarea } from '../../components/forms/FormTextarea'
import { ImageUploader } from '../../components/common/ImageUploader'
import {
  Building2,
  MapPin,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  ArrowLeft,
  Images,
  Phone,
  Plus,
  X,
} from 'lucide-react'

const PRESET_AMENITIES = [
  'Gated Community',
  '24/7 Security & CCTV',
  'Blacktop Tar Roads',
  'Underground Drainage',
  'Overhead Water Tank',
  'Solar Streetlights',
  'Clubhouse & Gymnasium',
  'Children Play Area',
  'Avenue Plantations',
  'Rainwater Harvesting',
  'Compound Wall',
  'Clear Title & Bank Approved',
]

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active (Open for Booking)' },
  { value: 'upcoming', label: 'Upcoming (Pre-launch Phase)' },
  { value: 'completed', label: 'Completed (Fully Plotted & Sold)' },
  { value: 'on_hold', label: 'On Hold' },
]

export function AddProjectPage() {
  const navigate = useNavigate()
  const { success, error: toastError } = useToast()
  const [submitting, setSubmitting] = useState(false)

  // Form State
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [location, setLocation] = useState('')
  const [city, setCity] = useState('Bengaluru')
  const [state, setState] = useState('Karnataka')
  const [status, setStatus] = useState('active')
  const [reraNumber, setReraNumber] = useState('')
  const [surveyNumbers, setSurveyNumbers] = useState('')
  const [totalPlots, setTotalPlots] = useState('')
  const [totalAreaSqft, setTotalAreaSqft] = useState('')
  const [launchDate, setLaunchDate] = useState(new Date().toISOString().slice(0, 10))
  const [description, setDescription] = useState('')
  const [contactPerson, setContactPerson] = useState('')
  const [contactPhone, setContactPhone] = useState('')

  // Amenities
  const [selectedAmenities, setSelectedAmenities] = useState([
    'Gated Community',
    '24/7 Security & CCTV',
    'Blacktop Tar Roads',
    'Clear Title & Bank Approved',
  ])
  const [customAmenity, setCustomAmenity] = useState('')

  // Image upload state
  const [images, setImages] = useState([])
  const [primaryImage, setPrimaryImage] = useState('')

  const handleToggleAmenity = (amenity) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    )
  }

  const handleAddCustomAmenity = () => {
    if (customAmenity.trim() && !selectedAmenities.includes(customAmenity.trim())) {
      setSelectedAmenities((prev) => [...prev, customAmenity.trim()])
      setCustomAmenity('')
    }
  }

  const handleNameChange = (val) => {
    setName(val)
    if (!code) {
      const generated = val
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 4)
      setCode(generated)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) { toastError('Please provide a project name'); return }
    if (!location.trim()) { toastError('Please provide the project location'); return }

    setSubmitting(true)
    try {
      const newProj = await projectService.createProject({
        name: name.trim(),
        code: code.trim().toUpperCase() || name.substring(0, 3).toUpperCase(),
        location: location.trim(),
        city: city.trim(),
        state: state.trim(),
        status,
        reraNumber: reraNumber.trim(),
        surveyNumbers: surveyNumbers.trim(),
        totalPlots: parseInt(totalPlots, 10) || 0,
        totalAreaSqft: parseFloat(totalAreaSqft) || 0,
        launchDate,
        description: description.trim(),
        amenities: selectedAmenities,
        image: primaryImage || (images[0] || ''),
        images,
        contactPerson: contactPerson.trim(),
        contactPhone: contactPhone.trim(),
      })

      success(`Project "${newProj.name}" created successfully!`, 'Project Registered')
      navigate(ROUTES.PROJECTS)
    } catch (err) {
      toastError(err.message || 'Failed to create project')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Add New Real Estate Project"
        subtitle="Register a master plotted layout, survey numbers, RERA credentials, and amenities"
        breadcrumbs={[
          { label: 'Projects', to: ROUTES.PROJECTS },
          { label: 'Add Project' },
        ]}
        actions={
          <Link
            to={ROUTES.PROJECTS}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Cancel</span>
          </Link>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Project Basic Info */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Building2 className="w-5 h-5 text-primary-600" />
            <h3 className="text-sm font-bold text-slate-900">Project Identification & Classification</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Project Name"
              placeholder="e.g. Greenfield Meadows"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
            />
            <FormInput
              label="Project Code (Short Identifier)"
              placeholder="e.g. GM or VV"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
            <FormSelect
              label="Development Status"
              options={STATUS_OPTIONS}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              required
            />
            <FormInput
              label="Project Launch / Sanction Date"
              type="date"
              value={launchDate}
              onChange={(e) => setLaunchDate(e.target.value)}
            />
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <MapPin className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Location & Regional Jurisdiction</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <FormInput
                label="Full Location / Landmark Address"
                placeholder="e.g. Off NH 44, Near Airport Corridor, Devanahalli"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>
            <FormInput
              label="City"
              placeholder="e.g. Bengaluru"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
            <FormInput
              label="State"
              placeholder="e.g. Karnataka"
              value={state}
              onChange={(e) => setState(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Land Specs & Legal */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">RERA License & Land Parcel Specifications</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="RERA Registration Number"
              placeholder="e.g. PRM/KA/RERA/1251/309/PR/200922/003621"
              value={reraNumber}
              onChange={(e) => setReraNumber(e.target.value)}
            />
            <FormInput
              label="Survey / Khasra Numbers"
              placeholder="e.g. Sy.No 42, 43/1, 45/2"
              value={surveyNumbers}
              onChange={(e) => setSurveyNumbers(e.target.value)}
            />
            <FormInput
              label="Total Planned Plots"
              type="number"
              placeholder="e.g. 48"
              value={totalPlots}
              onChange={(e) => setTotalPlots(e.target.value)}
            />
            <FormInput
              label="Total Land Area (Sq.ft)"
              type="number"
              placeholder="e.g. 145000"
              suffix="sq.ft"
              value={totalAreaSqft}
              onChange={(e) => setTotalAreaSqft(e.target.value)}
            />
          </div>

          <FormTextarea
            label="Project Description & Promotional Highlights"
            placeholder="Highlight avenue plantations, proximity to expressways, metro connectivity, layout sanctions, and bank loan approvals..."
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Amenities */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900">Layout Amenities & Infrastructure</h3>
            </div>
            <span className="text-[11px] font-semibold text-primary-700 bg-primary-50 px-2.5 py-0.5 rounded-full">
              {selectedAmenities.length} selected
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {PRESET_AMENITIES.map((amenity) => {
              const isSelected = selectedAmenities.includes(amenity)
              return (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => handleToggleAmenity(amenity)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-primary-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>{amenity}</span>
                </button>
              )
            })}
          </div>

          {/* Selected custom amenities */}
          {selectedAmenities.filter((a) => !PRESET_AMENITIES.includes(a)).length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {selectedAmenities
                .filter((a) => !PRESET_AMENITIES.includes(a))
                .map((a) => (
                  <span key={a} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-700">
                    {a}
                    <button type="button" onClick={() => handleToggleAmenity(a)} className="ml-0.5 cursor-pointer hover:text-red-500 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
            </div>
          )}

          {/* Add custom amenity */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="text"
              placeholder="Add custom amenity (e.g. Amphitheatre)..."
              value={customAmenity}
              onChange={(e) => setCustomAmenity(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomAmenity() } }}
              className="flex-1 px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600"
            />
            <button
              type="button"
              onClick={handleAddCustomAmenity}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* ── IMAGE UPLOAD ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Images className="w-5 h-5 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">Project Photos</h3>
            </div>
            {images.length > 0 && (
              <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                {images.length} photo{images.length !== 1 ? 's' : ''} linked
              </span>
            )}
          </div>

          <p className="text-xs text-slate-500 -mt-1">
            Provide direct image URLs for site photos, master plans, and layout visuals. The <strong>⭐ Primary Cover</strong> image is displayed across project cards and details pages.
          </p>

          <ImageUploader
            images={images}
            onChange={setImages}
            primaryImage={primaryImage}
            onPrimaryChange={setPrimaryImage}
            maxFiles={8}
            label="project photos"
          />
        </div>

        {/* Contact */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Phone className="w-5 h-5 text-slate-500" />
            <h3 className="text-sm font-bold text-slate-900">Site Representative</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Site Manager / Contact Person"
              placeholder="e.g. Ramesh Kulkarni"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
            />
            <FormInput
              label="Contact Phone Number"
              placeholder="e.g. +91 98450 12345"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            to={ROUTES.PROJECTS}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-md shadow-primary-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {submitting ? (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            <span>Register Project</span>
          </button>
        </div>
      </form>
    </div>
  )
}

AddProjectPage.propTypes = {}
export default AddProjectPage
