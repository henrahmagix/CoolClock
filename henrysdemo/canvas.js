(function($) {
    $(function() {
            var reminders = $(this).find('.reminders');
            if (reminders.length > 0) {
                var clockSettings = {
                    canvasId: 'remindersClock',
                    skinId: 'reflux',
                    displayRadius: 100,
                    showSecondHand: false
                };
                var clockWrap = $('<div class="clock-wrap"></div>');
                var clock = $('<canvas id="' + clockSettings.canvasId + '" />');
                clockWrap.insertBefore(reminders.first()).append(clock);

                // Copy of CoolClock.prototype.tickAngle() to allow divisions
                // of the circle other than 60.
                CoolClock.prototype.subTickAngle = function(subTick, maxIndex) {
                    // Log algorithm by David Bradshaw
                    var tweak = 3; // If it's lower the one second mark looks wrong (?)
                    var angle = 0;
                    if (this.logClock) {
                        if (subTick != 0) {
                            angle = Math.log(subTick * tweak) / Math.log(maxIndex * tweak);
                        }
                    }
                    else if (this.logClockRev) {
                        // Flip the seconds then flip the angle (trickiness)
                        subTick = (maxIndex - subTick) % maxIndex;
                        if (subTick != 0) {
                            angle = Math.log(subTick * tweak) / Math.log(maxIndex * tweak);
                        }
                        angle = 1.0 - angle;
                    }
                    else {
                        angle = subTick / parseFloat(maxIndex + '.0');
                    }
                    return angle;
                };

                CoolClock.prototype.prevRender = CoolClock.prototype.render;
                CoolClock.prototype.render = function(hour, min, sec) {
                    // Get the skin
                    var skin = CoolClock.config.skins[this.skinId];
                    if (!skin) skin = CoolClock.config.skins[CoolClock.config.defaultSkin];

                    // Hide hands that are going to be triangles, and save the
                    // current alpha.
                    var oldAlphas = {};
                    if (skin.hourHand.triangle) {
                        oldAlphas.hour = skin.hourHand.alpha;
                        skin.hourHand.alpha = 0;
                    }
                    if (skin.minuteHand.triangle) {
                        oldAlphas.min = skin.minuteHand.alpha;
                        skin.minuteHand.alpha = 0;
                    }
                    if (skin.secondHand.triangle) {
                        oldAlphas.sec = skin.secondHand.alpha;
                        skin.secondHand.alpha = 0;
                    }

                    // Call previous render function. It clears the canvas, so
                    // it must be called first.
                    this.prevRender(hour, min, sec);

                    // Draw the four small marks between each second.
                    var totalSubMarks = 60 * 4;
                    var angle = 0;
                    for (var i = 0; i < totalSubMarks; i++) {
                        if (i % 4 && skin.subIndicator) {
                            angle = this.subTickAngle(i, totalSubMarks);
                            this.radialLineAtAngle(angle, skin.subIndicator);
                        }
                    }

                    // Draw numbers on the clock face.
                    if (skin.numbers) {
                        this.removeNumbers(skin.numbers);
                        for (var i = 1; i <= 12; i++) {
                            angle = this.subTickAngle(i, 12);
                            this.numberAtAngle(angle, i, skin.numbers);
                        }
                    }

                    // Draw the hands as triangles if optioned.
                    var hourA = (hour % 12) * 5 + min / 12.0,
                        minA = min + sec / 60.0;
                        secA = sec;
                    if (skin.hourHand.triangle) {
                        // Return the alpha value.
                        skin.hourHand.alpha = oldAlphas.hour;
                        this.triangleAtAngle(this.tickAngle(hourA), skin.hourHand);
                    }
                    if (skin.minuteHand.triangle) {
                        // Return the alpha value.
                        skin.minuteHand.alpha = oldAlphas.min;
                        this.triangleAtAngle(this.tickAngle(minA), skin.minuteHand);
                    }
                    if (skin.secondHand.triangle) {
                        // Return the alpha value.
                        skin.secondHand.alpha = oldAlphas.sec;
                        this.triangleAtAngle(this.tickAngle(secA), skin.secondHand);
                    }
                };

                // Copy of radialLineAtAngle()
                CoolClock.prototype.triangleAtAngle = function(angleFraction, skin) {
                    this.ctx.save();
                    this.ctx.translate(this.renderRadius, this.renderRadius);
                    this.ctx.rotate(Math.PI * (2.0 * angleFraction - 0.5));
                    this.ctx.globalAlpha = skin.alpha;
                    this.ctx.fillStyle = skin.color;
                    this.ctx.lineWidth = skin.lineWidth;

                    var y = skin.lineWidth / 2;

                    if (CoolClock.config.isIE) {
                        // excanvas doesn't scale line width so we will do it here
                        this.ctx.lineWidth *= this.scale;
                    }

                    if (skin.triangle) {
                        this.ctx.beginPath();
                        // Use half lineWidth as y to draw same as line stroke
                        // but fill instead.
                        this.ctx.moveTo(skin.startAt, y);
                        // Draw from thick end to tip.
                        if (skin.triangleWidth) {
                            this.ctx.lineTo(skin.endAt, skin.triangleWidth);
                            this.ctx.lineTo(skin.endAt, -skin.triangleWidth);
                        }
                        else {
                            this.ctx.lineTo(skin.endAt, 0);
                        }
                        // Draw back to beginning, ending as far from the first
                        // as lineWidth.
                        this.ctx.lineTo(skin.startAt, 0 - y);
                        // No need to closePath() since we are filling.
                        this.ctx.fill();
                    }
                    this.ctx.restore();
                };

                // Add numbers to the clock face.
                CoolClock.prototype.numberAtAngle = function(angleFraction, num, skin) {
                    this.ctx.save();

                    this.ctx.translate(this.renderRadius, this.renderRadius);
                    this.ctx.globalAlpha = skin.alpha;

                    var pos = skin.maxPosition;
                    var angle = Math.PI * (2.0 * angleFraction - 0.5);
                    this.ctx.rotate(angle);
                    this.ctx.translate(pos, 0);
                    this.ctx.rotate(0 - angle);

                    this.ctx.font = 'bold 24px sans-serif';
                    this.ctx.textBaseline = 'middle';

                    var textWidth = this.ctx.measureText(num).width;
                    var textCenter = 0 - (textWidth / 2);
                    this.ctx.fillText(num, textCenter, 0);

                    this.ctx.restore();
                };

                CoolClock.prototype.removeNumbers = function(skin) {
                    $('.' + skin.class).remove();
                };

                clock = new CoolClock(clockSettings);
                clock.stop();
            }
    });
})(jQuery);
