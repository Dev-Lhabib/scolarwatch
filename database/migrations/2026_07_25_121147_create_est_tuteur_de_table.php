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
        Schema::create('est_tuteur_de', function (Blueprint $table) {
            $table->id('id_tuteur');

            $table->foreignId('id_utilisateur')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->foreignId('id_eleve')
                ->constrained('eleves', 'id_eleve')
                ->cascadeOnDelete();

            $table->timestamps();

            $table->unique(['id_utilisateur', 'id_eleve']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('est_tuteur_de');
    }
};
