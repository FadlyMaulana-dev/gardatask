import React, { useState, useEffect, useRef, useCallback } from 'react'
import AppLayout from '../layouts/AppLayout'
import { useAuth } from '../context/AuthContext'
import { Send, MessageCircle } from 'lucide-react'
import { API_URL } from '../lib/api'


function formatTime(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

function formatDate(dateStr) {
  const d = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  if (d.toDateString() === today.toDateString()) return 'Hari Ini'
  if (d.toDateString() === yesterday.toDateString()) return 'Kemarin'
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

// Color palette assigned per user (stable, deterministic)
const COLORS = [
  'from-violet-500 to-purple-600',
  'from-blue-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
  'from-cyan-500 to-sky-600',
]
function userColor(userId) {
  return COLORS[(userId - 1) % COLORS.length]
}

export default function ChatPage() {
  const { token, user } = useAuth()
  const [messages, setMessages] = useState([])
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [online, setOnline] = useState(true)
  const bottomRef = useRef(null)
  const lastIdRef = useRef(0)
  const inputRef = useRef(null)

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Accept: 'application/json' }

  // ── Initial load ───────────────────────────────────────────
  const loadInitial = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/messages`, { headers })
      const json = await res.json()
      const msgs = json.data || []
      setMessages(msgs)
      if (msgs.length > 0) lastIdRef.current = msgs[msgs.length - 1].id
      setOnline(true)
    } catch {
      setOnline(false)
    }
  }, [token])

  // ── Incremental poll (only new messages) ───────────────────
  const poll = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/messages/since/${lastIdRef.current}`, { headers })
      const json = await res.json()
      const newMsgs = json.data || []
      if (newMsgs.length > 0) {
        setMessages(prev => [...prev, ...newMsgs])
        lastIdRef.current = newMsgs[newMsgs.length - 1].id
      }
      setOnline(true)
    } catch {
      setOnline(false)
    }
  }, [token])

  useEffect(() => {
    loadInitial()
    const interval = setInterval(poll, 4000)
    return () => clearInterval(interval)
  }, [loadInitial, poll])

  // ── Auto scroll to bottom when messages change ─────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Send message ───────────────────────────────────────────
  const send = async (e) => {
    e.preventDefault()
    const trimmed = body.trim()
    if (!trimmed || sending) return
    setSending(true)
    try {
      const res = await fetch(`${API_URL}/messages`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ body: trimmed }),
      })
      const json = await res.json()
      if (json.success) {
        setMessages(prev => [...prev, json.data])
        lastIdRef.current = json.data.id
        setBody('')
        inputRef.current?.focus()
      }
    } catch {
      setOnline(false)
    } finally {
      setSending(false)
    }
  }

  // ── Group messages by date for dividers ────────────────────
  const grouped = []
  let lastDate = null
  messages.forEach(msg => {
    const d = formatDate(msg.created_at)
    if (d !== lastDate) {
      grouped.push({ type: 'divider', label: d, key: `div-${msg.id}` })
      lastDate = d
    }
    grouped.push({ type: 'msg', msg, key: `msg-${msg.id}` })
  })

  const isMe = (msg) => msg.user_id === user?.id

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50/50">
        {/* ── Header ─────────────────────────────────────── */}
        <div className="shrink-0 px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-700 rounded-xl flex items-center justify-center shadow-md">
              <MessageCircle size={20} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 text-lg leading-none">Obrolan Tim</h1>
              <p className="text-xs text-slate-500 mt-0.5">Ruang obrolan untuk semua anggota Garda</p>
            </div>
          </div>
          
          {/* Online indicator */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${
            online
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-red-50 text-red-600 border-red-200'
          }`}>
            <span className={`w-2 h-2 rounded-full ${online ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
            {online ? 'Terhubung' : 'Terputus'}
          </div>
        </div>

        {/* ── Messages ─────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-1 custom-scrollbar">
          {grouped.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <div className="w-20 h-20 bg-violet-50 rounded-full flex items-center justify-center mb-4">
                <MessageCircle size={36} className="text-violet-300" />
              </div>
              <p className="font-semibold text-slate-600">Belum ada pesan</p>
              <p className="text-sm mt-1">Jadilah yang pertama menyapa tim! 👋</p>
            </div>
          )}

          {grouped.map(item => {
            if (item.type === 'divider') {
              return (
                <div key={item.key} className="flex items-center gap-3 py-3">
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                    {item.label}
                  </span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>
              )
            }

            const { msg } = item
            const me = isMe(msg)
            const color = userColor(msg.user_id)
            const initial = msg.user?.name?.charAt(0)?.toUpperCase() || '?'

            return (
              <div key={item.key} className={`flex items-end gap-2.5 mb-3 ${me ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                {!me && (
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm`}>
                    {initial}
                  </div>
                )}

                {/* Bubble */}
                <div className={`max-w-[65%] ${me ? 'items-end' : 'items-start'} flex flex-col`}>
                  {!me && (
                    <p className="text-[11px] font-bold text-slate-500 mb-1 ml-1">{msg.user?.name}</p>
                  )}
                  <div className={`px-4 py-2.5 rounded-2xl shadow-sm text-sm leading-relaxed ${
                    me
                      ? 'bg-gradient-to-br from-violet-500 to-purple-700 text-white rounded-br-sm'
                      : 'bg-white text-slate-800 border border-slate-100 rounded-bl-sm'
                  }`}>
                    {msg.body}
                  </div>
                  <p className={`text-[10px] text-slate-400 mt-1 px-1 ${me ? 'text-right' : 'text-left'}`}>
                    {formatTime(msg.created_at)}
                  </p>
                </div>
              </div>
            )
          })}

          {/* Scroll anchor */}
          <div ref={bottomRef} />
        </div>

        {/* ── Input bar ──────────────────────────────────── */}
        <div className="shrink-0 px-6 py-4 bg-white border-t border-slate-200">
          <form onSubmit={send} className="flex items-center gap-3">
            {/* My avatar */}
            <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${userColor(user?.id || 1)} flex items-center justify-center text-xs font-bold text-white shrink-0 shadow`}>
              {user?.name?.charAt(0)?.toUpperCase() || '?'}
            </div>

            <div className="flex-1 flex items-center bg-slate-100 rounded-2xl border border-slate-200 focus-within:border-violet-400 focus-within:ring-4 focus-within:ring-violet-400/10 transition-all">
              <input
                ref={inputRef}
                type="text"
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder="Tulis pesan ke semua anggota tim…"
                className="flex-1 bg-transparent px-4 py-3 text-sm placeholder-slate-400 text-slate-800 focus:outline-none"
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) send(e)
                }}
              />
            </div>

            <button
              type="submit"
              disabled={!body.trim() || sending}
              className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 text-white flex items-center justify-center shadow-md hover:shadow-violet-200 hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100 shrink-0"
            >
              <Send size={18} className="-translate-x-px" />
            </button>
          </form>
        </div>
      </div>
    </AppLayout>
  )
}
