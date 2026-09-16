<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;

class Invoice extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_number',
        'project_id',
        'user_id',
        'client_name',
        'client_email',
        'client_phone',
        'description',
        'invoice_date',
        'due_date',
        'total_amount',
        'paid_amount',
        'status',
        'notes',
        'sent_at',
    ];

    protected $casts = [
        'invoice_date' => 'date',
        'due_date' => 'date',
        'total_amount' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'sent_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // =========================================
    // RELATIONSHIPS
    // =========================================

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(InvoicePayment::class);
    }

    public function cashTransactions(): HasMany
    {
        return $this->hasMany(CashTransaction::class);
    }

    // =========================================
    // HELPER METHODS
    // =========================================

    /**
     * Generate invoice number format: INV-YYYYMM-XXX
     */
    public static function generateInvoiceNumber(): string
    {
        $year = now()->format('Y');
        $month = now()->format('m');

        $prefix = "INV-{$year}{$month}-";

        // Find the maximum numeric suffix for existing invoice numbers this month
        $max = DB::table('invoices')
            ->where('invoice_number', 'like', $prefix . '%')
            ->max(DB::raw('CAST(SUBSTRING_INDEX(invoice_number, "-", -1) AS UNSIGNED)'));

        $next = ($max ? intval($max) + 1 : 1);
        $sequence = str_pad($next, 3, '0', STR_PAD_LEFT);

        return $prefix . $sequence;
    }

    /**
     * Calculate payment percentage
     */
    public function getPaymentPercentageAttribute(): float
    {
        if ($this->total_amount == 0) {
            return 0;
        }
        
        return ($this->paid_amount / $this->total_amount) * 100;
    }

    /**
     * Get remaining amount
     */
    public function getRemainingAmountAttribute(): float
    {
        return max(0, $this->total_amount - $this->paid_amount);
    }

    /**
     * Update status based on payment percentage
     */
    public function updateStatus(): void
    {
        $percentage = $this->getPaymentPercentageAttribute();

        if ($percentage == 0) {
            $this->status = 'unpaid';
        } elseif ($percentage < 100) {
            $this->status = 'partial';
        } else {
            $this->status = 'paid';
        }

        $this->save();
    }

    /**
     * Add payment and update invoice
     */
    public function recordPayment(float $amount, string $method = 'transfer', ?string $proofFile = null, ?string $notes = null, ?string $paymentDate = null): InvoicePayment
    {
        $paymentDate = $paymentDate ?? now()->toDateString();
        $payment = $this->payments()->create([
            'amount' => $amount,
            'payment_date' => $paymentDate,
            'payment_method' => $method,
            'proof_file' => $proofFile,
            'notes' => $notes,
        ]);

        // Update paid amount
        $this->paid_amount = $this->payments()->sum('amount');
        $this->updateStatus();

        // Create cash transaction (income)
        CashTransaction::create([
            'type' => 'income',
            'category' => 'invoice_payment',
            'description' => "Payment for Invoice {$this->invoice_number}",
            'amount' => $amount,
            'transaction_date' => $paymentDate,
            'invoice_id' => $this->id,
            'invoice_payment_id' => $payment->id,
        ]);

        return $payment;
    }

    /**
     * Check if invoice is overdue
     */
    public function isOverdue(): bool
    {
        return $this->due_date < now()->date() && $this->status !== 'paid';
    }

    /**
     * Get days until due or days overdue
     */
    public function getDaysUntilDueAttribute(): int
    {
        return now()->diffInDays($this->due_date, false);
    }

    /**
     * Get WhatsApp link for sending invoice
     */
    public function getWhatsAppLinkAttribute(): string
    {
        $phone = preg_replace('/[^0-9]/', '', $this->client_phone);
        
        // Ensure phone starts with country code
        if (!str_starts_with($phone, '62')) {
            $phone = '62' . (str_starts_with($phone, '0') ? substr($phone, 1) : $phone);
        }

        $message = urlencode(
            "Halo {$this->client_name}!\n\n"
            . "Berikut adalah invoice untuk project \"{$this->project->name}\":\n\n"
            . "📋 Nomor Invoice: {$this->invoice_number}\n"
            . "💰 Total Tagihan: Rp " . number_format((float) $this->total_amount, 0, ',', '.') . "\n"
            . "📅 Tanggal Jatuh Tempo: " . \Carbon\Carbon::parse($this->due_date)->format('d/m/Y') . "\n\n"
            . "Silakan transfer ke rekening berikut dan reply dengan bukti transfer.\n"
            . "Terima kasih!"
        );

        return "https://wa.me/{$phone}?text={$message}";
    }
}
