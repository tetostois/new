<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class ExaminerUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Crée un examinateur de test si aucun examinateur n'existe
        if (!User::where('role', User::ROLE_EXAMINER)->exists()) {
            User::create([
                'first_name'       => 'John',
                'last_name'        => 'Examiner',
                'email'            => 'examiner@leadership.com',
                'phone'            => '+237123456790',
                'password'         => Hash::make('examiner123'),
                'role'             => User::ROLE_EXAMINER,
                'specialization'   => 'Mathématiques',
                'experience_years' => 5,
                'is_active'        => true,
            ]);
        }
    }
}
