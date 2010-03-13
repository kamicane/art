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
	
/* # kappa */

Math.kappa = (4 * (Math.sqrt(2) - 1) / 3);

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

var measureAndTransform = function(parts, precision){
	
	var boundsX = [], boundsY = [];
	
	var ux = function(x){
		boundsX.push(x);
		return (precision) ? Math.round(x * precision) : x;
	}, uy = function(y){
		boundsY.push(y);
		return (precision) ? Math.round(y * precision) : y;
	};

	var reflect = function(sx, sy, ex, ey){
		return [ex * 2 - sx, ey * 2 - sy];
	};
	
	var X = 0, Y = 0, px = 0, py = 0, r;
	
	var path = '';
	
	for (i = 0; i < parts.length; i++){
		var v = parts[i];
		
		switch (v.shift()){
			
			case 'm':
				path += 'm' + ux(X += v[0]) + ',' + uy(Y += v[1]);
			break;
			case 'M':
				path += 'm' + ux(X = v[0]) + ',' + uy(Y = v[1]);
			break;
			
			case 'l':
				path += 'l' + ux(X += v[0]) + ',' + uy(Y += v[1]);
			break;
			case 'L':
				path += 'l' + ux(X = v[0]) + ',' + uy(Y = v[1]);
			break;
			
			case 'c':
				px = X + v[2]; py = Y + v[3];
				path += 'c' + ux(X + v[0]) + ',' + uy(Y + v[1]) + ',' + ux(px) + ',' + uy(py) + ',' + ux(X += v[4]) + ',' + uy(Y += v[5]);
			break;
			case 'C':
				px = v[2]; py = v[3];
				path += 'c' + ux(v[0]) + ',' + uy(v[1]) + ',' + ux(px) + ',' + uy(py) + ',' + ux(X = v[4]) + ',' + uy(Y = v[5]);
			break;
			
			case 's':
				r = reflect(px, py, X, Y);
				px = X + v[0]; py = Y + v[1];
				path += 'c' + ux(r[0]) + ',' + uy(r[1]) + ',' + ux(px) + ',' + uy(py) + ',' + ux(X += v[2]) + ',' + uy(Y += v[3]);
			break;
			case 'S':
				r = reflect(px, py, X, Y);
				px = v[0]; py = v[1];
				path += 'c' + ux(r[0]) + ',' + uy(r[1]) + ',' + ux(px) + ',' + uy(py) + ',' + ux(X = v[2]) + ',' + uy(Y = v[3]);
			break;
			
			case 'q':
				px = X + v[0]; py = Y + v[1];
				path += 'c' + ux(X + v[0]) + ',' + uy(Y + v[1]) + ',' + ux(px) + ',' + uy(py) + ',' + ux(X += v[2]) + ',' + uy(Y += v[3]);
			break;
			case 'Q':
				px = v[0]; py = v[1];
				path += 'c' + ux(v[0]) + ',' + uy(v[1]) + ',' + ux(px) + ',' + uy(py) + ',' + ux(X = v[2]) + ',' + uy(Y = v[3]);
			break;
			
			case 't':
				r = reflect(px, py, X, Y);
				px = X + r[0]; py = Y + r[1];
				path += 'c' + ux(px) + ',' + uy(py) + ',' + ux(px) + ',' + uy(py) + ',' + ux(X += v[0]) + ',' + uy(Y += v[1]);
			break;
			case 'T':
				r = reflect(px, py, X, Y);
				px = r[0]; py = r[1];
				path += 'c' + ux(px) + ',' + uy(py) + ',' + ux(px) + ',' + uy(py) + ',' + ux(X = v[0]) + ',' + uy(Y = v[1]);
			break;
			
			case 'h':
				path += 'l' + ux(X += v[0]) + ',' + uy(Y);
			break;
			case 'H':
				path += 'l' + ux(X = v[0]) + ',' + uy(Y);
			break;
			
			case 'v':
				path += 'l' + ux(X) + ',' + uy(Y += v[0]);
			break;
			case 'V':
				path += 'l' + ux(X) + ',' + uy(Y = v[0]);
			break;
			
			case 'z':
				path += 'x';
			break;
			case 'Z':
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
		else if (path.path) this.path = path.path; //already a path
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
	
	arcLeft: function(x, y){
		return this.bezier(0, y * Math.kappa, x - (x * Math.kappa), y, x, y);
	},
	
	arcRight: function(x, y){
		return this.bezier(x * Math.kappa, 0, x, y - (y * Math.kappa), x, y);
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
