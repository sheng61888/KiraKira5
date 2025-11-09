document.addEventListener("DOMContentLoaded", () => {
    const quizTabs = document.querySelectorAll(".quiz-tab");
    const quizDescription = document.getElementById("quizDescription");
    const quizContent = document.getElementById("quizContent");
    const submitBtn = document.getElementById("submitQuiz");
    const resetBtn = document.getElementById("resetQuiz");
    const summaryEl = document.getElementById("quizSummary");
    const answerKeyWrapper = document.getElementById("answerKeyWrapper");
    const answerKeyContent = document.getElementById("answerKeyContent");

    const quizzes = {
        quizA: {
            description: "Here are 10 SPM Form 4 MCQs on Quadratic Functions & Equations. Answers at the end.",
            answerKey: ["B", "B", "A", "C", "B", "B", "B", "A", "D", "B"],
            questions: [
                {
                    prompt: "Which of the following is a quadratic function in one variable?",
                    options: [
                        { label: "A", text: "y = x^3 - x" },
                        { label: "B", text: "y = (x + 1)^2 - 5" },
                        { label: "C", text: "y = sqrt(x) + 1" },
                        { label: "D", text: "y = xy + 1" }
                    ],
                    answer: "B"
                },
                {
                    prompt: "The roots of x^2 - 5x + 6 = 0 are",
                    options: [
                        { label: "A", text: "x = -2, -3" },
                        { label: "B", text: "x = 2, 3" },
                        { label: "C", text: "x = -2, 3" },
                        { label: "D", text: "x = 1, 6" }
                    ],
                    answer: "B"
                },
                {
                    prompt: "For 2x^2 + 3x + 5 = 0, the number of real roots is",
                    options: [
                        { label: "A", text: "none" },
                        { label: "B", text: "one repeated root" },
                        { label: "C", text: "two equal roots" },
                        { label: "D", text: "two distinct real roots" }
                    ],
                    answer: "A"
                },
                {
                    prompt: "The axis of symmetry of y = -3x^2 + 6x - 4 is",
                    options: [
                        { label: "A", text: "x = -1" },
                        { label: "B", text: "x = 0" },
                        { label: "C", text: "x = 1" },
                        { label: "D", text: "x = 2" }
                    ],
                    answer: "C"
                },
                {
                    prompt: "The minimum value of y = x^2 - 4x + 7 is",
                    options: [
                        { label: "A", text: "-3" },
                        { label: "B", text: "3" },
                        { label: "C", text: "7" },
                        { label: "D", text: "11" }
                    ],
                    answer: "B"
                },
                {
                    prompt: "The range of y = -x^2 + 4x - 1 is",
                    options: [
                        { label: "A", text: "y >= 3" },
                        { label: "B", text: "y <= 3" },
                        { label: "C", text: "y >= -1" },
                        { label: "D", text: "all real numbers" }
                    ],
                    answer: "B"
                },
                {
                    prompt: "The equation x^2 - 6x + k = 0 has equal roots when",
                    options: [
                        { label: "A", text: "k = 6" },
                        { label: "B", text: "k = 9" },
                        { label: "C", text: "k = 3" },
                        { label: "D", text: "k = 0" }
                    ],
                    answer: "B"
                },
                {
                    prompt: "For 3x^2 - 5x + 2 = 0, the sum and product of the roots are",
                    options: [
                        { label: "A", text: "sum = 5/3, product = 2/3" },
                        { label: "B", text: "sum = -5/3, product = 2/3" },
                        { label: "C", text: "sum = 5/3, product = -2/3" },
                        { label: "D", text: "sum = -5/3, product = -2/3" }
                    ],
                    answer: "A"
                },
                {
                    prompt: "A ball's height h(t) = -5t^2 + 20t + 3. When h = 0, the positive time t is approximately",
                    options: [
                        { label: "A", text: "0.14 s" },
                        { label: "B", text: "2.00 s" },
                        { label: "C", text: "3.00 s" },
                        { label: "D", text: "4.15 s" }
                    ],
                    answer: "D"
                },
                {
                    prompt: "A quadratic with leading coefficient 2 has roots 2 and -3. Which is the equation?",
                    options: [
                        { label: "A", text: "2x^2 - 2x - 12 = 0" },
                        { label: "B", text: "2x^2 + 2x - 12 = 0" },
                        { label: "C", text: "2x^2 - 2x + 12 = 0" },
                        { label: "D", text: "2x^2 + 2x + 12 = 0" }
                    ],
                    answer: "B"
                }
            ]
        },
        quizB: {
            description: "Here are 10 tougher Form 4 quadratic MCQs. Answers at the end.",
            answerKey: ["D", "C", "A", "C", "B", "C", "B", "C", "B", "B"],
            questions: [
                {
                    prompt: "The line y = mx + 1 is tangent to y = x^2 - 4x + 7. Which m is possible?",
                    options: [
                        { label: "A", text: "-2" },
                        { label: "B", text: "-1" },
                        { label: "C", text: "1" },
                        { label: "D", text: "2" }
                    ],
                    answer: "D"
                },
                {
                    prompt: "The equation 2x^2 + px + 8 = 0 has equal roots. Find p.",
                    options: [
                        { label: "A", text: "-8" },
                        { label: "B", text: "-sqrt(64)" },
                        { label: "C", text: "plus or minus 8" },
                        { label: "D", text: "plus or minus 4sqrt(2)" }
                    ],
                    answer: "C"
                },
                {
                    prompt: "The vertex of y = ax^2 + bx + c is at (3, -5) and the graph passes through (1, 3). What is a?",
                    options: [
                        { label: "A", text: "-2" },
                        { label: "B", text: "-1" },
                        { label: "C", text: "-1/2" },
                        { label: "D", text: "1" }
                    ],
                    answer: "A"
                },
                {
                    prompt: "If the roots of x^2 - kx + 6 = 0 are integers, which k is possible?",
                    options: [
                        { label: "A", text: "1" },
                        { label: "B", text: "3" },
                        { label: "C", text: "5" },
                        { label: "D", text: "7" }
                    ],
                    answer: "C"
                },
                {
                    prompt: "For y = -(x - 2)^2 + 9, which statement is true?",
                    options: [
                        { label: "A", text: "Minimum value is -9" },
                        { label: "B", text: "Maximum value is 9" },
                        { label: "C", text: "Axis of symmetry is y = 2" },
                        { label: "D", text: "Range is y >= -9" }
                    ],
                    answer: "B"
                },
                {
                    prompt: "The product of the roots of 3x^2 - 7x + t = 0 is 2. What is t?",
                    options: [
                        { label: "A", text: "-6" },
                        { label: "B", text: "2" },
                        { label: "C", text: "6" },
                        { label: "D", text: "2/3" }
                    ],
                    answer: "C"
                },
                {
                    prompt: "A quadratic y = x^2 + px + q has one root at x = 4 and its axis of symmetry is x = 5. What is p?",
                    options: [
                        { label: "A", text: "-8" },
                        { label: "B", text: "-10" },
                        { label: "C", text: "-5" },
                        { label: "D", text: "-9" }
                    ],
                    answer: "B"
                },
                {
                    prompt: "The graph of y = x^2 - 6x + k touches the x-axis (one real root). Which k is correct?",
                    options: [
                        { label: "A", text: "k = 0" },
                        { label: "B", text: "k = 5" },
                        { label: "C", text: "k = 9" },
                        { label: "D", text: "k = 12" }
                    ],
                    answer: "C"
                },
                {
                    prompt: "The line y = 2x + c intersects y = -x^2 + 4x + 1 at two distinct points. Which inequality on c is true?",
                    options: [
                        { label: "A", text: "c < -3" },
                        { label: "B", text: "-3 < c < 3" },
                        { label: "C", text: "c > 3" },
                        { label: "D", text: "c is not equal to 3" }
                    ],
                    answer: "B"
                },
                {
                    prompt: "If x1 and x2 are roots of x^2 - 4x - 1 = 0, the quadratic with roots x1 + 1 and x2 + 1 is",
                    options: [
                        { label: "A", text: "x^2 - 6x - 1 = 0" },
                        { label: "B", text: "x^2 - 2x - 1 = 0" },
                        { label: "C", text: "x^2 - 4x + 1 = 0" },
                        { label: "D", text: "x^2 - 2x + 1 = 0" }
                    ],
                    answer: "B"
                }
            ]
        }
    };

    let activeQuiz = "quizA";

    const buildAnswerKeyList = answers => {
        const list = document.createElement("ol");
        list.className = "answer-key-list";
        answers.forEach(answer => {
            const item = document.createElement("li");
            item.textContent = answer;
            list.appendChild(item);
        });
        return list;
    };

    const clearFeedback = () => {
        summaryEl.textContent = "";
        answerKeyWrapper.classList.add("is-hidden");
        answerKeyContent.innerHTML = "";
    };

    const renderQuiz = () => {
        const quiz = quizzes[activeQuiz];
        quizDescription.textContent = quiz.description;
        quizContent.innerHTML = "";
        clearFeedback();

        quiz.questions.forEach((question, index) => {
            const card = document.createElement("article");
            card.className = "quiz-card";
            card.dataset.questionIndex = index.toString();

            const heading = document.createElement("h3");
            heading.textContent = `${index + 1}. ${question.prompt}`;
            card.appendChild(heading);

            const optionsWrapper = document.createElement("div");
            optionsWrapper.className = "quiz-options";

            question.options.forEach(option => {
                const label = document.createElement("label");
                const input = document.createElement("input");
                input.type = "radio";
                input.name = `${activeQuiz}-q${index}`;
                input.value = option.label;
                label.appendChild(input);
                const optionText = document.createTextNode(` ${option.label}. ${option.text}`);
                label.appendChild(optionText);
                optionsWrapper.appendChild(label);
            });

            card.appendChild(optionsWrapper);

            const feedback = document.createElement("p");
            feedback.className = "quiz-feedback";
            feedback.setAttribute("aria-live", "polite");
            card.appendChild(feedback);

            quizContent.appendChild(card);
        });
    };

    const setActiveTab = quizId => {
        activeQuiz = quizId;
        quizTabs.forEach(tab => {
            tab.classList.toggle("active", tab.dataset.quiz === quizId);
        });
        renderQuiz();
    };

    const gradeQuiz = () => {
        const quiz = quizzes[activeQuiz];
        const questionCards = quizContent.querySelectorAll(".quiz-card");
        let correctCount = 0;

        questionCards.forEach((card, index) => {
            const selected = card.querySelector("input[type='radio']:checked");
            const feedback = card.querySelector(".quiz-feedback");
            feedback.textContent = "";
            feedback.classList.remove("quiz-feedback--success", "quiz-feedback--error", "quiz-feedback--warning");

            if (!selected) {
                feedback.textContent = "Choose an option.";
                feedback.classList.add("quiz-feedback--warning");
                return;
            }

            if (selected.value === quiz.questions[index].answer) {
                correctCount += 1;
                feedback.textContent = "Correct.";
                feedback.classList.add("quiz-feedback--success");
            } else {
                feedback.textContent = `Incorrect. Correct answer: ${quiz.questions[index].answer}.`;
                feedback.classList.add("quiz-feedback--error");
            }
        });

        summaryEl.textContent = `You answered ${correctCount} out of ${quiz.questions.length} correctly.`;
        answerKeyWrapper.classList.remove("is-hidden");
        answerKeyContent.innerHTML = "";
        answerKeyContent.appendChild(buildAnswerKeyList(quiz.answerKey));
    };

    const resetQuiz = () => {
        const inputs = quizContent.querySelectorAll("input[type='radio']");
        inputs.forEach(input => {
            input.checked = false;
        });
        const feedbackEls = quizContent.querySelectorAll(".quiz-feedback");
        feedbackEls.forEach(fb => {
            fb.textContent = "";
            fb.classList.remove("quiz-feedback--success", "quiz-feedback--error", "quiz-feedback--warning");
        });
        clearFeedback();
    };

    quizTabs.forEach(tab => {
        tab.addEventListener("click", () => {
            const quizId = tab.dataset.quiz;
            if (quizId && quizId !== activeQuiz) {
                setActiveTab(quizId);
            }
        });
    });

    submitBtn.addEventListener("click", gradeQuiz);
    resetBtn.addEventListener("click", resetQuiz);

    renderQuiz();
});
