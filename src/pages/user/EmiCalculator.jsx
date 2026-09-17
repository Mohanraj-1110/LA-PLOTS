import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calculator, ArrowRight, CheckCircle2, IndianRupee, ShieldCheck } from 'lucide-react'
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

export function EmiCalculator() {
  const [loanAmount, setLoanAmount] = useState(2500000)
  const [interestRate, setInterestRate] = useState(8.5)
  const [tenureYears, setTenureYears] = useState(15)

  // Standard Loan EMI Calculation
  const { monthlyEmi, totalInterest, totalPayment, chartData } = useMemo(() => {
    const P = Number(loanAmount) || 0
    const annualRate = Number(interestRate) || 0
    const N = (Number(tenureYears) || 1) * 12

    if (P <= 0 || annualRate <= 0 || N <= 0) {
      return { monthlyEmi: 0, totalInterest: 0, totalPayment: 0, chartData: [] }
    }

    const monthlyRate = annualRate / 12 / 100
    const emi = (P * monthlyRate * Math.pow(1 + monthlyRate, N)) / (Math.pow(1 + monthlyRate, N) - 1)
    const totalPayable = emi * N
    const totalInt = totalPayable - P

    return {
      monthlyEmi: Math.round(emi),
      totalInterest: Math.round(totalInt),
      totalPayment: Math.round(totalPayable),
      chartData: [
        { name: 'Principal Loan Amount', value: P, color: '#16a34a' },
        { name: 'Total Interest Payable', value: Math.round(totalInt), color: '#3b82f6' },
      ],
    }
  }, [loanAmount, interestRate, tenureYears])

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3.5 py-1 text-xs font-semibold text-green-800 mb-3">
          <Calculator size={14} />
          Plot Loan Estimator
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
          Land & Plot Loan EMI Calculator
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Calculate your estimated monthly installments, total interest charges, and loan repayment breakdown.
        </p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Controls Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
          {/* Loan Amount */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold text-slate-700">Required Loan Amount</label>
              <span className="text-base font-bold text-green-700">{currency.format(loanAmount)}</span>
            </div>
            <input
              type="range"
              min="500000"
              max="20000000"
              step="50000"
              value={loanAmount}
              onChange={(e) => setLoanAmount(Number(e.target.value))}
              className="w-full accent-green-600 cursor-pointer h-2 bg-slate-100 rounded-lg"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>₹5 Lakhs</span>
              <span>₹1 Crore</span>
              <span>₹2 Crores</span>
            </div>
          </div>

          {/* Interest Rate */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold text-slate-700">Annual Interest Rate (%)</label>
              <span className="text-base font-bold text-green-700">{interestRate}%</span>
            </div>
            <input
              type="range"
              min="6.5"
              max="16.0"
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full accent-green-600 cursor-pointer h-2 bg-slate-100 rounded-lg"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>6.5%</span>
              <span>11.0%</span>
              <span>16.0%</span>
            </div>
          </div>

          {/* Loan Tenure */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold text-slate-700">Repayment Tenure</label>
              <span className="text-base font-bold text-green-700">{tenureYears} Years ({tenureYears * 12} mos)</span>
            </div>
            <input
              type="range"
              min="1"
              max="30"
              step="1"
              value={tenureYears}
              onChange={(e) => setTenureYears(Number(e.target.value))}
              className="w-full accent-green-600 cursor-pointer h-2 bg-slate-100 rounded-lg"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>1 Year</span>
              <span>15 Years</span>
              <span>30 Years</span>
            </div>
          </div>

          {/* Pre-set Quick Buttons */}
          <div className="pt-2 border-t border-slate-100">
            <span className="block text-xs font-semibold text-slate-500 mb-2">Popular Loan Budgets:</span>
            <div className="flex flex-wrap gap-2">
              {[1500000, 2500000, 4000000, 6000000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setLoanAmount(amt)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium border transition ${
                    loanAmount === amt
                      ? 'border-green-600 bg-green-50 text-green-800'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  ₹{amt / 100000} Lakhs
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Card */}
        <div className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Estimated Monthly Installment</p>
            <p className="mt-1 text-4xl font-extrabold text-green-700">
              {currency.format(monthlyEmi)}
              <span className="text-sm font-normal text-slate-500"> / month</span>
            </p>

            {/* Breakdown stats */}
            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-100 pt-6">
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                <span className="text-xs text-slate-500">Total Interest</span>
                <p className="mt-1 text-lg font-bold text-blue-600">{currency.format(totalInterest)}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                <span className="text-xs text-slate-500">Total Payment</span>
                <p className="mt-1 text-lg font-bold text-slate-900">{currency.format(totalPayment)}</p>
              </div>
            </div>

            {/* Visual Pie Breakdown */}
            <div className="mt-6 flex items-center justify-center h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => currency.format(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex justify-center gap-6 text-xs font-semibold text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className="size-3 rounded-full bg-green-600" />
                Principal ({Math.round((loanAmount / totalPayment) * 100) || 0}%)
              </div>
              <div className="flex items-center gap-1.5">
                <span className="size-3 rounded-full bg-blue-500" />
                Interest ({Math.round((totalInterest / totalPayment) * 100) || 0}%)
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 space-y-3">
            <Link
              to={`/enquiry?budget=${loanAmount}`}
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-green-600 font-bold text-white hover:bg-green-700 transition shadow-sm"
            >
              Enquire for Plot Financing <ArrowRight size={16} />
            </Link>
            <Link
              to={`/plots?budget=${loanAmount}`}
              className="flex min-h-11 w-full items-center justify-center rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Browse Plots within ₹{Math.round(loanAmount / 100000)}L Budget
            </Link>
          </div>
        </div>
      </div>

      {/* Trust Callout */}
      <div className="mt-12 rounded-2xl border border-green-200 bg-green-50/70 p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6">
        <div className="size-14 rounded-2xl bg-green-100 text-green-700 grid place-items-center shrink-0">
          <ShieldCheck size={32} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">Pre-Approved Plot Loans with Leading Banks</h3>
          <p className="mt-1 text-sm text-slate-600">
            Our layouts are pre-sanctioned and approved by major banking partners (SBI, HDFC, ICICI, Axis Bank) for up to 80% plot purchase and construction loans with low processing fees.
          </p>
        </div>
      </div>
    </div>
  )
}

export default EmiCalculator
