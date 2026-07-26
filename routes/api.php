<?php

use App\Http\Controllers\AbsenceController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ClasseController;
use App\Http\Controllers\EleveController;
use App\Http\Controllers\MatiereController;
use App\Http\Controllers\NoteController;
use App\Http\Controllers\RemarqueController;
use App\Http\Controllers\RetardController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/health', function () {
    return response()->json(['status' => 'ok']);
});

Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:6,1');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/users', [UserController::class, 'store']);
    Route::apiResource('matieres', MatiereController::class);

    Route::patch('/classes/{classe}/professeur-principal', [ClasseController::class, 'assignProfesseurPrincipal']);
    Route::post('/classes/{classe}/enseignants', [ClasseController::class, 'assignEnseignant']);
    Route::apiResource('classes', ClasseController::class)->parameters(['classes' => 'classe']);

    Route::apiResource('eleves', EleveController::class)->parameters(['eleves' => 'eleve']);

    Route::apiResource('notes', NoteController::class)->parameters(['notes' => 'note']);
    Route::apiResource('absences', AbsenceController::class)->parameters(['absences' => 'absence']);
    Route::apiResource('retards', RetardController::class)->parameters(['retards' => 'retard']);
    Route::apiResource('remarques', RemarqueController::class)->parameters(['remarques' => 'remarque']);
});
