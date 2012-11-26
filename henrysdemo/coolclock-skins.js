(function($) {
    $.extend(CoolClock.config.skins, {
        reflux: {
            outerBorder:        { lineWidth: 6, radius: 3, color: "black", alpha: 1 },
            subIndicator:       { lineWidth: 1, startAt: 91, endAt: 98, color: "black", alpha: 0.8 },
            smallIndicator:     { lineWidth: 1, startAt: 87, endAt: 98, color: "black", alpha: 1 },
            largeIndicator:     { lineWidth: 1, startAt: 87, endAt: 100, color: "black", alpha: 1 },
            hourHand:           { lineWidth: 5, startAt: -10, endAt: 60, color: "black", alpha: 1, triangle: true, triangleWidth: 0.5 },
            minuteHand:         { lineWidth: 5, startAt: -20, endAt: 80, color: "black", alpha: 1, triangle: true, triangleWidth: 0.5 },
            secondHand:         { lineWidth: 1, startAt: -20, endAt: 85, color: "red", alpha: .85 },
            secondDecoration:   { lineWidth: 3, startAt: 0, radius: 2, fillColor: "black", color: "black", alpha: 1 },
            numbers:            { maxPosition: 75, element: '<div />', class: 'clock-number' }
        }
    });
})(jQuery)
