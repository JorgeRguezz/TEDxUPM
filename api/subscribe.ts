// Alta en la lista de novedades. Guarda el correo en Upstash Redis (Marketplace de Vercel) por REST, sin dependencias.
// Variables de entorno (las crea la integración): KV_REST_API_URL y KV_REST_API_TOKEN. Sin ellas responde 503 y no guarda nada.
// ponytail: sin límite de peticiones por IP; si hay abuso, añadir Vercel Firewall o un contador en Redis.
const reply = (status: number, body: object = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== 'POST') return reply(405);
    // Solo desde nuestras propias páginas (los navegadores siempre envían Origin en un POST con fetch).
    const origin = request.headers.get('origin');
    if (!origin || new URL(origin).host !== new URL(request.url).host) return reply(403);

    const raw = await request.text();
    if (raw.length > 2048) return reply(413);
    let data: { email?: unknown; consent?: unknown; website?: unknown };
    try { data = JSON.parse(raw); } catch { return reply(400); }

    if (data.website) return reply(200); // trampa para bots: se finge éxito y no se guarda
    const email = typeof data.email === 'string' ? data.email.trim().toLowerCase() : '';
    if (data.consent !== true || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return reply(400);

    const url = process.env.KV_REST_API_URL, token = process.env.KV_REST_API_TOKEN;
    if (!url || !token) return reply(503);
    // ZADD NX: un correo repetido no se duplica ni cambia su fecha de alta; la puntuación es la fecha de consentimiento (ms).
    const r = await fetch(url, {
      method: 'POST', headers: { authorization: `Bearer ${token}` },
      body: JSON.stringify(['ZADD', 'subscribers', 'NX', Date.now(), email]),
    }).catch(() => null);
    return r?.ok ? reply(200) : reply(503); // nunca se registra el correo en logs
  },
};
