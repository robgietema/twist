var twist = {};

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

        module.socket = io.connect('/');

        window.addEventListener('deviceorientation', function(event) {
            module.socket.emit('move', event.beta);
            $('body div').html(event.beta);
        });
    });
}(jQuery, obviel, twist));
