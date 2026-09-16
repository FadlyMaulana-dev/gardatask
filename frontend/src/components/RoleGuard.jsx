import React from 'react'
import { ShieldOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

/**
 * RoleGuard — Blocks access to a route if the current user's role
 * is not in the allowedRoles list. Project Manager always has full access.
 *
 * Usage:
 *   <RoleGuard allowedRoles={['sosmed']}>
 *     <SosmedCalendar />
 *   </RoleGuard>
 */
export default function RoleGuard({ allowedRoles = [], children }) {
  const { user } = useAuth()

  // While user is loading, render nothing (ProtectedRoute handles redirect)
  if (!user) return null

  // Project Manager always has access
  if (user.role === 'project_manager') return <>{children}</>

  // Check if user role is allowed
  if (allowedRoles.includes(user.role)) return <>{children}</>

  // Access denied
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6">
      <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-4">
        <ShieldOff className="text-red-500" size={32} />
      </div>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Akses Ditolak</h1>
      <p className="text-slate-500 max-w-sm">
        Anda tidak memiliki hak akses ke halaman ini. Silakan hubungi{' '}
        <strong className="text-slate-700">Project Manager</strong> jika ada pertanyaan.
      </p>
      <div className="mt-4 px-4 py-2 bg-slate-100 rounded-xl text-sm text-slate-600">
        Role Anda: <span className="font-semibold capitalize">{user.jabatan || user.role}</span>
      </div>
    </div>
  )
}
