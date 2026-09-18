import mongoose from 'mongoose'

const DocumentSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true, index: true },
    name: { type: String, required: true },
    category: {
      type: String,
      default: 'Other',
      index: true,
    },
    fileUrl: { type: String, default: '' },
    fileData: { type: String, default: '' },
    fileSize: { type: String, default: '1.2 MB' },
    fileType: { type: String, default: 'PDF' },
    projectId: { type: String, default: 'proj-1' },
    plotId: { type: String, default: '' },
    customerId: { type: String, default: '' },
    uploadedBy: { type: String, default: 'Admin' },
    uploadedAt: { type: String, default: () => new Date().toISOString() },
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

export const Document = mongoose.models.Document || mongoose.model('Document', DocumentSchema)
