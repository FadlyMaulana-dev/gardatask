<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TeamInvitation extends Model
{
    use HasFactory;

    protected $fillable = [
        'email',
        'role',
        'jabatan',
        'token',
        'invited_by',
    ];

    public function inviter()
    {
        return $this->belongsTo(User::class, 'invited_by');
    }
}
