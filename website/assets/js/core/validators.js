// Regras de validação partilhadas pelos formulários. Cada função devolve a mensagem de erro, ou null.

export const required = (value, message) => (String(value ?? "").trim() ? null : message);

export function email(value) {
  if (!String(value).trim()) return "Indique o email.";
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim()) ? null : "Indique um email válido.";
}

/** NIF português: 9 dígitos, primeiro dígito válido e dígito de controlo (módulo 11). */
export function isValidNif(value) {
  const nif = String(value).replace(/\s/g, "");
  if (!/^[125689]\d{8}$/.test(nif)) return false;
  const sum = [...nif.slice(0, 8)].reduce((acc, digit, i) => acc + Number(digit) * (9 - i), 0);
  const check = 11 - (sum % 11);
  return (check >= 10 ? 0 : check) === Number(nif[8]);
}

export function nif(value, { optional = true } = {}) {
  if (!String(value ?? "").trim()) return optional ? null : "Indique o NIF.";
  return isValidNif(value) ? null : "NIF inválido.";
}

export function postalCode(value) {
  if (!String(value).trim()) return "Indique o código postal.";
  return /^\d{4}-\d{3}$/.test(value.trim()) ? null : "Código postal inválido (formato 0000-000).";
}

export const isIslandPostalCode = (value) => /^9\d{3}-\d{3}$/.test(String(value).trim());

export function phone(value, { optional = false, mobileOnly = false } = {}) {
  const clean = String(value ?? "").replace(/\s/g, "");
  if (!clean) return optional ? null : "Indique o telefone.";
  const pattern = mobileOnly ? /^9[1236]\d{7}$/ : /^(9[1236]|2\d)\d{7}$/;
  if (pattern.test(clean)) return null;
  return mobileOnly ? "Indique um telemóvel português válido (9 dígitos, começa por 91, 92, 93 ou 96)." : "Telefone inválido (9 dígitos).";
}

export function luhn(number) {
  const digits = String(number).replace(/\s/g, "");
  if (!/^\d{13,19}$/.test(digits)) return false;
  let sum = 0;
  [...digits].reverse().forEach((d, i) => {
    let n = Number(d);
    if (i % 2 === 1) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
  });
  return sum % 10 === 0;
}

export function cardNumber(value) {
  if (!String(value).trim()) return "Indique o número do cartão.";
  return luhn(value) ? null : "Número de cartão inválido.";
}

export function cardExpiry(value, now = new Date()) {
  const match = /^(\d{2})\/(\d{2})$/.exec(String(value).trim());
  if (!match) return "Validade inválida (formato MM/AA).";
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  if (month < 1 || month > 12) return "Validade inválida (formato MM/AA).";
  const lastDay = new Date(year, month, 0, 23, 59, 59);
  return lastDay >= now ? null : "O cartão está fora da validade.";
}

export const cvv = (value) => (/^\d{3}$/.test(String(value).trim()) ? null : "CVV inválido (3 dígitos).");

export const PASSWORD_RULES = [
  { id: "length", label: "Pelo menos 8 caracteres", test: (v) => v.length >= 8 },
  { id: "upper", label: "Uma letra maiúscula", test: (v) => /[A-Z]/.test(v) },
  { id: "lower", label: "Uma letra minúscula", test: (v) => /[a-z]/.test(v) },
  { id: "digit", label: "Um número", test: (v) => /\d/.test(v) },
  { id: "symbol", label: "Um símbolo (ex.: # ! ?)", test: (v) => /[^A-Za-z0-9]/.test(v) },
];

export function passwordStrength(value) {
  const passed = PASSWORD_RULES.filter((rule) => rule.test(value)).length;
  if (!value) return { level: 0, label: "" };
  if (passed <= 2) return { level: 1, label: "Fraca" };
  if (passed <= 4) return { level: 2, label: "Média" };
  return { level: 3, label: "Forte" };
}

export function newPassword(value) {
  if (!value) return "Indique a palavra-passe.";
  return PASSWORD_RULES.every((rule) => rule.test(value)) ? null : "A palavra-passe não cumpre os requisitos.";
}

export const tracking = (value) =>
  /^[A-Z]{2}\d{9}PT$/.test(String(value).trim().toUpperCase()) ? null : "Número de seguimento inválido (ex.: RR123456789PT).";
