/*
---

name: ART.VML

description: VML implementation for ART

authors: [Simo Kinnunen](http://twitter.com/sorccu), [Valerio Proietti](http://mad4milk.net)

provides: [ART.VML, ART.Group, ART.Shape]

requires: [ART, ART.Element, ART.Container]

...
*/

(function(){

try {
	
	var namespaces = document.namespaces;
	
	namespaces.add('av', 'urn:schemas-microsoft-com:vml');
	namespaces.add('ao', 'urn:schemas-microsoft-com:office:office');

	var sheet = document.createStyleSheet();
	sheet.addRule('vml', 'display:inline-block;position:relative;overflow:hidden;');

	sheet.addRule('av\\:*', 'behavior:url(#default#VML);display:inline-block;position:absolute;width:100%;height:100%;left:0px;top:0px;');
	sheet.addRule('ao\\:*', 'behavior:url(#default#VML);');
	
} catch(e){

	return;

}

var precision = 100, UID = 0;

// VML Base Class

ART.VML = new Class({

	Extends: ART.Element,
	Implements: ART.Container,
	
	initialize: function(width, height){
		this.element = document.createElement('vml');
		this.children = [];
		this.resize(width, height);
	},
	
	resize: function(width, height){
		this.width = width;
		this.height = height;
		var style = this.element.style;
		style.pixelWidth = width;
		style.pixelHeight = height;

		this.children.each(function(child){
			child._transform();
		});
		
		return this;
	}
	
});

// VML Element Class

ART.VML.Element = new Class({
	
	Extends: ART.Element,
	
	initialize: function(tag){
		this.uid = (UID++).toString(16);
		var element = this.element = document.createElement('av:' + tag);
		element.setAttribute('id', 'e' + this.uid);
		
		this.transform = {translate: [0, 0], scale: [1, 1], rotate: [0, 0, 0]};
	},
	
	/* dom */
	
	inject: function(container){
		this.eject();
		this.container = container;
		container.children.include(this);
		this._transform();
		this.parent(container);
		
		return this;
	},

	eject: function(){
		if (this.container){
			this.container.children.erase(this);
			this.container = null;
			this.parent();
		}
		return this;
	},
	
	translate: function(x, y){
		this.transform.translate = [x, y];
		this._transform();
		return this;
	},
	
	scale: function(x, y){
		this.transform.scale = [x, y];
		this._transform();
		return this;
	}
	
});

// VML Group Class

ART.VML.Group = new Class({
	
	Extends: ART.VML.Element,
	Implements: ART.Container,
	
	initialize: function(){
		this.parent('group');
		this.children = [];
	},
	
	getBBox: function(){
		var widths = [], heights = [];
		this.children.each(function(child, i){
			widths[i] = child.x + child.width + child.transform.translate[0];
			heights[i] = child.y + child.height + child.transform.translate[1];
		}, this);
		return {x: 0, y: 0, width: Math.max.apply(Math, widths), height:  Math.max.apply(Math, heights)};
	},
	
	/* dom */
	
	inject: function(container){
		this.parent(container);
		this.width = container.width;
		this.height = container.height;
	},
	
	eject: function(){
		this.parent();
		this.width = this.height = null;
	},
	
	_transform: function(){
		var container = this.container;
		if (!container) return;
		var cw = container.width, ch = container.height, w = this.width, h = this.height, x = this.x, y = this.y;
		if (cw == null || ch == null || w == null || h == null) return;
		
		this.element.coordorigin = (precision) + ',' + (precision);
		this.element.coordsize = (cw * precision) + ',' + (ch * precision);
		
		this.children.each(function(child){
			child._transform();
		});
	}
	
});

// VML Shape Class

ART.VML.Shape = new Class({

	Extends: ART.VML.Element,
	
	initialize: function(path){
		this.parent('shape');
		var shape = this.shape = this.element;
		var element = this.element = document.createElement('av:group');
		element.appendChild(shape);

		var fill = this.fillElement = document.createElement('av:fill');
		fill.on = false;
		shape.appendChild(fill);
		
		var stroke = this.strokeElement = document.createElement('av:stroke');
		stroke.on = false;
		shape.appendChild(stroke);
		
		if (path != null) this.draw(path);
	},
	
	getBBox: function(){
		return {x: this.x || 0, y: this.y || 0, width: this.width || 0, height: this.height || 0};
	},
	
	// SVG parser
	
	// Possible SVG syntaxes that we want to support
	// M & L could be M L C Z m l c z
	// separators can always be spaces, one comma, or any combination of spaces and one comma
	// numbers can also be separated by a minus or plus sign. "100+100" means [100, 100], "100-100" means [100, -100]
	
	// Inputs Examples
	
	// 'M 100.5,-100.5 L 100,100'  //space separator for methods, comma separators for vectors
	// 'M100.5,-100.5L100,100' //no separator for methods, comma separators for vectors
	// 'M100.5-100.5L100,100' //comma separator for vectors when needed (Adobe Illustrator)
	// 'M100.5-100.5L100 100' //space separator for vectors when needed
	// 'M 100.5 -100.5 L 100 -100' //space separator (ART.Path)
	// 'M 100.5, -100.5 L 100, 100' //space separator for methods, comma + space separators for vectors
	// 'M 100.5-100.5 L 100.5,100.5' //space separator for methods, comma separators for vectors when needed
	// 'M 100.5,-100.5 L 100,100' //space separator for methods, comma separators for vectors
	
	// Outoput
	
	// any output would do, as long as it provides separated parts. These are a couple of examples:
	
	// [['M', 100.5, -100.5], ['L', 100, -100]]
	
	// [{method: 'M': vectors: [100.5, -100.5]}, {method: 'L', vectors: [100, -100]}]
	
	draw: function(path){
		this.boundsX = []; this.boundsY = [];
		
		path = path.toString().replace(/\s*([A-Za-z,-])\s*/ig, function(f, m, i){
			switch (m){
				case '-': return ' ' + m;
				case ',': return ' ';
				default: return ' ' + m + ' ';
			}
		});

		var parts = [], index = -1, i, bits = path.split(/\s+/), p = precision, p2 = p / 2;
		
		for (i = 0; i < bits.length; i++){
			var bit = bits[i], e;
			if (bit.match(/[A-Za-z]/i)) parts[++index] = [bit];
			else parts[index].push(Number(bit));
		}
		
		path = '';
		
		var reflect = function(sx, sy, ex, ey){
			return [ex * 2 - sx, ey * 2 - sy];
		};
		
		var X = 0, Y = 0, px = 0, py = 0, r;
		
		for (i = 0; i < parts.length; i++){
			var v = parts[i];
			
			switch (v.shift()){
				
				case 'm':
					path += 'm' + this._ux(X += v[0]) + ',' + this._uy(Y += v[1]);
				break;
				case 'M':
					path += 'm' + this._ux(X = v[0]) + ',' + this._uy(Y = v[1]);
				break;
				
				case 'l':
					path += 'l' + this._ux(X += v[0]) + ',' + this._uy(Y += v[1]);
				break;
				case 'L':
					path += 'l' + this._ux(X = v[0]) + ',' + this._uy(Y = v[1]);
				break;
				
				case 'c':
					px = X + v[2]; py = Y + v[3];
					path += 'c' + this._ux(X + v[0]) + ',' + this._uy(Y + v[1]) + ',' + this._ux(px) + ',' + 
					this._uy(py) + ',' + this._ux(X += v[4]) + ',' + this._uy(Y += v[5]);
				break;
				case 'C':
					px = v[2]; py = v[3];
					path += 'c' + this._ux(v[0]) + ',' + this._uy(v[1]) + ',' + this._ux(px) + ',' +
					this._uy(py) + ',' + this._ux(X = v[4]) + ',' + this._uy(Y = v[5]);
				break;
				
				case 's':
					r = reflect(px, py, X, Y);
					px = X + v[0]; py = Y + v[1];
					path += 'c' + this._ux(r[0]) + ',' + this._uy(r[1]) + ',' + this._ux(px) + ',' + 
					this._uy(py) + ',' + this._ux(X += v[2]) + ',' + this._uy(Y += v[3]);
				break;
				case 'S':
					r = reflect(px, py, X, Y);
					px = v[0]; py = v[1];
					path += 'c' + this._ux(r[0]) + ',' + this._uy(r[1]) + ',' + this._ux(px) + ',' + 
					this._uy(py) + ',' + this._ux(X = v[2]) + ',' + this._uy(Y = v[3]);
				break;
				
				case 'q':
					px = X + v[0]; py = Y + v[1];
					path += 'c' + this._ux(X + v[0]) + ',' + this._uy(Y + v[1]) + ',' + this._ux(px) + ',' + 
					this._uy(py) + ',' + this._ux(X += v[2]) + ',' + this._uy(Y += v[3]);
				break;
				case 'Q':
					px = v[0]; py = v[1];
					path += 'c' + this._ux(v[0]) + ',' + this._uy(v[1]) + ',' + this._ux(px) + ',' +
					this._uy(py) + ',' + this._ux(X = v[2]) + ',' + this._uy(Y = v[3]);
				break;
				
				case 't':
					r = reflect(px, py, X, Y);
					px = X + r[0]; py = Y + r[1];
					path += 'c' + this._ux(px) + ',' + this._uy(py) + ',' + this._ux(px) + ',' + 
					this._uy(py) + ',' + this._ux(X += v[0]) + ',' + this._uy(Y += v[1]);
				break;
				case 'T':
					r = reflect(px, py, X, Y);
					px = r[0]; py = r[1];
					path += 'c' + this._ux(px) + ',' + this._uy(py) + ',' + this._ux(px) + ',' + 
					this._uy(py) + ',' + this._ux(X = v[0]) + ',' + this._uy(Y = v[1]);
				break;
				
				case 'h':
					path += 'l' + this._ux(X += v[0]) + ',' + this._uy(Y);
				break;
				case 'H':
					path += 'l' + this._ux(X = v[0]) + ',' + this._uy(Y);
				break;
				
				case 'v':
					path += 'l' + this._ux(X) + ',' + this._uy(Y += v[0]);
				break;
				case 'V':
					
					path += 'l' + this._ux(X) + ',' + this._uy(Y = v[0]);
				break;
				
				case 'z':
					path += 'x';
				break;
				case 'Z':
					path += 'x';
				break;
				
			}
		}
		
		this.width = Math.max.apply(Math, this.boundsX);
		this.height = Math.max.apply(Math, this.boundsY);
		this.x = Math.min.apply(Math, this.boundsX);
		this.y = Math.min.apply(Math, this.boundsY);
		
		this._transform();

		this.shape.path = path + 'e';
		return this;
	},
	
	_ux: function(x){
		this.boundsX.push(x);
		return Math.round(x * precision);
	},
	
	_uy: function(y){
		this.boundsY.push(y);
		return Math.round(y * precision);
	},
	
	/* transform */
	
	_transform: function(){
		var container = this.container;
		if (!container) return;
		var cw = container.width, ch = container.height, w = this.width, h = this.height, x = this.x, y = this.y;
		if (cw == null || ch == null || w == null || h == null) return;
	
		var p = precision, hp = p / 2;
		var ct = this.container.transform, cts = (ct) ? ct.scale : [1, 1], ctt = (ct) ? ct.translate : [0, 0];
		var ttt = this.transform.translate, tts = this.transform.scale;
		
		// translate + halfpixel
		this.element.coordorigin = (-((ctt[0] + (cts[0] * ttt[0])) * p) + hp) + ',' + (-((ctt[1] + (cts[1] * ttt[1])) * p) + hp);
		this.shape.coordorigin = '0,0';
		
		// scale
		this.element.coordsize = (cw * p) + ',' + (ch * p);
		this.shape.coordsize = ((cw * p) / (cts[0] * tts[0])) + ',' + ((ch * p) / (cts[1] * tts[1]));
	},
	
	/* styles */
	
	fill: function(flag){
		var fill = this.fillElement;

		if (flag == null){
			fill.on = false;
		} else {
			var color1 = Color.detach(arguments[0]);
			fill.color = color1[0];
			fill.opacity = color1[1];
			
			if (arguments.length > 1){
				fill.method = 'none';
				fill.type = 'gradient';
				var color2 = Color.detach(arguments[arguments.length - 1]);
				fill.angle = 180; //TODO angle
				fill.color2 = color2[0];
				fill['ao:opacity2'] = color2[1];
			} else {
				fill.color2 = null;
				fill['ao:opacity2'] = null;
			}
			
			fill.on = true;
		}

		return this;
	},
	
	stroke: function(flag){
		var stroke = this.strokeElement;

		if (flag == null){
			stroke.on = false;
		} else {
			var color = Color.detach(arguments[0]);
			stroke.color = color[0];
			stroke.opacity = color[1];
			stroke.on = true;
		}
		return this;
	}

});

// Assign to ART

ART.Shape = new Class({Extends: ART.VML.Shape});
ART.Group = new Class({Extends: ART.VML.Group});
ART.implement({Extends: ART.VML});
	
})();
