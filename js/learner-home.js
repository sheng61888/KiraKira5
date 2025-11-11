(() => {
  const learnerId = sessionStorage.getItem("currentLearnerId");
  const onboarding = localStorage.getItem("kiraOnboarding");

  if (!onboarding) {
    // first-time user: redirect to onboarding page
    window.location.href = "learner-onboarding.html";
    return;
  }

  // optional: preload their grade/confidence into the dashboard
  window.kiraOnboardingData = JSON.parse(onboarding);
})();

(() => {
  const selectors = {
    profileName: ".profile .username",
    profileStreak: ".profile .streak",
    dashboardStreak: ".page-heading .eyebrow strong",
    profileLevel: ".profile small",
    xpBar: ".profile .xp-bar span",
    heroName: "#username",
    statsGrid: ".stats-grid",
    missionCard: "#missionCard",
    missionBadge: "#missionBadge",
    missionTitle: "#missionTitle",
    missionMood: "#missionMood",
    missionChips: "#missionChips",
    missionConfidence: "#missionConfidence",
    missionAction: "#missionActionBtn",
    coursePickerTrigger: "[data-action='open-course-picker']",
    modulePickerModal: "#modulePickerModal",
    modulePickerList: "#modulePickerList"
  };

  window.kiraActiveModules = Array.isArray(window.kiraActiveModules) ? window.kiraActiveModules : [];

  const getEl = selector => document.querySelector(selector);

  const setText = (selector, text) => {
    const el = getEl(selector);
    if (el) {
      el.textContent = text;
    }
  };

  const setMissionState = state => {
    const card = getEl(selectors.missionCard);
    if (card && state) {
      card.dataset.state = state;
    }
  };

  const modulePickerState = {
    catalogue: [],
    modal: null,
    list: null,
    isOpen: false,
    keydownBound: false,
    selectedIds: new Set()
  };

  const ensureModulePickerRefs = () => {
    if (!modulePickerState.modal) {
      modulePickerState.modal = getEl(selectors.modulePickerModal);
    }
    if (!modulePickerState.list) {
      modulePickerState.list = getEl(selectors.modulePickerList);
    }
  };

  const deriveModuleId = (section, module) => {
    if (!module) {
      return "";
    }
    if (module.moduleId) {
      return module.moduleId;
    }
    if (module.link) {
      const match = module.link.match(/module=([^&]+)/i);
      if (match) {
        return match[1];
      }
      return module.link.replace(/\.html?$/i, "").replace(/^\.?\//, "");
    }
    if (section?.grade && module.number) {
      const digits = section.grade.match(/\d+/);
      if (digits) {
        return `form${digits[0]}-${module.number}`;
      }
    }
    return module.number || "";
  };

  const notifyCourseMapUnavailable = () => {
    console.warn("Modules are still syncing. Please use the Continue button on a course to open it.");
  };

  const dispatchModulesUpdated = () => {
    document.dispatchEvent(
      new CustomEvent("kira:modules-ready", {
        detail: {
          catalogue: modulePickerState.catalogue.length ? modulePickerState.catalogue : window.kiraModules || [],
          activeModules: window.kiraActiveModules || []
        }
      })
    );
  };

  const addModuleSelection = async moduleId => {
    if (!moduleId) {
      return;
    }
    const session = window.kiraLearnerSession;
    if (!session) {
      notifyCourseMapUnavailable();
      return;
    }
    try {
      const response = await session.fetch("modules/selection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleId })
      });
      if (!response.ok) {
        throw new Error(`Module selection failed with status ${response.status}`);
      }
      const payload = await response.json();
      if (payload?.activeModules) {
        window.kiraActiveModules = payload.activeModules;
        renderModulePicker();
        dispatchModulesUpdated();
      }
    } catch (error) {
      console.error("Unable to add module selection", error);
      notifyCourseMapUnavailable();
    }
  };

  const removeModuleSelection = async moduleId => {
    if (!moduleId) {
      return;
    }
    const session = window.kiraLearnerSession;
    if (!session) {
      notifyCourseMapUnavailable();
      return;
    }
    try {
      const response = await session.fetch(`modules/selection/${encodeURIComponent(moduleId)}`, {
        method: "DELETE"
      });
      if (!response.ok) {
        throw new Error(`Module removal failed with status ${response.status}`);
      }
      const payload = await response.json();
      if (payload?.activeModules) {
        window.kiraActiveModules = payload.activeModules;
        renderModulePicker();
        dispatchModulesUpdated();
      }
    } catch (error) {
      console.error("Unable to remove module selection", error);
      notifyCourseMapUnavailable();
    }
  };

  const closeModulePicker = () => {
    ensureModulePickerRefs();
    if (!modulePickerState.modal) {
      return;
    }
    modulePickerState.isOpen = false;
    modulePickerState.modal.classList.remove("is-open");
    modulePickerState.modal.setAttribute("aria-hidden", "true");
  };

  const openModulePicker = () => {
    ensureModulePickerRefs();
    if (!modulePickerState.modal) {
      notifyCourseMapUnavailable();
      return;
    }
    modulePickerState.isOpen = true;
    modulePickerState.modal.classList.add("is-open");
    modulePickerState.modal.setAttribute("aria-hidden", "false");
  };

  const renderModulePicker = () => {
    ensureModulePickerRefs();
    const container = modulePickerState.list;
    if (!container) {
      return;
    }
    if (!modulePickerState.catalogue.length && Array.isArray(window.kiraModules)) {
      modulePickerState.catalogue = window.kiraModules;
    }
    const catalogue = modulePickerState.catalogue;
    if (!Array.isArray(catalogue) || !catalogue.length) {
      container.innerHTML = '<p class="muted">Modules are loading. Please refresh.</p>';
      return;
    }
    const selectedIds = new Set(
      (window.kiraActiveModules || [])
        .map(module => (module?.moduleId || "").toLowerCase())
        .filter(Boolean)
    );
    modulePickerState.selectedIds = selectedIds;
    container.innerHTML = catalogue
      .map(section => {
        const modules = Array.isArray(section.modules) ? section.modules : [];
        const list = modules
          .map(module => {
            const lessons = Array.isArray(module.lessons) ? module.lessons.join(", ") : "";
            const moduleId = deriveModuleId(section, module);
            const normalizedId = (moduleId || "").toLowerCase();
            const alreadyAdded = normalizedId && selectedIds.has(normalizedId);
            const buttonLabel = alreadyAdded ? "Remove" : "Add";
            const buttonClass = alreadyAdded ? "btn btn--ghost btn--small" : "btn btn--primary btn--small";
            const buttonAction = alreadyAdded ? "remove" : "add";
            return `
              <li>
                <div>
                  <strong>${module.title}</strong>
                  ${lessons ? `<small>${lessons}</small>` : ""}
                </div>
                <button class="${buttonClass}" type="button" data-module-id="${moduleId}" data-module-action="${buttonAction}">${buttonLabel}</button>
              </li>
            `;
          })
          .join("");
        return `
          <article class="module-picker-section">
            <header>
              <p class="eyebrow">${section.grade}</p>
              <h3>${section.title}</h3>
            </header>
            <ul>
              ${list}
            </ul>
          </article>
        `;
      })
      .join("");

    container.querySelectorAll("[data-module-id]").forEach(button => {
      button.addEventListener("click", event => {
        const moduleId = event.currentTarget.getAttribute("data-module-id");
        const action = event.currentTarget.getAttribute("data-module-action");
        if (!moduleId) {
          return;
        }
        if (action === "remove") {
          removeModuleSelection(moduleId);
        } else {
          addModuleSelection(moduleId);
        }
      });
    });
  };

  const wireModulePicker = () => {
    if (!modulePickerState.catalogue.length && Array.isArray(window.kiraModules)) {
      modulePickerState.catalogue = window.kiraModules;
    }
    const trigger = getEl(selectors.coursePickerTrigger);
    if (trigger && !trigger.dataset.wired) {
      trigger.addEventListener("click", () => {
        if (!modulePickerState.catalogue.length && Array.isArray(window.kiraModules)) {
          modulePickerState.catalogue = window.kiraModules;
        }
        if (!modulePickerState.catalogue.length) {
          notifyCourseMapUnavailable();
          return;
        }
        openModulePicker();
      });
      trigger.dataset.wired = "true";
    }

    ensureModulePickerRefs();
    document.querySelectorAll("[data-module-picker-close]").forEach(button => {
      if (!button.dataset.wired) {
        button.addEventListener("click", closeModulePicker);
        button.dataset.wired = "true";
      }
    });

    if (modulePickerState.modal && !modulePickerState.modal.dataset.wired) {
      modulePickerState.modal.addEventListener("click", event => {
        if (event.target === modulePickerState.modal) {
          closeModulePicker();
        }
      });
      modulePickerState.modal.dataset.wired = "true";
    }

    if (!modulePickerState.keydownBound) {
      document.addEventListener("keydown", event => {
        if (event.key === "Escape" && modulePickerState.isOpen) {
          closeModulePicker();
        }
      });
      modulePickerState.keydownBound = true;
    }
    renderModulePicker();
  };

  const updateProfile = (profile, streak) => {
    const userName = sessionStorage.getItem("userName") || "Learner";
    if (!profile) {
      setText(selectors.profileName, userName);
      setText(selectors.heroName, userName);
      return;
    }
    setText(selectors.profileName, profile.name || userName);
    setText(selectors.heroName, profile.name || userName);
    const streakLabel = streak
      ? streak.status || (streak.current ? `${streak.current}-day streak` : "Ready to study")
      : "Ready to study";
    setText(selectors.profileStreak, streakLabel);
    setText(selectors.dashboardStreak, streakLabel);
    if (streak) {
      setText(selectors.profileLevel, streak.levelLabel || "");
      const xpBar = getEl(selectors.xpBar);
      if (xpBar) {
        const percent = Math.max(10, Math.min(100, 100 - (streak.xpToNextLevel || 0) / 5));
        xpBar.style.width = `${percent}%`;
      }
    }
  };

  const updateMission = mission => {
    if (!mission) {
      setMissionState("error");
      setText(selectors.missionTitle, "Unable to load mission");
      setText(selectors.missionMood, "Please refresh the page.");
      return;
    }
    const confidence = mission.confidence ?? 0;
    setMissionState(confidence < 50 ? "rescue" : "momentum");
    setText(selectors.missionBadge, mission.badge || "");
    setText(selectors.missionTitle, mission.title || "Today's focus");
    setText(selectors.missionMood, mission.mood || "");
    setText(selectors.missionConfidence, `${confidence}%`);

    const chips = [
      mission.grade,
      mission.mode,
      mission.wantsVideos ? "Intro videos on" : "Self-paced"
    ].filter(Boolean);
    const chipsContainer = getEl(selectors.missionChips);
    if (chipsContainer) {
      chipsContainer.innerHTML = chips.map(chip => `<span class="chip">${chip}</span>`).join("");
    }

    const button = getEl(selectors.missionAction);
    if (button) {
      button.textContent = confidence < 50 ? "Review rescue plan" : "Adjust plan";
      button.onclick = () => {
        window.location.href = "learner-onboarding.html";
      };
    }
  };

  const updateStats = stats => {
    const grid = getEl(selectors.statsGrid);
    if (!grid) {
      return;
    }
    if (!Array.isArray(stats) || !stats.length) {
      grid.innerHTML = "<p class=\"muted\">No stats available yet. Complete a lesson to unlock insights.</p>";
      return;
    }
    const template = stat => `
      <article class="card stat-block">
        <h3>${stat.label}</h3>
        <strong>${stat.value}</strong>
        <p class="muted">${stat.detail || ""}</p>
        ${typeof stat.progressPercent === "number"
          ? `<div class="meter"><span style="width:${stat.progressPercent}%"></span></div>`
          : stat.chip
            ? `<span class="chip chip--info">${stat.chip}</span>`
            : ""}
      </article>
    `;
    grid.innerHTML = stats.map(template).join("");
  };

  const broadcastModules = modulesSnapshot => {
    if (!modulesSnapshot) {
      return;
    }
    const catalogue = modulesSnapshot.catalogue || [];
    const activeModules = Array.isArray(modulesSnapshot.activeModules) ? modulesSnapshot.activeModules : [];
    window.kiraModules = catalogue;
    window.kiraModulesMap = catalogue.reduce((map, section) => {
      map[section.grade] = section;
      return map;
    }, {});
    window.kiraActiveModules = activeModules;
    modulePickerState.catalogue = catalogue;
    renderModulePicker();
    document.dispatchEvent(
      new CustomEvent("kira:modules-ready", { detail: { catalogue, activeModules } })
    );
  };

  const broadcastBadges = badges => {
    if (!badges) {
      return;
    }
    if (Array.isArray(badges.collections)) {
      window.kiraBadgeCollections = badges.collections;
    }
    if (badges.stats) {
      window.kiraBadgeStats = badges.stats;
      try {
        localStorage.setItem("kiraUserStats", JSON.stringify(badges.stats));
      } catch (error) {
        console.warn("Unable to store badge stats", error);
      }
    }
    document.dispatchEvent(new CustomEvent("kira:badges-ready", { detail: badges }));
  };

  const showDashboardError = message => {
    setMissionState("error");
    setText(selectors.missionTitle, "We hit a snag");
    setText(selectors.missionMood, message || "Please refresh to try again.");
  };

  const hydrateDashboard = data => {
    if (!data) {
      showDashboardError("No dashboard data received.");
      return;
    }
    updateProfile(data.profile, data.streak);
    updateMission(data.mission);
    updateStats(data.highlightStats);
    broadcastModules(data.modules);
    broadcastBadges(data.badges);
  };

  const fetchDashboard = async () => {
    const session = window.kiraLearnerSession;
    if (!session) {
      return;
    }
    const learnerId = session.ensureId();
    if (!learnerId) {
      showDashboardError("Please log in again to load your dashboard.");
      return;
    }
    setMissionState("loading");
    setText(selectors.missionTitle, "Loading your mission…");
    setText(selectors.missionMood, "Hang tight while we sync your latest learning stats.");

    try {
      const response = await session.fetch("/dashboard");
      if (!response.ok) {
        throw new Error(`Dashboard request failed with status ${response.status}`);
      }
      const payload = await response.json();
      hydrateDashboard(payload);
    } catch (error) {
      console.error("Unable to load dashboard", error);
      showDashboardError("Unable to load your dashboard right now.");
    }
  };

  const startDashboard = () => {
    wireModulePicker();
    fetchDashboard();
  };

  document.addEventListener("kira:learner-missing", () => {
    showDashboardError("Please log in to view your learner dashboard.");
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startDashboard);
  } else {
    startDashboard();
  }
})();
