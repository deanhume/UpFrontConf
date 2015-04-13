jQuery.noConflict();
(function ($) {

    /**
     * Responsive Nav
     */
    $('.nav-list__title').on('click', function(){
        $('.nav').toggleClass('active');
    });

})(jQuery);
