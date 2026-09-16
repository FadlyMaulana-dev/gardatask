import React, { useEffect } from 'react'
import { BarChart3, TrendingUp, DollarSign, AlertCircle } from 'lucide-react'
import { useFinance } from '../../context/FinanceContext'
import AppLayout from '../../layouts/AppLayout'

export default function FinanceDashboard() {
  const { stats, cashFlowSummary, invoices, isLoading } = useFinance()

  const unpaidInvoices = invoices.filter(inv => inv.status === 'unpaid')
  const partialInvoices = invoices.filter(inv => inv.status === 'partial')

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value || 0)
  }

  // SKELETON UI FOR INSTANT FEEDBACK
  const renderSkeletons = () => (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm animate-pulse">
            <div className="w-12 h-12 bg-slate-200 rounded-lg mb-4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-slate-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
      <div className="grid gap-6 sm:grid-cols-3 mb-8">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm animate-pulse">
            <div className="w-12 h-12 bg-slate-200 rounded-lg mb-4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/3 mb-2"></div>
            <div className="h-8 bg-slate-200 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-slate-200 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    </>
  )

  return (
    <AppLayout>
      <div className="min-h-screen bg-slate-50 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900">Finance Dashboard</h1>
          <p className="mt-2 text-slate-500">Kelola invoices, pembayaran, dan cash flow project Anda</p>
        </div>

        {(!cashFlowSummary || !stats) ? renderSkeletons() : (
          <>
            {/* Cash Flow Summary */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              {/* Total Income */}
              <div className="bg-slate-100 rounded-2xl p-6 border border-slate-200 shadow-sm transition hover:shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="text-green-600" size={24} />
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">+Income</span>
                </div>
                <h3 className="text-slate-600 text-sm font-medium mb-1">Total Masuk</h3>
                <p className="text-2xl font-bold text-slate-900">
                  {formatCurrency(cashFlowSummary.income)}
                </p>
              </div>

              {/* Total Expense */}
              <div className="bg-slate-100 rounded-2xl p-6 border border-slate-200 shadow-sm transition hover:shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="text-red-600 rotate-180" size={24} />
                  </div>
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">-Expense</span>
                </div>
                <h3 className="text-slate-600 text-sm font-medium mb-1">Total Keluar</h3>
                <p className="text-2xl font-bold text-slate-900">
                  {formatCurrency(cashFlowSummary.expense)}
                </p>
              </div>

              {/* Balance */}
              <div className="bg-slate-100 rounded-2xl p-6 border border-slate-200 shadow-sm transition hover:shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-brand-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="text-brand-600" size={24} />
                  </div>
                </div>
                <h3 className="text-slate-600 text-sm font-medium mb-1">Saldo</h3>
                <p className={`text-2xl font-bold ${cashFlowSummary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(cashFlowSummary.balance)}
                </p>
              </div>

              {/* Total Tagihan */}
              <div className="bg-slate-100 rounded-2xl p-6 border border-slate-200 shadow-sm transition hover:shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="text-blue-600" size={24} />
                  </div>
                </div>
                <h3 className="text-slate-600 text-sm font-medium mb-1">Total Tagihan</h3>
                <p className="text-2xl font-bold text-slate-900">
                  {formatCurrency(stats.total_amount)}
                </p>
              </div>
            </div>

            {/* Invoice Status Summary */}
            <div className="grid gap-6 sm:grid-cols-3 mb-8">
              {/* Unpaid */}
              <div className="bg-slate-100 rounded-2xl p-6 border border-slate-200 shadow-sm transition hover:shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertCircle className="text-red-600" size={24} />
                  </div>
                </div>
                <h3 className="text-slate-600 text-sm font-medium mb-2">Belum Dibayar</h3>
                <p className="text-3xl font-bold text-red-600 mb-1">{stats.unpaid_count}</p>
                <p className="text-xs text-slate-500">
                  Rp {unpaidInvoices.reduce((sum, inv) => sum + (inv.remaining_amount || inv.total_amount - inv.paid_amount), 0).toLocaleString('id-ID')}
                </p>
              </div>

              {/* Partial */}
              <div className="bg-slate-100 rounded-2xl p-6 border border-slate-200 shadow-sm transition hover:shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="text-yellow-600" size={24} />
                  </div>
                </div>
                <h3 className="text-slate-600 text-sm font-medium mb-2">Cicilan</h3>
                <p className="text-3xl font-bold text-yellow-600 mb-1">{stats.partial_count}</p>
                <p className="text-xs text-slate-500">
                  Rp {partialInvoices.reduce((sum, inv) => sum + (inv.remaining_amount || inv.total_amount - inv.paid_amount), 0).toLocaleString('id-ID')}
                </p>
              </div>

              {/* Paid */}
              <div className="bg-slate-100 rounded-2xl p-6 border border-slate-200 shadow-sm transition hover:shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="text-green-600" size={24} />
                  </div>
                </div>
                <h3 className="text-slate-600 text-sm font-medium mb-2">Sudah Dibayar</h3>
                <p className="text-3xl font-bold text-green-600 mb-1">{stats.paid_count}</p>
                <p className="text-xs text-slate-500">
                  Rp {stats.paid_amount?.toLocaleString('id-ID') || 0}
                </p>
              </div>
            </div>
          </>
        )}

        {/* Quick Access */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <a href="/finance/invoices" className="bg-slate-100 rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-lg transition cursor-pointer">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">📄 Invoice</h3>
            <p className="text-slate-500 text-sm mb-4">Kelola dan buat invoice baru</p>
            <span className="text-brand-600 font-medium text-sm">Lihat Invoice →</span>
          </a>

          <a href="/finance/cashflow" className="bg-slate-100 rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-lg transition cursor-pointer">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">💰 Cash Flow</h3>
            <p className="text-slate-500 text-sm mb-4">Pantau aliran kas masuk dan keluar</p>
            <span className="text-brand-600 font-medium text-sm">Lihat Cash Flow →</span>
          </a>

          <a href="/finance/reports" className="bg-slate-100 rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-lg transition cursor-pointer">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">📊 Laporan</h3>
            <p className="text-slate-500 text-sm mb-4">Analisis keuangan dan trend</p>
            <span className="text-brand-600 font-medium text-sm">Lihat Laporan →</span>
          </a>
        </div>
      </div>
    </AppLayout>
  )
}
