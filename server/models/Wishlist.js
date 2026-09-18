import mongoose from 'mongoose'

const WishlistSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true, index: true },
    customerId: { type: String, required: true, index: true },
    plotId: { type: String, required: true, index: true },
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

WishlistSchema.index({ customerId: 1, plotId: 1 }, { unique: true })

export const Wishlist = mongoose.models.Wishlist || mongoose.model('Wishlist', WishlistSchema)
