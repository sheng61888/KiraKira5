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
            description: "Quiz A checks boundary types, shading, and basic interpretation of single inequalities.",
            answerKey: ["B", "C", "C", "D", "B", "A"],
            questions: [
                {
                    prompt: "The boundary of 2x + y <= 6 is",
                    options: [
                        { label: "A", text: "Dashed" },
                        { label: "B", text: "Solid" },
                        { label: "C", text: "Curved" },
                        { label: "D", text: "No boundary" }
                    ],
                    answer: "B"
                },
                {
                    prompt: "Which point satisfies x + 2y < 4?",
                    options: [
                        { label: "A", text: "(2, 1)" },
                        { label: "B", text: "(0, 2)" },
                        { label: "C", text: "(1, 1)" },
                        { label: "D", text: "(2, 2)" }
                    ],
                    answer: "C"
                },
                {
                    prompt: "The solution region of y > 3x - 1 lies",
                    options: [
                        { label: "A", text: "Below the boundary line" },
                        { label: "B", text: "On the boundary only" },
                        { label: "C", text: "Above the boundary line" },
                        { label: "D", text: "On and below the boundary" }
                    ],
                    answer: "C"
                },
                {
                    prompt: "For 3x - 2y >= 6, the y-intercept of the boundary line equals",
                    options: [
                        { label: "A", text: "3" },
                        { label: "B", text: "-3" },
                        { label: "C", text: "(0, 3)" },
                        { label: "D", text: "(0, -3)" }
                    ],
                    answer: "D"
                },
                {
                    prompt: "The system x >= 0 and y >= 0 describes",
                    options: [
                        { label: "A", text: "The third quadrant" },
                        { label: "B", text: "The first quadrant" },
                        { label: "C", text: "The second quadrant" },
                        { label: "D", text: "The fourth quadrant" }
                    ],
                    answer: "B"
                },
                {
                    prompt: "Which inequality represents the region above the line y = -0.5x + 4?",
                    options: [
                        { label: "A", text: "y > -0.5x + 4" },
                        { label: "B", text: "y < -0.5x + 4" },
                        { label: "C", text: "y <= -0.5x + 4" },
                        { label: "D", text: "x > 4" }
                    ],
                    answer: "A"
                }
            ]
        },
        quizB: {
            description: "Quiz B focuses on test points, boundary style, and feasible regions for small systems.",
            answerKey: ["B", "A", "C", "C", "D", "C"],
            questions: [
                {
                    prompt: "Which point satisfies 2x - 3y > 6?",
                    options: [
                        { label: "A", text: "(0, 0)" },
                        { label: "B", text: "(6, 0)" },
                        { label: "C", text: "(3, 0)" },
                        { label: "D", text: "(0, -3)" }
                    ],
                    answer: "B"
                },
                {
                    prompt: "The boundary of y < -x + 5 is the line",
                    options: [
                        { label: "A", text: "y = -x + 5, dashed" },
                        { label: "B", text: "y = -x + 5, solid" },
                        { label: "C", text: "x = -y + 5, solid" },
                        { label: "D", text: "x = -y + 5, dashed" }
                    ],
                    answer: "A"
                },
                {
                    prompt: "The feasible region for {x + y <= 4, x >= 1, y >= 0} is a",
                    options: [
                        { label: "A", text: "Line" },
                        { label: "B", text: "Half-plane" },
                        { label: "C", text: "Triangle" },
                        { label: "D", text: "Circle" }
                    ],
                    answer: "C"
                },
                {
                    prompt: "Which inequality shades below the line y = 2x + 1?",
                    options: [
                        { label: "A", text: "y >= 2x + 1" },
                        { label: "B", text: "y > 2x + 1" },
                        { label: "C", text: "y <= 2x + 1" },
                        { label: "D", text: "x <= 2y + 1" }
                    ],
                    answer: "C"
                },
                {
                    prompt: "If a point lies on the boundary x - 2y = 4, it satisfies",
                    options: [
                        { label: "A", text: "x - 2y < 4 only" },
                        { label: "B", text: "x - 2y > 4 only" },
                        { label: "C", text: "x - 2y <= 4 only" },
                        { label: "D", text: "The equality x - 2y = 4" }
                    ],
                    answer: "D"
                },
                {
                    prompt: "The region x <= 3 lies",
                    options: [
                        { label: "A", text: "Above a horizontal line" },
                        { label: "B", text: "Below a horizontal line" },
                        { label: "C", text: "Left of a vertical line" },
                        { label: "D", text: "Right of a vertical line" }
                    ],
                    answer: "C"
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
                label.appendChild(document.createTextNode(` ${option.label}. ${option.text}`));
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
        quizContent.querySelectorAll("input[type='radio']").forEach(input => {
            input.checked = false;
        });
        quizContent.querySelectorAll(".quiz-feedback").forEach(fb => {
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
