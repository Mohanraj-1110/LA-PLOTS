import mongoose from 'mongoose'

const CustomerSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true, index: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, default: '' },
    address: { type: String, default: '' },
    city: { type: String, default: 'Bengaluru' },
    budget: { type: Number, default: 0 },
    budgetMin: { type: Number, default: 0 },
    budgetMax: { type: Number, default: 0 },
    interestedProjectId: { type: String, default: '' },
    interestedProjectName: { type: String, default: '' },
    interestedPlotId: { type: String, default: '' },
    interestedPlotNumber: { type: String, default: '' },
    status: {
      type: String,
      default: 'Lead',
      index: true,
    },
    nextFollowup: { type: String, default: '' },
    nextFollowupDate: { type: String, default: '' },
    notes: { type: String, default: '' },
    assignedAgent: { type: String, default: '' },
    assignedAgentId: { type: String, default: '' },
    leadScore: { type: Number, default: 50 },
    tags: { type: [String], default: [] },
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

export const Customer = mongoose.models.Customer || mongoose.model('Customer', CustomerSchema)
