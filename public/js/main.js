$('#search-btn').on('click', function(event) {
  event.preventDefault();
  
  var email = $('#profile-email').val();
  var $selfie = $('#selfie');

  $.ajax({
    url: '/api/img_from_email',
    type: 'GET',
    data: {'email': email}
  }).done(function(response) {
    $selfie.append($('<img src="' + response + '"/>'));
  }).fail(function() {
    // TODO: Handle error
    console.log("error");
  });
});

