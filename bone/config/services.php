<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'cinetpay' => [
        'api_key' => env('CINETPAY_API_KEY'),
        'site_id' => env('CINETPAY_SITE_ID'),
        'base_url' => env('CINETPAY_BASE_URL', 'https://api-checkout.cinetpay.com'),
        'allowed_currency' => env('CINETPAY_ALLOWED_CURRENCY', 'XAF'),
        'return_url' => env('CINETPAY_RETURN_URL', env('APP_URL') . '/cinetpay/return'),
        'cancel_url' => env('CINETPAY_CANCEL_URL', env('APP_URL') . '/cinetpay/cancel'),
        'notify_url' => env('CINETPAY_NOTIFY_URL', env('APP_URL') . '/api/mobile/cinetpay/notify'),
    ],

    'campay' => [
        'base_url' => env('CAMPAY_BASE_URL', 'https://demo.campay.net/api'),
        'token' => env('CAMPAY_TOKEN'),
        'redirect_url' => env('CAMPAY_REDIRECT_URL', env('APP_URL') . '/mobile/campay/redirect'),
        'failure_url' => env('CAMPAY_FAILURE_URL', env('APP_URL') . '/mobile/campay/failure'),
    ],

];
