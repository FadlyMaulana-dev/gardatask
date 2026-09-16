import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCrm } from '../../context/CrmContext'
import WhatsAppButton from '../../components/crm/WhatsAppButton'
import { Search, Filter, Phone, MapPin, ChevronRight, Loader2 } from 'lucide-react'

// Status config
const STATUS_CONFIG = {
  'New':         { bg: 'bg-blue-100',    text: 'text-blue-700',    dot: 'bg-blue-500' },
  'Contacted':   { bg: 'bg-purple-100',  text: 'text-purple-700',  dot: 'bg-purple-500' },
  'Follow Up':   { bg: 'bg-amber-100',   text: 'text-amber-700',   dot: 'bg-amber-500' },
  'Negotiation': { bg: 'bg-orange-100',  text: 'text-orange-700',  dot: 'bg-orange-500' },
  'Proposal':    { bg: 'bg-rose-100',    text: 'text-rose-700',    dot: 'bg-rose-500' },
  'Deal':        { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  'Closed Won':  { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  'Closed Lost': { bg: 'bg-red-100',     text: 'text-red-700',     dot: 'bg-red-500' },
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {status}
    </span>
  )
}

const ALL_STATUSES = ['New', 'Contacted', 'Follow Up', 'Negotiation', 'Proposal', 'Deal', 'Closed Won', 'Closed Lost']

function LeadRow({ lead, onStatusChange, updating }) {
  return (
    <tr className="group hover:bg-blue-50/30 transition-colors border-t border-gray-100">
      {/* Company */}
      <td className="py-4 pl-6 pr-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {(lead.company_name || '?')[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate max-w-[200px]">{lead.company_name}</p>
            {lead.category && (
              <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-md">{lead.category}</span>
            )}
          </div>
        </div>
      </td>
      {/* Location */}
      <td className="py-4 px-3 hidden md:table-cell">
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span className="truncate max-w-[160px]">{lead.city || lead.address || '—'}</span>
        </div>
      </td>
      {/* Phone */}
      <td className="py-4 px-3 hidden sm:table-cell">
        <div className="flex items-center gap-1.5 text-sm text-gray-600">
          <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span className="font-mono text-xs">{lead.whatsapp || lead.phone || '—'}</span>
        </div>
      </td>
      {/* Status selector */}
      <td className="py-4 px-3">
        <div className="flex items-center gap-2">
          <StatusBadge status={lead.status} />
          {updating === lead.id && <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />}
        </div>
      </td>
      {/* Actions */}
      <td className="py-4 pl-3 pr-6">
        <div className="flex items-center gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
          <select
            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 cursor-pointer"
            value={lead.status}
            onChange={e => onStatusChange(lead.id, e.target.value)}
          >
            {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {lead.whatsapp && (
            <WhatsAppButton lead={lead} className="h-8 text-xs px-3" />
          )}
          <Link
            to={`/crm/leads/${lead.id}`}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-blue-100 hover:text-blue-600 text-gray-500 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </td>
    </tr>
  )
}

export default function LeadsManagement() {
  const { leads, fetchLeads, leadsLoading, updateLeadStatus } = useCrm()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [updating, setUpdating] = useState(null) // track which row is updating

  useEffect(() => {
    fetchLeads(statusFilter ? { status: statusFilter } : {})
  }, [fetchLeads, statusFilter])

  const filtered = leads.filter(l =>
    l.company_name?.toLowerCase().includes(search.toLowerCase()) ||
    l.category?.toLowerCase().includes(search.toLowerCase()) ||
    l.city?.toLowerCase().includes(search.toLowerCase())
  )

  const handleStatusChange = async (id, status) => {
    setUpdating(id)
    await updateLeadStatus(id, status)
    setUpdating(null)
  }

  // Summary counts
  const counts = ALL_STATUSES.reduce((acc, s) => {
    acc[s] = leads.filter(l => l.status === s).length
    return acc
  }, {})

  return (
    <div className="p-8 space-y-6 min-h-screen bg-gray-50/50">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Leads Pipeline</h2>
          <p className="text-sm text-gray-500 mt-1">
            {leads.length} total leads · {counts['New'] || 0} new · {counts['Deal'] + counts['Closed Won'] || 0} won
          </p>
        </div>
        <Link
          to="/crm/scraping"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
        >
          + Import Leads
        </Link>
      </div>

      {/* Status summary pills */}
      <div className="flex gap-2 flex-wrap">
        {['New', 'Contacted', 'Follow Up', 'Proposal', 'Closed Won', 'Closed Lost'].map(s => {
          const cfg = STATUS_CONFIG[s] || {}
          const active = statusFilter === s
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(active ? '' : s)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                active
                  ? `${cfg.bg} ${cfg.text} border-transparent shadow-sm scale-105`
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              {s} <span className="ml-0.5 text-gray-400 font-normal">{counts[s] || 0}</span>
            </button>
          )
        })}
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 px-5 py-3 flex items-center gap-3">
        <Search className="w-4 h-4 text-gray-400 shrink-0" />
        <input
          type="text"
          placeholder="Search by company, category, or city…"
          className="flex-1 text-sm bg-transparent outline-none text-gray-700 placeholder-gray-400"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {statusFilter && (
          <button onClick={() => setStatusFilter('')} className="text-xs text-blue-600 font-medium hover:underline">
            Clear filter
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 overflow-hidden">
        {leadsLoading ? (
          <div className="py-20 flex flex-col items-center gap-3 text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
            <p className="text-sm">Loading leads…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-gray-400 text-sm">No leads found for the current filter.</p>
            <button onClick={() => { setSearch(''); setStatusFilter('') }} className="mt-2 text-blue-600 text-sm hover:underline">
              Reset filters
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="py-3 pl-6 pr-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Company</th>
                <th className="py-3 px-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Location</th>
                <th className="py-3 px-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Phone</th>
                <th className="py-3 px-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="py-3 pl-3 pr-6 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(lead => (
                <LeadRow
                  key={lead.id}
                  lead={lead}
                  onStatusChange={handleStatusChange}
                  updating={updating}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="text-center text-xs text-gray-400">Showing {filtered.length} of {leads.length} leads</p>
    </div>
  )
}
