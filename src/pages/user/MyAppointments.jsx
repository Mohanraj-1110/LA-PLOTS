import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, Clock } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { subscribeToCustomerAppointments } from '../../services/appointments'
import { EmptyState } from '../../components/common/EmptyState'
import { StatusBadge } from '../../components/common/StatusBadge'

export function MyAppointments() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) return
    const unsub = subscribeToCustomerAppointments(
      user.uid,
      (data) => setAppointments(data),
      () => setError('Could not load your appointments.')
    )
    return () => unsub()
  }, [user])

  if (!user) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <EmptyState
          title="Sign in to view site visits"
          description="Log in to view your scheduled property visits and meetings."
          action={
            <Link
              to="/login"
              className="inline-flex rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
            >
              Sign In
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">My Appointments</h1>
          <p className="mt-1 text-sm text-slate-500">Scheduled site visits, meetings, and calls</p>
        </div>
        <Link
          to="/enquiry?type=visit"
          className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition"
        >
          Book New Visit
        </Link>
      </div>

      {error ? (
        <div className="mt-8 rounded-xl bg-red-50 p-4 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      ) : appointments === null ? (
        <div className="mt-8 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-200" />
          ))}
        </div>
      ) : appointments.length > 0 ? (
        <div className="mt-8 space-y-4">
          {appointments.map((item) => (
            <article
              key={item.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className="size-12 rounded-xl bg-green-50 text-green-700 grid place-items-center shrink-0">
                  <CalendarDays size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-slate-900 capitalize">{item.type}</h3>
                    <StatusBadge status={item.status || 'Scheduled'} />
                  </div>
                  <p className="mt-1 flex items-center text-sm text-slate-500">
                    <Clock size={15} className="mr-1 text-slate-400" />
                    {item.date?.toDate?.().toLocaleDateString('en-IN') || 'Date pending'} · {item.time || '10:00 AM'}
                  </p>
                  {item.notes && (
                    <p className="mt-2 text-xs text-slate-600 bg-slate-50 p-2 rounded-lg inline-block">
                      Note: {item.notes}
                    </p>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-8">
          <EmptyState
            title="No scheduled visits"
            description="You don't have any upcoming site visits or advisory appointments booked."
            action={
              <Link
                to="/enquiry?type=visit"
                className="inline-flex rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
              >
                Schedule a Visit
              </Link>
            }
          />
        </div>
      )}
    </div>
  )
}
