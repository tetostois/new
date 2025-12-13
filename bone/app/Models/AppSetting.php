<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AppSetting extends Model
{
    protected $table = 'app_settings';
    public $timestamps = false;
    protected $fillable = ['key', 'value'];

    public static function get(string $key, $default = null)
    {
        $row = static::where('key', $key)->first();
        if (!$row) return $default;
        return static::decode($row->value);
    }

    public static function set(string $key, $value): void
    {
        static::updateOrCreate(
            ['key' => $key],
            ['value' => static::encode($value)]
        );
    }

    private static function encode($value): string
    {
        if (is_scalar($value) && !is_bool($value)) {
            return (string) $value;
        }
        return json_encode($value);
    }

    private static function decode(?string $value)
    {
        if ($value === null) return null;
        $decoded = json_decode($value, true);
        return (json_last_error() === JSON_ERROR_NONE) ? $decoded : $value;
    }
}


