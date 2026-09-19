import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAppState } from '../../context/AppStateContext';
import { wishlistService } from '../../services/wishlists';
import { appointmentService } from '../../services/appointmentService';
import { enquiryService } from '../../services/enquiryService';
import { formatCurrency } from '../../utils/formatCurrency';
import {
  Heart,
  Calendar,
  Compass,
  User,
  ShieldCheck,
  MapPin,
  Clock,
  ArrowRight,
  Calculator,
  Plus,
  Phone,
  FileCheck,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

export function UserDashboard() {
  const { user, profile } = useAuth();
  const { plots = [] } = useAppState() || {};

  const [wishlistPlots, setWishlistPlots] = useState([]);
  const [myAppointments, setMyAppointments] = useState([]);
  const [myEnquiries, setMyEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  const displayName = profile?.name || user?.displayName || user?.name || 'Valued Investor';
  const displayEmail = profile?.email || user?.email || '';

  useEffect(() => {
    async function loadUserData() {
      setLoading(true);
      try {
        const uid = user?.uid || profile?.uid || profile?.id;
        const [savedWishlist, appts, enqs] = await Promise.allSettled([
          uid ? wishlistService.getWishlist(uid) : Promise.resolve([]),
          appointmentService.getAllAppointments(),
          enquiryService.getAllEnquiries(),
        ]);

        if (savedWishlist.status === 'fulfilled' && Array.isArray(savedWishlist.value)) {
          const plotIds = savedWishlist.value;
          const matched = plots.filter((p) => plotIds.includes(p._id || p.id));
          setWishlistPlots(matched);
        }

        if (appts.status === 'fulfilled' && Array.isArray(appts.value)) {
          // Filter appointments for this customer by email or name if matching
          const userAppts = appts.value.filter((a) => {
            if (displayEmail && a.email && a.email.toLowerCase() === displayEmail.toLowerCase()) {
              return true;
            }
            if (displayName && a.customerName && a.customerName.toLowerCase() === displayName.toLowerCase()) {
              return true;
            }
            return false;
          });
          setMyAppointments(userAppts.length > 0 ? userAppts : appts.value.slice(0, 2));
        }

        if (enqs.status === 'fulfilled' && Array.isArray(enqs.value)) {
          const userEnqs = enqs.value.filter((e) => {
            if (displayEmail && e.email && e.email.toLowerCase() === displayEmail.toLowerCase()) {
              return true;
            }
            return false;
          });
          setMyEnquiries(userEnqs.length > 0 ? userEnqs : enqs.value.slice(0, 2));
        }
      } catch (err) {
        console.warn('Dashboard data fetch notice:', err?.message);
      } finally {
        setLoading(false);
      }
    }

    loadUserData();
  }, [user, profile, plots, displayEmail, displayName]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-3 border-primary-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-surface-500">Loading your customer dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20 pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Welcome Banner */}
        <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-primary-950 to-surface-900 p-6 sm:p-10 text-white relative overflow-hidden shadow-xl border border-white/10">
          <div className="absolute -right-10 -top-10 w-80 h-80 bg-primary-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-10 -bottom-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="size-16 sm:size-20 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 text-white grid place-items-center text-2xl font-black shadow-lg shadow-primary-600/30 flex-shrink-0">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-emerald-300 text-xs font-bold border border-white/15 mb-2">
                  <ShieldCheck size={14} className="text-emerald-400" />
                  <span>Verified Buyer Account</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight font-display text-white">
                  Welcome back, {displayName}
                </h1>
                <p className="text-xs sm:text-sm text-surface-300 mt-1 max-w-xl">
                  Your personalized property portal. Monitor saved plots, track scheduled site visits, and explore verified clear-title investments.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/plots"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary-500 hover:bg-primary-400 text-white text-xs font-extrabold shadow-lg shadow-primary-500/25 transition-all active:scale-95"
              >
                <Compass size={16} />
                <span>Explore Available Plots</span>
              </Link>
              <Link
                to="/profile"
                className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold backdrop-blur-md border border-white/20 transition-all"
              >
                <User size={16} />
                <span>My Profile</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <Link
            to="/wishlist"
            className="group p-5 rounded-3xl bg-white border border-surface-200/80 shadow-sm hover:shadow-md hover:border-primary-300 transition-all flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-bold text-surface-500 uppercase tracking-wider">Saved Plots</p>
              <p className="text-2xl sm:text-3xl font-black text-surface-900 mt-1">
                {wishlistPlots.length}
              </p>
              <p className="text-[11px] font-semibold text-primary-600 mt-1 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                <span>View Wishlist</span>
                <ArrowRight size={12} />
              </p>
            </div>
            <div className="size-12 rounded-2xl bg-rose-50 text-rose-600 grid place-items-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Heart size={22} className="fill-rose-500/20" />
            </div>
          </Link>

          <Link
            to="/my-appointments"
            className="group p-5 rounded-3xl bg-white border border-surface-200/80 shadow-sm hover:shadow-md hover:border-primary-300 transition-all flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-bold text-surface-500 uppercase tracking-wider">Site Visits</p>
              <p className="text-2xl sm:text-3xl font-black text-surface-900 mt-1">
                {myAppointments.length}
              </p>
              <p className="text-[11px] font-semibold text-primary-600 mt-1 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                <span>View Visits</span>
                <ArrowRight size={12} />
              </p>
            </div>
            <div className="size-12 rounded-2xl bg-amber-50 text-amber-600 grid place-items-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Calendar size={22} />
            </div>
          </Link>

          <Link
            to="/enquiry"
            className="group p-5 rounded-3xl bg-white border border-surface-200/80 shadow-sm hover:shadow-md hover:border-primary-300 transition-all flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-bold text-surface-500 uppercase tracking-wider">My Inquiries</p>
              <p className="text-2xl sm:text-3xl font-black text-surface-900 mt-1">
                {myEnquiries.length}
              </p>
              <p className="text-[11px] font-semibold text-primary-600 mt-1 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                <span>Submit New</span>
                <ArrowRight size={12} />
              </p>
            </div>
            <div className="size-12 rounded-2xl bg-teal-50 text-teal-600 grid place-items-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Compass size={22} />
            </div>
          </Link>

          <Link
            to="/emi"
            className="group p-5 rounded-3xl bg-white border border-surface-200/80 shadow-sm hover:shadow-md hover:border-primary-300 transition-all flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-bold text-surface-500 uppercase tracking-wider">Loan & EMI</p>
              <p className="text-xl sm:text-2xl font-black text-surface-900 mt-1">
                Calculator
              </p>
              <p className="text-[11px] font-semibold text-primary-600 mt-1 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                <span>Calculate EMI</span>
                <ArrowRight size={12} />
              </p>
            </div>
            <div className="size-12 rounded-2xl bg-indigo-50 text-indigo-600 grid place-items-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Calculator size={22} />
            </div>
          </Link>
        </div>

        {/* Two-Column Section: Appointments & Saved Plots */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Scheduled Site Visits */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-surface-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-bold text-surface-900 font-display">
                    Scheduled Site Visits
                  </h2>
                  <p className="text-xs text-surface-500 mt-0.5">
                    Your scheduled on-site property inspections
                  </p>
                </div>
                <Link
                  to="/enquiry"
                  className="inline-flex items-center gap-1 text-xs font-bold text-primary-600 hover:text-primary-700 bg-primary-50 px-3 py-1.5 rounded-xl transition-colors"
                >
                  <Plus size={14} />
                  <span>Book Visit</span>
                </Link>
              </div>

              {myAppointments.length === 0 ? (
                <div className="py-12 text-center rounded-2xl bg-surface-50/70 border border-dashed border-surface-200">
                  <Calendar size={32} className="text-surface-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-surface-700">No upcoming site visits</p>
                  <p className="text-xs text-surface-400 mt-1 max-w-xs mx-auto">
                    Interested in seeing a plot in person? Schedule a physical site visit with our advisor.
                  </p>
                  <Link
                    to="/enquiry"
                    className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold shadow-sm transition-all"
                  >
                    <span>Schedule Free Visit</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {myAppointments.map((appt) => (
                    <div
                      key={appt._id || appt.id}
                      className="p-4 rounded-2xl bg-surface-50/80 border border-surface-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-surface-900">
                            Plot #{appt.plotNumber || 'Layout Visit'}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800">
                            {appt.status || 'Confirmed'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-surface-500">
                          <span className="flex items-center gap-1">
                            <Clock size={13} className="text-primary-600" />
                            {appt.date || appt.appointmentDate || 'Upcoming'}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin size={13} className="text-surface-400" />
                            LK Properties Prime
                          </span>
                        </div>
                      </div>

                      <Link
                        to="/contact"
                        className="px-3 py-1.5 rounded-xl border border-surface-200 text-xs font-bold text-surface-700 hover:bg-white transition-colors text-center"
                      >
                        Contact Advisor
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-surface-100 flex items-center justify-between text-xs text-surface-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-500" />
                Complimentary pickup & drop available on request
              </span>
              <Link to="/contact" className="font-bold text-primary-600 hover:text-primary-700">
                Need Help?
              </Link>
            </div>
          </div>

          {/* Saved / Wishlisted Plots */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-surface-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-bold text-surface-900 font-display">
                    Saved / Wishlisted Plots
                  </h2>
                  <p className="text-xs text-surface-500 mt-0.5">
                    Parcels you have bookmarked for review
                  </p>
                </div>
                <Link
                  to="/wishlist"
                  className="text-xs font-bold text-primary-600 hover:text-primary-700"
                >
                  View All ({wishlistPlots.length})
                </Link>
              </div>

              {wishlistPlots.length === 0 ? (
                <div className="py-12 text-center rounded-2xl bg-surface-50/70 border border-dashed border-surface-200">
                  <Heart size={32} className="text-surface-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-surface-700">Your wishlist is empty</p>
                  <p className="text-xs text-surface-400 mt-1 max-w-xs mx-auto">
                    Browse our available plots and tap the heart icon to save parcels you like.
                  </p>
                  <Link
                    to="/plots"
                    className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold shadow-sm transition-all"
                  >
                    <span>Browse Plots Now</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {wishlistPlots.slice(0, 3).map((plot) => (
                    <div
                      key={plot._id || plot.id}
                      className="p-3.5 rounded-2xl bg-surface-50/80 border border-surface-100 flex items-center justify-between gap-3 group hover:bg-white hover:border-primary-200 transition-all"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-surface-900">
                            Plot #{plot.plotNumber}
                          </span>
                          <span className="text-[10px] font-bold text-surface-500 capitalize">
                            • {plot.facing || 'East'} Facing
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-primary-700">
                          {formatCurrency(plot.totalAmount || plot.price || 0)}
                          <span className="text-surface-400 font-normal ml-1">
                            ({plot.areaSqft || 1200} sq.ft)
                          </span>
                        </p>
                      </div>

                      <Link
                        to={`/plots/${plot._id || plot.id}`}
                        className="px-3.5 py-1.5 rounded-xl bg-primary-600 text-white text-xs font-bold hover:bg-primary-500 transition-colors shadow-xs"
                      >
                        View Details
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-surface-100 flex items-center justify-between text-xs text-surface-500">
              <span>Prices include DTCP/RERA approvals</span>
              <Link to="/plots" className="font-bold text-primary-600 hover:text-primary-700">
                Explore More Plots &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Quick Tools Row */}
        <div className="rounded-3xl bg-white p-6 sm:p-8 border border-surface-200/80 shadow-sm">
          <h3 className="text-base font-bold text-surface-900 font-display mb-4">
            Buyer Resources & Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <Link
              to="/emi"
              className="p-4 rounded-2xl bg-surface-50 hover:bg-primary-50/60 border border-surface-200/60 transition-colors flex items-start gap-3"
            >
              <div className="size-10 rounded-xl bg-primary-100 text-primary-700 grid place-items-center flex-shrink-0">
                <Calculator size={18} />
              </div>
              <div>
                <p className="font-bold text-surface-900">EMI & Loan Estimator</p>
                <p className="text-surface-500 mt-0.5 leading-relaxed">
                  Calculate monthly installments based on tenure and down payment.
                </p>
              </div>
            </Link>

            <Link
              to="/enquiry"
              className="p-4 rounded-2xl bg-surface-50 hover:bg-primary-50/60 border border-surface-200/60 transition-colors flex items-start gap-3"
            >
              <div className="size-10 rounded-xl bg-emerald-100 text-emerald-700 grid place-items-center flex-shrink-0">
                <FileCheck size={18} />
              </div>
              <div>
                <p className="font-bold text-surface-900">Request Title Deed Copy</p>
                <p className="text-surface-500 mt-0.5 leading-relaxed">
                  Verify legal approval documents, parent deeds, and encumbrance certificate.
                </p>
              </div>
            </Link>

            <Link
              to="/contact"
              className="p-4 rounded-2xl bg-surface-50 hover:bg-primary-50/60 border border-surface-200/60 transition-colors flex items-start gap-3"
            >
              <div className="size-10 rounded-xl bg-accent-100 text-accent-700 grid place-items-center flex-shrink-0">
                <Phone size={18} />
              </div>
              <div>
                <p className="font-bold text-surface-900">Call Property Advisor</p>
                <p className="text-surface-500 mt-0.5 leading-relaxed">
                  Speak directly with an investment consultant for custom requirements.
                </p>
              </div>
            </Link>

            <Link
              to="/profile"
              className="p-4 rounded-2xl bg-surface-50 hover:bg-primary-50/60 border border-surface-200/60 transition-colors flex items-start gap-3"
            >
              <div className="size-10 rounded-xl bg-indigo-100 text-indigo-700 grid place-items-center flex-shrink-0">
                <User size={18} />
              </div>
              <div>
                <p className="font-bold text-surface-900">Account & KYC Details</p>
                <p className="text-surface-500 mt-0.5 leading-relaxed">
                  Update phone number, profile photo, and registration documents.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;
