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
            description: "Quiz A focuses on interpreting slopes, areas, and motion descriptions on both graph types.",
            answerKey: ["C", "C", "A", "B", "B", "C"],
            questions: [
                {
                    prompt: "On a distance-time graph, a horizontal segment means",
                    options: [
                        { label: "A", text: "Constant speed" },
                        { label: "B", text: "Accelerating" },
                        { label: "C", text: "Stationary" },
                        { label: "D", text: "Decelerating" }
                    ],
                    answer: "C"
                },
                {
                    prompt: "On a speed-time graph, the area under the line from t1 to t2 represents",
                    options: [
                        { label: "A", text: "Speed" },
                        { label: "B", text: "Time" },
                        { label: "C", text: "Distance" },
                        { label: "D", text: "Acceleration" }
                    ],
                    answer: "C"
                },
                {
                    prompt: "A straight line with positive slope on a distance-time graph implies",
                    options: [
                        { label: "A", text: "Constant speed" },
                        { label: "B", text: "Increasing speed" },
                        { label: "C", text: "Decreasing speed" },
                        { label: "D", text: "Zero speed" }
                    ],
                    answer: "A"
                },
                {
                    prompt: "On a speed-time graph, a downward sloping line above the axis indicates",
                    options: [
                        { label: "A", text: "Speeding up" },
                        { label: "B", text: "Slowing down" },
                        { label: "C", text: "Stationary" },
                        { label: "D", text: "Reversing direction" }
                    ],
                    answer: "B"
                },
                {
                    prompt: "A triangular region under a speed-time graph has area (1/2) b h. This equals the",
                    options: [
                        { label: "A", text: "Average speed" },
                        { label: "B", text: "Distance travelled" },
                        { label: "C", text: "Elapsed time" },
                        { label: "D", text: "Acceleration" }
                    ],
                    answer: "B"
                },
                {
                    prompt: "If speed is constant at v for time t, then distance equals",
                    options: [
                        { label: "A", text: "v + t" },
                        { label: "B", text: "v / t" },
                        { label: "C", text: "v * t" },
                        { label: "D", text: "v - t" }
                    ],
                    answer: "C"
                }
            ]
        },
        quizB: {
            description: "Quiz B mixes calculations with more interpretation of slopes, areas, and impossible scenarios.",
            answerKey: ["B", "D", "A", "B", "C", "C"],
            questions: [
                {
                    prompt: "On a distance-time graph, an increasing slope indicates",
                    options: [
                        { label: "A", text: "Constant speed" },
                        { label: "B", text: "Acceleration" },
                        { label: "C", text: "Deceleration" },
                        { label: "D", text: "Stopped motion" }
                    ],
                    answer: "B"
                },
                {
                    prompt: "A rectangle of height 8 m/s and width 5 s under a speed-time graph encloses distance",
                    options: [
                        { label: "A", text: "8 m" },
                        { label: "B", text: "5 m" },
                        { label: "C", text: "13 m" },
                        { label: "D", text: "40 m" }
                    ],
                    answer: "D"
                },
                {
                    prompt: "Zero slope on a speed-time graph at v = 6 m/s means",
                    options: [
                        { label: "A", text: "Constant speed of 6 m/s" },
                        { label: "B", text: "Stationary" },
                        { label: "C", text: "Constant acceleration" },
                        { label: "D", text: "Speeding up" }
                    ],
                    answer: "A"
                },
                {
                    prompt: "For a piecewise speed-time graph, total distance equals",
                    options: [
                        { label: "A", text: "The maximum height" },
                        { label: "B", text: "The sum of the areas of each piece" },
                        { label: "C", text: "Only the area of the last piece" },
                        { label: "D", text: "The sum of speeds" }
                    ],
                    answer: "B"
                },
                {
                    prompt: "If a distance-time line sloped downward, that would mean",
                    options: [
                        { label: "A", text: "Negative distance" },
                        { label: "B", text: "Returning toward the start" },
                        { label: "C", text: "Something impossible on a distance-time graph" },
                        { label: "D", text: "Standing still" }
                    ],
                    answer: "C"
                },
                {
                    prompt: "Acceleration units obtained from a speed-time slope are",
                    options: [
                        { label: "A", text: "m/s" },
                        { label: "B", text: "s/m" },
                        { label: "C", text: "m/s^2" },
                        { label: "D", text: "m^2/s" }
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
