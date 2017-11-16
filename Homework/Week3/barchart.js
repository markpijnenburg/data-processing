// Name: Mark Pijnenburg
// Student number: 11841117
// Minor Programmeren
// University of Amsterdam

function createBarChart(){

  // Load data from JSON
  d3.json("data.json", function(error, data){
    data.forEach(function(d) {
      // Convert dates to dateobject and values to ints
      d.year = new Date(d.year);
      d.value = Number(+d.value);
    });

  // Define size/margins of canvas
  var margin = {top: 10, right: 10, bottom: 50, left: 60};
  var width = 960 - margin.left - margin.right;
  var height = 400 - margin.top - margin.bottom;
  var textOffset = 30;
  var transitionDuration = 2000;
  var tickRectOffset = 12;

  // Define X and Y axis from chart
  var y = d3.scale.linear().domain([0,
                                  d3.max(data, function(d) {return d.value; })])
                          .range([height, 0]);

  var x = d3.time.scale().domain([d3.min(data, function(d) {return d.year; }),
                                  d3.max(data, function(d) {return d.year; })])
                          .nice(d3.time.year)
                          .range([0, width]);

  var yAxis = d3.svg.axis().scale(y).orient("left").ticks(10);
  var xAxis = d3.svg.axis().scale(x).orient("bottom");

  // Add chart canvas to webpage
  var svg = d3.select("body").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("class" , "chart")
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

  // Define D3 tooltip
  var tip = d3.tip().attr('class', 'd3-tip').offset([-tickRectOffset, 0])
      .html(function(d) { return d.year.getFullYear() +
        "<br><span class='cross'>&#10010</span>" + d.value;});
  svg.call(tip);

  //  Add X axis to canvas
  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .append("text")
      .attr("class", "chart")
      .attr("y", textOffset + margin.top)
      .attr("x", ((width/2) - textOffset))
      .style("text-anchor", "middle")
      .style("font-weight", "bold")
      .style("font-size", "15px")
      .text("Year");

  // Add Y axis to canvas
  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("class", "chart")
      .attr("transform", "rotate(-90)")
      .attr("y", -textOffset)
      .attr("x", -textOffset)
      .attr("dy", "-.71em")
      .style("text-anchor", "end")
      .style("font", "15px sans-serif")
      .text("Number of casulties each year")
      .style("font-weight", "bold");

  // Add bar to canvas with nice transition
  svg.selectAll("bar")
      .data(data)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("y", height)
      .attr("height", 0)
      .attr("width",
            Math.floor((width - margin.left - margin.right) / data.length))
      .transition()
          .duration(transitionDuration)
          .ease("bounce")
          .attr("x", function(d) { return (x(d.year) + 1); })
          .attr("y", function(d) { return (y(d.value) - 1); })
          .attr("height", function(d) { return height - y(d.value); })

  // Enable the tooltip on mouseover
  svg.selectAll("rect")
      .on("mouseover", tip.show)
      .on("mouseout", tip.hide);

  // Add footer text to canvas
  d3.select("body")
      .append("h5")
      .html(function(d) {
        return "<i>" + "Source: "
         + "<a href='https://www.kaggle.com/zusmani/us-mass-shootings-last-" +
         "50-years' target='_blank'>" + "Kaggle" + "</a></i><br><br>" + "Mark \
         Pijnenburg" + "<br>" + "11841117" + "<br>" + "University of Amsterdam";
      });
  });
}
