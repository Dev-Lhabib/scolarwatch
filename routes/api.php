<?php

use App\Http\Controllers\AbsenceController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ClasseController;
use App\Http\Controllers\EleveController;
use App\Http\Controllers\MatiereController;
use App\Http\Controllers\NoteController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ParentController;
use App\Http\Controllers\RemarqueController;
use App\Http\Controllers\RetardController;
use App\Http\Controllers\SyntheseIAController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Route;

/**
 * L'utilisateur actuellement authentifié via le jeton Sanctum.
 *
 * @group Authentication
 *
 * @response {
 *  "id": 1,
 *  "nom": "Admin",
 *  "prenom": "ScolarWatch",
 *  "username": "admin",
 *  "telephone": null,
 *  "adresse": null,
 *  "role": "admin",
 *  "is_active": true,
 *  "id_matiere": null,
 *  "email": "admin@scolarwatch.test",
 *  "created_at": "2025-09-01T09:00:00.000000Z",
 *  "updated_at": "2025-09-01T09:00:00.000000Z",
 *  "is_bootstrap_admin": true
 * }
 */
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

/**
 * État de santé de l'application (base de données et Redis).
 *
 * @group Health
 *
 * @unauthenticated
 *
 * @response scenario="Tout est opérationnel" {
 *  "status": "ok",
 *  "checks": {
 *      "database": "ok",
 *      "redis": "ok"
 *  }
 * }
 * @response status=503 scenario="Au moins un service indisponible" {
 *  "status": "degraded",
 *  "checks": {
 *      "database": "unreachable",
 *      "redis": "ok"
 *  }
 * }
 */
Route::get('/health', function () {
    $checks = [];

    try {
        DB::connection()->getPdo();
        $checks['database'] = 'ok';
    } catch (Throwable) {
        $checks['database'] = 'unreachable';
    }

    try {
        Redis::connection()->ping();
        $checks['redis'] = 'ok';
    } catch (Throwable) {
        $checks['redis'] = 'unreachable';
    }

    $healthy = collect($checks)->every(fn (string $status) => $status === 'ok');

    return response()->json([
        'status' => $healthy ? 'ok' : 'degraded',
        'checks' => $checks,
    ], $healthy ? 200 : 503);
});

Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:6,1');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/users/archives', [UserController::class, 'archived']);
    Route::patch('/users/{user}/restore', [UserController::class, 'restore'])->withTrashed();
    Route::delete('/users/{user}/force', [UserController::class, 'forceDelete'])->withTrashed();
    Route::post('/users/bulk-archive', [UserController::class, 'bulkArchive']);
    Route::post('/users/bulk-restore', [UserController::class, 'bulkRestore']);
    Route::post('/users/bulk-force-delete', [UserController::class, 'bulkForceDelete']);
    Route::apiResource('users', UserController::class)->except(['store']);
    Route::post('/users', [UserController::class, 'store']);
    Route::apiResource('matieres', MatiereController::class);

    Route::get('/classes/archives', [ClasseController::class, 'archived']);
    Route::patch('/classes/{classe}/restore', [ClasseController::class, 'restore'])->withTrashed();
    Route::delete('/classes/{classe}/force', [ClasseController::class, 'forceDelete'])->withTrashed();
    Route::post('/classes/bulk-archive', [ClasseController::class, 'bulkArchive']);
    Route::post('/classes/bulk-restore', [ClasseController::class, 'bulkRestore']);
    Route::post('/classes/bulk-force-delete', [ClasseController::class, 'bulkForceDelete']);
    Route::patch('/classes/{classe}/professeur-principal', [ClasseController::class, 'assignProfesseurPrincipal']);
    Route::post('/classes/{classe}/enseignants', [ClasseController::class, 'assignEnseignant']);
    Route::apiResource('classes', ClasseController::class)->parameters(['classes' => 'classe']);

    Route::get('/eleves/archives', [EleveController::class, 'archived']);
    Route::patch('/eleves/{eleve}/restore', [EleveController::class, 'restore'])->withTrashed();
    Route::delete('/eleves/{eleve}/force', [EleveController::class, 'forceDelete'])->withTrashed();
    Route::post('/eleves/bulk-archive', [EleveController::class, 'bulkArchive']);
    Route::post('/eleves/bulk-restore', [EleveController::class, 'bulkRestore']);
    Route::post('/eleves/bulk-force-delete', [EleveController::class, 'bulkForceDelete']);
    Route::post('/eleves/bulk-assign-class', [EleveController::class, 'bulkAssignClass']);
    Route::apiResource('eleves', EleveController::class)->parameters(['eleves' => 'eleve']);
    Route::post('/eleves/{eleve}/synthese', [SyntheseIAController::class, 'store']);
    Route::get('/eleves/{eleve}/synthese', [SyntheseIAController::class, 'show']);

    Route::patch('/syntheses/{synthese}/niveau-alerte', [SyntheseIAController::class, 'corrigerNiveauAlerte']);
    Route::post('/syntheses/{synthese}/envoyer', [SyntheseIAController::class, 'envoyer']);

    Route::apiResource('notes', NoteController::class)->parameters(['notes' => 'note']);
    Route::apiResource('absences', AbsenceController::class)->parameters(['absences' => 'absence']);
    Route::apiResource('retards', RetardController::class)->parameters(['retards' => 'retard']);
    Route::apiResource('remarques', RemarqueController::class)->parameters(['remarques' => 'remarque']);
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::patch('/notifications/{notification}/lue', [NotificationController::class, 'marquerCommeLue']);
    Route::get('/parent/children', [ParentController::class, 'children']);
    Route::get('/parent/notes', [ParentController::class, 'notes']);
    Route::get('/parent/absences', [ParentController::class, 'absences']);
    Route::get('/parent/retards', [ParentController::class, 'retards']);
    Route::get('/parent/remarques', [ParentController::class, 'remarques']);
});
