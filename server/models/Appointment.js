import mongoose from 'mongoose'

const AppointmentSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true, index: true },
    customerId: { type: String, default: '', index: true },
    customerName: { type: String, default: '' },
    plotId: { type: String, default: '' },
    plotNumber: { type: String, default: '' },
    type: {
      type: String,
      default: 'Site Visit',
    },
    date: { type: String, required: true },
    time: { type: String, default: '10:00 AM' },
    status: {
      type: String,
      default: 'Upcoming',
      index: true,
    },
    notes: { type: String, default: '' },
    assignedAgent: { type: String, default: '' },
    assignedAgentId: { type: String, default: '' },
    reminderSentDate: { type: String, default: '' },
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

export const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', AppointmentSchema)
