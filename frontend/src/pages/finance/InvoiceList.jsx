import React, { useState } from 'react'
import { Plus, Search, FileText, Download, Edit2, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useFinance } from '../../context/FinanceContext'
import AppLayout from '../../layouts/AppLayout'

export default function InvoiceList() {
  const navigate = useNavigate()
  const { invoices, isLoading, deleteInvoice, downloadInvoice } = useFinance()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [activeDownloadMenu, setActiveDownloadMenu] = useState(null)

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.invoice_number.includes(searchTerm) || 
                         inv.client_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleDelete = async (invoiceId) => {
    if (window.confirm('Yakin ingin menghapus invoice ini?')) {
      await deleteInvoice(invoiceId)
    }
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
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badges[status]}`}>
        {labels[status]}
      </span>
    )
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value || 0)
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-slate-50 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Invoice</h1>
            <p className="mt-2 text-slate-500">Kelola semua invoice project Anda</p>
          </div>

          <button
            onClick={() => navigate('/finance/invoices/create')}
            className="bg-brand-600 text-white px-5 py-3 rounded-xl font-semibold flex items-center gap-2 hover:bg-brand-700 transition shadow-md"
          >
            <Plus size={20} />
            Buat Invoice
          </button>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Cari invoice atau klien..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg bg-slate-50 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">Semua Status</option>
            <option value="unpaid">Belum Dibayar</option>
            <option value="partial">Cicilan</option>
            <option value="paid">Sudah Dibayar</option>
          </select>
        </div>

        {/* Invoice List */}
        {isLoading ? (
          <div className="bg-slate-100 rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 animate-pulse">
            {[1,2,3,4].map(i => (
              <div key={i} className="flex gap-4">
                <div className="h-5 bg-slate-200 rounded w-1/6"></div>
                <div className="h-5 bg-slate-200 rounded w-1/4"></div>
                <div className="h-5 bg-slate-200 rounded w-1/5"></div>
                <div className="h-5 bg-slate-200 rounded w-1/5"></div>
                <div className="h-5 bg-slate-200 rounded w-1/6"></div>
              </div>
            ))}
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="bg-slate-100 rounded-2xl p-12 border border-slate-200 text-center">
            <FileText size={60} className="mx-auto text-slate-300 mb-4" />
            <h2 className="text-xl font-semibold text-slate-700">Belum Ada Invoice</h2>
            <p className="text-slate-500 mt-2">Mulai dengan membuat invoice baru</p>
          </div>
        ) : (
          <div className="bg-slate-100 rounded-2xl border border-slate-200 shadow-sm">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Invoice</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Klien</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Jumlah</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Terbayar</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <button
                        onClick={() => navigate(`/finance/invoices/${invoice.id}`)}
                        className="text-brand-600 font-semibold hover:text-brand-700"
                      >
                        {invoice.invoice_number}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-slate-900">{invoice.client_name}</td>
                    <td className="px-6 py-4 text-slate-900">{formatCurrency(invoice.total_amount)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-200 rounded-full h-2 max-w-xs">
                          <div
                            className="bg-brand-500 h-2 rounded-full"
                            style={{ width: `${(invoice.paid_amount / invoice.total_amount) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-slate-600 w-8">
                          {Math.round((invoice.paid_amount / invoice.total_amount) * 100)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(invoice.status)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/finance/invoices/${invoice.id}`)}
                          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                          title="Lihat Detail"
                        >
                          <FileText size={18} />
                        </button>
                        
                        <div className="relative">
                            <button
                              onClick={() => setActiveDownloadMenu(activeDownloadMenu === invoice.id ? null : invoice.id)}
                              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                              title="Download Invoice"
                            >
                              <Download size={18} />
                            </button>
                            
                            {activeDownloadMenu === invoice.id && (
                              <>
                                <div
                                  className="fixed inset-0 z-40"
                                  onClick={() => setActiveDownloadMenu(null)}
                                ></div>
                                <div className="absolute right-0 mt-2 w-32 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-50">
                                  <button
                                    onClick={() => {
                                      setActiveDownloadMenu(null)
                                      downloadInvoice(invoice.id, 'pdf')
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 border-b border-slate-100"
                                  >
                                    <span className="text-red-500 font-medium">PDF</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setActiveDownloadMenu(null)
                                      downloadInvoice(invoice.id, 'word')
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 border-b border-slate-100"
                                  >
                                    <span className="text-blue-500 font-medium">Word</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setActiveDownloadMenu(null)
                                      downloadInvoice(invoice.id, 'excel')
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                  >
                                    <span className="text-green-500 font-medium">Excel</span>
                                  </button>
                                </div>
                              </>
                            )}
                        </div>

                        {invoice.status !== 'paid' && (
                          <button
                            onClick={() => navigate(`/finance/invoices/${invoice.id}/edit`)}
                            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition z-10"
                            title="Edit"
                          >
                            <Edit2 size={18} />
                          </button>
                        )}
                        {invoice.status === 'unpaid' && (
                          <button
                            onClick={() => handleDelete(invoice.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition z-10"
                            title="Hapus"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
