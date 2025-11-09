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
    missionAction: "#missionActionBtn"
  };

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

  const updateProfile = (profile, streak) => {
    if (!profile) {
      return;
    }
    setText(selectors.profileName, profile.name || "Learner");
    setText(selectors.heroName, profile.name || "Learner");
    if (streak) {
      setText(selectors.profileStreak, streak.status || "Ready to study");
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
    window.kiraModules = catalogue;
    window.kiraModulesMap = catalogue.reduce((map, section) => {
      map[section.grade] = section;
      return map;
    }, {});
    document.dispatchEvent(new CustomEvent("kira:modules-ready", { detail: catalogue }));
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

  document.addEventListener("DOMContentLoaded", fetchDashboard);
  document.addEventListener("kira:learner-missing", () => {
    showDashboardError("Please log in to view your learner dashboard.");
  });
  if (document.readyState === "complete" || document.readyState === "interactive") {
  fetchDashboard();
} else {
  document.addEventListener("DOMContentLoaded", fetchDashboard);
}

})();
