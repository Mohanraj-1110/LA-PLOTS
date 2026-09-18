import { Router } from 'express'
import { Enquiry } from '../models/Enquiry.js'
import { isDBConnected } from '../db.js'
export const enquiriesRouter = Router()

let memoryEnquiries = []

enquiriesRouter.get('/', async (req, res) => {
  try {
    if (isDBConnected()) {
      const enquiries = await Enquiry.find({}).sort({ createdAt: -1 })
      return res.json(enquiries.map((e) => e.toJSON()))
    }
    return res.json(memoryEnquiries)
  } catch (err) {
    return res.status(500).json({ error: err.message, fallback: memoryEnquiries })
  }
})

enquiriesRouter.post('/', async (req, res) => {
  try {
    const data = req.body
    const id = data.id || `enq-${Date.now()}`
    const enqData = { ...data, id }

    if (isDBConnected()) {
      const newEnq = new Enquiry(enqData)
      await newEnq.save()
      return res.status(201).json(newEnq.toJSON())
    }

    memoryEnquiries = [enqData, ...memoryEnquiries]
    return res.status(201).json(enqData)
  } catch (err) {
    return res.status(400).json({ error: err.message })
  }
})

enquiriesRouter.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body

    if (isDBConnected()) {
      const updated = await Enquiry.findOneAndUpdate(
        { $or: [{ id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] },
        { $set: updates },
        { new: true }
      )
      if (!updated) return res.status(404).json({ error: 'Enquiry not found' })
      return res.json(updated.toJSON())
    }

    const index = memoryEnquiries.findIndex((e) => e.id === id)
    if (index === -1) return res.status(404).json({ error: 'Enquiry not found' })
    memoryEnquiries[index] = { ...memoryEnquiries[index], ...updates }
    return res.json(memoryEnquiries[index])
  } catch (err) {
    return res.status(400).json({ error: err.message })
  }
})

enquiriesRouter.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    if (isDBConnected()) {
      await Enquiry.findOneAndDelete({ $or: [{ id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] })
      return res.json({ success: true, message: 'Enquiry deleted' })
    }

    memoryEnquiries = memoryEnquiries.filter((e) => e.id !== id)
    return res.json({ success: true, message: 'Enquiry deleted' })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})
