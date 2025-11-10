window.kiraModules = [
  {
    grade: "Form 4",
    title: "Form 4 Mathematics (KSSM)",
    description: "Core concepts that prepare you for the final SPM push in Form 5.",
    modules: [
      {
        moduleId: "form4-01",
        number: "01",
        title: "Quadratic Functions and Equations in One Variable",
        lessons: ["Quadratic Functions", "Quadratic Equations"],
        link: "course-map.html?module=form4-01",
        units: [
          {
            id: "overview",
            title: "Module overview",
            type: "overview",
            duration: "2 min",
            summary: "Map the two Form 4 KSSM subtopics: Quadratic Functions plus Quadratic Equations in One Variable.",
            body: "We will sketch, interpret, and solve every style of SPM-relevant quadratic question with clear checkpoints along the way.",
            objectives: [
              "Name each part of y = ax^2 + bx + c and match it to what you see on a graph",
              "Infer ranges, turning points, and intercepts straight from a graph or equation",
              "Select and justify the right solving strategy for any single-variable quadratic"
            ],
          },
          {
            id: "rescue-intro",
            title: "Introductory video (optional)",
            type: "video",
            duration: "4 min",
            rescueOnly: true,
            summary: "Turn videos on in onboarding to unlock this visual walk-through of how parabolas move.",
            body: "We animate changes in a, b, and c, point out the axis of symmetry, and show how the vertex links to max/min questions.",
            objectives: [
              "Spot vertex, axis of symmetry, and opening direction in seconds",
              "Link algebraic changes to real graph motions before diving into practice"
            ],
            cta: {
              label: "Play primer",
              link: "https://www.youtube.com/watch?v=bgM8F1J-rescue",
              kind: "video"
            }
          },
          {
            id: "topic-quadratic-functions",
            title: "Topic 1 - Quadratic Functions",
            type: "lesson",
            duration: "10 min",
            summary: "Work with the general form y = ax^2 + bx + c, sketch key points, and describe what each coefficient does.",
            body: "Break down the axis of symmetry x = -b/(2a), locate the vertex, predict intercepts, and explain how changing a, b, or c affects shape, direction, and position.",
            objectives: [
              "Identify axis of symmetry, vertex, and intercepts from equations and graphs",
              "Describe how the coefficients move or stretch the graph",
              "Use the vertex to decide maximum/minimum values and answer range questions"
            ],
            cta: { label: "Open Topic 1 lesson", link: "/html/lessons/lesson-quadratic-intro.html", kind: "lesson" }
          },
          {
            id: "practice-functions",
            title: "Practice questions - Graph sense",
            type: "practice",
            duration: "6 min",
            summary: "Four quick SPM-style prompts on sketching, identifying turning points, and explaining when y = 0.",
            body: "Translate between equations and graphs: state the vertex, locate intercepts, and justify the range of y for each case.",
            cta: { label: "Attempt graph practice", link: "../docs/module01-quiz-vertex.html", kind: "quiz" }
          },
          {
            id: "topic-quadratic-equations",
            title: "Topic 2 - Quadratic Equations in One Variable",
            type: "lesson",
            duration: "12 min",
            summary: "Form and solve quadratic equations using factorisation, completing the square, or the quadratic formula.",
            body: "Move from word problems to algebra, compare solving paths, apply sum/product of roots, and use the discriminant b^2 - 4ac to describe the number and type of roots.",
            objectives: [
              "Form quadratic equations from word or algebra prompts",
              "Choose between factorisation, completing the square, and the quadratic formula with reasoning",
              "Use sum and product of roots plus the discriminant to discuss solutions",
              "Apply the methods to real contexts like projectile motion or area optimisation"
            ],
          },
          {
            id: "practice-equations",
            title: "Practice questions - Solve and explain",
            type: "practice",
            duration: "8 min",
            summary: "Mixed problems that require different solving paths and discriminant analysis.",
            body: "Solve equations, justify your chosen method, and interpret what the roots or lack of roots mean in context.",
            cta: { label: "Work through solving set", link: "../docs/module01-quiz-solve.html", kind: "quiz" }
          },
          {
            id: "checkpoint-final",
            title: "Last checkpoint",
            type: "checkpoint",
            duration: "10 min",
            summary: "Wrap up the module with a single sheet that mixes graphs, equations, and real-life modelling.",
            body: "Confirm you can state graph features, decide on a solving strategy, and interpret discriminant results before moving on.",
            resources: [
              { label: "Checkpoint sheet", type: "sheet", detail: "6 curated questions + answers", url: "../docs/module01-mastery.pdf" }
            ],
            cta: { label: "Download checkpoint", link: "../docs/module01-mastery.pdf", kind: "download" }
          }
        ]
      },
      {
        moduleId: "form4-02",
        number: "02",
        title: "Number Bases",
        lessons: ["Number Bases"],
        link: "lesson-form4-02.html"
      },
      {
        moduleId: "form4-03",
        number: "03",
        title: "Logical Reasoning",
        lessons: ["Statements", "Arguments"],
        link: "lesson-form4-03.html"
      },
      {
        moduleId: "form4-04",
        number: "04",
        title: "Operations on Sets",
        lessons: ["Intersection of Sets", "Union of Sets", "Combined Operations on Sets"],
        link: "lesson-form4-04.html"
      },
      {
        moduleId: "form4-05",
        number: "05",
        title: "Network in Graph Theory",
        lessons: ["Network"],
        link: "lesson-form4-05.html"
      },
      {
        moduleId: "form4-06",
        number: "06",
        title: "Linear Inequalities in Two Variables",
        lessons: [
          "Linear Inequalities in Two Variables",
          "Systems of Linear Inequalities in Two Variables"
        ],
        link: "lesson-form4-06.html"
      },
      {
        moduleId: "form4-07",
        number: "07",
        title: "Graphs of Motion",
        lessons: ["Distance-Time Graph", "Speed-Time Graph"],
        link: "lesson-form4-07.html"
      },
      {
        moduleId: "form4-08",
        number: "08",
        title: "Measures of Dispersion for Ungrouped Data",
        lessons: ["Dispersion", "Measures of Dispersion"],
        link: "lesson-form4-08.html"
      },
      {
        moduleId: "form4-09",
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
        moduleId: "form4-10",
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
        moduleId: "form5-01",
        number: "01",
        title: "Variation",
        lessons: ["Direct Variation", "Inverse Variation", "Joint Variation"],
        link: "lesson-form5-01.html"
      },
      {
        moduleId: "form5-02",
        number: "02",
        title: "Matrices",
        lessons: ["Matrix Basics", "Matrix Operations"],
        link: "lesson-form5-02.html"
      },
      {
        moduleId: "form5-03",
        number: "03",
        title: "Consumer Mathematics: Insurance",
        lessons: ["Risk Basics", "Coverage & Policy Features"],
        link: "lesson-form5-03.html"
      },
      {
        moduleId: "form5-04",
        number: "04",
        title: "Consumer Mathematics: Taxation",
        lessons: ["SST Fundamentals", "Personal Tax Calculations"],
        link: "lesson-form5-04.html"
      },
      {
        moduleId: "form5-05",
        number: "05",
        title: "Congruent, Enlargement and Combination of Transformation",
        lessons: [
          "Congruent Figures",
          "Enlargement",
          "Combination of Transformation",
          "Tessellation"
        ],
        link: "lesson-form5-05.html"
      },
      {
        moduleId: "form5-06",
        number: "06",
        title: "Ratio and Graph of Trigonometric Functions",
        lessons: [
          "Values of sine, cosine and tangent for angles from 0 to 360 degrees",
          "Graphs of trigonometric functions for sine, cosine and tangent"
        ],
        link: "lesson-form5-06.html"
      },
      {
        moduleId: "form5-07",
        number: "07",
        title: "Measures of Dispersion for Grouped Data",
        lessons: ["Grouped Data Mean & Variance", "Interquartile Range & Spread"],
        link: "lesson-form5-07.html"
      },
      {
        moduleId: "form5-08",
        number: "08",
        title: "Mathematical Modelling",
        lessons: ["Modelling Cycle", "Applications in Context"],
        link: "lesson-form5-08.html"
      }
    ]
  }
];

window.kiraModulesMap = window.kiraModules.reduce((map, section) => {
  map[section.grade] = section;
  return map;
}, {});

