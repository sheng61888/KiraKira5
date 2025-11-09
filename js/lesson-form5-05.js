(() => {
  const quizzes = {
    quizA: {
      description: "Quiz A covers congruency facts, enlargement scale factors, combined moves, and tessellation basics.",
      answerKey: ["C", "A", "B", "A", "A", "C", "C", "B", "B", "A"],
      questions: [
        {
          prompt: "Congruent figures have:",
          options: [
            { label: "A", text: "Same shape only" },
            { label: "B", text: "Same size only" },
            { label: "C", text: "Same shape and same size" },
            { label: "D", text: "Different perimeters" }
          ],
          answer: "C"
        },
        {
          prompt: "A negative scale factor in an enlargement indicates:",
          options: [
            { label: "A", text: "A reflection through the centre plus scaling" },
            { label: "B", text: "A rotation by 60 degrees" },
            { label: "C", text: "A translation" },
            { label: "D", text: "A shear" }
          ],
          answer: "A"
        },
        {
          prompt: "Under an enlargement by scale factor k, areas scale by:",
          options: [
            { label: "A", text: "k" },
            { label: "B", text: "k^2" },
            { label: "C", text: "k^3" },
            { label: "D", text: "Remain unchanged" }
          ],
          answer: "B"
        },
        {
          prompt: "A translation is determined by:",
          options: [
            { label: "A", text: "A vector" },
            { label: "B", text: "A point" },
            { label: "C", text: "A line" },
            { label: "D", text: "An angle only" }
          ],
          answer: "A"
        },
        {
          prompt: "To describe a rotation you need:",
          options: [
            { label: "A", text: "Centre and angle (plus direction)" },
            { label: "B", text: "Only a line" },
            { label: "C", text: "Only a centre" },
            { label: "D", text: "Scale factor" }
          ],
          answer: "A"
        },
        {
          prompt: "A reflection is performed across:",
          options: [
            { label: "A", text: "A point" },
            { label: "B", text: "A centre" },
            { label: "C", text: "A mirror line" },
            { label: "D", text: "A vector" }
          ],
          answer: "C"
        },
        {
          prompt: "The composition \"reflect then rotate\" compared to \"rotate then reflect\" is:",
          options: [
            { label: "A", text: "Always the same" },
            { label: "B", text: "Always the identity" },
            { label: "C", text: "Order-dependent" },
            { label: "D", text: "Impossible" }
          ],
          answer: "C"
        },
        {
          prompt: "A regular tessellation uses:",
          options: [
            { label: "A", text: "Any set of figures" },
            { label: "B", text: "One regular polygon repeated" },
            { label: "C", text: "Circles" },
            { label: "D", text: "3D solids" }
          ],
          answer: "B"
        },
        {
          prompt: "Congruent triangles can be proven using:",
          options: [
            { label: "A", text: "AAA only" },
            { label: "B", text: "SSS, SAS, or RHS (HL)" },
            { label: "C", text: "SSA always" },
            { label: "D", text: "Two angles only" }
          ],
          answer: "B"
        },
        {
          prompt: "If a rectangle is enlarged by k = 3, its perimeter becomes:",
          options: [
            { label: "A", text: "Three times the original" },
            { label: "B", text: "Nine times the original" },
            { label: "C", text: "Unchanged" },
            { label: "D", text: "One third of the original" }
          ],
          answer: "A"
        }
      ]
    },
    quizB: {
      description: "Quiz B reinforces congruent angle logic, negative scale factors, tessellations, and perimeter effects.",
      answerKey: ["A", "B", "D", "C", "A", "A", "B", "B", "B", "A"],
      questions: [
        {
          prompt: "If two shapes are congruent, their corresponding angles are:",
          options: [
            { label: "A", text: "Equal" },
            { label: "B", text: "Supplementary" },
            { label: "C", text: "Complementary" },
            { label: "D", text: "Unrelated" }
          ],
          answer: "A"
        },
        {
          prompt: "An enlargement with centre O and scale factor -2 sends P to P' such that:",
          options: [
            { label: "A", text: "OP' = 2 OP, same direction" },
            { label: "B", text: "OP' = 2 OP, opposite direction" },
            { label: "C", text: "OP' = 0.5 OP, opposite direction" },
            { label: "D", text: "OP' = OP" }
          ],
          answer: "B"
        },
        {
          prompt: "Under k = 3, a triangle with area 12 cm^2 becomes:",
          options: [
            { label: "A", text: "36 cm^2" },
            { label: "B", text: "12 cm^2" },
            { label: "C", text: "27 cm^2" },
            { label: "D", text: "108 cm^2" }
          ],
          answer: "D"
        },
        {
          prompt: "A reflection followed by the same reflection in the same line equals:",
          options: [
            { label: "A", text: "A rotation" },
            { label: "B", text: "A translation" },
            { label: "C", text: "The identity transformation" },
            { label: "D", text: "Another reflection" }
          ],
          answer: "C"
        },
        {
          prompt: "A rotation is specified by:",
          options: [
            { label: "A", text: "Centre and angle (plus direction)" },
            { label: "B", text: "Scale factor" },
            { label: "C", text: "Mirror line" },
            { label: "D", text: "Vector" }
          ],
          answer: "A"
        },
        {
          prompt: "A translation with vector [-4, 1] moves a point:",
          options: [
            { label: "A", text: "Left 4, up 1" },
            { label: "B", text: "Right 4, up 1" },
            { label: "C", text: "Left 1, up 4" },
            { label: "D", text: "Right 1, up 4" }
          ],
          answer: "A"
        },
        {
          prompt: "A semi-regular tessellation uses:",
          options: [
            { label: "A", text: "One regular polygon only" },
            { label: "B", text: "Two or more regular polygons meeting in a repeating pattern" },
            { label: "C", text: "Circles" },
            { label: "D", text: "3D cubes" }
          ],
          answer: "B"
        },
        {
          prompt: "In transformations, the composition order:",
          options: [
            { label: "A", text: "Never matters" },
            { label: "B", text: "Sometimes matters" },
            { label: "C", text: "Is always the same" },
            { label: "D", text: "Is undefined" }
          ],
          answer: "B"
        },
        {
          prompt: "If figures are similar with scale k ≠ 1, they are:",
          options: [
            { label: "A", text: "Congruent" },
            { label: "B", text: "Not congruent" },
            { label: "C", text: "Always reflections" },
            { label: "D", text: "Translations" }
          ],
          answer: "B"
        },
        {
          prompt: "An enlargement with k = 1/2 makes the perimeter:",
          options: [
            { label: "A", text: "Half the original" },
            { label: "B", text: "Double the original" },
            { label: "C", text: "Unchanged" },
            { label: "D", text: "Quadruple" }
          ],
          answer: "A"
        }
      ]
    }
  };

  if (window.kiraInitLessonQuiz) {
    window.kiraInitLessonQuiz(quizzes);
  }
})();
