$(document).ready(function() {
  var $card = $('#card');
  var $selfie = $('#selfie');
  var $email = $('#profile-email');

  $card.flip({
    'trigger' : 'manual',
  });
  $card.children('.hidden').removeClass('hidden');

  $('#search-btn').on('click', function(event) {
    event.preventDefault();

    startLoadingSpinner();

    var email = $email.val();
    
    $.ajax({
      url: '/api/v1/selfie',
      type: 'GET',
      data: {'email': email}
    }).done(function(response) {

      if (response.success) {
        var img_src = response.img_src;
        $selfie.attr('src', img_src).load(function() {
          // Wait for image to download before displaying it.
          $card.flip(true);
          stopLoadingSpinner();
        });
      } else {
        alertModal("Profile image not found.", "We can't find a profile image associated with that email address.");
        stopLoadingSpinner();
      }
    }).fail(function() {
      alertModal("Server error.", "There was an error reaching the server. Perhaps there's too much traffic right now.");
      stopLoadingSpinner();
    });
  });

  $('#flip-back').on('click', function(event) {
    event.preventDefault();
    $card.flip('toggle');
  });

  $('#wrong-img').on('click', function(event) {
    event.preventDefault();
    alertModal("Sorry!", "This feature isn't supported yet. Send in a <a href=\"https://github.com/Kortaggio/selfie-search/pulls\">pull request</a> if you have a fix?");
  });

  function startLoadingSpinner() {
    // Start the loading spinner
    $('.loading-spinner').addClass('loading-enabled');
    $('#search-btn').addClass('loading-disabled');
  }

  function stopLoadingSpinner() {
    // Stop the loading spinner
    $('.loading-spinner').removeClass('loading-enabled');
    $('#search-btn').removeClass('loading-disabled');
  }

  function alertModal(title, body) {
    // Display error message to the user in a modal
    $('#alert-modal-title').html(title);
    $('#alert-modal-body').html(body);
    $('#alert-modal').modal('show');
  }
});