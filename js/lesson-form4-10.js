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
            description: "Quiz A focuses on simple interest, compound interest, best buys, and budgeting basics.",
            answerKey: ["A", "C", "C", "C", "B", "C"],
            questions: [
                {
                    prompt: "Simple interest on RM2000 at 5% per annum for 3 years equals",
                    options: [
                        { label: "A", text: "RM300" },
                        { label: "B", text: "RM250" },
                        { label: "C", text: "RM350" },
                        { label: "D", text: "RM200" }
                    ],
                    answer: "A"
                },
                {
                    prompt: "Compound amount for RM1000 at 10% per annum for 2 years (annual compounding) is",
                    options: [
                        { label: "A", text: "RM1100" },
                        { label: "B", text: "RM1200" },
                        { label: "C", text: "RM1210" },
                        { label: "D", text: "RM1000" }
                    ],
                    answer: "C"
                },
                {
                    prompt: "Which bundle is the better buy?",
                    options: [
                        { label: "A", text: "500 g at RM6.50" },
                        { label: "B", text: "Both are the same" },
                        { label: "C", text: "750 g at RM9.45" },
                        { label: "D", text: "Cannot tell" }
                    ],
                    answer: "C"
                },
                {
                    prompt: "Which action reduces future interest cost the fastest?",
                    options: [
                        { label: "A", text: "Pay the minimum each month" },
                        { label: "B", text: "Increase the loan tenure" },
                        { label: "C", text: "Pay extra principal early" },
                        { label: "D", text: "Lower payments now and raise them later" }
                    ],
                    answer: "C"
                },
                {
                    prompt: "If income rises 8% from RM2500, the new income is",
                    options: [
                        { label: "A", text: "RM2580" },
                        { label: "B", text: "RM2700" },
                        { label: "C", text: "RM2900" },
                        { label: "D", text: "RM4500" }
                    ],
                    answer: "B"
                },
                {
                    prompt: "An emergency fund commonly targets",
                    options: [
                        { label: "A", text: "1-2 days of expenses" },
                        { label: "B", text: "1-2 weeks of expenses" },
                        { label: "C", text: "3-6 months of expenses" },
                        { label: "D", text: "3-6 years of income" }
                    ],
                    answer: "C"
                }
            ]
        },
        quizB: {
            description: "Quiz B adds effective rate, discounts, unit pricing, and loan behaviour.",
            answerKey: ["B", "A", "B", "B", "A", "A"],
            questions: [
                {
                    prompt: "Effective annual rate for 12% per annum compounded monthly equals",
                    options: [
                        { label: "A", text: "12.00%" },
                        { label: "B", text: "(1 + 0.12 / 12)^{12} - 1 (about 12.68%)" },
                        { label: "C", text: "1%" },
                        { label: "D", text: "13.00% exactly" }
                    ],
                    answer: "B"
                },
                {
                    prompt: "A discount of 20% on RM150 then a further 10% gives final price",
                    options: [
                        { label: "A", text: "RM108" },
                        { label: "B", text: "RM120" },
                        { label: "C", text: "RM135" },
                        { label: "D", text: "RM150" }
                    ],
                    answer: "A"
                },
                {
                    prompt: "If savings grow by compound interest, the graph of amount versus time is",
                    options: [
                        { label: "A", text: "Linear" },
                        { label: "B", text: "Exponential" },
                        { label: "C", text: "Quadratic" },
                        { label: "D", text: "Constant" }
                    ],
                    answer: "B"
                },
                {
                    prompt: "A budget surplus means",
                    options: [
                        { label: "A", text: "Expenses exceed income" },
                        { label: "B", text: "Income exceeds expenses" },
                        { label: "C", text: "Debt is increasing" },
                        { label: "D", text: "No savings happen" }
                    ],
                    answer: "B"
                },
                {
                    prompt: "Unit price for RM24.50 for 5 units equals",
                    options: [
                        { label: "A", text: "RM4.90" },
                        { label: "B", text: "RM5.00" },
                        { label: "C", text: "RM4.80" },
                        { label: "D", text: "RM4.75" }
                    ],
                    answer: "A"
                },
                {
                    prompt: "In a typical amortising loan, payments go mostly to interest at the",
                    options: [
                        { label: "A", text: "Start" },
                        { label: "B", text: "Middle" },
                        { label: "C", text: "End" },
                        { label: "D", text: "Same amount each month" }
                    ],
                    answer: "A"
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
