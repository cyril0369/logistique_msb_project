BEGIN;

-- =====================================================
-- Types ENUM (création idempotente)
-- =====================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'genre_type') THEN
    CREATE TYPE genre_type AS ENUM ('Femme', 'Homme', 'Autre');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'personne_statut_type') THEN
    CREATE TYPE personne_statut_type AS ENUM ('TeamMSB', 'Staff', 'Participant');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'taille_tshirt_type') THEN
    CREATE TYPE taille_tshirt_type AS ENUM ('S', 'M', 'L');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'type_staff_type') THEN
    CREATE TYPE type_staff_type AS ENUM ('Mixte', 'Jour', 'Nuit');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'competence_categorie_type') THEN
    CREATE TYPE competence_categorie_type AS ENUM ('Bar', 'Cuisine', 'Arbitrage', 'Logistique', 'Securite', 'Animation', 'Secours');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'jour_type') THEN
    CREATE TYPE jour_type AS ENUM ('Vendredi', 'Samedi', 'Dimanche');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role_msb_type') THEN
    CREATE TYPE role_msb_type AS ENUM ('Responsable', 'Membre');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'categorie_equipe_type') THEN
    CREATE TYPE categorie_equipe_type AS ENUM ('Feminin', 'Masculin', 'Mixte');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'niveau_type') THEN
    CREATE TYPE niveau_type AS ENUM ('Championship', 'Loisir');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'terrain_statut_type') THEN
    CREATE TYPE terrain_statut_type AS ENUM ('Disponible', 'Non disponible');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS ecole (
  id_ecole SERIAL PRIMARY KEY,
  nom_ecole VARCHAR(150) NOT NULL,
  ville VARCHAR(100),
  code_ecole VARCHAR(20) UNIQUE
);

CREATE TABLE IF NOT EXISTS personne (
  id_personne SERIAL PRIMARY KEY,
  prenom VARCHAR(100) NOT NULL,
  nom VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  mot_de_passe VARCHAR(255) NOT NULL,
  telephone VARCHAR(20),
  genre genre_type,
  statut personne_statut_type NOT NULL,
  taille_tshirt taille_tshirt_type,
  regime_alimentaire TEXT,
  remarques TEXT,
  id_ecole INT REFERENCES ecole(id_ecole) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS staffeur (
  id_staffeur SERIAL PRIMARY KEY,
  id_personne INT UNIQUE NOT NULL REFERENCES personne(id_personne) ON DELETE CASCADE,
  type_staff type_staff_type,
  staff_autres_assos BOOLEAN DEFAULT FALSE,
  participation_pompims BOOLEAN DEFAULT FALSE,
  preference_heures_max INT,
  contrainte_heures_consecutives_max INT,
  remarques_staff TEXT
);

CREATE TABLE IF NOT EXISTS competence (
  id_competence SERIAL PRIMARY KEY,
  nom_competence VARCHAR(150) NOT NULL,
  categorie competence_categorie_type NOT NULL
);

CREATE TABLE IF NOT EXISTS staffeur_competence (
  id_staffeur_competence SERIAL PRIMARY KEY,
  id_staffeur INT NOT NULL REFERENCES staffeur(id_staffeur) ON DELETE CASCADE,
  id_competence INT NOT NULL REFERENCES competence(id_competence) ON DELETE CASCADE,
  UNIQUE (id_staffeur, id_competence)
);

CREATE TABLE IF NOT EXISTS creneau (
  id_creneau SERIAL PRIMARY KEY,
  jour jour_type NOT NULL,
  heure_debut TIME NOT NULL,
  heure_fin TIME NOT NULL,
  libelle VARCHAR(50),
  UNIQUE (jour, heure_debut, heure_fin)
);

CREATE TABLE IF NOT EXISTS staffeur_disponibilite (
  id_disponibilite SERIAL PRIMARY KEY,
  id_staffeur INT NOT NULL REFERENCES staffeur(id_staffeur) ON DELETE CASCADE,
  id_creneau INT NOT NULL REFERENCES creneau(id_creneau) ON DELETE CASCADE,
  UNIQUE (id_staffeur, id_creneau)
);

CREATE TABLE IF NOT EXISTS pole_msb (
  id_pole SERIAL PRIMARY KEY,
  nom_pole VARCHAR(100) NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS membre_msb (
  id_membre_msb SERIAL PRIMARY KEY,
  id_personne INT NOT NULL REFERENCES personne(id_personne) ON DELETE CASCADE,
  id_pole INT REFERENCES pole_msb(id_pole) ON DELETE SET NULL,
  role role_msb_type
);

CREATE TABLE IF NOT EXISTS job (
  id_job SERIAL PRIMARY KEY,
  nom_job VARCHAR(150) NOT NULL,
  id_pole INT REFERENCES pole_msb(id_pole) ON DELETE SET NULL,
  id_competence_requise INT REFERENCES competence(id_competence) ON DELETE SET NULL,
  id_creneau INT REFERENCES creneau(id_creneau) ON DELETE SET NULL,
  nb_staffeurs_min INT,
  nb_staffeurs_max INT,
  description TEXT
);

CREATE TABLE IF NOT EXISTS sport (
  id_sport SERIAL PRIMARY KEY,
  nom_sport VARCHAR(100) NOT NULL,
  nb_joueurs_equipe INT,
  type_terrain VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS equipe (
  id_equipe SERIAL PRIMARY KEY,
  nom_equipe VARCHAR(100) NOT NULL,
  id_sport INT REFERENCES sport(id_sport) ON DELETE CASCADE,
  categorie categorie_equipe_type,
  niveau niveau_type,
  nb_joueurs INT
);

CREATE TABLE IF NOT EXISTS equipe_membre (
  id_equipe_membre SERIAL PRIMARY KEY,
  id_equipe INT NOT NULL REFERENCES equipe(id_equipe) ON DELETE CASCADE,
  id_personne INT NOT NULL REFERENCES personne(id_personne) ON DELETE CASCADE,
  UNIQUE (id_equipe, id_personne)
);

CREATE TABLE IF NOT EXISTS poule (
  id_poule SERIAL PRIMARY KEY,
  id_sport INT REFERENCES sport(id_sport) ON DELETE CASCADE,
  nom_poule VARCHAR(50),
  niveau niveau_type,
  categorie categorie_equipe_type
);

CREATE TABLE IF NOT EXISTS poule_equipe (
  id_poule_equipe SERIAL PRIMARY KEY,
  id_poule INT NOT NULL REFERENCES poule(id_poule) ON DELETE CASCADE,
  id_equipe INT NOT NULL REFERENCES equipe(id_equipe) ON DELETE CASCADE,
  position INT,
  UNIQUE (id_poule, id_equipe)
);

CREATE TABLE IF NOT EXISTS terrain (
  id_terrain SERIAL PRIMARY KEY,
  nom_terrain VARCHAR(100) NOT NULL,
  type_terrain VARCHAR(50),
  statut terrain_statut_type DEFAULT 'Disponible'
);

CREATE TABLE IF NOT EXISTS match (
  id_match SERIAL PRIMARY KEY,
  id_poule INT REFERENCES poule(id_poule) ON DELETE SET NULL,
  id_sport INT REFERENCES sport(id_sport) ON DELETE SET NULL,
  id_terrain INT REFERENCES terrain(id_terrain) ON DELETE SET NULL,
  id_creneau INT REFERENCES creneau(id_creneau) ON DELETE SET NULL,
  id_equipe1 INT REFERENCES equipe(id_equipe) ON DELETE SET NULL,
  id_equipe2 INT REFERENCES equipe(id_equipe) ON DELETE SET NULL,
  score_equipe1 INT,
  score_equipe2 INT,
  statut VARCHAR(30) DEFAULT 'Planifie'
);

CREATE TABLE IF NOT EXISTS affectation_staff (
  id_affectation SERIAL PRIMARY KEY,
  id_staffeur INT NOT NULL REFERENCES staffeur(id_staffeur) ON DELETE CASCADE,
  id_job INT NOT NULL REFERENCES job(id_job) ON DELETE CASCADE,
  UNIQUE (id_staffeur, id_job)
);

-- =====================================================
-- Données minimales d'initialisation
-- =====================================================
INSERT INTO ecole (nom_ecole, ville, code_ecole)
VALUES ('Centrale Marseille', 'Marseille', 'CMA')
ON CONFLICT (code_ecole) DO NOTHING;

INSERT INTO personne (prenom, nom, email, mot_de_passe, telephone, genre, statut, taille_tshirt, regime_alimentaire, remarques, id_ecole)
VALUES ('Admin', 'MSB', 'admin@msb.com', 'admin123', '0600000000', 'Homme', 'Staff', 'M', 'Aucun', 'Compte seed',
        (SELECT id_ecole FROM ecole WHERE code_ecole = 'CMA'))
ON CONFLICT (email) DO NOTHING;

INSERT INTO staffeur (id_personne, type_staff, staff_autres_assos, participation_pompims, preference_heures_max, contrainte_heures_consecutives_max, remarques_staff)
SELECT p.id_personne, 'Mixte', FALSE, FALSE, 12, 6, 'Staff admin'
FROM personne p
WHERE p.email = 'admin@msb.com'
ON CONFLICT (id_personne) DO NOTHING;

COMMIT;
