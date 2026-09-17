import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart3,
  CalendarDays,
  CircleDollarSign,
  FileText,
  Home,
  IndianRupee,
  Plus,
  Users,
} from 'lucide-react'
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
import { PageHeader } from '../../components/common/PageHeader'
import { StatCard } from '../../components/common/StatCard'
import { StatusBadge } from '../../components/common/StatusBadge'
import { EmptyState } from '../../components/common/EmptyState'
import { subscribeToDashboardData } from '../../services/dashboard'

const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

const iconGradients = [
  'from-primary-500 to-primary-600',
  'from-emerald-400 to-emerald-600',
  'from-accent-500 to-amber-600',
  'from-primary-600 to-primary-700',
  'from-blue-500 to-blue-600',
  'from-violet-500 to-violet-600',
  'from-green-400 to-primary-500',
  'from-accent-500 to-accent-600',
]

export function Dashboard() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true
    const unsubscribe = subscribeToDashboardData(
      (nextData) => {
        if (active) setData(nextData)
      },
      () => {
        if (active) setError('Dashboard data could not be loaded. Please check Firebase configuration.')
      }
    )
    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  if (error) {
    return (
      <>
        <PageHeader title="Admin Dashboard" description="Overview of business operations" />
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 shadow-card">
          {error}
        </div>
      </>
    )
  }

  if (!data) {
    return (
      <>
        <PageHeader title="Admin Dashboard" description="Loading real-time overview..." />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-white shadow-card" />
          ))}
        </div>
      </>
    )
  }

  const stats = [
    { label: 'Total Plots', value: data.totalPlots.toString(), detail: 'Total in catalog', icon: Home },
    { label: 'Available', value: data.availablePlots.toString(), detail: 'Ready for sale', icon: BarChart3 },
    { label: 'Reserved', value: data.reservedPlots.toString(), detail: 'Active customer holds', icon: FileText },
    { label: 'Sold', value: data.soldPlots.toString(), detail: 'Closed plot sales', icon: CircleDollarSign },
    { label: 'Customers', value: data.customers.toString(), detail: 'Registered leads & buyers', icon: Users },
    { label: 'Visits Today', value: data.appointmentsToday.toString(), detail: 'Scheduled today', icon: CalendarDays },
    { label: 'Total Revenue', value: currency.format(data.totalSales), detail: 'Gross recorded sales', icon: IndianRupee },
    { label: 'Net Profit', value: currency.format(data.netProfit), detail: 'Profit after land cost', icon: IndianRupee },
  ]

  return (
    <div className="page-enter">
      <PageHeader
        title="Admin Dashboard"
        description="Real-time monitoring of plots, customer inquiries, and sales revenue."
        action={
          <Link
            to="/admin/reports"
            className="btn-primary inline-flex min-h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold"
          >
            <BarChart3 size={16} />
            View Reports
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s, idx) => (
          <div
            key={s.label}
            className="card-modern group relative overflow-hidden p-5 transition-all duration-300 hover:shadow-elevated"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{s.label}</p>
                <p className="mt-2 text-2xl font-extrabold text-slate-900 font-display">{s.value}</p>
                <p className="mt-1 text-xs font-medium text-slate-400">{s.detail}</p>
              </div>
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${iconGradients[idx % iconGradients.length]} text-white shadow-glow`}>
                <s.icon size={22} />
              </div>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-primary-500/0 via-primary-500/20 to-primary-500/0 opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <section className="card-modern min-w-0 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900">Revenue & Profit Overview</h2>
              <p className="mt-1 text-sm text-slate-500">Monthly breakdown this calendar year</p>
            </div>
            <span className="rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 px-3 py-1.5 text-xs font-bold text-white shadow-glow">
              This Year
            </span>
          </div>
          <div className="mt-6 h-64">
            {data.salesByMonth.some((m) => m.sales || m.profit) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.salesByMonth} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `₹${Number(value) / 100000}L`}
                  />
                  <Tooltip formatter={(value) => currency.format(Number(value))} />
                  <Legend />
                  <Bar dataKey="sales" name="Sales" fill="#059669" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="profit" name="Profit" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="grid h-full place-items-center rounded-2xl bg-surface-50 text-sm text-slate-500">
                No closed sales recorded for this year yet.
              </div>
            )}
          </div>
        </section>

        <section className="card-modern p-6">
          <h2 className="font-display text-lg font-bold text-slate-900">Today&apos;s Site Visits & Tasks</h2>
          {data.todayAppointments.length ? (
            <div className="mt-4 space-y-3">
              {data.todayAppointments.map((app) => (
                <div
                  key={app.id}
                  className="group relative overflow-hidden rounded-xl border border-surface-100 bg-gradient-to-br from-white to-surface-50 p-4 shadow-card transition-all duration-200 hover:shadow-elevated"
                >
                  <div className="absolute inset-y-0 left-0 w-1 rounded-l-xl bg-gradient-to-b from-primary-500 to-primary-600" />
                  <div className="flex items-center justify-between pl-3">
                    <span className="font-display text-sm font-bold text-slate-900 capitalize">{app.type}</span>
                    <StatusBadge status="Today" />
                  </div>
                  <p className="mt-1 pl-3 text-xs font-semibold text-primary-600">Time: {app.time}</p>
                  <p className="mt-1 pl-3 text-xs text-slate-500">{app.notes}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4">
              <EmptyState
                title="Nothing scheduled today"
                description="Upcoming customer site visits and calls will appear here."
              />
            </div>
          )}
        </section>
      </div>

      <section className="card-modern mt-6 p-6">
        <h2 className="font-display text-lg font-bold text-slate-900">Quick Actions</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Link
            to="/admin/plots?action=new"
            className="card-modern group relative overflow-hidden p-4 transition-all duration-200 hover:shadow-elevated hover:border-primary-300"
          >
            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-primary-500 to-primary-600 scale-x-0 transition-transform group-hover:scale-x-100" />
            <div className="flex items-center gap-2 font-display font-bold text-slate-900 group-hover:text-primary-600 transition-colors">
              <Plus size={16} /> Add New Plot
            </div>
            <p className="mt-1 text-xs text-slate-500">Update inventory catalog with area & pricing</p>
          </Link>

          <Link
            to="/admin/customers?action=new"
            className="card-modern group relative overflow-hidden p-4 transition-all duration-200 hover:shadow-elevated hover:border-primary-300"
          >
            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-primary-500 to-primary-600 scale-x-0 transition-transform group-hover:scale-x-100" />
            <div className="flex items-center gap-2 font-display font-bold text-slate-900 group-hover:text-primary-600 transition-colors">
              <Plus size={16} /> Add Customer Lead
            </div>
            <p className="mt-1 text-xs text-slate-500">Capture buyer requirement and budget</p>
          </Link>

          <Link
            to="/admin/appointments?action=new"
            className="card-modern group relative overflow-hidden p-4 transition-all duration-200 hover:shadow-elevated hover:border-primary-300"
          >
            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-primary-500 to-primary-600 scale-x-0 transition-transform group-hover:scale-x-100" />
            <div className="flex items-center gap-2 font-display font-bold text-slate-900 group-hover:text-primary-600 transition-colors">
              <Plus size={16} /> Schedule Visit
            </div>
            <p className="mt-1 text-xs text-slate-500">Book customer plot inspection</p>
          </Link>
        </div>
      </section>
    </div>
  )
}
export default Dashboard