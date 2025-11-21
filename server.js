// server.js (substitua todo o arquivo por este)
const express = require("express");
const cookieParser = require("cookie-parser");
const { Pool } = require("pg");
const { v4: uuid } = require("uuid");
const os = require("os");
const cors = require("cors");

const app = express();

// CORS: permitir requisições vindas do domínio principal e das portas dos servidores
app.use(cors({
  origin: [
    "http://www.meutrabalho.com.br",
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

// rota inicial (login)
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

// login: cria sessão e envia cookie com domínio compartilhado
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

    // Cookie configurado para compartilhar entre subdomínios
    res.cookie("sid", sid, {
      httpOnly: true,
      domain: ".meutrabalho.com.br", // <- importante: compartilha cookie entre subdomínios
      sameSite: "Lax"
      // secure: true // habilite se estiver usando HTTPS
    });

    res.redirect("/meu-perfil");
  } catch (err) {
    console.error(err);
    res.send("Erro no servidor");
  }
});

// middleware de autenticação (verifica sessão no banco)
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
    console.error(err);
    res.redirect("/");
  }
}

// página protegida
app.get("/meu-perfil", auth, (req, res) => {
  res.send(`
    <h1>Meu Perfil</h1>
    Nome: ${req.user.full_name}<br>
    Logado em: ${req.user.created_at}<br>
    Hostname do servidor: ${os.hostname()}<br>
    Session ID: ${req.cookies.sid}<br><br>

    <form method="POST" action="/logout">
      <button type="submit">Logout</button>
    </form>

    <script src="/failover.js"></script>
  `);
});

// logout (apaga sessão no banco)
app.post("/logout", async (req, res) => {
  const sid = req.cookies.sid;
  if (sid) {
    try {
      await pool.query("DELETE FROM sessions WHERE session_id = $1", [sid]);
    } catch (e) { console.error(e); }
  }
  res.clearCookie("sid", { domain: ".meutrabalho.com.br" });
  res.redirect("/");
});

// healthcheck público para o failover
app.get("/health", (req, res) => res.json({ ok: true, host: os.hostname() }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});
