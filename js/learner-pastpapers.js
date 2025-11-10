(() => {
  const selectors = {
    list: "#papersList",
    type: "#subject",
    year: "#year",
    checklist: "#pastChecklist",
    tip: "#pastTip",
    timerButton: "#timerButton",
    timerDuration: "#timerDuration"
  };

  const fallbackChecklist = [
    { title: "Complete 2 timed papers", detail: "Recommended pace: 1 per week" },
    { title: "Review marking scheme", detail: "Highlight careless mistakes" },
    { title: "Log reflections", detail: "Capture improvements for next time", primary: true }
  ];

  const fallbackTip = {
    badge: "After each paper",
    body: "Snap a photo of one \"aha\" solution and drop it into your learning journal.",
    title: "Practice tip"
  };

  const timerConfig = {
    defaultDurationMinutes: 90,
    maxSessions: 5
  };

  const timerState = {
    running: false,
    intervalId: null,
    duration: timerConfig.defaultDurationMinutes * 60,
    remaining: 0
  };

  const timerSessions = [];
  let activeTip = null;

  const formatTimer = seconds => {
    const safeSeconds = Math.max(0, seconds);
    const minutes = Math.floor(safeSeconds / 60);
    const remainder = safeSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainder.toString().padStart(2, "0")}`;
  };

  const formatSessionDuration = seconds => {
    const safeSeconds = Math.max(1, Math.round(seconds));
    const minutes = Math.floor(safeSeconds / 60);
    const remainder = safeSeconds % 60;
    if (!minutes) {
      return `${remainder}s`;
    }
    if (!remainder) {
      return `${minutes}m`;
    }
    return `${minutes}m ${remainder}s`;
  };

  const formatSessionTimestamp = date => {
    try {
      return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    } catch (error) {
      return date.toISOString().split("T")[1]?.slice(0, 5) || "Just now";
    }
  };

  const formatDurationLabel = minutes => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const hoursPart = hrs ? `${hrs}h` : "";
    const minutesPart = mins ? `${mins}m` : "";
    return `${hoursPart}${hrs && mins ? " " : ""}${minutesPart}`.trim();
  };

  const getSelectedDurationMinutes = () => {
    const select = document.querySelector(selectors.timerDuration);
    if (!select) {
      return timerConfig.defaultDurationMinutes;
    }
    const value = Number(select.value);
    if (!Number.isFinite(value) || value <= 0) {
      return timerConfig.defaultDurationMinutes;
    }
    return value;
  };

  const setDurationPickerDisabled = disabled => {
    const select = document.querySelector(selectors.timerDuration);
    if (select) {
      select.disabled = !!disabled;
    }
  };

  const renderTimerLog = () => {
    if (!timerSessions.length) {
      return "";
    }
    const recent = timerSessions.slice(-3).reverse();
    const items = recent
      .map(
        session => `
        <li>
          <strong>${formatSessionDuration(session.durationSeconds)}</strong>
          <span>${session.label}</span>
          <small>${formatSessionTimestamp(session.timestamp)}</small>
        </li>`
      )
      .join("");
    return `
      <div class="timer-log">
        <p class="timer-log__title">Recent timer sessions</p>
        <ul>${items}</ul>
      </div>`;
  };

  const updateTimerButton = () => {
    const button = document.querySelector(selectors.timerButton);
    if (!button) {
      return;
    }
    if (timerState.running) {
      button.textContent = `Stop (${formatTimer(timerState.remaining)})`;
      button.setAttribute("aria-pressed", "true");
    } else {
      const duration = getSelectedDurationMinutes();
      button.textContent = `Start ${formatDurationLabel(duration)} timer`;
      button.removeAttribute("aria-pressed");
    }
  };

  const recordTimerSession = reason => {
    const elapsedSeconds = timerState.duration - timerState.remaining;
    const safeElapsed = Math.max(1, Math.round(elapsedSeconds));
    timerSessions.push({
      durationSeconds: safeElapsed,
      label: reason === "complete" ? "Completed full session" : "Stopped early",
      timestamp: new Date()
    });
    if (timerSessions.length > timerConfig.maxSessions) {
      timerSessions.shift();
    }
    renderTip();
  };

  const resetTimerState = () => {
    timerState.running = false;
    timerState.intervalId = null;
    timerState.remaining = 0;
  };

  const stopTimer = reason => {
    if (!timerState.running) {
      return;
    }
    window.clearInterval(timerState.intervalId);
    recordTimerSession(reason);
    resetTimerState();
    setDurationPickerDisabled(false);
    updateTimerButton();
  };

  const tickTimer = () => {
    timerState.remaining -= 1;
    if (timerState.remaining <= 0) {
      timerState.remaining = 0;
      stopTimer("complete");
      return;
    }
    updateTimerButton();
  };

  const startTimer = () => {
    if (timerState.running) {
      stopTimer("manual");
      return;
    }
    const durationMinutes = getSelectedDurationMinutes();
    timerState.duration = durationMinutes * 60;
    timerState.remaining = timerState.duration;
    timerState.running = true;
    timerState.intervalId = window.setInterval(tickTimer, 1000);
    setDurationPickerDisabled(true);
    updateTimerButton();
  };

  const wireTimerButton = () => {
    const button = document.querySelector(selectors.timerButton);
    if (!button) {
      return;
    }
    button.addEventListener("click", () => {
      if (timerState.running) {
        stopTimer("manual");
      } else {
        startTimer();
      }
    });
    updateTimerButton();

    const select = document.querySelector(selectors.timerDuration);
    if (select) {
      select.addEventListener("change", () => {
        if (!timerState.running) {
          updateTimerButton();
        }
      });
    }
  };

  const getFilters = () => {
    const type = document.querySelector(selectors.type)?.value || "";
    const year = document.querySelector(selectors.year)?.value || "";
    return { type, year };
  };

  const safeResourceUrl = resource => {
    if (!resource) {
      return "#";
    }
    try {
      return encodeURI(resource);
    } catch (error) {
      console.warn("Unable to encode resource url", resource, error);
      return resource;
    }
  };

  const renderPapers = papers => {
    const container = document.querySelector(selectors.list);
    if (!container) {
      return;
    }
    if (!Array.isArray(papers) || !papers.length) {
      container.innerHTML = "<p class=\"muted\">No papers match these filters yet.</p>";
      return;
    }
    container.innerHTML = papers
      .map(paper => {
        const title = paper.title || "Past paper";
        const details = paper.details || "";
        const resourceUrl = safeResourceUrl(paper.resource);
        return `
        <div class="paper-row">
          <div class="paper-info">
            <span class="paper-title">${title}</span>
            <span class="paper-details">${details}</span>
          </div>
          <div class="paper-actions">
            <button class="btn-view" type="button" data-link="${resourceUrl}">View</button>
            <a href="${resourceUrl}" download>
              <button class="btn-download" type="button">Download</button>
            </a>
          </div>
        </div>`;
      })
      .join("");

    container.querySelectorAll(".btn-view").forEach(button => {
      button.addEventListener("click", () => {
        const link = button.getAttribute("data-link");
        if (link) {
          window.open(link, "_blank");
        }
      });
    });
  };

  const renderChecklist = checklist => {
    const list = document.querySelector(selectors.checklist);
    if (!list) {
      return;
    }
    if (!Array.isArray(checklist) || !checklist.length) {
      list.innerHTML = "<li><div><strong>No checklist items.</strong><small>Add a paper to generate suggestions.</small></div></li>";
      return;
    }
    list.innerHTML = checklist
      .map(
        item => `
        <li>
          <div>
            <strong>${item.title}</strong>
            <small>${item.detail}</small>
          </div>
        </li>`
      )
      .join("");
  };

  const renderTip = tip => {
    if (typeof tip !== "undefined") {
      activeTip = tip && tip.body ? tip : null;
    }
    const tipCard = document.querySelector(selectors.tip);
    if (!tipCard) {
      return;
    }

    const payload = activeTip;
    const titleHtml = payload?.title ? `<strong>${payload.title}</strong>` : "";
    const bodyHtml = payload?.body
      ? `<p>${payload.body}</p>`
      : "<p>Complete a paper to unlock fresh tips.</p>";

    tipCard.innerHTML = `${titleHtml}${bodyHtml}${renderTimerLog()}`;

    const badge = tipCard.previousElementSibling?.querySelector(".chip");
    if (!badge) {
      return;
    }
    if (timerSessions.length) {
      const last = timerSessions[timerSessions.length - 1];
      badge.textContent = `Timer logged · ${formatSessionDuration(last.durationSeconds)}`;
      return;
    }
    if (payload?.badge) {
      badge.textContent = payload.badge;
    } else {
      badge.textContent = "Practice ready";
    }
  };

  const showError = message => {
    const container = document.querySelector(selectors.list);
    if (container) {
      container.innerHTML = `<p class="muted">${message}</p>`;
    }
  };

  const getLocalLibrary = () => {
    const library = window.kiraPastPaperLibrary;
    return Array.isArray(library) ? library : [];
  };

  const getLocalChecklist = () => {
    const checklist = window.kiraPastPaperChecklist;
    return Array.isArray(checklist) && checklist.length ? checklist : fallbackChecklist;
  };

  const getLocalTip = () => {
    const tip = window.kiraPastPaperTip;
    if (tip && tip.body) {
      return tip;
    }
    return fallbackTip;
  };

  const filterLocalPapers = filters => {
    return getLocalLibrary().filter(paper => {
      if (filters.type && paper.type !== filters.type) {
        return false;
      }
      if (filters.year && paper.year !== filters.year) {
        return false;
      }
      return true;
    });
  };

  const renderFromLocalLibrary = filters => {
    const papers = filterLocalPapers(filters);
    renderPapers(papers);
    renderChecklist(getLocalChecklist());
    renderTip(getLocalTip());
    return papers.length > 0;
  };

  const handleFetchFailure = filters => {
    const rendered = renderFromLocalLibrary(filters);
    if (!rendered) {
      showError("Unable to load past papers right now. Please refresh.");
    }
  };

  const fetchPastPapers = async () => {
    const filters = getFilters();
    const session = window.kiraLearnerSession;
    if (!session) {
      renderFromLocalLibrary(filters);
      return;
    }
    const learnerId = session.ensureId();
    if (!learnerId) {
      handleFetchFailure(filters);
      return;
    }
    const query = new URLSearchParams(
      Object.entries(filters).reduce((acc, [key, value]) => {
        if (value) {
          acc[key] = value;
        }
        return acc;
      }, {})
    );
    try {
      const response = await session.fetch(`pastpapers${query.toString() ? `?${query}` : ""}`);
      if (!response.ok) {
        throw new Error(`Past papers request failed with status ${response.status}`);
      }
      const data = await response.json();
      renderPapers(data.papers);
      renderChecklist(data.checklist);
      renderTip(data.tip);
    } catch (error) {
      console.error("Unable to load past papers", error);
      handleFetchFailure(filters);
    }
  };

  const wireFilters = () => {
    [selectors.type, selectors.year].forEach(selector => {
      const select = document.querySelector(selector);
      if (select) {
        select.addEventListener("change", fetchPastPapers);
      }
    });
  };

  document.addEventListener("DOMContentLoaded", () => {
    wireFilters();
    wireTimerButton();
    fetchPastPapers();
  });

  document.addEventListener("kira:learner-missing", () => {
    renderFromLocalLibrary(getFilters());
  });
})();
