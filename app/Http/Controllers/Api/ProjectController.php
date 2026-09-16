<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectRequest;
use App\Models\Project;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        try {
            $query = Project::query();

            // Scope projects to the authenticated user OR allow project_manager to see all
            if ($request->user() && $request->user()->role !== 'project_manager') {
                $query->where('user_id', $request->user()->id);
            }

            // Filter by status if provided
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            $projects = $query
                ->withCount('tasks')
                ->select(['id', 'user_id', 'name', 'description', 'color', 'status', 'deadline', 'progress', 'created_at', 'updated_at'])
                ->orderBy('created_at', 'desc')
                ->paginate(20);

            return $this->success($projects, 'Projects retrieved successfully');
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), 500);
        }
    }

    public function store(StoreProjectRequest $request)
    {
        try {
            if ($request->user()->role !== 'project_manager') {
                return $this->error('Only Project Managers can create projects', 403);
            }

            $project = Project::create([
                ...$request->validated(),
                'user_id' => $request->user()->id,
                'status' => $request->status ?? 'active',
                'progress' => $request->progress ?? 0,
            ]);

            return $this->success($project, 'Project created successfully', 201);
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), 500);
        }
    }

    public function show(Request $request, Project $project)
    {
        try {

            return $this->success($project->load('tasks'), 'Project retrieved successfully');
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), 500);
        }
    }

    public function update(UpdateProjectRequest $request, Project $project)
    {
        try {

            $project->update($request->validated());

            return $this->success($project, 'Project updated successfully');
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), 500);
        }
    }

    public function destroy(Request $request, Project $project)
    {
        try {

            $project->delete();
            return $this->success(null, 'Project deleted successfully');
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), 500);
        }
    }
}
