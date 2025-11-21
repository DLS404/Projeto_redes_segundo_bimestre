// public/failover.js
const servers = [
  "http://www.meutrabalho.com.br",
  "http://server1.meutrabalho.com.br:3001",
  "http://server2.meutrabalho.com.br:3002",
  "http://server3.meutrabalho.com.br:3003"
];

function currentServer() {
  return window.location.origin;
}

// helper: fetch with timeout and include credentials
async function fetchWithTimeout(url, timeout = 2500) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, {
      method: "GET",
      mode: "cors",
      credentials: "include",
      cache: "no-store",
      signal: controller.signal
    });
    clearTimeout(id);
    return res;
  } catch (e) {
    clearTimeout(id);
    throw e;
  }
}

async function tryFailover() {
  const current = currentServer();
  const path = window.location.pathname + window.location.search;

  const others = servers.filter(s => s !== current);

  for (const srv of others) {
    try {
      console.log("Checando:", srv + "/health");
      const r = await fetchWithTimeout(srv + "/health", 2000);
      if (r && r.ok) {
        console.log("Encontrado servidor vivo:", srv);
        window.location.href = srv + path;
        return;
      }
    } catch (err) {
      console.log("Servidor indisponível:", srv, err && err.name ? err.name : err);
    }
  }

  alert("Nenhum servidor disponível.");
}

// periodicamente cheque o servidor atual
setInterval(async () => {
  try {
    await fetchWithTimeout(currentServer() + "/health", 2000);
    // se OK, não faz nada
  } catch (e) {
    console.log("Servidor atual não respondeu → iniciar failover");
    tryFailover();
  }
}, 2500);
