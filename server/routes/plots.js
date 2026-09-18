import { Router } from 'express'
import { Plot } from '../models/Plot.js'
import { isDBConnected } from '../db.js'
export const plotsRouter = Router()

// In-memory cache fallback (clean empty slate for production)
let memoryPlots = []

plotsRouter.get('/', async (req, res) => {
  try {
    if (isDBConnected()) {
      const plots = await Plot.find({}).sort({ createdAt: -1 })
      return res.json(plots.map((p) => p.toJSON()))
    }
    return res.json(memoryPlots)
  } catch (err) {
    console.error('Error fetching plots:', err)
    return res.status(500).json({ error: err.message, fallback: memoryPlots })
  }
})

plotsRouter.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    if (isDBConnected()) {
      const plot = await Plot.findOne({ $or: [{ id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] })
      if (!plot) return res.status(404).json({ error: 'Plot not found' })
      return res.json(plot.toJSON())
    }
    const found = memoryPlots.find((p) => p.id === id)
    if (!found) return res.status(404).json({ error: 'Plot not found' })
    return res.json(found)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

plotsRouter.post('/', async (req, res) => {
  try {
    const data = req.body
    const id = data.id || `plot-${Date.now()}`
    const plotData = { ...data, id }

    if (isDBConnected()) {
      const newPlot = new Plot(plotData)
      await newPlot.save()
      return res.status(201).json(newPlot.toJSON())
    }

    memoryPlots = [plotData, ...memoryPlots]
    return res.status(201).json(plotData)
  } catch (err) {
    console.error('Error creating plot:', err)
    return res.status(400).json({ error: err.message })
  }
})

plotsRouter.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body

    if (isDBConnected()) {
      const updated = await Plot.findOneAndUpdate(
        { $or: [{ id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] },
        { $set: updates },
        { new: true }
      )
      if (!updated) return res.status(404).json({ error: 'Plot not found' })
      return res.json(updated.toJSON())
    }

    const index = memoryPlots.findIndex((p) => p.id === id)
    if (index === -1) return res.status(404).json({ error: 'Plot not found' })
    memoryPlots[index] = { ...memoryPlots[index], ...updates }
    return res.json(memoryPlots[index])
  } catch (err) {
    console.error('Error updating plot:', err)
    return res.status(400).json({ error: err.message })
  }
})

plotsRouter.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    if (isDBConnected()) {
      await Plot.findOneAndDelete({ $or: [{ id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] })
      return res.json({ success: true, message: 'Plot deleted successfully' })
    }

    memoryPlots = memoryPlots.filter((p) => p.id !== id)
    return res.json({ success: true, message: 'Plot deleted successfully' })
  } catch (err) {
    console.error('Error deleting plot:', err)
    return res.status(500).json({ error: err.message })
  }
})
