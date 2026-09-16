import React, { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2, X, FileText } from 'lucide-react'
import AppLayout from '../layouts/AppLayout'
import { useAuth } from '../context/AuthContext'
import { API_URL } from '../lib/api'

export default function SosmedCalendar() {
    const { token } = useAuth()
    
    const [contents, setContents] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editingId, setEditingId] = useState(null)
    
    const [formData, setFormData] = useState({
        hari: '',
        format: '',
        konsep: '',
        funnel_layer: '',
        deskripsi_ide: '',
        storyboard: '',
        caption: '',
        progres: 'To Do'
    })

    const fetchContents = async () => {
        setIsLoading(true)
        try {
            const res = await fetch(`${API_URL}/sosmed`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            if (res.ok) {
                const data = await res.json()
                setContents(data)
            }
        } catch (error) {
            console.error('Error fetching sosmed contents:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchContents()
    }, [token])

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const openCreateModal = () => {
        setFormData({
            hari: '',
            format: '',
            konsep: '',
            funnel_layer: '',
            deskripsi_ide: '',
            storyboard: '',
            caption: '',
            progres: 'To Do'
        })
        setIsEditing(false)
        setEditingId(null)
        setIsModalOpen(true)
    }

    const openEditModal = (content) => {
        setFormData({
            hari: content.hari || '',
            format: content.format || '',
            konsep: content.konsep || '',
            funnel_layer: content.funnel_layer || '',
            deskripsi_ide: content.deskripsi_ide || '',
            storyboard: content.storyboard || '',
            caption: content.caption || '',
            progres: content.progres || 'To Do'
        })
        setIsEditing(true)
        setEditingId(content.id)
        setIsModalOpen(true)
    }

    const handleSave = async () => {
        try {
            const url = isEditing 
                ? `${API_URL}/sosmed/${editingId}`
                : `${API_URL}/sosmed`
                
            const method = isEditing ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                fetchContents()
                setIsModalOpen(false)
            } else {
                alert('Gagal menyimpan konten')
            }
        } catch (error) {
            console.error('Error saving content:', error)
            alert('Terjadi kesalahan saat menyimpan')
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Yakin ingin menghapus konten ini?')) return

        try {
            const res = await fetch(`${API_URL}/sosmed/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            if (res.ok) {
                fetchContents()
            } else {
                alert('Gagal menghapus konten')
            }
        } catch (error) {
            console.error('Error deleting content:', error)
        }
    }

    return (
        <AppLayout>
            <div className="min-h-screen bg-slate-50 p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">
                            Kalender Konten Sosmed
                        </h1>
                        <p className="mt-2 text-slate-500">
                            Kelola jadwal dan ide konten media sosial.
                        </p>
                    </div>

                    <button
                        onClick={openCreateModal}
                        className="bg-brand-600 text-white px-5 py-3 rounded-xl font-semibold flex items-center gap-2 hover:bg-brand-700 transition shadow-md"
                    >
                        <Plus size={20} />
                        Tambah Konten
                    </button>
                </div>

                {/* Table Content */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto p-0">
                        <table className="w-full text-left border-collapse min-w-max">
                            <thead>
                                <tr className="bg-brand-50 border-b border-brand-200 text-brand-800 text-sm">
                                    <th className="p-4 font-semibold border-r border-brand-100 last:border-r-0">HARI</th>
                                    <th className="p-4 font-semibold border-r border-brand-100">FORMAT</th>
                                    <th className="p-4 font-semibold border-r border-brand-100">KONSEP</th>
                                    <th className="p-4 font-semibold border-r border-brand-100">FUNNEL LAYER (TAHAPAN)</th>
                                    <th className="p-4 font-semibold border-r border-brand-100 max-w-xs">DESKRIPSI & IDE</th>
                                    <th className="p-4 font-semibold border-r border-brand-100 min-w-[200px] max-w-sm">STORYBOARD</th>
                                    <th className="p-4 font-semibold border-r border-brand-100 max-w-xs">CAPTION</th>
                                    <th className="p-4 font-semibold border-r border-brand-100">PROGRES</th>
                                    <th className="p-4 font-semibold text-center">AKSI</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="9" className="p-8 text-center text-slate-500">
                                            Memuat data...
                                        </td>
                                    </tr>
                                ) : contents.length === 0 ? (
                                    <tr>
                                        <td colSpan="9" className="p-12 text-center">
                                            <FileText size={48} className="mx-auto text-slate-300 mb-4" />
                                            <p className="text-slate-500 mb-2">Belum ada konten sosmed.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    contents.map((item) => (
                                        <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors text-slate-900">
                                            <td className="p-4 align-top border-r border-slate-100 font-medium whitespace-nowrap">{item.hari}</td>
                                            <td className="p-4 align-top border-r border-slate-100 whitespace-nowrap">{item.format}</td>
                                            <td className="p-4 align-top border-r border-slate-100 whitespace-nowrap">{item.konsep}</td>
                                            <td className="p-4 align-top border-r border-slate-100 whitespace-nowrap">{item.funnel_layer}</td>
                                            <td className="p-4 align-top border-r border-slate-100 whitespace-pre-wrap min-w-[200px] text-sm text-slate-900">{item.deskripsi_ide}</td>
                                            <td className="p-4 align-top border-r border-slate-100 whitespace-pre-wrap min-w-[250px] text-sm text-slate-900">{item.storyboard}</td>
                                            <td className="p-4 align-top border-r border-slate-100 whitespace-pre-wrap min-w-[200px] text-sm text-slate-900">{item.caption}</td>
                                            <td className="p-4 align-top border-r border-slate-100 whitespace-nowrap">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                    item.progres === 'Done' ? 'bg-green-100 text-green-700' :
                                                    item.progres === 'In Progress' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-slate-100 text-slate-700'
                                                }`}>
                                                    {item.progres}
                                                </span>
                                            </td>
                                            <td className="p-4 align-top">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button onClick={() => openEditModal(item)} className="p-2 text-brand-600 hover:bg-brand-50 rounded transition">
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button onClick={() => handleDelete(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded transition">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Modal Form */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto pt-24 pb-12">
                        <div className="bg-white rounded-2xl w-full max-w-4xl shadow-xl flex flex-col my-auto max-h-full">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
                                <h2 className="text-xl font-bold text-slate-900">
                                    {isEditing ? 'Edit Konten' : 'Tambah Konten'}
                                </h2>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2 hover:bg-slate-100 rounded-lg"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto space-y-5 flex-1">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Hari</label>
                                        <input
                                            type="text" name="hari" value={formData.hari} onChange={handleInputChange} placeholder="Misal: Senin"
                                            className="w-full border border-slate-300 rounded-xl px-4 py-2.5 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Format</label>
                                        <input
                                            type="text" name="format" value={formData.format} onChange={handleInputChange} placeholder="Misal: Reels, Carousel"
                                            className="w-full border border-slate-300 rounded-xl px-4 py-2.5 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Konsep</label>
                                        <input
                                            type="text" name="konsep" value={formData.konsep} onChange={handleInputChange} placeholder="Misal: POV, Edukasi"
                                            className="w-full border border-slate-300 rounded-xl px-4 py-2.5 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Funnel Layer (Tahapan)</label>
                                        <input
                                            type="text" name="funnel_layer" value={formData.funnel_layer} onChange={handleInputChange} placeholder="Misal: Engagement, Authority"
                                            className="w-full border border-slate-300 rounded-xl px-4 py-2.5 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Deskripsi & Ide</label>
                                    <textarea
                                        name="deskripsi_ide" value={formData.deskripsi_ide} onChange={handleInputChange} rows="3"
                                        className="w-full border border-slate-300 rounded-xl px-4 py-2.5 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                                    ></textarea>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Storyboard</label>
                                    <textarea
                                        name="storyboard" value={formData.storyboard} onChange={handleInputChange} rows="5" placeholder="Durasi:...&#10;Sound:...&#10;Teks:...&#10;Visual:...&#10;Kamera:..."
                                        className="w-full border border-slate-300 rounded-xl px-4 py-2.5 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                                    ></textarea>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Caption</label>
                                    <textarea
                                        name="caption" value={formData.caption} onChange={handleInputChange} rows="4"
                                        className="w-full border border-slate-300 rounded-xl px-4 py-2.5 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                                    ></textarea>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Progres</label>
                                    <select
                                        name="progres" value={formData.progres} onChange={handleInputChange}
                                        className="w-full border border-slate-300 rounded-xl px-4 py-2.5 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 mb-4"
                                    >
                                        <option value="To Do">To Do</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Review">Review</option>
                                        <option value="Done">Done</option>
                                    </select>
                                </div>
                            </div>

                            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 shrink-0">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-5 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-100 transition"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="px-5 py-2 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 transition"
                                >
                                    Simpan
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    )
}
