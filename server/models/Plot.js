import mongoose from 'mongoose'

const PlotSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true, index: true },
    projectId: { type: String, default: 'proj-1' },
    projectName: { type: String, default: '' },
    plotNumber: { type: String, required: true },
    surveyNumber: { type: String, default: '' },
    layoutSanction: { type: String, default: '' },
    areaSqft: { type: Number, required: true },
    ratePerSqft: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['available', 'reserved', 'sold', 'blocked'],
      default: 'available',
      index: true,
    },
    facing: { type: String, default: 'North' },
    roadWidth: { type: Number, default: 30 },
    photos: { type: [String], default: [] },
    primaryPhoto: { type: String, default: '' },
    documents: { type: [String], default: [] },
    amenities: { type: [String], default: [] },
    coordinates: { type: String, default: '' },
    geo: {
      lat: { type: Number, default: 13.0827 },
      lng: { type: Number, default: 80.2707 },
    },
    location: { type: String, default: 'Tambaram, Chennai' },
    description: { type: String, default: '' },
    isCorner: { type: Boolean, default: false },
    isParkFacing: { type: Boolean, default: false },
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

export const Plot = mongoose.models.Plot || mongoose.model('Plot', PlotSchema)
