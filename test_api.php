<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = \App\Models\User::where('role', 'project_manager')->first();
$token = $user->createToken('test')->plainTextToken;
echo json_encode(['token' => $token]) . PHP_EOL;

// Fetch projects
$request = \Illuminate\Http\Request::create('/api/projects', 'GET');
$request->headers->set('Authorization', 'Bearer ' . $token);
$request->headers->set('Accept', 'application/json');
$response = app()->handle($request);
echo "Projects API Status: " . $response->getStatusCode() . "\n";
echo "Projects API Content: " . $response->getContent() . "\n\n";

// Fetch tasks
$request = \Illuminate\Http\Request::create('/api/tasks', 'GET');
$request->headers->set('Authorization', 'Bearer ' . $token);
$request->headers->set('Accept', 'application/json');
$response = app()->handle($request);
echo "Tasks API Status: " . $response->getStatusCode() . "\n";
echo "Tasks API Content: " . $response->getContent() . "\n";
