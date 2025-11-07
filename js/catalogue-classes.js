document.addEventListener("DOMContentLoaded", () => {
    const catalogueContainer = document.getElementById("classCatalogue");
    if (!catalogueContainer) {
        return;
    }

    const classCatalogue = [
        {
            grade: "Form 4",
            title: "Form 4 Mathematics (KSSM)",
            description: "Core concepts that prepare you for the final SPM push in Form 5.",
            modules: [
                {
                    number: "01",
                    title: "Quadratic Functions and Equations in One Variable",
                    lessons: ["Quadratic Functions", "Quadratic Equations"],
                    link: "lesson-form4-01.html"
                },
                {
                    number: "02",
                    title: "Number Bases",
                    lessons: ["Number Bases"],
                    link: "lesson-form4-02.html"
                },
                {
                    number: "03",
                    title: "Logical Reasoning",
                    lessons: ["Statements", "Arguments"],
                    link: "lesson-form4-03.html"
                },
                {
                    number: "04",
                    title: "Operations on Sets",
                    lessons: ["Intersection of Sets", "Union of Sets", "Combined Operations on Sets"],
                    link: "lesson-form4-04.html"
                },
                {
                    number: "05",
                    title: "Network in Graph Theory",
                    lessons: ["Network"],
                    link: "lesson-form4-05.html"
                },
                {
                    number: "06",
                    title: "Linear Inequalities in Two Variables",
                    lessons: ["Linear Inequalities in Two Variables", "Systems of Linear Inequalities in Two Variables"],
                    link: "lesson-form4-06.html"
                },
                {
                    number: "07",
                    title: "Graphs of Motion",
                    lessons: ["Distance-Time Graph", "Speed-Time Graph"],
                    link: "lesson-form4-07.html"
                },
                {
                    number: "08",
                    title: "Measures of Dispersion for Ungrouped Data",
                    lessons: ["Dispersion", "Measures of Dispersion"],
                    link: "lesson-form4-08.html"
                },
                {
                    number: "09",
                    title: "Probability of Combined Events",
                    lessons: [
                        "Combined Events",
                        "Dependent Events and Independent Events",
                        "Mutually Exclusive and Non-Mutually Exclusive Events",
                        "Applications of Probability of Combined Events"
                    ],
                    link: "lesson-form4-09.html"
                },
                {
                    number: "10",
                    title: "Consumer Mathematics: Financial Management",
                    lessons: ["Financial Planning and Management"],
                    link: "lesson-form4-10.html"
                }
            ]
        },
        {
            grade: "Form 5",
            title: "Form 5 Mathematics (KSSM)",
            description: "Exam-focused topics that complete the SPM Modern Math syllabus.",
            modules: [
                {
                    number: "01",
                    title: "Variation",
                    lessons: ["Direct Variation", "Inverse Variation", "Joint Variation"]
                },
                {
                    number: "02",
                    title: "Matrices",
                    lessons: ["Matrices", "Basic Operations on Matrices"]
                },
                {
                    number: "03",
                    title: "Consumer Mathematics: Insurance",
                    lessons: ["Risk and Insurance Protection"]
                },
                {
                    number: "04",
                    title: "Consumer Mathematics: Taxation",
                    lessons: ["Taxation"]
                },
                {
                    number: "05",
                    title: "Congruent, Enlargement and Combination of Transformation",
                    lessons: ["Congruent Figures", "Enlargement", "Combination of Transformation", "Tessellation"]
                },
                {
                    number: "06",
                    title: "Ratio and Graph of Trigonometric Functions",
                    lessons: [
                        "Values of sine, cosine and tangent for angles from 0 to 360 degrees",
                        "Graphs of trigonometric functions for sine, cosine and tangent"
                    ]
                },
                {
                    number: "09",
                    title: "Measures of Dispersion for Grouped Data",
                    lessons: ["Dispersion", "Measures of Dispersion"]
                }
            ]
        }
    ];

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

    const renderCatalogue = () => {
        classCatalogue.forEach(section => {
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

    renderCatalogue();
});
