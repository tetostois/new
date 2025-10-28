<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo"></a></p>

<p align="center">
<a href="https://github.com/laravel/framework/actions"><img src="https://github.com/laravel/framework/workflows/tests/badge.svg" alt="Build Status"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/dt/laravel/framework" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/v/laravel/framework" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/l/laravel/framework" alt="License"></a>
</p>

## About Laravel

Laravel is a web application framework with expressive, elegant syntax. We believe development must be an enjoyable and creative experience to be truly fulfilling. Laravel takes the pain out of development by easing common tasks used in many web projects, such as:

- [Simple, fast routing engine](https://laravel.com/docs/routing).
- [Powerful dependency injection container](https://laravel.com/docs/container).
- Multiple back-ends for [session](https://laravel.com/docs/session) and [cache](https://laravel.com/docs/cache) storage.
- Expressive, intuitive [database ORM](https://laravel.com/docs/eloquent).
- Database agnostic [schema migrations](https://laravel.com/docs/migrations).
- [Robust background job processing](https://laravel.com/docs/queues).
- [Real-time event broadcasting](https://laravel.com/docs/broadcasting).

Laravel is accessible, powerful, and provides tools required for large, robust applications.

## Learning Laravel

Laravel has the most extensive and thorough [documentation](https://laravel.com/docs) and video tutorial library of all modern web application frameworks, making it a breeze to get started with the framework.

You may also try the [Laravel Bootcamp](https://bootcamp.laravel.com), where you will be guided through building a modern Laravel application from scratch.

If you don't feel like reading, [Laracasts](https://laracasts.com) can help. Laracasts contains thousands of video tutorials on a range of topics including Laravel, modern PHP, unit testing, and JavaScript. Boost your skills by digging into our comprehensive video library.

## Laravel Sponsors

We would like to extend our thanks to the following sponsors for funding Laravel development. If you are interested in becoming a sponsor, please visit the [Laravel Partners program](https://partners.laravel.com).

### Premium Partners

- **[Vehikl](https://vehikl.com)**
- **[Tighten Co.](https://tighten.co)**
- **[Kirschbaum Development Group](https://kirschbaumdevelopment.com)**
- **[64 Robots](https://64robots.com)**
- **[Curotec](https://www.curotec.com/services/technologies/laravel)**
- **[DevSquad](https://devsquad.com/hire-laravel-developers)**
- **[Redberry](https://redberry.international/laravel-development)**
- **[Active Logic](https://activelogic.com)**

## Contributing

Thank you for considering contributing to the Laravel framework! The contribution guide can be found in the [Laravel documentation](https://laravel.com/docs/contributions).

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

## Vérification d'email (Papercut en dev, turboSMTP en prod)

Ce projet envoie un email de vérification à l'inscription des candidats. En développement, utilisez Papercut SMTP pour capturer les emails localement; en production, utilisez turboSMTP pour l'envoi réel.

### Endpoints API et web

- POST `/api/auth/register`: crée le compte et envoie l'email de vérification.
- POST `/api/auth/email/resend` (JWT requis): renvoie l'email de vérification (throttle 6/min).
- GET `/email/verify/{id}/{hash}` (signé): marque l'email comme vérifié; supporte un paramètre `redirect` optionnel pour rediriger vers le frontend, ex. `?redirect=https://app.exemple.com/verified`.

### Configuration en développement (Papercut SMTP)

1. Installer Papercut SMTP: `https://www.papercut-smtp.com/` (application desktop).
2. Lancer Papercut, qui écoute par défaut en local (port 25/2525).
3. Dans `.env` du projet Laravel (`bone/.env`):

```env
APP_URL=http://localhost

MAIL_MAILER=smtp
MAIL_HOST=127.0.0.1
MAIL_PORT=2525
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_SCHEME=
MAIL_FROM_ADDRESS="no-reply@local.test"
MAIL_FROM_NAME="Programme Leadership"
MAIL_EHLO_DOMAIN=localhost
```

Les emails apparaîtront dans l'interface de Papercut, sans être envoyés réellement.

### Configuration en production (turboSMTP)

Renseignez les identifiants fournis par turboSMTP. Hôte recommandé: `pro.turbo-smtp.com`. Ports: `587` (STARTTLS) ou `465` (SSL).

```env
APP_URL=https://votre-domaine.com

MAIL_MAILER=smtp
MAIL_HOST=pro.turbo-smtp.com
MAIL_PORT=587
MAIL_USERNAME=VOTRE_UTILISATEUR_TURBOSMTP
MAIL_PASSWORD=VOTRE_MOTDEPASSE_TURBOSMTP
MAIL_SCHEME=tls
MAIL_FROM_ADDRESS="no-reply@votre-domaine.com"
MAIL_FROM_NAME="Programme Leadership"
MAIL_EHLO_DOMAIN=votre-domaine.com
```

Si vous utilisez SSL implicite, remplacez:

```env
MAIL_PORT=465
MAIL_SCHEME=ssl
```

### Tests rapides

1. Démarrer Papercut (en dev) ou configurer turboSMTP (en prod).
2. Appeler `POST /api/auth/register` avec un email réel.
3. Ouvrir l'email dans Papercut (ou votre boîte de réception en prod) et cliquer le lien de vérification.
4. Optionnel: ajouter `?redirect=https://votre-frontend/verified` pour rediriger après succès.
5. En cas de perte de l'email: `POST /api/auth/email/resend` avec le Bearer token.

### (Optionnel) Protéger des routes par email vérifié

Vous pouvez exiger un email vérifié sur des routes protégées en ajoutant le middleware `verified` aux groupes utilisant déjà `auth:api`.

