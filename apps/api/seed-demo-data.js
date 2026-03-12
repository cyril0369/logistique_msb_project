require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const DEFAULT_PASSWORD = 'Password123!';
const DEMO_ADMIN_COUNT = 1;
const DEMO_USER_COUNT = 200;
const DEMO_STAFF_COUNT = 20;

const JOHNNY_CASH_PROFILE = {
  username: 'johnnycash',
  email: 'johnny.cash@example.com',
  first_name: 'Johnny',
  last_name: 'Cash',
  staff_type: 'nuit',
  competenceIds: [1, 2, 6],
  reservedSlots: [
    ['vendredi', 18, 19, 1, 'Buvette backstage'],
    ['vendredi', 19, 20, 2, 'Cuisine artistes'],
    ['vendredi', 21, 22, 6, 'Arbitrage dodgeball nocturne'],
    ['samedi', 18, 19, 1, 'Buvette backstage'],
    ['samedi', 19, 20, 2, 'Cuisine artistes'],
    ['samedi', 20, 21, 6, 'Arbitrage dodgeball nocturne'],
    ['samedi', 22, 23, 1, 'Buvette concert'],
    ['dimanche', 18, 19, 2, 'Cuisine fermeture logistique'],
  ],
};

const COMPETENCE_ID_TO_STAFF_COLUMN = {
  1: 'bar',
  2: 'cuisine',
  3: 'arbitre_beach_rugby',
  4: 'arbitre_beach_soccer',
  5: 'arbitre_beach_volley',
  6: 'arbitre_dodgeball',
  7: 'arbitre_handball',
};

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

function staffTypeForIndex(i) {
  if (i < 8) return 'jour';
  if (i < 14) return 'nuit';
  return 'mixte';
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

async function upsertStaff(client, user_id, forcedStaffType = null) {
  const staff_type = forcedStaffType || 'mixte';
  await client.query(
    `INSERT INTO staff (user_id, staff_type)
     VALUES ($1, $2)
     ON CONFLICT (user_id) DO UPDATE SET
       staff_type = EXCLUDED.staff_type,
       updated_at = CURRENT_TIMESTAMP
    `,
    [user_id, staff_type]
  );

  await client.query(
    `UPDATE users SET is_staff = 1 WHERE id = $1`,
    [user_id]
  );
}

async function removeAdminStaff(client) {
  await client.query(
    `DELETE FROM staff s
     USING users u
     WHERE s.user_id = u.id AND COALESCE(u.is_admin, 0) = 1`
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
    ['vendredi', 14, 15, 'Vendredi 14:00-15:00'],
    ['vendredi', 20, 21, 'Vendredi 20:00-21:00'],
    ['samedi', 9, 10, 'Samedi 09:00-10:00'],
    ['samedi', 10, 11, 'Samedi 10:00-11:00'],
    ['samedi', 14, 15, 'Samedi 14:00-15:00'],
    ['samedi', 21, 22, 'Samedi 21:00-22:00'],
    ['dimanche', 9, 10, 'Dimanche 09:00-10:00'],
    ['dimanche', 14, 15, 'Dimanche 14:00-15:00'],
    ['dimanche', 20, 21, 'Dimanche 20:00-21:00'],
    ...JOHNNY_CASH_PROFILE.reservedSlots.map(([day_of_week, start_hour, end_hour]) => [
      day_of_week,
      start_hour,
      end_hour,
      `${day_of_week[0].toUpperCase()}${day_of_week.slice(1)} ${String(start_hour).padStart(2, '0')}:00-${String(end_hour).padStart(2, '0')}:00`,
    ]),
  ];

  const creneaux = [];
  for (const [day_of_week, start_hour, end_hour, label] of slots) {
    const { rows } = await client.query(
      `INSERT INTO creneaux (day_of_week, start_hour, end_hour, label)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (day_of_week, start_hour, end_hour)
       DO UPDATE SET label = EXCLUDED.label
       RETURNING id`,
      [day_of_week, start_hour, end_hour, label]
    );
    creneaux.push({
      id: rows[0].id,
      day_of_week,
      start_hour,
      end_hour,
      label,
      is_night: start_hour >= 18 || start_hour < 8,
    });
  }
  return creneaux;
}

function findCreneauId(creneaux, day, startHour) {
  const found = creneaux.find((c) => c.day_of_week === day && c.start_hour === startHour);
  if (!found) {
    throw new Error(`Creneau not found for ${day} ${String(startHour).padStart(2, '0')}:00`);
  }
  return found.id;
}

async function seedJobs(client, creneaux) {
  const jobsData = [
    [findCreneauId(creneaux, 'vendredi', 9), 3, 1, 'Service buvette - ouverture'],
    [findCreneauId(creneaux, 'vendredi', 10), 3, 2, 'Cuisine - prep dejeuner'],
    [findCreneauId(creneaux, 'vendredi', 14), 2, 3, 'Arbitrage Beach Rugby - phase 1'],
    [findCreneauId(creneaux, 'vendredi', 20), 2, 1, 'Buvette soiree'],
    [findCreneauId(creneaux, 'samedi', 9), 2, 4, 'Arbitrage Beach Soccer - poules'],
    [findCreneauId(creneaux, 'samedi', 10), 2, 5, 'Arbitrage Beach Volley - poules'],
    [findCreneauId(creneaux, 'samedi', 14), 2, 6, 'Arbitrage Dodgeball - poules'],
    [findCreneauId(creneaux, 'samedi', 21), 2, 2, 'Cuisine soiree'],
    [findCreneauId(creneaux, 'dimanche', 9), 2, 7, 'Arbitrage Handball - finales'],
    [findCreneauId(creneaux, 'dimanche', 14), 3, 1, 'Buvette - finales'],
    [findCreneauId(creneaux, 'dimanche', 20), 2, 2, 'Cuisine fermeture'],
    ...JOHNNY_CASH_PROFILE.reservedSlots.map(([day_of_week, start_hour, _end_hour, staff_type, description]) => [
      findCreneauId(creneaux, day_of_week, start_hour),
      1,
      staff_type,
      description,
    ]),
  ];

  for (const [creneau, staff_needed, staff_type, description] of jobsData) {
    await client.query(
      `INSERT INTO jobs (creneau, staff_needed, staff_type, description, staff_assigned)
       VALUES ($1, $2, $3, $4, '{}')`,
      [creneau, staff_needed, staff_type, description]
    );
  }

  return jobsData.length;
}

async function syncLegacyStaffCompetenceFlags(client, staffId, competenceIds) {
  const flags = {
    bar: 0,
    cuisine: 0,
    arbitre_beach_rugby: 0,
    arbitre_beach_soccer: 0,
    arbitre_beach_volley: 0,
    arbitre_dodgeball: 0,
    arbitre_handball: 0,
  };

  for (const competenceId of competenceIds) {
    const columnName = COMPETENCE_ID_TO_STAFF_COLUMN[competenceId];
    if (columnName) {
      flags[columnName] = 1;
    }
  }

  await client.query(
    `UPDATE staff
     SET bar = $2,
         cuisine = $3,
         arbitre_beach_rugby = $4,
         arbitre_beach_soccer = $5,
         arbitre_beach_volley = $6,
         arbitre_dodgeball = $7,
         arbitre_handball = $8,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1`,
    [
      staffId,
      flags.bar,
      flags.cuisine,
      flags.arbitre_beach_rugby,
      flags.arbitre_beach_soccer,
      flags.arbitre_beach_volley,
      flags.arbitre_dodgeball,
      flags.arbitre_handball,
    ]
  );
}

async function seedPlanningCompetencesAndDisponibilites(client, creneaux) {
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
     `SELECT s.id, s.staff_type, u.email
      FROM staff s
      JOIN users u ON u.id = s.user_id
      WHERE COALESCE(u.is_admin, 0) = 0 AND COALESCE(u.is_staff, 0) = 1
      ORDER BY s.id`
  );

  const reservedSlotIds = JOHNNY_CASH_PROFILE.reservedSlots.map(([day_of_week, start_hour]) =>
    findCreneauId(creneaux, day_of_week, start_hour)
  );

  await client.query('DELETE FROM staffeur_competence');
  await client.query('DELETE FROM staffeur_disponibilite');

  for (const s of staffRows) {
    const isJohnnyCash = s.email === JOHNNY_CASH_PROFILE.email;
    const compIds = isJohnnyCash
      ? [...JOHNNY_CASH_PROFILE.competenceIds]
      : shuffle([1, 2, 3, 4, 5, 6, 7]).slice(0, 1 + Math.floor(Math.random() * 3));

    await syncLegacyStaffCompetenceFlags(client, s.id, compIds);

    for (const id_competence of compIds) {
      await client.query(
        `INSERT INTO staffeur_competence (id_staffeur, id_competence)
         VALUES ($1, $2)
         ON CONFLICT (id_staffeur, id_competence) DO NOTHING`,
        [s.id, id_competence]
      );
    }

    const daySlotIds = creneaux.filter((c) => !c.is_night).map((c) => c.id);
    const nightSlotIds = creneaux.filter((c) => c.is_night).map((c) => c.id);

    let selected = creneaux.map((c) => c.id);
    if (isJohnnyCash) {
      selected = reservedSlotIds;
    } else {
      let poolIds = creneaux.map((c) => c.id).filter((id) => !reservedSlotIds.includes(id));
      if (s.staff_type === 'jour') {
        poolIds = daySlotIds.filter((id) => !reservedSlotIds.includes(id));
      } else if (s.staff_type === 'nuit') {
        poolIds = nightSlotIds.filter((id) => !reservedSlotIds.includes(id));
      }

      if (!poolIds.length) {
        poolIds = creneaux.map((c) => c.id).filter((id) => !reservedSlotIds.includes(id));
      }

      selected = shuffle(poolIds).slice(0, Math.max(1, Math.ceil(poolIds.length * 0.65)));
    }

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

    for (let i = 0; i < DEMO_ADMIN_COUNT; i++) {
      const adminId = await upsertUser(client, {
      username: 'admin',
      email: 'admin@example.com',
      first_name: 'Admin',
      last_name: 'User',
      is_admin: 1
    });
      console.log('Admin id:', adminId);
    }

    await removeAdminStaff(client);

    for (let i = 0; i < DEMO_USER_COUNT; i++) {
      const { first_name, last_name } = uniqueName(i);
      const username = `user${i + 1}`;
      const email = `user${i + 1}@example.com`;
      await upsertUser(client, { username, email, first_name, last_name, is_admin: 0 });
      if ((i + 1) % DEMO_USER_COUNT === 0) console.log(`Inserted users: ${i + 1}`);
    }

    for (let i = 0; i < DEMO_STAFF_COUNT; i++) {
      const { first_name, last_name } = uniqueName(DEMO_USER_COUNT + i);
      const username = `staff${i + 1}`;
      const email = `staff${i + 1}@example.com`;
      const forcedStaffType = staffTypeForIndex(i);
      const userId = await upsertUser(client, { username, email, first_name, last_name, is_admin: 0 });
      await upsertStaff(client, userId, forcedStaffType);
      if ((i + 1) % DEMO_STAFF_COUNT === 0) console.log(`Inserted staff: ${i + 1}`);
    }

    const johnnyUserId = await upsertUser(client, {
      username: JOHNNY_CASH_PROFILE.username,
      email: JOHNNY_CASH_PROFILE.email,
      first_name: JOHNNY_CASH_PROFILE.first_name,
      last_name: JOHNNY_CASH_PROFILE.last_name,
      is_admin: 0,
    });
    await upsertStaff(client, johnnyUserId, JOHNNY_CASH_PROFILE.staff_type);
    console.log('Inserted extra staff profile:', JOHNNY_CASH_PROFILE.email);

    const creneaux = await seedCreneaux(client);
    const jobsCreated = await seedJobs(client, creneaux);

    // Assign Johnny Cash to his reserved job slots
    for (const [day_of_week, start_hour] of JOHNNY_CASH_PROFILE.reservedSlots) {
      await client.query(
        `UPDATE jobs SET staff_assigned = array_append(staff_assigned, $1)
         WHERE creneau = (SELECT id FROM creneaux WHERE day_of_week = $2 AND start_hour = $3 LIMIT 1)`,
        [johnnyUserId, day_of_week, start_hour]
      );
    }
    console.log('Assigned Johnny Cash to his reserved job slots.');

    await seedPlanningCompetencesAndDisponibilites(client, creneaux);
    console.log('Slots created:', creneaux.length);
    console.log('Jobs created:', jobsCreated);

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
