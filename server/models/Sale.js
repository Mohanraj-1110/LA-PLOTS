import mongoose from 'mongoose'

const SaleSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true, index: true },
    plotId: { type: String, required: true },
    plotNumber: { type: String, default: '' },
    customerId: { type: String, default: '' },
    customerName: { type: String, default: '' },
    saleAmount: { type: Number, required: true },
    cost: { type: Number, default: 0 },
    profit: { type: Number, default: 0 },
    saleDate: { type: String, default: () => new Date().toISOString() },
    paymentStatus: {
      type: String,
      enum: ['completed', 'partial', 'pending'],
      default: 'completed',
    },
    agentId: { type: String, default: '' },
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

export const Sale = mongoose.models.Sale || mongoose.model('Sale', SaleSchema)
