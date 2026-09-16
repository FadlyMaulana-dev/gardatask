<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    protected $fillable = [
        'user_id', 'project_id', 'title', 'description',
        'status', 'priority', 'due_date', 'assignee', 'tags', 'progress',
        'task_type', 'estimated_hours', 'reviewer_id', 'quality_rating', 'points_awarded', 'completed_at'
    ];

    protected $casts = [
        'due_date' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function project()
    {
        return $this->belongsTo(Project::class);
    }
}
