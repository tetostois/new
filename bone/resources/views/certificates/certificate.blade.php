<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Attestation de Certification</title>
    <style>
        /* Format fixe 3300x2550 px (≈ Letter landscape @300dpi) */
        @page { size: 3300px 2550px; margin: 0; }
        html, body { width: 3300px; height: 2550px; margin: 0; padding: 0; background:#ffffff; font-family: DejaVu Sans, sans-serif; }
        .sheet { width: 3300px; height: 2550px; margin: 0; padding: 0; box-sizing: border-box; overflow: hidden; }

        /* Cadre en pixels */
        .frame { border: 120px solid #2f5e2f; padding: 40px; width: 100%; height: 100%; box-sizing: border-box; }
        .inner-frame { border: 60px solid #a3b18a; padding: 40px; width: 100%; height: 100%; box-sizing: border-box; }
        .content-frame { border: 8px solid #1f2937; padding: 60px 50px; width: 100%; height: 100%; box-sizing: border-box; position: relative; }

        /* Mise en page */
        .top-badge { text-align:center; margin-bottom: 30px; }
        .badge { width: 140px; height: 140px; object-fit: contain; }
        .title { text-align:center; font-size: 74px; letter-spacing: 12px; color:#111827; text-transform: uppercase; margin: 0 0 20px 0; }
        .title-line { width: 70%; height: 2px; background:#777; margin: 16px auto 24px auto; }
        .subtitle-muted { text-align:center; color:#374151; font-size: 32px; margin: 0 0 18px 0; }
        .candidate { text-align:center; color:#1b4332; font-size: 56px; letter-spacing: 4px; text-transform: uppercase; margin: 6px 0; font-weight: 700; }
        .candidate-underline { width: 35%; height: 3px; background:#1b4332; margin: 14px auto 18px auto; }
        .cert-text { text-align:center; color:#111827; font-size: 40px; margin-top: 18px; }
        .brand { text-align:center; margin-top: 18px; }
        .brand img { height: 120px; object-fit: contain; }

        .sign-row { margin-top: 26px; display:flex; align-items:flex-end; justify-content:center; gap: 120px; }
        .sign-col { text-align:center; width: 400px; }
        .sign-line { width: 380px; height: 2px; background:#6b7280; margin: 10px auto 6px auto; }
        .sign-label { font-size: 28px; color:#374151; }

        .date-box { position:absolute; right: 50px; bottom: 40px; text-align: right; }
        .date-box .label { text-transform: uppercase; font-size: 24px; letter-spacing: 2px; margin-top: 6px; color:#374151; }

        @media print { .no-print { display:none; } }
    </style>
</head>
<body>
@php
    // Normalisation des données entrantes pour compatibilité
    $cand = isset($candidate) && is_object($candidate) ? $candidate : (object) [
        'first_name' => explode(' ', $name ?? '')[0] ?? '',
        'last_name'  => trim(implode(' ', array_slice(explode(' ', $name ?? ''), 1)))
    ];

    // Gestion robuste de la date: accepte Carbon, string 'd/m/Y', ou autre
    $rawDate = $date ?? now();
    if ($rawDate instanceof \Carbon\Carbon) {
        $certDate = $rawDate;
    } elseif (is_string($rawDate)) {
        $certDate = \Carbon\Carbon::hasFormat($rawDate, 'd/m/Y')
            ? \Carbon\Carbon::createFromFormat('d/m/Y', $rawDate)
            : \Carbon\Carbon::parse($rawDate);
    } else {
        $certDate = \Carbon\Carbon::parse($rawDate);
    }

    $cert = isset($certification) && is_object($certification) ? $certification : (object) [
        'level' => $level ?? 1,
        'certification_type' => ($certification ?? ($certification_type ?? '')),
        'certificate_number' => $id_number ?? null,
        'id_number' => $id_number ?? null,
        'certification_date' => $certDate,
        'qr_code_path' => $qr_code_path ?? null,
        'type' => (object) ['name' => str_replace('_',' ', $certification ?? ($certification_type ?? ''))],
    ];

    $authorized = isset($authorized_expert) && is_object($authorized_expert) ? $authorized_expert : (object) [
        'name' => 'Signature',
        'phone' => ''
    ];

    $logo = $logo_path ?? null;
    // Prépare une Data URI du logo (priorité: storage/$logo, sinon tentative programme leadership, puis favicon)
    $logoFilePath = null;
    if (!empty($logo)) {
        $candidateLogoPath = storage_path('app/public/' . ltrim($logo, '/'));
        if (file_exists($candidateLogoPath)) {
            $logoFilePath = $candidateLogoPath;
        }
    }
    if (!$logoFilePath) {
        $fallbackCandidates = [
            public_path('images/04.png'), // logo fourni
            public_path('logoprogrammeleadership.png'),
            public_path('logo.png'),
            public_path('favicon.ico'),
        ];
        $fallback = null;
        foreach ($fallbackCandidates as $candPath) {
            if (file_exists($candPath)) { $fallback = $candPath; break; }
        }
        if (file_exists($fallback)) {
            $logoFilePath = $fallback;
        }
    }
    $logoDataUri = null;
    if ($logoFilePath && is_readable($logoFilePath)) {
        $ext = strtolower(pathinfo($logoFilePath, PATHINFO_EXTENSION));
        $mime = $ext === 'png' ? 'image/png' : (($ext === 'jpg' || $ext === 'jpeg') ? 'image/jpeg' : 'image/x-icon');
        $logoDataUri = 'data:' . $mime . ';base64,' . base64_encode(file_get_contents($logoFilePath));
    }

    // Image du haut (badge) spécifique
    $badgeDataUri = null;
    $badgePath = public_path('images/05.png');
    if (file_exists($badgePath) && is_readable($badgePath)) {
        $badgeDataUri = 'data:image/png;base64,' . base64_encode(file_get_contents($badgePath));
    }

    $website = config('app.website', config('app.url'));
@endphp

<div class="sheet">
  <div class="frame">
    <div class="inner-frame">
      <div class="content-frame">

      <div class="top-badge">
        @if($badgeDataUri)
          <img class="badge" src="{{ $badgeDataUri }}" alt="Logo">
        @elseif($logoDataUri)
          <img class="badge" src="{{ $logoDataUri }}" alt="Logo">
        @endif
      </div>

      <div class="title">ATTESTATION DE CERTIFICATION</div>
      <div class="title-line"></div>

      <div class="subtitle-muted">Cette attestation est attribuée à</div>
      <div class="candidate">{{ strtoupper(trim(($cand->first_name ?? '') . ' ' . ($cand->last_name ?? ''))) }}</div>
      <div class="candidate-underline"></div>

      <div class="subtitle-muted" style="margin-top:8mm;">
        Par sa participation brillante à la certification en tant que Chef d’Entreprise à
                    </div>
      <div class="cert-text" style="font-weight:700; text-transform:uppercase;">
        {{ mb_strtoupper($cert->type->name ?? $cert->certification_type) }}
                </div>

      <div class="brand">
        @if($logoDataUri)
          <img src="{{ $logoDataUri }}" alt="Programme Leadership">
            @endif
        </div>

      <div class="sign-row">
        <div class="sign-col">
          <div class="sign-line"></div>
          <div class="sign-label">Signature autorisée</div>
        </div>
        <div class="sign-col">
          <div class="sign-line"></div>
          <div class="sign-label">Cachet / Tampon</div>
        </div>
    </div>

      <div class="date-box">
        <div class="label">Date</div>
        <div>{{ ($cert->certification_date instanceof \Carbon\Carbon) ? $cert->certification_date->format('d/m/Y') : (is_string($cert->certification_date) ? $cert->certification_date : now()->format('d/m/Y')) }}</div>
    </div>

        </div>
    </div>
</div>
    </div>


</body>
</html>


