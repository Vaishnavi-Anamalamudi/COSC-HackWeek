const STORAGE_KEY = "habitflow-state-v1";

const defaultHabits = [
  {
    id: crypto.randomUUID(),
    name: "Morning walk",
    category: "Health",
    reminder: "07:00",
    color: "#22c55e",
    notes: "Start the day outside.",
    createdAt: addDays(todayKey(), -28),
    completions: buildPattern(28, [0, 1, 2, 4, 5, 6, 8, 9, 11, 12, 13, 15, 16, 18, 19, 20, 22, 23, 25, 26, 27]),
  },
  {
    id: crypto.randomUUID(),
    name: "Read 20 pages",
    category: "Learning",
    reminder: "21:30",
    color: "#38bdf8",
    notes: "Keep a book within reach.",
    createdAt: addDays(todayKey(), -18),
    completions: buildPattern(18, [0, 2, 3, 5, 6, 7, 9, 11, 12, 14, 15, 17]),
  },
  {
    id: crypto.randomUUID(),
    name: "Plan tomorrow",
    category: "Focus",
    reminder: "20:45",
    color: "#facc15",
    notes: "Pick the first useful action.",
    createdAt: addDays(todayKey(), -12),
    completions: buildPattern(12, [1, 2, 4, 5, 6, 8, 10, 11]),
  },
];

const achievements = [
  ["first-check", "First check-in", "Complete any habit once.", (stats) => stats.totalChecks >= 1],
  ["week-streak", "Week warrior", "Reach a 7 day streak.", (stats) => stats.longestStreak >= 7],
  ["full-day", "Perfect day", "Complete every active habit today.", (stats) => stats.habits > 0 && stats.completedToday === stats.habits],
  ["collector", "Habit stack", "Track five active habits.", (stats) => stats.habits >= 5],
  ["century", "Century club", "Log 100 total completions.", (stats) => stats.totalChecks >= 100],
  ["steady", "Steady rhythm", "Keep a 30 day completion rate above 80%.", (stats) => stats.rate >= 80],
];

let state = loadState();

const els = {
  appContent: document.querySelector("#appContent"),
  viewTitle: document.querySelector("#viewTitle"),
  globalSearch: document.querySelector("#globalSearch"),
  sidebar: document.querySelector("#sidebar"),
  mobileOverlay: document.querySelector("#mobileOverlay"),
  menuButton: document.querySelector("#menuButton"),
  themeToggle: document.querySelector("#themeToggle"),
  sidebarAddHabit: document.querySelector("#sidebarAddHabit"),
  sidebarReminder: document.querySelector("#sidebarReminder"),
  habitDialog: document.querySelector("#habitDialog"),
  habitForm: document.querySelector("#habitForm"),
  closeHabitDialog: document.querySelector("#closeHabitDialog"),
  cancelHabitForm: document.querySelector("#cancelHabitForm"),
  toastStack: document.querySelector("#toastStack"),
  achievementPopup: document.querySelector("#achievementPopup"),
};

applyTheme();
bindShell();
render();

function loadState() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (stored?.habits && stored?.settings) {
      return {
        view: "dashboard",
        search: "",
        selectedDate: todayKey(),
        filters: { category: "All", status: "All" },
        unlocked: stored.unlocked ?? [],
        habits: stored.habits,
        settings: { ...defaultSettings(), ...stored.settings },
      };
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }

  return {
    view: "dashboard",
    search: "",
    selectedDate: todayKey(),
    filters: { category: "All", status: "All" },
    unlocked: [],
    habits: defaultHabits,
    settings: defaultSettings(),
  };
}

function defaultSettings() {
  return {
    name: "Vaish",
    theme: "dark",
    accent: "#22c55e",
    targetDaily: 3,
    reminders: true,
  };
}

function saveState() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      habits: state.habits,
      settings: state.settings,
      unlocked: state.unlocked,
    }),
  );
}

function bindShell() {
  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => {
      state.view = button.dataset.view;
      closeSidebar();
      render();
    });
  });

  els.globalSearch.addEventListener("input", (event) => {
    state.search = event.target.value.trim().toLowerCase();
    render();
  });

  els.sidebarAddHabit.addEventListener("click", () => openHabitDialog());
  els.menuButton.addEventListener("click", () => openSidebar());
  els.mobileOverlay.addEventListener("click", () => closeSidebar());

  els.themeToggle.addEventListener("click", () => {
    state.settings.theme = state.settings.theme === "dark" ? "light" : "dark";
    saveState();
    applyTheme();
  });

  els.closeHabitDialog.addEventListener("click", () => els.habitDialog.close());
  els.cancelHabitForm.addEventListener("click", () => els.habitDialog.close());
  els.habitForm.addEventListener("submit", saveHabitFromDialog);

  els.appContent.addEventListener("click", handleContentClick);
  els.appContent.addEventListener("change", handleContentChange);
  els.appContent.addEventListener("submit", handleContentSubmit);
}

function render() {
  document.querySelectorAll("[data-view]").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === state.view);
  });

  const title = titleForView(state.view);
  els.viewTitle.textContent = title;
  els.sidebarReminder.textContent = sidebarReminder();
  updateProfileChip();

  const renderers = {
    dashboard: renderDashboard,
    habits: renderHabits,
    calendar: renderCalendar,
    analytics: renderAnalytics,
    settings: renderSettings,
  };

  els.appContent.innerHTML = `<div class="view">${renderers[state.view]()}</div>`;
  if (state.view === "analytics") requestAnimationFrame(drawProgressChart);
}

function renderDashboard() {
  const stats = getStats();
  return `
    <section class="hero-grid">
      <article class="hero-card">
        <p class="eyebrow">${formatDate(todayKey())}</p>
        <h2>${stats.completedToday === stats.habits ? "Every streak is alive." : "Make one clean mark today."}</h2>
        <p>${stats.completedToday} of ${stats.habits} habits are done today. Your best streak is ${stats.longestStreak} days.</p>
        <div class="quick-actions">
          <button class="primary-button" type="button" data-action="add">Add habit</button>
          <button class="secondary-button" type="button" data-view-jump="habits">Review habits</button>
        </div>
      </article>
      <article class="quote-card card">
        <p class="eyebrow">Today's cue</p>
        <blockquote>${dailyCue(stats)}</blockquote>
        <cite>HabitFlow</cite>
      </article>
    </section>
    ${renderStatsGrid(stats)}
    <section class="dashboard-grid">
      <article class="card">
        <div class="toolbar">
          <div>
            <p class="eyebrow">Today</p>
            <h2>Active habits</h2>
          </div>
          <button class="mini-button" type="button" data-action="add">New</button>
        </div>
        ${renderHabitList(filteredHabits().slice(0, 5))}
      </article>
      ${renderHeatmapPanel(40)}
    </section>
    <section class="dashboard-grid">
      <article class="card">
        <div class="toolbar">
          <div>
            <p class="eyebrow">Milestones</p>
            <h2>Achievements</h2>
          </div>
        </div>
        ${renderAchievements(stats)}
      </article>
      <article class="card">
        <div class="toolbar">
          <div>
            <p class="eyebrow">Momentum</p>
            <h2>Top streaks</h2>
          </div>
        </div>
        ${renderTopStreaks()}
      </article>
    </section>
  `;
}

function renderHabits() {
  return `
    <section class="habits-layout">
      <aside class="filter-panel card">
        <div>
          <p class="eyebrow">Filters</p>
          <h2>Habit view</h2>
        </div>
        <label>
          Category
          <select id="categoryFilter">
            ${["All", ...categories()].map((category) => option(category, state.filters.category)).join("")}
          </select>
        </label>
        <label>
          Status
          <select id="statusFilter">
            ${["All", "Done today", "Open today"].map((status) => option(status, state.filters.status)).join("")}
          </select>
        </label>
        <button class="primary-button" type="button" data-action="add">Add habit</button>
      </aside>
      <article class="card">
        <div class="toolbar">
          <div>
            <p class="eyebrow">${filteredHabits().length} shown</p>
            <h2>Habit library</h2>
          </div>
        </div>
        ${renderHabitList(filteredHabits())}
      </article>
    </section>
  `;
}

function renderCalendar() {
  const completed = habitsDoneOn(state.selectedDate);
  return `
    <section class="dashboard-grid">
      ${renderHeatmapPanel(60)}
      <article class="card">
        <div class="toolbar">
          <div>
            <p class="eyebrow">${formatDate(state.selectedDate)}</p>
            <h2>${completed.length} completions</h2>
          </div>
        </div>
        ${completed.length ? renderHabitList(completed, state.selectedDate) : emptyState("No completions logged for this date.")}
      </article>
    </section>
  `;
}

function renderAnalytics() {
  const stats = getStats();
  const score = Math.min(100, Math.round((stats.rate * 0.55) + (Math.min(stats.longestStreak, 30) / 30) * 45));
  return `
    ${renderStatsGrid(stats)}
    <section class="analytics-grid">
      <article class="analytics-panel">
        <div class="toolbar">
          <div>
            <p class="eyebrow">Last 14 days</p>
            <h2>Completion trend</h2>
          </div>
        </div>
        <div class="chart-wrap"><canvas id="progressChart"></canvas></div>
      </article>
      <article class="analytics-panel">
        <div class="toolbar">
          <div>
            <p class="eyebrow">Score</p>
            <h2>Consistency index</h2>
          </div>
        </div>
        <div class="score-ring" style="--score: ${score}%"><span>${score}</span></div>
        <p class="muted">Based on your 30 day completion rate and longest streak.</p>
      </article>
    </section>
    <section class="analytics-grid">
      <article class="analytics-panel">
        <div class="toolbar">
          <div>
            <p class="eyebrow">Categories</p>
            <h2>Completion mix</h2>
          </div>
        </div>
        ${renderCategoryBreakdown()}
      </article>
      <article class="analytics-panel">
        <div class="toolbar">
          <div>
            <p class="eyebrow">Leaders</p>
            <h2>Best streaks</h2>
          </div>
        </div>
        ${renderTopStreaks()}
      </article>
    </section>
  `;
}

function renderSettings() {
  return `
    <form class="settings-grid" id="settingsForm">
      <section class="settings-panel">
        <div class="toolbar">
          <div>
            <p class="eyebrow">Profile</p>
            <h2>Preferences</h2>
          </div>
        </div>
        <div class="form-grid">
          <label>
            Display name
            <input id="settingName" maxlength="32" value="${escapeHtml(state.settings.name)}" />
          </label>
          <label>
            Theme
            <select id="settingTheme">
              ${["dark", "light"].map((theme) => option(theme, state.settings.theme)).join("")}
            </select>
          </label>
          <label>
            Accent color
            <input id="settingAccent" type="color" value="${state.settings.accent}" />
          </label>
        </div>
      </section>
      <section class="settings-panel">
        <div class="toolbar">
          <div>
            <p class="eyebrow">Targets</p>
            <h2>Daily rhythm</h2>
          </div>
        </div>
        <div class="form-grid">
          <label>
            Daily target
            <input id="settingTarget" type="number" min="1" max="12" value="${state.settings.targetDaily}" />
          </label>
          <label>
            Reminders
            <select id="settingReminders">
              ${["on", "off"].map((value) => option(value, state.settings.reminders ? "on" : "off")).join("")}
            </select>
          </label>
          <button class="primary-button" type="submit">Save settings</button>
          <button class="secondary-button" type="button" data-action="export">Export data</button>
          <button class="danger-button" type="button" data-action="reset">Reset demo data</button>
        </div>
      </section>
    </form>
  `;
}

function renderStatsGrid(stats) {
  return `
    <section class="stats-grid">
      ${statCard("Done today", stats.completedToday, `${stats.habits} active`)}
      ${statCard("Current best", `${stats.bestCurrentStreak}d`, "live streak")}
      ${statCard("Longest streak", `${stats.longestStreak}d`, "all time")}
      ${statCard("30 day rate", `${stats.rate}%`, "completion")}
      ${statCard("Total checks", stats.totalChecks, "logged")}
    </section>
  `;
}

function statCard(label, value, meta) {
  return `<article class="stat-card"><small>${label}</small><strong>${value}</strong><span>${meta}</span></article>`;
}

function renderHabitList(habits, date = todayKey()) {
  if (!habits.length) return emptyState("No habits match this view.");

  return `<div class="habit-list">${habits
    .map((habit) => {
      const done = habit.completions.includes(date);
      const current = currentStreak(habit);
      const progress = Math.min(100, Math.round((current / Math.max(7, current)) * 100));
      return `
        <article class="habit-card" style="--habit-color: ${habit.color}">
          <div class="habit-dot">${escapeHtml(initials(habit.name))}</div>
          <div class="habit-main">
            <h3>${escapeHtml(habit.name)}</h3>
            <div class="habit-meta">
              <span class="pill">${escapeHtml(habit.category)}</span>
              ${habit.reminder ? `<span class="pill">${habit.reminder}</span>` : ""}
              <span class="pill">${current} day streak</span>
            </div>
            <div class="progress-track" aria-hidden="true"><div class="progress-bar" style="width: ${progress}%"></div></div>
          </div>
          <div class="habit-actions">
            <button class="mini-button check-button ${done ? "done" : ""}" type="button" data-action="toggle" data-id="${habit.id}" data-date="${date}">
              ${done ? "Done" : "Check"}
            </button>
            <button class="mini-button" type="button" data-action="edit" data-id="${habit.id}">Edit</button>
            <button class="mini-button" type="button" data-action="delete" data-id="${habit.id}">Delete</button>
          </div>
        </article>`;
    })
    .join("")}</div>`;
}

function renderHeatmapPanel(days) {
  return `
    <article class="heatmap-panel">
      <div class="heatmap-header">
        <div>
          <p class="eyebrow">Heatmap</p>
          <h2>${days} day streak map</h2>
        </div>
        <div class="heatmap-controls">
          <button class="mini-button" type="button" data-action="select-today">Today</button>
        </div>
      </div>
      <div class="heatmap">${renderHeatmap(days)}</div>
      <div class="heatmap-legend">
        Less <span class="legend-box"></span><span class="legend-box"></span><span class="legend-box"></span><span class="legend-box"></span> More
      </div>
    </article>
  `;
}

function renderHeatmap(days) {
  const activeCount = Math.max(1, state.habits.length);
  return Array.from({ length: days }, (_, index) => {
    const date = addDays(todayKey(), index - days + 1);
    const count = habitsDoneOn(date).length;
    const level = Math.min(4, Math.ceil((count / activeCount) * 4));
    return `
      <button class="heat-cell level-${level} ${date === todayKey() ? "today" : ""} ${date === state.selectedDate ? "selected" : ""}" type="button" data-action="select-date" data-date="${date}" title="${formatDate(date)}: ${count} completions">
        ${new Date(`${date}T00:00:00`).getDate()}
        <small>${count}</small>
      </button>`;
  }).join("");
}

function renderAchievements(stats) {
  return `<div class="achievement-grid">${achievements
    .map(([id, title, detail, test]) => {
      const unlocked = state.unlocked.includes(id) || test(stats);
      return `<article class="achievement ${unlocked ? "unlocked" : ""}"><strong>${title}</strong><span>${detail}</span></article>`;
    })
    .join("")}</div>`;
}

function renderTopStreaks() {
  const rows = [...state.habits]
    .sort((a, b) => currentStreak(b) - currentStreak(a))
    .slice(0, 5);
  return renderHabitList(rows);
}

function renderCategoryBreakdown() {
  const totals = categories().map((category) => {
    const habits = state.habits.filter((habit) => habit.category === category);
    const total = habits.reduce((sum, habit) => sum + habit.completions.length, 0);
    return { category, total };
  });

  if (!totals.length) return emptyState("Create a habit to see category analytics.");
  const max = Math.max(...totals.map((item) => item.total), 1);
  return `<div class="habit-list">${totals
    .map((item) => `
      <div>
        <div class="toolbar">
          <strong>${escapeHtml(item.category)}</strong>
          <span class="pill">${item.total} checks</span>
        </div>
        <div class="progress-track"><div class="progress-bar" style="width: ${(item.total / max) * 100}%"></div></div>
      </div>`)
    .join("")}</div>`;
}

function handleContentClick(event) {
  const jump = event.target.closest("[data-view-jump]");
  if (jump) {
    state.view = jump.dataset.viewJump;
    render();
    return;
  }

  const button = event.target.closest("[data-action]");
  if (!button) return;

  const { action, id, date } = button.dataset;
  if (action === "add") openHabitDialog();
  if (action === "edit") openHabitDialog(id);
  if (action === "toggle") toggleHabit(id, date);
  if (action === "delete") deleteHabit(id);
  if (action === "select-date") {
    state.selectedDate = date;
    state.view = "calendar";
    render();
  }
  if (action === "select-today") {
    state.selectedDate = todayKey();
    render();
  }
  if (action === "export") exportData();
  if (action === "reset") resetData();
}

function handleContentChange(event) {
  if (event.target.id === "categoryFilter") {
    state.filters.category = event.target.value;
    render();
  }
  if (event.target.id === "statusFilter") {
    state.filters.status = event.target.value;
    render();
  }
}

function handleContentSubmit(event) {
  if (event.target.id !== "settingsForm") return;
  event.preventDefault();
  state.settings.name = document.querySelector("#settingName").value.trim() || "Vaish";
  state.settings.theme = document.querySelector("#settingTheme").value;
  state.settings.accent = document.querySelector("#settingAccent").value;
  state.settings.targetDaily = Number(document.querySelector("#settingTarget").value) || 3;
  state.settings.reminders = document.querySelector("#settingReminders").value === "on";
  saveState();
  applyTheme();
  toast("Settings saved");
  render();
}

function openHabitDialog(id = "") {
  const habit = state.habits.find((item) => item.id === id);
  document.querySelector("#habitDialogTitle").textContent = habit ? "Edit habit" : "Add habit";
  document.querySelector("#habitId").value = habit?.id ?? "";
  document.querySelector("#habitName").value = habit?.name ?? "";
  document.querySelector("#habitReminder").value = habit?.reminder ?? "";
  document.querySelector("#habitColor").value = habit?.color ?? state.settings.accent;
  document.querySelector("#habitNotes").value = habit?.notes ?? "";
  document.querySelector("#customCategory").value = "";
  document.querySelector("#habitCategory").innerHTML = categories()
    .concat(["Personal", "Health", "Learning", "Focus", "Home"])
    .filter((value, index, list) => list.indexOf(value) === index)
    .map((category) => option(category, habit?.category ?? "Health"))
    .join("");
  els.habitDialog.showModal();
}

function saveHabitFromDialog(event) {
  event.preventDefault();
  const id = document.querySelector("#habitId").value;
  const customCategory = document.querySelector("#customCategory").value.trim();
  const habitData = {
    name: document.querySelector("#habitName").value.trim(),
    category: customCategory || document.querySelector("#habitCategory").value,
    reminder: document.querySelector("#habitReminder").value,
    color: document.querySelector("#habitColor").value,
    notes: document.querySelector("#habitNotes").value.trim(),
  };

  if (!habitData.name) return;

  if (id) {
    state.habits = state.habits.map((habit) => (habit.id === id ? { ...habit, ...habitData } : habit));
    toast("Habit updated");
  } else {
    state.habits.unshift({
      id: crypto.randomUUID(),
      createdAt: todayKey(),
      completions: [],
      ...habitData,
    });
    toast("Habit created");
  }

  saveState();
  els.habitDialog.close();
  render();
}

function toggleHabit(id, date = todayKey()) {
  const before = new Set(state.unlocked);
  state.habits = state.habits.map((habit) => {
    if (habit.id !== id) return habit;
    const done = habit.completions.includes(date);
    return {
      ...habit,
      completions: done
        ? habit.completions.filter((item) => item !== date)
        : [...habit.completions, date].sort(),
    };
  });
  unlockAchievements(before);
  saveState();
  toast("Streak updated");
  render();
}

function deleteHabit(id) {
  const habit = state.habits.find((item) => item.id === id);
  if (!habit || !confirm(`Delete "${habit.name}"?`)) return;
  state.habits = state.habits.filter((item) => item.id !== id);
  saveState();
  toast("Habit deleted");
  render();
}

function resetData() {
  if (!confirm("Reset HabitFlow to the demo data?")) return;
  localStorage.removeItem(STORAGE_KEY);
  state = loadState();
  applyTheme();
  toast("Demo data restored");
  render();
}

function exportData() {
  const data = JSON.stringify({ habits: state.habits, settings: state.settings }, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `habitflow-${todayKey()}.json`;
  link.click();
  URL.revokeObjectURL(url);
  toast("Export downloaded");
}

function unlockAchievements(previous) {
  const stats = getStats();
  achievements.forEach(([id, title, , test]) => {
    if (!previous.has(id) && test(stats)) {
      state.unlocked.push(id);
      showAchievement(title);
    }
  });
}

function showAchievement(title) {
  els.achievementPopup.textContent = `Achievement unlocked: ${title}`;
  els.achievementPopup.hidden = false;
  createConfetti();
  window.setTimeout(() => {
    els.achievementPopup.hidden = true;
  }, 2200);
}

function createConfetti() {
  const colors = [state.settings.accent, "#38bdf8", "#facc15", "#fb7185"];
  for (let index = 0; index < 18; index += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.background = colors[index % colors.length];
    piece.style.animationDelay = `${Math.random() * 220}ms`;
    document.body.append(piece);
    piece.addEventListener("animationend", () => piece.remove());
  }
}

function drawProgressChart() {
  const canvas = document.querySelector("#progressChart");
  if (!canvas) return;

  const rect = canvas.getBoundingClientRect();
  const scale = window.devicePixelRatio || 1;
  canvas.width = rect.width * scale;
  canvas.height = rect.height * scale;

  const ctx = canvas.getContext("2d");
  ctx.scale(scale, scale);
  ctx.clearRect(0, 0, rect.width, rect.height);

  const days = Array.from({ length: 14 }, (_, index) => addDays(todayKey(), index - 13));
  const values = days.map((date) => habitsDoneOn(date).length);
  const max = Math.max(...values, 1);
  const gap = 10;
  const barWidth = (rect.width - gap * (days.length - 1)) / days.length;

  ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--muted").trim();
  ctx.font = "12px Inter, system-ui";
  values.forEach((value, index) => {
    const height = (value / max) * (rect.height - 44);
    const x = index * (barWidth + gap);
    const y = rect.height - height - 24;
    ctx.fillStyle = state.settings.accent;
    roundRect(ctx, x, y, barWidth, height, 8);
    ctx.fill();
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--muted").trim();
    ctx.fillText(String(new Date(`${days[index]}T00:00:00`).getDate()), x + 4, rect.height - 6);
  });
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function getStats() {
  const habits = state.habits.length;
  const completedToday = habitsDoneOn(todayKey()).length;
  const totalChecks = state.habits.reduce((sum, habit) => sum + habit.completions.length, 0);
  const longestStreak = Math.max(0, ...state.habits.map(longestHabitStreak));
  const bestCurrentStreak = Math.max(0, ...state.habits.map(currentStreak));
  const days = Array.from({ length: 30 }, (_, index) => addDays(todayKey(), index - 29));
  const possible = Math.max(1, habits * days.length);
  const completed = days.reduce((sum, date) => sum + habitsDoneOn(date).length, 0);
  const rate = Math.round((completed / possible) * 100);
  return { habits, completedToday, totalChecks, longestStreak, bestCurrentStreak, rate };
}

function filteredHabits() {
  return state.habits.filter((habit) => {
    const haystack = `${habit.name} ${habit.category} ${habit.notes}`.toLowerCase();
    const matchesSearch = !state.search || haystack.includes(state.search);
    const matchesCategory = state.filters.category === "All" || habit.category === state.filters.category;
    const doneToday = habit.completions.includes(todayKey());
    const matchesStatus =
      state.filters.status === "All" ||
      (state.filters.status === "Done today" && doneToday) ||
      (state.filters.status === "Open today" && !doneToday);
    return matchesSearch && matchesCategory && matchesStatus;
  });
}

function habitsDoneOn(date) {
  return state.habits.filter((habit) => habit.completions.includes(date));
}

function categories() {
  return [...new Set(state.habits.map((habit) => habit.category).filter(Boolean))].sort();
}

function currentStreak(habit) {
  const completed = new Set(habit.completions);
  let streak = 0;
  let cursor = todayKey();
  while (completed.has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

function longestHabitStreak(habit) {
  const dates = [...new Set(habit.completions)].sort();
  let best = 0;
  let streak = 0;
  let previous = "";
  dates.forEach((date) => {
    streak = previous && date === addDays(previous, 1) ? streak + 1 : 1;
    best = Math.max(best, streak);
    previous = date;
  });
  return best;
}

function buildPattern(daysAgo, offsets) {
  return offsets.map((offset) => addDays(todayKey(), offset - daysAgo));
}

function todayKey() {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
}

function addDays(dateKey, amount) {
  const date = new Date(`${dateKey}T00:00:00`);
  date.setDate(date.getDate() + amount);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
}

function formatDate(dateKey) {
  return new Intl.DateTimeFormat("en", { weekday: "short", month: "short", day: "numeric" }).format(
    new Date(`${dateKey}T00:00:00`),
  );
}

function option(value, selected) {
  return `<option value="${escapeHtml(value)}" ${value === selected ? "selected" : ""}>${escapeHtml(value)}</option>`;
}

function emptyState(message) {
  return `<div class="empty-state">${message}</div>`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function initials(value) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function titleForView(view) {
  return {
    dashboard: "Dashboard",
    habits: "Habits",
    calendar: "Calendar",
    analytics: "Analytics",
    settings: "Settings",
  }[view];
}

function dailyCue(stats) {
  if (!stats.habits) return "Create one habit that is small enough to finish on a hard day.";
  if (stats.completedToday === stats.habits) return "Done for today. Protect the win and let it compound.";
  if (stats.completedToday > 0) return "Momentum is already moving. One more check keeps the streak honest.";
  return "Start with the smallest habit. The first check usually pulls the next one closer.";
}

function sidebarReminder() {
  const stats = getStats();
  if (!stats.habits) return "Build your first streak";
  if (stats.completedToday === stats.habits) return "All habits complete";
  return `${stats.habits - stats.completedToday} left today`;
}

function openSidebar() {
  els.sidebar.classList.add("open");
  els.mobileOverlay.hidden = false;
}

function closeSidebar() {
  els.sidebar.classList.remove("open");
  els.mobileOverlay.hidden = true;
}

function applyTheme() {
  document.documentElement.classList.toggle("light", state.settings.theme === "light");
  document.documentElement.style.setProperty("--accent", state.settings.accent);
  els.themeToggle.innerHTML = state.settings.theme === "dark" ? "&#9790;" : "&#9788;";
}

function updateProfileChip() {
  const chip = document.querySelector(".profile-chip");
  chip.querySelector("span").textContent = initials(state.settings.name || "Vaish");
  chip.querySelector("strong").textContent = state.settings.name || "Vaish";
}

function toast(message) {
  const node = document.createElement("div");
  node.className = "toast";
  node.textContent = message;
  els.toastStack.append(node);
  window.setTimeout(() => node.remove(), 2600);
}
