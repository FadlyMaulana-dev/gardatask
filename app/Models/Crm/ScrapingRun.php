<?php

namespace App\Models\Crm;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class ScrapingRun extends Model
{
    use HasFactory;

    protected $fillable = [
        'keyword',
        'source',
        'limit_data',
        'results_count',
        'run_date',
        'user_id',
    ];

    protected $casts = [
        'run_date' => 'datetime',
    ];

    protected $appends = ['total_saved', 'total_skipped'];

    public function getTotalSavedAttribute()
    {
        return $this->results_count;
    }

    public function getTotalSkippedAttribute()
    {
        return max(0, $this->limit_data - $this->results_count);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
