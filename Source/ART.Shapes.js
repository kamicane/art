/*
---
name: ART.Shapes
description: "Shapes for ART"
authors: ["[Valerio Proietti](http://mad4milk.net)", "[Sebastian Markbåge](http://calyptus.eu/)"]
provides: [ART.Shapes, ART.Rectangle, ART.Pill, ART.Ellipse, ART.Wedge]
requires: [ART.Path, ART.Shape]
...
*/

ART.Rectangle = new Class({

	Extends: ART.Shape,
	
	initialize: function(width, height, radius){
		this.parent();
		if (width != null && height != null) this.draw(width, height, radius);
	},
	
	draw: function(width, height, radius){

		var path = new ART.Path;

		if (!radius){

			path.move(0, 0).line(width, 0).line(0, height).line(-width, 0).line(0, -height);

		} else {

			if (typeof radius == 'number') radius = [radius, radius, radius, radius];

			var tl = radius[0], tr = radius[1], br = radius[2], bl = radius[3];

			if (tl < 0) tl = 0;
			if (tr < 0) tr = 0;
			if (bl < 0) bl = 0;
			if (br < 0) br = 0;

			path.move(0, tl);

			if (width < 0) path.move(width, 0);
			if (height < 0) path.move(0, height);

			if (tl > 0) path.arc(tl, -tl);
			path.line(Math.abs(width) - (tr + tl), 0);

			if (tr > 0) path.arc(tr, tr);
			path.line(0, Math.abs(height) - (tr + br));

			if (br > 0) path.arc(-br, br);
			path.line(- Math.abs(width) + (br + bl), 0);

			if (bl > 0) path.arc(-bl, -bl);
			path.line(0, - Math.abs(height) + (bl + tl));
		}

		return this.parent(path);
	}

});

ART.Pill = new Class({
	
	Extends: ART.Rectangle,
	
	draw: function(width, height){
		return this.parent(width, height, ((width < height) ? width : height) / 2);
	}
	
});

ART.Ellipse = new Class({
	
	Extends: ART.Shape,
	
	initialize: function(width, height){
		this.parent();
		if (width != null && height != null) this.draw(width, height);
	},
	
	draw: function(width, height){
		var path = new ART.Path;
		var rx = width / 2, ry = height / 2;
		path.move(0, ry).arc(width, 0, rx, ry).arc(-width, 0, rx, ry);
		return this.parent(path);
	}

});

ART.Wedge = new Class({

	Extends: ART.Shape,

	initialize: function(innerRadius, outerRadius, startAngle, endAngle){
		this.parent();
		if (innerRadius != null || outerRadius != null) this.draw(innerRadius, outerRadius, startAngle, endAngle);
	},

	draw: function(innerRadius, outerRadius, startAngle, endAngle){
		var path = new ART.Path;

		var circle = Math.PI * 2,
			radiansPerDegree = Math.PI / 180,
			sa = startAngle * radiansPerDegree % circle || 0,
			ea = endAngle * radiansPerDegree % circle || 0,
			ir = Math.min(innerRadius || 0, outerRadius || 0),
			or = Math.max(innerRadius || 0, outerRadius || 0),
			a = sa > ea ? circle - sa + ea : ea - sa;

		if (a >= circle){

			path.move(0, or).arc(or * 2, 0, or).arc(-or * 2, 0, or);
			if (ir) path.move(or - ir, 0).counterArc(ir * 2, 0, ir).counterArc(-ir * 2, 0, ir);

		} else {

			var ss = Math.sin(sa), es = Math.sin(ea),
				sc = Math.cos(sa), ec = Math.cos(ea),
				ds = es - ss, dc = ec - sc, dr = ir - or,
				large = a > Math.PI;

			path.move(or + or * ss, or - or * sc).arc(or * ds, or * -dc, or, or, large).line(dr * es, dr * -ec);
			if (ir) path.counterArc(ir * -ds, ir * dc, ir, ir, large);

		}

		path.close();
		return this.parent(path);
	}

});
