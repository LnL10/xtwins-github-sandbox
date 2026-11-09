// "Servidor" simulado: cada chamada demora a latência configurada no painel de demonstração e pode
// falhar de propósito, por área, para testar estados de carregamento e de erro.
import { readKey, writeKey } from "./store.js";

export const AREAS = {
  catalogo: "Catálogo e produtos",
  checkout: "Checkout e pagamentos",
  conta: "Área de cliente",
  backoffice: "Backoffice",
};

const DEFAULTS = { latency: 300, failures: {} };

export function demoSettings() {
  const saved = readKey("demo", {});
  return { ...DEFAULTS, ...saved, failures: { ...(saved.failures ?? {}) } };
}

export function saveDemoSettings(settings) {
  writeKey("demo", settings);
}

export class ApiError extends Error {
  constructor(message, code = "SERVICE_UNAVAILABLE") {
    super(message);
    this.code = code;
  }
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Corre `fn` como se fosse um pedido ao servidor da área indicada. */
export async function call(area, fn, { extraLatency = 0 } = {}) {
  const settings = demoSettings();
  await wait(Number(settings.latency) + extraLatency);
  if (settings.failures[area]) {
    throw new ApiError("O serviço está temporariamente indisponível. Tente novamente dentro de alguns instantes.");
  }
  return fn();
}
