import React, { useState, useMemo, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { GripVertical, Plus, X, CalendarDays, Trash2, HelpCircle } from 'lucide-react'
import AppLayout from '../layouts/AppLayout'
import { useTaskContext } from '../context/TaskContext'
import { useAuth } from '../context/AuthContext'
import ProjectListView from '../components/ProjectListView'
import ModuleGuideModal from '../components/ModuleGuideModal'

const KANBAN_GUIDE = {
  title: 'Panduan — Kanban Board',
  description: 'Kanban Board adalah ruang kerja visual untuk mengelola alur penyelesaian task secara real-time. Setiap task yang dipindahkan ke kolom "Done" akan otomatis dihitung poinnya oleh sistem GardaScore™.',
  workflows: [
    { title: 'Buat Task Baru', desc: 'Klik tombol "+" di bawah kolom mana saja (To Do, In Progress, dsb.) untuk membuat task baru dengan detail lengkap.' },
    { title: 'Isi Detail Task', desc: 'Isi judul, deskripsi, deadline, prioritas, tipe task, dan estimasi jam. Tipe task & estimasi menentukan nilai poin.' },
    { title: 'Geser Antar Kolom', desc: 'Seret dan lepas (drag & drop) kartu task untuk memperbarui statusnya: To Do → In Progress → Done.' },
    { title: 'Poin Dihitung Otomatis', desc: 'Begitu task masuk ke kolom "Done", sistem GardaScore™ langsung menghitung poin berdasarkan ketepatan waktu, tipe, dan kualitas.' },
    { title: 'Lihat Hasil di Penggajian', desc: 'Akumulasi poin harian dapat dilihat di halaman Penggajian setiap akhir bulan.' },
  ],
  kpis: [
    { metric: 'Tipe Task', weight: '5–20 poin', desc: 'Bug Fix paling rendah (5), Deployment paling tinggi (20). Semakin kompleks task, semakin besar poinnya.' },
    { metric: 'Estimasi Jam', weight: '+1–5 poin', desc: 'Setiap 4 jam estimasi kerja mendapat +1 poin bonus. Isi estimasi seakurat mungkin.' },
    { metric: 'Prioritas', weight: '+0–5 poin', desc: 'Low +0, Medium +2, High +3, Urgent +5. Task prioritas tinggi memberi kontribusi lebih besar.' },
    { metric: 'Ketepatan Deadline', weight: '×0.7–×1.1', desc: 'Selesai sebelum/tepat deadline mendapat bonus ×1.1. Setiap hari terlambat -5%.' },
  ]
}




// =========================================================================
// 1. MODAL COMPONENT FOR CREATING NEW TASKS
// =========================================================================
function AddTaskModal({ isOpen, onClose, onSave, columnId, users }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState('medium')
  const [taskType, setTaskType] = useState('bug_fix')
  const [estimatedHours, setEstimatedHours] = useState(4)
  const [assignedUserId, setAssignedUserId] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true)
    await onSave({
      title,
      description,
      status: columnId,
      due_date: dueDate || null,
      priority,
      task_type: taskType,
      estimated_hours: parseInt(estimatedHours),
      user_id: assignedUserId ? parseInt(assignedUserId) : null
    })
    setLoading(false)
    setTitle('')
    setDescription('')
    setDueDate('')
    setPriority('medium')
    setTaskType('bug_fix')
    setEstimatedHours(4)
    setAssignedUserId('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">Add New Item</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title / Project Name</label>
            <input required autoFocus type="text" value={title} onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-slate-900 placeholder-slate-400"
              placeholder="e.g. Server Migration Protocol" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description (Optional)</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-slate-900 placeholder-slate-400"
              placeholder="Details about this project or task..." rows="3" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-slate-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
              <select value={priority} onChange={e => setPriority(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-slate-900">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Task Category (Base Points)</label>
              <select value={taskType} onChange={e => setTaskType(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-slate-900 text-sm">
                <option value="bug_fix">Bug Fix (20)</option>
                <option value="ui_minor">UI Minor (25)</option>
                <option value="ui_major">UI Major (50)</option>
                <option value="frontend_feature">Frontend Feature (60)</option>
                <option value="backend_feature">Backend Feature (70)</option>
                <option value="api_integration">API Integration (80)</option>
                <option value="database_migration">DB Migration (90)</option>
                <option value="deployment">Deployment (50)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Est. Hours</label>
              <input type="number" min="1" value={estimatedHours} onChange={e => setEstimatedHours(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-slate-900" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Assign To (Dikerjakan oleh)</label>
            <select value={assignedUserId} onChange={e => setAssignedUserId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-slate-900">
              <option value="">— Pilih Anggota Tim —</option>
              {users?.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium text-slate-900 bg-yellow-400 hover:bg-yellow-500 rounded-lg disabled:opacity-50 transition-colors shadow-sm">
              {loading ? 'Saving...' : 'Save Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// =========================================================================
// 2. TASK CARD COMPONENT
// =========================================================================
function TaskCard({ task, onDragStart, onDelete, onReview, onOpenDetail }) {
  const priorityColors = {
    low: 'bg-green-100 text-green-700',
    medium: 'bg-amber-100 text-amber-700',
    high: 'bg-red-100 text-red-700',
    urgent: 'bg-red-500 text-white',
  }
  const priorityLabels = { low: 'Low', medium: 'Med', high: 'High', urgent: 'Urgent' }
  const pColor = priorityColors[task.priority] || priorityColors['medium']
  const pLabel = priorityLabels[task.priority] || 'Med'

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      onClick={() => onOpenDetail(task)}
      className="bg-white rounded-lg border border-slate-200 p-3 cursor-pointer hover:shadow-md transition-all group relative hover:border-brand-300"
    >
      <div className="flex items-start gap-2">
        <GripVertical size={16} className="text-slate-300 mt-0.5 cursor-grab active:cursor-grabbing" />
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-slate-900 truncate" title={task.title}>{task.title}</h4>
          {task.description && (
            <p className="text-xs text-slate-600 mt-1 line-clamp-2">{task.description}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${pColor}`}>{pLabel}</span>
        {task.due_date && (
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <CalendarDays size={12} />
            {new Date(task.due_date.split('T')[0]).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-50">
        <div className="flex -space-x-2">
          {task.user && (
            <div
              className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-xs font-bold text-white border-2 border-white shadow-sm"
              title={`Added by ${task.user.name}`}
            >
              {task.user.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        {task.status === 'done' && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-200" title="Points Awarded">
              ★ {task.points_awarded || 0}
            </span>
            {onReview && (
              <select
                value={task.quality_rating || ''}
                onChange={(e) => onReview(task.id, e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="text-[10px] ml-auto p-1 border border-slate-200 rounded bg-white text-slate-700 focus:outline-none"
              >
                <option value="" disabled>Review Quality</option>
                <option value="exceeded">Exceeded (x1.2)</option>
                <option value="meets">Meets (x1.0)</option>
                <option value="revision">Revision (x0.8)</option>
              </select>
            )}
          </div>
        )}
        {task.status === 'cancelled' && onDelete && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(task.id) }}
            className="absolute bottom-2 right-2 p-1.5 bg-red-50 text-red-500 hover:bg-red-100 rounded opacity-0 group-hover:opacity-100 transition-all shadow-sm border border-red-100"
            title="Permanently Delete Task"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  )
}

// =========================================================================
// 3. KANBAN COLUMN COMPONENT
// =========================================================================
function KanbanColumn({ column, tasks, onDragOver, onDrop, onAddTask, onCellDragStart, onDelete, onReview, onOpenDetail, isPM }) {
  const statusColors = {
    todo: 'bg-blue-100', in_progress: 'bg-purple-100', done: 'bg-green-100', cancelled: 'bg-red-100',
  }
  const statusLabels = {
    todo: '📋 To Do', in_progress: '⚡ In Progress', done: '✅ Done', cancelled: '🛑 Cancelled',
  }

  return (
    <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3 min-w-80 flex flex-col shrink-0 drop-shadow-sm h-full max-h-full">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${statusColors[column.id]}`} />
          <h3 className="font-semibold text-slate-800 truncate text-sm uppercase tracking-wide">{statusLabels[column.id]}</h3>
          <span className="text-xs font-medium text-slate-600 bg-white px-2 py-0.5 rounded-full shadow-sm border border-slate-200">
            {tasks.length}
          </span>
        </div>
        {isPM && (
          <button onClick={() => onAddTask(column.id)} className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors text-slate-500" title="Add item here">
            <Plus size={16} />
          </button>
        )}
      </div>

      <div
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, column.id)}
        className="flex-1 space-y-3 bg-slate-100/50 rounded-lg p-2 min-h-64 overflow-y-auto transition-colors border border-transparent hover:border-slate-200"
      >
        {tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            onDragStart={onCellDragStart}
            onDelete={onDelete}
            onReview={onReview}
            onOpenDetail={onOpenDetail}
          />
        ))}
        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-24 text-slate-400 border-2 border-dashed border-slate-200 rounded-lg">
            <p className="text-xs font-medium">Drop items here</p>
          </div>
        )}
      </div>

      {isPM && (
        <button
          onClick={() => onAddTask(column.id)}
          className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 text-slate-500 hover:bg-white hover:text-slate-800 hover:shadow-sm hover:border-slate-300 border border-transparent rounded-lg transition-all text-sm font-semibold"
        >
          <Plus size={16} />Add New Item
        </button>
      )}
    </div>
  )
}

// =========================================================================
// 4. MAIN KANBAN BOARD PAGE
// =========================================================================
export default function KanbanPage() {
  const { projectId } = useParams()
  console.log('URL projectId:', projectId)

  const { user } = useAuth()
  const isPM = user?.role === 'project_manager'

  const {
    tasks,
    projects,
    users,
    setActiveProjectId,
    isLoading,
    createTask,
    updateTask,
    deleteTask,
    openTaskDetail
  } = useTaskContext()

  const [draggedTask, setDraggedTask] = useState(null)
  const [draggedFromColumn, setDraggedFromColumn] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeColumn, setActiveColumn] = useState('todo')
  const [viewMode, setViewMode] = useState('board')
  const [showGuide, setShowGuide] = useState(false)

  useEffect(() => {
    if (projectId) {
      setActiveProjectId(projectId)
    } else {
      setActiveProjectId(null)
    }
  }, [projectId, setActiveProjectId])

  // Mencari project aktif berdasarkan ID di URL
  const currentProject = useMemo(() => {
    if (!projectId || !projects) return null
    return projects.find((p) => String(p.id).trim() === String(projectId).trim())
  }, [projects, projectId])

  const columns = [
    { id: 'todo', title: 'To Do' },
    { id: 'in_progress', title: 'In Progress' },
    { id: 'done', title: 'Done' },
    { id: 'cancelled', title: 'Cancelled' },
  ]

  // Menyaring tugas yang hanya miliki project aktif saat ini
  const tasksByStatus = useMemo(() => {
    const projectTasks = tasks.filter((task) => {
      // Mendukung pengecekan snake_case (project_id) ataupun camelCase (projectId)
      const taskProjectId = task.project_id !== undefined ? task.project_id : task.projectId
      return String(taskProjectId).trim() === String(projectId).trim()
    })

    const groups = { todo: [], in_progress: [], done: [], cancelled: [] }

    projectTasks.forEach((task) => {
      const col = task.status || 'todo'
      if (groups[col]) {
        groups[col].push(task)
      } else {
        groups.todo.push(task)
      }
    })
    return groups
  }, [tasks, projectId])

  const handleDragStart = (e, task, columnId) => {
    setDraggedTask(task)
    setDraggedFromColumn(columnId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e, toColumnId) => {
    e.preventDefault()
    if (!draggedTask || draggedFromColumn === toColumnId) {
      setDraggedTask(null)
      setDraggedFromColumn(null)
      return
    }
    await updateTask(draggedTask.id, { status: toColumnId })
    setDraggedTask(null)
    setDraggedFromColumn(null)
  }

  const handleAddTask = (columnId) => {
    setActiveColumn(columnId)
    setIsModalOpen(true)
  }

  const handleCreateTask = async (taskData) => {
    const targetId = currentProject
      ? currentProject.id
      : projectId

    console.log('projectId URL:', projectId)
    console.log('currentProject:', currentProject)
    console.log('targetId:', targetId)

    const ok = await createTask({
      ...taskData,
      project_id: targetId
    })

    if (!ok) {
      alert('Failed to save task.')
    }
  }
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to permanently delete this task?')) return
    await deleteTask(taskId)
  }

  const handleReviewTask = async (taskId, qualityRating) => {
    await updateTask(taskId, { quality_rating: qualityRating })
  }

  return (
    <AppLayout>
      <ModuleGuideModal {...KANBAN_GUIDE} isOpen={showGuide} onClose={() => setShowGuide(false)} />
      <AddTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleCreateTask}
        columnId={activeColumn}
        users={users}
      />
      <div className="p-8 h-[calc(100vh-64px)] flex flex-col bg-slate-50/50">
        {/* Header Dinamis Project */}
        <div className="mb-6 shrink-0 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 font-medium">
              Projects / {currentProject ? currentProject.name : 'Project'}
            </p>

            <h1 className="mt-1 text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3 capitalize">
              <span
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl text-white font-bold"
                style={{ backgroundColor: currentProject?.color || '#D4A574' }}
              >
                {currentProject?.name?.charAt(0)?.toUpperCase() || '📁'}
              </span>
              {currentProject ? currentProject.name : 'Project'} Board
            </h1>

            <p className="text-slate-500 mt-2 text-sm">
              Drag & drop task antar kolom untuk mengubah status project.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Guide Button */}
            <button
              onClick={() => setShowGuide(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-brand-50 hover:border-brand-300 hover:text-brand-700 transition-all text-sm font-medium shadow-sm"
            >
              <HelpCircle size={16} />
              Panduan Modul
            </button>

            {/* Toggle View Mode */}
            <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${viewMode === 'list'
                  ? 'bg-slate-100 text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
                  }`}
              >
                List
              </button>

              <button
                onClick={() => setViewMode('board')}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${viewMode === 'board'
                  ? 'bg-slate-100 text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
                  }`}
              >
                Board
              </button>
            </div>

            {/* Tombol Tambah Task Utama */}
            {isPM && (
              <button
                onClick={() => handleAddTask('todo')}
                className="bg-brand-600 text-white px-5 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-md hover:bg-brand-700 transition-all"
              >
                <Plus size={18} />
                Add Task
              </button>
            )}
          </div>
        </div>

        {/* Board Workspace */}
        {isLoading ? (
          <div className="flex-1 overflow-x-hidden flex gap-5 mt-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-slate-50 border border-slate-200/60 rounded-xl p-3 min-w-80 flex flex-col shrink-0">
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="w-24 h-5 bg-slate-200/60 rounded-md animate-pulse" />
                  <div className="w-8 h-5 bg-slate-200/60 rounded-full animate-pulse" />
                </div>
                <div className="flex-1 space-y-3 bg-slate-100/50 rounded-lg p-2 min-h-[500px]">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="h-28 bg-slate-200/60 rounded-lg animate-pulse" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : viewMode === 'list' ? (
          <ProjectListView tasksByStatus={tasksByStatus} onAddTask={handleAddTask} onOpenDetail={openTaskDetail} />
        ) : (
          <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4 custom-scrollbar">
            <div className="flex gap-5 min-w-max h-full">
              {columns.map(column => (
                <KanbanColumn
                  key={column.id}
                  column={column}
                  tasks={tasksByStatus[column.id]}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onAddTask={handleAddTask}
                  onCellDragStart={(e, task) => handleDragStart(e, task, column.id)}
                  onDelete={isPM ? handleDeleteTask : undefined}
                  onReview={handleReviewTask}
                  onOpenDetail={openTaskDetail}
                  isPM={isPM}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}