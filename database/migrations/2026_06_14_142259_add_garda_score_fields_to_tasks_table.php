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
            $table->string('task_type')->nullable();
            $table->integer('estimated_hours')->nullable();
            $table->unsignedBigInteger('reviewer_id')->nullable();
            $table->string('quality_rating')->nullable();
            $table->integer('points_awarded')->nullable();
            $table->timestamp('completed_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropColumn(['task_type', 'estimated_hours', 'reviewer_id', 'quality_rating', 'points_awarded', 'completed_at']);
        });
    }
};
