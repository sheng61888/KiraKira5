(() => {
  const FALLBACK_STATS = {
    level: 0,
    streak: 0,
    moduleMastery: 0,
    paperWarrior: 0,
    consistency: 0
  };

  const mergeWithDefaults = stats => ({ ...FALLBACK_STATS, ...(stats || {}) });

  const loadStats = () => {
    if (window.kiraBadgeStats) {
      return mergeWithDefaults(window.kiraBadgeStats);
    }
    if (window.kiraUserStats) {
      return mergeWithDefaults(window.kiraUserStats);
    }
    try {
      const stored = localStorage.getItem("kiraUserStats");
      if (stored) {
        const parsed = JSON.parse(stored);
        return mergeWithDefaults(parsed);
      }
    } catch (error) {
      console.warn("Unable to parse stored stats", error);
    }
    localStorage.setItem("kiraUserStats", JSON.stringify(FALLBACK_STATS));
    return FALLBACK_STATS;
  };

  const prettifyMetric = value => {
    if (typeof value !== "string" || !value.length) {
      return "";
    }
    return value
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\b\w/g, letter => letter.toUpperCase());
  };

  const createBadgeCard = (collection, reward, unlocked) => {
    const card = document.createElement('div');
    card.className = 'badge-card';
    card.dataset.collection = collection.id;
    card.dataset.metric = collection.metric;
    if (unlocked) {
      card.classList.add('unlocked');
    } else {
      card.classList.add('locked');
    }

    if (reward.image) {
      const img = document.createElement('img');
      img.src = reward.image;
      img.alt = reward.label;
      card.appendChild(img);
    } else {
      const glyph = document.createElement('div');
      glyph.className = 'badge-glyph';
      glyph.textContent = reward.emoji || '⭐';
      card.appendChild(glyph);
    }

    const body = document.createElement('div');
    body.className = 'badge-body';
    const title = unlocked ? reward.label : (reward.lockedLabel || reward.label);
    let detail;
    if (unlocked && reward.description) {
      detail = reward.description;
    } else if (!unlocked && reward.hint) {
      detail = 'Hint: ' + reward.hint;
    } else if (reward.requirement) {
      detail = reward.requirement;
    } else {
      detail = 'Requires ' + collection.metric + ' ≥ ' + reward.value;
    }
    body.innerHTML = '<strong>' + title + '</strong><small>' + detail + '</small>';
    card.appendChild(body);

    return card;
  };

  const renderCollection = (parent, collections, stats) => {
    parent.innerHTML = '';
    collections.forEach(collection => {
      const metricValue = stats[collection.metric] || 0;
      const metricDisplay = collection.secret && metricValue === 0 ? '??' : metricValue;
      const wrapper = document.createElement('article');
      wrapper.className = 'badge-collection';
      wrapper.dataset.style = collection.style;

      const header = document.createElement('div');
      header.className = 'badge-collection-head';
      const chipLabel = prettifyMetric(collection.metric);
      header.innerHTML = '<div><p class="eyebrow">' + collection.title + '</p><h3>' + collection.description + '</h3></div>' +
        '<span class="chip">' + chipLabel + (chipLabel ? ': ' : '') + metricDisplay + '</span>';

      const grid = document.createElement('div');
      grid.className = 'badge-grid';

      [...collection.rewards].sort((a, b) => a.value - b.value).forEach(reward => {
        const unlocked = metricValue >= reward.value;
        grid.appendChild(createBadgeCard(collection, reward, unlocked));
      });

      wrapper.appendChild(header);
      wrapper.appendChild(grid);
      parent.appendChild(wrapper);
    });
  };

  const renderAll = () => {
    const collections = window.kiraBadgeCollections || [];
    const targets = document.querySelectorAll('[data-role="badge-collections"]');
    if (!targets.length || !collections.length) {
      return;
    }
    const stats = loadStats();
    targets.forEach(target => renderCollection(target, collections, stats));
  };

  document.addEventListener('DOMContentLoaded', renderAll);
  document.addEventListener('kira:badges-ready', event => {
    if (event.detail) {
      if (event.detail.collections) {
        window.kiraBadgeCollections = event.detail.collections;
      }
      if (event.detail.stats) {
        const merged = mergeWithDefaults(event.detail.stats);
        window.kiraBadgeStats = merged;
        try {
          localStorage.setItem('kiraUserStats', JSON.stringify(merged));
        } catch (error) {
          console.warn('Unable to store badge stats', error);
        }
      }
    }
    renderAll();
  });
})();
