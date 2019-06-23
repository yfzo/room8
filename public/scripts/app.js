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
    if(animating) return false;
    animating = true;

    current_fs = $(this).parent();
    next_fs = $(this).parent().next();

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
    },
    //this comes from the custom easing plugin
    easing: 'easeInOutBack'
  });
});


// ==============================
// ON SUBMIT OF NEW_POLLS_FORM
// ==============================


$(".submit").click(function(e){
  e.preventDefault();

  $.ajax({
      url: $('form#msform').attr('action'),
      type: 'POST',
      data : $('#msform').serialize(),
      success: function(response){
        //window.location.href ="/polls/"+response.new_id;
        console.log(response.new_id);
      }
    });
})


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
  $( "section.options" ).append('<span class="optionInput"><input type="text" name="options" placeholder="An option" /> <span class="close"><a href="#" class="close"></a></span></span>');
})

// ==================================================================
//  CCONFIRM YOUR ENTERED INFORMATION BEFORE NEW_POLL_FORM SUBMISSION
// ==================================================================

$('input.final').click(function(){
  $('p.question').text($('input[name="question"]').val());
  $('p.description').text($('textarea[name="description"]').val());
  $('ul.arrow').html('');
  let i = 1;
  for (elem of $('input[name="options"]').toArray()) {
    let entry = elem.value
    $('ul.arrow').append(`<li style="list-style: none">- ${entry}</li>`)
    i++
  }
});

// ==================================================
// !!!!!!!!!!!!! SUBMISSIONS_FORM LOGIC !!!!!!!!!!!!!
// ==================================================

// ============================================================================================
//         SEND SUBMISSIONS_FORM: CURRENTLY NOT HITTING 'PUT' ROUTE, LOOKING FOR 'POST' ROUTE
// =============================================================================================

  $("#submit-answers").click(function(e){
    e.preventDefault();
    // To store options in order of rank
    let ranking = [];

    console.log('OGOptions: ', OGOptions)
    // Weights
    let answers = [];
    $( `[data-groups] [data-group='answers'] [data-item]` ).each(function( index ) {
      ranking.push($(this).text());
    });
    for (opt of OGOptions) {
      let i = ranking.indexOf(opt);
      answers.push(OGOptions.length - i);
    }
    let jsonRank = JSON.stringify(answers)
    $.ajax({
      url: $('form#new-submission').attr('action'),
      type: 'POST',
      headers: {"X-HTTP-Method-Override": "PUT"},
      data : {answers: jsonRank},
      success: function(){
        console.log('form submitted.');
      }
    });
  });

});
