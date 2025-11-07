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
            description: "Quiz A uses quick checks on addition, multiplication, and conditional probability rules.",
            answerKey: ["A", "B", "B", "B", "C", "A"],
            questions: [
                {
                    prompt: "If A and B are mutually exclusive, then",
                    options: [
                        { label: "A", text: "P(A n B) = 0" },
                        { label: "B", text: "P(A U B) = 0" },
                        { label: "C", text: "P(A) = 0" },
                        { label: "D", text: "P(B) = 0" }
                    ],
                    answer: "A"
                },
                {
                    prompt: "Independent events satisfy",
                    options: [
                        { label: "A", text: "P(A n B) = P(A) + P(B)" },
                        { label: "B", text: "P(A n B) = P(A)P(B)" },
                        { label: "C", text: "P(A | B) = 0" },
                        { label: "D", text: "P(A U B) = P(A)P(B)" }
                    ],
                    answer: "B"
                },
                {
                    prompt: "Given P(A) = 0.4, P(B) = 0.5, and P(A n B) = 0.2, then P(A U B) equals",
                    options: [
                        { label: "A", text: "0.9" },
                        { label: "B", text: "0.7" },
                        { label: "C", text: "0.6" },
                        { label: "D", text: "0.3" }
                    ],
                    answer: "B"
                },
                {
                    prompt: "If P(A | B) = P(A), then events A and B are",
                    options: [
                        { label: "A", text: "Mutually exclusive" },
                        { label: "B", text: "Independent" },
                        { label: "C", text: "Dependent" },
                        { label: "D", text: "Certain" }
                    ],
                    answer: "B"
                },
                {
                    prompt: "Without replacement usually means events are",
                    options: [
                        { label: "A", text: "Independent" },
                        { label: "B", text: "Mutually exclusive" },
                        { label: "C", text: "Dependent" },
                        { label: "D", text: "Impossible" }
                    ],
                    answer: "C"
                },
                {
                    prompt: "If P(A) = 0.7 and P(B) = 0.6 and A, B are independent, then P(A n B) equals",
                    options: [
                        { label: "A", text: "0.42" },
                        { label: "B", text: "1.3" },
                        { label: "C", text: "0.13" },
                        { label: "D", text: "0.76" }
                    ],
                    answer: "A"
                }
            ]
        },
        quizB: {
            description: "Quiz B moves into disjoint events, replacement logic, and the conditional probability formula.",
            answerKey: ["C", "B", "B", "A", "B", "B"],
            questions: [
                {
                    prompt: "If A and B are disjoint with P(A) = 0.2 and P(B) = 0.5, then P(A U B) equals",
                    options: [
                        { label: "A", text: "0.1" },
                        { label: "B", text: "0.3" },
                        { label: "C", text: "0.7" },
                        { label: "D", text: "1.0" }
                    ],
                    answer: "C"
                },
                {
                    prompt: "For independent events with P(A) = 0.6 and P(B) = 0.5, the value of P(A | B) equals",
                    options: [
                        { label: "A", text: "0.3" },
                        { label: "B", text: "0.6" },
                        { label: "C", text: "0.5" },
                        { label: "D", text: "1.1" }
                    ],
                    answer: "B"
                },
                {
                    prompt: "If P(A U B) = 0.9 and P(A) = 0.6, P(B) = 0.5, then P(A n B) equals",
                    options: [
                        { label: "A", text: "0.2" },
                        { label: "B", text: "0.2" },
                        { label: "C", text: "0.0" },
                        { label: "D", text: "0.9" }
                    ],
                    answer: "B"
                },
                {
                    prompt: "With replacement, drawing two reds when P(red) = 0.4 has probability",
                    options: [
                        { label: "A", text: "0.16" },
                        { label: "B", text: "0.24" },
                        { label: "C", text: "0.4" },
                        { label: "D", text: "0.8" }
                    ],
                    answer: "A"
                },
                {
                    prompt: "Mutually exclusive events can be independent only if",
                    options: [
                        { label: "A", text: "Both probabilities are non-zero" },
                        { label: "B", text: "At least one event has probability zero" },
                        { label: "C", text: "Both are certainty events" },
                        { label: "D", text: "Always" }
                    ],
                    answer: "B"
                },
                {
                    prompt: "The conditional probability formula is",
                    options: [
                        { label: "A", text: "P(A | B) = P(B) / P(A n B)" },
                        { label: "B", text: "P(A | B) = P(A n B) / P(B)" },
                        { label: "C", text: "P(A | B) = P(A) + P(B)" },
                        { label: "D", text: "P(A | B) = P(A)P(B)" }
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
