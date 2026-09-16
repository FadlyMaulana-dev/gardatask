import React, { useState, useEffect } from 'react'
import { ArrowLeft, Download, MessageCircle, Plus, FileText, ChevronDown } from 'lucide-react'
import { useParams, useNavigate } from 'react-router-dom'
import { useFinance } from '../../context/FinanceContext'
import AppLayout from '../../layouts/AppLayout'

export default function InvoiceDetail() {
  const { invoiceId } = useParams()
  const navigate = useNavigate()
  const { fetchInvoiceDetail, recordPayment, downloadInvoice } = useFinance()
  const [invoice, setInvoice] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [showDownloadMenu, setShowDownloadMenu] = useState(false)

  const [paymentData, setPaymentData] = useState({
    amount: '',
    payment_method: 'transfer',
    payment_date: new Date().toISOString().split('T')[0],
    notes: '',
    proof_file: null
  })

  useEffect(() => {
    loadInvoice()
  }, [invoiceId])

  const loadInvoice = async () => {
    const data = await fetchInvoiceDetail(invoiceId)
    setInvoice(data)
    setIsLoading(false)
  }

  const handlePaymentChange = (e) => {
    const { name, value, type, files } = e.target
    setPaymentData(prev => ({
      ...prev,
      [name]: type === 'file' ? files[0] : value
    }))
  }

  const handleSubmitPayment = async (e) => {
    e.preventDefault()
    setPaymentLoading(true)

    const success = await recordPayment(invoiceId, paymentData)

    setPaymentLoading(false)

    if (success) {
      setPaymentData({
        amount: '',
        payment_method: 'transfer',
        payment_date: new Date().toISOString().split('T')[0],
        notes: '',
        proof_file: null
      })
      setShowPaymentForm(false)
      await loadInvoice()
    } else {
      alert('Gagal mencatat pembayaran')
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value || 0)
  }

  const getStatusBadge = (status) => {
    const badges = {
      unpaid: 'bg-red-100 text-red-700',
      partial: 'bg-yellow-100 text-yellow-700',
      paid: 'bg-green-100 text-green-700'
    }
    const labels = {
      unpaid: 'Belum Dibayar',
      partial: 'Cicilan',
      paid: 'Sudah Dibayar'
    }
    return (
      <span className={`px-4 py-2 rounded-full text-sm font-semibold ${badges[status]}`}>
        {labels[status]}
      </span>
    )
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Memuat invoice...</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (!invoice) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-slate-600">Invoice tidak ditemukan</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  const paymentPercentage = (invoice.paid_amount / invoice.total_amount) * 100
  const remainingAmount = invoice.total_amount - invoice.paid_amount

  return (
    <AppLayout>
      <div className="min-h-screen bg-slate-50 p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/finance/invoices')}
            className="p-2 hover:bg-slate-200 rounded-lg transition"
          >
            <ArrowLeft size={24} className="text-slate-700" />
          </button>
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-slate-900">{invoice.invoice_number}</h1>
            <p className="mt-2 text-slate-500">{invoice.project?.name}</p>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <button
                onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
              >
                <Download size={20} className="text-slate-600" />
                <span className="text-slate-700 font-medium text-sm">Download</span>
                <ChevronDown size={16} className="text-slate-500" />
              </button>

              {showDownloadMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowDownloadMenu(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-20">
                    <button
                      onClick={() => {
                        setShowDownloadMenu(false)
                        downloadInvoice(invoice.id, 'pdf')
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 border-b border-slate-100 flex items-center gap-2"
                    >
                      <span className="text-red-500 font-medium">PDF</span> (.pdf)
                    </button>
                    <button
                      onClick={() => {
                        setShowDownloadMenu(false)
                        downloadInvoice(invoice.id, 'word')
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 border-b border-slate-100 flex items-center gap-2"
                    >
                      <span className="text-blue-500 font-medium">Word</span> (.doc)
                    </button>
                    <button
                      onClick={() => {
                        setShowDownloadMenu(false)
                        downloadInvoice(invoice.id, 'excel')
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <span className="text-green-500 font-medium">Excel</span> (.xls)
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Invoice Info */}
            <div className="bg-slate-100 rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-slate-600 text-sm font-medium mb-1">Klien</h3>
                  <p className="text-lg font-semibold text-slate-900">{invoice.client_name}</p>
                  {invoice.client_email && (
                    <p className="text-slate-500 text-sm">{invoice.client_email}</p>
                  )}
                  {invoice.client_phone && (
                    <p className="text-slate-500 text-sm">{invoice.client_phone}</p>
                  )}
                </div>
                <div>
                  <h3 className="text-slate-600 text-sm font-medium mb-1">Status</h3>
                  {getStatusBadge(invoice.status)}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200">
                <div>
                  <h3 className="text-slate-600 text-xs font-medium mb-1">Tanggal Invoice</h3>
                  <p className="font-semibold text-slate-900">
                    {new Date(invoice.invoice_date).toLocaleDateString('id-ID')}
                  </p>
                </div>
                <div>
                  <h3 className="text-slate-600 text-xs font-medium mb-1">Jatuh Tempo</h3>
                  <p className="font-semibold text-slate-900">
                    {new Date(invoice.due_date).toLocaleDateString('id-ID')}
                  </p>
                </div>
                <div>
                  <h3 className="text-slate-600 text-xs font-medium mb-1">Hari Tersisa</h3>
                  <p className="font-semibold text-slate-900">
                    {Math.max(0, Math.ceil((new Date(invoice.due_date) - new Date()) / (1000 * 60 * 60 * 24)))} hari
                  </p>
                </div>
              </div>

              {invoice.description && (
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <h3 className="text-slate-600 text-sm font-medium mb-2">Deskripsi</h3>
                  <p className="text-slate-700">{invoice.description}</p>
                </div>
              )}
            </div>

            {/* Payment Progress */}
            <div className="bg-slate-100 rounded-2xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">Progress Pembayaran</h2>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-700">Total Tagihan</span>
                    <span className="text-lg font-semibold text-slate-900">
                      {formatCurrency(invoice.total_amount)}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-700">Sudah Dibayar</span>
                    <span className="text-lg font-semibold text-green-600">
                      {formatCurrency(invoice.paid_amount)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, paymentPercentage)}%` }}
                    />
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {Math.round(paymentPercentage)}% dari total tagihan
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-700">Sisa Pembayaran</span>
                    <span className="text-lg font-semibold text-red-600">
                      {formatCurrency(remainingAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment History */}
            {invoice.payments && invoice.payments.length > 0 && (
              <div className="bg-slate-100 rounded-2xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Riwayat Pembayaran</h2>

                <div className="space-y-3">
                  {invoice.payments.map(payment => (
                    <div key={payment.id} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-b-0">
                      <div>
                        <p className="font-medium text-slate-900">
                          {new Date(payment.payment_date).toLocaleDateString('id-ID')}
                        </p>
                        <p className="text-sm text-slate-500 capitalize">
                          {payment.payment_method} - {payment.notes || 'Pembayaran'
                          }
                        </p>
                      </div>
                      <p className="font-semibold text-green-600">
                        + {formatCurrency(payment.amount)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Add Payment Button */}
            {invoice.status !== 'paid' && (
              <button
                onClick={() => setShowPaymentForm(!showPaymentForm)}
                className="w-full bg-brand-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-brand-700 transition shadow-md"
              >
                <Plus size={20} />
                Catat Pembayaran
              </button>
            )}

            {/* Payment Form */}
            {showPaymentForm && (
              <div className="bg-slate-100 rounded-2xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Catat Pembayaran</h3>

                <form onSubmit={handleSubmitPayment} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Jumlah Pembayaran (Rp) *
                    </label>
                    <input
                      type="number"
                      name="amount"
                      value={paymentData.amount}
                      onChange={handlePaymentChange}
                      required
                      placeholder={remainingAmount.toString()}
                      min="0"
                      max={remainingAmount}
                      step="0.01"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    <p className="text-xs text-slate-500 mt-1">Maksimal: {formatCurrency(remainingAmount)}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Metode Pembayaran *
                    </label>
                    <select
                      name="payment_method"
                      value={paymentData.payment_method}
                      onChange={handlePaymentChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      <option value="transfer">Transfer Bank</option>
                      <option value="cash">Tunai</option>
                      <option value="check">Cek</option>
                      <option value="other">Lainnya</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Tanggal Pembayaran *
                    </label>
                    <input
                      type="date"
                      name="payment_date"
                      value={paymentData.payment_date}
                      onChange={handlePaymentChange}
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Bukti Transfer (Opsional)
                    </label>
                    <input
                      type="file"
                      name="proof_file"
                      onChange={handlePaymentChange}
                      accept="image/*"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Catatan
                    </label>
                    <textarea
                      name="notes"
                      value={paymentData.notes}
                      onChange={handlePaymentChange}
                      placeholder="Catatan tambahan..."
                      rows="2"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowPaymentForm(false)}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={paymentLoading}
                      className="flex-1 px-3 py-2 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 disabled:bg-brand-400 transition"
                    >
                      {paymentLoading ? 'Menyimpan...' : 'Simpan Pembayaran'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Summary Card */}
            <div className="bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl p-6 text-white">
              <p className="text-brand-100 text-sm font-medium mb-1">Saldo Terhutang</p>
              <p className="text-3xl font-bold mb-4">
                {formatCurrency(remainingAmount)}
              </p>

              <div className="bg-white bg-opacity-20 rounded-lg p-3 text-sm">
                <p className="opacity-90">
                  Pembayaran: <span className="font-semibold">{Math.round(paymentPercentage)}%</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
