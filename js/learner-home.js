(() => {
  const learnerId = sessionStorage.getItem("currentLearnerId");
  const onboarding = localStorage.getItem("kiraOnboarding");

  if (onboarding) {
    // optional: preload their grade/confidence into the dashboard
    window.kiraOnboardingData = JSON.parse(onboarding);
  }
})();

(() => {
  const selectors = {
    profileName: ".profile .username",
    profileStreak: ".profile .streak",
    dashboardStreak: ".page-heading .eyebrow strong",
    profileLevel: ".profile small",
    xpBar: ".profile .xp-bar span",
    heroNames: "[data-learner-name]",
    statsGrid: ".stats-grid",
    missionCard: "#missionCard",
    missionBadge: "#missionBadge",
    missionTitle: "#missionTitle",
    missionMood: "#missionMood",
    missionChips: "#missionChips",
    missionAction: "#missionActionBtn",
    missionStatus: "#missionStatusLabel",
    missionSupport: "#missionSupportLabel",
    coursePickerTrigger: "[data-action='open-course-picker']",
    modulePickerModal: "#modulePickerModal",
    modulePickerList: "#modulePickerList",
    notificationList: "#notificationList",
    notificationEmpty: "[data-role='notification-empty']",
    notificationClear: "[data-action='clear-notifications']",
    notificationToasts: "#notificationToasts",
    resumeButton: "#resumeModuleBtn",
  };

  window.kiraActiveModules = Array.isArray(window.kiraActiveModules) ? window.kiraActiveModules : [];

  const getEl = selector => document.querySelector(selector);

  const setText = (selector, text) => {
    const el = getEl(selector);
    if (el) {
      el.textContent = text;
    }
  };

  const setHeroNames = text => {
    if (!text) {
      return;
    }
    document.querySelectorAll(selectors.heroNames).forEach(el => {
      el.textContent = text;
    });
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

  const currentLearnerId = () =>
    (window.kiraLearnerSession?.getId?.() || window.kiraCurrentLearnerId || "").toString().trim() ||
    sessionStorage.getItem("currentLearnerId") ||
    localStorage.getItem("currentLearnerId") ||
    "";

  const unitProgressKey = (moduleId, learnerId = currentLearnerId()) => {
    const cleanModuleId = (moduleId || "").toString().trim();
    if (!cleanModuleId) {
      return "";
    }
    return learnerId ? `kiraUnitProgress:${learnerId}:${cleanModuleId}` : `kiraUnitProgress:${cleanModuleId}`;
  };
  const legacyProgressKey = moduleId => {
    const cleanModuleId = (moduleId || "").toString().trim();
    return cleanModuleId ? `kiraUnitProgress:${cleanModuleId}` : "";
  };

  const loadUnitProgress = moduleId => {
    if (!moduleId) {
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

    const scoped = readJson(unitProgressKey(moduleId, learnerId));
    if (scoped) {
      if (scoped.learnerId && learnerId && scoped.learnerId !== learnerId) {
        return null;
      }
      return scoped;
    }

    const legacy = readJson(legacyProgressKey(moduleId));
    if (!legacy) {
      return null;
    }
    if (legacy.learnerId && learnerId && legacy.learnerId !== learnerId) {
      return null;
    }
    if (learnerId && !legacy.learnerId) {
      return null;
    }
    if (learnerId) {
      const migrated = { ...legacy, learnerId };
      try {
        localStorage.setItem(unitProgressKey(moduleId, learnerId), JSON.stringify(migrated));
        localStorage.removeItem(legacyProgressKey(moduleId));
      } catch {
        /* ignore */
      }
      return migrated;
    }
    return legacy;
  };

  const buildCourseMapLink = (moduleId, unitId) => {
    if (!moduleId) {
      return "/html/course-map.html";
    }
    const unitSegment = unitId ? `&unit=${encodeURIComponent(unitId)}` : "";
    return `/html/course-map.html?module=${encodeURIComponent(moduleId)}${unitSegment}`;
  };

  const notificationCenter = (() => {
    const HISTORY_KEY = "kiraNotificationHistory";
    const STATE_KEY = "kiraNotificationState";
    const MAX_ITEMS = 25;
    let history = [];
    let refs = { level: 0, streak: 0, badges: 0 };
    let baselineReady = false;
    let initialized = false;

    const safeRead = (key, fallback) => {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      } catch {
        return fallback;
      }
    };

    const safeWrite = (key, value) => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {
        /* ignore storage errors */
      }
    };

    const countUnlockedBadges = payload => {
      if (!payload || typeof payload !== "object") {
        return 0;
      }
      const stats = payload.stats || {};
      const collections = Array.isArray(payload.collections) ? payload.collections : [];
      return collections.reduce((total, collection) => {
        const metricValue = Number(stats?.[collection.metric]) || 0;
        if (!Array.isArray(collection.rewards)) {
          return total;
        }
        const unlocked = collection.rewards.filter(reward => {
          const requirement = Number(reward.value);
          if (!Number.isFinite(requirement)) {
            return false;
          }
          return metricValue >= requirement;
        }).length;
        return total + unlocked;
      }, 0);
    };

    const getElements = () => ({
      list: getEl(selectors.notificationList),
      empty: getEl(selectors.notificationEmpty),
      clear: getEl(selectors.notificationClear),
      toastStack: getEl(selectors.notificationToasts)
    });

    const formatTimestamp = iso => {
      try {
        const stamp = iso ? new Date(iso) : new Date();
        if (Number.isNaN(stamp.getTime())) {
          return "Just now";
        }
        return stamp.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
      } catch {
        return "Just now";
      }
    };

    const renderHistory = () => {
      const { list, empty, clear } = getElements();
      if (!list) {
        return;
      }
      list.innerHTML = "";
      if (!history.length) {
        if (empty) {
          empty.hidden = false;
        }
        if (clear) {
          clear.disabled = true;
        }
        return;
      }
      if (empty) {
        empty.hidden = true;
      }
      if (clear) {
        clear.disabled = false;
      }
      const fragment = document.createDocumentFragment();
      history.forEach(entry => {
        const item = document.createElement("li");
        item.className = "notification-item";
        item.dataset.kind = entry.kind || "info";

        const body = document.createElement("div");
        body.className = "notification-item__body";

        const title = document.createElement("h4");
        title.textContent = entry.title || "Update";

        const detail = document.createElement("p");
        detail.textContent = entry.body || "";

        body.appendChild(title);
        body.appendChild(detail);

        const time = document.createElement("p");
        time.className = "notification-item__time";
        time.textContent = formatTimestamp(entry.timestamp);

        item.appendChild(body);
        item.appendChild(time);
        fragment.appendChild(item);
      });
      list.appendChild(fragment);
    };

    const saveState = () => {
      safeWrite(HISTORY_KEY, history);
      safeWrite(STATE_KEY, refs);
      baselineReady = true;
    };

    const showToast = entry => {
      const { toastStack } = getElements();
      if (!toastStack) {
        return;
      }
      const toast = document.createElement("article");
      toast.className = "notification-toast";
      toast.dataset.kind = entry.kind || "info";

      const content = document.createElement("div");
      content.className = "notification-toast__content";

      const title = document.createElement("h4");
      title.textContent = entry.title || "Update";

      const detail = document.createElement("p");
      detail.textContent = entry.body || "";

      content.appendChild(title);
      content.appendChild(detail);

      const dismiss = document.createElement("button");
      dismiss.type = "button";
      dismiss.setAttribute("aria-label", "Dismiss notification");
      dismiss.textContent = "×";

      toast.appendChild(content);
      toast.appendChild(dismiss);
      toastStack.appendChild(toast);

      const removeToast = () => {
        toast.remove();
      };

      const timeoutId = window.setTimeout(removeToast, 6000);
      dismiss.addEventListener("click", () => {
        window.clearTimeout(timeoutId);
        removeToast();
      });
    };

    const addNotification = (entry, options = {}) => {
      const record = {
        id: entry.id || `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        title: entry.title || "Update",
        body: entry.body || "",
        kind: entry.kind || "info",
        timestamp: entry.timestamp || new Date().toISOString()
      };
      history = [record, ...history].slice(0, MAX_ITEMS);
      saveState();
      renderHistory();
      if (!options.silent) {
        showToast(record);
      }
    };

    const loadServerNotifications = async () => {
      const session = window.kiraLearnerSession;
      if (!session) return;
      
      const email = sessionStorage.getItem('userEmail');
      if (!email) return;

      try {
        const response = await fetch(`/api/notifications/${encodeURIComponent(email)}`);
        const result = await response.json();
        
        if (result.success && result.notifications) {
          result.notifications.forEach(notif => {
            const exists = history.some(h => h.id === `server-${notif.Id}`);
            if (!exists) {
              addNotification({
                id: `server-${notif.Id}`,
                title: notif.Title,
                body: notif.Body,
                kind: notif.Kind,
                timestamp: notif.Timestamp
              }, { silent: true });
            }
          });
        }
      } catch (error) {
        console.error('Failed to load server notifications:', error);
      }
    };

    const ensureInit = () => {
      if (initialized) {
        return;
      }
      history = safeRead(HISTORY_KEY, []);
      const storedRefs = safeRead(STATE_KEY, null);
      if (storedRefs && typeof storedRefs === "object") {
        refs = { ...refs, ...storedRefs };
        baselineReady = true;
      }
      const { clear } = getElements();
      if (clear && !clear.dataset.wired) {
        clear.dataset.wired = "true";
        clear.addEventListener("click", () => {
          history = [];
          saveState();
          renderHistory();
        });
      }
      renderHistory();
      initialized = true;
    };

    const handleLevel = level => {
      const value = Number(level);
      if (!Number.isFinite(value)) {
        return;
      }
      const next = Math.max(0, Math.floor(value));
      if (!baselineReady) {
        refs.level = next;
        saveState();
        renderHistory();
        return;
      }
      if (next > refs.level) {
        addNotification({
          kind: "level",
          title: `Level ${next} unlocked`,
          body: "Your XP streak just pushed you to a new level."
        });
      }
      if (next !== refs.level) {
        refs.level = next;
        saveState();
      }
    };

    const handleStreak = streak => {
      const current = Number(streak?.current);
      if (!Number.isFinite(current)) {
        return;
      }
      const next = Math.max(0, Math.floor(current));
      if (!baselineReady) {
        refs.streak = next;
        saveState();
        renderHistory();
        return;
      }
      if (next > refs.streak) {
        addNotification({
          kind: "streak",
          title: `${next}-day streak`,
          body: next === 1 ? "Streak started. Keep the flame going tomorrow!" : "You kept the streak alive today."
        });
      }
      if (next !== refs.streak) {
        refs.streak = next;
        saveState();
      }
    };

    const handleBadges = badges => {
      const total = countUnlockedBadges(badges);
      if (!baselineReady) {
        refs.badges = total;
        saveState();
        renderHistory();
        return;
      }
      if (total > refs.badges) {
        const diff = total - refs.badges;
        addNotification({
          kind: "badge",
          title: diff > 1 ? `Unlocked ${diff} badges` : "New badge unlocked",
          body: "Check the Milestones section in your Profile to see your reward."
        });
      }
      if (total !== refs.badges) {
        refs.badges = total;
        saveState();
      }
    };

    return {
      init: () => {
        ensureInit();
        loadServerNotifications();
      },
      evaluateDashboard: (profile, streak, badges) => {
        ensureInit();
        loadServerNotifications();
        handleLevel(profile?.level);
        handleStreak(streak);
        handleBadges(badges);
      },
      handleActivity: payload => {
        if (!payload) {
          return;
        }
        ensureInit();
        if (typeof payload.level === "number" || payload.levelUp) {
          handleLevel(payload.level ?? refs.level + 1);
        }
        if (payload.streak) {
          handleStreak(payload.streak);
        }
        if (payload.badges) {
          handleBadges(payload.badges);
        }
      },
      trackStreak: streak => {
        ensureInit();
        handleStreak(streak);
      },
      trackBadges: badges => {
        ensureInit();
        handleBadges(badges);
      }
    };
  })();

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

  const resolveResumeLink = module => {
    if (!module) {
      return "";
    }
    const moduleId = module.moduleId || module.ModuleId || "";
    const stored = loadUnitProgress(moduleId);
    if (stored?.courseMap) {
      return stored.courseMap;
    }
    return buildCourseMapLink(moduleId);
  };


  const updateResumeButton = modules => {
    const button = getEl(selectors.resumeButton);
    if (!button) {
      return;
    }
    const list = Array.isArray(modules) ? modules.filter(Boolean) : (window.kiraActiveModules || []).filter(Boolean);
    if (!list.length) {
      button.disabled = false;
      button.textContent = "Add a module";
      button.onclick = () => {
        const trigger = document.querySelector("[data-action='open-course-picker']");
        if (trigger) {
          trigger.click();
        } else {
          notifyCourseMapUnavailable();
        }
      };
      return;
    }

    const storedTarget = list
      .map(module => {
        const moduleId = module.moduleId || module.ModuleId || "";
        const progress = loadUnitProgress(moduleId);
        const link = progress?.courseMap || null;
        const updatedAt = progress?.updatedAt ? Date.parse(progress.updatedAt) || 0 : 0;
        return { moduleId, link, updatedAt, progress };
      })
      .filter(entry => !!entry.link)
      .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))[0];

    const fallbackTarget = list
      .map(module => ({
        moduleId: module.moduleId || module.ModuleId || "",
        link: resolveResumeLink(module)
      }))
      .find(entry => !!entry.link);

    const target = storedTarget || fallbackTarget;

    if (!target) {
      button.disabled = true;
      button.textContent = "Resume module";
      button.onclick = null;
      return;
    }

    button.disabled = false;
    button.textContent = "Resume module";
    button.onclick = () => {
      window.location.href = target.link;
    };
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
    updateResumeButton(window.kiraActiveModules || []);
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
      setHeroNames(userName);
      return;
    }
    setText(selectors.profileName, profile.name || userName);
    setHeroNames(profile.name || userName);
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
    setText(selectors.missionStatus, mission.mode || "Mission status");
    setText(selectors.missionSupport, mission.wantsVideos ? "Intro videos on" : "Intro videos off");

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
      button.textContent = "Manage plan";
      button.onclick = () => {
        window.location.href = "learner-profile.html#study-preferences";
      };
    }
  };

  const updateStats = stats => {
    const grid = getEl(selectors.statsGrid);
    if (!grid) {
      return;
    }
    const filtered = Array.isArray(stats)
      ? stats.filter(stat => {
          if (!stat) {
            return false;
          }
          const valueText =
            typeof stat.value === "string" ? stat.value.toLowerCase() : "";
          return !valueText.includes("year not set");
        })
      : [];
    if (!filtered.length) {
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
    grid.innerHTML = filtered.map(template).join("");
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
    updateResumeButton(activeModules);
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
      const completedModules = Array.isArray(badges.completedModules)
        ? badges.completedModules
        : Array.isArray(badges.CompletedModules)
          ? badges.CompletedModules
          : (() => {
              try {
                const raw = localStorage.getItem("kiraModuleCompletions");
                if (raw) {
                  const parsed = JSON.parse(raw);
                  if (Array.isArray(parsed)) {
                    return parsed;
                  }
                  if (Array.isArray(parsed?.items)) {
                    return parsed.items;
                  }
                }
              } catch {
                /* ignore parsing */
              }
              return [];
            })();
      const mergedStats = {
        ...badges.stats,
        completedModules
      };
      window.kiraBadgeStats = mergedStats;
      try {
        localStorage.setItem("kiraUserStats", JSON.stringify(mergedStats));
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
    notificationCenter.evaluateDashboard(data.profile, data.streak, data.badges);
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
    notificationCenter.init();
    wireModulePicker();
    updateResumeButton(window.kiraActiveModules || []);
    fetchDashboard();
  };

  document.addEventListener("kira:activity-feedback", event => {
    if (event?.detail) {
      notificationCenter.handleActivity(event.detail);
    }
  });

  document.addEventListener("kira:streak-updated", event => {
    if (event?.detail) {
      notificationCenter.trackStreak(event.detail);
    }
  });

  document.addEventListener("kira:badges-ready", event => {
    if (event?.detail) {
      notificationCenter.trackBadges(event.detail);
    }
  });

  document.addEventListener("kira:learner-missing", () => {
    showDashboardError("Please log in to view your learner dashboard.");
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startDashboard);
  } else {
    startDashboard();
  }
})();

