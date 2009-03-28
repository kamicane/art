// art.shapes.js

// More shapes

ART.Paint.defineShapes({

	rectangle: function(end){
		this.line({x: end.x, y: 0}).line({x: 0, y: end.y}).line({x: -end.x, y: 0}).line({x: 0, y: -end.y});
		this.lift({x: end.x, y: end.y});
	},
	
	roundCapLeft: function(end){
		var kappa = {x: end.x * Math.kappa, y: end.y * Math.kappa};
		this.bezier({x: 0, y: kappa.y}, {x: end.x - kappa.x, y: end.y}, end);
	},
	
	roundCapRight: function(end){
		var kappa = {x: end.x * Math.kappa, y: end.y * Math.kappa};
		this.bezier({x: kappa.x, y: 0}, {x: end.x, y: end.y - kappa.y}, end);
	},
	
	ellipse: function(end){
		var radius = {x: end.x / 2, y: end.y / 2};
		this.lift({x: 0, y: radius.y});
		this.roundCapLeft({x: radius.x, y: -radius.y}).roundCapRight({x: radius.x, y: radius.y});
		this.roundCapLeft({x: -radius.x, y: radius.y}).roundCapRight({x: -radius.x, y: -radius.y});
		this.lift({x: end.x, y: - radius.y + end.y});
	},
	
	roundedRectangle: function(end, radius){
		if (radius == null) radius = [5, 5, 5, 5];
		if (typeof radius == 'number') radius = [radius, radius, radius, radius];
		
		var tl = radius[0], tr = radius[1], br = radius[2], bl = radius[3];
		
		this.lift({x: 0, y: tl});
		
		if (end.x < 0) this.lift({x: end.x, y: 0});
		if (end.y < 0) this.lift({x: 0, y: end.y});
		
		if (tl > 0) this.roundCapLeft({x: tl, y: -tl});
		this.line({x: Math.abs(end.x) - (tr + tl), y: 0});
		
		if (tr > 0) this.roundCapRight({x: tr, y: tr});
		this.line({x: 0, y: Math.abs(end.y) - (tr + br)});
		
		if (br > 0) this.roundCapLeft({x: -br, y: br});
		this.line({x: - Math.abs(end.x) + (br + bl), y: 0});
		
		if (bl > 0) this.roundCapRight({x: -bl, y: -bl});
		this.line({x: 0, y: - Math.abs(end.y) + (bl + tl)});
		
		this.lift({x: end.x, y: -tl + end.y});
	}
	
});

// And some extra glyphs

ART.Paint.defineShape('horizontal-pill', function(size){
	var r = (size.y / 2);
	this.roundedRectangle({x: size.x, y: size.y}, [r, r, r, r]);
});

ART.Paint.defineShape('vertical-pill', function(size){
	var r = (size.x / 2);
	this.roundedRectangle({x: size.x, y: size.y}, [r, r, r, r]);
});

ART.Paint.defineShape('plus-icon', function(size){
	this.lift({x: 0, y: (size.y / 2)});
	this.line({x: size.x, y: 0});
	this.lift({x: -(size.x / 2), y: -(size.y / 2)});
	this.line({x: 0, y: size.y});
	this.lift({x: (size.x / 2), y: 0});
});

ART.Paint.defineShape('resize-icon', function(size){
	this.lift({x: size.x, y: 0});
	this.line({x: -size.x, y: size.y});
	this.lift({x: size.x, y: 0});
});

ART.Paint.defineShape('minus-icon', function(size){
	this.lift({x: 0, y: (size.y / 2)});
	this.line({x: size.x, y: 0});
	this.lift({x: 0, y: (size.y / 2)});
});

ART.Paint.defineShape('search-icon', function(size){
	ratio = 0.8;
	var max = ratio, min = 1 - ratio;
	this.ellipse({x: size.x * max, y: size.y * max});
	var lift = {x: -(size.x * min) / 2, y: -(size.y * min) / 2};
	this.lift(lift);
	this.line({x: (size.x * min) - lift.x, y: (size.y * min) - lift.y});
});

ART.Paint.defineShape('close-icon', function(size){
	this.lift({x: size.x, y: 0});
	this.line({x: -size.x, y: size.y});
	this.lift({x: 0, y: -size.y});
	this.line({x: size.x, y: size.y});
});
