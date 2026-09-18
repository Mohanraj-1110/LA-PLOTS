import { api } from './api.js'

export const appointmentTypes = ['site visit', 'meeting', 'call', 'registration', 'payment']

export function subscribeToAppointments(onChange, onError) {
  let isMounted = true

  const fetchAppts = async () => {
    try {
      const appts = await api.get('/appointments')
      if (isMounted) {
        onChange(Array.isArray(appts) ? appts : [])
      }
    } catch (err) {
      if (isMounted) {
        console.warn('[MongoDB Atlas] subscribeToAppointments notice:', err?.message)
        onChange([])
        if (onError) onError(err)
      }
    }
  }

  fetchAppts()
  const intervalId = setInterval(fetchAppts, 10000)

  return () => {
    isMounted = false
    clearInterval(intervalId)
  }
}

export function subscribeToCustomerAppointments(uid, onChange, onError) {
  let isMounted = true

  const fetchCustomerAppts = async () => {
    try {
      const appts = await api.get(`/appointments?customerId=${uid}`)
      if (isMounted) {
        onChange(Array.isArray(appts) ? appts : [])
      }
    } catch (err) {
      if (isMounted) {
        console.warn('[MongoDB Atlas] subscribeToCustomerAppointments fallback:', err?.message)
        onChange([])
        if (onError) onError(err)
      }
    }
  }

  fetchCustomerAppts()
  const intervalId = setInterval(fetchCustomerAppts, 10000)

  return () => {
    isMounted = false
    clearInterval(intervalId)
  }
}

export async function getAppointment(appointmentId) {
  if (!appointmentId) return null
  try {
    return await api.get(`/appointments/${appointmentId}`)
  } catch {
    return null
  }
}

export async function createAppointment(input) {
  const apptData = {
    ...input,
    createdAt: new Date().toISOString(),
  }
  return api.post('/appointments', apptData)
}

export async function updateAppointment(appointmentId, input) {
  return api.put(`/appointments/${appointmentId}`, input)
}

export async function deleteAppointment(appointmentId) {
  return api.delete(`/appointments/${appointmentId}`)
}
