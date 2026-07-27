<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('syntheses_ia', function (Blueprint $table) {
            $table->id('id_synthese');
            $table->string('trimestre');
            $table->enum('statut', ['en_attente', 'traite', 'echoue'])->default('en_attente');
            $table->enum('niveau_alerte', ['faible', 'moyen', 'eleve'])->nullable();
            $table->enum('niveau_alerte_corrige', ['faible', 'moyen', 'eleve'])->nullable();
            $table->json('facteurs_risque')->nullable();
            $table->json('signaux_textuels')->nullable();
            $table->json('recommandations')->nullable();
            $table->text('message_parent')->nullable();
            $table->timestamp('genere_le')->nullable();

            $table->foreignId('id_eleve')
                ->constrained('eleves', 'id_eleve')
                ->cascadeOnDelete();

            $table->foreignId('id_utilisateur_demandeur')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('syntheses_ia');
    }
};
