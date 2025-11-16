(() => {
  const modulesData = () => (Array.isArray(window.kiraModules) ? window.kiraModules : []);
  const modulesMap = () => window.kiraModulesMap || {};
  const activeModules = () => (Array.isArray(window.kiraActiveModules) ? window.kiraActiveModules : []);

  const moduleProgressMap = {};
  const currentLearnerId = () =>
    (window.kiraLearnerSession?.getId?.() || window.kiraCurrentLearnerId || "").toString().trim() ||
    sessionStorage.getItem("currentLearnerId") ||
    localStorage.getItem("currentLearnerId") ||
    "";

  const gradeDefaults = {
    "Form 4": [0, 0, 0, 0, 0],
    "Form 5": [0, 0, 0, 0, 0]
  };

  const storageKey = (moduleId, learnerId = currentLearnerId()) => {
    const cleanModuleId = (moduleId || "").toString().trim();
    if (!cleanModuleId) {
      return "";
    }
    return learnerId ? `kiraUnitProgress:${learnerId}:${cleanModuleId}` : `kiraUnitProgress:${cleanModuleId}`;
  };
  const legacyStorageKey = moduleId => {
    const cleanModuleId = (moduleId || "").toString().trim();
    return cleanModuleId ? `kiraUnitProgress:${cleanModuleId}` : "";
  };

  const normalizeId = value => (value || "").toString().trim().toLowerCase();

  const loadUnitProgress = moduleId => {
    if (!moduleId || typeof window === "undefined") {
      return null;
    }
    const learnerId = currentLearnerId();
    const readJson = key => {
      if (!key) {
        return null;
      }
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    };

    const scoped = readJson(storageKey(moduleId, learnerId));
    if (scoped) {
      if (scoped.learnerId && learnerId && scoped.learnerId !== learnerId) {
        return null;
      }
      return scoped;
    }

    const legacy = readJson(legacyStorageKey(moduleId));
    if (!legacy) {
      return null;
    }
    if (legacy.learnerId && learnerId && legacy.learnerId !== learnerId) {
      return null;
    }
    // Do not reuse legacy data for a different learner to avoid incorrect progress displays.
    if (learnerId && !legacy.learnerId) {
      return null;
    }
    if (learnerId) {
      const migrated = { ...legacy, learnerId };
      try {
        localStorage.setItem(storageKey(moduleId, learnerId), JSON.stringify(migrated));
        localStorage.removeItem(legacyStorageKey(moduleId));
      } catch {
        /* ignore */
      }
      return migrated;
    }
    return legacy;
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

  const deriveActiveModuleId = module => deriveModuleId({ grade: module?.grade }, module);

  const findCatalogueEntry = moduleId => {
    const target = normalizeId(moduleId);
    if (!target) {
      return null;
    }
    const catalogue = modulesData();
    for (const section of catalogue) {
      const list = section.modules || section.Modules || [];
      for (const module of list) {
        const candidateId = deriveModuleId(section, module);
        if (normalizeId(candidateId) === target) {
          return { section, module, moduleId: candidateId };
        }
      }
    }
    return null;
  };

  const collectVisibleUnits = module => {
    const includeRescue = wantsRescueVideos();
    const units = module?.units || module?.Units || [];
    if (!units.length) {
      return [];
    }
    return includeRescue ? units : units.filter(unit => !(unit.rescueOnly || unit.RescueOnly));
  };

  const computeUnitProgressPercent = module => {
    const moduleId = deriveActiveModuleId(module);
    if (!moduleId) {
      return null;
    }
    const stored = loadUnitProgress(moduleId);
    const completed = Array.isArray(stored?.completed) ? stored.completed : [];
    const completedSet = new Set(completed.map(normalizeId));
    const catalogueEntry = findCatalogueEntry(moduleId);
    const units = catalogueEntry ? collectVisibleUnits(catalogueEntry.module) : [];
    const storedTotal = Number(stored?.unitCount ?? stored?.totalUnits);
    let totalUnits = units.length;
    if (Number.isFinite(storedTotal) && storedTotal > 0) {
      if (!totalUnits || storedTotal < totalUnits) {
        totalUnits = storedTotal;
      }
    } else if (!totalUnits) {
      const fallbackTotal = Number(stored?.totalUnits);
      if (Number.isFinite(fallbackTotal) && fallbackTotal > 0) {
        totalUnits = fallbackTotal;
      }
    }
    if (!totalUnits) {
      return null;
    }
    const fallbackCompleted = Number(stored?.completedCount);
    const completedCount = Math.min(
      totalUnits,
      completedSet.size || (Number.isFinite(fallbackCompleted) ? fallbackCompleted : completed.length)
    );
    const percent = Math.round((completedCount / totalUnits) * 100);
    return Number.isFinite(percent) ? percent : 0;
  };

  const getProgressValue = (module, grade, index) => {
    const provided = Number(module?.progressPercent);
    if (Number.isFinite(provided)) {
      return Math.max(0, Math.min(100, provided));
    }
    const derivedProgress = computeUnitProgressPercent(module);
    if (typeof derivedProgress === "number" && !Number.isNaN(derivedProgress)) {
      return Math.max(0, Math.min(100, derivedProgress));
    }
    if (module.link && typeof moduleProgressMap[module.link] === "number") {
      return moduleProgressMap[module.link];
    }
    const defaults = gradeDefaults[grade] || [];
    return defaults[index] ?? 0;
  };

  const progressMeta = value => {
    if (value >= 95) {
      return { label: "Completed", chipClass: "chip chip--success" };
    }
    if (value >= 35) {
      return { label: "In progress", chipClass: "chip chip--info" };
    }
    return { label: "Locked", chipClass: "chip" };
  };

  const createLessonPills = lessons => {
    const list = document.createElement("ul");
    list.className = "lesson-pill-list";
    lessons.slice(0, 3).forEach(lesson => {
      const item = document.createElement("li");
      item.textContent = lesson;
      list.appendChild(item);
    });
    if (lessons.length > 3) {
      const more = document.createElement("li");
      more.textContent = `+${lessons.length - 3} more`;
      list.appendChild(more);
    }
    return list;
  };

  const wireButtonNavigation = (button, link) => {
    if (link) {
      button.dataset.link = link;
      button.addEventListener("click", () => {
        window.location.href = link;
      });
    } else {
      button.disabled = true;
      button.classList.add("btn--ghost-disabled");
    }
  };

  const renderHomeModules = () => {
    const grid = document.querySelector("[data-role='course-grid']");
    if (!grid) {
      return;
    }

    const grade = grid.dataset.grade || "Form 4";
    const limit = parseInt(grid.dataset.limit || "3", 10);
    const selectedModules = activeModules()
      .filter(Boolean)
      .sort((a, b) => {
        const gradeA = (a.grade || "").toLowerCase();
        const gradeB = (b.grade || "").toLowerCase();
        if (gradeA !== gradeB) {
          return gradeA.localeCompare(gradeB);
        }
        const numA = parseInt(a.number, 10);
        const numB = parseInt(b.number, 10);
        if (Number.isFinite(numA) && Number.isFinite(numB)) {
          return numA - numB;
        }
        return String(a.number || "").localeCompare(String(b.number || ""));
      });

    if (!selectedModules.length) {
      grid.innerHTML = '<p class="muted">No courses added yet. Use "See course map" to add topics to your dashboard.</p>';
      return;
    }

    grid.innerHTML = "";
    selectedModules.slice(0, limit).forEach((module, index) => {
      const card = document.createElement("article");
      card.className = "course-card module-card";

      const number = document.createElement("span");
      number.className = "module-number";
      const gradeLabel = (module.grade || grade).replace(/\s+/g, " ").trim() || "Form";
      const moduleNo = String(module.number || "").padStart(2, "0");
      number.textContent = `${gradeLabel.toUpperCase()} - MODULE ${moduleNo}`;

      const title = document.createElement("h3");
      title.innerHTML = module.link ? `<a href="${module.link}">${module.title}</a>` : module.title;

      const lessonsLabel = document.createElement("p");
      lessonsLabel.className = "muted";
      lessonsLabel.textContent = "Lessons unlocked";

      const lessonList = createLessonPills(Array.isArray(module.lessons) ? module.lessons : []);
      lessonList.classList.add("lesson-pill-list--compact");

      const progressValue = getProgressValue(module, module.grade || grade, index);
      const meta = progressMeta(progressValue);

      const meter = document.createElement("div");
      meter.className = "meter progress-bar";
      meter.innerHTML = `<span style="width:${progressValue}%"></span>`;

      const footer = document.createElement("div");
      footer.className = "module-card-footer";

      const chip = document.createElement("span");
      chip.className = meta.chipClass;
      chip.textContent = `${progressValue}% done`;

      const button = document.createElement("button");
      button.className = "btn btn--primary";
      button.type = "button";
      button.textContent = progressValue >= 95 ? "Review" : "Continue";
      wireButtonNavigation(button, module.link);

      footer.appendChild(chip);
      footer.appendChild(button);

      card.appendChild(number);
      card.appendChild(title);
      card.appendChild(lessonsLabel);
      card.appendChild(lessonList);
      card.appendChild(meter);
      card.appendChild(footer);

      grid.appendChild(card);
    });
  };

  const renderClassModules = () => {
    const wrapper = document.getElementById("modulesByGrade");
    if (!wrapper) {
      return;
    }

    const data = modulesData();
    if (!data.length) {
      wrapper.innerHTML = "<p class=\"muted\">Modules are loading. Try refreshing shortly.</p>";
      return;
    }

    wrapper.innerHTML = "";
    data.forEach(section => {
      const stack = document.createElement("article");
      stack.className = "module-stack";

      const header = document.createElement("div");
      header.className = "module-stack-header";

      const badge = document.createElement("span");
      badge.className = "form-badge";
      badge.textContent = section.grade;

      const heading = document.createElement("div");
      heading.innerHTML = `<h3>${section.title}</h3><p class="muted">${section.description}</p>`;

      header.appendChild(badge);
      header.appendChild(heading);

      const list = document.createElement("div");
      list.className = "module-list";

      section.modules.forEach((module, index) => {
        const item = document.createElement("div");
        item.className = "module-list-item";

        const info = document.createElement("div");
        info.className = "module-info";
        info.innerHTML = `
          <span class="module-number">${module.number}</span>
          <div>
            <p class="module-title">${module.title}</p>
            <small>${module.lessons.join(" â€¢ ")}</small>
          </div>
        `;

        const metaWrap = document.createElement("div");
        metaWrap.className = "module-meta";

        const progressValue = getProgressValue(module, section.grade, index);
        const meta = progressMeta(progressValue);
        const chip = document.createElement("span");
        chip.className = meta.chipClass;
        chip.textContent = meta.label;

        const action = document.createElement("button");
        action.className = "btn btn--ghost";
        action.type = "button";
        action.textContent = module.link ? "Open module" : "Coming soon";
        wireButtonNavigation(action, module.link);

        metaWrap.appendChild(chip);
        metaWrap.appendChild(action);

        item.appendChild(info);
        item.appendChild(metaWrap);
        list.appendChild(item);
      });

      stack.appendChild(header);
      stack.appendChild(list);
      wrapper.appendChild(stack);
    });
  };

  document.addEventListener("DOMContentLoaded", () => {
    renderHomeModules();
    renderClassModules();
  });

  document.addEventListener("kira:modules-ready", () => {
    renderHomeModules();
    renderClassModules();
  });

  window.kiraRenderModules = {
    home: renderHomeModules,
    classes: renderClassModules
  };
})();

