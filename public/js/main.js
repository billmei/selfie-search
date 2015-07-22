$('#search-btn').on('click', function(event) {
  event.preventDefault();
  
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
      // TODO: Handle not found.
      alert("We can't find a profile image associated with that email address.");
    }

  }).fail(function() {
    // TODO: Handle error
    console.log("error");
  });
});

