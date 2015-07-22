$(document).ready(function() {
  $('#search-btn').on('click', function(event) {
    event.preventDefault();

    startLoadingSpinner();

    var email = $('#profile-email').val();
    var $selfie = $('#selfie');

    $.ajax({
      url: '/api/v1/selfie',
      type: 'GET',
      data: {'email': email}
    }).done(function(response) {

      if (response.success) {
        var img_src = response.img_src;
        $selfie.append($('<img src="' + img_src + '"/>'));
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