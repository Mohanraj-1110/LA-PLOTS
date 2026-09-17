import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { subscribeToWishlist } from '../../services/wishlists'
import { getPublicPlot } from '../../services/plots'
import { PlotCard } from '../../components/user/PlotCard'
import { EmptyState } from '../../components/common/EmptyState'

export function Wishlist() {
  const { user } = useAuth()
  const [plotIds, setPlotIds] = useState(null)
  const [plots, setPlots] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    const unsub = subscribeToWishlist(
      user.uid,
      (items) => {
        const ids = items.map((i) => i.plotId)
        setPlotIds(ids)
      },
      () => setLoading(false)
    )
    return () => unsub()
  }, [user])

  useEffect(() => {
    if (!plotIds) return
    Promise.all(plotIds.map(getPublicPlot))
      .then((results) => {
        setPlots(results.filter(Boolean))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [plotIds])

  if (!user) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <EmptyState
          title="Sign in to view your wishlist"
          description="Create an account or sign in to keep track of your favorite plots across devices."
          icon={Heart}
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
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex items-center gap-3">
        <Heart className="text-red-500 fill-red-500" size={28} />
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">My Wishlist</h1>
          <p className="mt-1 text-sm text-slate-500">Your curated collection of favorite plots</p>
        </div>
      </div>

      {loading ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-80 animate-pulse rounded-2xl bg-slate-200" />
          ))}
        </div>
      ) : plots.length > 0 ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {plots.map((plot) => (
            <PlotCard key={plot.id} plot={plot} />
          ))}
        </div>
      ) : (
        <div className="mt-8">
          <EmptyState
            title="Your wishlist is empty"
            description="Explore our available plots and click the heart icon to save listings here."
            icon={Heart}
            action={
              <Link
                to="/plots"
                className="inline-flex rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
              >
                Browse Plots
              </Link>
            }
          />
        </div>
      )}
    </div>
  )
}
