//Smooth Scroll and Navbar Active Updater sourced from https://stackoverflow.com/a/9980042 , http://jsfiddle.net/mekwall/up4nu/
function scroll() {
    (function ($, window, document) {

        $('[data-toggle]').on('click', function (event) {
            event.preventDefault();
            var target = $(this.hash);
            target.toggle();
        });

        // Cache selectors
        var lastId,
            topMenu = $("#content-menu"),
            topMenuHeight = topMenu.outerHeight() + 15,
            // All list items
            menuItems = topMenu.find("a"),
            // Anchors corresponding to menu items
            scrollItems = menuItems.map(function () {
                var item = $(this).attr("href");
                if (item != '#') { return $(item) }
            });

        console.log(scrollItems)


        // Bind click handler to menu items
        // so we can get a fancy scroll animation
        menuItems.click(function (e) {
            var href = $(this).attr("href"),
                offsetTop = href === "#" ? 0 : $(href).offset().top - topMenuHeight + 1;
            $('html, body').stop().animate({
                scrollTop: offsetTop
            }, 300);
            e.preventDefault();
        });

        // Bind to scroll
        $(window).scroll(function () {
            // Get container scroll position
            var fromTop = $(this).scrollTop() + topMenuHeight;

            // Get id of current scroll item
            var cur = scrollItems.map(function () {
                if ($(this).offset().top < fromTop)
                    // console.log(this)
                    return this;
            });
            // Get the id of the current element
            cur = cur[cur.length - 1];
            var id = cur && cur.length ? cur[0].id : "";

            if (lastId !== id) {
                lastId = id;
                // Set/remove active class
                menuItems
                    .parent().removeClass("active")
                    .end().filter("[href='#" + id + "']").parent().addClass("active");
            }
        });
    })(jQuery, window, document);




}
