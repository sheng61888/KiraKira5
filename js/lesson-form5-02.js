(() => {
  const quizzes = {
    quizA: {
      description: "Quiz A mixes order checks, equality tests, and multiplication rules so you stay fluent with basic matrix operations.",
      answerKey: ["D", "A", "A", "A", "B", "B", "A", "B", "B", "B"],
      questions: [
        {
          prompt: "Matrix A is 2 x 3 and matrix B is 3 x 4. What is the order of AB?",
          options: [
            { label: "A", text: "Not defined" },
            { label: "B", text: "2 x 3" },
            { label: "C", text: "3 x 3" },
            { label: "D", text: "2 x 4" }
          ],
          answer: "D"
        },
        {
          prompt: "Given [[a, 2],[3,4]] = [[1,2],[3,b]], find a and b.",
          options: [
            { label: "A", text: "(1, 4)" },
            { label: "B", text: "(4, 1)" },
            { label: "C", text: "(2, 3)" },
            { label: "D", text: "(1, 3)" }
          ],
          answer: "A"
        },
        {
          prompt: "If A = B, which statement must be true?",
          options: [
            { label: "A", text: "Same order and corresponding entries equal" },
            { label: "B", text: "Same order only" },
            { label: "C", text: "Same entries but any order" },
            { label: "D", text: "Determinants are equal" }
          ],
          answer: "A"
        },
        {
          prompt: "Evaluate [[1,2],[0,3]] + [[4,5],[6,7]].",
          options: [
            { label: "A", text: "[[5,7],[6,10]]" },
            { label: "B", text: "[[5,7],[6,9]]" },
            { label: "C", text: "[[4,10],[6,7]]" },
            { label: "D", text: "Undefined" }
          ],
          answer: "A"
        },
        {
          prompt: "Entry (i,j) of AB equals:",
          options: [
            { label: "A", text: "Sum of row j of A with column i of B" },
            { label: "B", text: "Dot product of row i of A with column j of B" },
            { label: "C", text: "Sum of all entries" },
            { label: "D", text: "Product of diagonals" }
          ],
          answer: "B"
        },
        {
          prompt: "If A and B are both 2 x 2 matrices, which statement is always true?",
          options: [
            { label: "A", text: "AB = BA" },
            { label: "B", text: "AB is defined" },
            { label: "C", text: "A + B = 0" },
            { label: "D", text: "AB is not defined" }
          ],
          answer: "B"
        },
        {
          prompt: "Compute [[2,0],[1,3]] x [[4],[5]].",
          options: [
            { label: "A", text: "[[8],[19]]" },
            { label: "B", text: "[[10],[19]]" },
            { label: "C", text: "[[8],[15]]" },
            { label: "D", text: "Undefined" }
          ],
          answer: "A"
        },
        {
          prompt: "If AB exists but BA does not, the best explanation is:",
          options: [
            { label: "A", text: "Both matrices are square" },
            { label: "B", text: "Orders do not align for BA" },
            { label: "C", text: "Matrices have the same order" },
            { label: "D", text: "Both are 1 x 1" }
          ],
          answer: "B"
        },
        {
          prompt: "What is the order of [[1, -2, 0],[3,4,5]]?",
          options: [
            { label: "A", text: "3 x 2" },
            { label: "B", text: "2 x 3" },
            { label: "C", text: "2 x 2" },
            { label: "D", text: "3 x 3" }
          ],
          answer: "B"
        },
        {
          prompt: "If A + B is defined, what must be true?",
          options: [
            { label: "A", text: "A and B are square" },
            { label: "B", text: "Order of A equals order of B" },
            { label: "C", text: "Order of A differs from order of B" },
            { label: "D", text: "AB is defined" }
          ],
          answer: "B"
        }
      ]
    },
    quizB: {
      description: "Quiz B reinforces conformability, matrix algebra identities, and a few quick computations from the new set.",
      answerKey: ["B", "A", "A", "A", "C", "B", "A", "B", "A", "D"],
      questions: [
        {
          prompt: "Matrix A is 3 x 2 and matrix B is 2 x 5. What is the order of AB?",
          options: [
            { label: "A", text: "2 x 3" },
            { label: "B", text: "3 x 5" },
            { label: "C", text: "5 x 3" },
            { label: "D", text: "Not defined" }
          ],
          answer: "B"
        },
        {
          prompt: "If [[1, x],[2,3]] equals [[1,2],[x,3]], what is x?",
          options: [
            { label: "A", text: "1" },
            { label: "B", text: "2" },
            { label: "C", text: "3" },
            { label: "D", text: "They cannot be equal" }
          ],
          answer: "A"
        },
        {
          prompt: "Evaluate [[2, -1],[4,0]] + [[-3,5],[1,7]].",
          options: [
            { label: "A", text: "[[-1,4],[5,7]]" },
            { label: "B", text: "[[-1,4],[5,6]]" },
            { label: "C", text: "[[-1,6],[5,7]]" },
            { label: "D", text: "Undefined" }
          ],
          answer: "A"
        },
        {
          prompt: "Multiply row vector [1,3] by column vector [[2],[5]].",
          options: [
            { label: "A", text: "17 (a 1 x 1 scalar)" },
            { label: "B", text: "[[2,5],[6,15]]" },
            { label: "C", text: "[[17]]" },
            { label: "D", text: "Not defined" }
          ],
          answer: "A"
        },
        {
          prompt: "Which statement is true about matrix multiplication?",
          options: [
            { label: "A", text: "If AB exists, BA must exist." },
            { label: "B", text: "If both are 2 x 2, AB = BA." },
            { label: "C", text: "Matrix multiplication is associative." },
            { label: "D", text: "Matrix addition is not commutative." }
          ],
          answer: "C"
        },
        {
          prompt: "If A is m x n and B is n x p, entry (i,j) of AB equals:",
          options: [
            { label: "A", text: "Row j of A times column i of B" },
            { label: "B", text: "Row i of A dot column j of B" },
            { label: "C", text: "Column i of A dot row j of B" },
            { label: "D", text: "Sum of A and B" }
          ],
          answer: "B"
        },
        {
          prompt: "If A + B exists, what must be true?",
          options: [
            { label: "A", text: "A and B have the same order" },
            { label: "B", text: "A and B are square" },
            { label: "C", text: "AB exists" },
            { label: "D", text: "BA exists" }
          ],
          answer: "A"
        },
        {
          prompt: "Compute [[3,1],[0,2]] x [[1,0],[4,-1]].",
          options: [
            { label: "A", text: "[[7,-1],[8,-2]]" },
            { label: "B", text: "[[7,-1],[4,-2]]" },
            { label: "C", text: "[[3,-1],[8,-2]]" },
            { label: "D", text: "[[3,0],[4,-1]]" }
          ],
          answer: "B"
        },
        {
          prompt: "Which identity is always true for conformable matrices?",
          options: [
            { label: "A", text: "(AB)^T = B^T A^T" },
            { label: "B", text: "(AB)^T = A^T B^T" },
            { label: "C", text: "AB = BA" },
            { label: "D", text: "(A + B)^T = A B^T" }
          ],
          answer: "A"
        },
        {
          prompt: "Given A = [[2,0],[0,2]] and vector x = [[p],[q]], what is Ax?",
          options: [
            { label: "A", text: "[[p],[q]]" },
            { label: "B", text: "[[2p],[q]]" },
            { label: "C", text: "[[p],[2q]]" },
            { label: "D", text: "[[2p],[2q]]" }
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
