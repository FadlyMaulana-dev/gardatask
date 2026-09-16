<?php

namespace App\Services\CRM;

use App\Models\Crm\PayrollBonus;
use App\Models\Crm\LeadActivity;
use Illuminate\Support\Facades\Log;

class PayrollCalculatorService
{
    /**
     * Calculate total monetary bonus based on accumulated points and/or closed deals
     *
     * @param int $userId
     * @param string|null $startDate
     * @param string|null $endDate
     * @return float
     */
    public function calculateUserBonus(int $userId, string $startDate = null, string $endDate = null): float
    {
        $totalBonus = 0;

        // 1. Calculate by Point Threshold (e.g. 500pt = 500,000)
        $kpiService = new KpiScoringService();
        $totalPoints = $kpiService->getUserKpiScore($userId, $startDate, $endDate);

        $pointRules = PayrollBonus::where('rule_type', 'point_threshold')
                        ->orderBy('min_points', 'desc')
                        ->get();

        foreach ($pointRules as $rule) {
            if ($totalPoints >= $rule->min_points) {
                // Assuming it's not cumulative per threshold, but highest threshold reached
                $totalBonus += $rule->bonus_amount;
                break; 
            }
        }

        // 2. Calculate by Per-Deal Bonus (e.g. 1 deal = 100,000)
        $dealRule = PayrollBonus::where('rule_type', 'per_deal')->first();
        if ($dealRule) {
            $query = LeadActivity::where('user_id', $userId)
                                ->where('activity_type', 'Deal');
            
            if ($startDate && $endDate) {
                $query->whereBetween('created_at', [$startDate, $endDate]);
            }
            
            $totalDeals = $query->count();
            $totalBonus += ($totalDeals * $dealRule->bonus_amount);
        }

        return (float) $totalBonus;
    }
}
