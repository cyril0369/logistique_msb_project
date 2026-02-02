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

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  try {
    console.log('Seeding demo data...');
    await client.query('BEGIN');

    await client.query('TRUNCATE TABLE goodies_orders, staff, users RESTART IDENTITY CASCADE');

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

    await client.query('COMMIT');
    console.log('✅ Seeding complete.');
    console.log('Login password for all accounts:', DEFAULT_PASSWORD);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seeding failed:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
