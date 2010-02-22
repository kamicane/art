/*
---

name: ART.Path

description: Class to generate a valid SVG path using method calls.

authors: [Valerio Proietti](http://mad4milk.net)

provides: ART.Path

requires: ART

...
*/

ART.Path = new Class({
	
	initialize: function(){
		this.clear();
	},
	
	clear: function(){
		this.path = [];
		this.x = 0;
		this.y = 0;
		return this;
	},
	
	move: function(x, y){
		this.path.push('m', x, y);
		return this;
	},
	
	line: function(x, y){
		this.x = x; this.y = y;
		this.path.push('l', x, y);
		return this;
	},
	
	close: function(){
		this.path.push('z');
		return this;
	},
	
	bezier: function(c1x, c1y, c2x, c2y, ex, ey){
		this.path.push('c', c1x, c1y, c2x, c2y, ex, ey);
		return this;
	},
	
	arcLeft: function(x, y){
		return this.bezier(0, y * Math.kappa, x - (x * Math.kappa), y, x, y);
	},
	
	arcRight: function(x, y){
		return this.bezier(x * Math.kappa, 0, x, y - (y * Math.kappa), x, y);
	}
	
});

ART.Path.prototype.toString = function(){
	return this.path.join(' ');
};
