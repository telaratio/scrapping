# Web Scraper Application

Application de gestion de clés API et de scraping web avec authentification sécurisée.

## 1. Installation

### Prérequis
- Node.js (v16 ou supérieur)
- PostgreSQL
- npm ou yarn

### Étapes d'installation

1. Cloner le repository :
```bash
git clone https://github.com/votre-username/webscrapper.git
cd webscrapper
```

2. Installer les dépendances :
```bash
npm install
```

3. Configurer les variables d'environnement :
Créer un fichier `.env` à la racine du projet :
```env
# Base de données
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# JWT
JWT_SECRET="votre-secret-jwt"

# Email (optionnel)
SMTP_HOST="smtp.example.com"
SMTP_PORT=587
SMTP_USER="your-email@example.com"
SMTP_PASS="your-email-password"
```

4. Initialiser la base de données :
```bash
npx prisma migrate dev
```

5. Lancer l'application :
```bash
npm run dev
```

## 2. Structure de l'Application

### Pages (`src/routes/`)
```
/
├── login/               # Page de connexion
├── register/            # Page d'inscription
├── verify-email/        # Page de vérification d'email
├── forgot-password/     # Page de mot de passe oublié
├── reset-password/      # Page de réinitialisation de mot de passe
├── keys/                # Page de gestion des clés API
├── webpage-scraping/    # Page pour tester l’API par url
├── google-scraping/     # Page pour tester l’API par url
└── dashboard/           # Tableau de bord utilisateur

```

### API (`src/routes/api/`)
```
/api
├── auth/
│   ├── login           # Authentification
│   ├── register        # Inscription
│   ├── verify-email    # Vérification d'email
│   ├── request-reset   # Demande de réinitialisation
│   ├── reset-password  # Réinitialisation de mot de passe
│   └── logout          # Déconnexion
├── keys/
│   ├── [id]/          # Opérations sur une clé spécifique
│   └── +server.js     # Liste et création de clés
└── scraping/
    ├── auth/
    │   ├── webpage    # Scraping de pages web par API
    │   └── google     # Scraping de résultats Google par API
    ├── google         # Scraping de résultats Google
    └── webpage        # Scraping de pages web

```

## 3. Documentation API

### Authentification

#### POST /api/auth/login
Authentifie un utilisateur.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "jwt_token",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "nom": "User Name"
  }
}
```

#### POST /api/auth/register
Inscrit un nouvel utilisateur.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "nom": "User Name"
}
```

**Response:**
```json
{
  "message": "Inscription réussie. Veuillez vérifier votre email."
}
```

### Gestion des Clés API

#### GET /api/keys
Récupère toutes les clés API de l'utilisateur.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
[
  {
    "id": 1,
    "cle": "sk_abc123_xyz789",
    "nom": "Ma clé API",
    "actif": true,
    "date_creation": "2024-03-20T10:00:00.000Z",
    "date_modification": "2024-03-20T10:00:00.000Z"
  }
]
```

#### POST /api/keys
Crée une nouvelle clé API.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request:**
```json
{
  "nom": "Nouvelle clé API"
}
```

**Response:**
```json
{
  "id": 2,
  "cle": "sk_new_key_123",
  "nom": "Nouvelle clé API",
  "actif": true,
  "date_creation": "2024-03-20T10:30:00.000Z",
  "date_modification": "2024-03-20T10:30:00.000Z"
}
```

#### PATCH /api/keys/:id
Active ou désactive une clé API.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request:**
```json
{
  "actif": false
}
```

**Response:**
```json
{
  "id": 1,
  "cle": "sk_abc123_xyz789",
  "nom": "Ma clé API",
  "actif": false,
  "date_creation": "2024-03-20T10:00:00.000Z",
  "date_modification": "2024-03-20T10:35:00.000Z"
}
```

#### DELETE /api/keys/:id
Supprime une clé API.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "message": "Clé API supprimée avec succès"
}
```

### Scraping

#### POST /api/scraping/auth/webpage
Scrape une page web.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request:**
```json
{
  "url": "https://exemple.com"
}
```

**Response:**
```json
{
  "status": "success",
  "title": "Titre de la page",
  "description": "Description de la page",
  "content": "Contenu extrait de la page",
  "links": ["liste", "des", "liens"],
  "images": ["liste", "des", "images"]
}
```

#### POST /api/scraping/auth/google
Scrape les résultats Google.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request:**
```json
{
  "keyword": "mot clé de recherche"
}
```

**Response:**
```json
{
  "status": "success",
  "results": [
    {
      "title": "Titre du résultat",
      "url": "URL du résultat",
      "description": "Description du résultat"
    }
  ]
}
```

### Codes d'erreur

- **400 Bad Request**: Données invalides
- **401 Unauthorized**: Non authentifié
- **403 Forbidden**: Accès refusé
- **404 Not Found**: Ressource non trouvée
- **500 Internal Server Error**: Erreur serveur

**Format de réponse d'erreur:**
```json
{
  "error": "Description de l'erreur"
}
```
