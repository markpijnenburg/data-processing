/*
Name: Mark Pijnenburg
Student number: 11841117
Minor Programmeren
University of Amsterdam
*/

function wrapperFunction() {
  "use strict";
  // Width and height of map
  var width = 900;

  // D3 Projection
  var projection = d3.geo.albersUsa()
    .scale([1000])
    .translate([width / 2, 225]);

  // Define path generator
  var path = d3.geo.path()
    .projection(projection);

  // Define D3 tooltip
  var tip = d3.tip().attr("class", "d3-tip").offset([-12, 0])
    // Show country name in tooltip
    .html(function(d) {
      return d.key + " used: " + d.values;
    });

  // Used to store the name of selected state
  var clickedState;

  queue().defer(d3.json, "./data/us_states.json")
    .defer(d3.json, "./data/homicide_usa_2014.json")
    .await(makeMapUSA);

  // Map number of homicides per state
  function mapHomicides(homicides) {
    return d3.nest().key(function(d) {
        return d.State;
      })
      .rollup(function(v) {
        return v.length;
      })
      .map(homicides);
  }

  // Map number of weapontype per state
  function mapWeapons(stateHomicides) {
    return d3.nest().key(function(d) {
        return d.Weapon;
      })
      .rollup(function(v) {
        return v.length;
      })
      .entries(stateHomicides);
  }

  // Map homicides per state
  function mapHomicidesState(homicides) {
    return d3.nest().key(function(d) {
        return d.State;
      })
      .map(homicides);
  }

  // Map number of population from states
  function mapPopulation(states) {
    return d3.nest().key(function(d) {
        return d.properties.name;
      })
      .map(states.features);
  }

  // Creates the map of USA
  function makeMapUSA(error, states, homicides) {
    if (error) {
      console.log("Could not load JSON file correctly 1");
      d3.select("body").append("h1").html("Errow while loading data :(");
    }

    var mappedHomicides = mapHomicides(homicides);
    var mappedHomicidesState = mapHomicidesState(homicides);
    var mappedPopulation = mapPopulation(states);

    // Define color range for map
    var color = d3.scale.linear()
      .domain([0, 15])
      .range(["#ffdbdb", "#890000"]);

    // Calculate number of homicides per 200K inhabitants for states
    states.features.forEach(function(d) {
      d.properties.population = Number(+d.properties.population);
      d.properties.homicides =
        Number.parseInt((mappedHomicides[d.properties.name] /
          (mappedPopulation[d.properties.name][0].properties.population /
            200000)));
    });

    // Create SVG element and append map to the SVG
    var svg = d3.select("#usa-map")
      .append("div")
      .attr("class", "main-content")
      .append("svg")
      .attr("id", "map")
      .attr("preserveAspectRatio", "xMinYMin meet")
      .attr("viewBox", "0 0 900 450")
      .attr("transform", "translate(20,-90), scale(0.6)");

    // Append Div for tooltip to SVG
    var tooltip = d3.select(".main-content")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    // Bind the data to the SVG and create one path per GeoJSON feature
    svg.selectAll("path")
      .data(states.features)
      .enter()
      .append("path")
      .attr("d", path)
      .style("stroke", "#fff")
      .style("stroke-width", "1")
      .style("fill", function(d) {
        return color(mappedPopulation[d.properties.name][0].properties.homicides);
      })
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseout", mouseout)
      .on("click", mouseclick);

    // Define and add gradient bar to map
    var defs = svg.append("defs");
    var linearGradient = defs.append("linearGradient")
      .attr("id", "linear-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "0%");

    linearGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#ffdbdb");

    linearGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#890000");

    svg.append("rect")
      .attr("width", 120)
      .attr("height", 20)
      .attr("x", 730)
      .attr("y", 415)
      .style("fill", "url(#linear-gradient)");

    svg.append("text")
      .attr("class", "label")
      .attr("x", 790)
      .attr("y", 405)
      .style("font-size", "9px")
      .style("text-anchor", "middle")
      .text("Homicides per 200K inhabitants");

    svg.append("text")
      .attr("x", 730)
      .attr("y", 445)
      .style("font-size", "10px")
      .style("text-anchor", "middle")
      .text("Low");

    svg.append("text")
      .attr("x", 790)
      .attr("y", 445)
      .style("font-size", "10px")
      .style("text-anchor", "middle")
      .text("Avg.");

    svg.append("text")
      .attr("x", 850)
      .attr("y", 445)
      .style("font-size", "10px")
      .style("text-anchor", "middle")
      .text("High");

    // Called when user clicks on state
    function mouseclick(d) {
      clickedState = d.properties.name;
      d3.select("h3").html("Selected state: " + clickedState);
      d3.select("h3").transition().duration(300).style("opacity", 1);

      // Create new barchart if not present
      if (d3.select(".barchartcanvas").empty()) {
        d3.select("#usa-map")
          .transition()
          .duration(500)
          .call(styleTween, "width", "100%")
          .transition()
          .call(styleTween, "width", "50%");

        d3.select("#barchart")
          .transition()
          .duration(500)
          .call(styleTween, "width", "0%")
          .transition()
          .call(styleTween, "width", "50%");

        d3.select("#map")
          .transition()
          .delay(500)
          .duration(500)
          .attr("transform", "translate(20,0)");
      }
      // Only update map if there is data
      if (mappedHomicides[clickedState] >= 1) {
        linkedBarChart(mappedHomicidesState[d.properties.name]);
      }
    }

    // Function to transition HTMl text nicely
    function styleTween(transition, name, value) {
      transition.styleTween(name, function() {
        return d3.interpolate(this.style[name], value);
      });
    }

    function mouseover() {
      tooltip.transition()
        .duration(200)
        .style("opacity", ".9");
    }

    function mousemove(d) {
      var numberOfHomicides = mappedHomicides[d.properties.name];
      if (numberOfHomicides == null) {
        numberOfHomicides = 0;
        mappedPopulation[d.properties.name][0].properties.homicides = 0;
      }

      tooltip.html("<b>" + d.properties.name + "</b>" +
          "<br>Total number of homicides: " + "<b>" + numberOfHomicides +
          "</b>" + "<br>Homicides per 200.000 inhabitants: " + "<b>" +
          mappedPopulation[d.properties.name][0].properties.homicides + "</b>")
        .style("left", (d3.event.pageX - 85) + "px")
        .style("top", (d3.event.pageY - 70) + "px");
    }

    function mouseout() {
      tooltip.transition()
        .duration(500)
        .style("opacity", 0);
    }

    // Change map when year selected from dropdown
    d3.select("#dropdown_year")
      .on("change", function() {
        var selectedDate = d3.select("#dropdown_year").node().value;

        d3.select("h1").html("Homicides in the USA (" + selectedDate + ")");

        var dataset = "./data/homicide_usa_" + selectedDate + ".json";
        queue().defer(d3.json, dataset)
          .await(updateMap);
      });

    // Called when user changes year from dropdown
    function updateMap(error, homicides) {
      if (error) {
        console.log("Could not load JSON file correctly 2");
        d3.select("body").append("h1").html("Errow while loading data :(");
      }
      mappedHomicides = mapHomicides(homicides);
      mappedHomicidesState = mapHomicidesState(homicides);
      var mappedPopulation = mapPopulation(states);
      var color = d3.scale.linear()
        .domain([0, 15])
        .range(["#ffdbdb", "#890000"]);

      // Calculate homicides per 200K inhabitants for new dataset
      states.features.forEach(function(d) {
        d.properties.population = Number(+d.properties.population);
        d.properties.homicides = Number.parseInt(
          (mappedHomicides[d.properties.name] /
            (mappedPopulation[d.properties.name][0].properties.population /
              200000)));
      });
      svg = d3.select(".main-content").transition();
      svg.selectAll("path")
        .duration(750)
        .style("fill", function(d) {
          // Color state grey if no data is present
          if (mappedHomicides[d.properties.name] == null) {
            return "#8e8686";
          } else {
            return color(mappedPopulation[d.properties.name][0].properties.homicides);
          }
        });

      // Also update barchart if already present
      if (!(d3.select(".barchartcanvas").empty())) {
        linkedBarChart(mappedHomicidesState[clickedState]);
      }
    }
  }

  // Responsible for creating and updating the barchart
  function linkedBarChart(stateHomicides) {
    var usedWeapons = mapWeapons(stateHomicides);
    var mostUsedWeapon = d3.max(usedWeapons, function(d) {
      return d.values;
    });

    var margin = {
      top: 40,
      right: 10,
      bottom: 110,
      left: 60
    };

    var widthBarChart = 850 - margin.left - margin.right;
    var heightBarChart = 500 - margin.top - margin.bottom;

    var x = d3.scale.ordinal().rangeRoundBands([0, widthBarChart], ".05");
    var y = d3.scale.linear().range([heightBarChart, 0]);

    var xAxis = d3.svg.axis().scale(x).orient("bottom");
    var yAxis = d3.svg.axis().scale(y).orient("left");

    // Create new barchart if DOM element empty, otherwhise update
    if (d3.select(".barchartcanvas").empty()) {
      newBarChart(usedWeapons);
    } else {
      updateBarChart(usedWeapons);
    }

    function newBarChart(usedWeapons) {
      var svg = d3.select("#barchart").append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 850 500")
        .append("g")
        .attr("class", "barchartcanvas")
        .attr("transform", "translate(" + margin.left +
          "," + margin.top + ")");

      x.domain(usedWeapons.map(function(d) {
        return d.key;
      }));

      y.domain([0, mostUsedWeapon]);

      d3.select(".barchartcanvas").call(tip);

      svg.append("g")
        .attr("class", "x axis")
        .attr("id", "xaxis")
        .attr("transform", "translate(0," + heightBarChart + ")")
        .call(xAxis)
        .selectAll("text")
        .style("text-anchor", "start")
        .attr("transform", "rotate(40)")
        .attr("y", 8);

      svg.append("g")
        .append("text")
        .attr("class", "label")
        .attr("x", widthBarChart / 2)
        .attr("y", 450)
        .style("text-anchor", "middle")
        .text("Weapon type");

      svg.append("g")
        .attr("class", "y axis")
        .attr("id", "yaxis")
        .attr("y", 10)
        .call(yAxis)
        .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("x", -(heightBarChart / 2))
        .attr("y", -60)
        .attr("dy", ".71em")
        .style("text-anchor", "middle")
        .text("No. of times used");

      svg.append("g")
        .attr("class", "title")
        .append("text")
        .attr("x", widthBarChart / 2)
        .attr("y", -20)
        .style("text-anchor", "middle")
        .text("Weapon types used in total homicides of selected state");

      svg.selectAll("bar")
        .data(d3.values(usedWeapons))
        .enter().append("rect")
        .attr("class", "bars")
        .style("fill", "#921010")
        .attr("x", function(d) {
          return x(d.key);
        })
        .attr("width", x.rangeBand())
        .attr("y", function(d) {
          return y(d.values);
        })
        .attr("height", function(d) {
          return heightBarChart - y(d.values);
        })
        .on("mouseover", tip.show)
        .on("mouseout", tip.hide);
    }

    function updateBarChart(usedWeapons) {
      x.domain(usedWeapons.map(function(d) {
        return d.key;
      }));
      y.domain([0, mostUsedWeapon]);
      var svg = d3.select(".barchartcanvas");

      svg.call(tip);

      svg.select("#xaxis")
        .transition()
        .duration(600)
        .call(xAxis)
        .selectAll("text")
        .style("text-anchor", "start")
        .attr("transform", "rotate(40)")
        .attr("y", 8);
      svg.select("#yaxis").transition().duration(600).call(yAxis);

      var bars = svg.selectAll(".bars").data(usedWeapons);

      bars.exit()
        .transition()
        .duration(600)
        .attr("y", y(0))
        .attr("height", heightBarChart - y(0))
        .remove();

      bars.enter().append("rect")
        .attr("class", "bars")
        .attr("y", y(0))
        .style("fill", "#921010")
        .attr("height", heightBarChart - y(0))
        .on("mouseover", tip.show)
        .on("mouseout", tip.hide);

      bars.transition().duration(600)
        .attr("x", function(d) {
          return x(d.key);
        })
        .attr("width", x.rangeBand())
        .attr("y", function(d) {
          return y(d.values);
        })
        .style("fill", "#921010")
        .attr("height", function(d) {
          return heightBarChart - y(d.values);
        });
    }
  }
}

window.onload = wrapperFunction;
