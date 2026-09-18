import { api } from './api.js'

export function subscribeToEnquiries(onChange, onError) {
  let isMounted = true

  const fetchEnquiries = async () => {
    try {
      const enqs = await api.get('/enquiries')
      if (isMounted) {
        onChange(Array.isArray(enqs) ? enqs : [])
      }
    } catch (err) {
      if (isMounted) {
        console.warn('[MongoDB Atlas] subscribeToEnquiries notice:', err?.message)
        onChange([])
        if (onError) onError(err)
      }
    }
  }

  fetchEnquiries()
  const intervalId = setInterval(fetchEnquiries, 10000)

  return () => {
    isMounted = false
    clearInterval(intervalId)
  }
}

export async function createEnquiry(data) {
  const enqData = {
    ...data,
    status: data.status || 'New',
    createdAt: new Date().toISOString(),
  }
  return api.post('/enquiries', enqData)
}

export async function updateEnquiry(id, values) {
  return api.put(`/enquiries/${id}`, values)
}

export async function convertEnquiry(item, agentId) {
  const customer = {
    name: item.customerName,
    phone: item.phone,
    email: '',
    address: '',
    budget: item.budget || 0,
    interestedProjectId: item.projectId || '',
    interestedPlotId: '',
    status: 'Converted',
    nextFollowupDate: null,
    notes: item.requirement || '',
    assignedAgentId: agentId,
    createdAt: new Date().toISOString(),
  }
  await api.post('/customers', customer)
  await updateEnquiry(item.id, { status: 'Converted', assignedAgentId: agentId })
}
