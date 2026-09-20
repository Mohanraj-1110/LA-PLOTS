import mongoose from 'mongoose'

const ProjectSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true, index: true },
    name: { type: String, required: true },
    code: { type: String, default: '' },
    location: { type: String, required: true },
    city: { type: String, default: 'Bengaluru' },
    state: { type: String, default: 'Karnataka' },
    reraNumber: { type: String, default: '' },
    surveyNumbers: { type: String, default: '' },
    totalPlots: { type: Number, default: 0 },
    totalAreaSqft: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['active', 'upcoming', 'completed', 'on_hold'],
      default: 'active',
      index: true,
    },
    launchDate: { type: String, default: '' },
    description: { type: String, default: '' },
    amenities: { type: [String], default: [] },
    image: { type: String, default: '' },
    images: { type: [String], default: [] },
    brochureUrl: { type: String, default: '' },
    masterPlanUrl: { type: String, default: '' },
    contactPerson: { type: String, default: '' },
    contactPhone: { type: String, default: '' },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret) => {
        ret.id = ret.id || ret._id.toString()
        delete ret._id
        delete ret.__v
        return ret
      },
    },
  }
)

export const Project = mongoose.models.Project || mongoose.model('Project', ProjectSchema)
export default Project
