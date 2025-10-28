<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificat</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; background:#f3f4f6; margin:0; padding:32px; }
        .certificate { max-width: 1000px; margin: 0 auto; background:#fff; box-shadow:0 10px 25px rgba(0,0,0,.15); }
        .header { background:#ca8a04; color:#111; padding:32px 48px; display:flex; align-items:center; justify-content:space-between; }
        .qr { width:128px; height:128px; background:#fff; display:flex; align-items:center; justify-content:center; }
        .titleBox { text-align:center; flex:1; padding:0 32px; }
        .level { font-size:56px; font-weight:800; letter-spacing:8px; margin:0 0 6px 0; }
        .subtitle { font-size:18px; letter-spacing:6px; text-transform:uppercase; margin:0; }
        .body { padding:64px 48px; text-align:center; }
        .logoCircle { width:192px; height:192px; border-radius:9999px; border:16px solid #d1d5db; display:flex; align-items:center; justify-content:center; margin:0 auto 32px; }
        .muted { color:#6b7280; font-size:12px; letter-spacing:4px; text-transform:uppercase; }
        .name { font-size:44px; font-weight:800; letter-spacing:2px; text-transform:uppercase; margin:24px 0 40px; }
        .certName { font-size:32px; font-weight:800; margin:32px 0 0; }
        .verify { margin-top:64px; color:#6b7280; font-size:14px; }
        .verify b { color:#374151; }
        .footer { background:#ca8a04; padding:24px 48px; display:flex; justify-content:space-between; align-items:flex-end; color:#111; }
        .footer .col { text-align:center; }
        .footer .label { font-size:10px; letter-spacing:4px; text-transform:uppercase; margin-top:4px; }
        .btnPrint { display:inline-block; background:#ca8a04; color:#fff; padding:12px 28px; border-radius:8px; text-decoration:none; margin-top:24px; }
        @media print { body { padding:0; background:#fff; } .btnPrint, .no-print { display:none; } }
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
        'name' => 'Moufid Karray',
        'phone' => '+1 438 992 5560'
    ];

    $logo = $logo_path ?? null;
    // Prépare une Data URI du logo (priorité: storage/$logo, sinon public/favicon.ico)
    $logoFilePath = null;
    if (!empty($logo)) {
        $candidateLogoPath = storage_path('app/public/' . ltrim($logo, '/'));
        if (file_exists($candidateLogoPath)) {
            $logoFilePath = $candidateLogoPath;
        }
    }
    if (!$logoFilePath) {
        $fallback = public_path('favicon.ico');
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

    $website = config('app.website', config('app.url'));
@endphp

<div class="certificate">
    <div class="header">
        <div class="qr">
            @if($cert->qr_code_path)
                <img src="{{ asset('storage/' . $cert->qr_code_path) }}" alt="QR Code" style="width:100%;height:100%;object-fit:contain;"/>
            @else
                <div style="width:100%;height:100%;background:#e5e7eb;color:#6b7280;font-size:12px;display:flex;align-items:center;justify-content:center;">QR CODE</div>
            @endif
        </div>
        <div class="titleBox">
            <h1 class="level">LEVEL {{ $cert->level ?? 1 }}</h1>
            <p class="subtitle">Certification</p>
        </div>
        <div style="width:128px;"></div>
    </div>

    <div class="body">
        <div style="display:flex;justify-content:center;margin-bottom:32px;">
            @if($logoDataUri)
                <img src="{{ $logoDataUri }}" alt="Logo" style="width:192px;height:192px;object-fit:contain;"/>
            @else
                <div class="logoCircle">
                    <div style="text-align:center;">
                        <div style="color:#dc2626;font-size:32px;margin-bottom:8px;">🍁</div>
                        <div style="color:#2563eb;font-weight:700;font-size:18px;">ICC</div>
                    </div>
                </div>
            @endif
        </div>

        <p class="muted" style="margin-bottom:24px;">International Consulting Canada Proudly Recognizes That</p>
        <div class="name">{{ strtoupper(trim(($cand->first_name ?? '') . ' ' . ($cand->last_name ?? ''))) }}</div>
        <p class="muted" style="margin-bottom:18px;">Has Successfully Completed Training and Certification Requirements For</p>
        <div class="certName">{{ $cert->type->name ?? $cert->certification_type }}</div>

        <div class="verify">
            <p style="margin:8px 0;">Validity of this certificate could be verified at</p>
            <p><b>{{ $website }}</b> & by scanning the QR Code</p>
        </div>
    </div>

    <div class="footer">
        <div class="col">
            <div class="font-bold">{{ ($cert->certification_date instanceof \Carbon\Carbon) ? $cert->certification_date->format('d-m-Y') : (is_string($cert->certification_date) ? $cert->certification_date : now()->format('d-m-Y')) }}</div>
            <div class="label">Certification Date</div>
        </div>
        <div class="col">
            <div class="font-bold">{{ $cert->certificate_number ?? $cert->id_number }}</div>
            <div class="label">ID Number</div>
        </div>
        <div class="col">
            <div class="font-bold" style="font-size:20px;font-style:italic;">{{ $authorized->name }}</div>
            <div class="label" style="margin-top:6px;">DocuSigned by:</div>
            <div class="label">Authorized Expert</div>
            <div style="font-size:10px;">{{ $authorized->phone }}</div>
        </div>
    </div>
</div>

<div class="no-print" style="text-align:center;">
    <a href="#" onclick="window.print();return false;" class="btnPrint">Imprimer le certificat</a>
    </div>
</body>
</html>


