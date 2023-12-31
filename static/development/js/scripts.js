Acme.articleFeeds = {};


$('document').ready(function() {
    var mobileView = 620;
    var desktopView = 1330;
    var pageWindow = $(window);
    var scrollMetric = [pageWindow.scrollTop()];
    var articleAd = $('#side-fix-1');
    var fixMenu = $('#j-menu-fixed');
   
    
    // $("img.lazyload").lazyload({
    //     effect : "fadeIn"
    // });

    var lazyLoadInstance = new LazyLoad({
        // Your custom settings go here
    });

    var isMobile = function(){
        if (window.innerWidth < mobileView) {
            return true;
        }
        return false;
    };

    var isDesktop = function(){
        if (window.innerWidth > desktopView) {
            return true;
        }
        return false;
    };


    var isScrolledPast = function(position){
        if (scrollMetric[0] >= position) {
            return true;
        }
        return false;
    };


    var scrollUpMenu = function() {
        var isDesk = isDesktop();
        if ( scrollMetric[1] === 'up' && isScrolledPast(300) && isDesk === true ){
            fixMenu.removeClass('c-header-4__fixed--off');
            fixMenu.addClass('c-header-4__fixed--on');
        } else if ( (scrollMetric[1] === 'up' && $('.responsive-standalone').hasClass('navigation-active') === false) && isScrolledPast(200) && isDesk === false) {
            fixMenu.removeClass('c-header-4__fixed--off');
            fixMenu.addClass('c-header-4__fixed--on');     
        } else if ($('.responsive-standalone').hasClass('navigation-active') === false) {         
            fixMenu.removeClass('c-header-4__fixed--on');
            fixMenu.addClass('c-header-4__fixed--off');
        }
    }


    //Onload and resize events
    $(window).on("resize", function () {
        scrollUpMenu();
    }).resize();

    //On Scroll
    $(window).scroll(function() {
        var direction = 'down';
        var scroll = $(window).scrollTop();
        if (scroll < scrollMetric[0]) {
            direction = 'up';
        }
        scrollMetric = [scroll, direction];
        scrollUpMenu();
        Acme.adScroll();
    });


    



    Acme.adScroll = function() {

        //set sidebar height for desktop scrolling ad
        if ($('.j-article-container').length > 0 && $('.j-article-sidebar').length > 0 && $(window).width() > 1330) {
                      
            var artCont = $('.j-article-container')[0];
            artCont.id = 'j-article-cont';
            var articleTop = $('#j-article-cont').position().top
            var theHeight = $('#j-article-cont').height();
            var adCont =  $('.j-article-sidebar')[0];
            adCont.id = 'j-fixad-cont';
            $('#j-fixad-cont').css("height",theHeight+"px");
            var screenHeight = $(window).height();
            // if the window is below a certain height some of the sidebar is missing
            // so we have to compensate so the scrolling remains smooth       
            if (screenHeight <= 814) {
                var screenDiff = (814 - screenHeight) + 960;
            } else {
                var screenDiff = 970;
            }
            // tell ad when to scroll and when not to based on the size of the article
            // 135 is the space above left for foldaway menu
            if ( scrollMetric[1] === 'up' && !isScrolledPast(articleTop-20)) {
                articleAd.removeClass('advertisment__side-fix--fixed').removeClass('advertisment__side-fix--bottom').addClass('advertisment__side-fix--top');
            }
            else if ( scrollMetric[1] === 'up' && !isScrolledPast((theHeight-screenDiff)+articleTop)) {
                articleAd.removeClass('advertisment__side-fix--bottom').addClass('advertisment__side-fix--fixed');
            }
            else if ( scrollMetric[1] === 'down' && isScrolledPast((theHeight-screenDiff)+articleTop)) {
                articleAd.removeClass('advertisment__side-fix--fixed').removeClass('advertisment__side-fix--top').addClass('advertisment__side-fix--bottom');
            } 
            else if ( scrollMetric[1] === 'down' && isScrolledPast(articleTop-20)) {
                articleAd.removeClass('advertisment__side-fix--top').addClass('advertisment__side-fix--fixed');
            }
        }
        
    }



    window.Acme.scrollThumbs = function(elem) {
        if (elem.length === 0) {
            return;
        }
        var elem = $(elem);
        var elemWidth = elem.width();
        var container = elem.parent();
        var containerWidth = container.width();
        var scrollAmount = container.scrollLeft();
        var containerView = [scrollAmount, containerWidth + scrollAmount];

        var middle = (containerView[1] - containerView[0]) / 2 ;
        var middle = scrollAmount + middle;
        var elempos = elem[0].offsetLeft + elemWidth/2;

        if ( elempos > middle ) {
            var scroll = true;
            var scrollpos = scrollAmount + (elempos - middle);
        } else if ( elem[0].offsetLeft < middle ) {
            var scroll = true;
            var scrollpos = scrollAmount - (middle - elempos);
        }

        if (scroll) {
            container.animate({
                scrollLeft : scrollpos
            });
        }
    }


    window.Acme.scrollThumbsVertical = function(elem) {
        console.log('clicked');
        if (elem.length === 0) {
            return;
        }
        var elem = $(elem);
        var elemHeight = elem.height();
        var container = elem.parent();
        var containerHeight = container.height();
        var scrollAmount = container.scrollTop();
        var containerView = [scrollAmount, containerHeight + scrollAmount];

        var middle = (containerView[1] - containerView[0]) / 2 ;
        var middle = scrollAmount + middle;

        var elempos = elem[0].offsetTop + elemHeight/2;

        if ( elempos > middle ) {
            var scroll = true;
            var scrollpos = scrollAmount + (elempos - middle);
        } else if ( elem[0].offsetLeft < middle ) {
            var scroll = true;
            var scrollpos = scrollAmount - (middle - elempos);
        }

        if (scroll) {
            container.animate({
                scrollTop : scrollpos
            });
        }
    }


    // Onload and resize events
    // pageWindow.on("resize", function () {
    //     // removeMobileMenuStyles();
    // }).resize();




    $('.js-menu').on('click', function (event) {
        event.preventDefault();
        if ($('.responsive-standalone').hasClass('navigation-active')){
            closeMobileMenu();
            return false;
        } else{
            $('body').addClass('u-noscroll');
            $('.responsive-standalone').addClass('navigation-active');
            $('.responsive-standalone-close').addClass('open');
            if (fixMenu.hasClass('c-header-4__fixed--off')){
                fixMenu.removeClass('c-header-4__fixed--off');
                fixMenu.addClass('c-header-4__fixed--on');
            }
            $(".responsive-standalone-overlay").animate({
                "opacity": "toggle"
            }, {
                duration: 500
            }, function () {
                $(".responsive-standalone-overlay").fadeIn();
            });
            return false;
        }
    });

    function closeMobileMenu() {
        $('body').removeClass('u-noscroll');
        $('.responsive-standalone-close').removeClass('open');
        $('.responsive-standalone').removeClass('navigation-active');
        $(".responsive-standalone-overlay").hide();
        if (fixMenu.hasClass('c-header-4__fixed--on')){
            fixMenu.removeClass('c-header-4__fixed--on');
            fixMenu.addClass('c-header-4__fixed--off');
        }
    }
    $('.responsive-standalone-close').on('click', function (event) {
        event.preventDefault();
        closeMobileMenu();
        return false;
    });
    $(".responsive-standalone-overlay").on('click', function () {
        closeMobileMenu();
    });



    $(".list-arrow-container").on('click', function(e) {

        $parent = $(this).parent();
        var isActive = $parent.hasClass('active');
        $('.dropdown').each(function() {
            var elem = $(this);
            elem.removeClass('active');
            elem.find('.custom-menu').removeClass('custom-menu--active');
        });
        if (!isActive) {
            $parent.addClass('active');
            $(this).siblings('.custom-menu').addClass('custom-menu--active');
        }
    });

    $(".list-arrow-container-sub").on('click', function(e) {

        $parent = $(this).parent();
        var isActive = $parent.hasClass('custom-menu-child--active');
        $('.custom-menu-child--babies').each(function() {
            var elem = $(this);
            elem.removeClass('custom-menu-child--active');
            elem.find('.custom-menu-child-sub').removeClass('custom-menu-child-sub--show');
        });
        if (!isActive) {
            $parent.addClass('custom-menu-child--active');
            $(this).siblings('.custom-menu-child-sub').addClass('custom-menu-child-sub--show');
        }
    });




    $('.js-searchButton__search').on('click',function() {
        $('.c-search-bar').toggleClass('c-search-bar__open');
        $('.js-searchButton__search').toggleClass('d-none');
        $('.js-searchButton__close').toggleClass('d-none');
    });
    $('.js-searchButton__close').on('click',function() {
        $('.c-search-bar').toggleClass('c-search-bar__open');
        $('.js-searchButton__search').toggleClass('d-none');
        $('.js-searchButton__close').toggleClass('d-none');
    });

    $('.c-article__container figure').each(function () {
        var figureStyle = $(this).attr('style') !== undefined;
        var figureClassLeft = $(this).hasClass('alignleft');
        var figureClassRight = $(this).hasClass('alignright');
        if (!(figureStyle) && !(figureClassLeft) && !(figureClassRight)) {
            $(this).after('<div class="clearfix"></div>');
        }
    });



    var truncate = '';
    clearTimeout(truncate);
    truncate = setTimeout((function() {
        $('.j-truncate').dotdotdot({
            watch: true
        });
    }), 750);


    $("#owl-gallery-image").owlCarousel({
        items: 1,
        dots: false,
        nav: true,
        navText: [
            "",
            ""
        ]
    });   



    //this is used for the gallery template
    $("#owl-gallery-article").owlCarousel({
        items: 1,
        thumbs: true,
        thumbsPrerendered: true,
        URLhashListener:true,
        startPosition: 'URLHash',
        pagination: true,
        dots: false,
        nav: true,
        navText: [
            "",
            ""
        ]
    });   






    Acme.adScroll();

    $('.j-contactpage-expand').click(function(){
        $(this).parent().children().removeClass('d-none');
        $(this).addClass('d-none');
    });

    $('.js-accPasswordToggler').on('click',function() {
        if($(this).prev('.js-accPasswordVisible').attr('type') == 'password') {
            $(this).prev('.js-accPasswordVisible').attr('type', 'text');
            $(this).addClass('active');
        }else {
            $(this).prev('.js-accPasswordVisible').attr('type', 'password');
            $(this).removeClass('active');
        }
    });
});
