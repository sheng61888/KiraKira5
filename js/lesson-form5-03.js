(() => {
  const quizzes = {
    quizA: {
      description: "Quiz A focuses on insurance vocabulary, policy components, and how risk level affects premiums.",
      answerKey: ["B", "A", "C", "B", "C", "C", "B", "B", "C", "B"],
      questions: [
        {
          prompt: "In insurance, the term risk best means:",
          options: [
            { label: "A", text: "Guaranteed loss" },
            { label: "B", text: "Possibility of loss" },
            { label: "C", text: "Small expense" },
            { label: "D", text: "Profit" }
          ],
          answer: "B"
        },
        {
          prompt: "Premium is mainly determined by:",
          options: [
            { label: "A", text: "Risk level and coverage" },
            { label: "B", text: "Colour preference" },
            { label: "C", text: "Exam score" },
            { label: "D", text: "Lucky number" }
          ],
          answer: "A"
        },
        {
          prompt: "The sum assured refers to:",
          options: [
            { label: "A", text: "Total premium paid" },
            { label: "B", text: "Administrative fee" },
            { label: "C", text: "Maximum payout allowed" },
            { label: "D", text: "Claim number" }
          ],
          answer: "C"
        },
        {
          prompt: "A deductible is:",
          options: [
            { label: "A", text: "Discount on premium" },
            { label: "B", text: "Amount the insured pays before the insurer pays" },
            { label: "C", text: "Tax rebate" },
            { label: "D", text: "Cash value bonus" }
          ],
          answer: "B"
        },
        {
          prompt: "Life insurance primarily covers:",
          options: [
            { label: "A", text: "Car damage" },
            { label: "B", text: "Only medical bills" },
            { label: "C", text: "Events tied to life, death, or disability" },
            { label: "D", text: "Screen cracks" }
          ],
          answer: "C"
        },
        {
          prompt: "General insurance includes:",
          options: [
            { label: "A", text: "Term life policies" },
            { label: "B", text: "Whole life policies" },
            { label: "C", text: "Motor, fire, travel, and medical plans" },
            { label: "D", text: "Bonds" }
          ],
          answer: "C"
        },
        {
          prompt: "Buying more coverage usually:",
          options: [
            { label: "A", text: "Lowers premium" },
            { label: "B", text: "Raises premium" },
            { label: "C", text: "Stops claims" },
            { label: "D", text: "Is illegal" }
          ],
          answer: "B"
        },
        {
          prompt: "Co-insurance means:",
          options: [
            { label: "A", text: "Two people insured" },
            { label: "B", text: "Sharing part of the covered cost with the insurer" },
            { label: "C", text: "Double premium" },
            { label: "D", text: "Two insurers for every policy" }
          ],
          answer: "B"
        },
        {
          prompt: "Policy exclusions are:",
          options: [
            { label: "A", text: "Always covered" },
            { label: "B", text: "Covered twice" },
            { label: "C", text: "Circumstances not covered" },
            { label: "D", text: "Premium discounts" }
          ],
          answer: "C"
        },
        {
          prompt: "The main benefit of insurance is:",
          options: [
            { label: "A", text: "Guaranteed profit" },
            { label: "B", text: "Risk transfer and financial protection" },
            { label: "C", text: "Tax avoidance" },
            { label: "D", text: "Investment only" }
          ],
          answer: "B"
        }
      ]
    },
    quizB: {
      description: "Quiz B digs into indemnity, deductibles, policy limits, and other consumer-insurance mechanics from the new list.",
      answerKey: ["B", "B", "B", "B", "C", "B", "B", "A", "B", "B"],
      questions: [
        {
          prompt: "The principle of indemnity means the insurer aims to:",
          options: [
            { label: "A", text: "Let the insured profit from a loss" },
            { label: "B", text: "Restore the insured to the financial position before the loss" },
            { label: "C", text: "Pay double the claim" },
            { label: "D", text: "Charge zero premium" }
          ],
          answer: "B"
        },
        {
          prompt: "A higher deductible generally makes the premium:",
          options: [
            { label: "A", text: "Higher" },
            { label: "B", text: "Lower" },
            { label: "C", text: "Stay the same" },
            { label: "D", text: "Unpredictable" }
          ],
          answer: "B"
        },
        {
          prompt: "In motor insurance, an excess is most similar to:",
          options: [
            { label: "A", text: "A bonus" },
            { label: "B", text: "A deductible" },
            { label: "C", text: "A tax" },
            { label: "D", text: "A rebate" }
          ],
          answer: "B"
        },
        {
          prompt: "Underinsurance can cause:",
          options: [
            { label: "A", text: "Overpayment of claims" },
            { label: "B", text: "Proportional settlement" },
            { label: "C", text: "Lower deductibles" },
            { label: "D", text: "No coverage at all" }
          ],
          answer: "B"
        },
        {
          prompt: "Critical illness riders usually attach to:",
          options: [
            { label: "A", text: "Motor policies" },
            { label: "B", text: "Travel-only policies" },
            { label: "C", text: "Life or medical policies" },
            { label: "D", text: "Fire policies only" }
          ],
          answer: "C"
        },
        {
          prompt: "The insurer in a contract is the party that:",
          options: [
            { label: "A", text: "Buys the policy" },
            { label: "B", text: "Sells the policy and provides coverage" },
            { label: "C", text: "Is the beneficiary" },
            { label: "D", text: "Handles adjusting only" }
          ],
          answer: "B"
        },
        {
          prompt: "A waiting period refers to:",
          options: [
            { label: "A", text: "Time when premiums are unpaid" },
            { label: "B", text: "An initial period when claims are not allowed yet" },
            { label: "C", text: "The expiry date" },
            { label: "D", text: "Cooling-off window for refunds" }
          ],
          answer: "B"
        },
        {
          prompt: "Policy limit refers to:",
          options: [
            { label: "A", text: "The maximum payable per claim or period" },
            { label: "B", text: "The minimum premium" },
            { label: "C", text: "The average payout" },
            { label: "D", text: "The minimum claim" }
          ],
          answer: "A"
        },
        {
          prompt: "If risk probability decreases (all else equal), the premium tends to:",
          options: [
            { label: "A", text: "Increase" },
            { label: "B", text: "Decrease" },
            { label: "C", text: "Stay unchanged" },
            { label: "D", text: "Double" }
          ],
          answer: "B"
        },
        {
          prompt: "Travel insurance commonly covers:",
          options: [
            { label: "A", text: "Guaranteed profit" },
            { label: "B", text: "Flight delays and baggage loss (as defined in the policy)" },
            { label: "C", text: "Stock market losses" },
            { label: "D", text: "Academic failure" }
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
