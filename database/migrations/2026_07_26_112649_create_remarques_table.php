<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('remarques', function (Blueprint $table) {
            $table->id('id_remarque');
            $table->text('contenu');
            $table->string('categorie')->nullable();
            $table->string('trimestre');
            $table->date('date_remarque');

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
        Schema::dropIfExists('remarques');
    }
};
