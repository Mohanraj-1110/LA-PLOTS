import mongoose from 'mongoose'

const EnquirySchema = new mongoose.Schema(
  {
    id: { type: String, unique: true, index: true },
    customerName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, default: '' },
    projectId: { type: String, default: '' },
    projectName: { type: String, default: '' },
    plotId: { type: String, default: '' },
    budget: { type: mongoose.Schema.Types.Mixed, default: '₹40 - 50 Lakhs' },
    source: { type: String, default: 'Website' },
    status: {
      type: String,
      default: 'New',
      index: true,
    },
    requirement: { type: String, default: '' },
    notes: { type: String, default: '' },
    assignedAgentId: { type: String, default: '' },
    assignedAgentName: { type: String, default: '' },
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

export const Enquiry = mongoose.models.Enquiry || mongoose.model('Enquiry', EnquirySchema)
