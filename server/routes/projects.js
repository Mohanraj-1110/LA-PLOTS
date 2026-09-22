import express from 'express'
import mongoose from 'mongoose'
import { Project } from '../models/Project.js'
import { Plot } from '../models/Plot.js'
import { isDBConnected, connectDB } from '../db.js'

export const projectsRouter = express.Router()

// Helper to ensure MongoDB Atlas connection is active before operations
async function ensureConnected(res) {
  if (!isDBConnected()) {
    try {
      await connectDB()
    } catch {
      // ignore, checked below
    }
  }

  if (!isDBConnected()) {
    res.status(503).json({
      error: 'Database unavailable',
      message: 'MongoDB Atlas is not connected. Please ensure your MONGODB_URI credentials and IP access are configured.',
    })
    return false
  }
  return true
}

// GET /api/projects - list all projects directly from MongoDB Atlas
projectsRouter.get('/', async (req, res) => {
  try {
    const ok = await ensureConnected(res)
    if (!ok) return

    // Query real projects only from MongoDB Atlas (no mock fallback)
    const projects = await Project.find().sort({ createdAt: -1 }).lean()

    // If no projects exist in MongoDB Atlas yet, return empty list
    if (!projects || projects.length === 0) {
      return res.json([])
    }

    // Attach live plot counts from MongoDB Atlas
    const plots = await Plot.find({}, 'projectId projectName status plotNumber').lean()

    const enriched = projects.map((proj) => {
      const projId = proj.id || proj._id.toString()
      const projPlots = plots.filter(
        (p) =>
          p.projectId === projId ||
          p.projectId === proj.code ||
          p.projectName === proj.name ||
          (proj.code && p.plotNumber?.startsWith(proj.code))
      )
      const available = projPlots.filter((p) => p.status === 'available').length
      const reserved = projPlots.filter((p) => p.status === 'reserved').length
      const sold = projPlots.filter((p) => p.status === 'sold').length
      const blocked = projPlots.filter((p) => p.status === 'blocked').length
      const actualPlotCount = projPlots.length > 0 ? projPlots.length : (proj.totalPlots || 0)

      return {
        ...proj,
        id: projId,
        plotsCount: projPlots.length,
        availablePlots: available,
        reservedPlots: reserved,
        soldPlots: sold,
        blockedPlots: blocked,
        totalPlots: actualPlotCount,
      }
    })

    return res.json(enriched)
  } catch (err) {
    console.error('[Projects API] Fetch error:', err.message)
    return res.status(500).json({ error: 'Failed to fetch projects', message: err.message })
  }
})

// GET /api/projects/:id - single project with its plots directly from MongoDB Atlas
projectsRouter.get('/:id', async (req, res) => {
  try {
    const ok = await ensureConnected(res)
    if (!ok) return

    const { id } = req.params

    let project = await Project.findOne({ id }).lean()
    if (!project && mongoose.Types.ObjectId.isValid(id)) {
      project = await Project.findById(id).lean()
    }

    if (!project) {
      return res.status(404).json({
        error: 'Project not found',
        message: `No project with id "${id}" found in MongoDB Atlas.`,
      })
    }

    const projId = project.id || project._id.toString()

    // Fetch real plots associated with this project from MongoDB Atlas
    const plots = await Plot.find({
      $or: [
        { projectId: projId },
        { projectId: project.code },
        { projectId: project.name },
        { projectName: project.name },
      ],
    }).lean()

    return res.json({
      ...project,
      id: projId,
      plots: plots || [],
    })
  } catch (err) {
    console.error('[Projects API] Project fetch error:', err.message)
    return res.status(500).json({ error: 'Failed to fetch project', message: err.message })
  }
})

// POST /api/projects - create new project in MongoDB Atlas
projectsRouter.post('/', async (req, res) => {
  try {
    const ok = await ensureConnected(res)
    if (!ok) return

    const data = req.body
    const id = data.id || `proj-${Date.now().toString().slice(-6)}`

    const newProject = new Project({
      id,
      name: data.name,
      code: data.code || (data.name ? data.name.substring(0, 3).toUpperCase() : 'PRJ'),
      location: data.location,
      city: data.city || 'Bengaluru',
      state: data.state || 'Karnataka',
      reraNumber: data.reraNumber || '',
      surveyNumbers: data.surveyNumbers || '',
      totalPlots: parseInt(data.totalPlots, 10) || 0,
      totalAreaSqft: parseFloat(data.totalAreaSqft) || 0,
      status: data.status || 'active',
      launchDate: data.launchDate || new Date().toISOString().slice(0, 10),
      description: data.description || '',
      amenities: Array.isArray(data.amenities) ? data.amenities : [],
      image: data.image || '',
      images: Array.isArray(data.images) ? data.images : [],
      brochureUrl: data.brochureUrl || '',
      masterPlanUrl: data.masterPlanUrl || '',
      contactPerson: data.contactPerson || '',
      contactPhone: data.contactPhone || '',
    })

    await newProject.save()
    return res.status(201).json(newProject.toJSON ? newProject.toJSON() : newProject)
  } catch (err) {
    console.error('[Projects API] Error creating project:', err)
    return res.status(500).json({ error: 'Failed to create project', message: err.message })
  }
})

// PUT /api/projects/:id - update project in MongoDB Atlas
projectsRouter.put('/:id', async (req, res) => {
  try {
    const ok = await ensureConnected(res)
    if (!ok) return

    const { id } = req.params
    const data = req.body

    const query = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ id }, { _id: id }] }
      : { id }

    const project = await Project.findOneAndUpdate(
      query,
      { $set: data },
      { returnDocument: 'after' }
    )

    if (!project) {
      return res.status(404).json({ error: 'Project not found in MongoDB Atlas' })
    }

    return res.json(project.toJSON ? project.toJSON() : project)
  } catch (err) {
    console.error('[Projects API] Error updating project:', err)
    return res.status(500).json({ error: 'Failed to update project', message: err.message })
  }
})

// DELETE /api/projects/:id - delete project in MongoDB Atlas
projectsRouter.delete('/:id', async (req, res) => {
  try {
    const ok = await ensureConnected(res)
    if (!ok) return

    const { id } = req.params
    const query = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ id }, { _id: id }] }
      : { id }

    const deleted = await Project.findOneAndDelete(query)

    if (!deleted) {
      return res.status(404).json({ error: 'Project not found in MongoDB Atlas' })
    }

    return res.json({ message: 'Project deleted successfully from MongoDB Atlas', id })
  } catch (err) {
    console.error('[Projects API] Error deleting project:', err)
    return res.status(500).json({ error: 'Failed to delete project', message: err.message })
  }
})

export default projectsRouter
