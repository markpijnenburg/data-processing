/*
Name: Mark Pijnenburg
Student number: 11841117
Minor Programmeren
University of Amsterdam
*/

window.onload = function () {
  // Width and height of map
  var width = 900;
  // var height = 450;

  // D3 Projection
  var projection = d3.geo.albersUsa()
    .scale([1000])
    .translate([width / 2, 225]);

  // Define path generator
  var path = d3.geo.path()
    .projection(projection);

  // Define D3 tooltip
  var tip = d3.tip().attr('class', 'd3-tip').offset([-12, 0])
    // Show country name in tooltip
    .html(function (d) {
      return d.key + ' used: ' + d.values;
    });

  var clickedState;

  var color = d3.scale.threshold()
    .domain([20, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 700, 1000])
    .range(['#ffdbdb', '#f5caca', '#ecb9b9', '#e3a8a8', '#da9797', '#d18686', '#c87575', '#bf6565', '#b65454', '#ad4343', '#a43232', '#9b2121', '#921010', '#890000']);

  queue().defer(d3.json, 'us_states.json')
    .defer(d3.json, 'homicide_usa_2014.json')
    .await(makeMapUSA);

  function mapHomicides (homicides) {
    return d3.nest().key(function (d) {
      return d.State;
    })
      .rollup(function (v) {
        return v.length;
      })
      .map(homicides);
  }

  function mapWeapons (stateHomicides) {
    return d3.nest().key(function (d) {
      return d.Weapon;
    })
      .rollup(function (v) {
        return v.length;
      })
      .entries(stateHomicides);
  }

  function mapHomicidesState (homicides) {
    return d3.nest().key(function (d) {
      return d.State;
    })
      .map(homicides);
  }

  function makeMapUSA (error, states, homicides) {
    if (error) {
      console.log('Could not load JSON file correctly');
      d3.select('body').append('h1').html('Errow while loading data :(');
    }
    var mappedHomicides = mapHomicides(homicides);
    var mappedHomicidesState = mapHomicidesState(homicides);

    // Create SVG element and append map to the SVG
    var svg = d3.select('#usa-map')
      .append('div')
      .attr('class', 'main-content')
      .append('svg')
      .attr('id', 'map')
      .attr('preserveAspectRatio', 'xMinYMin meet')
      .attr('viewBox', '0 0 900 450')
      .attr('transform', 'translate(20,-90), scale(0.6)');

    // Append Div for tooltip to SVG
    var tooltip = d3.select('.main-content')
      .append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0);

    // Bind the data to the SVG and create one path per GeoJSON feature
    svg.selectAll('path')
      .data(states.features)
      .enter()
      .append('path')
      .attr('d', path)
      .style('stroke', '#fff')
      .style('stroke-width', '1')
      .style('fill', function (d) {
        return color(mappedHomicides[d.properties.name]);
      })
      .on('mouseover', mouseover)
      .on('mousemove', mousemove)
      .on('mouseout', mouseout)
      .on('click', mouseclick);

    function mouseclick (d) {
      clickedState = d.properties.name;
      d3.select('h3').html('Selected state: ' + clickedState);
      d3.select('h3').transition().duration(300).style('opacity', 1);
      if (d3.select('.barchartcanvas').empty()) {
        d3.select('#usa-map')
          .transition()
          .duration(500)
          .call(styleTween, 'width', '100%')
          .transition()
          .call(styleTween, 'width', '50%');

        d3.select('#barchart')
          .transition()
          .duration(500)
          .call(styleTween, 'width', '0%')
          .transition()
          .call(styleTween, 'width', '50%');

        d3.select('#map')
          .transition()
          .delay(500)
          .duration(500)
          .attr('transform', 'translate(20,0)');
      }
      linkedBarChart(mappedHomicidesState[d.properties.name]);
    }

    function styleTween (transition, name, value) {
      transition.styleTween(name, function () {
        return d3.interpolate(this.style[name], value);
      });
    }

    function mouseover () {
      tooltip.transition()
        .duration(200)
        .style('opacity', '.9');
    }

    function mousemove (d) {
      var numberOfHomicides = mappedHomicides[d.properties.name];
      if (numberOfHomicides == null) {
        numberOfHomicides = 0;
      }

      tooltip.html(d.properties.name + '<br>Number of homicides: ' + '<b>' + numberOfHomicides + '</b>')
        .style('left', (d3.event.pageX - 85) + 'px')
        .style('top', (d3.event.pageY - 70) + 'px');
    }

    function mouseout () {
      tooltip.transition()
        .duration(500)
        .style('opacity', 0);
    }

    d3.select('#dropdown_year')
      .on('change', function () {
        var selectedDate = d3.select('#dropdown_year').node().value;
        d3.select('h1').html('Homicides in the USA (' + selectedDate + ')');
        var dataset = 'homicide_usa_' + selectedDate + '.json';
        queue().defer(d3.json, dataset)
          .await(updateMap);
      });

    function updateMap (error, homicides) {
      if (error) {
        console.log('Could not load JSON file correctly');
        d3.select('body').append('h1').html('Errow while loading data :(');
      }
      mappedHomicides = mapHomicides(homicides);
      mappedHomicidesState = mapHomicidesState(homicides);
      svg = d3.select('.main-content').transition();
      svg.selectAll('path')
        .duration(750)
        .style('fill', function (d) {
          if (mappedHomicides[d.properties.name] == null) {
            return '#8e8686';
          } else {
            return color(mappedHomicides[d.properties.name]);
          }
        });

      if (!(d3.select('.barchartcanvas').empty())) {
        linkedBarChart(mappedHomicidesState[clickedState]);
      }
    }
  }

  function linkedBarChart (stateHomicides) {
    var usedWeapons = mapWeapons(stateHomicides);
    var mostUsedWeapon = d3.max(usedWeapons, function (d) {
      return d.values;
    });

    var margin = {
      top: 20,
      right: 10,
      bottom: 95,
      left: 50
    };

    var widthBarChart = 850 - margin.left - margin.right;
    var heightBarChart = 500 - margin.top - margin.bottom;

    var x = d3.scale.ordinal().rangeRoundBands([0, widthBarChart], '.05');
    var y = d3.scale.linear().range([heightBarChart, 0]);

    var xAxis = d3.svg.axis().scale(x).orient('bottom');
    var yAxis = d3.svg.axis().scale(y).orient('left');

    if (d3.select('.barchartcanvas').empty()) {
      newBarChart(usedWeapons);
    } else {
      updateBarChart(usedWeapons);
    }

    function newBarChart (usedWeapons) {
      var svg = d3.select('#barchart').append('svg')
        .attr('preserveAspectRatio', 'xMinYMin meet')
        .attr('viewBox', '0 0 850 500')
        .append('g')
        .attr('class', 'barchartcanvas')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
      x.domain(usedWeapons.map(function (d) {
        return d.key;
      }));
      y.domain([0, mostUsedWeapon]);

      d3.select('.barchartcanvas').call(tip);

      svg.append('g')
        .attr('class', 'x axis')
        .attr('id', 'xaxis')
        .attr('transform', 'translate(0,' + heightBarChart + ')')
        .call(xAxis)
        .selectAll('text')
        .style('text-anchor', 'start')
        .attr('transform', 'rotate(40)')
        .attr('y', 8)
        .append('text')
        .attr('class', 'label')
        .attr('x', widthBarChart / 2)
        .attr('y', 40)
        .style('text-anchor', 'middle')
        .text('Weapon type');

      svg.append('g')
        .attr('class', 'y axis')
        .attr('id', 'yaxis')
        .attr('y', 10)
        .call(yAxis)
        .append('text')
        .attr('class', 'label')
        .attr('transform', 'rotate(-90)')
        .attr('x', -(heightBarChart / 2))
        .attr('y', -50)
        .attr('dy', '.71em')
        .style('text-anchor', 'middle')
        .text('No. of times used');

      svg.selectAll('bar')
        .data(d3.values(usedWeapons))
        .enter().append('rect')
        .attr('class', 'bars')
        .style('fill', '#C27878')
        .attr('x', function (d) {
          return x(d.key);
        })
        .attr('width', x.rangeBand())
        .attr('y', function (d) {
          return y(d.values);
        })
        .attr('height', function (d) {
          return heightBarChart - y(d.values);
        })
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide);
    }

    function updateBarChart (usedWeapons) {
      x.domain(usedWeapons.map(function (d) {
        return d.key;
      }));
      y.domain([0, mostUsedWeapon]);
      var svg = d3.select('.barchartcanvas');

      svg.call(tip);

      svg.select('#xaxis').transition().duration(600).call(xAxis).selectAll('text')
        .style('text-anchor', 'start')
        .attr('transform', 'rotate(40)')
        .attr('y', 8);
      svg.select('#yaxis').transition().duration(600).call(yAxis);

      var bars = svg.selectAll('.bars').data(usedWeapons);

      bars.exit()
        .transition()
        .duration(600)
        .attr('y', y(0))
        .attr('height', heightBarChart - y(0))
        .remove();

      bars.enter().append('rect')
        .attr('class', 'bars')
        .attr('y', y(0))
        .style('fill', '#C27878')
        .attr('height', heightBarChart - y(0))
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide);

      bars.transition().duration(600)
        .attr('x', function (d) {
          return x(d.key);
        })
        .attr('width', x.rangeBand())
        .attr('y', function (d) {
          return y(d.values);
        })
        .style('fill', '#C27878')
        .attr('height', function (d) {
          return heightBarChart - y(d.values);
        });
    }
  }
};
