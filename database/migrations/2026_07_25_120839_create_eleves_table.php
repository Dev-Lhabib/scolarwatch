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
        Schema::create('eleves', function (Blueprint $table) {
            $table->id('id_eleve');
            $table->string('nom');
            $table->string('prenom');
            $table->string('genre');
            $table->date('date_naissance');
            $table->string('code_massar')->nullable();
            $table->string('photo')->nullable();

            $table->foreignId('id_classe')
                ->constrained('classes', 'id_classe')
                ->restrictOnDelete();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('eleves');
    }
};
