import { Router } from 'express'
import { Review } from '../models/Review.js'
import { isDBConnected } from '../db.js'

export const reviewsRouter = Router()

let memoryReviews = []

reviewsRouter.get('/', async (req, res) => {
  try {
    if (isDBConnected()) {
      const reviews = await Review.find({}).sort({ createdAt: -1 })
      return res.json(reviews.map((r) => r.toJSON()))
    }
    return res.json(memoryReviews)
  } catch (err) {
    return res.status(500).json({ error: err.message, fallback: memoryReviews })
  }
})

reviewsRouter.post('/', async (req, res) => {
  try {
    const data = req.body
    const id = data.id || `rev-${Date.now()}`
    const revData = { ...data, id }

    if (isDBConnected()) {
      const newRev = new Review(revData)
      await newRev.save()
      return res.status(201).json(newRev.toJSON())
    }

    memoryReviews = [revData, ...memoryReviews]
    return res.status(201).json(revData)
  } catch (err) {
    return res.status(400).json({ error: err.message })
  }
})
