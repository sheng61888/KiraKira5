(() => {
  const selectors = {
    joinSection: "#joinClassSection",
    dashboard: "#classDashboard",
    classTitle: "#classTitle",
    classCode: "#classCodeDisplay",
    announcements: "#announcementList",
    topics: "#ongoingTopics",
    assignments: "#assignmentList",
    catalogueContainer: "#modulesByGrade",
    joinForm: "#joinClassForm",
    classCodeInput: "#classCode"
  };

  const setVisibility = hasEnrollment => {
    const joinSection = document.querySelector(selectors.joinSection);
    const dashboard = document.querySelector(selectors.dashboard);
    if (joinSection) {
      joinSection.style.display = hasEnrollment ? "none" : "block";
    }
    if (dashboard) {
      dashboard.style.display = hasEnrollment ? "block" : "none";
    }
  };

  const renderClassInfo = (info, hasEnrollment) => {
    if (!hasEnrollment) {
      setVisibility(false);
      return;
    }
    setVisibility(true);
    if (info) {
      const titleEl = document.querySelector(selectors.classTitle);
      if (titleEl) {
        titleEl.textContent = info.title || "Your enrolled class";
      }
      const codeEl = document.querySelector(selectors.classCode);
      if (codeEl) {
        codeEl.textContent = `Code: ${info.code || "-"}`;
      }
    }
  };

  const renderAnnouncements = announcements => {
    const container = document.querySelector(selectors.announcements);
    if (!container) {
      return;
    }
    if (!Array.isArray(announcements) || !announcements.length) {
      container.innerHTML = "<p class=\"muted\">No announcements yet.</p>";
      return;
    }
    container.innerHTML = announcements
      .map(
        announcement => `
        <div class="activity-item">
          <div>
            <strong>${announcement.title}</strong>
            <p>${announcement.detail}</p>
          </div>
          <span>${announcement.timestamp}</span>
        </div>`
      )
      .join("");
  };

  const renderTopics = topics => {
    const container = document.querySelector(selectors.topics);
    if (!container) {
      return;
    }
    if (!Array.isArray(topics) || !topics.length) {
      container.innerHTML = "<p class=\"muted\">Coach has not assigned topics yet.</p>";
      return;
    }
    container.innerHTML = topics
      .map(
        topic => `
        <div class="task">
          <span>${topic.title} <strong>${topic.percent}%</strong></span>
          <div class="meter progress-bar"><span style="width:${topic.percent}%"></span></div>
        </div>`
      )
      .join("");
  };

  const renderAssignments = assignments => {
    const container = document.querySelector(selectors.assignments);
    if (!container) {
      return;
    }
    if (!Array.isArray(assignments) || !assignments.length) {
      container.innerHTML = "<p class=\"muted\">No assignments due.</p>";
      return;
    }
    container.innerHTML = assignments
      .map(
        assignment => `
        <div class="assignment">
          <div class="assignment-info">
            <span class="assignment-title">${assignment.title}</span>
            <span class="assignment-date">Due: ${assignment.dueDate}</span>
          </div>
          <div class="completion">
            <div class="meter completion-bar"><span style="width:${assignment.completionPercent}%"></span></div>
            <small>${assignment.status}</small>
          </div>
        </div>`
      )
      .join("");
  };

  const broadcastModules = catalogue => {
    if (!Array.isArray(catalogue)) {
      return;
    }
    window.kiraModules = catalogue;
    document.dispatchEvent(new CustomEvent("kira:modules-ready", { detail: catalogue }));
  };

  const hydrateClassPage = data => {
    if (!data) {
      setVisibility(false);
      return;
    }
    renderClassInfo(data.classInfo, data.hasEnrollment);
    renderAnnouncements(data.announcements);
    renderTopics(data.ongoingTopics);
    renderAssignments(data.assignments);
    broadcastModules(data.catalogue);
  };

  const fetchClasses = async () => {
    const session = window.kiraLearnerSession;
    if (!session) {
      return;
    }
    const learnerId = session.ensureId();
    if (!learnerId) {
      setVisibility(false);
      return;
    }
    try {
      const response = await session.fetch("classes");
      if (!response.ok) {
        throw new Error(`Classes request failed with status ${response.status}`);
      }
      const data = await response.json();
      hydrateClassPage(data);
    } catch (error) {
      console.error("Unable to load classes", error);
      setVisibility(false);
      const announcements = document.querySelector(selectors.announcements);
      if (announcements) {
        announcements.innerHTML = "<p class=\"muted\">Unable to load announcements right now.</p>";
      }
    }
  };

  const joinClass = async event => {
    event.preventDefault();
    const session = window.kiraLearnerSession;
    if (!session) {
      return;
    }
    const input = document.querySelector(selectors.classCodeInput);
    const code = input ? input.value.trim() : "";
    if (!code) {
      return;
    }
    try {
      const response = await session.fetch("classes/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ code })
      });
      if (!response.ok) {
        throw new Error(`Join class failed with status ${response.status}`);
      }
      const data = await response.json();
      hydrateClassPage(data);
      if (input) {
        input.value = "";
      }
    } catch (error) {
      console.error("Unable to join class", error);
      alert("Unable to join class. Please check the code and try again.");
    }
  };

  document.addEventListener("DOMContentLoaded", () => {
    fetchClasses();
    const form = document.querySelector(selectors.joinForm);
    if (form) {
      form.addEventListener("submit", joinClass);
    }
  });

  document.addEventListener("kira:learner-missing", () => {
    setVisibility(false);
  });
})();
