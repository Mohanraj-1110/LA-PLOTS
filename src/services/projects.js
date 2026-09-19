import { projectService } from './projectService.js'

export const getProjects = () => projectService.getAllProjects()
export const getProjectById = (id) => projectService.getProjectById(id)
export const createProject = (data) => projectService.createProject(data)
export const updateProject = (id, data) => projectService.updateProject(id, data)
export const deleteProject = (id) => projectService.deleteProject(id)

export default projectService
