<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->index('project_id');
            $table->index('user_id');
            $table->index('status');
            $table->index('priority');
        });

        Schema::table('projects', function (Blueprint $table) {
            $table->index('user_id');
            $table->index('status');
        });

        Schema::table('invoices', function (Blueprint $table) {
            $table->index('user_id');
            $table->index('project_id');
            $table->index('status');
            $table->index('invoice_date');
        });

        Schema::table('cash_transactions', function (Blueprint $table) {
            $table->index('type');
            $table->index('category');
            $table->index('transaction_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropIndex(['project_id']);
            $table->dropIndex(['user_id']);
            $table->dropIndex(['status']);
            $table->dropIndex(['priority']);
        });

        Schema::table('projects', function (Blueprint $table) {
            $table->dropIndex(['user_id']);
            $table->dropIndex(['status']);
        });

        Schema::table('invoices', function (Blueprint $table) {
            $table->dropIndex(['user_id']);
            $table->dropIndex(['project_id']);
            $table->dropIndex(['status']);
            $table->dropIndex(['invoice_date']);
        });

        Schema::table('cash_transactions', function (Blueprint $table) {
            $table->dropIndex(['type']);
            $table->dropIndex(['category']);
            $table->dropIndex(['transaction_date']);
        });
    }
};
