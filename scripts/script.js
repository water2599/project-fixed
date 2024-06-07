// set dimensions and margins for the chart

const marginS = { top: 70, right: 30, bottom: 40, left: 80 };
const widths =  900- marginS.left - marginS.right;
const heights = 500 - marginS.top - marginS.bottom;


// create the svg element and append it to the chart container

const svg = d3.select("#linechart")
  .append("svg")
    .attr("width", widths + marginS.left + marginS.right)
    .attr("height", heights + marginS.top + marginS.bottom)
  .append("g")
    .attr("transform", `translate(${marginS.left},${marginS.top})`);

// dataset

d3.csv("data/health-stats-new.csv").then(function(data) {

// format the data
  data.forEach(function(d) {
      d.Country = d.Country;
      d.Year = d.Year;
      d.Rate = Number(d.Rate);
  });
// grouping the countries into options
  const allGroup = new Set(data.map(d => d.Country));

// add the options to the button
  d3.select("#selectButton")
    .selectAll('myOptions')
    .data(allGroup)
    .enter()
    .append('option')
    .text(function (d) { return d;}) 
    .attr("value", function (d) { return d;}) 

// add colour to each country
const myColor = d3.scaleOrdinal()
  .domain(allGroup)
  .range(d3.schemeSet2);

// add the x-axis

const x = d3.scaleBand()
  .range([0, widths]);
  x.domain(data.map( function(d) {return d.Year; }))
svg.append("g")
  .attr("transform", `translate(0, ${heights})`)
  .call(d3.axisBottom(x).ticks(9));

// add the y-axis

const y = d3.scaleLinear()
  .domain([0, d3.max(data, function(d) { return +d.Rate; })])
  .range([heights, 0]);
svg.append("g")
  .call(d3.axisLeft(y));

// the line generator

const line = svg
  .append('g')
  .append("path")
    .datum(data.filter(function(d){return d.Country=="Australia"}))
    .attr("d", d3.line()
      .x(function(d) { return x(+d.Year) })
      .y(function(d) { return y(+d.Rate) })
    )
    .attr("stroke", function(d){ return myColor(d.Country)})
    .style("stroke-width", 6)
    .style("fill", "none")

// a function to update the chart
function update(selectedGroup) {

  // create new data with the selection
  const dataFilter = data.filter(function(d){return d.Country==selectedGroup})

  // update the line with new data
  line
      .datum(dataFilter)
      .transition()
      .duration(1000)
      .attr("d", d3.line()
        .x(function(d) { return x(+d.Year) })
        .y(function(d) { return y(+d.Rate) })
      )
      .attr("stroke", function(d){ return myColor(selectedGroup)})
}

//  when the button is changed, run the updateChart function  
d3.select("#selectButton").on("change", function(event,d) {
  // recover the option that has been chosen
  const selectedOption = d3.select(this).property("value")
  // run the updateChart function with this selected option
  update(selectedOption)
})

// y-axis label
svg.append("text")
  .attr("transform", "rotate(-90)")
  .attr("y",0 - marginS.left)
  .attr("x",0 - (heights / 2))
  .attr("dy", "1em")
  .style("text-anchor", "middle")
  .text("Rate per 100,000 people");

})