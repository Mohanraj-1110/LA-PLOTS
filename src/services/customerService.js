import { api } from './api.js'
import { storage } from './storage.js'

const CUSTOMERS_KEY = 'la_plots_customers_v1'

export const customerService = {
  async getAllCustomers() {
    try {
      const customers = await api.get('/customers')
      if (Array.isArray(customers)) {
        storage.set(CUSTOMERS_KEY, customers)
        return customers
      }
      return storage.get(CUSTOMERS_KEY, [])
    } catch (err) {
      console.warn('[MongoDB Atlas] getAllCustomers fallback:', err.message)
      return storage.get(CUSTOMERS_KEY, [])
    }
  },

  async getCustomerById(id) {
    try {
      return await api.get(`/customers/${id}`)
    } catch {
      const customers = await this.getAllCustomers()
      return customers.find((c) => c.id === id) || null
    }
  },

  async createCustomer(data) {
    const newCustomer = {
      id: data.id || `cust-${Date.now()}`,
      name: data.name,
      phone: data.phone,
      email: data.email || '',
      address: data.address || '',
      city: data.city || 'Bengaluru',
      budget: parseFloat(data.budget || data.budgetMax || 0),
      budgetMin: parseFloat(data.budgetMin) || 0,
      budgetMax: parseFloat(data.budgetMax) || 0,
      interestedProjectId: data.interestedProjectId || '',
      interestedProjectName: data.interestedProjectName || '',
      interestedPlotId: data.interestedPlotId || '',
      interestedPlotNumber: data.interestedPlotNumber || '',
      status: data.status || 'New',
      nextFollowup: data.nextFollowup || '',
      notes: data.notes || '',
      assignedAgent: data.assignedAgent || '',
      leadScore: data.leadScore || 50,
      createdAt: new Date().toISOString(),
    }

    try {
      const saved = await api.post('/customers', newCustomer)
      const current = storage.get(CUSTOMERS_KEY, [])
      storage.set(CUSTOMERS_KEY, [saved, ...current])
      return saved
    } catch (err) {
      console.warn('[MongoDB Atlas] createCustomer local fallback:', err.message)
      const current = storage.get(CUSTOMERS_KEY, [])
      storage.set(CUSTOMERS_KEY, [newCustomer, ...current])
      return newCustomer
    }
  },

  async updateCustomer(id, updates) {
    try {
      const updated = await api.put(`/customers/${id}`, updates)
      const customers = storage.get(CUSTOMERS_KEY, [])
      const index = customers.findIndex((c) => c.id === id)
      if (index !== -1) {
        customers[index] = updated
        storage.set(CUSTOMERS_KEY, customers)
      }
      return updated
    } catch (err) {
      console.warn('[MongoDB Atlas] updateCustomer local fallback:', err.message)
      const customers = storage.get(CUSTOMERS_KEY, [])
      const index = customers.findIndex((c) => c.id === id)
      if (index !== -1) {
        customers[index] = { ...customers[index], ...updates }
        storage.set(CUSTOMERS_KEY, customers)
        return customers[index]
      }
      return updates
    }
  },

  async updateCustomerStatus(id, newStatus) {
    return this.updateCustomer(id, { status: newStatus })
  },

  async deleteCustomer(id) {
    try {
      await api.delete(`/customers/${id}`)
    } catch (err) {
      console.warn('[MongoDB Atlas] deleteCustomer local fallback:', err.message)
    }

    const customers = storage.get(CUSTOMERS_KEY, [])
    const filtered = customers.filter((c) => c.id !== id)
    storage.set(CUSTOMERS_KEY, filtered)
    return true
  },
}
