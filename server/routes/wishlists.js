import { Router } from 'express'
import { Wishlist } from '../models/Wishlist.js'
import { isDBConnected } from '../db.js'

export const wishlistsRouter = Router()

let memoryWishlists = []

wishlistsRouter.get('/', async (req, res) => {
  try {
    const { customerId } = req.query
    if (!customerId) return res.json([])

    if (isDBConnected()) {
      const items = await Wishlist.find({ customerId })
      return res.json(items.map((w) => w.toJSON()))
    }

    const filtered = memoryWishlists.filter((w) => w.customerId === customerId)
    return res.json(filtered)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

wishlistsRouter.get('/check', async (req, res) => {
  try {
    const { customerId, plotId } = req.query
    if (!customerId || !plotId) return res.json({ isSaved: false })

    if (isDBConnected()) {
      const found = await Wishlist.findOne({ customerId, plotId })
      return res.json({ isSaved: Boolean(found) })
    }

    const found = memoryWishlists.some((w) => w.customerId === customerId && w.plotId === plotId)
    return res.json({ isSaved: found })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

wishlistsRouter.post('/toggle', async (req, res) => {
  try {
    const { customerId, plotId } = req.body
    if (!customerId || !plotId) return res.status(400).json({ error: 'customerId and plotId are required' })

    if (isDBConnected()) {
      const existing = await Wishlist.findOne({ customerId, plotId })
      if (existing) {
        await Wishlist.deleteOne({ _id: existing._id })
        return res.json({ isSaved: false, message: 'Removed from wishlist' })
      } else {
        const id = `wish-${Date.now()}`
        const newWish = new Wishlist({ id, customerId, plotId })
        await newWish.save()
        return res.json({ isSaved: true, message: 'Added to wishlist', item: newWish.toJSON() })
      }
    }

    const index = memoryWishlists.findIndex((w) => w.customerId === customerId && w.plotId === plotId)
    if (index >= 0) {
      memoryWishlists.splice(index, 1)
      return res.json({ isSaved: false, message: 'Removed from wishlist' })
    } else {
      const item = { id: `wish-${Date.now()}`, customerId, plotId }
      memoryWishlists.push(item)
      return res.json({ isSaved: true, message: 'Added to wishlist', item })
    }
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})
