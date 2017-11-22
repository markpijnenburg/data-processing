/*
Name: Mark Pijnenburg
Student number: 11841117
Minor Programmeren
University of Amsterdam
*/

// Wrapper function
function drawScatterplot(){

  // Load data from json
  d3.json("hpi.json", function(error, data){
    if (error) throw error;

    // Convert certain strings to numbers
    data.forEach(function(d) {
      d.lifeExpectancy = Number(+d.lifeExpectancy);
      d.hpi = Number(+d.hpi);
      d.footprint = Number(+d.footprint);
    });

    // Define dimensions of canvas
    var margin = {top: 20, right: 10, bottom: 50, left: 50};
    var width = 940 - margin.left - margin.right;
    var height = 500 - margin.top - margin.bottom;

    // Declare commonly used variables
    var defaultRadiusSize = 3.6;
    var sizeLegendRect = 18;
    var legendTransitionTime = 1800;
    var xLabelOffset = 36;
    var yLabelOffset = -45;
    var distanceLegendElements = 20;
    var legendYOffset = 300;
    var legendTextOffset = 9;
    var dotTransitionTime = 10;
    var toolTipOffset = -12;
    var distanceTextLegend = 24;

    // X axis properties
    var x = d3.scale.linear()
              .domain(d3.extent(data, function(d) { return d.hpi; }))
              .range([0, width]).nice();

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    // Y axis properties
    var y = d3.scale.linear()
              .domain(d3.extent(data, function(d) { return d.lifeExpectancy; }))
              .range([height, 0]).nice();

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    // Colors to use with legend
    var color = d3.scale.category10();

    // Append a SVG element to the body of the DOM
    var svg = d3.select("body").append("svg")
        .attr("class", "scatterplot")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Add X axis to canvas with text label
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
      .append("text")
        .attr("class", "label")
        .attr("x", width / 2)
        .attr("y", xLabelOffset)
        .style("text-anchor", "middle")
        .text("Degree of happiness");

    // Add Y axis to canvas with text label
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("x", -(height / 2))
        .attr("y", yLabelOffset)
        .attr("dy", ".71em")
        .style("text-anchor", "middle")
        .text("Life expectancy in years");

    // Add dots to scatterplot
    svg.selectAll(".dot")
        .data(data)
      .enter()
        .append("circle")
        .attr("class", "dot")

        // Set radius to zero for animation
        .attr("r", 0)

        // Add dot for dot to scatterplot
        .transition()
          .delay(function(d, i) {return i * dotTransitionTime})
          .attr("cx", function(d) { return x(d.hpi); })
          .attr("cy", function(d) { return y(d.lifeExpectancy); })
          .attr("r", function(d) { return defaultRadiusSize + d.footprint})
          .style("fill", function(d) { return color(d.region); });

    // Define D3 tooltip
    var tip = d3.tip().attr('class', 'd3-tip').offset([toolTipOffset, 0])
         // Show country name in tooltip
        .html(function(d) { return d.country; });

    // Call the defined tooltip
    svg.call(tip);

    // Create empty G element to canvas
    var legend = svg.selectAll(".legend")
        .data(color.domain())
      .enter()
        .append("g")
        .attr("class", "legend")
        .attr("transform",
              function(d, i) {
                  return "translate(0," + i * distanceLegendElements + ")"; });

    // Adding the rect's with color to legend
    legend.append("rect")
        .attr("x", width - sizeLegendRect)
        .attr("y", legendYOffset)
        .attr("width", sizeLegendRect)
        .attr("height", sizeLegendRect)
        .attr("fill", "whitesmoke")
        .transition()
          .duration(legendTransitionTime)
          .attr("fill", color);

    // Adding the text of the legend to canvas
    legend.append("text")
        .attr("class", "legend-text")
        .attr("x", width - distanceTextLegend)
        .attr("y", legendYOffset + legendTextOffset)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .attr("fill", "whitesmoke")
        .text(function(d) { return d; })
        .transition()
          .duration(legendTransitionTime)
          .attr("fill", "black");

    // Enable the tooltip on mouseover
    svg.selectAll(".dot")
        .on("mouseover", tip.show)
        .on("mouseout", tip.hide);

    // Append source and author name to footer
    d3.select("body")
        .append("h5")
        .attr("class", "source")
        .html(function(d) {
          return "<i>" + "Source: "
           + "<a href='https://happyplanetindex.org' target='_blank'>" +
            "Happy Planet Index" + "</a></i><br><br>" + "Mark \
           Pijnenburg" + "<br>" + "11841117" + "<br>" +
           "University of Amsterdam";
        });
  });
}
