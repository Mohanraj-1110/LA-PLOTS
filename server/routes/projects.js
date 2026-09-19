import express from 'express'
import mongoose from 'mongoose'
import { Project } from '../models/Project.js'
import { Plot } from '../models/Plot.js'
import { projectList } from '../../src/data/mockPlots.js'

export const projectsRouter = express.Router()

// Initial fallback seeds
const DEFAULT_PROJECTS = [
  {
    id: 'proj-01',
    name: 'Greenfield Meadows',
    code: 'GM',
    location: 'Devanahalli, North Bengaluru',
    city: 'Bengaluru',
    state: 'Karnataka',
    reraNumber: 'PRM/KA/RERA/1251/309/PR/200922/003621',
    surveyNumbers: 'Sy.No 42, 43/1, 45/2',
    totalPlots: 48,
    totalAreaSqft: 145000,
    status: 'active',
    launchDate: '2024-01-15',
    description: 'Premium villa plots near Kempegowda International Airport with BIAAPA sanction and clear titles.',
    amenities: ['Gated Community', 'Blacktop Roads', 'Underground Drainage', 'Solar Streetlights', 'Clubhouse & Park', '24/7 Security'],
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'proj-02',
    name: 'Vedic Valley',
    code: 'VV',
    location: 'Electronic City Phase 2, Bengaluru',
    city: 'Bengaluru',
    state: 'Karnataka',
    reraNumber: 'PRM/KA/RERA/1251/310/PR/210415/004112',
    surveyNumbers: 'Sy.No 88, 89/3',
    totalPlots: 36,
    totalAreaSqft: 98000,
    status: 'active',
    launchDate: '2024-03-01',
    description: 'Serene eco-friendly plotted community surrounded by green belts, minutes from major IT corridors.',
    amenities: ['Gated Community', 'Rainwater Harvesting', 'Avenue Plantations', 'Children Play Area', '24/7 Security'],
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'proj-03',
    name: 'Emerald Palms',
    code: 'EP',
    location: 'ECR Highway, Chennai',
    city: 'Chennai',
    state: 'Tamil Nadu',
    reraNumber: 'TN/01/Layout/0245/2023',
    surveyNumbers: 'Sy.No 112/4, 114',
    totalPlots: 24,
    totalAreaSqft: 72000,
    status: 'active',
    launchDate: '2023-11-10',
    description: 'Luxury coastal layout with direct beach access roads and DTCP-approved master plans.',
    amenities: ['Beachside Access', 'Gated Layout', 'Compound Wall', 'Solar Lights', 'Underground Cabling'],
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'proj-04',
    name: 'Sunrise Enclave',
    code: 'SE',
    location: 'Shamshabad, Hyderabad',
    city: 'Hyderabad',
    state: 'Telangana',
    reraNumber: 'P02400005118',
    surveyNumbers: 'Sy.No 204, 205/1',
    totalPlots: 60,
    totalAreaSqft: 180000,
    status: 'upcoming',
    launchDate: '2024-06-01',
    description: 'HMDA-approved investment corridor parcel strategically situated near Hyderabad ORR.',
    amenities: ['HMDA Approved', 'Wide Tar Roads', 'Overhead Tank', 'Grand Entrance Arch', 'Landscaped Garden'],
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'proj-05',
    name: 'Golden Acres',
    code: 'GA',
    location: 'Hinjewadi Phase 3, Pune',
    city: 'Pune',
    state: 'Maharashtra',
    reraNumber: 'P52100049210',
    surveyNumbers: 'Sy.No 15/2, 16/1',
    totalPlots: 30,
    totalAreaSqft: 90000,
    status: 'completed',
    launchDate: '2023-04-15',
    description: 'Fully developed plotted layout next to Pune IT Tech Park with ready-to-construct deeds.',
    amenities: ['PMRDA Sanction', 'Clear Titles', 'Clubhouse', 'Gymnasium', 'Gated Community'],
    image: 'https://images.unsplash.com/photo-1448630360428-65456885c650?w=800&auto=format&fit=crop&q=80',
  },
]

// GET /api/projects - list all projects with live plot stats
projectsRouter.get('/', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        error: 'Database unavailable',
        message: 'Cannot retrieve projects: database connection is not established.',
      })
    }

    let projects = await Project.find().sort({ createdAt: -1 }).lean()

    // If database is empty on first run, seed initial project data
    if (!projects || projects.length === 0) {
      console.log('[Projects] Database empty — seeding initial project data...')
      await Project.insertMany(DEFAULT_PROJECTS)
      projects = await Project.find().sort({ createdAt: -1 }).lean()
    }

    // Attach live plot counts
    const plots = await Plot.find({}, 'projectId status').lean()
    const enriched = projects.map((proj) => {
      const projPlots = plots.filter((p) => p.projectId === proj.id || p.projectId === proj.name)
      const available = projPlots.filter((p) => p.status === 'available').length
      const reserved = projPlots.filter((p) => p.status === 'reserved').length
      const sold = projPlots.filter((p) => p.status === 'sold').length
      const blocked = projPlots.filter((p) => p.status === 'blocked').length
      const actualPlotCount = projPlots.length > 0 ? projPlots.length : (proj.totalPlots || 0)

      return {
        ...proj,
        id: proj.id || proj._id.toString(),
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
    console.error('Projects fetch error:', err.message)
    return res.status(500).json({ error: 'Failed to fetch projects', details: err.message })
  }
})

// GET /api/projects/:id - single project with its plots
projectsRouter.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        error: 'Database unavailable',
        message: 'Cannot retrieve project: database connection is not established.',
      })
    }

    let project = await Project.findOne({ id }).lean()
    if (!project) {
      try {
        project = await Project.findById(id).lean()
      } catch {}
    }

    if (!project) {
      return res.status(404).json({ error: 'Project not found' })
    }

    // Fetch plots associated with this project
    const plots = await Plot.find({
      $or: [{ projectId: project.id }, { projectId: project.name }, { projectName: project.name }],
    }).lean()

    return res.json({
      ...project,
      id: project.id || project._id.toString(),
      plots: plots || [],
    })
  } catch (err) {
    console.error('Project fetch error:', err.message)
    res.status(500).json({ error: 'Failed to fetch project', details: err.message })
  }
})

// POST /api/projects - create new project
projectsRouter.post('/', async (req, res) => {
  try {
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
      image: data.image || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=80',
      brochureUrl: data.brochureUrl || '',
      masterPlanUrl: data.masterPlanUrl || '',
      contactPerson: data.contactPerson || '',
      contactPhone: data.contactPhone || '',
    })

    await newProject.save()
    res.status(201).json(newProject)
  } catch (err) {
    console.error('Error creating project:', err)
    res.status(500).json({ error: 'Failed to create project', details: err.message })
  }
})

// PUT /api/projects/:id - update project
projectsRouter.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const data = req.body

    let project = await Project.findOneAndUpdate(
      { $or: [{ id }, { _id: id }] },
      { $set: data },
      { returnDocument: 'after' }
    )

    if (!project) {
      return res.status(404).json({ error: 'Project not found' })
    }

    res.json(project)
  } catch (err) {
    console.error('Error updating project:', err)
    res.status(500).json({ error: 'Failed to update project', details: err.message })
  }
})

// DELETE /api/projects/:id - delete project
projectsRouter.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const deleted = await Project.findOneAndDelete({ $or: [{ id }, { _id: id }] })

    if (!deleted) {
      return res.status(404).json({ error: 'Project not found' })
    }

    res.json({ message: 'Project deleted successfully', id })
  } catch (err) {
    console.error('Error deleting project:', err)
    res.status(500).json({ error: 'Failed to delete project', details: err.message })
  }
})

export default projectsRouter
