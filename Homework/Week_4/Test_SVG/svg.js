/*
Name: Mark Pijnenburg
Student number: 11841117
Minor Programmeren
University of Amsterdam
*/

function testSVG(){
  d3.xml("test.svg", "image/svg+xml", function(error, xml) {
      if (error) throw error;
      document.body.appendChild(xml.documentElement);

      var legendColors = ["#ccece6", "#99d8c9", "#66c2a4", "#41ae76", "#238b45", "#005824", "#B8BBBB"];
      var legendText = ["100", "1000", "10000", "100000", "1000000", "10000000"];
      var rectX = 13;
      var rectY = 138.7;
      var colorRectWidth = 21;
      var colorRectHeight = 29;
      var rectOffset = 41.9;
      var textRectX = 46.5;
      var textRectY = 180.6;
      var textRectWidth = 119.1;
      var textRectHeight = 29;
      var textX = 95;
      var textY = 30;

      var canvas = d3.select("svg");

      // Add color rects to canvas
      for (var i = 0; i < 3; i++) {
        // Add new color rects to canvas
        canvas.append("rect")
        .attr("id", "kleur" + (4 + i))
        .style("fill", legendColors[i + 3])
        .attr("class", "st1")
        .attr("x", rectX)
        .attr("y", rectY + rectOffset * i)
        .attr("width", colorRectWidth)
        .attr("height", colorRectHeight);

        // Color already present rects
        d3.select("#kleur" + (i + 1))
            .style("fill", legendColors[i]);
      }

      // Add new text rects
      for (var i = 0; i < 2; i++) {
        canvas.append("rect")
          .attr("id", "tekst" + (i + 5))
          .attr("class", "st2")
          .attr("x", textRectX)
          .attr("y", textRectY + rectOffset * i)
          .attr("width", textRectWidth)
          .attr("height", textRectHeight);
      }

      // Add text to svg
      for (var i = 0; i < 6; i++) {
        canvas.append("text")
          .attr("x", textX)
          .attr("y", textY + (rectOffset * i))
          .attr("font-size", 6)
          .text(legendText[i]);
      }
  });
}
