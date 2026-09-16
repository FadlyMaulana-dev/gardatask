import React, { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Download } from 'lucide-react'
import { useFinance } from '../../context/FinanceContext'
import AppLayout from '../../layouts/AppLayout'

export default function FinanceReports() {
  const { cashFlowSummary, fetchCashFlowSummary, stats, exportCashFlowCSV } = useFinance()
  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    fetchCashFlowSummary({ start_date: startDate, end_date: endDate })
  }, [startDate, endDate])

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value || 0)
  }

  const [isExporting, setIsExporting] = useState(false)

  const handleExportCSV = async () => {
    setIsExporting(true)
    await exportCashFlowCSV({ start_date: startDate, end_date: endDate })
    setIsExporting(false)
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-slate-50 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Laporan Keuangan</h1>
            <p className="mt-2 text-slate-500">Analisis keuangan dan trend bisnis Anda</p>
          </div>

          <button
            onClick={handleExportCSV}
            disabled={isExporting}
            className="bg-brand-600 text-white px-5 py-3 rounded-xl font-semibold flex items-center gap-2 hover:bg-brand-700 disabled:opacity-50 transition shadow-md"
          >
            <Download size={20} />
            {isExporting ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>

        {/* Date Range Filter */}
        <div className="bg-slate-100 rounded-2xl border border-slate-200 shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Periode Laporan</h2>
          <div className="flex gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Dari</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Sampai</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        {cashFlowSummary && (
          <>
            <div className="grid gap-6 sm:grid-cols-3 mb-8">
              <div className="bg-slate-100 rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <BarChart3 className="text-green-600" size={24} />
                  <h3 className="text-slate-600 text-sm font-medium">Total Pendapatan</h3>
                </div>
                <p className="text-2xl font-bold text-slate-900">
                  {formatCurrency(cashFlowSummary.income)}
                </p>
              </div>

              <div className="bg-slate-100 rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <BarChart3 className="text-red-600" size={24} />
                  <h3 className="text-slate-600 text-sm font-medium">Total Pengeluaran</h3>
                </div>
                <p className="text-2xl font-bold text-slate-900">
                  {formatCurrency(cashFlowSummary.expense)}
                </p>
              </div>

              <div className="bg-slate-100 rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="text-brand-600" size={24} />
                  <h3 className="text-slate-600 text-sm font-medium">Laba/Rugi Bersih</h3>
                </div>
                <p className={`text-2xl font-bold ${cashFlowSummary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(cashFlowSummary.balance)}
                </p>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="grid gap-8 lg:grid-cols-2 mb-8">
              {/* Income by Category */}
              {cashFlowSummary.income_by_category && (
                <div className="bg-slate-100 rounded-2xl border border-slate-200 shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Pendapatan Per Kategori</h2>
                  <div className="space-y-3">
                    {cashFlowSummary.income_by_category.length === 0 ? (
                      <p className="text-slate-500 text-sm">Belum ada data pendapatan</p>
                    ) : (
                      cashFlowSummary.income_by_category.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-b-0">
                          <div>
                            <p className="font-medium text-slate-900 capitalize">{item.category}</p>
                            <p className="text-xs text-slate-500">{item.count} transaksi</p>
                          </div>
                          <p className="font-semibold text-green-600">
                            {formatCurrency(item.total)}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Expense by Category */}
              {cashFlowSummary.expense_by_category && (
                <div className="bg-slate-100 rounded-2xl border border-slate-200 shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Pengeluaran Per Kategori</h2>
                  <div className="space-y-3">
                    {cashFlowSummary.expense_by_category.length === 0 ? (
                      <p className="text-slate-500 text-sm">Belum ada data pengeluaran</p>
                    ) : (
                      cashFlowSummary.expense_by_category.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-b-0">
                          <div>
                            <p className="font-medium text-slate-900 capitalize">{item.category}</p>
                            <p className="text-xs text-slate-500">{item.count} transaksi</p>
                          </div>
                          <p className="font-semibold text-red-600">
                            {formatCurrency(item.total)}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Invoice Statistics */}
        {stats && (
          <div className="bg-slate-100 rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Statistik Invoice</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-slate-900">{stats.total_invoices}</p>
                <p className="text-sm text-slate-600 mt-1">Total Invoice</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-red-600">{stats.unpaid_count}</p>
                <p className="text-sm text-slate-600 mt-1">Belum Dibayar</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-yellow-600">{stats.partial_count}</p>
                <p className="text-sm text-slate-600 mt-1">Cicilan</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{stats.paid_count}</p>
                <p className="text-sm text-slate-600 mt-1">Sudah Dibayar</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
