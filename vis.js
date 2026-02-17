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

async function fetchData() {
  const data = await d3.csv("./data/videogames_long.csv");
  return data;
}

async function render(viewID, spec) {
  const result = await vegaEmbed(viewID, spec);
  result.view.run();
}

fetchData().then(async (data) => {
  const vlSpec1 = vl
  .markBar()
  .title({text:"Global Sales by Genre and Platform", fontSize: 16,
  anchor: "start"
})
  .data(data)
  .transform(
    vl.joinaggregate(vl.sum('global_sales').as('platform_total')).groupby('platform'),
    vl.window(vl.dense_rank().as('rank')).sort([{field: 'platform_total', order: 'descending'}]),
    vl.calculate('datum.rank <= 10 ? datum.platform : "Other"').as('platform_group')
  )
  .encode(
    vl.y().fieldN("genre").sort("-x").title("Genre"),
    vl.x().fieldQ("global_sales").aggregate("sum").title("Total Global Sales"),
    vl.color()
      .fieldN("platform_group")
      .title("Platform")
      .sort({field: "rank", op: "min", order: "ascending"})
      .scale({
        // This tells Vega-Lite: Use these specific colors in this order.
        // We pick a standard scheme for the first 10, and force 'grey' for the 11th.
        range: [
          "#0052cc", "#00b300", "#1a75ff", "#ffd633", "#ffaa00", 
          "#3399ff", "#ff8533", "#99ccff", "#e6f0ff", "#bab0ac", 
          "#d3d3d3" // This 11th color is for "Other"
        ]
      }),
    vl.order().fieldQ("rank").sort("ascending") 
  )
  .width("container")
.height(400)
.autosize({ type: "fit", contains: "padding" })
  .toSpec();

  const vlSpec2 = vl
    .layer(
  vl.markLine()
  .title({text: "Sales Over Time by Platform and Genre", fontSize:16, anchor:"start"})
    .transform(
      vl.calculate('datum.global_sales / 4').as('sales_m')
      )
    .encode(
      vl.x().fieldQ('year').bin({step: 5}),
      vl.y().sum('sales_m')
    ),

  // --- LAYER 2: THE TOP PERFORMERS (POINTS) ---
  vl.markPoint({size: 500, filled: true})
    .transform(
      vl.calculate('(floor(datum.year / 5) * 5) + 2.5').as('year_bin'),
      vl.joinaggregate(vl.sum('global_sales').as('platform_sales_bin')).groupby('year_bin', 'platform'),
      vl.joinaggregate(vl.sum('global_sales').as('genre_sales_bin')).groupby('year_bin', 'genre'),
      vl.calculate('datum.platform_sales_bin / 4').as('platform_sales_m'),
      vl.window(vl.rank().as('platform_rank')).sort([{field: 'platform_sales_bin', order: 'descending'}]).groupby('year_bin'),
      vl.window(vl.rank().as('genre_rank')).sort([{field: 'genre_sales_bin', order: 'descending'}]).groupby('year_bin'),
      vl.filter('datum.platform_rank == 1 && datum.genre_rank == 1')
    )
    .encode(
      vl.x().fieldQ('year_bin')
        .title('5-Year Period')
        .scale({domain: [1980, 2025]})
        .axis({format: 'd'}),
      vl.y().fieldQ('platform_sales_m')
        .title('Global Sales (Millions)')
        .axis({ format: '.0f' }), // This is where the formatting goes
      vl.color().fieldN('platform').title('Top Platform'),
      vl.shape().fieldN('genre').title('Top Genre'),
      vl.tooltip([
        {field: 'platform', type: 'nominal', title: 'Winning Platform'},
        {field: 'genre', type: 'nominal', title: 'Winning Genre'},
        {field: 'platform_sales_bin', type: 'quantitative', title: 'Winner Sales'}
      ])
    )
)
.data(data)
.width("container")
.height(400)
.toSpec();

const vlSpec3 = vl
  .markBar()
  .data(data)
  .title({text: "Regional Sales vs. Platform", fontSize:16, anchor:"start"})

  .transform(
    vl.aggregate(vl.sum('sales_amount').as('total_sales'))
      .groupby('sales_region', 'platform'),
    
    vl.window(vl.rank().as('region_rank'))
      .sort([{field: 'total_sales', order: 'descending'}])
      .groupby('sales_region'),
    
    vl.calculate('datum.region_rank <= 5 ? 1 : 0').as('top5anywhere'),
    vl.joinaggregate(vl.sum('top5anywhere').as('global_top_count'))
      .groupby('platform'),
    vl.filter('datum.global_top_count > 0'),
    
  )
  .encode(
    // X-axis: The Region categories
    vl.x().fieldN('sales_region')
      .title('Region')
      .axis({labelAngle: 0}),

    // xOffset: This now shows ALL 8 unique platforms in every region group
    vl.xOffset().fieldN('platform'),

    // Y-axis: Sales sum
    vl.y().fieldQ('total_sales')
      .title('Sales (Millions)'),

    // Color: Keeps the platform colors consistent
    vl.color().fieldN('platform')
      .title('Top Platforms')
      .scale({domain: ['DS', 'NES', 'SNES', 'PS', 'PS2', 'PS3', 'Wii', 'X360'], 
        // Define the corresponding hex colors
        range: ['#ffaa00', '#ff7f0e', '#fa4d2a', '#3399ff', '#0052cc', '#1a75ff', '#ffd633', '#00b300']}),

    vl.tooltip([
      {field: 'sales_region', title: 'Region'},
      {field: 'platform', title: 'Platform'},
      {field: 'total_sales', title: 'Total Sales', format: '.2f'}
    ])
  )
  .width("container")
  .toSpec();

  const vlSpec4 = vl
  .markLine({point: true})
  .data(data)
    .title({text: "Global Sales vs. Genre for the Nintendo DS", fontSize:16, anchor:"start"})

  .transform(
    vl.filter("datum.platform == 'DS' && datum.year >= 2004 && datum.year <= 2014"),
    vl.calculate('datum.global_sales / 4').as('game_sales_individual'),
    vl.aggregate(
      vl.sum('game_sales_individual').as('total_genre_sales'),
      vl.argmax('game_sales_individual').as('top_record') 
    ).groupby('year', 'genre')
  )
  .encode(
    vl.x().fieldQ('year')
      .title('Year')
      .axis({format: 'd'}),
    
    vl.y().fieldQ('total_genre_sales')
      .title('Global Sales (Millions)'),
    
    vl.color().fieldN('genre')
      .title('Genre')
      .scale({scheme: 'category20'}),

    vl.tooltip([
      {field: 'year', title: 'Year'},
      {field: 'genre', title: 'Genre'},
      {field: 'total_genre_sales', title: 'Total Sales (Genre)', format: '.2f'},
      {field: 'top_record.name', title: 'Top-Performing Game'}
    ])
  )
  .width("container")
  .toSpec();

const vlSpec5 = vl
  .layer(
  // Layer 1: The Bar Chart
  vl.markBar()
  .title({text: "Category: Genre", fontSize: 16,
  anchor: "start"
})
    .encode(
      vl.x().count().title("Frequency"),
      vl.y().fieldN("genre").sort("-x").title("Genre")
    ),

  // Layer 2: The Statistics Text
  vl.markText({
    align: 'left',
    baseline: 'top',
    dx: 5,
    dy: 5,
    fontSize: 12,
    fontWeight: 'bold',
    color: 'black'
  })
  .transform(

    vl.aggregate(vl.count().as("genreFrequency")).groupby("genre"),
    vl.aggregate(
      vl.mean("genreFrequency").as("mean"),
      vl.median("genreFrequency").as("median"),
      vl.stdev("genreFrequency").as("stdev"),
      vl.min("genreFrequency").as("min"),
      vl.max("genreFrequency").as("max")
    ),
    vl.calculate("datum.max - datum.min").as("range"),
    vl.calculate(
      "'Mean: ' + format(datum.mean, '.2f') + " +
      "' | Median: ' + datum.median + " +
      "' | SD: ' + format(datum.stdev, '.2f') + " +
      "' | Range: ' + datum.range"
    ).as("summary")
  )
  .encode(
    vl.x().value(-20), // Absolute position 0 (left)
    vl.y().value(-20), // Absolute position 0 (top)
    vl.text().fieldN("summary") // Display the 'summary' field we just created
  )
)
.data(data)
.width("container")
.height(400)
.autosize({ type: "fit", contains: "padding" })
.toSpec();

  render("#view", vlSpec1);
  render("#view2", vlSpec2);
  render("#view3", vlSpec3);
  render("#view4", vlSpec4);
  render("#view5", vlSpec5);
});

