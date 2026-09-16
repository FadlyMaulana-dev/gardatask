<?php

namespace App\Http\Controllers\Api;

use App\Models\Invoice;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use App\Traits\ApiResponse;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\View;

class InvoiceController extends Controller
{
    use ApiResponse;

    /**
     * Get all invoices (with filters)
     */
    public function index(Request $request)
    {
        $query = Invoice::with(['project', 'user', 'payments'])
            ->where('user_id', auth()->id());

        // Filter by project
        if ($request->has('project_id')) {
            $query->where('project_id', $request->project_id);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by date range
        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('invoice_date', [
                $request->start_date,
                $request->end_date
            ]);
        }

        // Pagination
        $invoices = $query->latest('created_at')->paginate(20);

        return $this->success($invoices, 'Invoices retrieved successfully');
    }

    /**
     * Get single invoice detail
     */
    public function show(Invoice $invoice)
    {
        // Authorization check
        if ($invoice->user_id !== auth()->id()) {
            return $this->error('Unauthorized', 403);
        }

        $invoice->load(['project', 'user', 'payments']);

        return $this->success($invoice, 'Invoice retrieved successfully');
    }

    /**
     * Create new invoice
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id',
            'client_name' => 'required|string',
            'client_email' => 'nullable|email',
            'client_phone' => 'nullable|string',
            'description' => 'nullable|string',
            'invoice_date' => 'required|date',
            'due_date' => 'required|date|after:invoice_date',
            'total_amount' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        // Check project ownership
        $project = Project::find($request->project_id);
        if ($project->user_id !== auth()->id()) {
            return $this->error('Unauthorized project', 403);
        }

        $validated['user_id'] = auth()->id();
        $validated['paid_amount'] = 0;
        $validated['status'] = 'unpaid';

        // Attempt to create invoice with a unique invoice number, retry on duplicate
        $attempts = 0;
        $invoice = null;
        while ($attempts < 5) {
            $attempts++;
            $validated['invoice_number'] = Invoice::generateInvoiceNumber();
            try {
                $invoice = Invoice::create($validated);
                break;
            } catch (\Illuminate\Database\UniqueConstraintViolationException $e) {
                // Duplicate invoice_number detected, loop will retry with next sequence
                if ($attempts >= 5) {
                    return $this->error('Failed to generate unique invoice number', 500);
                }
            }
        }

        if (!$invoice) {
            return $this->error('Failed to create invoice', 500);
        }
        $invoice->load(['project', 'user', 'payments']);

        return $this->success($invoice, 'Invoice created successfully', 201);
    }

    /**
     * Update invoice
     */
    public function update(Request $request, Invoice $invoice)
    {
        // Authorization check
        if ($invoice->user_id !== auth()->id()) {
            return $this->error('Unauthorized', 403);
        }

        // Can't edit if paid
        if ($invoice->status === 'paid') {
            return $this->error('Cannot edit paid invoice', 422);
        }

        $validated = $request->validate([
            'client_name' => 'nullable|string',
            'client_email' => 'nullable|email',
            'client_phone' => 'nullable|string',
            'description' => 'nullable|string',
            'due_date' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        $invoice->update($validated);
        $invoice->load(['project', 'user', 'payments']);

        return $this->success($invoice, 'Invoice updated successfully');
    }

    /**
     * Delete invoice (only if unpaid)
     */
    public function destroy(Invoice $invoice)
    {
        // Authorization check
        if ($invoice->user_id !== auth()->id()) {
            return $this->error('Unauthorized', 403);
        }

        if ($invoice->paid_amount > 0) {
            return $this->error('Cannot delete invoice with payments', 422);
        }

        $invoice->delete();

        return $this->success(null, 'Invoice deleted successfully');
    }

    /**
     * Get invoice statistics for dashboard
     */
    public function statistics(Request $request)
    {
        $userId    = auth()->id();
        $startDate = $request->query('start_date', now()->startOfMonth()->toDateString());
        $endDate   = $request->query('end_date',   now()->endOfMonth()->toDateString());

        // Single aggregate query instead of 6 separate queries (N+1 fix)
        $agg = Invoice::where('user_id', $userId)
            ->whereBetween('invoice_date', [$startDate, $endDate])
            ->selectRaw("
                COUNT(*)                                                      AS total_invoices,
                COALESCE(SUM(total_amount), 0)                                AS total_amount,
                COALESCE(SUM(CASE WHEN status = 'paid' THEN total_amount ELSE 0 END), 0) AS paid_amount,
                SUM(CASE WHEN status = 'unpaid'  THEN 1 ELSE 0 END)          AS unpaid_count,
                SUM(CASE WHEN status = 'partial' THEN 1 ELSE 0 END)          AS partial_count,
                SUM(CASE WHEN status = 'paid'    THEN 1 ELSE 0 END)          AS paid_count
            ")
            ->first();

        $stats = [
            'total_invoices' => (int) $agg->total_invoices,
            'total_amount'   => (float) $agg->total_amount,
            'paid_amount'    => (float) $agg->paid_amount,
            'unpaid_count'   => (int) $agg->unpaid_count,
            'partial_count'  => (int) $agg->partial_count,
            'paid_count'     => (int) $agg->paid_count,
        ];

        return $this->success($stats, 'Statistics retrieved successfully');
    }

    /**
     * Duplicate invoice
     */
    public function duplicate(Invoice $invoice)
    {
        if ($invoice->user_id !== auth()->id()) {
            return $this->error('Unauthorized', 403);
        }

        $newInvoice = $invoice->replicate();
        $newInvoice->invoice_number = Invoice::generateInvoiceNumber();
        $newInvoice->invoice_date = now()->date();
        $newInvoice->due_date = now()->addDays(30)->date();
        $newInvoice->paid_amount = 0;
        $newInvoice->status = 'unpaid';
        $newInvoice->sent_at = null;
        $newInvoice->save();

        $newInvoice->load(['project', 'user', 'payments']);

        return $this->success($newInvoice, 'Invoice duplicated successfully', 201);
    }

    /**
     * Download or export invoice
     */
    public function download(Request $request, Invoice $invoice, $format)
    {
        if ($invoice->user_id !== auth()->id()) {
            return $this->error('Unauthorized', 403);
        }

        $invoice->load(['project']);
        $html = View::make('invoices.template', compact('invoice'))->render();
        $filename = "Invoice-{$invoice->invoice_number}";

        if ($format === 'pdf') {
            $pdf = Pdf::loadHTML($html);
            return $pdf->download("{$filename}.pdf");
        } 
        
        if ($format === 'word') {
            return response($html)
                ->header('Content-Type', 'application/msword')
                ->header('Content-Disposition', "attachment; filename=\"{$filename}.doc\"");
        } 
        
        if ($format === 'excel') {
            return response($html)
                ->header('Content-Type', 'application/vnd.ms-excel')
                ->header('Content-Disposition', "attachment; filename=\"{$filename}.xls\"");
        }

        return $this->error('Invalid format', 400);
    }
}
