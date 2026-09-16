import React, { useMemo, useState } from 'react'
import AppLayout from '../layouts/AppLayout'
import { useTaskContext } from '../context/TaskContext'
import { CheckCircle2, History, Trash2, Calendar, Circle, ShieldAlert } from 'lucide-react'

// ─── Helpers ────────────────────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const statusConfig = {
  done:        { color: 'bg-emerald-500', label: 'Selesai' },
  cancelled:   { color: 'bg-red-400',     label: 'Dibatalkan' },
}

const priorityBadge = {
  urgent: 'bg-red-500/10 text-red-500 border border-red-500/20',
  high:   'bg-orange-500/10 text-orange-500 border border-orange-500/20',
  medium: 'bg-amber-500/10 text-amber-600 border border-amber-500/20',
  low:    'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20',
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function TaskHistoryPage() {
  const { tasks, isLoading, deleteTask, openTaskDetail } = useTaskContext()
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState(null)
  
  // Filter only tasks that are done or cancelled (these are the 'historical' tasks)
  const historicalTasks = useMemo(() =>
    tasks
      .filter(t => t.status === 'done' || t.status === 'cancelled')
      .sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at)),
    [tasks]
  )

  const stats = useMemo(() => {
     return {
        total: historicalTasks.length,
        done: historicalTasks.filter(t => t.status === 'done').length,
        cancelled: historicalTasks.filter(t => t.status === 'cancelled').length
     }
  }, [historicalTasks])

  const confirmDelete = (task) => {
    setTaskToDelete(task)
    setDeleteConfirmOpen(true)
  }

  const handleDelete = async () => {
    if (!taskToDelete) return
    await deleteTask(taskToDelete.id)
    setDeleteConfirmOpen(false)
    setTaskToDelete(null)
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-slate-50/50 p-6 lg:p-8 space-y-6">
        
        {/* ── Page Header ─────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-200 pb-6 gap-4">
          <div>
            <div className="flex items-center gap-3">
               <div className="w-12 h-12 rounded-2xl bg-violet-100 flex items-center justify-center text-violet-600 shadow-sm border border-violet-200/50">
                  <History size={24} />
               </div>
               <div>
                  <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Riwayat Tugas</h1>
                  <p className="text-slate-500 mt-1 text-sm font-medium">Log aktivitas untuk tugas yang telah Selesai atau Dibatalkan.</p>
               </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
             <div className="px-4 py-2 border-r border-slate-100 text-center">
                <p className="text-[10px] uppercase font-bold text-slate-400">Total Riwayat</p>
                <p className="text-lg font-bold text-slate-800">{stats.total}</p>
             </div>
             <div className="px-4 py-2 border-r border-slate-100 text-center">
                <p className="text-[10px] uppercase font-bold text-emerald-500">Selesai</p>
                <p className="text-lg font-bold text-emerald-600">{stats.done}</p>
             </div>
             <div className="px-4 py-2 text-center">
                <p className="text-[10px] uppercase font-bold text-red-500">Dibatalkan</p>
                <p className="text-lg font-bold text-red-600">{stats.cancelled}</p>
             </div>
          </div>
        </div>

        {/* ── Loading ──────────────────────────────────────────────────── */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-500 text-sm font-medium">Memuat data riwayat…</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
            {/* List Header */}
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 grid grid-cols-12 gap-4 items-center">
               <div className="col-span-6 md:col-span-5"><span className="text-xs font-bold text-slate-500 uppercase">Nama Tugas</span></div>
               <div className="hidden md:block col-span-3"><span className="text-xs font-bold text-slate-500 uppercase">Tipe Tugas</span></div>
               <div className="hidden md:block col-span-3"><span className="text-xs font-bold text-slate-500 uppercase">Diperbarui</span></div>
               <div className="col-span-6 md:col-span-1 text-right"><span className="text-xs font-bold text-slate-500 uppercase">Aksi</span></div>
            </div>

            {/* List Body */}
            {historicalTasks.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                     <History size={36} className="text-slate-300" />
                  </div>
                  <p className="text-lg font-bold text-slate-700">Belum ada riwayat</p>
                  <p className="text-sm mt-1 max-w-sm text-center">Tugas yang sudah ditandai "Selesai" atau "Dibatalkan" akan muncul di sini.</p>
               </div>
            ) : (
               <div className="divide-y divide-slate-100">
                  {historicalTasks.map(task => {
                    const st = statusConfig[task.status] || statusConfig.cancelled
                    const pb = priorityBadge[task.priority] || priorityBadge.medium

                    return (
                        <div key={task.id} className="px-6 py-4 grid grid-cols-12 gap-4 items-center hover:bg-violet-50/40 transition-colors group">
                           {/* Details */}
                           <div 
                             className="col-span-6 md:col-span-5 flex items-start gap-4 cursor-pointer"
                             onClick={() => openTaskDetail(task)}
                           >
                              <div className={`mt-1 w-2.5 h-2.5 rounded-full shrink-0 ${st.color} ring-4 ring-slate-100 group-hover:ring-violet-100`} />
                              <div className="min-w-0">
                                 <p className="text-sm font-bold text-slate-900 group-hover:text-violet-900 transition-colors truncate">
                                    {task.title}
                                 </p>
                                 <div className="flex items-center gap-2 mt-1.5">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide ${pb}`}>
                                       {task.priority || 'medium'}
                                    </span>
                                    <span className="text-xs font-medium text-slate-500 capitalize">{st.label}</span>
                                 </div>
                              </div>
                           </div>

                           {/* Task Type */}
                           <div className="hidden md:flex col-span-3 items-center gap-2">
                              {task.task_type ? (
                                 <span className="text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-1 rounded-md capitalize">
                                    {task.task_type.replace('_', ' ')}
                                 </span>
                              ) : <span className="text-slate-400 text-xs italic">-</span>}
                           </div>

                           {/* Date */}
                           <div className="hidden md:flex col-span-3 items-center gap-2 text-slate-500">
                              <Calendar size={14} />
                              <span className="text-xs font-medium">{formatDate(task.updated_at || task.created_at)}</span>
                           </div>

                           {/* Actions */}
                           <div className="col-span-6 md:col-span-1 flex justify-end">
                              <button
                                 onClick={(e) => { e.stopPropagation(); confirmDelete(task); }}
                                 className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                 title="Hapus Permanen"
                              >
                                 <Trash2 size={18} />
                              </button>
                           </div>
                        </div>
                    )
                  })}
               </div>
            )}
          </div>
        )}

      </div>
      
      {/* ── Konfirmasi Hapus Modal ────────────────────────────────────── */}
      {deleteConfirmOpen && taskToDelete && (
         <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
               <div className="p-6 text-center pt-8">
                  <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-5 rotate-12 ring-8 ring-red-50">
                     <ShieldAlert size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Hapus Tugas Tersebut?</h3>
                  <p className="text-sm text-slate-500">
                     Anda yakin ingin secara permanen menghapus tugas <strong>"{taskToDelete.title}"</strong>?<br/>Aksi ini tidak dapat dibatalkan dan semua riwayat terkait akan hilang.
                  </p>
               </div>
               <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
                  <button 
                     className="flex-1 py-2.5 rounded-xl font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 transition-colors"
                     onClick={() => setDeleteConfirmOpen(false)}
                  >
                     Batal
                  </button>
                  <button 
                     className="flex-1 py-2.5 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 shadow-md transition-colors"
                     onClick={handleDelete}
                  >
                     Ya, Hapus
                  </button>
               </div>
            </div>
         </div>
      )}
    </AppLayout>
  )
}
