import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, FolderKanban, X } from 'lucide-react'
import AppLayout from '../layouts/AppLayout'
import { useTaskContext } from '../context/TaskContext'
import { useAuth } from '../context/AuthContext'
import { API_URL } from '../lib/api'

export default function ProjectsPage() {
    const navigate = useNavigate()
    const { token, user } = useAuth()
    const { projects, refreshProjects } = useTaskContext()
    const isPM = user?.role === 'project_manager'

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [projectName, setProjectName] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleAddProject = async () => {
        if (!projectName.trim()) return
        
        setIsLoading(true)
        try {
            const res = await fetch(`${API_URL}/projects`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: projectName,
                    description: ''
                })
            })

            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`)
            }

            setProjectName('')
            setIsModalOpen(false)
            await refreshProjects()
        } catch (err) {
            console.error('Error creating project:', err)
            alert('Gagal membuat project')
        } finally {
            setIsLoading(false)
        }
    }

    const handleDeleteProject = async (id) => {
        if (!window.confirm('Yakin ingin menghapus project ini?'))
            return

        try {
            const res = await fetch(
                `${API_URL}/projects/${id}`,
                {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`)
            }

            await refreshProjects()
        } catch (err) {
            console.error('Error deleting project:', err)
            alert('Gagal menghapus project')
        }
    }

    return (
        <AppLayout>
            <div className="min-h-screen bg-slate-50 p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-slate-900">
                            Daftar Project
                        </h1>

                        <p className="mt-2 text-slate-500">
                            Pilih project untuk membuka Kanban Board.
                        </p>
                    </div>

                    {isPM && (
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="
                  bg-brand-600
                  text-white
                  px-5
                  py-3
                  rounded-xl
                  font-semibold
                  flex
                  items-center
                  gap-2
                  hover:bg-brand-700
                  transition
                  shadow-md
                "
                        >
                            <Plus size={20} />
                            Tambah Project
                        </button>
                    )}
                </div>

                {/* List Project */}
                {projects.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center">
                        <FolderKanban
                            size={60}
                            className="mx-auto text-slate-300 mb-4"
                        />

                        <h2 className="text-xl font-semibold text-slate-700">
                            Belum Ada Project
                        </h2>

                        <p className="text-slate-500 mt-2">
                            Klik tombol "Tambah Project" untuk membuat project baru.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                        {projects.map((project) => (
                            <div
                                key={project.id}
                                onClick={() =>
                                    navigate(`/projects/${project.id}`)
                                }
                                className="
                  bg-white
                  rounded-2xl
                  p-6
                  border
                  border-slate-200
                  shadow-sm
                  cursor-pointer
                  hover:shadow-lg
                  hover:-translate-y-1
                  transition-all
                "
                            >
                                {/* Header Card */}
                                <div className="flex items-start justify-between">
                                    <div
                                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl text-white font-bold shadow-sm"
                                        style={{ backgroundColor: project.color || '#D4A574' }}
                                    >
                                        {project.name?.charAt(0)?.toUpperCase() || '📁'}
                                    </div>

                                    {isPM && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleDeleteProject(project.id)
                                            }}
                                            className="
                          p-2
                          rounded-lg
                          text-red-500
                          hover:bg-red-50
                          transition
                        "
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="mt-5">
                                    <h2 className="text-xl font-bold text-slate-900">
                                        {project.name}
                                    </h2>

                                    <p className="mt-2 text-sm text-slate-500">
                                        {project.description || 'Project baru'}
                                    </p>
                                </div>

                                {/* Task */}
                                <div className="flex items-center gap-2 mt-5">
                                    <FolderKanban
                                        size={16}
                                        className="text-slate-400"
                                    />

                                    <span className="text-sm text-slate-600">
                                        {project.tasks_count || project.tasks || 0} Task
                                    </span>
                                </div>

                                {/* Progress */}
                                <div className="mt-5">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-xs text-slate-500">
                                            Progress
                                        </span>

                                        <span className="text-xs font-semibold text-brand-600">
                                            {project.progress || 0}%
                                        </span>
                                    </div>

                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-brand-500 rounded-full"
                                            style={{
                                                width: `${project.progress || 0}%`
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Modal Tambah Project */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
                            <div className="flex justify-between items-center mb-5">
                                <h2 className="text-xl font-bold text-slate-900">
                                    Tambah Project
                                </h2>

                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2 hover:bg-slate-100 rounded-lg"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <input
                                type="text"
                                placeholder="Nama Project"
                                value={projectName}
                                onChange={(e) =>
                                    setProjectName(e.target.value)
                                }
                                className="
                  w-full
                  border
                  border-slate-300
                  rounded-xl
                  px-4
                  py-3
                  bg-white
                  text-slate-900
                  placeholder:text-slate-400
                  focus:outline-none
                  focus:ring-2
                  focus:ring-brand-500
                  focus:border-brand-500
                "
                            />

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="
                    px-5
                    py-2
                    rounded-xl
                    border
                    border-slate-300
                    bg-white
                    text-slate-700
                    font-semibold
                    hover:bg-slate-100
                    transition
                  "
                                >
                                    Batal
                                </button>

                                <button
                                    onClick={handleAddProject}
                                    disabled={isLoading}
                                    className="
                    px-5
                    py-2
                    rounded-xl
                    bg-brand-600
                    text-white
                    font-semibold
                    hover:bg-brand-700
                    disabled:bg-brand-400
                    transition
                  "
                                >
                                    {isLoading ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    )
}