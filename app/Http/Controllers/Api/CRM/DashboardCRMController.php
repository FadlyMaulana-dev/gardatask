<?php

namespace App\Http\Controllers\Api\CRM;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Crm\Lead;
use App\Models\Crm\LeadActivity;
use App\Models\Crm\KpiSetting;
use App\Models\Crm\PayrollBonus;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class DashboardCRMController extends Controller
{
    // ─────────────────────────────────────────────────
    // Helper: fetch all KPI point rules once
    // ─────────────────────────────────────────────────
    private function getKpiRules(): array
    {
        return Cache::remember('crm_kpi_rules', 3600, function () {
            return KpiSetting::all()->keyBy('activity_type')->toArray();
        });
    }

    // Helper: fetch payroll bonus rules once
    private function getPayrollRules(): array
    {
        return Cache::remember('crm_payroll_rules', 3600, function () {
            return PayrollBonus::all()->toArray();
        });
    }

    // Helper: calculate bonus from pre-loaded rules (no DB hit)
    private function calcBonus(int $points, int $deals, array $payrollRules): float
    {
        $bonus = 0.0;
        $pointThreshold = null;
        $perDeal = null;

        foreach ($payrollRules as $rule) {
            if ($rule['rule_type'] === 'point_threshold') {
                if ($points >= $rule['min_points']) {
                    if (!$pointThreshold || $rule['min_points'] > $pointThreshold['min_points']) {
                        $pointThreshold = $rule;
                    }
                }
            } elseif ($rule['rule_type'] === 'per_deal') {
                $perDeal = $rule;
            }
        }

        if ($pointThreshold) $bonus += $pointThreshold['bonus_amount'];
        if ($perDeal)        $bonus += $deals * $perDeal['bonus_amount'];

        return $bonus;
    }

    // ─────────────────────────────────────────────────
    // GET /crm/dashboard/marketing
    // ─────────────────────────────────────────────────
    public function marketing(Request $request)
    {
        $userId = auth()->id() ?? 1;

        // ── 1. Funnel counts — semua leads di sistem ──
        $funnelRaw = Lead::select('status', DB::raw('COUNT(*) as cnt'))
            ->groupBy('status')
            ->pluck('cnt', 'status')
            ->toArray();

        $totalLeads     = array_sum($funnelRaw);
        $leadBaru       = $funnelRaw['New']         ?? 0;
        $sudahDihubungi = $funnelRaw['Contacted']   ?? 0;
        $followUp       = $funnelRaw['Follow Up']   ?? 0;
        $proposal       = $funnelRaw['Proposal']    ?? 0;
        // Fix: enum pakai 'Closed Won', bukan 'Deal'
        $deals          = ($funnelRaw['Closed Won'] ?? 0);
        $closedLost     = $funnelRaw['Closed Lost'] ?? 0;
        $negotiation    = $funnelRaw['Negotiation'] ?? 0;

        // ── 2. Aktivitas dan poin milik user ini ──
        // Single grouped query, eliminates the extra SUM query below
        $myActivities = LeadActivity::where('user_id', $userId)
            ->select(
                'activity_type',
                DB::raw('COUNT(*) as cnt'),
                DB::raw('SUM(kpi_points) as pts')
            )
            ->groupBy('activity_type')
            ->get()
            ->keyBy('activity_type');

        // Compute my total points from the already-loaded collection (no extra DB query)
        $myPoints = $myActivities->sum('pts');
        // Fix: hitung deals dari activity type 'Deal' (log dari KpiScoringService)
        $myDeals  = (int) ($myActivities->get('Deal')?->cnt ?? 0);

        // Conversion rate: deals / total leads (lebih bermakna)
        $conversionRate = $totalLeads > 0
            ? round(($deals / $totalLeads) * 100, 1)
            : 0;

        // ── 3. Hitung bonus ──
        $payrollRules = $this->getPayrollRules();
        $myBonus = $this->calcBonus((int) $myPoints, $myDeals, $payrollRules);

        return response()->json([
            'success' => true,
            'data' => [
                'total_leads'       => $totalLeads,
                'lead_baru'         => $leadBaru,
                'sudah_dihubungi'   => $sudahDihubungi,
                'follow_up'         => $followUp,
                'negotiation'       => $negotiation,
                'proposal'          => $proposal,
                'deal'              => $deals,
                'closed_lost'       => $closedLost,
                'my_points'         => (int) $myPoints,
                'my_bonus'          => $myBonus,
                'deals_closed'      => (int) $myDeals,
                'conversion_rate'   => $conversionRate,
            ],
        ]);
    }

    // ─────────────────────────────────────────────────
    // GET /crm/dashboard/dirut
    // ─────────────────────────────────────────────────
    public function dirut(Request $request)
    {
        // ── 1. Funnel in ONE query ──
        $funnelRaw = Lead::select('status', DB::raw('COUNT(*) as cnt'))
            ->groupBy('status')
            ->pluck('cnt', 'status')
            ->toArray();

        $totalLeads = array_sum($funnelRaw);
        $totalDeals = ($funnelRaw['Deal'] ?? 0) + ($funnelRaw['Closed Won'] ?? 0);

        $funnel = [
            'New'         => $funnelRaw['New']         ?? 0,
            'Contacted'   => $funnelRaw['Contacted']   ?? 0,
            'Follow Up'   => $funnelRaw['Follow Up']   ?? 0,
            'Negotiation' => $funnelRaw['Negotiation'] ?? 0,
            'Proposal'    => $funnelRaw['Proposal']    ?? 0,
            'Closed Won'  => $totalDeals,
            'Closed Lost' => $funnelRaw['Closed Lost'] ?? 0,
        ];

        // ── 2. All user activity aggregated in ONE query ──
        $activityAgg = LeadActivity::select(
                'user_id',
                DB::raw('SUM(kpi_points) as total_points'),
                DB::raw("SUM(CASE WHEN activity_type = 'Deal' THEN 1 ELSE 0 END) as total_deals")
            )
            ->groupBy('user_id')
            ->get()
            ->keyBy('user_id');

        // ── 3. Payroll rules loaded once ──
        $payrollRules = $this->getPayrollRules();

        // ── 4. Build performers from users ──
        // Optimization: Only fetch users that actually have activities to prevent full table scan OOM
        $activeUserIds = $activityAgg->keys()->toArray();
        $users = User::whereIn('id', $activeUserIds)->select('id', 'name')->get();
        $performers = [];

        foreach ($users as $u) {
            $agg    = $activityAgg->get($u->id);
            $pts    = (int) ($agg?->total_points ?? 0);
            $dealsU = (int) ($agg?->total_deals ?? 0);

            // Only include users who have any activity
            if ($pts === 0 && $dealsU === 0) continue;

            $performers[] = [
                'id'        => $u->id,
                'name'      => $u->name,
                'kpi_score' => $pts,
                'total_deal'=> $dealsU,
                'est_bonus' => $this->calcBonus($pts, $dealsU, $payrollRules),
            ];
        }

        usort($performers, fn($a, $b) => $b['kpi_score'] <=> $a['kpi_score']);

        // ── 5. Today's activities with eager loading (1 query + 2 joins) ──
        $todayActivities = LeadActivity::with(['user:id,name', 'lead:id,company_name'])
            ->whereDate('created_at', Carbon::today())
            ->orderByDesc('created_at')
            ->take(15)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'total_leads'      => $totalLeads,
                'total_deals'      => $totalDeals,
                'total_marketing'  => count($performers),
                'funnel'           => $funnel,
                'top_performers'   => $performers,
                'today_activities' => $todayActivities,
            ],
        ]);
    }
}
