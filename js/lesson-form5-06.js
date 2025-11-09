(() => {
  const quizzes = {
    quizA: {
      description: "Quiz A drills exact trig ratios, ASTC quadrant signs, and the key features of sine, cosine, and tangent graphs.",
      answerKey: ["B", "C", "C", "B", "D", "B", "B", "A", "B", "C"],
      questions: [
        {
          prompt: "sin 30 degrees equals:",
          options: [
            { label: "A", text: "0" },
            { label: "B", text: "1/2" },
            { label: "C", text: "sqrt(2)/2" },
            { label: "D", text: "sqrt(3)/2" }
          ],
          answer: "B"
        },
        {
          prompt: "cos 180 degrees equals:",
          options: [
            { label: "A", text: "1" },
            { label: "B", text: "0" },
            { label: "C", text: "-1" },
            { label: "D", text: "1/2" }
          ],
          answer: "C"
        },
        {
          prompt: "tan 45 degrees equals:",
          options: [
            { label: "A", text: "0" },
            { label: "B", text: "1/2" },
            { label: "C", text: "1" },
            { label: "D", text: "Undefined" }
          ],
          answer: "C"
        },
        {
          prompt: "The range of y = sin x is:",
          options: [
            { label: "A", text: "[0, 1]" },
            { label: "B", text: "[-1, 1]" },
            { label: "C", text: "(-infinity, infinity)" },
            { label: "D", text: "[1, infinity)" }
          ],
          answer: "B"
        },
        {
          prompt: "The period of y = cos x (in degrees) is:",
          options: [
            { label: "A", text: "90" },
            { label: "B", text: "180" },
            { label: "C", text: "270" },
            { label: "D", text: "360" }
          ],
          answer: "D"
        },
        {
          prompt: "y = tan x has vertical asymptotes at:",
          options: [
            { label: "A", text: "x = 90 + 360n degrees" },
            { label: "B", text: "x = 90 + 180n degrees" },
            { label: "C", text: "x = 180n degrees" },
            { label: "D", text: "x = 45 + 180n degrees" }
          ],
          answer: "B"
        },
        {
          prompt: "For y = 2 sin x, the amplitude is:",
          options: [
            { label: "A", text: "1" },
            { label: "B", text: "2" },
            { label: "C", text: "1/2" },
            { label: "D", text: "Unchanged" }
          ],
          answer: "B"
        },
        {
          prompt: "Zeros of y = sin x between 0 and 360 degrees occur at:",
          options: [
            { label: "A", text: "0, 180, 360 degrees" },
            { label: "B", text: "90, 270 degrees" },
            { label: "C", text: "0, 90, 180 degrees" },
            { label: "D", text: "None" }
          ],
          answer: "A"
        },
        {
          prompt: "In Quadrant III, sin theta is:",
          options: [
            { label: "A", text: "Positive" },
            { label: "B", text: "Negative" },
            { label: "C", text: "Zero" },
            { label: "D", text: "Undefined" }
          ],
          answer: "B"
        },
        {
          prompt: "y = cos x reaches its minimum between 0 and 360 degrees at:",
          options: [
            { label: "A", text: "0 degrees" },
            { label: "B", text: "90 degrees" },
            { label: "C", text: "180 degrees" },
            { label: "D", text: "360 degrees" }
          ],
          answer: "C"
        }
      ]
    },
    quizB: {
      description: "Quiz B continues with cosine, sine, and tangent values, graph parameters, and ASTC logic from the second set.",
      answerKey: ["B", "B", "C", "B", "C", "A", "B", "B", "A", "B"],
      questions: [
        {
          prompt: "cos 60 degrees equals:",
          options: [
            { label: "A", text: "0" },
            { label: "B", text: "1/2" },
            { label: "C", text: "sqrt(2)/2" },
            { label: "D", text: "sqrt(3)/2" }
          ],
          answer: "B"
        },
        {
          prompt: "sin 210 degrees equals:",
          options: [
            { label: "A", text: "1/2" },
            { label: "B", text: "-1/2" },
            { label: "C", text: "sqrt(3)/2" },
            { label: "D", text: "0" }
          ],
          answer: "B"
        },
        {
          prompt: "tan 270 degrees is:",
          options: [
            { label: "A", text: "0" },
            { label: "B", text: "1" },
            { label: "C", text: "Undefined" },
            { label: "D", text: "-1" }
          ],
          answer: "C"
        },
        {
          prompt: "The amplitude of y = 3 cos x is:",
          options: [
            { label: "A", text: "1" },
            { label: "B", text: "3" },
            { label: "C", text: "1/3" },
            { label: "D", text: "None" }
          ],
          answer: "B"
        },
        {
          prompt: "The period of y = sin(x - 30 degrees) is:",
          options: [
            { label: "A", text: "180 degrees" },
            { label: "B", text: "270 degrees" },
            { label: "C", text: "360 degrees" },
            { label: "D", text: "Depends on the shift" }
          ],
          answer: "C"
        },
        {
          prompt: "The phase shift of y = sin(x - 60 degrees) is:",
          options: [
            { label: "A", text: "Right 60 degrees" },
            { label: "B", text: "Left 60 degrees" },
            { label: "C", text: "Up 60 units" },
            { label: "D", text: "No shift" }
          ],
          answer: "A"
        },
        {
          prompt: "Zeros of y = cos x on 0 ≤ x ≤ 360 degrees occur at:",
          options: [
            { label: "A", text: "0 and 180 degrees" },
            { label: "B", text: "90 and 270 degrees" },
            { label: "C", text: "180 degrees only" },
            { label: "D", text: "There are no zeros" }
          ],
          answer: "B"
        },
        {
          prompt: "tan x repeats every:",
          options: [
            { label: "A", text: "90 degrees" },
            { label: "B", text: "180 degrees" },
            { label: "C", text: "270 degrees" },
            { label: "D", text: "360 degrees" }
          ],
          answer: "B"
        },
        {
          prompt: "In Quadrant II, which trig function is positive?",
          options: [
            { label: "A", text: "sin" },
            { label: "B", text: "cos" },
            { label: "C", text: "tan" },
            { label: "D", text: "None" }
          ],
          answer: "A"
        },
        {
          prompt: "The range of y = -2 sin x is:",
          options: [
            { label: "A", text: "[-1, 1]" },
            { label: "B", text: "[-2, 2]" },
            { label: "C", text: "[0, 2]" },
            { label: "D", text: "[-2, 0]" }
          ],
          answer: "B"
        }
      ]
    }
  };

  if (window.kiraInitLessonQuiz) {
    window.kiraInitLessonQuiz(quizzes);
  }
})();
