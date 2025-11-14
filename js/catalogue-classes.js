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

    const getLessonHref = module => {
      if (!module || typeof module.moduleId !== "string") {
        return null;
      }
      const trimmed = module.moduleId.trim();
      if (!trimmed) {
        return null;
      }
      return `lesson-${trimmed}.html`;
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
        const resolvedHref = getLessonHref(module) || module.link;
        const wrapperTag = resolvedHref ? "a" : "div";
        const classes = resolvedHref ? "class-module module-link" : "class-module";
        const moduleEl = createElement(wrapperTag, classes);
        if (resolvedHref) {
          moduleEl.href = resolvedHref;
        }
        const moduleHeading = createElement("p", "module-heading", `${module.number} ${module.title}`);
        const lessonList = createElement("ul", "module-lessons");

        module.lessons.forEach(lesson => {
          const lessonItem = document.createElement("li");
          lessonItem.textContent = lesson;
          lessonList.appendChild(lessonItem);
        });

        const previewWrapper = createElement("a", "module-preview");
        previewWrapper.href = "login_signup.html";
        previewWrapper.setAttribute("aria-label", `Unlock ${module.title} by signing up`);
        const previewImage = document.createElement("img");
        previewImage.src = module.preview || "../images/wapppicmodule.jpg";
        previewImage.alt = `Sample preview for ${module.title}`;
        previewImage.loading = "lazy";

        const overlay = createElement("div", "preview-overlay");
        overlay.innerHTML = `
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M17 9V7a5 5 0 0 0-10 0v2H5v12h14V9h-2zm-2 0H9V7a3 3 0 0 1 6 0v2z"/>
          </svg>
          <span>Unlock by signing up</span>
        `;
        previewWrapper.appendChild(previewImage);
        previewWrapper.appendChild(overlay);

        moduleEl.appendChild(moduleHeading);
        moduleEl.appendChild(lessonList);
        moduleEl.appendChild(previewWrapper);
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
