import { Router } from 'express'
import { Conversation } from '../models/Message.js'
import { isDBConnected } from '../db.js'
export const messagesRouter = Router()

let memoryConversations = []

messagesRouter.get('/', async (req, res) => {
  try {
    if (isDBConnected()) {
      const convos = await Conversation.find({}).sort({ timestamp: -1 })
      return res.json(convos.map((c) => c.toJSON()))
    }
    return res.json(memoryConversations)
  } catch (err) {
    return res.status(500).json({ error: err.message, fallback: memoryConversations })
  }
})

messagesRouter.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    if (isDBConnected()) {
      const convo = await Conversation.findOne({ id })
      if (!convo) return res.status(404).json({ error: 'Conversation not found' })
      return res.json(convo.toJSON())
    }
    const found = memoryConversations.find((c) => c.id === id)
    if (!found) return res.status(404).json({ error: 'Conversation not found' })
    return res.json(found)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

messagesRouter.post('/:id/messages', async (req, res) => {
  try {
    const { id } = req.params
    const { text, sender = 'agent' } = req.body
    if (!text) return res.status(400).json({ error: 'text is required' })

    const newMsg = {
      id: `m-${Date.now()}`,
      sender,
      text,
      timestamp: new Date().toISOString(),
    }

    if (isDBConnected()) {
      const convo = await Conversation.findOne({ id })
      if (!convo) return res.status(404).json({ error: 'Conversation not found' })
      convo.messages.push(newMsg)
      convo.lastMessage = text
      convo.timestamp = newMsg.timestamp
      if (sender === 'customer') {
        convo.unreadCount = (convo.unreadCount || 0) + 1
      }
      await convo.save()
      return res.status(201).json(newMsg)
    }

    const index = memoryConversations.findIndex((c) => c.id === id)
    if (index === -1) return res.status(404).json({ error: 'Conversation not found' })
    const target = memoryConversations[index]
    const updatedMessages = [...(target.messages || []), newMsg]
    memoryConversations[index] = {
      ...target,
      messages: updatedMessages,
      lastMessage: text,
      timestamp: newMsg.timestamp,
      unreadCount: sender === 'customer' ? (target.unreadCount || 0) + 1 : target.unreadCount || 0,
    }
    return res.status(201).json(newMsg)
  } catch (err) {
    return res.status(400).json({ error: err.message })
  }
})

messagesRouter.put('/:id/read', async (req, res) => {
  try {
    const { id } = req.params

    if (isDBConnected()) {
      await Conversation.findOneAndUpdate({ id }, { $set: { unreadCount: 0 } })
      return res.json({ success: true })
    }

    const index = memoryConversations.findIndex((c) => c.id === id)
    if (index !== -1) {
      memoryConversations[index].unreadCount = 0
    }
    return res.json({ success: true })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})
