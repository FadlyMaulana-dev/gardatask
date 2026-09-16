import React, { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2, Shield, User, Users, HelpCircle, Lock } from 'lucide-react'
import AppLayout from '../layouts/AppLayout'
import { useAuth } from '../context/AuthContext'
import ModuleGuideModal from '../components/ModuleGuideModal'
import { API_URL } from '../lib/api'

const TEAM_GUIDE = {
  title: 'Panduan — Team Management',
  description: 'Halaman ini digunakan untuk mengelola seluruh anggota tim dalam workspace GardaTask. Hanya Project Manager yang dapat mengundang, mengubah peran, atau menghapus anggota.',
  workflows: [
    { title: 'Undang Anggota Baru', desc: 'Klik "Invite Member", masukkan email, pilih jabatan dan role. Sistem mengirim tautan pendaftaran unik.' },
    { title: 'Anggota Daftar via Tautan', desc: 'Penerima email membuka tautan, membuat nama dan kata sandi, lalu otomatis masuk dengan hak akses sesuai jabatannya.' },
    { title: 'Kelola Anggota', desc: 'Project Manager dapat melihat jabatan setiap anggota dan menghapus anggota dari tim.' },
  ],
  kpis: [
    { metric: 'Project Manager', weight: 'Full Access', desc: 'Akses penuh ke semua modul termasuk Team, Payroll, Finance, Sosmed, dan Marketing.' },
    { metric: 'Social Media Specialist', weight: 'Sosmed', desc: 'Hanya dapat mengakses modul Sosmed.' },
    { metric: 'Finance & Accounting', weight: 'Finance', desc: 'Hanya dapat mengakses modul Finance.' },
    { metric: 'Marketing', weight: 'Marketing/CRM', desc: 'Hanya dapat mengakses modul Marketing/CRM.' },
    { metric: 'Member', weight: 'Core Only', desc: 'Hanya mengakses Dashboard, Kanban, Calendar, dan Planner.' },
  ]
}

// Map role value → label
const ROLE_OPTIONS = [
  { value: 'project_manager', label: 'Project Manager' },
  { value: 'sosmed',          label: 'Social Media Specialist' },
  { value: 'finance',         label: 'Finance & Accounting' },
  { value: 'marketing',       label: 'Marketing & Client Acquisition' },
  { value: 'member',          label: 'Member (Core Access)' },
]

// Map role value → jabatan default
const ROLE_TO_JABATAN = {
  project_manager: 'Project Manager',
  sosmed:          'Social Media Specialist',
  finance:         'Finance & Accounting',
  marketing:       'Marketing & Client Acquisition',
  member:          'Member',
}

export default function TeamPage() {
  const { token, logout, user: currentUser } = useAuth()
  const isPM = currentUser?.role === 'project_manager'

  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showGuide, setShowGuide] = useState(false)

  useEffect(() => {
    fetch(`${API_URL}/users`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      if (res.status === 401) { logout(); throw new Error('401') }
      return res.json()
    })
    .then(data => {
      const users = data.data || []
      setMembers(users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        avatar: u.name.charAt(0).toUpperCase(),
        role: u.role || 'member',
        jabatan: u.jabatan || '—',
        joinedAt: u.created_at,
        status: 'active',
        tasks: u.tasks_count || 0
      })))
      setLoading(false)
    })
    .catch(console.error)
  }, [token])

  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole]   = useState('member')
  const [inviteJabatan, setInviteJabatan] = useState('Member')
  const [inviting, setInviting] = useState(false)

  // Auto-fill jabatan when role changes
  const handleRoleChange = (val) => {
    setInviteRole(val)
    setInviteJabatan(ROLE_TO_JABATAN[val] || '')
  }

  const roleIcons = {
    project_manager: Shield,
    sosmed:   Users,
    finance:  Users,
    marketing: Users,
    member:   User,
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'project_manager': return 'bg-red-100 text-red-700'
      case 'sosmed':           return 'bg-purple-100 text-purple-700'
      case 'finance':          return 'bg-green-100 text-green-700'
      case 'marketing':        return 'bg-orange-100 text-orange-700'
      default:                 return 'bg-blue-100 text-blue-700'
    }
  }

  const getRoleLabel = (role) => {
    return ROLE_OPTIONS.find(r => r.value === role)?.label || role
  }

  const handleInvite = async () => {
    if (!inviteEmail) return
    setInviting(true)
    try {
      const res = await fetch(`${API_URL}/users/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole, jabatan: inviteJabatan })
      })
      const data = await res.json()
      if (res.ok) {
        alert(data.message || `Undangan berhasil dikirim ke ${inviteEmail}`)
        setInviteEmail('')
        setInviteRole('member')
        setInviteJabatan('Member')
        setShowInviteForm(false)
      } else {
        alert(data.message || 'Gagal mengirim undangan.')
      }
    } catch (err) {
      alert('Terjadi kesalahan jaringan.')
    } finally {
      setInviting(false)
    }
  }

  const handleRemoveMember = async (id, name) => {
    if (!window.confirm(`Yakin ingin menghapus ${name} dari tim?`)) return
    try {
      const res = await fetch(`${API_URL}/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        setMembers(prev => prev.filter(m => m.id !== id))
      } else {
        const data = await res.json()
        alert(data.message || 'Gagal menghapus anggota.')
      }
    } catch(err) {
      alert('Terjadi kesalahan jaringan.')
    }
  }

  return (
    <AppLayout>
      <ModuleGuideModal {...TEAM_GUIDE} isOpen={showGuide} onClose={() => setShowGuide(false)} />
      <div className="bg-slate-50 min-h-screen p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Team Management</h1>
            <p className="text-slate-600 mt-2">Manage team members and permissions</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowGuide(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-brand-50 hover:border-brand-300 hover:text-brand-700 transition-all text-sm font-medium shadow-sm"
            >
              <HelpCircle size={16} />
              Panduan Modul
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <p className="text-sm text-slate-600 mb-2">Total Members</p>
            <p className="text-3xl font-bold text-slate-900">{members.length}</p>
            <p className="text-xs text-slate-600 mt-2">All active</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <p className="text-sm text-slate-600 mb-2">Project Manager</p>
            <p className="text-3xl font-bold text-slate-900">{members.filter(m => m.role === 'project_manager').length}</p>
            <p className="text-xs text-slate-600 mt-2">Full access</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <p className="text-sm text-slate-600 mb-2">Specialist</p>
            <p className="text-3xl font-bold text-slate-900">{members.filter(m => ['sosmed','finance','marketing'].includes(m.role)).length}</p>
            <p className="text-xs text-slate-600 mt-2">Module access</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <p className="text-sm text-slate-600 mb-2">Members</p>
            <p className="text-3xl font-bold text-slate-900">{members.filter(m => m.role === 'member').length}</p>
            <p className="text-xs text-slate-600 mt-2">Core access</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900">Team Members</h2>
                {isPM ? (
                  <button
                    onClick={() => setShowInviteForm(!showInviteForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors font-medium"
                  >
                    <Plus size={16} />
                    Invite Member
                  </button>
                ) : (
                  <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-400 rounded-lg text-sm font-medium cursor-not-allowed">
                    <Lock size={14} />
                    PM Only
                  </div>
                )}
              </div>

              {/* Invite Form — PM only */}
              {showInviteForm && isPM && (
                <div className="px-6 py-4 bg-brand-50 border-b border-brand-200 space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="Alamat email anggota baru"
                      className="flex-1 px-4 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-slate-900 placeholder-slate-400 font-medium"
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-xs font-semibold text-slate-600 mb-1 block">Role / Hak Akses</label>
                      <select
                        value={inviteRole}
                        onChange={(e) => handleRoleChange(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-brand-500 text-slate-900 text-sm"
                      >
                        {ROLE_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="text-xs font-semibold text-slate-600 mb-1 block">Jabatan (custom)</label>
                      <input
                        type="text"
                        value={inviteJabatan}
                        onChange={(e) => setInviteJabatan(e.target.value)}
                        placeholder="cth. Fullstack Developer"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-brand-500 text-slate-900 text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={handleInvite}
                      disabled={inviting}
                      className="px-5 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors font-medium disabled:opacity-50 text-sm"
                    >
                      {inviting ? 'Mengirim...' : 'Kirim Undangan'}
                    </button>
                    <button
                      onClick={() => setShowInviteForm(false)}
                      className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              )}

              {/* Members List */}
              <div className="divide-y divide-slate-200">
                {loading ? (
                  <div className="p-8 text-center text-slate-500 font-medium">Loading team members...</div>
                ) : members.map((member) => {
                  const RoleIcon = roleIcons[member.role] || User
                  return (
                    <div key={member.id} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-sm font-bold text-white">
                            {member.avatar}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-slate-900">{member.name}</h3>
                              <span className="w-2 h-2 rounded-full bg-green-500" />
                            </div>
                            <p className="text-sm text-slate-500">{member.email}</p>
                            <div className="flex items-center gap-3 mt-2 flex-wrap">
                              <span className={`text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1 ${getRoleColor(member.role)}`}>
                                <RoleIcon size={12} />
                                {getRoleLabel(member.role)}
                              </span>
                              <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                                {member.jabatan}
                              </span>
                              <span className="text-xs text-slate-500">
                                Joined {new Date(member.joinedAt).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions — PM only, can't delete self */}
                        {isPM && member.id !== currentUser?.id && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleRemoveMember(member.id, member.name)}
                              className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                              title="Hapus Anggota"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Permissions Guide */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Hak Akses per Role</h3>
              <div className="space-y-3">
                {[
                  { role: 'Project Manager', perms: ['Full access', 'Semua modul'], color: 'bg-red-50 border-red-200' },
                  { role: 'Social Media',    perms: ['Sosmed module'], color: 'bg-purple-50 border-purple-200' },
                  { role: 'Finance',         perms: ['Finance module'], color: 'bg-green-50 border-green-200' },
                  { role: 'Marketing',       perms: ['CRM/Marketing module'], color: 'bg-orange-50 border-orange-200' },
                  { role: 'Member',          perms: ['Dashboard', 'Kanban', 'Calendar', 'Planner'], color: 'bg-blue-50 border-blue-200' },
                ].map((item) => (
                  <div key={item.role} className={`p-3 rounded-lg border ${item.color}`}>
                    <p className="font-medium text-sm text-slate-900 mb-1">{item.role}</p>
                    <ul className="space-y-0.5">
                      {item.perms.map((perm) => (
                        <li key={perm} className="text-xs text-slate-600 flex items-center gap-1.5">
                          <span>✓</span> {perm}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Workspace */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Workspace</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-slate-900 block mb-2">Workspace Name</label>
                  <input type="text" defaultValue="GardaTech" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
                <button className="w-full px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors font-medium">
                  Save Changes
                </button>
              </div>
            </div>

            <div className="bg-brand-50 rounded-xl border border-brand-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-2">Plan</h3>
              <p className="text-sm text-slate-600 mb-4">Premium Team</p>
              <button className="w-full px-4 py-2 border-2 border-brand-600 text-brand-600 rounded-lg hover:bg-brand-50 transition-colors font-medium">
                Manage Billing
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
