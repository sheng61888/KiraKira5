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
            id: "lesson-quadratic-functions",
            title: "Lesson 1 · Reading a parabola like a story",
            type: "lesson",
            duration: "6 min",
            summary: "Visualise how a parabola smiles, shifts, and touches the x-axis.",
            body: "Learn to read every part of a quadratic function — what 'a', 'h', and 'k' do to the curve — through minimal cinematic visuals.",
            objectives: [
              "Recognise how the sign of a affects the graph shape",
              "Identify the vertex and axis of symmetry",
              "Predict how parameter changes move the curve"
            ],
            videos: [
              {
                title: "Quadratic explainer 1",
                description: "Orient yourself with why parabolas open up or down.",
                src: "/videos/quadratic 1.mp4"
              },
              {
                title: "Quadratic explainer 2",
                description: "Vertex form demo that pins down turning points.",
                src: "/videos/quadratic 2.mp4"
              },
              {
                title: "Quadratic explainer 3",
                description: "Connect roots, stretching, and exam-style prompts.",
                src: "/videos/quadratic 3.mp4"
              }
            ],
            cta: {
              label: "Open lesson",
              link: "/html/lessons/lesson-quadratic-functions.html",
              kind: "lesson"
            }
          },
          {
            id: "quiz-quadratic-functions",
            title: "Quick Check · Quadratic Functions",
            type: "quiz",
            duration: "3 min",
            summary: "Test your understanding of factoring and identifying the ball’s landing points.",
            body: "Identify the roots of sample quadratic equations and interpret what they represent.",
            cta: {
              label: "Take quick quiz",
              link: "lessons/quiz-quadratic-functions.html",
              kind: "quiz"
            }
          },

        {
            id: "lesson-ground-hits",
            title: "Lesson 2 · The Two Moments of Impact",
            type: "lesson",
            duration: "6 min",
            summary: "Discover how the ball’s landing points reveal the roots of a quadratic equation.",
            body: "We explore what happens when the ball touches the ground — each contact point is where y = 0. You’ll learn to factor simple quadratics and see how their x-intercepts tell the full story of motion.",
            objectives: [
              "Understand the meaning of roots in a quadratic graph",
              "Factor simple quadratics to find their x-intercepts",
              "Connect real-world motion to algebraic solutions"
            ],
            cta: {
              label: "Open lesson",
              link: "/html/lessons/lesson-quadratic-equations.html",
              kind: "lesson"
            }
          },
          {
            id: "quiz-quadratic-equations",
            title: "Quick Check · Quadratic Equations",
            type: "quiz",
            duration: "3 min",
            summary: "Test your understanding of factoring and identifying the ball’s landing points.",
            body: "Identify the roots of sample quadratic equations and interpret what they represent.",
            cta: {
              label: "Take quick quiz",
              link: "lessons/quiz-quadratic-equations.html",
              kind: "quiz"
            }
          },


            {
              id: "checkpoint-final",
              title: "Last checkpoint",
              type: "checkpoint",
              duration: "10 min",
              summary: "Wrap up the module with a single sheet that mixes graphs, equations, and real-life modelling.",
              body: "Confirm you can state graph features, decide on a solving strategy, and interpret discriminant results before moving on.",
              cta: { label: "Launch chapter quiz", link: "/html/lessons/quiz-quadratic-final.html", kind: "quiz" }
            }
        ]
      },
      {
        moduleId: "form4-02",
        number: "02",
        title: "Number Bases",
        lessons: ["Number Bases"],
        link: "course-map.html?module=form4-02",
        units: [
          {
            id: "nb-overview",
            title: "Module overview",
            type: "overview",
            duration: "3 min",
            summary: "Preview why binary, octal, and hexadecimal show up in exams and computing.",
            videos: [
              {
                title: "Number bases explainer",
                description: "Quick primer on why different bases matter and how to think about them.",
                src: "/videos/number bases.mp4"
              }
            ]
          },
          {
            id: "nb-place-values",
            title: "Lesson 1 · Place values in any base",
            type: "lesson",
            duration: "5 min",
            summary: "Expand numbers in unfamiliar bases to cement positional notation.",
            objectives: [
              "Write expanded form for bases 2, 5, and 8",
              "Explain why the digit set changes with each base"
            ]
          },
          {
            id: "nb-convert-to10",
            title: "Lesson 2 · Convert to base-10",
            type: "lesson",
            duration: "6 min",
            summary: "Use expanded form to translate binary/octal/hex to base-10 quickly."
          },
          {
            id: "nb-convert-from10",
            title: "Lesson 3 · Convert from base-10",
            type: "lesson",
            duration: "6 min",
            summary: "Apply repeated division to move from base-10 to another base."
          },
          {
            id: "nb-arithmetic",
            title: "Lesson 4 · Arithmetic across bases",
            type: "lesson",
            duration: "6 min",
            summary: "Add and subtract binary/oct numbers while tracking carries and borrows."
          },
          {
            id: "nb-quiz-core",
            title: "Quick check · Core conversions",
            type: "quiz",
            duration: "4 min",
            summary: "Fast conversion drill between base-2, base-8, and base-10.",
            cta: { label: "Attempt conversion quiz", link: "../docs/module02-quiz-core.pdf", kind: "quiz" }
          },
          {
            id: "nb-application",
            title: "Lesson 5 · Application and code tables",
            type: "lesson",
            duration: "5 min",
            summary: "Tie hexadecimal to RGB/ASCII contexts for richer exam explanations."
          },
          {
            id: "nb-master-check",
            title: "Mastery check",
            type: "assessment",
            duration: "8 min",
            summary: "Six mixed conversions plus two application prompts at exam speed.",
            cta: { label: "Take mastery check", link: "../docs/module02-mastery.pdf", kind: "quiz" }
          }
        ]
      },
      {
        moduleId: "form4-03",
        number: "03",
        title: "Logical Reasoning",
        lessons: ["Statements", "Arguments"],
        link: "course-map.html?module=form4-03"
      },
      {
        moduleId: "form4-04",
        number: "04",
        title: "Operations on Sets",
        lessons: ["Intersection of Sets", "Union of Sets", "Combined Operations on Sets"],
        link: "course-map.html?module=form4-04"
      },
      {
        moduleId: "form4-05",
        number: "05",
        title: "Network in Graph Theory",
        lessons: ["Network"],
        link: "course-map.html?module=form4-05"
      },
      {
        moduleId: "form4-06",
        number: "06",
        title: "Linear Inequalities in Two Variables",
        lessons: [
          "Linear Inequalities in Two Variables",
          "Systems of Linear Inequalities in Two Variables"
        ],
        link: "course-map.html?module=form4-06"
      },
      {
        moduleId: "form4-07",
        number: "07",
        title: "Graphs of Motion",
        lessons: ["Distance-Time Graph", "Speed-Time Graph"],
        link: "course-map.html?module=form4-07"
      },
      {
        moduleId: "form4-08",
        number: "08",
        title: "Measures of Dispersion for Ungrouped Data",
        lessons: ["Dispersion", "Measures of Dispersion"],
        link: "course-map.html?module=form4-08"
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
        link: "course-map.html?module=form4-09"
      },
      {
        moduleId: "form4-10",
        number: "10",
        title: "Consumer Mathematics: Financial Management",
        lessons: ["Financial Planning and Management"],
        link: "course-map.html?module=form4-10"
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
        link: "course-map.html?module=form5-01",
        units: [
          {
            id: "overview",
            title: "Module overview",
            type: "overview",
            duration: "2 min",
            summary: "Map every KSSM Variation outcome and see how the formulas connect.",
            body: "We compare direct, inverse, and joint variation using simple modelling prompts so you know which formula to reach for.",
            objectives: [
              "Tell the difference between direct, inverse, and joint variation statements",
              "Translate real-world descriptions into variation equations",
              "Preview the checkpoints and timed drills in this module"
            ]
          },
          {
            id: "variation-intro-video",
            title: "Video - Direct, inverse, joint",
            type: "video",
            duration: "5 min",
            videos: [
              {
                title: "Variation intro",
                description: "Explains direct, inverse, and joint variation side-by-side.",
                src: "/videos/variation intro.mp4"
              }
            ]
          },
          {
            id: "lesson-direct-inverse",
            title: "Lesson 1 · Direct & inverse relationships",
            type: "lesson",
            duration: "8 min",
            summary: "Build intuition for y ∝ x and y ∝ 1/x before the algebra kicks in.",
            body: "We sketch paired values, derive constants of variation, and keep a running table to show how one variable responds when the other doubles or halves.",
            objectives: [
              "Determine the constant of variation from tables or ordered pairs",
              "Explain what happens when x scales up or down",
              "Convert between verbal descriptions and equations"
            ],
            cta: {
              label: "Open lesson",
              link: "/html/lessons/lesson-form5-variation-direct.html",
              kind: "lesson"
            }
          },
          {
            id: "lesson-joint",
            title: "Lesson 2 · Joint & combined variation",
            type: "lesson",
            duration: "7 min",
            summary: "Blend multiple variables inside one variation statement.",
            body: "We take exam-style prompts that mix joint and partial variation, highlight keywords, and coach you to isolate the constant quickly.",
            objectives: [
              "Spot when a problem mixes direct and inverse components",
              "Solve for the constant using any provided data pair",
              "Formulate predictions once the constant is known"
            ],
            resources: [
              {
                label: "Joint variation template",
                type: "worksheet",
                detail: "Fill-in-the-blank practice sheet",
                url: "/docs/form5-variation-template.pdf"
              }
            ]
          },
          {
            id: "practice-models",
            title: "Guided practice · Modelling drills",
            type: "practice",
            duration: "10 min",
            summary: "Apply variation thinking to physics-style and commerce prompts.",
            body: "Each card introduces a fresh context (elastic strings, pricing, resistors) and asks you to set up, solve, and justify the variation constant.",
            objectives: [
              "Identify the correct variation statement per context",
              "Explain how units change the constant value",
              "Check your work with dimensional reasoning"
            ],
            cta: {
              label: "Download drills",
              link: "/docs/form5-variation-drills.pdf",
              kind: "download"
            }
          },
          {
            id: "quiz-variation",
            title: "Quick check · Variation",
            type: "quiz",
            duration: "4 min",
            summary: "Mix of MCQ + structured response rooted in variation stories.",
            body: "You will write the variation equation, compute the unknown constant, and predict new values while explaining the reasoning.",
            cta: {
              label: "Take quiz",
              link: "/html/lessons/quiz-variation.html",
              kind: "quiz"
            }
          },
          {
            id: "project-variation",
            title: "Mini project · Build a comparison chart",
            type: "application",
            duration: "15 min",
            summary: "Create a single-pager that contrasts the three types of variation using your own examples.",
            body: "Students pick contexts they care about (gaming rigs, sports stats, kitchen recipes) and outline how each variation behaves differently.",
            objectives: [
              "Curate real examples for each variation type",
              "State the governing equation and constant",
              "Write a short explanation that peers can follow"
            ]
          }
        ]
      },
      {
        moduleId: "form5-02",
        number: "02",
        title: "Matrices",
        lessons: ["Matrix Basics", "Matrix Operations"],
        link: "course-map.html?module=form5-02",
        units: [
          {
            id: "overview",
            title: "Module overview",
            type: "overview",
            duration: "2 min",
            summary: "Preview the three phases: notation, operations, and applications.",
            body: "We point out the key SPM question formats so you know when to use row/column thinking versus determinants.",
            objectives: [
              "Recall how matrix order is defined",
              "Identify which operations are allowed for given matrix sizes",
              "See the checkpoints for transformations and word problems"
            ]
          },
          {
            id: "lesson-basics",
            title: "Lesson 1 · Reading & building matrices",
            type: "lesson",
            duration: "7 min",
            summary: "Turn tables into matrices and vice versa.",
            body: "We practice naming elements, writing matrix order, and extracting row/column vectors in contexts like transport schedules and inventory tables.",
            objectives: [
              "State the size of a matrix using rows × columns",
              "Reference individual entries using a_ij notation",
              "Represent worded information as matrices"
            ],
            cta: {
              label: "Open lesson",
              link: "/html/lessons/lesson-form5-matrices-basics.html",
              kind: "lesson"
            }
          },
          {
            id: "lesson-operations",
            title: "Lesson 2 · Addition, subtraction, multiplication",
            type: "lesson",
            duration: "9 min",
            summary: "Master the rules that decide when matrix operations are valid.",
            body: "We walk through compatible dimensions, scalar multiplication, and 2×2 products before connecting to transformation matrices.",
            objectives: [
              "Confirm dimension compatibility before an operation",
              "Carry out 2×2 and 2×3 matrix products",
              "Explain why matrix multiplication is not commutative"
            ],
            resources: [
              {
                label: "Operation checklist",
                type: "guide",
                detail: "Printable reminder of dimension rules",
                url: "/docs/form5-matrices-checklist.pdf"
              }
            ]
          },
          {
            id: "lesson-inverse",
            title: "Lesson 3 · Determinant & inverse",
            type: "lesson",
            duration: "8 min",
            summary: "Use determinants to decide if an inverse exists and calculate it quickly.",
            body: "We rehearse the 2×2 inverse formula, connect it to solving simultaneous equations, and point out common sign errors.",
            objectives: [
              "Compute determinants for 2×2 matrices",
              "Form the adjoint and multiply by 1/det to obtain the inverse",
              "Use inverses to solve simple linear systems"
            ]
          },
          {
            id: "practice-matrices",
            title: "Guided practice · Matrix mash-up",
            type: "practice",
            duration: "10 min",
            summary: "Alternate between quickfire drills and word problems.",
            body: "Students toggle between dimension checks, calculator-free operations, and context problems (ticketing, resource allocation).",
            cta: {
              label: "Download practice set",
              link: "/docs/form5-matrices-practice.pdf",
              kind: "download"
            }
          },
          {
            id: "quiz-matrices",
            title: "Quick check · Matrices",
            type: "quiz",
            duration: "5 min",
            summary: "Mini assessment mixing procedural and conceptual prompts.",
            body: "Expect question formats like 'Explain why this product is undefined', 'Compute the inverse', or 'Use matrices to describe a transformation'.",
            cta: {
              label: "Take quiz",
              link: "/html/lessons/quiz-matrices.html",
              kind: "quiz"
            }
          }
        ]
      },
      {
        moduleId: "form5-03",
        number: "03",
        title: "Consumer Mathematics: Insurance",
        lessons: ["Risk Basics", "Coverage & Policy Features"],
        link: "course-map.html?module=form5-03"
      },
      {
        moduleId: "form5-04",
        number: "04",
        title: "Consumer Mathematics: Taxation",
        lessons: ["SST Fundamentals", "Personal Tax Calculations"],
        link: "course-map.html?module=form5-04"
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
        link: "course-map.html?module=form5-05"
      },
      {
        moduleId: "form5-06",
        number: "06",
        title: "Ratio and Graph of Trigonometric Functions",
        lessons: [
          "Values of sine, cosine and tangent for angles from 0 to 360 degrees",
          "Graphs of trigonometric functions for sine, cosine and tangent"
        ],
        link: "course-map.html?module=form5-06"
      },
      {
        moduleId: "form5-07",
        number: "07",
        title: "Measures of Dispersion for Grouped Data",
        lessons: ["Grouped Data Mean & Variance", "Interquartile Range & Spread"],
        link: "course-map.html?module=form5-07"
      },
      {
        moduleId: "form5-08",
        number: "08",
        title: "Mathematical Modelling",
        lessons: ["Modelling Cycle", "Applications in Context"],
        link: "course-map.html?module=form5-08"
      }
    ]
  }
];

window.kiraModulesMap = window.kiraModules.reduce((map, section) => {
  map[section.grade] = section;
  return map;
}, {});

