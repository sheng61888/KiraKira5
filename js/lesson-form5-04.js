(() => {
  const quizzes = {
    quizA: {
      description: "Quiz A reviews SST definitions, taxable stages, and how reliefs affect chargeable income in a progressive system.",
      answerKey: ["B", "B", "C", "B", "A", "A", "B", "B", "B", "B"],
      questions: [
        {
          prompt: "SST stands for:",
          options: [
            { label: "A", text: "Standard Service Tariff" },
            { label: "B", text: "Sales and Service Tax" },
            { label: "C", text: "State Sales Tariff" },
            { label: "D", text: "Subsidy and Service Tax" }
          ],
          answer: "B"
        },
        {
          prompt: "Sales tax generally applies at the:",
          options: [
            { label: "A", text: "Retail purchase stage" },
            { label: "B", text: "Manufacturing or import stage" },
            { label: "C", text: "Resale stage only" },
            { label: "D", text: "Export stage only" }
          ],
          answer: "B"
        },
        {
          prompt: "Service tax applies to:",
          options: [
            { label: "A", text: "Any good" },
            { label: "B", text: "Only imported goods" },
            { label: "C", text: "Specified services such as hotels or telco" },
            { label: "D", text: "None of the above" }
          ],
          answer: "C"
        },
        {
          prompt: "A tax relief usually:",
          options: [
            { label: "A", text: "Increases chargeable income" },
            { label: "B", text: "Reduces chargeable income" },
            { label: "C", text: "Doubles tax" },
            { label: "D", text: "Acts as a penalty" }
          ],
          answer: "B"
        },
        {
          prompt: "Chargeable income equals:",
          options: [
            { label: "A", text: "Total income minus allowable reliefs or deductions" },
            { label: "B", text: "Gross salary only" },
            { label: "C", text: "Net salary after EPF" },
            { label: "D", text: "Savings" }
          ],
          answer: "A"
        },
        {
          prompt: "A progressive tax system means:",
          options: [
            { label: "A", text: "Higher income leads to higher rates" },
            { label: "B", text: "Flat rate for all" },
            { label: "C", text: "Fixed tax regardless of income" },
            { label: "D", text: "Only rebates are used" }
          ],
          answer: "A"
        },
        {
          prompt: "Service tax is effectively paid by the:",
          options: [
            { label: "A", text: "Service provider" },
            { label: "B", text: "Consumer receiving taxable services" },
            { label: "C", text: "Manufacturer" },
            { label: "D", text: "Customs officer" }
          ],
          answer: "B"
        },
        {
          prompt: "Sales tax is charged:",
          options: [
            { label: "A", text: "Multiple times along the chain" },
            { label: "B", text: "Once at a specified stage" },
            { label: "C", text: "Never" },
            { label: "D", text: "Daily" }
          ],
          answer: "B"
        },
        {
          prompt: "If reliefs increase, tax payable tends to:",
          options: [
            { label: "A", text: "Increase" },
            { label: "B", text: "Decrease" },
            { label: "C", text: "Stay unchanged" },
            { label: "D", text: "Become negative automatically" }
          ],
          answer: "B"
        },
        {
          prompt: "Keeping receipts helps you to:",
          options: [
            { label: "A", text: "Inflate tax" },
            { label: "B", text: "Claim eligible reliefs" },
            { label: "C", text: "Avoid paying anything" },
            { label: "D", text: "Skip filing altogether" }
          ],
          answer: "B"
        }
      ]
    },
    quizB: {
      description: "Quiz B extends the taxation practice with rebates, progressive brackets, and effective rate reasoning.",
      answerKey: ["A", "C", "B", "A", "A", "B", "B", "C", "B", "B"],
      questions: [
        {
          prompt: "A rebate (compared to a relief) typically:",
          options: [
            { label: "A", text: "Reduces tax payable directly" },
            { label: "B", text: "Reduces chargeable income" },
            { label: "C", text: "Increases gross income" },
            { label: "D", text: "Raises the tax rate" }
          ],
          answer: "A"
        },
        {
          prompt: "In a progressive system, if chargeable income rises, the marginal rate generally becomes:",
          options: [
            { label: "A", text: "Constant" },
            { label: "B", text: "Lower" },
            { label: "C", text: "Higher at certain brackets" },
            { label: "D", text: "Random" }
          ],
          answer: "C"
        },
        {
          prompt: "Sales tax is imposed primarily on:",
          options: [
            { label: "A", text: "Services" },
            { label: "B", text: "Manufacturing or import of taxable goods" },
            { label: "C", text: "Salaries" },
            { label: "D", text: "Dividends" }
          ],
          answer: "B"
        },
        {
          prompt: "Service tax is charged on:",
          options: [
            { label: "A", text: "Specified taxable services" },
            { label: "B", text: "All retail items" },
            { label: "C", text: "Raw materials" },
            { label: "D", text: "Exports only" }
          ],
          answer: "A"
        },
        {
          prompt: "Keeping proper records mainly helps with:",
          options: [
            { label: "A", text: "Claiming eligible reliefs or deductions" },
            { label: "B", text: "Avoiding all tax" },
            { label: "C", text: "Doubling refunds" },
            { label: "D", text: "Nothing important" }
          ],
          answer: "A"
        },
        {
          prompt: "If a service becomes exempt, the service tax on it becomes:",
          options: [
            { label: "A", text: "Higher" },
            { label: "B", text: "Zero" },
            { label: "C", text: "Double" },
            { label: "D", text: "The same" }
          ],
          answer: "B"
        },
        {
          prompt: "Chargeable income is computed after:",
          options: [
            { label: "A", text: "Grossing-up benefits" },
            { label: "B", text: "Subtracting allowable reliefs or deductions" },
            { label: "C", text: "Net salary is deposited" },
            { label: "D", text: "Paying SST" }
          ],
          answer: "B"
        },
        {
          prompt: "Which is not a typical personal tax relief category?",
          options: [
            { label: "A", text: "Medical or education (as specified)" },
            { label: "B", text: "EPF or life insurance (up to limits)" },
            { label: "C", text: "Professional attire for interviews" },
            { label: "D", text: "Lifestyle categories (limits apply)" }
          ],
          answer: "C"
        },
        {
          prompt: "The effective tax rate is defined as:",
          options: [
            { label: "A", text: "The highest bracket rate" },
            { label: "B", text: "Tax payable divided by total income" },
            { label: "C", text: "A flat rate" },
            { label: "D", text: "The marginal rate" }
          ],
          answer: "B"
        },
        {
          prompt: "If two items have the same unit price, the better buy depends on:",
          options: [
            { label: "A", text: "Always the larger pack" },
            { label: "B", text: "Expiry date, actual need, and budget" },
            { label: "C", text: "Brand name" },
            { label: "D", text: "Color" }
          ],
          answer: "B"
        }
      ]
    }
  };

  if (window.kiraInitLessonQuiz) {
    window.kiraInitLessonQuiz(quizzes);
  }
})();
