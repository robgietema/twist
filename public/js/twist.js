var loop = {};

(function($, obviel, module) {

    // App
    obviel.iface('app');

    module.App = function (settings) {
        settings = settings || {};
        var d = {
            iface: 'app',
            name: 'default',
            obvt:
                '<div></div>'
        };
        $.extend(d, settings);
        obviel.View.call(this, d);
    };

    module.App.prototype = new obviel.View();

    obviel.view(new module.App());

    $(document).ready(function () {
        module.app = {
            iface: 'app'
        };        
        $('body').render(module.app);

        $(window).bind('deviceorientation', function(event) {
            $('body div').html(event.gamma);
        });
    });
}(jQuery, obviel, loop));
