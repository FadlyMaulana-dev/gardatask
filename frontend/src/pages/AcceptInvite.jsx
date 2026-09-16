import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Shield, Loader2, CheckCircle2, User, KeyRound } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { API_URL } from '../lib/api'

export default function AcceptInvite() {
  const { token } = useParams()
  const navigate = useNavigate()
  const { login } = useAuth() 
  const [checking, setChecking] = useState(true)
  const [email, setEmail] = useState('')
  const [invalid, setInvalid] = useState(false)
  
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch(`${API_URL}/invitations/${token}`)
      .then(res => res.json().then(data => ({ status: res.status, data })))
      .then(({ status, data }) => {
        if (status === 200 && data.valid) {
          setEmail(data.email)
        } else {
          setInvalid(true)
        }
      })
      .catch(() => setInvalid(true))
      .finally(() => setChecking(false))
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    
    try {
      const res = await fetch(`${API_URL}/invitations/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          name,
          password,
          password_confirmation: password
        })
      })
      const data = await res.json()
      
      if (res.ok) {
        // Save token and login user automatically
        login(data.user, data.token)
        navigate('/dashboard')
      } else {
        setError(data.message || 'Pendaftaran gagal. Pastikan format sudah benar.')
      }
    } catch (err) {
      setError('Terjadi masalah jaringan. Silakan coba sebentar lagi.')
    } finally {
      setSubmitting(false)
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    )
  }

  if (invalid) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-sm max-w-sm w-full border border-slate-200">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 mx-auto mb-4">
            <Shield size={24} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Token Tidak Valid</h2>
          <p className="text-slate-600 text-sm mb-6">Undangan ini sudah kadaluarsa, tidak ditemukan, atau email Anda sudah terdaftar di sistem.</p>
          <button onClick={() => navigate('/login')} className="w-full py-2 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition">
            Kembali ke Halaman Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm max-w-md w-full border border-slate-200">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 bg-brand-600 rounded-xl flex items-center justify-center text-white shadow-md">
              <CheckCircle2 size={24} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Bergabung ke Tim</h2>
          <p className="text-slate-600 mt-2 text-sm leading-relaxed">Anda telah diundang untuk bergabung ke aplikasi menggunakan alamat email <strong className="text-slate-900 font-semibold">{email}</strong>.</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-1.5">Nama Lengkap</label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="cth. Budi Santoso"
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
              <User className="absolute left-3 top-2.5 text-slate-400" size={18} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-1.5">Buat Password</label>
            <div className="relative">
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Minimal 8 karakter"
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
              <KeyRound className="absolute left-3 top-2.5 text-slate-400" size={18} />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 mt-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white rounded-xl font-medium flex justify-center items-center gap-2 transition shadow-sm"
          >
            {submitting ? <><Loader2 size={18} className="animate-spin" /> Mendaftarkan...</> : 'Terima Undangan & Daftar'}
          </button>
        </form>
      </div>
    </div>
  )
}
