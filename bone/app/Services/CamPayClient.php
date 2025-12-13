<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\Client\Response;

class CamPayClient
{
    private string $baseUrl;

    public function __construct()
    {
        $this->baseUrl = rtrim(config('services.campay.base_url', 'https://demo.campay.net/api'), '/');
    }

    public function getPaymentLink(array $payload): array
    {
        $endpoint = $this->baseUrl . '/get_payment_link/';
        $response = $this->http()->post($endpoint, $payload);
        $this->throwIfFailed($response, 'Payment link generation failed');
        return $response->json();
    }

    public function collect(array $payload): array
    {
        $endpoint = $this->baseUrl . '/collect/';
        $response = $this->http()->asForm()->post($endpoint, $payload);
        $this->throwIfFailed($response, 'Collection request failed');
        return $response->json();
    }

    public function withdraw(array $payload): array
    {
        $endpoint = $this->baseUrl . '/withdraw/';
        $response = $this->http()->asForm()->post($endpoint, $payload);
        $this->throwIfFailed($response, 'Withdraw request failed');
        return $response->json();
    }

    public function status(string $reference): array
    {
        $endpoint = $this->baseUrl . '/transaction/' . urlencode($reference) . '/';
        $response = $this->http()->get($endpoint);
        $this->throwIfFailed($response, 'Status request failed');
        return $response->json();
    }

    public function balance(): array
    {
        $endpoint = $this->baseUrl . '/balance/';
        $response = $this->http()->get($endpoint);
        $this->throwIfFailed($response, 'Balance request failed');
        return $response->json();
    }

    public function history(?string $start = null, ?string $end = null): array
    {
        $endpoint = $this->baseUrl . '/history/';
        $params = [
            'start_date' => $start ? date('Y-m-d', strtotime($start)) : now()->subWeek()->format('Y-m-d'),
            'end_date' => $end ? date('Y-m-d', strtotime($end)) : now()->format('Y-m-d'),
        ];
        $response = $this->http()->asForm()->post($endpoint, $params);
        $this->throwIfFailed($response, 'History request failed');
        return $response->json();
    }

    private function http()
    {
        return Http::withHeaders([
            'Authorization' => 'Token ' . $this->getToken(),
        ])->acceptJson();
    }

    private function getToken(): string
    {
        $configuredToken = config('services.campay.token');
        if ($configuredToken) {
            return $configuredToken;
        }
        return Cache::remember('campay_token', now()->addMinutes(50), function () {
            $username = env('CAMPAY_USERNAME');
            $password = env('CAMPAY_PASSWORD');
            if (!$username || !$password) {
                throw new \RuntimeException('CAMPAY_USERNAME and CAMPAY_PASSWORD must be set');
            }
            $endpoint = $this->baseUrl . '/token/';
            $resp = Http::asForm()->post($endpoint, [
                'username' => $username,
                'password' => $password,
            ]);
            if (!$resp->ok()) {
                throw new \RuntimeException('Failed to fetch CamPay token');
            }
            $token = $resp->json('token');
            if (!$token) {
                throw new \RuntimeException('Invalid CamPay token response');
            }
            return $token;
        });
    }

    private function throwIfFailed(Response $response, string $message): void
    {
        if ($response->ok()) {
            return;
        }
        $details = $response->json() ?: ['status' => $response->status(), 'body' => $response->body()];
        throw new \RuntimeException($message . ': ' . json_encode($details));
    }
}






