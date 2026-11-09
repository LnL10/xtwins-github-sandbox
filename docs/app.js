// Gestor de Tarefas — app de demonstração para os testes do xTwins.
// Sem backend: os dados vivem no localStorage do browser e a sessão no sessionStorage.

const USERS = [{ username: "qa.demo", password: "Demo#2026", name: "Utilizador Demo" }];
const TASKS_KEY = "xtwins-sandbox-tasks";
const SESSION_KEY = "xtwins-sandbox-user";
const FLASH_KEY = "xtwins-sandbox-flash";
const TITLE_MAX = 80;

const SEED_TASKS = [
  { id: 1, title: "Preparar relatório mensal", description: "Consolidar os indicadores de outubro.", priority: "Alta", status: "Em curso", dueDate: "2027-01-15", createdAt: "2026-11-02" },
  { id: 2, title: "Rever contrato do fornecedor", description: "Validar as cláusulas de penalização.", priority: "Média", status: "Por fazer", dueDate: "2027-02-01", createdAt: "2026-11-03" },
  { id: 3, title: "Atualizar manual do utilizador", description: "", priority: "Baixa", status: "Por fazer", dueDate: "", createdAt: "2026-11-04" },
  { id: 4, title: "Agendar reunião de equipa", description: "Sala grande, 1 hora.", priority: "Média", status: "Concluída", dueDate: "2026-11-10", createdAt: "2026-11-01" },
  { id: 5, title: "Corrigir erro no formulário de registo", description: "O campo NIF aceita letras.", priority: "Alta", status: "Por fazer", dueDate: "2027-01-05", createdAt: "2026-11-05" },
  { id: 6, title: "Arquivar faturas do trimestre", description: "", priority: "Baixa", status: "Concluída", dueDate: "", createdAt: "2026-10-28" },
];

const STATUSES = ["Por fazer", "Em curso", "Concluída"];

// ---------- storage ----------
function read(storage, key, fallback) {
  try {
    const raw = storage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}
function write(storage, key, value) {
  try {
    if (value === null) storage.removeItem(key);
    else storage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage indisponível: a app continua, sem persistir */
  }
}

let memoryTasks = null;
function loadTasks() {
  const stored = read(localStorage, TASKS_KEY, null);
  if (stored) return stored;
  return memoryTasks ?? structuredClone(SEED_TASKS);
}
function saveTasks(tasks) {
  memoryTasks = tasks;
  write(localStorage, TASKS_KEY, tasks);
}
function resetTasks() {
  memoryTasks = null;
  write(localStorage, TASKS_KEY, null);
}

function currentUser() {
  return read(sessionStorage, SESSION_KEY, null);
}
function setFlash(message) {
  write(sessionStorage, FLASH_KEY, message);
}
function takeFlash() {
  const message = read(sessionStorage, FLASH_KEY, null);
  write(sessionStorage, FLASH_KEY, null);
  return message;
}

// ---------- helpers ----------
const $ = (selector) => document.querySelector(selector);
function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}
function formatDate(iso) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}
function todayIso() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}
function statusClass(status) {
  return { "Por fazer": "todo", "Em curso": "doing", "Concluída": "done" }[status] ?? "todo";
}

function requireSession() {
  const user = currentUser();
  if (!user) {
    window.location.replace("login.html");
    return null;
  }
  $("[data-testid=current-user]").textContent = user.name;
  $("[data-testid=logout]").addEventListener("click", () => {
    write(sessionStorage, SESSION_KEY, null);
    setFlash("Sessão terminada.");
    window.location.href = "login.html";
  });
  return user;
}

function showFlash() {
  const message = takeFlash();
  const box = $("[data-testid=flash-message]");
  if (message && box) {
    box.textContent = message;
    box.hidden = false;
  }
}

// ---------- pages ----------
function initLogin() {
  if (currentUser()) {
    window.location.replace("tarefas.html");
    return;
  }
  showFlash();
  const form = $("#login-form");
  const error = $("[data-testid=login-error]");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const username = $("#username").value.trim();
    const password = $("#password").value;
    error.hidden = true;
    if (!username || !password) {
      error.textContent = "Preencha o utilizador e a palavra-passe.";
      error.hidden = false;
      return;
    }
    const user = USERS.find((u) => u.username === username && u.password === password);
    if (!user) {
      error.textContent = "Utilizador ou palavra-passe inválidos.";
      error.hidden = false;
      $("#password").value = "";
      return;
    }
    write(sessionStorage, SESSION_KEY, { username: user.username, name: user.name });
    window.location.href = "tarefas.html";
  });
}

function initTasks() {
  if (!requireSession()) return;
  showFlash();
  const search = $("#search");
  const statusFilter = $("#status-filter");
  const params = new URLSearchParams(window.location.search);
  search.value = params.get("q") ?? "";
  statusFilter.value = STATUSES.includes(params.get("estado")) ? params.get("estado") : "";

  function render() {
    const term = search.value.trim().toLowerCase();
    const status = statusFilter.value;
    const tasks = loadTasks().filter(
      (t) => (!term || t.title.toLowerCase().includes(term)) && (!status || t.status === status),
    );
    const body = $("[data-testid=tasks-table] tbody");
    body.innerHTML = tasks
      .map(
        (t) => `<tr data-testid="task-row-${t.id}">
          <td><a href="tarefa.html?id=${t.id}" data-testid="task-link-${t.id}">${escapeHtml(t.title)}</a></td>
          <td>${t.priority}</td>
          <td><span class="badge ${statusClass(t.status)}">${t.status}</span></td>
          <td>${formatDate(t.dueDate)}</td>
        </tr>`,
      )
      .join("");
    $("[data-testid=tasks-empty]").hidden = tasks.length > 0;
    $("[data-testid=tasks-table]").hidden = tasks.length === 0;
    $("[data-testid=tasks-count]").textContent = tasks.length === 1 ? "1 tarefa" : `${tasks.length} tarefas`;
  }

  search.addEventListener("input", render);
  statusFilter.addEventListener("change", render);
  $("[data-testid=reset-data]").addEventListener("click", () => {
    resetTasks();
    search.value = "";
    statusFilter.value = "";
    const box = $("[data-testid=flash-message]");
    box.textContent = "Dados de demonstração repostos.";
    box.hidden = false;
    render();
  });
  render();
}

function initNewTask() {
  if (!requireSession()) return;
  const form = $("#task-form");
  const title = $("#title");
  const dueDate = $("#due-date");
  const titleError = $("[data-testid=error-title]");
  const dueDateError = $("[data-testid=error-due-date]");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    titleError.hidden = true;
    dueDateError.hidden = true;
    title.removeAttribute("aria-invalid");
    dueDate.removeAttribute("aria-invalid");
    let valid = true;

    const titleValue = title.value.trim();
    if (!titleValue) {
      titleError.textContent = "O título é obrigatório.";
      valid = false;
    } else if (titleValue.length > TITLE_MAX) {
      titleError.textContent = `O título não pode ter mais de ${TITLE_MAX} caracteres.`;
      valid = false;
    }
    if (!valid) {
      titleError.hidden = false;
      title.setAttribute("aria-invalid", "true");
    }
    if (dueDate.value && dueDate.value < todayIso()) {
      dueDateError.textContent = "A data limite não pode ser no passado.";
      dueDateError.hidden = false;
      dueDate.setAttribute("aria-invalid", "true");
      valid = false;
    }
    if (!valid) return;

    const tasks = loadTasks();
    const id = tasks.reduce((max, t) => Math.max(max, t.id), 0) + 1;
    tasks.push({
      id,
      title: titleValue,
      description: $("#description").value.trim(),
      priority: $("#priority").value,
      status: "Por fazer",
      dueDate: dueDate.value,
      createdAt: todayIso(),
    });
    saveTasks(tasks);
    setFlash("Tarefa criada com sucesso.");
    window.location.href = "tarefas.html";
  });
}

function initTaskDetail() {
  if (!requireSession()) return;
  showFlash();
  const id = Number(new URLSearchParams(window.location.search).get("id"));
  const tasks = loadTasks();
  const task = tasks.find((t) => t.id === id);
  if (!task) {
    $("[data-testid=task-not-found]").hidden = false;
    return;
  }
  $("[data-testid=task-detail]").hidden = false;

  function render() {
    $("[data-testid=task-title]").textContent = task.title;
    $("[data-testid=task-description]").textContent = task.description || "Sem descrição.";
    $("[data-testid=task-priority]").textContent = task.priority;
    const status = $("[data-testid=task-status]");
    status.textContent = task.status;
    status.className = `badge ${statusClass(task.status)}`;
    $("[data-testid=task-due-date]").textContent = formatDate(task.dueDate);
    $("[data-testid=task-created-at]").textContent = formatDate(task.createdAt);
    $("[data-testid=task-start]").hidden = task.status !== "Por fazer";
    $("[data-testid=task-complete]").hidden = task.status === "Concluída";
    $("[data-testid=task-reopen]").hidden = task.status !== "Concluída";
  }

  function changeStatus(status, message) {
    task.status = status;
    saveTasks(tasks);
    const box = $("[data-testid=flash-message]");
    box.textContent = message;
    box.hidden = false;
    render();
  }

  $("[data-testid=task-start]").addEventListener("click", () => changeStatus("Em curso", "Tarefa iniciada."));
  $("[data-testid=task-complete]").addEventListener("click", () => changeStatus("Concluída", "Tarefa concluída."));
  $("[data-testid=task-reopen]").addEventListener("click", () => changeStatus("Por fazer", "Tarefa reaberta."));

  const confirmBox = $("[data-testid=delete-confirmation]");
  $("[data-testid=task-delete]").addEventListener("click", () => {
    confirmBox.hidden = false;
  });
  $("[data-testid=delete-cancel]").addEventListener("click", () => {
    confirmBox.hidden = true;
  });
  $("[data-testid=delete-confirm]").addEventListener("click", () => {
    saveTasks(tasks.filter((t) => t.id !== task.id));
    setFlash("Tarefa eliminada.");
    window.location.href = "tarefas.html";
  });

  render();
}

const PAGES = { login: initLogin, tasks: initTasks, "new-task": initNewTask, "task-detail": initTaskDetail };
document.addEventListener("DOMContentLoaded", () => PAGES[document.body.dataset.page]?.());
