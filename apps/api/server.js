console.log("Connecting to DB...");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
console.log("DB URL:", process.env.DATABASE_URL);

const nodemailer = require("nodemailer");
const { spawn } = require("child_process");
const fs = require("fs");

const FRONTEND_BUILD_DIR = process.env.FRONTEND_BUILD_DIR || path.join(__dirname, "..", "frontend", "build");
const FRONTEND_INDEX_FILE = path.join(FRONTEND_BUILD_DIR, "index.html");

function sendFrontendApp(res) {
  if (!fs.existsSync(FRONTEND_INDEX_FILE)) {
    return res.status(503).send(
      "Frontend build is missing. Run `npm --prefix ../frontend run build` from apps/api."
    );
  }
  return res.sendFile(FRONTEND_INDEX_FILE);
}

function requireAuth(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ error: "Authentication required" });
  next();
}

async function requireAdmin(req, res, next) {
  const result = await pool.query("SELECT is_admin FROM users WHERE id=$1", [
    req.session.userId,
  ]);
  if (result.rows.length === 0) return res.status(400).send("Utilisateur introuvable");
  const user = result.rows[0];
  if (!user.is_admin) return res.status(403).json({ error: "Admin access required" });
  next();

}

async function requireStaff(req, res, next) {
  const result = await pool.query("SELECT 1 FROM staff WHERE user_id=$1 LIMIT 1", [
    req.session.userId,
  ]);
  if (result.rows.length === 0) return res.status(403).json({ error: "Staff access required" });
  next();

}

const express = require("express");
const session = require("express-session");
const pg = require("pg");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const pgSession = require("connect-pg-simple")(session);

const app = express();

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(FRONTEND_BUILD_DIR));


function getcookie(req) {
    var cookies = req.headers.cookie;
    if (cookies) {
        var list = {}; 
        cookies.split(';').forEach(function(cookie) {
            var parts = cookie.split('=');
            list[parts.shift().trim()] = decodeURI(parts.join('='));
        });
        return list;
    }
    return null;
}

function noCache(req, res, next) {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  res.set("Surrogate-Control", "no-store");
  next();
}

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

const SCRIPT_RUNNER_PATH = fs.existsSync(path.join(__dirname, "python", "run_v2_with_db.py"))
  ? path.join(__dirname, "python", "run_v2_with_db.py")
  : path.join(__dirname, "logistique_msb_project", "V2", "run_v2_with_db.py");
const SCRIPT_RUNNER_CWD = path.dirname(SCRIPT_RUNNER_PATH);
const SCRIPT_TIMEOUT_MS = 10 * 60 * 1000;
const SCRIPT_NAMES = new Set(["creer_poules", "planning_staff", "planning_tournoi", "all"]);
let isPlanningScriptRunning = false;

function resolvePythonBin() {
  const candidates = [
    process.env.PYTHON_BIN,
    path.join(__dirname, ".venv", "bin", "python"),
    path.join(__dirname, "..", ".venv", "bin", "python"),
    path.join(__dirname, "..", "..", ".venv", "bin", "python"),
    "python3",
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (candidate === "python3") return candidate;
    if (fs.existsSync(candidate)) return candidate;
  }

  return "python3";
}

function runPlanningScript(scriptName, options = {}) {
  const writeDb = options.writeDb !== false;
  const preserveExistingStaff = options.preserveExistingStaff === true;
  const maxParPoule = Number.isInteger(options.maxParPoule) && options.maxParPoule > 0
    ? options.maxParPoule
    : 4;

  return new Promise((resolve, reject) => {
    const args = [
      SCRIPT_RUNNER_PATH,
      "--script",
      scriptName,
      "--max-par-poule",
      String(maxParPoule),
    ];

    if (writeDb) {
      args.push("--write-db");
    }

    if (preserveExistingStaff) {
      args.push("--preserve-existing-staff");
    }

    const pythonCmd = resolvePythonBin();
    const child = spawn(pythonCmd, args, {
      cwd: SCRIPT_RUNNER_CWD,
      env: {
        ...process.env,
        DATABASE_URL: process.env.DATABASE_URL || "",
      },
    });

    let stdout = "";
    let stderr = "";
    let settled = false;

    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      child.kill("SIGKILL");
      reject(new Error(`Timeout: script ${scriptName} exceeded ${SCRIPT_TIMEOUT_MS}ms`));
    }, SCRIPT_TIMEOUT_MS);

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", (err) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      reject(err);
    });

    child.on("close", (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({ code, stdout: stdout.trim(), stderr: stderr.trim() });
    });
  });
}

const mailTransporter = process.env.SMTP_HOST
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587", 10),
      secure: false,
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
    })
  : null;

async function sendStaffEmail({ to, subject, text }) {
  if (!mailTransporter) {
    throw new Error("EMAIL_NOT_CONFIGURED");
  }
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  return mailTransporter.sendMail({ from, to, subject, text });
}

const ALLOWED_DAYS = ["vendredi", "samedi", "dimanche"];

const STAFF_TYPE_MAP = {
  1: "bar",
  2: "cuisine",
  3: "arbitre_beach_rugby",
  4: "arbitre_beach_soccer",
  5: "arbitre_beach_volley",
  6: "arbitre_dodgeball",
  7: "arbitre_handball",
};

function parseStaffSignupAnswers(body = {}, options = {}) {
  const {
    validatedStaffCode = false,
    username = null,
    email = null,
    firstName = null,
    lastName = null,
    phone = null,
  } = options;

  const staffTypeRaw = body.staff_type || null;
  const normalizedStaffType =
    staffTypeRaw && ["jour", "nuit", "mixte"].includes(String(staffTypeRaw).toLowerCase())
      ? String(staffTypeRaw).toLowerCase()
      : null;

  const toInt = (value) =>
    value === true || value === "true" || value === "on" || value === 1 || value === "1" ? 1 : 0;

  return {
    staffType: normalizedStaffType,
    staff_code_validated: validatedStaffCode ? 1 : 0,
    username_snapshot: username,
    email_snapshot: email,
    first_name_snapshot: firstName,
    last_name_snapshot: lastName,
    phone_snapshot: phone,
    bar: toInt(body.tireuse),
    cuisine: toInt(body.cuisine),
    arbitre_beach_rugby: toInt(body.arbitre_beach_rugby),
    arbitre_beach_soccer: toInt(body.arbitre_beach_soccer),
    arbitre_beach_volley: toInt(body.arbitre_beach_volley),
    arbitre_dodgeball: toInt(body.arbitre_dodgeball),
    arbitre_handball: toInt(body.arbitre_handball),
  };
}

async function upsertStaffAnswers(dbClient, userId, answers) {
  await dbClient.query(
    `INSERT INTO staff (user_id, bar, cuisine, arbitre_beach_rugby, arbitre_beach_soccer, arbitre_beach_volley, arbitre_dodgeball, arbitre_handball, staff_type, staff_code_validated, username_snapshot, email_snapshot, first_name_snapshot, last_name_snapshot, phone_snapshot)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
     ON CONFLICT (user_id) DO UPDATE SET 
       bar = EXCLUDED.bar,
       cuisine = EXCLUDED.cuisine,
       arbitre_beach_rugby = EXCLUDED.arbitre_beach_rugby,
       arbitre_beach_soccer = EXCLUDED.arbitre_beach_soccer,
       arbitre_beach_volley = EXCLUDED.arbitre_beach_volley,
       arbitre_dodgeball = EXCLUDED.arbitre_dodgeball,
       arbitre_handball = EXCLUDED.arbitre_handball,
       staff_type = EXCLUDED.staff_type,
       staff_code_validated = EXCLUDED.staff_code_validated,
       username_snapshot = EXCLUDED.username_snapshot,
       email_snapshot = EXCLUDED.email_snapshot,
       first_name_snapshot = EXCLUDED.first_name_snapshot,
       last_name_snapshot = EXCLUDED.last_name_snapshot,
       phone_snapshot = EXCLUDED.phone_snapshot,
       updated_at = CURRENT_TIMESTAMP
    `,
    [
      userId,
      answers.bar,
      answers.cuisine,
      answers.arbitre_beach_rugby,
      answers.arbitre_beach_soccer,
      answers.arbitre_beach_volley,
      answers.arbitre_dodgeball,
      answers.arbitre_handball,
      answers.staffType,
      answers.staff_code_validated,
      answers.username_snapshot,
      answers.email_snapshot,
      answers.first_name_snapshot,
      answers.last_name_snapshot,
      answers.phone_snapshot,
    ]
  );
}

async function ensureSchedulingSchema() {
  const schemaPath = path.join(__dirname, "schema.sql");
  const schemaSql = fs.readFileSync(schemaPath, "utf8");
  await pool.query(schemaSql);
}

app.use(
  session({
    store: new pgSession({
      pool: pool,
      tableName: "session",
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1 * 1 * 60 * 60 * 1000 },
  })
);

app.get("/", (req, res) => {
  return sendFrontendApp(res);
});

app.get("/goodies", (req, res) => {
  return sendFrontendApp(res);
});

app.get("/signup", (req, res) => {
  return sendFrontendApp(res);
});

app.get("/signup_admin", (req, res) => {
  return sendFrontendApp(res);
});

app.get("/signup_staff", (req, res) => {
  return sendFrontendApp(res);
});

app.get("/login", (req, res) => {
  return sendFrontendApp(res);
});

app.get("/about_us", (req, res) => {
  return sendFrontendApp(res);
});

app.get("/api/me", requireAuth, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT
         u.id,
         u.username,
         u.first_name,
         u.last_name,
         u.email,
         u.is_admin,
         EXISTS(SELECT 1 FROM staff s WHERE s.user_id = u.id) AS is_staff
       FROM users u
       WHERE u.id = $1`,
      [req.session.userId]
    );
    if (!rows.length) return res.status(404).json({ error: "Utilisateur introuvable" });

    const user = rows[0];
    const role = user.is_admin ? "TeamMSB" : user.is_staff ? "Staff" : "Participant";
    return res.json({
      ...user,
      is_admin: !!user.is_admin,
      is_staff: !!user.is_staff,
      role,
    });
  } catch (e) {
    next(e);
  }
});



app.post("/signup", async (req, res, next) => {
  try {
    const { username, password, first_name, last_name, email, phone, gender } = req.body;

    if (!username || !password || !first_name || !last_name || !email) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (username, password_hash, first_name, last_name, email, phone, gender)
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [username.trim(), hashed, first_name.trim(), last_name.trim(), email.trim(), phone?.trim(), gender]
    );

    const userId = result.rows[0].id;
    req.session.regenerate((err) => {
      if (err) return next(err);
      req.session.userId = userId;
      req.session.save((err) => {
        if (err) return next(err);
        return res.status(201).json({ message: "Utilisateur enregistré avec succès !", redirect: "/dashboard" });
      });
    });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(400).json({ error: "User already exists." });
    }
    return next(err);
    
  }
});

app.post("/signup_admin", async (req, res, next) => {
  try {
    const { username, password, first_name, last_name, email, phone} = req.body;
    const admin_code = req.body.admin_code;

    if (!username || !password || !first_name || !last_name || !email || !admin_code) {
      return res.status(400).send("Champs manquants");
    }
    if (admin_code !== process.env.ADMIN_CODE) {
      return res.status(403).send("Code administrateur invalide");
    }

    const hashed = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (username, password_hash, first_name, last_name, email, phone, is_admin)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [username.trim(), hashed, first_name.trim(), last_name.trim(), email.trim(), phone?.trim(), 1]
    );
    
    const userId = result.rows[0].id;
    req.session.regenerate((err) => {
      if (err) return next(err);
      req.session.userId = userId;
      req.session.is_admin = true;
      req.session.is_staff = false;
      req.session.save((err) => {
        if (err) return next(err);
        return res.status(201).json({ message: "Administrateur enregistré avec succès !", redirect: "/dashboard" });
      });
    });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(400).send("Cet utilisateur existe déjà.");
    }
    return next(err);
  }
});

app.post("/signup_staff", async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { username, password, first_name, last_name, email, phone} = req.body;
    const staff_code = req.body.staff_code;
    if (!username || !password || !first_name || !last_name || !email || !staff_code) {
      return res.status(400).send("Champs manquants");
    }
    if (staff_code !== process.env.STAFF_CODE) {
      return res.status(403).send("Code staff invalide");
    }
    await client.query("BEGIN");
    const hashed = await bcrypt.hash(password, 10);
    const result = await client.query(
      `INSERT INTO users (username, password_hash, first_name, last_name, email, phone, is_staff)
        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [username.trim(), hashed, first_name.trim(), last_name.trim(), email.trim(), phone?.trim(), 1]
    );
    
    const userId = result.rows[0].id;
    const staffAnswers = parseStaffSignupAnswers(req.body, {
      validatedStaffCode: true,
      username: username.trim(),
      email: email.trim(),
      firstName: first_name.trim(),
      lastName: last_name.trim(),
      phone: phone?.trim() || null,
    });
    await upsertStaffAnswers(client, userId, staffAnswers);
    await client.query("COMMIT");

    req.session.regenerate((err) => {
      if (err) return next(err);
      req.session.userId = userId;
      req.session.is_admin = false;
      req.session.is_staff = true;
      req.session.save((err) => {
        if (err) return next(err);
        return res.status(201).json({ message: "Membre du staff enregistré avec succès !", redirect: "/dashboard" });
      });
    });
  } catch (err) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackErr) {
      console.error("Signup staff rollback failed:", rollbackErr?.message);
    }
    if (err.code === "23505") {
      return res.status(400).send("Cet utilisateur existe déjà.");
    }
    return next(err);
  } finally {
    client.release();
  }
});

app.post("/forgot-password", async (req, res, next) => {
  try {
    const { username, password, first_name, last_name, email, phone } = req.body;
    
    if (!email) {
      return res.status(400).send("Email requis");
    }
    
    const result = await pool.query(
      "SELECT id, email, first_name FROM users WHERE email=$1",
      [email.trim()]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).send("Aucun compte trouvé avec cet email");
    }
    
    const user = result.rows[0];
    

    try {
      const staffAnswers = parseStaffSignupAnswers(req.body, {
        validatedStaffCode: false,
        username: null,
        email: user.email,
        firstName: user.first_name,
        lastName: null,
        phone: null,
      });
      await upsertStaffAnswers(pool, user.id, staffAnswers);
    } catch (staffErr) {
      console.error("Staff extra fields insertion failed:", staffErr?.message);
    }
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedTemp = await bcrypt.hash(tempPassword, 10);
    
    await pool.query(
      "UPDATE users SET password_hash=$1 WHERE id=$2",
      [hashedTemp, user.id]
    );
    
    try {
      await sendStaffEmail({
        to: user.email,
        subject: "MSB Logistique - Mot de passe temporaire",
        text: `Bonjour ${user.first_name},\n\nVotre mot de passe temporaire MSB Logistique est : ${tempPassword}\n\nPour des raisons de sécurité, nous vous recommandons fortement de le changer immédiatement après connexion en accédant à votre profil.\n\nCordialement,\nL'équipe MSB Logistique`
      });
      
      res.json({ message: "Email envoyé avec succès" });
    } catch (emailError) {
      console.error("Email error:", emailError);
      if (emailError.message === "EMAIL_NOT_CONFIGURED") {
        return res.status(500).send("Le service d'envoi d'email n'est pas configuré. Contactez un administrateur.");
      }
      return res.status(500).send("Erreur lors de l'envoi de l'email");
    }
  } catch (err) {
    return next(err);
  }
});

app.post("/login", noCache, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      "SELECT id, username, email, password_hash, is_admin FROM users WHERE email=$1",
      [email.trim()]
    );
    if (!result.rows.length) return res.status(400).json({ error: "Utilisateur introuvable" });

    const user = result.rows[0];
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) return res.status(400).json({ error: "Mot de passe incorrect" });

    req.session.regenerate((err) => {
      if (err) return next(err);

      req.session.userId = user.id;
      req.session.username = user.username;
      req.session.is_admin = !!user.is_admin;
      pool.query("SELECT 1 FROM staff WHERE user_id=$1 LIMIT 1", [user.id])
        .then((staffRes) => {
          req.session.is_staff = staffRes.rows.length > 0;

          req.session.save((err2) => {
            if (err2) return next(err2);
            res.json({ 
              message: "Connexion réussie !",
              user: { 
                id: user.id, 
                username: user.username, 
                email: user.email,
                is_admin: !!user.is_admin,
                is_staff: staffRes.rows.length > 0
              }
            });
          });
        })
        .catch((e2) => next(e2));
    });
  } catch (e) {
    next(e);
  }
});


app.get("/order_detail", requireAuth, requireAdmin, (req, res) => {
  return sendFrontendApp(res);
});

app.post("/api/orders", requireAuth, noCache, async (req, res, next) => {
  try {
    const tshirt = Math.max(0, parseInt(req.body.tshirt_qty ?? "0", 10) || 0);
    const bob = Math.max(0, parseInt(req.body.bob_qty ?? req.body.goodie3_qty ?? "0", 10) || 0);
    const shortQty = Math.max(0, parseInt(req.body.short_qty ?? "0", 10) || 0);
    const maillotQty = Math.max(0, parseInt(req.body.maillot_qty ?? "0", 10) || 0);
    const gourde = Math.max(0, parseInt(req.body.gourde_qty ?? req.body.gourd_qty ?? "0", 10) || 0);
    const legacyGoodie3 = bob;

    if (tshirt + bob + shortQty + maillotQty + gourde === 0) {
      return res.status(400).send("Veuillez commander au moins un article.");
    }

    const userId = req.session.userId;
    const updateResult = await pool.query(
      `UPDATE goodies_orders
       SET tshirt_qty = $2,
           bob_qty = $3,
           short_qty = $4,
           maillot_qty = $5,
           gourde_qty = $6,
           gourd_qty = $7,
           goodie3_qty = $8
       WHERE user_id = $1`,
      [userId, tshirt, bob, shortQty, maillotQty, gourde, gourde, legacyGoodie3]
    );

    if (updateResult.rowCount === 0) {
      await pool.query(
        `INSERT INTO goodies_orders (user_id, tshirt_qty, bob_qty, short_qty, maillot_qty, gourde_qty, gourd_qty, goodie3_qty)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [userId, tshirt, bob, shortQty, maillotQty, gourde, gourde, legacyGoodie3]
      );
      return res.status(201).send("Commande enregistree !");
    }

    // Safety net: keep only the latest row for this user if historical duplicates exist.
    await pool.query(
      `DELETE FROM goodies_orders
       WHERE user_id = $1
         AND id NOT IN (
           SELECT id
           FROM goodies_orders
           WHERE user_id = $1
           ORDER BY created_at DESC, id DESC
           LIMIT 1
         )`,
      [userId]
    );

    return res.status(200).send("Commande mise a jour !");
  } catch (e) {
    next(e);
  }
});

app.get("/api/orders/summary", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        COALESCE(SUM(tshirt_qty), 0) AS tshirts,
        COALESCE(SUM(bob_qty), 0) AS bobs,
        COALESCE(SUM(short_qty), 0) AS shorts,
        COALESCE(SUM(maillot_qty), 0) AS maillots,
        COALESCE(SUM(gourde_qty), 0) AS gourdes,
        COALESCE(SUM(gourd_qty), 0) AS gourds,
        COALESCE(SUM(goodie3_qty), 0) AS goodie3
      FROM goodies_orders
    `);
    res.json(rows[0]);
  } catch (e) {
    next(e);
  }
});

app.get("/api/orders/detail", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        u.first_name,
        u.last_name,
        u.username,
        o.tshirt_qty,
        o.bob_qty,
        o.short_qty,
        o.maillot_qty,
        o.gourde_qty,
        o.gourd_qty,
        o.goodie3_qty,
        o.created_at
      FROM goodies_orders o
      JOIN users u ON u.id = o.user_id
      ORDER BY LOWER(u.last_name) ASC, LOWER(u.first_name) ASC, o.created_at DESC
    `);
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

app.get("/orders", requireAuth, requireAdmin, (req, res) => {
  return sendFrontendApp(res);
});

app.get("/users", requireAuth, requireAdmin, (req, res) => {
  return sendFrontendApp(res);
});

app.get("/documents", requireAuth, requireStaff, (req, res) => {
  return sendFrontendApp(res);
});

app.get("/api/users", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT 
        u.id, u.username, u.first_name, u.last_name, u.email, u.is_admin,
        EXISTS(SELECT 1 FROM staff s WHERE s.user_id = u.id) AS is_staff
       FROM users u
       ORDER BY u.last_name, u.first_name`
    );
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

app.delete("/api/users/:id", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id, 10);
    if (userId === req.session.userId) {
      return res.status(400).send("Vous ne pouvez pas supprimer votre propre compte");
    }
    const result = await pool.query("DELETE FROM users WHERE id = $1", [userId]);
    if (result.rowCount === 0) {
      return res.status(404).send("Utilisateur introuvable");
    }
    res.send("Utilisateur supprimé");
  } catch (e) {
    next(e);
  }
});

app.get("/jobs", requireAuth, requireAdmin, (req, res) => {
  return sendFrontendApp(res);
});

app.get("/admin/scripts", requireAuth, requireAdmin, (req, res) => {
  return sendFrontendApp(res);
});

app.get("/admin/poules", requireAuth, requireAdmin, (req, res) => {
  return sendFrontendApp(res);
});

app.get("/admin/poules/:sportId", requireAuth, requireAdmin, (req, res) => {
  return sendFrontendApp(res);
});

app.get("/api/admin/poules/sports", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        s.id_sport,
        s.nom_sport,
        COUNT(DISTINCT p.id_poule) AS poules_count,
        COUNT(DISTINCT pe.id_equipe) AS equipes_count
      FROM sport s
      LEFT JOIN poule p ON p.id_sport = s.id_sport
      LEFT JOIN poule_equipe pe ON pe.id_poule = p.id_poule
      GROUP BY s.id_sport, s.nom_sport
      ORDER BY LOWER(s.nom_sport) ASC
    `);
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

app.get("/api/admin/poules/sport/:sportId", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const sportId = Number.parseInt(req.params.sportId, 10);
    if (!Number.isInteger(sportId)) {
      return res.status(400).send("sportId invalide");
    }

    const sportResult = await pool.query(
      `SELECT id_sport, nom_sport FROM sport WHERE id_sport = $1`,
      [sportId]
    );
    if (!sportResult.rows.length) {
      return res.status(404).send("Sport introuvable");
    }

    const { rows } = await pool.query(
      `SELECT
         p.id_poule,
         p.nom_poule,
         p.niveau::text AS niveau,
         p.categorie::text AS categorie,
         COALESCE(
           json_agg(
             json_build_object(
               'id_equipe', e.id_equipe,
               'nom_equipe', e.nom_equipe,
               'nb_joueurs', e.nb_joueurs
             ) ORDER BY pe.position NULLS LAST, e.id_equipe
           ) FILTER (WHERE e.id_equipe IS NOT NULL),
           '[]'
         ) AS equipes
       FROM poule p
       LEFT JOIN poule_equipe pe ON pe.id_poule = p.id_poule
       LEFT JOIN equipe e ON e.id_equipe = pe.id_equipe
       WHERE p.id_sport = $1
       GROUP BY p.id_poule, p.nom_poule, p.niveau, p.categorie
       ORDER BY p.nom_poule ASC, p.id_poule ASC`,
      [sportId]
    );

    return res.json({
      sport: sportResult.rows[0],
      poules: rows,
    });
  } catch (e) {
    next(e);
  }
});

app.get("/api/admin/scripts", requireAuth, requireAdmin, (req, res) => {
  res.json({
    scripts: ["creer_poules", "planning_staff", "planning_tournoi", "all"],
    isRunning: isPlanningScriptRunning,
  });
});

app.post("/api/admin/scripts/:scriptName/run", requireAuth, requireAdmin, async (req, res) => {
  const { scriptName } = req.params;
  const writeDb = req.body?.write_db !== false;
  const preserveExistingStaff = req.body?.preserve_existing_staff === true;
  const maxParPoule = Number.parseInt(req.body?.max_par_poule ?? "4", 10);

  if (!SCRIPT_NAMES.has(scriptName)) {
    return res.status(400).json({ error: "scriptName invalide" });
  }

  if (!process.env.DATABASE_URL) {
    return res.status(500).json({ error: "DATABASE_URL n'est pas configurée" });
  }

  if (isPlanningScriptRunning) {
    return res.status(409).json({ error: "Un script est deja en cours d'execution" });
  }

  try {
    isPlanningScriptRunning = true;
    const result = await runPlanningScript(scriptName, {
      writeDb,
      preserveExistingStaff,
      maxParPoule,
    });

    if (result.code !== 0) {
      return res.status(500).json({
        ok: false,
        code: result.code,
        stdout: result.stdout,
        stderr: result.stderr,
      });
    }

    return res.json({
      ok: true,
      code: result.code,
      stdout: result.stdout,
      stderr: result.stderr,
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: err.message || "Erreur inattendue",
    });
  } finally {
    isPlanningScriptRunning = false;
  }
});

app.get("/api/creneaux", requireAuth, async (req, res, next) => {
  try {
    if (!req.session.is_admin && !req.session.is_staff) {
      return res.status(403).sendFile(path.join(__dirname, "public", "error-403.html"));
    }

    const { rows } = await pool.query(`
      SELECT id, day_of_week, start_hour, end_hour, label
      FROM creneaux
      ORDER BY
        CASE day_of_week
          WHEN 'vendredi' THEN 1
          WHEN 'samedi' THEN 2
          WHEN 'dimanche' THEN 3
          ELSE 99
        END,
        start_hour,
        end_hour
    `);
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

app.post("/api/creneaux", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const day = String(req.body.day_of_week || "").trim().toLowerCase();
    const startHour = Number.parseInt(req.body.start_hour, 10);
    const endHour = Number.parseInt(req.body.end_hour, 10);

    if (!ALLOWED_DAYS.includes(day)) {
      return res.status(400).send("Jour invalide (vendredi, samedi, dimanche)");
    }
    if (!Number.isInteger(startHour) || !Number.isInteger(endHour)) {
      return res.status(400).send("Heures invalides");
    }
    if (startHour < 0 || startHour > 23 || endHour < 1 || endHour > 24 || endHour <= startHour) {
      return res.status(400).send("La tranche horaire est invalide");
    }

    const label = req.body.label
      ? String(req.body.label).trim()
      : `${day} ${String(startHour).padStart(2, "0")}:00-${String(endHour).padStart(2, "0")}:00`;

    const result = await pool.query(
      `INSERT INTO creneaux (day_of_week, start_hour, end_hour, label)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (day_of_week, start_hour, end_hour)
       DO UPDATE SET label = EXCLUDED.label
       RETURNING id, day_of_week, start_hour, end_hour, label`,
      [day, startHour, endHour, label]
    );

    res.status(201).json(result.rows[0]);
  } catch (e) {
    next(e);
  }
});

app.get("/api/jobs", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        j.id,
        j.creneau,
        j.staff_needed,
        j.staff_type,
        j.description,
        j.staff_assigned,
        j.created_at,
        c.day_of_week,
        c.start_hour,
        c.end_hour,
        c.label AS creneau_label,
        COALESCE(
          json_agg(
            json_build_object(
              'id', u.id,
              'first_name', u.first_name,
              'last_name', u.last_name,
              'email', u.email
            ) ORDER BY u.last_name, u.first_name
          ) FILTER (WHERE u.id IS NOT NULL),
          '[]'
        ) AS assigned_staff_details
      FROM jobs j
      LEFT JOIN creneaux c ON c.id = j.creneau
      LEFT JOIN LATERAL unnest(j.staff_assigned) AS staff_id(user_id) ON true
      LEFT JOIN users u ON u.id = staff_id.user_id
      GROUP BY j.id, c.id
      ORDER BY
        CASE c.day_of_week
          WHEN 'vendredi' THEN 1
          WHEN 'samedi' THEN 2
          WHEN 'dimanche' THEN 3
          ELSE 99
        END,
        c.start_hour NULLS LAST,
        j.staff_type
    `);
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

app.post("/api/jobs", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const creneau = Number.parseInt(req.body.creneau, 10);
    const staffNeeded = Number.parseInt(req.body.staff_needed, 10);
    const staffType = Number.parseInt(req.body.staff_type, 10);
    const description = req.body.description;
    
    if (!Number.isInteger(creneau) || !Number.isInteger(staffNeeded) || !Number.isInteger(staffType)) {
      return res.status(400).send("Créneau, staff_type et staff_needed sont requis");
    }
    if (staffNeeded < 1) {
      return res.status(400).send("staff_needed doit être supérieur ou égal à 1");
    }
    if (!STAFF_TYPE_MAP[staffType]) {
      return res.status(400).send("staff_type invalide");
    }

    const creneauResult = await pool.query("SELECT id FROM creneaux WHERE id = $1", [creneau]);
    if (!creneauResult.rows.length) {
      return res.status(400).send("Créneau introuvable");
    }

    const result = await pool.query(
      `INSERT INTO jobs (creneau, staff_needed, staff_type, description)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [creneau, staffNeeded, staffType, description || null]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (e) {
    next(e);
  }
});

app.get("/api/jobs/available-staff", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { creneau, staff_type } = req.query;
    
    if (!creneau || !staff_type) {
      return res.status(400).send("creneau et staff_type requis");
    }

    const columnName = STAFF_TYPE_MAP[Number.parseInt(staff_type, 10)];
    if (!columnName) {
      return res.status(400).send("staff_type invalide");
    }

    const { rows: busyStaff } = await pool.query(
      `SELECT UNNEST(staff_assigned) as user_id FROM jobs WHERE creneau = $1`,
      [creneau]
    );
    const busyIds = busyStaff.map(r => r.user_id);

    let query = `
      SELECT u.id, u.username, u.first_name, u.last_name, u.email, s.${columnName}
      FROM users u
      JOIN staff s ON s.user_id = u.id
      WHERE s.${columnName} = 1
    `;
    
    const params = [];
    if (busyIds.length > 0) {
      query += ` AND u.id NOT IN (${busyIds.map((_, i) => `$${i + 1}`).join(',')})`;
      params.push(...busyIds);
    }
    
    query += ` ORDER BY u.last_name, u.first_name`;
    
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

app.put("/api/jobs/:id/assign", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const jobId = parseInt(req.params.id, 10);
    const { staff_ids } = req.body;
    
    if (!Array.isArray(staff_ids)) {
      return res.status(400).send("staff_ids doit être un tableau");
    }

    const jobResult = await pool.query("SELECT creneau, staff_needed FROM jobs WHERE id = $1", [jobId]);
    if (jobResult.rows.length === 0) {
      return res.status(404).send("Job introuvable");
    }
    
    const job = jobResult.rows[0];
    
    if (staff_ids.length > 0) {
      const { rows: conflicts } = await pool.query(
        `SELECT UNNEST(staff_assigned) as user_id 
         FROM jobs 
         WHERE creneau = $1 AND id != $2`,
        [job.creneau, jobId]
      );
      
      const busyIds = conflicts.map(r => r.user_id);
      const conflictIds = staff_ids.filter(id => busyIds.includes(id));
      
      if (conflictIds.length > 0) {
        return res.status(400).send(`Staff ${conflictIds.join(', ')} déjà assignés sur ce créneau`);
      }
    }

    const result = await pool.query(
      `UPDATE jobs SET staff_assigned = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 RETURNING *`,
      [staff_ids, jobId]
    );
    
    res.json(result.rows[0]);
  } catch (e) {
    next(e);
  }
});

app.delete("/api/jobs/:id", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const jobId = parseInt(req.params.id, 10);
    const result = await pool.query("DELETE FROM jobs WHERE id = $1", [jobId]);
    if (result.rowCount === 0) {
      return res.status(404).send("Job introuvable");
    }
    res.send("Job supprimé");
  } catch (e) {
    next(e);
  }
});

app.get("/api/my-schedule", requireAuth, async (req, res, next) => {
  try {
    const userId = req.session.userId;

    if (req.session.is_admin) {
      const { rows } = await pool.query(
        `SELECT
           j.id,
           j.staff_type,
           j.description,
           c.id AS creneau_id,
           c.day_of_week,
           c.start_hour,
           c.end_hour,
           c.label AS creneau_label
         FROM jobs j
         JOIN creneaux c ON c.id = j.creneau
         ORDER BY
           CASE c.day_of_week
             WHEN 'vendredi' THEN 1
             WHEN 'samedi' THEN 2
             WHEN 'dimanche' THEN 3
             ELSE 99
           END,
           c.start_hour,
           c.end_hour,
           j.staff_type,
           j.id`
      );
      return res.json(rows);
    }

    if (!req.session.is_staff) {
      return res.status(403).json({ error: "Staff access required" });
    }

    const { rows } = await pool.query(
      `SELECT
         j.id,
         j.staff_type,
         j.description,
         c.id AS creneau_id,
         c.day_of_week,
         c.start_hour,
         c.end_hour,
         c.label AS creneau_label
       FROM jobs j
       JOIN creneaux c ON c.id = j.creneau
       WHERE $1 = ANY (j.staff_assigned)
       ORDER BY
         CASE c.day_of_week
           WHEN 'vendredi' THEN 1
           WHEN 'samedi' THEN 2
           WHEN 'dimanche' THEN 3
           ELSE 99
         END,
         c.start_hour,
         c.end_hour,
         j.staff_type`,
      [userId]
    );
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

app.get("/session-info", (req, res) => {
  const isAuthenticated = !!req.session?.userId;
  const isAdmin = !!req.session?.is_admin;
  const isStaff = !!req.session?.is_staff;
  const status = isAuthenticated ? (isAdmin ? "TeamMSB" : isStaff ? "Staff" : "Participant") : "guest";
  res.json({ authenticated: isAuthenticated, status, is_admin: isAdmin, is_staff: isStaff });
});

app.get("/dashboard", requireAuth, noCache, async (req, res, next) => {
  return sendFrontendApp(res);
});

app.post("/logout", (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie("connect.sid");
    return res.json({ message: "Déconnexion réussie" });
  });
});

app.get(/^\/(?!api\/).*/, (req, res) => {
  return sendFrontendApp(res);
});


async function startServer() {
  try {
    const port = Number.parseInt(process.env.PORT || "80", 10);
    if (typeof ensureSchedulingSchema === "function") {
      await ensureSchedulingSchema();
    } else {
      console.warn("Scheduling schema bootstrap skipped (ensureSchedulingSchema not defined).");
    }
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  } catch (err) {
    console.error("Failed to initialize DB schema:", err);
    process.exit(1);
  }
}

startServer();
