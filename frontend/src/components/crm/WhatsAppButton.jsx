import React, { useState } from 'react'
import { useCrm } from '../../context/CrmContext'
import { MessageCircle, Loader2 } from 'lucide-react'

export default function WhatsAppButton({ lead, className = '' }) {
  const { logActivity, updateLeadStatus } = useCrm()
  const [loading, setLoading] = useState(false)

  const handleWhatsappClick = async () => {
    if (!lead || !lead.whatsapp) {
      alert('Nomor WhatsApp tidak tersedia untuk lead ini.')
      return
    }

    setLoading(true)
    try {
      // Log aktivitas untuk mendapat poin KPI
      await logActivity(lead.id, 'WhatsApp Click', 'Klik tombol WhatsApp dari UI')

      // Auto-update status jika masih New
      if (lead.status === 'New') {
        await updateLeadStatus(lead.id, 'Contacted')
      }

      // Template pesan default
      const template = `Halo Bapak/Ibu dari ${lead.company_name}, perkenalkan saya dari GardaTask...`
      const waUrl = `https://wa.me/${lead.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(template)}`

      window.open(waUrl, '_blank')
    } catch (err) {
      console.error('Gagal menangani klik WhatsApp', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleWhatsappClick}
      disabled={loading}
      className={`inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1EBE5D] disabled:opacity-60 text-white font-semibold text-sm rounded-xl px-4 py-2 transition-colors shadow-sm ${className}`}
    >
      {loading
        ? <Loader2 className="w-4 h-4 animate-spin" />
        : <MessageCircle className="w-4 h-4" />
      }
      {loading ? 'Memproses...' : 'Chat WhatsApp'}
    </button>
  )
}
