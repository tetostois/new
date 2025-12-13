<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\ModuleProgress;
use App\Models\ExamSubmission;
use App\Models\ExamQuestion;
use Illuminate\Support\Facades\DB;

class AutoSubmitExpiredExams extends Command
{
    protected $signature = 'exams:auto-submit-expired';
    protected $description = 'Soumettre automatiquement les examens des candidats dont la fenêtre de 3 jours a expiré';

    public function handle(): int
    {
        $now = now();
        $expiredUsers = User::whereNotNull('exam_expires_at')
            ->where('exam_expires_at', '<', $now)
            ->where('role', User::ROLE_CANDIDATE)
            ->get();

        foreach ($expiredUsers as $user) {
            $this->autoSubmitForUser($user);
        }

        $this->info('Auto-submission terminée.');
        return Command::SUCCESS;
    }

    protected function autoSubmitForUser(User $user): void
    {
        $cert = $user->selected_certification;
        if (!$cert) {
            return;
        }

        // Récupérer tous les modules progress pour cette certification
        $progressList = ModuleProgress::where('candidate_id', $user->id)
            ->where('certification_type', $cert)
            ->get();

        foreach ($progressList as $progress) {
            if ($progress->status === 'completed') {
                continue;
            }
            // Soumission automatique "blanche" (aucune réponse)
            DB::beginTransaction();
            try {
                $examId = "exam-{$cert}-{$progress->module_id}";
                $existing = ExamSubmission::where('candidate_id', $user->id)
                    ->where('exam_id', $examId)
                    ->first();
                if (!$existing) {
                    $maxScore = ExamQuestion::where('certification_type', $cert)
                        ->where('module', $progress->module_id)
                        ->where('is_published', true)
                        ->sum('points');
                    $existing = ExamSubmission::create([
                        'exam_id' => $examId,
                        'candidate_id' => $user->id,
                        'answers' => [],
                        'status' => 'submitted',
                        'started_at' => $user->exam_start_at ?? now()->subDays(3),
                        'submitted_at' => now(),
                        'total_score' => 0,
                    ]);
                    // Marquer le module comme terminé (score 0 par défaut)
                    $progress->complete(0, $maxScore);
                    $progress->update(['exam_submission_id' => $existing->id]);
                } else {
                    // Si une soumission existe mais pas "submitted", la forcer
                    if ($existing->status !== 'submitted') {
                        $existing->status = 'submitted';
                        $existing->submitted_at = now();
                        $existing->save();
                    }
                    if (!$progress->isCompleted()) {
                        $maxScore = ExamQuestion::where('certification_type', $cert)
                            ->where('module', $progress->module_id)
                            ->where('is_published', true)
                            ->sum('points');
                        $progress->complete(0, $maxScore);
                        $progress->update(['exam_submission_id' => $existing->id]);
                    }
                }
                DB::commit();
            } catch (\Throwable $e) {
                DB::rollBack();
                \Log::error('[AutoSubmitExpiredExams] échec soumission auto user='.$user->id.' module='.$progress->module_id.' : '.$e->getMessage());
            }
        }
    }
}


