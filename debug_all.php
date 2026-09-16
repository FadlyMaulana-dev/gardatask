<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$users = \App\Models\User::select('id', 'name', 'email', 'role', 'jabatan')->get();
foreach ($users as $u) {
    echo "ID: {$u->id} | Name: {$u->name} | Email: {$u->email} | Role: {$u->role}" . PHP_EOL;
}
echo PHP_EOL;

$projects = \App\Models\Project::select('id', 'user_id', 'name')->get();
foreach ($projects as $p) {
    echo "Project: {$p->name} | owner user_id: {$p->user_id}" . PHP_EOL;
}
echo PHP_EOL;

$tasks = \App\Models\Task::select('id', 'user_id', 'project_id', 'title')->get();
foreach ($tasks as $t) {
    echo "Task: {$t->title} | user_id: {$t->user_id} | project_id: {$t->project_id}" . PHP_EOL;
}
