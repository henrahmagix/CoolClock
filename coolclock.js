// Constructor for CoolClock objects
window.CoolClock = function(options) {
	return this.init(options);
}

// Config contains some defaults, and clock skins
CoolClock.config = {
	tickDelay: 1000,
	longTickDelay: 15000,
	defaultRadius: 85,
	renderRadius: 100,
	defaultSkin: "chunkySwiss",
	defaultFont: "15px sans-serif",
	defaultStyle: {lineWidth: 1, startAt: 50, fillColor: "black", alpha: 1},
	// Should be in skin probably...
	// (TODO: allow skinning of digital display)
	showDigitalSecs: true,
	showDigitalAmPm: true,

	skins:	{
		// There are more skins in moreskins.js
		// Try making your own skin by copy/pasting one of these and tweaking it
		swissRail: {
			outerBorder: { lineWidth: 2, radius:95, strokeColor: "black", alpha: 1 },
			smallIndicator: { lineWidth: 2, startAt: 88, endAt: 92, strokeColor: "black", alpha: 1 },
			largeIndicator: { lineWidth: 4, startAt: 79, endAt: 92, strokeColor: "black", alpha: 1 },
			hourHand: { lineWidth: 8, startAt: -15, endAt: 50, strokeColor: "black", alpha: 1 },
			minuteHand: { lineWidth: 7, startAt: -15, endAt: 75, strokeColor: "black", alpha: 1 },
			secondHand: { lineWidth: 1, startAt: -20, endAt: 85, strokeColor: "red", alpha: 1 },
			secondDecoration: { lineWidth: 1, startAt: 70, radius: 4, fillColor: "red", strokeColor: "red", alpha: 1 },
			digital: { lineWidth: 0, fillColor: "black", strokeColor: "black", alpha: 1 }
		},
		chunkySwiss: {
			outerBorder: { lineWidth: 4, radius:97, strokeColor: "black", alpha: 1 },
			smallIndicator: { lineWidth: 4, startAt: 89, endAt: 93, strokeColor: "black", alpha: 1 },
			largeIndicator: { lineWidth: 8, startAt: 80, endAt: 93, strokeColor: "black", alpha: 1 },
			hourHand: { lineWidth: 12, startAt: -15, endAt: 60, strokeColor: "black", alpha: 1 },
			minuteHand: { lineWidth: 10, startAt: -15, endAt: 85, strokeColor: "black", alpha: 1 },
			secondHand: { lineWidth: 4, startAt: -20, endAt: 85, strokeColor: "red", alpha: 1 },
			secondDecoration: { lineWidth: 2, startAt: 70, radius: 8, fillColor: "red", strokeColor: "red", alpha: 1 },
			digital: { lineWidth: 0, fillColor: "black", strokeColor: "black", alpha: 1 }
		},
		chunkySwissOnBlack: {
			outerBorder: { lineWidth: 4, radius:97, strokeColor: "white", alpha: 1 },
			smallIndicator: { lineWidth: 4, startAt: 89, endAt: 93, strokeColor: "white", alpha: 1 },
			largeIndicator: { lineWidth: 8, startAt: 80, endAt: 93, strokeColor: "white", alpha: 1 },
			hourHand: { lineWidth: 12, startAt: -15, endAt: 60, strokeColor: "white", alpha: 1 },
			minuteHand: { lineWidth: 10, startAt: -15, endAt: 85, strokeColor: "white", alpha: 1 },
			secondHand: { lineWidth: 4, startAt: -20, endAt: 85, strokeColor: "red", alpha: 1 },
			secondDecoration: { lineWidth: 2, startAt: 70, radius: 8, fillColor: "red", strokeColor: "red", alpha: 1 },
			digital: { lineWidth: 0, fillColor: "black", strokeColor: "black", alpha: 1 }
		}

	},

	// Test for IE so we can nurse excanvas in a couple of places
	isIE: !!document.all,

	// Will store (a reference to) each clock here, indexed by the id of the canvas element
	clockTracker: {},

	// For giving a unique id to coolclock canvases with no id
	noIdCount: 0
};

// Define the CoolClock object's methods
CoolClock.prototype = {

	// Initialise using the parameters parsed from the colon delimited class
	init: function(options) {
		// Parse and store the options
		this.canvasId        = options.canvasId;
		this.skinId          = options.skinId || CoolClock.config.defaultSkin;
		this.font            = options.font || CoolClock.config.defaultFont;
		this.defaultStyle    = options.defaultStyle || CoolClock.config.defaultStyle;
		this.displayRadius   = options.displayRadius || CoolClock.config.defaultRadius;
		this.renderRadius    = options.renderRadius || CoolClock.config.renderRadius;
		this.showSecondHand  = typeof options.showSecondHand == "boolean" ? options.showSecondHand : true;
		this.gmtOffset       = (options.gmtOffset != null && options.gmtOffset != '') ? parseFloat(options.gmtOffset) : null;
		this.showNumbers     = typeof options.showNumbers == "boolean" ? options.showNumbers : false;
		this.showDigital     = typeof options.showDigital == "boolean" ? options.showDigital : false;
		this.showDigitalSecs = typeof options.showDigitalSecs == "boolean" ? options.showDigitalSecs : true;
		this.showDigitalAmPm = typeof options.showDigitalAmPm == "boolean" ? options.showDigitalAmPm : true;
		this.logClock        = typeof options.logClock == "boolean" ? options.logClock : false;
		this.logClockRev     = typeof options.logClockRev == "boolean" ? options.logClockRev : false;

		this.tickDelay       = CoolClock.config[ (this.showSecondHand || this.showDigitalSecs) ? "tickDelay" : "longTickDelay" ];

		// Get the canvas element
		this.canvas = document.getElementById(this.canvasId);

		// Make the canvas the requested size. It's always square.
		this.canvas.setAttribute("width",this.displayRadius*2);
		this.canvas.setAttribute("height",this.displayRadius*2);
		this.canvas.style.width = this.displayRadius*2 + "px";
		this.canvas.style.height = this.displayRadius*2 + "px";

		// Determine by what factor to relate skin values to canvas positions.
		// renderRadius is the max skin positional value before leaving the
		// canvas. displayRadius is half the width and height of the canvas in
		// pixels. If they are equal, there is a 1:1 relation of skin position
		// values to canvas pixels. Setting both to 200 allows 100px of space
		// around clock skins to add your own things: this is due to current
		// skins maxing out at a positional value of 100.
		this.scale = this.displayRadius / this.renderRadius;

		// Initialise canvas context
		this.ctx = this.canvas.getContext("2d");
		this.ctx.scale(this.scale,this.scale);

		// Keep track of this object
		CoolClock.config.clockTracker[this.canvasId] = this;

		// should we be running the clock?
		this.active = true;
		this.tickTimeout = null;

		// Start the clock going
		this.tick();

		return this;
	},

	// Draw a circle at point x,y with params as defined in skin
	fullCircleAt: function(x,y,skin) {
		this.ctx.save();
		this.ctx.globalAlpha = skin.alpha;
		this.ctx.lineWidth = skin.lineWidth;

		if (!CoolClock.config.isIE) {
			this.ctx.beginPath();
		}

		if (CoolClock.config.isIE) {
			// excanvas doesn't scale line width so we will do it here
			this.ctx.lineWidth = this.ctx.lineWidth * this.scale;
		}

		this.ctx.arc(x, y, skin.radius, 0, 2*Math.PI, false);

		if (CoolClock.config.isIE) {
			// excanvas doesn't close the circle so let's fill in the tiny gap
			this.ctx.arc(x, y, skin.radius, -0.1, 0.1, false);
		}

		if (skin.fillColor) {
			this.ctx.fillStyle = skin.fillColor
			this.ctx.fill();
		}
		if (skin.strokeColor || skin.color) {
			this.ctx.strokeStyle = skin.strokeColor || skin.color;
			this.ctx.stroke();
		}
		this.ctx.restore();
	},

	// Draw some text centered vertically and horizontally
	drawTextAt: function(text, x, y, skin) {
		if (!skin) skin = this.getSkin();
		this.ctx.save();
		this.ctx.font = skin.font || this.font;

		// Determine the draw position so text is centered at x,y.
		var tSize = this.ctx.measureText(text);
		x -= tSize.width / 2;
		// TextMetrics rarely returns a height property: use baseline instead.
		if (!tSize.height) {
			tSize.height = 0;
			this.ctx.textBaseline = 'middle';
		}
		y -= tSize.height / 2;

		// Color the text. Both fill and stroke allowed; stroke above fill.
		if (skin.fillColor) {
			this.ctx.fillStyle = skin.fillColor;
			this.ctx.fillText(text, x, y);
		}
		if (skin.strokeColor || skin.color) {
			this.ctx.strokeStyle = skin.strokeColor || skin.color;
			this.ctx.strokeText(text, x, y);
		}

		this.ctx.restore();
	},

	lpad2: function(num) {
		return (num < 10 ? '0' : '') + num;
	},

	tickAngle: function(second) {
		// Log algorithm by David Bradshaw
		var tweak = 3; // If it's lower the one second mark looks wrong (?)
		if (this.logClock) {
			return second == 0 ? 0 : (Math.log(second*tweak) / Math.log(60*tweak));
		}
		else if (this.logClockRev) {
			// Flip the seconds then flip the angle (trickiness)
			second = (60 - second) % 60;
			return 1.0 - (second == 0 ? 0 : (Math.log(second*tweak) / Math.log(60*tweak)));
		}
		else {
			return second/60.0;
		}
	},

	timeText: function(hour,min,sec) {
		var time = '' +
			(this.showDigitalAmPm ? ((hour%12)==0 ? 12 : (hour%12)) : hour) + ':' +
			this.lpad2(min) +
			(this.showDigitalSecs ? ':' + this.lpad2(sec) : '') +
			(this.showDigitalAmPm ? (hour < 12 ? ' am' : ' pm') : '')
		;
		return time;
	},

	// Draw a radial line by rotating then drawing a straight line
	// Ha ha, I think I've accidentally used Taus, (see http://tauday.com/)
	radialLineAtAngle: function(angleFraction, skin) {
		this.ctx.save();
		this.ctx.globalAlpha = skin.alpha;
		this.ctx.lineWidth = skin.lineWidth;

		// Move the canvas to the center and rotate so +x is the radius.
		this.ctx.translate(this.renderRadius,this.renderRadius);
		this.ctx.rotate(Math.PI * (2.0 * angleFraction - 0.5));

		if (CoolClock.config.isIE) {
			// excanvas doesn't scale line width so we will do it here
			this.ctx.lineWidth = this.ctx.lineWidth * this.scale;
		}

		if (skin.radius) {
			this.fullCircleAt(skin.startAt,0,skin);
		}
		else {
			this.ctx.beginPath();

			// If one of the below is set, we draw a quadrilateral. This allows
			// triangle clock hands.
			if (skin.startWidth !== undefined || skin.endWidth !== undefined) {
				// Half the width to get positive and negative y value. Default
				// to lineWidth for start or end width that isn't set.
				var startY = (skin.startWidth === undefined) ? skin.lineWidth / 2 : skin.startWidth / 2;
				var endY = (skin.endWidth === undefined) ? skin.lineWidth / 2 : skin.endWidth / 2;
				// Draw a shape.
				this.ctx.moveTo(skin.startAt, startY);
				this.ctx.lineTo(skin.endAt, endY);
				// Use negative start and end y values to mirror the above.
				this.ctx.lineTo(skin.endAt, -endY);
				this.ctx.lineTo(skin.startAt, -startY);
				// Close to ensure consistent stroke path.
				this.ctx.closePath();
			}
			else {
				// Draw a line.
				this.ctx.moveTo(skin.startAt,0);
				this.ctx.lineTo(skin.endAt,0);
			}
			
			if (skin.fillColor) {
				this.ctx.fillStyle = skin.fillColor;
				this.ctx.fill();
			}
			if (skin.strokeColor || skin.color) {
				this.ctx.strokeStyle = skin.strokeColor || skin.color;
				this.ctx.stroke();
			}
		}
		this.ctx.restore();
	},

	textAtAngle: function(text, angleFraction, skin) {
		this.ctx.save();

		this.ctx.globalAlpha = skin.alpha;
		this.ctx.lineWidth = skin.lineWidth;

		// Move the canvas to the center and rotate so +x is the radius.
		this.ctx.translate(this.renderRadius,this.renderRadius);
		var radial = Math.PI * (2.0 * angleFraction - 0.5);
		this.ctx.rotate(radial);
		// Now move along the radial and reset the rotation.
		this.ctx.translate(skin.startAt, 0);
		this.ctx.rotate(-radial);

		if (CoolClock.config.isIE) {
			// excanvas doesn't scale line width so we will do it here
			this.ctx.lineWidth = this.ctx.lineWidth * this.scale;
		}

		// Draw the text.
		this.drawTextAt(text, 0, 0, skin);

		this.ctx.restore();
	},

	render: function(hour,min,sec) {
		// Get the skin
		var skin = this.getSkin();

		// Clear
		this.ctx.clearRect(0,0,this.renderRadius*2,this.renderRadius*2);

		// Draw the outer edge of the clock
		if (skin.outerBorder)
			this.fullCircleAt(this.renderRadius,this.renderRadius,skin.outerBorder);

		// Draw the tick marks. Every 5th one is a big one
		for (var i=0;i<60;i++) {
			(i%5)  && skin.smallIndicator && this.radialLineAtAngle(this.tickAngle(i),skin.smallIndicator);
			!(i%5) && skin.largeIndicator && this.radialLineAtAngle(this.tickAngle(i),skin.largeIndicator);
		}

		// Draw 1-12 on the clock face.
		if (this.showNumbers) {
			var numSkin = skin.numbers || this.defaultStyle;
            for (var i = 1; i <= 12; i++) {
                angle = this.tickAngle(i * 5);
                this.textAtAngle(i, angle, numSkin);
            };
		}

		// Write the time
		if (this.showDigital) {
			var digiSkin = skin.digital || this.defaultStyle;
			var digiText = this.timeText(hour,min,sec);
			var digiX = digiSkin.posX || this.renderRadius;
			var digiY = digiSkin.posY || this.renderRadius * 1.5;
			this.drawTextAt(digiText, digiX, digiY, digiSkin);
		}

		var hourA = (hour%12)*5 + min/12.0,
		    minA = min + sec/60.0,
		    secA = sec;

		// Draw the hands
		if (skin.hourHand)
			this.radialLineAtAngle(this.tickAngle(hourA),skin.hourHand);

		if (skin.minuteHand)
			this.radialLineAtAngle(this.tickAngle(minA),skin.minuteHand);

		if (this.showSecondHand && skin.secondHand)
			this.radialLineAtAngle(this.tickAngle(secA),skin.secondHand);

		// Hands decoration - not in IE
		if  (!CoolClock.config.isIE) {
			if (skin.hourDecoration)
				this.radialLineAtAngle(this.tickAngle(hourA), skin.hourDecoration);

			if (skin.minDecoration)
				this.radialLineAtAngle(this.tickAngle(minA), skin.minDecoration);

			if (this.showSecondHand && skin.secondDecoration)
				this.radialLineAtAngle(this.tickAngle(secA),skin.secondDecoration);
		}

		if (this.extraRender) {
			this.extraRender(hour,min,sec);
		}
	},

	// Check the time and display the clock
	refreshDisplay: function() {
		var now = new Date();
		if (this.gmtOffset != null) {
			// Use GMT + gmtOffset
			var offsetNow = new Date(now.valueOf() + (this.gmtOffset * 1000 * 60 * 60));
			this.render(offsetNow.getUTCHours(),offsetNow.getUTCMinutes(),offsetNow.getUTCSeconds());
		}
		else {
			// Use local time
			this.render(now.getHours(),now.getMinutes(),now.getSeconds());
		}
	},

	// Set timeout to trigger a tick in the future
	nextTick: function() {
		this.tickTimeout = setTimeout("CoolClock.config.clockTracker['"+this.canvasId+"'].tick()",this.tickDelay);
	},

	// Check the canvas element hasn't been removed
	stillHere: function() {
		return document.getElementById(this.canvasId) != null;
	},

	// Stop this clock
	stop: function() {
		this.active = false;
		clearTimeout(this.tickTimeout);
	},

	// Start this clock
	start: function() {
		if (!this.active) {
			this.active = true;
			this.tick();
		}
	},

	// Main tick handler. Refresh the clock then setup the next tick
	tick: function() {
		if (this.stillHere() && this.active) {
			this.refreshDisplay()
			this.nextTick();
		}
	},

	getSkin: function() {
		var skin = CoolClock.config.skins[this.skinId];
		if (!skin) skin = CoolClock.config.skins[CoolClock.config.defaultSkin];
		return skin;
	}
};

// Find all canvas elements that have the CoolClock class and turns them into clocks
CoolClock.findAndCreateClocks = function() {
	// Let's not use a jQuery selector here so it's easier to use frameworks
	// other than jQuery.
	var canvases = document.getElementsByTagName("canvas");
	for (var i=0;i<canvases.length;i++) {
		// Pull out the fields from data attributes that begin data-coolclock.
		// Example data-coolclock="true" data-coolclock-skin="chunkySwissOnBlack"
		var data = canvases[i].dataset;
		if (data.hasOwnProperty('coolclock')) {
			// We know that this canvas must be a clock so remove from dataset.
			delete data.coolclock;

			// Loop through dataset and extract settings.
			var settings = {};
			var clockOpt;
			for (var key in data) {
				clockOpt = getClockOpt(key);
				if (clockOpt !== '') {
					settings[clockOpt] = data[key];
					// Determine particular values for some settings.
					if (clockOpt === 'showSecondHand') {
						settings.showSecondHand  = ! bool(settings.noSeconds);
					} else if (clockOpt === 'showNumbers') {
						settings.showNumbers     = bool(settings.showNumbers);
					} else if (clockOpt === 'showDigital') {
						settings.showDigital     = bool(settings.showDigital);
					} else if (clockOpt === 'showDigitalSecs') {
						settings.showDigitalSecs = bool(settings.showDigitalSecs);
					} else if (clockOpt === 'showDigitalAmPm') {
						settings.showDigitalAmPm = bool(settings.showDigitalAmPm);
					} else if (clockOpt === 'logClock') {
						settings.logClock        = bool(settings.logClock);
					} else if (clockOpt === 'logClockRev') {
						settings.logClockRev     = bool(settings.logClockRev);
					}
				}
			}

			// Set the canvasId to allow tracking.
			if (!canvases[i].id) {
				// If there's no id on this canvas element then give it one
				canvases[i].id = '_coolclock_auto_id_' + CoolClock.config.noIdCount++;
			}
			settings.canvasId = canvases[i].id;
			
			// Create a clock object for this element
			new CoolClock(settings);
		}
	}

	function getClockOpt(str) {
		var opt = '';

		// Create a way to match a DOM dataset property to a CoolClock config.
		// DOM datasets are the attribute name with 'data' and hyphens removed
		// then camelCased. This means 'data-coolclock-no-seconds' becomes
		// 'coolclockNoSeconds'. In order to match for all possible results of
		// dataset names, we need a map of config names from
		// CoolClock.prototype.init() in lowercase to their camelCased version.
		// This is the list of config names used in the init.
		var optNames = [
			'canvasId',
			'skinId',
			'font',
			'defaultStyle',
			'displayRadius',
			'renderRadius',
			'showSecondHand',
			'gmtOffset',
			'showNumbers',
			'showDigital',
			'showDigitalSecs',
			'showDigitalAmPm',
			'logClock',
			'logClockRev'
		];
		// A loop gives us a map like so:
		// {
		//     skinid: 'skinId',
		//     showdigitalampm: 'showDigitalAmPm'
		// }
		var optDataset = {};
		for (var i = 0; i < optNames.length; i++) {
			optDataset[optNames[i].toLowerCase()] = optNames[i];
		};

		// Match anything (not nothing) following coolclock.
		var isClockOpt = new RegExp(/^coolclock(.+)$/);
		var matches = str.match(isClockOpt);

		// If matches found, return coolclock or camelCase corrected option.
		if (matches !== null) {
			// Get the whole string that matched true.
			opt = matches[0];
			// If there is a submatch, use that instead. matches[1] is at least
			// an empty string, so check its length.
			if (matches[1].length > 0) {
				// Lowercase the opt and get the config name from optDataset.
				// Legacy config names can go in else ifs.
				opt = matches[1].toLowerCase();
				if (optDataset.hasOwnProperty(opt)) {
					opt = optDataset[opt];
				} else if (opt === 'skin') {
					opt = 'skinId';
				}
			}
		}
		return opt;
	}

	function bool(arg) {
		var isTrue = new RegExp(/^(true|1)$/i);
		return isTrue.test(arg);
	}
};

// If you don't have jQuery then you need a body onload like this: <body onload="CoolClock.findAndCreateClocks()">
// If you do have jQuery and it's loaded already then we can do it right now
if (window.jQuery) jQuery(document).ready(CoolClock.findAndCreateClocks);
