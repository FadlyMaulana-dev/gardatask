import React from 'react'
import {
  LayoutDashboard,
  KanbanSquare,
  Calendar,
  Users,
  Settings,
  Home,
  BarChart3,
  DollarSign,
  Megaphone,
  Banknote,
  Smartphone,
  History,
  MessageCircle
} from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Define which roles can see each nav item.
// 'project_manager' always sees everything (handled in filter logic).
// Empty allowedRoles means ALL roles can see it.
const navItems = [
  { icon: Home,           label: 'Home',       href: '/dashboard',      allowedRoles: [] },
  { icon: LayoutDashboard,label: 'Dashboard',  href: '/dashboard',      allowedRoles: [] },
  { icon: KanbanSquare,   label: 'Kanban',     href: '/projects',       allowedRoles: [] },
  { icon: Calendar,       label: 'Calendar',   href: '/calendar',       allowedRoles: [] },
  { icon: BarChart3,      label: 'Planner',    href: '/yearly-planner', allowedRoles: [] },
  { icon: History,        label: 'Riwayat',    href: '/history',        allowedRoles: [] },
  { icon: MessageCircle,  label: 'Chat',       href: '/chat',           allowedRoles: [] },
  { icon: Users,          label: 'Team',       href: '/team',           allowedRoles: ['project_manager'] },
  { icon: DollarSign,     label: 'Finance',    href: '/finance',        allowedRoles: ['finance'] },
  { icon: Megaphone,      label: 'Marketing',  href: '/crm/marketing',  allowedRoles: ['marketing'] },
  { icon: Smartphone,     label: 'Sosmed',     href: '/sosmed',         allowedRoles: ['sosmed'] },
  { icon: Banknote,       label: 'Penggajian', href: '/payroll',        allowedRoles: ['project_manager', 'finance'] },
  { icon: Settings,       label: 'Settings',   href: '/settings',       allowedRoles: [] },
]

export default function Sidebar({ open }) {
  const location = useLocation()
  const { user } = useAuth()

  const role = user?.role || 'member'
  const isPM = role === 'project_manager'

  // Filter nav items by role
  const visibleItems = navItems.filter(item => {
    if (item.allowedRoles.length === 0) return true   // all roles
    if (isPM) return true                              // PM sees all
    return item.allowedRoles.includes(role)
  })

  return (
    <div
      className={`${open ? 'w-64' : 'w-20'
        } bg-white border-r border-slate-200 transition-all duration-300 flex flex-col`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-center px-4 border-b border-slate-200">
        <div className={`${open ? 'text-left' : 'text-center'}`}>
          {open ? (
            <div>
              <p className="text-lg font-bold text-brand-600">GardaTask</p>
              <p className="text-xs text-slate-500">Productivity</p>
            </div>
          ) : (
            <p className="text-lg font-bold text-brand-600">GT</p>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
        {visibleItems.map((item) => {
          const isActive = location.pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.label}
              to={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive
                ? 'bg-brand-50 text-brand-600'
                : 'text-slate-700 hover:bg-slate-50'
                }`}
              title={item.label}
            >
              <Icon size={20} />
              {open && (
                <span className="text-sm font-medium">
                  {item.label}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer — show jabatan */}
      <div className="p-4 border-t border-slate-200">
        {open ? (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-brand-100 rounded-full flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-brand-600">
                {user?.name?.charAt(0)?.toUpperCase() || '?'}
              </span>
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-slate-800 truncate">{user?.name || '—'}</p>
              <p className="text-xs text-slate-500 truncate">{user?.jabatan || user?.role || 'Member'}</p>
            </div>
          </div>
        ) : (
          <div className="w-9 h-9 bg-brand-100 rounded-full flex items-center justify-center cursor-pointer hover:bg-brand-200 mx-auto">
            <span className="text-sm font-bold text-brand-600">
              {user?.name?.charAt(0)?.toUpperCase() || '?'}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}