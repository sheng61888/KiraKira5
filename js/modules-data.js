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
            duration: "1 min",
            summary: "Welcome to Function Clinic. Patients keep coming in with parabola problems. Your job? Diagnose their vertex shifts, treat their discriminant disorders, and prescribe perfect roots. Don't worry, we'll guide you along the way.",
            body: "Did you know a single negative sign can flip an entire universe?",
            objectives: [
              "Understand and master vertex form",
              "Understand and master factor form",
              "Understand and master completing-the-square surgery"
            ],
          },
          {
            id: "rescue-intro",
            title: "Intro video: Quadratic intuition",
            type: "video",
            duration: "4 min",
            rescueOnly: true,
            summary: "Need a slower start? Watch this primer on how parabolas move when a, h, or k change.",
            body: "We walk through the vertex form, label every parameter, and show how to sketch without a calculator.",
            objectives: [
              "Spot vertex, axis of symmetry, opening direction in seconds",
              "Link transformations to real graph images"
            ],
            cta: {
              label: "Play rescue video",
              link: "https://www.youtube.com/watch?v=bgM8F1J-rescue",
              kind: "video"
            }
          },
          {
            id: "lesson-quadratic-intro",
            title: "Lesson 1 · How Parabolas Feel",
            type: "lesson",
            duration: "8 min",
            summary: "Meet the parabola. Learn how its mood changes when a, b and c shift.",
            body: "We’ll explore how y = ax² + bx + c behaves when each coefficient changes.",
            objectives: [
              "Recognise how ‘a’ controls smile/frown + width",
              "See how ‘b’ moves the vertex sideways",
              "See how ‘c’ shifts the curve up/down"
            ],
            cta: { label: "Open interactive lesson", link: "/html/lessons/lesson-quadratic-intro.html", kind: "lesson" }
          },

          {
            id: "quiz-vertex-sense",
            title: "Quick check · Graph sense",
            type: "quiz",
            duration: "3 min",
            summary: "Match three vertex-form equations to their graphs.",
            body: "You have 90 seconds per prompt. Focus on identifying vertex + opening direction.",
            cta: { label: "Start quiz", link: "../docs/module01-quiz-vertex.html", kind: "quiz" }
          },
          {
            id: "lesson-form-switch",
            title: "Lesson 2 · Switch between forms",
            type: "lesson",
            duration: "6 min",
            summary: "Convert standard form to vertex/factored form in bite-sized steps.",
            body: "We complete the square on a guided worksheet, then factor friendly quadratics to spot roots.",
            objectives: [
              "Complete the square without losing constant terms",
              "Explain when factoring beats the square method"
            ],

          },
          {
            id: "quiz-form-switch",
            title: "Quick check · Form shuffle",
            type: "quiz",
            duration: "4 min",
            summary: "Two conversions with instant feedback and hints if you get stuck.",
            body: "Convert the given standard form to vertex form, then to factored form.",
            cta: { label: "Try shuffle quiz", link: "../docs/module01-quiz-forms.html", kind: "quiz" }
          },
          {
            id: "lesson-solving-paths",
            title: "Lesson 3 · Choose the solving path",
            type: "lesson",
            duration: "6 min",
            summary: "Classify quadratics and lock in the fastest solving method.",
            body: "Sort cards into 'factor', 'complete square', 'quadratic formula' buckets and justify each choice.",
            objectives: [
              "Classify quadratics by structure",
              "State a reason behind each solving choice"
            ],

          },
          {
            id: "quiz-solving-paths",
            title: "Quick check · Solve + explain",
            type: "quiz",
            duration: "4 min",
            summary: "Solve two equations and type one-sentence reasoning after each answer.",
            body: "Focus on communicating why your method worked, not just the final root.",
            cta: { label: "Take reasoning quiz", link: "../docs/module01-quiz-solve.html", kind: "quiz" }
          },
          {
            id: "lesson-modelling",
            title: "Lesson 4 · Model real situations",
            type: "lesson",
            duration: "5 min",
            summary: "Translate revenue and projectile prompts into quadratics.",
            body: "Use the modelling canvas: identify variables, write the quadratic, and interpret the vertex or roots.",
            objectives: [
              "Build quadratic models from short scenarios",
              "Interpret vertex/roots in context"
            ],

          },
          {
            id: "quiz-application",
            title: "Quick check · Application",
            type: "quiz",
            duration: "4 min",
            summary: "Two context problems that ask what the vertex or roots mean.",
            body: "Explain whether your solutions fit the real-world restriction.",
            cta: { label: "Start context quiz", link: "../docs/module01-quiz-context.html", kind: "quiz" }
          },
          {
            id: "final-test",
            title: "Final mastery test",
            type: "assessment",
            duration: "10 min",
            summary: "6-question timed drill mixing graphs, solving, and modelling.",
            body: "Attempt under exam timing. Mark whether each question felt easy, medium, or panic.",
            cta: { label: "Begin timed test", link: "../docs/module01-mastery.pdf", kind: "quiz" }
          },
          {
            id: "practice-bank",
            title: "Practice question bank",
            type: "practice",
            duration: "15 min",
            summary: "Extra questions sorted by skill so you can keep drilling weak spots.",
            body: "Pick any row and attempt 4 questions. Log mistakes in your notebook.",
            resources: [
              { label: "Practice set", type: "sheet", detail: "18 questions + answers", url: "../docs/module01-practice.pdf" }
            ],
            cta: { label: "Open practice set", link: "../docs/module01-practice.pdf", kind: "download" }
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
