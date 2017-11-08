
function createGraph(rawData){

  function createTransform(domain, range){
    var domain_min = domain[0]
    var domain_max = domain[1]
    var range_min = range[0]
    var range_max = range[1]

    // formulas to calculate the alpha and the beta
    var alpha = (range_max - range_min) / (domain_max - domain_min)
    var beta = range_max - alpha * domain_max

    // returns the function for the linear transformation (y= a * x + b)
    return function(x){
      return alpha * x + beta;
    }
  }
  // Determine maximum temperature from array
  function getMaxTemp(data_array){
    var max = 0;
    for (var i = 0; i < data_array.length; i++){
      if (data_array[i][1] > max){
        max = data_array[i][1];
      }
    }
    return max;

  // Determine minimum temperature from array
  }
  function getMinTemp(data_array){
    var min = 0;
    for (var i = 0; i < data_array.length; i++){
      if (data_array[i][1] < min){
        min = data_array[i][1];
      }
    }
    return min;
  }

  // Draw empty graph
  function initGraph(temp_scale){
    context.beginPath();
    context.lineWidth = 3;

    context.moveTo(padding, padding); // y axis
    context.lineTo(padding,height - padding);

    context.moveTo(padding,height - padding);// x axis
    context.lineTo(width,height - padding);

    // context.fillText(temp_scale[0], 20, 10);
  }

  // Parse raw data to array
  function parseRawData(rawData){
    var data_array = rawData.split('\n');
    data_array.splice(0,12);
    data_array.splice(data_array.length - 1, 2);

    for (var i = 0; i < data_array.length; i++) {
        data_array[i] = data_array[i].split(',');
        data_array[i].splice(0,1);
        console.log(data_array[i][0].slice(0,4));
        var year = data_array[i][0].slice(0,4);
        var month = data_array[i][0].slice(4,6);
        var day = data_array[i][0].slice(6,8);
        data_array[i][0] = new Date(`${year}-${month}-${day}`);
        data_array[i][1] = Number(data_array[i][1]);
        // console.log(data_array[i]);
    }
    // console.log(data_array);
    return data_array;
  }

  // Add labels to y and x axis
  function addLabels(temp_scale, month_list){
    var labelLineLength = 10;

    // y axis


    for (var i = 0; i < 8; i++){
      context.moveTo(padding, padding * i + padding);
      context.lineTo(padding - labelLineLength, padding * i + padding);
      context.fillText(temp_scale[i], 20, padding * i + padding);
    }

    // x axis
    for (var i = 0; i < 12; i++){
      context.moveTo((width-padding)/12 * i + padding, height - padding);
      context.lineTo((width-padding)/12 * i + padding, height - (padding- labelLineLength));
      context.fillText(month_list[i], (width-padding)/12 * i + (padding + 30), height - (padding- labelLineLength * 1.5));
    }

    context.font="15px Arial";
    context.fillText("Months of the year", (width-padding) / 2 - padding, 440)
    context.font="20px Georgia";
    context.fillText("Average temperature in De Bilt (2016)", (width - padding) / 3, 30);
    context.stroke();
  }

  function yAxisText(text){
    context.save();
    context.translate(100,300);
    context.rotate(-0.5*Math.PI);
    context.font = "12px Arial";
    context.fillText(text, -20, -90);
    context.restore();
  }

  function dateToIndex(data_array){
    var startDate = data_array[0][0];
    var oneDay = 1000 * 60 * 60 * 24;
    for (var i = 0; i < data_array.length; i++){
        var currentDate = data_array[i][0];
        var differenceDate = currentDate - startDate;
        data_array[i][0] = (Math.floor(differenceDate / oneDay)) + 1;
    }
  }

  function drawLines(data_array){
    for (var i = 0; i < data_array.length - 1; i++){
        context.beginPath();
        context.moveTo(xTransform(data_array[i][0]), yTransform(data_array[i][1]));
        context.lineTo(xTransform(data_array[i + 1][0]), yTransform(data_array[i + 1][1]));
        context.stroke();
    }

  }

  var data = document.getElementById("rawdata").value;
  var temp_scale = ["300", "250", "200", "150", "100", "50", "0", "-50"];
  var month_list = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Okt", "Nov", "Dec"];
  var canvas = document.getElementById("myCanvas");
  var context = canvas.getContext("2d");
  var width = canvas.width = 1000;
  var height = canvas.height = 450;
  var padding = 50;
  var data_array = parseRawData(rawData);
  var max_temp = getMaxTemp(data_array)
  var min_temp = getMinTemp(data_array)
  var xTransform = createTransform([1,366], [50,1000]);
  var yTransform = createTransform([-50,300], [400,50]);

  initGraph(temp_scale);
  addLabels(temp_scale, month_list);
  yAxisText("Temperatures in 0.1 Celcius");
  dateToIndex(data_array);
  drawLines(data_array);
}

var rawData = new XMLHttpRequest();
rawData.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      createGraph(rawData.responseText);
    }
};
rawData.open("GET", "knmi_data.txt", true);
rawData.send();

// createGraph();
