import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCrm } from '../../context/CrmContext'
import {
  Users, Trophy, Coins, DollarSign, TrendingUp, PhoneCall,
  RefreshCw, Briefcase, ArrowRight, CheckCircle2, Clock
} from 'lucide-react'

// ── Skeleton ────────────────────────────────────────────
function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />
}

function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-gray-100">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-9 w-9 rounded-full" />
      </div>
      <Skeleton className="h-8 w-20 mb-2" />
      <Skeleton className="h-3 w-24" />
    </div>
  )
}

// ── Funnel stage ────────────────────────────────────────
function FunnelStage({ label, count, total, color, icon: Icon }) {
  const pct = total > 0 ? Math.max(4, Math.round((count / total) * 100)) : 4
  return (
    <div className="flex items-center gap-3">
      <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${color.bg}`}>
        <Icon className={`w-4 h-4 ${color.icon}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <span className={`text-sm font-bold ${color.text}`}>{count}</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className={`${color.bar} h-2 rounded-full transition-all duration-700`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  )
}

// ── KPI table row ───────────────────────────────────────
function KpiRow({ action, multiplier, points, color }) {
  return (
    <tr className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
      <td className="py-3 pl-4 pr-3 text-sm text-gray-700">{action}</td>
      <td className="py-3 px-3 text-center">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${color}`}>
          ×{multiplier}
        </span>
      </td>
      <td className="py-3 pr-4 text-right text-sm font-semibold text-gray-900">{points} pts</td>
    </tr>
  )
}

export default function MarketingDashboard() {
  const { fetchMarketingDashboard, marketingDashboard, marketingLoading } = useCrm()

  useEffect(() => { fetchMarketingDashboard() }, [fetchMarketingDashboard])

  if (marketingLoading || !marketingDashboard) {
    return (
      <div className="p-8 space-y-6">
        <div className="space-y-1">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-80 mt-2" />
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-gray-100 space-y-4">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-gray-100 space-y-4">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        </div>
      </div>
    )
  }

  const {
    total_leads = 0, lead_baru = 0, sudah_dihubungi = 0,
    follow_up = 0, proposal = 0, deal = 0,
    my_points = 0, my_bonus = 0, deals_closed = 0, conversion_rate = 0,
  } = marketingDashboard

  const stats = [
    {
      label: 'Total Leads', value: total_leads, sub: 'In system pipeline',
      icon: Users, bg: 'bg-blue-50', iconColor: 'text-blue-600',
    },
    {
      label: 'Deals Closed', value: deals_closed, sub: 'This month',
      icon: Trophy, bg: 'bg-emerald-50', iconColor: 'text-emerald-600',
    },
    {
      label: 'KPI Points', value: `${my_points}`, sub: 'Accumulated score',
      icon: Coins, bg: 'bg-amber-50', iconColor: 'text-amber-600',
    },
    {
      label: 'Est. Bonus', value: `Rp ${(my_bonus || 0).toLocaleString('id-ID')}`, sub: 'Based on KPI score',
      icon: DollarSign, bg: 'bg-violet-50', iconColor: 'text-violet-600',
      highlight: true,
    },
  ]

  const funnelStages = [
    { label: 'New', count: lead_baru, color: { bg: 'bg-blue-50', icon: 'text-blue-500', bar: 'bg-blue-500', text: 'text-blue-700' }, icon: Users },
    { label: 'Contacted', count: sudah_dihubungi, color: { bg: 'bg-purple-50', icon: 'text-purple-500', bar: 'bg-purple-500', text: 'text-purple-700' }, icon: PhoneCall },
    { label: 'Follow Up', count: follow_up, color: { bg: 'bg-amber-50', icon: 'text-amber-500', bar: 'bg-amber-500', text: 'text-amber-700' }, icon: RefreshCw },
    { label: 'Proposal', count: proposal, color: { bg: 'bg-orange-50', icon: 'text-orange-500', bar: 'bg-orange-500', text: 'text-orange-700' }, icon: Briefcase },
    { label: 'Closed Won', count: deal, color: { bg: 'bg-emerald-50', icon: 'text-emerald-600', bar: 'bg-emerald-500', text: 'text-emerald-700' }, icon: CheckCircle2 },
  ]

  return (
    <div className="p-8 space-y-6 min-h-screen bg-gray-50/50">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Marketing Dashboard</h2>
          <p className="text-gray-500 text-sm mt-1">Track your leads, activity, KPI points, and estimated bonus.</p>
        </div>
        <Link
          to="/crm/leads"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
        >
          My Leads <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {stats.map(s => (
          <div
            key={s.label}
            className={`rounded-2xl p-6 shadow-sm ring-1 transition-shadow hover:shadow-md ${
              s.highlight
                ? 'bg-gradient-to-br from-blue-600 to-blue-700 ring-blue-500'
                : 'bg-white ring-gray-100'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <p className={`text-sm font-medium ${s.highlight ? 'text-blue-100' : 'text-gray-500'}`}>{s.label}</p>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.highlight ? 'bg-white/15' : s.bg}`}>
                <s.icon className={`w-5 h-5 ${s.highlight ? 'text-white' : s.iconColor}`} />
              </div>
            </div>
            <p className={`text-3xl font-bold tracking-tight ${s.highlight ? 'text-white' : 'text-gray-900'}`}>{s.value}</p>
            <p className={`text-xs mt-1 ${s.highlight ? 'text-blue-200' : 'text-gray-400'}`}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Body Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Funnel */}
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-gray-900">My Lead Funnel</h3>
              <p className="text-xs text-gray-400 mt-0.5">Conversion: <span className="font-bold text-blue-600">{conversion_rate}%</span></p>
            </div>
            <TrendingUp className="w-5 h-5 text-gray-300" />
          </div>
          <div className="space-y-4">
            {funnelStages.map(s => (
              <FunnelStage key={s.label} total={total_leads} {...s} />
            ))}
          </div>
        </div>

        {/* KPI Scoring Guide */}
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-gray-900">KPI Scoring Guide</h3>
              <p className="text-xs text-gray-400 mt-0.5">Every action earns you points</p>
            </div>
            <Coins className="w-5 h-5 text-gray-300" />
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 rounded-lg">
                <th className="py-2 pl-4 pr-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Action</th>
                <th className="py-2 px-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Mult.</th>
                <th className="py-2 pr-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Points</th>
              </tr>
            </thead>
            <tbody>
              <KpiRow action="Import Lead" multiplier={1} points="1 / lead" color="bg-gray-100 text-gray-600" />
              <KpiRow action="WhatsApp Click" multiplier={2} points="2 / click" color="bg-emerald-100 text-emerald-700" />
              <KpiRow action="Follow Up" multiplier={5} points="5 / action" color="bg-blue-100 text-blue-700" />
              <KpiRow action="Meeting" multiplier={10} points="10 / meet" color="bg-purple-100 text-purple-700" />
              <KpiRow action="Proposal Sent" multiplier={20} points="20 / prop" color="bg-orange-100 text-orange-700" />
              <KpiRow action="Deal / Closed Won" multiplier={50} points="50 / deal" color="bg-amber-100 text-amber-700" />
            </tbody>
          </table>

          <div className="mt-5 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3">
            <div className="bg-amber-50 rounded-xl px-4 py-3 text-center">
              <p className="text-2xl font-bold text-amber-700">{my_points}</p>
              <p className="text-xs text-amber-600 mt-0.5">Your Points</p>
            </div>
            <div className="bg-emerald-50 rounded-xl px-4 py-3 text-center">
              <p className="text-lg font-bold text-emerald-700">Rp {(my_bonus || 0).toLocaleString('id-ID')}</p>
              <p className="text-xs text-emerald-600 mt-0.5">Est. Bonus</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { to: '/crm/leads', label: 'Open My Leads', sub: 'View & update pipeline', icon: Users, color: 'from-blue-500 to-blue-600' },
          { to: '/crm/leads', label: 'Send WhatsApp', sub: 'Contact a lead now', icon: PhoneCall, color: 'from-emerald-500 to-emerald-600' },
          { to: '/crm/scraping', label: 'Import Leads', sub: 'Scraping center', icon: RefreshCw, color: 'from-violet-500 to-violet-600' },
          { to: '/crm/leads', label: 'Log Activity', sub: 'Record your work', icon: Clock, color: 'from-amber-500 to-amber-600' },
        ].map(q => (
          <Link
            key={q.label}
            to={q.to}
            className={`bg-gradient-to-br ${q.color} rounded-2xl p-5 text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-between group`}
          >
            <div>
              <p className="font-semibold text-sm">{q.label}</p>
              <p className="text-xs text-white/70 mt-0.5">{q.sub}</p>
            </div>
            <q.icon className="w-7 h-7 text-white/60 group-hover:text-white/90 transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  )
}
