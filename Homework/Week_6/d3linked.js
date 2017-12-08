window.onload = function () {
  var scatterplotDrawn = 0

    // Width and height of map
  var width = 1000
  var height = 400

  // D3 Projection
  var projection = d3.geo.albersUsa()
    .scale([850])
    .translate([width / 2, height / 2])

  // Define path generator
  var path = d3.geo.path()
    .projection(projection)

  queue().defer(d3.json, 'us_states.json')
    .defer(d3.json, 'homicide_usa_2014.json')
    .await(makeMapUSA)

  function mapHomicides (homicides) {
    return d3.nest().key(function (d) {
      return d.State
    })
      .rollup(function (v) {
        return v.length
      })
      .map(homicides)
  }

  function mapHomicidesState (homicides) {
    return d3.nest().key(function (d) {
      return d.State
    })
      .map(homicides)
  }

  function mapColorScale (mappedHomicides) {
    var lowestHomicides = d3.min(d3.values(mappedHomicides))
    var highestHomicides = d3.max(d3.values(mappedHomicides))
    return d3.scale.linear().domain([lowestHomicides, highestHomicides]).range(['#FFB2B2', '#FE0000'])
  }

  function scatterplotGenderColor (stateHomicides) {
    return d3.scale.ordinal().domain(['Female', 'Male', 'Unknown']).range(['#FE86F9', '#39CCFF', '#000000'])
  }

  function makeMapUSA (error, states, homicides) {
    if (error) {
      console.log('Could not load JSON file correctly')
      d3.select('body').append('h1').html('Errow while loading data :(')
    }
    var mappedHomicides = mapHomicides(homicides)
    var mappedHomicidesState = mapHomicidesState(homicides)
    var colorScale = mapColorScale(mappedHomicides)

    // Create SVG element and append map to the SVG
    var svg = d3.select('#usa-map')
      .append('div')
      .attr('class', 'main-content')
      .append('g')
      .attr('class', 'map')
      .append('svg')
      .attr('id', 'map')
      .attr('preserveAspectRatio', 'xMinYMin meet')
      .attr('viewBox', '0 0 960 400')

    // Append Div for tooltip to SVG
    var tooltip = d3.select('.main-content')
      .append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0)

    // Bind the data to the SVG and create one path per GeoJSON feature
    svg.selectAll('path')
      .data(states.features)
      .enter()
      .append('path')
      .attr('d', path)
      .style('stroke', '#fff')
      .style('stroke-width', '1')
      .style('fill', function (d) {
        return colorScale(mappedHomicides[d.properties.name])
      })
      .on('mouseover', mouseover)
      .on('mousemove', mousemove)
      .on('mouseout', mouseout)
      .on('click', mouseclick)

    function mouseclick (d) {
      // console.log(Boolean(scatterplotDrawn) == false);
      if (Boolean(scatterplotDrawn) === false) {
        var drawn = 0
      } else {
        var drawn = 1
      }
      linkedScatterplot(mappedHomicidesState[d.properties.name], drawn)
    }

    function mouseover () {
      tooltip.transition()
        .duration(200)
        .style('opacity', '.9')
    }

    function mousemove (d) {
      var numberOfHomicides = mappedHomicides[d.properties.name]
      if (numberOfHomicides == null) {
        numberOfHomicides = 0
      }

      tooltip.html(d.properties.name + '<br>Number of homicides: ' + '<b>' + numberOfHomicides + '</b>')
        .style('left', (d3.event.pageX - 100) + 'px')
        .style('top', (d3.event.pageY - 120) + 'px')
    }

    function mouseout () {
      tooltip.transition()
        .duration(500)
        .style('opacity', 0)
    }

    d3.select('#dropdown_year')
      .on('change', function () {
        var selectedDate = d3.select('#dropdown_year').node().value
        var dataset = 'homicide_usa_' + selectedDate + '.json'
        queue().defer(d3.json, dataset)
          .await(updateMap)
      })

    function updateMap (error, homicides) {
      if (error) {
        console.log('Could not load JSON file correctly')
        d3.select('body').append('h1').html('Errow while loading data :(')
      }
      mappedHomicides = mapHomicides(homicides)
      mappedHomicidesState = mapHomicidesState(homicides)
      colorScale = mapColorScale(mappedHomicides)
      svg = d3.select('.main-content').transition()
      svg.selectAll('path')
        .duration(750)
        .style('fill', function (d) {
          if (mappedHomicides[d.properties.name] == null) {
            return '#8e8686'
          } else {
            return colorScale(mappedHomicides[d.properties.name])
          }
        })
    }
  }

  function convertData (stateHomicides) {
    stateHomicides.forEach(function (d) {
      d.Year = Number(+d.Year)
      d.VictimAge = Number(+d.VictimAge)
      d.PerpetratorAge = Number(+d.PerpetratorAge)
    })
    return stateHomicides
  }

  function linkedScatterplot (stateHomicides, drawn) {
    // Convert certain strings to numbers
    stateHomicides = convertData(stateHomicides)

    var oldestPerpetrator = d3.max(stateHomicides, function (d) {
      return d.PerpetratorAge
    })
    var oldestVictim = d3.max(stateHomicides, function (d) {
      return d.VictimAge
    })

    // Width and height of map
    var margin = {
      top: 20,
      right: 10,
      bottom: 50,
      left: 50
    }
    var widthScatterplot = 960 - margin.left - margin.right
    var heightScatterplot = 500 - margin.top - margin.bottom

    var x = d3.scale.linear().domain([0, oldestPerpetrator]).range([0, widthScatterplot])
    var y = d3.scale.linear().domain([0, oldestVictim]).range([heightScatterplot, 0])

    var xAxis = d3.svg.axis().scale(x).orient('bottom')
    var yAxis = d3.svg.axis().scale(y).orient('left')

    var colorGender = scatterplotGenderColor(stateHomicides)


    if (Boolean(drawn) === false) {
      console.log('Draw new scatterplot!')
      newScatterplot(stateHomicides)
    } else {
      console.log('Update that scatterplot!')
      updateScatterplot(stateHomicides)
    }

    function newScatterplot (stateHomicides) {
      scatterplotDrawn = 1
      var scatterplot = d3.select('#scatterplot')
        .append('svg')
        .attr('preserveAspectRatio', 'xMinYMin meet')
        .attr('viewBox', '0 0 960 500')
        .append('g')
        .attr('class', 'scatterplot-circles')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

      scatterplot.append('g')
        .attr('class', 'x axis')
        .attr('id', 'xaxis')
        .attr('transform', 'translate(0,' + heightScatterplot + ')')
        .call(xAxis)
        .append('text')
        .attr('class', 'label')
        .attr('x', widthScatterplot / 2)
        .attr('y', 40)
        .style('text-anchor', 'middle')
        .text('Perpetrator age in years')

      scatterplot.append('g')
        .attr('class', 'y axis')
        .attr('id', 'yaxis')
        .attr('y', 10)
        .call(yAxis)
        .append('text')
        .attr('class', 'label')
        .attr('transform', 'rotate(-90)')
        .attr('x', -(heightScatterplot / 2))
        .attr('y', -50)
        .attr('dy', '.71em')
        .style('text-anchor', 'middle')
        .text('Victim age in years')

      scatterplot.append('g')
        .attr('class', 'scatterplot-canvas')

      scatterplot.select('.scatterplot-canvas').selectAll('circle')
        .data(stateHomicides)
        .enter()
        .append('circle')
        .attr('class', 'circle')
        .attr('fill', function (d) {
          return colorGender(d.VictimSex)
        })
        .attr('cx', function (d) {
          return x(d.PerpetratorAge)
        })
        .attr('cy', function (d) {
          return y(d.VictimAge)
        })
        .attr('r', 3)
    }

    function updateScatterplot (stateHomicides) {
      console.log(oldestVictim)
      console.log(oldestPerpetrator)

      d3.select('.scatterplot-canvas').selectAll('circle')
        .data(stateHomicides)
        .transition()
        .duration(1000)
        .attr('cx', function (d) {
          return x(d.PerpetratorAge)
        })
        .attr('cy', function (d) {
          return y(d.VictimAge)
        })

      d3.select('.scatterplot-canvas').selectAll('circle')
        .data(stateHomicides)
        .enter()
        .append('circle')
        .attr('class', 'circle')
        .attr('fill-opacity', 0)
        .attr('stroke-opacity', 0)
        .attr('r', 0)
        .attr('fill', function (d) {
          return colorGender(d.VictimSex)
        })
        .transition()
        .duration(1000)
        .attr('fill-opacity', 1)
        .attr('stroke-opacity', 1)
        .attr('cx', function (d) {
          return x(d.PerpetratorAge)
        })
        .attr('cy', function (d) {
          return y(d.VictimAge)
        })
        .attr('r', 3)

      d3.selectAll('circle')
        .data(stateHomicides)
        .exit()
        .attr('fill-opacity', 1)
        .attr('stroke-opacity', 1)
        .transition()
        .duration(800)
        .attr('fill-opacity', 0)
        .attr('stroke-opacity', 0)
        .remove()

      d3.select('#xaxis')
          .transition()
          .duration(1000)
          .call(xAxis)

      d3.select('#yaxis')
          .transition()
          .duration(1000)
          .call(yAxis)
    }
  }
}
