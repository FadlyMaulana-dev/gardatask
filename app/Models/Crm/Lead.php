<?php

namespace App\Models\Crm;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class Lead extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_name',
        'category',
        'phone',
        'whatsapp',
        'website',
        'address',
        'city',
        'province',
        'country',
        'latitude',
        'longitude',
        'rating',
        'source_id',
        'source',
        'status',
    ];

    public function activities()
    {
        return $this->hasMany(LeadActivity::class);
    }

    public function assignments()
    {
        return $this->hasMany(LeadAssignment::class);
    }
}
