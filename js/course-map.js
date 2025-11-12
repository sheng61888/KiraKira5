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
    pendingUnitId: null,
    units: [],
    completedUnitIds: new Set()
  };

  const COURSE_MAP_PATH = (() => {
    const path = window.location.pathname || "/html/course-map.html";
    return path.endsWith("course-map.html") ? path : "/html/course-map.html";
  })();

  const buildCourseMapLink = (moduleId, unitId) => {
    if (!moduleId) {
      return COURSE_MAP_PATH;
    }
    const unitSegment = unitId ? `&unit=${encodeURIComponent(unitId)}` : "";
    return `${COURSE_MAP_PATH}?module=${encodeURIComponent(moduleId)}${unitSegment}`;
  };

  const storageKey = moduleId => `kiraUnitProgress:${moduleId}`;

  const loadUnitProgress = moduleId => {
    if (!moduleId || typeof window === "undefined") {
      return null;
    }
    try {
      const raw = localStorage.getItem(storageKey(moduleId));
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const saveUnitProgress = (moduleId, payload) => {
    if (!moduleId || typeof window === "undefined") {
      return;
    }
    try {
      localStorage.setItem(storageKey(moduleId), JSON.stringify(payload));
    } catch {
      /* ignore */
    }
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

  const setupVideoPlaylist = (wrapperEl, playlist) => {
    if (!wrapperEl || !Array.isArray(playlist) || !playlist.length) {
      return;
    }
    const videoEl = wrapperEl.querySelector("video");
    if (!videoEl) {
      return;
    }
    const sourceEl = videoEl.querySelector("source") || videoEl.appendChild(document.createElement("source"));
    const statusEl = wrapperEl.querySelector("[data-video-status]");
    const titleEl = wrapperEl.querySelector("[data-video-title]");
    const prevBtn = wrapperEl.querySelector("[data-video-prev]");
    const nextBtn = wrapperEl.querySelector("[data-video-next]");

    let index = 0;

    const updateMeta = clip => {
      if (titleEl) {
        titleEl.textContent = clip?.title || `Clip ${index + 1}`;
      }
      if (statusEl) {
        statusEl.textContent = `${index + 1} of ${playlist.length}`;
      }
      if (prevBtn) {
        prevBtn.disabled = index === 0;
      }
      if (nextBtn) {
        nextBtn.disabled = index === playlist.length - 1;
      }
    };

    const loadClip = (clipIndex, autoplay = false) => {
      const clip = playlist[clipIndex];
      if (!clip) {
        return;
      }
      index = clipIndex;
      sourceEl.src = clip.src || clip.link || "";
      sourceEl.type = clip.type || "video/mp4";
      videoEl.load();
      updateMeta(clip);
      if (autoplay) {
        const playPromise = videoEl.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(() => {});
        }
      }
    };

    const goPrevious = () => {
      if (index === 0) {
        return;
      }
      loadClip(index - 1, true);
    };

    const goNext = () => {
      if (index >= playlist.length - 1) {
        return;
      }
      loadClip(index + 1, true);
    };

    videoEl.addEventListener("ended", goNext);
    if (prevBtn) {
      prevBtn.addEventListener("click", goPrevious);
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", goNext);
    }

    loadClip(0);
  };

  const resolveUnitLink = (moduleId, unit) => {
    const cta = unit?.cta || unit?.Cta;
    if (cta?.link) {
      return cta.link;
    }
    return buildCourseMapLink(moduleId, normalizeId(unit?.id || unit?.unitId || unit?.UnitId));
  };

  const selectUnit = unitId => {
    const units = state.units || [];
    if (!units.length) {
      return;
    }
    const fallbackId = units[0].id || units[0].unitId || units[0].UnitId || `unit-${0}`;
    const targetId = normalizeId(unitId) || normalizeId(fallbackId);
    const unit = units.find(u => normalizeId(u.id || u.unitId || u.UnitId) === targetId) || units[0];
    const normalizedId = normalizeId(unit.id || unit.unitId || unit.UnitId);
    const previousId = state.selectedUnitId;
    state.selectedUnitId = normalizedId;

    if (previousId && previousId !== normalizedId) {
      state.completedUnitIds.add(previousId);
    }

    const stored = loadUnitProgress(state.moduleId) || {};
    const payload = {
      ...stored,
      moduleId: state.moduleId,
      completed: Array.from(state.completedUnitIds),
      lastUnitId: normalizedId,
      lastTitle: unit.title || unit.Title || "",
      lastUrl: resolveUnitLink(state.moduleId, unit),
      courseMap: buildCourseMapLink(state.moduleId, normalizedId),
      updatedAt: new Date().toISOString()
    };
    saveUnitProgress(state.moduleId, payload);

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
      } else if (state.completedUnitIds.has(id)) {
        button.classList.add("is-completed");
      }

      const order = document.createElement("span");
      order.className = "unit-nav-order";
      order.textContent = String(index + 1).padStart(2, "0");

      const info = document.createElement("div");
      const title = document.createElement("strong");
      title.textContent = unit.title || `Unit ${index + 1}`;
      const meta = document.createElement("small");
      const duration = unit.duration || unit.Duration || "Self paced";
      meta.textContent = `${formatType(unit.type || unit.Type)} · ${duration}`;

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
    const objectives = Array.isArray(unit.objectives || unit.Objectives) ? unit.objectives || unit.Objectives : [];
    const resources = Array.isArray(unit.resources || unit.Resources) ? unit.resources || unit.Resources : [];
    const videos = Array.isArray(unit.videos || unit.Videos) ? unit.videos || unit.Videos : [];
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

    const hasVideos = videos.length > 0;
    const videoSection = hasVideos
      ? `<div class="unit-video-player-wrap">
           <video class="unit-video-player" controls playsinline preload="metadata" aria-label="Lesson video playlist">
             <source>
             Sorry, your browser doesn't support embedded videos.
           </video>
           <div class="unit-video-controls">
             <button type="button" class="btn btn--ghost btn--video-nav" data-video-prev>Previous video</button>
             <div class="unit-video-meta">
               <strong data-video-title>&nbsp;</strong>
               <span class="muted" data-video-status></span>
             </div>
             <button type="button" class="btn btn--ghost btn--video-nav" data-video-next>Next video</button>
           </div>
         </div>`
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
      ${videoSection}
      ${resources.length ? `<h3>Resources</h3>${resourceList}` : ""}
      ${actionButton ? `<div class="unit-cta">${actionButton}</div>` : ""}
      <div class="unit-next">
        <button class="btn btn--primary${nextUnit ? "" : " btn--ghost-disabled"}" type="button" ${
          nextUnit ? `data-next-unit="${nextId}"` : "disabled"
        }>${nextLabel}</button>
      </div>
    `;

    if (hasVideos) {
      const playerWrap = panel.querySelector(".unit-video-player-wrap");
      setupVideoPlaylist(playerWrap, videos);
    }

    if (nextUnit) {
      const button = panel.querySelector("[data-next-unit]");
      if (button) {
        button.addEventListener("click", () => selectUnit(nextId));
      }
    }
  };

  const updateHeader = entry => {
    const { section, module } = entry;
    const gradeLabel = section?.grade ? `${section.grade} · Module ${module.number}` : "Module";
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
    const stored = loadUnitProgress(state.moduleId) || {};
    state.completedUnitIds = new Set(
      Array.isArray(stored.completed) ? stored.completed.map(normalizeId) : []
    );
    const initialUnitId = state.pendingUnitId || stored.lastUnitId;
    selectUnit(initialUnitId || state.units[0].id || state.units[0].unitId || state.units[0].UnitId);
  };

  const init = () => {
    const params = new URLSearchParams(window.location.search);
    state.moduleId = params.get("module") || state.moduleId || "form4-01";
    state.pendingUnitId = params.get("unit");
    hydrateModule();
  };

  document.addEventListener("DOMContentLoaded", init);
  document.addEventListener("kira:modules-ready", hydrateModule);
})();
