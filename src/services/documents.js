import { api } from './api.js'

export const documentCategories = [
  'Land Documents',
  'Layout',
  'Sale Agreement',
  'Customer Documents',
  'Receipts',
  'Registration',
  'Other',
]

export function subscribeToDocuments(onChange, onError) {
  let isMounted = true

  const fetchDocs = async () => {
    try {
      const docs = await api.get('/documents')
      if (isMounted) {
        onChange(Array.isArray(docs) ? docs : [])
      }
    } catch (err) {
      if (isMounted) {
        console.warn('[MongoDB Atlas] subscribeToDocuments notice:', err?.message)
        onChange([])
        if (onError) onError(err)
      }
    }
  }

  fetchDocs()
  const intervalId = setInterval(fetchDocs, 10000)

  return () => {
    isMounted = false
    clearInterval(intervalId)
  }
}

export async function uploadDocument(file, metadata, onProgress) {
  if (file.size > 10 * 1024 * 1024) throw new Error('Documents must be 10 MB or smaller.')
  if (file.type !== 'application/pdf') throw new Error('Only PDF documents are supported.')

  // Read file as base64 data URL
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      onProgress?.(100)
      resolve(reader.result)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

  // Save document to MongoDB Atlas
  const document = await api.post('/documents', {
    ...metadata,
    name: metadata.name || file.name,
    fileUrl: dataUrl,
    fileSize: `${Math.round(file.size / 1024)} KB`,
    fileType: file.type,
    uploadedAt: new Date().toISOString(),
  })

  return document.id
}

export async function deleteDocument(document) {
  if (!document?.id) return
  return api.delete(`/documents/${document.id}`)
}
