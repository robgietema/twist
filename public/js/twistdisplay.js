var twist = {};

(function($, obviel, module) {

    // App
    obviel.iface('app');

    module.fieldWidth = 80;
    module.fieldHeight = 180;

    module.App = function (settings) {
        settings = settings || {};
        var d = {
            iface: 'app',
            name: 'default',
            obvt:
                '<div class="wrapper"><div class="highscores"></div><div class="lobby"></div><div id="message1"></div><div id="message2"></div><div id="score1"><span class="label">Score:</span> <span class="score"></span></div><div id="score2"><span class="label">Score:</span> <span class="score"></span></div><div class="balls"><span>Balls:</span><span class="count"></span></div><div id="viewport1" class="viewport"></div><div id="viewport2" class="viewport"></div></div>'
        };
        $.extend(d, settings);
        obviel.View.call(this, d);
    };

    module.App.prototype = new obviel.View();

    module.App.prototype.nextRound = function () {
        var self = this;
        var count = 0;

        self.obj.balls = 0;
        $('.balls .count').html(self.obj.balls);

        self.obj.score1 = 0;
        self.obj.score2 = 0;
        $('#score1 .score').html(self.obj.score1);
        $('#score2 .score').html(self.obj.score2);

        var addBall = function () {
            $('#viewport' + (count % 2 + 1)).view().addBall({y: 90, speed: 50});
            count++;
            self.obj.balls++;
            $('.balls .count').html(self.obj.balls);
            if (count < 5) {
                window.setTimeout(addBall, 2000);
            }
        }

        $('#message1').html('Get ready!');
        $('#message2').html('Get ready!');

        window.setTimeout(function () {
            $('#message1').html('Go!');
            $('#message2').html('Go!');
            addBall();
            window.setTimeout(function () {
                $('#message1').html('');
                $('#message2').html('');
            }, 5000);
        }, 3000);
    };

    module.App.prototype.lostBall = function (id) {
        var self = this;
        self.obj.balls -= 1;
        if (id.indexOf('2') != -1) {
            self.obj.score1++;
            $('#score1 .score').html(self.obj.score1);
        } else {
            self.obj.score2++;
            $('#score2 .score').html(self.obj.score2);
        }
        $('.balls .count').html(self.obj.balls);
        if (self.obj.balls == 0) {
            if (self.obj.score1 >= 3) {
                $('#message1').html('You win!');
                $('#message2').html('You lose');
            } else {
                $('#message1').html('You lose');
                $('#message2').html('You win!');
            }
            window.setTimeout(function () {
                $('#message1').html('');
                $('#message2').html('');
                self.nextRound();
            }, 5000);
        }
    }

    module.App.prototype.render = function () {
        var self = this;

        var obj = self.obj;
        var el = self.el;
        el.find('.wrapper').css('left', ($(window).width() - 1280) / 2);

        obj.viewport1 = {
            iface: 'viewport'
        };
        el.find('#viewport1').render(obj.viewport1);
        obj.viewport2 = {
            iface: 'viewport'
        };
        el.find('#viewport2').render(obj.viewport2);

        // Set other viewports
        obj.viewport1.otherview = el.find('#viewport2').view();
        obj.viewport2.otherview = el.find('#viewport1').view();
        obj.balls = 0;
    };

    obviel.view(new module.App());

    module.Viewport = function (settings) {
        settings = settings || {};
        var d = {
            iface: 'viewport',
            name: 'default'
        };
        $.extend(d, settings);
        obviel.View.call(this, d);
    };

    module.Viewport.prototype = new obviel.View();

    module.Viewport.prototype.render = function () {
        var self = this;

        var obj = self.obj;
        var el = self.el;

        var world = obj.world = tQuery.createWorld().appendTo(self.el.get(0));
        world._renderer.setSize(440, 570);
        world.start();

        world.tCamera().rotation.setX(0.8);
        world.tCamera().translateZ(133); // 130
        world.tCamera().translateY(-172); // -165
        world.tCamera().aspect = 440 / 570;
        world.tCamera().updateProjectionMatrix();

        world.tRenderer().shadowMapEnabled = true;
        world.tRenderer().shadowMapSoft = true;
        world.tRenderer().setClearColorHex( 0xffffff, 1 );

        tQuery.createAmbientLight().addTo(world).color(0x333333);

        obj.light = tQuery.createDirectionalLight().addTo(world)
            .position(-50, 50, 100).color(0xffffff)
            .intensity(1.0)
            .castShadow(true).shadowMap(512*2,512*2)
            .shadowCamera(100, -100, 100, -100, 20, 200)
            .shadowDarkness(0.7).shadowBias(.002);

        obj.floor_tex = THREE.ImageUtils.loadTexture( "plugins/assets/images/retina_wood.png" );
        obj.floor_tex.wrapS = obj.floor_tex.wrapT = THREE.RepeatWrapping;
        obj.floor_tex.repeat.set( 1, 2 );

        obj.ball_tex = tQuery.createCubeTexture('park2');

        obj.pad_tex = THREE.ImageUtils.loadTexture( "images/rocks.png" );
        obj.pad_tex.wrapS = obj.pad_tex.wrapT = THREE.RepeatWrapping;
        obj.pad_tex.repeat.set( 1, 1 );

        // Ground
        tQuery.createCube().addTo(world)
            .setLambertMaterial({
                reflectivity: 0.02,
                ambient: 0xFFFFFF,
                color: 0xFFFFFF,
                shininess: 300,
                envMap: obj.ball_tex,
                map: obj.floor_tex
            }).back()
            .receiveShadow(true)
            .geometry().scaleBy(module.fieldWidth + 12, module.fieldHeight + 20, 4).back();

        // Left
        tQuery
            .createCube()
            .addTo(world)
            .setPhongMaterial({
                reflectivity: 0.2,
                ambient: 0xFF7100,
                color: 0xFF7100,
                shininess: 0,
                envMap: obj.ball_tex
            }).back()
            .castShadow(true)
            .geometry()
                .scaleBy(40, module.fieldHeight + 32, 20)
                .back()
            .translateZ(4)
            .translateX((-1 * module.fieldWidth / 2) - 22)
            ._lists[0].frustumCulled = false;

        // Right
        tQuery
            .createCube()
            .addTo(world)
            .setPhongMaterial({
                reflectivity: 0.2,
                ambient: 0xFF7100,
                color: 0xFF7100,
                shininess: 420,
                envMap: obj.ball_tex
            }).back()
            .castShadow(true)
            .geometry()
                .scaleBy(40, module.fieldHeight + 32, 20)
                .back()
            .translateZ(4)
            .translateX(module.fieldWidth / 2 + 22)
            ._lists[0].frustumCulled = false;

        // Pad
        var pad = obj.pad = tQuery
            ._createMesh(THREE.CubeGeometry, [1, 1, 1, 12, 3, 3], [])
            .addTo(world)
            .setLambertMaterial({
                map: obj.pad_tex,
                bumpMap: obj.pad_tex,
                bumpScale: 0.2
            }).back()
            .castShadow(true)
            .geometry()
                .smooth(4)
                .scaleBy(16, 4, 4)
                .back()
            .translateZ(4)
            .translateY((-1 * module.fieldHeight / 2) -4);

        // Ball
        obj.balls = [];

        var angle = 0.33 + (Math.random() / 3);
        var speed = 50;
        var prev_y = 0;

        world.loop().hook(function (delta) {
            for (var ball in obj.balls) {
                switch (obj.balls[ball].move(delta, pad.position().x)) {
                    case -1:
                        obj.world.remove(obj.balls[ball].obj);
                        obj.balls.splice(ball, 1);
                        $('body').view().lostBall(el.attr('id'));
                        break;
                    case -2:
                        var old = obj.balls[ball];
                        obj.otherview.addBall({
                            speed: old.settings.speed,
                            angle: old.settings.angle + 0.5,
                            y: old.obj.position().y
                        });
                        // Remove ball from current scene
                        obj.world.remove(obj.balls[ball].obj);
                        obj.balls.splice(ball, 1);
                        break;
                }
            }
        });
    };

    module.Viewport.prototype.addBall = function (settings) {
        var self = this;
        settings = settings || {};
        var d = {
            world: self.obj.world,
            texture: self.obj.ball_tex
        };
        $.extend(d, settings);
        self.obj.balls.push(
            new module.Ball(d)
        );
    };

    obviel.view(new module.Viewport());

    module.Ball = function (settings) {
        var self = this;
        settings = settings || {};
        var d = {
            angle: 0.33 + (Math.random() / 3),
            speed: 50,
            y: 0,
            prev_y: 0,
            world: null,
            texture: null
        };
        $.extend(d, settings);
        self.settings = d;

        self.obj = tQuery.createSphere().addTo(self.settings.world)
            .setPhongMaterial({
                reflectivity: 0.9,
                ambient: 0xFFFFFF,
                color: 0xFFFFFF,
                shininess: 220,
                envMap: self.settings.texture
            }).back()
            .castShadow(true)
            .geometry().scaleBy(4, 4, 4).back()
            .translateY(self.settings.y)
            .translateZ(4);

        return self;
    };

    module.Ball.prototype.move = function (delta, pad) {
        var self = this;
        self.obj.translateX(Math.sin(self.settings.angle * Math.PI * 2) * delta * self.settings.speed);
        self.obj.translateY(Math.cos(self.settings.angle * Math.PI * 2) * delta * self.settings.speed);
        var pos = self.obj.position();
        if ((pos.y < -1 * module.fieldHeight / 2) && (prev_y >= -1 * module.fieldHeight / 2)) {
            var diff = pos.x - pad;
            var weight;
            if (Math.abs(diff) < 10) {
                if (diff < -5) {
                    weight = (diff + 5) / -5;
                    self.settings.angle = 1 - (0.2 * weight);
                } else if (diff > 5) {
                    weight = (diff - 5) / 5;
                    self.settings.angle = 0.2 * weight;
                } else {
                    self.settings.angle = 0.5 - self.settings.angle;
                    pos.y += (Math.abs(pos.y) - module.fieldHeight / 2) * 2;
                }
            }
        }
        if (pos.y < -1 * module.fieldHeight / 2 - 10) {
            return -1;
        }
        if (pos.x > module.fieldWidth / 2) {
            self.settings.angle = 1 - self.settings.angle;
            pos.x -= (Math.abs(pos.x) - module.fieldWidth / 2) * 2;
        }
        if (pos.y > module.fieldHeight / 2) {
            return -2;
        }
        if (pos.x < -1 * module.fieldWidth / 2) {
            self.settings.angle = 1 - self.settings.angle;
            pos.x += (Math.abs(pos.x) - module.fieldWidth / 2) * 2;
        }
        prev_y = pos.y;
        self.settings.speed += delta;
        if (self.settings.speed > 250) {
            self.settings.speed = 250;
        }
    };

    $(document).ready(function () {
        module.app = {
            iface: 'app'
        };
        $('body').render(module.app);

        $('body').view().nextRound();

        // Fill highscores
        $('.highscores').html('<dl><dt>Highscores:</dt><dd><ul>' +
            '<li>8 hnk</li>' +
            '<li>6 jos</li>' +
            '<li>2 hba</li>' +
            '<li>1 tld</li>' +
            '</ul></dd></dl>');

        // Fill lobby
        $('.lobby').html('<dl><dt>Up next:</dt><dd><ol>' +
            '<li>hnk</li>' +
            '<li>jos</li>' +
            '<li>hba</li>' +
            '<li>tld</li>' +
            '</ol></dd></dl>');


        module.socket = io.connect('/');
        module.socket.on('connect', function () {
            module.socket.on('move', function (angle) {
                if (angle > 40) {
                    angle = 40;
                }
                if (angle < -40) {
                    angle = -40;
                }
                angle = angle / 40 * -1;
                $('#viewport1').view().obj.pad.position().x = angle * (module.fieldWidth / 2 - 6);
                $('#viewport1').view().obj.world.tCamera().position.x = angle * 12;
                $('#viewport2').view().obj.pad.position().x = angle * (module.fieldWidth / 2 - 6);
                $('#viewport2').view().obj.world.tCamera().position.x = angle * 12;
                $('#viewport1').view().obj.light.position(angle * 50, 50, 100)
                $('#viewport2').view().obj.light.position(angle * 50, 50, 100)
            });
        });
    });
}(jQuery, obviel, twist));
