import { Router } from 'express'
import { Document } from '../models/Document.js'
import { isDBConnected } from '../db.js'
export const documentsRouter = Router()

let memoryDocuments = []

documentsRouter.get('/', async (req, res) => {
  try {
    if (isDBConnected()) {
      const documents = await Document.find({}).sort({ createdAt: -1 })
      return res.json(documents.map((d) => d.toJSON()))
    }
    return res.json(memoryDocuments)
  } catch (err) {
    return res.status(500).json({ error: err.message, fallback: memoryDocuments })
  }
})

documentsRouter.post('/', async (req, res) => {
  try {
    const data = req.body
    const id = data.id || `doc-${Date.now()}`
    const docData = { ...data, id }

    if (isDBConnected()) {
      const newDoc = new Document(docData)
      await newDoc.save()
      return res.status(201).json(newDoc.toJSON())
    }

    memoryDocuments = [docData, ...memoryDocuments]
    return res.status(201).json(docData)
  } catch (err) {
    return res.status(400).json({ error: err.message })
  }
})

documentsRouter.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    if (isDBConnected()) {
      await Document.findOneAndDelete({ $or: [{ id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] })
      return res.json({ success: true, message: 'Document deleted' })
    }

    memoryDocuments = memoryDocuments.filter((d) => d.id !== id)
    return res.json({ success: true, message: 'Document deleted' })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})
