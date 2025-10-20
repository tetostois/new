# 🎓 Leadership Cameroun - Plateforme d'Examen de Certification

## 📋 Vue d'ensemble

**Leadership Cameroun** est une plateforme web moderne dédiée à l'évaluation et à la certification des compétences en leadership. L'application permet aux candidats de passer des examens en ligne, aux examinateurs de corriger les épreuves, et aux administrateurs de gérer l'ensemble du processus de certification.

### 🎯 Mission ##
*"Excellence • Intégrité • Vision"* - Développer et certifier les leaders d'aujourd'hui et de demain au Cameroun.

---

## 🏗️ Architecture Technique

### Frontend (React + TypeScript)
- **Framework**: React 18 avec TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Build Tool**: Vite
- **State Management**: React Context API

### Structure du Projet
```
src/
├── components/          # Composants réutilisables
│   ├── auth/           # Authentification (Login, Register)
│   ├── exam/           # Interface d'examen
│   ├── layout/         # Header, Footer, Navigation
│   ├── payment/        # Système de paiement
│   └── ui/             # Composants UI de base
├── contexts/           # Gestion d'état globale
├── pages/              # Pages principales
├── types/              # Définitions TypeScript
└── utils/              # Fonctions utilitaires
```

---

## 👥 Rôles et Fonctionnalités

### 🔵 **CANDIDAT**
#### Processus d'inscription
- ✅ **Inscription autonome** avec informations personnelles complètes
- ✅ **Sélection du niveau** : Débutant, Intermédiaire, Expert
- ✅ **Validation par email** et création de mot de passe sécurisé

#### Fonctionnalités principales
- ✅ **Paiement sécurisé** (50,000 FCFA) via PayPal, Orange Money, MTN Money
- ✅ **Passage d'examen chronométré** (60 minutes)
- ✅ **Suivi de progression** en temps réel
- ✅ **Téléchargement de certificat** après validation
- ✅ **Modification de profil** avec niveau de leadership
- ✅ **Support technique** intégré

#### Interface candidat
- Dashboard avec progression visuelle (4 étapes)
- Gestion du profil personnel
- Historique des examens
- Support et assistance

### 🟢 **EXAMINATEUR**
#### Fonctionnalités de correction
- ✅ **Attribution automatique** des examens à corriger
- ✅ **Interface de correction** avec notation par question
- ✅ **Feedback détaillé** pour chaque réponse
- ✅ **Gestion du temps** de correction
- ✅ **Statistiques personnelles** de performance

#### Outils de travail
- ✅ **Filtres et recherche** dans les examens
- ✅ **Export des corrections** pour archivage
- ✅ **Communication** avec l'administration
- ✅ **Modification de profil** professionnel

### 🔴 **ADMINISTRATEUR**
#### Gestion des utilisateurs
- ✅ **CRUD complet** sur tous les utilisateurs
- ✅ **Création de comptes** Admin/Examinateur
- ✅ **Activation/Désactivation** des comptes
- ✅ **Recherche et filtres** avancés

#### Gestion des examinateurs
- ✅ **Ajout d'examinateurs** avec spécialisations
- ✅ **Attribution des examens** par expertise
- ✅ **Suivi des performances** de correction
- ✅ **Communication directe** par email

#### Supervision des examens
- ✅ **Monitoring en temps réel** des sessions
- ✅ **Attribution manuelle** des correcteurs
- ✅ **Validation des résultats** avant certification
- ✅ **Gestion des réclamations**

#### Analytics et rapports
- ✅ **Tableau de bord** avec KPIs
- ✅ **Statistiques détaillées** par période
- ✅ **Rapports financiers** des paiements
- ✅ **Métriques de performance** globales

---

## 🎯 Fonctionnalités Clés Implémentées

### 🔐 **Authentification et Sécurité**
- Système de connexion sécurisé par rôle
- Gestion des sessions utilisateur
- Protection des routes selon les permissions
- Validation des formulaires côté client

### 💳 **Système de Paiement**
- Intégration PayPal, Orange Money, MTN Money
- Validation des transactions
- Historique des paiements
- Gestion des remboursements

### 📝 **Moteur d'Examen**
- Questions à choix multiples (QCM)
- Questions ouvertes avec évaluation manuelle
- Timer en temps réel avec alertes
- Sauvegarde automatique des réponses
- Navigation libre entre questions

### 📊 **Système de Notation**
- Correction automatique des QCM
- Interface de correction manuelle
- Attribution de scores par question
- Feedback personnalisé
- Validation finale par l'administration

### 🏆 **Génération de Certificats**
- Certificats PDF automatiques
- Personnalisation avec score et date
- Envoi par email automatique
- Archivage sécurisé

---

## 🔌 APIs Backend à Développer 

### 🔵 **Authentication API**
```go
// Endpoints requis
POST   /api/auth/register          // Inscription candidat
POST   /api/auth/login             // Connexion utilisateur
POST   /api/auth/logout            // Déconnexion
POST   /api/auth/refresh           // Renouvellement token
GET    /api/auth/me                // Profil utilisateur actuel
PUT    /api/auth/profile           // Mise à jour profil
POST   /api/auth/forgot-password   // Mot de passe oublié
POST   /api/auth/reset-password    // Réinitialisation MDP
```

### 👥 **Users Management API**
```go
// CRUD Utilisateurs (Admin uniquement)
GET    /api/users                  // Liste des utilisateurs
POST   /api/users                  // Créer utilisateur
GET    /api/users/:id              // Détails utilisateur
PUT    /api/users/:id              // Modifier utilisateur
DELETE /api/users/:id              // Supprimer utilisateur
PUT    /api/users/:id/status       // Activer/Désactiver
GET    /api/users/search           // Recherche utilisateurs
GET    /api/users/stats            // Statistiques utilisateurs
```

### 🎓 **Examiners API**
```go
// Gestion des examinateurs
GET    /api/examiners              // Liste examinateurs
POST   /api/examiners              // Ajouter examinateur
PUT    /api/examiners/:id          // Modifier examinateur
DELETE /api/examiners/:id          // Supprimer examinateur
GET    /api/examiners/:id/stats    // Stats examinateur
POST   /api/examiners/:id/notify   // Notification email
GET    /api/examiners/workload     // Charge de travail
```

### 📝 **Exams API**
```go
// Gestion des examens
GET    /api/exams                  // Liste des examens
POST   /api/exams                  // Créer examen
GET    /api/exams/:id              // Détails examen
PUT    /api/exams/:id              // Modifier examen
DELETE /api/exams/:id              // Supprimer examen
GET    /api/exams/by-level/:level  // Examens par niveau

// Sessions d'examen
POST   /api/exam-sessions          // Démarrer session
GET    /api/exam-sessions/:id      // État session
PUT    /api/exam-sessions/:id      // Sauvegarder réponses
POST   /api/exam-sessions/:id/submit // Soumettre examen
GET    /api/exam-sessions/active   // Sessions actives
```

### 📋 **Submissions API**
```go
// Soumissions d'examens
GET    /api/submissions            // Liste soumissions
GET    /api/submissions/:id        // Détails soumission
PUT    /api/submissions/:id/assign // Assigner examinateur
PUT    /api/submissions/:id/correct // Corriger examen
GET    /api/submissions/pending    // En attente correction
GET    /api/submissions/corrected  // Examens corrigés
POST   /api/submissions/:id/feedback // Ajouter feedback
```

### 💰 **Payments API**
```go
// Système de paiement
POST   /api/payments/initiate      // Initier paiement
POST   /api/payments/callback      // Callback paiement
GET    /api/payments/:id/status    // Statut paiement
GET    /api/payments/history       // Historique paiements
POST   /api/payments/refund        // Remboursement
GET    /api/payments/stats         // Statistiques financières

// Intégrations
POST   /api/payments/stripe        // Paiement Stripe
POST   /api/payments/cinetpay      // Paiement CinetPay
```

### 🏆 **Certificates API**
```go
// Gestion des certificats
GET    /api/certificates           // Liste certificats
POST   /api/certificates/generate  // Générer certificat
GET    /api/certificates/:id       // Télécharger certificat
POST   /api/certificates/:id/email // Envoyer par email
GET    /api/certificates/verify/:code // Vérifier authenticité
PUT    /api/certificates/:id/revoke // Révoquer certificat
```

### 📊 **Analytics API**
```go
// Tableaux de bord et statistiques
GET    /api/analytics/dashboard    // Dashboard admin
GET    /api/analytics/users        // Stats utilisateurs
GET    /api/analytics/exams        // Stats examens
GET    /api/analytics/payments     // Stats paiements
GET    /api/analytics/performance  // Performance globale
GET    /api/analytics/export       // Export données
```

### 🔔 **Notifications API**
```go
// Système de notifications
GET    /api/notifications          // Liste notifications
POST   /api/notifications          // Créer notification
PUT    /api/notifications/:id/read // Marquer comme lu
DELETE /api/notifications/:id      // Supprimer notification
POST   /api/notifications/email    // Notification email
POST   /api/notifications/sms      // Notification SMS
```

### 🛠️ **Support API**
```go
// Support et assistance
POST   /api/support/tickets        // Créer ticket support
GET    /api/support/tickets        // Liste tickets
GET    /api/support/tickets/:id    // Détails ticket
PUT    /api/support/tickets/:id    // Répondre ticket
PUT    /api/support/tickets/:id/close // Fermer ticket
GET    /api/support/faq            // FAQ
```

---

## 🗄️ Modèles de Données

### User Model
```go
type User struct {
    ID          uint      `json:"id" gorm:"primaryKey"`
    FirstName   string    `json:"firstName" validate:"required"`
    LastName    string    `json:"lastName" validate:"required"`
    Email       string    `json:"email" validate:"required,email" gorm:"unique"`
    Phone       string    `json:"phone" validate:"required"`
    Address     string    `json:"address"`
    BirthDate   time.Time `json:"birthDate"`
    BirthPlace  string    `json:"birthPlace"`
    City        string    `json:"city"`
    Country     string    `json:"country"`
    Profession  string    `json:"profession"`
    Level       string    `json:"level"` // debutant, intermediaire, expert
    Role        string    `json:"role"`  // admin, examiner, candidate
    Password    string    `json:"-"`
    IsActive    bool      `json:"isActive" gorm:"default:true"`
    HasPaid     bool      `json:"hasPaid" gorm:"default:false"`
    ExamTaken   bool      `json:"examTaken" gorm:"default:false"`
    Score       *int      `json:"score"`
    Certificate string    `json:"certificate"`
    CreatedAt   time.Time `json:"createdAt"`
    UpdatedAt   time.Time `json:"updatedAt"`
}
```

### Exam Model
```go
type Exam struct {
    ID          uint       `json:"id" gorm:"primaryKey"`
    Title       string     `json:"title" validate:"required"`
    Description string     `json:"description"`
    Level       string     `json:"level"` // debutant, intermediaire, expert
    Duration    int        `json:"duration"` // en minutes
    Price       int        `json:"price"`    // en FCFA
    IsActive    bool       `json:"isActive" gorm:"default:true"`
    Questions   []Question `json:"questions" gorm:"foreignKey:ExamID"`
    CreatedAt   time.Time  `json:"createdAt"`
    UpdatedAt   time.Time  `json:"updatedAt"`
}
```

### Question Model
```go
type Question struct {
    ID            uint     `json:"id" gorm:"primaryKey"`
    ExamID        uint     `json:"examId"`
    Text          string   `json:"text" validate:"required"`
    Type          string   `json:"type"` // multiple-choice, text
    Options       []string `json:"options" gorm:"type:json"`
    CorrectAnswer *int     `json:"correctAnswer"`
    Points        int      `json:"points" validate:"required"`
    CreatedAt     time.Time `json:"createdAt"`
}
```

### ExamSession Model
```go
type ExamSession struct {
    ID           uint      `json:"id" gorm:"primaryKey"`
    CandidateID  uint      `json:"candidateId"`
    ExamID       uint      `json:"examId"`
    StartedAt    time.Time `json:"startedAt"`
    SubmittedAt  *time.Time `json:"submittedAt"`
    TimeRemaining int      `json:"timeRemaining"` // en secondes
    Answers      []Answer  `json:"answers" gorm:"foreignKey:SessionID"`
    Status       string    `json:"status"` // active, submitted, expired
    CreatedAt    time.Time `json:"createdAt"`
}
```

### Payment Model
```go
type Payment struct {
    ID            uint      `json:"id" gorm:"primaryKey"`
    CandidateID   uint      `json:"candidateId"`
    Amount        int       `json:"amount"`
    Method        string    `json:"method"` // stripe, cinetpay
    Status        string    `json:"status"` // pending, completed, failed
    TransactionID string    `json:"transactionId"`
    Reference     string    `json:"reference"`
    CreatedAt     time.Time `json:"createdAt"`
    UpdatedAt     time.Time `json:"updatedAt"`
}
```

---

## 🚀 Installation et Démarrage

### Prérequis
- Node.js 18+
- npm ou yarn
- Go 1.21+ (pour le backend)
- PostgreSQL ou MySQL

### Frontend
```bash
# Installation des dépendances
npm install

# Démarrage en mode développement
npm run dev

# Build pour production
npm run build
```

### Variables d'environnement
```env
VITE_API_URL=http://localhost:8080/api
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
VITE_CINETPAY_API_KEY=your_cinetpay_api_key
```

---

## 🔒 Sécurité

### Authentification
- JWT tokens avec refresh tokens
- Hashage des mots de passe (bcrypt)
- Protection CSRF
- Rate limiting sur les APIs

### Autorisation
- Middleware de vérification des rôles
- Protection des routes sensibles
- Validation des permissions par endpoint

### Données
- Chiffrement des données sensibles
- Audit trail des actions critiques
- Sauvegarde automatique des examens
- Conformité RGPD

---

## 📈 Monitoring et Analytics

### Métriques à suivre
- Nombre d'inscriptions par jour/mois
- Taux de réussite aux examens
- Temps moyen de correction
- Revenus générés
- Satisfaction utilisateurs

### Logs et Debugging
- Logs structurés (JSON)
- Monitoring des erreurs
- Performance tracking
- Alertes automatiques

---

## 🔄 Workflow de Développement

### Backend (Go)
1. **Setup du projet** avec Gin/Echo framework
2. **Configuration de la base de données** (GORM)
3. **Implémentation des modèles** et migrations
4. **Développement des APIs** par module
5. **Tests unitaires et d'intégration**
6. **Documentation API** (Swagger)
7. **Déploiement** et monitoring

### Intégration Frontend-Backend
1. **Configuration des endpoints** API
2. **Gestion des erreurs** et loading states
3. **Optimisation des performances**
4. **Tests end-to-end**

---

## 📞 Support et Maintenance

### Contact
- **Email**: support@leadership-cameroun.com
- **Téléphone**: +237 6XX XXX XXX
- **Adresse**: Yaoundé, Cameroun

### Maintenance
- Mises à jour de sécurité mensuelles
- Sauvegardes quotidiennes
- Monitoring 24/7
- Support technique réactif

---

## 📄 Licence

© 2024 Leadership Cameroun. Tous droits réservés.

---

*Cette application a été développée avec ❤️ pour promouvoir l'excellence en leadership au Cameroun.*