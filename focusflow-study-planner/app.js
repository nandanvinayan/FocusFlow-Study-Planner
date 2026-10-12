(() => {
  "use strict";

  const STORAGE_KEY = "focusflow.tasks.v1";
  const toneNames = ["purple", "green", "orange", "blue", "pink"];
  const tips = [
    "Start with a 25-minute focus session. One small step is enough to build momentum.",
    "Break a large assignment into the next action you can finish today.",
    "A short review soon after class can make later revision easier.",
    "Leave a little space between study sessions. Rest helps you return with focus.",
    "Choose one priority for your next session and keep the goal small and clear."
  ];

  const el = (id) => document.getElementById(id);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let tasks = readTasks();
  let currentFilter = "all";
  let newestFirst = false;
  let toastTimer;

  function dateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function dateFromOffset(days) {
    const date = new Date(today);
    date.setDate(date.getDate() + days);
    return dateKey(date);
  }

  function readTasks() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (error) {
      console.warn("FocusFlow could not read saved tasks.", error);
    }
    return [
      { id: "demo-1", title: "Review data structures notes", subject: "Data Structures", due: dateFromOffset(0), priority: "high", duration: 45, done: false },
      { id: "demo-2", title: "Finish portfolio project README", subject: "Project Work", due: dateFromOffset(1), priority: "medium", duration: 60, done: false },
      { id: "demo-3", title: "Practice SQL joins and queries", subject: "Databases", due: dateFromOffset(2), priority: "medium", duration: 45, done: false },
      { id: "demo-4", title: "Revise the OSI network layers", subject: "Computer Networks", due: dateFromOffset(4), priority: "low", duration: 25, done: true },
      { id: "demo-5", title: "Prepare lab reflection", subject: "Web Technology", due: dateFromOffset(6), priority: "high", duration: 60, done: false }
    ];
  }

  function saveTasks() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
      showToast("This browser could not save your tasks.");
      console.error("FocusFlow could not save tasks.", error);
    }
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[character]);
  }

  function formatDue(key) {
    if (key === dateKey(today)) return "Today";
    const due = new Date(`${key}T12:00:00`);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (key === dateKey(tomorrow)) return "Tomorrow";
    return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(due);
  }

  function dateLabel(date) {
    return new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric" }).format(date);
  }

  function startOfWeek(date) {
    const start = new Date(date);
    const day = (start.getDay() + 6) % 7;
    start.setDate(start.getDate() - day);
    start.setHours(0, 0, 0, 0);
    return start;
  }

  function endOfWeek(date) {
    const end = startOfWeek(date);
    end.setDate(end.getDate() + 6);
    return end;
  }

  function isThisWeek(task) {
    const key = task.due;
    return key >= dateKey(startOfWeek(today)) && key <= dateKey(endOfWeek(today));
  }

  function subjectTone(subject) {
    let hash = 0;
    for (let index = 0; index < subject.length; index += 1) hash = (hash * 31 + subject.charCodeAt(index)) >>> 0;
    return toneNames[hash % toneNames.length];
  }

  function showToast(message) {
    const toast = el("toast");
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2300);
  }

  function updateHeader() {
    const formatted = dateLabel(today);
    el("todayLabel").textContent = formatted.toLocaleUpperCase();
    const start = startOfWeek(today);
    const end = endOfWeek(today);
    const fmt = (date) => new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(date);
    el("weekRange").textContent = `${fmt(start)} – ${fmt(end)}`;
  }

  function updateStats() {
    const weekTasks = tasks.filter(isThisWeek);
    const weekCompleted = weekTasks.filter((task) => task.done).length;
    const dueToday = tasks.filter((task) => task.due === dateKey(today) && !task.done).length;
    const completed = tasks.filter((task) => task.done).length;
    const subjects = new Set(tasks.map((task) => task.subject.trim().toLowerCase()).filter(Boolean));
    const percent = weekTasks.length ? Math.round((weekCompleted / weekTasks.length) * 100) : 0;

    el("weekCount").textContent = weekTasks.length;
    el("doneCount").textContent = completed;
    el("todayCount").textContent = dueToday;
    el("subjectCount").textContent = subjects.size;
    el("doneProgress").style.width = `${tasks.length ? Math.round((completed / tasks.length) * 100) : 0}%`;
    el("todayFoot").textContent = dueToday === 0 ? "You have time to make a plan." : dueToday === 1 ? "One small step at a time." : "A little progress goes a long way.";
    el("allTabCount").textContent = tasks.length;
    el("weekPercent").textContent = `${percent}%`;
    el("weekRing").style.background = `conic-gradient(#7165dc ${percent * 3.6}deg, #f0eff8 0deg)`;
    el("weekDoneLine").textContent = `${weekCompleted} of ${weekTasks.length} tasks`;
    el("taskSummary").textContent = tasks.length ? `${tasks.length} task${tasks.length === 1 ? "" : "s"} in your plan` : "Your study plan is ready.";
  }

  function visibleTasks() {
    const query = el("searchInput").value.trim().toLowerCase();
    return tasks.filter((task) => {
      const matchesQuery = !query || `${task.title} ${task.subject}`.toLowerCase().includes(query);
      let matchesFilter = true;
      if (currentFilter === "today") matchesFilter = task.due === dateKey(today);
      if (currentFilter === "upcoming") matchesFilter = task.due > dateKey(today) && !task.done;
      if (currentFilter === "completed") matchesFilter = task.done;
      return matchesQuery && matchesFilter;
    }).sort((a, b) => {
      const dueOrder = a.due.localeCompare(b.due);
      return newestFirst ? -dueOrder : dueOrder;
    });
  }

  function renderTasks() {
    const list = el("taskList");
    const shown = visibleTasks();
    list.innerHTML = shown.map((task) => {
      const tone = subjectTone(task.subject);
      const dueClass = task.due === dateKey(today) && !task.done ? " is-today" : "";
      const priority = ["high", "medium", "low"].includes(task.priority) ? task.priority : "medium";
      const duration = Number(task.duration) || 25;
      return `<article class="task-row${task.done ? " is-complete" : ""}">
        <input class="task-check" type="checkbox" data-action="toggle" data-id="${escapeHtml(task.id)}" aria-label="Mark ${escapeHtml(task.title)} ${task.done ? "not complete" : "complete"}" ${task.done ? "checked" : ""} />
        <div class="task-main"><strong class="task-title">${escapeHtml(task.title)}</strong><div class="task-meta"><span class="subject-pill" data-tone="${tone}">${escapeHtml(task.subject)}</span><span class="duration">◷ ${duration} min</span></div></div>
        <span class="task-date${dueClass}">${escapeHtml(formatDue(task.due))}</span>
        <span class="priority priority-${priority}">${priority[0].toUpperCase()}${priority.slice(1)}</span>
        <button class="delete-task" type="button" data-action="delete" data-id="${escapeHtml(task.id)}" aria-label="Delete ${escapeHtml(task.title)}" title="Delete task">×</button>
      </article>`;
    }).join("");
    const isEmpty = shown.length === 0;
    el("emptyState").hidden = !isEmpty;
    list.hidden = isEmpty;
    el("clearCompletedButton").hidden = !tasks.some((task) => task.done);
  }

  function renderWeekDays() {
    const container = el("weekDays");
    const start = startOfWeek(today);
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(start);
      date.setDate(date.getDate() + index);
      const key = dateKey(date);
      const dayTasks = tasks.filter((task) => task.due === key);
      return { date, key, count: dayTasks.length, done: dayTasks.filter((task) => task.done).length };
    });
    const max = Math.max(1, ...days.map((day) => day.count));
    container.innerHTML = days.map((day) => {
      const height = day.count ? Math.max(4, Math.round((day.count / max) * 27)) : 0;
      return `<div class="day-column${day.key === dateKey(today) ? " is-today" : ""}" aria-label="${escapeHtml(dateLabel(day.date))}: ${day.count} planned, ${day.done} completed">
        ${new Intl.DateTimeFormat(undefined, { weekday: "narrow" }).format(day.date)}<div class="day-bar"><span style="height:${height}px"></span></div>${day.count || "·"}
      </div>`;
    }).join("");
  }

  function renderSubjects() {
    const totals = new Map();
    tasks.filter((task) => !task.done).forEach((task) => {
      const subject = task.subject.trim() || "Other";
      const current = totals.get(subject) || { count: 0, minutes: 0 };
      current.count += 1;
      current.minutes += Number(task.duration) || 25;
      totals.set(subject, current);
    });
    const rows = [...totals.entries()].sort((a, b) => b[1].minutes - a[1].minutes).slice(0, 4);
    const container = el("subjectList");
    if (!rows.length) {
      container.innerHTML = '<p class="subject-empty">Add a task to see your focus subjects.</p>';
      return;
    }
    container.innerHTML = rows.map(([subject, data]) => {
      const tone = subjectTone(subject);
      const hours = data.minutes < 60 ? `${data.minutes} min` : `${(data.minutes / 60).toFixed(data.minutes % 60 ? 1 : 0)} hr`;
      return `<div class="subject-row"><span class="subject-icon" data-tone="${tone}" aria-hidden="true">◈</span><div class="subject-copy"><strong>${escapeHtml(subject)}</strong><small>${data.count} open task${data.count === 1 ? "" : "s"}</small></div><span class="subject-hours">${hours}</span></div>`;
    }).join("");
  }

  function render() {
    updateStats();
    renderTasks();
    renderWeekDays();
    renderSubjects();
  }

  function openDialog() {
    const dialog = el("taskDialog");
    el("taskForm").reset();
    el("taskDue").value = dateKey(today);
    el("formError").hidden = true;
    dialog.showModal();
    el("taskTitle").focus();
  }

  function closeDialog() {
    el("taskDialog").close();
  }

  function onSubmit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") || "").trim();
    const subject = String(form.get("subject") || "").trim();
    const due = String(form.get("due") || "");
    if (!title || !subject || !due) {
      el("formError").textContent = "Enter a task name, subject, and due date.";
      el("formError").hidden = false;
      return;
    }
    tasks.push({
      id: window.crypto?.randomUUID ? window.crypto.randomUUID() : `task-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      title, subject, due,
      priority: String(form.get("priority") || "medium"),
      duration: Number(form.get("duration") || 25),
      done: false
    });
    saveTasks();
    currentFilter = "all";
    updateTabs();
    render();
    closeDialog();
    showToast("Task added to your study plan.");
  }

  function updateTabs() {
    document.querySelectorAll(".tab").forEach((tab) => {
      const selected = tab.dataset.filter === currentFilter;
      tab.classList.toggle("is-selected", selected);
      tab.setAttribute("aria-selected", String(selected));
    });
  }

  function handleTaskAction(event) {
    const target = event.target.closest("[data-action]");
    if (!target) return;
    const task = tasks.find((item) => item.id === target.dataset.id);
    if (!task) return;
    if (target.dataset.action === "toggle") {
      task.done = target.checked;
      saveTasks();
      render();
      showToast(task.done ? "Nice work. Task completed." : "Task moved back to your plan.");
    }
    if (target.dataset.action === "delete") {
      tasks = tasks.filter((item) => item.id !== task.id);
      saveTasks();
      render();
      showToast("Task removed from your plan.");
    }
  }

  function init() {
    updateHeader();
    saveTasks();
    render();
    el("addTaskButton").addEventListener("click", openDialog);
    el("emptyAddButton").addEventListener("click", openDialog);
    el("closeDialogButton").addEventListener("click", closeDialog);
    el("cancelDialogButton").addEventListener("click", closeDialog);
    el("taskForm").addEventListener("submit", onSubmit);
    el("taskList").addEventListener("change", handleTaskAction);
    el("taskList").addEventListener("click", handleTaskAction);
    el("searchInput").addEventListener("input", renderTasks);
    document.querySelectorAll(".tab").forEach((tab) => tab.addEventListener("click", () => {
      currentFilter = tab.dataset.filter;
      updateTabs();
      renderTasks();
    }));
    el("sortButton").addEventListener("click", () => {
      newestFirst = !newestFirst;
      renderTasks();
      showToast(newestFirst ? "Showing later due dates first." : "Showing earlier due dates first.");
    });
    el("clearCompletedButton").addEventListener("click", () => {
      const count = tasks.filter((task) => task.done).length;
      tasks = tasks.filter((task) => !task.done);
      saveTasks();
      render();
      showToast(`${count} completed task${count === 1 ? "" : "s"} cleared.`);
    });
    el("focusTipButton").addEventListener("click", () => {
      const current = tips.indexOf(el("studyTip").textContent);
      el("studyTip").textContent = tips[(current + 1) % tips.length];
    });
    el("subjectsInfoButton").addEventListener("click", () => showToast("Focus subjects come from your open tasks."));
    window.addEventListener("storage", (event) => {
      if (event.key === STORAGE_KEY && event.newValue) {
        try { tasks = JSON.parse(event.newValue); render(); } catch (error) { console.warn("Could not update from another tab.", error); }
      }
    });
  }

  init();
})();
