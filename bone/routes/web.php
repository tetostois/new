<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CertificatePublicController;
use App\Http\Controllers\Api\Payment\CamPayController;
use App\Http\Controllers\Api\EmailVerificationController;

Route::get('/', function () {
    return view('welcome');
});

// Vérification publique de certificat (pour QR)
Route::get('/certificates/verify', [CertificatePublicController::class, 'verify'])->name('certificates.verify');

// CamPay redirect endpoints
Route::get('/mobile/campay/redirect', [CamPayController::class, 'redirect'])->name('campay.redirect');

// Vérification d'email via lien signé
Route::get('/email/verify/{id}/{hash}', [EmailVerificationController::class, 'verify'])
    ->middleware(['signed', 'throttle:6,1'])
    ->name('verification.verify');

// Page de test du formulaire de paiement
Route::get('/payment', function () {
    return view('payment.form');
});
