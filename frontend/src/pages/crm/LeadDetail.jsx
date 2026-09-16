import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useCrm } from '../../context/CrmContext'
import WhatsAppButton from '../../components/crm/WhatsAppButton'
import {
  ArrowLeft, MapPin, Phone, Globe, Star, Clock,
  ActivitySquare, CheckCircle2, Loader2, PlusCircle, ChevronDown,
} from 'lucide-react'

// ── Status config ────────────────────────────────────────────
const STATUS_CONFIG = {
  'New':         { bg: 'bg-blue-100',    text: 'text-blue-700' },
  'Contacted':   { bg: 'bg-purple-100',  text: 'text-purple-700' },
  'Follow Up':   { bg: 'bg-amber-100',   text: 'text-amber-700' },
  'Negotiation': { bg: 'bg-orange-100',  text: 'text-orange-700' },
  'Proposal':    { bg: 'bg-rose-100',    text: 'text-rose-700' },
  'Closed Won':  { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  'Closed Lost': { bg: 'bg-red-100',     text: 'text-red-700' },
}

const ACTIVITY_TYPES = [
  'WhatsApp Click',
  'Follow Up',
  'Phone Call',
  'Meeting',
  'Proposal Sent',
  'Deal',
  'Import Lead',
  'Other',
]

const ACTIVITY_COLORS = {
  'WhatsApp Click':  'bg-emerald-100 text-emerald-700',
  'Follow Up':       'bg-blue-100 text-blue-700',
  'Phone Call':      'bg-purple-100 text-purple-700',
  'Meeting':         'bg-violet-100 text-violet-700',
  'Proposal Sent':   'bg-orange-100 text-orange-700',
  'Deal':            'bg-amber-100 text-amber-700',
  'Import Lead':     'bg-gray-100 text-gray-600',
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { bg: 'bg-gray-100', text: 'text-gray-600' }
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${cfg.bg} ${cfg.text}`}>
      {status}
    </span>
  )
}

function ActivityItem({ act }) {
  const color = ACTIVITY_COLORS[act.activity_type] || 'bg-gray-100 text-gray-600'
  const date = new Date(act.created_at).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
  return (
    <div className="flex items-start gap-3 py-3 border-t border-gray-50 first:border-0">
      <div className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold ${color}`}>
        {act.activity_type}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-700 leading-relaxed">{act.notes || '—'}</p>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-xs text-gray-400">{date}</span>
          {act.kpi_points > 0 && (
            <span className="text-xs font-semibold text-amber-600">+{act.kpi_points} pts</span>
          )}
          {act.user?.name && (
            <span className="text-xs text-gray-400">oleh {act.user.name}</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default function LeadDetail() {
  const { id } = useParams()
  const {
    currentLead, currentLeadLoading,
    leadActivities, activitiesLoading,
    fetchLeadById, fetchLeadActivities,
    updateLeadStatus, logActivity,
  } = useCrm()

  const [activityType, setActivityType] = useState(ACTIVITY_TYPES[0])
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [statusUpdating, setStatusUpdating] = useState(false)

  useEffect(() => {
    fetchLeadById(id)
    fetchLeadActivities(id)
  }, [id, fetchLeadById, fetchLeadActivities])

  // ── Handle status change ────────────────────────────────
  const handleStatusChange = async (e) => {
    setStatusUpdating(true)
    await updateLeadStatus(parseInt(id), e.target.value)
    setStatusUpdating(false)
  }

  // ── Handle log activity ─────────────────────────────────
  const handleLogActivity = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    await logActivity(parseInt(id), activityType, notes)
    setNotes('')
    setSubmitting(false)
  }

  // ── Loading state ───────────────────────────────────────
  if (currentLeadLoading || !currentLead) {
    return (
      <div className="p-8 flex flex-col items-center justify-center gap-3 min-h-[40vh] text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
        <p className="text-sm">Memuat detail lead…</p>
      </div>
    )
  }

  const lead = currentLead

  return (
    <div className="p-8 space-y-6 min-h-screen bg-gray-50/50">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/crm/leads"
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali
        </Link>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900">{lead.company_name}</h2>
          {lead.category && (
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md mt-1 inline-block">
              {lead.category}
            </span>
          )}
        </div>
        <StatusBadge status={lead.status} />
      </div>

      {/* Body Grid */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* ── Kolom Kiri: Info + Log Aktivitas ──────────────── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Info Card */}
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Informasi Lead</h3>
            <div className="space-y-4">
              {/* Lokasi */}
              <div className="flex items-start gap-3 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Lokasi</p>
                  <p>{lead.address || '—'}</p>
                  <p className="text-gray-400">{[lead.city, lead.province, lead.country].filter(Boolean).join(', ') || '—'}</p>
                </div>
              </div>

              {/* Kontak */}
              <div className="flex items-start gap-3 text-sm text-gray-600">
                <Phone className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Kontak</p>
                  <p className="font-mono">{lead.phone || lead.whatsapp || '—'}</p>
                  {lead.whatsapp && <p className="text-emerald-600 text-xs mt-0.5">WhatsApp tersedia</p>}
                </div>
              </div>

              {/* Website */}
              {lead.website && (
                <div className="flex items-start gap-3 text-sm text-gray-600">
                  <Globe className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Website</p>
                    <a href={lead.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline break-all">
                      {lead.website}
                    </a>
                  </div>
                </div>
              )}

              {/* Rating */}
              {lead.rating && (
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Star className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Google Rating</p>
                    <p className="text-amber-600 font-semibold">{lead.rating} / 5</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Log Aktivitas Panel */}
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
              <ActivitySquare className="w-5 h-5 text-blue-500" />
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">Log Aktivitas</h3>
                <p className="text-xs text-gray-400">Setiap aktivitas menambah poin KPI Anda</p>
              </div>
            </div>

            {/* Form tambah aktivitas */}
            <form onSubmit={handleLogActivity} className="p-6 space-y-4 border-b border-gray-100">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Jenis Aktivitas
                  </label>
                  <div className="relative">
                    <select
                      value={activityType}
                      onChange={e => setActivityType(e.target.value)}
                      className="w-full h-10 pl-3 pr-8 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                    >
                      {ACTIVITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Catatan (opsional)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Keterangan singkat…"
                    className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                {submitting
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan…</>
                  : <><PlusCircle className="w-4 h-4" /> Simpan Aktivitas</>
                }
              </button>
            </form>

            {/* Daftar aktivitas */}
            <div className="px-6 pb-4">
              {activitiesLoading ? (
                <div className="py-10 flex justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
                </div>
              ) : leadActivities.length === 0 ? (
                <div className="py-10 text-center">
                  <Clock className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Belum ada aktivitas tercatat</p>
                </div>
              ) : (
                <div>
                  {leadActivities.map(act => <ActivityItem key={act.id} act={act} />)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Kolom Kanan: Actions ───────────────────────────── */}
        <div className="space-y-6">

          {/* Status Card */}
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Ubah Status</h3>
            <div className="relative">
              <select
                className="w-full h-11 pl-3 pr-8 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                value={lead.status}
                onChange={handleStatusChange}
                disabled={statusUpdating}
              >
                {Object.keys(STATUS_CONFIG).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              {statusUpdating
                ? <Loader2 className="absolute right-3 top-3.5 w-4 h-4 animate-spin text-blue-400 pointer-events-none" />
                : <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
              }
            </div>
            <p className="text-xs text-gray-400 mt-2">Status berubah otomatis mencatat poin KPI</p>
          </div>

          {/* WhatsApp Card */}
          {lead.whatsapp && (
            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Kontak Cepat</h3>
              <WhatsAppButton lead={lead} className="w-full justify-center h-11" />
            </div>
          )}

          {/* Info KPI */}
          <div className="bg-emerald-50 rounded-2xl p-5">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-emerald-800">Poin KPI Otomatis</p>
                <p className="text-xs text-emerald-600 mt-1">
                  Setiap aktivitas yang Anda catat — WhatsApp, Follow Up, Proposal, Deal — akan otomatis menambah skor KPI Anda dan tercatat di dashboard marketing.
                </p>
              </div>
            </div>
          </div>

          {/* Meta info */}
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-5 space-y-2 text-xs text-gray-500">
            <div className="flex justify-between">
              <span>Sumber</span>
              <span className="font-medium text-gray-700">{lead.source || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span>Ditambahkan</span>
              <span className="font-medium text-gray-700">
                {new Date(lead.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            </div>
            {lead.activities?.length !== undefined && (
              <div className="flex justify-between">
                <span>Total Aktivitas</span>
                <span className="font-semibold text-blue-600">{lead.activities.length}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
