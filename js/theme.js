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

(() => {
    const SEARCH_ITEMS = [
        {
            url: "home.html",
            title: "Home - KiraKira",
            description: "Hero overview, SPM Advantage highlights, and platform benefits.",
            keywords: ["landing", "overview", "spm advantage", "platform"]
        },
        {
            url: "about.html",
            title: "About - Meet KiraKira",
            description: "Origin story, teaching mission, and how we support Malaysian learners.",
            keywords: ["mission", "story", "team", "about us"]
        },
        {
            url: "catalogue-classes.html",
            title: "Catalogue - Browse Classes",
            description: "Form 4 and Form 5 module summaries, learning outcomes, and lesson links.",
            keywords: ["modules", "catalogue", "classes", "form 4", "form 5"]
        },
        {
            url: "lesson-form4-01.html",
            title: "Form 4.01 - Quadratic Functions",
            description: "Graph interpretations, turning points, and solving quadratic equations.",
            keywords: ["quadratic", "functions", "equations", "form 4"]
        },
        {
            url: "lesson-form4-02.html",
            title: "Form 4.02 - Number Bases and Conversions",
            description: "Base-n conversions, binary arithmetic, and place value fluency.",
            keywords: ["number bases", "binary", "conversion"]
        },
        {
            url: "lesson-form4-03.html",
            title: "Form 4.03 - Logical Reasoning",
            description: "Statements, truth tables, and evaluating structured arguments.",
            keywords: ["logic", "statements", "arguments"]
        },
        {
            url: "lesson-form4-04.html",
            title: "Form 4.04 - Operations on Sets",
            description: "Intersection, union, Venn diagrams, and set notation practice.",
            keywords: ["sets", "venn diagram", "operations"]
        },
        {
            url: "lesson-form4-05.html",
            title: "Form 4.05 - Networks and Graph Theory",
            description: "Network representations, traversal, and graph vocabulary.",
            keywords: ["network", "graph theory", "paths"]
        },
        {
            url: "lesson-form4-06.html",
            title: "Form 4.06 - Linear Inequalities",
            description: "Graphing solution regions and solving two-variable inequalities.",
            keywords: ["linear inequalities", "two variables", "graphing"]
        },
        {
            url: "lesson-form4-07.html",
            title: "Form 4.07 - Graphs of Motion",
            description: "Distance-time and speed-time graphs with interpretation skills.",
            keywords: ["graphs of motion", "distance-time", "speed-time"]
        },
        {
            url: "lesson-form4-08.html",
            title: "Form 4.08 - Dispersion (Ungrouped)",
            description: "Range, variance, and spread for ungrouped datasets.",
            keywords: ["dispersion", "ungrouped data", "statistics"]
        },
        {
            url: "lesson-form4-09.html",
            title: "Form 4.09 - Probability of Combined Events",
            description: "Independent versus dependent events and mutually exclusive outcomes.",
            keywords: ["probability", "combined events", "mutually exclusive"]
        },
        {
            url: "lesson-form4-10.html",
            title: "Form 4.10 - Consumer Mathematics: Finance",
            description: "Budgeting, financial planning, and real-world money decisions.",
            keywords: ["consumer math", "financial planning", "management"]
        },
        {
            url: "lesson-form5-01.html",
            title: "Form 5.01 - Variation",
            description: "Direct, inverse, and joint variation relationships.",
            keywords: ["variation", "direct", "inverse", "joint"]
        },
        {
            url: "lesson-form5-02.html",
            title: "Form 5.02 - Matrices",
            description: "Matrix operations, determinants, and solving systems.",
            keywords: ["matrices", "operations", "determinant"]
        },
        {
            url: "lesson-form5-03.html",
            title: "Form 5.03 - Consumer Math: Insurance",
            description: "Risk basics, policy terms, and premium calculations.",
            keywords: ["insurance", "consumer math", "risk"]
        },
        {
            url: "lesson-form5-04.html",
            title: "Form 5.04 - Consumer Math: Taxation",
            description: "Personal tax, SST fundamentals, and filing skills.",
            keywords: ["taxation", "consumer math", "sst"]
        },
        {
            url: "lesson-form5-05.html",
            title: "Form 5.05 - Congruent and Enlargement Transformations",
            description: "Congruency checks, enlargements, and combined transformations.",
            keywords: ["transformations", "congruent", "enlargement"]
        },
        {
            url: "lesson-form5-06.html",
            title: "Form 5.06 - Trigonometric Ratio and Graphs",
            description: "Sine, cosine, tangent values and their full-cycle graphs.",
            keywords: ["trigonometry", "graphs", "ratio"]
        },
        {
            url: "lesson-form5-07.html",
            title: "Form 5.07 - Dispersion (Grouped Data)",
            description: "Grouped data variance, interquartile range, and spread.",
            keywords: ["dispersion", "grouped data", "statistics"]
        },
        {
            url: "lesson-form5-08.html",
            title: "Form 5.08 - Mathematical Modelling",
            description: "Modelling cycles and applying math to real-world cases.",
            keywords: ["modelling", "applications", "problem solving"]
        }
    ];

    const MIN_QUERY_LENGTH = 2;
    const searchablePages = new Set(SEARCH_ITEMS.map((item) => item.url.toLowerCase()));
    const searchIndex = SEARCH_ITEMS.map((item) => ({
        ...item,
        tokens: [item.title, item.description, ...(item.keywords || [])]
            .join(" ")
            .toLowerCase()
    }));

    const escapeHtml = (value) => value.replace(/[&<>"']/g, (char) => {
        const map = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "\"": "&quot;",
            "'": "&#39;"
        };
        return map[char] || char;
    });

    const buildSearchUI = () => {
        const nav = document.querySelector(".nav-container");
        const brand = nav?.querySelector(".brand-logo");
        if (!nav || !brand) {
            return null;
        }

        let brandGroup = nav.querySelector(".nav-brand-group");
        if (!brandGroup) {
            brandGroup = document.createElement("div");
            brandGroup.className = "nav-brand-group";
            brand.replaceWith(brandGroup);
            brandGroup.appendChild(brand);
        }

        let container = brandGroup.querySelector(".site-search");
        if (container) {
            return container;
        }

        container = document.createElement("div");
        container.className = "site-search";
        container.setAttribute("data-site-search", "true");
        container.innerHTML = `
            <form class="form" role="search" aria-label="Search pages" autocomplete="off">
                <button type="submit" class="search-submit" aria-label="Run search">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <circle cx="11" cy="11" r="7"></circle>
                        <line x1="16.65" y1="16.65" x2="21" y2="21"></line>
                    </svg>
                </button>
                <input class="input" type="search" name="query" placeholder="Search lessons" aria-label="Search pages" autocomplete="off" aria-controls="site-search-results" aria-expanded="false" />
                <button type="reset" class="reset" aria-label="Clear search">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </form>
            <div class="search-results" id="site-search-results" data-search-results role="listbox" aria-live="polite" hidden></div>
        `;

        brandGroup.appendChild(container);
        return container;
    };

    const initSearch = (container) => {
        const input = container.querySelector(".input");
        const form = container.querySelector("form");
        const resultsEl = container.querySelector("[data-search-results]");

        if (!input || !form || !resultsEl) {
            return;
        }

        let currentMatches = [];

        const hideResults = () => {
            resultsEl.hidden = true;
            resultsEl.innerHTML = "";
            input.setAttribute("aria-expanded", "false");
        };

        const renderResults = (matches, rawQuery) => {
            if (!matches.length) {
                resultsEl.innerHTML = `<p class="search-empty">No matches for ${escapeHtml(rawQuery)}.</p>`;
                resultsEl.hidden = false;
                input.setAttribute("aria-expanded", "true");
                return;
            }

            resultsEl.innerHTML = matches
                .map(
                    (item) => `
                <a class="search-result" href="${item.url}">
                    <span class="result-title">${item.title}</span>
                    <span class="result-description">${item.description}</span>
                </a>`
                )
                .join("");
            resultsEl.hidden = false;
            input.setAttribute("aria-expanded", "true");
            resultsEl.scrollTop = 0;
        };

        const handleInput = (event) => {
            const rawQuery = event.target.value;
            const query = rawQuery.trim().toLowerCase();

            if (query.length < MIN_QUERY_LENGTH) {
                currentMatches = [];
                hideResults();
                return;
            }

            currentMatches = searchIndex.filter((item) => item.tokens.includes(query));
            renderResults(currentMatches, rawQuery.trim());
        };

        input.addEventListener("input", handleInput);

        form.addEventListener("submit", (event) => {
            event.preventDefault();
            if (currentMatches[0]) {
                window.location.assign(currentMatches[0].url);
            }
        });

        form.addEventListener("reset", () => {
            window.requestAnimationFrame(() => {
                currentMatches = [];
                hideResults();
                input.focus();
            });
        });

        document.addEventListener("click", (event) => {
            if (!container.contains(event.target)) {
                hideResults();
            }
        });

        input.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                hideResults();
                input.blur();
            }
        });
    };

    document.addEventListener("DOMContentLoaded", () => {
        const currentPage = window.location.pathname.split("/").pop()?.toLowerCase() || "home.html";
        if (!searchablePages.has(currentPage)) {
            return;
        }

        const container = buildSearchUI();
        if (container) {
            initSearch(container);
        }
    });
})();