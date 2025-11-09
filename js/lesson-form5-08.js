(() => {
  const quizzes = {
    quizA: {
      description: "Quiz A walks through the modelling cycle: defining the problem, setting assumptions, choosing a model, and interpreting results.",
      answerKey: ["B", "B", "A", "B", "B", "B", "B", "A", "A", "B"],
      questions: [
        {
          prompt: "The first step in modelling is usually to:",
          options: [
            { label: "A", text: "Draw a graph" },
            { label: "B", text: "Define the problem" },
            { label: "C", text: "Differentiate the function" },
            { label: "D", text: "Write the report" }
          ],
          answer: "B"
        },
        {
          prompt: "An assumption in modelling is:",
          options: [
            { label: "A", text: "A guaranteed fact" },
            { label: "B", text: "A reasonable simplification" },
            { label: "C", text: "A full proof" },
            { label: "D", text: "A picture" }
          ],
          answer: "B"
        },
        {
          prompt: "If fuel used y varies directly with distance x, a simple model is:",
          options: [
            { label: "A", text: "y = kx" },
            { label: "B", text: "y = k/x" },
            { label: "C", text: "y = kx^2" },
            { label: "D", text: "y = k sqrt(x)" }
          ],
          answer: "A"
        },
        {
          prompt: "After solving a model, you should:",
          options: [
            { label: "A", text: "Ignore the context" },
            { label: "B", text: "Interpret the result and check reasonableness" },
            { label: "C", text: "Always round to 2 decimal places" },
            { label: "D", text: "Maximise the constant k" }
          ],
          answer: "B"
        },
        {
          prompt: "If predictions are far off, you should:",
          options: [
            { label: "A", text: "Throw the model away immediately" },
            { label: "B", text: "Refine assumptions or parameters" },
            { label: "C", text: "Change units randomly" },
            { label: "D", text: "Stop the project" }
          ],
          answer: "B"
        },
        {
          prompt: "A parameter like k in y = kx is best found by:",
          options: [
            { label: "A", text: "Guessing" },
            { label: "B", text: "Using given data" },
            { label: "C", text: "Ignoring the data" },
            { label: "D", text: "Dividing by zero" }
          ],
          answer: "B"
        },
        {
          prompt: "If residuals (errors) are random and small, the model fit is likely:",
          options: [
            { label: "A", text: "Poor" },
            { label: "B", text: "Good" },
            { label: "C", text: "Undefined" },
            { label: "D", text: "Impossible" }
          ],
          answer: "B"
        },
        {
          prompt: "A good modelling report should include:",
          options: [
            { label: "A", text: "Steps, assumptions, model, results, and limitations" },
            { label: "B", text: "Only emojis" },
            { label: "C", text: "Only graphs" },
            { label: "D", text: "Only final answers" }
          ],
          answer: "A"
        },
        {
          prompt: "When choosing the type of model, consider:",
          options: [
            { label: "A", text: "The underlying pattern (linear, exponential, variation, etc.)" },
            { label: "B", text: "Your favourite formula" },
            { label: "C", text: "The largest number in the question" },
            { label: "D", text: "The brightest colour" }
          ],
          answer: "A"
        },
        {
          prompt: "If y decreases as x increases at a fixed rate, a likely model is:",
          options: [
            { label: "A", text: "Joint variation" },
            { label: "B", text: "Inverse variation" },
            { label: "C", text: "Direct variation" },
            { label: "D", text: "Constant function" }
          ],
          answer: "B"
        }
      ]
    },
    quizB: {
      description: "Quiz B emphasises validation, exponential growth, residual analysis, and reporting discipline from the extra notes.",
      answerKey: ["B", "C", "B", "B", "B", "B", "A", "D", "B", "B"],
      questions: [
        {
          prompt: "After building a model, the next critical step is to:",
          options: [
            { label: "A", text: "Publish immediately" },
            { label: "B", text: "Validate with data" },
            { label: "C", text: "Ignore anomalies" },
            { label: "D", text: "Change units" }
          ],
          answer: "B"
        },
        {
          prompt: "If y grows by a constant percentage, a good model is:",
          options: [
            { label: "A", text: "Linear" },
            { label: "B", text: "Quadratic" },
            { label: "C", text: "Exponential" },
            { label: "D", text: "Constant" }
          ],
          answer: "C"
        },
        {
          prompt: "If residuals show a curved pattern against x, your linear model is likely:",
          options: [
            { label: "A", text: "Perfect" },
            { label: "B", text: "Biased or mis-specified" },
            { label: "C", text: "Too accurate" },
            { label: "D", text: "Unrelated" }
          ],
          answer: "B"
        },
        {
          prompt: "A simplifying assumption should be:",
          options: [
            { label: "A", text: "Unreasonable to speed up" },
            { label: "B", text: "Clearly stated and justified" },
            { label: "C", text: "Hidden" },
            { label: "D", text: "Random" }
          ],
          answer: "B"
        },
        {
          prompt: "To estimate parameter k in y = kx from data (xi, yi), a solid method is to:",
          options: [
            { label: "A", text: "Take one point only" },
            { label: "B", text: "Average yi / xi (or fit through origin)" },
            { label: "C", text: "Ignore the data" },
            { label: "D", text: "Swap x and y" }
          ],
          answer: "B"
        },
        {
          prompt: "If a model outputs negative lengths, you should:",
          options: [
            { label: "A", text: "Accept them" },
            { label: "B", text: "Check domain constraints" },
            { label: "C", text: "Increase decimals" },
            { label: "D", text: "Change units to feet" }
          ],
          answer: "B"
        },
        {
          prompt: "Model refinement is done when:",
          options: [
            { label: "A", text: "Predictions are off" },
            { label: "B", text: "You are bored" },
            { label: "C", text: "The exam ends" },
            { label: "D", text: "Parameters are unknown" }
          ],
          answer: "A"
        },
        {
          prompt: "In reporting, you should not omit:",
          options: [
            { label: "A", text: "Assumptions and limitations" },
            { label: "B", text: "Steps and formulas" },
            { label: "C", text: "Units" },
            { label: "D", text: "Any of these" }
          ],
          answer: "D"
        },
        {
          prompt: "A dimensionally consistent relation has:",
          options: [
            { label: "A", text: "Mismatched units" },
            { label: "B", text: "Consistent overall units on both sides" },
            { label: "C", text: "No units" },
            { label: "D", text: "Same numbers" }
          ],
          answer: "B"
        },
        {
          prompt: "If two models fit similarly well, you should prefer:",
          options: [
            { label: "A", text: "The most complex" },
            { label: "B", text: "The simplest adequate one (parsimony)" },
            { label: "C", text: "A random pick" },
            { label: "D", text: "None" }
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
