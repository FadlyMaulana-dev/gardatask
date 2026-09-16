<?php

namespace App\Models\Crm;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KpiSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'activity_type',
        'points',
    ];
}
