(() => {
  const initLessonQuiz = quizzes => {
    if (!quizzes || typeof quizzes !== "object") {
      return;
    }

    const start = () => {
      const quizTabs = document.querySelectorAll(".quiz-tab");
      const quizDescription = document.getElementById("quizDescription");
      const quizContent = document.getElementById("quizContent");
      const submitBtn = document.getElementById("submitQuiz");
      const resetBtn = document.getElementById("resetQuiz");
      const summaryEl = document.getElementById("quizSummary");
      const answerKeyWrapper = document.getElementById("answerKeyWrapper");
      const answerKeyContent = document.getElementById("answerKeyContent");

      if (!quizContent || !submitBtn || !resetBtn || !summaryEl || !answerKeyWrapper || !answerKeyContent) {
        return;
      }

      const availableKeys = Object.keys(quizzes);
      if (!availableKeys.length) {
        return;
      }

      const findInitialQuiz = () => {
        const activeTab = Array.from(quizTabs).find(tab => {
          const quizId = tab.dataset.quiz;
          return tab.classList.contains("active") && quizId && quizzes[quizId];
        });
        if (activeTab) {
          return activeTab.dataset.quiz;
        }
        return availableKeys[0];
      };

      let activeQuiz = findInitialQuiz();

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
        if (!quiz) {
          return;
        }
        if (quizDescription) {
          quizDescription.textContent = quiz.description || "";
        }
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
        if (!quizzes[quizId]) {
          return;
        }
        activeQuiz = quizId;
        quizTabs.forEach(tab => {
          tab.classList.toggle("active", tab.dataset.quiz === quizId);
        });
        renderQuiz();
      };

      const gradeQuiz = () => {
        const quiz = quizzes[activeQuiz];
        if (!quiz) {
          return;
        }
        const questionCards = quizContent.querySelectorAll(".quiz-card");
        let correctCount = 0;

        questionCards.forEach((card, index) => {
          const selected = card.querySelector("input[type='radio']:checked");
          const feedback = card.querySelector(".quiz-feedback");
          if (!feedback) {
            return;
          }
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
        answerKeyContent.appendChild(buildAnswerKeyList(quiz.answerKey || []));
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
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", start);
    } else {
      start();
    }
  };

  window.kiraInitLessonQuiz = initLessonQuiz;
})();
