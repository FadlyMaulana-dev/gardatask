<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Models\Task;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class TaskController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        try {
            $query = Task::query();

            if ($request->has('project_id')) {
                $query->where('project_id', $request->project_id);
            }
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }
            if ($request->has('priority')) {
                $query->where('priority', $request->priority);
            }

            $tasks = $query->with('project', 'user')
                ->orderBy('created_at', 'desc')
                ->get();

            return $this->success($tasks, 'Tasks retrieved successfully');
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), 500);
        }
    }

    /** Invalidate task list cache for all pages of a given user */
    private function bustTaskCache(int $userId): void
    {
        Cache::forget("tasks:user_{$userId}:");
        // Bust common filtered variants too
        foreach (range(1, 10) as $page) {
            Cache::forget("tasks:user_{$userId}:page={$page}");
        }
    }

    public function store(StoreTaskRequest $request)
    {
        try {
            if ($request->user()->role !== 'project_manager') {
                return $this->error('Only Project Managers can create tasks', 403);
            }

            $assignedUserId = $request->user_id ?? $request->user()->id;

            $task = Task::create([
                ...$request->validated(),
                'user_id' => $assignedUserId,
                'status' => $request->status ?? 'todo',
                'priority' => $request->priority ?? 'medium',
                'progress' => $request->progress ?? 0,
            ]);

            $this->bustTaskCache($request->user()->id);

            return $this->success($task->load('project'), 'Task created successfully', 201);
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), 500);
        }
    }

    public function show(Request $request, Task $task)
    {
        try {

            return $this->success($task->load('project', 'user'), 'Task retrieved successfully');
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), 500);
        }
    }

    public function update(UpdateTaskRequest $request, Task $task)
    {
        try {
            $data = $request->validated();
            
            if (isset($data['status']) && $data['status'] === 'done' && $task->status !== 'done') {
                $data['completed_at'] = now();
            } else if (isset($data['status']) && $data['status'] !== 'done') {
                $data['completed_at'] = null;
            }

            $task->update($data);

            if ($task->status === 'done') {
                $points = $this->calculateGardaScore($task);
                $task->update(['points_awarded' => $points]);
            } else {
                $task->update(['points_awarded' => 0]);
            }

            $this->bustTaskCache($request->user()->id);

            return $this->success($task->load('project'), 'Task updated successfully');
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), 500);
        }
    }

    private function calculateGardaScore(Task $task) {
        $basePoints = [
            'bug_fix' => 20,
            'ui_minor' => 25,
            'ui_major' => 50,
            'frontend_feature' => 60,
            'backend_feature' => 70,
            'api_integration' => 80,
            'database_migration' => 90,
            'deployment' => 50,
        ];
        
        $base = $basePoints[$task->task_type] ?? 0;

        $est = $task->estimated_hours ?? 0;
        $estBonus = 0;
        if ($est < 4) $estBonus = 0;
        elseif ($est <= 8) $estBonus = 5;
        elseif ($est <= 16) $estBonus = 10;
        elseif ($est <= 32) $estBonus = 20;
        else $estBonus = 30;

        $prioBonus = 0;
        switch($task->priority) {
            case 'medium': $prioBonus = 5; break;
            case 'high': $prioBonus = 10; break;
            case 'urgent': $prioBonus = 20; break;
            default: $prioBonus = 0; break;
        }

        $subtotal = $base + $estBonus + $prioBonus;

        $deadlineMult = 1.0;
        if ($task->due_date && $task->completed_at) {
            $due = Carbon::parse($task->due_date)->endOfDay();
            $completed = Carbon::parse($task->completed_at);
            if ($completed->lte($due)) {
                $deadlineMult = 1.1; 
            } else {
                $daysLate = $completed->startOfDay()->diffInDays($due->startOfDay());
                if ($daysLate > 0) {
                    $penalty = min(0.30, ($daysLate * 0.05));
                    $deadlineMult = 1.0 - $penalty;
                } else {
                    $deadlineMult = 1.1;
                }
            }
        }

        $qualityMult = 1.0;
        if ($task->quality_rating === 'exceeded') $qualityMult = 1.2;
        elseif ($task->quality_rating === 'revision') $qualityMult = 0.8;
        
        return round($subtotal * $qualityMult * $deadlineMult);
    }

    public function destroy(Request $request, Task $task)
    {
        try {
            $userId = $request->user()->id;
            $task->delete();
            $this->bustTaskCache($userId);
            return $this->success(null, 'Task deleted successfully');
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), 500);
        }
    }
}
