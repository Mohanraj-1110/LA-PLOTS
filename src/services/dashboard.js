import { api } from './api.js'

function emptyDashboardData() {
  const now = new Date()
  const months = Array.from({ length: 12 }, (_, month) => ({
    month: new Date(now.getFullYear(), month, 1).toLocaleString('en-IN', { month: 'short' }),
    sales: 0,
    profit: 0,
  }))

  return {
    totalPlots: 0,
    availablePlots: 0,
    reservedPlots: 0,
    soldPlots: 0,
    customers: 0,
    appointmentsToday: 0,
    totalSales: 0,
    netProfit: 0,
    salesByMonth: months,
    todayAppointments: [],
  }
}

export function subscribeToDashboardData(callback, onError) {
  let isMounted = true

  const fetchDashboard = async () => {
    try {
      const data = await api.get('/dashboard')
      if (isMounted && data) {
        callback(data)
      }
    } catch (err) {
      if (isMounted) {
        console.warn('[MongoDB Atlas] subscribeToDashboardData fallback:', err?.message)
        callback(emptyDashboardData())
        if (onError) onError(err)
      }
    }
  }

  fetchDashboard()
  const intervalId = setInterval(fetchDashboard, 10000)

  return () => {
    isMounted = false
    clearInterval(intervalId)
  }
}
