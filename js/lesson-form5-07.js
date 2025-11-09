(() => {
  const quizzes = {
    quizA: {
      description: "Quiz A targets grouped-data concepts such as midpoint usage, variance formulas, quartiles, and the effect of shifts or scaling.",
      answerKey: ["B", "B", "A", "C", "C", "A", "B", "A", "C", "B"],
      questions: [
        {
          prompt: "For grouped data, the range is best approximated by:",
          options: [
            { label: "A", text: "Highest raw value minus lowest raw value" },
            { label: "B", text: "Highest class midpoint minus lowest class midpoint" },
            { label: "C", text: "Class width" },
            { label: "D", text: "Mode" }
          ],
          answer: "B"
        },
        {
          prompt: "The mean formula (sum of fx) / (sum of f) uses:",
          options: [
            { label: "A", text: "Class boundaries" },
            { label: "B", text: "Class midpoints" },
            { label: "C", text: "Class widths" },
            { label: "D", text: "Quartiles only" }
          ],
          answer: "B"
        },
        {
          prompt: "The expression (sum of fx^2) / (sum of f) - (mean)^2 gives the:",
          options: [
            { label: "A", text: "Variance" },
            { label: "B", text: "Standard deviation" },
            { label: "C", text: "Interquartile range" },
            { label: "D", text: "Mean" }
          ],
          answer: "A"
        },
        {
          prompt: "An ogive is helpful for estimating:",
          options: [
            { label: "A", text: "Mean only" },
            { label: "B", text: "Variance only" },
            { label: "C", text: "Quartiles and median" },
            { label: "D", text: "Mode only" }
          ],
          answer: "C"
        },
        {
          prompt: "If every data point increases by +5, the standard deviation:",
          options: [
            { label: "A", text: "Increases by 5" },
            { label: "B", text: "Decreases by 5" },
            { label: "C", text: "Stays the same" },
            { label: "D", text: "Becomes zero" }
          ],
          answer: "C"
        },
        {
          prompt: "If every data point is multiplied by 3, the standard deviation:",
          options: [
            { label: "A", text: "Is multiplied by 3" },
            { label: "B", text: "Is divided by 3" },
            { label: "C", text: "Is unchanged" },
            { label: "D", text: "Increases by 3" }
          ],
          answer: "A"
        },
        {
          prompt: "The interquartile range measures the spread of the:",
          options: [
            { label: "A", text: "Extreme values" },
            { label: "B", text: "Middle 50 percent" },
            { label: "C", text: "First 25 percent" },
            { label: "D", text: "Last 25 percent" }
          ],
          answer: "B"
        },
        {
          prompt: "A very large outlier mostly inflates the:",
          options: [
            { label: "A", text: "Mean and standard deviation" },
            { label: "B", text: "Median only" },
            { label: "C", text: "Interquartile range only" },
            { label: "D", text: "None of the above" }
          ],
          answer: "A"
        },
        {
          prompt: "For a right-skewed distribution, it is typical that:",
          options: [
            { label: "A", text: "Mean < median" },
            { label: "B", text: "Mean = median" },
            { label: "C", text: "Mean > median" },
            { label: "D", text: "Mean = 0" }
          ],
          answer: "C"
        },
        {
          prompt: "If the total frequency sum f = 100, the median position is at:",
          options: [
            { label: "A", text: "25th value" },
            { label: "B", text: "50th value" },
            { label: "C", text: "75th value" },
            { label: "D", text: "100th value" }
          ],
          answer: "B"
        }
      ]
    },
    quizB: {
      description: "Quiz B continues with midpoint calculations, scaling effects, and ogive interpretation from the extra set.",
      answerKey: ["C", "A", "C", "B", "C", "B", "A", "A", "A", "B"],
      questions: [
        {
          prompt: "In grouped data, the class midpoint is:",
          options: [
            { label: "A", text: "The lower boundary" },
            { label: "B", text: "The upper boundary" },
            { label: "C", text: "(lower + upper) / 2" },
            { label: "D", text: "The class width" }
          ],
          answer: "C"
        },
        {
          prompt: "The estimated mean uses:",
          options: [
            { label: "A", text: "Midpoints with frequencies" },
            { label: "B", text: "Raw data only" },
            { label: "C", text: "Quartiles only" },
            { label: "D", text: "Medians only" }
          ],
          answer: "A"
        },
        {
          prompt: "If all class midpoints increase by 10, the variance is:",
          options: [
            { label: "A", text: "Increased by 10" },
            { label: "B", text: "Decreased by 10" },
            { label: "C", text: "Unchanged" },
            { label: "D", text: "Multiplied by 10" }
          ],
          answer: "C"
        },
        {
          prompt: "If all midpoints are doubled, the standard deviation becomes:",
          options: [
            { label: "A", text: "The same" },
            { label: "B", text: "Doubled" },
            { label: "C", text: "Halved" },
            { label: "D", text: "Increased by 2" }
          ],
          answer: "B"
        },
        {
          prompt: "A cumulative frequency curve (ogive) is used to estimate:",
          options: [
            { label: "A", text: "Mode" },
            { label: "B", text: "Mean" },
            { label: "C", text: "Median and quartiles" },
            { label: "D", text: "Variance" }
          ],
          answer: "C"
        },
        {
          prompt: "If two datasets share the same mean but different SDs, the dataset with larger SD is:",
          options: [
            { label: "A", text: "Less spread" },
            { label: "B", text: "More spread" },
            { label: "C", text: "Same spread" },
            { label: "D", text: "Impossible" }
          ],
          answer: "B"
        },
        {
          prompt: "The interquartile range is less affected by:",
          options: [
            { label: "A", text: "Outliers" },
            { label: "B", text: "The centre" },
            { label: "C", text: "Symmetry" },
            { label: "D", text: "Frequency" }
          ],
          answer: "A"
        },
        {
          prompt: "In the variance formula σ^2 = (Σfx^2 / Σf) - x̄^2, x represents:",
          options: [
            { label: "A", text: "Midpoints" },
            { label: "B", text: "Boundaries" },
            { label: "C", text: "Widths" },
            { label: "D", text: "Frequencies" }
          ],
          answer: "A"
        },
        {
          prompt: "If Σf = 80, the position of Q1 on a cumulative frequency table is the:",
          options: [
            { label: "A", text: "20th value" },
            { label: "B", text: "40th value" },
            { label: "C", text: "60th value" },
            { label: "D", text: "80th value" }
          ],
          answer: "A"
        },
        {
          prompt: "The grouped-data range is roughly:",
          options: [
            { label: "A", text: "Largest minus smallest boundary" },
            { label: "B", text: "Largest minus smallest midpoint" },
            { label: "C", text: "A class width" },
            { label: "D", text: "The mode" }
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
