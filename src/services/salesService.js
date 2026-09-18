import { api } from './api.js'
import { storage } from './storage.js'
import { calculateNetProfit, calculateProfitMargin } from '../utils/calculateProfit.js'

const SALES_KEY = 'la_plots_sales_v1'

export const salesService = {
  async getAllSales() {
    try {
      const sales = await api.get('/sales')
      if (Array.isArray(sales)) {
        storage.set(SALES_KEY, sales)
        return sales
      }
      return storage.get(SALES_KEY, [])
    } catch (err) {
      console.warn('[MongoDB Atlas] getAllSales fallback:', err.message)
      return storage.get(SALES_KEY, [])
    }
  },

  async getFinancialTrends() {
    const sales = await this.getAllSales()
    const now = new Date()
    const months = Array.from({ length: 6 }, (_, idx) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - idx), 1)
      return {
        month: d.toLocaleString('en-IN', { month: 'short', year: '2-digit' }),
        monthIndex: d.getMonth(),
        year: d.getFullYear(),
        sales: 0,
        cost: 0,
        profit: 0,
        plotsSold: 0,
      }
    })

    sales.forEach((s) => {
      const d = s.saleDate ? new Date(s.saleDate) : null
      if (d) {
        const target = months.find((m) => m.monthIndex === d.getMonth() && m.year === d.getFullYear())
        if (target) {
          const amt = Number(s.saleAmount) || 0
          const c = Number(s.cost || s.costAmount) || 0
          const p = Number(s.profit || s.netProfit) || (amt - c)
          target.sales += amt
          target.cost += c
          target.profit += p
          target.plotsSold += 1
        }
      }
    })

    return months.map(({ month, sales, cost, profit, plotsSold }) => ({
      month,
      sales,
      cost,
      profit,
      plotsSold,
    }))
  },

  async getProjectDistribution() {
    const sales = await this.getAllSales()
    if (!sales.length) return []
    const map = {}
    sales.forEach((s) => {
      const name = s.projectName || 'General'
      if (!map[name]) map[name] = { name, value: 0, count: 0 }
      map[name].value += Number(s.saleAmount) || 0
      map[name].count += 1
    })
    const colors = ['#16A34A', '#059669', '#0D9488', '#2563EB', '#7C3AED']
    return Object.values(map).map((p, idx) => ({ ...p, color: colors[idx % colors.length] }))
  },

  async getSalesMetrics() {
    const sales = await this.getAllSales()
    const totalRevenue = sales.reduce((acc, curr) => acc + (Number(curr.saleAmount) || 0), 0)
    const totalCost = sales.reduce((acc, curr) => acc + (Number(curr.cost) || 0), 0)
    const totalProfit = calculateNetProfit(totalRevenue, totalCost)
    const profitMargin = calculateProfitMargin(totalRevenue, totalProfit)

    return {
      totalRevenue,
      totalCost,
      totalProfit,
      profitMargin,
      totalTransactions: sales.length,
    }
  },

  async createSale(data) {
    const saleAmount = parseFloat(data.saleAmount) || 0
    const cost = parseFloat(data.cost) || 0
    const profit = calculateNetProfit(saleAmount, cost)

    const newSale = {
      id: data.id || `sale-${Date.now()}`,
      plotId: data.plotId,
      plotNumber: data.plotNumber || '',
      customerId: data.customerId || '',
      customerName: data.customerName || '',
      saleAmount,
      cost,
      profit,
      saleDate: data.saleDate || new Date().toISOString(),
      paymentStatus: data.paymentStatus || 'completed',
      agentId: data.agentId || '',
      createdAt: new Date().toISOString(),
    }

    try {
      const saved = await api.post('/sales', newSale)
      const current = storage.get(SALES_KEY, [])
      storage.set(SALES_KEY, [saved, ...current])
      return saved
    } catch (err) {
      console.warn('[MongoDB Atlas] createSale local fallback:', err.message)
      const current = storage.get(SALES_KEY, [])
      storage.set(SALES_KEY, [newSale, ...current])
      return newSale
    }
  },
}
