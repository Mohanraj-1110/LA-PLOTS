import { api } from './api.js'

export const projectService = {
  /**
   * Fetches all projects from MongoDB Atlas.
   * Does NOT use mock data. Returns an empty array if no projects exist in the database.
   */
  async getAllProjects() {
    try {
      const projects = await api.get('/projects')
      return Array.isArray(projects) ? projects : []
    } catch (err) {
      console.error('[ProjectService] Failed to load projects from MongoDB Atlas:', err.message)
      throw err
    }
  },

  /**
   * Fetches a single project by ID from MongoDB Atlas.
   */
  async getProjectById(id) {
    if (!id) return null
    try {
      const project = await api.get(`/projects/${id}`)
      return project
    } catch (err) {
      console.error(`[ProjectService] Failed to load project ${id} from MongoDB Atlas:`, err.message)
      throw err
    }
  },

  /**
   * Creates a new project in MongoDB Atlas.
   */
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
      image: data.image || '',
      images: Array.isArray(data.images) ? data.images : [],
    }

    try {
      const created = await api.post('/projects', newProject)
      return created
    } catch (err) {
      console.error('[ProjectService] Failed to create project in MongoDB Atlas:', err.message)
      throw err
    }
  },

  /**
   * Updates an existing project in MongoDB Atlas.
   */
  async updateProject(id, updates) {
    try {
      const updated = await api.put(`/projects/${id}`, updates)
      return updated
    } catch (err) {
      console.error(`[ProjectService] Failed to update project ${id} in MongoDB Atlas:`, err.message)
      throw err
    }
  },

  /**
   * Deletes a project from MongoDB Atlas.
   */
  async deleteProject(id) {
    try {
      await api.delete(`/projects/${id}`)
      return true
    } catch (err) {
      console.error(`[ProjectService] Failed to delete project ${id} from MongoDB Atlas:`, err.message)
      throw err
    }
  },
}

export default projectService
