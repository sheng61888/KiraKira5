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
            description: "Quiz A checks degree counts, Euler and Hamiltonian ideas, and essential terminology.",
            answerKey: ["B", "B", "B", "B", "A", "C"],
            questions: [
                {
                    prompt: "The degree of a vertex equals the",
                    options: [
                        { label: "A", text: "Number of vertices in the graph" },
                        { label: "B", text: "Number of edges incident to that vertex" },
                        { label: "C", text: "Total edges in the graph" },
                        { label: "D", text: "Weight of the vertex" }
                    ],
                    answer: "B"
                },
                {
                    prompt: "An Euler trail exists if",
                    options: [
                        { label: "A", text: "All vertices are even degree" },
                        { label: "B", text: "Exactly 0 or 2 vertices are odd degree" },
                        { label: "C", text: "All vertices are odd degree" },
                        { label: "D", text: "At least one vertex is even degree" }
                    ],
                    answer: "B"
                },
                {
                    prompt: "A Hamiltonian path",
                    options: [
                        { label: "A", text: "Uses every edge once" },
                        { label: "B", text: "Visits every vertex once" },
                        { label: "C", text: "Finds the shortest cost" },
                        { label: "D", text: "Visits each vertex twice" }
                    ],
                    answer: "B"
                },
                {
                    prompt: "Dijkstra's algorithm is used to find",
                    options: [
                        { label: "A", text: "A minimum spanning tree" },
                        { label: "B", text: "Shortest paths from one source" },
                        { label: "C", text: "An Euler circuit" },
                        { label: "D", text: "The degree of each vertex" }
                    ],
                    answer: "B"
                },
                {
                    prompt: "A tree is a connected graph with",
                    options: [
                        { label: "A", text: "No cycles" },
                        { label: "B", text: "Exactly one cycle" },
                        { label: "C", text: "Exactly two cycles" },
                        { label: "D", text: "All vertices even" }
                    ],
                    answer: "A"
                },
                {
                    prompt: "The sum of degrees of all vertices equals",
                    options: [
                        { label: "A", text: "|V|" },
                        { label: "B", text: "|E|" },
                        { label: "C", text: "2|E|" },
                        { label: "D", text: "|V| + |E|" }
                    ],
                    answer: "C"
                }
            ]
        },
        quizB: {
            description: "Quiz B adds calculations about degree sums, spanning trees, and definitions.",
            answerKey: ["C", "C", "A", "B", "C", "B"],
            questions: [
                {
                    prompt: "A graph with 6 vertices and 7 edges has total degree sum",
                    options: [
                        { label: "A", text: "7" },
                        { label: "B", text: "12" },
                        { label: "C", text: "14" },
                        { label: "D", text: "28" }
                    ],
                    answer: "C"
                },
                {
                    prompt: "If exactly two vertices are odd, then the graph has",
                    options: [
                        { label: "A", text: "No Euler trail" },
                        { label: "B", text: "An Euler circuit" },
                        { label: "C", text: "An Euler trail but not a circuit" },
                        { label: "D", text: "A Hamiltonian cycle" }
                    ],
                    answer: "C"
                },
                {
                    prompt: "A minimum spanning tree connects all vertices with",
                    options: [
                        { label: "A", text: "Minimum total weight" },
                        { label: "B", text: "Maximum number of edges" },
                        { label: "C", text: "Shortest single path" },
                        { label: "D", text: "No weights" }
                    ],
                    answer: "A"
                },
                {
                    prompt: "Any tree with n vertices has",
                    options: [
                        { label: "A", text: "n edges" },
                        { label: "B", text: "n - 1 edges" },
                        { label: "C", text: "n + 1 edges" },
                        { label: "D", text: "2n edges" }
                    ],
                    answer: "B"
                },
                {
                    prompt: "A cycle is defined as",
                    options: [
                        { label: "A", text: "A closed path that repeats edges" },
                        { label: "B", text: "A closed path that repeats vertices often" },
                        { label: "C", text: "A closed path with no repeated vertices except start equals end" },
                        { label: "D", text: "An open path" }
                    ],
                    answer: "C"
                },
                {
                    prompt: "A disconnected graph",
                    options: [
                        { label: "A", text: "Has no edges" },
                        { label: "B", text: "Has separate components" },
                        { label: "C", text: "Is a tree" },
                        { label: "D", text: "Must have weights" }
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
