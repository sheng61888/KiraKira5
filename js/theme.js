(() => {
    const THEME_KEY = "kirakira-theme";
    const DEFAULT_THEME = "light";

    const applyTheme = (theme) => {
        const body = document.body;
        if (!body) {
            return;
        }

        body.classList.toggle("theme-dark", theme === "dark");
        body.dataset.theme = theme;

        document.querySelectorAll("[data-theme-select]").forEach((button) => {
            const isActive = button.dataset.themeSelect === theme;
            button.classList.toggle("active", isActive);
            button.setAttribute("aria-pressed", isActive ? "true" : "false");
        });
    };

    const setTheme = (theme) => {
        localStorage.setItem(THEME_KEY, theme);
        applyTheme(theme);
    };

    const getInitialTheme = () => {
        const stored = localStorage.getItem(THEME_KEY);
        if (stored === "light" || stored === "dark") {
            return stored;
        }
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : DEFAULT_THEME;
    };

    document.addEventListener("DOMContentLoaded", () => {
        const themeButtons = document.querySelectorAll("[data-theme-select]");
        if (!themeButtons.length) {
            return;
        }

        applyTheme(getInitialTheme());

        themeButtons.forEach((button) => {
            button.addEventListener("click", () => {
                const selected = button.dataset.themeSelect;
                if (selected) {
                    setTheme(selected);
                }
            });
        });
    });
})();
