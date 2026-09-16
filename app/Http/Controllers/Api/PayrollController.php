<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PayrollController extends Controller
{
    use ApiResponse;

    /**
     * GET /api/payroll/summary
     * Returns GardaScore™ summary per employee for a given month/year.
     */
    public function summary(Request $request)
    {
        $month = $request->query('month', now()->month);
        $year  = $request->query('year',  now()->year);

        // Salary base (configurable via .env or hardcoded default)
        $baseSalary = (int) env('PAYROLL_BASE_SALARY', 3000000);

        // Aggregate all "done" tasks in the requested period, grouped by user
        $aggregates = Task::select(
                'user_id',
                DB::raw('COUNT(*) as total_tasks'),
                DB::raw('SUM(points_awarded) as total_points'),
                DB::raw('SUM(CASE WHEN quality_rating = "exceeded" THEN 1 ELSE 0 END) as exceeded_count'),
                DB::raw('SUM(CASE WHEN quality_rating = "revision"  THEN 1 ELSE 0 END) as revision_count'),
                DB::raw('SUM(CASE WHEN due_date IS NOT NULL AND completed_at <= due_date THEN 1 ELSE 0 END) as on_time_count'),
                DB::raw('SUM(CASE WHEN due_date IS NOT NULL AND completed_at > due_date THEN 1 ELSE 0 END) as late_count'),
                // Breakdown by task type for detail view
                DB::raw('SUM(CASE WHEN task_type = "bug_fix"            THEN points_awarded ELSE 0 END) as pts_bug_fix'),
                DB::raw('SUM(CASE WHEN task_type = "ui_minor"           THEN points_awarded ELSE 0 END) as pts_ui_minor'),
                DB::raw('SUM(CASE WHEN task_type = "ui_major"           THEN points_awarded ELSE 0 END) as pts_ui_major'),
                DB::raw('SUM(CASE WHEN task_type = "frontend_feature"   THEN points_awarded ELSE 0 END) as pts_frontend'),
                DB::raw('SUM(CASE WHEN task_type = "backend_feature"    THEN points_awarded ELSE 0 END) as pts_backend'),
                DB::raw('SUM(CASE WHEN task_type = "api_integration"    THEN points_awarded ELSE 0 END) as pts_api'),
                DB::raw('SUM(CASE WHEN task_type = "database_migration" THEN points_awarded ELSE 0 END) as pts_db'),
                DB::raw('SUM(CASE WHEN task_type = "deployment"         THEN points_awarded ELSE 0 END) as pts_deploy')
            )
            ->where('status', 'done')
            ->whereNotNull('points_awarded')
            ->whereMonth('completed_at', $month)
            ->whereYear('completed_at', $year)
            ->groupBy('user_id')
            ->get()
            ->keyBy('user_id');

        // Fetch all users to build the leaderboard
        $users = User::select('id', 'name', 'email')->get();

        // Total points across all users this period (for ratio calculation)
        $grandTotalPoints = $aggregates->sum('total_points') ?: 1;

        $result = [];

        foreach ($users as $user) {
            $agg = $aggregates->get($user->id);

            $totalPoints = (int) ($agg?->total_points ?? 0);
            $totalTasks  = (int) ($agg?->total_tasks  ?? 0);

            // Bonus salary = proportional share of 30% of total payroll pool
            // i.e., each employee gets base + bonus based on their contribution ratio
            $contributionRatio = $grandTotalPoints > 1 ? ($totalPoints / $grandTotalPoints) : 0;
            $bonusPool   = $baseSalary * count($users) * 0.30;
            $bonusSalary = (int) round($contributionRatio * $bonusPool);
            $totalSalary = $baseSalary + $bonusSalary;

            $result[] = [
                'user_id'          => $user->id,
                'name'             => $user->name,
                'email'            => $user->email,
                'total_tasks'      => $totalTasks,
                'total_points'     => $totalPoints,
                'on_time_count'    => (int) ($agg?->on_time_count ?? 0),
                'late_count'       => (int) ($agg?->late_count    ?? 0),
                'exceeded_count'   => (int) ($agg?->exceeded_count ?? 0),
                'revision_count'   => (int) ($agg?->revision_count ?? 0),
                'contribution_pct' => round($contributionRatio * 100, 1),
                'base_salary'      => $baseSalary,
                'bonus_salary'     => $bonusSalary,
                'total_salary'     => $totalSalary,
                // Point breakdown by category
                'breakdown' => [
                    'bug_fix'     => (int) ($agg?->pts_bug_fix  ?? 0),
                    'ui_minor'    => (int) ($agg?->pts_ui_minor  ?? 0),
                    'ui_major'    => (int) ($agg?->pts_ui_major  ?? 0),
                    'frontend'    => (int) ($agg?->pts_frontend  ?? 0),
                    'backend'     => (int) ($agg?->pts_backend   ?? 0),
                    'api'         => (int) ($agg?->pts_api       ?? 0),
                    'database'    => (int) ($agg?->pts_db        ?? 0),
                    'deployment'  => (int) ($agg?->pts_deploy    ?? 0),
                ],
            ];
        }

        // Sort by total_points descending (leaderboard)
        usort($result, fn($a, $b) => $b['total_points'] <=> $a['total_points']);

        // Assign rank
        foreach ($result as $i => &$row) {
            $row['rank'] = $i + 1;
        }

        return $this->success([
            'period'            => ['month' => (int)$month, 'year' => (int)$year],
            'base_salary'       => $baseSalary,
            'grand_total_points'=> (int) $aggregates->sum('total_points'),
            'employees'         => $result,
        ], 'Payroll summary retrieved successfully');
    }
}
