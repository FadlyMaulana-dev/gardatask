import React, { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays, CheckSquare } from 'lucide-react'
import AppLayout from '../layouts/AppLayout'
import { useTaskContext } from '../context/TaskContext'
import { useNavigate, useLocation } from 'react-router-dom'

export default function CalendarPage() {
  const { tasks, openTaskDetail, activeProjectId, projects } = useTaskContext()
  const location = useLocation()
  const navState = location.state
  const initDate = navState?.month != null && navState?.year
    ? new Date(navState.year, navState.month, 1)
    : new Date()
  const [currentDate, setCurrentDate] = useState(initDate)
  const navigate = useNavigate()

  // Status Filter State
  const [statusFilter, setStatusFilter] = useState({
    todo: true,
    in_progress: true,
    cancelled: true,
    done: true
  })

  const toggleStatus = (status) => {
    setStatusFilter(prev => ({ ...prev, [status]: !prev[status] }))
  }

  const visibleTasks = useMemo(() => {
    if (!activeProjectId) return tasks
    return tasks.filter(task => String(task.project_id ?? task.projectId).trim() === String(activeProjectId).trim())
  }, [tasks, activeProjectId])

  // Filter tasks based on selected statuses
  const filteredTasks = visibleTasks.filter(t => statusFilter[t.status] || (!t.status && statusFilter.todo))

  // Build a map of dateStr -> tasks[]
  const tasksByDate = {}
  filteredTasks.forEach(task => {
    if (task.due_date) {
      const dateStr = task.due_date.split('T')[0].split(' ')[0]
      if (!tasksByDate[dateStr]) tasksByDate[dateStr] = []
      tasksByDate[dateStr].push(task)
    }
  })

  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay()

  const formatDate = (day) => {
    const year = currentDate.getFullYear()
    const month = String(currentDate.getMonth() + 1).padStart(2, '0')
    const dayStr = String(day).padStart(2, '0')
    return `${year}-${month}-${dayStr}`
  }

  const getTasksForDay = (day) => tasksByDate[formatDate(day)] || []

  const previousMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  const goToToday = () => setCurrentDate(new Date())

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  const days = Array(firstDay).fill(null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1))

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })
  const currentProject = activeProjectId
    ? projects.find(project => String(project.id).trim() === String(activeProjectId).trim())
    : null
  const todayObj = new Date()
  const todayHighlight = (todayObj.getMonth() === currentDate.getMonth() && todayObj.getFullYear() === currentDate.getFullYear())
    ? todayObj.getDate()
    : null

  // Redesigned Event Pill Styles inspired by FullCalendar (Light bg, strong left border)
  const priorityStyles = {
    low: 'bg-green-50 text-green-800 border-l-[3px] border-l-green-500',
    medium: 'bg-amber-50 text-amber-800 border-l-[3px] border-l-amber-500',
    high: 'bg-red-50 text-red-800 border-l-[3px] border-l-red-500',
    urgent: 'bg-purple-50 text-purple-800 border-l-[3px] border-l-purple-500',
  }

  const statusIcons = { todo: '📋', in_progress: '⚡', cancelled: '🛑', done: '✅' }
  const statusLabels = { todo: 'To Do', in_progress: 'In Progress', cancelled: 'Cancelled', done: 'Done' }
  const statusColors = {
    todo: 'text-slate-600 bg-slate-100',
    in_progress: 'text-amber-600 bg-amber-100',
    cancelled: 'text-red-600 bg-red-100',
    done: 'text-green-600 bg-green-100'
  }

  const upcomingTasks = filteredTasks
    .filter(t => t.due_date && new Date(t.due_date.split('T')[0]) >= new Date(formatDate(todayObj.getDate())) && t.status !== 'done')
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
    .slice(0, 7)

  return (
    <AppLayout>
      <div className="p-8 space-y-6 bg-white min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Calendar</h1>
            {currentProject && (
              <p className="text-sm text-brand-600 font-semibold mt-1">
                Showing tasks for: {currentProject.name}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={goToToday}
              className="px-4 py-2 bg-white border border-slate-200 text-brand-600 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
            >
              Today
            </button>
            <div className="flex bg-white border border-slate-200 rounded-lg shadow-sm">
              <button onClick={previousMonth} className="p-2 hover:bg-slate-50 rounded-l-lg transition-colors border-r border-slate-200">
                <ChevronLeft size={18} className="text-slate-600" />
              </button>
              <span className="px-5 py-2 text-sm font-semibold text-slate-900 min-w-36 text-center">{monthName}</span>
              <button onClick={nextMonth} className="p-2 hover:bg-slate-50 rounded-r-lg transition-colors border-l border-slate-200">
                <ChevronRight size={18} className="text-slate-600" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-3 lg:col-span-2 space-y-6">
            
            {/* Status Filter Component */}
            <div>
              <div className="flex items-center gap-2 mb-3 px-1">
                <ChevronRight size={14} className="text-slate-400 rotate-90" />
                <h3 className="font-semibold text-slate-600 text-sm">Status</h3>
              </div>
              <div className="space-y-2 px-2 text-sm font-medium">
                {Object.keys(statusFilter).map(status => (
                  <label key={status} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={statusFilter[status]}
                      onChange={() => toggleStatus(status)}
                      className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300 cursor-pointer"
                    />
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColors[status]}`}>
                      {statusLabels[status]}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Mini Calendar (Optional based on image, keeping it smaller) */}
            <div className="pt-2">
               <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="font-semibold text-slate-900 text-sm">{monthName}</h3>
                <div className="flex gap-1">
                  <button onClick={previousMonth} className="p-0.5 hover:bg-slate-100 rounded transition-colors text-slate-400">
                    <ChevronLeft size={16} />
                  </button>
                  <button onClick={nextMonth} className="p-0.5 hover:bg-slate-100 rounded transition-colors text-slate-400">
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1 mb-1 text-center">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                  <div key={i} className="text-[10px] font-semibold text-slate-400">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-y-1 text-center">
                {days.map((day, i) => (
                   <div key={i} className={`text-xs p-1 rounded-full w-6 h-6 mx-auto flex items-center justify-center ${
                      day === todayHighlight ? 'bg-brand-600 text-white font-bold' :
                      day ? 'text-slate-700 hover:bg-slate-100 cursor-pointer' : ''
                   }`}>
                      {day}
                   </div>
                ))}
              </div>
            </div>

          </div>

          {/* Main Calendar View */}
          <div className="col-span-9 lg:col-span-10">
            <div className="rounded-xl border border-slate-200/60 overflow-hidden bg-white">
              {/* Weekday Headers */}
              <div className="grid grid-cols-7 border-b border-slate-200/60 bg-white">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                  <div key={day} className="p-3 text-sm font-semibold text-slate-500 border-r border-slate-200/60 last:border-r-0 text-center">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7">
                {days.map((day, i) => {
                  const dayTasks = day ? getTasksForDay(day) : []
                  const isToday = day === todayHighlight
                  return (
                    <div
                      key={i}
                      className={`min-h-[120px] p-1 border-r border-b border-slate-200/60 last-of-type:border-r-0 ${
                        isToday ? 'bg-brand-50/10' : ''
                      } transition-colors group`}
                    >
                      {day && (
                        <>
                          <div className="flex justify-end p-1 mb-1">
                             <span className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full ${
                                isToday ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-500 group-hover:text-slate-800'
                              }`}>
                               {day}
                             </span>
                          </div>
                          
                          <div className="space-y-1.5 px-0.5">
                            {dayTasks.slice(0, 4).map(task => (
                                <div
                                  key={task.id}
                                  onClick={() => openTaskDetail(task)}
                                  className={`text-[11px] font-semibold px-2 py-1 flex flex-col rounded cursor-pointer hover:shadow-sm transition-all ${
                                    priorityStyles[task.priority] || priorityStyles.medium
                                  } hover:opacity-90`}
                                  title={task.title}
                                >
                                  <div className="flex items-center truncate">
                                    <span className="truncate">{task.title}</span>
                                  </div>
                                  {task.description && (
                                    <div className="text-[10px] opacity-80 truncate font-normal mt-0.5">
                                      {task.description}
                                    </div>
                                  )}
                                </div>
                            ))}
                            {dayTasks.length > 4 && (
                              <p className="text-[10px] text-slate-400 font-medium pl-1 hover:text-slate-600 cursor-pointer">
                                +{dayTasks.length - 4} more
                              </p>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
