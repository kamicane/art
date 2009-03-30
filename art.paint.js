// art.paint.js

// ART.Paint Class

ART.Paint = new Class({
	
	Extends: ART.Adapter.Canvas,
	
	shape: function(shape){
		var args = Array.slice(arguments, 1);
		if (typeof shape == 'string') shape = ART.Paint.lookupShape(shape.camelCase());
		if (!shape) return this;
		this.save();
		shape.apply(this, args);
		return this.restore();
	}
	
});

(function(){
	
	var shapes = {};

	ART.Paint.defineShape = function(name, shape){
		shapes[name.camelCase()] = shape;
		return this;
	};
	
	ART.Paint.defineShapes = function(shapes){
		for (var shape in shapes) this.defineShape(shape, shapes[shape]);
		return this;
	};

	ART.Paint.lookupShape = function(name){
		return shapes[name.camelCase()];
	};
	
})();

// kappa!

Math.kappa = (4 * (Math.sqrt(2) - 1) / 3);

// default paths

ART.Paint.implement({
	
	roundCapLeftTo: function(vector){
		vector = this.vector(vector);
		return this.roundCapLeftBy({x: vector.x - this.now.x, y: vector.y - this.now.y});
	},
	
	roundCapRightTo: function(vector){
		vector = this.vector(vector);
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

// default shapes

ART.Paint.defineShapes({

	rectangle: function(end){
		this.lineBy({x: end.x, y: 0}).lineBy({x: 0, y: end.y}).lineBy({x: -end.x, y: 0}).lineBy({x: 0, y: -end.y});
	},
	
	roundCapLeft: function(end){
		var kappa = {x: end.x * Math.kappa, y: end.y * Math.kappa};
		this.bezierBy({x: 0, y: kappa.y}, {x: end.x - kappa.x, y: end.y}, end);
	},
	
	roundCapRight: function(end){
		var kappa = {x: end.x * Math.kappa, y: end.y * Math.kappa};
		this.bezierBy({x: kappa.x, y: 0}, {x: end.x, y: end.y - kappa.y}, end);
	},
	
	ellipse: function(end){
		var radius = {x: end.x / 2, y: end.y / 2};
		this.moveBy({x: 0, y: radius.y});
		this.roundCapLeftBy({x: radius.x, y: -radius.y}).roundCapRightBy({x: radius.x, y: radius.y});
		this.roundCapLeftBy({x: -radius.x, y: radius.y}).roundCapRightBy({x: -radius.x, y: -radius.y});
		this.moveBy({x: end.x, y: - radius.y + end.y});
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
		
		this.moveBy({x: end.x, y: -tl + end.y});
	}
	
});

// And some extra glyphs

ART.Paint.defineShape('horizontal-pill', function(size){
	var r = (size.y / 2);
	this.shape('rounded-rectangle', {x: size.x, y: size.y}, r);
});

ART.Paint.defineShape('vertical-pill', function(size){
	var r = (size.x / 2);
	this.shape('rounded-rectangle', {x: size.x, y: size.y}, r);
});

ART.Paint.defineShape('plus-icon', function(size){
	this.moveBy({x: 0, y: (size.y / 2)});
	this.lineBy({x: size.x, y: 0});
	this.moveBy({x: -(size.x / 2), y: -(size.y / 2)});
	this.lineBy({x: 0, y: size.y});
});

ART.Paint.defineShape('resize-icon', function(size){
	this.moveBy({x: size.x, y: 0});
	this.lineBy({x: -size.x, y: size.y});
});

ART.Paint.defineShape('minus-icon', function(size){
	this.moveBy({x: 0, y: (size.y / 2)});
	this.lineBy({x: size.x, y: 0});
});

ART.Paint.defineShape('search-icon', function(size){
	ratio = 0.8;
	var max = ratio, min = 1 - ratio;
	this.shape('ellipse', {x: size.x * max, y: size.y * max});
	var lift = {x: -(size.x * min) / 2, y: -(size.y * min) / 2};
	this.moveBy(lift);
	this.lineBy({x: (size.x * min) - lift.x, y: (size.y * min) - lift.y});
});

ART.Paint.defineShape('close-icon', function(size){
	this.moveBy({x: size.x, y: 0});
	this.lineBy({x: -size.x, y: size.y});
	this.moveBy({x: 0, y: -size.y});
	this.lineBy({x: size.x, y: size.y});
});
