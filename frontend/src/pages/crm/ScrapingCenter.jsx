import React, { useState, useEffect } from 'react'
import { useCrm } from '../../context/CrmContext'
import {
  UploadCloud, CheckCircle2, AlertTriangle, Loader2,
  Info, Code, History, Package,
} from 'lucide-react'

const SAMPLE_JSON = `[
  {
    "title": "Handaru Outdoor",
    "categoryName": "Penyewaan Alat Outdoor",
    "phoneUnformatted": "+6282116413990",
    "city": "Bandung",
    "address": "Jl. Sukajadi No.12",
    "totalScore": 5,
    "placeId": "ChIJU_sample123"
  }
]`

function HistoryRow({ run }) {
  const date = new Date(run.created_at).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
  return (
    <div className="flex items-center gap-4 py-3 border-t border-gray-50 first:border-0">
      <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
        <Package className="w-4 h-4 text-blue-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{run.keyword || '—'}</p>
        <p className="text-xs text-gray-400">{date}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-bold text-emerald-600">{run.total_saved ?? '?'} saved</p>
        <p className="text-xs text-gray-400">{run.total_skipped ?? 0} skipped</p>
      </div>
    </div>
  )
}

export default function ScrapingCenter() {
  const { importLeads, scrapingHistory, historyLoading, fetchScrapingHistory, fetchLeads } = useCrm()
  const [keyword, setKeyword] = useState('')
  const [jsonText, setJsonText] = useState('')
  const [status, setStatus] = useState(null) // { type: 'success'|'error', msg, saved, skipped }
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchScrapingHistory()
  }, [fetchScrapingHistory])

  const handleImport = async (e) => {
    e.preventDefault()
    setStatus(null)
    setLoading(true)

    let parsed
    try {
      parsed = JSON.parse(jsonText)
      if (!Array.isArray(parsed)) parsed = [parsed]
    } catch (err) {
      setStatus({ type: 'error', msg: 'JSON tidak valid — periksa format dan coba lagi.' })
      setLoading(false)
      return
    }

    try {
      const res = await importLeads({ keyword, data: parsed })
      if (res.success !== false) {
        setStatus({
          type: 'success',
          msg: 'Import berhasil!',
          saved: res.saved ?? res.data?.saved ?? parsed.length,
          skipped: res.skipped ?? res.data?.skipped ?? 0,
        })
        setJsonText('')
        setKeyword('')
        // Refresh history setelah import
        fetchScrapingHistory()
        fetchLeads() // auto-refresh leads pipeline
      } else {
        setStatus({ type: 'error', msg: res.message || 'Import gagal. Cek server log.' })
      }
    } catch (err) {
      setStatus({ type: 'error', msg: 'Network error — pastikan backend berjalan.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 space-y-6 min-h-screen bg-gray-50/50">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Scraping Center</h2>
        <p className="text-sm text-gray-500 mt-1">Import leads dari dataset Apify (Google Maps atau sumber lain) ke dalam pipeline.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <UploadCloud className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">Import Dataset</h3>
                <p className="text-xs text-gray-400">Paste JSON output dari Apify actor</p>
              </div>
            </div>

            <form onSubmit={handleImport} className="p-6 space-y-5">
              {/* Keyword */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Nama Campaign / Keyword <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="cth: rental alat outdoor bandung"
                  value={keyword}
                  onChange={e => setKeyword(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
                <p className="text-xs text-gray-400 mt-1">Digunakan sebagai label scraping run untuk tracking</p>
              </div>

              {/* JSON Payload */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-semibold text-gray-700">
                    Apify JSON Payload <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setJsonText(SAMPLE_JSON)}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                  >
                    <Code className="w-3 h-3" /> Load contoh
                  </button>
                </div>
                <textarea
                  required
                  rows={14}
                  placeholder={SAMPLE_JSON}
                  value={jsonText}
                  onChange={e => setJsonText(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-xs font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none leading-relaxed"
                />
              </div>

              {/* Status Banner */}
              {status && (
                <div className={`flex items-start gap-3 px-4 py-3.5 rounded-xl border ${
                  status.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                  {status.type === 'success'
                    ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    : <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  }
                  <div>
                    <p className="font-semibold text-sm">{status.msg}</p>
                    {status.type === 'success' && (
                      <p className="text-xs mt-0.5">
                        <span className="font-bold text-emerald-700">{status.saved}</span> leads tersimpan ·&nbsp;
                        <span className="font-bold text-gray-500">{status.skipped}</span> duplikat dilewati
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Memproses…</>
                  : <><UploadCloud className="w-4 h-4" /> Import Leads</>
                }
              </button>
            </form>
          </div>

          {/* ── History Panel ──────────────────────────────── */}
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
              <History className="w-4 h-4 text-gray-400" />
              <h3 className="font-semibold text-gray-900 text-sm">Riwayat Import</h3>
            </div>
            <div className="px-6 pb-4">
              {historyLoading ? (
                <div className="py-10 flex justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
                </div>
              ) : scrapingHistory.length === 0 ? (
                <div className="py-10 text-center">
                  <History className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Belum ada riwayat import</p>
                </div>
              ) : (
                scrapingHistory.slice(0, 10).map(run => <HistoryRow key={run.id} run={run} />)
              )}
            </div>
          </div>
        </div>

        {/* Right guide panel */}
        <div className="space-y-5">
          {/* How it works */}
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Info className="w-4 h-4 text-blue-500" />
              <h3 className="font-semibold text-gray-900 text-sm">Cara Kerja</h3>
            </div>
            <ol className="space-y-3">
              {[
                'Jalankan Apify Google Maps Extractor actor',
                'Download output JSON dari dataset',
                'Paste ke kolom payload di bawah',
                "Klik 'Import Leads' — leads langsung masuk pipeline",
                'Duplikat otomatis diabaikan',
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                  <p className="text-sm text-gray-600">{step}</p>
                </li>
              ))}
            </ol>
          </div>

          {/* JSON field mapping */}
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Code className="w-4 h-4 text-gray-400" />
              <h3 className="font-semibold text-gray-900 text-sm">Field Mapping JSON</h3>
            </div>
            <div className="space-y-2">
              {[
                ['title', 'company_name'],
                ['categoryName', 'category'],
                ['phoneUnformatted', 'whatsapp'],
                ['city', 'city'],
                ['address', 'address'],
                ['totalScore', 'rating'],
                ['placeId', 'source_id (dedup)'],
              ].map(([src, dest]) => (
                <div key={src} className="flex items-center gap-2 text-xs">
                  <code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-700 font-mono">{src}</code>
                  <span className="text-gray-400">→</span>
                  <code className="bg-blue-50 px-1.5 py-0.5 rounded text-blue-700 font-mono">{dest}</code>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-3">
              Field kosong disimpan sebagai <code className="bg-gray-100 px-1 rounded">null</code> — hanya <code className="bg-gray-100 px-1 rounded">title</code> yang wajib.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
