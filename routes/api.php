<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\InvoiceController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\CashFlowController;
use App\Http\Controllers\Api\CRM\ScrapingController;
use App\Http\Controllers\Api\CRM\LeadController;
use App\Http\Controllers\Api\CRM\DashboardCRMController;
use App\Http\Controllers\Api\SocialMediaContentController;
use App\Http\Controllers\Api\PayrollController;

use App\Http\Controllers\Api\TeamInvitationController;
use App\Http\Controllers\Api\MessageController;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// Team Invitation Public Routes
Route::get('/invitations/{token}', [TeamInvitationController::class, 'verify']);
Route::post('/invitations/accept', [TeamInvitationController::class, 'accept']);

/*
|--------------------------------------------------------------------------
| Protected Routes (Sanctum)
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::post('/users/invite', [TeamInvitationController::class, 'invite']);

    Route::apiResource('tasks', TaskController::class);
    Route::apiResource('projects', ProjectController::class);
    Route::get('/users', [UserController::class, 'index']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);
    Route::put('/users/profile', [UserController::class, 'updateProfile']);
    Route::put('/users/password', [UserController::class, 'changePassword']);

    // ===================================
    // Social Media Content Routes
    // ===================================
    Route::apiResource('sosmed', SocialMediaContentController::class);

    // ===================================
    // Payroll (GardaScore™) Module
    // ===================================
    Route::get('/payroll/summary', [PayrollController::class, 'summary']);

    // ===================================
    // Finance Module Routes
    // ===================================
    
    // Invoices
    Route::apiResource('invoices', InvoiceController::class);
    Route::get('/invoices/statistics', [InvoiceController::class, 'statistics']);
    Route::post('/invoices/{invoice}/duplicate', [InvoiceController::class, 'duplicate']);
    Route::get('/invoices/{invoice}/{format}/download', [InvoiceController::class, 'download']);

    // Payments
    Route::get('/invoices/{invoice}/payments', [PaymentController::class, 'indexByInvoice']);
    Route::post('/invoices/{invoice}/payments', [PaymentController::class, 'store']);
    Route::get('/payments/{payment}', [PaymentController::class, 'show']);
    Route::put('/payments/{payment}', [PaymentController::class, 'update']);
    Route::delete('/payments/{payment}', [PaymentController::class, 'destroy']);

    // Cash Flow
    Route::get('/cashflow', [CashFlowController::class, 'index']);
    Route::post('/cashflow', [CashFlowController::class, 'store']);
    Route::get('/cashflow/summary', [CashFlowController::class, 'summary']);
    Route::get('/cashflow/trend', [CashFlowController::class, 'trend']);
    Route::get('/cashflow/export', [CashFlowController::class, 'export']);
    Route::get('/cashflow/{transaction}', [CashFlowController::class, 'show']);
    Route::put('/cashflow/{transaction}', [CashFlowController::class, 'update']);
    Route::delete('/cashflow/{transaction}', [CashFlowController::class, 'destroy']);

    // ===================================
    // Marketing CRM Module Routes
    // ===================================
    Route::post('/crm/scrape/import', [ScrapingController::class, 'import']);
    Route::get('/crm/scrape/history', [ScrapingController::class, 'history']);

    Route::get('/crm/leads', [LeadController::class, 'index']);
    Route::post('/crm/leads', [LeadController::class, 'store']);
    Route::get('/crm/leads/{id}', [LeadController::class, 'show']);
    Route::patch('/crm/leads/{id}/status', [LeadController::class, 'updateStatus']);
    Route::post('/crm/leads/{id}/activity', [LeadController::class, 'logActivity']);
    Route::get('/crm/leads/{id}/activities', [LeadController::class, 'getActivities']);

    Route::get('/crm/dashboard/marketing', [DashboardCRMController::class, 'marketing']);
    Route::get('/crm/dashboard/dirut', [DashboardCRMController::class, 'dirut']);

    // ===================================
    // Global Chat Room
    // ===================================
    Route::get('/messages', [MessageController::class, 'index']);
    Route::get('/messages/since/{lastId}', [MessageController::class, 'since']);
    Route::post('/messages', [MessageController::class, 'store']);

});