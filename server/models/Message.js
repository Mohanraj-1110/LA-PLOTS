import mongoose from 'mongoose'

const MessageItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  sender: { type: String, enum: ['agent', 'customer'], default: 'agent' },
  text: { type: String, required: true },
  timestamp: { type: String, default: () => new Date().toISOString() },
})

const ConversationSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true, index: true },
    customerId: { type: String, default: '' },
    customerName: { type: String, default: '' },
    customerPhone: { type: String, default: '' },
    customerAvatar: { type: String, default: '' },
    lastMessage: { type: String, default: '' },
    timestamp: { type: String, default: () => new Date().toISOString() },
    unreadCount: { type: Number, default: 0 },
    messages: { type: [MessageItemSchema], default: [] },
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

export const Conversation = mongoose.models.Conversation || mongoose.model('Conversation', ConversationSchema)
export const Message = Conversation // alias
