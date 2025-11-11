(() => {
  const selectors = {
    grade: "#courseGrade",
    title: "#courseTitle",
    summary: "#courseSummary",
    focus: "#courseFocus",
    unitCount: "#courseUnitCount",
    duration: "#courseDuration",
    pace: "#coursePace",
    nav: "#unitNav",
    detail: "#unitDetail",
    startButton: "[data-action='start-module']"
  };

  const state = {
    moduleId: null,
    moduleEntry: null,
    selectedUnitId: null,
    units: []
  };

  const getEl = selector => document.querySelector(selector);

  const parseDuration = value => {
    if (!value) {
      return 0;
    }
    const match = value.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  };

  const formatType = type => {
    if (!type) {
      return "Unit";
    }
    const normalized = type.toLowerCase();
    const lookup = {
      overview: "Overview",
      warmup: "Warm-up",
      lesson: "Lesson",
      video: "Video",
      quiz: "Quiz",
      concept: "Concept",
      practice: "Practice",
      checkpoint: "Checkpoint",
      application: "Application",
      assessment: "Assessment"
    };
    return lookup[normalized] || type.charAt(0).toUpperCase() + type.slice(1);
  };

  const flattenModules = () => {
    const catalogue = Array.isArray(window.kiraModules) ? window.kiraModules : [];
    const entries = [];
    catalogue.forEach(section => {
      (section.modules || section.Modules || []).forEach(module => {
        entries.push({ section, module });
      });
    });
    return entries;
  };

  const normalizeId = value => (value || "").toString().trim().toLowerCase();
  const deriveModuleId = (section, module) => {
    if (!module) {
      return "";
    }
    return (
      module.moduleId ||
      module.ModuleId ||
      normalizeId(module.link || module.Link || "") ||
      `form${section?.grade?.match(/\d+/)?.[0] || ""}-${module.number || ""}`
    ).trim();
  };

  const findModule = moduleId => {
    const target = normalizeId(moduleId);
    return flattenModules().find(entry => {
      const module = entry.module || {};
      const candidates = [
        module.moduleId,
        module.ModuleId,
        module.number ? `form${entry.section?.grade?.match(/\d+/)?.[0] || ""}-${module.number}` : null,
        module.link,
        module.Link
      ]
        .filter(Boolean)
        .map(normalizeId);
      return candidates.some(candidate => candidate && (candidate === target || candidate.endsWith(target)));
    });
  };

  const getUnits = module => module?.units || module?.Units || [];

  const wantsRescueVideos = () => {
    if (window.kiraOnboardingData && typeof window.kiraOnboardingData.wantsVideos === "boolean") {
      return window.kiraOnboardingData.wantsVideos;
    }
    try {
      const stored = localStorage.getItem("kiraOnboarding");
      if (stored) {
        const parsed = JSON.parse(stored);
        return !!parsed?.wantsVideos;
      }
    } catch (error) {
      console.warn("Unable to parse onboarding data", error);
    }
    return false;
  };

  const collectVisibleUnits = module => {
    const wantsVideos = wantsRescueVideos();
    return getUnits(module).filter(unit => wantsVideos || !(unit.rescueOnly || unit.RescueOnly));
  };

  const selectUnit = unitId => {
    const units = state.units || [];
    if (!units.length) {
      return;
    }
    const fallbackId = units[0].id || units[0].unitId || units[0].UnitId || `unit-${0}`;
    const targetId = normalizeId(unitId) || normalizeId(fallbackId);
    const unit = units.find(u => normalizeId(u.id || u.unitId || u.UnitId) === targetId) || units[0];
    state.selectedUnitId = normalizeId(unit.id || unit.unitId || unit.UnitId);
    renderUnitNav();
    renderUnitDetail(unit);
  };

  const renderUnitNav = () => {
    const units = state.units || [];
    const nav = getEl(selectors.nav);
    if (!nav) {
      return;
    }
    if (!units.length) {
      nav.innerHTML = "<p class=\"muted\">Coach is still writing this module. Check back soon.</p>";
      return;
    }
    nav.innerHTML = "";
    units.forEach((unit, index) => {
      const id = normalizeId(unit.id || unit.unitId || unit.UnitId || `unit-${index}`);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "unit-nav-item";
      if (id === state.selectedUnitId) {
        button.classList.add("is-active");
      }

      const order = document.createElement("span");
      order.className = "unit-nav-order";
      order.textContent = String(index + 1).padStart(2, "0");

      const info = document.createElement("div");
      const title = document.createElement("strong");
      title.textContent = unit.title || `Unit ${index + 1}`;
      const meta = document.createElement("small");
      const duration = unit.duration || unit.Duration || "Self paced";
      meta.textContent = `${formatType(unit.type || unit.Type)} Â· ${duration}`;

      info.appendChild(title);
      info.appendChild(meta);

      button.appendChild(order);
      button.appendChild(info);
      button.addEventListener("click", () => selectUnit(id));
      nav.appendChild(button);
    });
  };

  const renderUnitDetail = unit => {
    const panel = getEl(selectors.detail);
    if (!panel) {
      return;
    }
    if (!unit) {
      panel.innerHTML = "<p class=\"muted\">Select a unit to load its overview.</p>";
      return;
    }
    const typeChip = `<span class="chip chip--info">${formatType(unit.type || unit.Type)}</span>`;
    const durationChip = `<span class="chip">${unit.duration || unit.Duration || "Self paced"}</span>`;
    const summary = unit.summary || unit.Summary || "";
    const body = unit.body || unit.Body || "";
    const objectives = unit.objectives || unit.Objectives || [];
    const resources = unit.resources || unit.Resources || [];
    const cta = unit.cta || unit.Cta;

    const objList = objectives.length
      ? `<div class="unit-objectives-block">
          <h3 class="unit-subhead">Objectives</h3>
          <ul class="unit-objectives">
            ${objectives.map(item => `<li>${item}</li>`).join("")}
          </ul>
        </div>`
      : "";

    const resourceList = resources.length
      ? `<ul class="unit-resource-list">
          ${resources
            .map(
              resource => `
            <li>
              <div>
                <strong>${resource.label || resource.Label}</strong>
                <small>${resource.detail || resource.Detail || resource.type || resource.Type || ""}</small>
              </div>
              ${
                resource.url || resource.Url
                  ? `<a class="btn btn--ghost" href="${resource.url || resource.Url}" target="_blank" rel="noopener noreferrer">Open</a>`
                  : ""
              }
            </li>`
            )
            .join("")}
        </ul>`
      : "";

    const actionButton =
      cta && cta.link
        ? `<a class="btn btn--primary" href="${cta.link}" target="_blank" rel="noopener noreferrer">${cta.label || "Open resource"}</a>`
        : "";

    const nextIndex = state.units.findIndex(
      candidate => normalizeId(candidate.id || candidate.unitId || candidate.UnitId) === state.selectedUnitId
    );
    const nextUnit = nextIndex >= 0 ? state.units[nextIndex + 1] : null;
    const nextId = nextUnit ? normalizeId(nextUnit.id || nextUnit.unitId || nextUnit.UnitId) : null;
    const nextLabel = nextUnit ? `Next: ${nextUnit.title || "Unit"}` : "Module complete";

    panel.innerHTML = `
      <div class="unit-detail-meta">${typeChip}${durationChip}</div>
      <h2>${unit.title || "Unit"}</h2>
      ${summary ? `<p class="unit-summary">${summary}</p>` : ""}
      ${body ? `<p class="unit-body">${body}</p>` : ""}
      ${objList}
      ${resources.length ? `<h3>Resources</h3>${resourceList}` : ""}
      ${actionButton ? `<div class="unit-cta">${actionButton}</div>` : ""}
      <div class="unit-next">
        <button class="btn btn--primary${nextUnit ? "" : " btn--ghost-disabled"}" type="button" ${
          nextUnit ? `data-next-unit="${nextId}"` : "disabled"
        }>${nextLabel}</button>
      </div>
    `;

    if (nextUnit) {
      const button = panel.querySelector("[data-next-unit]");
      if (button) {
        button.addEventListener("click", () => selectUnit(nextId));
      }
    }
  };

  const updateHeader = entry => {
    const { section, module } = entry;
    const gradeLabel = section?.grade ? `${section.grade} Â· Module ${module.number}` : "Module";
    const summary =
      module.description ||
      module.Description ||
      (Array.isArray(module.lessons) && module.lessons.length
        ? `Lessons: ${module.lessons.join(", ")}`
        : "Focus on mastery.");

    const gradeEl = getEl(selectors.grade);
    const titleEl = getEl(selectors.title);
    const summaryEl = getEl(selectors.summary);
    if (gradeEl) gradeEl.textContent = gradeLabel;
    if (titleEl) titleEl.textContent = module.title || "Module";
    if (summaryEl) summaryEl.textContent = summary;
    document.title = `KiraKira - ${module.title || "Course map"}`;
  };

  const updateMeta = (module, visibleUnits) => {
    const focusEl = getEl(selectors.focus);
    if (focusEl) {
      focusEl.textContent = module.title || "Course focus";
    }
    const units = Array.isArray(visibleUnits) ? visibleUnits : collectVisibleUnits(module);
    const minutes = units.reduce((total, unit) => total + parseDuration(unit.duration || unit.Duration), 0);
    const unitCountEl = getEl(selectors.unitCount);
    if (unitCountEl) unitCountEl.textContent = units.length ? units.length.toString() : "-";
    const durationEl = getEl(selectors.duration);
    if (durationEl) durationEl.textContent = minutes ? `~${minutes} min` : "Self paced";
    const paceEl = getEl(selectors.pace);
    if (paceEl) {
      if (!minutes) {
        paceEl.textContent = "Self paced";
      } else {
        const sessions = Math.max(1, Math.round(minutes / 25));
        paceEl.textContent = sessions === 1 ? "1 focused session" : `${sessions} sessions`;
      }
    }

    const startButton = getEl(selectors.startButton);
    if (startButton) {
      const hasUnits = units.length > 0;
      startButton.disabled = !hasUnits;
      startButton.onclick = hasUnits
        ? () => {
            selectUnit(units[0].id || units[0].unitId || units[0].UnitId);
            getEl(selectors.detail)?.scrollIntoView({ behavior: "smooth" });
          }
        : null;
    }
  };

  const showError = message => {
    const nav = getEl(selectors.nav);
    const detail = getEl(selectors.detail);
    if (nav) {
      nav.innerHTML = `<p class="muted">${message}</p>`;
    }
    if (detail) {
      detail.innerHTML = `<p class="muted">${message}</p>`;
    }
    const startButton = getEl(selectors.startButton);
    if (startButton) {
      startButton.disabled = true;
    }
  };

  const hydrateModule = () => {
    const entries = flattenModules();
    if (!entries.length) {
      showError("Module data is still loading. Please refresh in a moment.");
      return;
    }
    const entry = findModule(state.moduleId) || entries[0];
    if (!entry) {
      showError("Unable to locate that module.");
      return;
    }
    state.moduleEntry = entry;
    state.units = collectVisibleUnits(entry.module);
    if (!state.units.length) {
      showError("Coach is still writing this module. Check back soon.");
      return;
    }
    updateHeader(entry);
    updateMeta(entry.module, state.units);
    selectUnit(state.units[0].id || state.units[0].unitId || state.units[0].UnitId);
  };

  const init = () => {
    const params = new URLSearchParams(window.location.search);
    state.moduleId = params.get("module") || state.moduleId || "form4-01";
    hydrateModule();
  };

  document.addEventListener("DOMContentLoaded", init);
  document.addEventListener("kira:modules-ready", hydrateModule);
})();
