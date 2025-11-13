(() => {
  const selectors = {
    form: "#checklistForm",
    input: "#checklistInput",
    list: "#checklistList",
    empty: "[data-role='checklist-empty']",
    clear: "[data-action='clear-checklist']"
  };

  const MAX_ITEMS = 10;

  const state = {
    items: [],
    wired: false,
    refs: {
      form: null,
      input: null,
      list: null,
      empty: null,
      clearBtn: null
    }
  };

  const storageKey = () => {
    const learnerId = sessionStorage.getItem("currentLearnerId") || "anon";
    return `kiraDashboardChecklist:${learnerId}`;
  };

  const load = () => {
    try {
      const raw = localStorage.getItem(storageKey());
      const parsed = raw ? JSON.parse(raw) : [];
      state.items = Array.isArray(parsed) ? parsed : [];
    } catch {
      state.items = [];
    }
  };

  const save = () => {
    try {
      localStorage.setItem(storageKey(), JSON.stringify(state.items));
    } catch {
      /* ignore quota errors */
    }
  };

  const render = () => {
    const { list, empty } = state.refs;
    if (!list) {
      return;
    }
    list.innerHTML = "";
    if (!state.items.length) {
      if (empty) {
        empty.hidden = false;
      }
      return;
    }
    if (empty) {
      empty.hidden = true;
    }
    const fragment = document.createDocumentFragment();
    state.items.forEach(item => {
      const li = document.createElement("li");
      li.className = "checklist-item";
      li.dataset.id = item.id;
      if (item.completed) {
        li.classList.add("completed");
      }

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = !!item.completed;
      checkbox.dataset.action = "toggle-checklist";
      checkbox.dataset.id = item.id;

      const label = document.createElement("label");
      label.textContent = item.text;

      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.dataset.action = "delete-checklist";
      removeBtn.dataset.id = item.id;
      removeBtn.setAttribute("aria-label", "Delete goal");
      removeBtn.innerHTML = "<span aria-hidden=\"true\">&times;</span>";

      li.appendChild(checkbox);
      li.appendChild(label);
      li.appendChild(removeBtn);
      fragment.appendChild(li);
    });
    list.appendChild(fragment);
  };

  const addItem = text => {
    const trimmed = text.trim();
    if (!trimmed) {
      return;
    }
    if (state.items.length >= MAX_ITEMS) {
      if (state.refs.input) {
        state.refs.input.setCustomValidity(`You can track up to ${MAX_ITEMS} tasks. Complete or delete one to add more.`);
        state.refs.input.reportValidity();
        window.setTimeout(() => state.refs.input && state.refs.input.setCustomValidity(""), 2000);
      }
      return;
    }
    const id = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `goal-${Date.now()}`;
    state.items.push({ id, text: trimmed, completed: false });
    save();
    render();
  };

  const toggleItem = id => {
    state.items = state.items.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    save();
    render();
  };

  const deleteItem = id => {
    state.items = state.items.filter(item => item.id !== id);
    save();
    render();
  };

  const clearCompleted = () => {
    state.items = state.items.filter(item => !item.completed);
    save();
    render();
  };

  const handleSubmit = event => {
    event.preventDefault();
    const value = state.refs.input?.value ?? "";
    if (!value.trim()) {
      return;
    }
    addItem(value);
    state.refs.input.value = "";
    state.refs.input.focus();
  };

  const handleListChange = event => {
    const target = event.target;
    if (target?.dataset?.action === "toggle-checklist" && target.dataset.id) {
      toggleItem(target.dataset.id);
    }
  };

  const handleListClick = event => {
    const trigger = event.target?.closest("[data-action='delete-checklist']");
    if (trigger && trigger.dataset.id) {
      deleteItem(trigger.dataset.id);
    }
  };

  const ensureRefs = () => {
    state.refs.form = document.querySelector(selectors.form);
    state.refs.input = document.querySelector(selectors.input);
    state.refs.list = document.querySelector(selectors.list);
    state.refs.empty = document.querySelector(selectors.empty);
    state.refs.clearBtn = document.querySelector(selectors.clear);
    return state.refs.form && state.refs.input && state.refs.list;
  };

  const wireEvents = () => {
    if (state.wired) {
      return;
    }
    const { form, list, clearBtn } = state.refs;
    if (!form || !list) {
      return;
    }
    form.addEventListener("submit", handleSubmit);
    list.addEventListener("change", handleListChange);
    list.addEventListener("click", handleListClick);
    if (clearBtn) {
      clearBtn.addEventListener("click", clearCompleted);
    }
    state.wired = true;
  };

  const mount = () => {
    if (!ensureRefs()) {
      return;
    }
    wireEvents();
    load();
    render();
  };

  const ready = () => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", mount, { once: true });
    } else {
      mount();
    }
  };

  ready();
  window.kiraChecklist = {
    mount,
    reload() {
      load();
      render();
    },
    add: addItem,
    clear: clearCompleted
  };
})();
