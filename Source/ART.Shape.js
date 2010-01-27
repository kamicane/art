/*
---

name: ART.Shape

description: Shapes for ART

authors: [Valerio Proietti](http://mad4milk.net) && [MooTools development team](http://mootools.net/developers)

provides: [ART.Shape, ART:shape]

requires: ART

...
*/

// stub

ART.Shape = function(shape){
	return shape;
};

// connect to ART

(function(){

var shapes = {};

ART.defineShape = function(name, shape){
	shapes[name.camelCase()] = new ART.Shape(shape);
	return this;
};

ART.defineShapes = function(nShapes){
	for (var shape in nShapes) shapes[shape] = nShapes[shape];
	return this;
};

ART.lookupShape = function(name){
	return shapes[name.camelCase()];
};

})();

ART.implement({

	shape: function(shape){
		var args = Array.slice(arguments, 1);
		if (typeof shape == 'string') shape = ART.lookupShape(shape.camelCase());
		if (!shape) return this;
		this.save();
		shape.apply(this, args);
		return this.restore();
	},
	
	/* some round caps to make things easier */
	
	roundCapLeftTo: function(vector){
		return this.roundCapLeftBy({x: vector.x - this.pointer.x, y: vector.y - this.pointer.y});
	},
	
	roundCapRightTo: function(vector){
		return this.roundCapRightBy({x: vector.x - this.pointer.x, y: vector.y - this.pointer.y});
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

// default shapes

ART.defineShapes({

	rectangle: function(end){
		this.lineBy({x: end.x, y: 0}).lineBy({x: 0, y: end.y}).lineBy({x: -end.x, y: 0}).lineBy({x: 0, y: -end.y});
	},
	
	ellipse: function(end){
		var radius = {x: end.x / 2, y: end.y / 2};
		this.moveBy({x: 0, y: radius.y});
		this.roundCapLeftBy({x: radius.x, y: -radius.y}).roundCapRightBy({x: radius.x, y: radius.y});
		this.roundCapLeftBy({x: -radius.x, y: radius.y}).roundCapRightBy({x: -radius.x, y: -radius.y});
	},
	
	roundedRectangle: function(end, radius){
		if (radius == null) radius = [5, 5, 5, 5];
		if (typeof radius == 'number') radius = [radius, radius, radius, radius];
		
		var tl = radius[0], tr = radius[1], br = radius[2], bl = radius[3];
		
		this.moveBy({x: 0, y: tl});
		
		if (end.x < 0) this.moveBy({x: end.x, y: 0});
		if (end.y < 0) this.moveBy({x: 0, y: end.y});
		
		if (tl > 0) this.roundCapLeftBy({x: tl, y: -tl});
		this.lineBy({x: Math.abs(end.x) - (tr + tl), y: 0});
		
		if (tr > 0) this.roundCapRightBy({x: tr, y: tr});
		this.lineBy({x: 0, y: Math.abs(end.y) - (tr + br)});
		
		if (br > 0) this.roundCapLeftBy({x: -br, y: br});
		this.lineBy({x: - Math.abs(end.x) + (br + bl), y: 0});
		
		if (bl > 0) this.roundCapRightBy({x: -bl, y: -bl});
		this.lineBy({x: 0, y: - Math.abs(end.y) + (bl + tl)});
	},
	
	pill: function(size){
		this.shape('rounded-rectangle', {x: size.x, y: size.y}, size[(size.x < size.y) ? 'x' : 'y'] / 2);
	}
	
});
