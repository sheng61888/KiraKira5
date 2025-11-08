(() => {
  const FALLBACK_STATS = { level: 3, streak: 7, cats: 2, ghibli: 1, hidden: 0 };

  const loadStats = () => {
    if (window.kiraBadgeStats) {
      return window.kiraBadgeStats;
    }
    if (window.kiraUserStats) {
      return window.kiraUserStats;
    }
    try {
      const stored = localStorage.getItem("kiraUserStats");
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn("Unable to parse stored stats", error);
    }
    localStorage.setItem("kiraUserStats", JSON.stringify(FALLBACK_STATS));
    return FALLBACK_STATS;
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
      header.innerHTML = '<div><p class="eyebrow">' + collection.title + '</p><h3>' + collection.description + '</h3></div>' +
        '<span class="chip">' + collection.metric + ': ' + metricDisplay + '</span>';

      const grid = document.createElement('div');
      grid.className = 'badge-grid';

      collection.rewards.forEach(reward => {
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
        window.kiraBadgeStats = event.detail.stats;
        try {
          localStorage.setItem('kiraUserStats', JSON.stringify(event.detail.stats));
        } catch (error) {
          console.warn('Unable to store badge stats', error);
        }
      }
    }
    renderAll();
  });
})();
