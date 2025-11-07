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
            description: "Quiz A checks validity of numerals, place value understanding, and conversion skills across bases.",
            answerKey: ["A", "C", "A", "B", "C", "B", "B", "C", "C", "B"],
            questions: [
                {
                    prompt: "Which numeral is valid in base 5?",
                    options: [
                        { label: "A", text: "243 base 5" },
                        { label: "B", text: "534 base 5" },
                        { label: "C", text: "2A3 base 5" },
                        { label: "D", text: "497 base 5" }
                    ],
                    answer: "A"
                },
                {
                    prompt: "10110 base 2 equals what value in base 10?",
                    options: [
                        { label: "A", text: "18" },
                        { label: "B", text: "20" },
                        { label: "C", text: "22" },
                        { label: "D", text: "24" }
                    ],
                    answer: "C"
                },
                {
                    prompt: "Convert 47 base 10 to base 3.",
                    options: [
                        { label: "A", text: "1202 base 3" },
                        { label: "B", text: "1220 base 3" },
                        { label: "C", text: "1022 base 3" },
                        { label: "D", text: "1112 base 3" }
                    ],
                    answer: "A"
                },
                {
                    prompt: "73 base 8 equals what value in base 10?",
                    options: [
                        { label: "A", text: "57" },
                        { label: "B", text: "59" },
                        { label: "C", text: "61" },
                        { label: "D", text: "63" }
                    ],
                    answer: "B"
                },
                {
                    prompt: "The largest three-digit number in base 6 is 555 base 6. What is this value in base 10?",
                    options: [
                        { label: "A", text: "205" },
                        { label: "B", text: "209" },
                        { label: "C", text: "215" },
                        { label: "D", text: "225" }
                    ],
                    answer: "C"
                },
                {
                    prompt: "In 1324 base 5, what place value does the digit 3 represent?",
                    options: [
                        { label: "A", text: "3 times 5" },
                        { label: "B", text: "3 times 5 squared" },
                        { label: "C", text: "3 times 5 cubed" },
                        { label: "D", text: "3 times 5 to the fourth power" }
                    ],
                    answer: "B"
                },
                {
                    prompt: "Find base b if 32 base b equals 14 base 10.",
                    options: [
                        { label: "A", text: "b = 3" },
                        { label: "B", text: "b = 4" },
                        { label: "C", text: "b = 5" },
                        { label: "D", text: "b = 6" }
                    ],
                    answer: "B"
                },
                {
                    prompt: "Which statement is always true for any base b that is at least 2?",
                    options: [
                        { label: "A", text: "Allowed digits are 1 through b" },
                        { label: "B", text: "Allowed digits are 0 through b" },
                        { label: "C", text: "Allowed digits are 0 through b minus 1" },
                        { label: "D", text: "Allowed digits are 1 through b minus 1" }
                    ],
                    answer: "C"
                },
                {
                    prompt: "Compute 132 base 4 plus 23 base 4 (express the answer in base 4).",
                    options: [
                        { label: "A", text: "210 base 4" },
                        { label: "B", text: "301 base 4" },
                        { label: "C", text: "221 base 4" },
                        { label: "D", text: "1001 base 4" }
                    ],
                    answer: "C"
                },
                {
                    prompt: "Which option equals 1000 base 2 when written in base 8?",
                    options: [
                        { label: "A", text: "8 base 10" },
                        { label: "B", text: "10 base 8" },
                        { label: "C", text: "20 base 8" },
                        { label: "D", text: "100 base 3" }
                    ],
                    answer: "B"
                }
            ]
        },
        quizB: {
            description: "Quiz B mixes tangents, divisibility, and cross-base comparisons for a tougher challenge.",
            answerKey: ["B", "D", "C", "C", "C", "B", "C", "D", "C", "C"],
            questions: [
                {
                    prompt: "In base 7, which numeral is invalid?",
                    options: [
                        { label: "A", text: "615 base 7" },
                        { label: "B", text: "706 base 7" },
                        { label: "C", text: "450 base 7" },
                        { label: "D", text: "126 base 7" }
                    ],
                    answer: "B"
                },
                {
                    prompt: "2A base 16 equals what value in base 10?",
                    options: [
                        { label: "A", text: "32" },
                        { label: "B", text: "34" },
                        { label: "C", text: "40" },
                        { label: "D", text: "42" }
                    ],
                    answer: "D"
                },
                {
                    prompt: "Convert 255 base 10 to base 16.",
                    options: [
                        { label: "A", text: "EE base 16" },
                        { label: "B", text: "F0 base 16" },
                        { label: "C", text: "FF base 16" },
                        { label: "D", text: "1F base 16" }
                    ],
                    answer: "C"
                },
                {
                    prompt: "Convert 110101 base 2 to base 8.",
                    options: [
                        { label: "A", text: "52 base 8" },
                        { label: "B", text: "64 base 8" },
                        { label: "C", text: "65 base 8" },
                        { label: "D", text: "72 base 8" }
                    ],
                    answer: "C"
                },
                {
                    prompt: "For what digit a (allowed in base 7) is 4a3 base 7 a multiple of 5 in base 10?",
                    options: [
                        { label: "A", text: "a = 1" },
                        { label: "B", text: "a = 2" },
                        { label: "C", text: "a = 3" },
                        { label: "D", text: "a = 5" }
                    ],
                    answer: "C"
                },
                {
                    prompt: "Find the base b if 210 base b equals 55 base 10.",
                    options: [
                        { label: "A", text: "b = 4" },
                        { label: "B", text: "b = 5" },
                        { label: "C", text: "b = 6" },
                        { label: "D", text: "b = 7" }
                    ],
                    answer: "B"
                },
                {
                    prompt: "In base 9, compute 804 base 9 minus 28 base 9 (answer in base 9).",
                    options: [
                        { label: "A", text: "755 base 9" },
                        { label: "B", text: "766 base 9" },
                        { label: "C", text: "765 base 9" },
                        { label: "D", text: "674 base 9" }
                    ],
                    answer: "C"
                },
                {
                    prompt: "Which value is largest once converted to base 10?",
                    options: [
                        { label: "A", text: "121 base 3" },
                        { label: "B", text: "44 base 5" },
                        { label: "C", text: "31 base 7" },
                        { label: "D", text: "1F base 16" }
                    ],
                    answer: "D"
                },
                {
                    prompt: "If 1000 base b equals 64 base 10, what is b?",
                    options: [
                        { label: "A", text: "2" },
                        { label: "B", text: "3" },
                        { label: "C", text: "4" },
                        { label: "D", text: "8" }
                    ],
                    answer: "C"
                },
                {
                    prompt: "For which value of k is 2k7 base 8 valid and divisible by 3 in base 10?",
                    options: [
                        { label: "A", text: "k = 1" },
                        { label: "B", text: "k = 2" },
                        { label: "C", text: "k = 3" },
                        { label: "D", text: "k = 5" }
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
