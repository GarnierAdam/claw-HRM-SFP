# Claw HRM SFP

Application de gestion des ressources humaines multi-entreprises.

## Stack Technique

- **Frontend**: Next.js 15 + React 19 + TypeScript
- **UI**: Tailwind CSS + ShadCN UI
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **État**: TanStack Query (React Query)
- **Formulaires**: React Hook Form + Zod
- **PDF**: @react-pdf/renderer

## Installation

1. **Cloner et installer les dépendances**
```bash
cd claw-HRM-SFP
npm install
```

2. **Configuration Supabase**
- Créer un projet sur [Supabase](https://supabase.com)
- Récupérer l'URL et la clé anonyme (Project Settings > API)
- Créer un fichier `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon
```

3. **Base de données**
- Aller dans l'éditeur SQL de Supabase
- Copier-coller le contenu de `supabase/schema.sql`
- Exécuter pour créer les tables

4. **Créer un utilisateur admin**
Dans Supabase > Authentication > Users, ajouter un utilisateur avec email et mot de passe.

5. **Lancer le projet**
```bash
npm run dev
```

## Structure du projet

```
app/
├── dashboard/           # Pages protégées
│   ├── companies/      # Liste entreprises
│   ├── employees/      # Gestion employés
│   ├── leaves/         # Congés
│   └── templates/      # Templates PDF
├── login/              # Page de connexion
components/
├── ui/                 # Composants ShadCN
├── forms/              # Formulaires réutilisables
└── pdf/                # Composants PDF
lib/
├── supabase.ts         # Client Supabase
└── utils.ts            # Utilitaires
types/
└── index.ts            # Types TypeScript
```

## Fonctionnalités

- ✅ Multi-entreprises
- ✅ Gestion des employés (CRUD)
- ✅ Congés et arrêts maladie
- ✅ Upload de documents
- ✅ Templates PDF personnalisables
- ✅ Génération de documents

## À venir

- [ ] Statistiques avancées
- [ ] Notifications email
- [ ] Export Excel
- [ ] API externe
