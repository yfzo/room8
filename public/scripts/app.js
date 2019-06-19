$(() => {
  $.ajax({
    method: "GET",
    url: "/api/polls"
  }).done((polls) => {
    for(user of polls) {
      $("<div>").text(poll.name).appendTo($("body"));
    }
  });;
});
