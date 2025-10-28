<?php

namespace App\Http\Controllers\Api\Payment;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class CamPayController extends Controller
{
    public function initiate(Request $request)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:1',
            'currency' => 'required|string|size:3',
            'description' => 'required|string|max:255',
        ]);

        $cfg = config('services.campay');
        $external = md5(uniqid());
        $payload = [
            'amount' => (string) (int) $validated['amount'],
            'currency' => strtoupper($validated['currency']),
            'description' => $validated['description'],
            'external_reference' => $external,
            'redirect_url' => $cfg['redirect_url'],
            'failure_redirect_url' => $cfg['failure_url'],
        ];

        $endpoint = rtrim($cfg['base_url'], '/') . '/get_payment_link/';
        $resp = Http::withHeaders([
            'Authorization' => 'Token ' . $cfg['token'],
            'Content-Type' => 'application/json',
        ])->post($endpoint, $payload);

        if (!$resp->ok()) {
            return response()->json(['error' => ['message' => 'CamPay error', 'details' => $resp->json()]], 502);
        }
        $data = $resp->json();
        $link = $data['link'] ?? null;
        if (!$link) {
            return response()->json(['error' => ['message' => 'Lien de paiement introuvable']], 502);
        }
        return response()->json(['redirectUrl' => $link, 'reference' => $external]);
    }

    public function redirect(Request $request)
    {
        $reference = $request->query('reference');
        if (!$reference) {
            return redirect('/');
        }
        $cfg = config('services.campay');
        $checkUrl = rtrim($cfg['base_url'], '/') . '/transaction/' . $reference . '/';
        $resp = Http::withHeaders([
            'Authorization' => 'Token ' . $cfg['token'],
            'Content-Type' => 'application/json',
        ])->get($checkUrl);
        if (!$resp->ok()) {
            return redirect('/');
        }
        $data = $resp->json();
        // TODO: mettre à jour la table payments/paiements ici
        if (($data['status'] ?? null) === 'SUCCESSFUL') {
            return redirect('/succes');
        }
        return redirect('/');
    }
}



