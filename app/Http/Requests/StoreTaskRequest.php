<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTaskRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'nullable|in:todo,in_progress,done,cancelled',
            'priority' => 'nullable|in:low,medium,high,urgent',
            'due_date' => 'nullable|date',
            'project_id' => 'nullable|exists:projects,id',
            'tags' => 'nullable|string',
            'progress' => 'nullable|integer|min:0|max:100',
            'task_type' => 'nullable|string',
            'estimated_hours' => 'nullable|integer|min:0',
            'user_id' => 'nullable|exists:users,id',
            'reviewer_id' => 'nullable|exists:users,id',
            'quality_rating' => 'nullable|in:exceeded,meets,revision',
            'points_awarded' => 'nullable|integer',
            'completed_at' => 'nullable|date',
        ];
    }
}
