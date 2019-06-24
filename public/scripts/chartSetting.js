$(function() {
  $.ajax({
    url: (document.URL +  "/score"),
    method: "GET",
    success: function (response) {
      var ctx = document.getElementById('resultsChart');
      let myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: response.options,
          datasets: [
            {
              label: response.options,
              backgroundColor: generateRandomColoursArray(response.options.length),
              data: convertPercentage(response.scores)
            }
          ]
        },
        options: {
          elements: {
            center: {
            text: topScore(response.options, response.scores),
            color: '#36A2EB', //Default black
            fontStyle: 'Helvetica', //Default Arial
            sidePadding: 15 //Default 20 (as a percentage)
          }
        }
        },
      });
    },
    failure: function () {
      console.log("failed");
    }
  });

  function convertPercentage(scores) {
    let percents = [];
    scores.forEach((element) => {
      percents.push(Math.round( (element * 100) * 10 ) / 10);
    });

    return percents
  }

  function generateRandomColoursArray(numOfColours){
    let colours = [];
    for (let i = 0; i < numOfColours; i++){
      colours.push('#'+(Math.random()*0xFFFFFF<<0).toString(16));
    }
    return colours;
  }

  function topScore(options, score) {
    console.log("SCORE " , score);
    let topIndex = score.indexOf(Math.max(...score));
    console.log("TOP INDEX ", topIndex);
    return options[topIndex];
  }

});

Chart.pluginService.register({
  beforeDraw: function (chart) {
    if (chart.config.options.elements.center) {
      //Get ctx from string
      var ctx = chart.chart.ctx;

      //Get options from the center object in options
      var centerConfig = chart.config.options.elements.center;
      var fontStyle = centerConfig.fontStyle || 'Arial';
      var txt = centerConfig.text;
      var color = centerConfig.color || '#000';
      var sidePadding = centerConfig.sidePadding || 20;
      var sidePaddingCalculated = (sidePadding/100) * (chart.innerRadius * 2)
      //Start with a base font of 30px
      ctx.font = "30px " + fontStyle;

      //Get the width of the string and also the width of the element minus 10 to give it 5px side padding
      var stringWidth = ctx.measureText(txt).width;
      var elementWidth = (chart.innerRadius * 2) - sidePaddingCalculated;

      // Find out how much the font can grow in width.
      var widthRatio = elementWidth / stringWidth;
      var newFontSize = Math.floor(30 * widthRatio);
      var elementHeight = (chart.innerRadius * 2);

      // Pick a new font size so it will not be larger than the height of label.
      var fontSizeToUse = Math.min(newFontSize, elementHeight);

      //Set font settings to draw it correctly.
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      var centerX = ((chart.chartArea.left + chart.chartArea.right) / 2);
      var centerY = ((chart.chartArea.top + chart.chartArea.bottom) / 2);
      ctx.font = fontSizeToUse+"px " + fontStyle;
      ctx.fillStyle = color;

      //Draw text in center
      ctx.fillText(txt, centerX, centerY);
    }
  }
});


