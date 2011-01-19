/*
---
name: ART.Path
description: "Class to generate a valid SVG path using method calls."
authors: ["[Valerio Proietti](http://mad4milk.net)", "[Sebastian Markbåge](http://calyptus.eu/)"]
provides: ART.Path
requires: ART
...
*/

(function(){

/* private functions */

var parameterCount = {
	l: 2, z: 0,
	h: 1, v: 1,
	c: 6, s: 4,
	q: 4, t: 2,
	a: 7
};

var parse = function(path){

	if (!path) return [];

	var parts = [], index = -1,
	    bits = path.match(/[a-df-z]|[\-+]?(?:[\d\.]e[\-+]?|[^\s\-+,a-z])+/ig),
	    command, part, paramCount = 0;

	for (var i = 0, l = bits.length; i < l; i++){
		var bit = bits[i];
		if (bit.match(/^[a-z]/i)){
			command = bit;
			parts[++index] = part = [command];
			if (command == 'm') command = 'l';
			else if (command == 'M') command = 'L';
			paramCount = parameterCount[command.toLowerCase()];
		} else {
			if (part.length > paramCount) parts[++index] = part = [command];
			part.push(Number(bit));
		}
	}
	
	return parts;

};

var circle = Math.PI * 2;

var visitArc = function(rx, ry, rotation, large, clockwise, x, y, tX, tY, curveTo, arcTo){
	var rad = rotation * Math.PI / 180, cos = Math.cos(rad), sin = Math.sin(rad);
	x -= tX; y -= tY;
	
	// Ellipse Center
	var cx = cos * x / 2 + sin * y / 2,
		cy = -sin * x / 2 + cos * y / 2,
		rxry = rx * rx * ry * ry,
		rycx = ry * ry * cx * cx,
		rxcy = rx * rx * cy * cy,
		a = rxry - rxcy - rycx;

	if (a < 0){
		a = Math.sqrt(1 - a / rxry);
		rx *= a; ry *= a;
		cx = x / 2; cy = y / 2;
	} else {
		a = Math.sqrt(a / (rxcy + rycx));
		if (large == clockwise) a = -a;
		var cxd = -a * cy * rx / ry,
		    cyd =  a * cx * ry / rx;
		cx = cos * cxd - sin * cyd + x / 2;
		cy = sin * cxd + cos * cyd + y / 2;
	}

	// Rotation + Scale Transform
	var xx =  cos / rx, yx = sin / rx,
	    xy = -sin / ry, yy = cos / ry;

	// Start and End Angle
	var sa = Math.atan2(xy * -cx + yy * -cy, xx * -cx + yx * -cy),
	    ea = Math.atan2(xy * (x - cx) + yy * (y - cy), xx * (x - cx) + yx * (y - cy));

	cx += tX; cy += tY;
	x += tX; y += tY;

	// Circular Arc
	if (rx == ry && arcTo){
		arcTo(
			tX, tY, x, y,
			cx, cy, rx, sa, ea, !clockwise
		);
		return;
	}

	// Inverse Rotation + Scale Transform
	xx = cos * rx; yx = -sin * ry;
	xy = sin * rx; yy =  cos * ry;

	// Bezier Curve Approximation
	var arc = ea - sa;
	if (arc < 0 && clockwise) arc += circle;
	else if (arc > 0 && !clockwise) arc -= circle;

	var n = Math.ceil(Math.abs(arc / (circle / 4))),
	    step = arc / n,
	    k = (4 / 3) * Math.tan(step / 4),
	    a = sa;

	x = Math.cos(a); y = Math.sin(a);

	for (var i = 0; i < n; i++){
		var cp1x = x - k * y, cp1y = y + k * x;

		a += step;
		x = Math.cos(a); y = Math.sin(a);

		var cp2x = x + k * y, cp2y = y - k * x;

		curveTo(
			tX, tY,
			cx + xx * cp1x + yx * cp1y, cy + xy * cp1x + yy * cp1y,
			cx + xx * cp2x + yx * cp2y, cy + xy * cp2x + yy * cp2y,
			(tX = (cx + xx * x + yx * y)), (tY = (cy + xy * x + yy * y))
		);
	}
};

/* Measure Bounds */

var left, right, top, bottom;

function lineBounds(sx, sy, x, y){
	left   = Math.min(left,   sx, x);
	right  = Math.max(right,  sx, x);
	top    = Math.min(top,    sy, y);
	bottom = Math.max(bottom, sy, y);
};

function curveBounds(sx, sy, p1x, p1y, p2x, p2y, x, y){
	left   = Math.min(left,   sx, p1x, p2x, x);
	right  = Math.max(right,  sx, p1x, p2x, x);
	top    = Math.min(top,    sy, p1y, p2y, y);
	bottom = Math.max(bottom, sy, p1y, p2y, y);
};

var west = circle / 2, south = west / 2, north = -south, east = 0;

function arcBounds(sx, sy, ex, ey, cx, cy, r, sa, ea, ccw){
	var bbsa = ccw ? ea : sa, bbea = ccw ? sa : ea;
	if (bbea < bbsa) bbea += circle;

	// Bounds
	var bbl = (bbea > west) ? (cx - r) : (ex),
	    bbr = (bbea > circle + east || (bbsa < east && bbea > east)) ? (cx + r) : (ex),
	    bbt = (bbea > circle + north || (bbsa < north && bbea > north)) ? (cy - r) : (ey),
	    bbb = (bbea > circle + south || (bbsa < south && bbea > south)) ? (cy + r) : (ey);

	left   = Math.min(left,   sx, bbl, bbr);
	right  = Math.max(right,  sx, bbl, bbr);
	top    = Math.min(top,    sy, bbt, bbb);
	bottom = Math.max(bottom, sy, bbt, bbb);
};

/* Utility command factories */

var point = function(c){
	return function(x, y){
		return this.push(c, x, y);
	};
};

var arc = function(c, cc){
	return function(x, y, rx, ry, outer){
		return this.push(c, Math.abs(rx || x), Math.abs(ry || rx || y), 0, outer ? 1 : 0, cc, x, y);
	};
};

var curve = function(t, q, c){
	return function(c1x, c1y, c2x, c2y, ex, ey){
		var args = Array.slice(arguments), l = args.length;
		args.unshift(l < 4 ? t : l < 6 ? q : c);
		return this.push.apply(this, args);
	};
};

/* Path Class */

ART.Path = new Class({
	
	initialize: function(path){
		if (path instanceof ART.Path){ //already a path, copying
			this.path = Array.slice(path.path);
			this.cache = path.cache;
		} else {
			this.path = (path == null) ? [] : parse(path);
			this.cache = {};
		}
	},
	
	push: function(){ //modifying the current path resets the memoized values.
		this.cache = {};
		this.path.push(Array.slice(arguments));
		return this;
	},
	
	reset: function(){
		this.cache = {};
		this.path = [];
		return this;
	},
	
	/*utility*/
	
	move: point('m'),
	moveTo: point('M'),
	
	line: point('l'),
	lineTo: point('L'),
	
	curve: curve('t', 'q', 'c'),
	curveTo: curve('T', 'Q', 'C'),
	
	arc: arc('a', 1),
	arcTo: arc('A', 1),
	
	counterArc: arc('a', 0),
	counterArcTo: arc('A', 0),
	
	close: function(){
		return this.push('z');
	},
	
	/* visitor */

	visit: function(lineTo, curveTo, arcTo, moveTo, close){
		var reflect = function(sx, sy, ex, ey){
			return [ex * 2 - sx, ey * 2 - sy];
		};
		
		var X = 0, Y = 0, px = 0, py = 0, r, inX, inY;
		
		var parts = this.path;
		
		for (i = 0; i < parts.length; i++){
			var v = Array.slice(parts[i]), f = v.shift(), l = f.toLowerCase();
			var refX = l == f ? X : 0, refY = l == f ? Y : 0;
			
			if (l != 'm' && l != 'z' && inX == null){
				inX = X; inY = Y;
			}

			switch (l){
				
				case 'm':
					if (moveTo) moveTo(X, Y, X = refX + v[0], Y = refY + v[1]);
					else { X = refX + v[0]; Y = refY + v[1]; }
				break;
				
				case 'l':
					lineTo(X, Y, X = refX + v[0], Y = refY + v[1]);
				break;
				
				case 'c':
					px = refX + v[2]; py = refY + v[3];
					curveTo(X, Y, refX + v[0], refY + v[1], px, py, X = refX + v[4], Y = refY + v[5]);
				break;

				case 's':
					r = reflect(px, py, X, Y);
					px = refX + v[0]; py = refY + v[1];
					curveTo(X, Y, r[0], r[1], px, py, X = refX + v[2], Y = refY + v[3]);
				break;
				
				case 'q':
					px = (refX + v[0]); py = (refY + v[1]);
					curveTo(X, Y, (X + px * 2) / 3, (Y + py * 2) / 3, ((X = refX + v[2]) + px * 2) / 3, ((Y = refY + v[3]) + py * 2) / 3, X, Y);
				break;
				
				case 't':
					r = reflect(px, py, X, Y);
					px = r[0]; py = r[1];
					curveTo(X, Y, (X + px * 2) / 3, (Y + py * 2) / 3, ((X = refX + v[0]) + px * 2) / 3, ((Y = refY + v[1]) + py * 2) / 3, X, Y);
				break;

				case 'a':
					px = refX + v[5]; py = refY + v[6];
					if (!v[0] || !v[1] || (px == X && py == Y)) lineTo(X, Y, px, py);
					else visitArc(v[0], v[1], v[2], v[3], v[4], px, py, X, Y, curveTo, arcTo);
					X = px; Y = py;
				break;

				case 'h':
					lineTo(X, Y, X = refX + v[0], Y);
				break;
				
				case 'v':
					lineTo(X, Y, X, Y = refY + v[0]);
				break;
				
				case 'z':
					if (inX != null){
						if (close){
							close();
							if (moveTo) moveTo(X, Y, X = inX, Y = inY);
							else { X = inX; Y = inY; }
						} else {
							lineTo(X, Y, X = inX, Y = inY);
						}
						inX = null;
					}
				break;
				
			}
			if (l != 's' && l != 'c' && l != 't' && l != 'q'){
				px = X; py = Y;
			}
		}
	},
	
	/* transformation, measurement */
	
	toSVG: function(){
		if (this.cache.svg == null){
			var path = '';
			for (var i = 0, l = this.path.length; i < l; i++) path += this.path[i].join(' ');
			this.cache.svg = path;
		}
		return this.cache.svg;
	},
	
	measure: function(){
		if (this.cache.box == null){
			left = top = Infinity;
			right = bottom = -Infinity;
			this.visit(lineBounds, curveBounds, arcBounds);
			if (left == Infinity)
				this.cache.box = {left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0};
			else
				this.cache.box = {left: left, top: top, right: right, bottom: bottom, width: right - left, height: bottom - top };
		}
		return this.cache.box;
	}
	
});

ART.Path.prototype.toString = ART.Path.prototype.toSVG;

})();