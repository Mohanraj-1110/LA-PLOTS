import { api } from './api.js'
import { storage } from './storage.js'

const APPOINTMENTS_KEY = 'la_plots_appointments_v1'

export const appointmentService = {
  async getAllAppointments() {
    try {
      const appts = await api.get('/appointments')
      if (Array.isArray(appts)) {
        storage.set(APPOINTMENTS_KEY, appts)
        return appts
      }
      return storage.get(APPOINTMENTS_KEY, [])
    } catch (err) {
      console.warn('[MongoDB Atlas] getAllAppointments fallback:', err.message)
      return storage.get(APPOINTMENTS_KEY, [])
    }
  },

  async getAppointmentById(id) {
    try {
      return await api.get(`/appointments/${id}`)
    } catch {
      const appts = await this.getAllAppointments()
      return appts.find((a) => a.id === id) || null
    }
  },

  async createAppointment(data) {
    const newAppt = {
      id: data.id || `appt-${Date.now()}`,
      customerId: data.customerId || '',
      customerName: data.customerName || '',
      plotId: data.plotId || '',
      plotNumber: data.plotNumber || '',
      type: data.type || 'site visit',
      date: data.date || new Date().toISOString().slice(0, 10),
      time: data.time || '10:00 AM',
      status: data.status || 'scheduled',
      notes: data.notes || '',
      assignedAgentId: data.assignedAgentId || '',
      createdAt: new Date().toISOString(),
    }

    try {
      const saved = await api.post('/appointments', newAppt)
      const current = storage.get(APPOINTMENTS_KEY, [])
      storage.set(APPOINTMENTS_KEY, [saved, ...current])
      return saved
    } catch (err) {
      console.warn('[MongoDB Atlas] createAppointment local fallback:', err.message)
      const current = storage.get(APPOINTMENTS_KEY, [])
      storage.set(APPOINTMENTS_KEY, [newAppt, ...current])
      return newAppt
    }
  },

  async updateAppointment(id, updates) {
    try {
      const updated = await api.put(`/appointments/${id}`, updates)
      const appts = storage.get(APPOINTMENTS_KEY, [])
      const index = appts.findIndex((a) => a.id === id)
      if (index !== -1) {
        appts[index] = updated
        storage.set(APPOINTMENTS_KEY, appts)
      }
      return updated
    } catch (err) {
      console.warn('[MongoDB Atlas] updateAppointment local fallback:', err.message)
      const appts = storage.get(APPOINTMENTS_KEY, [])
      const index = appts.findIndex((a) => a.id === id)
      if (index !== -1) {
        appts[index] = { ...appts[index], ...updates }
        storage.set(APPOINTMENTS_KEY, appts)
        return appts[index]
      }
      return updates
    }
  },

  async updateAppointmentStatus(id, newStatus) {
    return this.updateAppointment(id, { status: newStatus })
  },

  async deleteAppointment(id) {
    try {
      await api.delete(`/appointments/${id}`)
    } catch (err) {
      console.warn('[MongoDB Atlas] deleteAppointment local fallback:', err.message)
    }

    const appts = storage.get(APPOINTMENTS_KEY, [])
    const filtered = appts.filter((a) => a.id !== id)
    storage.set(APPOINTMENTS_KEY, filtered)
    return true
  },
}
