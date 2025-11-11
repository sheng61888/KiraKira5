(() => {
  const isNumber = value => typeof value === "number" && Number.isFinite(value);

  window.kiraActiveModules = Array.isArray(window.kiraActiveModules) ? window.kiraActiveModules : [];

  const toIsoString = value => {
    if (value instanceof Date) {
      return value.toISOString();
    }
    if (typeof value === "string" && value.trim().length) {
      return value.trim();
    }
    return new Date().toISOString();
  };

  const postLearnerPayload = async (segment, payload) => {
    const session = window.kiraLearnerSession;
    if (!session) {
      return null;
    }
    try {
      const response = await session.fetch(segment, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        throw new Error(`Activity request failed with status ${response.status}`);
      }
      const data = await response.json();
      if (data?.streak) {
        document.dispatchEvent(new CustomEvent("kira:streak-updated", { detail: data.streak }));
      }
      if (Array.isArray(data?.activeModules)) {
        window.kiraActiveModules = data.activeModules;
        document.dispatchEvent(
          new CustomEvent("kira:modules-ready", {
            detail: {
              catalogue: window.kiraModules || [],
              activeModules: data.activeModules
            }
          })
        );
      }
      return data;
    } catch (error) {
      console.error("[kiraActivity] Unable to sync activity", error);
      return null;
    }
  };

  const logModuleQuiz = async (options = {}) => {
    const moduleId = (options.moduleId || "").trim();
    const unitId = (options.unitId || "").trim();
    if (!moduleId || !unitId) {
      return null;
    }
    const payload = {
      moduleId,
      unitId
    };
    if (isNumber(options.scorePercent)) {
      payload.scorePercent = Math.max(0, Math.min(100, Math.round(options.scorePercent)));
    }
    if (isNumber(options.durationSeconds)) {
      payload.durationSeconds = Math.max(1, Math.round(options.durationSeconds));
    }
    if (isNumber(options.xpAwarded)) {
      payload.xpAwarded = Math.max(0, Math.round(options.xpAwarded));
    }
    payload.completedAt = toIsoString(options.completedAt);
    return postLearnerPayload("modules/quizzes", payload);
  };

  const logModuleProgress = async (options = {}) => {
    const moduleId = (options.moduleId || "").trim();
    const unitId = (options.unitId || "").trim();
    if (!moduleId || !unitId) {
      return null;
    }
    const payload = {
      moduleId,
      unitId,
      status: (options.status || "completed").trim()
    };
    if (isNumber(options.scorePercent)) {
      payload.scorePercent = Math.max(0, Math.min(100, Math.round(options.scorePercent)));
    }
    if (isNumber(options.durationSeconds)) {
      payload.durationSeconds = Math.max(1, Math.round(options.durationSeconds));
    }
    return postLearnerPayload("modules/progress", payload);
  };

  const logPastPaper = async (options = {}) => {
    const paperTitle = (options.paperTitle || "").trim();
    if (!paperTitle) {
      return null;
    }
    const payload = {
      paperTitle,
      paperSlug: (options.paperSlug || "").trim(),
      mode: (options.mode || "timed").trim()
    };
    const durationMinutes = isNumber(options.durationMinutes)
      ? Math.max(1, Math.round(options.durationMinutes))
      : 0;
    payload.durationMinutes = durationMinutes;
    if (isNumber(options.scorePercent)) {
      payload.scorePercent = Math.max(0, Math.min(100, Math.round(options.scorePercent)));
    }
    if (options.reflection) {
      payload.reflection = options.reflection;
    }
    if (isNumber(options.xpAwarded)) {
      payload.xpAwarded = Math.max(0, Math.round(options.xpAwarded));
    }
    payload.loggedAt = toIsoString(options.loggedAt);
    return postLearnerPayload("pastpapers/logs", payload);
  };

  window.kiraActivity = {
    logModuleQuiz,
    logPastPaper,
    logModuleProgress
  };
})();
