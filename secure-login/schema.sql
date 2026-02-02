


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
  gourd_qty INTEGER DEFAULT 0,
  goodie3_qty INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_goodies_orders_user_id ON goodies_orders(user_id);

CREATE TABLE IF NOT EXISTS staff (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
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

CREATE INDEX IF NOT EXISTS idx_staff_user_id ON staff(user_id);

CREATE TABLE IF NOT EXISTS jobs (
  id SERIAL PRIMARY KEY,
  creneau INTEGER NOT NULL,
  staff_needed INTEGER NOT NULL DEFAULT 1,
  staff_type INTEGER NOT NULL,
  description TEXT,
  staff_assigned INTEGER[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_jobs_creneau ON jobs(creneau);
CREATE INDEX IF NOT EXISTS idx_jobs_staff_type ON jobs(staff_type);
