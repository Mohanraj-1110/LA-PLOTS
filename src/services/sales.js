import { api } from './api.js'

export function subscribeToSales(onChange, onError) {
  let isMounted = true

  const fetchSales = async () => {
    try {
      const sales = await api.get('/sales')
      if (isMounted) {
        onChange(Array.isArray(sales) ? sales : [])
      }
    } catch (err) {
      if (isMounted) {
        console.warn('[MongoDB Atlas] subscribeToSales notice:', err?.message)
        onChange([])
        if (onError) onError(err)
      }
    }
  }

  fetchSales()
  const intervalId = setInterval(fetchSales, 10000)

  return () => {
    isMounted = false
    clearInterval(intervalId)
  }
}

export async function getSale(saleId) {
  if (!saleId) return null
  try {
    return await api.get(`/sales/${saleId}`)
  } catch {
    return null
  }
}

export async function createSale(input) {
  const saleAmount = Number(input.saleAmount) || 0
  const cost = Number(input.cost) || 0
  const profit = saleAmount - cost
  const saleData = {
    ...input,
    saleAmount,
    cost,
    profit,
    saleDate: input.saleDate || new Date().toISOString(),
    createdAt: new Date().toISOString(),
  }
  return api.post('/sales', saleData)
}

export async function updateSale(saleId, input) {
  const saleAmount = Number(input.saleAmount) || 0
  const cost = Number(input.cost) || 0
  const profit = saleAmount - cost
  return api.put(`/sales/${saleId}`, {
    ...input,
    saleAmount,
    cost,
    profit,
    updatedAt: new Date().toISOString(),
  })
}

export async function deleteSale(saleId) {
  return api.delete(`/sales/${saleId}`)
}
