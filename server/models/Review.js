import mongoose from 'mongoose'

const ReviewSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true, index: true },
    customerId: { type: String, default: '' },
    customerName: { type: String, default: 'Verified Buyer' },
    plotId: { type: String, default: '' },
    projectId: { type: String, default: 'proj-1' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
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

export const Review = mongoose.models.Review || mongoose.model('Review', ReviewSchema)
