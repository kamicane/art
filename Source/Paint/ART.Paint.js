/*
Script: ART.Paint.js

License:
	MIT-style license.
*/

// ART.Paint Class

ART.Paint = new Class({
	
	Extends: ART.getDefaultAdapter(),
	
	roundCapLeftTo: function(vector){
		return this.roundCapLeftBy({x: vector.x - this.now.x, y: vector.y - this.now.y});
	},
	
	roundCapRightTo: function(vector){
		return this.roundCapRightBy({x: vector.x - this.now.x, y: vector.y - this.now.y});
	},

	roundCapLeftBy: function(end){
		var kappa = {x: end.x * Math.kappa, y: end.y * Math.kappa};
		this.bezierBy({x: 0, y: kappa.y}, {x: end.x - kappa.x, y: end.y}, end);
		return this;
	},
	
	roundCapRightBy: function(end){
		var kappa = {x: end.x * Math.kappa, y: end.y * Math.kappa};
		this.bezierBy({x: kappa.x, y: 0}, {x: end.x, y: end.y - kappa.y}, end);
		return this;
	}
	
});
