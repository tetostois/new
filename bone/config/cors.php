<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Configure here your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    // Allow all methods for API; tighten in production if needed
    'allowed_methods' => ['*'],

    // Allow all origins by default for dev; replace with your Vite URL in prod
    // e.g. ['http://localhost:5173']
    'allowed_origins' => ['*'],

    'allowed_origins_patterns' => [],

    // Accept common headers
    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // Autoriser les credentials pour JWT
    'supports_credentials' => true,

];
