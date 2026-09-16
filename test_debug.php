<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$pm = \App\Models\User::where('role', 'project_manager')->first();
echo "PM User ID: " . ($pm ? $pm->id : 'NOT FOUND') . "\n";
echo "PM Role: " . ($pm ? $pm->role : 'NOT FOUND') . "\n";

$projects = \App\Models\Project::all();
echo "Projects count: " . $projects->count() . "\n";
foreach($projects as $p) {
    echo "Project ID: {$p->id}, User ID: {$p->user_id}, Name: {$p->name}\n";
}

$tasks = \App\Models\Task::all();
echo "Tasks count: " . $tasks->count() . "\n";
foreach($tasks as $t) {
    echo "Task ID: {$t->id}, User ID: {$t->user_id}, Project ID: {$t->project_id}\n";
}
