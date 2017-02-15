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
    }

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
    }

    var controlUpButton = function(obj) {
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
    }

    $(window).scroll(function() {
        controlUpButton($(this));
        controlTopMenu($(this));

    });
    controlTopMenu($(this));
};
