(() => {
  const metricSelectors = {
    streakValue: '[data-metric="streak-value"]',
    streakMeta: '[data-metric="streak-meta"]',
    accuracyValue: '[data-metric="accuracy-value"]',
    accuracyMeta: '[data-metric="accuracy-meta"]',
    assignmentsValue: '[data-metric="assignments-value"]',
    assignmentsMeta: '[data-metric="assignments-meta"]'
  };

  const setText = (selector, value) => {
    if (typeof value !== "string") {
      return;
    }
    const el = document.querySelector(selector);
    if (el) {
      el.textContent = value;
    }
  };

  const formatDays = (value) => {
    if (typeof value !== "number" || Number.isNaN(value)) {
      return null;
    }
    const safe = Math.max(0, value);
    const display = Number.isInteger(safe) ? safe.toString() : safe.toFixed(1);
    const plural = Math.abs(safe - 1) < 0.01 ? "" : "s";
    return `${display} day${plural}`;
  };

  const formatNumber = (value) => {
    if (typeof value !== "number" || Number.isNaN(value)) {
      return null;
    }
    try {
      return new Intl.NumberFormat("en-MY").format(value);
    } catch {
      return value.toString();
    }
  };

  const setStreakDisplay = (value, meta) => {
    if (value) {
      setText(metricSelectors.streakValue, value);
    }
    if (meta) {
      setText(metricSelectors.streakMeta, meta);
    }
  };

  const setAccuracyDisplay = (value, meta) => {
    if (value) {
      setText(metricSelectors.accuracyValue, value);
    }
    if (meta) {
      setText(metricSelectors.accuracyMeta, meta);
    }
  };

  const setAssignmentsDisplay = (value, meta) => {
    if (value) {
      setText(metricSelectors.assignmentsValue, value);
    }
    if (meta) {
      setText(metricSelectors.assignmentsMeta, meta);
    }
  };

  const updateStreakMetric = (streak) => {
    if (!streak) {
      return;
    }
    const current = formatDays(streak.current);
    const longest = formatDays(streak.longest);
    const xp = typeof streak.xpToNextLevel === "number" ? `${streak.xpToNextLevel} XP to next level` : "Keep the streak alive";
    const meta = longest ? `${longest} personal best · ${xp}` : xp;
    setStreakDisplay(current, meta);
  };

  const updateAccuracyMetric = (progress) => {
    if (!progress || typeof progress.overallPercent !== "number") {
      return;
    }
    const percent = `${Math.max(0, Math.min(100, Math.round(progress.overallPercent)))}%`;
    const topicsCount = Array.isArray(progress.topics) ? progress.topics.length : 0;
    const topicText = topicsCount > 0 ? `${topicsCount} tracked topics` : "Current mastery";
    setAccuracyDisplay(percent, topicText);
  };

  const updateAssignmentsMetric = (classesPayload) => {
    if (!classesPayload || !Array.isArray(classesPayload.assignments)) {
      return;
    }
    const pending = classesPayload.assignments.filter((assignment) => {
      const status = (assignment.status || "").toLowerCase();
      const complete = typeof assignment.completionPercent === "number" && assignment.completionPercent >= 100;
      return !complete && status !== "done" && status !== "graded";
    }).length;
    const value = formatNumber(pending) || `${pending}`;
    const label = classesPayload.hasEnrollment ? "Teacher tasks waiting" : "Personal assignments";
    setAssignmentsDisplay(value, label);
  };

  const applyAggregateSnapshot = (snapshot) => {
    if (!snapshot) {
      return;
    }

    if (typeof snapshot.averageStreakDays === "number") {
      const value = formatDays(snapshot.averageStreakDays);
      const activeText = snapshot.activeLearnerCount
        ? `${formatNumber(snapshot.activeLearnerCount) || snapshot.activeLearnerCount} active learners`
        : "Live learner activity";
      const meta = snapshot.streakWindowLabel
        ? `${snapshot.streakWindowLabel} · ${activeText}`
        : activeText;
      setStreakDisplay(value, meta);
    }

    if (typeof snapshot.form5AccuracyPercent === "number") {
      const value = `${Math.max(0, Math.min(100, Math.round(snapshot.form5AccuracyPercent)))}%`;
      const attemptText = snapshot.form5AttemptCount
        ? `${formatNumber(snapshot.form5AttemptCount) || snapshot.form5AttemptCount} attempts`
        : "Recent mastery";
      const meta = snapshot.accuracyWindowLabel
        ? `${snapshot.accuracyWindowLabel} · ${attemptText}`
        : attemptText;
      setAccuracyDisplay(value, meta);
    }

    if (typeof snapshot.assignmentsCompleted === "number") {
      const value = formatNumber(snapshot.assignmentsCompleted) || `${snapshot.assignmentsCompleted}`;
      const meta = snapshot.assignmentsWindowLabel || "Assignments completed";
      setAssignmentsDisplay(value, meta);
    }
  };

  const fetchJsonWithSession = async (segment) => {
    const session = window.kiraLearnerSession;
    if (!session || typeof session.fetch !== "function") {
      throw new Error("Learner session unavailable");
    }
    const response = await session.fetch(segment);
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }
    return response.json();
  };

  const hydrateFromApi = async () => {
    const session = window.kiraLearnerSession;
    if (!session || typeof session.getId !== "function") {
      return;
    }
    const learnerId = session.getId();
    if (!learnerId) {
      return;
    }

    try {
      const [dashboardResult, progressResult, classesResult] = await Promise.allSettled([
        fetchJsonWithSession("/dashboard"),
        fetchJsonWithSession("/progress"),
        fetchJsonWithSession("/classes")
      ]);

      if (dashboardResult.status === "fulfilled") {
        updateStreakMetric(dashboardResult.value?.streak);
      }

      if (progressResult.status === "fulfilled") {
        updateAccuracyMetric(progressResult.value);
      }

      if (classesResult.status === "fulfilled") {
        updateAssignmentsMetric(classesResult.value);
      }
    } catch (error) {
      console.warn("Unable to hydrate hero metrics with learner data", error);
    }
  };

  const hydrateFromAggregate = async () => {
    try {
      const response = await fetch("/api/learner/live-progress", { headers: { Accept: "application/json" } });
      if (!response.ok) {
        throw new Error(`Snapshot request failed: ${response.status}`);
      }
      const payload = await response.json();
      applyAggregateSnapshot(payload);
    } catch (error) {
      console.warn("Unable to load aggregate progress snapshot", error);
    }
  };

  document.addEventListener("DOMContentLoaded", () => {
    hydrateFromAggregate();
    hydrateFromApi();
  });
})();
