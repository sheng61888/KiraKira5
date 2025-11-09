(() => {
  const quizzes = {
    quizA: {
      description: "Quiz A checks direct, inverse, and joint variation statements plus how percentage changes impact the dependent variable.",
      answerKey: ["D", "B", "C", "A", "C", "B", "B", "B", "D", "B"],
      questions: [
        {
          prompt: "If y varies directly as x and y = 18 when x = 6, what is y when x = 10?",
          options: [
            { label: "A", text: "20" },
            { label: "B", text: "24" },
            { label: "C", text: "27" },
            { label: "D", text: "30" }
          ],
          answer: "D"
        },
        {
          prompt: "y varies inversely as x. If y = 5 at x = 4, find y when x = 10.",
          options: [
            { label: "A", text: "1" },
            { label: "B", text: "2" },
            { label: "C", text: "3" },
            { label: "D", text: "4" }
          ],
          answer: "B"
        },
        {
          prompt: "y is directly proportional to x^2. If y = 45 when x = 3, what is y when x = 5?",
          options: [
            { label: "A", text: "75" },
            { label: "B", text: "100" },
            { label: "C", text: "125" },
            { label: "D", text: "135" }
          ],
          answer: "C"
        },
        {
          prompt: "y is inversely proportional to x^2. If y = 8 when x = 1, what is y when x = 4?",
          options: [
            { label: "A", text: "0.5" },
            { label: "B", text: "1" },
            { label: "C", text: "2" },
            { label: "D", text: "4" }
          ],
          answer: "A"
        },
        {
          prompt: "y varies jointly as x and z. If y = 24 when x = 3 and z = 4, what is y when x = 5 and z = 6?",
          options: [
            { label: "A", text: "40" },
            { label: "B", text: "48" },
            { label: "C", text: "60" },
            { label: "D", text: "80" }
          ],
          answer: "C"
        },
        {
          prompt: "If y = kx and x increases by 20%, how does y change?",
          options: [
            { label: "A", text: "Increases by 10%" },
            { label: "B", text: "Increases by 20%" },
            { label: "C", text: "Increases by 40%" },
            { label: "D", text: "No change" }
          ],
          answer: "B"
        },
        {
          prompt: "Given y = k / x, doubling x makes y become:",
          options: [
            { label: "A", text: "Double" },
            { label: "B", text: "Half" },
            { label: "C", text: "Unchanged" },
            { label: "D", text: "Increase by 2" }
          ],
          answer: "B"
        },
        {
          prompt: "In the model y = kx^2z, ensuring the units of k make the overall units of y correct is called:",
          options: [
            { label: "A", text: "Scaling" },
            { label: "B", text: "Dimensional consistency" },
            { label: "C", text: "Averaging" },
            { label: "D", text: "Interpolation" }
          ],
          answer: "B"
        },
        {
          prompt: "Which of the following is not a joint variation?",
          options: [
            { label: "A", text: "y = kxz" },
            { label: "B", text: "y = k / (xz)" },
            { label: "C", text: "y = kx^2z" },
            { label: "D", text: "y = kx" }
          ],
          answer: "D"
        },
        {
          prompt: "If y is directly proportional to x and y = 7 when x = 2, what is k?",
          options: [
            { label: "A", text: "2" },
            { label: "B", text: "3.5" },
            { label: "C", text: "7" },
            { label: "D", text: "14" }
          ],
          answer: "B"
        }
      ]
    },
    quizB: {
      description: "Quiz B adds more proportional reasoning, joint variation modelling, and inverse scenarios just like the new set you shared.",
      answerKey: ["C", "A", "B", "B", "C", "B", "A", "B", "C", "D"],
      questions: [
        {
          prompt: "If y varies directly as x and x falls by 25%, what happens to y?",
          options: [
            { label: "A", text: "Decreases by 25 percentage points" },
            { label: "B", text: "Increases by 25%" },
            { label: "C", text: "Becomes 75% of the original value" },
            { label: "D", text: "Becomes 125% of the original value" }
          ],
          answer: "C"
        },
        {
          prompt: "Given y varies inversely as x, if y = 12 when x = 5, what is y when x = 15?",
          options: [
            { label: "A", text: "4" },
            { label: "B", text: "5" },
            { label: "C", text: "6" },
            { label: "D", text: "3" }
          ],
          answer: "A"
        },
        {
          prompt: "For y proportional to x^2, the pair (x, y) = (2, 18) is given. Find y when x = 5.",
          options: [
            { label: "A", text: "45" },
            { label: "B", text: "90" },
            { label: "C", text: "112.5" },
            { label: "D", text: "50" }
          ],
          answer: "B"
        },
        {
          prompt: "If y varies inversely as x^2 and y = 20 when x = 1, what value of x makes y = 1.25?",
          options: [
            { label: "A", text: "2" },
            { label: "B", text: "4" },
            { label: "C", text: "The square root of 16" },
            { label: "D", text: "The square root of (20 / 1.25)" }
          ],
          answer: "B"
        },
        {
          prompt: "If y varies jointly as xz, y = 30 when x = 3 and z = 5. Find y when x = 8 and z = 2.",
          options: [
            { label: "A", text: "32" },
            { label: "B", text: "40" },
            { label: "C", text: "48" },
            { label: "D", text: "80" }
          ],
          answer: "C"
        },
        {
          prompt: "For y = kx^2z, the data x = 2, z = 3, y = 24 is provided. What is k?",
          options: [
            { label: "A", text: "2" },
            { label: "B", text: "1" },
            { label: "C", text: "4" },
            { label: "D", text: "6" }
          ],
          answer: "B"
        },
        {
          prompt: "If xy = 60 (inverse variation) and x increases by 50%, y becomes:",
          options: [
            { label: "A", text: "Two-thirds of the original value" },
            { label: "B", text: "Three-halves of the original value" },
            { label: "C", text: "1.5" },
            { label: "D", text: "Unchanged" }
          ],
          answer: "A"
        },
        {
          prompt: "Which table of values could represent direct variation y = kx?",
          options: [
            { label: "A", text: "(2,10) and (4,25)" },
            { label: "B", text: "(2,6) and (4,12)" },
            { label: "C", text: "(2,8) and (4,20)" },
            { label: "D", text: "(2,9) and (4,18.5)" }
          ],
          answer: "B"
        },
        {
          prompt: "If y = k sqrt(x) and y = 12 when x = 9, what is y when x = 25?",
          options: [
            { label: "A", text: "10" },
            { label: "B", text: "12" },
            { label: "C", text: "20" },
            { label: "D", text: "15" }
          ],
          answer: "C"
        },
        {
          prompt: "Which equation is not inverse variation?",
          options: [
            { label: "A", text: "y = 12 / x" },
            { label: "B", text: "xy = 7" },
            { label: "C", text: "y = k / x^2" },
            { label: "D", text: "y = kx" }
          ],
          answer: "D"
        }
      ]
    }
  };

  if (window.kiraInitLessonQuiz) {
    window.kiraInitLessonQuiz(quizzes);
  }
})();
