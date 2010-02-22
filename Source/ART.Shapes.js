/*
---

name: ART.Shapes

description: Shapes for ART

authors: [Valerio Proietti](http://mad4milk.net)

provides: [ART.Shapes, ART.Rectangle, ART.Pill, ART.Ellipse]

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

			path.move(0, tl);

			if (width < 0) path.move(width, 0);
			if (height < 0) path.move(0, height);

			if (tl > 0) path.arcLeft(tl, -tl);
			path.line(Math.abs(width) - (tr + tl), 0);

			if (tr > 0) path.arcRight(tr, tr);
			path.line(0, Math.abs(height) - (tr + br));

			if (br > 0) path.arcLeft(-br, br);
			path.line(- Math.abs(width) + (br + bl), 0);

			if (bl > 0) path.arcRight(-bl, -bl);
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
		path.move(0, ry).arcLeft(rx, -ry).arcRight(rx, ry).arcLeft(-rx, ry).arcRight(-rx, -ry);
		return this.parent(path);
	}

});
