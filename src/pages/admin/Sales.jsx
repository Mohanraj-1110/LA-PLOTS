import React, { useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { CircleDollarSign, TrendingDown, TrendingUp } from 'lucide-react'
import { PageHeader } from '../../components/common/PageHeader'
import { StatCard } from '../../components/common/StatCard'
import { EmptyState } from '../../components/common/EmptyState'
import { subscribeToSales } from '../../services/sales'

const periods = ['This Month', 'This Quarter', 'This Year', 'Custom']
const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

function inPeriod(sale, period, from, to) {
  const date = sale.saleDate?.toDate ? sale.saleDate.toDate() : null
  if (!date) return false
  const now = new Date()
  if (period === 'Custom') {
    return (
      (!from || date >= new Date(`${from}T00:00:00`)) &&
      (!to || date <= new Date(`${to}T23:59:59`))
    )
  }
  if (period === 'This Year') return date.getFullYear() === now.getFullYear()
  if (period === 'This Quarter') {
    return (
      date.getFullYear() === now.getFullYear() &&
      Math.floor(date.getMonth() / 3) === Math.floor(now.getMonth() / 3)
    )
  }
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()
}

function buildChart(sales, period) {
  const now = new Date()
  const count = period === 'This Year' ? 12 : period === 'This Quarter' ? 3 : 1
  const start =
    period === 'This Year'
      ? 0
      : period === 'This Quarter'
      ? Math.floor(now.getMonth() / 3) * 3
      : now.getMonth()

  return Array.from({ length: count }, (_, index) => {
    const month = (start + index) % 12
    const year = now.getFullYear() + (start + index >= 12 ? 1 : 0)
    const rows = sales.filter((sale) => {
      const date = sale.saleDate?.toDate ? sale.saleDate.toDate() : null
      return date?.getFullYear() === year && date.getMonth() === month
    })
    return {
      month: new Date(year, month, 1).toLocaleString('en-IN', { month: 'short' }),
      sales: rows.reduce((sum, row) => sum + Number(row.saleAmount || 0), 0),
      profit: rows.reduce((sum, row) => sum + Number(row.profit || 0), 0),
    }
  })
}

export function Sales() {
  const [sales, setSales] = useState(null)
  const [period, setPeriod] = useState('This Month')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [error, setError] = useState(null)

  useEffect(() => {
    const unsub = subscribeToSales(
      (data) => setSales(data),
      () => setError('Sales could not be loaded.')
    )
    return () => unsub()
  }, [])

  const filtered = useMemo(
    () => (sales || []).filter((s) => inPeriod(s, period, from, to)),
    [sales, period, from, to]
  )

  const totalSales = filtered.reduce((sum, s) => sum + (Number(s.saleAmount) || 0), 0)
  const totalCost = filtered.reduce((sum, s) => sum + (Number(s.cost) || 0), 0)
  const netProfit = filtered.reduce((sum, s) => sum + (Number(s.profit) || 0), 0)
  const chartData = buildChart(filtered, period)

  if (error) {
    return (
      <>
        <PageHeader title="Sales & Profit" description="Track revenue, costs, and net profit." />
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {error}
        </div>
      </>
    )
  }

  return (
    <>
      <PageHeader
        title="Sales & Profit"
        description="Comprehensive accounting and profit margins on plot sales."
      />

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {periods.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setPeriod(item)}
            className={`min-h-10 rounded-xl px-4 text-xs font-bold uppercase tracking-wider transition ${
              period === item
                ? 'bg-green-100 text-green-800'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {item}
          </button>
        ))}
        {period === 'Custom' && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="min-h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs"
            />
            <span className="text-slate-400 text-xs">to</span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="min-h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs"
            />
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Sales (Revenue)"
          value={currency.format(totalSales)}
          detail={`${filtered.length} recorded sales`}
          icon={CircleDollarSign}
        />
        <StatCard
          label="Total Land Cost"
          value={currency.format(totalCost)}
          detail="Acquisition & development"
          icon={TrendingDown}
        />
        <StatCard
          label="Net Profit"
          value={currency.format(netProfit)}
          detail="Net surplus after costs"
          icon={TrendingUp}
        />
      </div>

      {/* Chart */}
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-bold text-slate-900">Revenue vs Profit Analysis</h2>
        <div className="mt-6 h-72">
          {chartData.some((item) => item.sales || item.profit) ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `₹${Number(value) / 100000}L`}
                />
                <Tooltip formatter={(value) => currency.format(Number(value))} />
                <Legend />
                <Bar dataKey="sales" name="Sales" fill="#16a34a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="profit" name="Profit" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="grid h-full place-items-center rounded-lg bg-slate-50 text-sm text-slate-500">
              No sales transactions in this selected period.
            </div>
          )}
        </div>
      </section>

      {/* Recent Sales Table */}
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-bold text-slate-900">Sales Transactions</h2>
        {filtered.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Project / Plot</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Sale Amount</th>
                  <th className="px-4 py-3">Cost</th>
                  <th className="px-4 py-3 font-bold text-green-800">Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      {sale.saleDate?.toDate?.().toLocaleDateString('en-IN') || 'Date pending'}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {sale.projectId || 'Project'}{' '}
                      <span className="block text-xs text-slate-400">
                        Plot #{sale.plotNumber || sale.plotId}
                      </span>
                    </td>
                    <td className="px-4 py-3">{sale.customerName || sale.customerId}</td>
                    <td className="px-4 py-3 font-semibold">{currency.format(sale.saleAmount)}</td>
                    <td className="px-4 py-3 text-slate-500">{currency.format(sale.cost)}</td>
                    <td className="px-4 py-3 font-bold text-green-700">
                      {currency.format(sale.profit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-4">
            <EmptyState
              title="No sales found"
              description="Completed sales agreements will appear here once registered."
            />
          </div>
        )}
      </section>
    </>
  )
}
export default Sales
