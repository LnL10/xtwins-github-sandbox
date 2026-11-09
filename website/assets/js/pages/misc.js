// Acesso negado e painel de demonstração (contas de teste, latência, falhas simuladas, repor dados).
import { DATA_VERSION, href } from "../config.js";
import { AREAS, demoSettings, saveDemoSettings } from "../core/api.js";
import { currentUser, endSession, startSession } from "../core/auth.js";
import { esc } from "../core/format.js";
import { db, resetAll } from "../core/store.js";
import { $, $$, confirmDialog, main, setFlash, setTitle, toast } from "../core/ui.js";

export function forbidden() {
  setTitle("Acesso negado");
  const user = currentUser();
  main().innerHTML = `
    <section class="card narrow empty" data-testid="forbidden">
      <h1>Acesso negado</h1>
      <p>Não tem permissões para aceder a esta página${user ? ` com a conta ${esc(user.email)}` : ""}.</p>
      <div class="actions">
        <a class="button primary" href="${href("index.html")}" data-testid="forbidden-home">Voltar à loja</a>
        ${user ? '<button type="button" id="switch" data-testid="forbidden-switch">Entrar com outra conta</button>' : ""}
      </div>
    </section>`;
  $("#switch")?.addEventListener("click", () => {
    endSession();
    window.location.href = href("login.html");
  });
}

const PASSWORDS = { "ana.silva@example.com": "Cliente#2026", "bruno.costa@example.com": "Cliente#2026", "diana.ferreira@example.com": "Cliente#2026", "gestor@example.com": "Gestor#2026", "bloqueado@example.com": "Cliente#2026" };

export function demoPanel() {
  setTitle("Painel de demonstração");
  const render = () => {
    const settings = demoSettings();
    const users = db.all("users");
    main().innerHTML = `
      <h1>Painel de demonstração</h1>
      <p>Esta página existe só para testes: muda o comportamento da loja <strong>neste browser</strong> (os dados vivem no armazenamento local).</p>

      <section class="card" aria-labelledby="accounts-title">
        <h2 id="accounts-title">Contas de teste</h2>
        <table class="data-table" data-testid="demo-accounts">
          <thead><tr><th scope="col">Email</th><th scope="col">Palavra-passe</th><th scope="col">Perfil</th><th scope="col">Estado</th><th scope="col"><span class="sr-only">Ações</span></th></tr></thead>
          <tbody>${users.map((u) => `
            <tr><td>${esc(u.email)}</td><td><code>${esc(PASSWORDS[u.email] ?? "(definida no registo)")}</code></td><td>${u.role === "gestor" ? "Gestor" : "Cliente"}</td><td>${u.status === "ativo" ? "Ativo" : "Bloqueado"}</td>
              <td>${u.status === "ativo" ? `<button type="button" data-login="${u.id}" data-testid="demo-login-${u.id}">Entrar como ${esc(u.name.split(" ")[0])}</button>` : ""}</td></tr>`).join("")}</tbody>
        </table>
        <p class="muted">Cartões de teste: <code>4242 4242 4242 4242</code> é aceite; <code>4000 0000 0000 0002</code> é recusado. Qualquer validade futura e qualquer CVV de 3 dígitos.</p>
        <p class="muted">Códigos promocionais: <code>AURORA10</code> (10%, mínimo 30 €), <code>BEMVINDO5</code> (5 €, mínimo 20 €), <code>PORTESGRATIS</code>, <code>VERAO2026</code> (expirado).</p>
      </section>

      <form id="demo-form" class="card" data-testid="demo-form">
        <h2>Comportamento do "servidor"</h2>
        <div class="field">
          <label for="f-latency">Latência das respostas</label>
          <select id="f-latency" name="latency" data-testid="demo-latency">
            ${[[0, "Sem latência"], [300, "300 ms (normal)"], [1000, "1 segundo"], [3000, "3 segundos (lento)"]].map(([value, label]) => `<option value="${value}" ${Number(settings.latency) === value ? "selected" : ""}>${label}</option>`).join("")}
          </select>
        </div>
        <fieldset>
          <legend>Simular falhas (o serviço responde com erro)</legend>
          ${Object.entries(AREAS).map(([id, label]) => `<label class="choice"><input type="checkbox" name="fail-${id}" ${settings.failures[id] ? "checked" : ""} data-testid="demo-fail-${id}"> ${label}</label>`).join("")}
        </fieldset>
        <div class="actions"><button type="submit" class="primary" data-testid="demo-save">Guardar</button></div>
      </form>

      <section class="card" aria-labelledby="reset-title">
        <h2 id="reset-title">Dados</h2>
        <p>Versão dos dados: ${DATA_VERSION}. Repor apaga as encomendas, contas e avaliações criadas neste browser, o carrinho e a sessão.</p>
        <button type="button" class="danger" id="reset" data-testid="demo-reset">Repor todos os dados</button>
      </section>`;

    $("#demo-form").addEventListener("submit", (event) => {
      event.preventDefault();
      const form = event.target;
      saveDemoSettings({
        latency: Number(form.elements.latency.value),
        failures: Object.fromEntries(Object.keys(AREAS).map((id) => [id, form.elements[`fail-${id}`].checked])),
      });
      toast("Definições de demonstração guardadas.");
    });
    $$("[data-login]").forEach((button) =>
      button.addEventListener("click", () => {
        const user = users.find((u) => u.id === Number(button.dataset.login));
        startSession(user);
        setFlash(`Sessão iniciada como ${user.name}.`);
        window.location.href = href(user.role === "gestor" ? "admin/index.html" : "index.html");
      }),
    );
    $("#reset").addEventListener("click", async () => {
      if (!(await confirmDialog("Repor todos os dados da loja neste browser?", { title: "Repor dados", confirmLabel: "Repor", danger: true }))) return;
      resetAll();
      render();
      toast("Os dados foram repostos.");
    });
  };
  render();
}
