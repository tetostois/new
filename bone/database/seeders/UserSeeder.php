<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Créer l'administrateur principal
        User::create([
            'first_name' => 'Admin',
            'last_name' => 'Système',
            'email' => 'admin@gmail.com',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
            'is_active' => true,
        ]);

        // Créer l'examinateur principal
        User::create([
            'first_name' => 'Examinateur',
            'last_name' => 'Principal',
            'email' => 'examiner@gmail.com',
            'password' => Hash::make('examiner123'),
            'role' => 'examiner',
            'is_active' => true,
            'specialization' => 'Évaluation des compétences',
            'experience_years' => 5,
        ]);

        // Créer des examinateurs supplémentaires
        for ($i = 1; $i <= 3; $i++) {
            User::create([
                'first_name' => 'Examinateur',
                'last_name' => $i,
                'email' => "examiner{$i}@example.com",
                'password' => Hash::make('password'),
                'role' => 'examiner',
                'is_active' => true,
                'specialization' => 'Spécialité ' . $i,
                'experience_years' => rand(1, 10),
            ]);
        }

        // Créer des candidats
        for ($i = 1; $i <= 20; $i++) {
            User::create([
                'first_name' => 'Candidat',
                'last_name' => $i,
                'email' => "candidate{$i}@example.com",
                'password' => Hash::make('password'),
                'role' => 'candidate',
                'is_active' => true,
                'profession' => 'Profession ' . $i,
            ]);
        }
    }
}
