require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const DEFAULT_PASSWORD = 'Password123!';

const FIRST_NAMES = [
  'Alex','Sam','Jordan','Taylor','Casey','Drew','Morgan','Riley','Cameron','Hayden',
  'Jamie','Quinn','Parker','Reese','Skyler','Avery','Charlie','Emerson','Finley','Harper',
  'Logan','Sydney','Rowan','Elliot','Milan','Blake','Sacha','Noa','Robin','Lou','Eden','Nikki','Alexis','Kris','Shawn','Jess','Marin','Jules','Bailey'
];

const LAST_NAMES = [
  'Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Lopez','Wilson',
  'Anderson','Thomas','Taylor','Moore','Jackson','Martin','Lee','Perez','Thompson','White',
  'Harris','Clark','Lewis','Walker','Hall','Allen','Young','King','Wright','Scott','Green','Baker','Adams','Nelson','Carter','Mitchell','Roberts','Turner','Phillips','Campbell'
];

function uniqueName(i) {
  const first = FIRST_NAMES[i % FIRST_NAMES.length];
  const last = LAST_NAMES[Math.floor(i / FIRST_NAMES.length) % LAST_NAMES.length];
  return { first_name: first, last_name: `${last}-${i + 1}` };
}

function randomBool() {
  return Math.random() < 0.5 ? 1 : 0;
}

function randomStaffType() {
  const types = ['jour', 'nuit', 'mixte'];
  return types[Math.floor(Math.random() * types.length)];
}

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

async function upsertUser(client, { username, email, first_name, last_name, is_admin = 0 }) {
  const password_hash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
  const { rows } = await client.query(
    `INSERT INTO users (username, email, password_hash, first_name, last_name, is_admin)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (email) DO UPDATE SET
       username = EXCLUDED.username,
       first_name = EXCLUDED.first_name,
       last_name = EXCLUDED.last_name,
       is_admin = EXCLUDED.is_admin
     RETURNING id`,
    [username, email, password_hash, first_name, last_name, is_admin]
  );
  return rows[0].id;
}

async function upsertStaff(client, user_id) {
  const staff_type = randomStaffType();
  const bar = randomBool();
  const cuisine = randomBool();
  const arbitre_beach_rugby = randomBool();
  const arbitre_beach_soccer = randomBool();
  const arbitre_beach_volley = randomBool();
  const arbitre_dodgeball = randomBool();
  const arbitre_handball = randomBool();

  await client.query(
    `INSERT INTO staff (user_id, bar, cuisine, arbitre_beach_rugby, arbitre_beach_soccer, arbitre_beach_volley, arbitre_dodgeball, arbitre_handball, staff_type)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     ON CONFLICT (user_id) DO UPDATE SET
       bar = EXCLUDED.bar,
       cuisine = EXCLUDED.cuisine,
       arbitre_beach_rugby = EXCLUDED.arbitre_beach_rugby,
       arbitre_beach_soccer = EXCLUDED.arbitre_beach_soccer,
       arbitre_beach_volley = EXCLUDED.arbitre_beach_volley,
       arbitre_dodgeball = EXCLUDED.arbitre_dodgeball,
       arbitre_handball = EXCLUDED.arbitre_handball,
       staff_type = EXCLUDED.staff_type,
       updated_at = CURRENT_TIMESTAMP
    `,
    [user_id, bar, cuisine, arbitre_beach_rugby, arbitre_beach_soccer, arbitre_beach_volley, arbitre_dodgeball, arbitre_handball, staff_type]
  );
}

async function ensureTeamMembershipSchema(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS equipe_user (
      id_equipe_user SERIAL PRIMARY KEY,
      id_equipe INT NOT NULL REFERENCES equipe(id_equipe) ON DELETE CASCADE,
      user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (id_equipe, user_id),
      UNIQUE (user_id)
    )
  `);
}

async function seedSports(client) {
  const sports = [
    ['Beach Volley', 6, 'sable'],
    ['Beach Soccer', 5, 'sable'],
    ['Beach Rugby', 7, 'sable'],
    ['Dodgeball', 6, 'sable'],
    ['Sandball', 7, 'sable']
  ];

  const sportIds = [];
  for (const [nom_sport, nb_joueurs_equipe, type_terrain] of sports) {
    const { rows } = await client.query(
      `INSERT INTO sport (nom_sport, nb_joueurs_equipe, type_terrain)
       VALUES ($1, $2, $3)
       ON CONFLICT DO NOTHING
       RETURNING id_sport`,
      [nom_sport, nb_joueurs_equipe, type_terrain]
    );

    if (rows[0]?.id_sport) {
      sportIds.push(rows[0].id_sport);
      continue;
    }

    const existing = await client.query(
      `SELECT id_sport FROM sport WHERE nom_sport = $1 ORDER BY id_sport LIMIT 1`,
      [nom_sport]
    );
    if (existing.rows[0]?.id_sport) {
      sportIds.push(existing.rows[0].id_sport);
    }
  }

  return sportIds;
}

async function seedTeamsAndMembership(client) {
  await ensureTeamMembershipSchema(client);

  const sportIds = await seedSports(client);
  if (!sportIds.length) {
    throw new Error('No sports available to create teams');
  }

  const { rows: users } = await client.query(
    `SELECT u.id
     FROM users u
     LEFT JOIN staff s ON s.user_id = u.id
     WHERE u.is_admin = 0 AND s.id IS NULL
     ORDER BY u.id`
  );

  const userIds = users.map((u) => u.id);
  if (!userIds.length) {
    return { regularUsers: 0, teams: 0, memberships: 0 };
  }

  const teamSize = 8;
  const categories = ['Mixte', 'Feminin', 'Masculin'];
  const niveaux = ['Loisir', 'Championship'];

  const teamIds = [];
  const teamCount = Math.max(1, Math.ceil(userIds.length / teamSize));

  for (let i = 0; i < teamCount; i++) {
    const sportId = sportIds[i % sportIds.length];
    const categorie = categories[i % categories.length];
    const niveau = niveaux[i % niveaux.length];

    const { rows } = await client.query(
      `INSERT INTO equipe (nom_equipe, id_sport, categorie, niveau, nb_joueurs)
       VALUES ($1, $2, $3::categorie_equipe_type, $4::niveau_type, 0)
       RETURNING id_equipe`,
      [`Equipe_${String(i + 1).padStart(3, '0')}`, sportId, categorie, niveau]
    );
    teamIds.push(rows[0].id_equipe);
  }

  let memberships = 0;
  for (let i = 0; i < userIds.length; i++) {
    const idEquipe = teamIds[i % teamIds.length];
    const userId = userIds[i];

    await client.query(
      `INSERT INTO equipe_user (id_equipe, user_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id) DO UPDATE SET id_equipe = EXCLUDED.id_equipe`,
      [idEquipe, userId]
    );
    memberships += 1;
  }

  await client.query(
    `UPDATE equipe e
     SET nb_joueurs = m.cnt
     FROM (
       SELECT id_equipe, COUNT(*)::int AS cnt
       FROM equipe_user
       GROUP BY id_equipe
     ) AS m
     WHERE e.id_equipe = m.id_equipe`
  );

  return {
    regularUsers: userIds.length,
    teams: teamIds.length,
    memberships,
  };
}

async function seedCreneaux(client) {
  const slots = [
    ['vendredi', 9, 10, 'Vendredi 09:00-10:00'],
    ['vendredi', 10, 11, 'Vendredi 10:00-11:00'],
    ['samedi', 9, 10, 'Samedi 09:00-10:00'],
    ['samedi', 10, 11, 'Samedi 10:00-11:00'],
    ['dimanche', 14, 15, 'Dimanche 14:00-15:00'],
    ['dimanche', 15, 16, 'Dimanche 15:00-16:00'],
  ];

  const creneauIds = [];
  for (const [day_of_week, start_hour, end_hour, label] of slots) {
    const { rows } = await client.query(
      `INSERT INTO creneaux (day_of_week, start_hour, end_hour, label)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (day_of_week, start_hour, end_hour)
       DO UPDATE SET label = EXCLUDED.label
       RETURNING id`,
      [day_of_week, start_hour, end_hour, label]
    );
    creneauIds.push(rows[0].id);
  }
  return creneauIds;
}

async function seedJobs(client, creneauIds) {
  const jobsData = [
    [creneauIds[0], 6, 1, 'Service buvette'],
    [creneauIds[1], 4, 2, 'Production cuisine'],
    [creneauIds[2], 4, 3, 'Arbitrage Beach Rugby'],
    [creneauIds[3], 4, 4, 'Arbitrage Beach Soccer'],
    [creneauIds[4], 4, 5, 'Arbitrage Beach Volley'],
    [creneauIds[5], 3, 6, 'Arbitrage Dodgeball'],
  ];

  for (const [creneau, staff_needed, staff_type, description] of jobsData) {
    await client.query(
      `INSERT INTO jobs (creneau, staff_needed, staff_type, description, staff_assigned)
       VALUES ($1, $2, $3, $4, '{}')`,
      [creneau, staff_needed, staff_type, description]
    );
  }
}

async function seedPlanningCompetencesAndDisponibilites(client, creneauIds) {
  const competences = [
    [1, 'Bar', 'Bar'],
    [2, 'Cuisine', 'Cuisine'],
    [3, 'Arbitrage Beach Rugby', 'Arbitrage'],
    [4, 'Arbitrage Beach Soccer', 'Arbitrage'],
    [5, 'Arbitrage Beach Volley', 'Arbitrage'],
    [6, 'Arbitrage Dodgeball', 'Arbitrage'],
    [7, 'Arbitrage Handball', 'Arbitrage'],
  ];

  for (const [id_competence, nom_competence, categorie] of competences) {
    await client.query(
      `INSERT INTO competence (id_competence, nom_competence, categorie)
       VALUES ($1, $2, $3::competence_categorie_type)
       ON CONFLICT (id_competence) DO UPDATE SET
         nom_competence = EXCLUDED.nom_competence,
         categorie = EXCLUDED.categorie`,
      [id_competence, nom_competence, categorie]
    );
  }

  const { rows: staffRows } = await client.query(
    `SELECT id, staff_type, bar, cuisine, arbitre_beach_rugby, arbitre_beach_soccer,
            arbitre_beach_volley, arbitre_dodgeball, arbitre_handball
     FROM staff
     ORDER BY id`
  );

  for (const s of staffRows) {
    const compIds = [];
    if (Number(s.bar) === 1) compIds.push(1);
    if (Number(s.cuisine) === 1) compIds.push(2);
    if (Number(s.arbitre_beach_rugby) === 1) compIds.push(3);
    if (Number(s.arbitre_beach_soccer) === 1) compIds.push(4);
    if (Number(s.arbitre_beach_volley) === 1) compIds.push(5);
    if (Number(s.arbitre_dodgeball) === 1) compIds.push(6);
    if (Number(s.arbitre_handball) === 1) compIds.push(7);

    // Guarantee at least one competence so every staff profile is usable by the planner.
    if (!compIds.length) {
      compIds.push(1 + Math.floor(Math.random() * 7));
    }

    for (const id_competence of compIds) {
      await client.query(
        `INSERT INTO staffeur_competence (id_staffeur, id_competence)
         VALUES ($1, $2)
         ON CONFLICT (id_staffeur, id_competence) DO NOTHING`,
        [s.id, id_competence]
      );
    }

    let poolIds = [...creneauIds];
    if (s.staff_type === 'jour') {
      poolIds = creneauIds.filter((id, idx) => idx <= 3);
    } else if (s.staff_type === 'nuit') {
      poolIds = creneauIds.filter((id, idx) => idx >= 2);
    }

    const selected = shuffle(poolIds).slice(0, Math.max(2, Math.ceil(poolIds.length * 0.65)));
    for (const id_creneau of selected) {
      await client.query(
        `INSERT INTO staffeur_disponibilite (id_staffeur, id_creneau)
         VALUES ($1, $2)
         ON CONFLICT (id_staffeur, id_creneau) DO NOTHING`,
        [s.id, id_creneau]
      );
    }
  }
}

async function truncateExistingTables(client) {
  const tablesInOrder = [
    'match',
    'jobs',
    'creneaux',
    'poule_equipe',
    'poule',
    'equipe_user',
    'equipe',
    'sport',
    'affectation_staff',
    'staffeur_disponibilite',
    'staffeur_competence',
    'competence',
    'goodies_orders',
    'staff',
    'users',
  ];

  const existing = [];
  for (const t of tablesInOrder) {
    const { rows } = await client.query('SELECT to_regclass($1) AS reg', [`public.${t}`]);
    if (rows[0]?.reg) {
      existing.push(t);
    }
  }

  if (!existing.length) {
    return;
  }

  const quoted = existing.map((t) => `"${t}"`).join(', ');
  await client.query(`TRUNCATE TABLE ${quoted} RESTART IDENTITY CASCADE`);
}

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  try {
    console.log('Seeding demo data...');
    await client.query('BEGIN');

    await truncateExistingTables(client);

    const adminId = await upsertUser(client, {
      username: 'admin',
      email: 'admin@example.com',
      first_name: 'Admin',
      last_name: 'User',
      is_admin: 1
    });
    console.log('Admin id:', adminId);

    for (let i = 0; i < 1400; i++) {
      const { first_name, last_name } = uniqueName(i);
      const username = `user${i + 1}`;
      const email = `user${i + 1}@example.com`;
      await upsertUser(client, { username, email, first_name, last_name, is_admin: 0 });
      if ((i + 1) % 200 === 0) console.log(`Inserted users: ${i + 1}`);
    }

    for (let i = 0; i < 100; i++) {
      const { first_name, last_name } = uniqueName(1400 + i);
      const username = `staff${i + 1}`;
      const email = `staff${i + 1}@example.com`;
      const userId = await upsertUser(client, { username, email, first_name, last_name, is_admin: 0 });
      await upsertStaff(client, userId);
      if ((i + 1) % 20 === 0) console.log(`Inserted staff: ${i + 1}`);
    }

    const creneauIds = await seedCreneaux(client);
    await seedJobs(client, creneauIds);
    await seedPlanningCompetencesAndDisponibilites(client, creneauIds);
    console.log('Slots created:', creneauIds.length);
    console.log('Jobs created:', 6);

    const teamStats = await seedTeamsAndMembership(client);
    console.log('Regular users assigned to teams:', teamStats.regularUsers);
    console.log('Teams created:', teamStats.teams);
    console.log('Team memberships created:', teamStats.memberships);

    await client.query('COMMIT');
    console.log('Seeding complete.');
    console.log('Login password for all accounts:', DEFAULT_PASSWORD);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seeding failed:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
