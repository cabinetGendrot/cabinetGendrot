var url_site = location.href;
var preview = false;
if(url_site.indexOf('preview') != -1){
	preview = true;
}
if(preview){
	$('body').css('background-color', '#fff');
}
//console.log(url_site);

var menu_fix = false; // Mettre à true pour avoir un menu fixe
if(menu_fix){
	$('header').css('position', 'relative');
	$(document).scroll(function() {
	  	$('header').css('top', String($(this).scrollTop())+'px');
	});
}

// Submit du formulaire de contact
$('#contact-form').submit(function(event) {
	event.preventDefault();
	var prenom  = $('#prenom').val(),
	  	nom     = $('#nom').val(),
	  	tel     = $('#tel').val(),
	  	email   = $('#email').val(),
		objet   = $('#objet').val(),
		annonce = $('#annonce').val(),
	  	message = $('#message').val();
	  	//console.log(prenom);
	  	//console.log(nom);
	  	//console.log(tel);
	  	//console.log(email);
	  	//console.log(message);
  	if($('#contact-form').validationEngine('validate')){
		$.ajax({
			type:    'POST',
			url:     'php/tools/ajax.php',
			data:    {
		  		action:  'post_form_contact',
			  	prenom: prenom,
			  	nom: nom,
			  	tel: tel,
			  	email: email,
				objet: objet,
				annonce: annonce,
			  	message: message
			},
	        beforeSend: function() {
	        	$('#reponse').html('<center><img src="images/ajax-loader.gif" style="max-height: 70px;"></center>');
	        	$('#reponse').show();
	        },
			success: function(data) {
				console.log(data.status);
			  	if(data.status == "success") {
			  		$('#reponse').html('<div class="alert alert-success alert-dismissible" role="alert">' +
										'<button type="button" class="close" data-dismiss="alert" aria-label="Close">'+
										'<span aria-hidden="true">&times;</span></button>'+
										'<p>' +
										'<i class="fa fa-check fa-2x"></i>'+data.message+'</p></div>');

			  	}else if(data.status == "danger"){
			  		$('#reponse').html('<center style="color:red">'+data.message+'</center>');
			  	}
			}
		});
  	}
});

$(window)
	.load(function() {
		var window_width = $(window).width();
		//console.log(window_width);

		//var content_engagement_height = $('#content_engagement').height()-60;
		//$('#fond_engagement').css('margin-top', '-'+String(content_engagement_height)+'px');
		$('#fond_engagement').css('margin-top', '-'+String($('#fond_engagement').height())+'px');

		// VALEURS
		if(window_width<1200){
			var content_valeurs_height = $('#content_valeurs').height()-60;
		}else{
			var content_valeurs_height = $('#content_valeurs').height();
		}
		
		/*$('#fond_valeurs').css('margin-top', '-'+String(content_valeurs_height)+'px');*/
		//$('#fond_valeurs2').css('margin-top', '-'+String(content_valeurs_height)+'px');

		// SYNDIC
		var visuel_syndic1_width = $('#visuel_syndic1').width();
		var visuel_syndic2_width = $('#visuel_syndic2').width();

		var marginleft_visuel_syndic2 = visuel_syndic1_width - visuel_syndic2_width;
		$('#visuel_syndic2').css('margin-left', String(marginleft_visuel_syndic2)+'px');


		var visuel_syndic1_height = $('#visuel_syndic1').height();
		$('#bloc_syndic').css('width', String(visuel_syndic1_width*60/100)+'px');

		var bloc_syndic_height = $('#bloc_syndic').height();
		var margintop_bloc_syndic = (visuel_syndic1_height + bloc_syndic_height) / 2;
		$('#bloc_syndic').css('margin-top', "-"+String(margintop_bloc_syndic)+'px');

		$('#bloc_syndic').css('margin-left', "-20%");

		if(window_width>1182 && window_width<1580){
			$('#content_syndic_droite').css('width', '25%');
		}


		/*
		var window_height = $(window).height();
		var site_height = $('body').height();
		if(window_height>site_height && !preview){
			$('footer').css('margin-top', String(window_height - site_height)+'px');
		}
		*/
	})
	.resize(function() {
		var window_width = $(window).width();
		//console.log(window_width);

		//var content_engagement_height = $('#content_engagement').height()-60;
		//$('#fond_engagement').css('margin-top', '-'+String(content_engagement_height)+'px');
		$('#fond_engagement').css('margin-top', '-'+String($('#fond_engagement').height())+'px');

		// VALEURS
		if(window_width<1200){
			var content_valeurs_height = $('#content_valeurs').height()-60;
		}else{
			var content_valeurs_height = $('#content_valeurs').height();
		}
		
		/*$('#fond_valeurs').css('margin-top', '-'+String(content_valeurs_height)+'px');*/
		//$('#fond_valeurs2').css('margin-top', '-'+String(content_valeurs_height)+'px');

		// SYNDIC
		var visuel_syndic1_width = $('#visuel_syndic1').width();
		var visuel_syndic2_width = $('#visuel_syndic2').width();

		var marginleft_visuel_syndic2 = visuel_syndic1_width - visuel_syndic2_width;
		$('#visuel_syndic2').css('margin-left', String(marginleft_visuel_syndic2)+'px');


		var visuel_syndic1_height = $('#visuel_syndic1').height();
		$('#bloc_syndic').css('width', String(visuel_syndic1_width*60/100)+'px');

		var bloc_syndic_height = $('#bloc_syndic').height();
		var margintop_bloc_syndic = (visuel_syndic1_height + bloc_syndic_height) / 2;
		$('#bloc_syndic').css('margin-top', "-"+String(margintop_bloc_syndic)+'px');

		$('#bloc_syndic').css('margin-left', "-20%");

		if(window_width>1182 && window_width<1580){
			$('#content_syndic_droite').css('width', '25%');
		}
		/*
		var window_height = $(window).height();
		var site_height = $('body').height();
		if(window_height>site_height && !preview){
			$('footer').css('margin-top', String(window_height - site_height)+'px');
		}
		*/
	})
	.scroll(function() {
		$(".parollers").each(function( index ) {
			var offset = $(this).offset();
			var height = $(this).height();

			if($(window).scrollTop()>offset.top+height){
				//console.log('hors champ');
				$('#scriptparoller').attr('src', '');
			}else{
				//console.log('dans le champ');
				$('#scriptparoller').attr('src', 'bower_components/paroller/dist/jquery.paroller.min.js');
			}
		});
	})
	
$(document).ready(function() {
		$(".btn-rgpd-accept").click(function() {
			sessionStorage.setItem('rgpd', 1);
			$("#rgpdBan").hide();
		});
		
		if(sessionStorage.getItem('rgpd') == 1) {
			$("#rgpdBan").hide();
		} else {
			$("#rgpdBan").show();
		}
	
	  	var carousel = $('.owl-carousel');
	  	if(carousel.length) {
	    	carousel.data('owlCarousel').reinit({
	      		autoPlay: 10000
    		});
  		}

		// MENU SCROLL ONE PAGE
		$("a[href^='#ancre_accueil'], a[href^='#ancre_cabinet'], a[href^='#ancre_contact']").click( function(event) {
			cible=$(this).attr('href');
			if($(cible).length>=1 && cible){
				hauteur=$(cible).offset().top;
			}else{
				hauteur=$("a[name="+cible.substr(1,cible.length-1)+"]").offset().top();
			}
			$('html,body').animate({
				scrollTop:hauteur
			}, 1500, 'easeInOutExpo');
			return false;
		});
	})


$('.my-element').paroller();
/*
$(window).paroller({
    factor: 0.3,            // multiplier for scrolling speed and offset
    type: 'foreground',     // background, foreground
    direction: 'vertical' // vertical, horizontal, TODO: diagonal
});
*/