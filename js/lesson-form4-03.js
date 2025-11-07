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
            description: "Quiz A covers core definitions: statements, negations, conjunctions, and the idea of validity.",
            answerKey: ["B", "B", "C", "B", "C", "C"],
            questions: [
                {
                    prompt: "Which of the following is a statement?",
                    options: [
                        { label: "A", text: "Close the door." },
                        { label: "B", text: "2 + 3 = 5" },
                        { label: "C", text: "Wow!" },
                        { label: "D", text: "Which day is it?" }
                    ],
                    answer: "B"
                },
                {
                    prompt: "What is the negation of \"All APU students love math\"?",
                    options: [
                        { label: "A", text: "No APU student loves math." },
                        { label: "B", text: "Some APU student does not love math." },
                        { label: "C", text: "All APU students hate math." },
                        { label: "D", text: "Some people love math." }
                    ],
                    answer: "B"
                },
                {
                    prompt: "Given \"If P then Q\", which is the contrapositive?",
                    options: [
                        { label: "A", text: "If Q then P." },
                        { label: "B", text: "If not P then not Q." },
                        { label: "C", text: "If not Q then not P." },
                        { label: "D", text: "If Q then not P." }
                    ],
                    answer: "C"
                },
                {
                    prompt: "What is the truth value of (P and Q) when P = true and Q = false?",
                    options: [
                        { label: "A", text: "True" },
                        { label: "B", text: "False" },
                        { label: "C", text: "Cannot determine" },
                        { label: "D", text: "Both true and false" }
                    ],
                    answer: "B"
                },
                {
                    prompt: "Validity of an argument depends on",
                    options: [
                        { label: "A", text: "Truth of the premises only" },
                        { label: "B", text: "Topic of the sentences" },
                        { label: "C", text: "Logical structure and whether the conclusion must follow" },
                        { label: "D", text: "Truth of the conclusion only" }
                    ],
                    answer: "C"
                },
                {
                    prompt: "Which option names a fallacy?",
                    options: [
                        { label: "A", text: "Modus ponens" },
                        { label: "B", text: "Modus tollens" },
                        { label: "C", text: "Affirming the consequent" },
                        { label: "D", text: "Contrapositive" }
                    ],
                    answer: "C"
                }
            ]
        },
        quizB: {
            description: "Quiz B focuses on equivalences, converses, and spotting valid rules of inference.",
            answerKey: ["B", "B", "A", "B", "A", "B"],
            questions: [
                {
                    prompt: "What is the negation of \"P or Q\"?",
                    options: [
                        { label: "A", text: "Not P or not Q" },
                        { label: "B", text: "Not P and not Q" },
                        { label: "C", text: "P and Q" },
                        { label: "D", text: "P exclusive-or Q" }
                    ],
                    answer: "B"
                },
                {
                    prompt: "\"If it rains, the match is cancelled.\" Which sentence is the converse?",
                    options: [
                        { label: "A", text: "If it does not rain, the match is not cancelled." },
                        { label: "B", text: "If the match is cancelled, it rained." },
                        { label: "C", text: "If it rains, the match is not cancelled." },
                        { label: "D", text: "If the match is not cancelled, it did not rain." }
                    ],
                    answer: "B"
                },
                {
                    prompt: "Which pair of expressions is logically equivalent?",
                    options: [
                        { label: "A", text: "P -> Q and (not P) or Q" },
                        { label: "B", text: "P -> Q and P or Q" },
                        { label: "C", text: "(P and Q) and (P or Q)" },
                        { label: "D", text: "not (P or Q) and (not P) or (not Q)" }
                    ],
                    answer: "A"
                },
                {
                    prompt: "Identify the valid rule of inference.",
                    options: [
                        { label: "A", text: "From P -> Q, infer Q -> P." },
                        { label: "B", text: "From P -> Q and P, infer Q." },
                        { label: "C", text: "From P -> Q and not Q, infer Q." },
                        { label: "D", text: "From P, infer P -> Q." }
                    ],
                    answer: "B"
                },
                {
                    prompt: "A sound argument is",
                    options: [
                        { label: "A", text: "Valid with true premises" },
                        { label: "B", text: "Valid regardless of premise truth" },
                        { label: "C", text: "Invalid but true conclusion" },
                        { label: "D", text: "Any argument with a true conclusion" }
                    ],
                    answer: "A"
                },
                {
                    prompt: "Which option is not a statement?",
                    options: [
                        { label: "A", text: "7 is prime." },
                        { label: "B", text: "Study more!" },
                        { label: "C", text: "x + 2 = 5 (with unspecified x)" },
                        { label: "D", text: "The sky is blue." }
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
