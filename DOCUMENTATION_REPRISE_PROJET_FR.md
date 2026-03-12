# Documentation de Reprise du Projet MSB

## 1. Objectif du document

Ce document est un guide de passation complet pour qu'une nouvelle personne puisse:

- Comprendre l'architecture globale du projet.
- Lancer l'application en local (mode développement et mode Docker).
- Comprendre les modeles de données et les flux métier.
- Maintenir, corriger et faire évoluer le système (frontend, backend, scripts Python de planning).
- Exploiter le projet en conditions réelles (runbook, diagnostic, points de vigilance).

Ce repo est organisé en monorepo sous `/apps`.

## 2. Vue d'ensemble technique

### 2.1 Composants

- Frontend React: `apps/frontend`
- Backend principal Node/Express: `apps/api/server.js`
- Base PostgreSQL: schema défini dans `apps/api/schema.sql`
- Scripts métier Python (planning/poules): `apps/api/python/*.py`
- Outillage Docker Compose: `docker-compose.yml` (racine)

### 2.2 Rôles fonctionnels

- `Participant`: utilisateur standard (inscription/connexion + goodies).
- `Staff`: utilisateur avec profil staff (compétences + type de staff).
- `TeamMSB` (admin): gestion utilisateurs, jobs, créneaux, scripts de planning, poules.

### 2.3 Points importants d'architecture

- Le backend Node sert aussi le frontend build (`apps/frontend/build`) via `sendFrontendApp`.
- Le schema SQL est applique au démarrage du backend (`ensureSchedulingSchema` dans `server.js`).
- Les scripts Python sont lancés depuis le backend via un runner CLI (`run_v2_with_db.py`).
- Le backend utilise les sessions (`express-session` + `connect-pg-simple`), pas des JWT.

## 3. Arborescence utile de reprise

- `README.md`: quick start monorepo.
- `docker-compose.yml`: stack locale complète (postgres, api, frontend, pgadmin).
- `apps/api/server.js`: cœur API HTTP et logique d'auth/session.
- `apps/api/schema.sql`: schema BDD principal + tables planning/tournoi.
- `apps/api/seed-demo-data.js`: génération de données de demo volumineuses.
- `apps/api/python/run_v2_with_db.py`: orchestrateur scripts planning/poules/tournoi.
- `apps/api/python/planning_staff.py`: algorithme d'affectation staff/jobs.
- `apps/api/python/planning_tournoi.py`: algorithme de planification des matchs.
- `apps/api/python/créer_poules.py`: génération des poules.
- `apps/frontend/src/App.js`: routes frontend.
- `apps/frontend/src/context/AuthContext.jsx`: gestion session cote frontend.
- `apps/frontend/src/services/api.js`: client Axios (cookies + interceptors).

## 4. Prérequis de développement

### 4.1 Versions conseillées

- Node.js 18+ (images Docker en 18-alpine).
- npm 9+.
- PostgreSQL 15 (docker image `postgres:15-alpine`).
- Python 3.10+ (pour scripts planning).

### 4.2 Variables d'environnement backend

Fichier: `apps/api/.env`

Variables critiques:

- `DATABASE_URL` (obligatoire)
- `SESSION_SECRET` (obligatoire)
- `STAFF_CODE` (inscription staff)
- `ADMIN_CODE` (inscription admin)

Variables optionnelles (reset password par email):

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`

Variables optionnelles additionnelles:

- `PORT` (défaut: `80`)
- `FRONTEND_BUILD_DIR` (override du chemin build frontend)
- `PYTHON_BIN` (interpréteur Python explicite)

## 5. Comment lancer le site

## 5.1 Option A (recommandée en local): Node API + frontend build servi par API

Depuis la racine:

```bash
npm run install:all
npm run start:all
```

Equivalent interne:

- `npm --prefix apps/frontend run build`
- `npm --prefix apps/api run start`

Résultat:

- App accessible sur `http://localhost` (port 80 par défaut du backend)
- Le frontend est servi par Express depuis le build React.

## 5.2 Option B (développement frontend live)

Terminal 1:

```bash
cd apps/api
npm install
npm run start
```

Terminal 2:

```bash
cd apps/frontend
npm install
npm start
```

Résultat:

- Front: `http://localhost:3000`
- API: `http://localhost` (ou `http://localhost:80`)
- Le frontend appelle l'API via `REACT_APP_API_URL` (sinon baseURL vide => meme host).

## 5.3 Option C (Docker Compose complet)

Depuis la racine:

```bash
docker compose up --build
```

Services exposés:

- PostgreSQL: `localhost:5432`
- API: `localhost:80`
- Frontend container (mode CRA): `localhost:3000`
- pgAdmin: `localhost:5050`

Notes:

- Le service `postgres` initialise la DB avec `apps/api/schema.sql`.
- En container, l'API utilise `DATABASE_URL=postgres://postgres:123@postgres:5432/msb`.

## 5.4 Seed de données de demo

Depuis `apps/api`:

```bash
node seed-demo-data.js
```

Ce script:

- Tronque et recrée un jeu complet de données (users, staff, sports, équipes, créneaux, jobs...).
- Crée un compte admin de demo.
- Crée de nombreux comptes users/staff.
- Injecte compétences/disponibilites et jobs de planning.

## 6. Fonctionnement applicatif (vue métier)

## 6.1 Authentification et session

Flux:

1. Inscription via `/signup`, `/signup_staff` ou `/signup_admin`.
2. Connexion via `/login`.
3. Session stockée en DB table `session`.
4. Vérification role via middlewares `requireAuth`, `requireAdmin`, `requireStaff`.

Particularités:

- Les routes frontend sont protégées cote React (ProtectedRoute/AdminRoute).
- Le backend reste source de vérité pour les droits.

## 6.2 Goodies

- Un utilisateur passe/maj sa commande via `POST /api/orders`.
- Les admins consultent la synthèse et le détail via:
  - `GET /api/orders/summary`
  - `GET /api/orders/détail`
- Le schema force une commande unique par utilisateur (index unique + nettoyage).

## 6.3 Staff et planning

- Le profil staff est stocké dans `staff` (type `jour/nuit/mixte` + flags de compéténce).
- Les jobs sont stockés dans `jobs` (creneau, besoin, type compéténce, staff_assigned[]).
- Les scripts Python peuvent recalculer des affectations automatiques.

## 6.4 Tournoi

- Donnees sportives: `sport`, `équipe`, `poule`, `poule_équipe`, `terrain`, `match`.
- Scripts Python pour creation de poules et planning tournoi.

## 7. Base de données - modele de reference

Schema principal dans `apps/api/schema.sql`.

Tables cœur:

- `users`: comptes applicatifs.
- `session`: sessions Express stockées en DB.
- `goodies_orders`: commandes goodies.
- `staff`: profil staff lié à `users` + compétences booléennes + `staff_type`.
- `créneaux`: slots horaires (vendredi/samedi/dimanche).
- `jobs`: besoins staff par creneau/type.

Tables planning V2 (compatibilité):

- `compéténce`
- `staffeur_compéténce` (relié àujourd'hui vers `staff.id`)
- `staffeur_disponibilite` (relié vers `staff.id`)
- `affectation_staff`

Tables tournoi:

- `sport`
- `équipe`
- `poule`
- `poule_équipe`
- `terrain`
- `match`

Attention reprise:

- Le projet contient une couche "historique" de noms (`staffeur_*`) mais la source staff actuelle est `staff`.
- Bien verifier les migrations avant de renommer des tables en production.

## 8. API HTTP (backend Node) - cartographie

Les routes ci-dessous sont définies dans `apps/api/server.js`.

## 8.1 Routes applicatives (pages)

- `GET /`, `/goodies`, `/signup`, `/signup_admin`, `/signup_staff`, `/login`, `/about_us`
- `GET /orders`, `/users`, `/jobs`, `/admin/scripts`, `/admin/poules`, `/admin/poules/:sportId`, `/dashboard`
- Fallback: toutes les routes non `/api/*` servent le frontend build.

## 8.2 Auth/session

- `POST /signup`
- `POST /signup_staff`
- `POST /signup_admin`
- `POST /login`
- `POST /logout`
- `GET /api/me`
- `GET /session-info`
- `POST /forgot-password` (email temporaire si SMTP configure)

## 8.3 Goodies

- `POST /api/orders`
- `GET /api/orders/summary` (admin)
- `GET /api/orders/détail` (admin)

## 8.4 Utilisateurs

- `GET /api/users` (admin)
- `DELETE /api/users/:id` (admin)

## 8.5 Créneaux / Jobs

- `GET /api/créneaux`
- `POST /api/créneaux` (admin)
- `GET /api/jobs` (admin)
- `POST /api/jobs` (admin)
- `GET /api/jobs/available-staff` (admin)
- `PUT /api/jobs/:id/assign` (admin)
- `DELETE /api/jobs/:id` (admin)
- `GET /api/my-schedule`

## 8.6 Administration scripts et poules

- `GET /api/admin/scripts`
- `POST /api/admin/scripts/:scriptName/run`
- `GET /api/admin/poules/sports`
- `GET /api/admin/poules/sport/:sportId`

## 9. Frontend React - structure fonctionnelle

Fichier routeur principal: `apps/frontend/src/App.js`.

Routes principales:

- Accueil: `/accueil`
- Connexion: `/accueil/connexion`
- Inscriptions: `/accueil/inscription/*`
- Dashboard: `/dashboard`
- Staff: `/monplanning`, `/documents`
- Profil: `/profil`
- Goodies: `/goodies`, `/CommandeGoodies`
- Admin: `/users`, `/jobs`, `/orders`, `/admin/scripts`, `/admin/poules`

Auth frontend:

- `AuthContext` charge `/api/me` au démarrage.
- Donnees user normalisees en roles `TeamMSB|Staff|Participant`.
- Client Axios avec `withCredentials: true`.

## 10. Scripts Python métier - reprise détaillee

Dossier: `apps/api/python`.

## 10.1 `run_v2_with_db.py` (orchestrateur)

Responsabilités:

- Lire les données depuis PostgreSQL (`staff`, `créneaux`, `jobs`, etc.).
- Exécuter les modules métier:
  - `créer_poules`
  - `planning_staff`
  - `planning_tournoi`
- Ecrire les resultats en base si `--write-db`.

Commande type:

```bash
cd apps/api/python
python run_v2_with_db.py --script planning_staff --write-db
```

Options:

- `--script`: `créer_poules|planning_staff|planning_tournoi|all`
- `--max-par-poule`: limite équipes par poule
- `--write-db`: persist les resultats
- `--preserve-existing-staff`: garde les affectations deja presentes

## 10.2 `planning_staff.py` (affectation automatique)

Contraintes prises en compte:

- Disponibilite par creneau.
- Compéténce requise par job.
- Max 1 job par staff et par creneau.
- Preference heures max.
- Heures consecutives max.
- Equilibrage (priorite au staff avec moins d'heures).
- Regle jour/nuit:
  - `jour` ne prend pas de creneau >= 18:00
  - `nuit` ne prend pas de creneau < 18:00

Compatibilite IDs:

- Le planner accepte `id_staff` et `id_staffeur`.
- Les affectations exportent `id_staffeur` pour compatibilité insertion DB.

## 10.3 `run_v2_with_db.py` - point recent critique

Le runner cree automatiquement des créneaux par défaut si la table `créneaux` est vide (`ensure_default_créneaux`).

Créneaux auto-créés:

- Vendredi 09-10, 10-11
- Samedi 09-10, 10-11
- Dimanche 14-15, 15-16

## 10.4 `planning_tournoi.py`

- Genere les matchs round-robin par poule.
- Place les matchs sur créneaux + terrains disponibles.
- Evite qu'une équipe joue deux créneaux consecutifs.

## 11. Processus admin: runbook operationnel

## 11.1 Creation de créneaux/jobs

1. Créer/importer les créneaux (`/api/créneaux`).
2. Créer les jobs (`/api/jobs`) avec type de compéténce.
3. Verifier disponibilite staff (`/api/jobs/available-staff`).
4. Lancer script auto (`/api/admin/scripts/:scriptName/run`, `planning_staff`).
5. Ajuster manuellement via assignation jobs si besoin.

## 11.2 Generation planning global

1. Lancer `créer_poules`.
2. Lancer `planning_staff`.
3. Lancer `planning_tournoi`.
4. Ou lancer `all`.

## 11.3 Vérification post-run

- `GET /api/jobs`: controler `staff_assigned`.
- `GET /api/my-schedule`: controler planning utilisateur.
- `GET /api/admin/poules/sports` et `/sport/:sportId`: controler repartition tournoi.

## 12. Qualite, tests, et dette technique

Etat actuel:

- Pas de suite de tests automatisee robuste au niveau racine (`npm test` racine = placeholder).
- Frontend: scripts CRA standards (`npm test`) mais couverture non documentee.
- Backend: pas de tests integration fournis.

Recommandations prioritaires:

1. Ajouter tests API (supertest + postgres test DB).
2. Ajouter tests unitaires Python pour contraintes de planning.
3. Ajouter CI (lint + tests + smoke run script).
4. Ajouter snapshots de schema/migrations versionnees.

## 13. Risques de reprise et points d'attention

- Coexistence logique legacy (`staffeur_*`) et modele actuel (`staff`).
- Presence d'un `apps/api/python/main.py` FastAPI non reference par le backend Node (a considerer legacy).
- Donnees sensibles dans `.env` local: ne jamais commiter en clair dans les docs.
- `apps/api/node_modules` versionne localement dans workspace: verifier hygiene repo.
- Port 80 en local peut demander privileges selon environnement.

## 14. Procedures de diagnostic (troubleshooting)

## 14.1 Le frontend affiche "Frontend build is missing"

Cause:

- Le build React n'existe pas dans `apps/frontend/build`.

Fix:

```bash
cd apps/frontend
npm run build
cd ../api
npm run start
```

## 14.2 Erreur DB au démarrage API

Checks:

- `DATABASE_URL` valide.
- PostgreSQL accessible.
- Droits de creation table (schema bootstrap execute au démarrage).

## 14.3 Scripts planning non executes

Checks:

- Python disponible (`PYTHON_BIN` sinon `python3`).
- `DATABASE_URL` present dans env du backend.
- endpoint admin script retourne `stdout/stderr`: analyser la sortie.

## 14.4 Aucune affectation staff generee

Checks métier:

- Staff avec compétences compatibles.
- Disponibilites presentes (sinon fallback tous créneaux).
- Créneaux existants (ou auto-génération active si vide).
- Contrainte `jour/nuit` compatible avec horaires.

## 15. Plan de reprise recommandé (30-60-90 jours)

## 15.1 30 jours

- Stabiliser environnements (dev/staging/prod).
- Documenter secret management.
- Ecrire tests smoke API + scripts planning.

## 15.2 60 jours

- Refactor nomenclature DB (`staff` vs `staffeur_*`) avec migration propre.
- Clarifier la place du FastAPI `python/main.py` (supprimer ou formaliser).
- Introduire observabilite minimale (logs structures + erreurs centralisees).

## 15.3 90 jours

- CI/CD complète.
- Batteries de tests métier (planning staff/tournoi).
- Hardening sécurité session/cookies et audit dependances.

## 16. Checklist passation (a cocher)

- [ ] Acces repo + acces DB vérifiés.
- [ ] `.env` local reconfiguré proprement.
- [ ] Application lancee en local (frontend + API).
- [ ] Script seed execute et valide.
- [ ] Run script `planning_staff` valide en dry-run puis write-db.
- [ ] Vérification d'un cycle complet admin (jobs, scripts, planning staff).
- [ ] Vérification d'un cycle utilisateur (signup/login/commande goodies).
- [ ] Vérification d'un cycle tournoi (poules + matchs).
- [ ] Documentation interne équipe complètee (contacts, decisions, backlog).

## 17. Annexes utiles

Commandes monorepo racine:

```bash
npm run install:all
npm run build:frontend
npm run start:api
npm run start:all
```

Commandes API:

```bash
cd apps/api
npm install
npm run start
npm run start:all
node seed-demo-data.js
```

Commandes scripts Python planning:

```bash
cd apps/api/python
python run_v2_with_db.py --script planning_staff
python run_v2_with_db.py --script planning_staff --write-db
python run_v2_with_db.py --script all --write-db
```

Commande Docker:

```bash
docker compose up --build
```

---

Document de passation cree le 11/03/2026.
A maintenir à chaque évolution significative (schema BDD, routes API, scripts métier, processus d'exploitation).
