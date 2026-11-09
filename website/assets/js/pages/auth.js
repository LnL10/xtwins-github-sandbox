// Iniciar sessão, criar conta e recuperar a palavra-passe.
import { href } from "../config.js";
import { call } from "../core/api.js";
import { currentUser, login, lockRemaining, safeReturnPath, startSession } from "../core/auth.js";
import { db } from "../core/store.js";
import { $, field, main, params, setFlash, setTitle, showErrors, toast } from "../core/ui.js";
import * as v from "../core/validators.js";

function destination(user) {
  const back = safeReturnPath(params().get("voltar"));
  if (back) return href(back);
  return href(user.role === "gestor" ? "admin/index.html" : "index.html");
}

// ---------- login ----------

export function loginPage() {
  setTitle("Iniciar sessão");
  const user = currentUser();
  if (user) {
    window.location.replace(destination(user));
    return;
  }
  const back = params().get("voltar");
  main().innerHTML = `
    <section class="card narrow">
      <h1>Iniciar sessão</h1>
      ${back ? '<p class="hint" data-testid="login-required">Inicie sessão para continuar.</p>' : ""}
      <form id="login-form" novalidate data-testid="login-form">
        <div class="alert error" role="alert" data-testid="login-error" hidden></div>
        ${field({ name: "email", label: "Email", type: "email", required: true, attrs: 'autocomplete="username"', testid: "login-email" })}
        <div class="field">
          <label for="f-password">Palavra-passe <span class="req" aria-hidden="true">*</span></label>
          <div class="password">
            <input id="f-password" name="password" type="password" autocomplete="current-password" data-testid="login-password" aria-describedby="f-password-error">
            <button type="button" class="link" id="toggle-password" aria-pressed="false" data-testid="toggle-password">Mostrar</button>
          </div>
          <p class="field-error" id="f-password-error" data-error-for="password" data-testid="error-login-password" hidden></p>
        </div>
        <label class="choice"><input type="checkbox" name="remember" value="1" data-testid="login-remember"> Manter sessão iniciada</label>
        <div class="actions">
          <button type="submit" class="primary" data-testid="login-submit">Entrar</button>
        </div>
      </form>
      <p><a href="${href("recuperar-password.html")}" data-testid="forgot-password">Esqueceu-se da palavra-passe?</a></p>
      <p>Ainda não tem conta? <a href="${href(`registo.html${back ? `?voltar=${encodeURIComponent(back)}` : ""}`)}" data-testid="go-register">Criar conta</a></p>
    </section>`;

  const form = $("#login-form");
  const errorBox = $("[data-testid=login-error]");
  $("#toggle-password").addEventListener("click", (event) => {
    const input = form.elements.password;
    const show = input.type === "password";
    input.type = show ? "text" : "password";
    event.target.textContent = show ? "Ocultar" : "Mostrar";
    event.target.setAttribute("aria-pressed", String(show));
  });

  let timer;
  const showLock = (seconds) => {
    clearInterval(timer);
    const submit = $("[data-testid=login-submit]");
    const tick = () => {
      const left = lockRemaining(form.elements.email.value) || seconds--;
      if (left <= 0) {
        clearInterval(timer);
        errorBox.hidden = true;
        submit.disabled = false;
        return;
      }
      errorBox.textContent = `Demasiadas tentativas falhadas. Tente novamente dentro de ${left} segundos.`;
      errorBox.hidden = false;
      submit.disabled = true;
    };
    tick();
    timer = setInterval(tick, 1000);
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    errorBox.hidden = true;
    const email = form.elements.email.value.trim();
    const password = form.elements.password.value;
    const errors = {
      email: v.email(email),
      password: password ? null : "Indique a palavra-passe.",
    };
    if (!showErrors(form, errors, { summary: false })) return;
    const submit = $("[data-testid=login-submit]");
    submit.disabled = true;
    let result;
    try {
      result = await call("conta", () => login(email, password));
    } catch (error) {
      toast(error.message, { type: "error" });
      return;
    } finally {
      submit.disabled = false;
    }
    if (result.ok) {
      startSession(result.user, form.elements.remember.checked);
      setFlash(`Bem-vindo, ${result.user.name.split(" ")[0]}!`);
      window.location.href = destination(result.user);
      return;
    }
    form.elements.password.value = "";
    if (result.error === "locked") return showLock(result.seconds);
    errorBox.textContent =
      result.error === "blocked"
        ? "Esta conta está bloqueada. Contacte o apoio ao cliente."
        : `Email ou palavra-passe incorretos.${result.remaining <= 2 ? ` Restam ${result.remaining} ${result.remaining === 1 ? "tentativa" : "tentativas"} antes de a conta ficar bloqueada durante 1 minuto.` : ""}`;
    errorBox.hidden = false;
    form.elements.password.focus();
  });
}

// ---------- registo ----------

export function registerPage() {
  setTitle("Criar conta");
  if (currentUser()) {
    window.location.replace(href("conta/index.html"));
    return;
  }
  main().innerHTML = `
    <section class="card narrow wide">
      <h1>Criar conta</h1>
      <form id="register-form" novalidate data-testid="register-form">
        <div class="alert error" role="alert" data-testid="form-errors" hidden></div>
        ${field({ name: "name", label: "Nome completo", required: true, attrs: 'autocomplete="name"', testid: "register-name" })}
        ${field({ name: "email", label: "Email", type: "email", required: true, attrs: 'autocomplete="email"', testid: "register-email" })}
        <div class="row">
          ${field({ name: "phone", label: "Telemóvel (opcional)", type: "tel", testid: "register-phone" })}
          ${field({ name: "nif", label: "NIF (opcional)", testid: "register-nif", attrs: 'inputmode="numeric"' })}
        </div>
        <div class="field">
          <label for="f-password">Palavra-passe <span class="req" aria-hidden="true">*</span></label>
          <input id="f-password" name="password" type="password" autocomplete="new-password" aria-describedby="password-rules f-password-error" data-testid="register-password">
          <div class="strength" data-testid="password-strength" aria-live="polite"><span class="bar"><span></span></span> <span class="label"></span></div>
          <ul class="rules" id="password-rules" data-testid="password-rules">
            ${v.PASSWORD_RULES.map((r) => `<li data-rule="${r.id}" data-testid="rule-${r.id}">${r.label}</li>`).join("")}
          </ul>
          <p class="field-error" id="f-password-error" data-error-for="password" data-testid="error-register-password" hidden></p>
        </div>
        ${field({ name: "confirm", label: "Confirmar palavra-passe", type: "password", required: true, attrs: 'autocomplete="new-password"', testid: "register-confirm" })}
        <label class="choice"><input type="checkbox" name="terms" value="1" data-testid="register-terms"> Li e aceito os Termos e Condições e a Política de Privacidade <span class="req" aria-hidden="true">*</span></label>
        <p class="field-error" data-error-for="terms" data-testid="error-register-terms" hidden></p>
        <label class="choice"><input type="checkbox" name="newsletter" value="1" data-testid="register-newsletter"> Quero receber novidades e promoções por email</label>
        <div class="actions"><button type="submit" class="primary" data-testid="register-submit">Criar conta</button></div>
      </form>
      <p>Já tem conta? <a href="${href("login.html")}" data-testid="go-login">Iniciar sessão</a></p>
    </section>`;

  const form = $("#register-form");
  const password = form.elements.password;
  password.addEventListener("input", () => {
    const value = password.value;
    v.PASSWORD_RULES.forEach((rule) => $(`[data-rule=${rule.id}]`).classList.toggle("met", rule.test(value)));
    const strength = v.passwordStrength(value);
    const box = $("[data-testid=password-strength]");
    box.dataset.level = strength.level;
    $(".label", box).textContent = strength.label ? `Força: ${strength.label}` : "";
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(form));
    const email = (values.email ?? "").trim().toLowerCase();
    const errors = {
      name: (values.name ?? "").trim().length < 3 ? "Indique o nome completo (pelo menos 3 caracteres)." : null,
      email: v.email(email) ?? (db.find("users", (u) => u.email.toLowerCase() === email) ? "Já existe uma conta com este email." : null),
      phone: v.phone(values.phone, { optional: true, mobileOnly: true }),
      nif: v.nif(values.nif),
      password: v.newPassword(values.password ?? ""),
      confirm: !values.confirm ? "Confirme a palavra-passe." : values.confirm !== values.password ? "As palavras-passe não coincidem." : null,
      terms: values.terms ? null : "Tem de aceitar os Termos e Condições.",
    };
    if (!showErrors(form, errors)) return;
    let user;
    try {
      user = await call("conta", () => {
      const users = db.all("users");
      return db.insert("users", {
        id: Math.max(...users.map((u) => u.id)) + 1,
        name: values.name.trim(),
        email,
        password: values.password,
        role: "cliente",
        status: "ativo",
        phone: (values.phone ?? "").replace(/\s/g, ""),
        nif: values.nif ?? "",
        newsletter: Boolean(values.newsletter),
        addresses: [],
        createdAt: new Date().toISOString(),
      });
      });
    } catch (error) {
      toast(error.message, { type: "error" });
      return;
    }
    startSession(user);
    setFlash("Conta criada com sucesso. Bem-vindo à Loja Aurora!");
    window.location.href = destination(user);
  });
}

// ---------- recuperar palavra-passe ----------

export function recoverPage() {
  setTitle("Recuperar palavra-passe");
  main().innerHTML = `
    <section class="card narrow">
      <h1>Recuperar palavra-passe</h1>
      <p>Indique o email da sua conta. Vamos enviar-lhe uma ligação para definir uma nova palavra-passe.</p>
      <form id="recover-form" novalidate data-testid="recover-form">
        ${field({ name: "email", label: "Email", type: "email", required: true, testid: "recover-email" })}
        <div class="actions"><button type="submit" class="primary" data-testid="recover-submit">Enviar instruções</button></div>
      </form>
      <div class="alert ok" role="status" data-testid="recover-sent" hidden></div>
      <p><a href="${href("login.html")}" data-testid="back-to-login">Voltar a iniciar sessão</a></p>
    </section>`;
  const form = $("#recover-form");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = form.elements.email.value.trim();
    if (!showErrors(form, { email: v.email(email) }, { summary: false })) return;
    try {
      await call("conta", () => null);
    } catch (error) {
      toast(error.message, { type: "error" });
      return;
    }
    // Mesma resposta exista ou não a conta (não revelar que emails estão registados).
    const box = $("[data-testid=recover-sent]");
    box.textContent = `Se existir uma conta associada a ${email}, vai receber um email com instruções nos próximos minutos.`;
    box.hidden = false;
    form.hidden = true;
  });
}
