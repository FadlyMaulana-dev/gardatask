import React, { useState, useRef, useEffect } from 'react'
import { Menu, Bell, Settings, LogOut, Search, ArrowLeft, X } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTaskContext } from '../context/TaskContext'
import Sidebar from '../components/Sidebar'
import NotificationsCenter from '../components/NotificationsCenter'
import TaskDetailModal from '../components/TaskDetailModal'

export default function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    // Persist sidebar preference in localStorage (default: open)
    const saved = localStorage.getItem('sidebar_open')
    return saved !== null ? saved === 'true' : true
  })
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const searchRef = useRef(null)

  const { logout } = useAuth()
  const {
    searchQuery, setSearchQuery, searchResults,
    openTaskDetail, selectedTask, taskDetailOpen, closeTaskDetail,
    updateTask, refreshTasks,
  } = useTaskContext()
  const location = useLocation()
  const navigate = useNavigate()

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchFocused(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const priorityColors = {
    low: 'bg-green-100 text-green-700',
    medium: 'bg-amber-100 text-amber-700',
    high: 'bg-red-100 text-red-700',
    urgent: 'bg-red-600 text-white',
  }

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <nav className="bg-white border-b border-slate-200 h-16 flex items-center px-6 gap-4 z-30 relative">
          <button
            onClick={() => {
              const next = !sidebarOpen
              setSidebarOpen(next)
              localStorage.setItem('sidebar_open', String(next))
            }}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
            title="Toggle sidebar"
          >
            <Menu size={20} className="text-slate-600" />
          </button>

          {location.pathname !== '/dashboard' && location.pathname !== '/' && (
            <Link
              to="/dashboard"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ml-1"
            >
              <ArrowLeft size={16} />
              Dashboard
            </Link>
          )}

          {/* Search Bar */}
          <div className="flex-1 max-w-md ml-2 relative" ref={searchRef}>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                placeholder="Search tasks..."
                className="w-full pl-10 pr-9 py-2 bg-slate-100 text-sm text-slate-900 placeholder-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Search Results Dropdown */}
            {searchFocused && searchQuery.trim().length >= 2 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden max-h-72 overflow-y-auto">
                {searchResults.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-slate-500">Tidak ada task ditemukan.</div>
                ) : (
                  searchResults.map(task => (
                    <button
                      key={task.id}
                      onClick={() => {
                        openTaskDetail(task)
                        setSearchQuery('')
                        setSearchFocused(false)
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-left border-b border-slate-100 last:border-b-0 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{task.title}</p>
                        <p className="text-xs text-slate-500 truncate">{task.description || 'No description'}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${priorityColors[task.priority] || priorityColors.medium}`}>
                        {task.priority || 'medium'}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors relative"
              title="Notifications"
            >
              <Bell size={20} className="text-slate-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            <Link
              to="/settings"
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              title="Settings"
            >
              <Settings size={20} className="text-slate-600" />
            </Link>

            <button
              onClick={logout}
              className="p-2 hover:bg-red-100 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut size={20} className="text-slate-600 hover:text-red-600" />
            </button>
          </div>
        </nav>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      {/* Notifications Center */}
      <NotificationsCenter
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />

      {/* Global Task Detail Modal */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={taskDetailOpen}
        onClose={closeTaskDetail}
        onUpdate={updateTask}
        onRefresh={refreshTasks}
      />
    </div>
  )
}
