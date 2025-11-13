(() => {
  const selectors = {
    overallBar: ".big-progress-bar span",
    overallValue: ".big-progress strong",
    overallChip: ".overall-progress .chip",
    topicsContainer: "#topicProgressList",
    checkpointsList: "#checkpointList",
    motivationCard: "#motivation"
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

  const renderCheckpoints = checkpoints => {
    const list = document.querySelector(selectors.checkpointsList);
    if (!list) {
      return;
    }
    if (!Array.isArray(checkpoints) || !checkpoints.length) {
      list.innerHTML = "<li><div><strong>No checkpoints yet</strong><small>Complete a lesson to get recommended next steps.</small></div></li>";
      return;
    }
    list.innerHTML = checkpoints
      .map(checkpoint => {
        const buttonClass = checkpoint.primary ? "btn btn--primary" : "btn btn--ghost";
        return `
          <li>
            <div>
              <strong>${checkpoint.title}</strong>
              <small>${checkpoint.note || ""}</small>
            </div>
            <button class="${buttonClass}" type="button">${checkpoint.cta || "Open"}</button>
          </li>`;
      })
      .join("");
  };

  const renderMotivation = motivation => {
    const card = document.querySelector(selectors.motivationCard);
    if (!card) {
      return;
    }
    const body = card.querySelector(".motivation__body") || card;
    if (!motivation) {
      body.innerHTML = "<h2>Keep going!</h2><p>Your next study session will update this card.</p>";
      return;
    }
    body.innerHTML = `<h2>${motivation.title}</h2><p>${motivation.body}</p>`;
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
      renderCheckpoints(data.checkpoints);
      renderMotivation(data.motivation);
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
