import { api } from './api.js'

/**
 * Maps raw plot data to a standardized plot object
 */
export function formatPlot(id, data = {}) {
  let geo = typeof data.geo === 'object' && data.geo !== null && data.geo.lat ? data.geo : null
  if (!geo && data.coordinates && typeof data.coordinates === 'string') {
    const parts = data.coordinates.split(',')
    if (parts.length >= 2) {
      geo = {
        lat: parseFloat(parts[0]) || 13.0827,
        lng: parseFloat(parts[1]) || 80.2707,
      }
    }
  }
  if (!geo) {
    geo = { lat: 13.0827, lng: 80.2707 }
  }

  return {
    id: String(id || data.id || `plot-${Date.now()}`),
    projectId: String(data.projectId || 'proj-01'),
    projectName: String(data.projectName || data.projectId || 'Greenfield Meadows'),
    plotNumber: String(data.plotNumber || ''),
    surveyNumber: String(data.surveyNumber || ''),
    areaSqft: Number(data.areaSqft || 0),
    ratePerSqft: Number(data.ratePerSqft || 0),
    totalAmount: Number(
      data.totalAmount || (data.areaSqft && data.ratePerSqft ? data.areaSqft * data.ratePerSqft : 0)
    ),
    status: data.status || 'available',
    facing: String(data.facing || 'East'),
    roadWidth: Number(data.roadWidth || 30),
    photos:
      Array.isArray(data.photos) && data.photos.length > 0
        ? data.photos.filter((item) => typeof item === 'string')
        : ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=80'],
    documents: Array.isArray(data.documents) ? data.documents.filter((item) => typeof item === 'string') : [],
    geo,
    coordinates: data.coordinates || `${geo.lat}° N, ${geo.lng}° E`,
    location: typeof data.location === 'string' ? data.location : 'Bengaluru',
    description: typeof data.description === 'string' ? data.description : '',
    amenities: Array.isArray(data.amenities) ? data.amenities : ['Gated Community', 'Clear Title', 'Tar Road'],
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || null,
  }
}

// Admin: subscribe / fetch all plots
export function subscribeToPlots(onChange, onError) {
  let isMounted = true

  const fetchPlots = async () => {
    try {
      const plots = await api.get('/plots')
      if (isMounted) {
        if (Array.isArray(plots)) {
          onChange(plots.map((p) => formatPlot(p.id, p)))
        } else {
          onChange([])
        }
      }
    } catch (err) {
      if (isMounted) {
        console.warn('[MongoDB Atlas] subscribeToPlots notice:', err?.message)
        onChange([])
        if (onError) onError(err)
      }
    }
  }

  fetchPlots()
  // Poll periodically for updates in place of Firestore websocket
  const intervalId = setInterval(fetchPlots, 10000)

  return () => {
    isMounted = false
    clearInterval(intervalId)
  }
}

// Public: subscribe to available & reserved plots
export function subscribeToPublicPlots(onChange, onError) {
  let isMounted = true

  const fetchPublic = async () => {
    try {
      const plots = await api.get('/plots')
      if (isMounted) {
        if (Array.isArray(plots)) {
          const filtered = plots
            .filter((p) => p.status === 'available' || p.status === 'reserved')
            .map((p) => formatPlot(p.id, p))
          onChange(filtered)
        } else {
          onChange([])
        }
      }
    } catch (err) {
      if (isMounted) {
        console.warn('[MongoDB Atlas] subscribeToPublicPlots notice:', err?.message)
        onChange([])
        if (onError) onError(err)
      }
    }
  }

  fetchPublic()
  const intervalId = setInterval(fetchPublic, 10000)

  return () => {
    isMounted = false
    clearInterval(intervalId)
  }
}

// Get single plot
export async function getPlot(plotId) {
  if (!plotId) return null
  try {
    const data = await api.get(`/plots/${plotId}`)
    return formatPlot(data.id, data)
  } catch (err) {
    console.warn('[MongoDB Atlas] getPlot note:', err?.message)
    return null
  }
}

export const getPublicPlot = getPlot

// Create plot
export async function createPlot(input) {
  const { areaSqft, ratePerSqft, ...rest } = input
  const totalAmount = Number(areaSqft) * Number(ratePerSqft)
  const plotData = {
    ...rest,
    areaSqft: Number(areaSqft),
    ratePerSqft: Number(ratePerSqft),
    totalAmount,
    createdAt: new Date().toISOString(),
  }

  const saved = await api.post('/plots', plotData)
  return formatPlot(saved.id, saved)
}

// Update plot
export async function updatePlot(plotId, input) {
  const { areaSqft, ratePerSqft, ...rest } = input
  const totalAmount =
    areaSqft !== undefined && ratePerSqft !== undefined
      ? Number(areaSqft) * Number(ratePerSqft)
      : undefined

  const payload = {
    ...rest,
    ...(areaSqft !== undefined ? { areaSqft: Number(areaSqft) } : {}),
    ...(ratePerSqft !== undefined ? { ratePerSqft: Number(ratePerSqft) } : {}),
    ...(totalAmount !== undefined ? { totalAmount } : {}),
    updatedAt: new Date().toISOString(),
  }

  const updated = await api.put(`/plots/${plotId}`, payload)
  return formatPlot(updated.id, updated)
}

// Delete plot
export async function deletePlot(plotId) {
  return api.delete(`/plots/${plotId}`)
}

/**
 * Upload plot photos/documents using client-side data URLs and /api/upload (replaces Firebase Storage)
 */
export async function uploadPlotFiles(plotId, files, kind = 'photos') {
  if (!files || !files.length) return []
  const maxBytes = 10 * 1024 * 1024
  const allowed = kind === 'photos' ? ['image/jpeg', 'image/png', 'image/webp'] : ['application/pdf']
  if (files.some((file) => file.size > maxBytes)) throw new Error('Each file must be 10 MB or smaller.')
  if (files.some((file) => !allowed.includes(file.type))) {
    throw new Error(kind === 'photos' ? 'Photos must be JPG, PNG, or WebP files.' : 'Documents must be PDF files.')
  }

  return Promise.all(
    files.map(
      (file) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = async () => {
            try {
              const res = await api.post('/upload', {
                name: file.name,
                data: reader.result,
                type: file.type,
              })
              resolve(res.url || reader.result)
            } catch {
              resolve(reader.result)
            }
          }
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
    )
  )
}

export async function appendPlotFiles(plotId, kind, urls) {
  if (!urls || !urls.length) return
  const plot = await getPlot(plotId)
  if (!plot) throw new Error('Plot not found.')
  const updatedList = [...(plot[kind] || []), ...urls]
  await updatePlot(plotId, { [kind]: updatedList })
}
