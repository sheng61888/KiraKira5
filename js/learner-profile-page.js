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
    notificationList: "#notificationList",
    avatarOptions: "[data-avatar-options]",
    avatarStatus: "[data-avatar-status]",
    editMottoBtn: "#editMottoBtn",
    editInfoBtn: "#editInfoBtn",
    infoForm: "#personalInfoForm",
    infoActions: "[data-info-actions]",
    introToggle: "#introVideosToggle",
    introLabel: "#introVideosLabel",
    introHint: "#introVideosHint",
    introStatus: "[data-intro-status]"
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
    mission: null
  };

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
    if (summary.length >= 3) {
      summary[0].innerHTML = `<strong>Level:</strong> ${profile.level ?? "-"}`;
      summary[1].innerHTML = `<strong>XP:</strong> ${profile.xp ?? 0}`;
      summary[2].innerHTML = `<strong>Rank:</strong> ${profile.rank || "Learner"}`;
    }
    state.profile.name = profile.name || state.profile.name;
    setProfileImage(profile.avatarUrl);
    selectAvatarOption(profile.avatarUrl);
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

  const renderNotifications = notifications => {
    const list = document.querySelector(selectors.notificationList);
    if (!list) {
      return;
    }
    if (!Array.isArray(notifications) || !notifications.length) {
      list.innerHTML = "<li><div><strong>No notification prefs yet</strong><small>We'll add options once you unlock reminders.</small></div></li>";
      return;
    }
    list.innerHTML = notifications
      .map(pref => {
        const buttonClass = pref.primary ? "btn btn--primary" : "btn btn--ghost";
        const actionLabel = pref.primary ? "Edit" : "Toggle";
        return `
          <li>
            <div>
              <strong>${pref.title}</strong>
              <small>${pref.detail}</small>
            </div>
            <button class="${buttonClass}" type="button">${actionLabel}</button>
          </li>`;
      })
      .join("");
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
    renderNotifications(data.notifications);
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

  const checkPasswordResetStatus = async () => {
    const email = state.profile.email;
    if (!email) return;

    try {
      const response = await fetch(`/api/passwordreset/status/${encodeURIComponent(email)}`);
      const result = await response.json();

      const section = document.querySelector("#passwordResetSection");
      if (!section) return;

      if (result.success && result.status === "Approved") {
        section.innerHTML = `
          <p class="muted">Your password reset has been approved. Set your new password:</p>
          <div class="form-group">
            <label for="newPassword">New Password</label>
            <input id="newPassword" type="password" placeholder="Enter new password">
          </div>
          <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <input id="confirmPassword" type="password" placeholder="Confirm new password">
          </div>
          <button class="btn btn--primary" type="button" id="submitPasswordBtn">Submit New Password</button>
        `;
        document.querySelector("#submitPasswordBtn").addEventListener("click", () => submitNewPassword(result.requestId));
      } else if (result.success && result.status === "Pending") {
        section.innerHTML = `<p class="muted">Password reset request pending admin approval</p>`;
      } else {
        section.innerHTML = `
          <p class="muted">Request a password reset from admin</p>
          <button class="btn btn--primary" type="button" id="requestResetBtn">Request Password Reset</button>
        `;
        document.querySelector("#requestResetBtn").addEventListener("click", requestPasswordReset);
      }
    } catch (error) {
      console.error("Error checking reset status", error);
    }
  };

  const requestPasswordReset = async () => {
    const email = state.profile.email;
    if (!email) {
      alert("Email not found. Please refresh the page.");
      return;
    }

    try {
      const response = await fetch("/api/passwordreset/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const result = await response.json();
      if (result.success) {
        alert("Password reset request submitted. Please wait for admin approval.");
        checkPasswordResetStatus();
      } else {
        alert("Failed to submit request: " + result.message);
      }
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const submitNewPassword = async requestId => {
    const newPassword = document.querySelector("#newPassword").value;
    const confirmPassword = document.querySelector("#confirmPassword").value;

    if (!newPassword || !confirmPassword) {
      alert("Please fill in both password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const response = await fetch("/api/passwordreset/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, newPassword })
      });

      const result = await response.json();
      if (result.success) {
        alert("Password updated successfully!");
        checkPasswordResetStatus();
      } else {
        alert("Failed to update password: " + result.message);
      }
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const fetchProfile = async () => {
    const session = window.kiraLearnerSession;
    if (!session) {
      return;
    }
    const learnerId = session.ensureId();
    if (!learnerId) {
      showProfileError("Please log in again to view your profile.");
      return;
    }
    try {
      const response = await session.fetch("profile");
      if (!response.ok) {
        throw new Error(`Profile request failed with status ${response.status}`);
      }
      const data = await response.json();
      updateProfileCard(data.profile);
      updateInfoForm(data.profile, data.contact, data.school);
      renderNotifications(data.notifications);
      broadcastBadges(data.badges);
      state.mission = data.mission || state.mission;
      renderStudyPreferences(state.mission);
      checkPasswordResetStatus();
    } catch (error) {
      console.error("Unable to load learner profile", error);
      showProfileError("Unable to load profile right now. Please refresh.");
    }
  };

  document.addEventListener("DOMContentLoaded", () => {
    bindAvatarPicker();
    bindMottoEditor();
    bindInfoEditor();
    bindStudyPreferenceToggle();
    renderStudyPreferences(state.mission, { skipStatus: true });
    fetchProfile();
  });

  setInterval(checkPasswordResetStatus, 30000);
  document.addEventListener("kira:learner-missing", () => {
    showProfileError("Please sign in to manage your profile.");
  });
})();
