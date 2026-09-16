import React, { useMemo } from 'react'
import AppLayout from '../layouts/AppLayout'
import { useTaskContext } from '../context/TaskContext'
import { useAuth } from '../context/AuthContext'
import {
  CheckCircle2, Clock, Zap, TrendingUp, Calendar,
  AlertTriangle, ArrowRight, Circle, Flame
} from 'lucide-react'

// ─── Helpers ────────────────────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr.split('T')[0])
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function isToday(dateStr) {
  if (!dateStr) return false
  const d = new Date(dateStr.split('T')[0])
  const today = new Date()
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  )
}

function isOverdue(dateStr) {
  if (!dateStr) return false
  const d = new Date(dateStr.split('T')[0])
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return d < today
}

// ─── Status dot ─────────────────────────────────────────────────────────────
const statusConfig = {
  done:        { color: 'bg-emerald-500', label: 'Selesai' },
  in_progress: { color: 'bg-violet-500',  label: 'Berlangsung' },
  todo:        { color: 'bg-slate-400',   label: 'Menunggu' },
  cancelled:   { color: 'bg-red-400',     label: 'Dibatalkan' },
}

// ─── Priority badge ──────────────────────────────────────────────────────────
const priorityBadge = {
  urgent: 'bg-red-500/10 text-red-500 border border-red-500/20',
  high:   'bg-orange-500/10 text-orange-500 border border-orange-500/20',
  medium: 'bg-amber-500/10 text-amber-600 border border-amber-500/20',
  low:    'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20',
}

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, gradient, iconBg }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-6 text-white ${gradient} shadow-lg`}
      style={{ boxShadow: '0 8px 32px rgba(109,40,217,0.18)' }}
    >
      {/* decorative circle */}
      <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/10 pointer-events-none" />
      <div className="absolute -right-2 -bottom-6 w-16 h-16 rounded-full bg-white/10 pointer-events-none" />

      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-white/70 text-sm font-medium">{label}</p>
          <p className="text-4xl font-bold mt-2 tracking-tight">{value}</p>
          {sub && <p className="text-white/60 text-xs mt-1">{sub}</p>}
        </div>
        <div className={`p-3 rounded-xl ${iconBg}`}>
          <Icon size={22} className="text-white" />
        </div>
      </div>
    </div>
  )
}

// ─── Section Header ──────────────────────────────────────────────────────────
function SectionHeader({ children }) {
  return (
    <h2 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
      <span className="inline-block w-1 h-4 rounded-full bg-violet-500" />
      {children}
    </h2>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { tasks, isLoading, openTaskDetail } = useTaskContext()
  const { user } = useAuth()

  const stats = useMemo(() => {
    const total      = tasks.length
    const dueToday   = tasks.filter(t => isToday(t.due_date)).length
    const inProgress = tasks.filter(t => t.status === 'in_progress').length
    const completed  = tasks.filter(t => t.status === 'done').length
    const cancelled  = tasks.filter(t => t.status === 'cancelled').length
    const todo       = tasks.filter(t => t.status === 'todo').length
    const rate       = total === 0 ? 0 : Math.round((completed / total) * 100)
    const overdue    = tasks.filter(t =>
      t.due_date && t.status !== 'done' && t.status !== 'cancelled' && isOverdue(t.due_date)
    ).length
    return { total, dueToday, inProgress, completed, cancelled, todo, rate, overdue }
  }, [tasks])

  const recentTasks = useMemo(() =>
    [...tasks].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 6),
    [tasks]
  )

  const upcomingTasks = useMemo(() =>
    tasks
      .filter(t => t.due_date && t.status !== 'done' && t.status !== 'cancelled')
      .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
      .slice(0, 5),
    [tasks]
  )

  const now = new Date()
  const greeting =
    now.getHours() < 12 ? 'Selamat Pagi' :
    now.getHours() < 17 ? 'Selamat Siang' : 'Selamat Malam'

  const displayName = user?.name || user?.email?.split('@')[0] || 'Tim'

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-[#f5f3ff] via-[#faf5ff] to-[#f0f9ff] p-6 space-y-6">

        {/* ── Hero Banner ─────────────────────────────────────────────── */}
        <div
          className="relative overflow-hidden rounded-3xl p-8 text-white"
          style={{
            background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 40%, #4c1d95 100%)',
            boxShadow: '0 20px 60px rgba(109,40,217,0.35)',
          }}
        >
          {/* decorative blobs */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/4 pointer-events-none" />
          <div className="absolute bottom-0 right-32 w-40 h-40 bg-violet-300/10 rounded-full translate-y-1/2 pointer-events-none" />
          <div className="absolute top-8 right-48 w-6 h-6 bg-white/20 rounded-full pointer-events-none" />
          <div className="absolute bottom-8 right-16 w-3 h-3 bg-violet-300/40 rounded-full pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-violet-200 text-sm font-medium mb-1">
                {greeting}, 👋
              </p>
              <h1 className="text-3xl font-bold tracking-tight">{displayName}</h1>
              <p className="text-violet-200 mt-2 text-sm max-w-md">
                Kamu punya{' '}
                <span className="text-white font-semibold">{stats.inProgress} tugas aktif</span>
                {stats.dueToday > 0 && (
                  <> dan <span className="text-yellow-300 font-semibold">{stats.dueToday} jatuh tempo hari ini</span></>
                )}
                .
              </p>
            </div>

            {/* Mini progress ring area */}
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div
                  className="relative w-20 h-20 rounded-full flex items-center justify-center"
                  style={{
                    background: `conic-gradient(#a78bfa ${stats.rate * 3.6}deg, rgba(255,255,255,0.15) 0deg)`,
                  }}
                >
                  <div className="absolute inset-2 bg-[#6d28d9] rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold">{stats.rate}%</span>
                  </div>
                </div>
                <p className="text-violet-200 text-xs mt-2">Selesai</p>
              </div>

              {stats.overdue > 0 && (
                <div className="bg-red-400/20 border border-red-300/30 rounded-2xl px-4 py-3 text-center">
                  <AlertTriangle size={18} className="text-red-300 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-red-200">{stats.overdue}</p>
                  <p className="text-red-300 text-xs">Terlambat</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Loading (Skeleton) ──────────────────────────────────────────────────── */}
        {isLoading && (
          <div className="animate-fade-in space-y-6 mt-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 rounded-2xl bg-slate-200/60 animate-pulse" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-[500px] rounded-2xl bg-slate-200/60 animate-pulse" />
              <div className="space-y-6">
                <div className="h-64 rounded-2xl bg-slate-200/60 animate-pulse" />
                <div className="h-64 rounded-2xl bg-slate-200/60 animate-pulse" />
              </div>
            </div>
          </div>
        )}

        {!isLoading && (
          <>
            {/* ── Stat Cards ────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={CheckCircle2}
                label="Total Tugas"
                value={stats.total}
                sub={`${stats.dueToday} jatuh tempo hari ini`}
                gradient="bg-gradient-to-br from-violet-600 to-purple-700"
                iconBg="bg-white/20"
              />
              <StatCard
                icon={Zap}
                label="Sedang Berjalan"
                value={stats.inProgress}
                sub="Tugas aktif"
                gradient="bg-gradient-to-br from-blue-500 to-blue-700"
                iconBg="bg-white/20"
              />
              <StatCard
                icon={TrendingUp}
                label="Selesai"
                value={stats.completed}
                sub="Dari semua proyek"
                gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
                iconBg="bg-white/20"
              />
              <StatCard
                icon={Flame}
                label="Tingkat Selesai"
                value={`${stats.rate}%`}
                sub="Dari total tugas"
                gradient="bg-gradient-to-br from-amber-500 to-orange-600"
                iconBg="bg-white/20"
              />
            </div>

            {/* ── Status Summary Row ──────────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Menunggu',     value: stats.todo,       color: 'from-slate-50 to-slate-100',   dot: 'bg-slate-400',    text: 'text-slate-700' },
                { label: 'Berlangsung',  value: stats.inProgress, color: 'from-violet-50 to-violet-100', dot: 'bg-violet-500',   text: 'text-violet-700' },
                { label: 'Selesai',      value: stats.completed,  color: 'from-emerald-50 to-emerald-100',dot:'bg-emerald-500',  text: 'text-emerald-700' },
                { label: 'Dibatalkan',   value: stats.cancelled,  color: 'from-red-50 to-red-100',       dot: 'bg-red-400',      text: 'text-red-600' },
              ].map(s => (
                <div
                  key={s.label}
                  className={`rounded-2xl bg-gradient-to-br ${s.color} px-4 py-3 flex items-center gap-3 border border-white shadow-sm`}
                >
                  <div className={`w-3 h-3 rounded-full shrink-0 ${s.dot}`} />
                  <div>
                    <p className="text-xs text-slate-500 leading-tight">{s.label}</p>
                    <p className={`text-xl font-bold ${s.text}`}>{s.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Main Grid ────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Recent Tasks */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col h-[500px]">
                <SectionHeader>Tugas Terbaru</SectionHeader>

                <div className="space-y-3 mt-2 overflow-y-auto pr-2 custom-scrollbar flex-1">
                  {recentTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                      <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                         <Circle size={28} className="opacity-30" />
                      </div>
                      <p className="text-sm font-medium">Belum ada tugas dibuat.</p>
                      <p className="text-xs mt-1">Tugas baru akan muncul di sini</p>
                    </div>
                  ) : recentTasks.map(task => {
                    const st = statusConfig[task.status] || statusConfig.todo
                    const pb = priorityBadge[task.priority] || priorityBadge.medium
                    
                    return (
                      <button
                        key={task.id}
                        onClick={() => openTaskDetail(task)}
                        className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl bg-white hover:bg-violet-50/50 border border-slate-100 hover:border-violet-200 hover:shadow-[0_4px_12px_rgba(139,92,246,0.08)] transition-all text-left group"
                      >
                         {/* Visual Indication */}
                        <div className={`w-1 h-10 rounded-full shrink-0 transition-colors ${task.status === 'done' ? 'bg-slate-200 group-hover:bg-violet-300' : 'bg-violet-200 group-hover:bg-violet-400'}`} />
                        
                        <div className="flex-1 min-w-0 py-0.5">
                          <div className="flex items-center gap-2 mb-1">
                             <div className={`w-2 h-2 rounded-full shrink-0 ${st.color}`} />
                             <p className={`text-sm font-bold truncate transition-colors ${task.status === 'done' ? 'text-slate-400 line-through' : 'text-slate-800 group-hover:text-violet-900'}`}>
                               {task.title}
                             </p>
                          </div>
                          
                          <p className="text-xs text-slate-500 truncate ml-4 line-clamp-1">
                            {task.description || <span className="italic opacity-60">Tidak ada deskripsi</span>}
                          </p>
                        </div>
                        
                        <div className="flex flex-col items-end justify-center gap-2 shrink-0">
                           <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider ${pb}`}>
                             {task.priority || 'medium'}
                           </span>
                           <span className="text-[10px] font-medium text-slate-400 group-hover:text-violet-400 transition-colors">
                              Detail &rarr;
                           </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">

                {/* Upcoming Deadlines */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <SectionHeader>Tenggat Mendatang</SectionHeader>

                  <div className="space-y-2">
                    {upcomingTasks.length === 0 ? (
                      <p className="text-slate-400 text-sm py-4 text-center">Tidak ada tenggat aktif.</p>
                    ) : upcomingTasks.map(task => {
                      const overdue = isOverdue(task.due_date)
                      const today   = isToday(task.due_date)
                      const pb = priorityBadge[task.priority] || priorityBadge.medium
                      return (
                        <button
                          key={task.id}
                          onClick={() => openTaskDetail(task)}
                          className="w-full text-left rounded-xl border border-slate-100 p-3 hover:border-violet-200 hover:bg-violet-50/50 transition-all group"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <Calendar size={12} className={overdue ? 'text-red-500' : today ? 'text-amber-500' : 'text-violet-500'} />
                              <p className={`text-[11px] font-semibold ${overdue ? 'text-red-500' : today ? 'text-amber-600' : 'text-violet-600'}`}>
                                {overdue ? '⚠ Terlambat · ' : today ? '📌 Hari ini · ' : ''}{formatDate(task.due_date)}
                              </p>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 capitalize ${pb}`}>
                              {task.priority || 'medium'}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-slate-800 mt-1.5 truncate">{task.title}</p>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Quick Stats */}
                <div
                  className="rounded-2xl p-5 text-white"
                  style={{
                    background: 'linear-gradient(135deg, #7c3aed, #4c1d95)',
                    boxShadow: '0 8px 32px rgba(109,40,217,0.20)',
                  }}
                >
                  <h2 className="text-sm font-semibold text-violet-200 mb-4 flex items-center gap-2">
                    <Clock size={14} /> Ringkasan Cepat
                  </h2>
                  <div className="space-y-3">
                    {[
                      { label: 'Selesai',    value: stats.completed, pct: stats.rate },
                      {
                        label: 'Berlangsung',
                        value: stats.inProgress,
                        pct: stats.total ? Math.round(stats.inProgress / stats.total * 100) : 0
                      },
                      {
                        label: 'Menunggu',
                        value: stats.todo,
                        pct: stats.total ? Math.round(stats.todo / stats.total * 100) : 0
                      },
                    ].map(s => (
                      <div key={s.label}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-violet-200">{s.label}</span>
                          <span className="font-semibold">{s.value} ({s.pct}%)</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-violet-300 transition-all duration-700"
                            style={{ width: `${s.pct}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  )
}
