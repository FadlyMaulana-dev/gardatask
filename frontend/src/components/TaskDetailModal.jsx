import React, { useState, useEffect } from 'react'
import { X, Clock, Users, Flag, CheckCircle2, ExternalLink } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function TaskDetailModal({ task, isOpen, onClose, onUpdate, onRefresh }) {
  const [status, setStatus] = useState('')
  const [priority, setPriority] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (task) {
      setStatus(task.status || 'todo')
      setPriority(task.priority || 'medium')
    }
  }, [task])

  if (!isOpen || !task) return null

  const priorityColors = {
    low: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
    medium: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
    high: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100',
    urgent: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
  }

  const priorityActiveColors = {
    low: 'bg-emerald-100 text-emerald-700 border-emerald-500 ring-emerald-500/20',
    medium: 'bg-amber-100 text-amber-700 border-amber-500 ring-amber-500/20',
    high: 'bg-orange-100 text-orange-700 border-orange-500 ring-orange-500/20',
    urgent: 'bg-red-100 text-red-700 border-red-500 ring-red-500/20',
  }

  const statusConfig = {
    todo:        { label: 'Menunggu',    color: 'bg-slate-100 text-slate-700 border-slate-500 ring-slate-500/20',  icon: '⏳' },
    in_progress: { label: 'Berlangsung', color: 'bg-violet-100 text-violet-700 border-violet-500 ring-violet-500/20', icon: '⚡' },
    done:        { label: 'Selesai',     color: 'bg-emerald-100 text-emerald-700 border-emerald-500 ring-emerald-500/20', icon: '✅' },
    cancelled:   { label: 'Dibatalkan',  color: 'bg-red-100 text-red-700 border-red-500 ring-red-500/20',     icon: '🛑' },
  }

  const handleStatusChange = async (newStatus) => {
    if (newStatus === status) return
    setIsSaving(true)
    setStatus(newStatus)
    await onUpdate?.(task.id, { status: newStatus })
    await onRefresh?.()
    setIsSaving(false)
  }

  const handlePriorityChange = async (newPriority) => {
    if (newPriority === priority) return
    setIsSaving(true)
    setPriority(newPriority)
    await onUpdate?.(task.id, { priority: newPriority })
    await onRefresh?.()
    setIsSaving(false)
  }

  const dueDateStr = task.due_date
    ? new Date(task.due_date.split('T')[0]).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : null

  const isOverdue = task.due_date && task.status !== 'done' && task.status !== 'cancelled' && new Date(task.due_date.split('T')[0]) < new Date(new Date().toISOString().split('T')[0])

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-[440px] bg-white shadow-2xl z-50 flex flex-col overflow-hidden border-l border-slate-200/60">
        {/* Header - brand styled */}
        <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-violet-600 to-purple-700 shrink-0 shadow-sm relative overflow-hidden">
           {/* Decor */}
           <div className="absolute -right-4 -top-6 w-24 h-24 rounded-full bg-white/10 pointer-events-none" />
           
          <div className="flex items-center gap-2.5 relative z-10">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-sm shadow-inner">
               {statusConfig[status]?.icon || '📋'}
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">Detail Tugas</h2>
          </div>
          <div className="flex items-center gap-3 relative z-10">
            {isSaving && (
              <span className="text-xs font-medium text-white/80 bg-white/10 px-2 py-0.5 rounded-full animate-pulse">Menyimpan...</span>
            )}
            <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors text-white/80 hover:text-white">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Title & Description */}
          <div className="px-6 py-6 border-b border-slate-100">
            <h3 className="text-xl font-bold text-slate-800 leading-snug">{task.title}</h3>
            {task.description ? (
              <p className="text-sm text-slate-600 mt-4 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">{task.description}</p>
            ) : (
              <p className="text-sm text-slate-400 mt-3 italic bg-slate-50 p-3 rounded-lg border border-slate-100/50 inline-block">Tidak ada deskripsi rinci.</p>
            )}
          </div>

          {/* Status & Priority Controls */}
          <div className="px-6 py-5 border-b border-slate-100 space-y-5">
            {/* Status Switcher */}
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 block">Status Tugas</label>
              <div className="flex gap-2 flex-wrap">
                {Object.entries(statusConfig).map(([key, cfg]) => (
                  <button
                    key={key}
                    onClick={() => handleStatusChange(key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      status === key
                        ? `${cfg.color} shadow-sm ring-2 ring-offset-2`
                        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <span>{cfg.icon}</span> {cfg.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority Switcher */}
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5 block">
                <Flag size={12} /> Prioritas
              </label>
              <div className="flex gap-2 flex-wrap">
                {Object.entries(priorityActiveColors).map(([key, activeCls]) => {
                  const inactiveCls = priorityColors[key];
                  return (
                    <button
                      key={key}
                      onClick={() => handlePriorityChange(key)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all capitalize ${
                        priority === key
                          ? `${activeCls} shadow-sm ring-2 ring-offset-2`
                          : `bg-white ${inactiveCls}`
                      }`}
                    >
                      {key}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Meta Info */}
          <div className="px-6 py-5 space-y-4 border-b border-slate-100 bg-slate-50/50">
            {/* Due Date */}
            {dueDateStr && (
              <div className="flex items-start gap-3.5">
                <div className={`mt-0.5 p-1.5 rounded-lg shrink-0 ${isOverdue ? 'bg-red-100 text-red-500' : 'bg-violet-100 text-violet-500'}`}>
                   <Clock size={16} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Batas Waktu</p>
                  <p className={`text-sm font-semibold mt-0.5 ${isOverdue ? 'text-red-600' : 'text-slate-700'}`}>
                    {dueDateStr}
                    {isOverdue && <span className="ml-2 text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-md border border-red-200">TERLAMBAT</span>}
                  </p>
                </div>
              </div>
            )}

            {/* Assigned User */}
            {task.user && (
              <div className="flex items-start gap-3.5">
                <div className="mt-0.5 p-1.5 rounded-lg bg-blue-100 text-blue-500 shrink-0">
                  <Users size={16} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Dibuat Oleh</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 shadow-sm flex items-center justify-center text-xs font-bold text-white">
                      {task.user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold text-slate-700">{task.user.name}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Task Type */}
            {task.task_type && (
              <div className="flex items-center gap-3.5">
                <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-500 shrink-0">
                   <CheckCircle2 size={16} />
                </div>
                <div>
                   <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Kategori Tugas</p>
                   <p className="text-sm font-semibold text-slate-700 capitalize mt-0.5">{task.task_type.replace('_', ' ')}</p>
                </div>
              </div>
            )}
          </div>

          {/* Quick Nav */}
          <div className="px-6 py-6">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Pintasan Aksi</p>
            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => {
                  const projectId = task.project_id || task.projectId;
                  if (projectId) {
                    navigate(`/projects/${projectId}`);
                  } else {
                    navigate('/projects');
                  }
                  onClose();
                }}
                className="flex items-center gap-3 px-4 py-3 bg-white hover:bg-violet-50 text-slate-700 hover:text-violet-700 rounded-xl text-sm font-semibold transition-all border border-slate-200 hover:border-violet-200 text-left shadow-sm group"
              >
                <div className="p-1.5 rounded-md bg-slate-100 group-hover:bg-violet-100 transition-colors">📋</div> 
                Lihat di Papan Kanban
                <ExternalLink size={14} className="ml-auto text-slate-300 group-hover:text-violet-400 transition-colors" />
              </button>
              <button
                onClick={() => { navigate('/calendar'); onClose() }}
                className="flex items-center gap-3 px-4 py-3 bg-white hover:bg-violet-50 text-slate-700 hover:text-violet-700 rounded-xl text-sm font-semibold transition-all border border-slate-200 hover:border-violet-200 text-left shadow-sm group"
              >
                <div className="p-1.5 rounded-md bg-slate-100 group-hover:bg-violet-100 transition-colors">📅</div> 
                Lihat di Kalender
                <ExternalLink size={14} className="ml-auto text-slate-300 group-hover:text-violet-400 transition-colors" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-white shrink-0">
          <p className="text-xs font-medium text-slate-400 text-center">
            {task.created_at
              ? `Tugas dibuat pada ${new Date(task.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`
              : 'Tugas dari sistem GardaTask'
            }
          </p>
        </div>
      </div>
    </>
  )
}
