import { api } from './api.js'
import { storage } from './storage.js'
import { projectList } from '../data/mockPlots.js'

const PROJECTS_KEY = 'la_plots_projects_v1'

export const projectService = {
  async getAllProjects() {
    try {
      const projects = await api.get('/projects')
      if (Array.isArray(projects) && projects.length > 0) {
        storage.set(PROJECTS_KEY, projects)
        return projects
      }
      const local = storage.get(PROJECTS_KEY, projectList)
      return local
    } catch (err) {
      console.warn('[ProjectService] getAllProjects fallback to local cache:', err.message)
      return storage.get(PROJECTS_KEY, projectList)
    }
  },

  async getProjectById(id) {
    try {
      const project = await api.get(`/projects/${id}`)
      return project
    } catch {
      const projects = await this.getAllProjects()
      return projects.find((p) => p.id === id || p.code === id || p.name === id) || null
    }
  },

  async createProject(data) {
    const id = data.id || `proj-${Date.now().toString().slice(-6)}`
    const newProject = {
      ...data,
      id,
      code: data.code || (data.name ? data.name.substring(0, 3).toUpperCase() : 'PRJ'),
      totalPlots: parseInt(data.totalPlots, 10) || 0,
      totalAreaSqft: parseFloat(data.totalAreaSqft) || 0,
      status: data.status || 'active',
      launchDate: data.launchDate || new Date().toISOString().slice(0, 10),
      amenities: Array.isArray(data.amenities) ? data.amenities : [],
      image:
        data.image ||
        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString(),
    }

    try {
      const created = await api.post('/projects', newProject)
      // Update local storage
      const existing = storage.get(PROJECTS_KEY, [])
      storage.set(PROJECTS_KEY, [created, ...existing])
      return created
    } catch (err) {
      console.warn('[ProjectService] Offline create fallback:', err.message)
      const existing = storage.get(PROJECTS_KEY, projectList)
      const updated = [newProject, ...existing]
      storage.set(PROJECTS_KEY, updated)
      return newProject
    }
  },

  async updateProject(id, updates) {
    try {
      const updated = await api.put(`/projects/${id}`, updates)
      const existing = storage.get(PROJECTS_KEY, [])
      const idx = existing.findIndex((p) => p.id === id)
      if (idx !== -1) {
        existing[idx] = { ...existing[idx], ...updated }
        storage.set(PROJECTS_KEY, existing)
      }
      return updated
    } catch (err) {
      console.warn('[ProjectService] Offline update fallback:', err.message)
      const existing = storage.get(PROJECTS_KEY, projectList)
      const idx = existing.findIndex((p) => p.id === id)
      if (idx !== -1) {
        existing[idx] = { ...existing[idx], ...updates }
        storage.set(PROJECTS_KEY, existing)
        return existing[idx]
      }
      return { id, ...updates }
    }
  },

  async deleteProject(id) {
    try {
      await api.delete(`/projects/${id}`)
    } catch (err) {
      console.warn('[ProjectService] Offline delete fallback:', err.message)
    }
    const existing = storage.get(PROJECTS_KEY, [])
    const filtered = existing.filter((p) => p.id !== id)
    storage.set(PROJECTS_KEY, filtered)
    return true
  },
}

export default projectService
