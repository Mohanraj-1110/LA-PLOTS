import { api } from './api.js'
import { storage } from './storage.js'
import { calculatePlotTotal } from '../utils/calculateProfit.js'

const PLOTS_KEY = 'la_plots_inventory_v1'
const PROJECTS_KEY = 'la_plots_projects_v1'

export const plotService = {
  async getAllPlots() {
    try {
      const plots = await api.get('/plots')
      if (Array.isArray(plots)) {
        storage.set(PLOTS_KEY, plots)
        return plots
      }
      return storage.get(PLOTS_KEY, [])
    } catch (err) {
      console.warn('[MongoDB Atlas] getAllPlots fallback to local cache:', err.message)
      return storage.get(PLOTS_KEY, [])
    }
  },

  async getPlotById(id) {
    try {
      const plot = await api.get(`/plots/${id}`)
      return plot
    } catch {
      const plots = await this.getAllPlots()
      return plots.find((p) => p.id === id) || null
    }
  },

  async createPlot(data) {
    const areaSqft = parseFloat(data.areaSqft) || 0
    const ratePerSqft = parseFloat(data.ratePerSqft) || 0
    const totalAmount = calculatePlotTotal(areaSqft, ratePerSqft)

    const newPlot = {
      id: data.id || `plot-${Date.now()}`,
      projectId: data.projectId || 'proj-01',
      projectName: data.projectName || 'Greenfield Meadows',
      location: data.location || 'Bengaluru',
      plotNumber: data.plotNumber,
      surveyNumber: data.surveyNumber || '',
      areaSqft,
      ratePerSqft,
      totalAmount,
      status: data.status || 'available',
      facing: data.facing || 'East',
      roadWidth: parseFloat(data.roadWidth) || 30,
      description: data.description || '',
      amenities: data.amenities || ['Gated Layout', 'Clear Title', 'Tar Road'],
      photos: Array.isArray(data.photos) ? data.photos : [],
      primaryPhoto: data.primaryPhoto || (Array.isArray(data.photos) && data.photos[0]) || '',
      documents: data.documents || [],
      coordinates: data.coordinates || '12.9716° N, 77.5946° E',
      createdAt: new Date().toISOString(),
    }

    try {
      const saved = await api.post('/plots', newPlot)
      const current = storage.get(PLOTS_KEY, [])
      storage.set(PLOTS_KEY, [saved, ...current])
      return saved
    } catch (err) {
      console.warn('[MongoDB Atlas] createPlot local fallback:', err.message)
      const current = storage.get(PLOTS_KEY, [])
      storage.set(PLOTS_KEY, [newPlot, ...current])
      return newPlot
    }
  },

  async updatePlot(id, updates) {
    // BUG-09 FIX: Recalculate totalAmount even when only one of areaSqft or
    // ratePerSqft changes. Fall back to the cached value for the missing
    // dimension so the total stays accurate after partial updates.
    const existing = storage.get(PLOTS_KEY, []).find((p) => p.id === id) || {}
    const area = updates.areaSqft !== undefined
      ? parseFloat(updates.areaSqft)
      : parseFloat(existing.areaSqft) || 0
    const rate = updates.ratePerSqft !== undefined
      ? parseFloat(updates.ratePerSqft)
      : parseFloat(existing.ratePerSqft) || 0
    const totalAmount = calculatePlotTotal(area, rate)

    const payload = {
      ...updates,
      ...(updates.areaSqft !== undefined ? { areaSqft: area } : {}),
      ...(updates.ratePerSqft !== undefined ? { ratePerSqft: rate } : {}),
      totalAmount,
    }

    try {
      const updated = await api.put(`/plots/${id}`, payload)
      const plots = storage.get(PLOTS_KEY, [])
      const index = plots.findIndex((p) => p.id === id)
      if (index !== -1) {
        plots[index] = updated
        storage.set(PLOTS_KEY, plots)
      }
      return updated
    } catch (err) {
      console.warn('[MongoDB Atlas] updatePlot local fallback:', err.message)
      const plots = storage.get(PLOTS_KEY, [])
      const index = plots.findIndex((p) => p.id === id)
      if (index !== -1) {
        plots[index] = { ...plots[index], ...payload }
        storage.set(PLOTS_KEY, plots)
        return plots[index]
      }
      return payload
    }
  },

  async updatePlotStatus(id, newStatus) {
    return this.updatePlot(id, { status: newStatus })
  },

  async deletePlot(id) {
    try {
      await api.delete(`/plots/${id}`)
    } catch (err) {
      console.warn('[MongoDB Atlas] deletePlot local fallback:', err.message)
    }

    const plots = storage.get(PLOTS_KEY, [])
    const filtered = plots.filter((p) => p.id !== id)
    storage.set(PLOTS_KEY, filtered)
    return true
  },

  async getProjects() {
    const projects = storage.get(PROJECTS_KEY, null)
    return projects || []
  },
}
