$('#search-btn').on('click', function(event) {
	event.preventDefault();
	
	var email = $('#profile-email').val();


	$.ajax({
		url: '/api/img_from_email',
		type: 'GET',
		data: {'email': email}
	})
	.done(function(response) {
		console.log(response);
		console.log("success");
	})
	.fail(function() {
		console.log("error");
	})
	.always(function() {
		console.log("complete");
	});
	


});

