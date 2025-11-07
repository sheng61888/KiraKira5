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
            description: "Quiz A covers range, IQR, standard deviation, and MAD for ungrouped data.",
            answerKey: ["A", "A", "B", "C", "B", "C"],
            questions: [
                {
                    prompt: "What is the range of {2, 4, 7, 7, 10}?",
                    options: [
                        { label: "A", text: "8" },
                        { label: "B", text: "5" },
                        { label: "C", text: "3" },
                        { label: "D", text: "10" }
                    ],
                    answer: "A"
                },
                {
                    prompt: "The interquartile range (IQR) focuses on",
                    options: [
                        { label: "A", text: "The middle 50 percent of data" },
                        { label: "B", text: "All data equally" },
                        { label: "C", text: "Only the extremes" },
                        { label: "D", text: "Only the mean" }
                    ],
                    answer: "A"
                },
                {
                    prompt: "If the standard deviation is small, the data are",
                    options: [
                        { label: "A", text: "Very spread out" },
                        { label: "B", text: "Clustered near the mean" },
                        { label: "C", text: "Unchanged" },
                        { label: "D", text: "Skewed right" }
                    ],
                    answer: "B"
                },
                {
                    prompt: "Which measure is least affected by outliers?",
                    options: [
                        { label: "A", text: "Range" },
                        { label: "B", text: "Standard deviation" },
                        { label: "C", text: "Interquartile range" },
                        { label: "D", text: "Mean" }
                    ],
                    answer: "C"
                },
                {
                    prompt: "Mean absolute deviation (MAD) uses",
                    options: [
                        { label: "A", text: "Squared deviations" },
                        { label: "B", text: "Absolute deviations" },
                        { label: "C", text: "Cubed deviations" },
                        { label: "D", text: "Quartiles only" }
                    ],
                    answer: "B"
                },
                {
                    prompt: "If you add a constant k to every data point, the standard deviation",
                    options: [
                        { label: "A", text: "Increases by k" },
                        { label: "B", text: "Decreases by k" },
                        { label: "C", text: "Stays the same" },
                        { label: "D", text: "Becomes zero" }
                    ],
                    answer: "C"
                }
            ]
        },
        quizB: {
            description: "Quiz B examines sensitivity to extremes and how scaling data affects spread.",
            answerKey: ["A", "C", "B", "A", "A", "B"],
            questions: [
                {
                    prompt: "For data 5, 5, 5, 5 the standard deviation equals",
                    options: [
                        { label: "A", text: "0" },
                        { label: "B", text: "1" },
                        { label: "C", text: "5" },
                        { label: "D", text: "Undefined" }
                    ],
                    answer: "A"
                },
                {
                    prompt: "Range is sensitive because it uses",
                    options: [
                        { label: "A", text: "Only middle values" },
                        { label: "B", text: "Only mean" },
                        { label: "C", text: "Only minimum and maximum" },
                        { label: "D", text: "All values equally" }
                    ],
                    answer: "C"
                },
                {
                    prompt: "If one extreme value increases greatly, which measure changes most?",
                    options: [
                        { label: "A", text: "IQR" },
                        { label: "B", text: "Range" },
                        { label: "C", text: "Median" },
                        { label: "D", text: "Mode" }
                    ],
                    answer: "B"
                },
                {
                    prompt: "For symmetric data with few outliers, a good spread measure is",
                    options: [
                        { label: "A", text: "Standard deviation" },
                        { label: "B", text: "Range" },
                        { label: "C", text: "Mode" },
                        { label: "D", text: "Midrange" }
                    ],
                    answer: "A"
                },
                {
                    prompt: "If all values are multiplied by 3, the standard deviation becomes",
                    options: [
                        { label: "A", text: "3 times the original SD" },
                        { label: "B", text: "SD divided by 3" },
                        { label: "C", text: "SD plus 3" },
                        { label: "D", text: "Unchanged" }
                    ],
                    answer: "A"
                },
                {
                    prompt: "If Q1 = 12 and Q3 = 20, the IQR equals",
                    options: [
                        { label: "A", text: "32" },
                        { label: "B", text: "8" },
                        { label: "C", text: "12" },
                        { label: "D", text: "20" }
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
