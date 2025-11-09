(() => {
  const selectors = {
    title: "#threadTitle",
    body: "#threadBody",
    meta: "#threadMeta",
    tags: "#threadTags",
    replyList: "#replyList",
    replyStatus: "#replyStatus",
    replyForm: "#replyForm",
    loadMore: "#loadMoreReplies",
    refresh: "#refreshThread"
  };

  const state = {
    threadId: null,
    cursor: null,
    replies: [],
    loading: false,
    limit: 20
  };

  const getSession = () => window.kiraLearnerSession;

  const getQueryThreadId = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get("threadId");
  };

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
    const container = getElement(selectors.replyStatus);
    if (!container) {
      return;
    }
    container.textContent = message || "";
    container.classList.toggle("error", Boolean(isError));
  };

  const toggleLoadMore = () => {
    const button = getElement(selectors.loadMore);
    if (!button) {
      return;
    }
    button.hidden = !state.cursor;
  };

  const renderThread = thread => {
    const title = getElement(selectors.title);
    const body = getElement(selectors.body);
    const meta = getElement(selectors.meta);
    const tags = getElement(selectors.tags);

    if (title) {
      title.textContent = thread.title || "Community conversation";
    }
    if (body) {
      body.textContent = thread.body || "No description provided.";
    }
    if (tags) {
      const safeCategory = escapeHtml(thread.category || "Community");
      const safeTag = thread.primaryTag ? `<span class="chip">#${escapeHtml(thread.primaryTag)}</span>` : "";
      tags.innerHTML = `
        <span class="chip chip--info">${safeCategory}</span>
        ${safeTag}
      `;
    }
    if (meta) {
      const author = thread.author?.name || thread.author?.username || "Learner";
      const created = thread.createdLabel || "Just now";
      const replies = typeof thread.replyCount === "number" ? `${thread.replyCount} replies` : "";
      meta.innerHTML = `
        <span>Posted by ${escapeHtml(author)}</span>
        <span>${escapeHtml(created)}</span>
        ${replies ? `<span>${escapeHtml(replies)}</span>` : ""}
      `;
    }
  };

  const renderReplies = replies => {
    const list = getElement(selectors.replyList);
    if (!list) {
      return;
    }

    if (!Array.isArray(replies) || !replies.length) {
      list.innerHTML = `
        <li class="reply-item">
          <p class="muted">No replies yet. Be the first to share a tip!</p>
        </li>
      `;
      toggleLoadMore();
      return;
    }

    list.innerHTML = replies
      .map(reply => {
        const author = reply.author?.name || reply.author?.username || "Learner";
        const created = reply.createdLabel || "Just now";
        const body = escapeHtml(reply.body);
        return `
          <li class="reply-item">
            <div class="reply-meta">
              <strong>${escapeHtml(author)}</strong>
              <small>${escapeHtml(created)}</small>
            </div>
            <p>${body}</p>
          </li>
        `;
      })
      .join("");

    toggleLoadMore();
  };

  const buildDetailQuery = () => {
    const params = new URLSearchParams();
    if (state.cursor) {
      params.set("cursor", state.cursor);
    }
    params.set("limit", String(state.limit));
    const query = params.toString();
    return query ? `?${query}` : "";
  };

  const fetchThreadDetail = async reset => {
    const session = getSession();
    if (!session || !state.threadId) {
      setStatus("Missing learner session.", true);
      return;
    }

    if (state.loading) {
      return;
    }

    state.loading = true;
    setStatus(reset ? "Loading thread..." : "");

    if (reset) {
      state.cursor = null;
    }

    try {
      const query = buildDetailQuery();
      const response = await session.fetch(`community/threads/${state.threadId}${query}`);
      if (!response.ok) {
        throw new Error(`Thread detail failed with status ${response.status}`);
      }
      const payload = await response.json();
      state.cursor = payload.nextCursor || null;
      if (payload.thread) {
        renderThread(payload.thread);
      }
      const replies = Array.isArray(payload.replies) ? payload.replies : [];
      state.replies = reset ? replies : state.replies.concat(replies);
      renderReplies(state.replies);
      setStatus("");
    } catch (error) {
      console.error("Unable to load thread detail", error);
      setStatus("Unable to load this conversation right now.", true);
    } finally {
      state.loading = false;
    }
  };

  const prependReply = reply => {
    if (!reply || !reply.body) {
      return;
    }
    if (!Array.isArray(state.replies) || !state.replies.length) {
      state.replies = [reply];
    } else {
      state.replies = [reply, ...state.replies];
    }
    renderReplies(state.replies);
  };

  const handleReplySubmit = async event => {
    event.preventDefault();
    const form = event.currentTarget;
    const session = getSession();
    if (!session || !state.threadId) {
      alert("Missing learner session. Please refresh.");
      return;
    }

    const data = new FormData(form);
    const message = (data.get("message") || "").toString().trim();
    if (!message) {
      return;
    }

    const button = form.querySelector("button[type='submit']");
    if (button) {
      button.disabled = true;
      button.textContent = "Posting...";
    }

    try {
      const response = await session.fetch(`community/threads/${state.threadId}/replies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message })
      });
      if (!response.ok) {
        throw new Error(`Reply failed with status ${response.status}`);
      }
      const reply = await response.json();
      prependReply(reply);
      form.reset();
      setStatus("Reply posted!");
      setTimeout(() => setStatus(""), 2000);
    } catch (error) {
      console.error("Unable to post reply", error);
      alert("Unable to post reply right now. Please try again.");
    } finally {
      if (button) {
        button.disabled = false;
        button.textContent = "Post reply";
      }
    }
  };

  const handleLoadMoreReplies = () => {
    if (!state.cursor) {
      return;
    }
    fetchThreadDetail(false);
  };

  const bindEvents = () => {
    const form = getElement(selectors.replyForm);
    if (form) {
      form.addEventListener("submit", handleReplySubmit);
    }

    const loadMore = getElement(selectors.loadMore);
    if (loadMore) {
      loadMore.addEventListener("click", handleLoadMoreReplies);
    }

    const refresh = getElement(selectors.refresh);
    if (refresh) {
      refresh.addEventListener("click", () => fetchThreadDetail(true));
    }
  };

  document.addEventListener("DOMContentLoaded", () => {
    bindEvents();
    const threadIdParam = getQueryThreadId();
    const numericId = parseInt(threadIdParam || "", 10);
    if (!Number.isFinite(numericId) || numericId <= 0) {
      setStatus("Thread ID missing. Return to the community feed.", true);
      return;
    }
    state.threadId = String(numericId);
    fetchThreadDetail(true);
  });
})();
