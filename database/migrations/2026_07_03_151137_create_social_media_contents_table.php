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
        Schema::create('social_media_contents', function (Blueprint $table) {
            $table->id();
            $table->string('hari')->nullable();
            $table->string('format')->nullable();
            $table->string('konsep')->nullable();
            $table->string('funnel_layer')->nullable();
            $table->text('deskripsi_ide')->nullable();
            $table->text('storyboard')->nullable();
            $table->text('caption')->nullable();
            $table->string('progres')->default('To Do');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('social_media_contents');
    }
};
