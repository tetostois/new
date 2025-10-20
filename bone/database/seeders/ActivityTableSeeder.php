<?php

namespace Database\Seeders;

use App\Models\Activity;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class ActivityTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Vérifier s'il y a déjà des activités
        if (Activity::count() > 0) {
            $this->command->info('Des activités existent déjà. Le seeder a été ignoré.');
            return;
        }

        // Récupérer des utilisateurs aléatoires
        $users = User::inRandomOrder()->limit(5)->get();
        
        if ($users->isEmpty()) {
            $this->command->error('Aucun utilisateur trouvé. Veuillez d\'abord exécuter le UserSeeder.');
            return;
        }

        // Types d'activités
        $activityTypes = [
            [
                'type' => 'user_registered',
                'description' => 'Nouvel utilisateur inscrit',
                'icon' => 'user-plus',
            ],
            [
                'type' => 'payment_confirmed',
                'description' => 'Paiement confirmé',
                'icon' => 'check-circle',
            ],
            [
                'type' => 'exam_submitted',
                'description' => 'Examen soumis',
                'icon' => 'file-text',
            ],
            [
                'type' => 'exam_graded',
                'description' => 'Examen noté',
                'icon' => 'award',
            ],
            [
                'type' => 'profile_updated',
                'description' => 'Profil mis à jour',
                'icon' => 'user',
            ],
        ];

        // Créer des activités pour les 30 derniers jours
        $now = now();
        
        for ($i = 0; $i < 50; $i++) {
            $activityType = $activityTypes[array_rand($activityTypes)];
            $user = $users->random();
            $daysAgo = rand(0, 30);
            $hoursAgo = rand(0, 23);
            $minutesAgo = rand(0, 59);
            
            $createdAt = $now->copy()
                ->subDays($daysAgo)
                ->subHours($hoursAgo)
                ->subMinutes($minutesAgo);

            Activity::create([
                'type' => $activityType['type'],
                'description' => $activityType['description'],
                'user_id' => $user->id,
                'data' => [
                    'icon' => $activityType['icon'],
                    'details' => 'Détails supplémentaires sur cette activité',
                ],
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ]);
        }

        $this->command->info('50 activités de test ont été créées avec succès.');
    }
}
