(() => {
  const DEFAULT_AVATAR = "/images/profile-cat.png";
  const DEFAULT_MOTTO = "Learning one formula at a time.";
  const selectors = {
    profileCard: ".profile-card",
    profileImage: ".profile-card .profile-img",
    motto: ".profile-card p",
    xpSummary: ".profile-card .xp-summary",
    nameInput: "#name",
    emailInput: "#email",
    schoolInput: "#school",
    yearInput: "#year",
    avatarOptions: "[data-avatar-options]",
    avatarStatus: "[data-avatar-status]",
    editMottoBtn: "#editMottoBtn",
    editInfoBtn: "#editInfoBtn",
    infoForm: "#personalInfoForm",
    infoActions: "[data-info-actions]",
    introToggle: "#introVideosToggle",
    introLabel: "#introVideosLabel",
    introHint: "#introVideosHint",
    introStatus: "[data-intro-status]",
    badgeSelector: "[data-badge-selector]",
    badgeTrigger: "[data-badge-trigger]",
    badgePopup: "[data-badge-popup]",
    badgeOptions: "[data-badge-options]",
    badgeLabel: "[data-badge-label]",
    saveProfileBtn: "#saveProfileBtn"
  };

  const state = {
    profile: {
      name: "",
      motto: DEFAULT_MOTTO,
      school: "",
      gradeYear: "",
      email: ""
    },
    editingMotto: false,
    editingInfo: false,
    mission: null,
    badgePayload: null,
    selectedBadgeId: null,
    unlockedBadges: [],
    badgeSelectorOpen: false,
    badgeSelectorBound: false,
    serverBadgePreference: null
  };

  const BADGE_DISPLAY_STORAGE_KEY = "kiraPreferredBadgeDisplay";
  const BADGE_STATS_STORAGE_KEY = "kiraUserStats";

  const resolveAvatarUrl = value => {
    if (typeof value !== "string") {
      return DEFAULT_AVATAR;
    }
    const trimmed = value.trim();
    if (!trimmed) {
      return DEFAULT_AVATAR;
    }
    return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  };

  const setProfileImage = avatar => {
    const img = document.querySelector(selectors.profileImage);
    if (img) {
      img.src = resolveAvatarUrl(avatar);
    }
  };

  const selectAvatarOption = avatar => {
    const normalized = resolveAvatarUrl(avatar);
    document.querySelectorAll("[data-avatar-option]").forEach(option => {
      const isMatch = option.dataset.avatar === normalized;
      option.classList.toggle("avatar-option--selected", isMatch);
      option.setAttribute("aria-pressed", isMatch ? "true" : "false");
    });
  };

  const setAvatarStatus = text => {
    const chip = document.querySelector(selectors.avatarStatus);
    if (chip && typeof text === "string") {
      chip.textContent = text;
    }
  };

  const setBadgeDisplayLabel = text => {
    const label = document.querySelector(selectors.badgeLabel);
    if (label) {
      label.textContent = text || "Next badge syncing...";
    }
  };

  const setSaveButtonState = (label, options = {}) => {
    const btn = document.querySelector(selectors.saveProfileBtn);
    if (!btn) {
      return;
    }
    if (label) {
      btn.textContent = label;
    }
    if (Object.prototype.hasOwnProperty.call(options, "disabled")) {
      btn.disabled = Boolean(options.disabled);
    }
  };

  const readStoredBadgePreference = () => {
    try {
      const raw = localStorage.getItem(BADGE_DISPLAY_STORAGE_KEY);
      if (!raw) {
        return null;
      }
      try {
        const parsed = JSON.parse(raw);
        if (typeof parsed === "string") {
          return { id: parsed };
        }
        if (parsed && typeof parsed === "object") {
          return {
            id: parsed.id || "",
            label: parsed.label || "",
            style: parsed.style || ""
          };
        }
      } catch {
        return { id: raw };
      }
    } catch (error) {
      console.warn("Unable to read badge preference", error);
    }
    return null;
  };

  const normalizeBadgeChip = chip => {
    if (!chip || typeof chip !== "object") {
      return null;
    }
    const id = typeof chip.id === "string" && chip.id.length
      ? chip.id
      : typeof chip.badgeId === "string" && chip.badgeId.length
        ? chip.badgeId
        : "";
    const label = typeof chip.label === "string" && chip.label.length
      ? chip.label
      : typeof chip.text === "string"
        ? chip.text
        : "";
    const style = typeof chip.style === "string" && chip.style.length ? chip.style : "level";
    if (!id && !label) {
      return null;
    }
    return { id, label: label || "Unlocked badge", style };
  };

  const persistBadgePreference = badge => {
    try {
      if (!badge) {
        localStorage.removeItem(BADGE_DISPLAY_STORAGE_KEY);
        return;
      }
      const payload = JSON.stringify({
        id: badge.id,
        label: badge.label,
        style: badge.style
      });
      localStorage.setItem(BADGE_DISPLAY_STORAGE_KEY, payload);
    } catch (error) {
      console.warn("Unable to store badge preference", error);
    }
  };

  const saveFeaturedBadgeRemote = async badge => {
    const session = window.kiraLearnerSession;
    if (!session || !badge?.id) {
      return;
    }
    try {
      await session.fetch("profile/featured-badge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          badgeId: badge.id,
          label: badge.label,
          style: badge.style
        })
      });
    } catch (error) {
      console.warn("Unable to save badge selection", error);
    }
  };

  const applyBadgeStyle = style => {
    const root = document.querySelector(selectors.badgeSelector);
    if (!root) {
      return;
    }
    if (style) {
      root.dataset.badgeStyle = style;
    } else {
      delete root.dataset.badgeStyle;
    }
  };

  const updateBadgeOptionActiveState = () => {
    const options = document.querySelector(selectors.badgeOptions);
    if (!options) {
      return;
    }
    options.querySelectorAll("[data-badge-id]").forEach(option => {
      option.classList.toggle("is-active", option.dataset.badgeId === state.selectedBadgeId);
    });
  };

  const applyBadgeSelection = (badge, options = {}) => {
    const persist = Boolean(options.persist);
    if (!badge) {
      state.selectedBadgeId = null;
      setBadgeDisplayLabel("Next badge syncing...");
      applyBadgeStyle();
      if (persist) {
        persistBadgePreference(null);
        saveFeaturedBadgeRemote(null);
        state.serverBadgePreference = null;
      }
      updateBadgeOptionActiveState();
      return;
    }
    state.selectedBadgeId = badge.id;
    setBadgeDisplayLabel(badge.label);
    applyBadgeStyle(badge.style);
    if (persist) {
      persistBadgePreference(badge);
      state.serverBadgePreference = { ...badge };
      saveFeaturedBadgeRemote(badge);
    }
    updateBadgeOptionActiveState();
  };

  const resolveBadgeCollections = payload => {
    if (payload?.collections && Array.isArray(payload.collections)) {
      return payload.collections;
    }
    if (Array.isArray(window.kiraBadgeCollections)) {
      return window.kiraBadgeCollections;
    }
    return [];
  };

  const resolveBadgeStats = payload => {
    if (payload?.stats) {
      return payload.stats;
    }
    if (window.kiraBadgeStats) {
      return window.kiraBadgeStats;
    }
    try {
      const stored = localStorage.getItem(BADGE_STATS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn("Unable to read stored badge stats", error);
    }
    return {};
  };

  const collectUnlockedBadges = (collections, stats) => {
    if (!Array.isArray(collections) || !collections.length) {
      return [];
    }
    return collections.reduce((acc, collection) => {
      if (!Array.isArray(collection.rewards)) {
        return acc;
      }
      const metricValue = stats?.[collection.metric] ?? 0;
      collection.rewards.forEach(reward => {
        if (typeof reward?.value !== "number") {
          return;
        }
        if (metricValue >= reward.value) {
          acc.push({
            id: `${collection.id || collection.metric}-${reward.value}`,
            label: reward.label || "Unlocked badge",
            collection: collection.title || collection.description || "Unlocked badge",
            style: collection.style || "level"
          });
        }
      });
      return acc;
    }, []);
  };

  const setBadgePopupVisibility = open => {
    const popup = document.querySelector(selectors.badgePopup);
    const trigger = document.querySelector(selectors.badgeTrigger);
    if (!popup || !trigger) {
      return;
    }
    popup.hidden = !open;
    popup.setAttribute("aria-hidden", open ? "false" : "true");
    trigger.setAttribute("aria-expanded", open ? "true" : "false");
    state.badgeSelectorOpen = open;
  };

  const closeBadgePopup = () => setBadgePopupVisibility(false);

  const handleBadgeOutsideClick = event => {
    if (!state.badgeSelectorOpen) {
      return;
    }
    const root = document.querySelector(selectors.badgeSelector);
    if (root && !root.contains(event.target)) {
      closeBadgePopup();
    }
  };

  const handleBadgeKeydown = event => {
    if (event.key === "Escape" && state.badgeSelectorOpen) {
      closeBadgePopup();
      const trigger = document.querySelector(selectors.badgeTrigger);
      if (trigger) {
        trigger.focus();
      }
    }
  };

  const handleBadgeOptionClick = badgeId => {
    const badge = state.unlockedBadges.find(item => item.id === badgeId);
    if (!badge) {
      return;
    }
    applyBadgeSelection(badge, { persist: true });
    closeBadgePopup();
  };

  const renderBadgeSelector = badgePayload => {
    if (badgePayload) {
      state.badgePayload = badgePayload;
    }
    const options = document.querySelector(selectors.badgeOptions);
    const label = document.querySelector(selectors.badgeLabel);
    if (!options || !label) {
      return;
    }

    const collections = resolveBadgeCollections(state.badgePayload);
    if (!collections.length) {
      options.innerHTML = '<p class="muted">Badges syncing...</p>';
      applyBadgeSelection(null);
      return;
    }

    const stats = resolveBadgeStats(state.badgePayload);
    const unlocked = collectUnlockedBadges(collections, stats);
    state.unlockedBadges = unlocked;

    if (!unlocked.length) {
      options.innerHTML = '<p class="muted">Unlock badges to feature them here.</p>';
      applyBadgeSelection(null);
      return;
    }

    const fragment = document.createDocumentFragment();
    unlocked.forEach(badge => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "badge-selector__option";
      button.dataset.badgeId = badge.id;
      button.dataset.badgeStyle = badge.style;
      button.innerHTML = `<strong>${badge.label}</strong><small>${badge.collection}</small>`;
      button.addEventListener("click", () => handleBadgeOptionClick(badge.id));
      fragment.appendChild(button);
    });
    options.innerHTML = "";
    options.appendChild(fragment);

    let preferredBadge = state.serverBadgePreference || readStoredBadgePreference();
    preferredBadge = normalizeBadgeChip(preferredBadge) || null;
    if (!state.selectedBadgeId && preferredBadge?.id) {
      state.selectedBadgeId = preferredBadge.id;
    }
    let selected = state.selectedBadgeId
      ? unlocked.find(item => item.id === state.selectedBadgeId)
      : null;
    if (!selected && preferredBadge) {
      selected = preferredBadge;
    }
    if (!selected) {
      selected = unlocked[0];
    }
    applyBadgeSelection(selected);
  };

  const bindBadgeSelector = () => {
    if (state.badgeSelectorBound) {
      return;
    }
    const trigger = document.querySelector(selectors.badgeTrigger);
    const popup = document.querySelector(selectors.badgePopup);
    if (!trigger || !popup) {
      return;
    }
    trigger.addEventListener("click", () => {
      setBadgePopupVisibility(!state.badgeSelectorOpen);
    });
    const closeBtn = popup.querySelector("[data-badge-close]");
    if (closeBtn) {
      closeBtn.addEventListener("click", closeBadgePopup);
    }
    document.addEventListener("click", handleBadgeOutsideClick);
    document.addEventListener("keydown", handleBadgeKeydown);
    popup.setAttribute("aria-hidden", "true");
    state.badgeSelectorBound = true;
  };

  const handleSaveChangesClick = async () => {
    const btn = document.querySelector(selectors.saveProfileBtn);
    if (!btn || btn.disabled) {
      return;
    }
    setSaveButtonState("Saving...", { disabled: true });
    const success = await fetchProfile({ silent: true });
    if (success) {
      setSaveButtonState("Saved!", { disabled: true });
      setTimeout(() => setSaveButtonState("Save changes", { disabled: false }), 2000);
    } else {
      setSaveButtonState("Try again", { disabled: false });
      setTimeout(() => setSaveButtonState("Save changes"), 2000);
    }
  };

  const bindSaveChangesButton = () => {
    const btn = document.querySelector(selectors.saveProfileBtn);
    if (btn) {
      btn.addEventListener("click", handleSaveChangesClick);
    }
  };

  const setMottoButtonLabel = label => {
    const btn = document.querySelector(selectors.editMottoBtn);
    if (btn && label) {
      btn.textContent = label;
    }
  };

  const resetMottoButtonLabel = () => setMottoButtonLabel("Edit motto");

  const setInfoButtonLabel = label => {
    const btn = document.querySelector(selectors.editInfoBtn);
    if (btn && label) {
      btn.textContent = label;
    }
  };

  const resetInfoButtonLabel = () => setInfoButtonLabel("Edit");

  const updateProfileCard = profile => {
    const card = document.querySelector(selectors.profileCard);
    if (!card || !profile) {
      return;
    }
    const nameHeading = card.querySelector("h2");
    if (nameHeading) {
      nameHeading.textContent = profile.name || "Learner";
    }
    const mottoEl = card.querySelector("p");
    if (mottoEl) {
      const mottoText = profile.motto?.trim() || DEFAULT_MOTTO;
      mottoEl.textContent = mottoText;
      state.profile.motto = mottoText;
      state.editingMotto = false;
    }
    const summary = card.querySelectorAll(".xp-summary span");
    if (summary.length >= 1) {
      summary[0].innerHTML = `<strong>Level:</strong> ${profile.level ?? "-"}`;
    }
    if (summary.length >= 2) {
      summary[1].innerHTML = `<strong>Rank:</strong> ${profile.rank || "Learner"}`;
    }
    state.profile.name = profile.name || state.profile.name;
    setProfileImage(profile.avatarUrl);
    selectAvatarOption(profile.avatarUrl);
    const badgeChip = normalizeBadgeChip(profile.featuredBadge);
    if (badgeChip) {
      state.serverBadgePreference = badgeChip;
      setBadgeDisplayLabel(badgeChip.label);
      applyBadgeStyle(badgeChip.style);
    }
  };

  function resetInfoEditingState() {
    state.editingInfo = false;
    const form = document.querySelector(selectors.infoForm);
    if (!form) {
      return;
    }
    form.classList.remove("is-editing");
    const actions = form.querySelector(selectors.infoActions);
    if (actions) {
      actions.hidden = true;
    }
    form.querySelectorAll("input").forEach(input => {
      input.readOnly = true;
    });
    resetInfoButtonLabel();
  }

  const setIntroStatus = (text, tone = "info") => {
    const chip = document.querySelector(selectors.introStatus);
    if (!chip) {
      return;
    }
    chip.textContent = text;
    chip.classList.remove("chip--success", "chip--info");
    chip.classList.add(tone === "success" ? "chip--success" : "chip--info");
  };

  const renderStudyPreferences = (mission, options = {}) => {
    const toggle = document.querySelector(selectors.introToggle);
    if (!toggle) {
      return;
    }
    const wantsVideos = !!mission?.wantsVideos;
    toggle.checked = wantsVideos;

    const label = document.querySelector(selectors.introLabel);
    if (label) {
      label.textContent = wantsVideos ? "Intro videos on" : "Intro videos off";
    }

    const hint = document.querySelector(selectors.introHint);
    if (hint) {
      hint.textContent = wantsVideos
        ? "We'll keep adding quick explainers before tricky drills."
        : "We'll skip the intro explainers until you turn this back on.";
    }

    if (!options.skipStatus) {
      setIntroStatus("Auto-saves");
    }
  };

  const saveIntroPreference = async wantsVideos => {
    setIntroStatus("Saving...");
    const session = window.kiraLearnerSession;
    if (!session) {
      throw new Error("Session unavailable");
    }
    const learnerId = session.ensureId();
    if (!learnerId) {
      throw new Error("Missing learner");
    }

    const payload = {
      grade: state.mission?.grade || "Form 4",
      readiness: state.mission?.confidence ?? 50,
      wantsVideos
    };

    const response = await session.fetch("mission", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      throw new Error(`Mission update failed with status ${response.status}`);
    }
    const mission = await response.json();
    state.mission = mission;
    renderStudyPreferences(mission);
    setIntroStatus("Saved", "success");
    window.setTimeout(() => setIntroStatus("Auto-saves"), 2500);
  };

  const bindStudyPreferenceToggle = () => {
    const toggle = document.querySelector(selectors.introToggle);
    if (!toggle || toggle.dataset.wired === "true") {
      return;
    }
    toggle.dataset.wired = "true";
    toggle.addEventListener("change", async event => {
      if (!state.mission) {
        state.mission = { grade: "Form 4", confidence: 50, wantsVideos: event.target.checked };
      }
      const wantsVideos = !!event.target.checked;
      try {
        await saveIntroPreference(wantsVideos);
      } catch (error) {
        console.error("Unable to update intro videos preference", error);
        event.target.checked = !wantsVideos;
        renderStudyPreferences(state.mission, { skipStatus: true });
        setIntroStatus("Unable to save");
        window.setTimeout(() => setIntroStatus("Auto-saves"), 2500);
      }
    });
  };

  const updateInfoForm = (profile, contact, school) => {
    const nameField = document.querySelector(selectors.nameInput);
    if (nameField && profile?.name !== undefined) {
      nameField.value = profile.name;
      nameField.readOnly = true;
    }
    const emailField = document.querySelector(selectors.emailInput);
    if (emailField) {
      emailField.value = contact?.email || "";
      emailField.readOnly = true;
    }
    const schoolField = document.querySelector(selectors.schoolInput);
    if (schoolField) {
      schoolField.value = school?.school || "";
      schoolField.readOnly = true;
    }
    const yearField = document.querySelector(selectors.yearInput);
    if (yearField) {
      yearField.value = school?.year || "";
      yearField.readOnly = true;
    }
    state.profile.name = profile?.name || state.profile.name;
    state.profile.email = contact?.email || state.profile.email;
    state.profile.school = school?.school || state.profile.school;
    state.profile.gradeYear = school?.year || state.profile.gradeYear;
    resetInfoEditingState();
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

  const showProfileError = message => {
    const card = document.querySelector(selectors.profileCard);
    if (card) {
      card.insertAdjacentHTML("beforeend", `<p class="muted">${message}</p>`);
    }
  };

  const sanitisePayload = payload => Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined));

  const saveProfileDetails = async payload => {
    const session = window.kiraLearnerSession;
    if (!session) {
      throw new Error("Missing learner session");
    }
    const body = sanitisePayload(payload);
    if (!Object.keys(body).length) {
      return null;
    }
    const response = await session.fetch("profile/details", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      throw new Error(`Profile update failed with status ${response.status}`);
    }
    const data = await response.json();
    updateProfileCard(data.profile);
    updateInfoForm(data.profile, data.contact, data.school);
    broadcastBadges(data.badges);
    return data;
  };

  const saveAvatarSelection = async avatarUrl => {
    const session = window.kiraLearnerSession;
    if (!session) {
      setAvatarStatus("Offline");
      return;
    }
    const payload = { avatarUrl: resolveAvatarUrl(avatarUrl) };
    setAvatarStatus("Saving...");
    try {
      const response = await session.fetch("profile/avatar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        throw new Error(`Avatar update failed with status ${response.status}`);
      }
      const profile = await response.json();
      updateProfileCard(profile);
      setAvatarStatus("Saved");
      setTimeout(() => setAvatarStatus("Auto-saves"), 2000);
    } catch (error) {
      console.error("Unable to save avatar", error);
      setAvatarStatus("Save failed");
      setTimeout(() => setAvatarStatus("Tap to retry"), 3000);
    }
  };

  const bindAvatarPicker = () => {
    const container = document.querySelector(selectors.avatarOptions);
    if (!container) {
      return;
    }
    container.addEventListener("click", event => {
      const option = event.target.closest("[data-avatar-option]");
      if (!option) {
        return;
      }
      const choice = option.dataset.avatar;
      setProfileImage(choice);
      selectAvatarOption(choice);
      saveAvatarSelection(choice);
    });
  };

  const startMottoEdit = () => {
    if (state.editingMotto) {
      return;
    }
    const mottoEl = document.querySelector(selectors.motto);
    if (!mottoEl) {
      return;
    }
    state.editingMotto = true;
    setMottoButtonLabel("Cancel");
    const editor = document.createElement("div");
    editor.className = "motto-editor";
    const input = document.createElement("input");
    input.type = "text";
    input.value = state.profile.motto;
    input.maxLength = 140;
    const saveBtn = document.createElement("button");
    saveBtn.type = "button";
    saveBtn.className = "btn btn--primary btn--sm";
    saveBtn.dataset.mottoSave = "true";
    saveBtn.textContent = "Save";
    editor.append(input, saveBtn);
    mottoEl.textContent = "";
    mottoEl.append(editor);
    input.focus();
    input.select();
    input.addEventListener("keydown", event => {
      if (event.key === "Enter") {
        event.preventDefault();
        submitMotto(input.value);
      }
      if (event.key === "Escape") {
        cancelMottoEdit();
      }
    });
    saveBtn.addEventListener("click", () => submitMotto(input.value));
  };

  const submitMotto = async value => {
    const next = value.trim() || DEFAULT_MOTTO;
    try {
      setMottoButtonLabel("Saving...");
      await saveProfileDetails({ motto: next });
      resetMottoButtonLabel();
    } catch (error) {
      console.error("Unable to save motto", error);
      setMottoButtonLabel("Retry save");
      setTimeout(resetMottoButtonLabel, 2500);
    }
  };

  const cancelMottoEdit = () => {
    const mottoEl = document.querySelector(selectors.motto);
    if (!mottoEl) {
      return;
    }
    mottoEl.textContent = state.profile.motto;
    state.editingMotto = false;
    resetMottoButtonLabel();
  };

  const bindMottoEditor = () => {
    const btn = document.querySelector(selectors.editMottoBtn);
    if (!btn) {
      return;
    }
    btn.addEventListener("click", () => {
      if (state.editingMotto) {
        cancelMottoEdit();
      } else {
        startMottoEdit();
      }
    });
  };

  const startInfoEdit = () => {
    if (state.editingInfo) {
      return;
    }
    const form = document.querySelector(selectors.infoForm);
    if (!form) {
      return;
    }
    state.editingInfo = true;
    form.classList.add("is-editing");
    const actions = form.querySelector(selectors.infoActions);
    if (actions) {
      actions.hidden = false;
    }
    form.querySelectorAll("input").forEach(input => {
      input.readOnly = false;
    });
    setInfoButtonLabel("Cancel");
    const firstInput = form.querySelector("input");
    if (firstInput) {
      firstInput.focus();
      firstInput.select();
    }
  };

  const gatherInfoFormData = () => {
    const getValue = selector => document.querySelector(selector)?.value.trim() || "";
    return {
      name: getValue(selectors.nameInput),
      email: getValue(selectors.emailInput),
      school: getValue(selectors.schoolInput),
      year: getValue(selectors.yearInput)
    };
  };

  const cancelInfoEditing = () => {
    const nameField = document.querySelector(selectors.nameInput);
    if (nameField) {
      nameField.value = state.profile.name;
    }
    const emailField = document.querySelector(selectors.emailInput);
    if (emailField) {
      emailField.value = state.profile.email;
    }
    const schoolField = document.querySelector(selectors.schoolInput);
    if (schoolField) {
      schoolField.value = state.profile.school;
    }
    const yearField = document.querySelector(selectors.yearInput);
    if (yearField) {
      yearField.value = state.profile.gradeYear;
    }
    resetInfoEditingState();
  };

  const submitInfoForm = async event => {
    event?.preventDefault();
    if (!state.editingInfo) {
      return;
    }
    try {
      setInfoButtonLabel("Saving...");
      await saveProfileDetails(gatherInfoFormData());
      resetInfoButtonLabel();
    } catch (error) {
      console.error("Unable to save personal info", error);
      setInfoButtonLabel("Retry save");
      setTimeout(resetInfoButtonLabel, 2500);
    }
  };

  const bindInfoEditor = () => {
    const editBtn = document.querySelector(selectors.editInfoBtn);
    const form = document.querySelector(selectors.infoForm);
    if (!editBtn || !form) {
      return;
    }
    editBtn.addEventListener("click", () => {
      if (state.editingInfo) {
        cancelInfoEditing();
      } else {
        startInfoEdit();
      }
    });
    form.addEventListener("submit", submitInfoForm);
    const cancelBtn = form.querySelector("[data-info-cancel]");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", cancelInfoEditing);
    }
  };

  const bindPasswordChange = () => {
    const form = document.querySelector("#changePasswordForm");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      const currentPassword = document.querySelector("#currentPassword").value;
      const newPassword = document.querySelector("#newPassword").value;
      const confirmPassword = document.querySelector("#confirmPassword").value;

      if (newPassword !== confirmPassword) {
        alert("New passwords do not match");
        return;
      }

      const email = state.profile.email;
      if (!email) {
        alert("Email not found. Please refresh the page.");
        return;
      }

      try {
        const response = await fetch("/api/user/changepassword", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, currentPassword, newPassword })
        });

        const result = await response.json();
        if (result.success) {
          alert("Password changed successfully!");
          form.reset();
        } else {
          alert(result.message || "Failed to change password");
        }
      } catch (error) {
        alert("Error: " + error.message);
      }
    });
  };

  const fetchProfile = async (options = {}) => {
    const { silent = false } = options;
    const session = window.kiraLearnerSession;
    if (!session) {
      return false;
    }
    const learnerId = session.ensureId();
    if (!learnerId) {
      if (!silent) {
        showProfileError("Please log in again to view your profile.");
      }
      return false;
    }
    try {
      const response = await session.fetch("profile");
      if (!response.ok) {
        throw new Error(`Profile request failed with status ${response.status}`);
      }
      const data = await response.json();
      state.serverBadgePreference = normalizeBadgeChip(data.profile?.featuredBadge) || null;
      if (state.serverBadgePreference?.id) {
        state.selectedBadgeId = state.serverBadgePreference.id;
      }
      updateProfileCard(data.profile);
      updateInfoForm(data.profile, data.contact, data.school);
      broadcastBadges(data.badges);
      state.mission = data.mission || state.mission;
      renderStudyPreferences(state.mission);
      return true;
    } catch (error) {
      console.error("Unable to load learner profile", error);
      if (!silent) {
        showProfileError("Unable to load profile right now. Please refresh.");
      }
      return false;
    }
  };

  document.addEventListener("kira:badges-ready", event => {
    renderBadgeSelector(event.detail);
  });

  document.addEventListener("DOMContentLoaded", () => {
    bindAvatarPicker();
    bindBadgeSelector();
    bindSaveChangesButton();
    bindMottoEditor();
    bindInfoEditor();
    bindStudyPreferenceToggle();
    bindPasswordChange();
    renderStudyPreferences(state.mission, { skipStatus: true });
    renderBadgeSelector(state.badgePayload);
    fetchProfile();
  });

  document.addEventListener("kira:learner-missing", () => {
    showProfileError("Please sign in to manage your profile.");
  });
})();
