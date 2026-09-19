import { api } from './api.js'
import { storage } from './storage.js'

const DOCUMENTS_KEY = 'la_plots_documents_v1'

export const documentService = {
  async getAllDocuments() {
    try {
      const docs = await api.get('/documents')
      if (Array.isArray(docs)) {
        storage.set(DOCUMENTS_KEY, docs)
        return docs
      }
      return storage.get(DOCUMENTS_KEY, [])
    } catch (err) {
      console.warn('[MongoDB Atlas] getAllDocuments fallback:', err.message)
      return storage.get(DOCUMENTS_KEY, [])
    }
  },

  async uploadDocument(data) {
    const newDoc = {
      id: data.id || `doc-${Date.now()}`,
      name: data.name || 'Untitled Document',
      category: data.category || 'Other',
      notes: data.notes || '',
      fileUrl: data.fileUrl || '#',
      fileSize: data.fileSize || 'Text Record',
      fileType: data.fileType || 'text/plain',
      projectId: data.projectId || '',
      projectName: data.projectName || '',
      plotId: data.plotId || '',
      plotNumber: data.plotNumber || '',
      customerId: data.customerId || '',
      customerName: data.customerName || '',
      uploadedBy: data.uploadedBy || '',
      uploadedAt: new Date().toISOString(),
    }

    try {
      const saved = await api.post('/documents', newDoc)
      const current = storage.get(DOCUMENTS_KEY, [])
      storage.set(DOCUMENTS_KEY, [saved, ...current])
      return saved
    } catch (err) {
      console.warn('[MongoDB Atlas] uploadDocument local fallback:', err.message)
      const current = storage.get(DOCUMENTS_KEY, [])
      storage.set(DOCUMENTS_KEY, [newDoc, ...current])
      return newDoc
    }
  },

  async deleteDocument(id) {
    try {
      await api.delete(`/documents/${id}`)
    } catch (err) {
      console.warn('[MongoDB Atlas] deleteDocument local fallback:', err.message)
    }

    const docs = storage.get(DOCUMENTS_KEY, [])
    const filtered = docs.filter((d) => d.id !== id)
    storage.set(DOCUMENTS_KEY, filtered)
    return true
  },
}
