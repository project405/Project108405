// navbar
$(document).ready(function () {
    window.onload = function () {
        document.body.addEventListener('wheel', function (data) {
            const m1 = document.querySelector('html').scrollTop * 0.3;
            const m3 = document.querySelector('html').scrollTop * 1.5;
            const s3 = document.querySelector('html').scrollTop * 0.01;
            console.log('===> a', document.querySelector('html').scrollTop, m1);
            document.querySelector('.m1').style.transform = `translateY(${m1}px)`
            // document.querySelector('.m3').style.transform = `translateY(${-m3}px) scale(${1 - s3})`
        })
    };
    $(window).on("scroll", function () {

        var wn = $(window).scrollTop();
        if (wn > 120) {
            $(".navbar").css("background", "#2D4F41");
            $(".navbar").css("opacity", "0.85");
            $(".navbar").css("transition", "0.5s ease-in-out");
            $(".navbar").css("box-shadow", " 0 5px 15px rgba(0,0,0,0.3)");
            $("input.navSearch").css("background-color", " rgb(21, 48, 36)");
        } else {
            $(".navbar").css("background", "");
            $(".navbar").css("box-shadow", "none");
            $("input.navSearch").css("background-color", "white");
            $("button.navSearch").css("background-color", "none");
        }
    });

    $('.surpriseSection').hover(() => {
        $('.surpriseHoverText').css('display', 'block')
    })
    $('.surpriseSection').mouseleave(() => {
        $('.surpriseHoverText').css('display', 'none')
    })
    $('a.list-group-item-action').hover(function(item) {
        $(`.${item.target.classList[2]}Text`).css('visibility', 'visible').hide().slideDown();

    })
    $('a.list-group-item-action').mouseleave(function(item) {
        $(`.${item.target.classList[2]}Text`).css('visibility', 'hidden')
    })

    $('a').click(function(){
        $('html, body').animate({
            scrollTop: $( $(this).attr('href') ).offset().top
        }, 500);
        return false;
    });
});



// AOS animate
AOS.init({
    duration: 2500
});
