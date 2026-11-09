// Sessão e permissões. A sessão fica no sessionStorage (ou no localStorage com "Lembrar-me").
import { currentPath, href } from "../config.js";
import { db, readKey, writeKey } from "./store.js";

export const MAX_ATTEMPTS = 5;
export const LOCK_SECONDS = 60;

export function currentUser() {
  const session = readKey("session", null, "session") ?? readKey("session", null, "local");
  if (!session) return null;
  const user = db.find("users", (u) => u.id === session.userId);
  if (!user || user.status !== "ativo") {
    endSession();
    return null;
  }
  return user;
}

export function startSession(user, remember = false) {
  writeKey("session", { userId: user.id }, remember ? "local" : "session");
}

export function endSession() {
  writeKey("session", null, "session");
  writeKey("session", null, "local");
}

function attempts() {
  return readKey("attempts", {});
}

/** Segundos que faltam para a conta voltar a aceitar tentativas (0 = não bloqueada). */
export function lockRemaining(emailAddress) {
  const entry = attempts()[emailAddress.toLowerCase()];
  if (!entry?.lockedUntil) return 0;
  return Math.max(0, Math.ceil((entry.lockedUntil - Date.now()) / 1000));
}

/**
 * Tenta iniciar sessão. Devolve { ok, user } ou { ok: false, error, remaining? }.
 * Regras: 5 tentativas falhadas seguidas bloqueiam o email durante 60 segundos; contas bloqueadas
 * pelo gestor nunca entram.
 */
export function login(emailAddress, password) {
  const key = emailAddress.trim().toLowerCase();
  const all = attempts();
  const entry = all[key] ?? { failures: 0, lockedUntil: 0 };
  if (entry.lockedUntil && entry.lockedUntil > Date.now()) {
    return { ok: false, error: "locked", seconds: lockRemaining(key) };
  }
  if (entry.lockedUntil) {
    entry.failures = 0;
    entry.lockedUntil = 0;
  }
  const user = db.find("users", (u) => u.email.toLowerCase() === key);
  if (user && user.password === password) {
    if (user.status !== "ativo") return { ok: false, error: "blocked" };
    delete all[key];
    writeKey("attempts", all);
    return { ok: true, user };
  }
  entry.failures += 1;
  if (entry.failures >= MAX_ATTEMPTS) entry.lockedUntil = Date.now() + LOCK_SECONDS * 1000;
  all[key] = entry;
  writeKey("attempts", all);
  if (entry.lockedUntil) return { ok: false, error: "locked", seconds: LOCK_SECONDS };
  return { ok: false, error: "invalid", remaining: MAX_ATTEMPTS - entry.failures };
}

/**
 * Garante sessão (e o perfil, quando dado) antes de mostrar a página. Sem sessão vai para o login com
 * `voltar`; com o perfil errado vai para acesso-negado.html. Devolve o utilizador ou null.
 */
export function requireUser(role = null) {
  const user = currentUser();
  if (!user) {
    window.location.replace(href(`login.html?voltar=${encodeURIComponent(currentPath())}`));
    return null;
  }
  if (role && user.role !== role) {
    window.location.replace(href("acesso-negado.html"));
    return null;
  }
  return user;
}

/** Só aceita destinos internos (evita redirecionamentos para outros sites). */
export function safeReturnPath(value) {
  if (!value || /^[a-z]+:|^\/\/|\\/i.test(value) || value.includes("..")) return null;
  return value.replace(/^\/+/, "");
}
