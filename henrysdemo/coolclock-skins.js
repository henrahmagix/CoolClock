(function($) {
    $.extend(CoolClock.config.skins, {
        sexy: {
            outerBorder: {
                lineWidth: 6,
                radius: 3,
                color: 'black',
                alpha: 1
            },
            subIndicator: {
                lineWidth: 1,
                startAt: 94,
                endAt: 98,
                // fillColor: 'black',
                color: 'black',
                alpha: 1
            },
            smallIndicator: {
                lineWidth: 1,
                startAt: 87,
                endAt: 98,
                color: 'black',
                alpha: 1
            },
            largeIndicator: {
                lineWidth: 1,
                startAt: 87,
                endAt: 100,
                color: 'black',
                alpha: 1
            },
            hourHand: {
                lineWidth: 5,
                startAt: -10,
                endAt: 60,
                color: 'black',
                alpha: 1
            },
            minuteHand: {
                lineWidth: 5,
                startAt: -20,
                endAt: 80,
                color: 'black',
                alpha: 1
            },
            secondHand: {
                lineWidth: 1,
                startAt: -20,
                endAt: 85,
                color: 'red',
                alpha: 1
            },
            secondDecoration: {
                lineWidth: 3,
                startAt: 0,
                radius: 2,
                fillColor: 'black',
                color: 'black',
                alpha: 1
            },
            numbers: {
                lineWidth: 0,
                startAt: 70,
                radius: 10,
                fillColor: '#a15f38',
                alpha: 1,
                font: '28px Arvo'
            }
       }
   });
})(jQuery);
