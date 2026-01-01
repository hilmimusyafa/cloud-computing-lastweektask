export default async (request) => {
  const servers = [
    "http://35.170.72.42:6767/",
    "http://54.234.156.133:6767"
  ];

  async function isAlive(server) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(server, {
        method: "HEAD",
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return res.ok;
    } catch {
      return false;
    }
  }

  const aliveServers = [];

  for (const server of servers) {
    if (await isAlive(server)) {
      aliveServers.push(server);
    }
  }

  if (aliveServers.length === 0) {
    return new Response("All servers are down", { status: 503 });
  }

  // Simple random load balancing
  const target =
    aliveServers[Math.floor(Math.random() * aliveServers.length)];

  const url = new URL(request.url);
  const proxyUrl = target + url.pathname + url.search;

  return fetch(proxyUrl, request);
};
