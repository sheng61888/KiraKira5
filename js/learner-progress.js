(() => {
  const selectors = {
    overallBar: ".big-progress-bar span",
    overallValue: ".big-progress strong",
    overallChip: ".overall-progress .chip",
    topicsContainer: "#topicProgressList",
    motivationCard: "#motivation",
    motivationTitle: "#motivationTitle",
    motivationBody: "#motivationBody",
    downloadBtn: "#downloadReportBtn"
  };

  const updateOverall = (percent, delta) => {
    const bar = document.querySelector(selectors.overallBar);
    if (bar) {
      bar.style.width = `${Math.min(100, Math.max(0, percent))}%`;
    }
    const value = document.querySelector(selectors.overallValue);
    if (value) {
      value.textContent = `${percent}%`;
    }
    const chip = document.querySelector(selectors.overallChip);
    if (chip) {
      chip.textContent = delta >= 0 ? `+${delta}% this week` : `${delta}% this week`;
    }
  };

  const renderTopics = topics => {
    const container = document.querySelector(selectors.topicsContainer);
    if (!container) {
      return;
    }
    if (!Array.isArray(topics) || !topics.length) {
      container.innerHTML = "<p class=\"muted\">No topics underway. Start a module to see progress here.</p>";
      return;
    }
    container.innerHTML = topics
      .map(topic => {
        const percent = Math.max(0, Number(topic.percent) || 0);
        const note = topic.note || (percent === 0 ? "Module added • not started yet" : "");
        return `
        <div class="topic">
          <span>${topic.title} <strong>${percent}%</strong></span>
          <div class="meter progress-bar"><span style="width:${percent}%"></span></div>
          ${note ? `<small>${note}</small>` : ""}
        </div>`;
      })
      .join("");
  };

  const renderMotivation = motivation => {
    const card = document.querySelector(selectors.motivationCard);
    const title = document.querySelector(selectors.motivationTitle);
    const body = document.querySelector(selectors.motivationBody);
    if (!card || !title || !body) {
      return;
    }
    if (!motivation) {
      title.textContent = "Keep going!";
      body.textContent = "Your next study session will update this card.";
      return;
    }
    title.textContent = motivation.title || "Small steps, big gains";
    body.textContent = motivation.body || "Line up one focused session today to push your progress forward.";
  };

  const wireDownloadButton = reportUrl => {
    const button = document.querySelector(selectors.downloadBtn);
    if (!button) {
      return;
    }
    if (reportUrl) {
      button.onclick = () => window.open(reportUrl, "_blank");
      button.disabled = false;
    } else {
      button.onclick = null;
      button.disabled = true;
    }
  };

  const showProgressError = message => {
    const container = document.querySelector(selectors.topicsContainer);
    if (container) {
      container.innerHTML = `<p class="muted">${message}</p>`;
    }
  };

  const fetchProgress = async () => {
    const session = window.kiraLearnerSession;
    if (!session) {
      return;
    }
    const learnerId = session.ensureId();
    if (!learnerId) {
      showProgressError("Please log in to see your progress.");
      return;
    }
    try {
      const response = await session.fetch("progress");
      if (!response.ok) {
        throw new Error(`Progress request failed with status ${response.status}`);
      }
      const data = await response.json();
      updateOverall(data.overallPercent ?? 0, data.weeklyDelta ?? 0);
      renderTopics(data.topics);
      renderMotivation(data.motivation);
      wireDownloadButton(data.reportUrl);
    } catch (error) {
      console.error("Unable to load learner progress", error);
      showProgressError("Unable to load progress right now. Please refresh.");
    }
  };

  document.addEventListener("DOMContentLoaded", fetchProgress);
  document.addEventListener("kira:learner-missing", () => {
    showProgressError("Please sign in again to view progress.");
  });
})();
