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

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

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
    Route::apiResource('users', UserController::class)->except(['store']);
    Route::post('/users', [UserController::class, 'store']);
    Route::apiResource('matieres', MatiereController::class);

    Route::patch('/classes/{classe}/professeur-principal', [ClasseController::class, 'assignProfesseurPrincipal']);
    Route::post('/classes/{classe}/enseignants', [ClasseController::class, 'assignEnseignant']);
    Route::apiResource('classes', ClasseController::class)->parameters(['classes' => 'classe']);

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
