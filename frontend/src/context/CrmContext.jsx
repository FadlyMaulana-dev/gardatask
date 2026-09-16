import React, { createContext, useContext, useState, useCallback, useRef } from 'react'
import { useAuth } from './AuthContext'
import { API_URL } from '../lib/api'

const CrmContext = createContext()


export function CrmProvider({ children }) {
  const { token, logout } = useAuth()

  const [leads, setLeads] = useState([])
  const [leadsLoading, setLeadsLoading] = useState(false)

  const [currentLead, setCurrentLead] = useState(null)
  const [currentLeadLoading, setCurrentLeadLoading] = useState(false)

  const [leadActivities, setLeadActivities] = useState([])
  const [activitiesLoading, setActivitiesLoading] = useState(false)

  const [marketingDashboard, setMarketingDashboard] = useState(null)
  const [marketingLoading, setMarketingLoading] = useState(false)

  const [dirutDashboard, setDirutDashboard] = useState(null)
  const [dirutLoading, setDirutLoading] = useState(false)

  const [scrapingHistory, setScrapingHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)

  // Cache TTL 60 detik supaya tab-switching tidak re-hit API
  const CACHE_TTL = 60_000
  const marketingCache = useRef({ data: null, ts: 0 })
  const dirutCache = useRef({ data: null, ts: 0 })

  const headers = useCallback(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }), [token])

  // ── LEADS LIST ────────────────────────────────────────────
  const fetchLeads = useCallback(async (filters = {}) => {
    if (!token) return
    setLeadsLoading(true)
    try {
      const params = new URLSearchParams(filters)
      const res = await fetch(`${API_URL}/crm/leads?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.status === 401) { logout(); return }
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setLeads(json.data?.data || json.data || [])
    } catch (err) {
      console.error('fetchLeads:', err)
    } finally {
      setLeadsLoading(false)
    }
  }, [token, logout])

  // ── LEAD DETAIL ───────────────────────────────────────────
  const fetchLeadById = useCallback(async (id) => {
    if (!token) return
    setCurrentLeadLoading(true)
    try {
      const res = await fetch(`${API_URL}/crm/leads/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.status === 401) { logout(); return }
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setCurrentLead(json.data)
      // Juga sinkronkan ke daftar leads jika sudah ada
      setLeads(prev => {
        const exists = prev.find(l => l.id === json.data.id)
        return exists
          ? prev.map(l => l.id === json.data.id ? { ...l, ...json.data } : l)
          : prev
      })
    } catch (err) {
      console.error('fetchLeadById:', err)
    } finally {
      setCurrentLeadLoading(false)
    }
  }, [token, logout])

  // ── LEAD ACTIVITIES ───────────────────────────────────────
  const fetchLeadActivities = useCallback(async (leadId) => {
    if (!token) return
    setActivitiesLoading(true)
    try {
      const res = await fetch(`${API_URL}/crm/leads/${leadId}/activities`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setLeadActivities(json.data?.data || json.data || [])
    } catch (err) {
      console.error('fetchLeadActivities:', err)
    } finally {
      setActivitiesLoading(false)
    }
  }, [token])

  // ── UPDATE STATUS ─────────────────────────────────────────
  const updateLeadStatus = useCallback(async (leadId, status) => {
    if (!token) return false
    try {
      const res = await fetch(`${API_URL}/crm/leads/${leadId}/status`, {
        method: 'PATCH',
        headers: headers(),
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      const updated = json.data
      // Update di leads list
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, ...updated } : l))
      // Update di currentLead jika sesuai
      setCurrentLead(prev => prev?.id === leadId ? { ...prev, ...updated } : prev)
      return true
    } catch (err) {
      console.error('updateLeadStatus:', err)
      return false
    }
  }, [token, headers])

  // ── LOG ACTIVITY ──────────────────────────────────────────
  const logActivity = useCallback(async (leadId, activity_type, notes = '') => {
    if (!token) return false
    try {
      const res = await fetch(`${API_URL}/crm/leads/${leadId}/activity`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ activity_type, notes }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      // Tambahkan aktivitas baru ke state lokal (tanpa re-fetch)
      setLeadActivities(prev => [json.data, ...prev])
      return json.data
    } catch (err) {
      console.error('logActivity:', err)
      return false
    }
  }, [token, headers])

  // ── IMPORT LEADS ──────────────────────────────────────────
  const importLeads = useCallback(async (payload) => {
    if (!token) return { success: false }
    try {
      const res = await fetch(`${API_URL}/crm/scrape/import`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return json
    } catch (err) {
      console.error('importLeads:', err)
      return { success: false }
    }
  }, [token, headers])

  // ── SCRAPING HISTORY ──────────────────────────────────────
  const fetchScrapingHistory = useCallback(async () => {
    if (!token) return
    setHistoryLoading(true)
    try {
      const res = await fetch(`${API_URL}/crm/scrape/history`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setScrapingHistory(json.data || [])
    } catch (err) {
      console.error('fetchScrapingHistory:', err)
    } finally {
      setHistoryLoading(false)
    }
  }, [token])

  // ── MARKETING DASHBOARD ───────────────────────────────────
  const fetchMarketingDashboard = useCallback(async (force = false) => {
    if (!token) return
    const now = Date.now()
    if (!force && marketingCache.current.data && (now - marketingCache.current.ts) < CACHE_TTL) {
      if (!marketingDashboard) setMarketingDashboard(marketingCache.current.data)
      return
    }
    setMarketingLoading(true)
    try {
      const res = await fetch(`${API_URL}/crm/dashboard/marketing`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      marketingCache.current = { data: json.data, ts: Date.now() }
      setMarketingDashboard(json.data)
    } catch (err) {
      console.error('fetchMarketingDashboard:', err)
    } finally {
      setMarketingLoading(false)
    }
  }, [token, marketingDashboard])

  // ── DIRUT DASHBOARD ───────────────────────────────────────
  const fetchDirutDashboard = useCallback(async (force = false) => {
    if (!token) return
    const now = Date.now()
    if (!force && dirutCache.current.data && (now - dirutCache.current.ts) < CACHE_TTL) {
      if (!dirutDashboard) setDirutDashboard(dirutCache.current.data)
      return
    }
    setDirutLoading(true)
    try {
      const res = await fetch(`${API_URL}/crm/dashboard/dirut`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      dirutCache.current = { data: json.data, ts: Date.now() }
      setDirutDashboard(json.data)
    } catch (err) {
      console.error('fetchDirutDashboard:', err)
    } finally {
      setDirutLoading(false)
    }
  }, [token, dirutDashboard])

  return (
    <CrmContext.Provider value={{
      // Leads list
      leads, leadsLoading,
      // Lead detail
      currentLead, currentLeadLoading,
      // Activities
      leadActivities, activitiesLoading,
      // Dashboards
      marketingDashboard, marketingLoading,
      dirutDashboard, dirutLoading,
      // Scraping history
      scrapingHistory, historyLoading,
      // Alias lama agar komponen lain tidak break
      isLoading: leadsLoading,
      // Actions
      fetchLeads,
      fetchLeadById,
      fetchLeadActivities,
      updateLeadStatus,
      logActivity,
      importLeads,
      fetchScrapingHistory,
      fetchMarketingDashboard,
      fetchDirutDashboard,
    }}>
      {children}
    </CrmContext.Provider>
  )
}

export function useCrm() {
  const ctx = useContext(CrmContext)
  if (!ctx) throw new Error('useCrm must be used within CrmProvider')
  return ctx
}
