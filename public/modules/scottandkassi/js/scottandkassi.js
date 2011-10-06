var SK = {
	submitForm: function() {
		var name = $('#form-name').val();
		var number = $('#form-number').val();
		var params = {
			name:name,
			number:number
		};
		
		if (name.length && number.length) {
			$('#form-submit').hide();
			$.ajax({
				type: 'POST',
				url: '/scottandkassi/process/form',
				data: params,
				success: function() {
					$('#rsvp-form-wrap').addClass('success');
				},
				dataType: 'json'
			});
		}
		return false;
		
	},
	
	initListeners: function() {
		var links = $('#header-inner').find('a').bind('click', function(e) {
			e.preventDefault();
			var anchorId = e.currentTarget.hash.replace('#', '');
			SK.goToByScroll(anchorId);
		});
		
		$('#rsvp-form').bind('submit', function(e) {
			e.preventDefault();
			SK.submitForm();
			return false;
		});
	},
	
	goToByScroll: function(id){
		$('html,body').animate({scrollTop: $("#"+id).offset().top},'slow');
	}
	
};

$(document).ready(function() {
	SK.initListeners();
});