import React, { useState, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useAppState } from '../../context/AppStateContext';
import { salesService } from '../../services/salesService';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatCompactCurrency } from '../../utils/formatCurrency';
import { formatMediumDate } from '../../utils/dateHelpers';
import { PageHeader } from '../../components/layout/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { FormInput } from '../../components/forms/FormInput';
import { FormSelect } from '../../components/forms/FormSelect';
import {
  IndianRupee,
  TrendingUp,
  Receipt,
  PieChart as PieIcon,
  BadgePercent,
  Plus,
  CheckCircle2,
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

const PERIODS = ['This Month', 'This Quarter', 'This Year', 'All Time'];

export function SalesProfitPage() {
  const { sales, plots, addSale } = useAppState();
  const { success, error: toastError } = useToast();

  const [period, setPeriod] = useState('This Year');
  const [trends, setTrends] = useState([]);
  const [projectData, setProjectData] = useState([]);
  const [saleModalOpen, setSaleModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New sale form state
  const [selectedPlotId, setSelectedPlotId] = useState('');
  const [selectedCustName, setSelectedCustName] = useState('');
  const [saleAmount, setSaleAmount] = useState('');
  const [costAmount, setCostAmount] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('Completed');
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer (RTGS)');

  useEffect(() => {
    async function loadStats() {
      const [t, p] = await Promise.all([
        salesService.getFinancialTrends(),
        salesService.getProjectDistribution(),
      ]);
      setTrends(t);
      setProjectData(p);
    }
    loadStats();
  }, []);

  // Compute metrics
  const totalSales = useMemo(
    () => sales.reduce((acc, s) => acc + (s.saleAmount || 0), 0),
    [sales]
  );
  const totalCost = useMemo(
    () => sales.reduce((acc, s) => acc + (s.costAmount || 0), 0),
    [sales]
  );
  const totalProfit = useMemo(
    () => sales.reduce((acc, s) => acc + (s.netProfit || 0), 0),
    [sales]
  );
  const avgMargin =
    totalSales > 0 ? ((totalProfit / totalSales) * 100).toFixed(1) : 0;

  const handlePlotSelect = (e) => {
    const pId = e.target.value;
    setSelectedPlotId(pId);
    const plot = plots.find((p) => p.id === pId);
    if (plot) {
      setSaleAmount(plot.totalAmount);
      // Realistic estimated acquisition cost is ~65-70% of plot value
      setCostAmount(Math.round(plot.totalAmount * 0.68));
    }
  };

  const handleCreateSale = async (e) => {
    e.preventDefault();
    if (!selectedPlotId) {
      toastError('Please select a plot to record transaction');
      return;
    }
    setSubmitting(true);
    try {
      const plot = plots.find((p) => p.id === selectedPlotId);
      await addSale({
        plotId: selectedPlotId,
        plotNumber: plot?.plotNumber || 'Plot',
        projectName: plot?.projectName || 'Project',
        customerName: selectedCustName || 'Registered Buyer',
        saleAmount: parseFloat(saleAmount) || 0,
        costAmount: parseFloat(costAmount) || 0,
        paymentStatus,
        paymentMethod,
        saleDate: new Date().toISOString().split('T')[0],
      });
      success('Sale transaction recorded and plot marked as Sold!');
      setSaleModalOpen(false);
      setSelectedPlotId('');
      setSelectedCustName('');
      setSaleAmount('');
      setCostAmount('');
    } catch (err) {
      toastError(err.message || 'Failed to record sale');
    } finally {
      setSubmitting(false);
    }
  };

  const netLiveProfit = (parseFloat(saleAmount) || 0) - (parseFloat(costAmount) || 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Sales & Profit Financials"
        subtitle="Gross revenue, land acquisition costs, and realized net profits"
        badge={
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            Avg Margin: {avgMargin}%
          </span>
        }
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSaleModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Record Sale</span>
            </button>
          </div>
        }
      />

      {/* Period Selector Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Financial Reporting Window</h3>
          <p className="text-xs text-slate-400">Select reporting period to recalculate profit margins</p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl">
          {PERIODS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                period === p
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Top Financial Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Gross Sales Revenue"
          value={formatCompactCurrency(totalSales)}
          subtitle={formatCurrency(totalSales)}
          icon={IndianRupee}
          color="emerald"
          trend={24}
          trendLabel="vs previous period"
        />
        <StatCard
          title="Land Acquisition Cost"
          value={formatCompactCurrency(totalCost)}
          subtitle={formatCurrency(totalCost)}
          icon={Receipt}
          color="slate"
        />
        <StatCard
          title="Net Realized Profit"
          value={formatCompactCurrency(totalProfit)}
          subtitle={formatCurrency(totalProfit)}
          icon={TrendingUp}
          color="emerald"
          trend={19}
          trendLabel="profit growth"
        />
        <StatCard
          title="Average Profit Margin"
          value={`${avgMargin}%`}
          subtitle="Net return on gross sales"
          icon={BadgePercent}
          color="purple"
        />
      </div>

      {/* Charts Section: Monthly Sales vs Profit & Project Contribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Trend Chart (7 cols desktop) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Monthly Sales & Cost Trend</h3>
              <p className="text-xs text-slate-400">Revenue compared with gross land costs</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              FY 2026-27
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => formatCompactCurrency(val, true)}
                />
                <Tooltip
                  formatter={(val) => [formatCurrency(val), '']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '1rem',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="sales" name="Sales" fill="#16a34a" radius={[6, 6, 0, 0]} />
                <Bar dataKey="cost" name="Land Cost" fill="#94a3b8" radius={[6, 6, 0, 0]} />
                <Bar dataKey="profit" name="Net Profit" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Project Sales Distribution (5 cols desktop) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Revenue by Layout Project</h3>
                <p className="text-xs text-slate-400">Total volume contribution</p>
              </div>
              <PieIcon className="w-4 h-4 text-emerald-600" />
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={projectData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {projectData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => [formatCurrency(val), 'Volume']} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend list */}
            <div className="space-y-1.5 pt-2">
              {projectData.map((proj) => (
                <div key={proj.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: proj.color }}
                    />
                    <span className="text-slate-700 font-medium truncate max-w-[150px]">
                      {proj.name}
                    </span>
                  </div>
                  <span className="font-bold text-slate-900">
                    {formatCompactCurrency(proj.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Sales Transactions Table */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Sale Transactions</h3>
            <p className="text-xs text-slate-400">Individual plot settlements and registration details</p>
          </div>
          <span className="text-xs font-bold text-slate-500">
            {sales.length} Deals Executed
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-700 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Plot / Project</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Sale Amount</th>
                <th className="px-4 py-3">Cost Amount</th>
                <th className="px-4 py-3">Net Profit</th>
                <th className="px-4 py-3">Margin</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {sales.map((sale) => (
                <tr key={sale.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3.5">
                    <p className="font-bold text-slate-900">{sale.plotNumber}</p>
                    <p className="text-[11px] text-slate-400">{sale.projectName}</p>
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-slate-800">{sale.customerName}</td>
                  <td className="px-4 py-3.5 font-bold text-slate-900">
                    {formatCurrency(sale.saleAmount)}
                  </td>
                  <td className="px-4 py-3.5 text-slate-500">{formatCurrency(sale.costAmount)}</td>
                  <td className="px-4 py-3.5 font-black text-emerald-700">
                    {formatCurrency(sale.netProfit)}
                  </td>
                  <td className="px-4 py-3.5 font-bold text-emerald-700">{sale.profitMargin}%</td>
                  <td className="px-4 py-3.5 text-slate-500">{formatMediumDate(sale.saleDate)}</td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={sale.paymentStatus} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Sale Modal */}
      <Modal
        isOpen={saleModalOpen}
        onClose={() => setSaleModalOpen(false)}
        title="Record Plot Sale Transaction"
        subtitle="Log transaction details and auto-calculate profit margins"
        maxWidth="md"
      >
        <form onSubmit={handleCreateSale} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 mb-1 block">Select Plot Parcel *</label>
            <select
              value={selectedPlotId}
              onChange={handlePlotSelect}
              required
              className="w-full py-2.5 px-3 bg-white border border-slate-200 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="">Choose plot from inventory...</option>
              {plots
                .filter((p) => p.status !== 'sold')
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.plotNumber} - {p.projectName} ({formatCurrency(p.totalAmount)})
                  </option>
                ))}
            </select>
          </div>

          <FormInput
            label="Customer Name"
            value={selectedCustName}
            onChange={(e) => setSelectedCustName(e.target.value)}
            placeholder="e.g. Ramesh Chandra"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <FormInput
              label="Final Sale Amount (₹)"
              type="number"
              prefix="₹"
              value={saleAmount}
              onChange={(e) => setSaleAmount(e.target.value)}
              required
            />
            <FormInput
              label="Acquisition Cost (₹)"
              type="number"
              prefix="₹"
              value={costAmount}
              onChange={(e) => setCostAmount(e.target.value)}
              required
            />
          </div>

          {/* Live Profit Preview */}
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-emerald-800 uppercase">Calculated Net Profit</p>
              <p className="text-lg font-black text-emerald-800 leading-tight">
                {formatCurrency(netLiveProfit)}
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-white px-2.5 py-1 rounded-xl shadow-2xs">
              {saleAmount > 0 ? ((netLiveProfit / saleAmount) * 100).toFixed(1) : 0}% Margin
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormSelect
              label="Payment Status"
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              options={['Completed', 'Partial', 'Pending']}
            />

            <FormSelect
              label="Payment Method"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              options={[
                'Bank Transfer (RTGS)',
                'Bank Transfer (NEFT)',
                'Demand Draft',
                'Cheque',
                'Home Loan (Bank)',
              ]}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setSaleModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Record & Mark Sold</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

SalesProfitPage.propTypes = {};
