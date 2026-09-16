import React, { useState, useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useFinance } from '../../context/FinanceContext'
import { useTaskContext } from '../../context/TaskContext'
import AppLayout from '../../layouts/AppLayout'

export default function CreateInvoice() {
  const navigate = useNavigate()
  const { createInvoice } = useFinance()
  const { projects } = useTaskContext()
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const [formData, setFormData] = useState({
    project_id: '',
    client_name: '',
    client_email: '',
    client_phone: '',
    description: '',
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    total_amount: '',
    notes: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    const result = await createInvoice({
      ...formData,
      total_amount: parseFloat(formData.total_amount)
    })

    setIsLoading(false)

    if (result && result.success) {
      navigate('/finance/invoices')
    } else {
      const message = (result && result.message) ? result.message : 'Gagal membuat invoice'
      if (result && result.errors) {
        setErrors(result.errors)
      }
      alert(message)
      console.error('Invoice create failed:', result)
    }
  }

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
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Buat Invoice</h1>
            <p className="mt-2 text-slate-500">Buat invoice baru untuk project Anda</p>
          </div>
        </div>

        {/* Form */}
          <div className="bg-slate-100 rounded-2xl border border-slate-200 shadow-sm p-8 max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Project Selection */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Project *
              </label>
              <select
                name="project_id"
                value={formData.project_id}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">-- Pilih Project --</option>
                {projects?.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
              {errors.project_id && (
                <p className="mt-2 text-sm text-red-600">{errors.project_id[0]}</p>
              )}
            </div>

            {/* Client Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Nama Klien *
                </label>
                <input
                  type="text"
                  name="client_name"
                  value={formData.client_name}
                  onChange={handleChange}
                  required
                  placeholder="PT. Contoh Perusahaan"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                {errors.client_name && (
                  <p className="mt-2 text-sm text-red-600">{errors.client_name[0]}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email Klien
                </label>
                <input
                  type="email"
                  name="client_email"
                  value={formData.client_email}
                  onChange={handleChange}
                  placeholder="klien@example.com"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                  {errors.client_email && (
                    <p className="mt-2 text-sm text-red-600">{errors.client_email[0]}</p>
                  )}
              </div>
            </div>

            {/* Phone & Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  No. WhatsApp
                </label>
                <input
                  type="text"
                  name="client_phone"
                  value={formData.client_phone}
                  onChange={handleChange}
                  placeholder="628123456789"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                  {errors.client_phone && (
                    <p className="mt-2 text-sm text-red-600">{errors.client_phone[0]}</p>
                  )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Tanggal Invoice *
                </label>
                <input
                  type="date"
                  name="invoice_date"
                  value={formData.invoice_date}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                  {errors.invoice_date && (
                    <p className="mt-2 text-sm text-red-600">{errors.invoice_date[0]}</p>
                  )}
              </div>
            </div>

            {/* Due Date & Amount */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Tanggal Jatuh Tempo *
                </label>
                <input
                  type="date"
                  name="due_date"
                  value={formData.due_date}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                  {errors.due_date && (
                    <p className="mt-2 text-sm text-red-600">{errors.due_date[0]}</p>
                  )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Total Tagihan (Rp) *
                </label>
                <input
                  type="number"
                  name="total_amount"
                  value={formData.total_amount}
                  onChange={handleChange}
                  required
                  placeholder="10000000"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                  {errors.total_amount && (
                    <p className="mt-2 text-sm text-red-600">{errors.total_amount[0]}</p>
                  )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Deskripsi Pekerjaan
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Jelaskan pekerjaan atau deliverables yang dilakukan..."
                rows="4"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Catatan Tambahan
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Syarat pembayaran, bank transfer, dll..."
                rows="3"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={() => navigate('/finance/invoices')}
                className="flex-1 px-6 py-3 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 transition"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-700 disabled:bg-brand-400 transition"
              >
                {isLoading ? 'Menyimpan...' : 'Buat Invoice'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  )
}
