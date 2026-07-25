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
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('name');

            $table->string('nom')->after('id');
            $table->string('prenom')->after('nom');
            $table->string('username')->unique()->after('prenom');
            $table->string('telephone')->nullable()->after('username');
            $table->string('adresse')->nullable()->after('telephone');
            $table->enum('role', ['admin', 'enseignant', 'direction', 'parent'])->after('adresse');
            $table->boolean('is_active')->default(true)->after('role');

            $table->foreignId('id_matiere')
                ->nullable()
                ->after('is_active')
                ->constrained('matieres', 'id_matiere')
                ->nullOnDelete();

            $table->foreignId('cree_par')
                ->nullable()
                ->after('id_matiere')
                ->constrained('users')
                ->nullOnDelete();

            $table->foreignId('updated_by')
                ->nullable()
                ->after('cree_par')
                ->constrained('users')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('updated_by');
            $table->dropConstrainedForeignId('cree_par');
            $table->dropConstrainedForeignId('id_matiere');

            $table->dropColumn([
                'nom',
                'prenom',
                'username',
                'telephone',
                'adresse',
                'role',
                'is_active',
            ]);

            $table->string('name')->after('id');
        });
    }
};
