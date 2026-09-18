import { Router } from 'express'
import { Sale } from '../models/Sale.js'
import { Plot } from '../models/Plot.js'
import { isDBConnected } from '../db.js'
export const salesRouter = Router()

let memorySales = []

salesRouter.get('/', async (req, res) => {
  try {
    if (isDBConnected()) {
      const sales = await Sale.find({}).sort({ saleDate: -1 })
      return res.json(sales.map((s) => s.toJSON()))
    }
    return res.json(memorySales)
  } catch (err) {
    return res.status(500).json({ error: err.message, fallback: memorySales })
  }
})

salesRouter.post('/', async (req, res) => {
  try {
    const data = req.body
    const id = data.id || `sale-${Date.now()}`
    const saleData = { ...data, id }

    if (isDBConnected()) {
      const newSale = new Sale(saleData)
      await newSale.save()

      // Also update plot status to 'sold' if plotId is provided
      if (data.plotId) {
        await Plot.findOneAndUpdate(
          { $or: [{ id: data.plotId }, { _id: data.plotId.match(/^[0-9a-fA-F]{24}$/) ? data.plotId : null }] },
          { $set: { status: 'sold' } }
        )
      }

      return res.status(201).json(newSale.toJSON())
    }

    memorySales = [saleData, ...memorySales]
    return res.status(201).json(saleData)
  } catch (err) {
    return res.status(400).json({ error: err.message })
  }
})
