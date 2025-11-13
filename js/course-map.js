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

  const DOT = " \u00B7 ";

  const state = {
    moduleId: null,
    moduleEntry: null,
    pendingUnitId: null,
    selectedUnitId: null,
    units: [],
    completedUnitIds: new Set()
  };

  let completionButtonListenerBound = false;
  const NOTIFICATION_HISTORY_KEY = "kiraNotificationHistory";
  const USER_STATS_KEY = "kiraUserStats";
  const MODULE_COMPLETIONS_KEY = "kiraModuleCompletions";
  const MAX_NOTIFICATIONS = 25;

  const readJson = (key, fallback) => {
    if (typeof window === "undefined") {
      return fallback;
    }
    try {
      const raw = localStorage.getItem(key);
      if (!raw) {
        return fallback;
      }
      const parsed = JSON.parse(raw);
      return parsed ?? fallback;
    } catch {
      return fallback;
    }
  };

  const writeJson = (key, value) => {
    if (typeof window === "undefined") {
      return;
    }
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* ignore storage errors */
    }
  };

  const queueCompletionNotification = () => {
    if (!state.moduleId) {
      return;
    }
    const moduleTitle = state.moduleEntry?.module?.title || "Module";
    const record = {
      id: `module-${state.moduleId}-${Date.now()}`,
      title: `${moduleTitle} complete`,
      body: "Check the Milestones section in your Profile to see your reward.",
      kind: "module",
      timestamp: new Date().toISOString()
    };
    const history = readJson(NOTIFICATION_HISTORY_KEY, []);
    const updated = [record, ...(Array.isArray(history) ? history : [])].slice(0, MAX_NOTIFICATIONS);
    writeJson(NOTIFICATION_HISTORY_KEY, updated);
  };

  const COURSE_MAP_PATH = (() => {
    const path = window.location.pathname || "/html/course-map.html";
    return path.endsWith("course-map.html") ? path : "/html/course-map.html";
  })();

  const storageKey = moduleId => `kiraUnitProgress:${moduleId}`;

  const normalizeId = value => (value || "").toString().trim().toLowerCase();

  const getEl = selector => document.querySelector(selector);

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
      /* ignore quota errors */
    }
  };

  const parseDurationMinutes = value => {
    if (!value) {
      return 0;
    }
    const match = value.toString().match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  };

  const formatDurationLabel = minutes => {
    if (!minutes) {
      return "Self paced";
    }
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainder = minutes % 60;
    return remainder ? `${hours}h ${remainder}m` : `${hours}h`;
  };

  const formatType = type => {
    if (!type) {
      return "Unit";
    }
    const normalized = type.toString().toLowerCase();
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

  const deriveModuleId = (section, module) => {
    if (!module) {
      return "";
    }
    const direct =
      module.moduleId ||
      module.ModuleId ||
      module.slug ||
      module.Slug;
    if (direct) {
      return direct.toString().trim();
    }
    const link = module.link || module.Link;
    if (link) {
      const match = link.match(/module=([^&]+)/i);
      if (match && match[1]) {
        try {
          return decodeURIComponent(match[1]).trim();
        } catch {
          return match[1].trim();
        }
      }
      const cleaned = link
        .replace(/^https?:\/\/[^/]+/i, "")
        .split(/[?#]/)[0]
        .replace(/^\//, "")
        .replace(/\.html?$/i, "")
        .trim();
      if (cleaned) {
        return cleaned;
      }
    }
    if (module.number && section?.grade) {
      const digits = section.grade.match(/\d+/)?.[0];
      if (digits) {
        return `form${digits}-${module.number}`.trim();
      }
    }
    return module.number ? module.number.toString().trim() : "";
  };

  const findModule = moduleId => {
    if (!moduleId) {
      return null;
    }
    const target = normalizeId(moduleId);
    return flattenModules().find(entry => {
      const module = entry.module || {};
      const derivedId = deriveModuleId(entry.section, module);
      const candidates = [
        module.moduleId,
        module.ModuleId,
        module.slug,
        module.Slug,
        module.link,
        module.Link,
        derivedId,
        module.number && entry.section?.grade
          ? `form${entry.section.grade.match(/\d+/)?.[0] || ""}-${module.number}`
          : null
      ]
        .filter(Boolean)
        .map(normalizeId);
      return candidates.some(candidate => candidate && (candidate === target || candidate.endsWith(target)));
    });
  };

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
    } catch {
      /* ignore parse errors */
    }
    return false;
  };

  const getUnits = module => module?.units || module?.Units || [];

  const collectVisibleUnits = module => {
    const includeRescue = wantsRescueVideos();
    return getUnits(module).filter(unit => includeRescue || !(unit.rescueOnly || unit.RescueOnly));
  };

  const getUnitId = (unit, index = 0) => {
    if (!unit) {
      return "";
    }
    const rawId =
      unit.id ||
      unit.Id ||
      unit.unitId ||
      unit.UnitId ||
      unit.slug ||
      unit.Slug ||
      (unit.cta?.link && unit.cta.link.match(/unit=([^&]+)/i)?.[1]) ||
      (unit.cta?.Link && unit.cta.Link.match(/unit=([^&]+)/i)?.[1]);
    if (rawId) {
      return normalizeId(rawId);
    }
    return normalizeId(`unit-${index + 1}`);
  };

  const buildCourseMapLink = (moduleId, unitId) => {
    const id = moduleId || state.moduleId || "";
    const base = `${COURSE_MAP_PATH}?module=${encodeURIComponent(id)}`;
    return unitId ? `${base}&unit=${encodeURIComponent(unitId)}` : base;
  };

  const resolveUnitLink = (moduleId, unit) => {
    const cta = unit?.cta || unit?.Cta;
    if (cta?.link) {
      return cta.link;
    }
    if (cta?.Link) {
      return cta.Link;
    }
    return buildCourseMapLink(moduleId, getUnitId(unit));
  };

  const formatSummary = (module, section) =>
    module.summary || module.description || section?.description || "Preview the lesson sequence and checkpoints.";

  const formatFocus = module => module.focus || module.Focus || module.title || "Module focus";

  const formatPace = (module, units) => {
    if (module.pace || module.Pace) {
      return module.pace || module.Pace;
    }
    if (!units.length) {
      return "TBD";
    }
    const sessions = Math.max(1, Math.ceil(units.length / 2));
    return `~${sessions} study session${sessions > 1 ? "s" : ""}`;
  };

  const updateCourseHeader = entry => {
    if (!entry) {
      return;
    }
    const { section, module } = entry;
    const units = state.units;
    const totalMinutes = units.reduce(
      (sum, unit) => sum + parseDurationMinutes(unit.duration || unit.Duration),
      0
    );

    const setText = (selector, text) => {
      const el = getEl(selector);
      if (el) {
        el.textContent = text;
      }
    };

    setText(selectors.grade, section?.grade ? `${section.grade} - Module` : "Course module");
    setText(selectors.title, module.title || "Course map");
    setText(selectors.summary, formatSummary(module, section));
    setText(selectors.focus, formatFocus(module));
    setText(
      selectors.unitCount,
      units.length ? `${units.length} unit${units.length === 1 ? "" : "s"}` : "Coming soon"
    );
    setText(selectors.duration, formatDurationLabel(totalMinutes));
    setText(selectors.pace, formatPace(module, units));

    document.title = `${module.title || "Course"} - Course map`;
  };

  const applyStartButton = activeUnit => {
    const button = getEl(selectors.startButton);
    if (!button) {
      return;
    }
    if (!state.units.length) {
      button.textContent = "Coming soon";
      button.disabled = true;
      button.onclick = null;
      return;
    }
    const isComplete = state.units.length && state.completedUnitIds.size >= state.units.length;
    const targetUnit =
      activeUnit ||
      state.units.find((unit, index) => getUnitId(unit, index) === state.selectedUnitId) ||
      state.units[0];
    const url = resolveUnitLink(state.moduleId, targetUnit);
    button.disabled = false;
    button.textContent = isComplete ? "Review module" : state.selectedUnitId ? "Resume module" : "Start module";
    button.onclick = () => {
      window.location.href = url;
    };
  };

  const renderUnitResources = (unit, detailEl) => {
    const resources = unit?.resources || unit?.Resources;
    if (!Array.isArray(resources) || !resources.length) {
      return;
    }
    const subhead = document.createElement("div");
    subhead.className = "unit-subhead";
    subhead.textContent = "Resources";
    detailEl.appendChild(subhead);

    const list = document.createElement("ul");
    list.className = "unit-resource-list";
    resources.forEach(resource => {
      const li = document.createElement("li");
      const info = document.createElement("div");
      const label = document.createElement("strong");
      label.textContent = resource.label || resource.Label || "Resource";
      info.appendChild(label);
      const detail = resource.detail || resource.Detail || resource.type || resource.Type;
      if (detail) {
        const small = document.createElement("small");
        small.textContent = detail;
        info.appendChild(small);
      }
      li.appendChild(info);
      if (resource.url || resource.Url) {
        const action = document.createElement("a");
        action.className = "btn btn--ghost";
        action.href = resource.url || resource.Url;
        action.target = "_blank";
        action.rel = "noopener";
        action.textContent = resource.type ? `Open ${resource.type}` : "Open";
        li.appendChild(action);
      }
      list.appendChild(li);
    });
    detailEl.appendChild(list);
  };

  const renderUnitCTA = (unit, detailEl) => {
    const cta = unit?.cta || unit?.Cta;
    const href = cta?.link || cta?.Link;
    if (!href) {
      return;
    }
    const wrapper = document.createElement("div");
    wrapper.className = "unit-cta";
    const button = document.createElement("a");
    button.className = "btn btn--primary";
    button.href = href;
    button.textContent = cta.label || cta.Label || "Open activity";
    const opensExternally = cta.newTab || cta.target === "_blank" || cta.external === true;
    if (opensExternally) {
      button.target = "_blank";
      button.rel = "noopener";
    }
    if (cta.target === "_self" || cta.external === false) {
      button.target = "_self";
    }
    wrapper.appendChild(button);
    detailEl.appendChild(wrapper);
  };

  const renderUnitNext = detailEl => {
    const currentIndex = state.units.findIndex(
      (unit, index) => getUnitId(unit, index) === state.selectedUnitId
    );
    if (currentIndex === -1 || currentIndex >= state.units.length - 1) {
      return;
    }
    const nextUnit = state.units[currentIndex + 1];
    const wrapper = document.createElement("div");
    wrapper.className = "unit-next";
    const button = document.createElement("button");
    button.type = "button";
    button.className = "btn btn--ghost";
    button.textContent = `Next: ${nextUnit.title || "Unit"}`;
    button.addEventListener("click", () => selectUnit(getUnitId(nextUnit, currentIndex + 1)));
    wrapper.appendChild(button);
    detailEl.appendChild(wrapper);
  };

  const setupVideoPlaylist = (wrapperEl, playlist) => {
    if (!wrapperEl || !Array.isArray(playlist) || !playlist.length) {
      return;
    }
    const videoEl = wrapperEl.querySelector("video");
    if (!videoEl) {
      return;
    }
    const sourceEl =
      videoEl.querySelector("source") || videoEl.appendChild(document.createElement("source"));
    const statusEl = wrapperEl.querySelector("[data-video-status]");
    const titleEl = wrapperEl.querySelector("[data-video-title]");
    const prevBtn = wrapperEl.querySelector("[data-video-prev]");
    const nextBtn = wrapperEl.querySelector("[data-video-next]");

    let index = 0;

    const updateMeta = clip => {
      if (titleEl) {
        titleEl.textContent = clip.title || clip.description || "Learning clip";
      }
      if (statusEl) {
        statusEl.textContent = clip.description || "";
      }
      if (prevBtn) {
        prevBtn.disabled = index === 0;
      }
      if (nextBtn) {
        nextBtn.disabled = index >= playlist.length - 1;
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

    if (prevBtn) {
      prevBtn.addEventListener("click", goPrevious);
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", goNext);
    }
    videoEl.addEventListener("ended", goNext);

    loadClip(0);
  };

  const renderUnitVideos = (unit, detailEl) => {
    const playlist = unit?.videos || unit?.Videos;
    if (!Array.isArray(playlist) || !playlist.length) {
      return;
    }
    const wrapper = document.createElement("div");
    wrapper.className = "unit-video-player-wrap";
    wrapper.innerHTML = `
      <video class="unit-video-player" controls preload="metadata">
        <source src="" type="video/mp4" />
      </video>
      <div class="unit-video-controls">
        <button class="btn btn--ghost btn--video-nav" type="button" data-video-prev>Previous</button>
        <div class="unit-video-meta">
          <strong data-video-title>${playlist[0].title || "Learning clip"}</strong>
          <small data-video-status>${playlist[0].description || ""}</small>
        </div>
        <button class="btn btn--ghost btn--video-nav" type="button" data-video-next>Next</button>
      </div>
    `;
    detailEl.appendChild(wrapper);
    setupVideoPlaylist(wrapper, playlist);
  };

  const renderUnitDetail = unit => {
    const detail = getEl(selectors.detail);
    if (!detail) {
      return;
    }
    if (!unit) {
      detail.innerHTML = '<p class="muted">Select a unit to see the overview, objectives, and files.</p>';
      return;
    }
    detail.innerHTML = "";

    const heading = document.createElement("h2");
    heading.textContent = unit.title || "Unit overview";
    detail.appendChild(heading);

    const meta = document.createElement("div");
    meta.className = "unit-detail-meta";
    const typeChip = document.createElement("span");
    typeChip.className = "chip";
    typeChip.textContent = formatType(unit.type || unit.Type);
    meta.appendChild(typeChip);
    const durationChip = document.createElement("span");
    durationChip.className = "chip";
    durationChip.textContent = unit.duration || unit.Duration || "Self paced";
    meta.appendChild(durationChip);
    detail.appendChild(meta);

    if (unit.summary) {
      const summary = document.createElement("p");
      summary.className = "unit-summary";
      summary.textContent = unit.summary;
      detail.appendChild(summary);
    }
    if (unit.body) {
      const body = document.createElement("p");
      body.className = "unit-body";
      body.textContent = unit.body;
      detail.appendChild(body);
    }

    const objectives = unit?.objectives || unit?.Objectives;
    if (Array.isArray(objectives) && objectives.length) {
      const objectivesHeading = document.createElement("div");
      objectivesHeading.className = "unit-subhead";
      objectivesHeading.textContent = "Objectives";
      detail.appendChild(objectivesHeading);

      const list = document.createElement("ul");
      list.className = "unit-objectives";
      objectives.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item;
        list.appendChild(li);
      });
      detail.appendChild(list);
    }

    renderUnitVideos(unit, detail);
    renderUnitResources(unit, detail);
    renderUnitCTA(unit, detail);
    renderUnitNext(detail);
    renderUnitCompletion(detail);
  };

  const renderUnitNav = () => {
    const nav = getEl(selectors.nav);
    if (!nav) {
      return;
    }
    if (!state.units.length) {
      nav.innerHTML = '<p class="muted">Coach is still writing this module. Check back soon.</p>';
      return;
    }
    nav.innerHTML = "";
    state.units.forEach((unit, index) => {
      const id = getUnitId(unit, index);
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
      meta.textContent = `${formatType(unit.type || unit.Type)}${DOT}${duration}`;

      info.appendChild(title);
      info.appendChild(meta);
      button.appendChild(order);
      button.appendChild(info);
      button.addEventListener("click", () => selectUnit(id));
      nav.appendChild(button);
    });
  };

  const selectUnit = unitId => {
    if (!state.units.length) {
      renderUnitNav();
      renderUnitDetail(null);
      return;
    }
    const normalizedTarget = normalizeId(unitId);
    const fallbackId = getUnitId(state.units[0], 0);
    const target =
      state.units.find((unit, index) => getUnitId(unit, index) === normalizedTarget) ||
      state.units.find((unit, index) => getUnitId(unit, index) === fallbackId) ||
      state.units[0];
    const index = state.units.indexOf(target);
    const normalizedId = getUnitId(target, index);
    const previousId = state.selectedUnitId;
    state.selectedUnitId = normalizedId;
    state.pendingUnitId = null;

    if (previousId && previousId !== normalizedId) {
      state.completedUnitIds.add(previousId);
    }

    const payload = {
      moduleId: state.moduleId,
      moduleTitle: state.moduleEntry?.module?.title || "",
      unitCount: state.units.length,
      completed: Array.from(state.completedUnitIds),
      completedCount: state.completedUnitIds.size,
      lastUnitId: normalizedId,
      lastTitle: target.title || "",
      lastUrl: resolveUnitLink(state.moduleId, target),
      courseMap: buildCourseMapLink(state.moduleId, normalizedId),
      updatedAt: new Date().toISOString()
    };
    saveUnitProgress(state.moduleId, payload);

    if (window.history && typeof window.history.replaceState === "function") {
      window.history.replaceState(null, "", buildCourseMapLink(state.moduleId, normalizedId));
    }

    renderUnitNav();
    renderUnitDetail(target);
    applyStartButton(target);
  };

  const isModuleComplete = () => state.units.length && state.completedUnitIds.size >= state.units.length;

  const showCompletionToast = () => {
    let toast = document.querySelector(".completion-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "completion-toast";
      toast.innerHTML = `
        <strong>Congrats, module complete!</strong>
        <p>Head back to the dashboard to see your milestone glow.</p>
      `;
      document.body.appendChild(toast);
    }
    toast.classList.add("is-visible");
    clearTimeout(showCompletionToast.timeoutId);
    showCompletionToast.timeoutId = setTimeout(() => {
      toast.classList.remove("is-visible");
    }, 4000);
  };

  const creditModuleMastery = () => {
    if (!state.moduleId) {
      return;
    }
    const completions = new Set(readJson(MODULE_COMPLETIONS_KEY, []));
    if (completions.has(state.moduleId)) {
      return;
    }
    completions.add(state.moduleId);
    writeJson(MODULE_COMPLETIONS_KEY, Array.from(completions));

    const stats = readJson(USER_STATS_KEY, {});
    const nextValue = Math.max(0, Number(stats.moduleMastery) || 0) + 1;
    const mergedStats = { ...stats, moduleMastery: nextValue };
    writeJson(USER_STATS_KEY, mergedStats);
    window.kiraUserStats = mergedStats;

    document.dispatchEvent(
      new CustomEvent("kira:badges-ready", {
        detail: {
          stats: mergedStats,
          collections: window.kiraBadgeCollections
        }
      })
    );
  };

  const syncModuleCompletion = completedUnitIds => {
    if (
      !state.moduleId ||
      !Array.isArray(completedUnitIds) ||
      !completedUnitIds.length ||
      !window.kiraActivity?.logModuleProgress
    ) {
      return;
    }
    const uniqueUnitIds = Array.from(
      new Set(
        completedUnitIds
          .map(normalizeId)
          .filter(Boolean)
      )
    );
    if (!uniqueUnitIds.length) {
      return;
    }
    Promise.allSettled(
      uniqueUnitIds.map(unitId =>
        window.kiraActivity
          .logModuleProgress({
            moduleId: state.moduleId,
            unitId,
            status: "completed"
          })
          .catch(() => null)
      )
    ).catch(() => {});
  };

  const markModuleComplete = () => {
    if (!state.units.length || !state.moduleId || isModuleComplete()) {
      return;
    }
    const allUnitIds = state.units.map((unit, index) => getUnitId(unit, index));
    state.completedUnitIds = new Set(allUnitIds);
    const lastUnit = state.units[state.units.length - 1];
    const lastId = getUnitId(lastUnit, state.units.length - 1);
    state.selectedUnitId = lastId;

    const timestamp = new Date().toISOString();
    const payload = {
      moduleId: state.moduleId,
      moduleTitle: state.moduleEntry?.module?.title || "",
      unitCount: state.units.length,
      completed: allUnitIds,
      completedCount: allUnitIds.length,
      lastUnitId: lastId,
      lastTitle: lastUnit.title || "",
      lastUrl: resolveUnitLink(state.moduleId, lastUnit),
      courseMap: buildCourseMapLink(state.moduleId, lastId),
      updatedAt: timestamp,
      completedAt: timestamp
    };
    saveUnitProgress(state.moduleId, payload);
    syncModuleCompletion(allUnitIds);
    queueCompletionNotification();
    creditModuleMastery();
    renderUnitNav();
    renderUnitDetail(lastUnit);
    applyStartButton(lastUnit);
    showCompletionToast();
    if (window.kiraActivity?.logModuleProgress) {
      window.kiraActivity
        .logModuleProgress({
          moduleId: state.moduleId,
          unitId: lastId,
          status: "completed",
          completedAt: new Date()
        })
        .catch(() => {});
    }
  };

  const renderUnitCompletion = detailEl => {
    if (!state.units.length || !state.selectedUnitId) {
      return;
    }
    const lastUnit = state.units[state.units.length - 1];
    const lastId = getUnitId(lastUnit, state.units.length - 1);
    if (state.selectedUnitId !== lastId) {
      return;
    }

    const wrapper = document.createElement("div");
    wrapper.className = "unit-completion-block";
    const heading = document.createElement("h3");
    heading.textContent = "Finished the module?";
    const description = document.createElement("p");
    description.className = "muted";
    description.textContent = "Mark it complete to sync your progress bar and unlock the celebration.";
    const action = document.createElement("button");
    action.type = "button";
    action.className = "btn btn--primary";
    action.dataset.action = "complete-module";
    if (isModuleComplete()) {
      action.textContent = "Module completed";
      action.disabled = true;
    } else {
      action.textContent = "Complete module";
    }
    wrapper.appendChild(heading);
    wrapper.appendChild(description);
    wrapper.appendChild(action);
    detailEl.appendChild(wrapper);
  };

  const showModuleMissing = () => {
    const nav = getEl(selectors.nav);
    if (nav) {
      nav.innerHTML = '<p class="muted">Module not found. Return to the dashboard to select a course.</p>';
    }
    const detail = getEl(selectors.detail);
    if (detail) {
      detail.innerHTML = '<p class="muted">We could not load this course map.</p>';
    }
    const startButton = getEl(selectors.startButton);
    if (startButton) {
      startButton.disabled = true;
      startButton.textContent = "Unavailable";
    }
  };

  const initCourseMap = () => {
    const catalogue = flattenModules();
    if (!catalogue.length) {
      showModuleMissing();
      return;
    }

    const params = new URLSearchParams(window.location.search || "");
    const requestedModule = params.get("module");
    const pendingUnit = params.get("unit");
    state.pendingUnitId = pendingUnit ? normalizeId(pendingUnit) : null;

    let entry = requestedModule ? findModule(requestedModule) : null;
    if (!entry) {
      entry = catalogue[0];
    }
    if (!entry) {
      showModuleMissing();
      return;
    }

    if (!completionButtonListenerBound) {
      completionButtonListenerBound = true;
      document.addEventListener("click", event => {
        const trigger = event.target.closest("[data-action='complete-module']");
        if (!trigger || trigger.disabled) {
          return;
        }
        event.preventDefault();
        markModuleComplete();
      });
    }

    state.moduleEntry = entry;
    state.moduleId = deriveModuleId(entry.section, entry.module);
    state.units = collectVisibleUnits(entry.module);

    const stored = loadUnitProgress(state.moduleId);
    if (stored?.completed) {
      state.completedUnitIds = new Set(stored.completed.map(normalizeId));
    } else {
      state.completedUnitIds = new Set();
    }

    updateCourseHeader(entry);
    renderUnitNav();
    applyStartButton();

    if (!state.units.length) {
      renderUnitDetail(null);
      return;
    }

    let initialUnitId = state.pendingUnitId;
    if (initialUnitId) {
      const exists = state.units.some((unit, index) => getUnitId(unit, index) === initialUnitId);
      if (!exists) {
        initialUnitId = null;
      }
    }
    if (!initialUnitId && stored?.lastUnitId) {
      const candidate = normalizeId(stored.lastUnitId);
      const exists = state.units.some((unit, index) => getUnitId(unit, index) === candidate);
      if (exists) {
        initialUnitId = candidate;
      }
    }

    selectUnit(initialUnitId || getUnitId(state.units[0], 0));
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCourseMap);
  } else {
    initCourseMap();
  }
})();
