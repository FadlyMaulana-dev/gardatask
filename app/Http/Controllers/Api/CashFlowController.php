<?php

namespace App\Http\Controllers\Api;

use App\Models\CashTransaction;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use App\Traits\ApiResponse;

class CashFlowController extends Controller
{
    use ApiResponse;

    /**
     * Get all cash transactions (income & expense)
     */
    public function index(Request $request)
    {
        $query = CashTransaction::query();

        // Filter by type
        if ($request->has('type') && in_array($request->type, ['income', 'expense'])) {
            $query->where('type', $request->type);
        }

        // Filter by date range
        if ($request->has('start_date') && $request->has('end_date')) {
            $query->byDate($request->start_date, $request->end_date);
        }

        // Filter by category
        if ($request->has('category')) {
            $query->byCategory($request->category);
        }

        $transactions = $query->latest('transaction_date')->paginate(20);

        return $this->success($transactions, 'Transactions retrieved successfully');
    }

    /**
     * Create manual expense
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:income,expense',
            'category' => 'required|string',
            'description' => 'required|string',
            // Limit amount to a reasonable maximum to avoid DB overflow
            'amount' => ['required','numeric','min:0.01','max:9999999999999.99'],
            'transaction_date' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        try {
            $transaction = CashTransaction::create($validated);
            return $this->success($transaction, 'Transaction created successfully', 201);
        } catch (\Illuminate\Database\QueryException $e) {
            // Log and return friendly JSON error
            report($e);
            return $this->error('Failed to create transaction: invalid or too large amount', 422);
        }
    }

    /**
     * Get cash flow summary
     */
    public function summary(Request $request)
    {
        $startDate = $request->query('start_date', now()->startOfMonth());
        $endDate = $request->query('end_date', now()->endOfMonth());

        $income = CashTransaction::income()
            ->byDate($startDate, $endDate)
            ->sum('amount');

        $expense = CashTransaction::expense()
            ->byDate($startDate, $endDate)
            ->sum('amount');

        $balance = $income - $expense;

        // Get breakdown by category
        $incomeByCategory = CashTransaction::income()
            ->byDate($startDate, $endDate)
            ->groupBy('category')
            ->selectRaw('category, SUM(amount) as total, COUNT(*) as count')
            ->get();

        $expenseByCategory = CashTransaction::expense()
            ->byDate($startDate, $endDate)
            ->groupBy('category')
            ->selectRaw('category, SUM(amount) as total, COUNT(*) as count')
            ->get();

        $summary = [
            'period' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
            'income' => $income,
            'expense' => $expense,
            'balance' => $balance,
            'income_by_category' => $incomeByCategory,
            'expense_by_category' => $expenseByCategory,
        ];

        return $this->success($summary, 'Cash flow summary retrieved successfully');
    }

    /**
     * Get monthly cash flow trend (last 12 months)
     */
    public function trend(Request $request)
    {
        $months = collect();

        for ($i = 11; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $startDate = $date->copy()->startOfMonth();
            $endDate = $date->copy()->endOfMonth();

            $income = CashTransaction::income()
                ->byDate($startDate, $endDate)
                ->sum('amount');

            $expense = CashTransaction::expense()
                ->byDate($startDate, $endDate)
                ->sum('amount');

            $months->push([
                'month' => $date->format('M Y'),
                'month_key' => $date->format('Y-m'),
                'income' => $income,
                'expense' => $expense,
                'balance' => $income - $expense,
            ]);
        }

        return $this->success($months, 'Cash flow trend retrieved successfully');
    }

    /**
     * Export cash flow data (CSV)
     */
    public function export(Request $request)
    {
        $startDate = $request->query('start_date', now()->startOfMonth());
        $endDate = $request->query('end_date', now()->endOfMonth());

        $transactions = CashTransaction::byDate($startDate, $endDate)
            ->latest('transaction_date')
            ->get();

        $csv = "Type,Category,Description,Amount,Date,Notes\n";

        foreach ($transactions as $transaction) {
            $csv .= "{$transaction->type},";
            $csv .= "{$transaction->category},";
            $csv .= "\"{$transaction->description}\",";
            $csv .= $transaction->amount . ",";
            $csv .= $transaction->transaction_date->format('Y-m-d') . ",";
            $csv .= "\"{$transaction->notes}\"\n";
        }

        return response($csv)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="cashflow-' . now()->format('Y-m-d') . '.csv"');
    }

    /**
     * Get transaction detail
     */
    public function show(CashTransaction $transaction)
    {
        $transaction->load('invoice', 'invoicePayment');

        return $this->success($transaction, 'Transaction retrieved successfully');
    }

    /**
     * Update transaction
     */
    public function update(Request $request, CashTransaction $transaction)
    {
        // Can't update if linked to payment
        if ($transaction->invoice_payment_id !== null) {
            return $this->error('Cannot update automatic transaction', 422);
        }

        $validated = $request->validate([
            'category' => 'nullable|string',
            'description' => 'nullable|string',
            'amount' => 'nullable|numeric|min:0.01',
            'transaction_date' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        $transaction->update($validated);

        return $this->success($transaction, 'Transaction updated successfully');
    }

    /**
     * Delete transaction
     */
    public function destroy(CashTransaction $transaction)
    {
        // Can't delete if linked to payment
        if ($transaction->invoice_payment_id !== null) {
            return $this->error('Cannot delete automatic transaction', 422);
        }

        $transaction->delete();

        return $this->success(null, 'Transaction deleted successfully');
    }
}
