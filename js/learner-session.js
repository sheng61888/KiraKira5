(() => {
  const STORAGE_KEY = "currentLearnerId";
  const MISSING_EVENT = "kira:learner-missing";

  const getQueryLearner = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get("learnerId");
  };

  const resolveLearnerId = () => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      return stored;
    }
    const fromQuery = getQueryLearner();
    if (fromQuery) {
      sessionStorage.setItem(STORAGE_KEY, fromQuery);
      return fromQuery;
    }
    return null;
  };

  const ensureLearnerId = () => {
    const id = resolveLearnerId();
    if (!id) {
      document.dispatchEvent(new CustomEvent(MISSING_EVENT));
    } else {
      window.kiraCurrentLearnerId = id;
    }
    return id;
  };

  const fetchForLearner = (segment, init) => {
    const id = ensureLearnerId();
    if (!id) {
      return Promise.reject(new Error("Missing learner session"));
    }
    const path = (segment || "").replace(/^\/+/, "");
    return fetch(`/api/learner/${id}/${path}`, init);
  };

  window.kiraLearnerSession = {
    key: STORAGE_KEY,
    getId: resolveLearnerId,
    ensureId: ensureLearnerId,
    fetch: fetchForLearner,
    clear: () => sessionStorage.removeItem(STORAGE_KEY)
  };

  ensureLearnerId();
})();
