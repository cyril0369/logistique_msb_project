


CREATE SCHEMA IF NOT EXISTS public;
SET search_path TO public;

-- DROP TABLE IF EXISTS goodies_orders CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;
-- DROP TABLE IF EXISTS session CASCADE;

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  gender VARCHAR(10),
  
  is_admin INTEGER DEFAULT 0,
  is_staff INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS session (
  sid VARCHAR NOT NULL COLLATE "default",
  sess JSON NOT NULL,
  expire TIMESTAMP(6) NOT NULL,
  PRIMARY KEY (sid)
);

CREATE INDEX IF NOT EXISTS IDX_session_expire ON session (expire);

CREATE TABLE IF NOT EXISTS goodies_orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  tshirt_qty INTEGER DEFAULT 0,
  bob_qty INTEGER DEFAULT 0,
  short_qty INTEGER DEFAULT 0,
  maillot_qty INTEGER DEFAULT 0,
  gourde_qty INTEGER DEFAULT 0,
  gourd_qty INTEGER DEFAULT 0,
  goodie3_qty INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE goodies_orders ADD COLUMN IF NOT EXISTS bob_qty INTEGER DEFAULT 0;
ALTER TABLE goodies_orders ADD COLUMN IF NOT EXISTS short_qty INTEGER DEFAULT 0;
ALTER TABLE goodies_orders ADD COLUMN IF NOT EXISTS maillot_qty INTEGER DEFAULT 0;
ALTER TABLE goodies_orders ADD COLUMN IF NOT EXISTS gourde_qty INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_goodies_orders_user_id ON goodies_orders(user_id);

CREATE TABLE IF NOT EXISTS staff (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  username_snapshot VARCHAR(255),
  email_snapshot VARCHAR(255),
  first_name_snapshot VARCHAR(255),
  last_name_snapshot VARCHAR(255),
  phone_snapshot VARCHAR(20),
  staff_code_validated INTEGER DEFAULT 0,
  bar INTEGER DEFAULT 0,
  cuisine INTEGER DEFAULT 0,
  arbitre_beach_rugby INTEGER DEFAULT 0,
  arbitre_beach_soccer INTEGER DEFAULT 0,
  arbitre_beach_volley INTEGER DEFAULT 0,
  arbitre_dodgeball INTEGER DEFAULT 0,
  arbitre_handball INTEGER DEFAULT 0,
  staff_type VARCHAR(10),
  CHECK (staff_type IN ('jour','nuit','mixte')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Backward-compatible schema upgrades for existing databases.
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_staff INTEGER DEFAULT 0;

ALTER TABLE staff ADD COLUMN IF NOT EXISTS username_snapshot VARCHAR(255);
ALTER TABLE staff ADD COLUMN IF NOT EXISTS email_snapshot VARCHAR(255);
ALTER TABLE staff ADD COLUMN IF NOT EXISTS first_name_snapshot VARCHAR(255);
ALTER TABLE staff ADD COLUMN IF NOT EXISTS last_name_snapshot VARCHAR(255);
ALTER TABLE staff ADD COLUMN IF NOT EXISTS phone_snapshot VARCHAR(20);
ALTER TABLE staff ADD COLUMN IF NOT EXISTS staff_code_validated INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_staff_user_id ON staff(user_id);

CREATE TABLE IF NOT EXISTS creneaux (
  id SERIAL PRIMARY KEY,
  day_of_week VARCHAR(10) NOT NULL,
  start_hour INTEGER NOT NULL,
  end_hour INTEGER NOT NULL,
  label VARCHAR(120),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CHECK (day_of_week IN ('vendredi','samedi','dimanche')),
  CHECK (start_hour >= 0 AND start_hour <= 23),
  CHECK (end_hour >= 1 AND end_hour <= 24),
  CHECK (end_hour > start_hour),
  UNIQUE(day_of_week, start_hour, end_hour)
);

CREATE INDEX IF NOT EXISTS idx_creneaux_day_hour ON creneaux(day_of_week, start_hour);

CREATE TABLE IF NOT EXISTS jobs (
  id SERIAL PRIMARY KEY,
  creneau INTEGER NOT NULL REFERENCES creneaux(id),
  staff_needed INTEGER NOT NULL DEFAULT 1,
  staff_type INTEGER NOT NULL,
  description TEXT,
  staff_assigned INTEGER[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_jobs_creneau ON jobs(creneau);
CREATE INDEX IF NOT EXISTS idx_jobs_staff_type ON jobs(staff_type);

-- =====================================================
-- V2 planning/tournament compatibility block (additive)
-- This section is intentionally independent from existing
-- users/session/staff/creneaux/jobs tables.
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'jour_type') THEN
    CREATE TYPE jour_type AS ENUM ('Vendredi', 'Samedi', 'Dimanche');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'type_staff_type') THEN
    CREATE TYPE type_staff_type AS ENUM ('Mixte', 'Jour', 'Nuit');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'competence_categorie_type') THEN
    CREATE TYPE competence_categorie_type AS ENUM (
      'Bar', 'Cuisine', 'Arbitrage', 'Logistique', 'Securite', 'Animation', 'Secours'
    );
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

CREATE TABLE IF NOT EXISTS competence (
  id_competence SERIAL PRIMARY KEY,
  nom_competence VARCHAR(150) NOT NULL,
  categorie competence_categorie_type NOT NULL
);

CREATE TABLE IF NOT EXISTS staffeur_competence (
  id_staffeur_competence SERIAL PRIMARY KEY,
  id_staffeur INT NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  id_competence INT NOT NULL REFERENCES competence(id_competence) ON DELETE CASCADE,
  UNIQUE (id_staffeur, id_competence)
);

CREATE TABLE IF NOT EXISTS staffeur_disponibilite (
  id_disponibilite SERIAL PRIMARY KEY,
  id_staffeur INT NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  id_creneau INT NOT NULL REFERENCES creneaux(id) ON DELETE CASCADE,
  UNIQUE (id_staffeur, id_creneau)
);

CREATE TABLE IF NOT EXISTS affectation_staff (
  id_affectation SERIAL PRIMARY KEY,
  id_staffeur INT NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  id_job INT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  UNIQUE (id_staffeur, id_job)
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
  id_creneau INT REFERENCES creneaux(id) ON DELETE SET NULL,
  id_equipe1 INT REFERENCES equipe(id_equipe) ON DELETE SET NULL,
  id_equipe2 INT REFERENCES equipe(id_equipe) ON DELETE SET NULL,
  score_equipe1 INT,
  score_equipe2 INT,
  statut VARCHAR(30) DEFAULT 'Planifie'
);

CREATE INDEX IF NOT EXISTS idx_staffeur_dispo_staff ON staffeur_disponibilite(id_staffeur);
CREATE INDEX IF NOT EXISTS idx_staffeur_dispo_creneau ON staffeur_disponibilite(id_creneau);
CREATE INDEX IF NOT EXISTS idx_equipe_sport ON equipe(id_sport);
CREATE INDEX IF NOT EXISTS idx_poule_sport ON poule(id_sport);
CREATE INDEX IF NOT EXISTS idx_match_creneau ON match(id_creneau);
CREATE INDEX IF NOT EXISTS idx_match_terrain ON match(id_terrain);
