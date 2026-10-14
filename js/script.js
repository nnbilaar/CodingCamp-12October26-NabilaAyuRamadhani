// ===== Storage helpers =====
const KEYS = {
  tasks: "dashboard_tasks",
  links: "dashboard_links",
  name: "dashboard_name",
  theme: "dashboard_theme",
};

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn("Gagal menyimpan ke Local Storage", e);
  }
}

// ===== Greeting, clock & custom name =====
const clockEl = document.getElementById("clock");
const dateEl = document.getElementById("date");
const greetingEl = document.getElementById("greeting-text");
const nameInput = document.getElementById("name-input");
const saveNameBtn = document.getElementById("save-name");

let userName = load(KEYS.name, "");

function getGreeting(hour) {
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}

function updateClock() {
  const now = new Date();
  clockEl.textContent = now.toLocaleTimeString("en-GB");
  dateEl.textContent = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const base = getGreeting(now.getHours());
  greetingEl.textContent = userName ? `${base}, ${userName}` : base;
}

saveNameBtn.addEventListener("click", () => {
  userName = nameInput.value.trim();
  save(KEYS.name, userName);
  updateClock();
});

nameInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") saveNameBtn.click();
});

nameInput.value = userName;
updateClock();
setInterval(updateClock, 1000);

// ===== Focus timer =====
const TIMER_SECONDS = 25 * 60;
const timerEl = document.getElementById("timer");
let remaining = TIMER_SECONDS;
let timerId = null;

function renderTimer() {
  const m = String(Math.floor(remaining / 60)).padStart(2, "0");
  const s = String(remaining % 60).padStart(2, "0");
  timerEl.textContent = `${m}:${s}`;
}

function stopTimer() {
  clearInterval(timerId);
  timerId = null;
}

document.getElementById("timer-start").addEventListener("click", () => {
  if (timerId !== null || remaining <= 0) return;
  timerId = setInterval(() => {
    remaining--;
    renderTimer();
    if (remaining <= 0) {
      stopTimer();
      alert("Waktu fokus selesai! Saatnya istirahat sejenak.");
    }
  }, 1000);
});

document.getElementById("timer-stop").addEventListener("click", stopTimer);

document.getElementById("timer-reset").addEventListener("click", () => {
  stopTimer();
  remaining = TIMER_SECONDS;
  renderTimer();
});

renderTimer();

// ===== To-do list =====
const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const taskError = document.getElementById("task-error");

let tasks = load(KEYS.tasks, []);
let editingId = null;

function isDuplicate(text, ignoreId = null) {
  const target = text.trim().toLowerCase();
  return tasks.some((t) => t.id !== ignoreId && t.text.trim().toLowerCase() === target);
}

function saveTasks() {
  save(KEYS.tasks, tasks);
}

function renderTasks() {
  taskList.innerHTML = "";

  if (tasks.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty";
    empty.textContent = "Belum ada tugas.";
    taskList.appendChild(empty);
    return;
  }

  tasks.forEach((task) => {
    const li = document.createElement("li");
    li.className = "task-item" + (task.done ? " done" : "");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.done;
    checkbox.addEventListener("change", () => {
      task.done = checkbox.checked;
      saveTasks();
      renderTasks();
    });
    li.appendChild(checkbox);

    if (editingId === task.id) {
      const editInput = document.createElement("input");
      editInput.type = "text";
      editInput.className = "task-edit-input";
      editInput.value = task.text;
      editInput.maxLength = 100;
      li.appendChild(editInput);

      const saveBtn = document.createElement("button");
      saveBtn.className = "btn btn-primary btn-small";
      saveBtn.textContent = "Save";
      const commit = () => {
        const value = editInput.value.trim();
        if (!value) return;
        if (isDuplicate(value, task.id)) {
          taskError.textContent = "Tugas dengan nama itu sudah ada.";
          return;
        }
        task.text = value;
        editingId = null;
        taskError.textContent = "";
        saveTasks();
        renderTasks();
      };
      saveBtn.addEventListener("click", commit);
      editInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") commit();
        if (e.key === "Escape") {
          editingId = null;
          renderTasks();
        }
      });
      li.appendChild(saveBtn);
      setTimeout(() => editInput.focus(), 0);
    } else {
      const span = document.createElement("span");
      span.className = "task-text";
      span.textContent = task.text;
      li.appendChild(span);

      const actions = document.createElement("div");
      actions.className = "task-actions";

      const editBtn = document.createElement("button");
      editBtn.className = "btn btn-small";
      editBtn.textContent = "Edit";
      editBtn.addEventListener("click", () => {
        editingId = task.id;
        taskError.textContent = "";
        renderTasks();
      });

      const delBtn = document.createElement("button");
      delBtn.className = "btn btn-danger";
      delBtn.textContent = "Delete";
      delBtn.addEventListener("click", () => {
        tasks = tasks.filter((t) => t.id !== task.id);
        saveTasks();
        renderTasks();
      });

      actions.append(editBtn, delBtn);
      li.appendChild(actions);
    }

    taskList.appendChild(li);
  });
}

taskForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = taskInput.value.trim();
  if (!text) return;

  if (isDuplicate(text)) {
    taskError.textContent = "Tugas dengan nama itu sudah ada.";
    return;
  }

  tasks.push({ id: Date.now(), text, done: false });
  taskError.textContent = "";
  taskInput.value = "";
  saveTasks();
  renderTasks();
});

taskInput.addEventListener("input", () => {
  taskError.textContent = "";
});

renderTasks();

// ===== Quick links =====
const linkForm = document.getElementById("link-form");
const linkNameInput = document.getElementById("link-name");
const linkUrlInput = document.getElementById("link-url");
const linkList = document.getElementById("link-list");

const defaultLinks = [
  { id: 1, name: "Google", url: "https://www.google.com" },
  { id: 2, name: "Gmail", url: "https://mail.google.com" },
  { id: 3, name: "Calendar", url: "https://calendar.google.com" },
];

let links = load(KEYS.links, defaultLinks);

function normalizeUrl(value) {
  const v = value.trim();
  if (!v) return "";
  return /^https?:\/\//i.test(v) ? v : "https://" + v;
}

function renderLinks() {
  linkList.innerHTML = "";
  links.forEach((link) => {
    const wrap = document.createElement("div");
    wrap.className = "link-item";

    const a = document.createElement("a");
    a.className = "link-btn";
    a.href = link.url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.textContent = link.name;

    const remove = document.createElement("button");
    remove.className = "link-remove";
    remove.textContent = "×";
    remove.setAttribute("aria-label", `Hapus ${link.name}`);
    remove.addEventListener("click", () => {
      links = links.filter((l) => l.id !== link.id);
      save(KEYS.links, links);
      renderLinks();
    });

    wrap.append(a, remove);
    linkList.appendChild(wrap);
  });
}

linkForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = linkNameInput.value.trim();
  const url = normalizeUrl(linkUrlInput.value);
  if (!name || !url) return;

  try {
    new URL(url);
  } catch (err) {
    alert("URL tidak valid.");
    return;
  }

  links.push({ id: Date.now(), name, url });
  save(KEYS.links, links);
  linkNameInput.value = "";
  linkUrlInput.value = "";
  renderLinks();
});

save(KEYS.links, links);
renderLinks();

// ===== Light / Dark mode =====
const themeToggle = document.getElementById("theme-toggle");

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  themeToggle.textContent = theme === "dark" ? "☀️" : "🌙";
}

let theme = load(KEYS.theme, window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
applyTheme(theme);

themeToggle.addEventListener("click", () => {
  theme = theme === "dark" ? "light" : "dark";
  save(KEYS.theme, theme);
  applyTheme(theme);
});
