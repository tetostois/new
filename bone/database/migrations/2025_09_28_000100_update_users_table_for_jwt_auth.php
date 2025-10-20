<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Remplacer le champ name par first_name / last_name si présent
            if (Schema::hasColumn('users', 'name')) {
                $table->renameColumn('name', 'first_name');
                $table->string('last_name')->after('first_name')->nullable();
            } else {
                $table->string('first_name')->after('id');
                $table->string('last_name')->after('first_name');
            }

            // Champs requis par l'inscription candidat
            $table->string('phone')->after('email')->nullable();
            $table->string('role')->after('phone')->default('candidate'); // admin | examiner | candidate

            // Champs supplémentaires
            $table->string('address')->nullable()->after('role');
            $table->date('date_of_birth')->nullable()->after('address');
            $table->string('place_of_birth')->nullable()->after('date_of_birth');
            $table->string('city')->nullable()->after('place_of_birth');
            $table->string('country')->nullable()->after('city');
            $table->string('profession')->nullable()->after('country');

            // Autres champs utilisés dans le modèle
            $table->boolean('is_active')->default(true)->after('profession');
            $table->timestamp('last_login_at')->nullable()->after('is_active');
            $table->json('settings')->nullable()->after('last_login_at');
            $table->string('avatar')->nullable()->after('settings');
            $table->string('postal_code')->nullable()->after('city');
            $table->text('bio')->nullable()->after('date_of_birth');
            $table->string('specialization')->nullable()->after('bio');
            $table->string('qualifications')->nullable()->after('specialization');
            $table->unsignedSmallInteger('experience_years')->nullable()->after('qualifications');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Revert added columns (safe to drop if exist)
            foreach ([
                'phone','role','address','date_of_birth','place_of_birth','city','country','profession',
                'is_active','last_login_at','settings','avatar','postal_code','bio','specialization','qualifications','experience_years'
            ] as $col) {
                if (Schema::hasColumn('users', $col)) {
                    $table->dropColumn($col);
                }
            }
            // Revert first/last name back to name if originally present
            if (Schema::hasColumn('users', 'last_name') && Schema::hasColumn('users', 'first_name')) {
                $table->renameColumn('first_name', 'name');
                $table->dropColumn('last_name');
            }
        });
    }
};
