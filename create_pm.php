<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$pm = \App\Models\User::firstOrCreate(
    ['email' => 'pm@gardatask.com'],
    [
        'name' => 'Project Manager',
        'password' => \Hash::make('password'),
        'role' => 'project_manager',
        'jabatan' => 'Project Manager'
    ]
);

echo "Created/Found PM: " . $pm->email . "\n";
