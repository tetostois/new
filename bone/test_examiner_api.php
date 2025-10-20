<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\ExamSubmission;
use App\Models\User;

echo "=== TEST API EXAMINATEUR ===\n\n";

// Vérifier les soumissions
echo "Soumissions en base:\n";
$submissions = ExamSubmission::with(['candidate'])->get();
foreach ($submissions as $sub) {
    $candidate = $sub->candidate;
    echo "ID: {$sub->id} | Exam: {$sub->exam_id} | Status: {$sub->status} | Candidat: " . 
         ($candidate ? $candidate->first_name . ' ' . $candidate->last_name : 'N/A') . 
         " | Score: {$sub->total_score}\n";
}

echo "\n=== TEST ROUTE API ===\n";

// Tester la route API
$response = file_get_contents('http://127.0.0.1:8000/api/examiner/exam-submissions', false, stream_context_create([
    'http' => [
        'method' => 'GET',
        'header' => [
            'Authorization: Bearer test-token',
            'Content-Type: application/json'
        ]
    ]
]));

echo "Réponse API: " . $response . "\n";
