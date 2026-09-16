import React, { useEffect } from 'react'
import { useCrm } from '../../context/CrmContext'
import {
  Users, TrendingUp, Trophy, Activity, CheckCircle2,
  PhoneCall, RefreshCw, Briefcase, Target, Medal, Clock
} from 'lucide-react'

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />
}

function StatCard({ label, value, sub, icon: Icon, bg, iconColor, accent }) {
  return (
    <div className={`rounded-2xl p-6 shadow-sm ring-1 transition-shadow hover:shadow-md ${accent ? 'bg-gradient-to-br from-slate-800 to-slate-900 ring-slate-700' : 'bg-white ring-gray-100'}`}>
      <div className="flex items-center justify-between mb-4">
        <p className={`text-sm font-medium ${accent ? 'text-slate-300' : 'text-gray-500'}`}>{label}</p>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent ? 'bg-white/10' : bg}`}>
          <Icon className={`w-5 h-5 ${accent ? 'text-white' : iconColor}`} />
        </div>
      </div>
      <p className={`text-3xl font-bold tracking-tight ${accent ? 'text-white' : 'text-gray-900'}`}>{value}</p>
      <p className={`text-xs mt-1 ${accent ? 'text-slate-400' : 'text-gray-400'}`}>{sub}</p>
    </div>
  )
}

function FunnelBar({ label, count, total, colorClass }) {
  const pct = total > 0 ? Math.max(3, (count / total) * 100) : 3
  return (
    <div className="flex items-center gap-3 group">
      <div className="w-28 text-right text-sm text-gray-600 font-medium shrink-0">{label}</div>
      <div className="flex-1 h-9 bg-gray-100 rounded-lg overflow-hidden relative">
        <div
          className={`${colorClass} h-full rounded-lg transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-700 z-10">
          {count.toLocaleString()} leads
        </span>
      </div>
      <div className="w-12 text-right text-xs font-bold text-gray-500 shrink-0">
        {total > 0 ? `${Math.round((count / total) * 100)}%` : '0%'}
      </div>
    </div>
  )
}

const MEDAL_COLORS = ['text-amber-500', 'text-slate-400', 'text-orange-600']

function PerformerRow({ performer, rank }) {
  const initials = performer.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  const avatarColors = ['bg-blue-100 text-blue-700', 'bg-violet-100 text-violet-700', 'bg-emerald-100 text-emerald-700', 'bg-amber-100 text-amber-700']
  const avatarColor = avatarColors[(rank - 1) % avatarColors.length]

  return (
    <tr className="border-t border-gray-50 hover:bg-gray-50/80 transition-colors">
      <td className="py-3.5 pl-4 pr-3">
        <div className="flex items-center gap-3">
          {rank <= 3 && <Medal className={`w-4 h-4 ${MEDAL_COLORS[rank - 1]} shrink-0`} />}
          {rank > 3 && <span className="w-4 text-center text-sm text-gray-400 font-medium">{rank}</span>}
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${avatarColor}`}>{initials}</div>
          <div>
            <p className="font-semibold text-sm text-gray-900">{performer.name}</p>
            <p className="text-xs text-gray-400">Marketing</p>
          </div>
        </div>
      </td>
      <td className="py-3.5 px-3 text-center">
        <span className="text-sm font-bold text-amber-600">{performer.kpi_score.toLocaleString()}</span>
      </td>
      <td className="py-3.5 px-3 text-center">
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
          {performer.total_deal} deals
        </span>
      </td>
      <td className="py-3.5 pr-4 text-right text-sm font-semibold text-gray-900">
        Rp {(performer.est_bonus || 0).toLocaleString('id-ID')}
      </td>
    </tr>
  )
}

export default function DashboardDirut() {
  const { fetchDirutDashboard, dirutDashboard, dirutLoading } = useCrm()

  useEffect(() => { fetchDirutDashboard() }, [fetchDirutDashboard])

  if (dirutLoading || !dirutDashboard) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-8 w-72" />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-36 w-full rounded-2xl" />)}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    )
  }

  const { total_leads = 0, total_deals = 0, total_marketing = 0, funnel = {}, top_performers = [], today_activities = [] } = dirutDashboard

  const conversionRate = total_leads > 0 ? ((total_deals / total_leads) * 100).toFixed(1) : '0.0'
  const totalBonus = top_performers.reduce((s, p) => s + (p.est_bonus || 0), 0)

  const funnelRows = [
    { label: 'New', key: 'New', color: 'bg-blue-400' },
    { label: 'Contacted', key: 'Contacted', color: 'bg-violet-400' },
    { label: 'Follow Up', key: 'Follow Up', color: 'bg-amber-400' },
    { label: 'Negotiation', key: 'Negotiation', color: 'bg-orange-400' },
    { label: 'Proposal', key: 'Proposal', color: 'bg-rose-400' },
    { label: 'Closed Won', key: 'Closed Won', color: 'bg-emerald-400' },
  ]

  return (
    <div className="p-8 space-y-6 min-h-screen bg-gray-50/50">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Director Dashboard</h2>
        <p className="text-gray-500 text-sm mt-1">Executive overview — marketing performance, funnel & payroll.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Pipeline Leads" value={total_leads.toLocaleString()} sub="Leads in system" icon={Users} bg="bg-blue-50" iconColor="text-blue-600" />
        <StatCard label="Deals Closed" value={total_deals} sub="All time wins" icon={Trophy} bg="bg-emerald-50" iconColor="text-emerald-600" />
        <StatCard label="Active Marketers" value={total_marketing} sub="Team members" icon={Target} bg="bg-violet-50" iconColor="text-violet-600" />
        <StatCard label="Total Est. Payroll" value={`Rp ${totalBonus.toLocaleString('id-ID')}`} sub={`Conv. Rate: ${conversionRate}%`} icon={Activity} accent />
      </div>

      {/* Funnel + Performers */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Funnel (wider) */}
        <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-gray-900">Sales Funnel</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Conversion rate: <span className="text-blue-600 font-bold">{conversionRate}%</span>
              </p>
            </div>
            <TrendingUp className="w-5 h-5 text-gray-300" />
          </div>
          <div className="space-y-3">
            {funnelRows.map(r => (
              <FunnelBar
                key={r.key}
                label={r.label}
                count={funnel[r.key] || 0}
                total={total_leads || 1}
                colorClass={r.color}
              />
            ))}
          </div>
        </div>

        {/* Today's Activity Feed */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-5">
            <Clock className="w-4 h-4 text-gray-400" />
            <h3 className="font-semibold text-gray-900">Today's Activities</h3>
          </div>
          {today_activities.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 py-8">
              <Activity className="w-10 h-10 mb-2 text-gray-200" />
              <p className="text-sm">No activities today</p>
            </div>
          ) : (
            <div className="space-y-3 flex-1 overflow-y-auto">
              {today_activities.map((a, i) => (
                <div key={i} className="flex gap-3">
                  <div className="mt-1 w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">{a.activity_type || a.type}</p>
                    <p className="text-xs text-gray-500">{a.lead?.company_name || '—'} · {a.user?.name || 'Unknown'}</p>
                    <p className="text-xs text-gray-400">{new Date(a.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Team Performance Table */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Team KPI & Payroll Overview</h3>
            <p className="text-xs text-gray-400 mt-0.5">Sorted by highest KPI score</p>
          </div>
          <CheckCircle2 className="w-5 h-5 text-gray-300" />
        </div>
        {top_performers.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Users className="w-10 h-10 mx-auto mb-2 text-gray-200" />
            <p className="text-sm">No performance data yet</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 pl-4 pr-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Marketer</th>
                <th className="py-3 px-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">KPI Score</th>
                <th className="py-3 px-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Deals</th>
                <th className="py-3 pr-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Est. Bonus</th>
              </tr>
            </thead>
            <tbody>
              {top_performers.map((p, i) => (
                <PerformerRow key={p.id} performer={p} rank={i + 1} />
              ))}
            </tbody>
            <tfoot className="bg-gray-50 border-t border-gray-100">
              <tr>
                <td colSpan={3} className="py-3 pl-4 text-sm font-semibold text-gray-700">Total Payroll Estimate</td>
                <td className="py-3 pr-4 text-right text-sm font-bold text-emerald-700">
                  Rp {totalBonus.toLocaleString('id-ID')}
                </td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  )
}
