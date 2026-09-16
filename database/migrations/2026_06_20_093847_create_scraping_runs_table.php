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
        Schema::create('scraping_runs', function (Blueprint $table) {
            $table->id();
            $table->string('keyword');
            $table->string('source');
            $table->integer('limit_data');
            $table->integer('results_count')->default(0);
            $table->timestamp('run_date');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('scraping_runs');
    }
};
