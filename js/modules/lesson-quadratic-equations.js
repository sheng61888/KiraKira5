// ===========================================================
// Lesson: Quadratic Equations in One Variable
// Purpose: Clean, static graphs with correct proportions
// ===========================================================

document.addEventListener("DOMContentLoaded", () => {
  // --- Utility: create clean parabola graph ---
  function makeParabola(containerId, a, b, c, color = "#b89fff") {
    const container = document.getElementById(containerId);
    if (!container) return;
    const svgNS = "http://www.w3.org/2000/svg";

    // Remove any existing graph before drawing
    container.innerHTML = "";

    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "-8 -6 16 12"); // Balanced proportions
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "260");
    svg.style.display = "block";
    svg.style.margin = "0 auto";
    container.appendChild(svg);

    // Ground line (x-axis)
    const axis = document.createElementNS(svgNS, "line");
    axis.setAttribute("x1", "-8");
    axis.setAttribute("y1", "0");
    axis.setAttribute("x2", "8");
    axis.setAttribute("y2", "0");
    axis.setAttribute("stroke", "rgba(255,255,255,0.2)");
    axis.setAttribute("stroke-width", "0.05");
    svg.appendChild(axis);

    // Parabola path
    const path = document.createElementNS(svgNS, "path");
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", color);
    path.setAttribute("stroke-width", "0.15");
    svg.appendChild(path);

    // Compute curve
    let d = "";
    for (let x = -8; x <= 8; x += 0.1) {
      const y = a * x * x + b * x + c;
      d += `${x === -8 ? "M" : "L"} ${x} ${-y}`;
    }
    path.setAttribute("d", d);

    // Discriminant for roots
    const D = b * b - 4 * a * c;
    if (D >= 0) {
      const root1 = (-b + Math.sqrt(D)) / (2 * a);
      const root2 = (-b - Math.sqrt(D)) / (2 * a);
      [root1, root2].forEach((r) => {
        const dot = document.createElementNS(svgNS, "circle");
        dot.setAttribute("cx", r);
        dot.setAttribute("cy", "0");
        dot.setAttribute("r", "0.18");
        dot.setAttribute("fill", "#ff9aa2");
        svg.appendChild(dot);
      });
    }
  }

  // --- Render each scene’s graph ---
  makeParabola("impact-graph", 1, -6, 8);   // Scene 1
  makeParabola("factoring-graph", 1, -6, 8); // Scene 2
  makeParabola("square-graph", 1, 4, 1);     // Scene 3
  makeParabola("formula-graph", 1, -4, 4);   // Scene 4

  // --- Quick Check Buttons ---
  document.querySelectorAll(".quick-check").forEach((section) => {
    section.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => {
        const feedback = section.querySelector(".quick-check-feedback");
        const isCorrect = btn.dataset.correct === "true";

        // Reset all buttons first
        section.querySelectorAll("button").forEach((b) => {
          b.classList.remove("correct", "wrong");
        });

        // Highlight selection
        btn.classList.add(isCorrect ? "correct" : "wrong");
        feedback.textContent = isCorrect
          ? "✅ Correct!"
          : "❌ Try again!";
      });
    });
  });
});
