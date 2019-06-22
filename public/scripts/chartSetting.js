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
              label: "Scores",
              backgroundColor: generateRandomColoursArray(response.options.length),
              data: response.scores
            }
          ]
        },
        options: {
        },
      });
    },
    failure: function () {
      console.log("failed");
    }
  });

  function generateRandomColoursArray(numOfColours){
    let colours = [];
    for (let i = 0; i < numOfColours; i++){
      colours.push('#'+(Math.random()*0xFFFFFF<<0).toString(16));
    }
    return colours;
  }

});
