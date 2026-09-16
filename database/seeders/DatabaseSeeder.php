<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Task;
use App\Models\Project;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create test users (firstOrCreate agar tidak error jika sudah ada)
        $admin = User::firstOrCreate(
            ['email' => 'admin@gardatask.com'],
            ['name' => 'Admin GardaTask', 'password' => Hash::make('Password123')]
        );

        $user1 = User::firstOrCreate(
            ['email' => 'john@example.com'],
            ['name' => 'John Doe', 'password' => Hash::make('Password123')]
        );

        $user2 = User::firstOrCreate(
            ['email' => 'jane@example.com'],
            ['name' => 'Jane Smith', 'password' => Hash::make('Password123')]
        );

        // Dummy projects and tasks logic removed for real-world usage.
    }
}
