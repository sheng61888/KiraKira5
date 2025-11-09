(() => {
  const DEFAULT_AVATAR = "/images/profile-cat.png";
  const selectors = {
    username: ".profile .username",
    streak: ".profile .streak",
    levelLabel: ".profile small",
    xpBar: ".profile .xp-bar span",
    heroName: "#username",
    avatar: ".profile .avatar"
  };

  const getEl = selector => document.querySelector(selector);
  const setText = (selector, text) => {
    const el = getEl(selector);
    if (el && typeof text === "string") {
      el.textContent = text;
    }
  };

  const setXpWidth = streak => {
    const bar = getEl(selectors.xpBar);
    if (!bar) {
      return;
    }
    const remaining = typeof streak?.xpToNextLevel === "number" ? streak.xpToNextLevel : 450;
    const percent = Math.max(10, Math.min(100, 100 - remaining / 5));
    bar.style.width = `${percent}%`;
  };

  const setAvatarImage = avatarUrl => {
    const avatar = getEl(selectors.avatar);
    if (!avatar) {
      return;
    }
    const source = typeof avatarUrl === "string" && avatarUrl.trim().length
      ? avatarUrl.trim()
      : DEFAULT_AVATAR;
    avatar.style.backgroundImage = `url('${source}')`;
    avatar.style.backgroundSize = "cover";
    avatar.style.backgroundPosition = "center";
    avatar.style.backgroundColor = "transparent";
  };

  const updateSidebar = (profile, streak) => {
    const name = profile?.name?.trim() || "Learner";
    setText(selectors.username, name);
    setAvatarImage(profile?.avatarUrl);

    const hero = getEl(selectors.heroName);
    if (hero && (!hero.dataset.locked || hero.dataset.locked !== "true")) {
      hero.textContent = name;
    }

    const streakLabel = streak?.status || (streak?.current ? `${streak.current}-day streak` : "Ready to study");
    setText(selectors.streak, streakLabel);

    const levelLabel = streak?.levelLabel || (profile?.level !== undefined
      ? `Level ${profile.level} - ${profile.xp ?? 0} XP`
      : "Level updating");
    setText(selectors.levelLabel, levelLabel);

    setXpWidth(streak);
  };

  const showSidebarError = message => {
    setText(selectors.streak, message || "Unable to load profile");
  };

  const hydrateSidebar = async () => {
    if (window.kiraShellHydrated || window.kiraShellHydrating) {
      return;
    }
    const session = window.kiraLearnerSession;
    if (!session) {
      return;
    }
    const learnerId = session.ensureId();
    if (!learnerId) {
      showSidebarError("Please sign in");
      return;
    }

    window.kiraShellHydrating = true;
    try {
      const response = await session.fetch("dashboard");
      if (!response.ok) {
        throw new Error(`Sidebar request failed with status ${response.status}`);
      }
      const data = await response.json();
      updateSidebar(data.profile, data.streak);
      window.kiraShellHydrated = true;
    } catch (error) {
      console.error("Unable to hydrate sidebar", error);
      showSidebarError("Unable to load profile");
    } finally {
      window.kiraShellHydrating = false;
    }
  };

  document.addEventListener("DOMContentLoaded", hydrateSidebar);
  document.addEventListener("kira:learner-missing", () => {
    showSidebarError("Please sign in");
  });
})();
