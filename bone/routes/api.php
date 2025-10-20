<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Admin\UserController as AdminUserController;
use App\Http\Controllers\Api\Admin\QuestionController as AdminQuestionController;
use App\Http\Controllers\Api\Admin\ExamController as AdminExamController;
use App\Http\Controllers\Api\Admin\PublishExamController;
use App\Http\Controllers\Api\Admin\ExamSubmissionController as AdminExamSubmissionController;
use App\Http\Controllers\Api\Examiner\ExamSubmissionController as ExaminerExamSubmissionController;
use App\Http\Controllers\Api\Candidate\ModuleProgressController;
use App\Http\Controllers\Api\Candidate\ExamSubmissionController;

// Routes publiques (sans authentification)
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:5,1');

// Activités récentes (publiques ou protégées selon les besoins)
Route::get('/activities/recent', [\App\Http\Controllers\Api\ActivityController::class, 'recent']);

// Bootstrap: permettre la création du tout premier admin sans auth.
// La méthode createAdmin elle-même refusera si un admin existe déjà.
Route::post('/admin/users/create-admin', [AdminUserController::class, 'createAdmin']);

// Routes protégées par JWT (guard api)
// Routes pour les candidats
Route::middleware('auth:api')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::post('/auth/refresh', [AuthController::class, 'refresh']);
    
    // Questions d'examen pour les candidats
    Route::get('/candidate/questions', [\App\Http\Controllers\Api\Candidate\QuestionController::class, 'index']);
    
    // Progression des modules pour les candidats
    Route::prefix('candidate')->group(function () {
        Route::get('/module-progress', [ModuleProgressController::class, 'index']);
        Route::get('/module-progress/{certificationType}/{moduleId}', [ModuleProgressController::class, 'show']);
        Route::post('/module-progress/unlock', [ModuleProgressController::class, 'unlock']);
        Route::post('/module-progress/start', [ModuleProgressController::class, 'start']);
        Route::post('/module-progress/complete', [ModuleProgressController::class, 'complete']);
        
        // Soumission d'examens
        Route::post('/exam-submissions/submit', [ExamSubmissionController::class, 'submit']);
        Route::get('/exam-submissions', [ExamSubmissionController::class, 'index']);
        Route::get('/exam-submissions/{examId}', [ExamSubmissionController::class, 'show']);
        
        // Résultats des examens
        Route::get('/results', [\App\Http\Controllers\Api\Candidate\ResultsController::class, 'index']);
        Route::get('/results/{moduleId}', [\App\Http\Controllers\Api\Candidate\ResultsController::class, 'show']);
    });

    // Administration (protégé par rôle admin)
    Route::prefix('admin')->middleware('role:admin')->group(function () {
        Route::post('/users/create-examiner', [AdminUserController::class, 'createExaminer']);
        Route::get('/users', [AdminUserController::class, 'list']); // ?role=admin|examiner|candidate
        Route::patch('/users/{id}/status', [AdminUserController::class, 'updateStatus']);
        Route::patch('/users/{id}', [AdminUserController::class, 'update']);
        Route::delete('/users/{id}', [AdminUserController::class, 'delete']);

        // Questions d'examen
        Route::get('/questions', [AdminQuestionController::class, 'index']);
        Route::post('/questions', [AdminQuestionController::class, 'store']);
        Route::put('/questions/{id}', [AdminQuestionController::class, 'update']);
        Route::delete('/questions/{id}', [AdminQuestionController::class, 'destroy']);

        // Publication d'examen (certification/module)
        Route::post('/exams/publish', [PublishExamController::class, 'publish']);
        
        // Gestion des soumissions d'examens
        Route::get('/exam-submissions', [AdminExamSubmissionController::class, 'index']);
        Route::get('/exam-submissions/{id}', [AdminExamSubmissionController::class, 'show']);
        Route::post('/exam-submissions/{id}/assign', [AdminExamSubmissionController::class, 'assign']);
        Route::get('/exam-submissions-stats', [AdminExamSubmissionController::class, 'stats']);
        Route::get('/available-examiners', [AdminExamSubmissionController::class, 'availableExaminers']);
    });

    // Routes pour les examinateurs (protégé par rôle examiner)
    Route::prefix('examiner')->middleware('role:examiner')->group(function () {
        Route::get('/exam-submissions', [ExaminerExamSubmissionController::class, 'index']);
        Route::get('/exam-submissions/{id}', [ExaminerExamSubmissionController::class, 'show']);
        Route::put('/exam-submissions/{id}/grade', [ExaminerExamSubmissionController::class, 'grade']);
        Route::get('/exam-submissions-stats', [ExaminerExamSubmissionController::class, 'stats']);
    });
});
