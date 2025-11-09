(() => {
  const selectors = {
    joinSection: "#joinClassSection",
    dashboard: "#classDashboard",
    classTitle: "#classTitle",
    classCode: "#classCodeDisplay",
    classTeacher: "#classTeacher",
    classGrade: "#classGrade",
    classDescription: "#classDescription",
    announcements: "#announcementList",
    topics: "#ongoingTopics",
    assignments: "#assignmentList",
    classModules: "#classModulesList",
    classModulesChip: "#classModulesChip",
    joinForm: "#joinClassForm",
    classCodeInput: "#classCode"
  };

  const copy = {
    defaultClassDescription: "Your teacher can drop announcements, assignments, and focus topics here once you join."
  };

  const getElement = selector => document.querySelector(selector);

  const setText = (selector, text) => {
    const el = getElement(selector);
    if (el) {
      el.textContent = text;
    }
  };

  const setVisibility = hasEnrollment => {
    const joinSection = getElement(selectors.joinSection);
    const dashboard = getElement(selectors.dashboard);
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
      setText(selectors.classTitle, info.title || "Your enrolled class");
      setText(selectors.classCode, `Code: ${info.code || "-"}`);
      const teacherName = info.teacherName ? `Teacher: ${info.teacherName}` : "Teacher: To be assigned";
      setText(selectors.classTeacher, teacherName);
      const gradeLabel = info.gradeLevel ? `${info.gradeLevel} class` : "Class space unlocked";
      setText(selectors.classGrade, gradeLabel);
      const description = info.description || copy.defaultClassDescription;
      setText(selectors.classDescription, description);
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
    const container = getElement(selectors.assignments);
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

  const buildLessonList = lessons => {
    const safeLessons = Array.isArray(lessons) ? lessons : [];
    const list = document.createElement("ul");
    list.className = "lesson-pill-list";

    if (!safeLessons.length) {
      const emptyItem = document.createElement("li");
      emptyItem.textContent = "Coach will add lesson focus soon.";
      list.appendChild(emptyItem);
      return list;
    }

    safeLessons.slice(0, 3).forEach(lesson => {
      const item = document.createElement("li");
      item.textContent = lesson;
      list.appendChild(item);
    });

    if (safeLessons.length > 3) {
      const more = document.createElement("li");
      more.textContent = `+${safeLessons.length - 3} more`;
      list.appendChild(more);
    }

    return list;
  };

  const renderClassModules = modules => {
    const container = getElement(selectors.classModules);
    const chip = getElement(selectors.classModulesChip);
    if (!container) {
      return;
    }

    if (!Array.isArray(modules) || !modules.length) {
      container.innerHTML = "<p class=\"muted\">Your coach hasn't assigned modules yet.</p>";
      if (chip) {
        chip.textContent = "Waiting for coach";
        chip.className = "chip";
      }
      return;
    }

    container.innerHTML = "";
    modules.forEach(module => {
      const row = document.createElement("div");
      row.className = "class-module-row";

      const info = document.createElement("div");
      info.className = "class-module-info";

      const title = document.createElement("p");
      title.className = "class-module-title";
      title.textContent = module.title || module.moduleId || "Module";

      const meta = document.createElement("p");
      meta.className = "muted";
      const metaParts = [];
      if (module.grade) {
        metaParts.push(module.grade);
      }
      if (module.number) {
        metaParts.push(`Module ${module.number}`);
      }
      meta.textContent = metaParts.join(" | ");

      info.appendChild(title);
      if (meta.textContent) {
        info.appendChild(meta);
      }
      info.appendChild(buildLessonList(module.lessons));

      const details = document.createElement("div");
      details.className = "class-module-meta";

      const dueChip = document.createElement("span");
      dueChip.className = module.dueDate ? "chip chip--info" : "chip";
      dueChip.textContent = module.dueDate ? `Due ${module.dueDate}` : "No due date";
      details.appendChild(dueChip);

      if (module.assignedAt) {
        const assigned = document.createElement("small");
        assigned.className = "muted";
        assigned.textContent = `Assigned ${module.assignedAt}`;
        details.appendChild(assigned);
      }

      if (module.link) {
        const action = document.createElement("a");
        action.href = module.link;
        action.className = "btn btn--ghost";
        action.textContent = "Open module";
        details.appendChild(action);
      }

      row.appendChild(info);
      row.appendChild(details);
      container.appendChild(row);
    });

    if (chip) {
      chip.textContent = modules.length === 1 ? "1 module" : `${modules.length} modules`;
      chip.className = "chip chip--info";
    }
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
    renderClassModules(data.classModules);
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
