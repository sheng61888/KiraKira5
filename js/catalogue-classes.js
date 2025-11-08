(() => {
  const renderCatalogue = modules => {
    const catalogueContainer = document.getElementById("classCatalogue");
    if (!catalogueContainer) {
      return;
    }

    if (!Array.isArray(modules) || !modules.length) {
      catalogueContainer.innerHTML = "<p class=\"empty-state\">Module data is on the way. Please try refreshing.</p>";
      return;
    }

    const createElement = (tag, className, text) => {
      const el = document.createElement(tag);
      if (className) {
        el.className = className;
      }
      if (text) {
        el.textContent = text;
      }
      return el;
    };

    catalogueContainer.innerHTML = "";
    modules.forEach(section => {
      const card = createElement("article", "class-catalogue-card");

      const header = createElement("div", "class-card-header");
      const badge = createElement("span", "form-badge", section.grade);
      const headingGroup = createElement("div");
      const title = createElement("h3", null, section.title);
      const description = createElement("p", "class-card-description", section.description);

      headingGroup.appendChild(title);
      headingGroup.appendChild(description);

      header.appendChild(badge);
      header.appendChild(headingGroup);

      const modulesWrapper = createElement("div", "class-modules");

      section.modules.forEach(module => {
        const wrapperTag = module.link ? "a" : "div";
        const classes = module.link ? "class-module module-link" : "class-module";
        const moduleEl = createElement(wrapperTag, classes);
        if (module.link) {
          moduleEl.href = module.link;
        }
        const moduleHeading = createElement("p", "module-heading", `${module.number} ${module.title}`);
        const lessonList = createElement("ul", "module-lessons");

        module.lessons.forEach(lesson => {
          const lessonItem = document.createElement("li");
          lessonItem.textContent = lesson;
          lessonList.appendChild(lessonItem);
        });

        moduleEl.appendChild(moduleHeading);
        moduleEl.appendChild(lessonList);
        modulesWrapper.appendChild(moduleEl);
      });

      card.appendChild(header);
      card.appendChild(modulesWrapper);
      catalogueContainer.appendChild(card);
    });
  };

  document.addEventListener("DOMContentLoaded", () => {
    const initial = Array.isArray(window.kiraModules) ? window.kiraModules : [];
    renderCatalogue(initial);
  });

  document.addEventListener("kira:modules-ready", event => {
    const modules = event.detail || (Array.isArray(window.kiraModules) ? window.kiraModules : []);
    renderCatalogue(modules);
  });

  window.kiraRenderModuleCatalogue = renderCatalogue;
})();
