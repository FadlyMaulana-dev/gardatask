import React, { useEffect, useMemo, useState } from 'react'
import { ChevronDown, Check, Plus, X, Trash2, Edit2, Clock3 } from 'lucide-react'
import AppLayout from '../layouts/AppLayout'
import { useTaskContext } from '../context/TaskContext'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const PLANNER_STORAGE_KEY = 'gardatask-planner-premium'
const PLANNER_HISTORY_KEY = 'gardatask-planner-history'

export function createPlannerHistoryEntry(type, content, author = 'Admin GardaTask') {
  const normalizedContent = (content ?? '').trim()

  if (!normalizedContent) return null

  const sectionLabels = {
    thisMonthPlan: 'Bulan Ini',
    nextMonthAgenda: 'Bulan Depan',
  }

  const createdAt = new Date().toISOString()

  return {
    id: `${type}-${createdAt}-${Math.random().toString(16).slice(2, 8)}`,
    type,
    label: sectionLabels[type] || 'Planner',
    content: normalizedContent,
    author,
    createdAt,
  }
}

export default function YearlyPlannerPage() {
  const { tasks, activeProjectId, projects } = useTaskContext()
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(null)
  
  // Editable States
  const [thisMonthPlan, setThisMonthPlan] = useState('')
  const [nextMonthAgenda, setNextMonthAgenda] = useState('')
  const [plannerHistory, setPlannerHistory] = useState([])
  const [saveStatus, setSaveStatus] = useState('') // '' | 'saving' | 'saved'
  
  const [milestones, setMilestones] = useState([
    { id: 1, label: 'Login', done: true, color: 'bg-emerald-400' },
    { id: 2, label: 'AI Recommendation', done: false, color: 'bg-amber-400' }
  ])
  const [newMilestone, setNewMilestone] = useState('')
  const [showMilestoneInput, setShowMilestoneInput] = useState(false)
  
  const [sprintNotes, setSprintNotes] = useState('On Track. Marketing low load. Backend at risk. Move 2 tasks to next Sprint.')
  const [isEditingSprint, setIsEditingSprint] = useState(false)

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ]

  // Load from LocalStorage
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const saved = window.localStorage.getItem(PLANNER_STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.thisMonthPlan) setThisMonthPlan(parsed.thisMonthPlan)
        if (parsed.nextMonthAgenda) setNextMonthAgenda(parsed.nextMonthAgenda)
        if (parsed.milestones) setMilestones(parsed.milestones)
        if (parsed.sprintNotes) setSprintNotes(parsed.sprintNotes)
      }

      const savedHistory = window.localStorage.getItem(PLANNER_HISTORY_KEY)
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory)
        if (Array.isArray(parsedHistory)) {
          setPlannerHistory(parsedHistory)
        }
      }
    } catch (err) {
      console.error('Failed to load planner data', err)
    }
  }, [])

  // Auto-Save
  useEffect(() => {
    if (typeof window === 'undefined') return
    const timeoutId = setTimeout(() => {
      setSaveStatus('saving')
      try {
        window.localStorage.setItem(
          PLANNER_STORAGE_KEY,
          JSON.stringify({ thisMonthPlan, nextMonthAgenda, milestones, sprintNotes })
        )
        setTimeout(() => setSaveStatus('saved'), 500)
        setTimeout(() => setSaveStatus(''), 3000)
      } catch (err) {
        console.error('Failed to save planner data', err)
      }
    }, 1000)
    return () => clearTimeout(timeoutId)
  }, [thisMonthPlan, nextMonthAgenda, milestones, sprintNotes])

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(PLANNER_HISTORY_KEY, JSON.stringify(plannerHistory))
    } catch (err) {
      console.error('Failed to save planner history', err)
    }
  }, [plannerHistory])

  const handleSavePlannerItem = (type) => {
    const value = type === 'thisMonthPlan' ? thisMonthPlan : nextMonthAgenda
    const entry = createPlannerHistoryEntry(type, value, user?.name || 'Admin GardaTask')

    if (!entry) {
      return
    }

    setPlannerHistory((prev) => [entry, ...prev])
    setSaveStatus('saved')
    setTimeout(() => setSaveStatus(''), 2200)
  }

  const handleDeletePlannerHistory = (id) => {
    setPlannerHistory((prev) => prev.filter((item) => item.id !== id))
  }

  // Data processing
  const visibleTasks = useMemo(() => {
    if (!activeProjectId) return tasks
    return tasks.filter(task => String(task.project_id ?? task.projectId).trim() === String(activeProjectId).trim())
  }, [tasks, activeProjectId])

  const parseDate = (dateString) => new Date(dateString.split('T')[0])
  const sameDay = (d1, d2) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate()
  
  const today = new Date()
  const monthTasks = visibleTasks.filter((task) => {
    if (!task.due_date) return false
    const due = parseDate(task.due_date)
    return due.getFullYear() === today.getFullYear() && due.getMonth() === today.getMonth()
  })
  const monthDone = monthTasks.filter((task) => task.status === 'done').length
  const targetPct = monthTasks.length === 0 ? 72 : Math.min(100, Math.round((monthDone / monthTasks.length) * 100))
  const sprintPct = Math.min(100, Math.max(20, targetPct + 15))
  const planningMonthIndex = new Date().getMonth()
  const planningMonthLabel = months[planningMonthIndex]
  
  const todaysTasks = visibleTasks.filter((task) => task.due_date && sameDay(parseDate(task.due_date), today))
  const upcomingTasks = visibleTasks.filter((task) => task.due_date && !sameDay(parseDate(task.due_date), today))

  const monthStats = months.map((_, monthIndex) => {
    const mTasks = visibleTasks.filter(t => {
      if (!t.due_date) return false
      const d = parseDate(t.due_date)
      return d.getFullYear() === selectedYear && d.getMonth() === monthIndex
    })
    const doneCount = mTasks.filter(t => t.status === 'done').length
    const totalCount = mTasks.length
    const completionPct = totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100)
    const daysWithTasks = [...new Set(mTasks.map(t => parseDate(t.due_date).getDate()))]
    return { monthTasks: mTasks, doneCount, totalCount, completionPct, daysWithTasks }
  })

  const yearTasks = visibleTasks.filter(t => t.due_date && parseDate(t.due_date).getFullYear() === selectedYear)
  const yearDone = yearTasks.filter(t => t.status === 'done').length
  const yearTotal = yearTasks.length
  const yearPct = yearTotal === 0 ? 0 : Math.round((yearDone / yearTotal) * 100)
  const overallPct = visibleTasks.length === 0 ? 0 : Math.round((visibleTasks.filter(t => t.status === 'done').length / visibleTasks.length) * 100)

  // Milestones handlers
  const toggleMilestone = (id) => {
    setMilestones(prev => prev.map(m => m.id === id ? { ...m, done: !m.done } : m))
  }
  const deleteMilestone = (id) => {
    setMilestones(prev => prev.filter(m => m.id !== id))
  }
  const addMilestone = (e) => {
    if (e.key === 'Enter' && newMilestone.trim() !== '') {
      const colors = ['bg-emerald-400', 'bg-amber-400', 'bg-blue-400', 'bg-purple-400', 'bg-pink-400']
      const randomColor = colors[Math.floor(Math.random() * colors.length)]
      setMilestones([...milestones, { id: Date.now(), label: newMilestone.trim(), done: false, color: randomColor }])
      setNewMilestone('')
      setShowMilestoneInput(false)
    }
  }

  const renderMonth = (monthIndex) => {
    const { daysWithTasks, completionPct } = monthStats[monthIndex]
    const daysInMonth = new Date(selectedYear, monthIndex + 1, 0).getDate()
    const firstDay = new Date(selectedYear, monthIndex, 1).getDay()
    const days = Array(firstDay).fill(null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1))
    const isCurrentMonth = today.getFullYear() === selectedYear && today.getMonth() === monthIndex
    const todayDay = isCurrentMonth ? today.getDate() : null

    return (
      <div key={monthIndex} className="min-w-[260px] max-w-[280px] shrink-0 bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] p-5 relative overflow-hidden group cursor-pointer hover:bg-white/60 transition-all duration-300">
        <h3 className="text-center font-semibold text-slate-800 mb-4">{months[monthIndex]}</h3>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div key={i} className="text-center text-[10px] font-bold text-slate-500">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, i) => {
            const hasTask = day && daysWithTasks.includes(day)
            const isToday = day === todayDay
            return (
              <div key={i} className={`aspect-square flex items-center justify-center rounded-lg text-xs font-medium transition-all
                ${day === null ? '' : 
                  isToday ? 'bg-amber-400 text-amber-950 shadow-md shadow-amber-400/40' : 
                  hasTask ? 'bg-amber-200 text-amber-900' : 
                  'text-slate-600 hover:bg-white/50'
                }`}>
                {day}
              </div>
            )
          })}
        </div>
        <div className="absolute bottom-4 right-4 bg-slate-200/50 backdrop-blur-md border border-white/40 text-slate-700 px-3 py-1 rounded-full text-[10px] font-bold">
          {completionPct}% done
        </div>
      </div>
    )
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-slate-100 relative overflow-hidden font-sans">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] bg-blue-200/40 rounded-full blur-[120px]" />
          <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-emerald-200/30 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[40%] bg-amber-100/30 rounded-full blur-[100px]" />
          
          {/* Techy lines overlay (subtle) */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
        </div>

        <div className="relative z-10 px-6 py-10 max-w-[1400px] mx-auto space-y-8">
          
          {/* Header */}
          <div className="text-center">
            <h1 className="text-[2.5rem] font-bold text-slate-800 tracking-tight flex items-center justify-center gap-3">
              Yearly Planner {selectedYear}
            </h1>
            <p className="text-slate-500 font-medium mt-1">Your productivity overview for {selectedYear}</p>
          </div>

          {/* Top Section */}
          <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-6">
            
            {/* Dark Dashboard Card */}
            <div className="bg-slate-900/90 backdrop-blur-2xl border border-slate-700/50 rounded-[2rem] p-8 shadow-2xl shadow-slate-900/20 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px]" />
              
              <div className="flex justify-between items-start mb-8 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 border-2 border-slate-700 flex items-center justify-center overflow-hidden">
                    {user?.avatar ? <img src={user.avatar} alt="User" /> : <span className="font-bold text-lg">{user?.name?.charAt(0) || 'A'}</span>}
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Selamat Datang, {user?.name || 'Admin GardaTask'}</p>
                    <h2 className="text-2xl font-semibold tracking-tight text-slate-100">Planner yang Anda Bayangkan</h2>
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-full px-5 py-2 backdrop-blur-md">
                  <span className="text-sm font-medium text-slate-300">{planningMonthLabel} {selectedYear}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
                {/* Target Bulan Ini */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors">
                  <p className="text-slate-400 text-xs mb-3 font-medium">Target Bulan Ini</p>
                  <div className="flex items-center gap-4">
                    <span className="text-4xl font-bold text-white">{targetPct}%</span>
                    <div className="flex-1 flex gap-1">
                      {/* Segmented Progress Bar */}
                      {Array.from({length: 12}).map((_, i) => (
                        <div key={i} className={`h-6 flex-1 rounded-sm ${i < Math.floor(targetPct / 8.33) ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'bg-slate-700/50'}`} />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sprint Aktif */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-slate-400 text-xs font-medium">Sprint Aktif</p>
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                  </div>
                  <p className="text-lg font-semibold text-white">Sprint 9 <span className="text-sm font-normal text-slate-400">(6-10 September)</span></p>
                  <p className="text-xs text-slate-400 mt-2 mb-1">Progress: {sprintPct}%</p>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-200 shadow-[0_0_10px_rgba(253,230,138,0.8)]" style={{ width: `${sprintPct}%` }} />
                  </div>
                </div>

                {/* Milestone */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors flex flex-col h-full min-h-[120px]">
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-slate-400 text-xs font-medium">Milestone</p>
                    <button onClick={() => setShowMilestoneInput(!showMilestoneInput)} className="text-slate-400 hover:text-white transition-colors">
                      <Plus size={14} />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                    {milestones.map(m => (
                      <div key={m.id} className="flex items-center gap-2 group">
                        <button onClick={() => toggleMilestone(m.id)} className={`w-3 h-3 rounded-full ${m.color} ${m.done ? 'opacity-30' : 'shadow-[0_0_8px_currentColor]'}`} />
                        <span className={`text-sm flex-1 truncate ${m.done ? 'text-slate-500 line-through' : 'text-slate-200'}`}>{m.label}</span>
                        <button onClick={() => deleteMilestone(m.id)} className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all"><Trash2 size={12} /></button>
                      </div>
                    ))}
                    {showMilestoneInput && (
                      <input 
                        type="text" 
                        autoFocus
                        value={newMilestone}
                        onChange={e => setNewMilestone(e.target.value)}
                        onKeyDown={addMilestone}
                        onBlur={() => setShowMilestoneInput(false)}
                        placeholder="Add milestone..." 
                        className="w-full bg-slate-800 text-xs text-white px-2 py-1 rounded border border-slate-600 focus:outline-none focus:border-emerald-400"
                      />
                    )}
                  </div>
                </div>

                {/* Bottom Row */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors">
                  <p className="text-slate-400 text-xs font-medium mb-1">{user?.name || 'Admin GardaTask'}</p>
                  <p className="text-sm text-slate-300">
                    {todaysTasks.length > 0 ? `${todaysTasks.length} tasks today` : 'No tasks today'}
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors">
                  <p className="text-slate-400 text-xs font-medium mb-1">Deadline</p>
                  <p className="text-sm text-slate-300">
                    {upcomingTasks.length > 0 ? `${upcomingTasks.length} upcoming deadlines` : 'No near deadlines'}
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors relative group">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-slate-400 text-xs font-medium">Sprint Berjalan</p>
                    <button onClick={() => setIsEditingSprint(!isEditingSprint)} className="text-slate-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                      <Edit2 size={12} />
                    </button>
                  </div>
                  {isEditingSprint ? (
                    <textarea 
                      value={sprintNotes}
                      onChange={e => setSprintNotes(e.target.value)}
                      onBlur={() => setIsEditingSprint(false)}
                      autoFocus
                      className="w-full h-16 bg-slate-800 text-xs text-slate-200 px-2 py-1 rounded border border-slate-600 focus:outline-none resize-none"
                    />
                  ) : (
                    <p className="text-xs text-slate-300 leading-relaxed cursor-pointer" onClick={() => setIsEditingSprint(true)}>
                      {sprintNotes || 'Click to add sprint notes...'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Light Glass Cards (Plan & Agenda) */}
            <div className="space-y-6">
              {/* Plan Bulan Ini */}
              <div className="bg-white/60 backdrop-blur-xl border border-white shadow-xl shadow-amber-900/5 rounded-[2rem] p-6 relative overflow-hidden group hover:bg-white/80 transition-colors">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-200/40 rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-slate-800 text-lg">Plan Bulan Ini</h3>
                  <div className="flex items-center gap-2">
                    {saveStatus === 'saved' && <span className="text-xs font-medium text-emerald-600 flex items-center gap-1"><Check size={12}/> Tersimpan</span>}
                    {saveStatus === 'saving' && <span className="text-xs font-medium text-slate-500">Menyimpan...</span>}
                  </div>
                </div>
                <textarea
                  value={thisMonthPlan}
                  onChange={(e) => setThisMonthPlan(e.target.value)}
                  className="w-full h-24 bg-white/50 border border-white/60 rounded-xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:bg-white focus:ring-2 focus:ring-amber-200 resize-none transition-all"
                  placeholder="Tulis target dan rencana utama untuk bulan ini..."
                />
                <div className="flex justify-end mt-3">
                  <button
                    onClick={() => handleSavePlannerItem('thisMonthPlan')}
                    className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 shadow-md shadow-amber-500/20 text-white font-medium text-sm px-6 py-2 rounded-full transition-all hover:scale-105 active:scale-95"
                  >
                    Simpan Plan
                  </button>
                </div>
              </div>

              {/* Agenda Bulan Depan */}
              <div className="bg-white/60 backdrop-blur-xl border border-white shadow-xl shadow-amber-900/5 rounded-[2rem] p-6 relative overflow-hidden group hover:bg-white/80 transition-colors">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-200/40 rounded-full blur-3xl pointer-events-none" />
                
                <h3 className="font-semibold text-slate-800 text-lg mb-4">Agenda Bulan Depan</h3>
                <textarea
                  value={nextMonthAgenda}
                  onChange={(e) => setNextMonthAgenda(e.target.value)}
                  className="w-full h-24 bg-white/50 border border-white/60 rounded-xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:bg-white focus:ring-2 focus:ring-amber-200 resize-none transition-all"
                  placeholder="Apa yang ingin diagendakan untuk bulan depan..."
                />
                <div className="flex justify-end mt-3">
                  <button
                    onClick={() => handleSavePlannerItem('nextMonthAgenda')}
                    className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 shadow-md shadow-amber-500/20 text-white font-medium text-sm px-6 py-2 rounded-full transition-all hover:scale-105 active:scale-95"
                  >
                    Simpan Agenda
                  </button>
                </div>
              </div>

              <div className="bg-white/60 backdrop-blur-xl border border-white shadow-xl shadow-amber-900/5 rounded-[2rem] p-6 relative overflow-hidden group hover:bg-white/80 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-800 text-lg">Riwayat Agenda</h3>
                  <div className="flex items-center gap-2 text-slate-500">
                    <Clock3 size={14} />
                    <span className="text-xs font-medium">{plannerHistory.length} catatan</span>
                  </div>
                </div>

                {plannerHistory.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-8 text-center">
                    <p className="text-sm text-slate-500">Belum ada riwayat agenda untuk bulan ini atau bulan depan.</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1 custom-scrollbar">
                    {plannerHistory.map((entry) => (
                      <div key={entry.id} className="rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-sm">
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                            {entry.label}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-400">
                              {new Date(entry.createdAt).toLocaleString('id-ID', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeletePlannerHistory(entry.id)}
                              className="inline-flex items-center justify-center rounded-full border border-red-200 bg-red-50 p-1.5 text-red-500 transition hover:bg-red-100 hover:text-red-600"
                              aria-label={`Hapus riwayat ${entry.label}`}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">{entry.content}</p>
                        <p className="mt-2 text-[11px] font-medium text-slate-400">Oleh: {entry.author}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Year Selector */}
          <div className="flex justify-center mt-4">
            <div className="bg-gradient-to-b from-slate-100 to-slate-200 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-full flex items-center px-2 py-1">
              <button onClick={() => setSelectedYear(selectedYear - 1)} className="w-10 h-10 flex items-center justify-center rounded-full text-slate-500 hover:bg-white/50 hover:text-slate-800 transition-colors font-bold text-xl">&lt;</button>
              <div className="px-6 font-bold text-xl text-slate-800 tracking-wider w-32 text-center">{selectedYear}</div>
              <button onClick={() => setSelectedYear(selectedYear + 1)} className="w-10 h-10 flex items-center justify-center rounded-full text-slate-500 hover:bg-white/50 hover:text-slate-800 transition-colors font-bold text-xl">&gt;</button>
            </div>
          </div>

          {/* Monthly Carousel Grids */}
          <div className="flex overflow-x-auto gap-5 pb-6 pt-2 snap-x px-2 custom-scrollbar">
            {months.map((_, index) => (
              <div key={index} className="snap-start">
                {renderMonth(index)}
              </div>
            ))}
          </div>

          {/* Bottom Summary Bar */}
          <div className="bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] p-8 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
            {/* Left */}
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Monthly Planning Board</h3>
                <p className="text-sm text-slate-500">Catat apa yang akan dikerjakan bulan ini dan agenda penting untur bulan depan.</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-sm bg-slate-200/50 border border-slate-300 shadow-inner" />
                  <span className="text-sm text-slate-600 font-medium">No tasks</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-sm bg-amber-200 border border-amber-300 shadow-[0_0_8px_rgba(253,230,138,0.8)]" />
                  <span className="text-sm text-slate-600 font-medium">Has tasks</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-sm bg-amber-400 border border-amber-500 shadow-[0_0_10px_rgba(251,191,36,0.8)]" />
                  <span className="text-sm text-slate-600 font-medium">Today</span>
                </div>
              </div>
            </div>

            {/* Middle (Export) */}
            <div className="shrink-0">
              <button onClick={() => window.print()} className="bg-gradient-to-r from-amber-200 to-amber-400 hover:from-amber-300 hover:to-amber-500 text-amber-900 border border-amber-100 shadow-lg shadow-amber-500/20 font-bold text-sm px-6 py-3 rounded-full transition-all hover:scale-105 active:scale-95">
                Export PDF
              </button>
            </div>

            {/* Right Summary */}
            <div className="flex-1 flex gap-10 justify-end items-center pr-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-slate-800 mb-1">{yearTotal}</p>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Tasks</p>
                <div className="h-1 bg-slate-800 rounded-full mt-2" />
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-slate-800 mb-1">{overallPct}%</p>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">All-time Completion</p>
                <div className="h-1 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full mt-2 shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </AppLayout>
  )
}
