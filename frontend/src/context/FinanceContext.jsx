import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback
} from 'react'
import { useAuth } from './AuthContext'
import { API_URL } from '../lib/api'

const FinanceContext = createContext()

export function FinanceProvider({ children }) {
  const { token, logout } = useAuth()

  // State
  const [invoices, setInvoices] = useState([])
  const [payments, setPayments] = useState([])
  const [cashTransactions, setCashTransactions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [cashFlowSummary, setCashFlowSummary] = useState(null)

  // =============================
  // FETCH INVOICES
  // =============================
  const fetchInvoices = useCallback(async (filters = {}) => {
    if (!token) return

    try {
      const params = new URLSearchParams(filters)
      const res = await fetch(`${API_URL}/invoices?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (res.status === 401) {
        logout()
        return
      }

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const json = await res.json()
      const items = json.data?.data || json.data || []

      setInvoices(Array.isArray(items) ? items : [])
    } catch (err) {
      console.error('Failed to fetch invoices:', err)
    }
  }, [token, logout])

  // =============================
  // FETCH INVOICE DETAILS
  // =============================
  const fetchInvoiceDetail = useCallback(async (invoiceId) => {
    if (!token) return null

    try {
      const res = await fetch(`${API_URL}/invoices/${invoiceId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const json = await res.json()
      return json.data
    } catch (err) {
      console.error('Failed to fetch invoice detail:', err)
      return null
    }
  }, [token])

  // =============================
  // CREATE INVOICE
  // =============================
  const createInvoice = useCallback(async (invoiceData) => {
    if (!token) return { success: false, message: 'Not authenticated' }

    try {
      const res = await fetch(`${API_URL}/invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(invoiceData)
      })

      const json = await res.json().catch(() => ({}))

      if (!res.ok) {
        console.error('Failed to create invoice:', res.status, json)
        return { success: false, message: json.message || json.error || `HTTP ${res.status}`, errors: json.errors || null }
      }

      await fetchInvoices()
      return { success: true, data: json.data }
    } catch (err) {
      console.error('Failed to create invoice:', err)
      return { success: false, message: err.message || 'Unknown error' }
    }
  }, [token, fetchInvoices])

  // =============================
  // UPDATE INVOICE
  // =============================
  const updateInvoice = useCallback(async (invoiceId, updates) => {
    if (!token) return false

    try {
      const res = await fetch(`${API_URL}/invoices/${invoiceId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      await fetchInvoices()
      return true
    } catch (err) {
      console.error('Failed to update invoice:', err)
      return false
    }
  }, [token, fetchInvoices])

  // =============================
  // DELETE INVOICE
  // =============================
  const deleteInvoice = useCallback(async (invoiceId) => {
    if (!token) return false

    try {
      const res = await fetch(`${API_URL}/invoices/${invoiceId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      await fetchInvoices()
      return true
    } catch (err) {
      console.error('Failed to delete invoice:', err)
      return false
    }
  }, [token, fetchInvoices])

  // =============================
  // DOWNLOAD INVOICE EXPORT
  // =============================
  const downloadInvoice = useCallback(async (invoiceId, format = 'pdf') => {
    if (!token) return false

    try {
      const res = await fetch(`${API_URL}/invoices/${invoiceId}/${format}/download`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const blob = await res.blob()
      let filename = `Invoice-${invoiceId}.${format === 'excel' ? 'xls' : format === 'word' ? 'doc' : 'pdf'}`
      
      const disposition = res.headers.get('content-disposition')
      if (disposition && disposition.indexOf('attachment') !== -1) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
        const matches = filenameRegex.exec(disposition)
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, '')
        }
      }

      const windowUrl = window.URL || window.webkitURL
      const url = windowUrl.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      windowUrl.revokeObjectURL(url)
      document.body.removeChild(a)

      return true
    } catch (err) {
      console.error('Failed to download invoice:', err)
      alert('Gagal mendownload invoice')
      return false
    }
  }, [token])

  // =============================
  // RECORD PAYMENT
  // =============================
  const recordPayment = useCallback(async (invoiceId, paymentData) => {
    if (!token) return false

    try {
      const formData = new FormData()
      formData.append('amount', paymentData.amount)
      formData.append('payment_method', paymentData.payment_method)
      formData.append('payment_date', paymentData.payment_date)
      formData.append('notes', paymentData.notes || '')

      if (paymentData.proof_file) {
        formData.append('proof_file', paymentData.proof_file)
      }

      const res = await fetch(`${API_URL}/invoices/${invoiceId}/payments`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      await fetchInvoices()
      return true
    } catch (err) {
      console.error('Failed to record payment:', err)
      return false
    }
  }, [token, fetchInvoices])

  // =============================
  // FETCH CASH FLOW
  // =============================
  const fetchCashFlow = useCallback(async (filters = {}) => {
    if (!token) return

    try {
      const params = new URLSearchParams(filters)
      const res = await fetch(`${API_URL}/cashflow?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const json = await res.json()
      const items = json.data?.data || json.data || []

      setCashTransactions(Array.isArray(items) ? items : [])
    } catch (err) {
      console.error('Failed to fetch cash flow:', err)
    }
  }, [token])

  // =============================
  // FETCH CASH FLOW SUMMARY
  // =============================
  const fetchCashFlowSummary = useCallback(async (filters = {}) => {
    if (!token) return

    try {
      const params = new URLSearchParams(filters)
      const res = await fetch(`${API_URL}/cashflow/summary?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const json = await res.json()
      setCashFlowSummary(json.data)
    } catch (err) {
      console.error('Failed to fetch cash flow summary:', err)
    }
  }, [token])

  // =============================
  // EXPORT CASH FLOW CSV
  // =============================
  const exportCashFlowCSV = useCallback(async (filters = {}) => {
    if (!token) return false

    try {
      const params = new URLSearchParams(filters)
      const res = await fetch(`${API_URL}/cashflow/export?${params}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const blob = await res.blob()
      let filename = `cashflow-${new Date().toISOString().split('T')[0]}.csv`
      
      const disposition = res.headers.get('content-disposition')
      if (disposition && disposition.indexOf('attachment') !== -1) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
        const matches = filenameRegex.exec(disposition)
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, '')
        }
      }

      const windowUrl = window.URL || window.webkitURL
      const url = windowUrl.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      windowUrl.revokeObjectURL(url)
      document.body.removeChild(a)

      return true
    } catch (err) {
      console.error('Failed to export CSV:', err)
      alert('Gagal mendownload CSV')
      return false
    }
  }, [token])

  // =============================
  // ADD MANUAL CASH TRANSACTION (income/expense)
  // =============================
  const addTransaction = useCallback(async (txData) => {
    if (!token) return false

    try {
      const res = await fetch(`${API_URL}/cashflow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(txData)
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      await fetchCashFlow()
      await fetchCashFlowSummary()
      return true
    } catch (err) {
      console.error('Failed to add transaction:', err)
      return false
    }
  }, [token, fetchCashFlow, fetchCashFlowSummary])

  const addExpense = useCallback(async (expenseData) => {
    return addTransaction({ ...expenseData, type: 'expense' })
  }, [addTransaction])

  const addIncome = useCallback(async (incomeData) => {
    return addTransaction({ ...incomeData, type: 'income' })
  }, [addTransaction])

  // =============================
  // UPDATE / DELETE CASH TRANSACTION
  // =============================
  const updateTransaction = useCallback(async (transactionId, txData) => {
    if (!token) return false

    try {
      const res = await fetch(`${API_URL}/cashflow/${transactionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(txData)
      })

      const json = await res.json().catch(() => ({}))

      if (!res.ok) {
        console.error('Failed to update transaction:', res.status, json)
        return false
      }

      await fetchCashFlow()
      await fetchCashFlowSummary()
      return true
    } catch (err) {
      console.error('Failed to update transaction:', err)
      return false
    }
  }, [token, fetchCashFlow, fetchCashFlowSummary])

  const deleteTransaction = useCallback(async (transactionId) => {
    if (!token) return false

    try {
      const res = await fetch(`${API_URL}/cashflow/${transactionId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const json = await res.json().catch(() => ({}))

      if (!res.ok) {
        console.error('Failed to delete transaction:', res.status, json)
        return false
      }

      await fetchCashFlow()
      await fetchCashFlowSummary()
      return true
    } catch (err) {
      console.error('Failed to delete transaction:', err)
      return false
    }
  }, [token, fetchCashFlow, fetchCashFlowSummary])

  // =============================
  // FETCH INVOICE STATS
  // =============================
  const fetchInvoiceStats = useCallback(async (filters = {}) => {
    if (!token) return

    try {
      const params = new URLSearchParams(filters)
      const res = await fetch(`${API_URL}/invoices/statistics?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const json = await res.json()
      setStats(json.data)
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    }
  }, [token])

  // =============================
  // INITIAL LOAD
  // =============================
  useEffect(() => {
    if (!token) return

    setIsLoading(true)
    Promise.all([
      fetchInvoices(),
      fetchCashFlow(),
      fetchCashFlowSummary(),
      fetchInvoiceStats()
    ]).finally(() => setIsLoading(false))
  }, [token, fetchInvoices, fetchCashFlow, fetchCashFlowSummary, fetchInvoiceStats])

  return (
    <FinanceContext.Provider
      value={{
        // Invoices
        invoices,
        fetchInvoices,
        fetchInvoiceDetail,
        createInvoice,
        updateInvoice,
        deleteInvoice,
        downloadInvoice,

        // Payments
        recordPayment,

        // Cash Flow
        cashTransactions,
        cashFlowSummary,
        fetchCashFlow,
        fetchCashFlowSummary,
        exportCashFlowCSV,
        addExpense,
        addIncome,
        addTransaction,
        updateTransaction,
        deleteTransaction,

        // Stats
        stats,
        fetchInvoiceStats,
        isLoading
      }}
    >
      {children}
    </FinanceContext.Provider>
  )
}

export function useFinance() {
  const ctx = useContext(FinanceContext)

  if (!ctx) {
    throw new Error('useFinance must be used within FinanceProvider')
  }

  return ctx
}
