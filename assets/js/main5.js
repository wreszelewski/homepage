function cookieAlert() {

	//copyright JGA 2013 under MIT License
	var monster={set:function(e,t,n,r){var i=new Date,s="",o=typeof t,u="";r=r||"/",n&&(i.setTime(i.getTime()+n*24*60*60*1e3),s="; expires="+i.toGMTString());if(o==="object"&&o!=="undefined"){if(!("JSON"in window))throw"Bummer, your browser doesn't support JSON parsing.";u=JSON.stringify({v:t})}else u=escape(t);document.cookie=e+"="+u+s+"; path="+r},get:function(e){var t=e+"=",n=document.cookie.split(";"),r="",i="",s={};for(var o=0;o<n.length;o++){var u=n[o];while(u.charAt(0)==" ")u=u.substring(1,u.length);if(u.indexOf(t)===0){r=u.substring(t.length,u.length),i=r.substring(0,1);if(i=="{"){s=JSON.parse(r);if("v"in s)return s.v}return r=="undefined"?undefined:unescape(r)}}return null},remove:function(e){this.set(e,"",-1)},increment:function(e,t){var n=this.get(e)||0;this.set(e,parseInt(n,10)+1,t)},decrement:function(e,t){var n=this.get(e)||0;this.set(e,parseInt(n,10)-1,t)}};

	if (monster.get('cookieinfo') === 'true') {
		return false;
	}

	var container = document.createElement('div');
	var link = document.createElement('a');
	container.setAttribute('id', 'cookieinfo');
	container.setAttribute('class', 'cookie-alert');
	container.innerHTML = '<h6>This website uses cookies</h6><p>By continuing to visit this site you agree to its use of cookies. <a href="/cookies-policy.html">Read more.</a></p>';

	link.setAttribute('href', '#');
	link.setAttribute('title', 'Zamknij');
	link.setAttribute('class', 'closeCookieInfo');
	link.innerHTML = 'x';

	function clickHandler(e) {
		if (e.preventDefault) {
			e.preventDefault();
		} else {
			e.returnValue = false;
		}
		monster.set('cookieinfo', 'true', 365);
		document.body.removeChild(container);
	}

	if (link.addEventListener) {
		link.addEventListener('click', clickHandler);
	} else {
		link.attachEvent('onclick', clickHandler);
	}

	container.appendChild(link);
	document.body.appendChild(container);

	return true;
}

window.onload = function() {

	var allowDown = true;

	$.fn.scrollView = function() {
		return this.each(function() {
			allowDown = false;
			$('html, body').animate({
				scrollTop: $(this).offset().top - $('.introduction').height()
			}, 1000);
			window.setTimeout(function() {
				allowDown = true;
			}, 1000);
		});
	};

	$.fn.scrollUp = function() {
		return this.each(function() {
			allowDown = false;
			$('html, body').animate({
				scrollTop: 0
			}, 1000);
			window.setTimeout(function() {
				allowDown = true;
				$('.scrollUp').fadeOut();
			}, 1000);
		});
	};

	var controlUpButton = function(obj) {
		var state;
		if (obj.scrollTop() > 300) {
			if (obj.scrollTop() > ($(document).height() - $(window).height() - $('.copyright').height() + 20)) {
				var val = 20 + $('.copyright').height() - ($(document).height() - $(window).height() - obj.scrollTop()) + 'px';
				$('.scrollUp').css('bottom', val);
				$('.scrollUp').hide().show(0);
			} else {
				$('.scrollUp').css('bottom', '2%');
			}
			$('.scrollUp').fadeIn();
			state = 'up';
		} else if (obj.scrollTop() < 300 && allowDown) {
			$('.scrollUp').fadeOut();
			state = 'down';
		}
	};

	var controlTopMenu = function(obj) {
		if (obj.scrollTop() > 0) {
			$('.topMenu').addClass('headerMinified');
			$('.introduction').addClass('introductionMinified');
			$('.basicNav').addClass('headerMinified');

		} else {
			$('.topMenu').removeClass('headerMinified');
			$('.introduction').removeClass('introductionMinified');
			$('.basicNav').removeClass('headerMinified');

		}
	};

	$(window).scroll(function() {
		controlUpButton($(this));
		controlTopMenu($(this));

	});
	controlTopMenu($(this));
	cookieAlert();
};
