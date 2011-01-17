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

var circle = Math.PI * 2, west = circle / 2, south = west / 2, north = -south, east = 0;

var visitArc = function(rx, ry, rotation, large, clockwise, x, y, tX, tY, addCurve, addArc){
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

	// Circular Arc
	if (rx == ry && addArc){
		var bbsa = clockwise ? sa : ea, bbea = clockwise ? ea : sa;
		if (bbea < bbsa) bbea += circle;
		addArc(
			cx, cy, rx, sa, ea, !clockwise,
			// Bounds
			(bbea > west) ? (cx - rx) : (tX + x),
			(bbea > circle + east || (bbsa < east && bbea > east)) ? (cx + rx) : (tX + x),
			(bbea > circle + north || (bbsa < north && bbea > north)) ? (cy - ry) : (tY + y),
			(bbea > circle + south || (bbsa < south && bbea > south)) ? (cy + ry) : (tY + y)
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

		addCurve(
			cx + xx * cp1x + yx * cp1y, cy + xy * cp1x + yy * cp1y,
			cx + xx * cp2x + yx * cp2y, cy + xy * cp2x + yy * cp2y,
			cx + xx * x + yx * y, cy + xy * x + yy * y
		);
	}
};

var extrapolate = function(parts, precision){
	
	var boundsX = [], boundsY = [];
	
	var ux = (precision != null) ? function(x){
		boundsX.push(x); return Math.round(x * precision);
	} : function(x){
		boundsX.push(x); return x;
	}, uy = (precision != null) ? function(y){
		boundsY.push(y); return Math.round(y * precision);
	} : function(y){
		boundsY.push(y); return y;
	}, np = (precision != null) ? function(v){
		return Math.round(v * precision);
	} : function(v){
		return v;
	};

	var reflect = function(sx, sy, ex, ey){
		return [ex * 2 - sx, ey * 2 - sy];
	};
	
	var X = 0, Y = 0, px = 0, py = 0, r;
	
	var path = '', inX, inY;
	
	for (i = 0; i < parts.length; i++){
		var v = Array.slice(parts[i]), f = v.shift(), l = f.toLowerCase();
		var refX = l == f ? X : 0, refY = l == f ? Y : 0;
		
		if (l != 'm' && l != 'z' && inX == null){
			inX = X; inY = Y;
		}

		switch (l){
			
			case 'm':
				path += 'm' + ux(X = refX + v[0]) + ',' + uy(Y = refY + v[1]);
			break;
			
			case 'l':
				path += 'l' + ux(X = refX + v[0]) + ',' + uy(Y = refY + v[1]);
			break;
			
			case 'c':
				px = refX + v[2]; py = refY + v[3];
				path += 'c' + ux(refX + v[0]) + ',' + uy(refY + v[1]) + ',' + ux(px) + ',' + uy(py) + ',' + ux(X = refX + v[4]) + ',' + uy(Y = refY + v[5]);
			break;

			case 's':
				r = reflect(px, py, X, Y);
				px = refX + v[0]; py = refY + v[1];
				path += 'c' + ux(r[0]) + ',' + uy(r[1]) + ',' + ux(px) + ',' + uy(py) + ',' + ux(X = refX + v[2]) + ',' + uy(Y = refY + v[3]);
			break;
			
			case 'q':
				px = (refX + v[0]); py = (refY + v[1]);
				path += 'c' + ux((X + px * 2) / 3) + ',' + uy((Y + py * 2) / 3) + ',' + ux(((X = refX + v[2]) + px * 2) / 3) + ',' + uy(((Y = refY + v[3]) + py * 2) / 3) + ',' + ux(X) + ',' + uy(Y);
			break;
			
			case 't':
				r = reflect(px, py, X, Y);
				px = r[0]; py = r[1];
				path += 'c' + ux((X + px * 2) / 3) + ',' + uy((Y + py * 2) / 3) + ',' + ux(((X = refX + v[0]) + px * 2) / 3) + ',' + uy(((Y = refY + v[1]) + py * 2) / 3) + ',' + ux(X) + ',' + uy(Y);
			break;

			case 'a':
				px = refX + v[5]; py = refY + v[6];

				if (!v[0] || !v[1] || (px == X && py == Y)){
					path += 'l' + ux(X = px) + ',' + uy(Y = py);
					break;
				}
				
				visitArc(
					v[0], v[1], v[2], v[3], v[4], px, py, X, Y,
					function(p1x, p1y, p2x, p2y, tx, ty){
						path += 'c' + ux(p1x) + ',' + uy(p1y) + ',' + ux(px = p2x) + ',' + uy(py = p2y) + ',' + ux(X = tx) + ',' + uy(Y = ty);
					},
					function(cx, cy, r, sa, ea, ccw, bbl, bbr, bbt, bbb){
						ux(bbl); ux(bbr); uy(bbt); uy(bbb);
						path += (ccw ? 'at' : 'wa') + np(cx - r) + ',' + np(cy - r) + ',' + np(cx + r) + ',' + np(cy + r) + ',' + np(X) + ',' + np(Y) + ',' + np(X = px) + ',' + np(Y = py);
					}
				);
			break;

			case 'h':
				path += 'l' + ux(X = refX + v[0]) + ',' + uy(Y);
			break;
			
			case 'v':
				path += 'l' + ux(X) + ',' + uy(Y = refY + v[0]);
			break;
			
			case 'z':
				if (inX != null){
					path += 'xm' + ux(X = inX) + ',' + uy(Y = inY);
					inX = null;
				}
			break;
			
		}
		if (l != 's' && l != 'c' && l != 't' && l != 'q'){
			px = X; py = Y;
		}
	}
	
	if (!boundsX.length) return [path, {left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0}];
	
	var right = Math.max.apply(Math, boundsX),
		bottom = Math.max.apply(Math, boundsY),
		left = Math.min.apply(Math, boundsX),
		top = Math.min.apply(Math, boundsY),
		height = bottom - top,
		width = right - left;
	
	return [path, {left: left, top: top, right: right, bottom: bottom, width: width, height: height}];

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
			this.box = path.box;
			this.vml = path.vml;
			this.svg = path.svg;
		} else {
			this.path = (path == null) ? [] : parse(path);
			this.box = null;
			this.vml = null;
			this.svg = null;
		}

		return this;
	},
	
	push: function(){ //modifying the current path resets the memoized values.
		this.box = null;
		this.vml = null;
		this.svg = null;
		this.path.push(Array.slice(arguments));
		return this;
	},
	
	reset: function(){
		this.box = null;
		this.vml = null;
		this.svg = null;
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
	
	/* split each continuous line into individual paths */
	
	splitContinuous: function(){
		var parts = this.path, newPaths = [], path = new ART.Path();
		
		var X = 0, Y = 0, inX, inY;
		for (var i = 0, k = parts.length; i < k; i++){
			var v = parts[i], f = v[0], l = f.toLowerCase();
			
			if (l != 'm' && inX == null){ inX = X; inY = Y; }
			
			if (l != f){ X = 0; Y = 0; }
			
			if (l == 'm' || l == 'l' || l == 't'){ X += v[1]; Y += v[2]; }
			else if (l == 'c'){ X += v[5]; Y += v[6]; }
			else if (l == 's' || l == 'q'){ X += v[3]; Y += v[4]; }
			else if (l == 'a'){ X += v[6]; Y += v[7]; }
			else if (l == 'h'){ X += v[1]; }
			else if (l == 'v'){ Y += v[1]; }
			else if (l == 'z' && inX != null){
				X = inX; Y = inY;
				inX = null;
			}

			if (path.path.length > 0 && (l == 'm' || l == 'z')){
				newPaths.push(path);
				path = new ART.Path().push('M', X, Y);
			} else {
				path.path.push(v);
			}
		}

		newPaths.push(path);
		return newPaths;
	},
	
	/* transformation, measurement */
	
	toSVG: function(){
		if (this.svg == null){
			var path = '';
			for (var i = 0, l = this.path.length; i < l; i++) path += this.path[i].join(' ');
			this.svg = path;
		}
		return this.svg;
	},
	
	toVML: function(precision){
		if (this.vml == null){
			var data = extrapolate(this.path, precision);
			this.box = data[1];
			this.vml = data[0];
		}
		return this.vml;
	},
	
	measure: function(precision){
		if (this.box == null){
					
			if (this.path.length){
				var data = extrapolate(this.path, precision);
				this.box = data[1];
				this.vml = data[2];
			} else {
				this.box = {left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0};
				this.vml = '';
				this.svg = '';
			}
		
		}
		
		return this.box;
	}
	
});

ART.Path.prototype.toString = ART.Path.prototype.toSVG;

})();