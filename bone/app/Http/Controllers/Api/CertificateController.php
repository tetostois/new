<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;
use App\Models\ExamSubmission;
use App\Models\ExamQuestion;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class CertificateController extends Controller
{
    public function index(Request $request)
    {
        // Lister les fichiers PDF générés dans storage/app/public/certificates
        $files = Storage::disk('public')->files('certificates');
        $items = collect($files)->filter(fn($f) => str_ends_with(strtolower($f), '.pdf'))
            ->map(function ($f) {
                $filename = basename($f);
                // convention: candidateId-certType-YYYYmmddHHMMSS.pdf
                $parts = explode('-', pathinfo($filename, PATHINFO_FILENAME));
                $candidateId = $parts[0] ?? '';
                $certType = $parts[1] ?? '';
                $candidate = User::find($candidateId);
                $candidateName = '';
                if ($candidate) {
                    $first = $candidate->first_name ?? '';
                    $last = $candidate->last_name ?? '';
                    $candidateName = trim($first . ' ' . $last);
                }

                // Calcul de la moyenne /20 pour ce candidat et cette certification
                $expectedModules = ExamQuestion::where('certification_type', $certType)
                    ->distinct()->pluck('module')->toArray();
                $avgOutOf20 = null;
                if (!empty($expectedModules) && $candidateId !== '') {
                    $gradedSubs = ExamSubmission::where('candidate_id', $candidateId)
                        ->where('status', 'graded')
                        ->where('exam_id', 'like', 'exam-' . $certType . '-%')
                        ->orderByDesc('graded_at')
                        ->get();
                    $byModule = [];
                    foreach ($gradedSubs as $gs) {
                        if (preg_match('/^exam-(.*?)-(.*?)$/', $gs->exam_id, $mm)) {
                            $mod = $mm[2] ?? null;
                            if ($mod && !isset($byModule[$mod])) { $byModule[$mod] = $gs; }
                        }
                    }
                    $totalScoreAll = 0; $totalMaxAll = 0;
                    foreach ($expectedModules as $mod) {
                        if (!isset($byModule[$mod])) { continue; }
                        $subm = $byModule[$mod];
                        $totalScoreAll += (int) ($subm->total_score ?? 0);
                        $modMax = (int) ExamQuestion::where('certification_type', $certType)
                            ->where('module', $mod)->sum('points');
                        $totalMaxAll += $modMax;
                    }
                    if ($totalMaxAll > 0) {
                        $avgOutOf20 = ($totalScoreAll / $totalMaxAll) * 20;
                    }
                }
                $publicUrl = Storage::disk('public')->url($f);
                if (!str_starts_with($publicUrl, 'http')) {
                    $publicUrl = url($publicUrl);
                }
                return [
                    'filename' => $filename,
                    'path' => $f,
                    'candidate_id' => $candidateId,
                    'candidate_name' => $candidateName,
                    'certification_type' => $certType,
                    'average_out_of_20' => $avgOutOf20,
                    'url' => $publicUrl,
                ];
            })->values();

        return response()->json([
            'success' => true,
            'certificates' => $items,
        ]);
    }

    public function rebuild(Request $request)
    {
        $certTypeFilter = $request->query('certType');
        $pairs = ExamSubmission::where('status', 'graded')
            ->when($certTypeFilter, function ($q) use ($certTypeFilter) {
                $q->where('exam_id', 'like', 'exam-' . $certTypeFilter . '-%');
            })
            ->get()
            ->map(function ($s) {
                if (preg_match('/^exam-(.*?)-(.*?)$/', $s->exam_id, $m)) {
                    return [ 'candidate_id' => $s->candidate_id, 'cert_type' => $m[1] ?? null ];
                }
                return null;
            })
            ->filter(fn($x) => $x && $x['cert_type'])
            ->unique()
            ->values();

        $generated = [];
        foreach ($pairs as $pair) {
            $candidateId = $pair['candidate_id'];
            $certType = $pair['cert_type'];

            $expectedModules = ExamQuestion::where('certification_type', $certType)
                ->distinct()->pluck('module')->toArray();
            if (empty($expectedModules)) continue;

            $gradedSubs = ExamSubmission::where('candidate_id', $candidateId)
                ->where('status', 'graded')
                ->where('exam_id', 'like', 'exam-' . $certType . '-%')
                ->orderByDesc('graded_at')
                ->get();

            $byModule = [];
            foreach ($gradedSubs as $gs) {
                if (preg_match('/^exam-(.*?)-(.*?)$/', $gs->exam_id, $mm)) {
                    $mod = $mm[2] ?? null;
                    if ($mod && !isset($byModule[$mod])) { $byModule[$mod] = $gs; }
                }
            }
            $hasAll = count(array_intersect($expectedModules, array_keys($byModule))) === count($expectedModules);
            if (!$hasAll) continue;

            $totalScoreAll = 0; $totalMaxAll = 0;
            foreach ($expectedModules as $mod) {
                $subm = $byModule[$mod];
                $totalScoreAll += (int) ($subm->total_score ?? 0);
                $modMax = (int) ExamQuestion::where('certification_type', $certType)
                    ->where('module', $mod)->sum('points');
                $totalMaxAll += $modMax;
            }
            $avgOutOf20 = $totalMaxAll > 0 ? ($totalScoreAll / $totalMaxAll) * 20 : 0;
            if ($avgOutOf20 < 10) continue;

            $existing = collect(Storage::disk('public')->files('certificates'))
                ->first(function ($f) use ($candidateId, $certType) {
                    return str_starts_with(basename($f), $candidateId . '-' . $certType . '-');
                });
            if ($existing) continue;

            $candidate = User::find($candidateId);
            $data = [
                'name' => trim(($candidate->first_name ?? '') . ' ' . ($candidate->last_name ?? '')),
                'certification' => $certType,
                'date' => now()->format('d/m/Y'),
                'id_number' => 'ID-' . strtoupper($certType) . '-' . $candidateId,
            ];
            $pdf = Pdf::loadView('certificates.certificate', $data);
            $path = 'certificates/' . $candidateId . '-' . $certType . '-' . now()->format('YmdHis') . '.pdf';
            Storage::disk('public')->put($path, $pdf->output());
            $generated[] = $path;
        }

        return response()->json([
            'success' => true,
            'generated' => $generated,
        ]);
    }

    public function download(Request $request, string $candidateId, string $certType)
    {
        $data = [
            'name' => $request->query('name', 'Candidat'),
            'certification' => $certType,
            'date' => now()->format('d/m/Y'),
            'id_number' => 'ID-' . strtoupper($certType) . '-' . $candidateId,
        ];

        $pdf = Pdf::loadView('certificates.certificate', $data);
        return $pdf->download("certificate-{$candidateId}-{$certType}.pdf");
    }

    /**
     * Téléchargement pour le candidat connecté, uniquement son propre certificat.
     */
    public function downloadForCandidate(Request $request, string $certType)
    {
        $auth = $request->user();
        if (!$auth) {
            return response()->json(['success' => false, 'message' => 'Non authentifié.'], 401);
        }
        $candidateId = (string) $auth->id;
        // Chercher le fichier correspondant
        $path = collect(Storage::disk('public')->files('certificates'))
            ->first(function ($f) use ($candidateId, $certType) {
                return str_starts_with(basename($f), $candidateId . '-' . $certType . '-');
            });
        if (!$path || !Storage::disk('public')->exists($path)) {
            return response()->json(['success' => false, 'message' => 'Certificat introuvable'], 404);
        }
        $content = Storage::disk('public')->get($path);
        $filename = 'certificate-' . $candidateId . '-' . $certType . '.pdf';
        return response($content, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"'
        ]);
    }

    /**
     * Marquer un certificat comme "envoyé" au candidat (et le générer s'il n'existe pas).
     */
    public function send(Request $request)
    {
        $request->validate([
            'candidate_id' => 'required',
            'cert_type' => 'required|string',
            'name' => 'nullable|string',
        ]);

        $candidateId = (string) $request->input('candidate_id');
        $certType = (string) $request->input('cert_type');
        $name = (string) ($request->input('name') ?? '');

        // Rechercher un PDF existant
        $existing = collect(Storage::disk('public')->files('certificates'))
            ->first(function ($f) use ($candidateId, $certType) {
                return str_starts_with(basename($f), $candidateId . '-' . $certType . '-');
            });

        // Générer si absent
        if (!$existing) {
            $user = User::find($candidateId);
            $displayName = $name ?: trim(($user->first_name ?? '') . ' ' . ($user->last_name ?? ''));
            $data = [
                'name' => $displayName ?: 'Candidat',
                'certification' => $certType,
                'date' => now()->format('d/m/Y'),
                'id_number' => 'ID-' . strtoupper($certType) . '-' . $candidateId,
            ];
            $pdf = Pdf::loadView('certificates.certificate', $data);
            $path = 'certificates/' . $candidateId . '-' . $certType . '-' . now()->format('YmdHis') . '.pdf';
            Storage::disk('public')->put($path, $pdf->output());
            $existing = $path;
        }

        $publicUrl = Storage::disk('public')->url($existing);
        if (!str_starts_with($publicUrl, 'http')) {
            $publicUrl = url($publicUrl);
        }

        // Écrire un marqueur d'envoi accessible au candidat
        $user = User::find($candidateId);
        $displayName = $name ?: trim(($user->first_name ?? '') . ' ' . ($user->last_name ?? ''));
        $meta = [
            'candidate_id' => $candidateId,
            'candidate_name' => $displayName ?: 'Candidat',
            'certification_type' => $certType,
            'path' => $existing,
            'url' => $publicUrl,
            'sent_at' => now()->toIso8601String(),
        ];
        $markerPath = 'certificates/sent/' . $candidateId . '-' . $certType . '.json';
        Storage::disk('public')->put($markerPath, json_encode($meta));

        return response()->json([
            'success' => true,
            'message' => 'Certificat envoyé au candidat.',
            'certificate' => $meta,
        ]);
    }

    /**
     * Liste des certificats envoyés pour le candidat connecté.
     */
    public function listForCandidate(Request $request)
    {
        $auth = $request->user();
        if (!$auth) {
            return response()->json(['success' => false, 'message' => 'Non authentifié.'], 401);
        }
        $prefix = 'certificates/sent/' . $auth->id . '-';
        $files = collect(Storage::disk('public')->files('certificates/sent'))
            ->filter(fn($f) => str_starts_with(basename($f), (string) $auth->id . '-'))
            ->values();

        $items = $files->map(function ($f) {
            $raw = json_decode(Storage::disk('public')->get($f) ?: '{}', true) ?: [];
            return [
                'candidate_id' => $raw['candidate_id'] ?? '',
                'candidate_name' => $raw['candidate_name'] ?? '',
                'certification_type' => $raw['certification_type'] ?? '',
                'url' => $raw['url'] ?? '',
                'sent_at' => $raw['sent_at'] ?? null,
            ];
        })->values();

        return response()->json([
            'success' => true,
            'certificates' => $items,
        ]);
    }
}


