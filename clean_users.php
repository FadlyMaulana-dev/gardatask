<?php

use App\Models\User;
use App\Models\Task;
use App\Models\Crm\LeadActivity;
use Illuminate\Support\Facades\DB;

try {
    DB::beginTransaction();

    // Reassign or delete related data first to prevent foreign key errors
    Task::where('user_id', '!=', 1)->delete();
    LeadActivity::where('user_id', '!=', 1)->delete();
    
    // Delete all users except ID 1 (Admin)
    User::where('id', '!=', 1)->delete();

    // Rename Admin
    $admin = User::find(1);
    if ($admin) {
        $admin->name = 'Project Manajer';
        $admin->save();
        echo "Successfully cleaned up team and updated Admin name to 'Project Manajer'.\n";
    }

    DB::commit();
} catch (\Exception $e) {
    DB::rollBack();
    echo "Error: " . $e->getMessage() . "\n";
}
