import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../../context/AppStateContext';
import { useAuth } from '../../context/AuthContext';
import { salesService } from '../../services/salesService';
import { reportService } from '../../services/reportService';
import { formatCurrency, formatCompactCurrency } from '../../utils/formatCurrency';
import { formatMediumDate } from '../../utils/dateHelpers';
import { ROUTES } from '../../routes/routePaths';
import { PageHeader } from '../../components/layout/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingState';
import {
  MapPin,
  CheckCircle2,
  Clock,
  Ban,
  Users,
  Calendar,
  IndianRupee,
  TrendingUp,
  Plus,
  ArrowRight,
  ChevronRight,
  PhoneCall,
  CalendarCheck,
  Building,
  CheckSquare,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

export function DashboardPage() {
  const { plots, customers, appointments, sales, loading } = useAppState();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trends, setTrends] = useState([]);
  const [loadingChart, setLoadingChart] = useState(true);

  useEffect(() => {
    async function loadTrends() {
      try {
        const data = await salesService.getFinancialTrends();
        setTrends(data);
      } catch (e) {
        console.error('Failed to load chart trends', e);
      } finally {
        setLoadingChart(false);
      }
    }
    loadTrends();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading Dashboard KPIs..." className="py-24" />;
  }

  // Calculate KPIs
  const totalPlots = plots.length;
  const availablePlots = plots.filter((p) => p.status === 'available').length;
  const reservedPlots = plots.filter((p) => p.status === 'reserved').length;
  const soldPlots = plots.filter((p) => p.status === 'sold').length;

  const activeCustomers = customers.filter(
    (c) => c.status !== 'Converted' && c.status !== 'Lost'
  ).length;
  const upcomingAppts = appointments.filter((a) => a.status === 'Upcoming').length;

  const totalSalesRevenue = sales.reduce((acc, s) => acc + (s.saleAmount || 0), 0);
  const totalNetProfit = sales.reduce((acc, s) => acc + (s.netProfit || 0), 0);

  // Today's tasks from real scheduled appointments
  const todayTasks = appointments.slice(0, 4).map((appt, idx) => ({
    id: appt.id || idx,
    title: `${appt.type ? appt.type.toUpperCase() : 'APPOINTMENT'}: ${appt.customerName || 'Customer'}`,
    detail: appt.plotNumber ? `Plot ${appt.plotNumber} • ${appt.projectName || 'Layout'}` : (appt.notes || 'Scheduled appointment'),
    time: `${appt.date || 'Today'} ${appt.time || ''}`.trim(),
    icon: CalendarCheck,
    color: 'text-emerald-600 bg-emerald-50',
    action: () => navigate(ROUTES.APPOINTMENTS),
  }));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Real Estate Dashboard"
        subtitle={`Real-time overview for ${user?.company || 'LA Plots Realty LLP'}`}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(ROUTES.ADD_PLOT)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Plot</span>
            </button>
            <button
              type="button"
              onClick={() => navigate(ROUTES.ADD_CUSTOMER)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              <Users className="w-4 h-4" />
              <span>New Customer</span>
            </button>
          </div>
        }
      />

      {/* 8 Primary KPI Cards (1 col mobile, 2 col tablet, 4 col desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Plot Inventory"
          value={totalPlots}
          subtitle="Across 5 premier layouts"
          icon={MapPin}
          color="emerald"
          onClick={() => navigate(ROUTES.PLOTS)}
        />
        <StatCard
          title="Available Plots"
          value={availablePlots}
          subtitle="Ready for immediate sale"
          icon={CheckCircle2}
          color="emerald"
          onClick={() => navigate(`${ROUTES.PLOTS}?status=available`)}
        />
        <StatCard
          title="Reserved Plots"
          value={reservedPlots}
          subtitle="Token advances received"
          icon={Clock}
          color="amber"
          onClick={() => navigate(`${ROUTES.PLOTS}?status=reserved`)}
        />
        <StatCard
          title="Sold Plots"
          value={soldPlots}
          subtitle="Fully registered deeds"
          icon={Ban}
          color="rose"
          onClick={() => navigate(`${ROUTES.PLOTS}?status=sold`)}
        />

        <StatCard
          title="Active Buyers / Leads"
          value={activeCustomers}
          subtitle="In pipeline negotiation"
          icon={Users}
          color="blue"
          trend={14}
          trendLabel="leads this month"
          onClick={() => navigate(ROUTES.CUSTOMERS)}
        />
        <StatCard
          title="Upcoming Appointments"
          value={upcomingAppts}
          subtitle="Site visits & meetings"
          icon={Calendar}
          color="purple"
          onClick={() => navigate(ROUTES.APPOINTMENTS)}
        />
        <StatCard
          title="Total Sales Value"
          value={formatCompactCurrency(totalSalesRevenue)}
          subtitle={formatCurrency(totalSalesRevenue)}
          icon={IndianRupee}
          color="emerald"
          trend={22}
          trendLabel="growth rate"
          onClick={() => navigate(ROUTES.SALES)}
        />
        <StatCard
          title="Net Profit Realized"
          value={formatCompactCurrency(totalNetProfit)}
          subtitle={formatCurrency(totalNetProfit)}
          icon={TrendingUp}
          color="emerald"
          trend={18}
          trendLabel="net margin: ~31%"
          onClick={() => navigate(ROUTES.SALES)}
        />
      </div>

      {/* Two Column Content: Monthly Trends Chart + Today's Priority Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recharts Monthly Sales & Profit (8 cols desktop) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Monthly Sales & Profit Performance
              </h3>
              <p className="text-xs text-slate-500">
                Revenue vs Gross Land Cost & Net Profit (FY 2026-27)
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate(ROUTES.SALES)}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Full Financials</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-72 w-full">
            {loadingChart ? (
              <LoadingSpinner text="Rendering chart..." className="h-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={trends}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                    tickFormatter={(val) => formatCompactCurrency(val, true)}
                  />
                  <Tooltip
                    formatter={(val) => [formatCurrency(val), '']}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '1rem',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar
                    dataKey="sales"
                    name="Sales Revenue"
                    fill="#16a34a"
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey="profit"
                    name="Net Profit"
                    fill="#3b82f6"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Today's Tasks & Urgent Follow-ups (4 cols desktop) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Today's Priority Tasks</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {todayTasks.length} Pending
              </span>
            </div>

            <div className="space-y-3">
              {todayTasks.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No upcoming tasks or appointments scheduled for today.
                </div>
              ) : (
                todayTasks.map((t) => {
                  const Icon = t.icon;
                  return (
                    <div
                      key={t.id}
                      onClick={t.action}
                      className="p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-100 hover:border-emerald-200 transition-all cursor-pointer group"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${t.color}`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-900 truncate">
                            {t.title}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            {t.detail}
                          </p>
                          <p className="text-[10px] font-semibold text-emerald-700 mt-1">
                            {t.time}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 self-center" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate(ROUTES.APPOINTMENTS)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors text-center cursor-pointer"
            >
              Open Full Schedule
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent In-Demand Plots & Hot Customer Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Plots */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Featured Plot Parcels</h3>
              <p className="text-[11px] text-slate-400">Recently updated inventory</p>
            </div>
            <button
              type="button"
              onClick={() => navigate(ROUTES.PLOTS)}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer"
            >
              View All ({plots.length}) →
            </button>
          </div>

          <div className="space-y-3">
            {plots.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No plots added yet. Click &quot;Add Plot&quot; above to create your first plot record.
              </div>
            ) : (
              plots.slice(0, 4).map((plot) => (
                <div
                  key={plot.id}
                  onClick={() => navigate(ROUTES.plotDetailsPath(plot.id))}
                  className="flex items-center justify-between gap-3 p-3 rounded-2xl hover:bg-slate-50 border border-slate-100 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={plot.photos?.[0] || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=80'}
                      alt={plot.plotNumber}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-100 flex-shrink-0"
                      loading="lazy"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-slate-900">
                          {plot.plotNumber}
                        </span>
                        <StatusBadge status={plot.status} />
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {plot.projectName} • {plot.areaSqft} sq.ft
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-black text-slate-900">
                      {formatCompactCurrency(plot.totalAmount)}
                    </p>
                    <p className="text-[10px] text-slate-400">₹{plot.ratePerSqft}/sq.ft</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Hot Leads / Pipeline */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">High-Intent Leads</h3>
              <p className="text-[11px] text-slate-400">Buyers near closing stage</p>
            </div>
            <button
              type="button"
              onClick={() => navigate(ROUTES.CUSTOMERS)}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer"
            >
              View Pipeline ({customers.length}) →
            </button>
          </div>

          <div className="space-y-3">
            {customers.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No customer leads in pipeline yet. Real buyer enquiries will show here.
              </div>
            ) : (
              customers.slice(0, 4).map((cust) => (
                <div
                  key={cust.id}
                  onClick={() => navigate(ROUTES.customerDetailsPath(cust.id))}
                  className="flex items-center justify-between gap-3 p-3 rounded-2xl hover:bg-slate-50 border border-slate-100 transition-all cursor-pointer"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-slate-900 truncate">
                        {cust.name}
                      </span>
                      <StatusBadge status={cust.status} />
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {cust.interestedProjectName} • {cust.phone}
                    </p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-bold text-slate-700">
                      {formatCompactCurrency(cust.budgetMin)} - {formatCompactCurrency(cust.budgetMax)}
                    </p>
                    <p className="text-[10px] font-semibold text-emerald-700">
                      Score: {cust.leadScore || 80}/100
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

DashboardPage.propTypes = {};
