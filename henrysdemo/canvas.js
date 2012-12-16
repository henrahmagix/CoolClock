(function($) {

    var SexyClock = function(settings) {
        return CoolClock.apply(this, [settings]);
    };

    SexyClock.prototype = $.extend({}, CoolClock.prototype, {
        extraRender: function(hour, min, sec) {
            var skin = this.getSkin();
            if (skin.subIndicator) {
                var angle = 0;
                for (var i = 0; i < 240; i++) {
                    if (skin.subIndicator && i % 4) {
                        angle = this.tickAngle(i * 60 / 240);
                        this.radialLineAtAngle(angle, skin.subIndicator);
                    }
                }
            }
        }
    });

    $(function() {
        var clockSettings = {
            canvasId: 'sexyClock',
            skinId: 'sexy',
            displayRadius: 100,
            renderRadius: 100,
            showNumbers: true,
            showSecondHand: true
        };
        var clock = new SexyClock(clockSettings);
    });

})(jQuery);
