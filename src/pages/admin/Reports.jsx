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
import { Download, FileSpreadsheet, FileText, Printer, TrendingUp, Users } from 'lucide-react'
import { jsPDF } from 'jspdf'
import * as XLSX from 'xlsx'
import { PageHeader } from '../../components/common/PageHeader'
import { StatCard } from '../../components/common/StatCard'
import { EmptyState } from '../../components/common/EmptyState'
import {
  reportDate,
  subscribeToReports,
  withinRange,
} from '../../services/reports'

const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

function number(value) {
  return Number(value) || 0
}

function formatDate(value) {
  const date = reportDate(value)
  return date ? date.toLocaleDateString('en-IN') : '—'
}

function buildReport(data, from, to) {
  const salesRows = data.sales.filter((row) => withinRange(row, from, to))
  const scopedCustomers = data.customers.filter((row) => withinRange(row, from, to))
  const scopedAppointments = data.appointments.filter((row) => withinRange(row, from, to))
  const sales = salesRows.reduce((sum, row) => sum + number(row.saleAmount), 0)
  const profit = salesRows.reduce((sum, row) => sum + number(row.profit), 0)
  const converted = scopedCustomers.filter(
    (row) => String(row.status).toLowerCase() === 'converted'
  ).length

  const agents = Object.values(
    salesRows.reduce((result, row) => {
      const agent = String(row.agentName || row.agentId || 'Unassigned')
      result[agent] = result[agent] || { agent, sales: 0, profit: 0 }
      result[agent].sales += number(row.saleAmount)
      result[agent].profit += number(row.profit)
      return result
    }, {})
  )

  const now = new Date()
  const chart = Array.from({ length: 6 }, (_, index) => {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1)
    const rows = salesRows.filter((row) => {
      const date = reportDate(row.saleDate)
      return (
        date?.getFullYear() === monthDate.getFullYear() &&
        date.getMonth() === monthDate.getMonth()
      )
    })
    return {
      month: monthDate.toLocaleString('en-IN', { month: 'short' }),
      sales: rows.reduce((sum, row) => sum + number(row.saleAmount), 0),
      profit: rows.reduce((sum, row) => sum + number(row.profit), 0),
    }
  })

  return {
    salesRows,
    sales,
    profit,
    plots: data.plots.length,
    available: data.plots.filter((row) => row.status === 'available').length,
    sold: data.plots.filter((row) => row.status === 'sold').length,
    customers: scopedCustomers.length,
    appointments: scopedAppointments.length,
    converted,
    conversion: scopedCustomers.length
      ? Math.round((converted / scopedCustomers.length) * 100)
      : 0,
    agents,
    chart,
    rows: salesRows.map((row) => ({
      Date: formatDate(row.saleDate),
      Project: String(row.projectId || ''),
      Plot: String(row.plotNumber || row.plotId || ''),
      Customer: String(row.customerName || row.customerId || ''),
      Amount: number(row.saleAmount),
      Cost: number(row.cost),
      Profit: number(row.profit),
      Agent: String(row.agentName || row.agentId || 'Unassigned'),
    })),
  }
}

function downloadCsv(rows) {
  const columns = ['Date', 'Project', 'Plot', 'Customer', 'Amount', 'Cost', 'Profit', 'Agent']
  const escape = (value) => `"${String(value).replaceAll('"', '""')}"`
  const content = [
    columns.join(','),
    ...rows.map((row) => columns.map((col) => escape(row[col] ?? '')).join(',')),
  ].join('\n')
  const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = 'la-plots-report.csv'
  link.click()
  URL.revokeObjectURL(url)
}

export function Reports() {
  const [data, setData] = useState(null)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [error, setError] = useState(null)

  useEffect(() => {
    const unsub = subscribeToReports(
      (d) => setData(d),
      () => setError('Reports could not be loaded.')
    )
    return () => unsub()
  }, [])

  const report = useMemo(() => (data ? buildReport(data, from, to) : null), [data, from, to])

  function exportCsv() {
    if (report) downloadCsv(report.rows)
  }

  function exportExcel() {
    if (report) {
      const book = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(book, XLSX.utils.json_to_sheet(report.rows), 'Report')
      XLSX.writeFile(book, 'la-plots-report.xlsx')
    }
  }

  function exportPdf() {
    if (report) {
      const pdf = new jsPDF()
      pdf.setFontSize(16)
      pdf.text('LA PLOTS — Business Analytics Report', 14, 18)
      pdf.setFontSize(10)
      pdf.text(`Period: ${from || 'All time'} to ${to || 'Today'}`, 14, 26)
      pdf.text(
        `Sales: ${currency.format(report.sales)}   Profit: ${currency.format(report.profit)}`,
        14,
        34
      )
      pdf.text(
        `Total Plots: ${report.plots}   Customers: ${report.customers}   Visits: ${report.appointments}`,
        14,
        42
      )
      pdf.text('Monthly Revenue Trend:', 14, 54)
      report.chart.forEach((row, index) => {
        pdf.text(
          `${row.month}: Sales ${currency.format(row.sales)} | Profit ${currency.format(row.profit)}`,
          14,
          62 + index * 7
        )
      })
      pdf.save('la-plots-report.pdf')
    }
  }

  if (!report) {
    return (
      <>
        <PageHeader title="Reports & Analytics" description="Loading report metrics..." />
        {error && (
          <div className="mb-4 rounded-2xl bg-red-50 p-4 text-sm text-red-700 border border-red-200 shadow-card">
            {error}
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-surface-200 shadow-card" />
          ))}
        </div>
      </>
    )
  }

  return (
    <div className="print:p-0">
      <PageHeader
        title="Reports & Analytics"
        description="Comprehensive exports of inventory, sales, customer conversion, and team performance."
        action={
          <div className="flex flex-wrap gap-2 print:hidden">
            <button
              type="button"
              onClick={exportPdf}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 px-4 text-xs font-bold text-white hover:from-red-600 hover:to-red-700 transition shadow-card hover:shadow-elevated"
            >
              <FileText size={15} /> PDF
            </button>
            <button
              type="button"
              onClick={exportExcel}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 text-xs font-bold text-white hover:from-emerald-600 hover:to-emerald-700 transition shadow-card hover:shadow-elevated"
            >
              <FileSpreadsheet size={15} /> Excel
            </button>
            <button
              type="button"
              onClick={exportCsv}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-4 text-xs font-bold text-white hover:from-blue-600 hover:to-blue-700 transition shadow-card hover:shadow-elevated"
            >
              <Download size={15} /> CSV
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-4 text-xs font-bold text-white hover:from-primary-700 hover:to-primary-600 transition shadow-card hover:shadow-elevated"
            >
              <Printer size={15} /> Print
            </button>
          </div>
        }
      />

      {/* Date Filter */}
      <div className="mb-6 flex flex-wrap items-end gap-3 rounded-2xl border border-surface-200 bg-white p-4 print:hidden shadow-card">
        <label className="text-xs font-bold uppercase tracking-wider text-surface-500">
          From
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="input-modern mt-1 block min-h-10 w-full"
          />
        </label>
        <label className="text-xs font-bold uppercase tracking-wider text-surface-500">
          To
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="input-modern mt-1 block min-h-10 w-full"
          />
        </label>
        {(from || to) && (
          <button
            type="button"
            onClick={() => {
              setFrom('')
              setTo('')
            }}
            className="min-h-10 rounded-xl px-3 text-xs font-bold text-primary-600 hover:text-primary-700 hover:underline transition"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* KPI Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Sales"
          value={currency.format(report.sales)}
          detail={`${report.salesRows.length} transactions`}
          icon={TrendingUp}
        />
        <StatCard
          label="Net Profit"
          value={currency.format(report.profit)}
          detail="Revenue minus costs"
          icon={TrendingUp}
        />
        <StatCard
          label="Plots In Inventory"
          value={String(report.plots)}
          detail={`${report.available} available · ${report.sold} sold`}
          icon={FileText}
        />
        <StatCard
          label="Lead Conversion"
          value={`${report.conversion}%`}
          detail={`${report.converted} converted buyers`}
          icon={Users}
        />
      </div>

      {/* Monthly Chart */}
      <section className="mt-6 card-modern p-6">
        <h2 className="font-display font-bold text-surface-900">Revenue & Profit Trajectory (Last 6 Months)</h2>
        <div className="mt-6 h-72">
          {report.chart.some((i) => i.sales || i.profit) ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={report.chart}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(val) => `₹${Number(val) / 100000}L`} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(val) => currency.format(Number(val))} />
                <Legend />
                <Bar dataKey="sales" name="Sales" fill="#059669" radius={[6, 6, 0, 0]} />
                <Bar dataKey="profit" name="Profit" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="grid h-full place-items-center rounded-2xl bg-surface-50 text-sm text-surface-500">
              No sales data recorded in this period.
            </div>
          )}
        </div>
      </section>

      {/* Performance & Activity Tables */}
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="card-modern p-6">
          <h2 className="font-display font-bold text-surface-900">Agent Performance</h2>
          {report.agents.length > 0 ? (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-surface-100 text-xs uppercase text-surface-400">
                  <tr>
                    <th className="py-3 font-semibold">Agent</th>
                    <th className="py-3 font-semibold">Sales</th>
                    <th className="py-3 font-semibold">Profit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {report.agents.map((ag, i) => (
                    <tr key={i} className="hover:bg-surface-50 transition-colors">
                      <td className="py-3 font-medium text-surface-900">{ag.agent}</td>
                      <td className="py-3 text-surface-700">{currency.format(ag.sales)}</td>
                      <td className="py-3 font-bold text-primary-700">{currency.format(ag.profit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-4 text-sm text-surface-500">No agent transactions recorded.</p>
          )}
        </section>

        <section className="card-modern p-6">
          <h2 className="font-display font-bold text-surface-900">Business Activity Metrics</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-surface-100 text-xs uppercase text-surface-400">
                <tr>
                  <th className="py-3 font-semibold">Metric</th>
                  <th className="py-3 text-right font-semibold">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                <tr className="hover:bg-surface-50 transition-colors">
                  <td className="py-3 text-surface-700">Customers in Period</td>
                  <td className="py-3 text-right font-bold text-surface-900">{report.customers}</td>
                </tr>
                <tr className="hover:bg-surface-50 transition-colors">
                  <td className="py-3 text-surface-700">Site Visits & Appointments</td>
                  <td className="py-3 text-right font-bold text-surface-900">{report.appointments}</td>
                </tr>
                <tr className="hover:bg-surface-50 transition-colors">
                  <td className="py-3 text-surface-700">Converted Leads</td>
                  <td className="py-3 text-right font-bold text-primary-700">{report.converted}</td>
                </tr>
                <tr className="hover:bg-surface-50 transition-colors">
                  <td className="py-3 text-surface-700">Available Plots Ready for Sale</td>
                  <td className="py-3 text-right font-bold text-surface-900">{report.available}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}
export default Reports
