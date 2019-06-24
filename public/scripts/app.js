$(document).ready(function() {

// =========================================================
// !!!!!!!!!!!!! SET UP FOR VOTER_SUBMISSIONS FORM !!!!!!!!!!!!!!!
// =========================================================
  let OGOptions = [];
  var jqueryOps = $('.uk-card').toArray();
  for (var op in jqueryOps){
    OGOptions.push(jqueryOps[op].innerText);
  }

// ==================================================
// !!!!!!!!!!!!! NEW_POLLS_FORM LOGIC !!!!!!!!!!!!!
// ==================================================

  // ===========================
  // ANIMATING NEW_POLLS_FORM
  // ===========================

  var current_fs, next_fs, previous_fs; //fieldsets
  var left, opacity, scale; //fieldset properties which we will animate
  var animating; //flag to prevent quick multi-click glitches

  // ======================================
  // MOVE TO NEXT STEP OF NEW_POLLS_FORM
  // =======================================

  $(".next").click(function(){

    current_fs = $(this).parent();
    next_fs = $(this).parent().next();

    let form = $('form#msform')[0];

    if (next_fs[0].id === 'confirmation') {
      if ($('input#email').val() === '') $('input#email').val('youremail@email.com');
      $( "p.category.options" ).html('Options:');
    }

    form.reportValidity();
    if (form.checkValidity() === false) return false;


    if (next_fs[0].id === 'options') {
      $('input.optionsInput').val('');
    }

    if(animating) return false;
    animating = true;


  // ============================================================================
  //  activate next step on NEW_POLLS_FORM progressbar using the index of next_fs
  // ============================================================================
  $("#progressbar li").eq($("fieldset").index(next_fs)).addClass("active");

  // ===================================== //
  //  show the next NEW_POLLS_FORM fieldset
  // ==================================== //
  next_fs.show();

  // ========================================= //
  //  hide the current NEW_POLLS_FORM fieldset
  // ======================================== //

  current_fs.animate({opacity: 0}, {
    step: function(now, mx) {
      //as the opacity of current_fs reduces to 0 - stored in "now"
      //1. scale current_fs down to 80%
      scale = 1 - (1 - now) * 0.2;
      //2. bring next_fs from the right(50%)
      left = (now * 50)+"%";
      //3. increase opacity of next_fs to 1 as it moves in
      opacity = 1 - now;
      current_fs.css({
        'transform': 'scale('+scale+')',
        'position': 'absolute'
      });
      next_fs.css({'left': left, 'opacity': opacity});
    },
    duration: 800,
    complete: function(){
      current_fs.hide();
      animating = false;
    },
    //this comes from the custom easing plugin
    easing: 'easeInOutBack'
  });
});

// =======================================
// MOVE TO PREVIOUS STEP OF NEW_POLLS_FORM
// =======================================

$(".previous").click(function(){
  if(animating) return false;
  animating = true;

  current_fs = $(this).parent();
  previous_fs = $(this).parent().prev();

  //de-activate current step on progressbar
  $("#progressbar li").eq($("fieldset").index(current_fs)).removeClass("active");

  if (previous_fs[0].id === 'options') {
    $('input.optionsInput').val('');
    if ($('input#email').val() === '') $('input#email').val('youremail@email.com');
    $('input.num').val(2);
  }

  //show the previous fieldset
  previous_fs.show();
  //hide the current fieldset with style
  current_fs.animate({opacity: 0}, {
    step: function(now, mx) {
      //as the opacity of current_fs reduces to 0 - stored in "now"
      //1. scale previous_fs from 80% to 100%
      scale = 0.8 + (1 - now) * 0.2;
      //2. take current_fs to the right(50%) - from 0%
      left = ((1-now) * 50)+"%";
      //3. increase opacity of previous_fs to 1 as it moves in
      opacity = 1 - now;
      current_fs.css({'left': left});
      previous_fs.css({'transform': 'scale('+scale+')', 'opacity': opacity});
    },
    duration: 800,
    complete: function(){
      current_fs.hide();
      animating = false;
      previous_fs.css({
        'position': 'relative'
      });
    },
    //this comes from the custom easing plugin
    easing: 'easeInOutBack'
  }).promise().done(function () {
        // give email field a value when animating so form doesn't error out
        if ($('input#email').val() === '') $('input#email').val('youremail@email.com');
        $('input.optionsInput').val(' ');
        $('input.num').val(2);
    });
});


// ====================================================
// ON SUBMIT OF NEW_POLLS_FORM: TO-DO... ROUTE REDIRECT
// ====================================================


$(".submit").click(function(e){
  e.preventDefault();

  let form = $('form#msform')[0];

  if ($('input.num').val() <= 1) {
    $('input.num')[0].setCustomValidity('More than one person is needed to make a decision!');
  } else {
    $('input.num')[0].setCustomValidity('');
  }

  if (form.checkValidity() === false) {
    form.reportValidity();
    return;
  } else if ($('input[name="options"]').toArray().filter((entry) => $(entry).val().replace(/\s/g, '').length).length < 2) {
    swal('HEY!', 'Please input at least two options', 'error');
    return;
  } else if (new Set($('input[name="options"]').toArray().map((entry) => $(entry).val())).size !== $('input[name="options"]').toArray().map((entry) => $(entry).val()).length) {
      swal('HEY!', 'Options have to be unique', 'error');
      return;
  } else {
    $.ajax({
        url: $('form#msform').attr('action'),
        type: 'POST',
        data : $('#msform').serialize(),
        success: function(response){
          //window.location.href ="/polls/"+response.new_id;
          console.log(response.id);
          window.location.href = "/polls/" + response.id;
        }
    });
  }
})

if ($('input[name="options"]').toArray().filter((entry) => $(entry).val().replace(/\s/g, '').length).length < 2) {
    $( "p.category.options" ).append('<p style="color: #d60a0a; ">Please input at least two options.</p>');
  } else if (new Set($('input[name="options"]').toArray().map((entry) => $(entry).val())).size !== $('input[name="options"]').toArray().map((entry) => $(entry).val()).length) {
      $( "p.category.options" ).append('<p style="color: #d60a0a; ">Options have to be unique.</p>');
      return;
  }


// ===================================
//  DELETE NEW_POLLS_FORM INPUT FIELD
// ===================================

$("section.options").on('click', 'a.close', function(event) {
  event.preventDefault();
  $(this).parents('span.optionInput').remove();
});

// ================================
//  ADD NEW_POLLS_FORM INPUT FIELD
// ================================

$('a.plusButton').click(function(e){
  $( "section.options" ).append('<span class="optionInput"><input type="text" class="optionsInput" name="options" value=" " placeholder="An option" required/> <span class="close"><a href="#" class="close"></a></span></span>');
})

// ==================================================================
//  CCONFIRM YOUR ENTERED INFORMATION BEFORE NEW_POLL_FORM SUBMISSION
// ==================================================================


$('input.final').click(function(){
  $('p.question').text($('input[name="question"]').val());
  $('p.description').text($('textarea[name="description"]').val());
  $('ul.arrow').html('');
  // clear default email value
  if ($('input#email').val() === 'youremail@email.com') $('input#email').val('');
  let i = 1;
  // debugger
  if ($('input[name="options"]').toArray().filter((entry) => $(entry).val().replace(/\s/g, '').length).length < 2) {
    $( "p.category.options" ).append('<p style="color: #d60a0a; ">Please input at least two options.</p>');
  } else if (new Set($('input[name="options"]').toArray().map((entry) => $(entry).val())).size !== $('input[name="options"]').toArray().map((entry) => $(entry).val()).length) {
      $( "p.category.options" ).append('<p style="color: #d60a0a; ">Options have to be unique.</p>');
      return;
  } else {
    for (elem of $('input[name="options"]').toArray()) {
      let entry = elem.value
      $('ul.arrow').append(`<li style="list-style: none">- ${entry}</li>`)
      i++
    }
  }
});

// ==================================================
// !!!!!!!!!!!!! SUBMISSIONS_FORM LOGIC !!!!!!!!!!!!!
// ==================================================

// ===================================================================================================
//         SEND SUBMISSIONS_FORM: TO-DO... CURRENTLY NOT HITTING 'PUT' ROUTE, LOOKING FOR 'POST' ROUTE
// ===================================================================================================

  let dontCheck = false;
  $("button#submit-answers").click(function(e){

    e.preventDefault();

    let confirmed = true;

    function arraysEqual(a, b) {
      if (a === b) return true;
      if (a == null || b == null) return false;
      if (a.length != b.length) return false;

      for (var i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false;
      }
      return true;
    }

    // To store options in order of rank
    let ranking = [];

    // Weights
    let answers = [];
    $( `[data-groups] [data-group='answers'] [data-item]` ).each(function( index ) {
      ranking.push($(this).text().replace(/\s+/g, ''));
    });
    for (opt of OGOptions) {
      let i = ranking.indexOf(opt);
      answers.push(OGOptions.length - i);
    }

    if (arraysEqual(ranking, OGOptions) && !dontCheck) confirmed = false;
    // let jsonRank = answers

    if (confirmed) {
      $.ajax({
        url: $('form#new-submission').attr('action'),
        type: 'POST',
        headers: {"X-HTTP-Method-Override": "PUT"},
        data : {answers: answers},
        success: function(){
          console.log('form submitted.');
          location.reload();
        }
      });
    } else {
      swal({
          title: "Are you sure you want to go with the default ranking?",
          text: "Click anywhere outside the window to cancel.",
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "btn-danger",
          confirmButtonText: "Yup!",
          cancelButtonText: "No, cancel it!",
          closeOnConfirm: false,
          closeOnCancel: false
       }).then(
       function(isConfirm){
         if (isConfirm){
           swal("Your call, boss!", "Okay then!", "success");
           confirmed = true;
           dontCheck = true;
          } else {
            swal("Cancelled", "Change the rank order first!", "error");
          }
      });
    }
  });

  $('button.copyURL').on('click', (e) => {
    console.log('blah')
    var $temp = $("<input>");
    $("body").append($temp);
    $temp.val(`http://localhost:8080/submissions/${e.target.id}`).select();
    document.execCommand("copy");
    $temp.remove();
    //swal('Copied to clipboard!');
  });

});
