import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema(
  {
    uid: { type: String, required: true, unique: true, index: true },
    name: { type: String, default: '' },
    email: { type: String, required: true, index: true },
    phone: { type: String, default: '' },
    role: {
      type: String,
      enum: ['admin', 'agent', 'customer'],
      default: 'customer',
      index: true,
    },
    photoURL: { type: String, default: '' },
    company: { type: String, default: 'LK Properties' },
    kycDocuments: { type: [String], default: [] },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret) => {
        ret.id = ret.uid
        delete ret._id
        delete ret.__v
        return ret
      },
    },
  }
)

export const User = mongoose.models.User || mongoose.model('User', UserSchema)
