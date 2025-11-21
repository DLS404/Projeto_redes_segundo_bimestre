const servers = [
  "http://server1.meutrabalho.com.br:3001",
  "http://server2.meutrabalho.com.br:3002",
  "http://server3.meutrabalho.com.br:3003"
];

function currentServer() {
  return window.location.origin;
}

async function tryFailover() {
  const current = currentServer();
  const path = window.location.pathname;

  const others = servers.filter(s => s !== current);

  for (const server of others) {
    try {
      const response = await fetch(server + "/health", { method: "GET" });

      if (response.ok) {
        window.location.href = server + path;
        return;
      }
    } catch (err) {
      console.log("Servidor indisponível:", server);
    }
  }

  alert("Nenhum servidor disponível.");
}

setInterval(() => {
  fetch(currentServer() + "/health")
    .then(r => {
      if (!r.ok) throw 1;
    })
    .catch(() => {
      console.log("Servidor offline — FAILOVER");
      tryFailover();
    });
}, 3000);
