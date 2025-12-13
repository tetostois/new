<?php

namespace App\Http\Controllers\Api\Payment;

use App\Http\Controllers\Controller;
use App\Services\CamPayClient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CamPayController extends Controller
{
    public function initiate(Request $request, CamPayClient $client)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:1',
            'currency' => 'required|string|size:3',
            'description' => 'required|string|max:255',
        ]);

        $external = md5(uniqid());
        $payload = [
            'amount' => (string) (int) $validated['amount'],
            'currency' => strtoupper($validated['currency']),
            'description' => $validated['description'],
            'external_reference' => $external,
            // Utiliser les URLs fournies par le frontend si présentes
            'redirect_url' => $request->input('redirect', config('services.campay.redirect_url')),
            'failure_redirect_url' => $request->input('failure_redirect', config('services.campay.failure_url')),
        ];

        $data = $client->getPaymentLink($payload);

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
            'Authorization' => 'Token ' . ($cfg['token'] ?? ''),
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

    public function webhook(Request $request)
    {
        $payload = $request->all();
        Log::info('CamPay webhook received', $payload);
        // TODO: mettre à jour vos enregistrements de paiement ici en fonction du payload
        return response()->json(['received' => true]);
    }

    public function collect(Request $request, CamPayClient $client)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:1',
            'currency' => 'required|string|size:3',
            'from' => 'required|string|min:6|max:20',
            'description' => 'required|string|max:255',
        ]);
        $data = $client->collect([
            'amount' => (string) (int) $validated['amount'],
            'currency' => strtoupper($validated['currency']),
            'from' => $validated['from'],
            'description' => $validated['description'],
        ]);
        return response()->json($data);
    }

    public function withdraw(Request $request, CamPayClient $client)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:1',
            'currency' => 'required|string|size:3',
            'to' => 'required|string|min:6|max:20',
            'description' => 'required|string|max:255',
        ]);
        $data = $client->withdraw([
            'amount' => (string) (int) $validated['amount'],
            'currency' => strtoupper($validated['currency']),
            'to' => $validated['to'],
            'description' => $validated['description'],
        ]);
        return response()->json($data);
    }

    public function status(string $reference, CamPayClient $client)
    {
        $data = $client->status($reference);
        return response()->json($data);
    }

    public function balance(CamPayClient $client)
    {
        $data = $client->balance();
        return response()->json($data);
    }

    public function history(Request $request, CamPayClient $client)
    {
        $validated = $request->validate([
            'start' => 'nullable|date',
            'end' => 'nullable|date',
        ]);
        $data = $client->history($validated['start'] ?? null, $validated['end'] ?? null);
        return response()->json($data);
    }
}



