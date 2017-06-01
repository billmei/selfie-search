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

    if (!validateEmail(email)) {
      alertModal("Email not valid", "That email doesn't look valid. Is there a typo?");
      stopLoadingSpinner();
      return;
    }
    
    $.ajax({
      url: '/api/v1/selfie',
      type: 'GET',
      data: {'email': email}
    }).done(function(response) {

      if (response.success) {
        var imgSRC = response.imgSRC;
        $selfie.attr('src', imgSRC).load(function() {
          // Wait for image to download before displaying it.
          $card.flip(true);
          stopLoadingSpinner();
        });
      } else {
        alertModal("Profile image not found.", "We can't find a profile image associated with that email address. This app works better for people who have strong social media presences, so it could be that you're not very active on social media.");
        stopLoadingSpinner();
      }
    }).fail(function() {
      alertModal("Server error.", "There was a sever error when looking up that email. This is probably because we've either surpassed the API limit for FullContact, or there's too much traffic, or both.");
      stopLoadingSpinner();
    });
  });

  $('#flip-back').on('click', function(event) {
    event.preventDefault();
    $card.flip('toggle');
  });

  $('#wrong-img').on('click', function(event) {
    event.preventDefault();
    alertModal("Sorry!", "This feature isn't supported yet. Send in a <a href=\"https://github.com/billmei/selfie-search/pulls\">pull request</a> if you have a fix?");
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

  function validateEmail (email) {
    // Quick and simple email validation. Don't need to implement full RFC 5322,
    // just check that it has an @ symbol and a . symbol.
    var str = /.+@.+\..+/;
    return str.test(email);
  }
});