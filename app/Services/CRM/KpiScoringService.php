<?php

namespace App\Services\CRM;

use App\Models\Crm\LeadActivity;
use App\Models\Crm\KpiSetting;
use Illuminate\Support\Facades\Log;

class KpiScoringService
{
    /**
     * Log an activity and automatically grant KPI points
     *
     * @param int $leadId
     * @param int $userId
     * @param string $activityType
     * @param string|null $notes
     * @return LeadActivity
     */
    public function logActivity(int $leadId, int $userId, string $activityType, ?string $notes = null): LeadActivity
    {
        $setting = KpiSetting::where('activity_type', $activityType)->first();
        $points = $setting ? $setting->points : 0;

        return LeadActivity::create([
            'lead_id'       => $leadId,
            'user_id'       => $userId,
            'activity_type' => $activityType,
            'notes'         => $notes,
            'kpi_points'    => $points,
        ]);
    }

    /**
     * Get total KPI Score for a specific user within a timeframe
     */
    public function getUserKpiScore(int $userId, string $startDate = null, string $endDate = null): int
    {
        $query = LeadActivity::where('user_id', $userId);
        
        if ($startDate && $endDate) {
            $query->whereBetween('created_at', [$startDate, $endDate]);
        }

        return $query->sum('kpi_points');
    }
}
