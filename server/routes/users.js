import { Router } from 'express'
import { User } from '../models/User.js'
import { isDBConnected } from '../db.js'

export const usersRouter = Router()

// Clean in-memory cache for production
let memoryUsers = []

usersRouter.get('/', async (req, res) => {
  try {
    if (isDBConnected()) {
      const users = await User.find({}).sort({ createdAt: -1 })
      return res.json(users.map((u) => u.toJSON()))
    }
    return res.json(memoryUsers)
  } catch (err) {
    return res.status(500).json({ error: err.message, fallback: memoryUsers })
  }
})

usersRouter.get('/:uid', async (req, res) => {
  try {
    const { uid } = req.params
    if (isDBConnected()) {
      const user = await User.findOne({ uid })
      if (!user) return res.status(404).json({ error: 'User not found' })
      return res.json(user.toJSON())
    }
    const found = memoryUsers.find((u) => u.uid === uid)
    if (!found) return res.status(404).json({ error: 'User not found' })
    return res.json(found)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

function isConfiguredAdminEmail(email) {
  if (!email) return false
  const clean = email.toLowerCase().trim()
  const raw =
    process.env.ADMIN_EMAILS ||
    process.env.VITE_ADMIN_EMAILS ||
    'admin@gmail.com,admin@laplots.com,mohan@gmail.com,lkproperties153@gmail.com'
  const list = raw
    .toLowerCase()
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  return list.includes(clean)
}

// Upsert user (used when user signs up or signs in with Firebase Auth)
usersRouter.post('/', async (req, res) => {
  try {
    const { uid, email, name, phone, role, photoURL, company } = req.body
    if (!uid) return res.status(400).json({ error: 'uid is required' })

    const cleanEmail = (email || '').toLowerCase().trim()
    const isAdmin = isConfiguredAdminEmail(cleanEmail)
    // Only permit admin role if the user email is explicitly whitelisted
    const assignedRole = isAdmin ? 'admin' : (role === 'admin' ? 'customer' : (role || 'customer'))

    const userData = {
      uid,
      email: email || '',
      name: name || (email ? email.split('@')[0] : 'User'),
      phone: phone || '',
      role: assignedRole,
      photoURL: photoURL || '',
      company: company || 'LA Plots Realty LLP',
    }

    if (isDBConnected()) {
      const user = await User.findOneAndUpdate(
        { uid },
        { $setOnInsert: { createdAt: new Date() }, $set: userData },
        { new: true, upsert: true }
      )
      return res.status(200).json(user.toJSON())
    }

    const index = memoryUsers.findIndex((u) => u.uid === uid)
    if (index >= 0) {
      memoryUsers[index] = { ...memoryUsers[index], ...userData }
      return res.json(memoryUsers[index])
    } else {
      const newUser = { ...userData, createdAt: new Date().toISOString() }
      memoryUsers.unshift(newUser)
      return res.status(201).json(newUser)
    }
  } catch (err) {
    return res.status(400).json({ error: err.message })
  }
})

usersRouter.put('/:uid', async (req, res) => {
  try {
    const { uid } = req.params
    const updates = { ...req.body }

    if (updates.role === 'admin') {
      const existing = isDBConnected()
        ? await User.findOne({ uid })
        : memoryUsers.find((u) => u.uid === uid)
      if (!existing || !isConfiguredAdminEmail(existing.email)) {
        return res.status(403).json({ error: 'Unauthorized: Admin role can only be assigned to configured administrator accounts.' })
      }
    }

    if (isDBConnected()) {
      const updated = await User.findOneAndUpdate({ uid }, { $set: updates }, { new: true })
      if (!updated) return res.status(404).json({ error: 'User not found' })
      return res.json(updated.toJSON())
    }

    const index = memoryUsers.findIndex((u) => u.uid === uid)
    if (index === -1) return res.status(404).json({ error: 'User not found' })
    memoryUsers[index] = { ...memoryUsers[index], ...updates }
    return res.json(memoryUsers[index])
  } catch (err) {
    return res.status(400).json({ error: err.message })
  }
})

usersRouter.put('/:uid/role', async (req, res) => {
  try {
    const { uid } = req.params
    const { role } = req.body
    if (!['admin', 'agent', 'customer'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' })
    }

    if (role === 'admin') {
      const existing = isDBConnected()
        ? await User.findOne({ uid })
        : memoryUsers.find((u) => u.uid === uid)
      if (!existing || !isConfiguredAdminEmail(existing.email)) {
        return res.status(403).json({ error: 'Unauthorized: Admin role can only be assigned to configured administrator accounts.' })
      }
    }

    if (isDBConnected()) {
      const updated = await User.findOneAndUpdate({ uid }, { $set: { role } }, { new: true })
      if (!updated) return res.status(404).json({ error: 'User not found' })
      return res.json(updated.toJSON())
    }

    const index = memoryUsers.findIndex((u) => u.uid === uid)
    if (index === -1) return res.status(404).json({ error: 'User not found' })
    memoryUsers[index].role = role
    return res.json(memoryUsers[index])
  } catch (err) {
    return res.status(400).json({ error: err.message })
  }
})

usersRouter.delete('/:uid', async (req, res) => {
  try {
    const { uid } = req.params

    if (isDBConnected()) {
      await User.findOneAndDelete({ uid })
      return res.json({ success: true, message: 'User deleted' })
    }

    memoryUsers = memoryUsers.filter((u) => u.uid !== uid)
    return res.json({ success: true, message: 'User deleted' })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})
