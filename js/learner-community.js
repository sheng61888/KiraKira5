(() => {
  const selectors = {
    threadList: "#threadList",
    filters: "#communityFilters",
    threadStatus: "#threadStatus",
    loadMore: "#loadMoreThreads",
    form: "#conversationForm",
    trendingTags: "#trendingTags",
    scrollButton: "[data-scroll=\"#conversationForm\"]"
  };

  const state = {
    threads: [],
    cursor: null,
    loading: false,
    filters: {
      category: "",
      tag: ""
    },
    limit: 8
  };

  const getSession = () => window.kiraLearnerSession;

  const getElement = selector => document.querySelector(selector);

  const escapeHtml = text => {
    if (typeof text !== "string") {
      return "";
    }
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  };

  const setStatus = (message, isError = false) => {
    const container = getElement(selectors.threadStatus);
    if (!container) {
      return;
    }
    if (!message) {
      container.textContent = "";
      container.classList.remove("error");
      return;
    }
    container.textContent = message;
    container.classList.toggle("error", Boolean(isError));
  };

  const toggleLoadMore = () => {
    const button = getElement(selectors.loadMore);
    if (!button) {
      return;
    }
    if (state.cursor) {
      button.hidden = false;
    } else {
      button.hidden = true;
    }
  };

  const formatReplyLabel = count => {
    if (typeof count !== "number") {
      return "0 replies";
    }
    return count === 1 ? "1 reply" : `${count} replies`;
  };

  const createThreadMarkup = thread => {
    const category = thread.category || "Community";
    const tag = thread.primaryTag ? `#${thread.primaryTag}` : "";
    const lastReply = thread.lastReplyLabel || "Just now";
    const body = thread.body || "";
    const threadId = thread.threadId || "";
    const href = threadId ? `learner-thread.html?threadId=${encodeURIComponent(threadId)}` : "#";
    const safeCategory = escapeHtml(category);
    const safeTag = tag ? `<span class="chip">${escapeHtml(tag)}</span>` : "";
    const safeTitle = escapeHtml(thread.title || "Untitled conversation");
    const safeBody = escapeHtml(body);
    const safeLastReply = escapeHtml(lastReply);

    return `
      <li class="thread-item">
        <div>
          <div class="thread-tags">
            <span class="chip chip--info">${safeCategory}</span>
            ${safeTag}
          </div>
          <a href="${href}" class="thread-title">${safeTitle}</a>
          <p class="muted">${safeBody}</p>
        </div>
        <div class="thread-meta">
          <strong>${formatReplyLabel(thread.replyCount)}</strong>
          <small>Last reply &mdash; ${safeLastReply}</small>
        </div>
      </li>
    `;
  };

  const renderThreads = threads => {
    const list = getElement(selectors.threadList);
    if (!list) {
      return;
    }

    if (!Array.isArray(threads) || !threads.length) {
      list.innerHTML = `
        <li class="thread-item">
          <div>
            <p class="muted">No conversations yet. Be the first to post!</p>
          </div>
        </li>
      `;
      toggleLoadMore();
      return;
    }

    list.innerHTML = threads.map(createThreadMarkup).join("");
    toggleLoadMore();
  };

  const renderTags = tags => {
    const container = getElement(selectors.trendingTags);
    if (!container) {
      return;
    }

    if (!Array.isArray(tags) || !tags.length) {
      container.innerHTML = "<span class=\"topic-chip\">#loading</span>";
      return;
    }

    container.innerHTML = tags
      .map(tag => {
        const slug = tag.slug || tag.label || "";
        const label = tag.label || tag.slug || "";
        const safeSlug = escapeHtml(slug);
        const safeLabel = escapeHtml(label);
        return `<button type="button" class="topic-chip" data-tag="${safeSlug}">#${safeLabel}</button>`;
      })
      .join("");
  };

  const setActiveFilter = () => {
    const container = getElement(selectors.filters);
    if (!container) {
      return;
    }
    container.querySelectorAll("button[data-category]").forEach(button => {
      const category = button.dataset.category || "";
      const isActive = category === (state.filters.category || "");
      button.classList.toggle("chip--info", isActive);
    });

    const tagsContainer = getElement(selectors.trendingTags);
    if (tagsContainer) {
      tagsContainer.querySelectorAll("[data-tag]").forEach(tagEl => {
        const currentTag = tagEl.getAttribute("data-tag") || "";
        tagEl.classList.toggle("topic-chip--active", currentTag === (state.filters.tag || ""));
      });
    }
  };

  const buildQueryString = () => {
    const params = new URLSearchParams();
    if (state.filters.category) {
      params.set("category", state.filters.category);
    }
    if (state.filters.tag) {
      params.set("tag", state.filters.tag);
    }
    if (state.cursor) {
      params.set("cursor", state.cursor);
    }
    params.set("limit", String(state.limit));
    return params.toString();
  };

  const fetchThreads = async (reset = false) => {
    const session = getSession();
    if (!session) {
      setStatus("Missing learner session.", true);
      return;
    }

    if (state.loading) {
      return;
    }

    state.loading = true;
    setStatus(reset ? "Loading conversations..." : "");

    if (reset) {
      state.cursor = null;
    }

    try {
      const query = buildQueryString();
      const response = await session.fetch(`community/threads?${query}`);
      if (!response.ok) {
        throw new Error(`Community threads request failed with status ${response.status}`);
      }
      const payload = await response.json();
      const threads = Array.isArray(payload.threads) ? payload.threads : [];
      state.cursor = payload.nextCursor || null;
      state.threads = reset ? threads : state.threads.concat(threads);
      renderThreads(state.threads);
      renderTags(payload.trendingTags);
      setActiveFilter();
      setStatus("");
    } catch (error) {
      console.error("Unable to load community threads", error);
      setStatus("Unable to load conversations right now.", true);
    } finally {
      state.loading = false;
    }
  };

  const handleFilterClick = event => {
    const button = event.target.closest("button[data-category]");
    if (!button) {
      return;
    }
    const value = button.dataset.category || "";
    state.filters.category = value;
    fetchThreads(true);
  };

  const handleTagClick = event => {
    const target = event.target.closest("[data-tag]");
    if (!target) {
      return;
    }
    const tag = target.getAttribute("data-tag") || "";
    state.filters.tag = tag === state.filters.tag ? "" : tag;
    fetchThreads(true);
  };

  const handleLoadMore = () => {
    if (!state.cursor) {
      return;
    }
    fetchThreads(false);
  };

  const disableForm = (form, disabled) => {
    if (!form) {
      return;
    }
    const button = form.querySelector("button[type='submit']");
    if (button) {
      button.disabled = disabled;
      button.textContent = disabled ? "Posting..." : "Post to community";
    }
  };

  const prependThread = thread => {
    if (!thread || !thread.title) {
      return;
    }
    state.threads = [thread, ...state.threads];
    renderThreads(state.threads);
  };

  const handleFormSubmit = async event => {
    event.preventDefault();
    const form = event.currentTarget;
    const session = getSession();
    if (!session) {
      alert("Missing learner session. Please refresh.");
      return;
    }

    const data = new FormData(form);
    const payload = {
      topic: (data.get("topic") || "").toString(),
      category: (data.get("category") || "").toString(),
      formLevel: (data.get("category") || "").toString(),
      message: (data.get("message") || "").toString(),
      tag: (data.get("tag") || "").toString()
    };

    disableForm(form, true);

    try {
      const response = await session.fetch("community/threads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        throw new Error(`Create thread failed with status ${response.status}`);
      }
      const thread = await response.json();
      prependThread(thread);
      form.reset();
      state.filters.category = "";
      state.filters.tag = "";
      setActiveFilter();
      setStatus("Thread posted!");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Unable to create thread", error);
      alert("Unable to post thread right now. Please try again.");
    } finally {
      disableForm(form, false);
      setTimeout(() => setStatus(""), 2500);
    }
  };

  const bindEvents = () => {
    const filters = getElement(selectors.filters);
    if (filters) {
      filters.addEventListener("click", handleFilterClick);
    }

    const tags = getElement(selectors.trendingTags);
    if (tags) {
      tags.addEventListener("click", handleTagClick);
    }

    const loadMore = getElement(selectors.loadMore);
    if (loadMore) {
      loadMore.addEventListener("click", handleLoadMore);
    }

    const form = getElement(selectors.form);
    if (form) {
      form.addEventListener("submit", handleFormSubmit);
    }

    const scrollButton = document.querySelector(selectors.scrollButton);
    if (scrollButton) {
      scrollButton.addEventListener("click", () => {
        const target = document.querySelector("#conversationForm");
        if (target) {
          target.scrollIntoView({ behavior: "smooth" });
        }
      });
    }
  };

  document.addEventListener("DOMContentLoaded", () => {
    bindEvents();
    fetchThreads(true);
  });
})();




