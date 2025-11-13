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
    refresh: "#refreshThread",
    profilePopover: "[data-profile-popover]",
    profilePopoverBody: "[data-profile-popover-body]"
  };

  const state = {
    threadId: null,
    cursor: null,
    replies: [],
    loading: false,
    limit: 20,
    profileCard: {
      open: false,
      currentId: null
    }
  };

  const BADGE_PREFERENCE_STORAGE_KEY = "kiraPreferredBadgeDisplay";

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

  const buildAuthorTrigger = author => {
    const name = author?.name || author?.username || "Learner";
    const identifier = (author?.learnerId || "").trim();
    if (identifier) {
      return `<button class="thread-author-link" type="button" data-profile-handle="${escapeHtml(identifier)}">${escapeHtml(name)}</button>`;
    }
    return `<span class="thread-author-link thread-author-link--disabled">${escapeHtml(name)}</span>`;
  };

  const profilePopoverRefs = {
    container: null,
    body: null,
    bound: false
  };

  const getCurrentLearnerId = () => {
    const session = getSession();
    if (session && typeof session.ensureId === "function") {
      try {
        return session.ensureId();
      } catch {
        /* ignore */
      }
    }
    return sessionStorage.getItem("currentLearnerId") || "";
  };

  const readLocalBadgePreference = () => {
    try {
      const raw = localStorage.getItem(BADGE_PREFERENCE_STORAGE_KEY);
      if (!raw) {
        return null;
      }
      try {
        const parsed = JSON.parse(raw);
        if (typeof parsed === "string") {
          return { id: parsed, label: "", style: "level" };
        }
        if (parsed && typeof parsed === "object") {
          return {
            id: parsed.id || "",
            label: parsed.label || "",
            style: parsed.style || "level"
          };
        }
      } catch {
        return { id: raw, label: "", style: "level" };
      }
    } catch {
      /* ignore */
    }
    return null;
  };

  const applyLocalBadgePreference = profile => {
    if (!profile) {
      return profile;
    }
    const learnerId = profile.learnerId || profile.learnerID || profile.LearnerId;
    const currentId = getCurrentLearnerId();
    if (learnerId && currentId && learnerId === currentId) {
      const pref = readLocalBadgePreference();
      if (pref?.label) {
        profile.featuredBadge = {
          label: pref.label,
          style: pref.style || "level"
        };
      }
    }
    return profile;
  };

  const hideProfilePopover = () => {
    if (!profilePopoverRefs.container) {
      return;
    }
    profilePopoverRefs.container.hidden = true;
    profilePopoverRefs.container.setAttribute("aria-hidden", "true");
    state.profileCard.open = false;
    state.profileCard.currentId = null;
  };

  const ensureProfilePopoverRefs = () => {
    if (!profilePopoverRefs.container) {
      profilePopoverRefs.container = getElement(selectors.profilePopover);
    }
    if (!profilePopoverRefs.body) {
      profilePopoverRefs.body = getElement(selectors.profilePopoverBody);
    }
    if (profilePopoverRefs.container && !profilePopoverRefs.bound) {
      profilePopoverRefs.container.addEventListener("click", event => {
        if (event.target.closest("[data-profile-popover-close]")) {
          hideProfilePopover();
        }
      });
      profilePopoverRefs.bound = true;
    }
    return Boolean(profilePopoverRefs.container && profilePopoverRefs.body);
  };

  const setProfilePopoverContent = html => {
    if (ensureProfilePopoverRefs()) {
      profilePopoverRefs.body.innerHTML = html;
    }
  };

  const showProfilePopover = () => {
    if (!ensureProfilePopoverRefs()) {
      return false;
    }
    profilePopoverRefs.container.hidden = false;
    profilePopoverRefs.container.setAttribute("aria-hidden", "false");
    state.profileCard.open = true;
    return true;
  };

  const formatNumber = value => {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const pluralize = (value, noun) => (value === 1 ? noun : `${noun}s`);

  const renderProfileCard = profile => {
    if (!profile) {
      return '<p class="muted">Profile unavailable.</p>';
    }
    const name = profile.name || "Learner";
    const motto = profile.motto || "Learning maths";
    const avatar = profile.avatarUrl || "/images/profile-cat.png";
    const level = formatNumber(profile.level);
    const xp = formatNumber(profile.xp);
    const rank = profile.rank || "Learner";
    const streak = formatNumber(profile.streakDays);
    const badge = profile.featuredBadge;
    const badgeHtml =
      badge && badge.label
        ? `<div class="profile-popover__badge" data-badge-style="${escapeHtml(badge.style || "level")}">${escapeHtml(badge.label)}</div>`
        : "";

    return `
      <img class="profile-popover-card__avatar" src="${escapeHtml(avatar)}" alt="${escapeHtml(name)}'s avatar">
      <h3 class="profile-popover__name" id="profilePopoverName">${escapeHtml(name)}</h3>
      <p class="profile-popover__motto">${escapeHtml(motto)}</p>
      <div class="profile-popover__stats">
        <span><strong>Level</strong>${level}</span>
        <span><strong>XP</strong>${xp}</span>
        <span><strong>Rank</strong>${escapeHtml(rank)}</span>
        <span><strong>Streak</strong>${streak} ${pluralize(streak, "day")}</span>
      </div>
      ${badgeHtml}
    `;
  };

  const fetchCommunityProfileCard = async learnerId => {
    const session = getSession();
    if (!session || !learnerId) {
      throw new Error("Missing session");
    }
    const response = await session.fetch(`community/profiles/${encodeURIComponent(learnerId)}`);
    if (!response.ok) {
      throw new Error(`Profile request failed with status ${response.status}`);
    }
    return response.json();
  };

  const openProfilePopover = async learnerId => {
    if (!learnerId) {
      return;
    }
    if (!showProfilePopover()) {
      return;
    }
    state.profileCard.currentId = learnerId;
    setProfilePopoverContent('<p class="muted">Loading profile...</p>');

    try {
      let profile = await fetchCommunityProfileCard(learnerId);
      profile = applyLocalBadgePreference(profile);
      if (state.profileCard.currentId !== learnerId) {
        return;
      }
      setProfilePopoverContent(renderProfileCard(profile));
    } catch (error) {
      console.error("Unable to load community profile", error);
      if (state.profileCard.currentId === learnerId) {
        setProfilePopoverContent('<p class="muted">Unable to load this profile right now.</p>');
      }
    }
  };

  const handleProfileTriggerClick = event => {
    const trigger = event.target.closest("[data-profile-handle]");
    if (!trigger) {
      return;
    }
    const learnerId = trigger.getAttribute("data-profile-handle");
    if (!learnerId) {
      return;
    }
    event.preventDefault();
    openProfilePopover(learnerId);
  };

  const handleProfilePopoverEscape = event => {
    if (event.key === "Escape" && state.profileCard.open) {
      hideProfilePopover();
    }
  };

  const bindProfilePopover = () => {
    document.addEventListener("click", handleProfileTriggerClick);
    document.addEventListener("keydown", handleProfilePopoverEscape);
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
      const authorTrigger = buildAuthorTrigger(thread.author);
      const created = thread.createdLabel || "Just now";
      const replies = typeof thread.replyCount === "number" ? `${thread.replyCount} replies` : "";
      meta.innerHTML = `
        <span>Posted by ${authorTrigger}</span>
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
        const authorTrigger = buildAuthorTrigger(reply.author);
        const created = reply.createdLabel || "Just now";
        const body = escapeHtml(reply.body);
        return `
          <li class="reply-item">
            <div class="reply-meta">
              ${authorTrigger}
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
    bindProfilePopover();
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
