import { collection, onSnapshot } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../firebase/config'

function emptyDashboardData() {
  return {
    totalPlots: 0,
    availablePlots: 0,
    reservedPlots: 0,
    soldPlots: 0,
    customers: 0,
    appointmentsToday: 0,
    totalSales: 0,
    netProfit: 0,
    salesByMonth: [],
    todayAppointments: [],
  }
}

function asDate(value) {
  if (value && typeof value === 'object' && 'toDate' in value) return value.toDate()
  if (typeof value === 'string' || typeof value === 'number') return new Date(value)
  return null
}

function formatTime(value) {
  if (typeof value === 'string' && value) return value
  const date = asDate(value)
  return date ? date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : 'Time not set'
}

function buildDashboardData(plots, customers, appointments, sales) {
  const now = new Date()
  const months = Array.from({ length: 12 }, (_, month) => ({
    month: new Date(now.getFullYear(), month, 1).toLocaleString('en-IN', { month: 'short' }),
    sales: 0,
    profit: 0,
  }))

  let totalSales = 0
  let netProfit = 0
  sales.forEach((sale) => {
    const saleAmount = Number(sale.saleAmount) || 0
    const profit = Number(sale.profit) || 0
    totalSales += saleAmount
    netProfit += profit
    const date = asDate(sale.saleDate)
    if (date && date.getFullYear() === now.getFullYear()) {
      months[date.getMonth()].sales += saleAmount
      months[date.getMonth()].profit += profit
    }
  })

  const todayAppointments = appointments
    .filter((appointment) => {
      const date = asDate(appointment.date)
      return Boolean(
        date &&
          date.getFullYear() === now.getFullYear() &&
          date.getMonth() === now.getMonth() &&
          date.getDate() === now.getDate()
      )
    })
    .map((appointment) => ({
      id: appointment.id,
      type: String(appointment.type || 'Appointment'),
      time: formatTime(appointment.time || appointment.date),
      notes: String(appointment.notes || 'No notes added'),
    }))

  return {
    totalPlots: plots.length,
    availablePlots: plots.filter((plot) => plot.status === 'available').length,
    reservedPlots: plots.filter((plot) => plot.status === 'reserved').length,
    soldPlots: plots.filter((plot) => plot.status === 'sold').length,
    customers,
    appointmentsToday: todayAppointments.length,
    totalSales,
    netProfit,
    salesByMonth: months,
    todayAppointments,
  }
}

export function subscribeToDashboardData(callback, onError) {
  if (!isFirebaseConfigured || !db) {
    callback(emptyDashboardData())
    return () => undefined
  }

  let plots = null
  let customers = null
  let appointments = null
  let sales = null

  function emitIfReady() {
    if (plots && customers !== null && appointments && sales) {
      callback(buildDashboardData(plots, customers, appointments, sales))
    }
  }

  const unsubscribe = [
    onSnapshot(collection(db, 'plots'), (snapshot) => {
      plots = snapshot.docs.map((item) => item.data())
      emitIfReady()
    }, onError),
    onSnapshot(collection(db, 'customers'), (snapshot) => {
      customers = snapshot.size
      emitIfReady()
    }, onError),
    onSnapshot(collection(db, 'appointments'), (snapshot) => {
      appointments = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
      emitIfReady()
    }, onError),
    onSnapshot(collection(db, 'sales'), (snapshot) => {
      sales = snapshot.docs.map((item) => item.data())
      emitIfReady()
    }, onError),
  ]

  return () => unsubscribe.forEach((unsub) => unsub())
}
