/*
Name: Mark Pijnenburg
Student number: 11841117
Minor Programmeren
University of Amsterdam
*/

window.onload = function() {

  // Declare commonly used variables
  var margin = {
    top: 10,
    right: 60,
    bottom: 60,
    left: 60
  };

  var width = 960 - margin.left - margin.right;
  var height = 500 - margin.top - margin.bottom;
  var parseDate = d3.time.format.iso;
  var color = d3.scale.category10();
  var x = d3.time.scale();
  var y = d3.scale.linear();
  var lineTransitionTime = 750;
  var textRemoveTime = 100;
  var textAppendTime = 1000;

  // Load the default data from JSON
  d3.json("stocks2016.json", function(error, data) {
    if (error) {
      console.log("Could not load JSON file correctly")
      d3.select("body").append("h1").html("Errow while loading data :(")
    }

    // Convert data to numbers/dates
    data.forEach(function(d) {
      d.msft = Number(+d.msft);
      d.aapl = Number(+d.aapl);
      d.nflx = Number(+d.nflx);
      d.date = parseDate.parse(d.date);
    });

    // Determine the colors based on data
    color.domain(d3.keys(data[0]).filter(function(key) {
      return key !== "date";
    }));

    // Map data for each stock symbol
    var stocks = color.domain().map(function(symbol) {
      return {
        symbol: symbol,
        values: data.map(function(d) {
          return {
            date: d.date,
            price: d[symbol]
          };
        })
      };
    });

    // Define X and Y axis from chart
    x.domain([d3.min(data, function(d) {
          return d.date;
        }),
        d3.max(data, function(d) {
          return d.date;
        })
      ])
      .range([0, width]);

    y.domain([
        0,
        d3.max(stocks, function(s) {
          return d3.max(s.values, function(v) {
            return v.price;
          })
        })
      ])
      .range([height, 0]);

    var xAxis = d3.svg.axis().scale(x).tickFormat(d3.time.format("%b")).orient("bottom");
    var yAxis = d3.svg.axis().scale(y).orient("left");

    // Draw lines based on date and price
    var line = d3.svg.line()
      .interpolate("basis")
      .x(function(d) {
        return x(d.date);
      })
      .y(function(d) {
        return y(d.price);
      });

    // Add g element which contains line chart
    var svg = d3.select("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("class", "line-chart")
      .append("g")
      .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

    // Add x axis and label to line chart
    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
      .append("text")
      .attr("class", "label")
      .attr("x", width / 2)
      .attr("y", 45)
      .style("text-anchor", "middle")
      .text("Month of the Year");

    // Add y axis and label to line chart
    svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
      .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", -55)
      .attr("x", (-height + margin.bottom + margin.top) / 2)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Price ($)");

    // Add stocks elements to canvas and draw lines
    var symbol = svg.selectAll(".stock")
      .data(stocks)
      .enter().append("g")
      .attr("class", "stock");

    symbol.append("path")
      .attr("class", "line")
      .attr("d", function(d) {
        return line(d.values);
      })
      .attr("id", function(d, i) {
        return "id" + i;
      })
      .style("stroke", function(d) {
        return color(d.symbol)
      });

    // Add text to the end of the lines with company abbreviation
    symbol.append("text")
      .datum(function(d) {
        return {
          name: d.symbol,
          value: d.values[d.values.length - 1]
        };
      })
      .attr("transform", function(d) {
        return "translate(" + x(d.value.date) + "," + y(d.value.price) + ")";
      })
      .attr("x", 3)
      .attr("dy", ".35em")

      .text(function(d) {
        return d.name;
      });

    /*
    Part of code that handels crosshair / mouse over effect.
    Based on:
    https://bl.ocks.org/larsenmtl/e3b8b7c2ca4787f77d78f58d41c3da91
    */
    var mouseG = svg.append("g")
      .attr("class", "mouse-over-effects");

    mouseG.append("path")
      .attr("class", "mouse-line")
      .style("stroke", "black")
      .style("stroke-width", "1px")
      .style("opacity", "0");

    var lines = d3.selectAll(".line")[0];

    var mousePerLine = mouseG.selectAll('.mouse-per-line')
      .data(stocks)
      .enter()
      .append("g")
      .attr("class", "mouse-per-line");

    // Add circle to crosshair
    mousePerLine.append("circle")
      .attr("r", 5)
      .style("stroke", function(d) {
        return color(d.symbol);
      })
      .style("fill", "none")
      .style("stroke-width", "1px")
      .style("opacity", "0");

    mousePerLine.append("text")
      .attr("transform", "translate(6,-5)");

    // Append rect to catch mouse movement from canvas
    mouseG.append('svg:rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .on('mouseout', function() {
        d3.select(".mouse-line")
          .style("opacity", "0");
        d3.selectAll(".mouse-per-line circle")
          .style("opacity", "0");
        d3.selectAll(".mouse-per-line text")
          .style("opacity", "0");
      })
      .on('mouseover', function() {
        d3.select(".mouse-line")
          .style("opacity", "1");
        d3.selectAll(".mouse-per-line circle")
          .style("opacity", "1");
        d3.selectAll(".mouse-per-line text")
          .style("opacity", "1");
      })
      .on('mousemove', function() {
        var mouse = d3.mouse(this);
        d3.select(".mouse-line")
          .attr("d", function() {
            var d = "M" + mouse[0] + "," + height;
            d += " " + mouse[0] + "," + 0;
            return d;
          });

        d3.selectAll(".mouse-per-line")
          .attr("transform", function(d, i) {
            var xDate = x.invert(mouse[0]),
              bisect = d3.bisector(function(d) {
                return d.date;
              }).right;
            idx = bisect(d.values, xDate);

            var beginning = 0,
              end = lines[i].getTotalLength(),
              target = null;

            while (true) {
              target = Math.floor((beginning + end) / 2);
              pos = lines[i].getPointAtLength(target);
              if ((target === end || target === beginning) && pos.x !== mouse[0]) {
                break;
              }
              if (pos.x > mouse[0]) end = target;
              else if (pos.x < mouse[0]) beginning = target;
              else break;
            }

            d3.select(this).select('text')
              .text("$" + y.invert(pos.y).toFixed(2));

            return "translate(" + mouse[0] + "," + pos.y + ")";
          });

      });

    // Check if user selects other year from dropdown menu
    d3.selectAll("option")
      .on("click", function() {
        var date = this.getAttribute("value");
        var str;
        if (date == "2016") {
          str = "stocks2016.json";
        } else {
          str = "stocks2015.json";
        }
        updateChart(str)
      });

    // Append footer underneath line chart with source
    d3.select("body")
      .append("h5")
      .html(function(d) {
        return "<i>" + "Source: " +
          "<a href='https://www.kaggle.com/borismarjanovic/price-volume-data-for-all-us-stocks-etfs' target='_blank'>" + "Kaggle" + "</a></i><br><br>" + "Mark \
         Pijnenburg" + "<br>" + "11841117" + "<br>" + "University of Amsterdam";
      });

    /*
    Function that updates chart accordingly to new data
    */
    function updateChart(str) {
      d3.json(str, function(error, data) {
        if (error) {
          console.log("Could not load JSON file correctly")
          d3.select("body").append("h1").html("Errow while loading data :(")
        }

        // Convert certain strings to numbers
        data.forEach(function(d) {
          d.msft = Number(+d.msft);
          d.aapl = Number(+d.aapl);
          d.nflx = Number(+d.nflx);
          d.date = parseDate.parse(d.date);
        });

        // Map data for each stock symbol
        var stocks = color.domain().map(function(symbol) {
          return {
            symbol: symbol,
            values: data.map(function(d) {
              return {
                date: d.date,
                price: d[symbol]
              };
            })
          };
        });

        // Update x and y axis
        x.domain([d3.min(data, function(d) {
            return d.date;
          }),
          d3.max(data, function(d) {
            return d.date;
          })
        ]);

        y.domain([0, d3.max(stocks, function(s) {
          return d3.max(s.values, function(v) {
            return v.price;
          })
        })]);

        // Update lines with nice transition
        var svg = d3.select("body").transition();
        for (i = 0; i < stocks.length; i++) {
          svg.selectAll("#id" + i)
            .duration(lineTransitionTime)
            .attr("d", line(stocks[i].values));
        }

        // Update both x and y axis on new data
        svg.select(".x.axis")
          .duration(lineTransitionTime)
          .call(xAxis);
        svg.select(".y.axis")
          .duration(lineTransitionTime)
          .call(yAxis);

        // Remove text from old position with nice transition
        symbol.selectAll("text")
          .transition()
          .duration(textRemoveTime)
          .style("fill", "whitesmoke")
          .remove();

        // Add text to new position with transition
        symbol.append("text")
          .datum(function(d) {
            return {
              name: d.symbol,
              value: d.values[d.values.length - 1]
            };
          })
          .attr("transform", function(d, i) {
            return "translate(" + x(d3.max(stocks, function(s) {
              return d3.max(s.values, function(v) {
                return v.date;
              })
            })) + "," + y(stocks[i].values[stocks[i].values.length - 1].price) + ")";
          })
          .attr("x", 3)
          .attr("dy", ".35em")
          .style("fill", "white")
          .text(function(d) {
            return d.name;
          })
          .transition()
          .duration(textAppendTime)
          .style("fill", "black");
      })
    }
  });
};
