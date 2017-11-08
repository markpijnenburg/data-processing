// Name: Mark Pijnenburg
// Data Processing - Minor Programmeren - Universiteit van Amsterdam
// Student number: 11841117

// Main function that gets called when window is loaded.
function createGraph(rawData){

  // Calculates position on canvas.
  function createTransform(domain, range){
    var domain_min = domain[0]
    var domain_max = domain[1]
    var range_min = range[0]
    var range_max = range[1]

    // Formulas to calculate the alpha and the beta.
    var alpha = (range_max - range_min) / (domain_max - domain_min)
    var beta = range_max - alpha * domain_max

    // Returns the function for the linear transformation (y= a * x + b).
    return function(x){
      return alpha * x + beta;
    }
  }
  // Determine maximum temperature from array.
  function getMaxTemp(dataArray){
    var max = 0;
    for (var i = 0; i < dataArray.length; i++){
      if (dataArray[i][tempIndex] > max){
        max = dataArray[i][tempIndex];
      }
    }
    return max;

  // Determine minimum temperature from array.
  }
  function getMinTemp(dataArray){
    var min = 0;
    for (var i = 0; i < dataArray.length; i++){
      if (dataArray[i][tempIndex] < min){
        min = dataArray[i][tempIndex];
      }
    }
    return min;
  }

  // Draw empty graph.
  function initGraph(tempScale){
    context.beginPath();
    context.lineWidth = 3;

    // Y axis
    context.moveTo(padding, padding);
    context.lineTo(padding,height - padding);

    // X axis
    context.moveTo(padding,height - padding);
    context.lineTo(width,height - padding);
  }

  // Parse raw data to array
  function parseRawData(rawData){
    var dataArray = rawData.split('\n');

    // Remove metadata/headers from txt loaded.
    dataArray.splice(0, txtHeader);

    // Remove empty array at the end.
    dataArray.splice(dataArray.length - 1, 2);

    // Parse raw data into date objects / numbers.
    for (var i = 0; i < dataArray.length; i++) {
        dataArray[i] = dataArray[i].split(',');
        dataArray[i].splice(0,1);

        // Extract date info into variables.
        var year = dataArray[i][0].slice(0,4);
        var month = dataArray[i][0].slice(4,6);
        var day = dataArray[i][0].slice(6,8);

        dataArray[i][0] = new Date(`${year}-${month}-${day}`);
        dataArray[i][1] = Number(dataArray[i][1]);
    }
    return dataArray;
  }

  // Add labels to y and x axis.
  function addLabels(tempScale, monthList){
    var labelLineLength = 10;

    // Y axis labels.
    for (var i = 0; i < numberOfYLabels; i++){
      context.moveTo(padding, padding * i + padding);
      context.lineTo(padding - labelLineLength, padding * i + padding);
      context.fillText(tempScale[i], textYOffset, padding * i + padding);
    }

    // X axis labels.
    for (var i = 0; i < numberOfXLabels; i++){
      context.moveTo((width-padding)/numberOfXLabels * i + padding, height - padding);
      context.lineTo((width-padding)/numberOfXLabels * i + padding, height - (padding- labelLineLength));
      context.fillText(monthList[i], (width-padding)/numberOfXLabels * i + (padding + textXOffset), height - (padding- labelLineLength * 1.5));
    }

    // Add title to the graph.
    context.font="15px Arial";
    context.fillText("Months of the year", (width-padding) / 2 - padding, graphTitleOffset)
    context.font="20px Georgia";
    context.fillText("Average temperature in De Bilt (2016)", (width - padding) / 3, textXOffset);
    context.stroke();
  }

  // Add text to X axis.
  function yAxisText(text){
    context.save();
    context.translate(100,300);
    context.rotate(-0.5*Math.PI);
    context.font = "12px Arial";
    context.fillText(text, -20, -90);
    context.restore();
  }

  // Convert date object to absolute day index.
  // https://stackoverflow.com/questions/8619879/javascript-calculate-the-day-of-the-year-1-366
  function dateToIndex(dataArray){
    var startDate = dataArray[dateIndex][dateIndex];
    var oneDay = 1000 * 60 * 60 * 24;
    for (var i = 0; i < dataArray.length; i++){
        var currentDate = dataArray[i][dateIndex];
        var differenceDate = currentDate - startDate;
        dataArray[i][dateIndex] = (Math.floor(differenceDate / oneDay)) + dateOffset;
    }
  }

  // Draw lines in the graph.
  function drawLines(dataArray){
    for (var i = 0; i < dataArray.length - dateOffset; i++){
        context.beginPath();
        context.moveTo(xTransform(dataArray[i][dateIndex]), yTransform(dataArray[i][tempIndex]));
        context.lineTo(xTransform(dataArray[i + dateOffset][dateIndex]), yTransform(dataArray[i + dateOffset][tempIndex]));
        context.stroke();
    }
  }

  // Declaration of commonly used variables.
  var tempScale = ["300", "250", "200", "150", "100", "50", "0", "-50"];
  var monthList = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Okt", "Nov", "Dec"];
  var tempIndex = 1;
  var dateIndex = 0;
  var txtHeader = 12;
  var numberOfYLabels = 8;
  var textYOffset = 20;
  var numberOfXLabels = 12;
  var textXOffset = 30;
  var graphTitleOffset = 440;
  var dateOffset = 1;
  var firstDay = 1;
  var canvas = document.getElementById("myCanvas");
  var context = canvas.getContext("2d");
  var width = canvas.width = 1000;
  var height = canvas.height = 450;
  var padding = 50;
  var dataArray = parseRawData(rawData);
  var maxTemp = getMaxTemp(dataArray)
  var minTemp = getMinTemp(dataArray)
  var numberOfDays = dataArray.length;
  var xTransform = createTransform([firstDay,numberOfDays], [padding,width]);
  var yTransform = createTransform([-padding,tempScale[0]], [height-padding,padding]);

  // Call the functions that actually draw graph.
  initGraph(tempScale);
  addLabels(tempScale, monthList);
  yAxisText("Temperatures in 0.1 Celcius");
  dateToIndex(dataArray);
  drawLines(dataArray);
}

// Execute script only if page completely loaded.
window.onload = function(){
  var rawData = new XMLHttpRequest();
  rawData.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        createGraph(rawData.responseText);
      }
  };
  rawData.open("GET", "knmi_data.txt", true);
  rawData.send();
}
