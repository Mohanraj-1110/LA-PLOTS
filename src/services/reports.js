import { api } from './api.js'

const emptyData = () => ({ plots: [], customers: [], appointments: [], sales: [] })

export function subscribeToReports(onChange, onError) {
  let isMounted = true

  const fetchAll = async () => {
    try {
      const [plots, customers, appointments, sales] = await Promise.all([
        api.get('/plots'),
        api.get('/customers'),
        api.get('/appointments'),
        api.get('/sales'),
      ])
      if (isMounted) {
        onChange({
          plots: Array.isArray(plots) ? plots : [],
          customers: Array.isArray(customers) ? customers : [],
          appointments: Array.isArray(appointments) ? appointments : [],
          sales: Array.isArray(sales) ? sales : [],
        })
      }
    } catch (err) {
      if (isMounted) {
        console.warn('[MongoDB Atlas] subscribeToReports fallback:', err?.message)
        onChange(emptyData())
        if (onError) onError(err)
      }
    }
  }

  fetchAll()
  const intervalId = setInterval(fetchAll, 15000)

  return () => {
    isMounted = false
    clearInterval(intervalId)
  }
}

export function reportDate(value) {
  if (value && typeof value === 'object' && 'toDate' in value) return value.toDate()
  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? null : date
  }
  return null
}

export function withinRange(row, from, to) {
  const date = reportDate(row.saleDate || row.createdAt || row.date)
  if (!date) return !from && !to
  return (
    (!from || date >= new Date(`${from}T00:00:00`)) &&
    (!to || date <= new Date(`${to}T23:59:59`))
  )
}
