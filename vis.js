const data = [
  {
    label: "Baseline",
    values: {
      burnedOut: 30,
      symptoms: 20,
      stressed: 40,
      none: 10
    }
  },
  {
    label: "10-month",
    values: {
      burnedOut: 10,
      symptoms: 30,
      stressed: 60,
      none: 0
    }
  },
  {
    label: "15-month",
    values: {
      burnedOut: 13,
      symptoms: 13,
      stressed: 63,
      none: 13
    }
  }
];

const chart = document.getElementById("chart");

data.forEach(row => {
  const rowEl = document.createElement("div");
  rowEl.className = "row";

  const label = document.createElement("div");
  label.className = "label";
  label.textContent = row.label;

  const bar = document.createElement("div");
  bar.className = "bar";

  const segments = [
    { class: "burned-out", value: row.values.burnedOut },
    { class: "symptoms", value: row.values.symptoms },
    { class: "stressed", value: row.values.stressed },
    { class: "none", value: row.values.none }
  ];

  segments.forEach(seg => {
    if (seg.value > 0) {
      const segment = document.createElement("div");
      segment.className = `segment ${seg.class}`;
      segment.style.width = seg.value + "%";
      bar.appendChild(segment);
    }
  });

  rowEl.appendChild(label);
  rowEl.appendChild(bar);
  chart.appendChild(rowEl);
});


function createStrawHat(containerId) {
  const container = document.getElementById(containerId);

  const svgNS = "http://www.w3.org/2000/svg";
  const w = 300, h = 160;

  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("width", w);
  svg.setAttribute("height", h);
  svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
  svg.setAttribute("aria-label", "Straw hat");
  svg.style.display = "block";

  const brim = document.createElementNS(svgNS, "rect");
  brim.setAttribute("x", "75");
  brim.setAttribute("y", "105");
  brim.setAttribute("width", "150");
  brim.setAttribute("height", "24");
  brim.setAttribute("rx", "12");
  brim.setAttribute("fill", "#f3cf7a");
  brim.setAttribute("stroke", "#e0b760");
  brim.setAttribute("stroke-width", "2");

  const semi = document.createElementNS(svgNS, "path");
  semi.setAttribute("d", "M110,80 A40,40 0 0,1 190,80 L190,100 L110,100 Z");
  semi.setAttribute("fill", "#f6d78a");
  semi.setAttribute("stroke", "#e0b760");
  semi.setAttribute("stroke-width", "2");

  const band = document.createElementNS(svgNS, "rect");
  band.setAttribute("x", "110");
  band.setAttribute("y", "92");
  band.setAttribute("width", "80");
  band.setAttribute("height", "12");
  band.setAttribute("fill", "#711b0a");
  band.setAttribute("stroke", "#711b0a");
  band.setAttribute("stroke-width", "2");

  svg.appendChild(brim);
  svg.appendChild(semi);
  svg.appendChild(band);

  container.appendChild(svg);
}

createStrawHat('hat-container');

