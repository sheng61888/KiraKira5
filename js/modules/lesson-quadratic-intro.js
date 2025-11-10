(() => {
  const aSlider = document.getElementById("a");
  const bSlider = document.getElementById("b");
  const cSlider = document.getElementById("c");
  const insight = document.getElementById("insightText");

  const draw = () => {
    const a = parseFloat(aSlider.value);
    const b = parseFloat(bSlider.value);
    const c = parseFloat(cSlider.value);

    const x = [];
    const y = [];
    for (let i = -10; i <= 10; i += 0.2) {
      x.push(i);
      y.push(a * i * i + b * i + c);
    }

    Plotly.newPlot("graph", [{ x, y, type: "scatter", line: { color: "#007bff" } }], {
      margin: { t: 20 },
      xaxis: { title: "x" },
      yaxis: { title: "y" }
    });

    // friendly feedback
    let mood = a > 0 ? "smile 😊" : "frown ☹️";
    let steep = Math.abs(a) > 2 ? "narrow" : Math.abs(a) < 1 ? "wide" : "normal";
    insight.textContent = `a = ${a} → ${mood} (${steep}), b = ${b}, c = ${c}`;
  };

  [aSlider, bSlider, cSlider].forEach(s => s.addEventListener("input", draw));
  draw();

  // Flip-cards
  document.querySelectorAll(".cardflip").forEach(card => {
    const q = card.dataset.q;
    const a = card.dataset.a;
    card.innerHTML = `<div class="front">${q}</div><div class="back">${a}</div>`;
    card.addEventListener("click", () => card.classList.toggle("flipped"));
  });
})();
