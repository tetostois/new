<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\AppSetting;

class SettingsController extends Controller
{
    public function index()
    {
        $this->ensureAdmin();
        $days = (int) (AppSetting::get('exam_window_days', 3));
        return response()->json([
            'success' => true,
            'settings' => [
                'exam_window_days' => $days,
            ],
        ]);
    }

    public function update(Request $request)
    {
        $this->ensureAdmin();
        $validated = $request->validate([
            'exam_window_days' => 'required|integer|min:1|max:60',
        ]);
        AppSetting::set('exam_window_days', (int) $validated['exam_window_days']);
        return response()->json([
            'success' => true,
            'message' => 'Paramètres mis à jour',
            'settings' => [
                'exam_window_days' => (int) $validated['exam_window_days'],
            ],
        ]);
    }

    /**
     * Liste des prix par certification (clé: slug backend).
     */
    public function certificationPrices()
    {
        $this->ensureAdmin();
        $map = AppSetting::get('certification_prices', []);
        if (!is_array($map)) $map = [];
        return response()->json([
            'success' => true,
            'prices' => $map,
        ]);
    }

    /**
     * Mettre à jour les prix par certification.
     * Payload: { prices: { "<slug>": { "price": int, "price_per_module": int|null } } }
     */
    public function updateCertificationPrices(Request $request)
    {
        $this->ensureAdmin();
        $data = $request->validate([
            'prices' => 'required|array',
        ]);
        $incoming = $data['prices'];
        $clean = [];
        foreach ($incoming as $slug => $entry) {
            if (!is_array($entry)) continue;
            $price = isset($entry['price']) ? (int) $entry['price'] : null;
            $ppm = array_key_exists('price_per_module', $entry) ? (int) $entry['price_per_module'] : null;
            if ($price !== null && $price < 0) $price = 0;
            if ($ppm !== null && $ppm < 0) $ppm = 0;
            $clean[$slug] = [
                'price' => $price,
                'price_per_module' => $ppm,
            ];
        }
        AppSetting::set('certification_prices', $clean);
        return response()->json([
            'success' => true,
            'prices' => $clean,
        ]);
    }

    private function ensureAdmin(): void
    {
        $user = auth('api')->user();
        if (!$user || $user->role !== \App\Models\User::ROLE_ADMIN) {
            abort(403, 'Accès interdit (admin requis)');
        }
    }
}


