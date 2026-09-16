import React, { useState } from 'react'
import { Plus, TrendingUp, TrendingDown, Pencil, Trash2 } from 'lucide-react'
import { useFinance } from '../../context/FinanceContext'
import AppLayout from '../../layouts/AppLayout'

export function buildCashFlowPayload(formData) {
  return {
    category: String(formData.category ?? '').trim(),
    description: String(formData.description ?? '').trim(),
    amount: Number.parseFloat(formData.amount),
    transaction_date: String(formData.transaction_date ?? '').trim(),
    notes: String(formData.notes ?? '').trim(),
    type: formData.type,
  }
}

export default function CashFlow() {
  const {
    cashTransactions,
    cashFlowSummary,
    isLoading,
    addExpense,
    addIncome,
    updateTransaction,
    deleteTransaction,
  } = useFinance()

  const [showForm, setShowForm] = useState(false)
  const [typeFilter, setTypeFilter] = useState('all')
  const [isSaving, setIsSaving] = useState(false)
  const [editingId, setEditingId] = useState(null)

  const [formData, setFormData] = useState({
    category: '',
    description: '',
    amount: '',
    transaction_date: new Date().toISOString().split('T')[0],
    notes: '',
    type: 'expense',
  })

  const resetForm = () => {
    setFormData({
      category: '',
      description: '',
      amount: '',
      transaction_date: new Date().toISOString().split('T')[0],
      notes: '',
      type: 'expense',
    })
    setEditingId(null)
    setShowForm(false)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const startEditTransaction = (transaction) => {
    setEditingId(transaction.id)
    setFormData({
      category: transaction.category,
      description: transaction.description,
      amount: transaction.amount,
      transaction_date: transaction.transaction_date,
      notes: transaction.notes || '',
      type: transaction.type,
    })
    setShowForm(true)
  }

  const handleDeleteTransaction = async (transactionId) => {
    if (!window.confirm('Yakin ingin menghapus transaksi ini?')) return

    const success = await deleteTransaction(transactionId)
    if (!success) {
      alert('Gagal menghapus transaksi kas.')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)

    const payload = buildCashFlowPayload(formData)

    const success = editingId
      ? await updateTransaction(editingId, payload)
      : formData.type === 'income'
        ? await addIncome(payload)
        : await addExpense(payload)

    setIsSaving(false)
    if (success) {
      resetForm()
    } else {
      const message = editingId
        ? 'Gagal memperbarui transaksi'
        : formData.type === 'income'
          ? 'Gagal menambah kas masuk'
          : 'Gagal menambah pengeluaran'
      alert(message)
    }
  }

  const filteredTransactions = cashTransactions.filter(trans =>
    typeFilter === 'all' ? true : trans.type === typeFilter
  )

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
    }).format(value || 0)
  }

  // Skeleton for summary cards
  const renderSkeleton = () => (
    <div className="grid gap-6 sm:grid-cols-3 mb-8">
      {[1,2,3].map(i => (
        <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm animate-pulse">
          <div className="h-4 bg-slate-200 rounded w-1/3 mb-3"></div>
          <div className="h-8 bg-slate-200 rounded w-2/3"></div>
        </div>
      ))}
    </div>
  )


  return (
    <AppLayout>
      <div className="min-h-screen bg-slate-50 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Cash Flow</h1>
            <p className="mt-2 text-slate-500">Pantau aliran kas masuk dan keluar</p>
          </div>

          <button
            onClick={() => {
              if (showForm && editingId) {
                resetForm()
                return
              }
              setShowForm(!showForm)
            }}
            className="bg-brand-600 text-white px-5 py-3 rounded-xl font-semibold flex items-center gap-2 hover:bg-brand-700 transition shadow-md"
          >
            <Plus size={20} />
            {editingId ? 'Batal Edit' : 'Tambah Transaksi'}
          </button>
        </div>

        {/* Summary */}
        {isLoading ? renderSkeleton() : cashFlowSummary && (
          <div className="grid gap-6 sm:grid-cols-3 mb-8">
            <div className="bg-slate-100 rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-slate-600 text-sm font-medium">Total Masuk</h3>
                <TrendingUp className="text-green-600" size={20} />
              </div>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(cashFlowSummary.income)}</p>
            </div>
            <div className="bg-slate-100 rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-slate-600 text-sm font-medium">Total Keluar</h3>
                <TrendingDown className="text-red-600" size={20} />
              </div>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(cashFlowSummary.expense)}</p>
            </div>
            <div className="bg-slate-100 rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-slate-600 text-sm font-medium">Saldo</h3>
                <div className="w-5 h-5 bg-brand-100 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-brand-600 rounded-full" />
                </div>
              </div>
              <p className={`text-2xl font-bold ${cashFlowSummary.balance >= 0 ? 'text-brand-600' : 'text-red-600'}`}>
                {formatCurrency(cashFlowSummary.balance)}
              </p>
            </div>
          </div>
        )}

        {/* Add Expense Form */}
        {showForm && (
          <div className="bg-slate-100 rounded-2xl border border-slate-200 shadow-sm p-6 mb-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              {editingId ? 'Edit Transaksi Kas' : 'Tambah Transaksi Kas'}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="category"
                placeholder="Kategori (gaji, hosting, domain, dll)"
                value={formData.category}
                onChange={handleChange}
                required
                className="px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />

              <input
                type="text"
                name="description"
                placeholder="Deskripsi pengeluaran"
                value={formData.description}
                onChange={handleChange}
                required
                className="px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />

              <input
                type="number"
                name="amount"
                placeholder="Jumlah (Rp)"
                value={formData.amount}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                max="9999999999999.99"
                className="px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />

              <input
                type="date"
                name="transaction_date"
                value={formData.transaction_date}
                onChange={handleChange}
                required
                className="px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />

              <textarea
                name="notes"
                placeholder="Catatan (opsional)"
                value={formData.notes}
                onChange={handleChange}
                rows="2"
                className="md:col-span-2 px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />

              <div className="md:col-span-2 flex gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 px-4 py-2 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-700 disabled:bg-brand-400 transition"
                >
                  {isSaving ? 'Menyimpan...' : (editingId ? 'Simpan Perubahan' : (formData.type === 'income' ? 'Tambah Kas Masuk' : 'Tambah Pengeluaran'))}
                </button>
                <div className="md:col-span-2 flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="type" value="expense" checked={formData.type === 'expense'} onChange={(e) => setFormData(prev => ({...prev, type: e.target.value}))} />
                    <span className="ml-1">Keluar</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="type" value="income" checked={formData.type === 'income'} onChange={(e) => setFormData(prev => ({...prev, type: e.target.value}))} />
                    <span className="ml-1">Masuk</span>
                  </label>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Filter */}
        <div className="mb-6">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">Semua Transaksi</option>
            <option value="income">Kas Masuk</option>
            <option value="expense">Kas Keluar</option>
          </select>
        </div>

        {/* Transactions List */}
        <div className="bg-slate-100 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Tanggal</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Kategori</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Deskripsi</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Tipe</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">Jumlah</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                    Tidak ada transaksi
                  </td>
                </tr>
              ) : (
                filteredTransactions.map(trans => (
                  <tr key={trans.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-6 py-4 text-slate-900 text-sm">
                      {new Date(trans.transaction_date).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4 text-slate-900 font-medium">{trans.category}</td>
                    <td className="px-6 py-4 text-slate-600">{trans.description}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        trans.type === 'income'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {trans.type === 'income' ? 'Masuk' : 'Keluar'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold">
                      <span className={trans.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                        {trans.type === 'income' ? '+' : '-'} {formatCurrency(trans.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => startEditTransaction(trans)}
                          className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
                          aria-label={`Edit transaksi ${trans.description}`}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTransaction(trans.id)}
                          className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-red-50 p-2 text-red-600 transition hover:bg-red-100"
                          aria-label={`Hapus transaksi ${trans.description}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  )
}
