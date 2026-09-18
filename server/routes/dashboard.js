import { Router } from 'express'
import { Plot } from '../models/Plot.js'
import { Customer } from '../models/Customer.js'
import { Appointment } from '../models/Appointment.js'
import { Sale } from '../models/Sale.js'
import { isDBConnected } from '../db.js'

export const dashboardRouter = Router()

dashboardRouter.get('/', async (req, res) => {
  try {
    const now = new Date()
    const todayDateStr = now.toISOString().slice(0, 10)

    const months = Array.from({ length: 12 }, (_, month) => ({
      month: new Date(now.getFullYear(), month, 1).toLocaleString('en-IN', { month: 'short' }),
      sales: 0,
      profit: 0,
    }))

    if (isDBConnected()) {
      const [plots, customerCount, appointments, sales] = await Promise.all([
        Plot.find({}),
        Customer.countDocuments({}),
        Appointment.find({}),
        Sale.find({}),
      ])

      const totalPlots = plots.length
      const availablePlots = plots.filter((p) => p.status === 'available').length
      const reservedPlots = plots.filter((p) => p.status === 'reserved').length
      const soldPlots = plots.filter((p) => p.status === 'sold').length

      let totalSales = 0
      let netProfit = 0
      sales.forEach((s) => {
        const amt = Number(s.saleAmount) || 0
        const prof = Number(s.profit) || 0
        totalSales += amt
        netProfit += prof
        const d = s.saleDate ? new Date(s.saleDate) : null
        if (d && d.getFullYear() === now.getFullYear()) {
          months[d.getMonth()].sales += amt
          months[d.getMonth()].profit += prof
        }
      })

      const todayAppointments = appointments.filter((a) => a.date?.startsWith(todayDateStr))

      return res.json({
        totalPlots,
        availablePlots,
        reservedPlots,
        soldPlots,
        customers: customerCount,
        appointmentsToday: todayAppointments.length,
        totalSales,
        netProfit,
        salesByMonth: months,
        todayAppointments: todayAppointments.map((a) => a.toJSON()),
      })
    }

    // Fallback baseline metrics
    return res.json({
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
    })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})
