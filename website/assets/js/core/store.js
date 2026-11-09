// Persistência no browser. Cada coleção vive numa chave do localStorage; se o storage não estiver
// disponível (modo privado, bloqueado), a app continua a funcionar em memória.
import { DATA_VERSION } from "../config.js";
import { buildSeed } from "../data/seed.js";

const PREFIX = "aurora:";
const memory = new Map();

function storage(kind) {
  try {
    const s = kind === "session" ? window.sessionStorage : window.localStorage;
    const probe = PREFIX + "probe";
    s.setItem(probe, "1");
    s.removeItem(probe);
    return s;
  } catch {
    return null;
  }
}

export function readKey(key, fallback = null, kind = "local") {
  const s = storage(kind);
  const full = PREFIX + key;
  try {
    const raw = s ? s.getItem(full) : memory.get(kind + full);
    return raw == null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function writeKey(key, value, kind = "local") {
  const s = storage(kind);
  const full = PREFIX + key;
  try {
    if (value === null || value === undefined) {
      s ? s.removeItem(full) : memory.delete(kind + full);
    } else {
      const raw = JSON.stringify(value);
      s ? s.setItem(full, raw) : memory.set(kind + full, raw);
    }
  } catch {
    /* quota cheia: o valor fica só nesta página */
  }
}

const COLLECTIONS = ["products", "users", "orders", "reviews", "coupons", "stores", "categories"];

function ensureSeed() {
  if (readKey("version") === DATA_VERSION) return;
  const seed = buildSeed(new Date());
  for (const name of COLLECTIONS) writeKey(`db:${name}`, seed[name]);
  writeKey("version", DATA_VERSION);
  writeKey("cart", null);
}

export const db = {
  all(name) {
    ensureSeed();
    return readKey(`db:${name}`, []);
  },
  save(name, rows) {
    ensureSeed();
    writeKey(`db:${name}`, rows);
  },
  find(name, predicate) {
    return db.all(name).find(predicate) ?? null;
  },
  update(name, id, changes) {
    const rows = db.all(name);
    const index = rows.findIndex((row) => row.id === id);
    if (index < 0) return null;
    rows[index] = { ...rows[index], ...(typeof changes === "function" ? changes(rows[index]) : changes) };
    db.save(name, rows);
    return rows[index];
  },
  insert(name, row) {
    const rows = db.all(name);
    rows.push(row);
    db.save(name, rows);
    return row;
  },
  remove(name, id) {
    db.save(name, db.all(name).filter((row) => row.id !== id));
  },
};

/** Apaga todos os dados da loja (produtos, encomendas, contas, carrinho e sessão) e volta ao estado inicial. */
export function resetAll() {
  for (const kind of ["local", "session"]) {
    const s = storage(kind);
    if (!s) continue;
    Object.keys(s)
      .filter((key) => key.startsWith(PREFIX))
      .forEach((key) => s.removeItem(key));
  }
  memory.clear();
  ensureSeed();
}
