window.onload = function() {

    var allowDown = true;

    $.fn.scrollView = function() {
        return this.each(function() {
            allowDown = false;
            $('html, body').animate({
                scrollTop: $(this).offset().top
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
                scrollTop: $(this).offset().top
            }, 1000);
            window.setTimeout(function() {
              allowDown = true;
              $('.scrollUp').fadeOut();
            }, 1000);
        });
    }


    $(window).scroll(function() {
        if ($(this).scrollTop() > 300) {
            if ($(this).scrollTop() > ($(document).height() - $(window).height() - $('.copyright').height() + 20)) {
                var val = 20 + $('.copyright').height() - ($(document).height() - $(window).height() - $(this).scrollTop()) + 'px';
                $('.scrollUp').css('bottom', val);
                $('.scrollUp').hide().show(0);
            } else {
                $('.scrollUp').css('bottom', '2%');
            }
            $('.scrollUp').fadeIn();
            state = 'up'
        } else if ($(this).scrollTop() < 300 && allowDown) {
            $('.scrollUp').fadeOut();
            state = 'down';
        }
    });
};
