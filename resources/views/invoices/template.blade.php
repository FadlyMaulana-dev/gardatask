<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Invoice - {{ $invoice->invoice_number }}</title>
    <style>
        body { font-family: 'Helvetica', Arial, sans-serif; font-size: 14px; color: #333; margin: 0; padding: 20px; }
        .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, .15); font-size: 16px; line-height: 24px; color: #555; }
        .invoice-box table { width: 100%; line-height: inherit; text-align: left; border-collapse: collapse;}
        .invoice-box table td { padding: 5px; vertical-align: top; }
        .invoice-box table tr td:nth-child(2) { text-align: right; }
        .invoice-box table tr.top table td { padding-bottom: 20px; }
        .invoice-box table tr.top table td.title { font-size: 45px; line-height: 45px; color: #333; }
        .invoice-box table tr.information table td { padding-bottom: 40px; }
        .invoice-box table tr.heading td { background: #eee; border-bottom: 1px solid #ddd; font-weight: bold; }
        .invoice-box table tr.details td { padding-bottom: 20px; }
        .invoice-box table tr.item td { border-bottom: 1px solid #eee; }
        .invoice-box table tr.item.last td { border-bottom: none; }
        .invoice-box table tr.total td:nth-child(2) { border-top: 2px solid #eee; font-weight: bold; }
        .text-right { text-align: right !important; }
        .text-center { text-align: center !important; }
        .company-name { font-size: 24px; font-weight: bold; color: #000; }
    </style>
</head>
<body>
    <div class="invoice-box">
        <table>
            <tr class="top">
                <td colspan="2">
                    <table>
                        <tr>
                            <td class="title">
                                <div class="company-name">GardaTask</div>
                                <div style="font-size: 12px; color:#777;">Productivity Solution</div>
                            </td>
                            <td>
                                <b>Invoice #:</b> {{ $invoice->invoice_number }}<br>
                                <b>Tanggal:</b> {{ \Carbon\Carbon::parse($invoice->invoice_date)->format('d/m/Y') }}<br>
                                <b>Jatuh Tempo:</b> {{ \Carbon\Carbon::parse($invoice->due_date)->format('d/m/Y') }}<br>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>

            <tr class="information">
                <td colspan="2">
                    <table>
                        <tr>
                            <td>
                                <strong>Ditagihkan ke:</strong><br>
                                {{ $invoice->client_name }}<br>
                                {{ $invoice->client_email ? $invoice->client_email . '<br>' : '' }}
                                {{ $invoice->client_phone ? $invoice->client_phone . '<br>' : '' }}
                            </td>
                            <td>
                                <strong>Project:</strong><br>
                                {{ $invoice->project->name ?? 'N/A' }}<br>
                                {{ $invoice->description ?? '' }}
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>

            <tr class="heading">
                <td>Deskripsi</td>
                <td class="text-right">Jumlah</td>
            </tr>

            <tr class="item">
                <td>Biaya Layanan Project - {{ $invoice->project->name ?? 'Project' }}</td>
                <td class="text-right">Rp {{ number_format($invoice->total_amount, 0, ',', '.') }}</td>
            </tr>

            <tr class="total">
                <td></td>
                <td class="text-right">
                   Total: Rp {{ number_format($invoice->total_amount, 0, ',', '.') }}
                </td>
            </tr>
            <tr>
                <td></td>
                <td class="text-right">
                   Terbayar: Rp {{ number_format($invoice->paid_amount, 0, ',', '.') }}
                </td>
            </tr>
            <tr>
                <td></td>
                <td class="text-right">
                   <strong style="{{ ($invoice->total_amount - $invoice->paid_amount) > 0 ? 'color: red;' : 'color: green;' }}">Saldo: Rp {{ number_format(max(0, $invoice->total_amount - $invoice->paid_amount), 0, ',', '.') }}</strong>
                </td>
            </tr>
        </table>
        
        @if($invoice->notes)
            <div style="margin-top: 50px; font-size: 12px; color: #555;">
                <strong>Catatan Tambahan:</strong><br>
                {!! nl2br(e($invoice->notes)) !!}
            </div>
        @endif
        
         <div style="margin-top: 50px; text-align: center; font-size: 12px; color: #777;">
            Terima kasih telah berbisnis dengan kami!
        </div>
    </div>
</body>
</html>
