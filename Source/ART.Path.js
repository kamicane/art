/*
---

name: ART.Path

description: Class to generate a valid SVG path using method calls.

authors: [Valerio Proietti](http://mad4milk.net)

provides: ART.Path

requires: ART

...
*/

(function(){

/* private functions */

var parse = function(path){

	path = path.replace(/\s*([A-Za-z,-])\s*/ig, function(f, m, i){
		switch (m){
			case '-': return ' ' + m;
			case ',': return ' ';
			default: return (i == 0) ? m + ' ' : ' ' + m + ' ';
		}
	});

	var parts = [], index = -1, bits = path.split(/\s+/);

	for (var i = 0, l = bits.length; i < l; i++){
		var bit = bits[i];
		if (bit.match(/[A-Za-z]/i)) parts[++index] = [bit];
		else parts[index].push(Number(bit));
	}
	
	return parts;

};

var east = Math.PI / 4, south = east * 2, west = south + east, circle = south * 2;

var calculateArc = function(rx, ry, rotation, large, clockwise, x, y, tX, tY){
	var xp = -x / 2, yp = -y / 2,
		rxry = rx * rx * ry * ry, ryxp = ry * ry * xp * xp, rxyp = rx * rx * yp * yp,
		a = rxry - rxyp - ryxp;

	if (a < 0){
		a = Math.sqrt(1 - a / rxry);
		rx *= a; ry *= a;
		a = 0;
	} else {
		a = Math.sqrt(a / (rxyp + ryxp));
		if (large == clockwise) a = -a;
	}

	var cx = a * rx * yp / ry - xp,
		cy = -a * ry * xp / rx - yp,

		sa = Math.atan2(Math.sqrt(cx * cx + cy * cy) - cy, -cx),
		ea = Math.atan2(Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy)) + y - cy, x - cx);

	if (!+clockwise){ var t = sa; sa = ea; ea = t; }
	if (ea < sa){ ea += circle; }
	
	return {
		circle: [cx - rx + tX, cy - ry + tY, cx + rx + tX, cy + ry + tY],
		boundsX: [
			ea > circle + west || (sa < west && ea > west) ? cx - rx + tX : tX,
			ea > circle + east || (sa < east && ea > east) ? cx + rx + tX : tX
		],
		boundsY: [
			ea > circle ? cy - ry + tY : tY,
			ea > circle + south || (sa < south && ea > south) ? cy + ry + tY : tY
		]
	};
};

var measureAndTransform = function(parts, precision){
	
	var boundsX = [], boundsY = [];
	
	var ux = function(x){
		boundsX.push(x);
		return (precision) ? Math.round(x * precision) : x;
	}, uy = function(y){
		boundsY.push(y);
		return (precision) ? Math.round(y * precision) : y;
	}, np = function(v){
		return (precision) ? Math.round(v * precision) : v;
	};

	var reflect = function(sx, sy, ex, ey){
		return [ex * 2 - sx, ey * 2 - sy];
	};
	
	var X = 0, Y = 0, px = 0, py = 0, r;
	
	var path = '';
	
	for (i = 0; i < parts.length; i++){
		var v = Array.slice(parts[i]), f = v.shift(), l = f.toLowerCase();
		var refX = l == f ? X : 0, refY = l == f ? Y : 0;
		
		switch (l){
			
			case 'm':
				path += 'm' + ux(X = refX + v[0]) + ',' + uy(Y = refY + v[1]);
			break;
			
			case 'l':
				path += 'l' + ux(X = refX + v[0]) + ',' + uy(Y = refY + v[1]);
			break;
			
			case 'c':
				px = refX + v[2]; py = refY + v[3];
				path += 'c' + ux(X + v[0]) + ',' + uy(Y + v[1]) + ',' + ux(px) + ',' + uy(py) + ',' + ux(X = refX + v[4]) + ',' + uy(Y = refY + v[5]);
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
					path += 'l' + ux(X = px) + ',' + uy(X = py);
					break;
				}
				
				v.push(X, Y);
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

/* Path Class */

ART.Path = new Class({
	
	initialize: function(path){
		this.boundingBox = null;
		if (path == null) this.path = [];  //no path
		else if (path.path) this.path = Array.slice(path.path); //already a path
		else this.path = parse(path); //string path
	},
	
	push: function(){
		this.boundingBox = null;
		this.path.push(Array.slice(arguments));
		return this;
	},
	
	/*utility*/
	
	move: function(x, y){
		return this.push('m', x, y);
	},
	
	line: function(x, y){
		return this.push('l', x, y);
	},
	
	close: function(){
		return this.push('z');
	},
	
	bezier: function(c1x, c1y, c2x, c2y, ex, ey){
		return this.push('c', c1x, c1y, c2x, c2y, ex, ey);
	},
	
	arc: function(x, y, rx, ry, large){
		return this.push('a', Math.abs(rx || x), Math.abs(ry || rx || y), 0, large ? 1 : 0, 1, x, y);
	},
	
	counterArc: function(x, y, rx, ry, large){
		return this.push('a', Math.abs(rx || x), Math.abs(ry || rx || y), 0, large ? 1 : 0, 0, x, y);
	},
	
	/* transformation, measurement */
	
	toSVG: function(){
		var path = '';
		for (var i = 0, l = this.path.length; i < l; i++) path += this.path[i].join(' ');
		return path;
	},
	
	toVML: function(precision){;
		var data = measureAndTransform(this.path, precision);
		this.boundingBox = data[1];
		return data[0];
	},
	
	measure: function(){
		if (this.boundingBox) return this.boundingBox;
		if (this.path.length) return this.boundingBox = measureAndTransform(this.path)[1];
		else return {left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0};
	}
	
});

ART.Path.prototype.toString = ART.Path.prototype.toSVG;

})();
