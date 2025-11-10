(() => {
  const GRAPH_WIDTH = 260;
  const GRAPH_HEIGHT = 160;
  const X_MIN = -5;
  const X_MAX = 5;

  // Map math (x, y) to SVG coords
  const mapPoint = (x, y, ymin, ymax) => {
    const px = ((x - X_MIN) / (X_MAX - X_MIN)) * GRAPH_WIDTH;
    const py = GRAPH_HEIGHT - ((y - ymin) / (ymax - ymin)) * GRAPH_HEIGHT;
    return { x: px, y: py };
  };

  const createSvg = () => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", `0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`);
    svg.setAttribute("class", "lesson-graph");
    return svg;
  };

  const drawAxes = (svg, ymin, ymax) => {
    const ns = svg.namespaceURI;

    // x-axis (y=0) if visible
    if (ymin < 0 && ymax > 0) {
      const y0 = mapPoint(0, 0, ymin, ymax).y;
      const xAxis = document.createElementNS(ns, "line");
      xAxis.setAttribute("x1", "0");
      xAxis.setAttribute("y1", y0);
      xAxis.setAttribute("x2", GRAPH_WIDTH);
      xAxis.setAttribute("y2", y0);
      xAxis.setAttribute("class", "axis-line");
      svg.appendChild(xAxis);
    }

    // y-axis (x=0) if visible
    if (X_MIN < 0 && X_MAX > 0) {
      const x0 = mapPoint(0, ymin, ymin, ymax).x;
      const yAxis = document.createElementNS(ns, "line");
      yAxis.setAttribute("x1", x0);
      yAxis.setAttribute("y1", "0");
      yAxis.setAttribute("x2", x0);
      yAxis.setAttribute("y2", GRAPH_HEIGHT);
      yAxis.setAttribute("class", "axis-line");
      svg.appendChild(yAxis);
    }
  };

  const drawParabola = (svg, a, h, k) => {
    const ns = svg.namespaceURI;

    // Sample y-range to scale nicely
    let ymin = Infinity;
    let ymax = -Infinity;
    for (let x = X_MIN; x <= X_MAX; x += 0.5) {
      const y = a * (x - h) * (x - h) + k;
      if (y < ymin) ymin = y;
      if (y > ymax) ymax = y;
    }
    // Add small padding
    const pad = 1;
    ymin -= pad;
    ymax += pad;

    drawAxes(svg, ymin, ymax);

    const path = document.createElementNS(ns, "path");
    let d = "";

    for (let x = X_MIN; x <= X_MAX; x += 0.1) {
      const y = a * (x - h) * (x - h) + k;
      const { x: px, y: py } = mapPoint(x, y, ymin, ymax);
      d += (x === X_MIN ? "M" : "L") + px.toFixed(2) + "," + py.toFixed(2) + " ";
    }

    path.setAttribute("d", d.trim());
    path.setAttribute("class", "parabola-path");
    svg.appendChild(path);
  };

  const renderSceneGraphs = () => {
    document.querySelectorAll(".scene-graph").forEach(container => {
      const a = parseFloat(container.dataset.a || "1");
      const h = parseFloat(container.dataset.h || "0");
      const k = parseFloat(container.dataset.k || "0");

      // Clear & render
      container.innerHTML = "";
      const svg = createSvg();
      drawParabola(svg, a, h, k);
      container.appendChild(svg);

      // If there's an alt-a, render a faint comparison curve
      if (container.dataset.altA) {
        const ns = svg.namespaceURI;
        const altA = parseFloat(container.dataset.altA);
        let ymin = Infinity;
        let ymax = -Infinity;

        for (let x = X_MIN; x <= X_MAX; x += 0.5) {
          const y1 = a * (x - h) * (x - h) + k;
          const y2 = altA * (x - h) * (x - h) + k;
          ymin = Math.min(ymin, y1, y2);
          ymax = Math.max(ymax, y1, y2);
        }

        const pad = 1;
        ymin -= pad;
        ymax += pad;
        svg.innerHTML = "";
        drawAxes(svg, ymin, ymax);

        const makePath = (coef, css) => {
          const p = document.createElementNS(ns, "path");
          let pathData = "";
          for (let x = X_MIN; x <= X_MAX; x += 0.1) {
            const y = coef * (x - h) * (x - h) + k;
            const { x: px, y: py } = mapPoint(x, y, ymin, ymax);
            pathData += (x === X_MIN ? "M" : "L") + px.toFixed(2) + "," + py.toFixed(2) + " ";
          }
          p.setAttribute("d", pathData.trim());
          p.setAttribute("class", css);
          return p;
        };

        svg.appendChild(makePath(a, "parabola-path"));
        svg.appendChild(makePath(altA, "parabola-path parabola-alt"));
      }
    });
  };

  const wireQuickChecks = () => {
    document.querySelectorAll(".quick-check").forEach(block => {
      const feedbackEl = block.querySelector(".quick-check-feedback");
      const buttons = block.querySelectorAll("button[data-correct]");

      buttons.forEach(btn => {
        btn.addEventListener("click", () => {
          const correct = btn.dataset.correct === "true";
          block.classList.remove("is-correct", "is-wrong");

          if (correct) {
            block.classList.add("is-correct");
            if (feedbackEl) {
              feedbackEl.textContent = "Nice. You’re reading the curve correctly.";
            }
          } else {
            block.classList.add("is-wrong");
            if (feedbackEl) {
              feedbackEl.textContent = "Not quite. Reread the clue above the graph.";
            }
          }
        });
      });
    });
  };

  document.addEventListener("DOMContentLoaded", () => {
    renderSceneGraphs();
    wireQuickChecks();
  });
})();
