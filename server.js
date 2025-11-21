const express = require("express");
const cookieParser = require("cookie-parser");
const { Pool } = require("pg");
const { v4: uuid } = require("uuid");
const os = require("os");
const cors = require("cors");

const app = express();

// ****** CORS ****** IMPORTANTÍSSIMO ******
app.use(cors({
    origin: [
        "http://server1.meutrabalho.com.br:3001",
        "http://server2.meutrabalho.com.br:3002",
        "http://server3.meutrabalho.com.br:3003"
    ],
    credentials: true
}));

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.static("public"));

const pool = new Pool({
  user: process.env.PGUSER || "postgres",
  host: process.env.PGHOST || "localhost",
  database: process.env.PGDATABASE || "trabalho",
  password: process.env.PGPASSWORD || "7734",
  port: process.env.PGPORT ? parseInt(process.env.PGPORT) : 5432
});

// ----------- ROTAS -----------

app.get("/", (req, res) => {
  res.send(`
    <h1>Login</h1>
    <form method="POST" action="/login">
      Usuário: <input name="username"><br>
      Senha: <input name="password" type="password"><br>
      <button type="submit">Entrar</button>
    </form>
    <script src="/failover.js"></script>
  `);
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const r = await pool.query(
      "SELECT id FROM users WHERE username=$1 AND password_hash = crypt($2, password_hash)",
      [username, password]
    );

    if (r.rows.length === 0) {
      return res.send("Login inválido");
    }

    const userId = r.rows[0].id;
    const sid = uuid();

    await pool.query(
      "INSERT INTO sessions (session_id, user_id) VALUES ($1, $2)",
      [sid, userId]
    );

    res.cookie("sid", sid);
    res.redirect("/meu-perfil");
  } catch (err) {
    console.error(err);
    res.send("Erro no servidor");
  }
});

async function auth(req, res, next) {
  const sid = req.cookies.sid;
  if (!sid) return res.redirect("/");

  try {
    const r = await pool.query(
      `SELECT users.full_name, sessions.created_at
       FROM sessions
       JOIN users ON sessions.user_id = users.id
       WHERE session_id = $1`,
      [sid]
    );

    if (r.rows.length === 0) return res.redirect("/");

    req.user = r.rows[0];
    next();
  } catch (err) {
    res.redirect("/");
  }
}

app.get("/meu-perfil", auth, (req, res) => {
  res.send(`
    <h1>Meu Perfil</h1>
    Nome: ${req.user.full_name}<br>
    Logado em: ${req.user.created_at}<br>
    Hostname do servidor: ${os.hostname()}<br>
    Session ID: ${req.cookies.sid}
    <script src="/failover.js"></script>
  `);
});

// HEALTHCHECK PARA FAILOVER
app.get("/health", (req, res) => res.json({ ok: true, host: os.hostname() }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});
