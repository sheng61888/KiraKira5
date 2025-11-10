(() => {
  const modulesData = () => (Array.isArray(window.kiraModules) ? window.kiraModules : []);
  const modulesMap = () => window.kiraModulesMap || {};

  const moduleProgressMap = {
    "course-map.html?module=form4-01": 100,
    "lesson-form4-02.html": 62,
    "lesson-form4-03.html": 35
  };

  const gradeDefaults = {
    "Form 4": [100, 60, 25, 10, 0],
    "Form 5": [45, 20, 15, 10, 0]
  };

  const stickerPool = ["✨", "📐", "🎯", "🌀", "🧠", "🚀", "💡", "🐾"];

  const getProgressValue = (module, grade, index) => {
    if (module.link && typeof moduleProgressMap[module.link] === "number") {
      return moduleProgressMap[module.link];
    }
    const defaults = gradeDefaults[grade] || [];
    return defaults[index] ?? 0;
  };

  const progressMeta = value => {
    if (value >= 95) {
      return { label: "Completed", chipClass: "chip chip--success" };
    }
    if (value >= 35) {
      return { label: "In progress", chipClass: "chip chip--info" };
    }
    return { label: "Locked", chipClass: "chip" };
  };

  const createLessonPills = lessons => {
    const list = document.createElement("ul");
    list.className = "lesson-pill-list";
    lessons.slice(0, 3).forEach(lesson => {
      const item = document.createElement("li");
      item.textContent = lesson;
      list.appendChild(item);
    });
    if (lessons.length > 3) {
      const more = document.createElement("li");
      more.textContent = `+${lessons.length - 3} more`;
      list.appendChild(more);
    }
    return list;
  };

  const wireButtonNavigation = (button, link) => {
    if (link) {
      button.dataset.link = link;
      button.addEventListener("click", () => {
        window.location.href = link;
      });
    } else {
      button.disabled = true;
      button.classList.add("btn--ghost-disabled");
    }
  };

  const renderHomeModules = () => {
    const grid = document.querySelector("[data-role='course-grid']");
    if (!grid) {
      return;
    }

    const grade = grid.dataset.grade || "Form 4";
    const limit = parseInt(grid.dataset.limit || "3", 10);
    const section = modulesMap()[grade];

    if (!section) {
      grid.innerHTML = "<p class=\"muted\">Module data unavailable. Please refresh.</p>";
      return;
    }

    const courseMapButton = document.querySelector("[data-action='course-map']");
    if (courseMapButton) {
      const targetModule =
        section.modules.find(module => Array.isArray(module.units) && module.units.length) || section.modules[0];
      const mapLink = targetModule && targetModule.link;
      if (mapLink) {
        courseMapButton.disabled = false;
        courseMapButton.onclick = () => {
          window.location.href = mapLink;
        };
      } else {
        courseMapButton.disabled = true;
      }
    }

    grid.innerHTML = "";
    section.modules.slice(0, limit).forEach((module, index) => {
      const card = document.createElement("article");
      card.className = "course-card module-card";
      const stickerIndex = (index + grade.length) % stickerPool.length;
      card.dataset.sticker = stickerPool[stickerIndex];

      const number = document.createElement("span");
      number.className = "module-number";
      number.textContent = `Module ${module.number}`;

      const title = document.createElement("h3");
      title.textContent = module.title;

      const lessonsLabel = document.createElement("p");
      lessonsLabel.className = "muted";
      lessonsLabel.textContent = "Lessons unlocked";

      const lessonList = createLessonPills(module.lessons);
      lessonList.classList.add("lesson-pill-list--compact");

      const progressValue = getProgressValue(module, grade, index);
      const meta = progressMeta(progressValue);

      const meter = document.createElement("div");
      meter.className = "meter progress-bar";
      meter.innerHTML = `<span style="width:${progressValue}%"></span>`;

      const footer = document.createElement("div");
      footer.className = "module-card-footer";

      const chip = document.createElement("span");
      chip.className = meta.chipClass;
      chip.textContent = meta.label;

      const button = document.createElement("button");
      button.className = "btn btn--primary";
      button.type = "button";
      button.textContent = progressValue >= 95 ? "Review" : progressValue >= 35 ? "Continue" : "Preview";
      wireButtonNavigation(button, module.link);

      footer.appendChild(chip);
      footer.appendChild(button);

      card.appendChild(number);
      card.appendChild(title);
      card.appendChild(lessonsLabel);
      card.appendChild(lessonList);
      card.appendChild(meter);
      card.appendChild(footer);

      grid.appendChild(card);
    });
  };

  const renderClassModules = () => {
    const wrapper = document.getElementById("modulesByGrade");
    if (!wrapper) {
      return;
    }

    const data = modulesData();
    if (!data.length) {
      wrapper.innerHTML = "<p class=\"muted\">Modules are loading. Try refreshing shortly.</p>";
      return;
    }

    wrapper.innerHTML = "";
    data.forEach(section => {
      const stack = document.createElement("article");
      stack.className = "module-stack";

      const header = document.createElement("div");
      header.className = "module-stack-header";

      const badge = document.createElement("span");
      badge.className = "form-badge";
      badge.textContent = section.grade;

      const heading = document.createElement("div");
      heading.innerHTML = `<h3>${section.title}</h3><p class="muted">${section.description}</p>`;

      header.appendChild(badge);
      header.appendChild(heading);

      const list = document.createElement("div");
      list.className = "module-list";

      section.modules.forEach((module, index) => {
        const item = document.createElement("div");
        item.className = "module-list-item";

        const info = document.createElement("div");
        info.className = "module-info";
        info.innerHTML = `
          <span class="module-number">${module.number}</span>
          <div>
            <p class="module-title">${module.title}</p>
            <small>${module.lessons.join(" • ")}</small>
          </div>
        `;

        const metaWrap = document.createElement("div");
        metaWrap.className = "module-meta";

        const progressValue = getProgressValue(module, section.grade, index);
        const meta = progressMeta(progressValue);
        const chip = document.createElement("span");
        chip.className = meta.chipClass;
        chip.textContent = meta.label;

        const action = document.createElement("button");
        action.className = "btn btn--ghost";
        action.type = "button";
        action.textContent = module.link ? "Open module" : "Coming soon";
        wireButtonNavigation(action, module.link);

        metaWrap.appendChild(chip);
        metaWrap.appendChild(action);

        item.appendChild(info);
        item.appendChild(metaWrap);
        list.appendChild(item);
      });

      stack.appendChild(header);
      stack.appendChild(list);
      wrapper.appendChild(stack);
    });
  };

  document.addEventListener("DOMContentLoaded", () => {
    renderHomeModules();
    renderClassModules();
  });

  document.addEventListener("kira:modules-ready", () => {
    renderHomeModules();
    renderClassModules();
  });

  window.kiraRenderModules = {
    home: renderHomeModules,
    classes: renderClassModules
  };
})();
