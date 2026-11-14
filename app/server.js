'use strict';
/**
 * QA Demo Store – a tiny, dependency-free inventory app used as the
 * "application under test" (AUT) for this automation portfolio.
 *
 * - Each login gets its own in-memory dataset, so tests are isolated and
 *   can run fully in parallel without a reset endpoint.
 * - Contains ONE intentional, documented defect (BUG-001) so the portfolio
 *   can demonstrate how application bugs are tracked vs. automation issues.
 */
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

try { process.loadEnvFile(path.join(__dirname, '..', '.env')); } catch { /* .env is optional */ }

const PORT = Number(process.env.PORT || 3000);
// Demo-only defaults for a local app. Override via .env / CI secrets.
const USER = process.env.DEMO_USER || 'qa_user';
const PASS = process.env.DEMO_PASS || 'ChangeMe123!';
const PUBLIC_DIR = path.join(__dirname, 'public');
const CATEGORIES = ['Electronics', 'Books', 'Home', 'Sports'];
const MAX_SESSIONS = 1000;

const SEED = [
  { name: 'Wireless Mouse', category: 'Electronics', price: 24.99, stock: 120 },
  { name: 'Mechanical Keyboard', category: 'Electronics', price: 89.5, stock: 35 },
  { name: 'Clean Code', category: 'Books', price: 32, stock: 18 },
  { name: 'The Pragmatic Programmer', category: 'Books', price: 41.25, stock: 9 },
  { name: 'Ceramic Coffee Mug', category: 'Home', price: 12, stock: 200 },
  { name: 'Desk Lamp', category: 'Home', price: 29.9, stock: 0 },
  { name: 'Yoga Mat', category: 'Sports', price: 19.99, stock: 54 },
  { name: 'Running Shoes', category: 'Sports', price: 74, stock: 22 },
];

/** sid -> { user, products, nextId } */
const sessions = new Map();

function createSession(user) {
  if (sessions.size >= MAX_SESSIONS) sessions.delete(sessions.keys().next().value);
  const sid = crypto.randomBytes(24).toString('hex');
  sessions.set(sid, { user, products: SEED.map((p, i) => ({ id: i + 1, ...p })), nextId: SEED.length + 1 });
  return sid;
}

function getSession(req) {
  const cookies = Object.fromEntries(
    (req.headers.cookie || '').split(';').map((c) => c.trim().split('=')).filter(([k]) => k),
  );
  return cookies.sid && sessions.has(cookies.sid) ? { sid: cookies.sid, ...sessions.get(cookies.sid) } : null;
}

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'same-origin',
  'Content-Security-Policy': "default-src 'self'; style-src 'self'; script-src 'self'",
};

function send(res, status, body, headers = {}) {
  const isJson = typeof body === 'object' && body !== null && !Buffer.isBuffer(body);
  res.writeHead(status, {
    ...SECURITY_HEADERS,
    'Content-Type': isJson ? 'application/json; charset=utf-8' : 'text/html; charset=utf-8',
    ...headers,
  });
  res.end(isJson ? JSON.stringify(body) : body);
}

function redirect(res, location, headers = {}) {
  res.writeHead(302, { Location: location, ...headers });
  res.end();
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 10_000) { reject(new Error('Payload too large')); req.destroy(); }
    });
    req.on('end', () => {
      try { resolve(data ? JSON.parse(data) : {}); } catch { reject(new Error('Invalid JSON')); }
    });
  });
}

function validateProduct(input) {
  const fields = {};
  const name = typeof input.name === 'string' ? input.name.trim() : '';
  if (name.length < 3 || name.length > 60) fields.name = 'Name must be 3-60 characters';
  if (!CATEGORIES.includes(input.category)) fields.category = 'Select a valid category';
  const price = Number(input.price);
  if (typeof input.price !== 'number' || !Number.isFinite(price) || price <= 0 || price > 100000) {
    fields.price = 'Price must be greater than 0';
  }
  if (!Number.isInteger(input.stock) || input.stock < 0) fields.stock = 'Stock must be a whole number of 0 or more';
  return Object.keys(fields).length
    ? { fields }
    : { product: { name, category: input.category, price: Math.round(price * 100) / 100, stock: input.stock } };
}

async function handleApi(req, res, url) {
  const route = `${req.method} ${url.pathname}`;

  if (route === 'GET /api/health') return send(res, 200, { status: 'ok' });

  if (route === 'POST /api/login') {
    const body = await readJson(req);
    if (!body.username || !body.password) return send(res, 400, { error: 'Username and password are required' });
    const hash = (v) => crypto.createHash('sha256').update(String(v)).digest();
    const ok = body.username === USER && crypto.timingSafeEqual(hash(body.password), hash(PASS));
    if (!ok) return send(res, 401, { error: 'Invalid username or password' });
    const sid = createSession(USER);
    return send(res, 200, { username: USER }, { 'Set-Cookie': `sid=${sid}; HttpOnly; SameSite=Lax; Path=/` });
  }

  const session = getSession(req);
  if (!session) return send(res, 401, { error: 'Authentication required' });
  const store = sessions.get(session.sid);

  if (route === 'POST /api/logout') {
    sessions.delete(session.sid);
    return send(res, 200, { ok: true }, { 'Set-Cookie': 'sid=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0' });
  }

  if (route === 'GET /api/me') return send(res, 200, { username: session.user });
  if (route === 'GET /api/categories') return send(res, 200, CATEGORIES);

  if (route === 'GET /api/products') {
    // BUG-001 (intentional, documented): the query is NOT trimmed, so
    // "  mouse " returns no results. See docs/sample-bug-report.md.
    const q = (url.searchParams.get('q') || '').toLowerCase();
    const category = url.searchParams.get('category') || '';
    const items = store.products.filter((p) =>
      p.name.toLowerCase().includes(q) && (!category || category === 'All' || p.category === category));
    return send(res, 200, items);
  }

  if (route === 'POST /api/products') {
    const { fields, product } = validateProduct(await readJson(req));
    if (fields) return send(res, 400, { error: 'Validation failed', fields });
    const created = { id: store.nextId++, ...product };
    store.products.push(created);
    return send(res, 201, created);
  }

  const match = url.pathname.match(/^\/api\/products\/(\d+)$/);
  if (match) {
    const idx = store.products.findIndex((p) => p.id === Number(match[1]));
    if (idx === -1) return send(res, 404, { error: 'Product not found' });
    if (req.method === 'PUT') {
      const { fields, product } = validateProduct(await readJson(req));
      if (fields) return send(res, 400, { error: 'Validation failed', fields });
      store.products[idx] = { id: store.products[idx].id, ...product };
      return send(res, 200, store.products[idx]);
    }
    if (req.method === 'DELETE') {
      store.products.splice(idx, 1);
      res.writeHead(204, SECURITY_HEADERS);
      return res.end();
    }
  }

  return send(res, 404, { error: 'Not found' });
}

const PAGES = { '/login': 'login.html', '/products': 'products.html', '/about': 'about.html' };
const PRIVATE_PAGES = new Set(['/products', '/about']);
const MIME = { '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml' };

function handlePage(req, res, url) {
  const session = getSession(req);
  if (url.pathname === '/') return redirect(res, session ? '/products' : '/login');
  if (url.pathname === '/login' && session) return redirect(res, '/products');
  if (PRIVATE_PAGES.has(url.pathname) && !session) {
    return redirect(res, `/login?next=${encodeURIComponent(url.pathname)}`);
  }
  if (PAGES[url.pathname]) return send(res, 200, fs.readFileSync(path.join(PUBLIC_DIR, PAGES[url.pathname])));

  if (url.pathname.startsWith('/assets/')) {
    const file = path.normalize(path.join(PUBLIC_DIR, url.pathname));
    if (file.startsWith(path.join(PUBLIC_DIR, 'assets')) && fs.existsSync(file) && fs.statSync(file).isFile()) {
      res.writeHead(200, { ...SECURITY_HEADERS, 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
      return res.end(fs.readFileSync(file));
    }
  }
  return send(res, 404, fs.readFileSync(path.join(PUBLIC_DIR, '404.html')));
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  try {
    if (url.pathname.startsWith('/api/')) return await handleApi(req, res, url);
    return handlePage(req, res, url);
  } catch (err) {
    const status = err.message === 'Invalid JSON' || err.message === 'Payload too large' ? 400 : 500;
    if (!res.headersSent) send(res, status, { error: status === 400 ? err.message : 'Internal server error' });
  }
});

server.listen(PORT, () => console.log(`QA Demo Store running on http://localhost:${PORT}`));
