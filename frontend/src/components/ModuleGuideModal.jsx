import React, { useEffect, useState } from 'react'
import { X, BookOpen, Activity, CheckCircle, Info } from 'lucide-react'

export default function ModuleGuideModal({ 
  isOpen, 
  onClose, 
  title, 
  description, 
  workflows = [], 
  kpis = [] 
}) {
  const [isRendered, setIsRendered] = useState(isOpen)

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true)
      // Prevent body scrolling when open
      document.body.style.overflow = 'hidden'
    } else {
      setTimeout(() => setIsRendered(false), 300) // Match transition duration
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isRendered) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      {/* Slide-over Panel */}
      <div 
        className={`relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-100 text-brand-600 rounded-lg">
              <BookOpen size={20} />
            </div>
            <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Description Box */}
          {description && (
            <div className="flex gap-4 p-4 bg-blue-50 border border-blue-100 rounded-xl text-blue-900">
              <Info className="shrink-0 text-blue-500 mt-0.5" size={20} />
              <p className="text-sm leading-relaxed">{description}</p>
            </div>
          )}

          {/* Workflow Sequence */}
          {workflows.length > 0 && (
            <div>
              <h3 className="flex items-center gap-2 text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                <CheckCircle size={18} className="text-brand-500" />
                Alur & Proses (Workflow)
              </h3>
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                {workflows.map((step, index) => (
                  <div key={index} className="relative flex items-start gap-4">
                    <div className="shrink-0 w-10 h-10 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center font-bold text-slate-500 z-10 shadow-sm">
                      {index + 1}
                    </div>
                    <div className="pt-2 flex-1 pb-4">
                      <h4 className="font-semibold text-slate-800 text-sm">{step.title}</h4>
                      {step.desc && <p className="text-sm text-slate-600 mt-1">{step.desc}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* KPIs / Metrics */}
          {kpis.length > 0 && (
            <div>
              <h3 className="flex items-center gap-2 text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                <Activity size={18} className="text-amber-500" />
                Indikator Penilaian (KPI)
              </h3>
              <div className="grid gap-3">
                {kpis.map((kpi, index) => (
                  <div key={index} className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-slate-800 text-sm">{kpi.metric}</span>
                      <span className="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded-md">
                        {kpi.weight}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">{kpi.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
          >
            Mengerti
          </button>
        </div>
      </div>
    </div>
  )
}
