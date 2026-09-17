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
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
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
            <div key={i} className="h-32 animate-pulse rounded-xl border border-slate-200 bg-white" />
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
    <>
      <PageHeader
        title="Admin Dashboard"
        description="Real-time monitoring of plots, customer inquiries, and sales revenue."
        action={
          <Link
            to="/admin/reports"
            className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-green-600 px-4 text-sm font-semibold text-white hover:bg-green-700 transition"
          >
            <BarChart3 size={16} />
            View Reports
          </Link>
        }
      />

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} detail={s.detail} icon={s.icon} />
        ))}
      </div>

      {/* Charts & Today's Schedule */}
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <section className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-900">Revenue & Profit Overview</h2>
              <p className="mt-1 text-sm text-slate-500">Monthly breakdown this calendar year</p>
            </div>
            <span className="rounded-lg bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
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
                  <Bar dataKey="sales" name="Sales" fill="#16a34a" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="profit" name="Profit" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="grid h-full place-items-center rounded-lg bg-slate-50 text-sm text-slate-500">
                No closed sales recorded for this year yet.
              </div>
            )}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-bold text-slate-900">Today&apos;s Site Visits & Tasks</h2>
          {data.todayAppointments.length ? (
            <div className="mt-4 space-y-3">
              {data.todayAppointments.map((app) => (
                <div key={app.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900 capitalize">{app.type}</span>
                    <StatusBadge status="Today" />
                  </div>
                  <p className="mt-1 text-xs text-slate-500 font-medium">Time: {app.time}</p>
                  <p className="mt-1 text-xs text-slate-600">{app.notes}</p>
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

      {/* Quick Actions */}
      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-bold text-slate-900">Quick Actions</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Link
            to="/admin/plots?action=new"
            className="rounded-xl border border-slate-200 p-4 hover:border-green-400 hover:bg-green-50/50 transition group"
          >
            <div className="flex items-center gap-2 font-semibold text-slate-900 group-hover:text-green-700">
              <Plus size={16} /> Add New Plot
            </div>
            <p className="mt-1 text-xs text-slate-500">Update inventory catalog with area & pricing</p>
          </Link>

          <Link
            to="/admin/customers?action=new"
            className="rounded-xl border border-slate-200 p-4 hover:border-green-400 hover:bg-green-50/50 transition group"
          >
            <div className="flex items-center gap-2 font-semibold text-slate-900 group-hover:text-green-700">
              <Plus size={16} /> Add Customer Lead
            </div>
            <p className="mt-1 text-xs text-slate-500">Capture buyer requirement and budget</p>
          </Link>

          <Link
            to="/admin/appointments?action=new"
            className="rounded-xl border border-slate-200 p-4 hover:border-green-400 hover:bg-green-50/50 transition group"
          >
            <div className="flex items-center gap-2 font-semibold text-slate-900 group-hover:text-green-700">
              <Plus size={16} /> Schedule Visit
            </div>
            <p className="mt-1 text-xs text-slate-500">Book customer plot inspection</p>
          </Link>
        </div>
      </section>
    </>
  )
}
export default Dashboard
