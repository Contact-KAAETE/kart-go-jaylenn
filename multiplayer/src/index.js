// Kart Go multiplayer prototype: isolated from the production solo game.
// Lobby transport only. Race physics, powerups and anti-cheat are NOT implemented.
const MAX_PLAYERS = 6;
const ROOM_TTL_MS = 2 * 60 * 60 * 1000;
const safeText = (value, max = 18) => String(value ?? '').replace(/[<>\\\u0000-\u001f]/g, '').trim().slice(0, max);
const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
function randomCode(length = 8) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, byte => alphabet[byte % alphabet.length]).join('');
}
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin');
    if (origin && origin !== env.ALLOWED_ORIGIN) return json({ error: 'Origin not allowed' }, 403);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN, 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
    if (url.pathname === '/health') return json({ ok: true, maxPlayers: MAX_PLAYERS, phase: 'lobby-prototype' });
    if (url.pathname === '/rooms' && request.method === 'POST') {
      const code = randomCode();
      const id = env.RACE_ROOMS.idFromName(code);
      return json({ code, websocket: new URL('/rooms/' + code + '/connect', request.url).toString().replace(/^http/, 'ws'), warning: 'Lobby prototype only; racing not enabled' }, 201);
    }
    const match = /^\/rooms\/([A-HJ-NP-Z2-9]{8})\/connect$/.exec(url.pathname);
    if (!match || request.headers.get('Upgrade')?.toLowerCase() !== 'websocket') return json({ error: 'Not found' }, 404);
    return env.RACE_ROOMS.get(env.RACE_ROOMS.idFromName(match[1])).fetch(request);
  }
};
export class RaceRoom {
  constructor(state, env) { this.state = state; this.env = env; this.members = new Map(); this.created = Date.now(); }
  async fetch(request) {
    if (this.members.size >= MAX_PLAYERS) return json({ error: 'Room full (6 players)' }, 409);
    if (Date.now() - this.created > ROOM_TTL_MS) return json({ error: 'Room expired' }, 410);
    const pair = new WebSocketPair();
    const client = pair[0], server = pair[1];
    server.accept();
    const id = crypto.randomUUID();
    const player = { id, name: 'Coureur', ready: false, avatar: 0, color: 0 };
    this.members.set(server, player);
    server.addEventListener('message', event => {
      try {
        if (typeof event.data !== 'string' || event.data.length > 1024) return;
        const msg = JSON.parse(event.data);
        if (msg.type === 'profile') {
          player.name = safeText(msg.name) || 'Coureur';
          player.avatar = Number.isInteger(msg.avatar) ? Math.max(0, Math.min(11, msg.avatar)) : 0;
          player.color = Number.isInteger(msg.color) ? Math.max(0, Math.min(19, msg.color)) : 0;
          player.ready = false;
        } else if (msg.type === 'ready') player.ready = msg.value === true;
        else if (msg.type === 'ping') { server.send(JSON.stringify({ type: 'pong' })); return; }
        else return;
        this.broadcast();
      } catch {}
    });
    const cleanup = () => { this.members.delete(server); this.broadcast(); };
    server.addEventListener('close', cleanup);
    server.addEventListener('error', cleanup);
    server.send(JSON.stringify({ type: 'welcome', id, maxPlayers: MAX_PLAYERS, note: 'Lobby only: race not available yet' }));
    this.broadcast();
    return new Response(null, { status: 101, webSocket: client });
  }
  broadcast() {
    const players = Array.from(this.members.values());
    const message = JSON.stringify({ type: 'lobby', players, canStart: players.length >= 2 && players.every(p => p.ready), racingEnabled: false });
    for (const socket of this.members.keys()) { try { socket.send(message); } catch { this.members.delete(socket); } }
  }
}
