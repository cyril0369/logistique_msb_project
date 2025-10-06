console.log("Connecting to DB...");
require("dotenv").config();
console.log("DB URL:", process.env.DATABASE_URL);

const path = require("path");

function requireAuth(req, res, next) {
  if (!req.session.userId) return res.status(401).send("Oh oh! It seems you are not logged in.");
  next();
}

async function requireAdmin(req, res, next) {
  const result = await pool.query("SELECT is_admin FROM users WHERE id=$1", [
    req.session.userId,
  ]);
  if (result.rows.length === 0) return res.status(400).send("User not found");
  const user = result.rows[0];
  if (!user.is_admin) return res.status(403).send("Access denied: Admins only.");
  next();

} 

const express = require("express");
const session = require("express-session");
const pg = require("pg");
const bcrypt = require("bcryptjs");
const pgSession = require("connect-pg-simple")(session);

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// PostgreSQL pool
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

// Session middleware
app.use(
  session({
    store: new pgSession({
      pool: pool,
      tableName: "session",
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1 * 1 * 60 * 60 * 1000 }, // 1 hour
  })
);

app.use(express.static("assets"));


// Signup route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "signup.html"));
});

app.get("/signup_admin", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "signup_admin.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/about_us", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "about_us.html"));
});

app.get("/api/me", requireAuth, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      "SELECT username, first_name, last_name, is_admin FROM users WHERE id = $1",
      [req.session.userId]
    );
    if (!rows.length) return res.status(404).send("User not found");
    return res.json(rows[0]);
  } catch (e) {
    next(e);
  }
});



app.post("/signup", async (req, res, next) => {
  try {
    const { username, password, first_name, last_name } = req.body;

    if (!username || !password || !first_name || !last_name) {
      return res.status(400).send("Missing fields");
    }

    const hashed = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO users (username, password, first_name, last_name)
       VALUES ($1, $2, $3, $4)`,
      [username.trim(), hashed, first_name.trim(), last_name.trim()]
    );

    return res.status(201).send("User registered successfully!");
  } catch (err) {
    // Postgres unique violation (if you set a UNIQUE constraint on username)
    if (err.code === "23505") {
      return res.status(400).send("User already exists.");
    }
    return next(err);
  }
});

app.post("/signup_admin", async (req, res, next) => {
  try {
    const { username, password, first_name, last_name} = req.body;
    const admin_code = req.body.admin_code;

    if (!username || !password || !first_name || !last_name || !admin_code) {
      return res.status(400).send("Missing fields");
    }
    if (admin_code !== process.env.ADMIN_CODE) {
      return res.status(403).send("Invalid admin code");
    }

    const hashed = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO users (username, password, first_name, last_name, is_admin)
       VALUES ($1, $2, $3, $4, $5)`,
      [username.trim(), hashed, first_name.trim(), last_name.trim(), 1]
    );
    return res.status(201).send("Admin user registered successfully!");
  } catch (err) {
    // Postgres unique violation
    if (err.code === "23505") {
      return res.status(400).send("User already exists.");
    }
    return next(err);
  }
});




// Login route
app.post("/login", noCache, async (req, res) => {
  const { username, password } = req.body;

  const result = await pool.query("SELECT * FROM users WHERE username=$1", [
    username,
  ]);

  if (result.rows.length === 0) return res.status(400).send("User not found");

  const user = result.rows[0];

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return res.status(400).send("Invalid password");

  req.session.userId = user.id;
  req.session.username = user.username;
  res.send("Logged in successfully!");
  });

// Protected route
app.get("/dashboard", requireAuth, requireAdmin, noCache, (req, res) => {
  res.sendFile(path.join(__dirname, "protected", "dashboard.html"));
});

// Logout
app.post("/logout", (req, res, next) => {
  res.clearCookie('connect.sid');
  res.send("Logged out");  
});


app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
