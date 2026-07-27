<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id('id_notification');
            $table->string('titre');
            $table->text('message');
            $table->enum('statut_envoi', ['envoye', 'echec', 'en_attente'])->default('en_attente');
            $table->timestamp('envoye_le')->nullable();
            $table->boolean('lu')->default(false);

            $table->foreignId('id_utilisateur_destinataire')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->foreignId('id_synthese')
                ->nullable()
                ->constrained('syntheses_ia', 'id_synthese')
                ->nullOnDelete();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
