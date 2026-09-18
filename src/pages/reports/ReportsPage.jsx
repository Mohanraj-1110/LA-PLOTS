import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useAppState } from '../../context/AppStateContext';
import { reportService } from '../../services/reportService';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatCompactCurrency, formatSqft } from '../../utils/formatCurrency';
import { PageHeader } from '../../components/layout/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  BarChart3,
  Download,
  Printer,
  FileSpreadsheet,
  Calendar,
  IndianRupee,
  MapPin,
  Users,
  TrendingUp,
  Building,
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
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const REPORT_TABS = [
  { id: 'sales', label: 'Sales Revenue' },
  { id: 'inventory', label: 'Plot Inventory' },
  { id: 'customers', label: 'Customer Pipeline' },
  { id: 'appointments', label: 'Site Visits & Appts' },
  { id: 'profit', label: 'Net Profit & Margins' },
  { id: 'conversion', label: 'Lead Conversion' },
];

const DATE_RANGES = ['Last 30 Days', 'Last 90 Days', 'Year to Date', 'All Time'];

export function ReportsPage() {
  const { plots, customers, appointments, sales } = useAppState();
  const { success } = useToast();

  const [activeTab, setActiveTab] = useState('sales');
  const [dateRange, setDateRange] = useState('Year to Date');

  // Computed data for reports
  const totalSales = useMemo(() => sales.reduce((a, s) => a + (s.saleAmount || 0), 0), [sales]);
  const totalCost = useMemo(() => sales.reduce((a, s) => a + (s.costAmount || 0), 0), [sales]);
  const totalProfit = useMemo(() => sales.reduce((a, s) => a + (s.netProfit || 0), 0), [sales]);

  // Inventory distribution
  const inventoryPieData = useMemo(() => {
    const counts = {
      available: plots.filter((p) => p.status === 'available').length,
      reserved: plots.filter((p) => p.status === 'reserved').length,
      sold: plots.filter((p) => p.status === 'sold').length,
      blocked: plots.filter((p) => p.status === 'blocked').length,
    };
    return [
      { name: 'Available', value: counts.available, color: '#16a34a' },
      { name: 'Reserved', value: counts.reserved, color: '#f59e0b' },
      { name: 'Sold', value: counts.sold, color: '#ef4444' },
      { name: 'Blocked', value: counts.blocked, color: '#64748b' },
    ];
  }, [plots]);

  // Lead stages distribution
  const customerPipelineData = useMemo(() => {
    const stages = ['New', 'Interested', 'Site Visit', 'Negotiation', 'Booked', 'Converted', 'Lost'];
    return stages.map((st) => ({
      stage: st,
      count: customers.filter((c) => c.status === st).length,
    }));
  }, [customers]);

  // Lead sources distribution
  const leadSourceData = [
    { source: 'Website', leads: 42, converted: 12 },
    { source: 'Facebook', leads: 68, converted: 14 },
    { source: 'Instagram', leads: 35, converted: 8 },
    { source: 'WhatsApp', leads: 29, converted: 11 },
    { source: 'Walk-in', leads: 18, converted: 9 },
    { source: 'Reference', leads: 24, converted: 16 },
  ];

  // Export handlers
  const handleExportCsv = () => {
    let rows = [];
    if (activeTab === 'sales' || activeTab === 'profit') {
      rows = sales.map((s) => ({
        Plot: s.plotNumber,
        Project: s.projectName,
        Customer: s.customerName,
        SaleAmount: s.saleAmount,
        CostAmount: s.costAmount,
        NetProfit: s.netProfit,
        Date: s.saleDate,
      }));
    } else if (activeTab === 'inventory') {
      rows = plots.map((p) => ({
        Plot: p.plotNumber,
        Project: p.projectName,
        SurveyNo: p.surveyNumber,
        AreaSqft: p.areaSqft,
        RateSqft: p.ratePerSqft,
        TotalAmount: p.totalAmount,
        Status: p.status,
        Facing: p.facing,
      }));
    } else {
      rows = customers.map((c) => ({
        Name: c.name,
        Phone: c.phone,
        Project: c.interestedProjectName,
        Status: c.status,
        BudgetMin: c.budgetMin,
        BudgetMax: c.budgetMax,
      }));
    }

    reportService.exportToCsv(`LA_PLOTS_${activeTab}_Report`, rows);
    success(`Exported ${activeTab} report to CSV`);
  };

  const handleExportExcel = () => {
    handleExportCsv();
  };

  const handlePrint = () => {
    reportService.triggerPrint();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Business Intelligence & Reports"
        subtitle="Customizable analytics across sales, inventory velocity, and buyer conversions"
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export Excel</span>
            </button>
          </div>
        }
      />

      {/* Sub-report selector tabs & date range */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-4 no-print">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {REPORT_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Date range filter */}
          <div className="flex items-center gap-2 self-start lg:self-auto">
            <Calendar className="w-4 h-4 text-slate-400" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
            >
              {DATE_RANGES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Report 1: Sales Revenue Report */}
      {activeTab === 'sales' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title="Total Sales Value"
              value={formatCompactCurrency(totalSales)}
              subtitle={formatCurrency(totalSales)}
              icon={IndianRupee}
              color="emerald"
            />
            <StatCard
              title="Total Plots Sold"
              value={sales.length}
              subtitle="Registered sales executed"
              icon={MapPin}
              color="blue"
            />
            <StatCard
              title="Average Deal Size"
              value={formatCompactCurrency(sales.length ? totalSales / sales.length : 0)}
              subtitle="Per plot transaction"
              icon={TrendingUp}
              color="purple"
            />
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Sales Ledger Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-100 uppercase text-[10px] text-slate-700 font-bold">
                  <tr>
                    <th className="px-4 py-3">Plot</th>
                    <th className="px-4 py-3">Project</th>
                    <th className="px-4 py-3">Buyer Name</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Payment Method</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {sales.map((s) => (
                    <tr key={s.id}>
                      <td className="px-4 py-3.5 font-bold text-slate-900">{s.plotNumber}</td>
                      <td className="px-4 py-3.5">{s.projectName}</td>
                      <td className="px-4 py-3.5">{s.customerName}</td>
                      <td className="px-4 py-3.5 font-black text-emerald-700">
                        {formatCurrency(s.saleAmount)}
                      </td>
                      <td className="px-4 py-3.5 text-slate-500">{s.paymentMethod}</td>
                      <td className="px-4 py-3.5 text-slate-500">{s.saleDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Report 2: Plot Inventory Report */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-2">Inventory Status Breakdown</h3>
              <p className="text-xs text-slate-400 mb-4">Current plot stock distribution</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={inventoryPieData}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                    >
                      {inventoryPieData.map((e, idx) => (
                        <Cell key={idx} fill={e.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2">
                {inventoryPieData.map((d) => (
                  <div key={d.name} className="flex items-center gap-2 text-xs">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-slate-600">{d.name}:</span>
                    <span className="font-bold text-slate-900">{d.value} plots</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Stock Valuation</h3>
              <div className="space-y-3 text-xs">
                {plots.slice(0, 6).map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl"
                  >
                    <div>
                      <p className="font-bold text-slate-900">
                        {p.plotNumber} - {p.projectName}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {formatSqft(p.areaSqft)} • ₹{p.ratePerSqft}/sq.ft
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-emerald-700">{formatCompactCurrency(p.totalAmount)}</p>
                      <StatusBadge status={p.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report 3: Customer Pipeline Report */}
      {activeTab === 'customers' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Deal Stage Pipeline Funnel</h3>
            <p className="text-xs text-slate-400 mb-4">Number of active buyers across sales stages</p>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={customerPipelineData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="stage" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="count" name="Buyers" fill="#16a34a" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Report 4: Appointments Report */}
      {activeTab === 'appointments' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title="Total Site Visits"
              value={appointments.filter((a) => a.type === 'Site Visit').length}
              subtitle="Physical property tours"
              icon={MapPin}
              color="emerald"
            />
            <StatCard
              title="Office Meetings"
              value={appointments.filter((a) => a.type === 'Office Meeting').length}
              subtitle="Price & term negotiations"
              icon={Building}
              color="blue"
            />
            <StatCard
              title="Registrations Completed"
              value={appointments.filter((a) => a.type === 'Registration').length}
              subtitle="Deed signings at Sub-Registrar"
              icon={Users}
              color="purple"
            />
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Appointment Schedule Log</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-100 uppercase text-[10px] text-slate-700 font-bold">
                  <tr>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Project / Plot</th>
                    <th className="px-4 py-3">Date & Time</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {appointments.map((a) => (
                    <tr key={a.id}>
                      <td className="px-4 py-3 font-bold text-slate-900">{a.customerName}</td>
                      <td className="px-4 py-3">{a.type}</td>
                      <td className="px-4 py-3">
                        {a.projectName} {a.plotNumber ? `(${a.plotNumber})` : ''}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {a.date} at {a.time}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={a.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Report 5: Profit & Margin Analysis */}
      {activeTab === 'profit' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title="Total Gross Revenue"
              value={formatCompactCurrency(totalSales)}
              subtitle={formatCurrency(totalSales)}
              icon={IndianRupee}
              color="emerald"
            />
            <StatCard
              title="Total Realized Profit"
              value={formatCompactCurrency(totalProfit)}
              subtitle={`Cost basis: ${formatCompactCurrency(totalCost)}`}
              icon={TrendingUp}
              color="blue"
            />
            <StatCard
              title="Net Profit Margin"
              value={totalSales > 0 ? `${((totalProfit / totalSales) * 100).toFixed(1)}%` : '0%'}
              subtitle="Profitability ratio"
              icon={BarChart3}
              color="purple"
            />
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Deal Profitability Ledger</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-100 uppercase text-[10px] text-slate-700 font-bold">
                  <tr>
                    <th className="px-4 py-3">Plot</th>
                    <th className="px-4 py-3">Sale Price</th>
                    <th className="px-4 py-3">Cost Basis</th>
                    <th className="px-4 py-3">Net Profit</th>
                    <th className="px-4 py-3">Margin %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {sales.map((s) => (
                    <tr key={s.id}>
                      <td className="px-4 py-3 font-bold text-slate-900">{s.plotNumber}</td>
                      <td className="px-4 py-3">{formatCurrency(s.saleAmount)}</td>
                      <td className="px-4 py-3 text-slate-500">{formatCurrency(s.costAmount)}</td>
                      <td className="px-4 py-3 font-black text-emerald-700">
                        {formatCurrency(s.netProfit)}
                      </td>
                      <td className="px-4 py-3 font-bold text-emerald-700">{s.profitMargin}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Report 6: Lead Conversion by Source */}
      {activeTab === 'conversion' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Lead Conversion by Marketing Channel</h3>
            <p className="text-xs text-slate-400 mb-4">
              Inbound inquiries compared against successfully converted purchasers
            </p>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={leadSourceData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="source" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="leads" name="Total Inquiries" fill="#94a3b8" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="converted" name="Converted Clients" fill="#16a34a" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

ReportsPage.propTypes = {};
