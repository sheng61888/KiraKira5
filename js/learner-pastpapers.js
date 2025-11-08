(() => {
  const selectors = {
    list: "#papersList",
    type: "#subject",
    year: "#year",
    topic: "#topic",
    checklist: "#pastChecklist",
    tip: "#pastTip"
  };

  const getFilters = () => {
    const type = document.querySelector(selectors.type)?.value || "";
    const year = document.querySelector(selectors.year)?.value || "";
    const topic = document.querySelector(selectors.topic)?.value || "";
    return { type, year, topic };
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
      .map(
        paper => `
        <div class="paper-row">
          <div class="paper-info">
            <span class="paper-title">${paper.title}</span>
            <span class="paper-details">${paper.details}</span>
          </div>
          <div class="paper-actions">
            <button class="btn-view" type="button" data-link="${paper.resource}">View</button>
            <a href="${paper.resource}" download>
              <button class="btn-download" type="button">Download</button>
            </a>
          </div>
        </div>`
      )
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
      .map(item => {
        const buttonClass = item.primary ? "btn btn--primary" : "btn btn--ghost";
        return `
          <li>
            <div>
              <strong>${item.title}</strong>
              <small>${item.detail}</small>
            </div>
            <button class="${buttonClass}" type="button">${item.primary ? "Start" : "Open"}</button>
          </li>`;
      })
      .join("");
  };

  const renderTip = tip => {
    const tipCard = document.querySelector(selectors.tip);
    if (!tipCard) {
      return;
    }
    if (!tip) {
      tipCard.innerHTML = "<p>Complete a paper to unlock fresh tips.</p>";
      return;
    }
    tipCard.innerHTML = `<p>${tip.body}</p>`;
    const badge = tipCard.previousElementSibling?.querySelector(".chip");
    if (badge && tip.badge) {
      badge.textContent = tip.badge;
    }
  };

  const showError = message => {
    const container = document.querySelector(selectors.list);
    if (container) {
      container.innerHTML = `<p class="muted">${message}</p>`;
    }
  };

  const fetchPastPapers = async () => {
    const session = window.kiraLearnerSession;
    if (!session) {
      return;
    }
    const learnerId = session.ensureId();
    if (!learnerId) {
      showError("Please log in to see past papers.");
      return;
    }
    const filters = getFilters();
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
      showError("Unable to load past papers right now. Please refresh.");
    }
  };

  const wireFilters = () => {
    [selectors.type, selectors.year, selectors.topic].forEach(selector => {
      const select = document.querySelector(selector);
      if (select) {
        select.addEventListener("change", fetchPastPapers);
      }
    });
  };

  document.addEventListener("DOMContentLoaded", () => {
    wireFilters();
    fetchPastPapers();
  });

  document.addEventListener("kira:learner-missing", () => {
    showError("Please sign in to access past papers.");
  });
})();
