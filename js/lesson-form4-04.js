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
            description: "Quiz A reviews the core definitions of unions, intersections, complements, and simple counting.",
            answerKey: ["B", "B", "A", "B", "B", "B"],
            questions: [
                {
                    prompt: "The region common to both sets A and B is",
                    options: [
                        { label: "A", text: "A union B" },
                        { label: "B", text: "A intersection B" },
                        { label: "C", text: "A complement" },
                        { label: "D", text: "A minus B" }
                    ],
                    answer: "B"
                },
                {
                    prompt: "If U = {1,2,3,4,5} and A = {1,3,5}, then A complement equals",
                    options: [
                        { label: "A", text: "{1,3,5}" },
                        { label: "B", text: "{2,4}" },
                        { label: "C", text: "U" },
                        { label: "D", text: "{3,5}" }
                    ],
                    answer: "B"
                },
                {
                    prompt: "De Morgan's law states (A intersection B) complement equals",
                    options: [
                        { label: "A", text: "A complement union B complement" },
                        { label: "B", text: "A complement intersection B complement" },
                        { label: "C", text: "A union B" },
                        { label: "D", text: "A minus B" }
                    ],
                    answer: "A"
                },
                {
                    prompt: "If |A| = 12, |B| = 10, and |A intersection B| = 4, then |A union B| equals",
                    options: [
                        { label: "A", text: "18" },
                        { label: "B", text: "16" },
                        { label: "C", text: "26" },
                        { label: "D", text: "6" }
                    ],
                    answer: "B"
                },
                {
                    prompt: "Which symbol denotes subset?",
                    options: [
                        { label: "A", text: "A element B" },
                        { label: "B", text: "A subseteq B" },
                        { label: "C", text: "A intersection B" },
                        { label: "D", text: "A prime" }
                    ],
                    answer: "B"
                },
                {
                    prompt: "A minus B means",
                    options: [
                        { label: "A", text: "Elements in B but not in A" },
                        { label: "B", text: "Elements in A but not in B" },
                        { label: "C", text: "Elements in both A and B" },
                        { label: "D", text: "Elements in neither set" }
                    ],
                    answer: "B"
                }
            ]
        },
        quizB: {
            description: "Quiz B mixes subset logic, identities, and quick computations with real numbers.",
            answerKey: ["B", "C", "A", "A", "A", "B"],
            questions: [
                {
                    prompt: "If A subseteq B, then A union B equals",
                    options: [
                        { label: "A", text: "A" },
                        { label: "B", text: "B" },
                        { label: "C", text: "A intersection B" },
                        { label: "D", text: "A complement" }
                    ],
                    answer: "B"
                },
                {
                    prompt: "Given |A| = 20, |B| = 15, and |A intersection B| = 9, find |A union B|.",
                    options: [
                        { label: "A", text: "44" },
                        { label: "B", text: "26" },
                        { label: "C", text: "24" },
                        { label: "D", text: "14" }
                    ],
                    answer: "C"
                },
                {
                    prompt: "(A union B) intersection C equals",
                    options: [
                        { label: "A", text: "(A intersection C) union (B intersection C)" },
                        { label: "B", text: "(A intersection C) intersection (B intersection C)" },
                        { label: "C", text: "A union (B intersection C)" },
                        { label: "D", text: "(A union C) intersection (B union C)" }
                    ],
                    answer: "A"
                },
                {
                    prompt: "If U = {1,...,9}, A = {1,3,5,7,9}, and B = {2,3,5,7}, then A intersection B equals",
                    options: [
                        { label: "A", text: "{3,5,7}" },
                        { label: "B", text: "{1,9}" },
                        { label: "C", text: "{2,4,6,8}" },
                        { label: "D", text: "{1,3,5,7,9}" }
                    ],
                    answer: "A"
                },
                {
                    prompt: "A intersection (B minus C) simplifies to",
                    options: [
                        { label: "A", text: "(A intersection B) minus C" },
                        { label: "B", text: "(A intersection B) union C" },
                        { label: "C", text: "A minus B" },
                        { label: "D", text: "A minus C" }
                    ],
                    answer: "A"
                },
                {
                    prompt: "If A complement = {2,4,6,8} within U = {1,...,8}, then A equals",
                    options: [
                        { label: "A", text: "{2,4,6,8}" },
                        { label: "B", text: "{1,3,5,7}" },
                        { label: "C", text: "{1,2,3,4}" },
                        { label: "D", text: "{5,6,7,8}" }
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
