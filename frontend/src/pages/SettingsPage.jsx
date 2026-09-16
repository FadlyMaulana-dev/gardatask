import React, { useState, useEffect } from 'react'
import {
  Bell, Palette, Lock, Save, ArrowLeft,
  User, CheckCircle, AlertCircle, Eye, EyeOff, Settings
} from 'lucide-react'
import AppLayout from '../layouts/AppLayout'
import { useAuth } from '../context/AuthContext'
import { API_URL } from '../lib/api'

// Reusable Toggle Switch component
function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-brand-600' : 'bg-slate-300'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  )
}

// Toast notification
function Toast({ type, message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000)
    return () => clearTimeout(t)
  }, [onClose])
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-white text-sm font-medium transition-all ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
      {type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
      {message}
    </div>
  )
}

export default function SettingsPage() {
  const { token, user: authUser } = useAuth()
  const [activeTab, setActiveTab] = useState('general')
  const [toast, setToast] = useState(null)

  // ─── General / Profile ────────────────────────────────────────────────────
  const [name, setName] = useState(authUser?.name || '')
  const [email, setEmail] = useState(authUser?.email || '')
  const [savingProfile, setSavingProfile] = useState(false)

  const handleSaveProfile = async () => {
    setSavingProfile(true)
    try {
      const res = await fetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, email })
      })
      const data = await res.json()
      if (res.ok) {
        setToast({ type: 'success', message: data.message || 'Profil berhasil disimpan!' })
      } else {
        setToast({ type: 'error', message: data.message || 'Gagal menyimpan profil.' })
      }
    } catch {
      setToast({ type: 'error', message: 'Terjadi kesalahan jaringan.' })
    } finally {
      setSavingProfile(false)
    }
  }

  // ─── Notifications ─────────────────────────────────────────────────────────
  const NOTIF_KEYS = ['email_notif', 'push_notif', 'task_assigned', 'task_mentioned', 'comment_replies', 'task_due_soon']
  const NOTIF_LABELS = {
    email_notif:     { title: 'Notifikasi Email', desc: 'Terima pembaruan task via email' },
    push_notif:      { title: 'Push Notifications', desc: 'Notifikasi browser langsung di layar' },
    task_assigned:   { title: 'Task Ditugaskan', desc: 'Beritahu saat ada task baru untukmu' },
    task_mentioned:  { title: 'Disebut di Task', desc: 'Beritahu saat kamu di-mention dalam task' },
    comment_replies: { title: 'Balasan Komentar', desc: 'Beritahu saat ada balasan pada komentarmu' },
    task_due_soon:   { title: 'Deadline Mendekat', desc: 'Beritahu H-1 sebelum deadline task' },
  }
  const [notifs, setNotifs] = useState(() => {
    try { return JSON.parse(localStorage.getItem('gardatask_notifs')) || Object.fromEntries(NOTIF_KEYS.map(k => [k, true])) }
    catch { return Object.fromEntries(NOTIF_KEYS.map(k => [k, true])) }
  })
  const handleSaveNotifs = () => {
    localStorage.setItem('gardatask_notifs', JSON.stringify(notifs))
    setToast({ type: 'success', message: 'Preferensi notifikasi disimpan!' })
  }

  // ─── Appearance ─────────────────────────────────────────────────────────────
  const [theme, setTheme] = useState(() => localStorage.getItem('gardatask_theme') || 'light')
  const [fontSize, setFontSize] = useState(() => localStorage.getItem('gardatask_fontsize') || 'normal')
  const [sidebarColor, setSidebarColor] = useState(() => localStorage.getItem('gardatask_sidebar') || 'dark')

  const handleSaveAppearance = () => {
    localStorage.setItem('gardatask_theme', theme)
    localStorage.setItem('gardatask_fontsize', fontSize)
    localStorage.setItem('gardatask_sidebar', sidebarColor)
    document.documentElement.style.fontSize = fontSize === 'small' ? '14px' : fontSize === 'large' ? '18px' : '16px'
    setToast({ type: 'success', message: 'Tampilan berhasil disimpan!' })
  }

  // ─── Security / Change Password ────────────────────────────────────────────
  const [curPwd, setCurPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [showPwd, setShowPwd] = useState({ cur: false, new: false, confirm: false })
  const [savingPwd, setSavingPwd] = useState(false)

  const handleChangePwd = async () => {
    if (newPwd !== confirmPwd) {
      setToast({ type: 'error', message: 'Kata sandi baru tidak cocok.' })
      return
    }
    if (newPwd.length < 8) {
      setToast({ type: 'error', message: 'Kata sandi minimal 8 karakter.' })
      return
    }
    setSavingPwd(true)
    try {
      const res = await fetch(`${API_URL}/users/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ current_password: curPwd, new_password: newPwd, new_password_confirmation: confirmPwd })
      })
      const data = await res.json()
      if (res.ok) {
        setToast({ type: 'success', message: 'Kata sandi berhasil diubah!' })
        setCurPwd(''); setNewPwd(''); setConfirmPwd('')
      } else {
        setToast({ type: 'error', message: data.message || 'Gagal mengubah kata sandi.' })
      }
    } catch {
      setToast({ type: 'error', message: 'Terjadi kesalahan jaringan.' })
    } finally {
      setSavingPwd(false)
    }
  }

  const tabs = [
    { id: 'general',       label: 'General',       icon: <User size={18} /> },
    { id: 'notifications', label: 'Notifikasi',     icon: <Bell size={18} /> },
    { id: 'appearance',    label: 'Tampilan',       icon: <Palette size={18} /> },
    { id: 'security',      label: 'Keamanan',       icon: <Lock size={18} /> },
  ]

  return (
    <AppLayout>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <div className="bg-slate-50 min-h-screen p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-slate-600 flex items-center justify-center">
                <Settings size={20} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
            </div>
            <p className="text-slate-500 ml-[52px]">Kelola akun dan preferensi GardaTask kamu</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden sticky top-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-left font-medium transition-colors border-l-4 ${
                    activeTab === tab.id
                      ? 'bg-brand-50 text-brand-600 border-brand-600'
                      : 'text-slate-600 hover:bg-slate-50 border-transparent'
                  }`}
                >
                  <span className="shrink-0">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-3 space-y-6">

            {/* ── GENERAL ── */}
            {activeTab === 'general' && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Informasi Profil</h2>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Nama Lengkap</label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Alamat Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
                    <input
                      type="text"
                      value="Project Manajer"
                      readOnly
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
                    />
                    <p className="text-xs text-slate-400 mt-1">Role hanya dapat diubah oleh administrator.</p>
                  </div>
                  <button
                    onClick={handleSaveProfile}
                    disabled={savingProfile}
                    className="flex items-center gap-2 px-6 py-2.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors font-medium disabled:opacity-60"
                  >
                    <Save size={16} />
                    {savingProfile ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </button>
                </div>
              </div>
            )}

            {/* ── NOTIFICATIONS ── */}
            {activeTab === 'notifications' && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-2">Preferensi Notifikasi</h2>
                <p className="text-sm text-slate-500 mb-6">Pengaturan disimpan di perangkatmu (lokal).</p>
                <div className="space-y-3">
                  {NOTIF_KEYS.map(key => (
                    <div key={key} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                      <div>
                        <p className="font-medium text-slate-900">{NOTIF_LABELS[key].title}</p>
                        <p className="text-sm text-slate-500 mt-0.5">{NOTIF_LABELS[key].desc}</p>
                      </div>
                      <Toggle checked={!!notifs[key]} onChange={val => setNotifs(prev => ({ ...prev, [key]: val }))} />
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleSaveNotifs}
                  className="mt-6 flex items-center gap-2 px-6 py-2.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors font-medium"
                >
                  <Save size={16} />
                  Simpan Preferensi
                </button>
              </div>
            )}

            {/* ── APPEARANCE ── */}
            {activeTab === 'appearance' && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
                <h2 className="text-xl font-bold text-slate-900">Pengaturan Tampilan</h2>

                {/* Theme */}
                <div className="pb-6 border-b border-slate-100">
                  <h3 className="font-semibold text-slate-800 mb-4">Tema Warna</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { id: 'light', label: 'Light ☀️', preview: 'bg-white border border-slate-200' },
                      { id: 'dark',  label: 'Dark 🌙',  preview: 'bg-slate-900' },
                      { id: 'auto',  label: 'Auto 🔄',  preview: 'bg-gradient-to-r from-white to-slate-900' },
                    ].map(t => (
                      <button
                        key={t.id}
                        onClick={() => setTheme(t.id)}
                        className={`p-4 rounded-xl border-2 transition-all text-center ${theme === t.id ? 'border-brand-600 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}
                      >
                        <div className={`w-full h-14 rounded-lg mb-3 ${t.preview}`} />
                        <p className="text-sm font-semibold text-slate-800">{t.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Size */}
                <div className="pb-6 border-b border-slate-100">
                  <h3 className="font-semibold text-slate-800 mb-4">Ukuran Teks</h3>
                  <div className="space-y-2">
                    {[
                      { id: 'small',  label: 'Kecil',   size: 'text-sm' },
                      { id: 'normal', label: 'Normal',  size: 'text-base' },
                      { id: 'large',  label: 'Besar',   size: 'text-lg' },
                    ].map(f => (
                      <label key={f.id} className={`flex items-center gap-3 p-3.5 rounded-xl cursor-pointer border-2 transition-all ${fontSize === f.id ? 'border-brand-500 bg-brand-50' : 'border-transparent bg-slate-50 hover:bg-slate-100'}`}>
                        <input type="radio" name="font" value={f.id} checked={fontSize === f.id} onChange={() => setFontSize(f.id)} className="w-4 h-4 accent-brand-600" />
                        <span className={`font-medium text-slate-800 ${f.size}`}>{f.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleSaveAppearance}
                  className="flex items-center gap-2 px-6 py-2.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors font-medium"
                >
                  <Save size={16} />
                  Terapkan Tampilan
                </button>
              </div>
            )}

            {/* ── SECURITY ── */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                {/* Change Password */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h2 className="text-xl font-bold text-slate-900 mb-6">Ubah Kata Sandi</h2>
                  <div className="space-y-4">
                    {[
                      { label: 'Kata Sandi Saat Ini', val: curPwd, set: setCurPwd, key: 'cur' },
                      { label: 'Kata Sandi Baru',     val: newPwd, set: setNewPwd, key: 'new' },
                      { label: 'Konfirmasi Kata Sandi Baru', val: confirmPwd, set: setConfirmPwd, key: 'confirm' },
                    ].map(field => (
                      <div key={field.key}>
                        <label className="block text-sm font-medium text-slate-700 mb-2">{field.label}</label>
                        <div className="relative">
                          <input
                            type={showPwd[field.key] ? 'text' : 'password'}
                            value={field.val}
                            onChange={e => field.set(e.target.value)}
                            className="w-full px-4 py-2.5 pr-11 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                          />
                          <button type="button" onClick={() => setShowPwd(s => ({ ...s, [field.key]: !s[field.key] }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                            {showPwd[field.key] ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Strength hint */}
                    {newPwd && (
                      <div className="text-xs text-slate-500">
                        Kekuatan sandi:&nbsp;
                        <span className={
                          newPwd.length >= 12 ? 'text-green-600 font-semibold' :
                          newPwd.length >= 8  ? 'text-yellow-600 font-semibold' :
                          'text-red-500 font-semibold'
                        }>
                          {newPwd.length >= 12 ? 'Kuat ✓' : newPwd.length >= 8 ? 'Sedang' : 'Lemah (min. 8 karakter)'}
                        </span>
                      </div>
                    )}

                    <button
                      onClick={handleChangePwd}
                      disabled={savingPwd || !curPwd || !newPwd || !confirmPwd}
                      className="flex items-center gap-2 px-6 py-2.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors font-medium disabled:opacity-50"
                    >
                      <Lock size={16} />
                      {savingPwd ? 'Menyimpan...' : 'Ubah Kata Sandi'}
                    </button>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
                  <h3 className="font-bold text-red-600 mb-2 text-lg">⚠️ Zona Berbahaya</h3>
                  <p className="text-sm text-slate-600 mb-4">Menghapus akun bersifat permanen dan tidak dapat dibatalkan. Semua data Anda akan hilang.</p>
                  <button
                    onClick={() => { if (window.confirm('Apakah kamu yakin ingin menghapus akun? Tindakan ini tidak bisa dibatalkan!')) alert('Fitur ini memerlukan konfirmasi admin terlebih dahulu.') }}
                    className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    Hapus Akun Ini
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
