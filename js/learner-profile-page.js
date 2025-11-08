(() => {
  const selectors = {
    profileCard: ".profile-card",
    motto: ".profile-card p",
    xpSummary: ".profile-card .xp-summary",
    nameInput: "#name",
    emailInput: "#email",
    schoolInput: "#school",
    yearInput: "#year",
    notificationList: "#notificationList"
  };

  const updateProfileCard = profile => {
    const card = document.querySelector(selectors.profileCard);
    if (!card || !profile) {
      return;
    }
    const nameHeading = card.querySelector("h2");
    if (nameHeading) {
      nameHeading.textContent = profile.name || "Learner";
    }
    const motto = card.querySelector("p");
    if (motto) {
      motto.textContent = profile.motto || "Learning one formula at a time.";
    }
    const summary = card.querySelectorAll(".xp-summary span");
    if (summary.length >= 3) {
      summary[0].innerHTML = `<strong>Level:</strong> ${profile.level ?? "-"}`;
      summary[1].innerHTML = `<strong>XP:</strong> ${profile.xp ?? 0}`;
      summary[2].innerHTML = `<strong>Rank:</strong> ${profile.rank || "Learner"}`;
    }
  };

  const updateInfoForm = (profile, contact, school) => {
    const nameField = document.querySelector(selectors.nameInput);
    if (nameField && profile?.name) {
      nameField.value = profile.name;
    }
    const emailField = document.querySelector(selectors.emailInput);
    if (emailField && contact?.email) {
      emailField.value = contact.email;
    }
    const schoolField = document.querySelector(selectors.schoolInput);
    if (schoolField && school?.school) {
      schoolField.value = school.school;
    }
    const yearField = document.querySelector(selectors.yearInput);
    if (yearField && school?.year) {
      yearField.value = school.year;
    }
  };

  const renderNotifications = notifications => {
    const list = document.querySelector(selectors.notificationList);
    if (!list) {
      return;
    }
    if (!Array.isArray(notifications) || !notifications.length) {
      list.innerHTML = "<li><div><strong>No notification prefs yet</strong><small>We’ll add options once you unlock reminders.</small></div></li>";
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
    } catch (error) {
      console.error("Unable to load learner profile", error);
      showProfileError("Unable to load profile right now. Please refresh.");
    }
  };

  document.addEventListener("DOMContentLoaded", fetchProfile);
  document.addEventListener("kira:learner-missing", () => {
    showProfileError("Please sign in to manage your profile.");
  });
})();
