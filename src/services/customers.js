import { api } from './api.js'

export function subscribeToCustomers(onChange, onError) {
  let isMounted = true

  const fetchCustomers = async () => {
    try {
      const customers = await api.get('/customers')
      if (isMounted) {
        onChange(Array.isArray(customers) ? customers : [])
      }
    } catch (err) {
      if (isMounted) {
        console.warn('[MongoDB Atlas] subscribeToCustomers notice:', err?.message)
        onChange([])
        if (onError) onError(err)
      }
    }
  }

  fetchCustomers()
  const intervalId = setInterval(fetchCustomers, 10000)

  return () => {
    isMounted = false
    clearInterval(intervalId)
  }
}

export async function getCustomer(customerId) {
  if (!customerId) return null
  try {
    return await api.get(`/customers/${customerId}`)
  } catch {
    return null
  }
}

export async function createCustomer(input) {
  const customerData = {
    ...input,
    budget: Number(input.budget) || 0,
    createdAt: new Date().toISOString(),
  }
  return api.post('/customers', customerData)
}

export async function updateCustomer(customerId, input) {
  return api.put(`/customers/${customerId}`, input)
}

export async function deleteCustomer(customerId) {
  return api.delete(`/customers/${customerId}`)
}
