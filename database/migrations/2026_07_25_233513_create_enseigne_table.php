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
        Schema::create('enseigne', function (Blueprint $table) {
            $table->id('id_enseigne');

            $table->foreignId('id_utilisateur')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->foreignId('id_classe')
                ->constrained('classes', 'id_classe')
                ->cascadeOnDelete();

            $table->timestamps();

            $table->unique(['id_utilisateur', 'id_classe']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('enseigne');
    }
};
