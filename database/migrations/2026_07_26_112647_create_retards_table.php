<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('retards', function (Blueprint $table) {
            $table->id('id_retard');
            $table->date('date_retard');
            $table->boolean('justifiee')->default(false);
            $table->unsignedInteger('minutes_retard');
            $table->string('motif')->nullable();

            $table->foreignId('id_eleve')
                ->constrained('eleves', 'id_eleve')
                ->cascadeOnDelete();

            $table->foreignId('id_utilisateur')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('retards');
    }
};
