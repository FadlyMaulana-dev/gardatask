import React, { useState, useEffect, useCallback } from 'react'
import {
  Banknote, Trophy, Star, TrendingUp, Users, Clock,
  CheckCircle2, XCircle, ChevronDown, ChevronUp, AlertTriangle, HelpCircle
} from 'lucide-react'
import AppLayout from '../layouts/AppLayout'
import { useAuth } from '../context/AuthContext'
import ModuleGuideModal from '../components/ModuleGuideModal'
import { API_URL } from '../lib/api'

const PAYROLL_GUIDE = {
  title: 'Panduan — GardaScore™ Payroll',
  description: 'Modul Penggajian GardaScore™ menghitung gaji karyawan secara otomatis berdasarkan kontribusi nyata yang terukur dari setiap task yang diselesaikan. Tidak ada subjektivitas — semua berbasis data.',
  workflows: [
    { title: 'Anggota menyelesaikan Task', desc: 'Karyawan mengerjakan dan memindahkan kartu task ke kolom "Done" di halaman Kanban.' },
    { title: 'Sistem Menghitung Poin', desc: 'Backend otomatis menghitung GardaPoints berdasarkan kategori task, estimasi jam, dan prioritas yang ditetapkan.' },
    { title: 'Modifier Deadline diterapkan', desc: 'Selesai tepat waktu: ×1.1 (bonus). Setiap hari terlambat: -5% (penalti, minimum ×0.7).' },
    { title: 'Modifier Kualitas diterapkan', desc: 'Manajer menilai hasil: Exceeded ×1.2 | Meets Expectation ×1.0 | Needs Revision ×0.8.' },
    { title: 'Distribusi Gaji Dihitung', desc: 'Gaji Total = Gaji Pokok + Bonus. Bonus = 30% dari total pool gaji × (poin individu ÷ total poin tim).' },
  ],
  kpis: [
    { metric: 'Kategori Task (Base Poin)', weight: '5–20 poin', desc: 'Bug Fix=5, UI Minor=7, UI Major=10, Frontend/Backend=15, API/Database/Deploy=20 poin.' },
    { metric: 'Estimasi Jam', weight: '+1–5 poin', desc: 'Setiap 4 jam estimasi mendapat +1 poin bonus (maks. +5 poin untuk task besar).' },
    { metric: 'Prioritas Task', weight: '+0–5 poin', desc: 'Low=+0, Medium=+2, High=+3, Urgent=+5 poin tambahan.' },
    { metric: 'Deadline Multiplier', weight: '×0.7–×1.1', desc: 'Tepat waktu ×1.1. Setiap hari telat mengurangi 5%, minimum ×0.7.' },
    { metric: 'Quality Multiplier', weight: '×0.8–×1.2', desc: 'Exceeded Expectation ×1.2 | Meets Expectation ×1.0 | Needs Revision ×0.8.' },
  ]
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
const MONTH_NAMES = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']
const RANK_COLORS = { 1: 'text-yellow-500', 2: 'text-slate-400', 3: 'text-amber-600' }
const RANK_MEDALS = { 1: '🥇', 2: '🥈', 3: '🥉' }

const BREAKDOWN_LABELS = {
  bug_fix: 'Bug Fix', ui_minor: 'UI Minor', ui_major: 'UI Major',
  frontend: 'Frontend', backend: 'Backend', api: 'API Integration',
  database: 'DB Migration', deployment: 'Deployment',
}

// ─── Employee Row ─────────────────────────────────────────────────────────────
function EmployeeRow({ emp, includeBaseSalary }) {
  const [expanded, setExpanded] = useState(false)
  const medal = RANK_MEDALS[emp.rank] || `#${emp.rank}`
  const rankColor = RANK_COLORS[emp.rank] || 'text-slate-700'

  const hasBreakdown = Object.values(emp.breakdown || {}).some(v => v > 0)

  return (
    <>
      <tr
        className={`border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer ${expanded ? 'bg-slate-50' : ''}`}
        onClick={() => setExpanded(!expanded)}
      >
        {/* Rank */}
        <td className="px-4 py-3 text-center">
          <span className={`text-lg font-bold ${rankColor}`}>{medal}</span>
        </td>

        {/* Name */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {emp.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-slate-900 text-sm">{emp.name}</p>
              <p className="text-xs text-slate-500">{emp.email}</p>
            </div>
          </div>
        </td>

        {/* Tasks */}
        <td className="px-4 py-3 text-center">
          <span className="text-sm font-bold text-slate-900">{emp.total_tasks}</span>
        </td>

        {/* Points */}
        <td className="px-4 py-3 text-center">
          <span className="inline-flex items-center gap-1 bg-brand-100 text-brand-700 px-3 py-1 rounded-full text-sm font-bold">
            <Star size={12} />
            {emp.total_points}
          </span>
        </td>

        {/* Contribution */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-brand-500 rounded-full transition-all"
                style={{ width: `${Math.min(emp.contribution_pct, 100)}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-slate-700 w-10 text-right">{emp.contribution_pct}%</span>
          </div>
        </td>

        {/* On-Time / Late */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-3 justify-center">
            <span className="flex items-center gap-1 text-green-600 text-xs font-semibold">
              <CheckCircle2 size={12} /> {emp.on_time_count}
            </span>
            <span className="flex items-center gap-1 text-red-500 text-xs font-semibold">
              <XCircle size={12} /> {emp.late_count}
            </span>
          </div>
        </td>

        {/* Gaji Total */}
        <td className="px-4 py-3 text-right">
          <div>
            <p className="text-sm font-bold text-slate-900">{fmt(includeBaseSalary ? emp.total_salary : emp.bonus_salary)}</p>
            {includeBaseSalary && <p className="text-xs text-green-600 font-medium">+{fmt(emp.bonus_salary)} bonus</p>}
          </div>
        </td>

        {/* Expand */}
        <td className="px-3 py-3 text-center">
          {hasBreakdown
            ? (expanded ? <ChevronUp size={16} className="text-slate-400 mx-auto" /> : <ChevronDown size={16} className="text-slate-400 mx-auto" />)
            : null
          }
        </td>
      </tr>

      {/* Expanded Breakdown Row */}
      {expanded && hasBreakdown && (
        <tr className="bg-slate-50">
          <td colSpan={8} className="px-6 py-4">
            <p className="text-xs font-semibold text-slate-500 uppercase mb-3">Breakdown Poin per Kategori Task</p>
            <div className="grid grid-cols-4 gap-3">
              {Object.entries(emp.breakdown).map(([key, val]) =>
                val > 0 ? (
                  <div key={key} className="bg-white border border-slate-200 rounded-lg px-3 py-2">
                    <p className="text-xs text-slate-500">{BREAKDOWN_LABELS[key] ?? key}</p>
                    <p className="text-sm font-bold text-brand-600">{val} pts</p>
                  </div>
                ) : null
              )}
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3">
              <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                <p className="text-xs text-green-700">Kualitas Exceeded</p>
                <p className="text-sm font-bold text-green-800">{emp.exceeded_count}x</p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                <p className="text-xs text-red-700">Kualitas Revision</p>
                <p className="text-sm font-bold text-red-800">{emp.revision_count}x</p>
              </div>
              {includeBaseSalary && (
                <div className="bg-brand-50 border border-brand-200 rounded-lg px-3 py-2">
                  <p className="text-xs text-brand-700">Gaji Pokok</p>
                  <p className="text-sm font-bold text-brand-800">{fmt(emp.base_salary)}</p>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PayrollPage() {
  const { token } = useAuth()
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showGuide, setShowGuide] = useState(false)
  const [includeBaseSalary, setIncludeBaseSalary] = useState(true)

  const fetchPayroll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(
        `${API_URL}/payroll/summary?month=${month}&year=${year}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setData(json.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [token, month, year])

  useEffect(() => { fetchPayroll() }, [fetchPayroll])

  const employees = data?.employees ?? []
  const totalBudget = employees.reduce((s, e) => s + (includeBaseSalary ? e.total_salary : e.bonus_salary), 0)
  const totalBonus  = employees.reduce((s, e) => s + e.bonus_salary, 0)
  const grandPoints = data?.grand_total_points ?? 0

  const years = [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1]

  return (
    <AppLayout>
      <ModuleGuideModal {...PAYROLL_GUIDE} isOpen={showGuide} onClose={() => setShowGuide(false)} />
      <div className="bg-slate-50 min-h-screen p-8">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center">
                <Banknote size={20} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900">GardaScore™ Payroll</h1>
            </div>
            <p className="text-slate-500 ml-[52px]">Sistem penggajian berbasis kontribusi kinerja nyata</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Toggle Gaji Pokok */}
            <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-2.5 rounded-xl border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors" title="Aktifkan untuk menambahkan Gaji Pokok ke perhitungan">
              <div className="relative">
                <input type="checkbox" className="sr-only" checked={includeBaseSalary} onChange={() => setIncludeBaseSalary(!includeBaseSalary)} />
                <div className={`block w-10 h-6 rounded-full transition-colors ${includeBaseSalary ? 'bg-brand-500' : 'bg-slate-300'}`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${includeBaseSalary ? 'transform translate-x-4' : ''}`}></div>
              </div>
              <span className="text-sm font-medium text-slate-700">Gaji Pokok</span>
            </label>

            {/* Guide Button */}
            <button
              onClick={() => setShowGuide(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-brand-50 hover:border-brand-300 hover:text-brand-700 transition-all text-sm font-medium shadow-sm"
            >
              <HelpCircle size={16} />
              Panduan Modul
            </button>

            {/* Period Filter */}
            <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm">
            <select
              value={month}
              onChange={e => setMonth(+e.target.value)}
              className="text-sm font-semibold text-slate-800 focus:outline-none bg-transparent"
            >
              {MONTH_NAMES.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
            <select
              value={year}
              onChange={e => setYear(+e.target.value)}
              className="text-sm font-semibold text-slate-800 focus:outline-none bg-transparent"
            >
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-5 mb-8">
          {[
            {
              icon: <Users size={20} className="text-blue-600" />,
              bg: 'bg-blue-50',
              label: 'Jumlah Karyawan',
              value: employees.length,
              sub: 'orang aktif',
            },
            {
              icon: <Star size={20} className="text-brand-600" />,
              bg: 'bg-brand-50',
              label: 'Total GardaPoints',
              value: grandPoints.toLocaleString('id-ID'),
              sub: `periode ${MONTH_NAMES[month-1]} ${year}`,
            },
            {
              icon: <TrendingUp size={20} className="text-green-600" />,
              bg: 'bg-green-50',
              label: 'Total Bonus Kinerja',
              value: fmt(totalBonus),
              sub: '30% dari pool gaji',
            },
            {
              icon: <Banknote size={20} className="text-purple-600" />,
              bg: 'bg-purple-50',
              label: 'Total Anggaran Gaji',
              value: fmt(totalBudget),
              sub: includeBaseSalary ? 'gaji pokok + bonus' : 'hanya bonus kinerja',
            },
          ].map((c, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <div className={`w-10 h-10 ${c.bg} rounded-lg flex items-center justify-center mb-3`}>{c.icon}</div>
              <p className="text-sm text-slate-500 mb-1">{c.label}</p>
              <p className="text-2xl font-bold text-slate-900">{c.value}</p>
              <p className="text-xs text-slate-500 mt-1">{c.sub}</p>
            </div>
          ))}
        </div>

        {/* Alur Sistem GardaScore */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-8">
          <h2 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
            <Trophy size={18} className="text-yellow-500" /> Alur Sistem GardaScore™
          </h2>
          <div className="grid grid-cols-5 gap-2 items-center">
            {[
              { step: '1', title: 'Task Selesai', desc: 'Anggota memindahkan task ke kolom Done di Kanban', color: 'bg-blue-100 border-blue-300 text-blue-800' },
              { step: '→', title: '', desc: '', color: '' },
              { step: '2', title: 'Poin Dihitung', desc: 'Sistem auto-kalkulasi poin: Kategori + Estimasi Jam + Prioritas + Deadline ± Kualitas', color: 'bg-brand-100 border-brand-300 text-brand-800' },
              { step: '→', title: '', desc: '', color: '' },
              { step: '3', title: 'Gaji Dihitung', desc: 'Gaji = Pokok + Bonus (proporsi kontribusi poin dari total pool)', color: 'bg-green-100 border-green-300 text-green-800' },
            ].map((s, i) =>
              s.step === '→'
                ? <div key={i} className="flex justify-center text-slate-400 text-2xl font-light">→</div>
                : (
                  <div key={i} className={`rounded-xl border px-4 py-3 ${s.color}`}>
                    <span className="text-xs font-bold opacity-60">Step {s.step}</span>
                    <p className="font-bold text-sm mt-1">{s.title}</p>
                    <p className="text-xs mt-1 opacity-80">{s.desc}</p>
                  </div>
                )
            )}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4 text-xs text-slate-600">
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
              <p className="font-bold text-slate-700 mb-1">📊 Formula Poin</p>
              <p>Poin = (Base + Est.Hours Bonus + Priority Bonus) × Deadline Multiplier × Quality Multiplier</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
              <p className="font-bold text-slate-700 mb-1">🕐 Deadline Multiplier</p>
              <p>Tepat waktu: ×1.1 | Terlambat: ×0.7–1.0 (penalti 5% per hari)</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
              <p className="font-bold text-slate-700 mb-1">⭐ Quality Multiplier</p>
              <p>Exceeded: ×1.2 | Meets: ×1.0 | Revision: ×0.8</p>
            </div>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <Trophy size={18} className="text-yellow-500" />
              Leaderboard Karyawan — {MONTH_NAMES[month - 1]} {year}
            </h2>
            <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              Klik baris untuk detail
            </span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="h-10 w-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-500 mt-4 text-sm">Menghitung GardaScore™...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-red-500">
              <AlertTriangle size={40} className="mb-3" />
              <p className="font-medium">Gagal memuat data: {error}</p>
            </div>
          ) : employees.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Clock size={48} className="mb-4" />
              <p className="font-semibold text-lg">Belum ada task selesai</p>
              <p className="text-sm mt-1">Selesaikan task di Kanban untuk periode ini agar poin terakumulasi.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase w-14">Rank</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Karyawan</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Tasks</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">GardaPoints</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Kontribusi</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Tepat/Telat</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Gaji Bulan Ini</th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => (
                  <EmployeeRow key={emp.user_id} emp={emp} includeBaseSalary={includeBaseSalary} />
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </AppLayout>
  )
}
