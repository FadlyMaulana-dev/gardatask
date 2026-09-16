<?php

namespace App\Models\Crm;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PayrollBonus extends Model
{
    use HasFactory;

    protected $fillable = [
        'min_points',
        'bonus_amount',
        'rule_type',
    ];
}
