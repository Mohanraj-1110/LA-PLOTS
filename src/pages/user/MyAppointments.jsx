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
              className="btn-primary inline-flex rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
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
      <div className="flex items-center justify-between animate-slide-up">
        <div className="flex items-center gap-4">
          <div className="size-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white grid place-items-center shadow-glow">
            <CalendarDays size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold font-display text-surface-900">My Appointments</h1>
            <p className="mt-1 text-sm text-surface-500">Scheduled site visits, meetings, and calls</p>
          </div>
        </div>
        <Link
          to="/enquiry?type=visit"
          className="btn-primary inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-4 py-2 text-sm font-semibold text-white shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
        >
          <CalendarDays size={16} />
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
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-surface-200" />
          ))}
        </div>
      ) : appointments.length > 0 ? (
        <div className="mt-8 space-y-4">
          {appointments.map((item, idx) => (
            <article
              key={item.id}
              className="card-modern flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 hover:shadow-elevated hover:border-primary-200 transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${Math.min(idx, 5) * 0.06}s` }}
            >
              <div className="flex items-start gap-4">
                <div className="size-12 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 text-white grid place-items-center shrink-0 shadow-glow">
                  <CalendarDays size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold font-display text-surface-900 capitalize">{item.type}</h3>
                    <StatusBadge status={item.status || 'Scheduled'} />
                  </div>
                  <p className="mt-1 flex items-center text-sm text-surface-500">
                    <Clock size={15} className="mr-1 text-primary-500" />
                    {(() => {
                      if (item.date?.toDate) return item.date.toDate().toLocaleDateString('en-IN')
                      if (typeof item.date === 'string' && item.date) return new Date(item.date).toLocaleDateString('en-IN')
                      return 'Date pending'
                    })()} · {item.time || '10:00 AM'}
                  </p>
                  {item.plotId && (
                    <p className="mt-1.5 text-xs font-semibold text-primary-700 inline-flex items-center gap-1">
                      <span className="size-1.5 rounded-full bg-primary-500 inline-block" />
                      Target: {item.plotId}
                    </p>
                  )}
                  {item.notes && (
                    <p className="mt-2 text-xs text-surface-600 bg-surface-50 border border-surface-100 p-2 rounded-lg inline-block">
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
                className="btn-primary inline-flex rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
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