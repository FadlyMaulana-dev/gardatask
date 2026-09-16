/**
 * PDF Invoice Generator Utility
 * Uses html2pdf library for generating invoice PDFs
 * 
 * Installation: npm install html2pdf.js
 */

export const generateInvoicePDF = (invoice) => {
  if (typeof window === 'undefined') return
  
  // Dynamically import html2pdf
  const script = document.createElement('script')
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
  script.async = true
  script.onload = () => {
    const element = createInvoiceHTML(invoice)
    const opt = {
      margin: 10,
      filename: `${invoice.invoice_number}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
    }
    html2pdf().set(opt).from(element).save()
  }
  document.head.appendChild(script)
}

/**
 * Create HTML template for invoice
 */
const createInvoiceHTML = (invoice) => {
  const container = document.createElement('div')
  container.style.cssText = 'padding: 20px; font-family: Arial, sans-serif; color: #333;'
  
  const paymentPercentage = (invoice.paid_amount / invoice.total_amount) * 100
  
  const html = `
    <div style="max-width: 800px; margin: 0 auto;">
      <!-- Header -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #1f2937;">
        <div>
          <h1 style="margin: 0; color: #1f2937; font-size: 28px;">GardaTask</h1>
          <p style="margin: 5px 0; color: #6b7280; font-size: 12px;">Productivity Management System</p>
        </div>
        <div style="text-align: right;">
          <h2 style="margin: 0; color: #d97706; font-size: 24px;">INVOICE</h2>
          <p style="margin: 5px 0; color: #6b7280; font-size: 12px;">${invoice.invoice_number}</p>
        </div>
      </div>

      <!-- Invoice Details -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px;">
        <div>
          <h3 style="margin: 0 0 10px 0; color: #374151; font-size: 12px; font-weight: bold;">DARI:</h3>
          <p style="margin: 0; color: #1f2937; font-weight: bold;">GardaTask</p>
          <p style="margin: 2px 0; color: #6b7280; font-size: 12px;">Jl. Contoh No. 123</p>
          <p style="margin: 2px 0; color: #6b7280; font-size: 12px;">Jakarta, Indonesia</p>
        </div>
        <div>
          <h3 style="margin: 0 0 10px 0; color: #374151; font-size: 12px; font-weight: bold;">KEPADA:</h3>
          <p style="margin: 0; color: #1f2937; font-weight: bold;">${invoice.client_name}</p>
          ${invoice.client_email ? `<p style="margin: 2px 0; color: #6b7280; font-size: 12px;">${invoice.client_email}</p>` : ''}
          ${invoice.client_phone ? `<p style="margin: 2px 0; color: #6b7280; font-size: 12px;">${invoice.client_phone}</p>` : ''}
        </div>
      </div>

      <!-- Invoice Info -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 40px; padding: 20px; background-color: #f3f4f6; border-radius: 8px;">
        <div>
          <p style="margin: 0; color: #6b7280; font-size: 11px;">NOMOR INVOICE</p>
          <p style="margin: 5px 0 0 0; color: #1f2937; font-weight: bold;">${invoice.invoice_number}</p>
        </div>
        <div>
          <p style="margin: 0; color: #6b7280; font-size: 11px;">TANGGAL INVOICE</p>
          <p style="margin: 5px 0 0 0; color: #1f2937; font-weight: bold;">${new Date(invoice.invoice_date).toLocaleDateString('id-ID')}</p>
        </div>
        <div>
          <p style="margin: 0; color: #6b7280; font-size: 11px;">JATUH TEMPO</p>
          <p style="margin: 5px 0 0 0; color: #1f2937; font-weight: bold;">${new Date(invoice.due_date).toLocaleDateString('id-ID')}</p>
        </div>
        <div>
          <p style="margin: 0; color: #6b7280; font-size: 11px;">STATUS</p>
          <p style="margin: 5px 0 0 0; color: #1f2937; font-weight: bold; text-transform: capitalize;">${invoice.status}</p>
        </div>
      </div>

      <!-- Project Details -->
      <div style="margin-bottom: 40px;">
        <h3 style="margin: 0 0 15px 0; color: #374151; font-size: 12px; font-weight: bold;">DESKRIPSI PEKERJAAN:</h3>
        <div style="padding: 15px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px;">
          <p style="margin: 0; color: #1f2937; font-size: 13px; line-height: 1.6;">
            <strong>Project:</strong> ${invoice.project?.name || 'N/A'}<br>
            ${invoice.description ? `<strong>Deskripsi:</strong> ${invoice.description}<br>` : ''}
            ${invoice.notes ? `<strong>Catatan:</strong> ${invoice.notes}` : ''}
          </p>
        </div>
      </div>

      <!-- Amount Summary -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px;">
        <tr style="background-color: #f3f4f6; border: 1px solid #e5e7eb;">
          <td style="padding: 12px; font-weight: bold; color: #374151;">Deskripsi</td>
          <td style="padding: 12px; font-weight: bold; color: #374151; text-align: right;">Jumlah</td>
        </tr>
        <tr style="border: 1px solid #e5e7eb;">
          <td style="padding: 12px; color: #1f2937;">Jasa Layanan</td>
          <td style="padding: 12px; text-align: right; color: #1f2937; font-weight: bold;">
            Rp ${invoice.total_amount.toLocaleString('id-ID')}
          </td>
        </tr>
        <tr style="background-color: #d97706; color: white;">
          <td style="padding: 12px; font-weight: bold;">TOTAL TAGIHAN</td>
          <td style="padding: 12px; text-align: right; font-weight: bold; font-size: 14px;">
            Rp ${invoice.total_amount.toLocaleString('id-ID')}
          </td>
        </tr>
      </table>

      <!-- Payment Progress -->
      <div style="margin-bottom: 40px;">
        <h3 style="margin: 0 0 15px 0; color: #374151; font-size: 12px; font-weight: bold;">STATUS PEMBAYARAN:</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <div>
            <p style="margin: 0; color: #6b7280; font-size: 12px;">Sudah Dibayar</p>
            <p style="margin: 5px 0; color: #059669; font-weight: bold; font-size: 14px;">
              Rp ${invoice.paid_amount.toLocaleString('id-ID')}
            </p>
          </div>
          <div>
            <p style="margin: 0; color: #6b7280; font-size: 12px;">Sisa Pembayaran</p>
            <p style="margin: 5px 0; color: #dc2626; font-weight: bold; font-size: 14px;">
              Rp ${(invoice.total_amount - invoice.paid_amount).toLocaleString('id-ID')}
            </p>
          </div>
        </div>
        <div style="margin-top: 10px; background-color: #f3f4f6; border-radius: 8px; height: 20px; overflow: hidden;">
          <div style="background-color: #059669; height: 100%; width: ${paymentPercentage}%;"></div>
        </div>
        <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 11px;">
          ${Math.round(paymentPercentage)}% dari total tagihan
        </p>
      </div>

      <!-- Payment Instructions -->
      <div style="padding: 20px; background-color: #fef3c7; border-left: 4px solid #d97706; border-radius: 4px; margin-bottom: 40px;">
        <h4 style="margin: 0 0 10px 0; color: #92400e; font-size: 12px; font-weight: bold;">INSTRUKSI PEMBAYARAN:</h4>
        <p style="margin: 0; color: #78350f; font-size: 11px; line-height: 1.6;">
          Silakan transfer ke rekening berikut dengan mencantumkan nomor invoice:<br>
          <br>
          <strong>PT. GardaTask</strong><br>
          Bank Mandiri<br>
          No. Rekening: 123456789<br>
          SWIFT Code: BMRIIDJA
        </p>
      </div>

      <!-- Footer -->
      <div style="border-top: 2px solid #e5e7eb; padding-top: 20px; text-align: center; color: #6b7280; font-size: 11px;">
        <p style="margin: 0 0 5px 0;">
          Dokumen ini dibuat oleh GardaTask - Sistem Manajemen Produktivitas
        </p>
        <p style="margin: 0;">
          Terima kasih atas kepercayaan Anda. Silakan hubungi kami jika ada pertanyaan.
        </p>
      </div>
    </div>
  `
  
  container.innerHTML = html
  return container
}

/**
 * Alternative: Generate PDF using canvas (if html2pdf not available)
 */
export const generateInvoicePDFAlternative = (invoice) => {
  // This would use jsPDF + html2canvas
  // For now, provide simple print option
  const printWindow = window.open('', '_blank')
  printWindow.document.write(createInvoiceHTML(invoice).innerHTML)
  printWindow.print()
}
