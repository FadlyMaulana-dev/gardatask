<?php

namespace App\Http\Controllers\Api;

use App\Models\Invoice;
use App\Models\InvoicePayment;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use App\Traits\ApiResponse;

class PaymentController extends Controller
{
    use ApiResponse;

    /**
     * Get all payments for an invoice
     */
    public function indexByInvoice(Invoice $invoice)
    {
        // Authorization check
        if ($invoice->user_id !== auth()->id()) {
            return $this->error('Unauthorized', 403);
        }

        $payments = $invoice->payments()
            ->latest('payment_date')
            ->get();

        return $this->success($payments, 'Payments retrieved successfully');
    }

    /**
     * Record a payment for an invoice
     */
    public function store(Request $request, Invoice $invoice)
    {
        // Authorization check
        if ($invoice->user_id !== auth()->id()) {
            return $this->error('Unauthorized', 403);
        }

        // Check if already paid
        if ($invoice->status === 'paid') {
            return $this->error('Invoice is already paid', 422);
        }

        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'payment_method' => 'required|in:transfer,cash,check,other',
            'payment_date' => 'required|date',
            'proof_file' => 'nullable|image|max:5120', // 5MB
            'notes' => 'nullable|string',
        ]);

        // Check if payment exceeds remaining amount
        $remainingAmount = $invoice->total_amount - $invoice->paid_amount;
        if ($validated['amount'] > $remainingAmount) {
            return $this->error("Payment cannot exceed remaining amount: Rp " . number_format($remainingAmount, 2), 422);
        }

        // Handle file upload
        $proofFilePath = null;
        if ($request->hasFile('proof_file')) {
            $proofFilePath = $request->file('proof_file')
                ->storeAs('invoices/proofs', uniqid() . '.' . $request->file('proof_file')->extension(), 'public');
        }

        $payment = $invoice->recordPayment(
            $validated['amount'],
            $validated['payment_method'],
            $proofFilePath,
            $validated['notes'] ?? null,
            $validated['payment_date']
        );

        $payment->load('invoice');

        return $this->success($payment, 'Payment recorded successfully', 201);
    }

    /**
     * Get payment detail
     */
    public function show(InvoicePayment $payment)
    {
        $invoice = $payment->invoice;

        if ($invoice->user_id !== auth()->id()) {
            return $this->error('Unauthorized', 403);
        }

        $payment->load('invoice', 'cashTransaction');

        return $this->success($payment, 'Payment retrieved successfully');
    }

    /**
     * Update payment (if no invoice verification)
     */
    public function update(Request $request, InvoicePayment $payment)
    {
        $invoice = $payment->invoice;

        if ($invoice->user_id !== auth()->id()) {
            return $this->error('Unauthorized', 403);
        }

        $validated = $request->validate([
            'payment_method' => 'nullable|in:transfer,cash,check,other',
            'notes' => 'nullable|string',
        ]);

        $payment->update($validated);
        $payment->load('invoice');

        return $this->success($payment, 'Payment updated successfully');
    }

    /**
     * Delete payment (only if invoice not yet verified)
     */
    public function destroy(InvoicePayment $payment)
    {
        $invoice = $payment->invoice;

        if ($invoice->user_id !== auth()->id()) {
            return $this->error('Unauthorized', 403);
        }

        // Recalculate invoice state
        $amount = $payment->amount;
        $payment->delete();

        // Update invoice paid amount and status
        $invoice->paid_amount = max(0, $invoice->paid_amount - $amount);
        $invoice->updateStatus();

        // Delete associated cash transaction
        $payment->cashTransaction?->delete();

        return $this->success(null, 'Payment deleted successfully');
    }
}
