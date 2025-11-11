(() => {
  const STORAGE_KEY = "currentLearnerId";
  const MISSING_EVENT = "kira:learner-missing";

  const safelyGet = (storage, key) => {
    try {
      return storage.getItem(key);
    } catch {
      return null;
    }
  };

  const safelySet = (storage, key, value) => {
    try {
      storage.setItem(key, value);
    } catch {
      /* ignore write failures */
    }
  };

  const safelyRemove = (storage, key) => {
    try {
      storage.removeItem(key);
    } catch {
      /* no-op */
    }
  };

  const persistLearnerId = learnerId => {
    if (!learnerId) {
      return;
    }
    const value = learnerId.toString().trim();
    if (!value) {
      return;
    }
    safelySet(sessionStorage, STORAGE_KEY, value);
    safelySet(localStorage, STORAGE_KEY, value);
    window.kiraCurrentLearnerId = value;
  };

  const getQueryLearner = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get("learnerId");
  };

  const resolveLearnerId = () => {
    const sessionValue = safelyGet(sessionStorage, STORAGE_KEY);
    if (sessionValue) {
      persistLearnerId(sessionValue);
      return sessionValue;
    }

    const fromQuery = getQueryLearner();
    if (fromQuery) {
      persistLearnerId(fromQuery);
      return fromQuery;
    }

    const localValue = safelyGet(localStorage, STORAGE_KEY);
    if (localValue) {
      persistLearnerId(localValue);
      return localValue;
    }

    return null;
  };

  const ensureLearnerId = () => {
    const id = resolveLearnerId();
    if (!id) {
      document.dispatchEvent(new CustomEvent(MISSING_EVENT));
      return null;
    }
    window.kiraCurrentLearnerId = id;
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

  const clearLearnerId = () => {
    safelyRemove(sessionStorage, STORAGE_KEY);
    safelyRemove(localStorage, STORAGE_KEY);
    delete window.kiraCurrentLearnerId;
  };

  const clearStoredName = () => {
    safelyRemove(sessionStorage, "userName");
    safelyRemove(localStorage, "userName");
  };

  const logoutLearner = redirectUrl => {
    clearLearnerId();
    clearStoredName();
    if (redirectUrl) {
      window.location.href = redirectUrl;
    }
  };

  window.kiraLearnerSession = {
    key: STORAGE_KEY,
    getId: resolveLearnerId,
    ensureId: ensureLearnerId,
    fetch: fetchForLearner,
    persist: persistLearnerId,
    clear: clearLearnerId,
    logout: logoutLearner
  };

  ensureLearnerId();
})();
