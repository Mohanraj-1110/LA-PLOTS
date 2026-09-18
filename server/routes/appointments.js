import { Router } from 'express'
import { Appointment } from '../models/Appointment.js'
import { isDBConnected } from '../db.js'
export const appointmentsRouter = Router()

let memoryAppointments = []

appointmentsRouter.get('/', async (req, res) => {
  try {
    const { customerId } = req.query
    const filter = customerId ? { customerId } : {}

    if (isDBConnected()) {
      const appointments = await Appointment.find(filter).sort({ date: 1, time: 1 })
      return res.json(appointments.map((a) => a.toJSON()))
    }

    let result = memoryAppointments
    if (customerId) {
      result = result.filter((a) => a.customerId === customerId)
    }
    return res.json(result)
  } catch (err) {
    return res.status(500).json({ error: err.message, fallback: memoryAppointments })
  }
})

appointmentsRouter.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    if (isDBConnected()) {
      const appt = await Appointment.findOne({ $or: [{ id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] })
      if (!appt) return res.status(404).json({ error: 'Appointment not found' })
      return res.json(appt.toJSON())
    }
    const found = memoryAppointments.find((a) => a.id === id)
    if (!found) return res.status(404).json({ error: 'Appointment not found' })
    return res.json(found)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

appointmentsRouter.post('/', async (req, res) => {
  try {
    const data = req.body
    const id = data.id || `appt-${Date.now()}`
    const apptData = { ...data, id }

    if (isDBConnected()) {
      const newAppt = new Appointment(apptData)
      await newAppt.save()
      return res.status(201).json(newAppt.toJSON())
    }

    memoryAppointments = [apptData, ...memoryAppointments]
    return res.status(201).json(apptData)
  } catch (err) {
    return res.status(400).json({ error: err.message })
  }
})

appointmentsRouter.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body

    if (isDBConnected()) {
      const updated = await Appointment.findOneAndUpdate(
        { $or: [{ id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] },
        { $set: updates },
        { new: true }
      )
      if (!updated) return res.status(404).json({ error: 'Appointment not found' })
      return res.json(updated.toJSON())
    }

    const index = memoryAppointments.findIndex((a) => a.id === id)
    if (index === -1) return res.status(404).json({ error: 'Appointment not found' })
    memoryAppointments[index] = { ...memoryAppointments[index], ...updates }
    return res.json(memoryAppointments[index])
  } catch (err) {
    return res.status(400).json({ error: err.message })
  }
})

appointmentsRouter.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    if (isDBConnected()) {
      await Appointment.findOneAndDelete({ $or: [{ id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] })
      return res.json({ success: true, message: 'Appointment deleted' })
    }

    memoryAppointments = memoryAppointments.filter((a) => a.id !== id)
    return res.json({ success: true, message: 'Appointment deleted' })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})
