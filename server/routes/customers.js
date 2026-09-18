import { Router } from 'express'
import { Customer } from '../models/Customer.js'
import { isDBConnected } from '../db.js'
export const customersRouter = Router()

let memoryCustomers = []

customersRouter.get('/', async (req, res) => {
  try {
    if (isDBConnected()) {
      const customers = await Customer.find({}).sort({ createdAt: -1 })
      return res.json(customers.map((c) => c.toJSON()))
    }
    return res.json(memoryCustomers)
  } catch (err) {
    console.error('Error fetching customers:', err)
    return res.status(500).json({ error: err.message, fallback: memoryCustomers })
  }
})

customersRouter.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    if (isDBConnected()) {
      const customer = await Customer.findOne({ $or: [{ id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] })
      if (!customer) return res.status(404).json({ error: 'Customer not found' })
      return res.json(customer.toJSON())
    }
    const found = memoryCustomers.find((c) => c.id === id)
    if (!found) return res.status(404).json({ error: 'Customer not found' })
    return res.json(found)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

customersRouter.post('/', async (req, res) => {
  try {
    const data = req.body
    const id = data.id || `cust-${Date.now()}`
    const customerData = { ...data, id }

    if (isDBConnected()) {
      const newCustomer = new Customer(customerData)
      await newCustomer.save()
      return res.status(201).json(newCustomer.toJSON())
    }

    memoryCustomers = [customerData, ...memoryCustomers]
    return res.status(201).json(customerData)
  } catch (err) {
    console.error('Error creating customer:', err)
    return res.status(400).json({ error: err.message })
  }
})

customersRouter.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body

    if (isDBConnected()) {
      const updated = await Customer.findOneAndUpdate(
        { $or: [{ id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] },
        { $set: updates },
        { new: true }
      )
      if (!updated) return res.status(404).json({ error: 'Customer not found' })
      return res.json(updated.toJSON())
    }

    const index = memoryCustomers.findIndex((c) => c.id === id)
    if (index === -1) return res.status(404).json({ error: 'Customer not found' })
    memoryCustomers[index] = { ...memoryCustomers[index], ...updates }
    return res.json(memoryCustomers[index])
  } catch (err) {
    return res.status(400).json({ error: err.message })
  }
})

customersRouter.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    if (isDBConnected()) {
      await Customer.findOneAndDelete({ $or: [{ id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] })
      return res.json({ success: true, message: 'Customer deleted' })
    }

    memoryCustomers = memoryCustomers.filter((c) => c.id !== id)
    return res.json({ success: true, message: 'Customer deleted' })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})
