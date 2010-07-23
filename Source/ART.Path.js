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

var parse = function(path){

	var parts = [], index = -1,
	    bits = path.match(/[a-df-z]|[\-+]?(?:[\d\.]e[\-+]?|[^\s\-+,a-z])+/ig);

	for (var i = 0, l = bits.length; i < l; i++){
		var bit = bits[i];
		if (bit.match(/^[a-z]/i)) parts[++index] = [bit];
		else parts[index].push(Number(bit));
	}
	
	return parts;

};

var circle = Math.PI * 2, north = circle / 2, west = north / 2, east = -west, south = 0;

var calculateArc = function(rx, ry, rotation, large, clockwise, x, y, tX, tY){
	var cx = x / 2, cy = y / 2,
		rxry = rx * rx * ry * ry, rycx = ry * ry * cx * cx, rxcy = rx * rx * cy * cy,
		a = rxry - rxcy - rycx;

	if (a < 0){
		a = Math.sqrt(1 - a / rxry);
		rx *= a; ry *= a;
	} else {
		a = Math.sqrt(a / (rxcy + rycx));
		if (large == clockwise) a = -a;
		cx += -a * y / 2 * rx / ry;
		cy +=  a * x / 2 * ry / rx;
	}

	var sa = Math.atan2(cx, -cy), ea = Math.atan2(-x + cx, y - cy);
	if (!+clockwise){ var t = sa; sa = ea; ea = t; }
	if (ea < sa) ea += circle;

	cx += tX; cy += tY;

	return {
		circle: [cx - rx, cy - ry, cx + rx, cy + ry],
		boundsX: [
			ea > circle + west || (sa < west && ea > west) ? cx - rx : tX,
			ea > circle + east || (sa < east && ea > east) ? cx + rx : tX
		],
		boundsY: [
			ea > north ? cy - ry : tY,
			ea > circle + south || (sa < south && ea > south) ? cy + ry : tY
		]
	};
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
		
		if (l != 'm' && inX == null){
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
				px = refX + v[0]; py = refY + v[1];
				path += 'c' + ux(refX + v[0]) + ',' + uy(refY + v[1]) + ',' + ux(px) + ',' + uy(py) + ',' + ux(X = refX + v[2]) + ',' + uy(Y = refY + v[3]);
			break;
			
			case 't':
				r = reflect(px, py, X, Y);
				px = refX + r[0]; py = refY + r[1];
				path += 'c' + ux(px) + ',' + uy(py) + ',' + ux(px) + ',' + uy(py) + ',' + ux(X = refX + v[0]) + ',' + uy(Y = refY + v[1]);
			break;

			case 'a':
				px = refX + v[5]; py = refY + v[6];

				if (!+v[0] || !+v[1] || (px == X && py == Y)){
					path += 'l' + ux(X = px) + ',' + uy(Y = py);
					break;
				}
				
				v[7] = X; v[8] = Y;
				r = calculateArc.apply(null, v);

				boundsX.push.apply(boundsX, r.boundsX);
				boundsY.push.apply(boundsY, r.boundsY);

				path += (v[4] == 1 ? 'wa' : 'at') + r.circle.map(np) + ',' + ux(X) + ',' + uy(Y) + ',' + ux(X = px) + ',' + uy(Y = py);
			break;

			case 'h':
				path += 'l' + ux(X = refX + v[0]) + ',' + uy(Y);
			break;
			
			case 'v':
				path += 'l' + ux(X) + ',' + uy(Y = refY + v[0]);
			break;
			
			case 'z':
				path += 'x';
				if (inX != null){
					path += 'm' + ux(X = inX) + ',' + uy(Y = inY);
					inX = null;
				}
			break;
			
		}
	}
	
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
		for (i = 0; i < parts.length; i++){
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
