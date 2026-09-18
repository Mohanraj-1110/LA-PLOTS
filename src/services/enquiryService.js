import { api } from './api.js'
import { storage } from './storage.js'

const ENQUIRIES_KEY = 'la_plots_enquiries_v1'

export const enquiryService = {
  async getAllEnquiries() {
    try {
      const enqs = await api.get('/enquiries')
      if (Array.isArray(enqs)) {
        storage.set(ENQUIRIES_KEY, enqs)
        return enqs
      }
      return storage.get(ENQUIRIES_KEY, [])
    } catch (err) {
      console.warn('[MongoDB Atlas] getAllEnquiries fallback:', err.message)
      return storage.get(ENQUIRIES_KEY, [])
    }
  },

  async createEnquiry(data) {
    const newEnq = {
      id: data.id || `enq-${Date.now()}`,
      customerName: data.customerName,
      phone: data.phone,
      email: data.email || '',
      projectId: data.projectId || 'proj-01',
      projectName: data.projectName || 'Greenfield Meadows',
      budget: parseFloat(data.budget) || 0,
      source: data.source || 'Website',
      status: data.status || 'New',
      notes: data.notes || '',
      requirement: data.requirement || data.notes || '',
      assignedAgentId: data.assignedAgentId || '',
      assignedAgentName: data.assignedAgentName || 'Vikram Mehta',
      createdAt: new Date().toISOString(),
    }

    try {
      const saved = await api.post('/enquiries', newEnq)
      const current = storage.get(ENQUIRIES_KEY, [])
      storage.set(ENQUIRIES_KEY, [saved, ...current])
      return saved
    } catch (err) {
      console.warn('[MongoDB Atlas] createEnquiry local fallback:', err.message)
      const current = storage.get(ENQUIRIES_KEY, [])
      storage.set(ENQUIRIES_KEY, [newEnq, ...current])
      return newEnq
    }
  },

  async updateEnquiryStatus(id, newStatus) {
    try {
      const updated = await api.put(`/enquiries/${id}`, { status: newStatus })
      const enqs = storage.get(ENQUIRIES_KEY, [])
      const index = enqs.findIndex((e) => e.id === id)
      if (index !== -1) {
        enqs[index] = updated
        storage.set(ENQUIRIES_KEY, enqs)
      }
      return updated
    } catch (err) {
      console.warn('[MongoDB Atlas] updateEnquiryStatus local fallback:', err.message)
      const enqs = storage.get(ENQUIRIES_KEY, [])
      const index = enqs.findIndex((e) => e.id === id)
      if (index !== -1) {
        enqs[index].status = newStatus
        storage.set(ENQUIRIES_KEY, enqs)
        return enqs[index]
      }
      return { id, status: newStatus }
    }
  },

  async deleteEnquiry(id) {
    try {
      await api.delete(`/enquiries/${id}`)
    } catch (err) {
      console.warn('[MongoDB Atlas] deleteEnquiry local fallback:', err.message)
    }

    const enqs = storage.get(ENQUIRIES_KEY, [])
    const filtered = enqs.filter((e) => e.id !== id)
    storage.set(ENQUIRIES_KEY, filtered)
    return true
  },
}
