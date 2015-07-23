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
        $selfie.attr('src', img_src);

        $card.flip(true);

      } else {
        alertModal("Profile image not found.", "We can't find a profile image associated with that email address.");
      }

    }).fail(function() {
      // TODO: Handle error
      console.log("error");
    }).always(function() {
      stopLoadingSpinner();
    });
  });

  $('#flip-back').on('click', function(event) {
    event.preventDefault();
    $card.flip('toggle');
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