<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Crée un administrateur initial si aucun admin n'existe
        if (!User::where('role', User::ROLE_ADMIN)->exists()) {
            User::create([
                'first_name' => 'Admin',
                'last_name'  => 'System',
                'email'      => 'admin@leadership.com',
                'phone'      => '+237123456789',
                'password'   => Hash::make('admin123'),
                'role'       => User::ROLE_ADMIN,
                'is_active'  => true,
            ]);
        }
    }
}
